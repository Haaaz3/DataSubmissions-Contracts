import type { ScorecardScopeType } from "@/types/scorecardScope";
import { buildPopulationInsightsHref } from "@/lib/navigation/populationHref";
import type {
  ContractPopulationCostTierFilter,
  ContractPopulationView,
} from "@/types/contractPopulation";

export interface PopulationInsightsHrefParams {
  scopeType: ScorecardScopeType;
  scopeId: string;
  scopeLabel?: string;
  lives?: number;
  source?: string;
}

export interface ContractPopulationInsightsHrefParams {
  contractId: string;
  domain?: string;
  metric?: string;
  view?: ContractPopulationView;
  costTier?: ContractPopulationCostTierFilter;
  engageCount?: number;
  source?: string;
}

export function getContractPopulationInsightsHref({
  contractId,
  domain,
  metric,
  view,
  costTier,
  engageCount,
  source,
}: ContractPopulationInsightsHrefParams) {
  return buildPopulationInsightsHref({
    scope: "contract",
    id: contractId,
    domain,
    metric,
    view,
    costTier,
    engageCount,
    source,
  });
}

export function getPopulationInsightsHref({
  scopeType,
  scopeId,
  scopeLabel,
  source = "scorecard-lives",
}: PopulationInsightsHrefParams) {
  if (scopeType === "contract") {
    return getContractPopulationInsightsHref({ contractId: scopeId, source });
  }

  return buildPopulationInsightsHref({
    scope: scopeType,
    id: scopeId,
    label: scopeLabel,
    source,
  });
}
