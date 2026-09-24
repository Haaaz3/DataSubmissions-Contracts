# Keeping the two repositories together

Develop once and publish the same `main` commit to:

- [GitHub.com](https://github.com/Haaaz3/DataSubmissions-Contracts)
- [Cerner Git](https://github.cerner.com/AD2005431/Austin-CI-Proto)

`AGENTS.md` records this as the default workflow for future prototype updates in this repository.

After making and testing changes, commit them, then run:

```sh
pnpm publish:repos --check
pnpm publish:repos
```

The publisher checks both destinations before pushing, refuses uncommitted work or divergent remote history, uses ordinary fast-forward pushes, and verifies matching commit IDs afterward. It needs normal Git authentication for both hosts and access to the corporate network when required. If one push fails, it reports partial completion. Reconcile any new remote changes, then retry; never force-push to fix a difference.

GitHub Desktop can publish through its signed-in accounts if terminal Git has no credentials. Keep its publishing checkouts on the identical development commit and verify both remote branches after upload.

This is an update-and-publish workflow, not continuous background mirroring. Changes made independently on either website must be fetched and reconciled before the next publish.

The initial alignment joins the original Cerner upload history with the integrated application's history. The current file tree is the integrated workspace; the original uploaded folders remain available in earlier commits.
