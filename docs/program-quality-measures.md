# Published program quality measures

Verified against CMS sources on September 30, 2026. The reference catalog is in
`apps/pm-sandbox/data/reference/programQualityMeasures.ts`; synthetic rates,
workloads, targets and dollars remain in separate demonstration fixtures.

## Coverage

- **TEAM:** complete sets listed in the CMS fact sheet for PY2026, PY2027 and
  PY2028. PY2026 uses claims-only HWR (CMIT356), PSI90 (CMIT135), and THA/TKA
  PRO-PM (CMIT1618). PY2027 moves to Hybrid HWR, retains THA/TKA PRO-PM, and uses
  failure-to-rescue, falls with injury and postoperative respiratory failure.
  PY2028 also includes Information Transfer PRO-PM. The fact sheet marks several
  future measurement periods TBD; the app retains that status. Unreviewed later
  years are not extrapolated. CQS is points, not a clinical percentage.
- **ASM:** PY2027, five heart-failure measures (492,008,005,236,377) and four
  published low-back-pain measures (238,134,128,220). The heart-failure admission
  measure is modified for ASM. The excess-utilization entry is explicitly pending
  CY2027 rulemaking and excluded from the published count. No 2026 performance
  or invented eCQM version is assigned to ASM.
- **MIPS/MVP:** nine selected 2026 eCQMs with QIDs and versions, not a universal
  mandatory set or the complete QPP inventory. Registered MVP membership still
  requires configuration.
- **MA/Part D:** ten selected measures from the 2026 Stars Technical Notes. Rating
  year is distinct from measurement year (2024 for these examples). C12 controlled
  blood sugar is not equated to the shared GSD >9% poor-control rate.
- **Medicaid:** seven selected 2026 Adult Core Set measures, preserving mandatory
  behavioral-health vs voluntary reporting status. No state VBP contract is
  configured or implied by federal Core Set inclusion.
- **Hospital quality:** selected IQR, HAC Reduction and eCQM examples. CMS529v6
  is extraction logic for Hybrid HWR core clinical data, not a standalone eCQM
  performance rate. QRDA is a submission format.
- **Commercial contracts:** continue to use contract-specific modeled exhibits;
  no universal CMS list is assigned.

Each program table provides the measure ID, published title, collection method,
measurement period, applicability and a source link. TEAM year and ASM cohort
filters change only the published reference table, not the separate scenario
forecast below it. Existing operational work references the owning program’s
measure key; those links open the published definition, not an unrelated patient
list. Official program patient-level results are not connected in this prototype.

The Shared measures view exposes relevant published program links separately from
modeled contract populations, including ASM blood pressure beginning in 2027.
These links do not fabricate ASM patients, financial allocations or automatic
cross-program equivalence. Existing shared patient lists remain modeled MY2026
populations and keep their filters and counts.

## Sources

- TEAM measures: https://www.cms.gov/files/document/team-intro-qm-fs.pdf
- TEAM scoring: https://www.cms.gov/files/document/team-qualityscoring-fs.pdf
- ASM: https://www.cms.gov/priorities/innovation/files/asm-perf-cat-tech-fs.pdf
- MIPS eCQMs: https://www.cms.gov/files/document/2026-eligible-clinician-measures-table-v2.pdf
- Stars: https://www.cms.gov/files/document/2026-star-ratings-technical-notes.pdf
- Adult Core Set: https://www.medicaid.gov/medicaid/quality-of-care/downloads/2026-adult-core-set.pdf
- Hospital hybrid: https://www.cms.gov/files/document/2026-hospital-ip-hybrid-measures-table.pdf
- Hypoglycemia: https://ecqi.healthit.gov/ecqm/hosp-inpt/2026/cms0816v5

Tests verify TEAM year membership and periods, ASM cohort/pending status, Stars
and Medicaid distinctions, and all operational references resolving to their own
program. Browser checks cover TEAM year changes, ASM cohort filtering, navigation
and source links. The 108 tests, typecheck and lint pass.
