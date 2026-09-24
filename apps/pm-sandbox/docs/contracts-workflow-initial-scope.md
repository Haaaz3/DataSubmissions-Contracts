# Contracts Workflow Initial Scope

## Purpose

This document defines the initial scope for the Contracts workflow experiment. It is intended for client review and sign-off before engineering begins implementation.

The workflow helps users manage value-based care contracts from portfolio review through scorecard analysis and population-level investigation. The initial scope also includes a contract builder experience so users can define contract terms, measures, targets, and incentives in a structured way.

## In-Scope Experience

The initial experiment includes five primary experiences:

1. Contracts page
2. Portfolio scorecards page
3. Contract scorecard page
4. Contract population insights page
5. Contract builder experience

## 1. Contracts Page

The Contracts page is the main inventory and portfolio command center for value-based contracts.

### Included Features

- Contract inventory grouped by agreement, including contract name, payor, contract type, status, lives, quality performance, financial performance, and available value.
- Portfolio summary metrics showing total attributed lives, quality performance, PMPM performance, contract status mix, settlement exposure, and value capture.
- Visual portfolio breakdowns by market, payor, contract type, insurance segment, earned value, potential value, and annualized cost.
- Agreement-level summary rows with sorting by contract count, attributed lives, achieved dollars, potential dollars, and quality.
- Expandable agreement rows that expose the contracts under each agreement.
- Links from contracts and agreement summaries into detail views, contract scorecards, scorecard lenses, and population insights.
- Top financial priorities panel that highlights the most important value levers across contracts, opportunities, and scorecard domains.
- Quality-blocked savings panel that identifies potential upside blocked by quality gate performance.
- Support for draft contracts created in the experiment, displayed alongside seeded contracts.

### User Outcome

Users can quickly understand the overall contract portfolio, identify which agreements or contracts need attention, and navigate to the right deeper analysis.

## 2. Portfolio Scorecards Page

The Portfolio Scorecards page lets users evaluate contract performance across different business lenses.

### Included Features

- Portfolio-level rollup of all contracts, including seeded contracts and draft contracts.
- Lens selector for comparing performance by:
  - Region
  - Market
  - Payor
  - Insurance segment
  - Contract type
  - Agreement
  - Contract
- Scorecard comparison table for the selected lens.
- Ranking by financial opportunity, achieved value, budgeted value, expense, quality performance, and remaining opportunity.
- Optional bubble map view that visualizes where value, expense, and quality opportunity are concentrated.
- Quality-blocked lens card that highlights scorecard groups where financial upside may be constrained by quality performance.
- Supporting top value levers panel to help users interpret the ranking and decide where to act.
- Navigation back to the Contracts inventory.

### User Outcome

Users can compare performance across the portfolio and determine where contract value is concentrated or at risk.

## 3. Contract Scorecard Page

The Contract Scorecard page provides a focused performance view for an individual contract.

### Included Features

- Contract scorecard header with contract name, scorecard summary, achieved dollars, potential dollars, star rating, and opportunity indicators.
- Contract domain performance across value-based care domains such as quality of care, utilization efficiency, cost management, patient experience, risk adjustment, and documentation.
- Domain group view that summarizes related domains into grouped performance categories.
- Analyst table view for users who need a metric-by-metric breakdown.
- Metric rows that show performance, stars, achieved dollars, potential dollars, remaining opportunity, and patient population counts when available.
- Population drilldown links from metric patient counts into the Contract Population Insights page.
- Quality-blocked savings view for the selected contract when upside is constrained by quality gate performance.
- Back navigation to contract detail and portfolio scorecards.

### User Outcome

Users can understand why a specific contract is performing the way it is, which domains are driving value, and which measures or patient populations need follow-up.

## 4. Contract Population Insights Page

The Contract Population Insights page explains the people and cost drivers behind a contract, domain, or measure.

### Included Features

- Reusable population insights page for contract, scorecard, domain, and metric drilldowns.
- Summary header showing selected scope, represented lives, modeled records, contract count, and source context.
- Operational metric strip with covered lives, total expense impact, risk-adjusted PMPM, ED visits per 1,000, and SNF utilization per 1,000.
- Population composition panel with age, sex, and chronic burden breakdowns.
- Clinical burden and attribution recency panel showing top chronic conditions and attributed provider visit recency.
- Cost concentration workbench for high-expense patients, including top cost tiers such as top 1%, top 5%, top 10%, and all patients.
- Patient list views for:
  - Overview
  - Denominator patients
  - Patients with gaps
  - High-expense patients
