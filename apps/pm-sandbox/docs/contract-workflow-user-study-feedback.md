# Contract Workflow User Study Feedback (Living Document)

Last updated: 2026-04-22
Owner: Product / Contract Performance
Status: Draft (living document)

---

## Purpose

Capture direct user-study feedback on Contract workflows and translate it into product decisions, UX direction, and prioritization guidance over the next few days.

---

## Study Feedback (Raw)

1. Contract Performance workflows are inherently financial insights. KPI values alone are insufficient; each KPI should show related dollar impact (example: ED Visits/1,000 should include impact and $ amount).
2. Agreements were introduced, but the contracts page portfolio status mix emphasizes contract counts. Need dollar impact for On Track vs At Risk vs Off Track.
3. Portfolio mix status labels need clear definitions (example: does At Risk mean within n% of break-even?).
4. Cost/utilization assumptions imply full claims access, but some payors do not share claims. This should affect confidence and prioritization.
5. Individual contract flow UX is inconsistent and forces users to parse too much information rather than skim.
6. “At Risk” can be confused with downside-risk contract constructs; need a clearer label.
7. Scorecard views should include $ impact:
   - max potential $
   - current performance $
   - distance to next threshold/target
   - impact of hitting next threshold (e.g., MA Star logic)
8. KPI target/threshold incentive design should include expected effort to close the gap; start with generic effort scale 0–10. Use effort to improve top-opportunity prioritization and ROI logic.

---

## Key Themes

1. **Financial-first interpretation is mandatory**
   - Users interpret contract performance as economic performance, not just KPI movement.
2. **Prioritization needs economics + effort + confidence**
   - “Biggest gap” is not always “best next action.”
3. **Status language must be unambiguous**
   - Current labels may conflict with contract risk terminology.
4. **Data availability must be visible in the experience**
   - Confidence and data completeness should be explicit and actionable.
5. **Skimmable, consistent page structure is needed**
   - Users need immediate answers: financial state, drivers, confidence, next best actions.

---

## Critical Evaluation (Harsh / Direct)

This section intentionally captures risks in blunt terms so we do not optimize around cosmetic fixes.

1. **Current experience is still KPI-browser-first, not decision-support-first**
   - The workflow appears to present metrics without consistently translating them into financial consequence, confidence, and actionability.
   - In practice, this forces users to do manual interpretation outside the product.

2. **Portfolio status mix can be decision-misleading if count-first**
   - Contract counts by status are easy to visualize but can hide true economic exposure.
   - A small number of off-track contracts may represent the majority of downside risk.

3. **Status language and logic are currently fragile**
   - “At Risk” is domain-confusing in a context where downside-risk contracts already exist.
   - If labels are not mathematically defined, they are decorative and can undermine trust.

4. **Data confidence is underrepresented relative to real data constraints**
   - If claims data is partial/missing for some payors, financially precise UI outputs can overstate confidence.
   - This is not just a UX issue; it is a product credibility risk.

5. **UX appears component-first rather than task-first**
   - Users report high cognitive load and inconsistent page parse patterns.
   - If users cannot skim to financial state, driver, confidence, and next action in seconds, workflow velocity remains poor.

**Bottom line:** Without these fixes, the product risks being perceived as polished analytics presentation rather than a credible operating system for contract performance decisions.

---

## Product Recommendations

### 1) KPI + Dollar Impact Pairing

For each major KPI, show:
- Current value
- Target value
- Variance
- Estimated PMPM impact
- Annualized $ impact
- Confidence level + data source

Example pattern:
- `ED Visits / 1,000: 307`
- `Variance: +27 vs target`
- `Estimated downside: -$1.2M annualized`
- `Confidence: Medium (partial claims)`

### 2) Portfolio Status Mix (Count + Dollar Weighted)

Show both:
- Contract count by status
- Dollar-weighted exposure/opportunity by status

Recommended financial framing:
- **On Track** = protected/realized value
- **Needs Attention** (or replacement label) = emerging downside pressure
- **Off Track** = active value leakage/downside exposure

### 3) Clear Status Definitions

Define explicit threshold logic in product docs + UI help text.

Initial draft (placeholder):
- **On Track**: projected settlement inside target range with acceptable buffer
- **Needs Attention / Performance Pressure**: projected settlement within configurable % of break-even/downside threshold
- **Off Track**: projected negative settlement or outside allowable variance band

### 4) Data Completeness & Confidence Model

Introduce a visible confidence model that affects ranking and recommendations.

Display:
- Data coverage type (full claims / partial claims / proxy / inferred)
- Confidence score/label (High/Medium/Low)
- Confidence-aware opportunity rank

Behavior:
- Lower-confidence opportunities can still be shown but should be deprioritized relative to similarly sized high-confidence opportunities.

### 5) Scorecards as Economic Scorecards

For each scorecard KPI/domain, show:
- Maximum potential incentive $
- Current earned incentive $
- Next threshold and distance to threshold
- Incremental $ unlock at next threshold
- For star-like logic: distance to next star + estimated $ impact

