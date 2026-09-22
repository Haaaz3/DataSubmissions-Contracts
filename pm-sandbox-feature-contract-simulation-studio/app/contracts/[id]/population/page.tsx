import FeatureGuard from "@/components/FeatureGuard";
import PopulationInsightsView from "@/components/population/PopulationInsightsView";
import { getContractPopulationSlice } from "@/lib/contracts/contractPopulation";
import { mockContracts } from "@/lib/mockData";
import type { AgreementDomainKey } from "@/types/agreementScorecard";
import type {
  ContractPopulationCostTierFilter,
  ContractPopulationView,
} from "@/types/contractPopulation";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    scope?: string;
    domain?: string;
    metric?: string;
    view?: string;
    costTier?: string;
    engageCount?: string;
    source?: string;
  }>;
}

const domainKeys = new Set<AgreementDomainKey>([
  "quality_of_care",
  "utilization_efficiency",
  "cost_management",
  "patient_experience",
  "risk_adjustment",
  "documentation",
]);

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

export default async function ContractPopulationPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const contract = mockContracts.find((item) => item.id === id);
  const domainKey = parseDomain(query?.domain);
  const slice = getContractPopulationSlice({
    contractId: id,
    domainKey,
    metricId: query?.metric,
  });

  if (!contract || !slice) {
    return (
      <FeatureGuard page="contracts">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Contract population not available</h1>
          <p className="mt-1 text-sm text-slate-600">This population view currently supports seeded mock contracts.</p>
        </div>
      </FeatureGuard>
    );
  }

  return (
    <FeatureGuard page="contracts">
      <PopulationInsightsView
        slice={slice}
        scope="contract"
        scopeId={id}
        scopeLabel={contract.name}
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

export function generateStaticParams() {
  return mockContracts.map((contract) => ({ id: contract.id }));
}
