import { describe, expect, it, vi, afterEach } from "vitest";
import { mockContracts } from "@/lib/mockData";
import { seededContractConfigurations } from "@/data/synthetic/contractConfigurations";
import { kpiCatalog } from "@/data/synthetic/kpiCatalog";
import { createDefaultContractConfiguration } from "@/lib/contracts/configurationDefaults";
import { configurationSignature, normalizeContractConfiguration } from "@/lib/contracts/configurationNormalization";
import { validateContractConfiguration } from "@/lib/contracts/configurationValidation";
import { calculateContractScenarioComparison } from "@/lib/contracts/scenarioSimulator";
import { compareStudio, createStudioInputs, evaluateConfiguredIncentives, setStudioKpi, setStudioPerformance, studioStorySteps, type StudioSnapshot } from "@/lib/contracts/scenarioStudio";
import { deleteScenario, listSavedScenarios, readSavedScenarios, saveScenario } from "@/lib/contracts/scenarioStorage";
import type { ContractIncentiveRule } from "@/types/contractConfiguration";

function snapshot(id = "mssp-001"): StudioSnapshot {
  return structuredClone({ contract: mockContracts.find(c => c.id === id)!, configuration: seededContractConfigurations.find(c => c.contractId === id) ?? createDefaultContractConfiguration(id) });
}
function simpleRule(type: ContractIncentiveRule["incentiveType"] = "fixed_payout") {
  const s = snapshot();
  s.configuration.selectedMetrics = s.configuration.selectedMetrics.filter(k => k.kpiCatalogItemId === "kpi-diabetes-a1c-control").map(k => ({ ...k, role: "scored", displayOrder: 0 }));
  const id = s.configuration.selectedMetrics[0].id;
  s.configuration.metricTargets = [{ id: "target", contractId: s.contract.id, contractMetricSelectionId: id, targetType: "absolute", baselineValue: 60, thresholdValue: 70, targetValue: 80, weight: 100 }];
  s.configuration.financialTerms = { contractId: s.contract.id, qualityGateEnabled: false, settlementFrequency: "annual" };
  s.configuration.incentiveRules = [{ id: "rule", contractId: s.contract.id, name: "Performance payout", incentiveType: type, linkedContractMetricSelectionIds: [id], payoutBasis: "fixed", payoutAmount: 1000 }];
  return { s, id };
}
afterEach(() => vi.unstubAllGlobals());

