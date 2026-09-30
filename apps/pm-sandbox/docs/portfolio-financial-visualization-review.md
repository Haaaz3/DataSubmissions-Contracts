# Portfolio financial visualization review

Reviewed September 30, 2026. Scope: the integrated prototype’s three products and public product/design guidance from Tableau, Microsoft, Arcadia, Innovaccer and Health Catalyst. Vendor sources describe published capabilities; this review does not claim access to their private applications.

> Update: the portfolio overview now uses an annual downside/upside envelope with projected settlement and an alternative action scenario. The original exposure/recovery recommendation below is superseded for the top-level visuals. Improvement is the difference between the two settlement scenarios, not a percentage of downside exposure. The default is 2026; ASM 2027 has no financial envelope configured. Values are explicit illustrative assumptions, not payment calculations or conversions of clinical scores. Program-detail models remain separate in this first iteration.

## Original recommendation

Use a compact portfolio summary followed by one sortable comparison table. Put dollars at risk, recoverable opportunity, current performance, forecast, target and the next work deadline on the same program row. Open the existing program or worklist from that row.

Use paired horizontal dollar bars with a shared zero baseline and dollar scale. For performance, use a compact bullet-style chart with separately labeled current, forecast and target markers. Keep the actual metric and units visible. Do not average readiness, scores and clinical rates into a portfolio score.

The three summary questions are:

1. How much is exposed? Show gross modeled dollars at risk and scope.
2. How much can be addressed? Show recoverable opportunity within that exposure, with its denominator.
3. Where is performance short? Show current and forecast status against each program’s internal target, with a numerical gap.

## Industry comparison

| Source | Supported pattern | Application here |
| --- | --- | --- |
| [Tableau bullet graphs](https://help.tableau.com/current/pro/desktop/en-us/qs_bullet_graphs.htm) | Compact comparison of a primary measure with reference measures; an alternative to gauges. | Current/forecast/target markers in each row. |
| [Power BI KPI guidance](https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-kpi) | Evaluate progress and distance from a defined target. | Show the gap in points or percentage points beside the measure. |
| [Power BI dashboard design](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips) | Emphasize important values, use consistent scales, reduce clutter and support drill-down. | Three summary metrics, equal dollar scales, direct program navigation. |
| [Arcadia Ascent Finance](https://arcadia.io/ascent/finance/) | Connect contract parameters, financial forecasting, quality and operational workflows. | Keep financial basis accessible and link exposure to program/worklist detail. |
| [Innovaccer contract management](https://innovaccer.com/products/contract-management) | Financial modeling and cost/quality benchmarking support contract performance management. | Keep score performance separate from payment estimates; show the underlying obligation. |
| [Health Catalyst value-based care](https://www.healthcatalyst.com/healthcare-analytics/population-health-value-based-care) | Connect population, cost and quality performance to targeted interventions. | Place work deadlines and actionable drill-downs beside opportunity. |

This design is a synthesis of those principles, not a replica of a competitor dashboard.

## Review of the integrated products

| Product | Existing semantics | Recommended treatment |
| --- | --- | --- |
| HDI Command Center | Program risk/recovery estimates and mixed performance/readiness indicators. | Use the new comparison table; label the native metric and estimate basis. |
| PM Sandbox | Contract scorecards distinguish budgeted, achieved and remaining opportunity. Cost views compare actual with target spend. | Preserve those distinct quantities. Use budget-to-achieved comparisons for value and reconciliation waterfalls where the arithmetic actually describes payment. |
| Data Submissions | Score, projected lift, evidence and reporting-readiness workflows. | Compare scores and readiness to their respective targets. Add dollars only when an explicit payment model is available; do not infer a universal dollars-per-point conversion. |

## Corrections implemented

- Replaced the hard-coded headline totals with sums of the scoped program rows: all seven programs total $11.22M at risk and $4.62M recoverable. The six 2026 rows total $10.80M and $4.47M; the separate 2027 ASM scenario adds $420K and $150K.
- Distinguished all seven current shortfalls from five projected shortfalls. Two programs are forecast to meet target. Seven work items are due within 30 days; those are work deadlines, not seven program settlement deadlines.
- Used points for the modeled MIPS score and TEAM CQS; kept rates and readiness percentages labeled.
- Removed the unsupported indexed risk/membership trend and membership-growth badge from the executive summary.
- Moved repetitive program cards under Program worklists. Preserved all program and worklist navigation.
- Removed the generic program view’s assumption that risk minus opportunity equals protected value.

## Financial interpretation

Risk and opportunity remain illustrative program estimates. Opportunity is included in risk, not additional revenue. The remainder does not establish protected or realized value. Shared patients and shared measures do not by themselves establish distinct financial exposure: the gross portfolio sum is not deduplicated across payment obligations.

The TEAM drill-down is a separate participant example; its 732-episode reconciliation should not be presented as the calculation of the broader two-hospital portfolio estimate. Program basis details make this scope distinction visible.

Before using these visuals with operational data, identify unique payment obligations, financial periods, gross versus net exposure, realized versus modeled amounts and the contract-specific payment rules. Historical trends should come from dated snapshots rather than generated trajectories.
