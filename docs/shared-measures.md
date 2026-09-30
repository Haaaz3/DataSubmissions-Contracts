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
Each obligation has an illustrative eligible population, numerator and target.
Rates are computed from these counts. Patients to target uses a fixed denominator:
round the required numerator up for higher-is-better measures and down for the
diabetes poor-control rate. Open gaps are distinct from patients needed to meet
the target; meeting a target does not imply all gaps are closed.

Modeled exposure allocates a risk pool by an assumed measure share. MA/Medicaid
pools reuse portfolio fixture risk; the two commercial pools are explicit scenario
assumptions ($200,000 and $150,000), not their population-health investment budgets.
The scenario exposes the allocation while a target is missed, and zero once met.
This is not a payment, savings or settlement calculation. MIPS financial impact
is unallocated, displayed as a dash rather than zero. The Calculation disclosure
shows the inputs and assumptions for every row. No patient or financial totals
are added across overlapping obligations. Full licensed measure logic is not run.

Contract/program links open existing overviews with these same impact metrics;
existing patient lists are not measure-filtered.

Validation: unit tests cover measure-ID searches, intersecting program/search
filters, distinct program counts, inverse rates, whole-patient thresholds, missing
allocations and empty populations. Browser checks cover expansion, specification
comparison, empty-state recovery, contract/program navigation and context after
reload. The prototype suite, typecheck and lint pass.