- Synthetic patient detail including name, MRN, age, sex, ZIP, attributed provider, distance to care, chronic conditions, total expense, PMPM, ED visits, SNF utilization, and last attributed visit timing.
- Contract mix panel when a population slice includes multiple contracts.
- Navigation back to the originating contract or scorecard page.

### User Outcome

Users can move from aggregate contract performance to the specific patient groups, cost concentration, and care gaps that explain the result.

## 5. Contract Builder Experience

The Contract Builder experience allows users to create or configure the basic structure of a contract and define how performance, targets, and incentives should be measured.

This experience may appear as a new contract creation flow and/or as a configuration studio for an existing contract.

### Included Features

- Contract basics:
  - Contract name
  - Payer
  - Line of business
  - Contract type
  - Start date
  - End date
  - Performance year
  - Attribution method
  - Eligible population notes
- Basic financial and value-based care terms:
  - Benchmark PMPM
  - Target PMPM
  - Shared savings participation
  - Shared savings rate
  - Shared savings threshold
  - Shared savings cap
  - Quality gate threshold
  - Shared risk participation
  - Shared risk rate
  - Shared risk threshold
  - Downside risk cap
  - Population health budget
  - Settlement frequency
- Measure selection from a seeded KPI catalog.
- Measure role assignment:
  - Scored
  - Monitored
  - Gated
- Measure target configuration:
  - Target type
  - Target value
  - Baseline value where applicable
  - Weight for scored measures
  - Directionality-aware target handling
- Ability to define targets at the measure, domain, or domain group level.
- Ability to group measures into domains and domain groups for scorecard calculation and incentive modeling.
- Incentive rule builder supporting:
  - Fixed payout
  - Tiered payout
  - Per-unit payout
  - Weighted pool
  - Gate-based payout
- Ability to link incentive rules to selected measures.
- Ability to define incentives at the measure, domain, or domain group level.
- Tier configuration for tiered incentives, including tier label, threshold, and payout amount.
- Contract-level cap, floor, and gate settings.
- Review step with configuration summary, preview calculations, and validation warnings.
- Save draft capability for the experiment.

### User Outcome

Users can define the key commercial, clinical, and incentive logic needed to model a contract before it appears in the portfolio and scorecard workflow.

## Initial Workflow

1. User opens the Contracts page to review the portfolio.
2. User identifies a contract, agreement, or scorecard lens that needs attention.
3. User opens Portfolio Scorecards to compare performance across business dimensions.
4. User opens a Contract Scorecard to understand domain and measure-level performance.
5. User drills into Contract Population Insights to understand denominator patients, gap patients, and high-expense patients.
6. User creates or configures a contract in the Contract Builder, including terms, measures, targets, and incentives.
7. Draft contract data appears in the experiment and can be used for portfolio and scorecard exploration where supported.

## MVP Data and Persistence Assumptions

- The initial experiment may use seeded synthetic data for contracts, agreements, scorecards, measures, population slices, and patients.
- Draft contract and configuration data may be stored locally for the prototype experience.
- Patient identity data in the experiment will be synthetic.
- Preview calculations are directional and intended for scope validation, not final settlement adjudication.
- Engineering may refine field labels, ordering, and UI details while preserving the capabilities listed in this scope.

## Out of Scope for Initial Build

- Production backend persistence.
- Integration with claims, EMR, attribution, CRM, or contract management systems.
- Real patient data or PHI.
- Final settlement adjudication logic.
- Contract approval workflow.
- Version history and redlining for contract configuration changes.
- User roles, permissions, and audit logs.
- Template management for reusable contract structures.
- Export packages, formal reports, or regulatory submission artifacts.

## Client Sign-Off Statement

By signing off on this scope, the client confirms that engineering should begin building the initial Contracts workflow experiment around the experiences and capabilities listed above. Changes outside this scope may be considered for later phases after the initial experiment is validated.
