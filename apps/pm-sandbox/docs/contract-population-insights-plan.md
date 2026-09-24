# Contract Population Insights: Problem, Rationale, and Implementation Plan

## Executive summary

Population health leaders using the Contracts flow need to understand not only whether a contract is performing financially, but **who is driving that performance**. Today, the app shows contract-level financial and KPI performance, including domains such as Quality of Care, utilization, and cost management. However, the experience does not consistently connect those aggregate results to the attributed lives, KPI denominator patients, high-cost members, and care-gap populations behind them.

The proposed **Contract Population Insights** experience creates a reusable drill-down pattern from any contract lives/patient count or contract KPI into a dedicated population page. This page will show the selected contract population, the patients contributing to the KPI denominator, patients with gaps for that same KPI, demographic and geographic breakdowns, chronic condition burden, attribution/visit recency, utilization, and cost concentration.

The intended outcome is to help leaders move from **scorecard interpretation** to **targeted population action**.

---

## The problem we are solving

### 1. Contract leaders can see performance but not the people behind it

The Contracts flow currently surfaces important performance signals:

- Contract financial performance.
- PMPM trend.
- Quality score.
- ED visits per 1,000.
- Domain and KPI scorecard performance.
- Achieved and potential dollars.

These are useful, but they are still aggregate views. A population health leader looking at a Quality of Care KPI needs to understand:

- How many patients qualify for this KPI?
- Who are those patients?
- Which subset has open gaps?
- What demographics and access barriers characterize them?
- Are they attributed but not recently seen?
- Are they also high-cost or high-utilization?

Without this context, a leader can identify that a KPI is underperforming but cannot quickly determine where to intervene.

### 2. KPI denominator context is missing from the scorecard workflow

The scorecard currently shows metric performance, stars, achieved dollars, potential dollars, and unlock opportunity. It does not show the **patient denominator** for each KPI.

For example, in the Quality of Care domain, a metric such as A1c Control should be able to communicate:

> “1,482 patients qualify for this measure. 416 have an open or in-progress gap. These patients account for $X in total cost of care and have Y ED visits per 1,000.”

This denominator context is important because leaders need to know whether an opportunity is driven by a small but high-value cohort, a large operational gap, or a concentrated subset of high-cost patients.

### 3. Financial opportunity is disconnected from population actionability

Contract financial opportunity becomes more actionable when it is connected to population segments:

- Top 1%, 5%, and 10% high-cost patients.
- Patients with multiple chronic conditions.
- Patients with avoidable ED utilization.
- Patients with SNF utilization and extended length of stay.
- Patients not seen by their attributed provider in recent years.
- Patients with transportation or access barriers.

The proposed page connects financial performance to the “who” behind cost and utilization.

### 4. Users need a consistent pattern wherever lives/patients appear

The user should be able to click on lives or patient counts anywhere in the Contracts flow and land in the same reusable population insight experience.

Primary entry points:

- Contract detail page attributed lives.
- Contract scorecard domain KPI rows.
- Future contract opportunity, cohort, or financial priority panels.

---

## Why this matters

Value-based care performance is managed at the intersection of **financial accountability**, **clinical quality**, and **population actionability**. Contract leaders need to understand both the aggregate score and the patient-level drivers underneath it.

This experience matters because it helps users answer operational questions such as:

- Which patients are counted in this KPI?
- Which patients are keeping us from closing the gap?
- Are the high-cost patients also contributing to quality underperformance?
- How much cost is concentrated in the top 1%, 5%, and 10%?
- Are patients attributed to us but not being seen by primary care?
- Are access barriers or distance to care contributing to utilization?
- Which chronic condition clusters should care management prioritize?

By answering these questions inside the contract workflow, the app can better support contract management, population health operations, and targeted performance improvement.

---

## Expected improvement

### 1. Faster root-cause analysis

Users can move from KPI underperformance to denominator patients, gap patients, and population characteristics in one click.

Expected improvement:

- Less time interpreting scorecards manually.
- Faster identification of the patient segments driving poor performance.
- Better understanding of whether performance issues are denominator-size, gap-rate, access, condition-burden, or cost-concentration problems.

### 2. Better prioritization of interventions

The page will show patients with open KPI gaps, high-cost patients, chronic burden, utilization, and care-recency patterns together.

Expected improvement:

- More targeted outreach.
- Better prioritization of care management resources.
- Clearer connection between clinical actions and contract economics.

### 3. Stronger link between quality and financial performance

Quality KPIs can be viewed alongside total cost of care, PMPM, ED utilization, SNF utilization, and high-cost concentration.

Expected improvement:

- Leaders can understand how quality improvement may unlock savings or protect contract revenue.
- Financial opportunity becomes tied to specific patient populations rather than abstract dollars.

### 4. Reusable drill-down pattern across the Contracts flow

The same Contract Population page can serve contract lives, domain populations, KPI denominator patients, gap populations, high-cost populations, and future cohort/opportunity click-throughs.

Expected improvement:

- More consistent UX.
- Less duplicated implementation.
- Easier future expansion of contract population analytics.

