import logging
from fastapi import APIRouter, Depends, Request, Path, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Literal
from app.ml.model import detector as ai_detector
from app.database import get_db_pool
from app.rate_limiter import rate_limit_authed
import asyncpg

router = APIRouter()

class NetworkLogPayload(BaseModel):
    features: List[float] = Field(..., min_length=4, max_length=78)
    raw_log: str = Field(..., min_length=1, max_length=1000)

class AlertActionPayload(BaseModel):
    status: Literal['new', 'blocked', 'dismissed'] = Field(...)

# 🧠 DYNAMIC MITRE ATT&CK ATTRIBUTION ENGINE
def get_mitre_attribution(log_text: str):
    log_lower = log_text.lower()
    
    # 1. Credential Access / Brute Force
    if any(word in log_lower for word in ["password", "login", "brute", "failed attempt"]):
        return {"tactic": "Credential Access", "technique": "T1110: Brute Force"}
    
    # 2. Exfiltration / Data Theft
    elif any(word in log_lower for word in ["download", "export", "scp", "wget", "curl", "ftp"]):
        return {"tactic": "Exfiltration", "technique": "T1048: Exfiltration Over Alternative Protocol"}
    
    # 3. Initial Access / Exploitation
    elif any(word in log_lower for word in ["sql", "injection", "select", "union", "script"]):
        return {"tactic": "Initial Access", "technique": "T1190: Exploit Public-Facing Application"}
    
    # 4. Command & Control
    elif any(word in log_lower for word in ["beacon", "dns", "tunnel", "c2"]):
        return {"tactic": "Command and Control", "technique": "T1071: Application Layer Protocol"}
    
    # 5. Default Fallback (Lateral Movement)
    else:
        return {"tactic": "Lateral Movement", "technique": "T1210: Exploitation of Remote Services"}

@router.post("/analyze", dependencies=[Depends(rate_limit_authed)])
async def analyze_network_log(request: Request, payload: NetworkLogPayload, pool: asyncpg.Pool = Depends(get_db_pool)):
    result = ai_detector.predict(payload.features, payload.raw_log)
    
    if result.get("status") == "anomaly":
        # Process dynamic attribution
        attribution = get_mitre_attribution(payload.raw_log)
        
        try:
            async with pool.acquire() as conn:
                # Dynamically update the database schema to store MITRE data
                await conn.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS anomaly_score FLOAT;")
                await conn.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS status VARCHAR(50);")
                await conn.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
                await conn.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS mitre_tactic VARCHAR(100);")
                await conn.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS mitre_technique VARCHAR(150);")
                
                await conn.execute(
                    """
                    INSERT INTO alerts (anomaly_score, status, mitre_tactic, mitre_technique) 
                    VALUES ($1, $2, $3, $4)
                    """,
                    float(result.get("confidence", 0.95)), 
                    'new',
                    attribution["tactic"],
                    attribution["technique"]
                )
        except Exception as e:
            logging.error(f"Database Insert Error: {e}")
            raise HTTPException(status_code=500, detail="Failed to record threat telemetry.")
            
        # Attach attribution to the immediate API response
        result["mitre_tactic"] = attribution["tactic"]
        result["mitre_technique"] = attribution["technique"]
        
    return result

@router.get("/alerts", dependencies=[Depends(rate_limit_authed)])
async def get_active_alerts(request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    try:
        async with pool.acquire() as conn:
            # Ensure columns exist before querying to prevent crashes on fresh databases
            await conn.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS mitre_tactic VARCHAR(100) DEFAULT 'Lateral Movement';")
            await conn.execute("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS mitre_technique VARCHAR(150) DEFAULT 'T1210: Exploitation of Remote Services';")
            
            records = await conn.fetch("SELECT id, anomaly_score, status, created_at, mitre_tactic, mitre_technique FROM alerts ORDER BY created_at DESC LIMIT 5")
            
            alerts = []
            for record in records:
                alert_dict = dict(record)
                if alert_dict.get('created_at'):
                    dt = alert_dict['created_at']
                    # Timezone fix for frontend
                    if dt.tzinfo is None:
                        alert_dict['created_at'] = dt.isoformat() + "Z"
                    else:
                        alert_dict['created_at'] = dt.isoformat()
                alerts.append(alert_dict)
            return {"alerts": alerts}
    except Exception as e:
        logging.error(f"Fetch alerts error: {e}")
        return {"alerts": []}

@router.put("/alerts/{alert_id}", dependencies=[Depends(rate_limit_authed)])
async def update_alert_status(
    request: Request, 
    # 🚨 FIX: Removed '= Depends()' so FastAPI properly reads the JSON body from React
    action: AlertActionPayload,
    alert_id: str = Path(..., min_length=1, max_length=36, pattern=r"^[a-zA-Z0-9\-]+$"),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    try:
        async with pool.acquire() as conn:
            db_id = int(alert_id) if alert_id.isdigit() else alert_id
            await conn.execute("UPDATE alerts SET status = $1 WHERE id = $2", action.status, db_id)
        return {"success": True, "status": action.status}
    except Exception as e:
        logging.error(f"Update alert error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update threat status.")