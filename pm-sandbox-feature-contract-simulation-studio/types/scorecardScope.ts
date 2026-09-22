export type ScorecardScopeType =
  | "portfolio"
  | "region"
  | "market"
  | "payor"
  | "insuranceSegment"
  | "contractType"
  | "agreement"
  | "contract";

export interface ScorecardScopeRef {
  type: ScorecardScopeType;
  id: string;
  label: string;
  parent?: {
    type: ScorecardScopeType;
    id: string;
    label: string;
  };
}
