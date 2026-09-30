import { describe, expect, it } from "vitest";
import { hdiObligations } from "../data/synthetic/healthIntelligenceObligations";
import { portfolioFinancialScenarios } from "../data/synthetic/portfolioFinancialScenarios";
import { envelopePosition, financialSummary, improvement, signedMoney } from "../lib/health-intelligence/financialEnvelope";

describe("financial envelope", () => {
  it("nets projected settlements and derives improvement from the alternative outcome", () => {
    const total = financialSummary(hdiObligations.filter(p => p.id !== "ambulatory-specialty-model"), 2026)!;
    expect(total).toEqual({ year: 2026, count: 6, missing: 0, downside: -13500000, upside: 13800000, projected: -2150000, withActions: 1200000 });
    expect(improvement(total)).toBe(3350000);
    expect(total.projected + improvement(total)).toBe(total.withActions);
    expect(improvement(total)).not.toBe(total.upside - total.projected);
  });
  it("preserves the TEAM envelope and repayment-to-earnings scenario", () => {
    const team = portfolioFinancialScenarios["cms-team"]!;
    expect(team).toMatchObject({ downside: -4000000, upside: 4000000, projected: -1000000, withActions: 500000 });
    expect(improvement(team)).toBe(1500000);
    for (const scenario of Object.values(portfolioFinancialScenarios)) {
      expect(scenario.downside).toBeLessThanOrEqual(0);
      expect(scenario.upside).toBeGreaterThanOrEqual(0);
      expect(scenario.projected).toBeGreaterThanOrEqual(scenario.downside);
      expect(scenario.withActions).toBeGreaterThanOrEqual(scenario.projected);
      expect(scenario.withActions).toBeLessThanOrEqual(scenario.upside);
    }
  });
  it("does not turn missing financial models or other program years into zero settlements", () => {
    expect(financialSummary(hdiObligations, 2027)).toBeNull();
    expect(financialSummary([], 2026)).toBeNull();
    expect(financialSummary(hdiObligations, 2026)?.missing).toBe(1);
    expect(financialSummary([hdiObligations[0]], 2026)?.projected).toBe(-1000000);
  });
  it("positions asymmetric and one-sided ranges around the actual zero and formats signed dollars", () => {
    expect(envelopePosition(0, -1000000, 3000000)).toBe(25);
    expect(envelopePosition(-500000, -1000000, 0)).toBe(50);
    expect(envelopePosition(0, -1000000, 0)).toBe(100);
    expect(envelopePosition(0, 0, 0)).toBe(50);
    expect(signedMoney(-2150000)).toBe("−$2.15M");
    expect(signedMoney(1200000)).toBe("+$1.2M");
    expect(signedMoney(0)).toBe("$0");
  });
});
