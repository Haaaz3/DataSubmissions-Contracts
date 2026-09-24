import type { ScorecardDomain } from "@/types/agreementScorecard";
import type { ContractStatus } from "@/types/contract";
import type { ScorecardScopeRef, ScorecardScopeType } from "@/types/scorecardScope";

export interface ScorecardChildSummary {
  id: string;
  label: string;
  scopeType: ScorecardScopeType;
  overallScore: number;
  status: ContractStatus;
  attributedLives: number;
  settlementEstimate: number;
  costAmount: number;
  vbcEarnedDollars: number;
  vbcPotentialDollars: number;
  remainingVbcOpportunity: number;
  qualityBlockedSavingsAmount: number;
  qualityScore: number;
  edVisitsPer1000: number;
  achievedDollars: number;
  potentialDollars: number;
  domains: ScorecardDomain[];
  strongestDomain?: string;
  weakestDomain?: string;
  href?: string;
}

export interface ScorecardRollup {
  scope: ScorecardScopeRef;
  headline: string;
  overallScore: number;
  status: ContractStatus;
  asOfDate: string;
  totalAttributedLives: number;
  contractsCount: number;
  agreementsCount?: number;
  payors?: string[];
  qualityRollup: number;
  edRollup: number;
  netSettlementEstimate: number;
  upsideOpportunity: number;
  downsideExposure: number;
  qualityBlockedUpside: number;
  atRiskLives: number;
  statusMix: {
    onTrack: number;
    atRisk: number;
    offTrack: number;
  };
  domains: ScorecardDomain[];
  children: ScorecardChildSummary[];
}

export interface RemainingOpportunityContext {
  rank: number;
  total: number;
  sharePercent: number;
  lensLabelPlural: string;
}

export interface ScorecardShareContext {
  sharePercent: number;
  scopeLabel: "portfolio";
}
