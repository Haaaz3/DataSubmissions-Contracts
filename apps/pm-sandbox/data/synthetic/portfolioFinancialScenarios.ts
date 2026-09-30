import { mockContracts } from "@/lib/mockData";
import { vbcFinancialSummary } from "@/lib/contracts/vbcFinancials";
import type { HdiObligationId } from "./healthIntelligenceObligations";

export interface FinancialScenario {
  year: number;
  downside: number;
  upside: number;
  projected: number;
  withActions: number;
}

// UI examples, not CMS payment formulas or customer forecasts. TEAM uses the
// user's illustrative ±$4M envelope. Non-VBC positions are explicit assumptions,
// not conversions of quality/readiness percentages or legacy recovery amounts.
// VBC is derived from the same contracts and settlement calculator as its detail.
// Scenarios assume distinct payment streams within the same program year;
// payment timing may differ. ASM deliberately has no financial model yet.
export const portfolioFinancialScenarios: Partial<Record<HdiObligationId, FinancialScenario>> = {
  "cms-team": { year: 2026, downside: -4_000_000, upside: 4_000_000, projected: -1_000_000, withActions: 500_000 },
  "vbc-contracts": vbcFinancialSummary(mockContracts),
  "mips-mvp": { year: 2026, downside: -2_000_000, upside: 800_000, projected: 300_000, withActions: 500_000 },
  "ma-stars": { year: 2026, downside: -1_400_000, upside: 2_800_000, projected: 600_000, withActions: 800_000 },
  "medicaid-vbp": { year: 2026, downside: -1_600_000, upside: 1_200_000, projected: -400_000, withActions: -100_000 },
  "hospital-quality": { year: 2026, downside: -1_000_000, upside: 0, projected: -250_000, withActions: -100_000 },
};
