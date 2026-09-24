import { describe, expect, it } from "vitest";
import { seededContractConfigurations } from "@/data/synthetic/contractConfigurations";
import { getMeasureActionInsightById } from "@/data/synthetic/measureActionInsights";
import { buildContractScorecard, getAgreementScorecardForAgreement } from "@/lib/agreementScorecardData";
import { calculateEstimatedSettlement } from "@/lib/contracts/settlement";
import { mockContractAgreements, mockContracts } from "@/lib/mockData";

const pmpmRangeByContractType = {
  MSSP: { min: 700, max: 1_150 },
  "Medicare Advantage": { min: 900, max: 1_450 },
  Commercial: { min: 300, max: 650 },
} as const;

const measureInsightIds = [
  "a1c-control",
  "bp-control",
  "colorectal-screen",
  "flu-shot",
  "statin-adherence",
  "breast-screen",
  "followup-hosp",
  "copd-controller",
  "ed-avoidance",
] as const;

function expectFinancialValuesToBeCoherent(scopeLabel: string, values: {
  achievedDollars?: number;
  potentialDollars?: number;
  blockedDollars?: number;
}) {
  const achieved = values.achievedDollars ?? 0;
  const potential = values.potentialDollars ?? 0;
  const blocked = values.blockedDollars ?? 0;

  expect(achieved, `${scopeLabel}: achieved should be non-negative`).toBeGreaterThanOrEqual(0);
  expect(potential, `${scopeLabel}: potential should be non-negative`).toBeGreaterThanOrEqual(0);
  expect(blocked, `${scopeLabel}: blocked should be non-negative`).toBeGreaterThanOrEqual(0);
  expect(achieved, `${scopeLabel}: achieved should not exceed potential`).toBeLessThanOrEqual(potential);
  expect(blocked, `${scopeLabel}: blocked should not exceed remaining opportunity`).toBeLessThanOrEqual(
    Math.max(0, potential - achieved)
  );
}

