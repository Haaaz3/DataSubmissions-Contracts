# VBC financial model

Updated September 30, 2026. All contract values and payer assignments are illustrative prototype data, not customer or payer results.

## Scale and terminology

The portfolio represents a large provider system: 338,000 attributed members across 16 contracts and eight payers. Annualized medical expense is approximately $4.23B against a $4.20B medical budget. Contracts range from 10,000 to 38,000 members; current medical expense ranges from $573–$732 PMPM for commercial populations, $1,056–$1,225 for MSSP, and $1,208–$1,426 for Medicare Advantage. These are chosen scenario assumptions, not published payer rates. The benchmark and current expense share the same population, covered services and period within each scenario.

The UI separates medical expense from provider settlement. PMPM is medical expense divided by member months; PMPY is PMPM multiplied by 12. The seed assumes continuous enrollment for 12 months, no overlap between contract payment streams and no deduplication requirement within the VBC member total. Counts across different obligations should not be added as unique patients.

## Calculation

The existing PM Sandbox settlement calculator is also used for the HDI portfolio, payer rows, contract rows and contract detail. Payer and portfolio PMPM are weighted by member months, not averages of contract rates.

1. Medical budget = benchmark PMPM × member months.
2. Medical expense = current PMPM × member months.
3. Gross savings / overrun = budget − expense.
4. Apply each contract's minimum savings/loss threshold, quality gate, sharing rate and cap before aggregating. The simplified engine applies the sharing rate to the full gross variance after the threshold is met. Quality gates savings; it does not cancel shared losses.
5. Maximum downside and upside come from the modeled sharing caps. These are exposure limits, not projected losses or expected earnings.
6. Recalculate settlement after the strongest quantified PMPM-reduction intervention and strongest quantified quality intervention per contract. Do not sum overlapping interventions or invent impact for unquantified work. Cost is applied first, then quality, so both contributions reconcile to total improvement.
7. Settlement improvement = settlement with actions − current projected settlement. It is distinct from gross medical expense reduction.

The current portfolio projects approximately $17.89M in net shared losses, with a $9.97M positive settlement in the action scenario: $27.86M improvement from $49.50M modeled medical expense reduction. Quality can change a savings gate without creating a payment if the savings threshold is still unmet. The calculation disclosure shows this interaction and individual contract terms.

The maximum envelope is approximately −$367.35M to +$372.85M. Not every position within the envelope is expected or operationally attainable. Contract terms demonstrate mechanics and do not implement official MSSP track rules, MA Stars payment rules, final reconciliation, claims runout/IBNR, risk adjustment, sequestration or other program-specific adjustments. Other program envelopes remain separately labeled illustrative scenarios.

## Visual encodings

- Medical expense bars share a zero-based scale within the selected PMPM, PMPY or annual view. A vertical marker is the benchmark. Red indicates expense above benchmark; green indicates expense below benchmark. Dollar and percentage differences are explicit.
- Settlement bars run from negative (red) through break-even to positive (teal). The dot is the current projection; the outlined diamond is the action scenario. All payer rows use a common dollar scale. The obligation overview defaults to each program’s own labeled range so smaller programs remain readable, with a Shared dollars option for absolute-size comparisons. In the default view, compare the printed dollar amounts rather than bar lengths. Color does not encode a probability.
- Payers default to descending settlement improvement. Users can instead sort by normalized expense variance or annual medical expense. Selecting a payer filters the underlying contracts; each contract opens the same financial model and terms.

## Primary references

- [CMS Shared Savings Program financial and quality results](https://data.cms.gov/medicare-shared-savings-program/performance-year-financial-and-quality-results): distinguishes benchmark expenditures, actual expenditures, shared savings/losses, sharing rates and minimum savings/loss rates.
- [CMS PY 2024 results fact sheet](https://www.cms.gov/files/document/fact-sheet-ssp-py24-financial-and-quality-results.pdf): national context for the size of assigned populations and shared-savings payments; not the source of these invented payer contracts.
- [CHIA Total Medical Expenses standard statistic](https://www.chiamass.gov/assets/Uploads/standard-statistics/TME-Standard-Statistic.pdf): medical spending and per-member-per-month normalization. Premium revenue is not used as the medical expense benchmark.

## Validation

The financial tests independently check cost, sharing, quality-gate interactions, caps, unit conversion, member-month weighting, and reconciliation from contracts to payers to the HDI overview. Updated seed ranges and scenario fixtures preserve those assertions at the new scale. Browser checks cover the unit selector, payer filtering, individual contract calculations and gradients.
