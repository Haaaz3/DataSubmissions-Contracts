# Shared measure explorer

The HDI portfolio groups four common clinical focuses: blood pressure control,
diabetes glycemic status, colorectal screening and breast screening. Expand a
family to inspect its illustrative obligations, compare HEDIS and eCQM definitions,
or open an existing contract/program with the selected measure in a context banner.

The examples use CBP / CMS165v14, GSD >9% / CMS122v14, COL-E / CMS130v14 and
BCS-E / CMS125v14. Each definition links to its NCQA overview or 2026 eCQI source.
The crosswalk is curated, not a clinical equivalence engine. Shared HEDIS IDs do
not certify identical specifications: collection methods, contract modifications,
enrollment, exclusions and the applicable measurement year require validation.
The separate GSD <8% rate is not treated as equivalent to CMS122's >9% rate.

Program and commercial-contract assignments are synthetic demonstration data in
`data/synthetic/sharedMeasures.ts`, not an authoritative program requirement list.
The explorer does not calculate performance, sum overlapping patients, estimate
financial recovery or implement licensed HEDIS calculation logic. Contract/program
links open full existing overviews; existing patient lists are not measure-filtered.

Validation: unit tests cover measure-ID searches, intersecting program/search
filters and distinct program counts. Browser checks cover expansion, specification
comparison, empty-state recovery, contract/program navigation and context after
reload. The prototype suite, typecheck and lint pass.
