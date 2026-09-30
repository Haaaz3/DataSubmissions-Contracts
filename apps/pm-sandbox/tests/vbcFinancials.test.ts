import { describe, expect, it } from "vitest";
import { mockContracts } from "../lib/mockData";
import { portfolioFinancialScenarios } from "../data/synthetic/portfolioFinancialScenarios";
import { contractFinancials, costAmount, vbcFinancialSummary } from "../lib/contracts/vbcFinancials";
import type { Contract } from "../types/contract";

const example: Contract = {
  ...mockContracts[0], attributedLives: 1000, currentPmpm: 1100, targetPmpm: 1000, qualityScore: 60,
  opportunities: [{ title: "Cost", description: "Example", impactEstimate: { pmpmDelta: -200 } }, { title: "Overlapping cost", description: "Example", impactEstimate: { pmpmDelta: -100, qualityLiftPoints: 20 } }],
  vbcTerms: { performancePeriodStart: "2026-01-01", performancePeriodEnd: "2026-12-31", benchmarkPmpm: 1000, sharedSavings: true, sharedSavingsRate: 50, sharedSavingsThreshold: 1, sharedSavingsCap: 10, qualityGate: 70, sharedRisk: true, sharedRiskRate: 40, sharedRiskThreshold: 1, downsideRiskCap: 5, populationHealthBudget: 10000 },
};

describe("VBC financial reconciliation", () => {
  it("separates medical expense from settlement and reconciles the cost/quality bridge", () => {
    const result = contractFinancials(example);
    expect(result.memberMonths).toBe(12000);
    expect(result.current.actualSpend).toBe(13200000);
    expect(result.current.benchmarkSpend).toBe(12000000);
    expect(result.projected).toBe(-480000);
    expect(result.downside).toBe(-600000);
    expect(result.upside).toBe(1200000);
    expect(result.actionPmpm).toBe(900); // strongest intervention, not additive
    expect(result.withActions).toBe(600000);
    expect(result.improvement).toBe(1080000);
    expect(result.costImprovement).toBe(480000);
    expect(result.qualityImprovement).toBe(600000);
    expect(result.costImprovement + result.qualityImprovement).toBe(result.improvement);
  });
  it("keeps PMPM/PMPY conversions weighted by member months", () => {
    const two = { ...example, attributedLives: 3000, currentPmpm: 900 };
    const total = vbcFinancialSummary([example, two]);
    expect(total.memberMonths).toBe(48000);
    expect(total.actualSpend).toBe(45600000);
    expect(costAmount(total.actualSpend, total.memberMonths, "pmpm")).toBe(950);
    expect(costAmount(total.actualSpend, total.memberMonths, "pmpy")).toBe(11400);
    expect(costAmount(total.actualSpend, total.memberMonths, "annual")).toBe(45600000);
    expect(costAmount(0, 0, "pmpm")).toBe(0);
  });
  it("respects disabled sharing and does not invent an opportunity from unquantified work", () => {
    const result = contractFinancials({ ...example, opportunities: [], vbcTerms: { ...example.vbcTerms!, sharedRisk: false } });
    expect(result.projected).toBe(0);
    expect(result.downside).toBe(0);
    expect(result.improvement).toBe(0);
    const disabled = contractFinancials({ ...example, vbcTerms: { ...example.vbcTerms!, sharedSavings: false } });
    expect(disabled.upside).toBe(0);
    expect(disabled.withActions).toBe(0);
  });
  it("reconciles the enterprise, payer and contract scopes to the same settlements", () => {
    const total = vbcFinancialSummary(mockContracts);
    const payers = [...new Set(mockContracts.map(c => c.payor))].map(p => vbcFinancialSummary(mockContracts.filter(c => c.payor === p)));
    expect(total.lives).toBe(338000);
    expect(total.actualSpend).toBeGreaterThan(3e9);
    for (const field of ["actualSpend", "benchmarkSpend", "projected", "withActions", "downside", "upside", "improvement"] as const) {
      expect(payers.reduce((sum, p) => sum + p[field], 0)).toBeCloseTo(total[field]);
    }
    expect(portfolioFinancialScenarios["vbc-contracts"]?.projected).toBe(total.projected);
    expect(portfolioFinancialScenarios["vbc-contracts"]?.downside).toBe(total.downside);
    expect(total.projectedSharedSavings - total.projectedSharedLosses).toBeCloseTo(total.projected);
    expect(vbcFinancialSummary([]).projected).toBe(0);
  });
});
