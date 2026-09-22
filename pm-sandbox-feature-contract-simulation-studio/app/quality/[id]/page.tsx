"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import SummaryCard from "@/components/SummaryCard";
import FeatureGuard from "@/components/FeatureGuard";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import { mockContracts } from "@/lib/mockData";
import { getMeasuresForContract, getOrganizationQualityRows, getProviderQualityRows, toFinancialBand } from "@/lib/qualityData";

type SortDirection = "asc" | "desc";

function sortRows<T>(rows: T[], key: keyof T, direction: SortDirection) {
  return [...rows].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }
    return direction === "asc" ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });
}

function SortHeader({ label }: { label: string }) {
  return <span className="inline-flex items-center gap-1">{label}<span className="text-[10px] text-slate-400">↕</span></span>;
}

export default function ContractQualityPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { flags } = useFeatureFlags();
  const contract = mockContracts.find((c) => c.id === resolvedParams.id);

  const contractId = contract?.id ?? "";
  const measures = getMeasuresForContract(contractId);
  const avgPerformance = measures.length
    ? Math.round(measures.reduce((sum, m) => sum + m.performance.ratePercent, 0) / measures.length)
    : (contract?.qualityScore ?? 0);
  const totalGaps = measures.reduce((sum, m) => sum + m.performance.gapMembers, 0);
  const totalEligible = measures.reduce((sum, m) => sum + m.performance.eligibleMembers, 0);
  const belowTarget = measures.filter((m) => m.performance.ratePercent < m.targetPercent).length;

  const orgRows = useMemo(() => getOrganizationQualityRows({ contractId }), [contractId]);
  const providerRows = useMemo(() => getProviderQualityRows({ contractId }), [contractId]);

  const measureRows = useMemo(
    () => measures.map((measure) => ({
      id: measure.id,
      shortName: measure.shortName,
      domain: measure.domain,
      status: measure.performance.ratePercent >= measure.targetPercent ? "Full Credit" : measure.performance.ratePercent >= measure.targetPercent - 5 ? "Partial Credit" : "No Credit",
      current: measure.performance.ratePercent,
      target: measure.targetPercent,
      careGaps: measure.performance.gapMembers,
      financialImpact: Math.round(measure.performance.gapMembers * 230),
    })),
    [measures]
  );

  const [measureSort, setMeasureSort] = useState<{ key: string; dir: SortDirection }>({ key: "financialImpact", dir: "desc" });
  const [orgSort, setOrgSort] = useState<{ key: string; dir: SortDirection }>({ key: "qualityScore", dir: "desc" });
  const [providerSort, setProviderSort] = useState<{ key: string; dir: SortDirection }>({ key: "qualityScore", dir: "desc" });

  const sortedMeasures = useMemo(() => sortRows(measureRows, measureSort.key as keyof (typeof measureRows)[number], measureSort.dir), [measureRows, measureSort]);
  const sortedOrganizations = useMemo(() => sortRows(orgRows, orgSort.key as keyof (typeof orgRows)[number], orgSort.dir), [orgRows, orgSort]);
  const sortedProviders = useMemo(() => sortRows(providerRows, providerSort.key as keyof (typeof providerRows)[number], providerSort.dir), [providerRows, providerSort]);

  const toggleSort = <T,>(current: { key: keyof T; dir: SortDirection }, setState: (value: { key: keyof T; dir: SortDirection }) => void, key: keyof T) => {
    setState({ key, dir: current.key === key && current.dir === "desc" ? "asc" : "desc" });
  };

  const populationMeasureByQualityId: Record<string, string> = {
    "a1c-control": "A1c Control",
    "colorectal-screen": "Colorectal Screening",
    "breast-screen": "Breast Screening",
    "statin-adherence": "Medication Adherence",
    "bp-control": "Follow-up after ED",
    "followup-hosp": "Post Discharge Follow-up",
    "copd-controller": "COPD Management",
    "ed-avoidance": "Follow-up after ED",
  };

  const buildPopulationHref = (filters: Partial<Record<"measure" | "organization" | "provider" | "payer" | "measureStatus", string>>) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    const params = query.toString();
    return params ? `/population?${params}` : "/population";
  };

  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const formatFinancial = (value: number) => (flags.showFinancialData ? currency.format(value) : toFinancialBand(value));

  if (!contract) {
    return <div className="py-20 text-center text-slate-500">Contract not found.</div>;
  }

  return (
    <FeatureGuard page="quality">
      <div className="space-y-8">
        <Link href="/quality" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">← Back to Quality</Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">{contract.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{contract.payor} · {contract.contractType} · {contract.attributedLives.toLocaleString()} lives</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Average Performance" value={`${avgPerformance}%`} description="Across contract measures" />
          <SummaryCard label="Measures Below Target" value={belowTarget} description="Quality gaps in scope" accent="text-amber-600" />
          <SummaryCard
            label="Eligible Members"
            value={<Link href={buildPopulationHref({ payer: contract.payor })} className="underline decoration-dotted underline-offset-4 hover:text-indigo-700">{totalEligible.toLocaleString()}</Link>}
            description="Members in denominators"
          />
          <SummaryCard
            label="Care Gaps"
            value={<Link href={buildPopulationHref({ payer: contract.payor, measureStatus: "Open" })} className="underline decoration-dotted underline-offset-4 hover:text-indigo-700">{totalGaps.toLocaleString()}</Link>}
            description="Members missing closure"
            accent="text-red-600"
          />
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Contract Measure Performance</h2>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="min-w-full divide-y divide-slate-100">
              <thead><tr className="bg-slate-50">{[["Measure", "shortName"], ["Domain", "domain"], ["Status", "status"], ["Current", "current"], ["Target", "target"], ["Care Gaps", "careGaps"], ["Financial Impact", "financialImpact"]].map(([header, key]) => <th key={header} onClick={() => toggleSort(measureSort as never, setMeasureSort as never, key as never)} className="cursor-pointer px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"><SortHeader label={header} /></th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">{sortedMeasures.map((measure) => <tr key={measure.id}><td className="px-4 py-2.5 text-xs font-semibold text-slate-900">{measure.shortName}</td><td className="px-4 py-2.5 text-xs text-slate-600">{measure.domain}</td><td className="px-4 py-2.5 text-xs text-slate-600">{measure.status}</td><td className="px-4 py-2.5 text-xs text-slate-700">{measure.current}%</td><td className="px-4 py-2.5 text-xs text-slate-700">{measure.target}%</td><td className="px-4 py-2.5 text-xs text-slate-700"><Link href={buildPopulationHref({ payer: contract.payor, measure: populationMeasureByQualityId[measure.id] ?? measure.shortName })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{measure.careGaps.toLocaleString()}</Link></td><td className="px-4 py-2.5 text-xs font-semibold text-emerald-700">{formatFinancial(measure.financialImpact)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-900">Organizations</h3>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <table className="min-w-full divide-y divide-slate-100"><thead><tr className="bg-slate-50">{[["Organization", "organizationName"], ["Type", "type"], ["Region", "region"], ["Providers", "providerCount"], ["Eligible", "eligibleMembers"], ["Quality", "qualityScore"], ["Gaps", "careGaps"], ["Financial", "estimatedFinancialImpact"]].map(([header, key]) => <th key={header} onClick={() => toggleSort(orgSort as never, setOrgSort as never, key as never)} className="cursor-pointer px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"><SortHeader label={header} /></th>)}</tr></thead><tbody className="divide-y divide-slate-100">{sortedOrganizations.map((org, idx) => <tr key={org.id}><td className="px-3 py-2 text-xs font-semibold text-slate-900">#{idx + 1} {org.organizationName}</td><td className="px-3 py-2 text-xs text-slate-600">{org.type}</td><td className="px-3 py-2 text-xs text-slate-600">{org.region}</td><td className="px-3 py-2 text-xs text-slate-600">{org.providerCount}</td><td className="px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ organization: org.organizationName })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{org.eligibleMembers.toLocaleString()}</Link></td><td className="px-3 py-2 text-xs font-semibold text-slate-900">{org.qualityScore}</td><td className="px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ organization: org.organizationName, measureStatus: "Open" })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{org.careGaps.toLocaleString()}</Link></td><td className="px-3 py-2 text-xs font-semibold text-emerald-700">{formatFinancial(org.estimatedFinancialImpact)}</td></tr>)}</tbody></table>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-900">Providers</h3>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <table className="min-w-full divide-y divide-slate-100"><thead><tr className="bg-slate-50">{[["Provider", "providerName"], ["Specialty", "specialty"], ["Organization", "organizationName"], ["Eligible", "eligibleMembers"], ["Quality", "qualityScore"], ["Gaps", "careGaps"], ["Closure", "closureRate"], ["Financial", "estimatedFinancialImpact"]].map(([header, key]) => <th key={header} onClick={() => toggleSort(providerSort as never, setProviderSort as never, key as never)} className="cursor-pointer px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"><SortHeader label={header} /></th>)}</tr></thead><tbody className="divide-y divide-slate-100">{sortedProviders.map((provider, idx) => <tr key={provider.id}><td className="px-3 py-2 text-xs font-semibold text-slate-900">#{idx + 1} {provider.providerName}</td><td className="px-3 py-2 text-xs text-slate-600">{provider.specialty}</td><td className="px-3 py-2 text-xs text-slate-600">{provider.organizationName}</td><td className="px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ provider: provider.providerName })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{provider.eligibleMembers.toLocaleString()}</Link></td><td className="px-3 py-2 text-xs font-semibold text-slate-900">{provider.qualityScore}</td><td className="px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ provider: provider.providerName, measureStatus: "Open" })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{provider.careGaps.toLocaleString()}</Link></td><td className="px-3 py-2 text-xs text-slate-600">{provider.closureRate}%</td><td className="px-3 py-2 text-xs font-semibold text-emerald-700">{formatFinancial(provider.estimatedFinancialImpact)}</td></tr>)}</tbody></table>
            </div>
          </div>
        </div>
      </div>
    </FeatureGuard>
  );
}
