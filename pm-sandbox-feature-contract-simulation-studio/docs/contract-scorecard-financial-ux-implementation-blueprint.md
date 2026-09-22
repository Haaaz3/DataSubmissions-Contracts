# Contract Scorecard Financial UX — File-by-File Implementation Blueprint

## Objective
Implement a stronger contract/agreement scorecard UX with:

- **MA Stars-aligned performance representation** (stars retained)
- **Default expanded domain sections** in Summary view
- **No default sort by value-at-stake**
- Two modes:
  - **Summary View** (default)
  - **Analyst Table View**

---

## 1) File change map (what to modify vs add)

### Modify

1. `types/agreementScorecard.ts`
   - Extend `ScorecardMetric`, `ScorecardDomain`, `ContractScorecard`, `AgreementScorecard` with star + financial fields.

2. `lib/agreementScorecardData.ts`
   - Populate new star and financial fields for domain and metric rows.
   - Add contract/agreement level financial rollup values.

3. `components/contracts/AgreementScorecardSummary.tsx`
   - Add financial summary KPIs (achieved, potential, blocked/unrealized optional).

4. `app/scorecards/contract/[id]/page.tsx`
   - Replace `AgreementDomainCard` mapping with view toggle + Summary/Analyst rendering.

5. `app/contracts/[id]/scorecard/page.tsx`
   - Same integration as above (parallel contract scorecard route).

6. `app/agreements/[id]/scorecard/page.tsx`
   - Replace domain cards with new Summary/Analyst experience.
   - Keep contributor and financial contribution sections below domain sections.

### Add

1. `components/contracts/StarRatingDisplay.tsx`
2. `components/contracts/ScorecardViewToggle.tsx`
3. `components/contracts/AgreementMetricTable.tsx`
4. `components/contracts/AgreementDomainTableSection.tsx`
5. `components/contracts/AgreementAnalystTableView.tsx`

### Keep but deprecate in scorecard routes

- `components/contracts/AgreementDomainCard.tsx`
- `components/contracts/AgreementMetricRow.tsx`

(Can be deleted once no consumers remain.)

---

## 2) Types/interfaces to add/extend

## File: `types/agreementScorecard.ts`

### Add helper types

```ts
export interface StarRatingValue {
  value: number;        // ex: 3.5
  max?: number;         // default 5
  label?: string;       // optional display text
}

export interface ScorecardFinancialValue {
  achievedDollars?: number;
  potentialDollars?: number;
  blockedDollars?: number;
}
```

### Extend `ScorecardMetric`

```ts
export interface ScorecardMetric {
  id: string;
  label: string;
  description: string;
  unit: AgreementMetricUnit;
  currentValue: number;
  targetValue: number;
  benchmarkValue?: number;
  trendDirection: TrendDirection;
  trendPercent: number;
  status: ScorecardMetricStatus;

  // new
  currentStars: number;
  targetStars: number;
  benchmarkStars?: number;
  currentlyAchievedLabel?: string;
  achievedDollars?: number;
  potentialDollars?: number;
  blockedDollars?: number;
}
```

### Extend `ScorecardDomain`

```ts
export interface ScorecardDomain {
  key: AgreementDomainKey;
  label: string;
  description: string;
  weight: number;
  score: number;
  status: ScorecardMetricStatus;
  trendDirection: TrendDirection;
  trendPercent: number;
  executiveInsight: string;
  metrics: ScorecardMetric[];

  // new
  currentStars: number;
  targetStars: number;
  benchmarkStars?: number;
  achievedDollars: number;
  potentialDollars: number;
  blockedDollars?: number;
  currentlyAchievedSummary?: string;
}
```

### Extend top-level scorecard objects

```ts
export interface ContractScorecard {
  contractId: string;
  contractName: string;
  payor: string;
  asOfDate: string;
  overallScore: number;
  status: ContractStatus;
  headline: string;
  domains: ScorecardDomain[];

  // new
  achievedDollars?: number;
  potentialDollars?: number;
  blockedDollars?: number;
}

export interface AgreementScorecard {
  agreementId: string;
  agreementName: string;
  payors: string[];
  asOfDate: string;
  overallScore: number;
  status: ContractStatus;
  headline: string;
  totalAttributedLives: number;
  contractsCount: number;
  qualityRollup: number;
  domains: ScorecardDomain[];
  contributors: AgreementScorecardContributor[];

  // new
  achievedDollars?: number;
  potentialDollars?: number;
  blockedDollars?: number;
}
```

---

## 3) New component contracts (exact props)

## File: `components/contracts/StarRatingDisplay.tsx`

```ts
interface StarRatingDisplayProps {
  value: number;
  max?: number; // default 5
  showNumeric?: boolean;
  size?: "sm" | "md";
  muted?: boolean;
}
```

Purpose:
- Standard star rendering across summary and analyst tables.
- Display style aligned with MA Stars familiarity.

---

## File: `components/contracts/ScorecardViewToggle.tsx`

```ts
export type ScorecardViewMode = "summary" | "analyst";

interface ScorecardViewToggleProps {
  value: ScorecardViewMode;
  onChange: (value: ScorecardViewMode) => void;
}
```

