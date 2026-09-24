import type { Contract, VbcTerms } from "@/types/contract";

export type SettlementStatus =
  | "shared_savings"
  | "shared_risk"
  | "quality_blocked"
  | "below_threshold"
  | "neutral";

export interface SettlementBreakdownRow {
  label: string;
  value: string;
  emphasis?: "default" | "positive" | "negative" | "warning";
}

export interface ContractSettlementEstimate {
  status: SettlementStatus;
  estimatedAmount: number;
  grossDeltaAmount: number;
  benchmarkSpend: number;
  actualSpend: number;
  grossDeltaPercent: number;
  qualityPassed: boolean;
  thresholdMet: boolean;
  monthsInPeriod: number;
  assumptionsSource: "contract_terms" | "modeled_defaults";
  terms: VbcTerms;
  breakdown: SettlementBreakdownRow[];
}

function monthsBetweenInclusive(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 12;
  const months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth()) + 1;
  return Math.max(1, months);
}

function defaultTermsForContract(contract: Contract): VbcTerms {
  const typeDefaults: Record<Contract["contractType"], Partial<VbcTerms>> = {
    MSSP: {
      sharedSavingsRate: 50,
      sharedSavingsThreshold: 2,
      sharedSavingsCap: 10,
      qualityGate: 70,
      sharedRisk: true,
      sharedRiskRate: 40,
      sharedRiskThreshold: 2,
      downsideRiskCap: 8,
    },
    "Medicare Advantage": {
      sharedSavingsRate: 45,
      sharedSavingsThreshold: 1.5,
      sharedSavingsCap: 9,
      qualityGate: 75,
      sharedRisk: true,
      sharedRiskRate: 45,
      sharedRiskThreshold: 1.5,
      downsideRiskCap: 9,
    },
    Commercial: {
      sharedSavingsRate: 40,
      sharedSavingsThreshold: 1,
      sharedSavingsCap: 8,
      qualityGate: 68,
      sharedRisk: true,
      sharedRiskRate: 35,
      sharedRiskThreshold: 1,
      downsideRiskCap: 7,
    },
  };

  const defaults = typeDefaults[contract.contractType];

  return {
    performancePeriodStart: "2026-01-01",
    performancePeriodEnd: "2026-12-31",
    benchmarkPmpm: contract.targetPmpm,
    sharedSavings: true,
    sharedSavingsRate: defaults.sharedSavingsRate ?? 45,
    sharedSavingsThreshold: defaults.sharedSavingsThreshold ?? 1.5,
    sharedSavingsCap: defaults.sharedSavingsCap ?? 9,
    qualityGate: defaults.qualityGate ?? 70,
    sharedRisk: defaults.sharedRisk ?? true,
    sharedRiskRate: defaults.sharedRiskRate ?? 40,
    sharedRiskThreshold: defaults.sharedRiskThreshold ?? 1.5,
    downsideRiskCap: defaults.downsideRiskCap ?? 8,
    populationHealthBudget: Math.round(contract.attributedLives * 42),
  };
}

export function calculateEstimatedSettlement(contract: Contract): ContractSettlementEstimate {
  const assumptionsSource = contract.vbcTerms ? "contract_terms" : "modeled_defaults";
  const terms = contract.vbcTerms ?? defaultTermsForContract(contract);
  const monthsInPeriod = monthsBetweenInclusive(terms.performancePeriodStart, terms.performancePeriodEnd);

  const benchmarkSpend = terms.benchmarkPmpm * contract.attributedLives * monthsInPeriod;
  const actualSpend = contract.currentPmpm * contract.attributedLives * monthsInPeriod;
  const grossDeltaAmount = benchmarkSpend - actualSpend;
  const grossDeltaPercent = benchmarkSpend === 0 ? 0 : (grossDeltaAmount / benchmarkSpend) * 100;
  const qualityPassed = contract.qualityScore >= terms.qualityGate;

  const savingsThresholdMet = grossDeltaPercent > 0 && grossDeltaPercent >= terms.sharedSavingsThreshold;
  const riskThresholdMet = grossDeltaPercent < 0 && Math.abs(grossDeltaPercent) >= terms.sharedRiskThreshold;

  const thresholdMet = grossDeltaPercent > 0 ? savingsThresholdMet : grossDeltaPercent < 0 ? riskThresholdMet : false;

  const savingsCapAmount = benchmarkSpend * (terms.sharedSavingsCap / 100);
  const riskCapAmount = benchmarkSpend * (terms.downsideRiskCap / 100);

  let status: SettlementStatus = "neutral";
  let estimatedAmount = 0;

  if (grossDeltaAmount > 0) {
    if (!savingsThresholdMet) {
      status = "below_threshold";
    } else if (!qualityPassed) {
      status = "quality_blocked";
    } else if (terms.sharedSavings) {
      status = "shared_savings";
      estimatedAmount = Math.min(grossDeltaAmount * (terms.sharedSavingsRate / 100), savingsCapAmount);
    }
  } else if (grossDeltaAmount < 0) {
    if (!terms.sharedRisk || !riskThresholdMet) {
      status = "below_threshold";
    } else {
      status = "shared_risk";
      const grossLossAbs = Math.abs(grossDeltaAmount);
      const riskAmount = Math.min(grossLossAbs * (terms.sharedRiskRate / 100), riskCapAmount);
      estimatedAmount = -riskAmount;
    }
  }

  const breakdown: SettlementBreakdownRow[] = [
    {
      label: "Performance period",
      value: `${terms.performancePeriodStart} → ${terms.performancePeriodEnd} (${monthsInPeriod} months)`,
    },
    {
      label: "Benchmark PMPM",
      value: `$${terms.benchmarkPmpm.toFixed(2)}`,
    },
    {
      label: "Actual PMPM",
      value: `$${contract.currentPmpm.toFixed(2)}`,
    },
    {
      label: "Attributed lives",
      value: contract.attributedLives.toLocaleString(),
    },
    {
      label: "Gross savings / loss",
      value: `${grossDeltaAmount >= 0 ? "+" : "-"}$${Math.abs(grossDeltaAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })} (${grossDeltaPercent >= 0 ? "+" : ""}${grossDeltaPercent.toFixed(2)}%)`,
      emphasis: grossDeltaAmount >= 0 ? "positive" : "negative",
    },
    {
      label: "Quality gate",
      value: `${contract.qualityScore} vs min ${terms.qualityGate} (${qualityPassed ? "Passed" : "Not met"})`,
      emphasis: qualityPassed ? "positive" : "warning",
    },
    {
      label: "Shared savings settings",
      value: `${terms.sharedSavingsRate}% rate · ${terms.sharedSavingsThreshold}% threshold · ${terms.sharedSavingsCap}% cap`,
    },
    {
      label: "Shared risk settings",
      value: `${terms.sharedRiskRate}% rate · ${terms.sharedRiskThreshold}% threshold · ${terms.downsideRiskCap}% cap`,
    },
  ];

  return {
    status,
    estimatedAmount,
    grossDeltaAmount,
    benchmarkSpend,
    actualSpend,
    grossDeltaPercent,
    qualityPassed,
    thresholdMet,
    monthsInPeriod,
    assumptionsSource,
    terms,
    breakdown,
  };
}
