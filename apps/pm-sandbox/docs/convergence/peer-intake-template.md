# Peer Feature Intake Template

Use this template for each divergent local copy so we can converge into a single canonical repository.

## 1) Overview
- **Your name:**
- **Copy name/label:**
- **Current status:** (demo-ready / partial / exploratory / broken)
- **High-level theme/focus:**

## 2) Features added or changed
For each major change:
- Feature name
- What problem it solves
- Why it matters
- Completeness (complete / partial / exploratory)

## 3) User flows
For each key flow:
- Entry route/page
- Step-by-step user journey
- Expected outcome
- What is different/better than baseline

## 4) Routes/pages changed
List routes changed or added (examples):
- `/scorecards`
- `/contracts/[id]/scorecard`
- `/projects/[projectId]`

## 5) Shared architecture/components changed
List any significant shared changes:
- App shell/navigation
- Shared components (cards, badges, tables, charts)
- Types/models
- Storage/state patterns
- Feature flags
- Utilities

## 6) Most impacted files/folders
Examples:
- `app/...`
- `components/contracts/...`
- `components/scorecards/...`
- `lib/mockData.ts`
- `types/...`

## 7) Sample/mock data changes
- New entities added
- Existing fields changed/renamed
- Product assumptions encoded in data
- Seed data dependencies

## 8) Dependency/config changes
- Packages added/removed
- Config changes (`tsconfig`, `next.config`, lint/test setup)
- Build/runtime expectations

## 9) Demo artifacts
- Screenshots:
- Screen recording:
- Walkthrough notes:

## 10) Known issues / rough edges
- Broken flows
- Placeholder logic
- Technical debt
- What should *not* be merged as-is

## 11) Merge recommendation (per feature)
- Merge as-is
- Merge with refactor
- Reference only
- Defer
- Reject

## 12) Known overlaps/conflicts
- Who overlaps with your implementation?
- Which areas conflict?
- Which version do you recommend and why?

## 13) Final summary
If we keep only 1–3 things from your copy, what are they and why?