### 6) Effort-Aware Opportunity Ranking

Add an **Effort (0–10)** field for each KPI gap/opportunity.

Initial opportunity scoring concept:

`Opportunity Score = Expected $ Impact × Confidence ÷ Effort`

This enables:
- “Top ROI opportunities”
- Better sequencing of interventions
- More realistic planning discussions

### 7) UX Consistency and Skim-First IA

Standardize contract/agreement pages around a consistent hierarchy:
1. Financial headline (current vs target, net upside/downside)
2. Top 3 opportunities (impact, effort, confidence)
3. KPI + $ impact strip
4. Data confidence banner
5. Detail modules below fold

---

## Terminology Recommendations (Draft)

Potential replacements for **At Risk**:
- Needs Attention
- Performance Pressure
- Margin Pressure
- Watchlist
- Emerging Variance

Initial preference:
- **Needs Attention** (broadly understandable)
- **Performance Pressure** (more financially explicit)

Decision pending: align terminology with legal/contracting language and leadership reporting conventions.

---

## Key Persona: Population Health Leader

### Role Summary

Accountable for improving contract performance outcomes across quality, utilization, and financial metrics while coordinating cross-functional teams.

### Key Jobs to Be Done

1. Set enterprise population health strategy across contracts, service lines, and markets.
2. Decide where to allocate limited resources (human capital, program capacity, budget, and investment) for highest strategic and financial return.
3. Identify which contracts, agreements, populations, and measures are most material to overall health-system performance.
4. Balance short-term financial results with long-term quality, access, and population health outcomes.
5. Evaluate tradeoffs across competing opportunities and determine where intervention effort is justified by expected impact.
6. Translate contract performance into leadership decisions on staffing, care programs, partnerships, and capital allocation.
7. Hold cross-functional teams accountable for execution against highest-value priorities.

### Primary Challenges

1. Fragmented data across claims, quality, and operations systems.
2. KPI dashboards that do not map directly to dollars.
3. Variable data availability by payor.
4. Ambiguous status labels and non-standard scorecard semantics.
5. High cognitive load from inconsistent page structure and dense detail.

### Current Solutions / Workarounds

1. Spreadsheet-based reconciliation and tracking.
2. Ad hoc BI report pulls and analyst-built SQL outputs.
3. Manual finance + quality synthesis in slide decks.
4. Frequent cross-functional alignment meetings to determine priorities.

### Effort with Current Methods

Estimated effort today: **High**
- Often multiple analyst/operator days per reporting cycle.
- Manual synthesis required to connect KPI variance to financial implications.
- Rework required when claims are delayed/incomplete.

---

## Open Questions

1. What exact threshold definitions should govern status labels?
2. Should confidence be a discrete label, numeric score, or both?
3. How should we compute incremental $ at next threshold for each contract type?
4. What governance is needed for effort scoring consistency across teams?
5. Should we show projected vs realized dollars separately in all portfolio views?

---

## Near-Term Decisions (Next Few Days)

1. Decide replacement for “At Risk” label.
2. Finalize portfolio status definition thresholds.
3. Define MVP KPI+$ card template and confidence display.
4. Define scorecard incentive display schema (max/current/next-threshold/incremental).
5. Define effort scoring rubric (0–10) and initial owners.

---

## Prioritized Roadmap (MVP Sequence)

### Tier 1 — Must Fix Before Flow Expansion

1. **Define status logic mathematically**
   - Publish explicit threshold rules for each status state.
   - Decouple contract risk construct from performance state labels.

2. **Make data confidence and coverage visible**
   - Add data-source basis, completeness, and confidence labels to financial insights.
   - Ensure prioritization reflects confidence and not just impact size.

3. **Add KPI-to-financial consequence pairing**
   - For major KPIs, show variance + PMPM + annualized impact + confidence.

### Tier 2 — High-Value Structural Improvements

4. **Replace count-first portfolio mix with dollar-weighted management views**
   - Show both count and dollar exposure/opportunity by status.

5. **Upgrade scorecards to threshold economics**
   - Show current earned $, max potential $, distance to next threshold, incremental $ unlock.

### Tier 3 — Optimization / Prioritization Maturity

6. **Add effort-aware opportunity scoring**
   - Introduce effort (0–10) and confidence-aware ROI ranking.

7. **Standardize skim-first page anatomy across contract/agreement views**
   - Ensure consistent top-of-page hierarchy: financial state → confidence → opportunities → KPI+$ detail.

---

## MVP Framing (Do Not Boil the Ocean)

To avoid overbuilding:

- Start with top 3–5 KPIs and top portfolio views, not every metric.
- Use confidence labels first (High/Medium/Low) before introducing complex probabilistic models.
- Use simple effort scoring first (0–10) with governance notes, then improve calibration later.
- Prefer consistency of interaction model over breadth of one-off components.

---

## Change Log

- 2026-04-22: Initial draft created from user-study feedback + product recommendations.
- 2026-04-22: Added critical evaluation section, prioritized roadmap tiers, and MVP sequencing guidance.
