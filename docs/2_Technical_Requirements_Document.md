# 2. Technical Requirements Document (TRD) - SentinelX AI

## 2.1 Decoupled System Architecture
The system utilizes a lightweight local application runtime backed by cloud-hosted analytical layers. Communication is handled over secure asynchronous protocols.
## SentinelX AI — Autonomous Cyber Resilience Platform

---

## 1. Purpose
Defines *how* the product will be built: stack, architecture, functional and non-functional requirements, integration points, and testing/performance targets. Written so an AI coding agent can scaffold the correct stack on the first attempt.

---

## 2. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + TypeScript + Tailwind CSS + Radix UI | SPA, dark-mode SOC theme, OKLCh color tokens |
| Charts/Graph UI | Recharts (metrics), D3.js (network topology graph) | |
| Backend API | FastAPI (Python, async) | REST + WebSocket gateway |
| Relational/Time-series DB | PostgreSQL + TimescaleDB extension | Hypertables for logs |
| Graph DB | Neo4j (5.x, Community + APOC/GDS plugins) | Digital twin / topology / attack-path modeling |
| Message broker / cache | Redis | Queues, WebSocket fan-out, background task coordination |
| Vector store | Milvus | Embeddings for RAG (MITRE mapping, Copilot) |
| AI orchestration | LangGraph | Stateful multi-agent workflow engine |
| ML | scikit-learn (Isolation Forest) | Unsupervised anomaly detection |
| Containerization | Docker + Docker Compose | Local/dev deployment; **Assumption:** Kubernetes recommended for production scale-out, not required for MVP |
| Auth | FIDO2/WebAuthn or OpenID Connect | MFA-enforced |

**Assumption:** "CogniWall" referenced in the source material as policy-enforcement middleware for agent tool execution is built in-house as a lightweight policy engine (JSON/YAML rule files validated against every agent tool call before execution), not procured externally, unless the team identifies and adopts a specific vendor product later.

---

## 3. System Architecture Overview

```
┌───────────────────────┐        ┌───────────────────────┐
| Telemetry Forwarder    | ───>   | REST API / WebSockets  |
| (Agents & Sensors)     |        | (FastAPI Microservice) |
└───────────────────────┘        └───────────┬───────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
        ┌──────────────────────┐                         ┌──────────────────────────┐
        | PostgreSQL /          |  ───── Synchronize ──> | LangGraph AI Engine        |
        | TimescaleDB           |                         | + Neo4j Knowledge Graph    |
        | Hypertables           |                         | + Milvus Vector Store      |
        └──────────────────────┘                         └──────────────────────────┘
                    │                                                   │
                    └──────────────── Redis (queue / pub-sub) ──────────┘
```

**Data plane split:**
- **Time-series writes** (raw network/security logs) → PostgreSQL/TimescaleDB
- **Structural/relationship data** (assets, identities, policies, software dependencies, attack paths) → Neo4j via Cypher
- **Real-time state fan-out to UI** → Redis pub/sub → WebSocket broadcast

---

## 4. Functional Requirements (FRS)

| ID | Requirement |
|---|---|
| FRS-AUTH-001 | System must enforce cryptographic MFA via FIDO2/WebAuthn or OIDC federation. |
| FRS-DASH-002 | Primary dashboard must show real-time telemetry rates, system risk metrics, and an interactive D3.js network topology graph. |
| FRS-DETC-003 | Threat detection engine must analyze streaming security/network logs to flag anomalous behavior. |
| FRS-PRED-004 | Attack prediction module must analyze active intrusion TTPs against network topology to project lateral movement paths. |
| FRS-TWIN-005 | Platform must maintain a synchronized Neo4j knowledge graph of assets, identities, policies, and software components. |
| FRS-CHAT-006 | Conversational interface must let analysts query historical incidents, CVE data, and internal runbooks. |
| FRS-REPT-007 | Reporting module must generate forensic timelines and plain-language executive summaries. |
| FRS-VULN-008 | Vulnerability module must continuously fetch NVD CVE data, map to software inventory, and rank by reachability. |

---

## 5. Non-Functional Requirements (NFR)

| ID | Requirement |
|---|---|
| NFR-SEC-001 | All data-plane traffic uses TLS 1.3 + AES-GCM-256. Data at rest encrypted with XTS-AES-256. Keys/secrets live in a hardware/secrets-manager environment (e.g., HashiCorp Vault, AWS KMS/Secrets Manager) — **never hardcoded in source or compose files.** |
| NFR-PERF-002 | Ingestion pipeline normalizes and writes telemetry in < 50ms. WebSocket broadcasts state changes to clients in < 20ms. |
| NFR-RELI-003 | Platform maintains state through failures via write-ahead logs and active clustering. |
| NFR-SCAL-004 | Ingestion layer scales horizontally to ≥ 100,000 events/second. |
| NFR-AVAI-005 | Core services target multi-region active-active for 99.999% SLA — **Phase III/IV target; MVP targets single-region 99.9%.** |

