import type { ContractDomainEconomicRule } from "@/types/contractDomainEconomics";

export type ContractLineOfBusiness =
  | "medicare_advantage"
  | "mssp_aco"
  | "commercial"
  | "medicaid"
  | "exchange"
  | "other";

export type ConfigContractType =
  | "upside_only"
  | "two_sided_risk"
  | "pay_for_performance"
  | "bundle"
  | "capitation_quality"
  | "other";

export type KpiDomain =
  | "cost"
  | "utilization"
  | "quality"
  | "care_gap"
  | "access"
  | "coding_raf"
  | "patient_experience"
  | "operations";

export type KpiUnit = "percent" | "pmpm" | "per_1000" | "currency" | "count" | "score";

export type KpiDirectionality = "higher_is_better" | "lower_is_better" | "target_range";

export type KpiRole = "scored" | "monitored" | "gated";

export type TargetType = "absolute" | "improvement_over_baseline" | "range";

export type IncentiveType =
  | "fixed_payout"
  | "tiered_payout"
  | "per_unit_payout"
  | "weighted_pool"
  | "gate_based_payout";

export type SettlementFrequency = "monthly" | "quarterly" | "annual";

export interface KpiCatalogItem {
  id: string;
  code?: string;
  name: string;
  domain: KpiDomain;
  subcategory?: string;
  description: string;
  unit: KpiUnit;
  directionality: KpiDirectionality;
  cadence: SettlementFrequency | "continuous";
  benchmarkSource?: "historical" | "payor" | "cms" | "internal" | "other";
  defaultTargetType?: TargetType;
  applicableContractTypes?: ConfigContractType[];
  applicableLinesOfBusiness?: ContractLineOfBusiness[];
  active: boolean;
}

export interface ContractMetricSelection {
  id: string;
  contractId: string;
  kpiCatalogItemId: string;
  role: KpiRole;
  displayOrder: number;
  ownerTeam?: string;
  required?: boolean;
}

export interface ContractMetricTarget {
  id: string;
  contractId: string;
  contractMetricSelectionId: string;
  targetType: TargetType;
  baselineValue?: number;
  thresholdValue?: number;
  targetValue?: number;
  stretchValue?: number;
  minRangeValue?: number;
  maxRangeValue?: number;
  weight?: number;
  benchmarkReference?: string;
  performancePeriodLabel?: string;
  directionalityOverride?: KpiDirectionality;
}

export interface IncentiveTier {
  id: string;
  label?: string;
  thresholdValue: number;
  payoutAmount: number;
}

export interface ContractIncentiveRule {
  id: string;
  contractId: string;
  name: string;
  incentiveType: IncentiveType;
  linkedContractMetricSelectionIds: string[];
  payoutBasis: "fixed" | "percent" | "pmpm" | "per_unit" | "pool";
  payoutAmount?: number;
  payoutRate?: number;
  capAmount?: number;
  floorAmount?: number;
  allOrNothing?: boolean;
  tiers?: IncentiveTier[];
  notes?: string;
}

export interface ContractFinancialTerms {
  contractId: string;
  qualityGateEnabled: boolean;
  qualityGateBasis?: "composite_score" | "selected_metric_threshold";
  qualityGateThreshold?: number;
  qualityGateMetricSelectionId?: string;
  incentiveCapAmount?: number;
  downsideCapAmount?: number;
  withholdEnabled?: boolean;
  withholdAmount?: number;
  settlementFrequency: SettlementFrequency;
  assumptionsNote?: string;
  clauseReference?: string;
}

export interface ContractConfiguration {
  contractId: string;
  basics: {
    name: string;
    payer: string;
    lineOfBusiness: ContractLineOfBusiness;
    contractType: ConfigContractType;
    startDate: string;
    endDate?: string;
    performanceYear?: number;
    attributionMethod?: string;
    eligiblePopulationNote?: string;
  };
  selectedMetrics: ContractMetricSelection[];
  metricTargets: ContractMetricTarget[];
  incentiveRules: ContractIncentiveRule[];
  domainEconomicRules?: ContractDomainEconomicRule[];
  financialTerms: ContractFinancialTerms;
  version: number;
  updatedAt: string;
}
