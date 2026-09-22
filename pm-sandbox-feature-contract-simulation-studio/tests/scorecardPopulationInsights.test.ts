import React from "react";
import { describe, expect, it } from "vitest";
import ContractPopulationPage from "@/app/contracts/[id]/population/page";
import ScorecardPopulationPage from "@/app/scorecards/population/page";
import { getAggregateContractPopulationSlice } from "@/lib/contracts/contractPopulation";
import { defaultFeatureFlags } from "@/lib/featureFlags";
import { buildPopulationInsightsHref } from "@/lib/navigation/populationHref";
import {
  getContractPopulationInsightsHref,
  getPopulationInsightsHref,
} from "@/lib/scorecards/populationNavigation";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe("scorecard population insight navigation", () => {
  it("keeps the secondary population patient list feature off by default", () => {
    expect(defaultFeatureFlags.sections.contractPopulationSecondaryPatientList).toBe(false);
    expect(defaultFeatureFlags.sections.contractPortfolioEarningsGateToWatch).toBe(false);
  });

  it("keeps contract lives on the contract population route", () => {
    expect(
      getContractPopulationInsightsHref({
        contractId: "ma-004",
        source: "scorecard-table-lives",
      })
    ).toBe("/contracts/ma-004/population?scope=lives&source=scorecard-table-lives");

    expect(
      getPopulationInsightsHref({
        scopeType: "contract",
        scopeId: "ma-004",
        scopeLabel: "MA Contract",
        lives: 4820,
        source: "scorecard-table-lives",
      })
    ).toBe("/contracts/ma-004/population?scope=lives&source=scorecard-table-lives");
  });

  it("routes aggregate lives to the scorecard population route", () => {
    expect(
      getPopulationInsightsHref({
        scopeType: "payor",
        scopeId: "Aetna Better Health",
        scopeLabel: "Aetna Better Health",
        lives: 12_000,
        source: "scorecard-table-lives",
      })
    ).toBe(
      "/scorecards/population?scope=lives&source=scorecard-table-lives&scopeType=payor&scopeId=Aetna+Better+Health&scopeLabel=Aetna+Better+Health"
    );

    expect(
      buildPopulationInsightsHref({
        scope: "portfolio",
        id: "enterprise",
        label: "Portfolio",
        source: "scorecard-summary-lives",
      })
    ).toBe(
      "/scorecards/population?scope=lives&source=scorecard-summary-lives&scopeType=portfolio&scopeId=enterprise&scopeLabel=Portfolio"
    );
  });

  it("preserves view, cost tier, engagement, metric, and domain query context", () => {
    expect(
      buildPopulationInsightsHref({
        scope: "market",
        id: "Ohio",
        label: "Ohio",
        domain: "cost_management",
        metric: "high-cost-concentration",
        view: "high_cost",
        costTier: "top_10",
        engageCount: 25,
        source: "scorecard-table-lives",
      })
    ).toBe(
      "/scorecards/population?scope=lives&domain=cost_management&metric=high-cost-concentration&view=high_cost&costTier=top_10&engageCount=25&source=scorecard-table-lives&scopeType=market&scopeId=Ohio&scopeLabel=Ohio"
    );
  });
});

describe("aggregate scorecard population slices", () => {
  it("combines scoped contracts into unique modeled patients with contract mix", () => {
    const slice = getAggregateContractPopulationSlice({
      scopeType: "portfolio",
      scopeId: "enterprise",
      scopeLabel: "Portfolio",
    });

    expect(slice).toBeDefined();
    expect(slice!.contractCount).toBeGreaterThan(1);
    expect(slice!.contractMix?.length).toBe(slice!.contractCount);
    expect(slice!.representedLives).toBeGreaterThanOrEqual(slice!.totalPatients);
    expect(slice!.costConcentration.map((tier) => tier.tier)).toEqual(["Top 1%", "Top 5%", "Top 10%"]);

    const ids = new Set(slice!.denominatorPatients.map((patient) => patient.id));
    expect(ids.size).toBe(slice!.denominatorPatients.length);
    expect(slice!.denominatorPatients.every((patient) => patient.sourceContractId)).toBe(true);
  });

  it("resolves an agreement scope with domain context", () => {
    const slice = getAggregateContractPopulationSlice({
      scopeType: "agreement",
      scopeId: "vbca-cms-population-health-enterprise",
      scopeLabel: "CMS Population Health Enterprise",
      domainKey: "quality_of_care",
    });

    expect(slice).toBeDefined();
    expect(slice!.scorecardScope?.type).toBe("agreement");
    expect(slice!.domainKey).toBe("quality_of_care");
    expect(slice!.label).toBe("Quality of Care population");
    expect(slice!.gapPatients.length).toBeLessThanOrEqual(slice!.denominatorPatients.length);
  });
});

describe("population insight routes", () => {
  it("returns the aggregate scorecard population page element", async () => {
    const page = await ScorecardPopulationPage({
      searchParams: Promise.resolve({
        scope: "lives",
        scopeType: "portfolio",
        scopeId: "enterprise",
        scopeLabel: "Portfolio",
        source: "scorecard-table-lives",
      }),
    });

    expect(page).toBeTruthy();
  });

  it("returns the contract population page element", async () => {
    const page = await ContractPopulationPage({
      params: Promise.resolve({ id: "ma-004" }),
      searchParams: Promise.resolve({
        scope: "lives",
        source: "scorecard-table-lives",
      }),
    });

    expect(page).toBeTruthy();
  });
});
