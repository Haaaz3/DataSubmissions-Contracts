import { ImpactType, InsightPriority } from "./population";

export type EffortLevel = "Low" | "Medium" | "High";
export type GapSeverity = "critical" | "moderate" | "minor";

/** The measurable performance problem on the contract side */
export interface PerformanceGap {
  metric: string;    // e.g. "PMPM Spend", "Quality Score", "Readmission Rate"
  current: string;   // e.g. "$980 / mo"
  target: string;    // e.g. "$920 target"
  delta: string;     // e.g. "$60 over target"
  severity: GapSeverity;
}

/** The population health factor driving the performance gap */
export interface PopulationDriver {
  summary: string;       // short label shown in the chain box
  detail: string;        // one-sentence supporting stat
  memberCount?: number;  // number of members affected
}

/** A fully linked action — contract gap → population cause → recommended fix */
export interface ActionItem {
  id: string;
  contractId: string;
  priority: InsightPriority;
  title: string;
  performanceGap: PerformanceGap;
  populationDriver: PopulationDriver;
  recommendedAction: string;
  estimatedImpact: string;   // e.g. "~$22 PMPM savings"
  timeToImpact: string;      // e.g. "90–120 days"
  effort: EffortLevel;
  impactTypes: ImpactType[];
}
