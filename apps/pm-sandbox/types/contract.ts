import type { SynapseAgentId } from "@/lib/synapseai/agentRegistry";

// Core contract status type used for badges and filtering
export type ContractStatus = "On Track" | "At Risk" | "Off Track";

// Contract type / program model
export type ContractType = "MSSP" | "Medicare Advantage" | "Commercial";

// Value-based care financial/risk model used for portfolio contract-type mix views
export type VbcContractModel = "Pay for Performance" | "Shared Savings" | "Shared Risk" | "Full Risk";

// Business insurance segment used for portfolio scorecard segmentation
export type InsuranceSegment = "Medicare" | "MA" | "Commercial" | "Medicaid" | "ACA";

// A single monthly performance data point for trend charts
export interface MonthlyTrend {
  month: string;       // e.g. "Jan 2024"
  pmpm: number;        // Per Member Per Month spend
  qualityScore: number;
}

// A plain-language recommendation surfaced on the detail page
export interface Opportunity {
  title: string;
  description: string;
  demographics?: {
    ageBands?: string[];
    genders?: string[];
    riskTiers?: string[];
    segments?: string[];
  };
  originAgentId?: SynapseAgentId;
  contributingAgentIds?: SynapseAgentId[];
  executiveSummary?: string;
  confidence?: "High" | "Medium" | "Low";
  impactEstimate?: {
    pmpmDelta?: number;
    revenueLiftPmpm?: number;
    qualityLiftPoints?: number;
    timelineDays?: number;
  };
  ownerRole?: string;
  workflowTypes?: string[];
  projectPlanActions?: string[];
  primaryKpi?: {
    key: string;
    displayName: string;
    baseline: number;
    target: number;
    direction: "up" | "down";
  };
  leadingKpis?: Array<{
    key: string;
    displayName: string;
    baseline: number;
    target: number;
    direction: "up" | "down";
  }>;
}

// Value-based care financial and risk-sharing terms (present on user-created contracts)
export interface VbcTerms {
  performancePeriodStart:  string;   // "YYYY-MM-DD"
  performancePeriodEnd:    string;   // "YYYY-MM-DD"
  benchmarkPmpm:           number;   // historical baseline PMPM
  // Shared savings
  sharedSavings:           boolean;
  sharedSavingsRate:       number;   // % of savings returned to provider (0–100)
  sharedSavingsThreshold:  number;   // min savings % before sharing kicks in
  sharedSavingsCap:        number;   // max % of benchmark spend provider can earn
  qualityGate:             number;   // min quality score to earn any savings (0–100)
  // Downside risk
  sharedRisk:              boolean;
  sharedRiskRate:          number;   // % of losses provider owes (0–100)
  sharedRiskThreshold:     number;   // min loss % before risk sharing kicks in
  downsideRiskCap:         number;   // max % of benchmark spend provider can lose
  // Other
  populationHealthBudget:  number;   // annual $ investment budget
}

// Full contract record — used throughout the app
export interface Contract {
  id: string;
  name: string;
  payor: string;
  region?: string;
  market?: string;
  agreementId?: string;
  contractType: ContractType;
  vbcContractModel?: VbcContractModel;
  insuranceSegment?: InsuranceSegment;
  attributedLives: number;
  currentPmpm: number;      // Current Per Member Per Month spend
  targetPmpm: number;       // Target Per Member Per Month spend
  qualityScore: number;     // 0–100
  edVisitsPer1000: number;  // Emergency Department visits per 1,000 members
  status: ContractStatus;
  trend: MonthlyTrend[];
  opportunities: Opportunity[];
  // Optional VBC terms — present only on user-created contracts
  vbcTerms?: VbcTerms;
  isDraft?: true;
}

// Value-Based Care Agreement (VBCA) container for one or more contracts
export interface ContractAgreement {
  id: string;
  name: string;
  agreementType: "VBCA";
  payors: string[];
  contracts: Contract[];
}
