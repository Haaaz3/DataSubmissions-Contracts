# Product & Value Scorecards — Implementation Plan

## Objective
Implement two complementary scorecards for product management:

1. **Product Scorecard** — usage, feature adoption, stickiness, and workflow conversion.
2. **Value Scorecard** — execution effectiveness and operational outcome movement tied to AI-assisted workflows.

---

## Scorecard Definitions

### 1) Product Scorecard (Adoption + Behavior)
Primary questions:
- Are target users adopting the platform?
- Which modules/features are used most?
- Are users returning and building workflow habits?
- Are AI opportunities converting into action?

Core KPIs:
- DAU / WAU / MAU
- WAU:MAU (stickiness)
- New user activation rate
- Feature adoption by module (contracts, projects, workspaces, quality, cohorts)
- Opportunity review rate
- Opportunity → project conversion rate
- Workspace adoption and embed usage rate
- Project activation rate (created project with at least one task/status update)

### 2) Value Scorecard (Execution + Outcomes)
Primary questions:
- Are AI recommendations turning into real execution?
- Are AI-created projects progressing and healthy?
- Are target KPIs improving after project launch?

Core KPIs:
- AI recommendation acceptance rate
- Time from opportunity surfaced/reviewed to project creation
- Task completion rate on AI-created projects
- Healthy vs at-risk project mix
- Primary KPI improvement rate at 30/60/90 days
- PMPM variance movement after launch
- Quality score movement after launch
- Utilization movement (e.g., ED visits/1000, readmission rates) where applicable

---

## Phased Delivery Plan

## Phase 1 — Telemetry Foundation
Goal: Create a consistent event model and capture the highest-value interactions.

### Deliverables
- Add telemetry event model and storage utilities.
- Add `trackEvent()` helper with consistent metadata.
- Instrument priority events in core flows.

### Proposed files
- `lib/models/telemetry.ts`
- `lib/telemetry/service.ts`
- `lib/storage/synapseStore.ts` (add telemetry read/write methods)

### Event schema (minimum)
- `eventName`
- `occurredAt`
- `userId` (or demo user id)
- `userRole`
- `page`
- `module`
- Optional IDs: `contractId`, `workspaceId`, `projectId`, `opportunityId`
- Optional AI lineage: `originAgentId`, `contributingAgentIds`
- `projectOrigin` (`manual`, `opportunity`, `agent_run`)

### Wave 1 events
- `dashboard_viewed`
- `contract_viewed`
- `opportunity_review_opened`
- `opportunity_review_closed`
- `project_created_from_opportunity`
- `project_viewed`

---

## Phase 2 — Product Scorecard
Goal: Ship PM visibility for adoption, usage, stickiness, and conversion.

### Deliverables
- Aggregation utilities for Product Scorecard KPIs.
- Product scorecard UI page.

### Proposed files
- `lib/telemetry/productScorecard.ts`
- `app/telemetry/product/page.tsx`

### UI sections
- KPI cards (MAU, WAU:MAU, activation, review rate, conversion)
- Module adoption breakdown
- Funnel: opportunity surfaced → reviewed → project created
- Workspace usage/adoption snapshot

### Phase 2 additional events (Wave 2)
- `workspace_created`
- `workspace_opened`
- `workspace_embedded_on_page`
- `project_task_status_updated`
- `project_health_viewed`

---

## Phase 3 — Value Scorecard
Goal: Connect AI-assisted workflows to execution and outcome movement.

### Deliverables
- Value scorecard aggregations with attribution logic.
- Value scorecard UI page.

### Proposed files
- `lib/telemetry/valueScorecard.ts`
- `app/telemetry/value/page.tsx`

### Attribution approach (MVP)
- Project is AI-assisted if `projectOrigin` is `opportunity` or `agent_run`.
- Measure KPI movement relative to project start (`createdAt`) at 30/60/90 day windows.
- Compare AI-assisted vs manual project outcome movement.

### UI sections
- Recommendation acceptance and decision velocity
- Project activation and execution health
- Primary KPI movement (30/60/90 days)
- PMPM / quality / utilization movement summaries
- AI-assisted vs manual comparison

---

## Data Model / Tracking Enhancements

## Project metadata additions (if needed)
- `projectOrigin`
- `sourceContractId`
- `sourceOpportunityTitle` (or stable opportunity id)
- `sourceWorkspaceId`

## Opportunity lifecycle tracking
Track state transitions:
- surfaced
- reviewed
- dismissed
- saved for later
- converted to project

---

## KPI Calculation Notes

### Product KPI formulas
- **Opportunity review rate** = reviewed opportunities / surfaced opportunities
- **Opportunity conversion rate** = projects created from opportunities / reviewed opportunities
- **Project activation rate** = projects with any execution update / projects created
- **Workspace adoption rate** = users with ≥1 workspace / active users

### Value KPI formulas
- **AI recommendation acceptance rate** = accepted recommendations / reviewed recommendations
- **Primary KPI improvement rate (30d)** = projects with primary KPI moving in desired direction by day 30 / eligible projects
- **Outcome movement** = post-launch metric average − pre-launch baseline (direction-aware)

---

## Suggested Rollout Timeline

### Sprint 1
- Telemetry model + storage
- Wave 1 instrumentation
- Basic telemetry QA and event validation

### Sprint 2
- Product scorecard aggregations + UI
- Wave 2 instrumentation
- Funnel QA (opportunity → project)

### Sprint 3
- Value scorecard aggregations
- Project attribution model
- KPI movement calculations

### Sprint 4
- Value scorecard UI
- AI-assisted vs manual comparison views
- Documentation and governance notes

---

## Governance / Quality Guardrails
- Clearly label outcome metrics as **associated with** interventions unless causal methods are implemented.
- Keep Product vs Value scorecards separate to avoid conflating engagement with impact.
- Add event QA checks:
  - required fields present
  - no duplicate high-frequency events
  - consistent naming conventions

---

## Success Criteria

### Product Scorecard success
- PM can answer adoption/stickiness questions weekly without manual log pulls.
- Opportunity review and conversion funnel is visible and trusted.

### Value Scorecard success
- PM and leadership can see whether AI-assisted projects are executing and improving KPIs.
- Teams can compare outcome movement between AI-assisted and non-AI workflows.
