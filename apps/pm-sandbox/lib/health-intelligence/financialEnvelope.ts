import type { HdiObligation } from "@/data/synthetic/healthIntelligenceObligations";
import { portfolioFinancialScenarios, type FinancialScenario } from "@/data/synthetic/portfolioFinancialScenarios";
import { portfolioMoney } from "./portfolioSummary";

export function financialSummary(programs: HdiObligation[], year: number) {
  const scenarios = programs.flatMap(program => {
    const scenario = portfolioFinancialScenarios[program.id];
    return scenario?.year === year ? [scenario] : [];
  });
  if (!scenarios.length) return null;
  return {
    year,
    count: scenarios.length,
    missing: programs.length - scenarios.length,
    downside: scenarios.reduce((sum, scenario) => sum + scenario.downside, 0),
    upside: scenarios.reduce((sum, scenario) => sum + scenario.upside, 0),
    projected: scenarios.reduce((sum, scenario) => sum + scenario.projected, 0),
    withActions: scenarios.reduce((sum, scenario) => sum + scenario.withActions, 0),
  };
}

export const signedMoney = (value: number) => `${value < 0 ? "−" : value > 0 ? "+" : ""}${portfolioMoney(Math.abs(value))}`;
export const improvement = (scenario: FinancialScenario) => scenario.withActions - scenario.projected;

export function envelopePosition(value: number, minimum: number, maximum: number) {
  return maximum > minimum ? Math.max(0, Math.min(100, (value - minimum) / (maximum - minimum) * 100)) : 50;
}
