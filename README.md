
# 🛡️ SentinelX AI | Autonomous Threat Mitigation System

Autonomous cyber resilience platform for Critical National Infrastructure (CNI). SentinelX ingests network and host telemetry, correlates threats via an AI agent swarm, models lateral attack paths in a graph-based digital twin, and supports policy-guarded containment workflows.

---

## 👥 Development Team
Built for hackathon innovation by:
*   **Nand Patel**
*   **Meet Patel**
*   **Ziya Shaikh**
*   **Prachi Shukla**

---

## 🛠️ Required Software

| Tool | Version |
|------|---------|
| [Python](https://www.python.org/downloads/) | 3.11+ |
| [Node.js](https://nodejs.org/) | 20+ (LTS recommended) |
| npm | 10+ (bundled with Node.js) |

**Cloud services** (configured via `.env`, not run locally):
- PostgreSQL — [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)
- Neo4j — [Neo4j AuraDB](https://neo4j.com/cloud/aura/)
- Redis — [Upstash](https://upstash.com/) serverless

---

## 📦 Installation & Setup

### 1. Clone the project
```powershell
git clone [https://github.com/meetnitinkumarpatel2007-arch/SentinelXAi.git](https://github.com/meetnitinkumarpatel2007-arch/SentinelXAi.git)
cd SentinelXAi

```
### 2. Configure environment variables
```powershell
copy .env.example .env

```
Edit .env and add your cloud database URLs, API keys, and runtime settings.
### 3. Dataset Provisioning (Required for ML Engine)
Because the AI training matrix (network_traffic.csv) exceeds GitHub's 100MB file limit, it is hosted externally on Google Drive.
 1. Download the dataset from this secure link: **network_traffic.csv (Google Drive)**
 2. Place the downloaded file into the following directory: backend/data/network_traffic.csv
### 4. Backend setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

```
### 5. Frontend setup
```powershell
cd ..\frontend
npm install

```
## 🚀 Running the Application (Live Threat Detection Demo)
To run the full autonomous mitigation loop and watch the AI catch zero-day attacks in real-time, open **three separate terminals** from the project root.
**Terminal 1 — Backend API Engine**
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8000

```
*API docs:* http://localhost:8000/docs
**Terminal 2 — Frontend SOC Dashboard**
```powershell
cd frontend
npm run dev

```
*App UI:* http://localhost:5173
**Terminal 3 — Active Network Simulator (The Attack Vector)**
*Wait for the backend and frontend to be fully running, then execute:*
```powershell
cd backend
cd app
python network_simulator.py

```
## 📊 Model Performance & Accuracy Testing
To verify the IsolationForest AI model's accuracy against the baseline 78-dimension network dataset:
```powershell
cd backend
python evaluate_benchmark.py

```
## ⚙️ Environment Variable Setup
All secrets live in the root .env file. The backend reads it from backend/app/config.py; Vite exposes only VITE_* variables to the frontend.
| Variable | Required | Description |
|---|---|---|
| DATABASE_URL | For DB features | PostgreSQL connection string (Neon/Supabase) |
| NEO4J_URI | For graph features | Neo4j AuraDB bolt URI |
| NEO4J_USER | For graph features | Neo4j username (default: neo4j) |
| NEO4J_PASSWORD | For graph features | Neo4j password |
| REDIS_URL | For cache/queue | Upstash Redis URL |
| LLM_API_KEY | For AI agents | LLM provider API key |
| API_HOST | No | Backend bind host (default: 0.0.0.0) |
| API_PORT | No | Backend port (default: 8000) |
| CORS_ORIGINS | No | Comma-separated allowed origins |
| VITE_API_BASE_URL | No | Frontend API base URL (default: http://localhost:8000) |
## 📂 Project Folder Structure
```text
SentinelXAi/
├── .env.example          # Environment variable template
├── .gitignore
├── README.md
├── docs/                 # Product & engineering blueprints
├── backend/
│   ├── app/
│   │   ├── api/v1/       # Versioned REST routes
│   │   ├── config.py     # Settings from .env
│   │   └── main.py       # FastAPI entry point
│   ├── data/             # Target directory for network_traffic.csv
│   └── requirements.txt  # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── components/ui/
    │   └── pages/        # Dashboard Views (SOC, CISO, CEO)
    └── vite.config.ts

```
## 💻 Tech Stack
 * **Frontend:** React 19, TypeScript, Tailwind CSS v4, Radix UI
 * **Backend:** Python 3.11+, FastAPI (async), Scikit-Learn (Isolation Forest)
 * **Databases:** PostgreSQL, Neo4j, Redis (cloud-hosted via .env)
```

```
