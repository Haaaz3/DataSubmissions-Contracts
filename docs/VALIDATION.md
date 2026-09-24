# Validation and handoff

Validated locally on macOS with Node 24.19.0 and pnpm 11.19.0.

- Production build: passed, including Next.js lint/type validation and generation of 107 static pages.
- Explicit TypeScript check: passed.
- Lint and original Data Submissions JavaScript syntax checks: passed.
- PM Sandbox: 67 tests passed across 14 test files, including 24 scenario-studio tests.
- Shared criteria: 8 tests passed, covering persistence, adoption, import validation, stale edits and source deduplication.
- End-to-end browser check: passed in Chrome against the production build. Verified default landing, both original dropdowns, all four original program choices, back/forward, preserved scenario state, Scenario Studio, bidirectional criteria refinement, deduplication, JSON export/import, reload persistence, cross-tab synchronization, PM routes, legacy redirect, mobile layout and no uncaught page errors. Review images are in `docs/screenshots/`.
- Source comparison: no files missing from either supplied production source archive. Original Data Submissions app.js and styles.css are unchanged. See SOURCE-COMPARISON.json.

Dependencies were reused from the existing local integration draft. For this relocated dependency tree, checks used `pnpm_config_verify_deps_before_run=false` to bypass pnpm's stale location metadata. No dependency verification was disabled in the delivered configuration. A new install from the network was not tested in this turn; use `pnpm install --frozen-lockfile` after extracting the source archive.

## Original Cerner remote status

The original integration targeted:

`https://github.cerner.com/AD2005431/Austin-CI-Proto.git`

A read-only `git ls-remote` check with prompting disabled failed with `fatal: unable to get password from user`. Git authentication is unavailable to this session; remote contents and write access could not be verified. No push was performed. Authenticate using your approved Cerner Git credentials or GitHub Desktop, fetch and inspect existing remote branches, then push without force. A corporate network/VPN may also be necessary.

## Runtime boundaries

Data Submissions remains its original static prototype, isolated in a same-origin frame inside the single Next.js app. PM Sandbox is the real feature-contract-simulation-studio application, including the scenario studio and its calculations. Both remain mounted during product switching. Shared design requirements are persisted in this browser's IndexedDB and can be edited/adopted from either product, with JSON import/export. There is no server-backed multi-user synchronization; shared criteria do not automatically alter clinical rules or contract calculations.

## Source package

The ZIP contains tracked source, documentation, screenshots and the workspace lockfile. It excludes node_modules, generated Next output, generated public copies and Git internals. The accompanying local folder is initialized as one Git repository; source ZIPs do not preserve the upstream repositories' commit histories.

## GitHub destination

This checkout uses `https://github.com/Haaaz3/DataSubmissions-Contracts.git` as its origin. The Cerner authentication limitation above describes the original destination and does not apply to GitHub Desktop’s separate GitHub.com account.