Behavior:
- Default selected mode should be `summary`.

---

## File: `components/contracts/AgreementMetricTable.tsx`

```ts
import type { ScorecardMetric } from "@/types/agreementScorecard";

interface AgreementMetricTableProps {
  metrics: ScorecardMetric[];
  compact?: boolean;
  showDomainColumn?: boolean;
  domainLabel?: string;
}
```

Summary-mode columns:
- Metric
- Current Performance (stars)
- Target (stars)
- Benchmark (stars)
- Currently Achieved
- Total Potential Dollars
- Trend
- Status

---

## File: `components/contracts/AgreementDomainTableSection.tsx`

```ts
import type { ScorecardDomain } from "@/types/agreementScorecard";

interface AgreementDomainTableSectionProps {
  domain: ScorecardDomain;
  defaultExpanded?: boolean; // default true
}
```

Behavior:
- Render domain summary row + expanded metric table.
- Section should be expanded by default.

Domain header fields:
- Domain label
- Status + trend
- Current / target / benchmark stars
- Achieved dollars
- Potential dollars
- one-line executive insight

---

## File: `components/contracts/AgreementAnalystTableView.tsx`

```ts
import type { ScorecardDomain } from "@/types/agreementScorecard";

interface AgreementAnalystTableViewProps {
  domains: ScorecardDomain[];
}
```

Analyst columns:
- Domain
- Metric
- Current Stars
- Target Stars
- Benchmark Stars
- Currently Achieved
- Potential Dollars
- Gap to Target
- Trend
- Status

Behavior:
- Preserve domain input order by default.
- **No default sort by value-at-stake**.

---

## 4) Container/page integration blueprint

## `app/scorecards/contract/[id]/page.tsx`

### Replace
- Existing `AgreementDomainCard` grid.

### With
1. local view mode state (`summary` default)
2. `ScorecardViewToggle`
3. conditional rendering:
   - `summary`: map domains to `AgreementDomainTableSection defaultExpanded`
   - `analyst`: single `AgreementAnalystTableView`

---

## `app/contracts/[id]/scorecard/page.tsx`

Apply same structure as above.

---

## `app/agreements/[id]/scorecard/page.tsx`

Apply same domain section swap and view toggle.

Keep existing sections below domain rendering:
- contributors table
- financial insight cards
- financial contribution table

---

## 5) Data changes blueprint (`lib/agreementScorecardData.ts`)

### `buildMetric(...)`
Augment generated metric object with:
- stars values (current/target/benchmark)
- achieved/potential dollars
- achieved label text

Suggested helper functions to add:

```ts
function toStars(value: number, unit: AgreementMetricUnit, target: number, benchmark?: number): {
  currentStars: number;
  targetStars: number;
  benchmarkStars?: number;
}

function estimateMetricDollars(params: {
  contractId: string;
  domainKey: AgreementDomainKey;
  metricId: string;
  currentValue: number;
  targetValue: number;
  benchmarkValue?: number;
}): {
  achievedDollars: number;
  potentialDollars: number;
  blockedDollars?: number;
};
```

### Domain rollups
When building each domain:
- sum metric dollars into domain fields
- derive domain star summary (weighted average or direct conversion)

### Top-level rollups
For contract/agreement scorecards:
- roll up domain totals to `achievedDollars`, `potentialDollars`, `blockedDollars`

---

## 6) Replace/deprecate guidance

### `AgreementDomainCard.tsx`
- Remove from contract/agreement scorecard pages.
- Keep temporarily if used in payor/region/market rollups until they are migrated.

### `AgreementMetricRow.tsx`
- Not needed in new table-based views.
- Keep only if older pages still depend on it.

---

## 7) UX behaviors to lock in

1. Default view = `summary`
2. Domain sections default expanded = `true`
3. Domain order = source order from scorecard data
4. No default value-at-stake sorting
5. Stars retained as primary shorthand (MA Star alignment)

---

## 8) Suggested implementation sequence

1. Extend `types/agreementScorecard.ts`
2. Update `lib/agreementScorecardData.ts` field generation/rollups
3. Add `StarRatingDisplay.tsx`
4. Add `ScorecardViewToggle.tsx`
5. Add `AgreementMetricTable.tsx`
6. Add `AgreementDomainTableSection.tsx`
7. Add `AgreementAnalystTableView.tsx`
8. Integrate into:
   - `app/scorecards/contract/[id]/page.tsx`
   - `app/contracts/[id]/scorecard/page.tsx`
   - `app/agreements/[id]/scorecard/page.tsx`
9. Deprecate/remove `AgreementDomainCard` and `AgreementMetricRow` where no longer used.

---

## 9) Done criteria

- Summary and Analyst views both exist.
- Summary view loads by default.
- Domain sections are expanded by default.
- Stars shown for current/target/benchmark.
- Currently achieved and total potential dollars shown per metric and domain.
- No default value-at-stake sort applied.
- Existing contributor/economic sections remain intact in agreement scorecard page.
