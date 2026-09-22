import type { ContractPopulationCostTierFilter, ContractPopulationView } from "@/types/contractPopulation";
import type { ScorecardScopeType } from "@/types/scorecardScope";

export function buildPopulationInsightsHref(params: {
  scope: ScorecardScopeType;
  id?: string;
  label?: string;
  source?: string;
  domain?: string;
  metric?: string;
  view?: ContractPopulationView;
  costTier?: ContractPopulationCostTierFilter;
  engageCount?: number;
}) {
  const search = new URLSearchParams();
  search.set("scope", "lives");
  if (params.domain) search.set("domain", params.domain);
  if (params.metric) search.set("metric", params.metric);
  if (params.view && params.view !== "overview") search.set("view", params.view);
  if (params.costTier && params.costTier !== "top_5") search.set("costTier", params.costTier);
  if (typeof params.engageCount === "number" && Number.isFinite(params.engageCount) && params.engageCount > 0) {
    search.set("engageCount", String(Math.floor(params.engageCount)));
  }
  if (params.source) search.set("source", params.source);

  if (params.scope === "contract" && params.id) {
    return `/contracts/${encodeURIComponent(params.id)}/population?${search.toString()}`;
  }

  search.set("scopeType", params.scope);
  if (params.id) search.set("scopeId", params.id);
  if (params.label) search.set("scopeLabel", params.label);

  return `/scorecards/population?${search.toString()}`;
}
