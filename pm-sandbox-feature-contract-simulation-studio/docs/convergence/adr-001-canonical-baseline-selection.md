# ADR-001: Canonical Baseline Selection

## Status
Proposed

## Date
2026-03-31

## Context
We have 4–6 divergent local project copies without clean shared Git branch history. We need one canonical baseline in the new repository to support controlled feature convergence.

## Decision Drivers
- app stability
- architectural coherence
- ease of local setup
- integration risk reduction
- ability to merge incremental features safely

## Options Considered

### Option 1
Use the most feature-rich local copy as baseline.

### Option 2
Use the most stable and coherent local copy as baseline.

### Option 3
Start from scratch and rebuild all features manually.

## Decision
Use the most stable and coherent local copy as baseline.

## Rationale
Convergence already has high integration risk. A stable baseline minimizes regressions and avoids compounding defects while importing features from other copies.

## Consequences

### Positive
- lower integration risk
- clearer starting point
- easier triage for peer feature imports

### Negative
- some advanced/experimental features may not appear initially
- may require additional follow-up imports to regain breadth

### Follow-up Work
- baseline candidate scoring
- baseline branch creation (`integration/base`)
- baseline validation checklist (run app, lint, key routes)

## References
- Convergence tracker
- Peer intake submissions
