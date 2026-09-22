# Contract Portfolio Merged Wireframe (Strategic Command Center)

## Objective

Provide a single landing-page information architecture that supports the Population Health Leader’s core jobs:

1. Set enterprise strategy across contracts and markets.
2. Allocate constrained resources (people, budget, investment) to highest-impact opportunities.
3. Identify material drivers of financial performance.
4. Balance short-term recovery with long-term quality and population outcomes.
5. Make confidence-aware decisions and hold owners accountable.

---

## Merged Concept Sources

- **Concept 02 (Exposure Board):** structural foundation for materiality and allocation.
- **Concept 05 (Executive Briefing):** narrative and leadership decision framing.
- **Concept 01 (Financial Command Center):** KPI-to-$ translation layer.
- **Concept 03 (Opportunity Workbench):** effort/capacity-aware prioritization panel.
- **Concept 04 (Confidence-First):** confidence and data-coverage lens as modifier layer.

---

## Information Flow (Top → Bottom)

1. **State** — portfolio financial position now.
2. **Narrative** — what changed and why.
3. **Decision** — leadership actions this cycle.
4. **Materiality** — where downside/upside is concentrated.
5. **Drivers** — top KPI-to-$ impacts.
6. **Tradeoffs** — what to fund, what to deprioritize.
7. **Prioritization** — ranked opportunities with effort/confidence.
8. **Confidence** — data quality and decision readiness.
9. **Accountability** — owners, milestones, review cadence.

---

## Section-by-Section Wireframe

### 1) Header + Scope Controls

**Components**
- Page title: `Contract Performance Portfolio — Strategic Command Center`
- Time horizon: Month / Quarter / YTD / Annualized
- Scope controls: Portfolio / Agreement / Payor / Market / Service line
- Filter chips: Status, Confidence, Contract type, Population segment
- Data freshness timestamp

**Design intent**
- Establish decision context before interpretation.

### 2) Executive State Hero Band

**Cards (4–5)**
- Projected net settlement (with delta vs prior period)
- Total downside exposure (with concentration in top 3)
- Recoverable upside (if top opportunities execute)
- High-confidence actionable value
- Lives in pressure/off-track contracts

**Design intent**
- 5-second strategic orientation with explicit confidence signal.

### 3) Executive Narrative + What Changed

**Left panel: Executive narrative**
- 2–3 sentence summary of state, primary drivers, implications.

**Right panel: What changed since last review**
- Biggest improving area
- Biggest worsening area
- New risk/opportunity
- Net movement vs prior period

**Design intent**
- Convert KPI noise into leadership context.

### 4) Leadership Decisions This Cycle

**Decision table columns**
- Decision
- Why now
- Expected $ impact
- Resource requirement
- Confidence
- Owner
- Status (Approve / Monitor / Defer)

**Design intent**
- Promote explicit decisions instead of passive insight consumption.

### 5) Materiality & Exposure Board

**Primary scan columns**
- Agreement/Payor
- Net exposure
- Confidence
- Strategic priority tag
- Top driver
- Recommended action
- Trend

**Expandable details**
- Upside/downside split
- Lives
- Quality gate risk
- KPI deltas

**Design intent**
- Show where resource shifts can produce most financial impact.

### 6) Top 3 Financial Drivers (KPI → $)

For each of top 3 drivers:
- KPI current value
- Target/threshold
- Variance
- PMPM impact
- Annualized impact
- Confidence
- Distance to next threshold + incremental $ unlock

**Design intent**
- Keep KPI detail anchored to financial consequence.

### 7) Tradeoffs & Resource Allocation

**Left:** proposed reallocations (people/budget/program capacity)

**Right:** what gets deprioritized / delayed and strategic impact

**Design intent**
- Force explicit tradeoff thinking under constrained capacity.

### 8) Opportunity Prioritization Panel

Columns:
- Opportunity
- Expected $
- Confidence
- Effort (0–10)
- Time-to-impact
- Strategic tag
- Owner

Sort modes:
- Biggest recovery
- Best ROI
- Fastest payback
- Strategic priority

**Design intent**
- Support tactical sequencing after strategic direction is clear.

### 9) Confidence & Data Coverage (Lens Layer)

Display:
- Full / partial / proxy coverage percentages
- Blocked decisions due to missing data
- Top data gaps and mitigation actions

**Design intent**
- Preserve trust while keeping confidence as a decision modifier.

### 10) Accountability Footer

Columns:
- Initiative
- Executive sponsor
- Operational owner
- Next milestone date
- Success metric
- Review cadence

**Design intent**
- Close loop from strategy to execution accountability.

---

## UX Guardrails

1. Keep top of page strategic; push dense analytics below fold.
2. Always pair KPI with financial consequence.
3. Use confidence as a modifier, not the primary hierarchy.
4. Default sort by materiality (net exposure), not contract count.
5. Require explicit action owner and review date for each top decision.
