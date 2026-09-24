# Prototype development and publishing

This is one integrated prototype, published to two repositories at the user's request:
- https://github.com/Haaaz3/DataSubmissions-Contracts.git (main)
- https://github.cerner.com/AD2005431/Austin-CI-Proto.git (main)

Make prototype changes once in this working copy. Preserve the original Data Submissions dropdown experience and the real PM Sandbox functionality. Run checks appropriate to the changes.

For completed prototype updates requested by this user, publish the same committed revision to both repositories. The user has requested this ongoing workflow. Do not create two independently edited versions. Check both remote main branches first and reconcile any changes; never force-push, delete branches, or overwrite work to obtain matching branches.

Use `pnpm publish:repos` (or `node scripts/publish-repos.mjs`) after committing and verification. `--check` performs preflight without publishing. Both destinations must pass preflight before either is pushed. Verify both remote heads equal the published commit before reporting synchronization.

If command-line credentials are unavailable but GitHub Desktop is signed in, its authenticated fetch/push operations can be used. A separate checkout for each Desktop origin is a publishing mirror only: fast-forward it from the development checkout; do not edit the two copies independently. Verify their remote-tracking main refs after fetching both destinations.

If one push is blocked or only one succeeds, report exactly which repository is current and which is pending. Never claim an atomic or background sync: two remote pushes are separate operations. These instructions apply when working in this repository; they do not install a background watcher or synchronize unrelated changes made outside this workflow.
