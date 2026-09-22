import type { ScorecardScopeType } from "@/types/scorecardScope";

export function getScorecardHref(scopeType: ScorecardScopeType, id: string) {
  if (scopeType === "portfolio") return "/scorecards";
  if (scopeType === "contract") return `/contracts/${encodeURIComponent(id)}/scorecard`;
  if (scopeType === "agreement") return `/agreements/${id}/scorecard`;
  if (scopeType === "payor") return `/scorecards/payor/${encodeURIComponent(id)}`;
  if (scopeType === "insuranceSegment") return `/scorecards/segment/${encodeURIComponent(id)}`;
  if (scopeType === "contractType") return `/scorecards/contract-type/${encodeURIComponent(id)}`;
  if (scopeType === "region") return `/scorecards/region/${encodeURIComponent(id)}`;
  if (scopeType === "market") return `/scorecards/market/${encodeURIComponent(id)}`;
  return "/scorecards";
}
