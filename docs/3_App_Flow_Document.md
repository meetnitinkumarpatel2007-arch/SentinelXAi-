# 3. App Flow Document - SentinelX AI

## 3.1 Authentication & Initialization Flow
1. **User Connection:** User opens the local React web app dashboard.
2. **Identity Handshake:** Frontend queries the FastAPI backend `/api/v1/auth` endpoint.
3. **Cloud Connection Audit:** The backend verifies connection handshakes with the remote Postgres, Neo4j, and Redis clouds, reporting status to the system monitor.

## 3.2 Ingestion & Anomaly Scoring Flow
1. **Telemetry Feed:** Log forwarders push network/host metrics to `/api/v1/ingest/network`.
2. **Local Processing:** FastAPI reads the log, runs the Isolation Forest anomaly detector, and builds the database payload.
3. **Cloud Flush:** Verified log packets are dispatched asynchronously to the cloud database cluster. High-severity alerts trigger instant WebSocket broadcasts.

## 3.3 Incident Triage & Swarm Analysis Flow
1. **Anomaly Trigger:** An anomaly score $s(x) > 0.8$ flags a critical security event.
2. **Context Enrichment:** The LangGraph orchestrator queries the remote Neo4j cloud to fetch network topology context.
3. **Containment Sign-off:** The response agent presents proposed containment commands to the analyst interface. Upon manual or policy approval, containment API scripts isolate the infected host.
4.
## SentinelX AI — Autonomous Cyber Resilience Platform

---

## 1. Purpose
Describes every major user journey through the application, screen-to-screen, including the handoff points between autonomous system actions and human decisions. This is the map an AI coding agent should follow when wiring up routing, state transitions, and screen navigation.

---

## 2. High-Level Journey: Active Intrusion (System → Human handoff)

This is the core end-to-end flow the whole product is built around.

```
[Intrusion Event]
      │
      ▼
[System: Log Ingest] → [System: ML Anomaly Alert]
      │
      ▼
[System: Predict Lateral Path] → [System: Safe Auto-Contain] → [User: Interactive Audit]
      │
      ▼
[User: Copilot Explainer Query] → [User: Sign-Off] → [System: Post-Incident Learning]
```

**Interpretation for engineering:**
- Steps 1–4 (ingest, anomaly detection, path prediction, safe containment) run **fully autonomously**, gated by the confidence threshold and policy guardrails (see TRD §8).
- Step 5 onward, responsibility shifts to the human analyst: they audit what happened, ask the Copilot clarifying questions, and formally sign off on the incident (closing it or escalating further).
- Step 6 (post-incident learning) feeds back into the anomaly model's baseline thresholds — this closes the loop.

---

## 3. Screen Inventory

| # | Screen | Primary Persona |
|---|---|---|
| 1 | Login (MFA) | All users |
| 2 | Primary Dashboard | SOC Analyst, Security Engineer |
| 3 | Threat Center Portal | SOC Analyst, IR Team |
| 4 | Incident Investigation Workspace | IR Team, SOC Analyst |
| 5 | RAG Copilot Chat | SOC Analyst, IR Team |
| 6 | Attack Timeline View | IR Team, CISO |
| 7 | Cyber Digital Twin Canvas | Security Engineer, IR Team |
| 8 | Compliance & Executive Reporting | CISO, CEO |
| 9 | System Settings & Policy Controls | Security Administrator |

---

## 4. Detailed Flow Per Screen

### 4.1 Login
1. User enters credentials.
2. System prompts hardware/FIDO2 MFA challenge or OIDC redirect.
3. On success → route to Primary Dashboard.
4. On failure → error state, rate-limited retry, no hint on which factor failed (security best practice).

### 4.2 Primary Dashboard (default landing screen)
- Displays: active threat count, system risk %, live ingestion rate, network topology preview, real-time activity feed.
- Left sidebar persists across all screens: Dashboard / Threats / Timeline / Twin / Copilot / Reports / Settings.
- Clicking an active threat count widget → routes to Threat Center Portal, pre-filtered to unresolved alerts.
- New alerts arrive via WebSocket and animate into the activity feed without a page reload.