---

## Confirmed MVP decisions

The initial MVP should include the following product decisions:

1. **Patient identity detail should be shown.**
   - Use synthetic names and MRNs from the existing population page data.

2. **Entry points should include both:**
   - Contract detail attributed lives.
   - Contract scorecard KPI rows.

3. **KPI patient counts should be generated from current scorecard metrics.**
   - The MVP can derive deterministic synthetic denominators from attributed lives, metric type, domain, and metric performance.

4. **Default KPI scope should show denominator/contributing patients.**
   - Users should also be able to quickly switch to patients with open or in-progress gaps for the same KPI.

5. **High-cost patient identity should be shown.**
   - List synthetic patient names/MRNs and their cost contribution.

6. **Distance should mean distance to attributed PCP/care site.**

7. **Seen-history should use attributed-provider or primary-care recency.**
   - Show seen within 1, 2, 3, 4, and 5 years, plus not seen in 5+ years if applicable.

8. **UX should combine executive summary and analyst drill-down.**
   - Executive cards and distributions at the top.
   - Patient tables and gap/high-cost views below.

---

## Proposed route and navigation model

### New reusable route

```text
app/contracts/[id]/population/page.tsx
```

### Supported URL examples

```text
/contracts/mssp-001/population
/contracts/mssp-001/population?scope=lives
/contracts/mssp-001/population?domain=quality_of_care
/contracts/mssp-001/population?domain=quality_of_care&metric=a1c_control
/contracts/mssp-001/population?domain=quality_of_care&metric=a1c_control&view=gaps
/contracts/mssp-001/population?domain=quality_of_care&metric=a1c_control&view=high_cost
```

### Entry points

#### Contract detail page

File:

```text
app/contracts/[id]/page.tsx
```

Make the attributed lives KPI clickable:

```text
4,820 lives → /contracts/mssp-001/population?scope=lives
```

#### Contract scorecard KPI rows

Files:

```text
app/contracts/[id]/scorecard/page.tsx
components/contracts/ScorecardDomainViews.tsx
components/contracts/AgreementDomainTableSection.tsx
components/contracts/AgreementAnalystTableView.tsx
components/contracts/AgreementMetricTable.tsx
```

Add a Patients column to KPI rows when contract context is available:

```text
1,482 patients → /contracts/mssp-001/population?domain=quality_of_care&metric=a1c_control
```

---

## Data and type design

### New type file

Create:

```text
types/contractPopulation.ts
```

Suggested model:

```ts
import type { AgreementDomainKey } from "@/types/agreementScorecard";

export type ContractPopulationScope = "contract" | "domain" | "metric";
export type ContractPopulationView = "overview" | "denominator" | "gaps" | "high_cost";

export interface ContractPopulationPatient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: string;
  zipCode: string;
  attributedProvider: string;
  distanceToCareMiles: number;
  chronicConditions: string[];
  chronicConditionCount: number;
  lastAttributedVisitYearsAgo: number;
  totalCostOfCare: number;
  pmpm: number;
  edVisits: number;
  snfAdmits: number;
  snfDays: number;
  hasOpenGap: boolean;
  relatedMetricIds: string[];
}

export interface ContractPopulationDistributionBucket {
  label: string;
  count: number;
  percent: number;
}

export interface ContractPopulationCostConcentrationTier {
  tier: "Top 1%" | "Top 5%" | "Top 10%";
  patientCount: number;
  totalCost: number;
  percentOfTotalCost: number;
}

export interface ContractPopulationSlice {
  contractId: string;
  scope: ContractPopulationScope;
  domainKey?: AgreementDomainKey;
  metricId?: string;
  label: string;
  description: string;
  totalPatients: number;
  denominatorPatients: ContractPopulationPatient[];
  gapPatients: ContractPopulationPatient[];
  highCostPatients: ContractPopulationPatient[];
  summary: {
    totalCostOfCare: number;
    pmpm: number;
    edVisitsPer1000: number;
    snfUtilizationPer1000: number;
    avgSnfLengthOfStay: number;
  };
  distributions: {
    age: ContractPopulationDistributionBucket[];
    sex: ContractPopulationDistributionBucket[];
    zip: ContractPopulationDistributionBucket[];
    distanceToCare: ContractPopulationDistributionBucket[];
    chronicConditions: ContractPopulationDistributionBucket[];
    chronicConditionBurden: ContractPopulationDistributionBucket[];
    seenHistory: ContractPopulationDistributionBucket[];
  };
  costConcentration: ContractPopulationCostConcentrationTier[];
}
```

### New data builder

Create:

```text
lib/contracts/contractPopulation.ts
```

Responsibilities:

- Reuse `getPopulationPatients()` from `lib/populationData.ts`.
- Reuse seeded synthetic patients and member identity where possible.
- Map synthetic patients into contract-specific population slices.
- Generate deterministic synthetic values for:
  - ZIP code.
  - Distance to attributed PCP/care site.
  - Chronic condition array and burden count.
  - Last attributed-provider visit recency.
  - Total cost of care.
  - PMPM.
  - ED visits.
  - SNF admits and SNF days.
  - KPI denominator membership.
  - KPI gap status.
