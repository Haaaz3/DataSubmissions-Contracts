# Population Intelligence MVP – SynapseAI Projects

This demo app showcases synthetic, explainable population-health projects powered by specialist SynapseAI agents.
Everything uses **synthetic data only** and persists locally in IndexedDB.

## Demo Flow
1. Open `/cohorts` and click **Load demo cohorts**.
2. Use the **Ask SynapseAI** launcher to select an agent and generate analysis with streaming steps.
3. Click **Create Project from Recommendation** to save a SynapseAI snapshot.
4. Visit `/projects` to see saved projects and open the **Dashboard (Saved View)** tab.
5. Export a share package from the **Sharing** tab (demo-only export).

## Key Features
- Deterministic SynapseAI orchestrator with streaming steps, citations, assumptions, and confidence.
- Multi-agent selector with Quality Care Gap, Contract Performance, Claims Friction, and Evidence-Based Therapy/Trial agents.
- Synthetic cohorts, members, projects, and telemetry metrics.
- Project health scoring, alerts, and progress monitoring.
- IndexedDB persistence (via `idb`).

## Running
```bash
pnpm install
pnpm dev
```

## Tests
```bash
pnpm vitest
```

## Sharing (demo)
Sharing is implemented via JSON export packages (no backend). Use the Sharing tab on a project to export a share file.