### 4.3 Threat Center Portal
- Split-screen layout: left = active alert queue (sortable by severity/time/asset), right = raw telemetry payload for the selected alert.
- Selecting an alert with a linked incident → "Investigate" button routes to Incident Investigation Workspace.
- Alerts show computed risk score (R_s) and MITRE TTP tag inline.

### 4.4 Incident Investigation Workspace
- Interactive flowchart/node map showing the incident's related assets, from the Neo4j digital twin.
- Historical runbook recommendations surfaced based on similar past incidents (RAG lookup).
- Actions available: "Request Copilot Explanation," "View Timeline," "Approve/Override Containment Action," "Sign Off & Close."
- Containment approval requires explicit confirmation modal (name + reason) before executing, per NFR-SEC guardrails — **Assumption:** MVP defaults to manual-approve mode for all containment actions until the customer explicitly enables full-autonomous mode in Settings.

### 4.5 RAG Copilot Chat
- Standard chat UI, conversational query box.
- Answers questions against historical incidents, CVE data, and internal runbooks.
- **Read-only:** Copilot cannot trigger any containment action from chat — if a user asks it to "isolate host X," it responds with instructions to do so via the Investigation Workspace, not by executing anything itself.

### 4.6 Attack Timeline View
- Chronological reconstruction of the incident: raw log → anomaly flagged → MITRE mapping → predicted lateral path → containment action → resolution.
- Exportable as a structured forensic report (PDF/JSON).

### 4.7 Cyber Digital Twin Canvas
- Full-viewport interactive 2D graph (D3.js) of connected hosts, configs, and active vulnerabilities.
- Color coding: green = healthy, red = actively compromised, blue = isolated/contained.
- Clicking a node shows asset detail panel (criticality tier, open vulnerabilities, current status).
- Used both for live monitoring and for simulating a proposed containment action before applying it (per TRD §8 guardrail — "simulate before applying").

### 4.8 Compliance & Executive Reporting
- High-level risk metrics, compliance trend charts, business-impact summaries in plain language.
- Two audience modes: **CISO view** (technical risk + compliance detail) and **CEO view** (financial/operational impact only, no jargon).

### 4.9 System Settings & Policy Controls
- Manage user accounts and RBAC roles (Administrator only).
- Configure automated response policy rules (which actions can run autonomously vs. require approval).
- Configure database retention/compression policies.
- Toggle between manual-approve and full-autonomous containment mode.

---

## 5. Attack Simulation Flow (Testing/Demo Mode)

Used for validating the system without touching production networks — also useful during development as the primary way to exercise the full pipeline end-to-end.

```
[Attack Starts] → [AI Detects Anomaly] → [MITRE TTP Mapping]
        │                  │                     │
        ▼                  ▼                     ▼
[Lateral Prediction] → [Autonomous Response] → [Threat Neutralized]
```

1. **Attack Initiation** — simulator triggers a scripted scenario (phishing, malware/persistence, ransomware, insider exfiltration, credential brute force, or privilege escalation).
2. **AI Detection** — anomaly model flags it (< 50ms target).
3. **MITRE Mapping** — alert mapped to a TTP code.
4. **Lateral Movement Prediction** — digital twin identifies at-risk downstream hosts.
5. **Autonomous Response** — response agent executes (or proposes, in manual-approve mode) a containment playbook.
6. **Neutralization** — dashboard shows the isolated node in blue, decoy processes terminated, incident summary drafted.

**Assumption:** The attack simulator is an internal-only dev/QA/demo tool, gated behind an admin flag, and must never be reachable from a production customer-facing environment without explicit sandboxing.

---

## 6. Navigation Rules
- Sidebar is always visible except on the Login screen.
- Deep links to a specific incident (e.g., `/incidents/:id`) should route directly into the Investigation Workspace with that incident preloaded.
- Unauthorized route access (wrong role) redirects to Dashboard with a permission-denied toast, not a blank/error page.
