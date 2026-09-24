# Data Submissions + Contracts

A connected workspace for **Data Submissions** and **PM Sandbox**, built from the supplied Data Submissions and PM feature-branch archives. The PM feature-contract-simulation-studio branch is the running application; PM main was used only as a reference during the earlier integration draft.

## Run the combined application

Requirements: Node.js 24 (tested with 24.19.0) and pnpm 11.19.0. Install pnpm using your normal Node tooling, or `corepack prepare pnpm@11.19.0 --activate` if Corepack is available.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open **http://localhost:3000**. Data Submissions opens by default. Choose **PM Sandbox** in its existing **View** dropdown (or **Select Program** in Production Today). In PM Sandbox, use the **Product** dropdown to return to Data Submissions. Switching preserves both mounted products and their current state.

- **PM Sandbox:** original routes, navigation, themes, contracts, scenario studio, scorecards, population insights, cohorts, projects, and SynapseAI demos.
- **Data Submissions:** original v53 interface, production/vision/variant views, six review scenarios, program selection, validation, submission and QRDA workflows.
- Direct link to Data Submissions: `http://localhost:3000/?product=data-submissions`.
- Existing PM URLs remain available. For example, `/contracts/mssp-001` opens the contract scenario demonstration.

There is one server and one origin. No API keys or environment variables are required. All existing product features remain prototypes using synthetic/demo data.

## Share and refine design criteria

1. Open **Design criteria** from the PM workspace header or **Shared design criteria** inside Data Submissions.
2. Choose a source product, then **Pull criterion** or **Pull all**. The catalog contains six actual Data Submissions scenarios and seven curated PM requirements traced to the source documentation.
3. Use **Entire shared library** to see requirements created in the other product. Select **Use in [product]** to adopt one.
4. Select **Refine**, edit its requirement and acceptance criteria, and save. Both products use the **same record**, including its source and revision history.
5. Use **New criterion** for additional workflow, interaction, validation, explainability, or visual requirements.
6. **Export library** backs up all records as JSON. **Import library** adds new records and reports conflicts without replacing local changes.

Re-pulling original source material never resets an edited criterion. Concurrent stale edits are rejected, with a reload option. Changes synchronize between open tabs on the same origin. Storage errors are shown instead of claiming a successful save.

These are **product design requirements**, not executable clinical rules, quality targets, or payment formulas. Editing a design criterion does not automatically rewrite the applications or change domain calculations.

## Production build and checks

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

Browser verification, with the production server running:

```sh
pnpm exec playwright install firefox
BROWSER=firefox pnpm test:browser
```

The automated suite uses Playwright’s test browser in a temporary profile. For Chromium, install it with `pnpm exec playwright install chromium` and omit `BROWSER=firefox`; optionally set `CHROME_PATH` to a locally installed Chrome executable. Set `BASE_URL` if the server uses a different address. The browser check uses an isolated temporary profile and writes review images to `docs/screenshots/`.

`pnpm build` and `pnpm dev` prepare Data Submissions' static assets automatically and refresh its generated criteria catalog. When changing static source files during development, rerun `pnpm prepare:submissions` (or restart `pnpm dev`).

## Repository layout

```text
apps/
  pm-sandbox/          Next.js app and shared workspace shell
  data-submissions/    Original standalone prototype and optional shell bridge
packages/
  design-criteria/     Canonical schema, IndexedDB repository, adapters, tests
reference/
  feature-vs-main.json File-level comparison of the two PM archives
scripts/              Asset preparation and browser verification
docs/                Architecture, migration notes, validation and browser-check instructions
```

The Data Submissions frame intentionally isolates the original global DOM code and CSS. The original Data Submissions dropdowns send product-switch requests to the React shell; this is not a rewrite of the static prototype into React. Both views remain mounted while switching. See [architecture and migration decisions](docs/ARCHITECTURE.md).

## Standalone Data Submissions

```sh
pnpm --filter hdids-design-lab-prototype start
pnpm --filter hdids-design-lab-prototype export:html
```

The original standalone server opens at `http://localhost:4173`. Standalone exports preserve the prototype, but the shared workspace and criteria editor require the combined application. Archived exports and `docs/` within the source app are retained as original reference artifacts; regenerate exports when needed.

## Boundaries

- Criteria persist in IndexedDB in the current browser/origin. There is no backend, account synchronization, or collaborative multi-user service. Export before clearing browser data or moving origins.
- Product-specific domain stores (contract configurations, projects, scenarios) remain intact; they are not design-criteria duplicates.
- Switching preserves in-memory product state during the session. Reloading follows each source app's original persistence behavior; Data Submissions' screen state resets on reload.
- The PM main baseline is reference-only and is not duplicated in this deliverable. Older nested deployment workflows are retained as source history and are not active root workflows.
- The root CI workflow validates the union; deployment requires a Node-compatible Next.js host. The complete app cannot be hosted as a static GitHub Pages site.

See [validation results](docs/VALIDATION.md) and [migration details](docs/MIGRATION.md).

## Git destination

This repository is hosted at [Haaaz3/DataSubmissions-Contracts](https://github.com/Haaaz3/DataSubmissions-Contracts). The local `cerner` remote also retains the original destination, `https://github.cerner.com/AD2005431/Austin-CI-Proto.git`. Source archives contain no original Git history. See `docs/VALIDATION.md` for verified checks and remote-access status. After authenticating with your approved Cerner Git credentials, inspect the remote before pushing; do not force-push over existing work.

## Keeping both repositories in sync

Future prototype updates should be committed once and published to both GitHub.com and Cerner Git using `pnpm publish:repos`. The script verifies that both `main` branches match and stops on conflicting changes or missing authentication. See [the publishing workflow](docs/REPOSITORY-SYNC.md).