describe("contract mock data realism", () => {
  it("keeps PMPM values, quality scores, ED rates, and intervention budgets in reviewer-believable ranges", () => {
    mockContracts.forEach((contract) => {
      const range = pmpmRangeByContractType[contract.contractType];
      expect(contract.currentPmpm, `${contract.id}: current PMPM`).toBeGreaterThanOrEqual(range.min);
      expect(contract.currentPmpm, `${contract.id}: current PMPM`).toBeLessThanOrEqual(range.max);
      expect(contract.targetPmpm, `${contract.id}: target PMPM`).toBeGreaterThanOrEqual(range.min);
      expect(contract.targetPmpm, `${contract.id}: target PMPM`).toBeLessThanOrEqual(range.max);
      expect(contract.qualityScore, `${contract.id}: quality score`).toBeGreaterThanOrEqual(0);
      expect(contract.qualityScore, `${contract.id}: quality score`).toBeLessThanOrEqual(100);
      expect(contract.edVisitsPer1000, `${contract.id}: ED visits per 1,000`).toBeGreaterThanOrEqual(150);
      expect(contract.edVisitsPer1000, `${contract.id}: ED visits per 1,000`).toBeLessThanOrEqual(450);

      if (contract.vbcTerms) {
        const annualSpend = contract.currentPmpm * contract.attributedLives * 12;
        const budgetShare = contract.vbcTerms.populationHealthBudget / annualSpend;
        expect(budgetShare, `${contract.id}: population health budget share`).toBeGreaterThanOrEqual(0.004);
        expect(budgetShare, `${contract.id}: population health budget share`).toBeLessThanOrEqual(0.012);
      }
    });
  });

  it("keeps settlement estimates within contractual savings and downside caps", () => {
    mockContracts.forEach((contract) => {
      const settlement = calculateEstimatedSettlement(contract);
      const savingsCapAmount = settlement.benchmarkSpend * (settlement.terms.sharedSavingsCap / 100);
      const downsideCapAmount = settlement.benchmarkSpend * (settlement.terms.downsideRiskCap / 100);

      if (settlement.estimatedAmount > 0) {
        expect(settlement.estimatedAmount, `${contract.id}: savings cap`).toBeLessThanOrEqual(savingsCapAmount);
        expect(settlement.estimatedAmount, `${contract.id}: cannot exceed gross savings`).toBeLessThanOrEqual(
          Math.max(0, settlement.grossDeltaAmount)
        );
      }

      if (settlement.estimatedAmount < 0) {
        expect(Math.abs(settlement.estimatedAmount), `${contract.id}: downside cap`).toBeLessThanOrEqual(downsideCapAmount);
        expect(Math.abs(settlement.estimatedAmount), `${contract.id}: cannot exceed gross loss`).toBeLessThanOrEqual(
          Math.abs(Math.min(0, settlement.grossDeltaAmount))
        );
      }
    });
  });

  it("keeps scorecard achieved, potential, and blocked dollars internally consistent", () => {
    mockContracts.forEach((contract) => {
      const scorecard = buildContractScorecard(contract);
      expectFinancialValuesToBeCoherent(`${contract.id} scorecard`, scorecard);

      scorecard.domains.forEach((domain) => {
        expectFinancialValuesToBeCoherent(`${contract.id}/${domain.key}`, domain);
        domain.metrics.forEach((metric) => {
          expectFinancialValuesToBeCoherent(`${contract.id}/${domain.key}/${metric.id}`, metric);
        });
      });
    });

    mockContractAgreements.forEach((agreement) => {
      const scorecard = getAgreementScorecardForAgreement(agreement.id);
      expect(scorecard).toBeDefined();
      expectFinancialValuesToBeCoherent(`${agreement.id} scorecard`, scorecard!);

      scorecard!.domains.forEach((domain) => {
        expectFinancialValuesToBeCoherent(`${agreement.id}/${domain.key}`, domain);
        domain.metrics.forEach((metric) => {
          expectFinancialValuesToBeCoherent(`${agreement.id}/${domain.key}/${metric.id}`, metric);
        });
      });
    });
  });

  it("models risk-adjustment opportunities as revenue lift rather than cost reduction", () => {
    const riskAdjustmentOpportunity = mockContracts
      .flatMap((contract) => contract.opportunities)
      .find((opportunity) => opportunity.title === "Recover RAF accuracy through coding improvement");

    expect(riskAdjustmentOpportunity?.impactEstimate?.pmpmDelta).toBeUndefined();
    expect(riskAdjustmentOpportunity?.impactEstimate?.revenueLiftPmpm).toBeGreaterThan(0);
  });

  it("keeps measure action financial tiers monotonic and bounded by max incentive", () => {
    measureInsightIds.forEach((measureId) => {
      const insight = getMeasureActionInsightById(measureId);
      expect(insight, `${measureId}: insight exists`).toBeTruthy();
      const model = insight!.financialModel;
      expect(model, `${measureId}: financial model exists`).toBeTruthy();
      expect(model!.currentPerformanceImpact, `${measureId}: current impact <= max`).toBeLessThanOrEqual(model!.maxIncentive);

      let previousTotal = model!.currentPerformanceImpact;
      model!.tiers.forEach((tier) => {
        expect(tier.incrementalImpact, `${measureId}/${tier.id}: incremental non-negative`).toBeGreaterThanOrEqual(0);
        expect(tier.totalImpactAtTier, `${measureId}/${tier.id}: tier total monotonic`).toBeGreaterThanOrEqual(previousTotal);
        expect(tier.totalImpactAtTier, `${measureId}/${tier.id}: tier total <= max`).toBeLessThanOrEqual(model!.maxIncentive);
        const allocated = tier.contracts.reduce((sum, contract) => sum + contract.impact, 0);
        expect(allocated, `${measureId}/${tier.id}: contract split equals incremental impact`).toBe(tier.incrementalImpact);
        previousTotal = tier.totalImpactAtTier;
      });
    });
  });

  it("aligns seeded contract configuration names and PMPM targets with matching visible mock contracts", () => {
    const configById = new Map(seededContractConfigurations.map((config) => [config.contractId, config]));
    const contractById = new Map(mockContracts.map((contract) => [contract.id, contract]));
    const pmpmSelectionCatalogId = "kpi-total-cost-pmpm";

    seededContractConfigurations.forEach((config) => {
      const contract = contractById.get(config.contractId);
      expect(contract, `${config.contractId}: mock contract exists`).toBeDefined();
      expect(config.basics.name).toBe(contract!.name);
      expect(config.basics.payer).toBe(contract!.payor);

      const pmpmSelection = config.selectedMetrics.find((selection) => selection.kpiCatalogItemId === pmpmSelectionCatalogId);
      if (!pmpmSelection) return;

      const pmpmTarget = config.metricTargets.find((target) => target.contractMetricSelectionId === pmpmSelection.id);
      expect(pmpmTarget?.baselineValue, `${config.contractId}: PMPM baseline`).toBe(contract!.currentPmpm);
      expect(pmpmTarget?.targetValue, `${config.contractId}: PMPM target`).toBe(contract!.targetPmpm);
    });

    expect(configById.size).toBeGreaterThan(0);
  });
});