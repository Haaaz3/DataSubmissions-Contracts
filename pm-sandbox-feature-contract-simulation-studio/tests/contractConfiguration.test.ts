import { describe, expect, it } from "vitest";
import { createDefaultContractConfiguration } from "@/lib/contracts/configurationDefaults";
import { getContractConfigurationPreview } from "@/lib/contracts/configurationPreview";
import { validateContractConfiguration } from "@/lib/contracts/configurationValidation";

describe("contract configuration validation", () => {
  it("flags required basics fields when empty", () => {
    const config = createDefaultContractConfiguration("test-contract");
    const issues = validateContractConfiguration(config);
    expect(issues.some((issue) => issue.code === "missing_name")).toBe(true);
    expect(issues.some((issue) => issue.code === "missing_payer")).toBe(true);
    expect(issues.some((issue) => issue.code === "missing_start_date")).toBe(true);
  });

  it("warns when scored KPI weights do not total 100", () => {
    const config = createDefaultContractConfiguration("test-contract");
    config.basics.name = "Test";
    config.basics.payer = "Payer";
    config.basics.startDate = "2026-01-01";

    config.selectedMetrics.push({
      id: "selection-1",
      contractId: config.contractId,
      kpiCatalogItemId: "kpi-total-cost-pmpm",
      role: "scored",
      displayOrder: 0,
    });

    config.metricTargets.push({
      id: "target-1",
      contractId: config.contractId,
      contractMetricSelectionId: "selection-1",
      targetType: "absolute",
      baselineValue: 900,
      thresholdValue: 880,
      targetValue: 860,
      weight: 80,
    });

    const issues = validateContractConfiguration(config);
    expect(issues.some((issue) => issue.code === "weight_total_not_100")).toBe(true);
  });
});

describe("contract configuration preview", () => {
  it("calculates basic summary metrics", () => {
    const config = createDefaultContractConfiguration("test-contract");
    config.selectedMetrics = [
      {
        id: "selection-1",
        contractId: config.contractId,
        kpiCatalogItemId: "kpi-total-cost-pmpm",
        role: "scored",
        displayOrder: 0,
      },
      {
        id: "selection-2",
        contractId: config.contractId,
        kpiCatalogItemId: "kpi-diabetes-a1c-control",
        role: "gated",
        displayOrder: 1,
      },
    ];
    config.metricTargets = [
      {
        id: "target-1",
        contractId: config.contractId,
        contractMetricSelectionId: "selection-1",
        targetType: "absolute",
        weight: 100,
      },
    ];
    config.incentiveRules = [
      {
        id: "rule-1",
        contractId: config.contractId,
        name: "Fixed incentive",
        incentiveType: "fixed_payout",
        linkedContractMetricSelectionIds: ["selection-1"],
        payoutBasis: "fixed",
        payoutAmount: 125000,
      },
    ];
    config.financialTerms.qualityGateEnabled = true;

    const preview = getContractConfigurationPreview(config);
    expect(preview.totalSelectedKpis).toBe(2);
    expect(preview.scoredKpis).toBe(1);
    expect(preview.gatedKpis).toBe(1);
    expect(preview.scoredWeightTotal).toBe(100);
    expect(preview.estimatedMaxUpside).toBe(125000);
    expect(preview.blockedUpsideEstimate).toBeGreaterThan(0);
  });
});
