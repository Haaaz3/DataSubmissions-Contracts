# Contract Configuration Studio (MVP)

## Purpose
The Contract Configuration Studio allows teams to configure contract-specific KPI selection, targets, incentive rules, and financial terms without code changes.

## Route
- `app/contracts/[id]/configure/page.tsx`

## Core Capabilities (MVP)
- Select KPIs from a seeded catalog (`data/synthetic/kpiCatalog.ts`)
- Assign KPI role (`scored`, `monitored`, `gated`)
- Configure targets and weights per selected KPI
- Configure incentive rules:
  - fixed payout
  - tiered payout
  - per-unit payout
  - weighted pool
  - gate-based payout
- Configure contract-level financial terms:
  - quality gate toggle and threshold
  - incentive cap
  - downside cap
  - settlement frequency
- Review configuration with validation warnings and summary preview
- Save/reload draft configuration from local storage

## Key Files

### Types
- `types/contractConfiguration.ts`

### Data / Storage
- `data/synthetic/kpiCatalog.ts`
- `data/synthetic/contractConfigurations.ts`
- `lib/contracts/configurationDefaults.ts`
- `lib/contracts/configurationStorage.ts`

### Validation / Preview
- `lib/contracts/configurationValidation.ts`
- `lib/contracts/configurationPreview.ts`

### UI
- `components/contracts/ContractConfigurationBuilder.tsx`
- `components/contracts/ContractConfigurationSummaryRail.tsx`
- `components/contracts/ContractBasicsStep.tsx`
- `components/contracts/KpiCatalogSelectorStep.tsx`
- `components/contracts/ContractTargetsStep.tsx`
- `components/contracts/IncentiveRuleBuilderStep.tsx`
- `components/contracts/FinancialTermsStep.tsx`
- `components/contracts/ContractConfigurationReviewStep.tsx`

### Integration touchpoints
- `components/ContractListClient.tsx` (Configure link)
- `app/contracts/[id]/page.tsx` (Configure Contract CTA)

## Validation Rules (MVP)
- Contract basics required: name, payer, start date
- End date must not be earlier than start date
- At least one KPI must be selected
- Missing target configurations are flagged
- Target ordering should align with directionality
- Scored KPI weight total should be 100 (warning)
- Incentive rules must reference selected KPI IDs
- Quality gate requires threshold when enabled

## Known MVP Limitations
- Uses localStorage persistence only (no backend)
- Preview math is simplified and not final settlement logic
- No template management UI yet
- No formal publish/approval workflow yet
- No historical version timeline UI yet
