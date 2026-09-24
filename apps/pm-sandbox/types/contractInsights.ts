import type { AgreementDomainKey } from "@/types/agreementScorecard";
import type { ContractQualityMeasure } from "@/types/quality";

export type FinancialPriorityCategory =
  | "upside"
  | "downside"
  | "quality_salvage"
  | "quick_win"
  | "risk_adjustment";

export type FinancialPriorityItemType = "contract" | "opportunity" | "domain";

export type PriorityConfidence = "High" | "Medium" | "Low" | "Modeled";

export interface FinancialPriorityItem {
  id: string;
  type: FinancialPriorityItemType;
  label: string;
  contractId?: string;
  agreementId?: string;
  domainKey?: AgreementDomainKey;
  category: FinancialPriorityCategory;
  priorityScore: number;
  valueAmount: number;
  displayValue: string;
  confidence: PriorityConfidence;
  timeToImpactDays?: number;
  reasonCodes: string[];
  supportingDetail?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface QualityBlockedMeasureInsight {
  measureId: string;
  measureName: string;
  domain: ContractQualityMeasure["domain"];
  currentRate: number;
  targetRate: number;
  gap: number;
  estimatedContribution: string;
}

export interface QualityBlockedSavingsInsight {
  contractId: string;
  contractName: string;
  blockedSavingsAmount: number;
  qualityScore: number;
  qualityGate: number;
  pointsToThreshold: number;
  topMeasures: QualityBlockedMeasureInsight[];
  suggestedActions: string[];
  ctaLinks: Array<{ label: string; href: string }>;
}

export type AgreementFinancialStatus = "upside" | "downside" | "blocked" | "neutral";

export interface AgreementFinancialContributionRow {
  contractId: string;
  contractName: string;
  attributedLives: number;
  livesSharePercent: number;
  netSettlementEstimate: number;
  grossUpsideAmount: number;
  grossDownsideAmount: number;
  qualityBlockedSavingsAmount: number;
  financialStatus: AgreementFinancialStatus;
  exposureSharePercent: number;
}

export interface AgreementFinancialContributionSummaryInsight {
  label: string;
  description: string;
  tone: "default" | "warning" | "danger" | "positive";
}

export interface AgreementFinancialContributionSummary {
  agreementId: string;
  agreementName: string;
  rows: AgreementFinancialContributionRow[];
  summaryInsights: AgreementFinancialContributionSummaryInsight[];
}
