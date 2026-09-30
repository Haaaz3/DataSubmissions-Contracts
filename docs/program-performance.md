# Program performance

Updated September 30, 2026. All results, targets, financial projections, provider assignments and patient review records are illustrative prototype data. Published measure definitions remain separately sourced.

## Page order and actions

Every obligation starts with program performance and its main drivers. MIPS includes Quality, Cost, Promoting Interoperability and Improvement Activities. TEAM and ASM retain this overview above the existing quality/cost detail tabs. VBC shows settlement, medical expense, quality gates and performance drivers before payer and contract comparisons. Other programs show quality, the priority review population and operational work.

Selected published quality measures now show current performance, internal target, target gap, six monthly trend points, review population and next action. Default priority combines relative target gap and review population; it is not an estimated dollar return. Measures with lower-is-better results retain that direction. Trend scales follow the observed values with padding, label their limits and indicate when a target is outside the plot.

Review actions open a measure- and program-specific worklist with provider, status and text filters. The 24 representative records are a sample of each modeled review cohort, not its complete patient population. Review status is in-memory demonstration state and does not update clinical evidence or measure results. Review counts are operational cohorts, not numerators or guaranteed gap closures. Published applicability, reporting periods, specification links and source tables remain under Published requirements and sources.

## MIPS example

The standard 2026 weights are Quality 30%, Cost 30%, Promoting Interoperability 25% and Improvement Activities 15%. The category scores reconcile to 78 current and 83 forecast final-score points. Eligibility exceptions and category reweighting are not modeled. The nine example quality results are not converted into CMS decile scores or asserted to be the selected reporting set.

The internal target is 85 points. CMS's neutral payment threshold is 75 points, so the positive $300,000 projected and $500,000 action-scenario adjustments are illustrative assumptions consistent with being above that threshold; they are not calculated from the score. PY 2026 corresponds to payment year 2028. Positive adjustments depend on budget neutrality. This corrects the previous negative-payment example at a score of 78.

- [CMS 2026 MIPS cost fact sheet and standard category weights](https://mmshub.cms.gov/sites/default/files/2026-MIPS-Annual-Call-for-Cost-Measures-Fact-Sheet.pdf)
- [QPP scoring and payment adjustments](https://qpp.cms.gov/scoring-payment/payment)

## Scope and consistency

TEAM's annual financial envelope and the 732-episode analytics sample remain distinct scenarios, labeled accordingly. Annual financial summaries use the same program scenarios as the portfolio; VBC summaries continue to derive from the shared contract settlement calculator. PMPM/PMPY changes affect display only, with values calculated from the same member-month-normalized expense.

Targets in the operational quality view are internal scenario targets, not official benchmarks, Stars cut points or universal contract thresholds. Medicaid Adult Core Set examples do not establish a state-specific VBP mandate. Official requirements and their limitations remain in the reference disclosure.

## Validation

Automated checks cover catalog coverage, improvement direction, cohort bounds, category-score reconciliation, overview ordering and expense-basis conversion without settlement changes. Browser checks cover category drill-downs, quality filtering, provider worklists, review status and payer/contract expense preferences. Production build, TypeScript, lint and the full application test suite pass.
