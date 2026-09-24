# Refactor Roadmap

## App Context
This app is a Next.js App Router frontend for population health and contract performance workflows, powered by synthetic data, browser persistence (IndexedDB/localStorage), and analytics-style dashboards.

Current implementation quality is strong for MVP/demo velocity. The next step is to improve **architectural consistency, performance headroom, and operational stability** without slowing delivery.

---

## Executive Summary

### Strengths
- Clean route taxonomy (`/contracts`, `/projects`, `/telemetry`, etc.)
- Good domain partitioning in `lib/contracts`, `lib/telemetry`, `lib/storage`, `lib/synapseai`
- Reusable component library and clear UI patterns
- Runtime validation used in parts of persistence layer (Zod in `synapseStore`)

### Main Risks
1. **Mixed execution model** (server-rendered pages + browser-only data sources)
2. **UI components doing heavy domain computation**
3. **Multiple overlapping sources of truth** (`mockData`, synthetic data, browser persistence)
4. **Telemetry service is a stub** while telemetry pages depend on it
5. **Persistence layer lacks robust migration/error strategy** for scale

---

## Refactor Objectives
1. Establish a **single data-access pattern** across domains
2. Move domain derivation logic out of route/components into selectors/services
3. Make telemetry implementation real and durable
4. Increase resilience of storage/migration/error handling
5. Prepare a clean transition path to server-backed architecture

---

## Architectural Target State

### Layered Boundaries
- **Presentation**: `app/*`, `components/*` (rendering + interaction only)
- **Application**: `lib/services/*` or `lib/usecases/*` (workflow orchestration)
- **Domain**: `lib/contracts/*`, `lib/projects/*`, `lib/telemetry/*` (rules/calculations/selectors)
- **Data Access**: `lib/repositories/*` (mock/indexeddb/api implementations)

### Data Contract Rule
- Persisted/external entities: runtime schema validation (Zod)
- UI-only derived shapes: TypeScript-only types

---

## Phased Refactor Plan

## Phase 1 — Stabilize Data Access + Telemetry (Highest ROI)
**Goal:** Remove direct data-source coupling from pages/components and make telemetry operational.

### Deliverables
1. Introduce repository interfaces and first implementations:
   - `lib/repositories/contractsRepository.ts`
   - `lib/repositories/projectsRepository.ts`
   - `lib/repositories/telemetryRepository.ts`
2. Replace direct imports in UI of:
   - `lib/mockData`
   - `lib/storage/*`
3. Implement real telemetry persistence using IndexedDB through repository/service
4. Standardize telemetry event creation (typed constructors)

### Candidate file migrations
- `app/contracts/page.tsx` → consume contracts repository
- `app/contracts/[id]/page.tsx` → consume contract detail service/repository
- `app/projects/page.tsx` → consume projects dashboard service
- `lib/telemetry/service.ts` → replace stub with repository-backed implementation

### Success Criteria
- No page/component directly imports `mockData` or low-level `db` helpers
- Telemetry pages render non-empty results after page interactions
- Domain loading logic can be swapped via repository implementation

---

## Phase 2 — Extract Selectors/View Models from UI
**Goal:** Thin down large route/components and make computations testable.

### Deliverables
1. Add selector/view-model modules:
   - `lib/contracts/selectors/buildContractsPortfolioView.ts`
   - `lib/contracts/selectors/buildContractDetailView.ts`
   - `lib/projects/selectors/buildProjectsDashboardView.ts`
2. Refactor heavy component logic from:
   - `components/ContractListClient.tsx`
   - `app/contracts/[id]/page.tsx`
   - `app/projects/page.tsx`
3. Add unit tests for extracted selectors

### Success Criteria
- Major rendering files are primarily layout/composition
- Derived financial/health calculations are unit-tested outside UI
- Reduced regression risk for domain math changes

---

## Phase 3 — Persistence Maturity + Stability Hardening
**Goal:** Improve IndexedDB reliability and operational behavior.

### Deliverables
1. Explicit migration strategy per DB version
2. Transactional write workflows for compound domain actions
3. Storage health handling:
   - corruption fallback/reset strategy
   - graceful read failures with defaults
4. Better domain-level persistence APIs (avoid ad hoc store calls)

### Candidate enhancements
- Add `lib/storage/migrations.ts`
- Add repository-level transaction methods for multi-entity writes
- Introduce centralized error/logging utility for storage operations

### Success Criteria
- Version upgrades are deterministic and documented
- Compound write flows are atomic at domain level
- Known fallback behavior exists for storage exceptions

---

## Phase 4 — Production Evolution Path (Optional but Recommended)
**Goal:** Enable secure, multi-user, server-authoritative architecture.

### Deliverables
1. Add API/route handlers for core domains (contracts/projects/telemetry)
2. Move feature flags to server-readable configuration model
3. Shift heavy aggregations from client to server or precomputed summaries
4. Introduce auth-aware access boundaries

### Success Criteria
- Browser cache is optimization, not source of truth
- Feature gating enforceable at server boundary
- Dashboard pages avoid loading full datasets client-side for summary metrics

---

## Priority Backlog (Ranked)

## P0
1. Repository boundary introduction
2. Telemetry service implementation (replace stub)
3. Selector extraction from `ContractListClient` and major route pages

## P1
4. Schema strategy unification for contracts/agreements
5. IndexedDB migration/error-handling hardening
6. Route/page decomposition into section components

## P2
7. Server-backed data + telemetry APIs
8. Server-readable feature flag model
9. Materialized summary/aggregation strategy

---

## Suggested Folder Additions

```text
lib/
  repositories/
    contractsRepository.ts
    projectsRepository.ts
    telemetryRepository.ts
  services/
    contractsService.ts
    projectsService.ts
    telemetryService.ts
  contracts/
    selectors/
      buildContractsPortfolioView.ts
      buildContractDetailView.ts
  projects/
    selectors/
      buildProjectsDashboardView.ts
  storage/
    migrations.ts
```

---

## KPI Targets for Refactor Success
Track these before/after to validate impact:

- **Maintainability**
  - % of route/components with domain calculations inline
  - Avg file size for top 10 largest route/components

- **Stability**
  - Storage/read failure rate
  - Number of data-contract parse errors surfaced in development

- **Performance**
  - Time-to-interactive for `/contracts` and `/projects`
  - Client CPU time spent in derived calculations on initial page load

- **Delivery velocity**
  - Cycle time for “new contract metric added” changes
  - Number of files touched per typical feature change

---

## Definition of Done (Roadmap Completion)
The roadmap is complete when:
1. Data access is repository-driven across core routes
2. Telemetry events are truly persisted and queryable
3. UI files are presentation-first, not computation-heavy
4. Storage versioning/migration strategy is explicit and tested
5. Team can switch from local/mock to server-backed mode with minimal UI churn

---

## Recommended Execution Cadence
- Run Phases 1–2 in parallel streams where possible (2–4 week window)
- Execute Phase 3 immediately after to lock in reliability
- Plan Phase 4 according to product maturity and backend readiness

This sequencing captures immediate risk reduction while preserving momentum for feature delivery.