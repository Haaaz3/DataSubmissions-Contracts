import type { AgreementDomainKey } from "@/types/agreementScorecard";
import type { ScorecardScopeType } from "@/types/scorecardScope";

export type ContractPopulationScope = "contract" | "domain" | "metric";
export type ContractPopulationView = "overview" | "denominator" | "gaps" | "high_cost";
export type ContractPopulationCostTierFilter = "all" | "top_1" | "top_5" | "top_10";

export interface ContractPopulationPatient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: string;
  zipCode: string;
  attributedProvider: string;
  distanceToCareMiles: number;
  chronicConditions: string[];
  chronicConditionCount: number;
  lastAttributedVisitYearsAgo: number;
  totalCostOfCare: number;
  pmpm: number;
  edVisits: number;
  snfAdmits: number;
  snfDays: number;
  hasOpenGap: boolean;
  relatedMetricIds: string[];
  sourceContractId?: string;
  sourceContractName?: string;
  sourceContractPayor?: string;
  sourceContractType?: string;
}

export interface ContractPopulationDistributionBucket {
  label: string;
  count: number;
  percent: number;
}

export interface ContractPopulationCostConcentrationTier {
  tier: "Top 1%" | "Top 5%" | "Top 10%";
  patientCount: number;
  totalCost: number;
  percentOfTotalCost: number;
}

export interface ContractPopulationContractMixItem {
  contractId: string;
  contractName: string;
  payor: string;
  contractType: string;
  attributedLives: number;
  patientRecords: number;
  percentOfRepresentedLives: number;
}

export interface ContractPopulationSlice {
  contractId: string;
  scope: ContractPopulationScope;
  scorecardScope?: {
    type: ScorecardScopeType;
    id: string;
    label: string;
  };
  domainKey?: AgreementDomainKey;
  metricId?: string;
  label: string;
  description: string;
  representedLives: number;
  contractCount: number;
  contractMix?: ContractPopulationContractMixItem[];
  totalPatients: number;
  denominatorPatients: ContractPopulationPatient[];
  gapPatients: ContractPopulationPatient[];
  highCostPatients: ContractPopulationPatient[];
  summary: {
    totalCostOfCare: number;
    pmpm: number;
    edVisitsPer1000: number;
    snfUtilizationPer1000: number;
    avgSnfLengthOfStay: number;
    edCostImpact: number;
    snfCostImpact: number;
    avoidableUtilizationCost: number;
    highCostConcentrationCost: number;
  };
  distributions: {
    age: ContractPopulationDistributionBucket[];
    sex: ContractPopulationDistributionBucket[];
    zip: ContractPopulationDistributionBucket[];
    distanceToCare: ContractPopulationDistributionBucket[];
    chronicConditions: ContractPopulationDistributionBucket[];
    chronicConditionBurden: ContractPopulationDistributionBucket[];
    seenHistory: ContractPopulationDistributionBucket[];
  };
  costConcentration: ContractPopulationCostConcentrationTier[];
}
