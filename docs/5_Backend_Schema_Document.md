# 5. Backend Schema Document - SentinelX AI

## 5.1 Time-Series & Relational DDL (Optimized for Managed Postgres Clustered Engines)
```sql
-- Relational User Ledger
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'SOC Analyst', 'Security Engineer', 'CISO')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core Device Asset Matrix
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostname VARCHAR(100) UNIQUE NOT NULL,
    ip_address INET NOT NULL,
    mac_address MACADDR NOT NULL,
    os_platform VARCHAR(100) NOT NULL,
    asset_criticality VARCHAR(20) NOT NULL CHECK (asset_criticality IN ('P0', 'P1', 'P2', 'P3')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Isolated', 'Decommissioned')),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Normalized Compressed Time-Series Ingestion Table
CREATE TABLE network_logs (
    time TIMESTAMPTZ NOT NULL,
    log_id UUID NOT NULL DEFAULT gen_random_uuid(),
    source_ip INET NOT NULL,
    destination_ip INET NOT NULL,
    source_port INT NOT NULL,
    destination_port INT NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    packet_size INT NOT NULL,
    status VARCHAR(50) NOT NULL
);

-- Convert to Hypertable inside environments featuring the Timescale extension
-- SELECT create_hypertable('network_logs', by_range('time', INTERVAL '1 day'));
## SentinelX AI — Autonomous Cyber Resilience Platform

---

## 1. Purpose
Defines the complete data model across both databases (PostgreSQL/TimescaleDB for time-series + relational data, Neo4j for the graph-based digital twin), plus the API contract between frontend and backend. This is the source of truth for schema — build migrations from this document.

---

## 2. Data Architecture Overview

SentinelX uses a **hybrid storage model**:
- **PostgreSQL + TimescaleDB** — high-speed time-series log ingestion (network logs, security/host logs) plus standard relational tables (users, devices, alerts, incidents, vulnerabilities, AI agent interaction logs).
- **Neo4j** — topological/relationship data: how assets, identities, policies, and software connect to each other, used for attack-path prediction and the visual digital twin.

### 2.1 Entity-Relationship Diagram (Relational Side)

```
┌───────────┐  1───* ┌───────────┐  1───* ┌─────────────┐
|  Users     |        |  Incidents |        | AIResponses  |
└───────────┘        └─────┬─────┘        └─────────────┘
                            │ 1
                            ▼ *
                      ┌───────────┐
                      |  Alerts    |
                      └─────┬─────┘
                            │ *
                            ▼ 1
                      ┌───────────┐
                      |  Devices   |
                      └───────────┘
                            ▲
                    ┌───────┴───────┐
                    │ *             │ *
              ┌─────┴─────┐   ┌─────┴─────┐
              |NetworkLogs |   |SecurityLogs|
              └───────────┘   └───────────┘
