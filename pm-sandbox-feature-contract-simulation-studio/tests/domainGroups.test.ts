import { describe, expect, it } from "vitest";
import { buildScorecardDomainGroups } from "@/components/contracts/domainGroups";
import { mockContractAgreements } from "@/lib/mockData";
import { buildScorecardRollup } from "@/lib/scorecards/rollups";
import { getPortfolioContracts } from "@/lib/scorecards/selectors";
import type { AgreementDomainKey, ScorecardDomain, ScorecardMetric } from "@/types/agreementScorecard";

function metric(id: string, weight: number, populationCount: number): ScorecardMetric {
  return {
    id,
    label: id,
    description: "",
    unit: "percent",
    currentValue: 80,
    targetValue: 90,
    trendDirection: "up",
    trendPercent: 1,
    status: "on_track",
    currentStars: 4,
    targetStars: 4.5,
    achievedDollars: 0,
    potentialDollars: 0,
    weight,
    populationCount,
  };
}

function domain(params: {
  key: AgreementDomainKey;
  label: string;
  score: number;
  achievedDollars: number;
  potentialDollars: number;
  metrics: ScorecardMetric[];
}): ScorecardDomain {
  return {
    key: params.key,
    label: params.label,
    description: "",
    score: params.score,
    status: "on_track",
    trendDirection: "up",
    trendPercent: 1,
    executiveInsight: "",
    metrics: params.metrics,
    currentStars: 4,
    targetStars: 4.5,
    achievedDollars: params.achievedDollars,
    potentialDollars: params.potentialDollars,
  };
}

describe("buildScorecardDomainGroups", () => {
  it("builds metric-weighted group scores and financial totals", () => {
    const groups = buildScorecardDomainGroups([
      domain({
        key: "quality_of_care",
        label: "Quality of Care",
        score: 80,
        achievedDollars: 100,
        potentialDollars: 200,
        metrics: [metric("quality-1", 3, 100), metric("quality-2", 1, 50)],
      }),
      domain({
        key: "patient_experience",
        label: "Patient Experience",
        score: 90,
        achievedDollars: 50,
        potentialDollars: 100,
        metrics: [metric("experience-1", 2, 75)],
      }),
      domain({
        key: "utilization_efficiency",
        label: "Utilization Efficiency",
        score: 70,
        achievedDollars: 30,
        potentialDollars: 80,
        metrics: [metric("utilization-1", 1, 25)],
      }),
    ]);

    const qualityGroup = groups.find((group) => group.key === "quality_group");
    const expenseGroup = groups.find((group) => group.key === "expense_group");

    expect(qualityGroup).toMatchObject({
      label: "Quality Group",
      domainGroupScore: 83,
      achievedDollars: 150,
      potentialDollars: 300,
      remainingOpportunity: 150,
      domainCount: 2,
      metricCount: 3,
      populationCount: 225,
    });
    expect(expenseGroup).toMatchObject({
      label: "Expense Group",
      domainGroupScore: 70,
      achievedDollars: 30,
      potentialDollars: 80,
      remainingOpportunity: 50,
      domainCount: 1,
      metricCount: 1,
      populationCount: 25,
    });
  });

  it("hides groups with no present domains", () => {
    const groups = buildScorecardDomainGroups([
      domain({
        key: "quality_of_care",
        label: "Quality of Care",
        score: 80,
        achievedDollars: 100,
        potentialDollars: 200,
        metrics: [metric("quality-1", 1, 100)],
      }),
    ]);

    expect(groups.map((group) => group.key)).toEqual(["quality_group"]);
  });

  it("groups canonical scorecard domains into quality and expense groups", () => {
    const groups = buildScorecardDomainGroups([
      domain({
        key: "quality_of_care",
        label: "Quality of Care",
        score: 80,
        achievedDollars: 100,
        potentialDollars: 200,
        metrics: [metric("quality-1", 1, 100)],
      }),
      domain({
        key: "utilization_efficiency",
        label: "Utilization Efficiency",
        score: 75,
        achievedDollars: 80,
        potentialDollars: 160,
        metrics: [metric("utilization-1", 1, 100)],
      }),
      domain({
        key: "cost_management",
        label: "Cost Management",
        score: 78,
        achievedDollars: 90,
        potentialDollars: 180,
        metrics: [metric("cost-1", 1, 100)],
      }),
      domain({
        key: "patient_experience",
        label: "Patient Experience",
        score: 82,
        achievedDollars: 70,
        potentialDollars: 140,
        metrics: [metric("experience-1", 1, 100)],
      }),
      domain({
        key: "risk_adjustment",
        label: "Risk Adjustment",
        score: 79,
        achievedDollars: 60,
        potentialDollars: 120,
        metrics: [metric("risk-1", 1, 100)],
      }),
      domain({
        key: "documentation",
        label: "Documentation",
        score: 81,
        achievedDollars: 50,
        potentialDollars: 100,
        metrics: [metric("documentation-1", 1, 100)],
      }),
    ]);

    expect(groups.map((group) => group.label)).toEqual(["Quality Group", "Expense Group"]);
    expect(groups[0]?.domains.map((domainItem) => domainItem.label)).toEqual([
      "Quality of Care",
      "Patient Experience",
      "Risk Adjustment",
      "Documentation",
    ]);
    expect(groups[1]?.domains.map((domainItem) => domainItem.label)).toEqual([
      "Utilization Efficiency",
      "Cost Management",
    ]);
  });

  it("builds portfolio domain groups from contract rollup domains", () => {
    const contracts = getPortfolioContracts({ agreements: mockContractAgreements });
    const rollup = buildScorecardRollup({
      scopeType: "portfolio",
      scopeId: "enterprise",
      scopeLabel: "Portfolio",
      contracts,
    });
    const groups = buildScorecardDomainGroups(rollup.domains);

    expect(groups.map((group) => group.label)).toEqual(["Quality Group", "Expense Group"]);

    groups.forEach((group) => {
      expect(group.domainGroupScore).toBeGreaterThanOrEqual(0);
      expect(group.achievedDollars).toBeGreaterThanOrEqual(0);
      expect(group.potentialDollars).toBeGreaterThanOrEqual(group.achievedDollars);
      expect(group.remainingOpportunity).toBe(group.potentialDollars - group.achievedDollars);
    });
  });
});