---

## 6. Security Requirements (Critical — Corrections to Source Material)

The original roadmap's example code and `docker-compose.yml` contain **hardcoded credentials** (e.g., `SecurePassword123`, a wildcard CORS policy `allow_origins=["*"]`, and a plaintext `LLM_API_KEY` placeholder). These are **prototyping shortcuts and must not ship to any real environment.** Requirements for actual build:

1. All secrets (DB passwords, Neo4j auth, LLM API keys, JWT signing keys) must be injected via environment variables sourced from a secrets manager — never committed to source control or Docker Compose files in plaintext.
2. CORS must be restricted to explicit allowed origins in any non-local environment.
3. All autonomous containment actions must pass through the policy-enforcement layer (see §8, Guardrails) before execution — no direct agent-to-infrastructure write access.
4. The Copilot/RAG chat agent must be **read-only** — it cannot invoke containment tools. Only the isolated Autonomous Response Agent may execute containment, and only against declarative policy files, not conversational input.
5. Role-based access control (RBAC) enforced at the API layer for every route based on `users.role` (Administrator, SOC Analyst, Security Engineer, CISO).

---

## 7. Integration Requirements

| Integration | Protocol | Purpose |
|---|---|---|
| NVD CVE API | REST (JSON) | Continuous vulnerability intelligence sync |
| MITRE ATT&CK dataset | Static/versioned dataset + vector embeddings | TTP taxonomy mapping |
| Frontend ↔ Backend | REST + WebSocket, JSON payloads, Pydantic-validated | Live dashboard + alert stream |
| Backend ↔ TimescaleDB | Async connection pool (`asyncpg`) | Time-series writes/reads |
| AI Engine ↔ Neo4j | Bolt protocol, Cypher queries | Digital twin read/write |
| AI Engine ↔ Milvus | Vector similarity API | RAG retrieval for MITRE mapping + Copilot |

---

## 8. AI Agent Guardrails (Required Design Constraint)

Every autonomous agent action must pass through a policy validation step before touching production systems:
1. **Confidence threshold gate** — only high-confidence detections (configurable threshold) trigger automated containment; ambiguous cases route to human analyst queue.
2. **Digital twin simulation first** — proposed containment actions are simulated against the Neo4j twin to check for unintended blast radius before being applied to real infrastructure.
3. **Declarative policy files** — the Response Agent only executes actions permitted by versioned policy config, not free-form LLM output.
4. **Read/write isolation** — conversational agents (Copilot, CEO Explainer) are strictly read-only against production systems.

---

## 9. Performance & Testing Targets

| Domain | Tooling | Target |
|---|---|---|
| Functional correctness | PyTest + mock DB | HTTP 200 on all valid routes |
| Anomaly detection precision | Evaluation against a labeled dataset (e.g., CICIDS2017) | F1-score > 0.92 |
| False positive rate | Long-running validation drills | < 1.5% |
| API load | Locust | Ingestion latency < 50ms under target throughput |
| Security | OWASP ZAP + manual review | Zero critical vulnerabilities before any production deploy |
| UI responsiveness | Cypress + latency checks | Screen updates < 20ms after WebSocket event |

---

## 10. Deployment Requirements
- Local/dev: Docker Compose (TimescaleDB, Neo4j, Redis, backend, frontend)
- Health checks required on every service before dependent services start
- **Assumption:** Production deployment target is a single cloud region on a managed Kubernetes service (e.g., GKE/EKS/AKS) with managed Postgres (TimescaleDB Cloud or self-managed) and managed Neo4j (AuraDB or self-hosted) — confirm actual cloud provider preference before Phase II infra work begins.

---

## 11. Assumptions Log
1. Milvus is assumed as the vector store per source material; a managed alternative (e.g., pgvector inside the existing Postgres instance) could reduce infra complexity for MVP — flagged as a build-time decision for the engineering team.
2. LLM provider for the LangGraph agents is not specified in source material — assumed to be pluggable via API key config (e.g., Anthropic/OpenAI compatible), decided at implementation time.
3. "100,000 events/second" and "99.999% SLA" are long-term scale targets, not MVP acceptance criteria.
