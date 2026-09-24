"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SummaryCard from "@/components/SummaryCard";
import ConditionList from "@/components/ConditionList";
import FeatureGuard from "@/components/FeatureGuard";
import { lifeSciencesTrials } from "@/data/synthetic/lifeSciencesTrials";
import {
  getPopulationPatients,
  getPreVisitPlanningRows,
  getPreVisitPlanningSummary,
} from "@/lib/populationData";
import type { ChronicCondition, PopulationPatientRow, PreVisitPlanningRow } from "@/types/population";

const filterConfig = [
  { label: "Organization Class", key: "organizationClass" },
  { label: "Organization", key: "organization" },
  { label: "Provider", key: "provider" },
  { label: "Payer", key: "payer" },
  { label: "Plan", key: "plan" },
  { label: "Registry", key: "registry" },
  { label: "Measure", key: "measure" },
  { label: "Measure Status", key: "measureStatus" },
  { label: "Scorability", key: "scorability" },
  { label: "Attribution Status", key: "attributionStatus" },
  { label: "Gender", key: "gender" },
] as const;

type FilterKey = (typeof filterConfig)[number]["key"];
type SortKey =
  | "opportunity"
  | "name"
  | "dateOfBirth"
  | "gender"
  | "primaryContact"
  | "totalUnmetMeasures"
  | "providerName"
  | "recentVisitDate"
  | "nextAttributedProviderVisitDate";

type CohortAgeDistribution = {
  under18: number;
  age18to44: number;
  age45to64: number;
  age65plus: number;
};

const qualityPerformanceDefinitions = [
  {
    label: "Diabetes A1c Control",
    aliases: ["a1c control", "diabetes a1c control", "diabetes a1c control (<9%)"],
    target: 75,
    fallback: 68,
    driversHref: "/quality/measures/diabetes-a1c-control/drivers",
  },
  {
    label: "Colorectal Screening Rate",
    aliases: ["colorectal screening", "colorectal cancer screening"],
    target: 70,
    fallback: 61,
    driversHref: "/quality/measures/colorectal-screening/drivers",
  },
  {
    label: "Breast Cancer Screening Rate",
    aliases: ["breast screening", "breast cancer screening"],
    target: 72,
    fallback: 67,
    driversHref: "/quality/measures/breast-cancer-screening/drivers",
  },
  {
    label: "Medication Adherence",
    aliases: ["medication adherence", "adherence", "statin adherence"],
    target: 80,
    fallback: 72,
    driversHref: "/quality/measures/medication-adherence/drivers",
  },
] as const;

const populationScopeLabels: Record<string, string> = {
  portfolio: "Portfolio",
  region: "Region",
  market: "Market",
  payor: "Payor",
  insuranceSegment: "Insurance Segment",
  contractType: "Contract Type",
  agreement: "Agreement",
  contract: "Contract",
};