describe("studio settlement and storytelling", () => {
  it("starts with identical baseline and scenario across all seeded contracts without mutation", () => {
    mockContracts.forEach(c => {
      const s = snapshot(c.id); const before = JSON.stringify(s);
      const result = compareStudio(s, createStudioInputs(s));
      expect(result.settlement.deltaSettlement).toBe(0);
      expect(result.baselineIncentives.total).toBe(result.scenarioIncentives.total);
      expect(result.settlement.scenario.estimatedAmount).toBe(result.settlement.baseline.estimatedAmount);
      expect(JSON.stringify(s)).toBe(before);
    });
  });
  it("runs a repeatable care-to-value story with A1c gating configured earnings", () => {
    const s = snapshot(); const before = JSON.stringify(s);
    const steps = studioStorySteps(s);
    expect(steps.map(s => s.id)).toEqual(["baseline", "care", "quality"]);
    const care = compareStudio(s, steps[1].inputs), quality = compareStudio(s, steps[2].inputs);
    expect(care.settlement.deltaSettlement).toBeGreaterThan(0);
    expect(care.scenarioIncentives.total).toBe(0);
    expect(care.scenarioIncentives.blockedAmount).toBe(450000);
    expect(quality.scenarioIncentives.total).toBe(450000);
    expect(care.scenarioIncentives.kpis.find(k => k.id.endsWith("a1c"))?.value).toBe(68);
    expect(quality.scenarioIncentives.kpis.find(k => k.id.endsWith("a1c"))?.value).toBe(78);
    expect(studioStorySteps(s)).toEqual(steps);
    expect(JSON.stringify(s)).toBe(before);
  });
  it("synchronizes KPI and performance edits in both directions", () => {
    const s = snapshot(); const initial = createStudioInputs(s);
    const one = setStudioKpi(s, initial, "sel-mssp-001-pmpm", 830);
    expect(one.overrides.currentPmpm).toBe(830);
    const two = setStudioPerformance(s, one, "currentPmpm", 840);
    expect(two.kpiValues["sel-mssp-001-pmpm"]).toBe(840);
    expect(initial.overrides.currentPmpm).toBe(910);
  });
  it("ED alone changes no settlement dollars; driver increments reconcile", () => {
    const s = snapshot(); const inputs = createStudioInputs(s);
    const edOnly = calculateContractScenarioComparison(s.contract, { ...inputs.overrides, edVisitsPer1000: 200 });
    expect(edOnly.deltaSettlement).toBe(0);
    const result = calculateContractScenarioComparison(s.contract, { ...inputs.overrides, currentPmpm: 800, qualityScore: 90, attributedLives: 7000, sharedSavingsRate: 80 });
    expect(result.driverSteps.reduce((sum, step) => sum + step.deltaFromPrevious, 0)).toBeCloseTo(result.deltaSettlement);
  });
  it("applies savings gates, risk caps, and payout thresholds", () => {
    const s = snapshot(); const initial = createStudioInputs(s).overrides;
    expect(calculateContractScenarioComparison(s.contract, { ...initial, currentPmpm: 800, qualityScore: 60 }).scenario.status).toBe("quality_blocked");
    expect(calculateContractScenarioComparison(s.contract, { ...initial, currentPmpm: 870 }).scenario.status).toBe("below_threshold");
    const risk = calculateContractScenarioComparison(s.contract, { ...initial, currentPmpm: 2000 }).scenario;
    expect(risk.estimatedAmount).toBeCloseTo(-risk.benchmarkSpend * risk.terms.downsideRiskCap / 100);
    const savings = calculateContractScenarioComparison(s.contract, { ...initial, currentPmpm: 0, qualityScore: 100 }).scenario;
    expect(savings.estimatedAmount).toBeCloseTo(savings.benchmarkSpend * savings.terms.sharedSavingsCap / 100);
  });
  it("supports modeled terms and unconfigured drafts", () => {
    const s = snapshot("ma-003"); delete s.contract.vbcTerms;
    expect(compareStudio(s, createStudioInputs(s)).settlement.baseline.assumptionsSource).toBe("modeled_defaults");
    s.contract = { ...s.contract, id: "draft-demo", isDraft: true };
    s.configuration = createDefaultContractConfiguration(s.contract.id);
    expect(compareStudio(s, createStudioInputs(s)).scenarioIncentives.total).toBe(0);
    expect(studioStorySteps(s).length).toBeGreaterThan(0);
  });
});

