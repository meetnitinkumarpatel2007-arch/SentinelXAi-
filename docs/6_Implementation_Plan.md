# 6. Implementation Plan - SentinelX AI (Cloud Infrastructure Shift)

## 6.1 Step-by-Step Milestones

### Step 1: Resource-Optimized Development Setup & Cloud Provisioning
* **Task 1.1:** Sign up for **Neon.tech** or **Supabase** free tiers. Spin up a managed PostgreSQL database instance. Record the connection URI string.
* **Task 1.2:** Sign up for a free **Neo4j AuraDB** cloud database instance. Download the credentials text file, including the direct Bolt endpoint string.
* **Task 1.3:** Sign up for an **Upstash** account. Deploy a serverless Redis database instance to act as the asynchronous task queue broker.
* **Task 1.4:** Initialize the project directory locally, skipping heavy database engine installations to minimize local RAM usage.

### Step 2: Local Application Environment Setup
* **Task 2.1:** Construct the master environment variable file (`.env`) inside the root folder mapping remote database connections:
```env
DATABASE_URL=postgresql://[user]:[password]@[neon-domain]/sentinelx_db?sslmode=require
NEO4J_URI=bolt+routing://[aura-subdomain].do.neo4j.io:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=[your-auradb-secure-password]
REDIS_URL=redis://:[upstash-token]@[upstash-endpoint]:6379
LLM_API_KEY=[ai-orchestrator-key]
## SentinelX AI — Autonomous Cyber Resilience Platform

---

## 1. Purpose
A build-order roadmap for taking this from zero to a working MVP using AI coding tools (Cursor, Claude Code, Bolt, Replit, etc.). Organized as sequential, checkable steps — each step should be a working, testable increment, not a big-bang build.

---

## 2. High-Level Phased Roadmap (from Product Roadmap)

| Phase | Timeline (Reference) | Focus | Key Deliverables |
|---|---|---|---|
| Phase I: Core MVP | Q1–Q2 | High-throughput logging + core detection | TimescaleDB ingestion, unsupervised anomaly engine, basic containment |
| Phase II: Digital Twin | Q3–Q4 | Topological modeling + predictive analytics | Neo4j graph, attack path generation, reachability analysis |
| Phase III: Swarm Scale | Following Q1–Q2 | Multi-agent reasoning + secure ops | Full LangGraph multi-agent deployment, policy guardrail middleware, custom agent tools |
| Phase IV: Federation | Following Q3–Q4 | Cross-agency intelligence | Federated querying, anonymized sharing, secure integrations |

**Assumption:** Exact calendar quarters from the source roadmap are treated as relative sequencing only (Phase I → II → III → IV), not committed dates — actual dates depend on team size and start date, which were not specified.

---

## 3. MVP Build Order (Step-by-Step for AI Coding Agent)

This section is the primary "recipe" — follow in order. Each step should result in something runnable/testable before moving to the next.

### Step 1 — Repository & Environment Scaffolding
- Initialize monorepo: `/backend`, `/frontend`, `/docker-compose.yml`.
- Create `.env.example` files for both backend and frontend — **never commit real secrets**.
- Set up `docker-compose.yml` with TimescaleDB, Neo4j, Redis, backend, frontend services + health checks (per Backend Schema Document / TRD).
- **Deliverable:** `docker-compose up` brings up all infra services healthy, no app logic yet.

### Step 2 — Database Schema & Migrations
- Implement PostgreSQL/TimescaleDB schema exactly as defined in the Backend Schema Document.
- Set up a migration tool (e.g., Alembic) rather than running raw DDL scripts by hand.
- Configure hypertables + compression policies.
- Set up Neo4j constraints/indexes for the node labels defined in the Backend Schema Document.
- **Deliverable:** Fresh environment can run migrations end-to-end and produce the full schema.

### Step 3 — Backend Core: Auth + User/Device Registry
- Implement FastAPI app skeleton with CORS restricted to known origins (not wildcard).
- Implement MFA-based auth (FIDO2/WebAuthn or OIDC) and RBAC middleware keyed off `users.role`.
- Implement device/asset registry CRUD.
- **Deliverable:** Can create a user, log in with MFA, and manage device records via authenticated API calls.

### Step 4 — Ingestion Pipeline
- Implement `/api/v1/ingest/network` and `/api/v1/ingest/security` endpoints, writing to the hypertables.
- Add basic synthetic log generator/script for local testing (mimics telemetry forwarders).
- Validate ingestion latency against the < 50ms NFR target using Locust.
- **Deliverable:** Can push synthetic logs and see them land in TimescaleDB with acceptable latency.

### Step 5 — Anomaly Detection Engine
- Implement the Isolation Forest-based `AIIntelligenceEngine` (anomaly scoring) as an internal Python module.
- Wire it into the ingestion pipeline: every incoming log batch gets scored; scores above threshold create rows in `alerts`.
- **Deliverable:** Feeding synthetic anomalous traffic produces alerts in the `alerts` table.

### Step 6 — Real-Time WebSocket Layer
- Implement `/ws/v1/alerts` WebSocket endpoint with Redis pub/sub fan-out.
- Confirm new alerts broadcast to connected clients within the < 20ms NFR target.
- **Deliverable:** A simple test client sees alerts appear live as they're generated.

### Step 7 — Frontend Dashboard Shell
- Scaffold React 19 + TypeScript + Tailwind + Radix UI app.
- Build the persistent sidebar navigation and the Primary Dashboard screen (per App Flow Document / UI/UX Brief), including the live ingestion rate widget and real-time alert feed wired to the WebSocket.
- **Deliverable:** Logging in shows a live dashboard reflecting real backend data.

### Step 8 — Threat Center + Incident Investigation Screens
- Build alert queue + raw payload split-screen view.
- Build the Incident Investigation Workspace with the manual-approve containment flow (confirmation modal before any containment action executes).
- Implement `response_policies` table logic: check policy + confidence threshold before allowing/proposing containment.
- **Deliverable:** Analyst can view an alert, open the related incident, and approve a (simulated) containment action.

### Step 9 — RAG Copilot (Read-Only)
- Stand up Milvus (or pgvector, per TRD assumption) and populate it with runbook/CVE reference embeddings.
- Implement `/api/v1/copilot/query` and the chat UI.
- Enforce read-only behavior at the API layer (no tool-calling access to containment endpoints).
- **Deliverable:** Analyst can ask the Copilot questions and get grounded answers from internal data.

### Step 10 — MITRE Mapping & Basic Reporting
- Implement MITRE TTP semantic mapping (vector similarity against a MITRE ATT&CK embedding set).
- Build the Attack Timeline View, pulling the full chain (log → anomaly → MITRE tag → containment → resolution) for a given incident.
- Implement basic forensic export (PDF/JSON).
- **Deliverable:** A closed incident can be viewed as a full reconstructed timeline and exported.

### Step 11 — MVP Hardening Pass
- Run OWASP ZAP scan; fix critical/high findings before considering MVP "done."
- Confirm all secrets are environment-variable-driven, not hardcoded.
- Run PyTest suite + Cypress UI tests against the full flow.
- Load-test ingestion with Locust at target throughput.
- **Deliverable:** MVP passes the Testing Domain checklist from the TRD.

---

## 4. Phase II Build Order (Digital Twin) — After MVP Ships

1. Stand up Neo4j with the schema from the Backend Schema Document (§4).
2. Build a sync process: relational asset/device changes propagate into the graph (e.g., new device → new `:Asset` node).
3. Implement the NVD CVE sync job (scheduled background task) populating `vulnerabilities` and linking to `:SoftwareComponent` / `:Vulnerability` graph nodes.
4. Implement reachability/lateral movement Cypher queries (see Backend Schema Document §4.3) and wire into the Attack Prediction module.
5. Build the Cyber Digital Twin Canvas screen (D3.js full-viewport graph) per the UI/UX Design Brief.
6. Build the executive compliance scorecard (CISO/CEO reporting modes).

---

## 5. Phase III Build Order (Swarm Scale) — After Phase II

1. Introduce LangGraph orchestration, refactoring the anomaly/MITRE/response logic into discrete stateful agents (Monitor, Behavioral, MITRE Mapper, Attack Prediction, Autonomous Response, Vulnerability Intelligence, Digital Twin, Security Copilot, CEO Explainer, Continuous Learning — 10 agents per source roadmap).
2. Build the policy-guardrail middleware ("CogniWall" pattern) that intercepts every agent tool call and validates it against `response_policies` before execution.
3. Implement the Continuous Learning Agent: feed resolved-incident outcomes back into anomaly model thresholds.
4. Implement the CEO Incident Explainer agent (plain-language summary generation).
5. Switch containment mode from manual-approve default to configurable full-autonomous mode, gated by the Settings screen toggle.

---

## 6. Phase IV (Federation) — Deferred / Future
Not part of near-term implementation; revisit after Phase III is stable in production with real customer usage data. Includes: cross-agency federated querying, anonymized indicator sharing, mobile app, voice interface, multi-cloud posture agent, lightweight OT/IoT sensor agent.

---

## 7. Testing & QA Checklist (Applies Throughout)

| Domain | Tool | Gate |
|---|---|---|
| Functional | PyTest | All endpoints return correct status codes; role checks enforced |
| ML accuracy | Labeled dataset eval | F1 > 0.92 before enabling auto-detection in any non-dev environment |
| False positives | Long-running drill | < 1.5% before enabling auto-containment |
| Load | Locust | < 50ms ingestion latency at target throughput |
| Security | OWASP ZAP + manual review | Zero critical vulnerabilities before any deploy beyond local dev |
| UI | Cypress | < 20ms WebSocket-to-render latency |

---

## 8. Deployment Checklist (MVP)
1. All secrets moved out of `docker-compose.yml`/source into environment variables / secrets manager.
2. CORS restricted to known frontend origin(s).
3. TLS enabled on all external-facing endpoints.
4. Database backups configured (WAL-based) before any real data is ingested.
5. Health checks verified for every service in the dependency chain before marking deploy successful.
6. Containment mode explicitly confirmed as "manual-approve" for first production rollout (per PRD Assumption #2) unless customer has explicitly requested full-autonomous mode.

---

## 9. Assumptions Log
1. No team size, budget, or start date was provided — the build order above is sequenced by technical dependency, not calendar time; actual sprint/week estimates should be added once team capacity is known.
2. MVP is scoped to Phase I only; Phases II–IV are intentionally deferred to keep the initial build achievable.
3. Attack simulator (source roadmap Phase 16) is treated as an internal QA/demo tool, useful during Steps 4–10 above for generating realistic test data, not a customer-facing feature in MVP.
