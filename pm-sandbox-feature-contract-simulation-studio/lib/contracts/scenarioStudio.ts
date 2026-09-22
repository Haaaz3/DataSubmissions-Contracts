import type { Contract } from "@/types/contract";
import type { ContractConfiguration } from "@/types/contractConfiguration";
import { kpiCatalog } from "@/data/synthetic/kpiCatalog";
import { calculateEstimatedSettlement } from "./settlement";
import { calculateContractScenarioComparison, type ContractScenarioOverrides } from "./scenarioSimulator";
import { normalizeKpiCatalogId } from "./configurationNormalization";

export interface RuleAssumption { eligibleUnits?: number; dollarRate?: number; monetaryBase?: number }
export interface StudioInputs {
  overrides: ContractScenarioOverrides;
  kpiValues: Record<string, number>;
  baselineKpiValues: Record<string, number>;
  ruleAssumptions: Record<string, RuleAssumption>;
}
export interface StudioSnapshot { contract: Contract; configuration: ContractConfiguration }
export interface KpiEvaluation {
  id: string; name: string; unit: string; role: string; value?: number; baseline?: number;
  target?: number; threshold?: number; achievement: number; targetMet: boolean; gatePassed: boolean;
  direction: string; issue?: string;
}
export interface IncentiveEvaluation {
  kpis: KpiEvaluation[];
  rules: Array<{ id: string; name: string; amount: number; beforeGate: number; status: "earned" | "blocked" | "not_earned" | "incomplete"; explanation: string }>;
  gates: Array<{ name: string; passed: boolean; issue?: string }>;
  total: number; beforeGate: number; blockedAmount: number; issues: string[]; partial: boolean;
}
const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const clamp = (n: number) => Math.min(1, Math.max(0, n));
export const linkedPerformance: Record<string, "currentPmpm" | "edVisitsPer1000" | "qualityScore"> = {
  "kpi-total-cost-pmpm": "currentPmpm", "kpi-ed-visits-per-1000": "edVisitsPer1000", "kpi-quality-composite-score": "qualityScore",
};
export function createStudioInputs(snapshot: StudioSnapshot): StudioInputs {
  const c = snapshot.contract;
  const terms = calculateEstimatedSettlement(c).terms;
  const kpiValues: Record<string, number> = {};
  snapshot.configuration.selectedMetrics.forEach(s => {
    const key = linkedPerformance[normalizeKpiCatalogId(s.kpiCatalogItemId)];
    const value = key ? c[key] : snapshot.configuration.metricTargets.find(t => t.contractMetricSelectionId === s.id)?.baselineValue;
    if (finite(value)) kpiValues[s.id] = value;
  });
  return {
    overrides: { currentPmpm: c.currentPmpm, qualityScore: c.qualityScore, edVisitsPer1000: c.edVisitsPer1000,
      attributedLives: c.attributedLives, benchmarkPmpm: terms.benchmarkPmpm, sharedSavingsRate: terms.sharedSavingsRate,
      sharedRiskRate: terms.sharedRiskRate, qualityGate: terms.qualityGate },
    kpiValues, baselineKpiValues: { ...kpiValues }, ruleAssumptions: {},
  };
}
export function setStudioPerformance(snapshot: StudioSnapshot, inputs: StudioInputs, key: keyof ContractScenarioOverrides, value: number): StudioInputs {
  const kpiValues = { ...inputs.kpiValues };
  snapshot.configuration.selectedMetrics.forEach(s => {
    if (linkedPerformance[normalizeKpiCatalogId(s.kpiCatalogItemId)] === key) kpiValues[s.id] = value;
  });
  return { ...inputs, overrides: { ...inputs.overrides, [key]: value }, kpiValues };
}
export function setStudioKpi(snapshot: StudioSnapshot, inputs: StudioInputs, id: string, value: number): StudioInputs {
  const selection = snapshot.configuration.selectedMetrics.find(s => s.id === id);
  const key = selection && linkedPerformance[normalizeKpiCatalogId(selection.kpiCatalogItemId)];
  return key ? setStudioPerformance(snapshot, inputs, key, value) : { ...inputs, kpiValues: { ...inputs.kpiValues, [id]: value } };
}

