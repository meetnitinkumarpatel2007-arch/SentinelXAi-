# SentinelX AI

Autonomous cyber resilience platform for Critical National Infrastructure (CNI). SentinelX ingests network and host telemetry, correlates threats via an AI agent swarm, models lateral attack paths in a graph-based digital twin, and supports policy-guarded containment workflows.

This repository is a **Step 2 scaffold**: a FastAPI backend with a health endpoint and a React 19 frontend shell. Full capabilities are defined in the `/docs` design blueprints.

## Required Software

| Tool | Version |
|------|---------|
| [Python](https://www.python.org/downloads/) | 3.11+ |
| [Node.js](https://nodejs.org/) | 20+ (LTS recommended) |
| npm | 10+ (bundled with Node.js) |

**Cloud services** (configured via `.env`, not run locally):

- PostgreSQL — [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)
- Neo4j — [Neo4j AuraDB](https://neo4j.com/cloud/aura/)
- Redis — [Upstash](https://upstash.com/) serverless

## Installation

### 1. Clone or extract the project

```powershell
cd C:\path\to\SentinelXAi
```

### 2. Configure environment variables

```powershell
copy .env.example .env
```

Edit `.env` and add your cloud database URLs, API keys, and runtime settings.

### 3. Backend setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 4. Frontend setup

```powershell
cd ..\frontend
npm install
```

## Running the Application

Open **two terminals** from the project root.

**Terminal 1 — Backend API**

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Terminal 2 — Frontend dev server**

```powershell
cd frontend
npm run dev
```

App UI: [http://localhost:5173](http://localhost:5173)

### Other useful commands

| Command | Location | Purpose |
|---------|----------|---------|
| `npm run build` | `frontend/` | Production build → `frontend/dist/` |
| `npm run preview` | `frontend/` | Preview production build locally |

## Environment Variable Setup

All secrets live in the root `.env` file. The backend reads it from `backend/app/config.py`; Vite exposes only `VITE_*` variables to the frontend.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | For DB features | PostgreSQL connection string (Neon/Supabase) |
| `NEO4J_URI` | For graph features | Neo4j AuraDB bolt URI |
| `NEO4J_USER` | For graph features | Neo4j username (default: `neo4j`) |
| `NEO4J_PASSWORD` | For graph features | Neo4j password |
| `REDIS_URL` | For cache/queue | Upstash Redis URL |
| `LLM_API_KEY` | For AI agents | LLM provider API key |
| `API_HOST` | No | Backend bind host (default: `0.0.0.0`) |
| `API_PORT` | No | Backend port (default: `8000`) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `VITE_API_BASE_URL` | No | Frontend API base URL (default: `http://localhost:8000`) |

See `.env.example` for placeholder values.

## Project Folder Structure

```
SentinelXAi/
├── .cursorrules          # AI/editor project directives
├── .env.example          # Environment variable template (safe to share)
├── .gitignore
├── README.md
├── docs/                 # Product & engineering blueprints
│   ├── 1_Product_Requirements_Document.md
│   ├── 2_Technical_Requirements_Document.md
│   ├── 3_App_Flow_Document.md
│   ├── 4_UIUX_Design_Brief.md
│   ├── 5_Backend_Schema_Document.md
│   └── 6_Implementation_Plan.md
├── backend/
│   ├── app/
│   │   ├── api/v1/       # Versioned REST routes
│   │   ├── config.py     # Settings from .env
│   │   └── main.py       # FastAPI entry point
│   └── requirements.txt  # Python dependencies
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── src/
    │   ├── App.tsx
    │   ├── components/ui/
    │   └── lib/
    ├── tsconfig*.json
    └── vite.config.ts
```

## Documentation

Read `/docs` before modifying code. Each document includes cloud optimization overrides and defines the target architecture (LangGraph agents, Neo4j digital twin, PostgreSQL telemetry, Redis broker).

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4 (OKLCh tokens), Radix UI
- **Backend:** Python 3.11+, FastAPI (async), pydantic-settings
- **Databases:** PostgreSQL, Neo4j, Redis (all cloud-hosted via `.env`)
