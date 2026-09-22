# ADR-003: Shared File Review Policy During Convergence

## Status
Proposed

## Date
2026-03-31

## Context
Multiple peer copies modified shared files (types, mock data, navigation, reusable components). These files have high blast radius and can silently break unrelated flows.

## Decision Drivers
- system stability
- architectural consistency
- prevention of hidden regressions
- clear ownership

## Options Considered

### Option 1
Review shared-file changes with the same bar as isolated feature changes.

### Option 2
Require stricter review and explicit conflict tracking for shared-file changes.

## Decision
Require stricter review and explicit conflict tracking for shared-file changes.

## Rationale
Shared-file mutations can impact many routes and features. They need stronger governance to avoid integration churn and drift.

## Consequences

### Positive
- fewer regressions
- better consistency across converged features
- clearer accountability

### Negative
- slower review throughput for shared-file PRs

### Follow-up Work
- maintain shared-file conflict tracker tab
- assign canonical owners for key shared areas
- require conflict notes in PR template

## References
- Convergence tracker (shared conflict tab)
- PR template
