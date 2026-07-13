# 4. UI/UX Design Brief - SentinelX AI

## 4.1 Design Tokens & Color Strategy
* **Environment Theme:** Low-fatigue, high-contrast dark mode tailored for SOC spaces.
* **Base Background:** Color codes matching deep space tones (`#0f111a`).
* **UI Panels:** Textured panels (`#161a26`) using distinct bounding borders (`#2d3748`).
* **Alert Designators:** Critical indicators styled in bold crimson; baseline items in teal or blue.

## 4.2 Cloud Integration Monitors
The primary navigation header must incorporate a dedicated cloud connectivity toolbar tracking database connection loops:
* **DB Status:** Green/Red indicators tracking Neon/Supabase API connection statuses.
* **Graph Status:** Pulse indicator tracking active Neo4j Bolt driver communication loops.
* **Broker Status:** Connection flag for the cloud-managed caching and queue systems.

## 4.3 Screen Mockup Outlines
* **Primary Infrastructure View:** Left navigation sidebar, center multi-variable trend charts, and a right-aligned live alert feed ticker.
* **Digital Twin Interface:** Full viewport D3.js rendering mapping active devices, exposed vulnerabilities, and projected threat paths.
## SentinelX AI — Autonomous Cyber Resilience Platform

---

## 1. Design Principles
1. **Calm under pressure.** SOC analysts stare at this screen for 8–12 hour shifts during active incidents — avoid visual noise, flashing/strobing effects, and alarm fatigue. Use color and motion deliberately, only for genuinely high-severity events.
2. **Information density with clarity.** Security professionals want data-rich views, not oversimplified consumer UI — but every number must be scannable at a glance.
3. **Trust through transparency.** Every AI-driven decision (anomaly flag, risk score, containment action) should be inspectable — show the "why," not just the "what."
4. **Progressive disclosure.** Dashboard shows summary; drill-down reveals raw telemetry, timelines, and graph detail only when requested.

---

## 2. Visual Design System

- **Component library:** Radix UI primitives + Tailwind CSS utility classes.
- **Color model:** OKLCh color space for perceptually uniform contrast — important for a dark-mode-heavy interface used for long shifts.
- **Theme:** Dark mode as default/primary (SOC environments are typically low-ambient-light). **Assumption:** a light mode is not required for MVP but should be planned for in the design token structure (don't hardcode dark-only colors).
- **Reference palette from source material** (starting point, to be formalized into design tokens):
  - Background base: `#0f111a`
  - Panel/card background: `#161a26`
  - Border: `gray-800` equivalent
  - Accent teal (primary/ingestion metrics): `#319795`
  - Accent blue (contained/neutral status): `#3182ce`
  - Critical/alert red: `red-500` / `red-400`
- **Typography:** System sans-serif stack (`font-sans`), clear hierarchy: large bold numerals for KPIs, monospace for IPs/hashes/technical identifiers (improves scanability and signals "this is raw technical data").

**Assumption:** No brand guideline or logo was provided in the source material — visual identity (logo, favicon, marketing typography) is out of scope for this brief and should be requested separately from a design/brand stakeholder before public launch.

---

## 3. Screen-by-Screen UX Specs

### 3.1 Login
- Centered card layout.
- MFA/hardware authentication status shown as a clear step indicator (not a vague spinner).
- Error states must not reveal which credential (username vs. password vs. MFA) failed.

### 3.2 Primary Dashboard
- Persistent left sidebar navigation (icons + labels): Dashboard, Threats, Timeline, Twin, Copilot, Reports, Settings.
- Top summary strip: Active Threats count, System Risk %, Ingestion Rate/sec — large, bold, glanceable.
- Center: interactive D3.js network topology preview (small/medium size on dashboard, full canvas on the dedicated Twin screen).
- Bottom: real-time activity feed, auto-scrolling with newest-first, clearly timestamped.

### 3.3 Threat Center Portal
- Split-screen: alert queue (left, ~35% width) / raw payload detail (right, ~65% width).
- Alert queue rows: severity badge (color-coded), title, affected host, timestamp, MITRE tag chip.
- Sortable/filterable by severity, time, asset criticality, resolution status.

### 3.4 Incident Investigation Workspace
- Interactive node-map/flowchart of the incident's blast radius (pulled from digital twin).
- Side panel: runbook recommendations, similar past incidents.
- Primary CTA buttons clearly separated by risk level: "Request Explanation" (safe/informational, neutral color) vs. "Approve Containment" (consequential action, requires confirmation modal, uses a deliberate/distinct color — not the same red used for alerts, to avoid confusion between "this is dangerous" and "this is an action button").

### 3.5 RAG Copilot Chat
- Standard chat bubble UI, clearly labeled "Copilot (read-only assistant)" in the header so users never mistake it for an action-execution surface.
- Suggested quick-prompts (e.g., "Summarize this incident," "What CVEs affect this host?") to reduce blank-page friction.

### 3.6 Attack Timeline View
- Horizontal or vertical chronological stepper: raw log → anomaly → MITRE mapping → lateral prediction → containment → resolution.
- Each step expandable for raw detail.
- Export button (PDF/JSON) clearly visible.

### 3.7 Cyber Digital Twin Canvas
- Full-viewport 2D graph, pan/zoom enabled.
- Node color legend always visible: green (healthy) / red (compromised) / blue (isolated).
- Node click → side detail drawer (not a full navigation away from the graph, to preserve spatial context).

### 3.8 Compliance & Executive Reporting
- Two distinct visual modes:
  - **CISO mode:** charts, compliance %, trend lines, technical risk scorecards.
  - **CEO mode:** 2–3 large plain-language KPIs (e.g., "Estimated downtime avoided," "Active incidents by business impact"), minimal jargon, no raw technical tables.

### 3.9 Settings & Policy Controls
- Form-based layout, grouped by category: Users & Roles, Response Policy (manual-approve vs. autonomous toggle, per action type), Data Retention, Integrations.
- Destructive/high-consequence toggles (e.g., enabling full-autonomous containment) require a secondary confirmation step.

---

## 4. Interaction & Motion Guidelines
- Real-time updates (new alerts, metric changes) should animate in subtly (fade/slide, < 200ms) — never a jarring full-page flash.
- Critical severity alerts may use a single, restrained pulse/highlight on the specific element — not a screen-wide flash or sound loop by default (should be a user-configurable preference, off by default to avoid alert fatigue described in the Problem Statement).
- Loading states must be skeleton-based (matching final layout shape) rather than generic spinners, to reduce layout shift during real-time data population.

---

## 5. Accessibility
- Maintain WCAG AA contrast minimums even within the dark theme (OKLCh should be tuned to guarantee this, not just aesthetic preference).
- All interactive elements keyboard-navigable (SOC environments often use keyboard-heavy workflows).
- Color is never the only signal for severity — always pair with a text label/icon (colorblind-safe design).

---

## 6. Assumptions Log
1. No existing brand/logo assets were provided — visual identity beyond the functional color system is a placeholder pending stakeholder input.
2. Light mode, while not in MVP scope, should be architected via design tokens (not hardcoded hex values in components) so it can be added later without a rewrite.
3. Mobile responsiveness is **not** required for MVP web app (a dedicated mobile app is a Phase IV future feature per the PRD) — the web dashboard should target desktop/large-monitor SOC workstation use first.