function formatScopeType(value: string | null) {
  if (!value) return "Population";
  return populationScopeLabels[value] ?? value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function calculateMeasurePerformance(rows: PopulationPatientRow[], aliases: readonly string[], fallback: number) {
  const aliasSet = new Set(aliases.map((alias) => alias.toLowerCase()));
  const measureRows = rows.filter((row) => aliasSet.has(row.measure.toLowerCase()));
  if (!measureRows.length) return fallback;

  const numerator = measureRows.reduce((sum, row) => {
    if (row.measureStatus === "Closed") return sum + 1;
    if (row.measureStatus === "In Progress") return sum + 0.5;
    return sum;
  }, 0);

  return Math.max(0, Math.min(100, Math.round((numerator / measureRows.length) * 100)));
}

function deriveCohortAnalytics(rows: PopulationPatientRow[]) {
  const total = Math.max(1, rows.length);
  const highRiskMembers = rows.filter((row) => row.opportunity === "High").length;
  const risingRiskMembers = rows.filter((row) => row.opportunity === "Medium").length;
  const lowRiskMembers = rows.filter((row) => row.opportunity === "Low").length;

  const ageDistribution: CohortAgeDistribution = {
    under18: Number(((rows.filter((row) => row.age < 18).length / total) * 100).toFixed(1)),
    age18to44: Number(((rows.filter((row) => row.age >= 18 && row.age <= 44).length / total) * 100).toFixed(1)),
    age45to64: Number(((rows.filter((row) => row.age >= 45 && row.age <= 64).length / total) * 100).toFixed(1)),
    age65plus: Number(((rows.filter((row) => row.age >= 65).length / total) * 100).toFixed(1)),
  };

  const registryMap = new Map<string, number>();
  rows.forEach((row) => {
    registryMap.set(row.registry, (registryMap.get(row.registry) ?? 0) + 1);
  });
  const conditions: ChronicCondition[] = Array.from(registryMap.entries())
    .map(([condition, count]) => ({
      condition,
      prevalencePercent: Number(((count / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.prevalencePercent - a.prevalencePercent)
    .slice(0, 8);

  const openCount = rows.filter((row) => row.measureStatus === "Open").length;
  const inProgressCount = rows.filter((row) => row.measureStatus === "In Progress").length;
  const closedCount = rows.filter((row) => row.measureStatus === "Closed").length;
  const attributedCount = rows.filter((row) => row.attributionStatus === "Attributed").length;
  const pendingCount = rows.filter((row) => row.attributionStatus === "Pending").length;
  const contactableCount = rows.filter((row) => row.primaryContact !== "--").length;
  const avgUnmetMeasures = Number(
    (rows.reduce((sum, row) => sum + row.totalUnmetMeasures, 0) / total).toFixed(1)
  );

  const qualitySnapshot = {
    openRate: Math.round((openCount / total) * 100),
    inProgressRate: Math.round((inProgressCount / total) * 100),
    closedRate: Math.round((closedCount / total) * 100),
    attributedRate: Math.round((attributedCount / total) * 100),
  };

  const qualityPerformance = qualityPerformanceDefinitions.map((definition) => ({
    label: definition.label,
    value: calculateMeasurePerformance(rows, definition.aliases, definition.fallback),
    target: definition.target,
    driversHref: definition.driversHref,
  }));

  const socialRisk = {
    pendingAttributionRate: Math.round((pendingCount / total) * 100),
    noContactRate: Math.round(((total - contactableCount) / total) * 100),
    highOpportunityRate: Math.round((highRiskMembers / total) * 100),
  };

  return {
    totalMembers: rows.length,
    highRiskMembers,
    risingRiskMembers,
    lowRiskMembers,
    highCostMembers: highRiskMembers,
    ageDistribution,
    conditions,
    openCount,
    inProgressCount,
    closedCount,
    avgUnmetMeasures,
    attributedCount,
    pendingCount,
    qualitySnapshot,
    qualityPerformance,
    socialRisk,
  };
}

function alignRowsToExpectedCount(rows: PopulationPatientRow[], expectedCount: number) {
  if (!Number.isFinite(expectedCount) || expectedCount <= 0) return rows;
  if (!rows.length) return rows;
  if (rows.length === expectedCount) return rows;
  if (rows.length > expectedCount) return rows.slice(0, expectedCount);

  const expanded: PopulationPatientRow[] = [...rows];
  let idx = 0;
  while (expanded.length < expectedCount) {
    const source = rows[idx % rows.length];
    const cloneNumber = Math.floor(idx / rows.length) + 1;
    expanded.push({
      ...source,
      id: `${source.id}-cohort-${cloneNumber}`,
    });
    idx += 1;
  }
  return expanded;
}

// ---------------------------------------------------------------------------
// Inline sub-components — used only on this page, not worth extracting
// ---------------------------------------------------------------------------

/** CSS-only horizontal segmented bar showing risk distribution */
function RiskDistributionBar({
  low,
  rising,
  high,
  total,
}: {
  low: number;
  rising: number;
  high: number;
  total: number;
}) {
  const lowPct    = +((low    / total) * 100).toFixed(1);
  const risingPct = +((rising / total) * 100).toFixed(1);
  const highPct   = +((high   / total) * 100).toFixed(1);

  return (
    <div className="space-y-2">
      <div className="flex h-3.5 w-full overflow-hidden rounded-full">
        <div className="bg-emerald-400 transition-all" style={{ width: `${lowPct}%` }} title={`Low Risk ${lowPct}%`} />
        <div className="bg-amber-400 transition-all"   style={{ width: `${risingPct}%` }} title={`Rising Risk ${risingPct}%`} />
        <div className="bg-red-400 transition-all"     style={{ width: `${highPct}%` }} title={`High Risk ${highPct}%`} />
      </div>
      <div className="flex flex-wrap gap-2 text-[11px]">
        {[
          { label: "Low Risk",     pct: lowPct,    count: low,    color: "bg-emerald-400" },
          { label: "Rising Risk",  pct: risingPct, count: rising, color: "bg-amber-400" },
          { label: "High Risk",    pct: highPct,   count: high,   color: "bg-red-400" },
        ].map((tier) => (
          <div key={tier.label} className="flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${tier.color}`} />
            <span className="text-slate-600">{tier.label}</span>
            <span className="font-semibold text-slate-900">{tier.count.toLocaleString()}</span>
            <span className="text-slate-400">({tier.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** CSS-only bar chart for age distribution */
function AgeDistributionBars({ dist }: { dist: CohortAgeDistribution }) {
  const bands = [
    { label: "Under 18",  value: dist.under18,   color: "bg-violet-400" },
    { label: "18 – 44",   value: dist.age18to44, color: "bg-indigo-400" },
    { label: "45 – 64",   value: dist.age45to64, color: "bg-sky-400" },
    { label: "65+",       value: dist.age65plus, color: "bg-amber-400" },
  ];
  const max = Math.max(...bands.map((b) => b.value));

  return (
    <div className="space-y-2">
      {bands.map((b) => (
        <div key={b.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-slate-600">{b.label}</span>
            <span className="font-semibold text-slate-900">{b.value}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100">
            <div
              className={`h-2.5 rounded-full transition-all ${b.color}`}
              style={{ width: `${(b.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Single quality measure row with a progress bar */
function QualityRow({
  label,
  value,
  target,
  driversHref,
}: {
  label: string;
  value: number;
  target: number;
  driversHref?: string;
}) {
  const met = value >= target;
  return (
    <div>
      <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 text-xs">
        <span className="truncate text-slate-600">{label}</span>
        <span className={`text-right text-[11px] font-semibold ${met ? "text-emerald-700" : "text-amber-700"}`}>
          {value}%
          <span className="ml-1 text-[10px] font-normal text-slate-400">/ {target}%</span>
        </span>
        {driversHref ? (
          <Link
            href={driversHref}
            className="inline-flex w-[84px] shrink-0 justify-center rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            View drivers
          </Link>
        ) : (
          <span className="w-[84px]" aria-hidden="true" />
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className={`h-1.5 rounded-full transition-all ${met ? "bg-emerald-400" : "bg-amber-400"}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function DonutBreakdown({
  title,
  items,
  colors,
}: {
  title: string;
  items: { label: string; count: number }[];
  colors: string[];
}) {
  const total = Math.max(items.reduce((sum, item) => sum + item.count, 0), 1);
  let cumulative = 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr] md:items-center">
        <div className="flex items-center justify-center">
          <svg width="100" height="100" viewBox="0 0 120 120" role="img" aria-label={`${title} distribution`}>
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="18" />
            {items.map((item, idx) => {
              const fraction = item.count / total;
              const dash = fraction * circumference;
              const offset = circumference * (1 - cumulative);
              cumulative += fraction;

              return (
                <circle
                  key={item.label}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={colors[idx % colors.length]}
                  strokeWidth="18"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  transform="rotate(-90 60 60)"
                  strokeLinecap="butt"
                />
              );
            })}
            <circle cx="60" cy="60" r="24" fill="white" />
          </svg>
        </div>

        <ul className="space-y-2 text-xs">
          {items.map((item, idx) => {
            const pct = Math.round((item.count / total) * 100);
            return (
              <li key={item.label} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">{pct}%</span>
                  <span className="ml-2 text-slate-500">{item.count.toLocaleString()}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

function TrialAgeDistribution({ items }: { items: { label: string; count: number }[] }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  const total = Math.max(items.reduce((sum, item) => sum + item.count, 0), 1);

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-sm font-semibold text-slate-900">Age</h3>
      <p className="mt-1 text-xs text-slate-400">Matched eligible patient distribution</p>
      <div className="mt-3 space-y-3">
        {items.map((item) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="text-slate-600">
                  {pct}% <span className="text-slate-400">{item.count}</span>
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-sky-500" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function PopulationPageContent() {
  const searchParams = useSearchParams();
  const basePatients = useMemo(() => getPopulationPatients(), []);
  const preVisitRows = useMemo(() => getPreVisitPlanningRows(), []);
  const topPreVisitRows = useMemo(() => preVisitRows.slice(0, 10), [preVisitRows]);
  const preVisitSummary = useMemo(() => getPreVisitPlanningSummary(topPreVisitRows), [topPreVisitRows]);
  const trialId = searchParams.get("trialId");
  const selectedTrial = useMemo(
    () => lifeSciencesTrials.find((trial) => trial.id === trialId) ?? null,
    [trialId]
  );
  const patients = useMemo(() => {
    if (!selectedTrial) return basePatients;

    return selectedTrial.patientList.map((row) => ({
      id: row.id,
      opportunity: row.opportunity,
      name: row.fullName,
      mrn: row.mrn,
      dateOfBirth: row.dateOfBirth,
      age: row.age,
      gender: row.gender,
      birthSex: row.birthSex,
      primaryContact: row.primaryContact,
      contactType: row.contactType,
      totalUnmetMeasures: row.totalUnmetMeasures,
      providerName: row.provider,
      recentVisitDate: "--",
      nextAttributedProviderVisitDate: "--",
      organizationClass: row.organizationClass,
      organization: row.organization,
      provider: row.provider,
      payer: row.payer,
      plan: row.plan,
      registry: row.registry,
      measure: row.measure,
      measureStatus: row.measureStatus,
      scorability: row.scorability,
      attributionStatus: row.attributionStatus,
    }));
  }, [basePatients, selectedTrial]);
  const source = searchParams.get("source");
  const expectedCount = Number(searchParams.get("expectedCount") ?? "0");
  const trialExpectedCount = selectedTrial?.matchedPopulationCount ?? 0;
  const effectiveExpectedCount = selectedTrial ? trialExpectedCount : expectedCount;
  const shouldAlignToExpectedCount = Number.isFinite(expectedCount) && expectedCount > 0;
  const shouldAlignToTrialCount = Boolean(selectedTrial && trialExpectedCount > 0);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    organizationClass: "",
    organization: "",
    provider: "",
    payer: "",
    plan: "",
    registry: "",
    measure: "",
    measureStatus: "",
    scorability: "",
    attributionStatus: "",
    gender: "",
  });
  const [sortState, setSortState] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "opportunity",
    dir: "desc",
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [isPreVisitExpanded, setIsPreVisitExpanded] = useState(true);
  const pageSize = 100;

  const filterOptions = useMemo(() => {
    return filterConfig.reduce<Record<FilterKey, string[]>>((acc, item) => {
      const values = Array.from(new Set(patients.map((row) => String(row[item.key])))).sort();
      acc[item.key] = values;
      return acc;
    }, {} as Record<FilterKey, string[]>);
  }, [patients]);

  useEffect(() => {
    const resolveValue = (key: FilterKey, raw: string | null) => {
      if (!raw) return "";
      const normalized = raw.trim().toLowerCase();
      const options = filterOptions[key] ?? [];
      const exact = options.find((option) => option.toLowerCase() === normalized);
      if (exact) return exact;

      const aliases: Partial<Record<FilterKey, Record<string, string>>> = {
        measure: {
          "diabetes a1c control (<9%)": "A1c Control",
          "a1c control": "A1c Control",
          "colorectal cancer screening": "Colorectal Screening",
          "breast cancer screening": "Breast Screening",
          "statin adherence": "Medication Adherence",
          "medication adherence": "Medication Adherence",
          "follow-up after hospitalization": "Post Discharge Follow-up",
          "follow-up after hospital": "Post Discharge Follow-up",
          "avoidable emergency department utilization": "Follow-up after ED",
          "follow-up after ed": "Follow-up after ED",
          "copd controller adherence": "COPD Management",
          "transportation barriers": "Transportation",
        },
      };

      const alias = aliases[key]?.[normalized];
      if (alias && options.includes(alias)) return alias;

      const fuzzy = options.find(
        (option) => option.toLowerCase().includes(normalized) || normalized.includes(option.toLowerCase())
      );
      return fuzzy ?? "";
    };

    const nextFilters = filterConfig.reduce((acc, item) => {
      acc[item.key] = resolveValue(item.key, searchParams.get(item.key));
      return acc;
    }, {} as Record<FilterKey, string>);

    setFilters((prev) => {
      const changed = filterConfig.some((item) => prev[item.key] !== nextFilters[item.key]);
      return changed ? nextFilters : prev;
    });

    const queryText = searchParams.get("q") ?? "";
    setSearchTerm((prev) => (prev !== queryText ? queryText : prev));
  }, [searchParams, filterOptions]);

  const filteredPatients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return patients.filter((row) => {
      const matchesSearch =
        !term ||
        [
          row.name,
          row.mrn,
          row.providerName,
          row.organization,
          row.payer,
          row.plan,
          row.measure,
          row.registry,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesFilters = filterConfig.every(({ key }) => {
        const selected = filters[key];
        if (!selected) return true;
        return String(row[key]) === selected;
      });

      return matchesSearch && matchesFilters;
    });
  }, [patients, searchTerm, filters]);

  const scopedPatients = useMemo(() => {
    if (shouldAlignToTrialCount) {
      return alignRowsToExpectedCount(filteredPatients, trialExpectedCount);
    }
    if (!shouldAlignToExpectedCount) return filteredPatients;
    return alignRowsToExpectedCount(filteredPatients, expectedCount);
  }, [filteredPatients, shouldAlignToExpectedCount, shouldAlignToTrialCount, expectedCount, trialExpectedCount]);

  const sortedPatients = useMemo(() => {
    const opportunityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    const sorted = [...scopedPatients].sort((a, b) => {
      let cmp = 0;

      if (sortState.key === "opportunity") {
        cmp = (opportunityWeight[a.opportunity] ?? 0) - (opportunityWeight[b.opportunity] ?? 0);
      } else if (sortState.key === "totalUnmetMeasures") {
        cmp = a.totalUnmetMeasures - b.totalUnmetMeasures;
      } else if (
        sortState.key === "dateOfBirth" ||
        sortState.key === "recentVisitDate" ||
        sortState.key === "nextAttributedProviderVisitDate"
      ) {
        const aDate = a[sortState.key] === "--" ? -Infinity : new Date(a[sortState.key]).getTime();
        const bDate = b[sortState.key] === "--" ? -Infinity : new Date(b[sortState.key]).getTime();
        cmp = aDate - bDate;
      } else {
        cmp = String(a[sortState.key]).localeCompare(String(b[sortState.key]));
      }

      return sortState.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [scopedPatients, sortState]);

  const exactMemberMatch = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return null;
    return (
      patients.find(
        (row) => row.mrn.toLowerCase() === term || row.name.toLowerCase() === term
      ) ?? null
    );
  }, [patients, searchTerm]);

  useEffect(() => {
    setPageIndex(0);
  }, [searchTerm, filters, sortState]);

  const totalPages = Math.max(1, Math.ceil(sortedPatients.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const pageStart = safePageIndex * pageSize;
  const pagedPatients = sortedPatients.slice(pageStart, pageStart + pageSize);

  const toggleSort = (key: SortKey) => {
    setSortState((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc",
    }));
  };

  const activeFilterBadges = filterConfig
    .filter((item) => Boolean(filters[item.key]))
    .map((item) => ({
      label: item.label,
      value: filters[item.key],
    }));

  const countMismatch =
    (shouldAlignToExpectedCount || shouldAlignToTrialCount) &&
    filteredPatients.length !== effectiveExpectedCount;
  const cohort = useMemo(() => deriveCohortAnalytics(scopedPatients), [scopedPatients]);
  const scopeType = searchParams.get("scopeType");
  const scopeId = searchParams.get("scopeId");
  const scopeLabel = searchParams.get("scopeLabel") ?? (scopeType === "portfolio" ? "Portfolio" : scopeId);
  const isLivesPopulationInsight = !selectedTrial && searchParams.get("view") === "lives" && Boolean(scopeType);
  const scopeTypeLabel = formatScopeType(scopeType);
  const pageTitle = selectedTrial
    ? "Eligible Patient Population"
    : isLivesPopulationInsight
      ? "Population Insights"
      : "Population Overview";
  const pageDescription = selectedTrial
    ? "Trial-scoped demographics, site alignment, and patient roster derived from Life Sciences matching context."
    : isLivesPopulationInsight
      ? `${scopeTypeLabel}${scopeLabel ? `: ${scopeLabel}` : ""} • ${cohort.totalMembers.toLocaleString()} lives`
      : "Cohort membership insights scoped to your active filters and hyperlink context.";
  const trialRelationshipCount =
    selectedTrial?.siteComparison.reduce((sum, row) => sum + row.existingRelationship, 0) ?? 0;
  const trialActiveTrialsTotal =
    selectedTrial?.siteComparison.reduce((sum, row) => sum + row.activeTrials, 0) ?? 0;
  const trialSiteMatchedTotal =
    selectedTrial?.siteComparison.reduce((sum, row) => sum + row.matched, 0) ?? 0;

  const opportunityClass: Record<PreVisitPlanningRow["opportunity"], string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-emerald-100 text-emerald-700",
  };

  const buildDirectoryHref = (promptText?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("openDirectory", "true");
    params.set("suite", "oracle_health");
    params.set("agent", "pre_visit_prep");
    if (promptText) {
      params.set("prompt", promptText);
    }
    return `/population?${params.toString()}`;
  };

  return (
    <FeatureGuard page="population">
      <div className="space-y-10">
      {/* Header */}
      <div>
        {isLivesPopulationInsight ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <Link href={scopeType === "portfolio" ? "/contracts" : "/scorecards"} className="font-medium text-slate-500 hover:text-slate-900">
              ← Back to {scopeType === "portfolio" ? "Contracts" : "Scorecards"}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-indigo-600">{scopeTypeLabel} Population</span>
          </div>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {isLivesPopulationInsight ? `${scopeTypeLabel} population` : selectedTrial ? "Trial-specific population" : "Population health"}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{pageTitle}</h1>
        <p className="mt-2 max-w-3xl text-slate-500">{pageDescription}</p>
        {isLivesPopulationInsight ? (
          <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
            <span className="font-semibold">Lives scope active:</span>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-indigo-700">{scopeTypeLabel}</span>
            {scopeLabel ? <span className="rounded-full bg-white/80 px-2 py-0.5 text-indigo-700">{scopeLabel}</span> : null}
            <Link href="/population" className="font-semibold underline">
              Clear
            </Link>
          </div>
        ) : null}
        {selectedTrial ? (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Trial-specific population</p>
            <h2 className="mt-1 text-base font-semibold text-indigo-900">{selectedTrial.name}</h2>
            <p className="mt-1 text-sm text-indigo-800">
              {selectedTrial.sponsor} · {selectedTrial.phase} · {selectedTrial.specialty}
            </p>
            <p className="mt-1 text-sm text-indigo-800">{selectedTrial.fitReason}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href="#trial-patient-roster"
                className="inline-flex rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                View patient roster ↓
              </Link>
              <Link href="/life-sciences" className="inline-flex text-sm font-semibold text-indigo-700 hover:underline">
                ← Back to Life Sciences opportunity center
              </Link>
            </div>
          </div>
        ) : null}
        {activeFilterBadges.length ? (
          <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
            <span className="font-semibold">Population filter active:</span>
            {activeFilterBadges.map((filterItem) => (
              <span key={filterItem.label} className="rounded-full bg-white/80 px-2 py-0.5 text-indigo-700">
                {filterItem.label}: {filterItem.value}
              </span>
            ))}
            <Link href="/population" className="font-semibold underline">
              Clear
            </Link>
          </div>
        ) : null}
        {countMismatch ? (
          <p className="mt-2 text-xs text-indigo-600">
            Showing a modeled cohort aligned to linked target size ({effectiveExpectedCount.toLocaleString()} {isLivesPopulationInsight ? "lives" : "members"}{source ? ` · ${source}` : ""}).
          </p>
        ) : null}
      </div>

      {selectedTrial ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Matched Patients"
              value={selectedTrial.matchedPopulationCount.toLocaleString()}
              description="Across configured trial sites"
              accent="text-indigo-600"
            />
            <SummaryCard
              label="Has Site Relationship"
              value={trialRelationshipCount.toLocaleString()}
              description="Existing site relationships in network"
              accent="text-cyan-600"
            />
            <SummaryCard
              label="Active Trials"
              value={trialActiveTrialsTotal.toLocaleString()}
              description="Total active trials across listed sites"
              accent="text-emerald-600"
            />
          </div>

          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Site Comparison</h2>
            <p className="mt-1 text-xs text-slate-400">Matched population and relationship context by site</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Site</th>
                    <th className="px-3 py-2 text-left font-semibold">Matched</th>
                    <th className="px-3 py-2 text-left font-semibold">Existing Rel.</th>
                    <th className="px-3 py-2 text-left font-semibold">Active Trials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedTrial.siteComparison.map((row) => (
                    <tr key={row.site} className="align-top">
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-900">{row.site}</p>
                        <p className="text-slate-500">{row.lead}</p>
                      </td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{row.matched}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{row.existingRelationship}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{row.activeTrials}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 text-slate-800">
                  <tr className="font-semibold">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2">{trialSiteMatchedTotal.toLocaleString()}</td>
                    <td className="px-3 py-2">{trialRelationshipCount.toLocaleString()}</td>
                    <td className="px-3 py-2">{trialActiveTrialsTotal.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Trial Demographics</h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <DonutBreakdown
                title="Race"
                items={selectedTrial.demographics.race}
                colors={["#0f766e", "#0ea5a4", "#a16207", "#64748b"]}
              />
              <DonutBreakdown
                title="Ethnicity"
                items={selectedTrial.demographics.ethnicity}
                colors={["#0f766e", "#dc2626", "#0ea5a4"]}
              />
              <TrialAgeDistribution items={selectedTrial.demographics.age} />
              <DonutBreakdown
                title="Gender"
                items={selectedTrial.demographics.gender}
                colors={["#334155", "#0ea5a4", "#78350f"]}
              />
            </div>
          </section>

          <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-indigo-900">Trial Quality & Adoption Insights</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {selectedTrial.qualityImpacts.map((impact) => (
                <article key={impact.measure} className="rounded-lg border border-indigo-100 bg-white px-3 py-2">
                  <p className="text-xs font-semibold text-slate-900">{impact.measure}</p>
                  <p className="mt-1 text-[11px] text-indigo-700">Impact: {impact.impact}</p>
                  <p className="mt-1 text-[11px] text-slate-600">{impact.rationale}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <SummaryCard
          label={isLivesPopulationInsight ? "Lives" : "Total Members"}
          value={cohort.totalMembers.toLocaleString()}
          description={isLivesPopulationInsight ? `${scopeTypeLabel} population in scope` : "In current filter context"}
        />
        <SummaryCard
          label="High Risk Members"
          value={cohort.highRiskMembers.toLocaleString()}
          description="Immediate intervention priority"
          accent="text-red-600"
        />
        <SummaryCard
          label="Rising Risk Members"
          value={cohort.risingRiskMembers.toLocaleString()}
          description="Preventive management opportunity"
          accent="text-amber-600"
        />
        <SummaryCard
          label="High Expense Members"
          value={cohort.highCostMembers.toLocaleString()}
          description="Proxy: high opportunity patients"
          accent="text-indigo-700"
        />
      </div>

      {/* Dense 2x3 compact analytics cards */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Age Distribution</h2>
          <p className="mb-3 text-[11px] text-slate-400">Current filtered cohort</p>
          <AgeDistributionBars dist={cohort.ageDistribution} />
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Risk Stratification</h2>
          <p className="mb-3 text-[11px] text-slate-400">Member counts by tier</p>
          <RiskDistributionBar
            low={cohort.lowRiskMembers}
            rising={cohort.risingRiskMembers}
            high={cohort.highRiskMembers}
            total={Math.max(1, cohort.totalMembers)}
          />
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-1 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Top Cohort Registries</h2>
              <p className="text-[11px] text-slate-400">Prevalence within filtered cohort</p>
            </div>
            <div className="hidden gap-2 text-[10px] text-slate-500 xl:flex">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-400" />≥50%</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />30–49%</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />15–29%</span>
            </div>
          </div>
          <div className="mt-3">
            <ConditionList conditions={cohort.conditions.slice(0, 6)} maxPrevalence={100} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Workflow Snapshot</h2>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2"><span className="text-slate-600">Open Measures</span><span className="font-semibold text-slate-900">{cohort.openCount.toLocaleString()}</span></div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2"><span className="text-slate-600">In Progress</span><span className="font-semibold text-slate-900">{cohort.inProgressCount.toLocaleString()}</span></div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2"><span className="text-slate-600">Closed</span><span className="font-semibold text-slate-900">{cohort.closedCount.toLocaleString()}</span></div>
            <div className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2"><span className="text-slate-600">Avg Unmet Measures</span><span className="font-semibold text-slate-900">{cohort.avgUnmetMeasures}</span></div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Quality Performance Snapshot</h2>
          <p className="mb-3 text-[11px] text-slate-400">Current filtered cohort · each measure links to barrier drivers</p>
          <div className="space-y-2.5">
            {cohort.qualityPerformance.map((measure) => (
              <QualityRow
                key={measure.label}
                label={measure.label}
                value={measure.value}
                target={measure.target}
                driversHref={measure.driversHref}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Social Risk Indicators</h2>
          <div className="space-y-2 text-xs">
            {[
              { label: "Pending Attribution", value: cohort.socialRisk.pendingAttributionRate },
              { label: "No Contact on File", value: cohort.socialRisk.noContactRate },
              { label: "High Opportunity Share", value: cohort.socialRisk.highOpportunityRate },
            ].map((item) => (
              <div key={item.label} className="rounded-md bg-slate-50 px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{item.label}</span>
                  <span className={`font-semibold ${item.value > 15 ? "text-red-700" : item.value > 10 ? "text-amber-700" : "text-slate-900"}`}>{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient List */}
      {!selectedTrial ? (
      <section className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Pre-visit planning workflow</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Pre-visit Prep Agent · attributed appointments</h2>
            <p className="mt-1 text-xs text-slate-600">
              Prioritized list of attributed patients with upcoming visits and the highest-value care gaps to close during appointment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreVisitExpanded((prev) => !prev)}
              className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700"
            >
              {isPreVisitExpanded ? "Collapse" : "Expand"} {isPreVisitExpanded ? "▴" : "▾"}
            </button>
            <Link
              href={buildDirectoryHref("Rank upcoming attributed visits by closure opportunity")}
              className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Open Agent Suite Directory
            </Link>
          </div>
        </div>

        {isPreVisitExpanded ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <SummaryCard label="Worklist patients" value={preVisitSummary.totalPrepCandidates.toLocaleString()} />
              <SummaryCard label="High-priority prep" value={preVisitSummary.highPriorityPrepCount.toLocaleString()} accent="text-red-600" />
              <SummaryCard label="Avg closable gaps" value={String(preVisitSummary.avgClosableGapsPerVisit)} />
              <SummaryCard label="Visits in next 7 days" value={preVisitSummary.next7DayVisits.toLocaleString()} accent="text-indigo-700" />
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-indigo-100 bg-white">
              <table className="min-w-[900px] w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Patient",
                      "Appointment",
                      "Provider",
                      "Priority",
                      "Summary",
                      "",
                    ].map((heading) => (
                      <th key={heading} className="px-2.5 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topPreVisitRows.map((row) => (
                    <tr key={row.patientId} className="hover:bg-slate-50/70">
                      <td className="px-2.5 py-2 align-middle">
                        <Link href={`/population/member/${row.patientId}?source=pre-visit-planning&appointmentDate=${encodeURIComponent(row.appointmentDate)}&openCopilot=true&copilotPrompt=${encodeURIComponent("Summarize what should be completed during this upcoming visit and the top closable care gaps.")}`} className="text-sm font-semibold text-sky-700 hover:underline">
                          {row.patientName}
                        </Link>
                      </td>
                      <td className="px-2.5 py-2 align-middle text-xs text-slate-700">
                        {row.appointmentDate} · {row.appointmentInDays}d
                      </td>
                      <td className="px-2.5 py-2 align-middle text-xs text-slate-700">{row.providerName}</td>
                      <td className="px-2.5 py-2 align-middle">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${opportunityClass[row.opportunity]}`}>
                          {row.opportunity}
                        </span>
                      </td>
                      <td className="px-2.5 py-2 align-middle text-xs text-slate-600">
                        {row.preVisitPrepSummary}
                      </td>
                      <td className="px-2.5 py-2 align-middle text-right">
                        <Link
                          aria-label={`Review patient prep for ${row.patientName}`}
                          title="Review patient prep"
                          href={`/population/member/${row.patientId}?source=pre-visit-planning&appointmentDate=${encodeURIComponent(row.appointmentDate)}&openCopilot=true&copilotPrompt=${encodeURIComponent("What are the top closable care gaps before this appointment and what should the PCP do in-visit?")}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        >
                          →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>
      ) : null}

      <div id={selectedTrial ? "trial-patient-roster" : undefined} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Please select a filter or search for patient, MRN, provider..."
            className="min-w-[260px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          />
          {filterConfig.map((filterItem) => (
            <select
              key={filterItem.key}
              value={filters[filterItem.key]}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  [filterItem.key]: event.target.value,
                }))
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700"
            >
              <option value="">{filterItem.label}</option>
              {filterOptions[filterItem.key].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ))}
        </div>

        {exactMemberMatch ? (
          <div className="mb-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
            Exact member match found: <span className="font-semibold">{exactMemberMatch.name}</span> · MRN {exactMemberMatch.mrn} ·{" "}
            <Link href={`/population/member/${exactMemberMatch.id}`} className="font-semibold underline">
              Open member chart →
            </Link>
          </div>
        ) : null}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xl font-medium text-slate-900">
            {sortedPatients.length.toLocaleString()} {selectedTrial ? "Trial-Matched Persons" : isLivesPopulationInsight ? "Lives" : "Persons"}
          </p>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Export</button>
            <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Save View</button>
            <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Select View</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1450px] w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2.5 text-left"><input type="checkbox" aria-label="Select all rows" /></th>
                {[
                  { label: "Opportunity", key: "opportunity" as SortKey },
                  { label: "Name (MRN)", key: "name" as SortKey },
                  { label: "Date of Birth (Age)", key: "dateOfBirth" as SortKey },
                  { label: "Gender (Birth Sex)", key: "gender" as SortKey },
                  { label: "Primary Contact", key: "primaryContact" as SortKey },
                  { label: "Total Unmet Measures", key: "totalUnmetMeasures" as SortKey },
                  { label: "Provider Name", key: "providerName" as SortKey },
                  { label: "Recent Visit Date", key: "recentVisitDate" as SortKey },
                  { label: "Next Attributed Provider Visit Date", key: "nextAttributedProviderVisitDate" as SortKey },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="cursor-pointer px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <span className="text-[10px] text-slate-400">↕</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {pagedPatients.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60">
                  <td className="px-3 py-3 align-top"><input type="checkbox" aria-label={`Select ${row.name}`} /></td>
                  <td className="px-3 py-3 align-top">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      row.opportunity === "High"
                        ? "bg-amber-100 text-amber-800"
                        : row.opportunity === "Medium"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {row.opportunity}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <Link href={`/population/member/${row.id}`} className="font-semibold text-sky-700 hover:underline">
                      {row.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">MRN: {row.mrn}</p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <p className="text-slate-900">{row.dateOfBirth}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.age} years</p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <p className="text-slate-900">{row.gender}</p>
                    <p className="mt-1 text-xs text-slate-500">Birth Sex: {row.birthSex}</p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <p className="text-slate-900">{row.primaryContact}</p>
                    <p className="mt-1 text-xs text-slate-500">Type: {row.contactType}</p>
                  </td>
                  <td className="px-3 py-3 align-top text-slate-900">{row.totalUnmetMeasures}</td>
                  <td className="px-3 py-3 align-top text-slate-900">{row.providerName}</td>
                  <td className="px-3 py-3 align-top text-slate-900">{row.recentVisitDate}</td>
                  <td className="px-3 py-3 align-top text-slate-900">{row.nextAttributedProviderVisitDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedPatients.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No patients match the selected filters.
          </div>
        )}

        {sortedPatients.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <p>
              Showing {pageStart + 1}-{Math.min(pageStart + pageSize, sortedPatients.length)} of {sortedPatients.length.toLocaleString()} patients
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={safePageIndex === 0}
                className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-[11px] font-semibold text-slate-700">
                Page {safePageIndex + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={safePageIndex >= totalPages - 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
      </div>
    </FeatureGuard>
  );
}

export default function PopulationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading population overview...</div>}>
      <PopulationPageContent />
    </Suspense>
  );
}