```

---

## 3. PostgreSQL / TimescaleDB Schema (DDL)

> **Security note:** Passwords/connection strings below are placeholders for local development only. In any shared or production environment, all credentials must come from environment variables backed by a secrets manager — never committed to source control (see TRD §6).

```sql
-- User account registry
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'SOC Analyst', 'Security Engineer', 'CISO')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device asset registry
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostname VARCHAR(100) UNIQUE NOT NULL,
    ip_address INET NOT NULL,
    mac_address MACADDR NOT NULL,
    os_platform VARCHAR(100) NOT NULL,
    asset_criticality VARCHAR(20) NOT NULL CHECK (asset_criticality IN ('P0', 'P1', 'P2', 'P3')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Isolated', 'Decommissioned')),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- High-throughput, time-series network telemetry table
CREATE TABLE network_logs (
    time TIMESTAMPTZ NOT NULL,
    log_id UUID DEFAULT gen_random_uuid(),
    source_ip INET NOT NULL,
    destination_ip INET NOT NULL,
    source_port INT NOT NULL CHECK (source_port BETWEEN 0 AND 65535),
    destination_port INT NOT NULL CHECK (destination_port BETWEEN 0 AND 65535),
    protocol VARCHAR(20) NOT NULL,
    packet_size INT NOT NULL CHECK (packet_size >= 0),
    payload_hash VARCHAR(64),
    status VARCHAR(50) NOT NULL
);

SELECT create_hypertable('network_logs', by_range('time', INTERVAL '1 day'));

ALTER TABLE network_logs SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'source_ip, destination_ip, protocol',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('network_logs', INTERVAL '7 days');

-- High-throughput, time-series host security telemetry table
CREATE TABLE security_logs (
    time TIMESTAMPTZ NOT NULL,
    event_id INT NOT NULL,
    host_ip INET NOT NULL,
    username VARCHAR(100),
    process_name VARCHAR(255),
    command_line TEXT,
    event_source VARCHAR(100) NOT NULL,
    raw_message TEXT NOT NULL
);

SELECT create_hypertable('security_logs', by_range('time', INTERVAL '1 day'));

ALTER TABLE security_logs SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'host_ip, event_id',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('security_logs', INTERVAL '7 days');

-- Integrated alert ledger
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time TIMESTAMPTZ NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    category VARCHAR(100) NOT NULL,
    source_ip INET,
    host_id UUID REFERENCES devices(id),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active security incidents table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Open', 'Investigating', 'Contained', 'Resolved')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    assigned_analyst UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vulnerability tracking register
CREATE TABLE vulnerabilities (
    id VARCHAR(50) PRIMARY KEY, -- CVE ID (e.g., CVE-2024-1234)
    source_identifier VARCHAR(100) NOT NULL,
    published_date TIMESTAMPTZ NOT NULL,
    last_modified_date TIMESTAMPTZ NOT NULL,
    vuln_status VARCHAR(100),
    cvss_score NUMERIC(3, 1),
    cvss_vector VARCHAR(100),
    details TEXT NOT NULL
);

-- Multi-agent interaction logs table
CREATE TABLE ai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id),
    agent_name VARCHAR(100) NOT NULL,
    prompt_query TEXT NOT NULL,
    llm_response TEXT NOT NULL,
    confidence_score NUMERIC(4,3) NOT NULL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    token_usage INT NOT NULL CHECK (token_usage >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommended additional table: policy rules for autonomous action guardrails
-- (Assumption: not explicit in source material, but required by TRD §8 guardrails)
CREATE TABLE response_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type VARCHAR(100) NOT NULL, -- e.g., 'isolate_host', 'blocklist_ip'
    requires_manual_approval BOOLEAN DEFAULT TRUE,
    min_confidence_threshold NUMERIC(4,3) DEFAULT 0.900,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Neo4j Graph Schema (Digital Twin)

> **Assumption:** The source roadmap describes *what* the digital twin must represent (assets, identities, policies, software components, attack paths) but does not provide explicit Cypher schema. The model below is a reasonable, standard cybersecurity-graph design synthesized from that description — validate against real asset inventory data during Phase II before finalizing.

### 4.1 Node Labels

| Node Label | Key Properties |
|---|---|
| `:Asset` | `id`, `hostname`, `ip_address`, `os_platform`, `criticality` (P0–P3), `status` |
| `:Identity` | `id`, `username`, `type` (human/service account), `privilege_level` |
| `:SoftwareComponent` | `id`, `name`, `version`, `cpe_string` |
| `:Vulnerability` | `cve_id`, `cvss_score`, `published_date` |
| `:Policy` | `id`, `name`, `type` (network/access/firewall), `enforced` |
| `:NetworkSegment` | `id`, `name`, `zone_type` (IT/OT/DMZ) |

### 4.2 Relationships

| Relationship | Direction | Meaning |
|---|---|---|
| `(:Identity)-[:HAS_ACCESS_TO]->(:Asset)` | Identity → Asset | Who can reach what |
| `(:Asset)-[:RUNS]->(:SoftwareComponent)` | Asset → Software | Installed software inventory |
| `(:SoftwareComponent)-[:AFFECTED_BY]->(:Vulnerability)` | Software → CVE | Vulnerability mapping |
| `(:Asset)-[:CONNECTS_TO]->(:Asset)` | Asset → Asset | Network reachability edge (used for lateral movement prediction) |
| `(:Asset)-[:MEMBER_OF]->(:NetworkSegment)` | Asset → Segment | Zone membership (IT/OT/DMZ) |
| `(:Policy)-[:GOVERNS]->(:Asset)` | Policy → Asset | Which policy applies to which asset |
| `(:Asset)-[:CURRENTLY_COMPROMISED_BY]->(:Vulnerability)` | Asset → CVE | Active exploitation state during an incident |

### 4.3 Example Cypher — Lateral Movement Query
```cypher
// Find all assets reachable within 3 hops from a compromised host,
// prioritized by criticality, to project lateral movement risk.
MATCH path = (compromised:Asset {id: $compromisedAssetId})-[:CONNECTS_TO*1..3]->(target:Asset)
WHERE target.status <> 'Isolated'
RETURN target, target.criticality, length(path) AS hops
ORDER BY target.criticality DESC, hops ASC;
```

---

## 5. API Endpoint Reference

| Method | Route | Purpose | Auth Required |
|---|---|---|---|
| POST | `/api/v1/ingest/network` | Write incoming network telemetry to TimescaleDB | Service token |
| POST | `/api/v1/ingest/security` | Write incoming host/security telemetry to TimescaleDB | Service token |
| GET | `/ws/v1/alerts` | Persistent WebSocket stream of live alerts/state updates | Session |
| POST | `/api/v1/copilot/query` | Submit natural-language query to RAG Copilot (read-only) | Session |
| GET | `/api/v1/incidents` | List incidents (filterable by status/severity) | Session |
| GET | `/api/v1/incidents/{id}` | Get single incident detail | Session |
| POST | `/api/v1/incidents/{id}/response` | Approve/execute a proposed containment action | Session + role check |
| GET | `/api/v1/twin/assets/{id}` | Fetch asset + graph neighborhood from Neo4j | Session |
| GET | `/api/v1/vulnerabilities` | List/filter tracked CVEs | Session |
| GET | `/api/v1/reports/executive` | Generate plain-language executive summary | Session (CISO/CEO role) |

**Assumption:** Endpoint list expanded beyond the source material's two example routes (`/ingest/network`, `/copilot/query`) to cover the full feature set described in the PRD/App Flow — these additional routes should be treated as the required minimum API surface for MVP, not yet-final production API design.

---

## 6. Data Retention & Compression
- `network_logs` and `security_logs`: compressed after 7 days via TimescaleDB compression policy (columnar storage, ~90% storage reduction per source benchmarks).
- **Assumption:** Long-term retention period (e.g., 90 days, 1 year) for compliance purposes is not specified in source material — confirm required retention window with compliance/regulatory stakeholders before Phase II; default to 90 days compressed retention as a placeholder.

---

## 7. Assumptions Log
1. Neo4j graph schema is synthesized (not explicitly provided in source) — treat as a first draft to validate against real data during Phase II (Digital Twin phase).
2. `response_policies` table added as a new table not present in the original schema, required to support the guardrail behavior specified in the TRD.
3. Full production API surface expanded from the two example routes shown in source material to cover all MVP features.
