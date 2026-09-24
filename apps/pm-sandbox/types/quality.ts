import { TrendDirection } from "./cohort";

export type MeasureDomain =
  | "Preventive"
  | "Chronic"
  | "Medication"
  | "Utilization"
  | "Patient Safety";

export interface QualityMeasure {
  id: string;
  name: string;
  shortName: string;
  domain: MeasureDomain;
  description: string;
  targetPercent: number;
  benchmarkPercent: number;
  numeratorLabel: string;
  denominatorLabel: string;
}

export interface MeasurePerformance {
  contractId?: string; // undefined = portfolio aggregate
  measureId: string;
  ratePercent: number;
  eligibleMembers: number;
  gapMembers: number;
  trendDirection: TrendDirection;
  trendPercent: number;
  lastUpdated: string; // e.g. "Feb 2025"
}

export interface ContractQualityMeasure extends QualityMeasure {
  performance: MeasurePerformance;
}