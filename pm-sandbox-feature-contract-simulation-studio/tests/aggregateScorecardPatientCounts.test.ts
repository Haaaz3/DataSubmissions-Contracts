import { describe, expect, it } from "vitest";
import { buildContractScorecard, getAgreementScorecardForAgreement } from "@/lib/agreementScorecardData";
import { mockContractAgreements } from "@/lib/mockData";
import { buildPopulationInsightsHref } from "@/lib/navigation/populationHref";
import { buildScorecardRollup } from "@/lib/scorecards/rollups";
import { getPortfolioContracts } from "@/lib/scorecards/selectors";

describe("aggregate scorecard metric patient counts", () => {
  it("preserves aggregate gap-view metric context", () => {
    expect(
      buildPopulationInsightsHref({
        scope: "region",
        id: "Midwest",
        label: "Midwest",
        domain: "quality_of_care",
        metric: "preventive-closure",
        view: "gaps",
        source: "agreement-metric-gap-patients",
      })
    ).toBe(
      "/scorecards/population?scope=lives&domain=quality_of_care&metric=preventive-closure&view=gaps&source=agreement-metric-gap-patients&scopeType=region&scopeId=Midwest&scopeLabel=Midwest"
    );
  });

  it("sums market rollup metric populations from child contracts", () => {
    const allContracts = getPortfolioContracts({ agreements: mockContractAgreements });
    const marketId = allContracts.find((contract) => contract.market)?.market;
    expect(marketId).toBeDefined();

    const marketContracts = allContracts.filter((contract) => contract.market === marketId);
    const rollup = buildScorecardRollup({
      scopeType: "market",
      scopeId: marketId!,
      scopeLabel: marketId!,
      contracts: marketContracts,
    });

    const domainKey = "quality_of_care";
    const metricId = "quality-composite";
    const rollupMetric = rollup.domains
      .find((domain) => domain.key === domainKey)
      ?.metrics.find((metric) => metric.id === metricId);
    const expectedPopulation = marketContracts.reduce((sum, contract) => {
      const contractMetric = buildContractScorecard(contract).domains
        .find((domain) => domain.key === domainKey)
        ?.metrics.find((metric) => metric.id === metricId);
      return sum + (contractMetric?.populationCount ?? 0);
    }, 0);

    expect(rollupMetric?.populationCount).toBe(expectedPopulation);
    expect(rollupMetric?.populationCount).toBeGreaterThan(0);
  });

  it("sums agreement metric populations from included contracts", () => {
    const agreement = mockContractAgreements[0];
    const scorecard = getAgreementScorecardForAgreement(agreement.id);

    const domainKey = "quality_of_care";
    const metricId = "quality-composite";
    const agreementMetric = scorecard?.domains
      .find((domain) => domain.key === domainKey)
      ?.metrics.find((metric) => metric.id === metricId);
    const expectedPopulation = agreement.contracts.reduce((sum, contract) => {
      const contractMetric = buildContractScorecard(contract).domains
        .find((domain) => domain.key === domainKey)
        ?.metrics.find((metric) => metric.id === metricId);
      return sum + (contractMetric?.populationCount ?? 0);
    }, 0);

    expect(agreementMetric?.populationCount).toBe(expectedPopulation);
    expect(agreementMetric?.populationCount).toBeGreaterThan(0);
  });

  it("includes domains on contract child summaries", () => {
    const allContracts = getPortfolioContracts({ agreements: mockContractAgreements });
    const rollup = buildScorecardRollup({
      scopeType: "portfolio",
      scopeId: "enterprise",
      scopeLabel: "Portfolio",
      contracts: allContracts,
    });

    expect(rollup.children).toHaveLength(allContracts.length);
    rollup.children.forEach((child) => {
      expect(child.domains.length).toBeGreaterThan(0);
      expect(child.domains.map((domain) => domain.key)).toContain("quality_of_care");
      expect(child.domains.map((domain) => domain.key)).toContain("cost_management");
    });
  });

  it("includes domains on grouped child summaries", () => {
    const allContracts = getPortfolioContracts({ agreements: mockContractAgreements });
    const marketId = allContracts.find((contract) => contract.market)?.market;
    expect(marketId).toBeDefined();

    const marketContracts = allContracts.filter((contract) => contract.market === marketId);
    const rollup = buildScorecardRollup({
      scopeType: "portfolio",
      scopeId: "enterprise",
      scopeLabel: "Portfolio",
      contracts: allContracts,
      childGroups: [
        {
          id: marketId!,
          label: marketId!,
          scopeType: "market",
          contracts: marketContracts,
        },
      ],
    });

    expect(rollup.children[0]?.domains.length).toBeGreaterThan(0);
    expect(rollup.children[0]?.domains.map((domain) => domain.key)).toContain("quality_of_care");
    expect(rollup.children[0]?.domains.map((domain) => domain.key)).toContain("cost_management");
  });
});
