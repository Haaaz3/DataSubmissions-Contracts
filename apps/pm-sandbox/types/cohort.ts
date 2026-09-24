import { ContractType } from "./contract";
import { ImpactType, InsightPriority } from "./population";

export type CohortCategory =
  | "Rising Risk"
  | "Utilization"
  | "Quality Gap"
  | "Chronic Disease"
  | "Social Risk"
  | "Risk Adjustment"
  | "Post-Acute Risk";

export type CohortStatus = "Watch" | "Action Needed" | "Improving";
export type TrendDirection = "up" | "down" | "stable";
export type CohortContractType = ContractType | "Portfolio-Wide";

export interface CohortKeyMetrics {
  edVisitsPer1000:    number;
  admissionsPer1000:  number;
  readmissionsRate:   number;   // percent
  qualityGapPercent:  number;   // percent of members with a quality gap
  avgRiskScore:       number;   // HCC-style 0.0–5.0
}

export interface CohortTrendPoint {
  label:       string;   // e.g. "Jan"
  memberCount: number;
}

export interface Cohort {
  id:                   string;
  name:                 string;
  contractId?:          string;       // undefined = portfolio-wide
  contractName?:        string;
  contractType:         CohortContractType;
  category:             CohortCategory;
  description:          string;
  memberCount:          number;
  percentOfPopulation:  number;       // 0–100
  trendDirection:       TrendDirection;
  trendPercent:         number;       // e.g. 12 means "up 12%"
  priority:             InsightPriority;
  impactAreas:          ImpactType[];
  topConditions:        string[];
  keyMetrics:           CohortKeyMetrics;
  whyItMatters:         string;
  recommendedAction:    string;
  opportunitySummary:   string;
  visualTagline:        string;
  membersPreviewCount:  number;       // mock "recently flagged" count
  status:               CohortStatus;
  interventionIdeas:    string[];     // 2–3 plain-language ideas
  trendHistory:         CohortTrendPoint[];  // 3 months mock
}
