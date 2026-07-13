import time
import os
from fastapi import Request, HTTPException, status

# In-memory tracking dictionaries
auth_tracker = {}
public_tracker = {}
authed_tracker = {}

# ⚙️ CONFIGURABLE THRESHOLDS (Loaded from .env with safe defaults)
AUTH_BASE_DELAY = int(os.getenv("RATE_LIMIT_AUTH_BASE_DELAY", 1)) # Seconds
AUTH_MAX_DELAY = int(os.getenv("RATE_LIMIT_AUTH_MAX_DELAY", 3600)) # 1 hour max backoff
AUTH_RESET_WINDOW = int(os.getenv("RATE_LIMIT_AUTH_RESET", 900)) # Reset strikes after 15 mins

PUBLIC_LIMIT = int(os.getenv("RATE_LIMIT_PUBLIC_HITS", 60))
PUBLIC_WINDOW = int(os.getenv("RATE_LIMIT_PUBLIC_WINDOW", 60)) 

AUTHED_LIMIT = int(os.getenv("RATE_LIMIT_AUTHED_HITS", 300))
AUTHED_WINDOW = int(os.getenv("RATE_LIMIT_AUTHED_WINDOW", 60)) 

def check_auth_rate_limit(request: Request, account: str = None):
    """
    Stricter limits with exponential backoff for Auth routes.
    Tracks both IP and the specific account being accessed to prevent distributed brute-forcing.
    """
    client_ip = request.client.host
    now = time.time()
    
    keys_to_check = [f"ip:{client_ip}"]
    if account:
        keys_to_check.append(f"account:{account}")
        
    for key in keys_to_check:
        record = auth_tracker.get(key, {"hits": 0, "last_attempt": 0})
        
        # Reset the strike counter if they wait out the reset window
        if now - record["last_attempt"] > AUTH_RESET_WINDOW:
            record["hits"] = 0
            
        record["hits"] += 1
        
        # Exponential Backoff Calculation
        if record["hits"] > 1:
            # Progression: 1s -> 2s -> 4s -> 8s -> 16s... up to max delay
            delay = min(AUTH_BASE_DELAY * (2 ** (record["hits"] - 2)), AUTH_MAX_DELAY)
            time_passed = now - record["last_attempt"]
            
            if time_passed < delay:
                wait_time = delay - time_passed
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Security lockout active. Too many attempts. Try again in {int(wait_time)} seconds.",
                    headers={"Retry-After": str(int(wait_time))}
                )
        
        record["last_attempt"] = now
        auth_tracker[key] = record

def clear_auth_strikes(request: Request, account: str = None):
    """Clears strikes after a successful login so legitimate users aren't punished."""
    client_ip = request.client.host
    if f"ip:{client_ip}" in auth_tracker:
        auth_tracker[f"ip:{client_ip}"]["hits"] = 0
    if account and f"account:{account}" in auth_tracker:
        auth_tracker[f"account:{account}"]["hits"] = 0

async def rate_limit_public(request: Request):
    """Moderate limits for public endpoints."""
    client_ip = request.client.host
    now = time.time()
    record = public_tracker.get(client_ip, {"hits": 0, "window_start": now})
    
    if now - record["window_start"] > PUBLIC_WINDOW:
        record = {"hits": 1, "window_start": now}
    else:
        record["hits"] += 1
        if record["hits"] > PUBLIC_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Public API rate limit exceeded."
            )
            
    public_tracker[client_ip] = record

async def rate_limit_authed(request: Request):
    """Looser limits for authenticated actions."""
    client_ip = request.client.host
    now = time.time()
    record = authed_tracker.get(client_ip, {"hits": 0, "window_start": now})
    
    if now - record["window_start"] > AUTHED_WINDOW:
        record = {"hits": 1, "window_start": now}
    else:
        record["hits"] += 1
        if record["hits"] > AUTHED_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Authenticated API rate limit exceeded."
            )
            
    authed_tracker[client_ip] = record