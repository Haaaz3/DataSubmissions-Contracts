# ADR-002: Convergence Method for Divergent Local Copies

## Status
Proposed

## Date
2026-03-31

## Context
Peer work exists in multiple local copies with no reliable shared branch history. Direct Git merges are likely to be noisy, risky, and difficult to review.

## Decision Drivers
- traceability
- reviewability
- risk containment
- conflict isolation
- maintainability of resulting codebase

## Options Considered

### Option 1
Attempt direct codebase-to-codebase merges.

### Option 2
Treat each peer copy as a feature source and re-integrate via scoped feature branches and PRs.

## Decision
Treat each peer copy as a feature source and re-integrate via scoped branches/PRs.

## Rationale
Without clean history, direct merges produce low-signal diffs and unresolved hidden conflicts. Feature-scoped re-integration creates explicit decisions, cleaner PRs, and safer rollbacks.

## Consequences

### Positive
- clearer review boundaries
- safer incremental integration
- explicit conflict resolution and documentation

### Negative
- more manual effort
- slower initial convergence pace

### Follow-up Work
- enforce intake process before import
- create merge sequence tracker
- use feature flags for partial/incomplete imports

## References
- Peer intake template
- Convergence tracker template
