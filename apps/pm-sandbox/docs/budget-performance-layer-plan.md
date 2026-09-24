# Budget Performance Layer Plan

## 1. Objective

Introduce a **Budget Performance Layer** that allows healthcare systems to compare planned medical spend against actual cost run-rate for contracted populations, then connect that variance to VBC earnings, incentives, shared savings, quality gates, and intervention opportunities.

The goal is to help users answer:

1. What did we expect to spend?
2. What are we actually spending?
3. Are we over or under budget?
4. Can VBC earnings offset budget pressure?
5. Which contract, agreement, payor, market, or region needs attention first?

This layer should become a first-class financial dimension alongside:

- Earned VBC value
- Total VBC potential
- Incentive capture
- Quality-blocked savings
- Annualized cost

---

## 2. Budget Concepts

There are two budget concepts that should be modeled separately.

### A. Medical Expense Budget

This is the expected cost of care for an attributed population.

```text
Budgeted medical spend = budgeted PMPM × attributed lives × 12
Actual annualized cost = current PMPM × attributed lives × 12
Budget variance = budgeted medical spend − actual annualized cost
Budget variance % = budget variance / budgeted medical spend
```

Positive variance means the population is under budget.

Negative variance means the population is over budget.

#### Example

```text
Budgeted PMPM: $850
Current PMPM: $900
Lives: 10,000
Budgeted annual spend: $102.0M
Actual annualized cost: $108.0M
Budget variance: -$6.0M
Budget variance %: -5.9%
```

### B. Population Health / Intervention Budget

This is the budget allocated to care management, quality programs, analytics, outreach, risk adjustment, and other operating interventions.

```text
Intervention ROI = VBC value unlocked / population health investment
Net value after investment = earned VBC value − population health investment
```

This should be a later implementation phase because it requires program, workflow, or project spend data.

---

## 3. Recommended Budgeted PMPM Strategy

### Option 1: Use Existing `targetPmpm` as Budget Proxy

```text
budgetedPmpm = targetPmpm
```

#### Pros

- Fast implementation
- No immediate schema changes required
- Useful immediately
- Aligns budget to contractual performance target

#### Cons

- Target PMPM is not always the same as internal operating budget
- Some organizations budget differently from contract terms

### Option 2: Add Explicit `budgetedPmpm`

Add an optional contract field:

```ts
budgetedPmpm?: number;
```

Fallback:

```ts
budgetedPmpm ?? targetPmpm
```

#### Pros

- More accurate long-term
- Supports internal budget separate from external contract target
- Better for enterprise finance workflows

#### Cons

- Requires data model updates
- Requires form/configuration updates later
- Existing mock data needs fallback behavior

### Recommendation

Use **Option 2 with fallback**:

```ts
budgetedPmpm = contract.budgetedPmpm ?? contract.targetPmpm;
```

This makes the model future-proof while preserving current app functionality.

---

## 4. Core Budget Performance Utility

Create a reusable utility file:

```text
lib/contracts/budgetPerformance.ts
```

### Contract-Level Type

```ts
export interface ContractBudgetPerformance {
  contractId: string;
  budgetedPmpm: number;
  currentPmpm: number;
  attributedLives: number;
  budgetedAnnualSpend: number;
  actualAnnualizedCost: number;
  budgetVariance: number;
  budgetVariancePercent: number;
  isOverBudget: boolean;
  status: "under_budget" | "near_budget" | "over_budget";
  budgetSource: "explicit_budget" | "target_pmpm_proxy";
}
```

### Portfolio/Group Summary Type

```ts
export interface BudgetPerformanceSummary {
  budgetedAnnualSpend: number;
  actualAnnualizedCost: number;
  budgetVariance: number;
  budgetVariancePercent: number;
  overBudgetContracts: number;
  overBudgetLives: number;
  underBudgetContracts: number;
  underBudgetLives: number;
  nearBudgetContracts: number;
}
```

### Functions

```ts
export function getContractBudgetPerformance(contract: Contract): ContractBudgetPerformance
```

```ts
export function summarizeBudgetPerformance(contracts: Contract[]): BudgetPerformanceSummary
```

### Status Logic

Recommended initial threshold:

```ts
if (budgetVariancePercent <= -0.03) return "over_budget";
if (budgetVariancePercent >= 0.03) return "under_budget";
return "near_budget";
```

Thresholds can be tuned later by organization or contract type.

---

## 5. Contract Type Model Updates

File:

```text
types/contract.ts
```

Add:

```ts
budgetedPmpm?: number;
```

Optional future fields:

```ts
budgetSource?: "contract_target" | "internal_budget" | "modeled";
budgetPeriodStart?: string;
budgetPeriodEnd?: string;
```

For the first implementation, only `budgetedPmpm?: number` is necessary.

---

## 6. Mock Data Strategy

For existing seeded contracts, avoid editing every mock record initially.

Use fallback behavior:

```ts
const budgetedPmpm = contract.budgetedPmpm ?? contract.targetPmpm;
```

This allows budget performance to work immediately while leaving room for richer mock/internal budget examples later.

---

## 7. Scorecard Rollup Integration

Files:

```text
types/scorecardRollup.ts
lib/scorecards/rollups.ts
```

### Add to `ScorecardChildSummary`

```ts
budgetedAnnualSpend: number;
actualAnnualizedCost: number;
budgetVariance: number;
budgetVariancePercent: number;
overBudgetLives: number;
budgetStatus: "under_budget" | "near_budget" | "over_budget";
```