describe("configured incentive evaluator", () => {
  it("earns fixed payouts only at target, then applies rule and contract caps", () => {
    const { s, id } = simpleRule(); const input = createStudioInputs(s);
    input.kpiValues[id] = 79;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(0);
    input.kpiValues[id] = 80; s.configuration.incentiveRules[0].capAmount = 800;
    s.configuration.financialTerms.incentiveCapAmount = 700;
    const result = evaluateConfiguredIncentives(s, input);
    expect(result.rules[0].amount).toBe(800); expect(result.total).toBe(700);
  });
  it("normalizes weights and awards linear pool progress", () => {
    const { s, id } = simpleRule("weighted_pool"); const input = createStudioInputs(s);
    input.kpiValues[id] = 75; s.configuration.metricTargets[0].weight = 60;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(500);
    input.kpiValues[id] = 100;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(1000);
    s.configuration.metricTargets[0].weight = 0;
    expect(evaluateConfiguredIncentives(s, input).rules[0].status).toBe("incomplete");
  });
  it("requires all linked fixed targets, and honors lower-is-better progress", () => {
    const s = snapshot("comm-001"); s.configuration.financialTerms.qualityGateEnabled = false;
    const input = createStudioInputs(s);
    s.configuration.selectedMetrics.forEach(k => { const t = s.configuration.metricTargets.find(t => t.contractMetricSelectionId === k.id)!; input.kpiValues[k.id] = t.targetValue!; });
    input.overrides.currentPmpm = 450;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(280000);
    input.kpiValues["sel-comm-001-readmit"] = 13;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(0);
    const { s: lower, id } = simpleRule("weighted_pool");
    Object.assign(lower.configuration.metricTargets[0], { baselineValue: 90, thresholdValue: 80, targetValue: 70, directionalityOverride: "lower_is_better" });
    const lowerInput = createStudioInputs(lower); lowerInput.kpiValues[id] = 75;
    expect(evaluateConfiguredIncentives(lower, lowerInput).total).toBe(500);
  });
  it("treats improvement targets as endpoints and ranges as inclusive", () => {
    const { s, id } = simpleRule(); const input = createStudioInputs(s);
    s.configuration.metricTargets[0].targetType = "improvement_over_baseline";
    input.kpiValues[id] = 80;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(1000);
    Object.assign(s.configuration.metricTargets[0], { targetType: "range", minRangeValue: 75, maxRangeValue: 85 });
    for (const value of [75, 85]) { input.kpiValues[id] = value; expect(evaluateConfiguredIncentives(s, input).total).toBe(1000); }
    input.kpiValues[id] = 86; expect(evaluateConfiguredIncentives(s, input).total).toBe(0);
  });
  it("uses threshold for gate payouts and never bypasses gates with floors", () => {
    const { s, id } = simpleRule("gate_based_payout"); const input = createStudioInputs(s);
    input.kpiValues[id] = 70; expect(evaluateConfiguredIncentives(s, input).total).toBe(1000);
    s.configuration.incentiveRules[0].floorAmount = 2000;
    input.kpiValues[id] = 69; expect(evaluateConfiguredIncentives(s, input).total).toBe(0);
    Object.assign(s.configuration.financialTerms, { qualityGateEnabled: true, qualityGateBasis: "selected_metric_threshold", qualityGateThreshold: 78, qualityGateMetricSelectionId: id });
    input.kpiValues[id] = 75;
    const blocked = evaluateConfiguredIncentives(s, input);
    expect(blocked.total).toBe(0); expect(blocked.blockedAmount).toBe(2000);
    input.kpiValues[id] = 78; expect(evaluateConfiguredIncentives(s, input).total).toBe(2000);
  });
  it("selects the highest qualifying tier, with no cumulative payout", () => {
    const { s, id } = simpleRule("tiered_payout"); const input = createStudioInputs(s);
    s.configuration.incentiveRules[0].tiers = [{ id: "one", thresholdValue: 70, payoutAmount: 400 }, { id: "two", thresholdValue: 80, payoutAmount: 900 }];
    input.kpiValues[id] = 85;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(900);
    input.kpiValues[id] = 75;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(400);
  });
  it("requires explicit per-unit and percentage assumptions and calculates PMPM periods", () => {
    const { s, id } = simpleRule("per_unit_payout"); const input = createStudioInputs(s); input.kpiValues[id] = 80;
    expect(evaluateConfiguredIncentives(s, input).rules[0].status).toBe("incomplete");
    input.ruleAssumptions.rule = { eligibleUnits: 12, dollarRate: 25 };
    expect(evaluateConfiguredIncentives(s, input).total).toBe(300);
    Object.assign(s.configuration.incentiveRules[0], { incentiveType: "fixed_payout", payoutBasis: "percent", payoutRate: 10 });
    expect(evaluateConfiguredIncentives(s, input).partial).toBe(true);
    input.ruleAssumptions.rule.monetaryBase = 50000;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(5000);
    Object.assign(s.configuration.incentiveRules[0], { payoutBasis: "pmpm", payoutAmount: 2 });
    expect(evaluateConfiguredIncentives(s, input).total).toBe(2 * s.contract.attributedLives * 12);
  });
  it("does not invent missing baselines, and ignores unlinked monitored KPIs for payout", () => {
    const { s, id } = simpleRule(); delete s.configuration.metricTargets[0].baselineValue;
    const input = createStudioInputs(s); input.kpiValues[id] = 90;
    expect(evaluateConfiguredIncentives(s, input).rules[0].status).toBe("incomplete");
    input.baselineKpiValues[id] = 60;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(1000);
    s.configuration.selectedMetrics.push({ id: "monitor", contractId: s.contract.id, kpiCatalogItemId: "kpi-raf-capture", role: "monitored", displayOrder: 1 });
    const result = evaluateConfiguredIncentives(s, input);
    expect(result.total).toBe(1000); expect(result.partial).toBe(true);
  });
  it("uses weighted achievement percentages for multi-KPI tiers", () => {
    const s = snapshot(); s.configuration.financialTerms.qualityGateEnabled = false;
    s.configuration.selectedMetrics = s.configuration.selectedMetrics.filter(k => k.role === "scored");
    const rule = s.configuration.incentiveRules[0]; s.configuration.incentiveRules = [rule];
    Object.assign(rule, { incentiveType: "tiered_payout", tiers: [{ id: "half", thresholdValue: 50, payoutAmount: 500 }, { id: "full", thresholdValue: 100, payoutAmount: 1000 }] });
    let input = createStudioInputs(s);
    input = setStudioPerformance(s, input, "currentPmpm", 875);
    expect(evaluateConfiguredIncentives(s, input).total).toBe(500);
    input = setStudioPerformance(s, input, "edVisitsPer1000", 285);
    expect(evaluateConfiguredIncentives(s, input).total).toBe(1000);
  });
  it("rejects invalid caps, missing links and invalid unit assumptions", () => {
    const { s, id } = simpleRule("per_unit_payout"); const input = createStudioInputs(s); input.kpiValues[id] = 80;
    input.ruleAssumptions.rule = { eligibleUnits: 2.5, dollarRate: 25 };
    expect(evaluateConfiguredIncentives(s, input).rules[0].status).toBe("incomplete");
    input.ruleAssumptions.rule.eligibleUnits = 2; s.configuration.financialTerms.incentiveCapAmount = -1;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(0);
    expect(evaluateConfiguredIncentives(s, input).partial).toBe(true);
    delete s.configuration.financialTerms.incentiveCapAmount;
    s.configuration.incentiveRules[0].linkedContractMetricSelectionIds = ["missing"];
    expect(evaluateConfiguredIncentives(s, input).rules[0].status).toBe("incomplete");
  });
  it("only releases an all-or-nothing pool when every linked target is met", () => {
    const { s, id } = simpleRule("weighted_pool"); const input = createStudioInputs(s);
    s.configuration.incentiveRules[0].allOrNothing = true; input.kpiValues[id] = 75;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(0);
    input.kpiValues[id] = 80; expect(evaluateConfiguredIncentives(s, input).total).toBe(1000);
  });
  it("does not include domain economics or withholds", () => {
    const s = snapshot("ma-001"); const input = createStudioInputs(s); const expected = evaluateConfiguredIncentives(s, input).total;
    s.configuration.domainEconomicRules = []; s.configuration.financialTerms.withholdAmount = 999999;
    expect(evaluateConfiguredIncentives(s, input).total).toBe(expected);
  });
});

