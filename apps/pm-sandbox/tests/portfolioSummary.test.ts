import { mockContracts } from "../lib/mockData";
import { vbcFinancialSummary } from "../lib/contracts/vbcFinancials";
import { describe, expect, it } from "vitest";
import { hdiExecutiveMetrics, hdiObligations } from "../data/synthetic/healthIntelligenceObligations";
import { dollarAxisMaximum, nextProgramDeadline, portfolioForYear, portfolioMetricContext, portfolioRows, portfolioTotals } from "../lib/health-intelligence/portfolioSummary";

const vbc = vbcFinancialSummary(mockContracts);
describe("portfolio program summary", () => {
  it("reconciles the headline figures with the seven program rows", () => {
    const totals = portfolioTotals(hdiObligations);
    expect(totals).toEqual({ count: 7, risk: Math.abs(vbc.downside) + 8100000, opportunity: vbc.improvement + 3400000, currentBelow: 7, forecastBelow: 5, forecastMeets: 2, dueSoon: 7 });
    expect(hdiExecutiveMetrics.atRiskDollars).toBe(totals.risk);
    expect(hdiExecutiveMetrics.recoverableDollars).toBe(totals.opportunity);
    expect(hdiObligations.every(program => program.recoverableDollars <= program.atRiskDollars)).toBe(true);
  });
  it("separates the future ASM scenario from 2026 financial estimates", () => {
    const current = portfolioTotals(portfolioForYear("2026"));
    const future = portfolioTotals(portfolioForYear("2027"));
    expect(current).toMatchObject({ count: 6, risk: Math.abs(vbc.downside) + 7680000, opportunity: vbc.improvement + 3250000 });
    expect(future).toMatchObject({ count: 1, risk: 420000, opportunity: 150000 });
    expect(current.risk + future.risk).toBe(portfolioTotals(portfolioForYear("all")).risk);
  });
  it("sorts and filters without changing the portfolio totals or source order", () => {
    const ids = hdiObligations.map(p => p.id);
    const below = portfolioRows(hdiObligations, "below", "opportunity");
    expect(below).toHaveLength(5);
    expect(below[0].id).toBe("vbc-contracts");
    expect(portfolioRows(hdiObligations, "meets", "risk").map(p => p.id)).toEqual(["ma-stars", "hospital-quality"]);
    expect(portfolioRows(hdiObligations, "all", "deadline")[0].id).toBe("cms-team");
    expect(hdiObligations.map(p => p.id)).toEqual(ids);
    expect(dollarAxisMaximum(hdiObligations)).toBeGreaterThanOrEqual(Math.abs(vbc.downside));
  });
  it("keeps score units, readiness and absent work explicit", () => {
    expect(portfolioMetricContext["cms-team"].unit).toBe("pts");
    expect(portfolioMetricContext["mips-mvp"].unit).toBe("pts");
    expect(portfolioMetricContext["hospital-quality"].label).toBe("Submission readiness");
    expect(nextProgramDeadline({ ...hdiObligations[0], workItems: [] })).toBeNull();
    expect(portfolioRows(portfolioForYear("2027"), "meets", "risk")).toEqual([]);
    expect(portfolioTotals([])).toMatchObject({ count: 0, risk: 0, opportunity: 0, forecastBelow: 0 });
    expect(dollarAxisMaximum([])).toBe(500000);
  });
});
