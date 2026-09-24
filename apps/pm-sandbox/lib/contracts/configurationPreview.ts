import type { ContractConfiguration, ContractIncentiveRule } from "@/types/contractConfiguration";

function estimateRuleUpside(rule: ContractIncentiveRule) {
  if (rule.incentiveType === "fixed_payout") return rule.payoutAmount ?? 0;
  if (rule.incentiveType === "weighted_pool") return rule.payoutAmount ?? 0;
  if (rule.incentiveType === "per_unit_payout") {
    return (rule.payoutAmount ?? 0) * Math.max(rule.payoutRate ?? 0, 1);
  }
  if (rule.incentiveType === "tiered_payout") {
    return Math.max(0, ...(rule.tiers?.map((tier) => tier.payoutAmount) ?? [0]));
  }
  if (rule.incentiveType === "gate_based_payout") return rule.payoutAmount ?? 0;
  return 0;
}

export interface ContractConfigurationPreview {
  totalSelectedKpis: number;
  scoredKpis: number;
  monitoredKpis: number;
  gatedKpis: number;
  scoredWeightTotal: number;
  incentiveRuleCount: number;
  estimatedMaxUpside: number;
  blockedUpsideEstimate: number;
  downsideCapAmount: number;
}

export function getContractConfigurationPreview(config: ContractConfiguration): ContractConfigurationPreview {
  const scoredSelections = config.selectedMetrics.filter((selection) => selection.role === "scored");
  const monitoredSelections = config.selectedMetrics.filter((selection) => selection.role === "monitored");
  const gatedSelections = config.selectedMetrics.filter((selection) => selection.role === "gated");

  const scoredWeightTotal = scoredSelections.reduce((sum, selection) => {
    const target = config.metricTargets.find((item) => item.contractMetricSelectionId === selection.id);
    return sum + (target?.weight ?? 0);
  }, 0);

  const estimatedMaxUpside = config.incentiveRules.reduce((sum, rule) => sum + estimateRuleUpside(rule), 0);
  const blockedUpsideEstimate = config.financialTerms.qualityGateEnabled
    ? Math.round(estimatedMaxUpside * 0.35)
    : 0;

  return {
    totalSelectedKpis: config.selectedMetrics.length,
    scoredKpis: scoredSelections.length,
    monitoredKpis: monitoredSelections.length,
    gatedKpis: gatedSelections.length,
    scoredWeightTotal,
    incentiveRuleCount: config.incentiveRules.length,
    estimatedMaxUpside,
    blockedUpsideEstimate,
    downsideCapAmount: config.financialTerms.downsideCapAmount ?? 0,
  };
}
