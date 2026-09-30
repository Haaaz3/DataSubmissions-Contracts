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
shows the inputs and assumptions for every row. Impact cards do not sum patient counts or financial exposure
across overlapping obligations. Full licensed measure logic is not run.

Each obligation has six modeled monthly snapshots. The trend uses that obligation's
numerator/denominator and target, with improvement direction reversed for poor
control. Compact charts zoom to observed rates with a labeled, padded scale,
start/end rates and signed percentage-point change. Off-scale targets are labeled
above/below the plot instead of flattening the trend. Missing rates are not zero
and do not connect across missing snapshots. HEDIS and eCQM rates are not averaged.

The family summary replaces the large trend selector. It counts unique eligible
patients, patients with any open gap, shared patients and those with multiple open
gaps across the currently shown obligations. Search/program filters recalculate
these counts. The largest target workload ranks whole patients needed to meet an
individual obligation target, and links to that obligation’s complete open-gap
list. It does not identify which specific patients must close their gaps. Shared
patients indicate overlapping eligibility, not automatic credit across measures.

The family patient-list link opens all obligations in HDI. Eligible and open-gap
counts open the corresponding obligation/status scope. Filters are stored in the
URL, restored on reload/back/forward, and reject invalid measure/obligation IDs.
The shared patient table and frame are also used by the existing Population page.
Search, provider/status/obligation filters, sorting, pagination and CSV export work
against the selected roster; export includes all filtered rows, not just the page.

Rosters are deterministic synthetic records that reconcile exactly to each impact
card. Payer cohorts are disjoint; the clinician-reporting cohort overlaps them.
The combined list deduplicates by person, retaining each obligation's result.
In the combined view, "Open gaps" means at least one applicable obligation is open;
"Measure met" means all applicable obligations are met. Membership rows can narrow
the list to their obligation. No generic member chart is linked for these new
synthetic identities. Legacy HDI links without an exact supported measure report
an unavailable list instead of routing to an unrelated clinical measure.

Validation: unit tests cover measure-ID searches, intersecting program/search
filters, distinct program counts, inverse rates, whole-patient thresholds, missing
allocations and empty populations. Browser checks cover expansion, specification
comparison, empty-state recovery, contract/program navigation and context after
reload. Patient-list tests verify exact eligible/open/met reconciliation for all
20 obligations, deduplication, independent obligation results, combined filters,
URL round-trips and scoped CSV exports. Browser checks verify the existing
Population table, the combined roster, obligation/open-gap/provider filters,
pagination and reload/back navigation. Overview tests cover filtered overlap, deduplicated gaps and target workload;
trend tests cover zoom, flat/boundary rates and missing denominators. Browser
checks verify compact layout, scoped summaries and the priority gap-list link.
All 103 tests, typecheck and lint pass.
