# 1. Product Requirements Document (PRD) - SentinelX AI (Cloud-Optimized)

## 1.1 Objective & High-Level Scope
SentinelX AI is an autonomous cyber resilience platform engineered for Critical National Infrastructure (CNI). This product definition shifts local heavy computing burdens to cloud-managed telemetry layers to enable execution on edge platforms and resource-constrained engineering setups. The platform ingests network and host logs, correlates data via an AI swarm, projects lateral threat paths, and executes containment workflows.

## 1.2 Core Capabilities
* **Dynamic Log Filtering:** Strips benign system noise before ingestion to conserve cloud data transfer limits.
* **Semantic Threat Mapping:** Automates the categorization of security anomalies directly to the MITRE ATT&CK matrix.
* **Predictive Cyber Digital Twin:** Maintains a real-time graph model of network assets, exposure surfaces, and vulnerabilities.
* **Policy-Guarded Containment:** Deploys automated containment triggers governed by a zero-trust script engine.

## 1.3 Target Personas & Core Workflows
* **SOC Analyst:** Needs interactive dashboards, visual attack timelines, and a natural language Security Copilot.
* **Security Engineer:** Manages ingestion pipelines, exposure configurations, and cloud database connections.
* **CISO / Stakeholders:** Requires high-level compliance scoring, operational risk overviews, and plain-language incident summaries.

## 1.4 Infrastructure Philosophy
To bypass hardware limitations during development and deployment, all persistent datastores are decoupled from the local runner:
* **Time-Series Telemetry Platform:** Offloaded to managed PostgreSQL clusters with time-series pooling.
* **Knowledge Graph State:** Maintained via cloud-managed graph databases.
* **Asynchronous Event Routing:** Powered by cloud-native serverless message queues.
*
## SentinelX AI — Autonomous Cyber Resilience Platform for Critical National Infrastructure

---

## 1. Document Purpose
This PRD defines *what* SentinelX AI must do and *for whom*, so that engineering (human or AI coding agent) can build the correct product without ambiguity. It intentionally avoids implementation detail — see the Technical Requirements Document, Backend Schema Document, and Implementation Plan for that.

---

## 2. Vision & Mission

**Vision:** Pioneer self-shielding critical national infrastructure — networks that autonomously predict, adapt to, and neutralize advanced cyber threats at machine speed.

**Mission:** Give critical infrastructure operators, national security teams, and enterprise defenders an agentic cybersecurity platform that unifies continuous telemetry logging, a graph-based digital twin, and autonomous multi-agent reasoning to eliminate blind spots, cut alert fatigue, and protect public trust.

---

## 3. Problem Statement

Critical National Infrastructure (CNI) — power grids, telecom, banking, healthcare, government portals — is a high-value target for state-sponsored APTs and ransomware groups. Existing defenses fail because:

- **SIEMs** charge per gigabyte ingested, so organizations drop logs to save money — creating blind spots.
- **SOAR tools** run static, rule-based playbooks that break the moment an attacker deviates from a known pattern.
- **EDR agents** can't be installed on legacy OT/IoT systems, leaving large parts of CNI networks unmonitored.
- **MITRE ATT&CK mapping** is done manually, after the fact, instead of in real time.
- **SOC teams** are understaffed and drowning in low-fidelity alerts, unable to connect isolated events into a real attack campaign before damage is done.

Real-world consequence examples (from research phase): Kudankulam Nuclear Plant IT intrusion (2019), AIIMS Delhi ransomware (2022, 1.3TB encrypted, 2 weeks of downtime), Indian Financial System UPI/DDoS outage (2026), BSNL telecom portal dual-wave DDoS (2025), CBSE results portal breach (2026).

**Core gap identified in market research:** No competitor (Microsoft Sentinel, CrowdStrike, IBM QRadar, Splunk ES, Wazuh, Elastic Security, Palo Alto XSIAM) offers a unified, autonomous cyber-physical **digital twin** with real-time semantic reasoning across hybrid IT/OT environments at accessible cost.

---

## 4. Target Users & Personas

| Persona | Pain Points | What They Need From the Product |
|---|---|---|
| **SOC Analyst (Tier 1/2)** | Alert fatigue, repetitive triage, fragmented context | Consolidated alerts, automated triage, timeline views, conversational query assistant |
| **Security Engineer** | Complex log parsing, high ingestion overhead, manual correlation rule upkeep | Schema-agnostic parsers, automated config profiles, unified policy management |
| **Security Administrator** | Managing IT/OT permissions, patching, identity security | MFA, granular RBAC, exposure monitoring |
| **Incident Response (IR) Team** | High MTTR, hard-to-reconstruct timelines, risky containment | Fast search, continuous timeline reconstruction, policy-guarded isolation tools |
| **CISO** | Tracking posture, compliance, communicating risk upward | Executive scorecards, compliance trend reports, ROI analytics |
| **CEO** | Understanding business/financial impact, managing public trust | Plain-language risk summaries, incident impact metrics |
| **Government/Regulatory Agency** | Inter-agency intel gaps, delayed reporting | Automated regulatory reports, standardized threat metrics, secure federated comms |

**Assumption:** For MVP, we design and build for the first four personas (SOC Analyst, Security Engineer, Security Admin, IR Team) since they represent the daily active users. CISO/CEO/Government reporting views are simplified read-only dashboards in MVP and expanded later — this keeps scope buildable.

