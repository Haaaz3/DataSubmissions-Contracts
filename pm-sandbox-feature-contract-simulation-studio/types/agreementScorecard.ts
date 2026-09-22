import type { ContractStatus } from "@/types/contract";
import type { TrendDirection } from "@/types/cohort";

export type AgreementDomainKey =
  | "quality_of_care"
  | "utilization_efficiency"
  | "cost_management"
  | "patient_experience"
  | "risk_adjustment"
  | "documentation";

export type AgreementMetricUnit =
  | "percent"
  | "rate_per_1000"
  | "currency_pmpm"
  | "days"
  | "count"
  | "index";

export type ScorecardMetricStatus = "on_track" | "watch" | "at_risk";

export interface StarRatingValue {
  value: number;
  max?: number;
  label?: string;
}

export interface ScorecardFinancialValue {
  achievedDollars?: number;
  potentialDollars?: number;
  blockedDollars?: number;
}

export interface ScorecardCalculationComponent {
  label: string;
  value: number;
  displayValue?: string;
  description?: string;
}

export interface ScorecardMetricThreshold {
  id: string;
  label: string;
  value: number;
  stars?: number;
  kind?: "floor" | "target" | "stretch" | "benchmark" | "bonus";
  description?: string;
}

export interface ScorecardMetric {
  id: string;
  label: string;
  description: string;
  unit: AgreementMetricUnit;
  currentValue: number;
  targetValue: number;
  benchmarkValue?: number;
  trendDirection: TrendDirection;
  trendPercent: number;
  status: ScorecardMetricStatus;
  currentStars: number;
  targetStars: number;
  benchmarkStars?: number;
  currentlyAchievedLabel?: string;
  achievedDollars?: number;
  potentialDollars?: number;
  blockedDollars?: number;
  thresholds?: ScorecardMetricThreshold[];
  primaryTargetThresholdId?: string;
  benchmarkThresholdId?: string;
  calculationNotes?: string[];
  achievedDollarComponents?: ScorecardCalculationComponent[];
  potentialDollarComponents?: ScorecardCalculationComponent[];
  starCalculationExplanation?: string;
  weight?: number;
  populationCount?: number;
  populationLabel?: string;
}

export interface ScorecardDomain {
  key: AgreementDomainKey;
  label: string;
  description: string;
  score: number;
  status: ScorecardMetricStatus;
  trendDirection: TrendDirection;
  trendPercent: number;
  executiveInsight: string;
  metrics: ScorecardMetric[];
  currentStars: number;
  targetStars: number;
  benchmarkStars?: number;
  achievedDollars: number;
  potentialDollars: number;
  blockedDollars?: number;
  currentlyAchievedSummary?: string;
  calculationNotes?: string[];
  achievedDollarComponents?: ScorecardCalculationComponent[];
  potentialDollarComponents?: ScorecardCalculationComponent[];
  starCalculationExplanation?: string;
}

export interface ContractScorecard {
  contractId: string;
  contractName: string;
  payor: string;
  asOfDate: string;
  overallScore: number;
  overallStars: number;
  status: ContractStatus;
  headline: string;
  domains: ScorecardDomain[];
  achievedDollars?: number;
  potentialDollars?: number;
  blockedDollars?: number;
}

export interface AgreementScorecardContributor {
  contractId: string;
  contractName: string;
  contractStatus: ContractStatus;
  attributedLives: number;
  qualityScore: number;
  livesSharePercent: number;
  qualityContributionPercent: number;
}

export interface AgreementScorecard {
  agreementId: string;
  agreementName: string;
  payors: string[];
  asOfDate: string;
  overallScore: number;
  overallStars: number;
  status: ContractStatus;
  headline: string;
  totalAttributedLives: number;
  contractsCount: number;
  qualityRollup: number;
  domains: ScorecardDomain[];
  contributors: AgreementScorecardContributor[];
  achievedDollars?: number;
  potentialDollars?: number;
  blockedDollars?: number;
}