export function evaluateConfiguredIncentives(snapshot: StudioSnapshot, inputs: StudioInputs, baseline = false): IncentiveEvaluation {
  const { configuration: config, contract } = snapshot;
  const performance = baseline ? contract : inputs.overrides;
  const issues: string[] = [];
  const kpis: KpiEvaluation[] = config.selectedMetrics.map(selection => {
    const catalog = kpiCatalog.find(k => k.id === normalizeKpiCatalogId(selection.kpiCatalogItemId));
    const target = config.metricTargets.find(t => t.contractMetricSelectionId === selection.id);
    const linkedKey = catalog && linkedPerformance[catalog.id];
    const value = linkedKey ? performance[linkedKey] : (baseline ? inputs.baselineKpiValues : inputs.kpiValues)[selection.id];
    const base = linkedKey ? contract[linkedKey] : inputs.baselineKpiValues[selection.id];
    const direction = target?.directionalityOverride ?? catalog?.directionality ?? "higher_is_better";
    const isRange = target?.targetType === "range" || direction === "target_range";
    let issue: string | undefined;
    if (!catalog) issue = "KPI is missing from the catalog";
    else if (!finite(base) || base < 0 || ((catalog.unit === "percent" || catalog.unit === "score") && base > 100)) issue = "Enter a valid baseline assumption";
    else if (!finite(value)) issue = "Enter a scenario value";
    else if (value < 0 || ((catalog.unit === "percent" || catalog.unit === "score") && value > 100)) issue = "Value is outside the KPI range";
    else if (!target || (isRange ? !finite(target.minRangeValue) || !finite(target.maxRangeValue) || target.minRangeValue > target.maxRangeValue : !finite(target.targetValue))) issue = "Complete the target configuration";
    else if (!isRange && finite(target.thresholdValue) && (direction === "lower_is_better" ? target.thresholdValue < target.targetValue! : target.thresholdValue > target.targetValue!)) issue = "Threshold and target order is invalid";
    const meets = (boundary: number) => direction === "lower_is_better" ? value! <= boundary : value! >= boundary;
    let targetMet = false, gatePassed = false, achievement = 0;
    if (!issue && target) {
      if (isRange) {
        targetMet = value! >= target.minRangeValue! && value! <= target.maxRangeValue!;
        gatePassed = targetMet;
        achievement = targetMet ? 1 : 0;
      } else {
        targetMet = meets(target.targetValue!);
        gatePassed = meets(target.thresholdValue ?? target.targetValue!);
        const start = target.thresholdValue ?? base!;
        const span = target.targetValue! - start;
        achievement = targetMet ? 1 : span === 0 ? 0 : clamp((value! - start) / span);
      }
    }
    const name = catalog?.name ?? selection.kpiCatalogItemId;
    if (issue) issues.push(`${name}: ${issue}`);
    return { id: selection.id, name, unit: catalog?.unit ?? "", role: selection.role, value, baseline: base,
      target: target?.targetValue, threshold: target?.thresholdValue, achievement, targetMet, gatePassed, direction, issue };
  });
  const gates: IncentiveEvaluation["gates"] = kpis.filter(k => k.role === "gated").map(k => ({ name: `${k.name} measure minimum (${k.threshold ?? k.target ?? "range"})`, passed: !k.issue && k.gatePassed, issue: k.issue }));
  const terms = config.financialTerms;
  if (terms.qualityGateEnabled) {
    const metric = kpis.find(k => k.id === terms.qualityGateMetricSelectionId);
    const isMetric = terms.qualityGateBasis === "selected_metric_threshold";
    const value = isMetric ? metric?.value : performance.qualityScore;
    const issue = !finite(terms.qualityGateThreshold) || terms.qualityGateThreshold < 0 || (!isMetric && terms.qualityGateThreshold > 100) || !finite(value) || (isMetric && (!metric || metric.issue)) ? "Complete the configured quality gate" : undefined;
    gates.push({ name: isMetric ? `${metric?.name ?? "Selected metric"} contract gate (${terms.qualityGateThreshold ?? "?"})` : `Composite quality gate (${terms.qualityGateThreshold ?? "?"})`,
      passed: !issue && (isMetric && metric?.direction === "lower_is_better" ? value! <= terms.qualityGateThreshold! : value! >= terms.qualityGateThreshold!), issue });
    if (issue) issues.push(issue);
  }
  const invalidCap = terms.incentiveCapAmount !== undefined && (!finite(terms.incentiveCapAmount) || terms.incentiveCapAmount < 0);
  if (invalidCap) issues.push("Correct the contract incentive cap before calculating the total");
  const globalGatePassed = gates.every(g => g.passed);
  const months = calculateEstimatedSettlement(contract).monthsInPeriod;
  const rules = config.incentiveRules.map(rule => {
    const linked = rule.linkedContractMetricSelectionIds.map(id => kpis.find(k => k.id === id));
    let issue = !linked.length || linked.some(k => !k || k.issue) ? "Complete the linked KPI values and targets" : undefined;
    if ([rule.payoutAmount, rule.payoutRate, rule.capAmount, rule.floorAmount].some(n => n !== undefined && (!finite(n) || n < 0)) || (rule.floorAmount !== undefined && rule.capAmount !== undefined && rule.floorAmount > rule.capAmount)) issue = "Correct invalid payout amounts or limits";
    const valid = linked.filter((k): k is KpiEvaluation => !!k);
    const assumptions = inputs.ruleAssumptions[rule.id] ?? {};
    const weighted = () => {
      const scored = valid.filter(k => k.role === "scored");
      const weights = scored.map(k => config.metricTargets.find(t => t.contractMetricSelectionId === k.id)?.weight);
      if (!scored.length || weights.some(w => !finite(w) || w < 0) || weights.reduce<number>((a, b) => a + (b ?? 0), 0) <= 0) {
        issue = "Add positive weights to linked scored KPIs"; return 0;
      }
      const sum = weights.reduce<number>((a, b) => a + b!, 0);
      return scored.reduce((a, k, i) => a + k.achievement * weights[i]! / sum, 0);
    };
    const payout = (amount = rule.payoutAmount) => {
      if (rule.payoutBasis === "percent") {
        if (!finite(assumptions.monetaryBase) || assumptions.monetaryBase < 0 || !finite(rule.payoutRate)) { issue = "Enter a monetary base and percentage rate"; return 0; }
        return assumptions.monetaryBase * rule.payoutRate / 100;
      }
      if (!finite(amount)) { issue = "Enter the payout amount"; return 0; }
      if (rule.payoutBasis === "pmpm") return amount * performance.attributedLives * months;
      if (rule.payoutBasis === "per_unit") {
        if (!finite(assumptions.eligibleUnits) || assumptions.eligibleUnits < 0 || !Number.isInteger(assumptions.eligibleUnits) || !finite(assumptions.dollarRate) || assumptions.dollarRate < 0) { issue = "Enter eligible units and dollars per unit"; return 0; }
        return assumptions.eligibleUnits * assumptions.dollarRate;
      }
      return amount;
    };
    let amount = 0, qualified = false, explanation = "Linked targets not yet met";
    const ruleGatePassed = valid.filter(k => k.role === "gated").every(k => k.gatePassed);
    if (rule.incentiveType === "weighted_pool") {
      const fraction = weighted();
      amount = payout() * fraction;
      qualified = fraction > 0 && ruleGatePassed && (!rule.allOrNothing || valid.every(k => k.targetMet));
      explanation = `${(fraction * 100).toFixed(1)}% of the pool earned from normalized scored KPI weights`;
    } else if (rule.incentiveType === "tiered_payout") {
      if (rule.payoutBasis !== "fixed" && rule.payoutBasis !== "pool" && rule.payoutBasis !== "pmpm") issue = "Tier payouts require a dollar or PMPM basis";
      const score = valid.length === 1 ? valid[0].value! : weighted() * 100;
      if (!rule.tiers?.length || rule.tiers.some(t => !finite(t.thresholdValue) || !finite(t.payoutAmount) || t.payoutAmount < 0)) issue = "Complete the payout tiers";
      const tier = rule.tiers?.filter(t => valid.length === 1 && valid[0].direction === "lower_is_better" ? score <= t.thresholdValue : score >= t.thresholdValue).sort((a, b) => b.payoutAmount - a.payoutAmount)[0];
      qualified = !!tier && ruleGatePassed;
      amount = tier ? payout(tier.payoutAmount) : 0;
      explanation = tier ? `${tier.label || "Tier"} reached · ${valid.length === 1 ? "KPI units" : "weighted achievement %"}` : "No payout tier reached";
    } else if (rule.incentiveType === "per_unit_payout") {
      qualified = valid.every(k => k.targetMet);
      if (!finite(assumptions.eligibleUnits) || assumptions.eligibleUnits < 0 || !Number.isInteger(assumptions.eligibleUnits) || !finite(assumptions.dollarRate) || assumptions.dollarRate < 0) issue = "Enter eligible units and dollars per unit";
      else amount = assumptions.eligibleUnits * assumptions.dollarRate;
      explanation = `${assumptions.eligibleUnits ?? "?"} eligible units × $${assumptions.dollarRate ?? "?"}; linked targets must be met`;
    } else {
      qualified = valid.every(k => rule.incentiveType === "gate_based_payout" ? k.gatePassed : k.targetMet);
      amount = payout();
      explanation = qualified ? "All linked requirements met" : "Linked requirements not yet met";
    }
    if (rule.payoutBasis === "percent" && finite(assumptions.monetaryBase) && finite(rule.payoutRate)) explanation += ` · ${rule.payoutRate}% × $${assumptions.monetaryBase.toLocaleString("en-US")} monetary base`;
    if (rule.payoutBasis === "pmpm") explanation += ` · ${performance.attributedLives.toLocaleString("en-US")} lives × ${months} months`;
    if (issue) issues.push(`${rule.name}: ${issue}`);
    const beforeGate = !issue && qualified ? Math.min(rule.capAmount ?? Infinity, Math.max(rule.floorAmount ?? 0, amount)) : 0;
    const earned = globalGatePassed ? beforeGate : 0;
    return { id: rule.id, name: rule.name, amount: earned, beforeGate,
      status: issue ? "incomplete" as const : !globalGatePassed ? "blocked" as const : qualified ? "earned" as const : "not_earned" as const,
      explanation: issue ?? (!globalGatePassed ? `${explanation}. Configured quality gates must pass before release.` : explanation) };
  });
  const beforeGate = invalidCap ? 0 : Math.min(terms.incentiveCapAmount ?? Infinity, rules.reduce((a, r) => a + r.beforeGate, 0));
  const total = globalGatePassed ? beforeGate : 0;
  return { kpis, rules, gates, total, beforeGate, blockedAmount: beforeGate - total, issues, partial: issues.length > 0 };
}

