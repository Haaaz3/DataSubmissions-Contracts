import Link from "next/link";
import CostConcentrationWorkbench from "@/components/population/CostConcentrationWorkbench";
import PopulationSecondaryPatientListGate from "@/components/population/PopulationSecondaryPatientListGate";
import { getCostTierPatients } from "@/lib/contracts/costTierPatients";
import { buildPopulationInsightsHref } from "@/lib/navigation/populationHref";
import { getScorecardHref } from "@/lib/scorecards/navigation";
import type {
  ContractPopulationCostTierFilter,
  ContractPopulationDistributionBucket,
  ContractPopulationPatient,
  ContractPopulationSlice,
  ContractPopulationView,
} from "@/types/contractPopulation";
import type { ScorecardScopeType } from "@/types/scorecardScope";

const viewLabels: Record<ContractPopulationView, string> = {
  overview: "Overview",
  denominator: "Denominator Patients",
  gaps: "Patients with Gaps",
  high_cost: "High-Expense Patients",
};

const scopeLabels: Record<ScorecardScopeType, string> = {
  portfolio: "Portfolio",
  region: "Region",
  market: "Market",
  payor: "Payor",
  insuranceSegment: "Insurance Segment",
  contractType: "Contract Type",
  agreement: "Agreement",
  contract: "Contract",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCompactMoney(value: number) {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return formatMoney(value);
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

function SegmentedDistribution({
  title,
  items,
  palette = "indigo",
}: {
  title: string;
  items: ContractPopulationDistributionBucket[];
  palette?: "indigo" | "emerald" | "amber";
}) {
  const colors = {
    indigo: ["bg-indigo-200", "bg-indigo-300", "bg-indigo-400", "bg-indigo-500", "bg-indigo-600", "bg-indigo-700"],
    emerald: ["bg-emerald-200", "bg-emerald-300", "bg-emerald-400", "bg-emerald-500", "bg-emerald-600", "bg-emerald-700"],
    amber: ["bg-amber-200", "bg-amber-300", "bg-amber-400", "bg-amber-500", "bg-amber-600", "bg-amber-700"],
  }[palette];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100">
        {items.filter((item) => item.count > 0).map((item, index) => (
          <div
            key={item.label}
            className={colors[index % colors.length]}
            style={{ width: `${Math.max(item.percent, 2)}%` }}
            title={`${item.label}: ${formatNumber(item.count)} (${item.percent}%)`}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-slate-600">{item.label}</span>
            <span className="tabular-nums text-slate-400">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type PyramidAgeBand = {
  label: string;
  min: number;
  max?: number;
};

const pyramidAgeBands: PyramidAgeBand[] = [
  { label: "95+", min: 95 },
  { label: "85-94", min: 85, max: 94 },
  { label: "75-84", min: 75, max: 84 },
  { label: "65-74", min: 65, max: 74 },
  { label: "55-64", min: 55, max: 64 },
  { label: "45-54", min: 45, max: 54 },
  { label: "35-44", min: 35, max: 44 },
  { label: "34 & Under", min: 0, max: 34 },
];

function isInAgeBand(age: number, band: PyramidAgeBand) {
  return age >= band.min && (typeof band.max === "undefined" || age <= band.max);
}

function PopulationPyramidChart({ patients }: { patients: ContractPopulationPatient[] }) {
  const rows = pyramidAgeBands.map((band) => {
    const bandPatients = patients.filter((patient) => isInAgeBand(patient.age, band));
    const female = bandPatients.filter((patient) => patient.sex.toUpperCase() === "F").length;
    const male = bandPatients.filter((patient) => patient.sex.toUpperCase() === "M").length;
    return { ...band, female, male };
  });
  const femaleTotal = rows.reduce((sum, row) => sum + row.female, 0);
  const maleTotal = rows.reduce((sum, row) => sum + row.male, 0);
  const otherTotal = patients.length - femaleTotal - maleTotal;
  const maxCount = Math.max(...rows.flatMap((row) => [row.female, row.male]), 1);

  return (
    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-end gap-2 border-b border-slate-100 pb-1.5 text-xs font-semibold text-slate-700">
        <div className="text-center text-emerald-700">Female</div>
        <div className="text-center text-slate-500">Age Group</div>
        <div className="text-center text-emerald-900">Male</div>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center gap-2 py-1">
            <div className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-1.5">
              <span className="text-right text-xs tabular-nums text-slate-600">{formatNumber(row.female)}</span>
              <div className="flex justify-end border-r border-dashed border-emerald-200 pr-0.5">
                <div
                  className="h-5 rounded-l-md bg-emerald-200 shadow-sm"
                  style={{ width: `${Math.max(row.female ? 4 : 0, (row.female / maxCount) * 100)}%` }}
                  title={`Female ${row.label}: ${formatNumber(row.female)}`}
                />
              </div>
            </div>
            <div className="text-center text-xs font-medium text-slate-600">{row.label}</div>
            <div className="grid grid-cols-[minmax(0,1fr)_36px] items-center gap-1.5">
              <div className="border-l border-dashed border-emerald-900/20 pl-0.5">
                <div
                  className="h-5 rounded-r-md bg-emerald-900 shadow-sm"
                  style={{ width: `${Math.max(row.male ? 4 : 0, (row.male / maxCount) * 100)}%` }}
                  title={`Male ${row.label}: ${formatNumber(row.male)}`}
                />
              </div>
              <span className="text-xs tabular-nums text-slate-600">{formatNumber(row.male)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center gap-2 border-t border-slate-100 pt-1.5 text-sm font-bold tabular-nums text-slate-900">
        <div className="pl-2">{formatNumber(femaleTotal)}</div>
        <div className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total</div>
        <div className="pr-2 text-right">{formatNumber(maleTotal)}</div>
      </div>
      {otherTotal > 0 ? (
        <p className="mt-2 text-center text-[11px] text-slate-400">
          {formatNumber(otherTotal)} patients categorized as Other/Unknown are excluded from the mirrored sex bars.
        </p>
      ) : null}
    </div>
  );
}

function OperationalMetricStrip({ slice }: { slice: ContractPopulationSlice }) {
  const metrics = [
    {
      label: "Covered Lives",
      value: formatNumber(slice.representedLives),
      description: `${formatNumber(slice.totalPatients)} modeled records`,
    },
    {
      label: "Total Expense Impact",
      value: formatCompactMoney(slice.summary.totalCostOfCare),
      description: "Annual modeled-population spend",
    },
    { label: "Risk Adjusted PMPM", value: formatMoney(slice.summary.pmpm), description: "Modeled population" },
    {
      label: "ED Visits / 1,000",
      value: formatNumber(slice.summary.edVisitsPer1000),
      description: `${formatCompactMoney(slice.summary.edCostImpact)} expense impact`,
    },
    {
      label: "SNF / 1,000",
      value: formatNumber(slice.summary.snfUtilizationPer1000),
      description: `${formatCompactMoney(slice.summary.snfCostImpact)} expense impact`,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{metric.value}</p>
          <p className="mt-0.5 text-xs text-slate-400">{metric.description}</p>
        </div>
      ))}
    </section>
  );
}

function PopulationCompositionPanel({ slice }: { slice: ContractPopulationSlice }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Population Composition</h2>
          <p className="mt-1 text-xs text-slate-500">Age, sex, and chronic burden profile.</p>
        </div>
        <span className="mt-0.5 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition group-open:border-indigo-200 group-open:bg-indigo-50 group-open:text-indigo-700">
          <span className="group-open:hidden">Expand</span>
          <span className="hidden group-open:inline">Collapse</span>
        </span>
      </summary>
      <div className="border-t border-slate-100 px-5 pb-5 pt-5">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Age & Sex Distribution</p>
            <PopulationPyramidChart patients={slice.denominatorPatients} />
          </div>
          <SegmentedDistribution title="Chronic Burden" items={slice.distributions.chronicConditionBurden} palette="amber" />
        </div>
      </div>
    </details>
  );
}

function ClinicalBurdenRecencyPanel({ slice }: { slice: ContractPopulationSlice }) {
  const conditionBars = slice.distributions.chronicConditions.slice(0, 6);
  const topCondition = conditionBars[0];
  const maxCondition = Math.max(...conditionBars.map((item) => item.count), 1);
  const maxSeen = Math.max(...slice.distributions.seenHistory.map((item) => item.count), 1);

  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Clinical Burden & Attribution Recency</h2>
          <p className="mt-1 text-xs text-slate-500">Top chronic conditions and recent attributed-provider engagement.</p>
        </div>
        <span className="mt-0.5 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition group-open:border-indigo-200 group-open:bg-indigo-50 group-open:text-indigo-700">
          <span className="group-open:hidden">Expand</span>
          <span className="hidden group-open:inline">Collapse</span>
        </span>
      </summary>
      <div className="border-t border-slate-100 px-5 pb-5 pt-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top Chronic Conditions</p>
                <p className="mt-1 text-xs text-slate-500">Clinical profile of the selected population.</p>
              </div>
              {topCondition ? <p className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700">Lead: {topCondition.label}</p> : null}
            </div>
            <div className="mt-5 flex h-52 items-end gap-3 border-b border-rose-100 px-1 pb-2">
              {conditionBars.map((item) => {
                const height = Math.max(12, (item.count / maxCondition) * 100);
                return (
                  <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end">
                    <span className="mb-2 text-xs font-bold tabular-nums text-slate-900">{item.percent}%</span>
                    <div className="flex h-32 w-full items-end justify-center">
                      <div
                        className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-rose-600 to-pink-300 shadow-sm"
                        style={{ height: `${height}%` }}
                        title={`${item.label}: ${formatNumber(item.count)} patients (${item.percent}%)`}
                      />
                    </div>
                    <p className="mt-2 w-full truncate text-center text-[11px] font-medium text-slate-600" title={item.label}>{item.label}</p>
                    <p className="mt-0.5 text-[10px] tabular-nums text-slate-400">{formatNumber(item.count)}</p>
                  </div>
                );
              })}
            </div>
            {topCondition ? <p className="mt-3 text-xs text-slate-500">{topCondition.label} is the most common chronic signal, present in {topCondition.percent}% of this selected population.</p> : null}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seen by Attributed Provider</p>
            {slice.distributions.seenHistory.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs"><span className="text-slate-600">{item.label}</span><span className="text-slate-400">{item.percent}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max(4, (item.count / maxSeen) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

function ContractMixPanel({ slice }: { slice: ContractPopulationSlice }) {
  if (!slice.contractMix || slice.contractMix.length <= 1) return null;
  const visibleMix = slice.contractMix.slice(0, 8);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Contract Mix</h2>
          <p className="mt-1 text-xs text-slate-500">
            {pluralize(slice.contractCount, "contract")} represented in this scorecard cohort.
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {formatNumber(slice.representedLives)} represented lives
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {["Contract", "Payor", "Type", "Lives", "Share", "Records"].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleMix.map((item) => (
              <tr key={item.contractId} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                  <Link href={`/contracts/${item.contractId}`} className="hover:text-indigo-700 hover:underline">{item.contractName}</Link>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{item.payor}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{item.contractType}</td>
                <td className="px-4 py-3 text-xs font-semibold tabular-nums text-slate-900">{formatNumber(item.attributedLives)}</td>
                <td className="px-4 py-3 text-xs tabular-nums text-slate-600">{item.percentOfRepresentedLives}%</td>
                <td className="px-4 py-3 text-xs tabular-nums text-slate-600">{formatNumber(item.patientRecords)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PatientTable({
  title,
  subtitle,
  patients,
}: {
  title: string;
  subtitle: string;
  patients: ContractPopulationPatient[];
}) {
  const visiblePatients = patients.slice(0, 25);
  const showSourceContract = patients.some((patient) => patient.sourceContractName);
  const headers = showSourceContract
    ? ["Patient", "Source Contract", "Age/Sex", "ZIP", "Attributed PCP", "Conditions", "Expense", "Utilization", "Seen"]
    : ["Patient", "Age/Sex", "ZIP", "Attributed PCP", "Conditions", "Expense", "Utilization", "Seen"];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visiblePatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                  <p className="text-xs text-slate-400">MRN {patient.mrn}</p>
                </td>
                {showSourceContract ? (
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">{patient.sourceContractName}</p>
                    <p className="text-slate-400">{patient.sourceContractPayor}</p>
                  </td>
                ) : null}
                <td className="px-4 py-3 text-xs text-slate-600">{patient.age} · {patient.sex}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{patient.zipCode}</td>
                <td className="px-4 py-3 text-xs text-slate-600"><p>{patient.attributedProvider}</p><p className="text-slate-400">{patient.distanceToCareMiles} mi</p></td>
                <td className="px-4 py-3 text-xs text-slate-600"><p className="font-semibold">{patient.chronicConditionCount} conditions</p><p className="max-w-xs truncate text-slate-400">{patient.chronicConditions.join(", ") || "No chronic condition flagged"}</p></td>
                <td className="px-4 py-3 text-xs tabular-nums text-slate-600"><p className="font-semibold text-slate-900">{formatMoney(patient.totalCostOfCare)}</p><p className="text-slate-400">{formatMoney(patient.pmpm)} PMPM</p></td>
                <td className="px-4 py-3 text-xs text-slate-600"><p>{patient.edVisits} ED visits</p><p className="text-slate-400">{patient.snfAdmits} SNF admits · {patient.snfDays} days</p></td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {patient.lastAttributedVisitYearsAgo <= 1 ? "<=1 year" : `${patient.lastAttributedVisitYearsAgo} years ago`}
                  {patient.hasOpenGap ? <p className="mt-1 font-semibold text-amber-600">Open gap</p> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
        Showing {formatNumber(visiblePatients.length)} of {formatNumber(patients.length)} synthetic records in this slice.
      </p>
    </section>
  );
}

export default function PopulationInsightsView({
  slice,
  scope,
  scopeId,
  scopeLabel,
  view,
  domain,
  metric,
  costTier = "top_5",
  engageCount,
  source,
}: {
  slice: ContractPopulationSlice;
  scope: ScorecardScopeType;
  scopeId?: string;
  scopeLabel: string;
  view: ContractPopulationView;
  domain?: string;
  metric?: string;
  costTier?: ContractPopulationCostTierFilter;
  engageCount?: number;
  source?: string;
}) {
  const activePatients =
    view === "gaps"
      ? slice.gapPatients
      : view === "high_cost"
        ? engageCount
          ? getCostTierPatients(slice.denominatorPatients, "all").slice(0, Math.min(engageCount, slice.denominatorPatients.length))
          : getCostTierPatients(slice.denominatorPatients, costTier, slice.highCostPatients)
        : slice.denominatorPatients;
  const scopeDescriptor = scope === "portfolio" ? "Portfolio" : `${scopeLabels[scope]}: ${scopeLabel}`;
  const backHref =
    scope === "contract" && scopeId
      ? `/contracts/${scopeId}`
      : scope === "agreement" && scopeId
        ? `/agreements/${scopeId}/scorecard`
        : scope === "portfolio"
          ? "/scorecards"
          : getScorecardHref(scope, scopeId ?? scopeLabel);
  const buildHref = (nextView: ContractPopulationView, nextCostTier?: ContractPopulationCostTierFilter) =>
    buildPopulationInsightsHref({
      scope,
      id: scopeId,
      label: scopeLabel,
      domain,
      metric,
      view: nextView,
      costTier: nextView === "high_cost" ? nextCostTier : undefined,
      engageCount: nextView === "high_cost" ? engageCount : undefined,
      source,
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href={backHref} className="font-medium text-slate-500 hover:text-slate-900">← Back to source</Link>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-indigo-600">Population Insights</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Population Insights — {scopeDescriptor}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{slice.label}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{slice.description}</p>
            <p className="mt-2 text-xs text-slate-400">
              {formatNumber(slice.representedLives)} represented lives · {formatNumber(slice.totalPatients)} modeled records · {pluralize(slice.contractCount, "contract")}
              {source ? ` · ${source}` : ""}
            </p>
          </div>
          {domain && metric ? (
            <Link
              href={buildHref("gaps")}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              View {formatNumber(slice.gapPatients.length)} patients with gaps
            </Link>
          ) : null}
        </div>
      </div>

      <OperationalMetricStrip slice={slice} />
      <PopulationCompositionPanel slice={slice} />
      <ClinicalBurdenRecencyPanel slice={slice} />
      <CostConcentrationWorkbench slice={slice} activeTier={costTier} engagementFocusCount={engageCount} />

      <PopulationSecondaryPatientListGate>
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {(Object.keys(viewLabels) as ContractPopulationView[]).map((candidate) => (
            <Link
              key={candidate}
              href={buildHref(candidate, candidate === "high_cost" ? costTier : undefined)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === candidate ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {viewLabels[candidate]}
            </Link>
          ))}
        </div>

        {view !== "high_cost" ? (
          <PatientTable
            title={viewLabels[view]}
            subtitle={
              view === "gaps"
                ? "Patients in the selected denominator with open or in-progress gap signals."
                : "Synthetic patient identity detail for the selected denominator population."
            }
            patients={activePatients}
          />
        ) : null}
      </PopulationSecondaryPatientListGate>

      <ContractMixPanel slice={slice} />
    </div>
  );
}
