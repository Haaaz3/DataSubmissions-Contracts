import type { AgreementDomainKey } from "@/types/agreementScorecard";

export type DomainLineOfBusiness =
  | "medicare_advantage"
  | "mssp_aco"
  | "commercial"
  | "medicaid"
  | "exchange"
  | "other";

export type DomainEconomicMechanism =
  | "bonus"
  | "penalty"
  | "withhold"
  | "gate"
  | "tiered_multiplier"
  | "shared_pool_weight"
  | "risk_adjustment_uplift"
  | "savings_modifier";

export type DomainSettlementBasis =
  | "fixed_amount"
  | "percent_of_savings"
  | "pmpm"
  | "per_gap_closed"
  | "per_star_point"
  | "percent_of_premium"
  | "shared_pool";

export type DomainEconomicDirection = "upside" | "downside" | "both" | "gate_only";

export interface DomainEconomicTier {
  id: string;
  label: string;
  minScore?: number;
  maxScore?: number;
  minAchievementPercent?: number;
  maxAchievementPercent?: number;
  payoutAmount?: number;
  payoutRate?: number;
  penaltyAmount?: number;
  multiplier?: number;
  notes?: string;
}

export interface ContractDomainEconomicRule {
  id: string;
  contractId: string;
  domainKey: AgreementDomainKey;
  lineOfBusiness?: DomainLineOfBusiness;
  mechanism: DomainEconomicMechanism;
  direction: DomainEconomicDirection;
  settlementBasis: DomainSettlementBasis;
  appliesToMetricIds?: string[];
  thresholdScore?: number;
  thresholdValue?: number;
  targetAchievementPercent?: number;
  payoutAmount?: number;
  payoutRate?: number;
  penaltyAmount?: number;
  capAmount?: number;
  floorAmount?: number;
  withholdPercent?: number;
  weight?: number;
  tiers?: DomainEconomicTier[];
  gateBlocksSettlement?: boolean;
  gateBlocksSavingsOnly?: boolean;
  notes?: string;
  clauseReference?: string;
}

export interface DomainEconomicImpact {
  domainKey: AgreementDomainKey;
  domainLabel: string;
  score: number;
  achievementPercent?: number;
  mechanism: DomainEconomicMechanism;
  direction: DomainEconomicDirection;
  estimatedBonusAmount?: number;
  estimatedPenaltyAmount?: number;
  estimatedNetImpactAmount: number;
  settlementBlocked?: boolean;
  settlementModified?: boolean;
  triggeredTierLabel?: string;
  rationale: string;
}

export interface ContractDomainEconomicSummary {
  contractId: string;
  totalDomainBonusAmount: number;
  totalDomainPenaltyAmount: number;
  totalDomainNetImpactAmount: number;
  blockedByDomains: AgreementDomainKey[];
  domainImpacts: DomainEconomicImpact[];
}
