# Convergence Tracker Template

Use this template to inventory peer copies, classify overlap/conflicts, and track integration decisions.

## Tab 1 — Feature Intake Tracker

| Peer | Copy Name | Snapshot Location | Demo Link | Feature Name | Feature Area | Summary | Status | Routes Changed | Shared Components Changed | Types/Models Changed | Mock Data Changed | Dependencies Changed | Overlap Level | Conflicts With | Technical Risk | Integration Complexity | Decision | Owner | Target Branch | PR Link | QA Status | Notes |
|------|-----------|-------------------|-----------|--------------|--------------|---------|--------|----------------|---------------------------|---------------------|------------------|---------------------|---------------|----------------|----------------|------------------------|----------|-------|---------------|---------|----------|-------|
|      |           |                   |           |              |              |         |        |                |                           |                     |                  |                     |               |                |                |                        |          |       |               |         |          |       |

### Suggested enums

- **Feature Area:** scorecards, contracts, cohorts, projects, workspaces, synapse, dashboard, shared-ui, navigation, mock-data, types-models, infra
- **Status:** complete, partial, exploratory, broken
- **Overlap Level:** low, medium, high
- **Technical Risk:** low, medium, high, critical
- **Integration Complexity:** low, medium, high
- **Decision:** adopt as-is, adopt with refactor, reference only, defer, reject
- **QA Status:** not started, ready for review, needs fixes, approved, merged

---

## Tab 2 — Shared File Conflict Tracker

| File / Folder | Peer A | Peer B | Peer C | Peer D | Conflict Type | Severity | Canonical Owner | Resolution Decision | Follow-up Branch/PR | Notes |
|---------------|--------|--------|--------|--------|---------------|----------|-----------------|---------------------|---------------------|-------|
|               |        |        |        |        |               |          |                 |                     |                     |       |

### Conflict Type examples

- type drift
- route overlap
- mock data drift
- UX divergence
- infra/config difference
- shared component mutation
- dependency mismatch

---

## Tab 3 — Merge Sequence Tracker

| Priority | Initiative | Source Peer(s) | Why Now | Blocking Decisions | Branch | Owner | Status | Notes |
|----------|------------|----------------|---------|--------------------|--------|-------|--------|-------|
| 1        | Baseline repo setup |                |         |                    | `integration/base` |       | Not started |       |
| 2        | Shared types reconciliation |                |         |                    | `refactor/shared-types-reconciliation` |       | Not started |       |
| 3        | Mock data normalization |                |         |                    | `refactor/mock-data-unification` |       | Not started |       |
