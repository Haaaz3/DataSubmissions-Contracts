# Migration record

## Source preservation

- Imported the feature-contract-simulation-studio app as `apps/pm-sandbox` with its existing routes, components, styles, synthetic data, documents and tests.
- Imported Data Submissions main as `apps/data-submissions`; left its original `app.js` and `styles.css` unchanged. Added an optional bridge script to the runtime HTML.
- Used PM main as reference only; retained the earlier file-level comparison in `reference/feature-vs-main.json`. The full main branch is not duplicated in this delivery.
- Archive imports do not carry source Git history. No existing remote repository was modified or pushed.

## Integration changes

- Added a pnpm workspace and single root development/build/test interface.
- Wrapped PM pages in `UnionShell` while retaining original theme and feature-flag providers and PM chrome.
- Added a state-preserving product switcher, shared criteria page, Data Submissions same-origin boundary, and validated optional bridge.
- Added `packages/design-criteria` with shared storage, source adapters, adoption, revision control and portable JSON exchange.
- Added deterministic static-asset preparation and scenario-catalog generation.
- Preserved product and other query parameters through the existing root-to-home redirect, with regression coverage.
- Restored `/scorecards/contract/[id]` from the main baseline as a redirect to the feature branch's `/contracts/[id]/scorecard`.
- Added browser smoke coverage and root CI validation without adding deployment credentials or automatic publishing.

## Compatibility fixes

- Pinned PM direct dependencies to the versions in its supplied lockfile. The new root lockfile resolves the workspace. Nested source lockfiles are retained for provenance, not used by the root install.
- Set the Next.js monorepo tracing root and enabled shared-package transpilation.
- Configured Vitest to transform JSX for existing page-level tests.
- Added an explicit `Promise<SynapseWorkspace>` return type to the recursive workspace upsert function, resolving a type-inference error without changing its behavior.
- Included the optional bridge in standalone multi-file packages and removed it from standalone single-file HTML exports so they remain self-contained.

## Credentials

Inspected extracted source filenames and text, including hidden files, for environment files, private keys, credential filenames and common token/key patterns. No matching secret material was found. Original nested editable ZIPs contain only static HTML. No real credentials are needed by this prototype. `.gitignore` excludes environment files, keys, dependency trees and generated build output. Pattern scans are not a guarantee that arbitrary sensitive prose could never exist in source documents; the archive preserves the user's supplied synthetic prototype content.

## Dependency access during validation

The default npm registry reset connections in this environment. Dependencies were fetched from `registry.npmmirror.com` for validation. The repository does not configure that mirror: users may use their approved package registry. Lockfile integrity hashes remain included.

## Existing-dropdown integration

The final integration extends both existing Data Submissions dropdowns: View (available in all modes), and Select Program (Production Today). PM Sandbox is added under a Products group. A capture listener intercepts only that choice, restores the previous view/program value, and sends a same-origin message to the parent. All original options retain their original handlers. The PM header offers a native return select. Data Submissions opens by default at `/` and `/home`; explicit `product=pm-sandbox` and existing PM feature paths open PM Sandbox. Both products stay mounted.

The uploaded `/mnt/data` paths belong to the original cloud session. This Mac retrieved the exact attachments through the referenced conversation and compared their extracted source files against this deliverable. See `SOURCE-COMPARISON.json`.
