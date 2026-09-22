# Contract Scenario Studio presenter walkthrough

## Open the demonstration

Run the app and open `/contracts/mssp-001` (ACO REACH — Northeast Region), then select **Open Scenario Studio**. Use **Reset** to start with the current contract. Select **Presentation view** for the audience; **Show workbench** restores editable controls.

These numbers assume the repository's seeded configuration, with no locally saved configuration replacing it. The performance period is January–December 2026, covering 4,820 lives.

## Three-minute story

| Step | What to show | Settlement | Configured KPI incentives |
| --- | --- | ---: | ---: |
| Starting position | PMPM $910, ED visits 312 per 1,000, A1c control 68% | −$809,760 | $0 |
| Improve care performance | PMPM $848.75 and ED visits 285 per 1,000; A1c stays at 68% | $759,150 | $0; $450,000 held by quality gates |
| Unlock quality incentives | A1c control rises to 78%; cost and utilization assumptions stay fixed | $759,150 | $450,000 |

1. **Starting position:** “Our contract currently carries downside exposure. We can see the cost position and the quality requirements together before choosing an intervention.”
2. **Improve care performance:** “Suppose our care programs reduce PMPM to $848.75 and ED utilization to 285. Settlement improves by $1,568,910. The configured performance pool is fully earned against its scored measures, but the A1c gate still prevents its release.”
3. **Unlock quality incentives:** “Now move A1c control from 68% to 78%. That meets the configured contract gate and releases $450,000 of modeled incentive earnings. Better care performance and quality eligibility work together.”

The two financial columns are **not additive**. The configured pool may overlap with shared savings. Do not describe their sum as total revenue or ROI.

## Explore the live controls

- Select **Show workbench** and move A1c below 78 to demonstrate the contract gate. Its separate measure minimum is 72; the contract gate still requires 78.
- Adjust actual PMPM to show the savings corridor and downside exposure. The cost assumption in the guided step is explicitly one percentage point beyond the savings threshold; it is an illustrative scenario, not a forecast.
- Adjust ED visits independently: this can change the configured weighted pool and operational status. It never automatically changes settlement dollars; PMPM must be modeled separately.
- Expand **Contract and payout assumptions** to explore benchmark, population, sharing rates, and the settlement quality gate. Configured incentive gates remain defined in **Configure Contract**.
- Save a named option, reset, and load it again. Saved scenarios capture the baseline, configuration, KPI values, and payout assumptions in this browser. The app identifies a saved configuration that differs from the current one.
- Guided buttons replace the active scenario deterministically. **Reset** returns to the session's current contract snapshot. Close/reopen reloads current configuration. Escape closes the studio and restores focus to its launcher.

## Model boundaries

- The settlement panel uses existing VBC contract terms or clearly identified modeled defaults. The incentive panel uses saved configuration before seeded configuration. No source contracts or configurations are changed by simulation.
- PMPM and rate-based settlement calculations use the full contract performance period. Calendar month counting uses UTC, avoiding a timezone-dependent extra month.
- Scored KPI pools use normalized linked weights and threshold-to-target progress, capped at full achievement. Improvement targets are endpoint values relative to baseline. Range targets are inclusive.
- Fixed payouts require all linked targets; gate payouts require linked minimums. Tier payouts use the highest qualifying tier, not a cumulative sum. Multi-measure tiers use weighted achievement percentages.
- Per-unit payouts require explicit eligible units and dollars per unit. Percentage payouts require an explicit monetary base and configured percentage rate. These assumptions apply to both comparisons. The model does not invent patient counts from percentage measures.
- Rule limits apply after qualification; configured gates then govern release, followed by the aggregate incentive cap. Incomplete rules are marked “Needs configuration,” and totals are labeled partial.
- Domain economics, configured withholds, and configured downside caps are excluded from KPI earnings. VBC settlement downside caps still apply. Results are illustrative planning estimates using synthetic data, not settlement adjudication.

## Verification

Automated coverage includes baseline equality, seeded story transitions, synchronization, payout types, directionality, ranges, caps, gates, incomplete data, catalog aliases, storage validation, legacy scenarios, and storage failures. Browser checks cover the guided story, input validation, save/load/delete, focus containment, Escape, and seeded/unconfigured/draft entry points. Screenshots used for visual review are under `output/playwright/` in the working workspace.