export function compareStudio(snapshot: StudioSnapshot, inputs: StudioInputs) {
  return { settlement: calculateContractScenarioComparison(snapshot.contract, inputs.overrides),
    baselineIncentives: evaluateConfiguredIncentives(snapshot, inputs, true), scenarioIncentives: evaluateConfiguredIncentives(snapshot, inputs) };
}
export function studioStorySteps(snapshot: StudioSnapshot, baselineInputs = createStudioInputs(snapshot)) {
  const start = structuredClone(baselineInputs);
  let care = structuredClone(start);
  const { configuration: config, contract } = snapshot;
  const baselineEval = evaluateConfiguredIncentives(snapshot, start);
  const isGate = (id: string) => {
    const selected = config.selectedMetrics.find(s => s.id === id);
    return selected?.role === "gated" || (config.financialTerms.qualityGateEnabled && config.financialTerms.qualityGateMetricSelectionId === id)
      || (selected && linkedPerformance[normalizeKpiCatalogId(selected.kpiCatalogItemId)] === "qualityScore");
  };
  config.selectedMetrics.filter(s => !isGate(s.id)).forEach(s => {
    const t = config.metricTargets.find(t => t.contractMetricSelectionId === s.id);
    const target = t?.targetType === "range" ? t.minRangeValue : t?.targetValue;
    if (finite(target) && finite(start.kpiValues[s.id]) && !baselineEval.kpis.find(k => k.id === s.id)?.targetMet) care = setStudioKpi(snapshot, care, s.id, target);
  });
  // A separate, explicit cost assumption clears the savings corridor; ED changes do not imply PMPM savings.
  const terms = calculateEstimatedSettlement(contract).terms;
  const costTarget = Math.min(care.overrides.currentPmpm, terms.benchmarkPmpm * (1 - (terms.sharedSavingsThreshold + 1) / 100));
  care = setStudioPerformance(snapshot, care, "currentPmpm", Math.max(0, Math.floor(costTarget * 100) / 100));
  let unlock = structuredClone(care);
  config.selectedMetrics.filter(s => isGate(s.id)).forEach(s => {
    const t = config.metricTargets.find(t => t.contractMetricSelectionId === s.id);
    const catalog = kpiCatalog.find(k => k.id === normalizeKpiCatalogId(s.kpiCatalogItemId));
    const threshold = config.financialTerms.qualityGateMetricSelectionId === s.id ? config.financialTerms.qualityGateThreshold : undefined;
    if (t?.targetType === "range" && finite(t.minRangeValue) && finite(t.maxRangeValue) && finite(start.kpiValues[s.id])) {
      unlock = setStudioKpi(snapshot, unlock, s.id, Math.min(t.maxRangeValue, Math.max(t.minRangeValue, start.kpiValues[s.id])));
      return;
    }
    const values = [t?.targetValue, t?.thresholdValue, threshold, start.kpiValues[s.id]].filter(finite);
    if (values.length && finite(start.kpiValues[s.id])) unlock = setStudioKpi(snapshot, unlock, s.id, (t?.directionalityOverride ?? catalog?.directionality) === "lower_is_better" ? Math.min(...values) : Math.max(...values));
  });
  const quality = Math.max(unlock.overrides.qualityScore, terms.qualityGate, config.financialTerms.qualityGateEnabled && config.financialTerms.qualityGateBasis !== "selected_metric_threshold" ? config.financialTerms.qualityGateThreshold ?? 0 : 0);
  unlock = setStudioPerformance(snapshot, unlock, "qualityScore", Math.min(100, quality));
  const steps = [{ id: "baseline", title: "Starting position", description: "Understand today's performance and the value still at stake.", inputs: start }];
  if (JSON.stringify(care) !== JSON.stringify(start)) steps.push({ id: "care", title: "Improve care performance", description: "Explore cost and utilization targets with an explicit PMPM savings assumption.", inputs: care });
  if (JSON.stringify(unlock) !== JSON.stringify(care)) steps.push({ id: "quality", title: "Unlock quality incentives", description: baselineEval.gates.every(g => g.passed) ? "Protect quality eligibility while improving performance." : "Close the remaining quality gaps and see which incentives become available.", inputs: unlock });
  return steps;
}