describe("configuration compatibility", () => {
  it("resolves every seeded KPI and normalizes legacy aliases", () => {
    seededContractConfigurations.forEach(c => c.selectedMetrics.forEach(k => expect(kpiCatalog.some(item => item.id === k.kpiCatalogItemId)).toBe(true)));
    const s = snapshot("comm-001").configuration;
    s.selectedMetrics[1].kpiCatalogItemId = "kpi-readmission-rate";
    expect(normalizeContractConfiguration(s).selectedMetrics[1].kpiCatalogItemId).toBe("kpi-readmission-30d");
    expect(s.selectedMetrics[1].kpiCatalogItemId).toBe("kpi-readmission-rate");
  });
  it("validates missing gate metrics and reversed ranges", () => {
    const s = snapshot().configuration; delete s.financialTerms.qualityGateMetricSelectionId;
    Object.assign(s.metricTargets[0], { targetType: "range", minRangeValue: 900, maxRangeValue: 800 });
    const issues = validateContractConfiguration(s);
    expect(issues.some(i => i.code === "missing_quality_gate_metric")).toBe(true);
    expect(issues.some(i => i.code.startsWith("invalid_range"))).toBe(true);
  });
});

function mockStorage() {
  const records = new Map<string, string>();
  const localStorage = { getItem: vi.fn((key: string) => records.get(key) ?? null), setItem: vi.fn((key: string, value: string) => records.set(key, value)) };
  vi.stubGlobal("window", { localStorage }); return { records, localStorage };
}
describe("saved studio scenarios", () => {
  it("round trips snapshots and inputs without sharing mutable references", () => {
    mockStorage(); const s = snapshot(); const inputs = studioStorySteps(s)[2].inputs;
    const saved = saveScenario({ contractId: s.contract.id, name: "Care plan", overrides: inputs.overrides, snapshot: s, inputs });
    inputs.overrides.currentPmpm = 999;
    const loaded = listSavedScenarios(s.contract.id)[0];
    expect(loaded.version).toBe(2); expect(loaded.inputs!.overrides.currentPmpm).not.toBe(999);
    expect(loaded.snapshot).toEqual(s); expect(configurationSignature(loaded.snapshot!.configuration)).toBe(configurationSignature(s.configuration)); expect(saved.name).toBe("Care plan");
  });
  it("retains legacy scenarios, limits 20 per contract, and isolates deletion", () => {
    mockStorage(); const s = snapshot(); const inputs = createStudioInputs(s);
    for (let i = 0; i < 22; i++) saveScenario({ contractId: s.contract.id, name: `Option ${i}`, overrides: inputs.overrides });
    const other = saveScenario({ contractId: "other", name: "Other", overrides: inputs.overrides });
    expect(listSavedScenarios(s.contract.id)).toHaveLength(20);
    expect(listSavedScenarios(s.contract.id)[0].name).toBe("Option 21");
    deleteScenario("other", other.id);
    expect(listSavedScenarios("other")).toHaveLength(0);
    expect(listSavedScenarios(s.contract.id)).toHaveLength(20);
  });
  it("rejects malformed or cross-contract records and preserves unreadable data", () => {
    const { records } = mockStorage(); const s = snapshot(); const inputs = createStudioInputs(s);
    const good = saveScenario({ contractId: s.contract.id, name: "Good", overrides: inputs.overrides, snapshot: s, inputs });
    records.set("contracts.scenario.saved", JSON.stringify({ [s.contract.id]: [{ ...good, snapshot: {} }, { ...good, contractId: "other" }, good] }));
    expect(listSavedScenarios(s.contract.id)).toHaveLength(1); expect(readSavedScenarios().issue).toBeTruthy();
    expect(() => saveScenario({ contractId: s.contract.id, name: "New", overrides: inputs.overrides })).toThrow("preserved");
    records.set("contracts.scenario.saved", "not-json");
    expect(readSavedScenarios().data).toEqual({}); expect(readSavedScenarios().issue).toBeTruthy();
  });
  it("reports storage reads and writes that fail", () => {
    const { localStorage } = mockStorage(); const s = snapshot(); const inputs = createStudioInputs(s);
    localStorage.getItem.mockImplementation(() => { throw new Error("SecurityError"); });
    expect(readSavedScenarios().issue).toContain("unavailable");
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockImplementation(() => { throw new Error("QuotaExceededError"); });
    expect(() => saveScenario({ contractId: s.contract.id, name: "New", overrides: inputs.overrides })).toThrow("Could not save");
  });
});