---

## 5. Strategic Product Goals (Success Metrics)

| Goal | Target |
|---|---|
| Operational uptime under attack | Zero-harm continuous availability via local containment |
| False-positive reduction | ≥ 95% reduction vs. traditional rule-based SIEM alerting |
| Mean Time to Remediation (MTTR) | Automated containment within **< 15 seconds** of confirmed high-confidence threat |
| Vulnerability visibility | Full code-to-cloud mapping of software/config dependencies |
| Detection accuracy (engineering target) | F1-score > 0.92 on anomaly detection benchmark (e.g., CICIDS2017) |
| Alert false-positive rate | < 1.5% |
| Ingestion latency | < 50ms per log write |
| Live UI update latency | < 20ms from state change to WebSocket broadcast |
| Platform availability | 99.999% SLA (multi-region active-active) — **long-term target, not MVP** |

**Assumption:** The 99.999% SLA and multi-region active-active requirement is a Phase III/IV (Swarm Scale / Federation) target, not something a first build needs to satisfy. MVP should target single-region high availability (e.g., 99.9%).

---

## 6. Product Scope

### 6.1 MVP (Phase I) — Build First
- Async network + host log ingestion pipeline (TimescaleDB hypertables)
- Unsupervised ML anomaly detection (Isolation Forest)
- Interactive real-time dashboard (ingestion rate, active incidents, digital twin health widgets)
- Real-time alert ledger with WebSocket streaming
- RAG-based Security Copilot chat (read-only query assistant over runbooks/CVE data)
- Automatic forensic incident timeline reconstruction + audit export
- Contextual risk-scoring engine (technical severity × asset criticality × exposure)
- Basic automated containment actions (endpoint isolation, IP blocklisting) gated by policy rules
- Authentication with MFA (FIDO2/WebAuthn or OIDC)

### 6.2 Phase II — Digital Twin
- Neo4j-backed knowledge graph of assets, identities, policies, software
- MITRE ATT&CK semantic mapping via RAG/vector search
- Attack path / lateral movement prediction
- Continuous vulnerability intelligence pipeline (NVD API sync + SBOM mapping)
- Executive compliance/risk scorecard

### 6.3 Phase III — Swarm Scale
- Full 10-agent LangGraph multi-agent orchestration
- Policy-guardrail middleware for agent tool execution ("CogniWall" pattern — see Assumption below)
- CEO plain-language incident explainer agent
- Continuous learning agent (feedback loop, threshold tuning)

### 6.4 Phase IV — Federation (Future, out of MVP scope)
- Cross-agency federated querying
- Anonymized indicator sharing
- Mobile read-only oversight app
- Voice interface for field engineers
- Multi-cloud posture agent (AWS/Azure/GCP)
- Lightweight OT/IoT sensor agent

**Assumption:** "CogniWall" is treated as a custom policy-enforcement middleware layer we build ourselves (a rules engine that validates every autonomous agent action against a permissions/policy file before execution) — not a third-party product, unless the team later decides to adopt a named product with that function.

---

## 7. Non-Goals (Explicitly Out of Scope for MVP)
- Cross-agency federation / government data sharing (Phase IV)
- Mobile app
- Voice control interface
- Native OT/IoT embedded sensor agent
- Multi-region active-active deployment
- Post-quantum cryptography

---

## 8. Competitive Positioning (Summary)

| Product | Gap SentinelX Fills |
|---|---|
| Microsoft Sentinel | No autonomous multi-step agentic execution; expensive non-Microsoft ingestion |
| CrowdStrike Falcon | No coverage where agents can't install (legacy OT); no multi-system coordination |
| IBM QRadar | No agentic planning; complex scaling |
| Splunk ES | No native autonomous response; high licensing cost |
| Wazuh | No correlation engine or AI reasoning (free but basic) |
| Elastic Security | AI assistant is query-only, no multi-agent coordination |
| Palo Alto XSIAM | Proprietary agentic workflow, vendor lock-in, high cost |

SentinelX AI differentiates via: dynamic noise-filtered ingestion (not per-GB pricing), an autonomous multi-agent swarm (not static playbooks), and a Neo4j-based cyber-physical digital twin (which no competitor offers natively).

---

## 9. Risks & Mitigations (Product-Level)

| Risk | Mitigation |
|---|---|
| AI hallucination triggers wrong containment action | Confidence-weighted actions; only high-confidence alerts auto-contain; ambiguous cases escalate to human analyst; simulate on digital twin before applying to production |
| Prompt injection via Copilot | Copilot runs read-only; cannot call containment tools directly; all write actions go through a separate, isolated Response Agent |
| Alert overload during real incident | Contextual risk scoring + severity-based grouping to prevent duplicate/derivative alerts from flooding the analyst |

---

## 10. Open Questions / Assumptions Log
1. **Assumed** target deployment is cloud-hosted (not fully air-gapped) for MVP, with air-gap support deferred — confirm if CNI customers require on-prem/air-gapped MVP.
2. **Assumed** initial customer/user base is enterprise SOC teams evaluating the product, not yet live production CNI systems — containment actions should default to "recommend" mode with a manual approve toggle until trust is established, then flip to full autonomous mode per customer policy.
3. **Assumed** English-only UI for MVP (source roadmap has no localization requirement).