- Compute aggregate distributions and summaries.
- Sort and expose high-cost patients.

### Deterministic generation

The synthetic generator should be deterministic by contract ID, domain key, metric ID, and patient ID so the same route produces the same result on refresh.

---

## Scorecard metric metadata

Update:

```text
types/agreementScorecard.ts
```

Add optional fields to `ScorecardMetric`:

```ts
populationCount?: number;
populationLabel?: string;
```

Then update:

```text
lib/agreementScorecardData.ts
```

to generate population counts from existing scorecard metrics and attributed lives.

Example denominator generation rules:

- **A1c Control**: diabetes prevalence × attributed lives.
- **Medication Adherence**: chronic-medication population estimate.
- **Colorectal Screening**: age-eligible adult population.
- **Breast Cancer Screening**: age/sex-eligible population.
- **Follow-up after ED**: subset with ED utilization.
- **Readmission/SNF metrics**: subset with admissions or post-acute utilization.

---

## Page UX design

### 1. Header and context

Show:

- Contract name.
- Payor and contract type/model.
- Selected population scope:
  - All attributed lives.
  - Domain population.
  - KPI denominator population.
- Selected domain and metric if present.
- Back links to:
  - Contract detail.
  - Contract scorecard.

### 2. Executive summary cards

Cards:

- Selected patients/lives.
- Total cost of care.
- PMPM.
- ED visits per 1,000.
- SNF admits per 1,000.
- Average SNF length of stay.

### 3. “Who is behind this KPI?”

Show distribution panels for:

- Age bands.
- Sex.
- ZIP code.
- Distance to attributed PCP/care site.
- Top chronic conditions.
- Chronic condition burden:
  - 0 conditions.
  - 1 condition.
  - 2 conditions.
  - 3 conditions.
  - 4+ conditions.
- Seen by attributed provider:
  - Within 1 year.
  - Within 2 years.
  - Within 3 years.
  - Within 4 years.
  - Within 5 years.
  - Not seen in 5+ years.

### 4. Cost concentration

Show:

- Top 1% patient count.
- Top 5% patient count.
- Top 10% patient count.
- Total spend in each tier.
- Percent of selected population cost in each tier.

Also show a high-cost patient table:

- Name.
- MRN.
- Age/Sex.
- ZIP.
- Attributed provider.
- Conditions.
- Total cost of care.
- PMPM.
- ED visits.
- SNF days.
- Last attributed-provider visit recency.

### 5. Analyst drill-down tabs

Use tab-like controls:

```text
Overview | Denominator Patients | Patients with Gaps | High-Cost Patients
```

Behavior:

- **Overview**: executive and distribution summary.
- **Denominator Patients**: all patients contributing to the selected denominator.
- **Patients with Gaps**: denominator patients with open or in-progress gap status for the selected KPI.
- **High-Cost Patients**: highest-cost patients within the selected population.

---

## Implementation sequence

### Phase 1: Documentation and data foundation

1. Create this markdown plan.
2. Add `types/contractPopulation.ts`.
3. Add `lib/contracts/contractPopulation.ts`.
4. Add tests for deterministic population slice generation if appropriate.

### Phase 2: Contract population page

1. Add `app/contracts/[id]/population/page.tsx`.
2. Render header, summary cards, distributions, cost concentration, and patient tables.
3. Support `scope`, `domain`, `metric`, and `view` query params.
4. Add empty/fallback state for unsupported draft contracts.

### Phase 3: Contract flow entry points

1. Link contract detail attributed lives to the population page.
2. Add patient-count column to contract scorecard KPI rows.
3. Pass `contractId` and `domainKey` through the scorecard component stack.
4. Add gap-view links from KPI rows where appropriate.

### Phase 4: Build validation and refinement

1. Run `npm run build`.
2. Validate contract detail click-through.
3. Validate contract scorecard KPI click-through.
4. Validate denominator, gap, and high-cost views.
5. Refine labels and copy for executive clarity.

---

## Success criteria

The solution is successful when:

- A user can click attributed lives on a contract detail page and land on a contract population page.
- A user can click a KPI patient count from the contract scorecard and land on a KPI-specific denominator population page.
- The page clearly explains who is in the selected population.
- The page shows demographic, geographic, chronic condition, visit recency, cost, and utilization insights.
- The user can switch between denominator patients, gap patients, and high-cost patients.
- High-cost patients are listed with synthetic identity details.
- The same route can be reused for future contract lives/patient/member click-throughs.
- `npm run build` passes.

---

## Future enhancements

After the MVP, this pattern could be expanded with:

- Filters by provider, ZIP, condition, risk tier, gap status, and cost tier.
- Patient-level action recommendations.
- Exportable population lists for care management.
- Comparison against contract benchmarks.
- Trend-over-time views for the selected denominator.
- Integration with SynapseAI recommendations for “why this population matters” and “what to do next.”
- Cohort creation from any filtered population slice.
