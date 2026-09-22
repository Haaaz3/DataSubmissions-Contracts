import FeatureGuard from "@/components/FeatureGuard";
import PopulationInsightsView from "@/components/population/PopulationInsightsView";
import { getAggregateContractPopulationSlice } from "@/lib/contracts/contractPopulation";
import type { AgreementDomainKey } from "@/types/agreementScorecard";
import type {
  ContractPopulationCostTierFilter,
  ContractPopulationView,
} from "@/types/contractPopulation";
import type { ScorecardScopeType } from "@/types/scorecardScope";

interface PageProps {
  searchParams?: Promise<{
    scope?: string;
    scopeType?: string;
    scopeId?: string;
    scopeLabel?: string;
    domain?: string;
    metric?: string;
    view?: string;
    costTier?: string;
    engageCount?: string;
    source?: string;
  }>;
}

const scorecardScopeTypes = new Set<ScorecardScopeType>([
  "portfolio",
  "region",
  "market",
  "payor",
  "insuranceSegment",
  "contractType",
  "agreement",
  "contract",
]);

const domainKeys = new Set<AgreementDomainKey>([
  "quality_of_care",
  "utilization_efficiency",
  "cost_management",
  "patient_experience",
  "risk_adjustment",
  "documentation",
]);

function parseScopeType(value?: string): ScorecardScopeType | undefined {
  return value && scorecardScopeTypes.has(value as ScorecardScopeType) ? (value as ScorecardScopeType) : undefined;
}

function parseDomain(value?: string): AgreementDomainKey | undefined {
  return value && domainKeys.has(value as AgreementDomainKey) ? (value as AgreementDomainKey) : undefined;
}

function parseView(value?: string): ContractPopulationView {
  if (value === "denominator" || value === "gaps" || value === "high_cost") return value;
  return "overview";
}

function parseCostTier(value?: string): ContractPopulationCostTierFilter {
  if (value === "top_1" || value === "top_5" || value === "top_10" || value === "all") return value;
  return "top_5";
}

function parseEngageCount(value?: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
}

function formatScopeLabel(scopeType: ScorecardScopeType, scopeId?: string, scopeLabel?: string) {
  if (scopeLabel) return scopeLabel;
  if (scopeType === "portfolio") return "Portfolio";
  return scopeId ?? "Selected scorecard";
}

export default async function ScorecardPopulationPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const scopeType = parseScopeType(query?.scopeType);
  const domainKey = parseDomain(query?.domain);

  if (!scopeType || scopeType === "contract") {
    return (
      <FeatureGuard page="scorecards">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Scorecard population not available</h1>
          <p className="mt-1 text-sm text-slate-600">A valid aggregate scorecard scope is required for this population view.</p>
        </div>
      </FeatureGuard>
    );
  }

  const scopeLabel = formatScopeLabel(scopeType, query?.scopeId, query?.scopeLabel);
  const slice = getAggregateContractPopulationSlice({
    scopeType,
    scopeId: query?.scopeId,
    scopeLabel,
    domainKey,
    metricId: query?.metric,
  });

  if (!slice) {
    return (
      <FeatureGuard page="scorecards">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Scorecard population not available</h1>
          <p className="mt-1 text-sm text-slate-600">No contracts were found for this scorecard population scope.</p>
        </div>
      </FeatureGuard>
    );
  }

  return (
    <FeatureGuard page="scorecards">
      <PopulationInsightsView
        slice={slice}
        scope={scopeType}
        scopeId={query?.scopeId}
        scopeLabel={scopeLabel}
        view={parseView(query?.view)}
        domain={domainKey}
        metric={query?.metric}
        costTier={parseCostTier(query?.costTier)}
        engageCount={parseEngageCount(query?.engageCount)}
        source={query?.source}
      />
    </FeatureGuard>
  );
}