Note: `costAmount` currently represents annualized cost. Long-term, consider renaming or mapping:

```text
costAmount = actualAnnualizedCost
```

For now, keep `costAmount` for compatibility and add explicit budget fields for clarity.

### Add to `ScorecardRollup`

```ts
budgetedAnnualSpend: number;
actualAnnualizedCost: number;
budgetVariance: number;
budgetVariancePercent: number;
overBudgetContracts: number;
overBudgetLives: number;
```

---

## 8. Scorecards Table Integration

Current table columns include:

- Name
- Lives
- Overall Quality
- Cost
- VBC Earned
- Total VBC Potential
- Incentive Capture

### Recommended Budget-Aware Table Columns

1. Name
2. Lives
3. Budget Variance
4. Cost
5. VBC Earned
6. Total VBC Potential
7. Incentive Capture
8. Action

### Budget Variance Cell Design

Display:

```text
-$6.0M
5.9% over budget
```

or:

```text
+$2.4M
2.1% under budget
```

Color logic:

- Green = under budget
- Amber = near budget
- Red = over budget

### Sort Behavior

Add sort key:

```ts
"budgetVariance"
```

Default sorting could remain `Total VBC Potential` for value discovery, but budget-focused mode could sort by most over budget.

---

## 9. Scorecards Bubble Chart Integration

Current chart:

```text
X-axis = Total VBC Potential
Y-axis = VBC Capture Rate
Bubble size = Annualized Cost
Color = Status
```

### Future Budget Pressure Map

Add chart toggle mode:

```text
X-axis = Budget variance %
Y-axis = VBC capture rate
Bubble size = Actual annualized cost
Color = Budget status
```

### Interpretation

- Left + low: over budget and low VBC capture = highest urgency
- Left + high: over budget but offsetting with VBC earnings
- Right + low: under budget but missing value capture
- Right + high: financially healthy and capturing value

### Recommendation

Do not replace the current value capture chart immediately. Add Budget Pressure as a second chart mode later.

Potential chart modes:

1. Value Capture
2. Budget Pressure
3. Quality Unlock

---

## 10. Contracts Landing Page Integration

The Contracts page currently emphasizes:

- Earned VBC value
- Total potential VBC value
- Remaining opportunity
- Capture rate

Budget layer should add budget context to the financial operating system.

### Recommended KPI Cards

1. Current earned VBC value
2. Total potential VBC value
3. Budget variance
4. Lives under contract or actual annualized cost

### Budget KPI Example

```text
Budget variance
-$15.2M
3.7% over budget
```

### Updated Hero Copy

```text
Monitor current VBC earnings, budget performance, remaining opportunity, and the financial levers most likely to unlock contract value.
```

---

## 11. Contract Detail Page Integration

Each contract detail page should show budget context alongside settlement and quality information.

Recommended fields:

- Budgeted PMPM
- Current PMPM
- Target PMPM
- Budgeted annual spend
- Actual annualized cost
- Budget variance
- VBC earned
- Total VBC potential

This answers:

```text
Is this contract over budget, and is VBC value enough to offset the pressure?
```

---

## 12. Contract Creation / Configuration Updates

In the contract creation flow, add optional field:

```text
Budgeted PMPM
```

Suggested microcopy:

```text
Internal operating budget for this attributed population. If blank, target PMPM will be used as the budget proxy.
```

Recommended placement:

- New Contract page: `Population & Financials` step
- Configuration Studio: `Financial Terms` or `Basics`, depending final IA

---

## 13. Phased Rollout

### Phase 1 — Budget Calculation Foundation

- Add `budgetedPmpm?: number` to `Contract`
- Add `budgetPerformance.ts`
- Add budget rollup fields
- Use `targetPmpm` fallback
- Add Budget Variance to Scorecards table

### Phase 2 — Contracts Landing Page Integration

- Add Budget Variance KPI to Contracts landing page
- Add over-budget/under-budget counts to financial levers context
- Update hero copy to include budget performance

### Phase 3 — Contract Detail Integration

- Add budget performance card to contract detail
- Show PMPM budget vs actual vs target
- Link budget variance to settlement and VBC value

### Phase 4 — Budget Chart Mode

Add chart toggle:

- Value Capture Map
- Budget Pressure Map
- Quality Unlock Map

Budget Pressure Map:

```text
X = Budget variance %
Y = VBC capture rate
Size = actual annualized cost
Color = budget status
```

### Phase 5 — Intervention Budget / ROI

Add population health investment layer:

- Planned program budget
- Actual intervention spend
- Value unlocked
- ROI
- Net value after investment

---

## 14. Data Quality and UX Caveats

### Budget Source Must Be Clear

Always show whether budget comes from:

- explicit internal budget
- target PMPM proxy
- modeled default

Example:

```text
Budgeted PMPM: $850 · Source: target PMPM proxy
```

### Do Not Mix Budget and VBC Potential

Budget variance is not the same as VBC value.

- Budget variance = cost performance
- VBC earned = contract economics
- VBC potential = contractual upside/incentives

They should be visually connected but not collapsed into a single number.

---

## 15. Recommended Next Step

Start with **Phase 1**:

1. Add budget utility
2. Add budget rollup fields
3. Add Budget Variance to Scorecards table
4. Use `targetPmpm` as fallback budget proxy
5. Label it clearly as a budget proxy until explicit `budgetedPmpm` is added

This introduces budget performance in a useful, low-risk way without overloading the Contracts landing page immediately.
