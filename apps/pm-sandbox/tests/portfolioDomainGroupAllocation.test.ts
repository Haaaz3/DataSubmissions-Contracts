import { describe, expect, it } from "vitest";
import { buildScorecardDomainGroups, type ScorecardDomainGroup } from "@/components/contracts/domainGroups";
import { allocatePortfolioDomainGroupValues } from "@/components/contracts/portfolioDomainGroupAllocation";
import { mockContractAgreements } from "@/lib/mockData";
import { buildScorecardRollup } from "@/lib/scorecards/rollups";
import { getPortfolioContracts, groupContractsByMarket } from "@/lib/scorecards/selectors";

function group(params: {
  key: ScorecardDomainGroup["key"];
  label: string;
  achievedDollars: number;
  potentialDollars: number;
}): ScorecardDomainGroup {
  return {
    key: params.key,
    label: params.label,
    domains: [],
    domainGroupScore: 0,
    achievedDollars: params.achievedDollars,
    potentialDollars: params.potentialDollars,
    remainingOpportunity: Math.max(0, params.potentialDollars - params.achievedDollars),
    domainCount: 0,
    metricCount: 0,
    populationCount: 0,
  };
}

describe("allocatePortfolioDomainGroupValues", () => {
  it("reconciles allocated group values to portfolio VBC totals", () => {
    const groups = [
      group({ key: "quality_group", label: "Quality Group", achievedDollars: 100, potentialDollars: 200 }),
      group({ key: "expense_group", label: "Expense Group", achievedDollars: 50, potentialDollars: 100 }),
    ];
    const allocated = allocatePortfolioDomainGroupValues({
      groups,
      netSettlement: 30,
      potentialSharedSavings: 700,
    });

    expect(allocated.reduce((sum, item) => sum + item.achievedDollars, 0)).toBe(180);
    expect(allocated.reduce((sum, item) => sum + item.potentialDollars, 0)).toBe(1000);
    expect(allocated.reduce((sum, item) => sum + item.remainingOpportunity, 0)).toBe(820);
  });

  it("allocates shared savings and settlement by budgeted incentive share", () => {
    const groups = [
      group({ key: "quality_group", label: "Quality Group", achievedDollars: 100, potentialDollars: 300 }),
      group({ key: "expense_group", label: "Expense Group", achievedDollars: 100, potentialDollars: 100 }),
    ];
    const allocated = allocatePortfolioDomainGroupValues({
      groups,
      netSettlement: -80,
      potentialSharedSavings: 400,
    });

    expect(allocated[0]).toMatchObject({
      allocatedNetSettlement: -60,
      allocatedSharedSavings: 300,
      achievedDollars: 40,
      potentialDollars: 600,
      remainingOpportunity: 560,
    });
    expect(allocated[1]).toMatchObject({
      allocatedNetSettlement: -20,
      allocatedSharedSavings: 100,
      achievedDollars: 80,
      potentialDollars: 200,
      remainingOpportunity: 120,
    });
  });

  it("falls back to an even split when groups have no budgeted incentive value", () => {
    const groups = [
      group({ key: "quality_group", label: "Quality Group", achievedDollars: 0, potentialDollars: 0 }),
      group({ key: "expense_group", label: "Expense Group", achievedDollars: 0, potentialDollars: 0 }),
    ];
    const allocated = allocatePortfolioDomainGroupValues({
      groups,
      netSettlement: 100,
      potentialSharedSavings: 200,
    });

    expect(allocated.map((item) => item.allocatedNetSettlement)).toEqual([50, 50]);
    expect(allocated.map((item) => item.allocatedSharedSavings)).toEqual([100, 100]);
    expect(allocated.reduce((sum, item) => sum + item.achievedDollars, 0)).toBe(100);
    expect(allocated.reduce((sum, item) => sum + item.potentialDollars, 0)).toBe(200);
    expect(allocated.reduce((sum, item) => sum + item.remainingOpportunity, 0)).toBe(100);
  });

  it("reconciles scorecard table row domain groups to row VBC totals", () => {
    const contracts = getPortfolioContracts({ agreements: mockContractAgreements });
    const childGroups = groupContractsByMarket(contracts).map((group) => ({
      ...group,
      scopeType: "market" as const,
    }));
    const rollup = buildScorecardRollup({
      scopeType: "portfolio",
      scopeId: "enterprise",
      scopeLabel: "Portfolio",
      contracts,
      childGroups,
    });
    const item = rollup.children[0];
    const domainGroups = buildScorecardDomainGroups(item.domains);
    const allocated = allocatePortfolioDomainGroupValues({
      groups: domainGroups,
      netSettlement: item.vbcEarnedDollars - item.achievedDollars,
      potentialSharedSavings: item.vbcPotentialDollars - item.potentialDollars,
    });

    expect(allocated.reduce((sum, groupItem) => sum + groupItem.achievedDollars, 0)).toBeCloseTo(item.vbcEarnedDollars);
    expect(allocated.reduce((sum, groupItem) => sum + groupItem.potentialDollars, 0)).toBeCloseTo(item.vbcPotentialDollars);
    expect(allocated.reduce((sum, groupItem) => sum + groupItem.remainingOpportunity, 0)).toBeCloseTo(item.remainingVbcOpportunity);
  });
});
