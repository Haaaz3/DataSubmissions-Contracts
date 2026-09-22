"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Contract, ContractAgreement } from "@/types/contract";
import { loadStoredContracts } from "@/lib/contractStore";
import { calculateEstimatedSettlement } from "@/lib/contracts/settlement";
import { buildAgreementScorecard, buildContractScorecard } from "@/lib/agreementScorecardData";
import { buildScorecardDomainGroups } from "@/components/contracts/domainGroups";
import { allocatePortfolioDomainGroupValues } from "@/components/contracts/portfolioDomainGroupAllocation";
import { buildScorecardRollup } from "@/lib/scorecards/rollups";
import { inferInsuranceSegment, resolveVbcContractModel } from "@/lib/scorecards/selectors";
import {
  getQualityBlockedSavingsInsights,
  getTopFinancialPriorityItems,
} from "@/lib/contracts/financialPriorities";
import TopFinancialPrioritiesPanel from "@/components/contracts/TopFinancialPrioritiesPanel";
import QualityBlockedSavingsPanel from "@/components/contracts/QualityBlockedSavingsPanel";
import StarRatingDisplay from "@/components/contracts/StarRatingDisplay";
import { getPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";

type AgreementSortKey = "name" | "lives" | "achieved" | "potential" | "quality" | "contracts";
type SortDirection = "asc" | "desc";
type VisualTone = "lives" | "achieved" | "cost";
type ScorecardLens = "market" | "contractType" | "insuranceSegment" | "payor";

interface PortfolioVisualBucket {
  label: string;
  value: number;
  targetValue?: number;
  targetLabel?: string;
}

interface PortfolioChartLinkProps {
  href?: string;
  ariaLabel?: string;
}

const visualToneStyles: Record<VisualTone, string> = {
  lives: "from-blue-400 to-indigo-600",
  achieved: "from-emerald-400 to-emerald-700",
  cost: "from-amber-300 to-orange-600",
};

const donutToneColors: Record<VisualTone, string[]> = {
  lives: ["#4f46e5", "#06b6d4", "#60a5fa", "#10b981", "#94a3b8"],
  achieved: ["#059669", "#22c55e", "#84cc16", "#14b8a6", "#94a3b8"],
  cost: ["#f97316", "#f59e0b", "#eab308", "#fb923c", "#94a3b8"],
};

const scorecardLensHref: Record<ScorecardLens, string> = {
  market: "/scorecards?view=market",
  contractType: "/scorecards?view=contractType",
  insuranceSegment: "/scorecards?view=insuranceSegment",
  payor: "/scorecards?view=payor",
};

const prototypeLivesTargets = {
  market: {
    "Illinois": 10_500,
    "Wisconsin": 9_600,
    "Greater Charlotte": 9_200,
    "Greater Rome": 7_400,
    "Greater Macon": 7_000,
    "Greater Winston": 6_800,
    "Northwest North Carolina": 6_500,
  },
  insuranceSegment: {
    "Medicare": 18_500,
    "MA": 15_500,
    "Commercial": 18_000,
    "Medicaid": 7_000,
    "ACA": 6_000,
    "Unassigned Segment": 2_500,
  },
  payor: {
    "CMS": 18_500,
    "BlueCross BlueShield": 6_800,
    "Humana": 6_400,
    "Aetna": 6_200,
    "UnitedHealthcare": 6_000,
    "Cigna": 5_600,
    "Kaiser": 4_800,
    "Blue Shield": 4_400,
  },
} satisfies Record<string, Record<string, number>>;

function formatDollarAmount(amount: number) {
  return `$${Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function compactNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function sharePercent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function targetAttainmentPercent(value: number, targetValue?: number) {
  return targetValue && targetValue > 0 ? Math.round((value / targetValue) * 100) : undefined;
}

function derivedLivesTarget(value: number) {
  return Math.max(100, Math.ceil((value * 1.1) / 100) * 100);
}

function annualizedCost(contract: Contract) {
  return contract.currentPmpm * contract.attributedLives * 12;
}

function annualizedTargetCost(contract: Contract) {
  return contract.targetPmpm * contract.attributedLives * 12;
}

function toBuckets<T>(
  items: T[],
  labelFor: (item: T) => string,
  valueFor: (item: T) => number,
  limit = 5,
  targetFor?: (item: T) => number,
  targetLabel?: string
) {
  const bucketMap = new Map<string, { value: number; targetValue: number }>();
  items.forEach((item) => {
    const label = labelFor(item) || "Unassigned";
    const current = bucketMap.get(label) ?? { value: 0, targetValue: 0 };
    current.value += valueFor(item);
    current.targetValue += targetFor?.(item) ?? 0;
    bucketMap.set(label, current);
  });

  return Array.from(bucketMap.entries())
    .map(([label, bucket]) => ({
      label,
      value: bucket.value,
      targetValue: targetFor ? bucket.targetValue : undefined,
      targetLabel,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function withLivesTargets(
  buckets: PortfolioVisualBucket[],
  targetMap: Record<string, number>
) {
  return buckets.map((bucket) => ({
    ...bucket,
    targetValue: targetMap[bucket.label] ?? derivedLivesTarget(bucket.value),
    targetLabel: "target",
  }));
}

function PortfolioChartCardFrame({
  href,
  ariaLabel,
  children,
}: PortfolioChartLinkProps & {
  children: React.ReactNode;
}) {
  if (!href) return <>{children}</>;

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="block h-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
    >
      {children}
    </Link>
  );
}

function PortfolioDistributionCard({
  title,
  subtitle,
  buckets,
  tone,
  formatValue,
  href,
  ariaLabel,
}: {
  title: string;
  subtitle: string;
  buckets: PortfolioVisualBucket[];
  tone: VisualTone;
  formatValue: (value: number) => string;
} & PortfolioChartLinkProps) {
  const maxValue = Math.max(...buckets.map((bucket) => Math.max(bucket.value, bucket.targetValue ?? 0)), 1);
  const linkedCardClass = href ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md" : "";

  return (
    <PortfolioChartCardFrame href={href} ariaLabel={ariaLabel ?? `Open ${title} scorecard lens`}>
      <article className={`h-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 ${linkedCardClass}`}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {buckets.map((bucket) => {
            const targetValue = bucket.targetValue;
            const targetLabel = bucket.targetLabel ?? "target";
            const attainmentPercent = targetAttainmentPercent(bucket.value, targetValue);
            const fillWidth = targetValue && targetValue > 0
              ? Math.min(Math.max((bucket.value / targetValue) * 100, 4), 100)
              : Math.max(4, (bucket.value / maxValue) * 100);

            return (
              <div key={bucket.label}>
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                  <span className="truncate font-medium text-slate-700">{bucket.label}</span>
                  <span className="font-semibold tabular-nums text-slate-600">{formatValue(bucket.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${visualToneStyles[tone]}`}
                    style={{ width: `${fillWidth}%` }}
                  />
                </div>
                {targetValue ? (
                  <p className="mt-1 text-[10px] font-medium text-slate-500">
                    {formatValue(bucket.value)} of {formatValue(targetValue)} {targetLabel} · {attainmentPercent}%
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </article>
    </PortfolioChartCardFrame>
  );
}

function PortfolioVerticalBarCard({
  title,
  subtitle,
  buckets,
  tone,
  formatValue,
  href,
  ariaLabel,
}: {
  title: string;
  subtitle: string;
  buckets: PortfolioVisualBucket[];
  tone: VisualTone;
  formatValue: (value: number) => string;
} & PortfolioChartLinkProps) {
  const maxValue = Math.max(...buckets.map((bucket) => Math.max(bucket.value, bucket.targetValue ?? 0)), 1);
  const linkedCardClass = href ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md" : "";

  return (
    <PortfolioChartCardFrame href={href} ariaLabel={ariaLabel ?? `Open ${title} scorecard lens`}>
      <article className={`h-full overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 ${linkedCardClass}`}>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <div className="grid h-40 min-w-0 grid-flow-col auto-cols-fr items-end gap-2 border-b border-slate-100 pb-2">
          {buckets.map((bucket) => {
            const heightPercent = Math.max(8, (bucket.value / maxValue) * 100);
            const targetPercent = bucket.targetValue ? Math.min(Math.max((bucket.targetValue / maxValue) * 100, 0), 100) : undefined;
            const attainmentPercent = targetAttainmentPercent(bucket.value, bucket.targetValue);
            return (
              <div key={bucket.label} className="flex h-full min-w-0 flex-col items-center justify-end gap-1.5">
                <span className="max-w-full truncate text-[10px] font-semibold tabular-nums text-slate-600" title={`${bucket.label}: ${formatValue(bucket.value)}`}>
                  {formatValue(bucket.value)}
                </span>
                <div
                  className="relative flex h-28 w-full items-end justify-center rounded-t bg-slate-50 px-1"
                  title={bucket.targetValue ? `${formatValue(bucket.value)} of ${formatValue(bucket.targetValue)} ${bucket.targetLabel ?? "target"} (${attainmentPercent}%)` : undefined}
                >
                  {targetPercent !== undefined ? (
                    <span
                      className="absolute left-1 right-1 h-0.5 rounded-full bg-slate-500/70"
                      style={{ bottom: `${targetPercent}%` }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <div
                    className={`w-full max-w-10 rounded-t-md bg-gradient-to-t ${visualToneStyles[tone]}`}
                    style={{ height: `${heightPercent}%` }}
                    aria-label={bucket.targetValue ? `${bucket.label}: ${formatValue(bucket.value)} of ${formatValue(bucket.targetValue)} ${bucket.targetLabel ?? "target"}` : `${bucket.label}: ${formatValue(bucket.value)}`}
                  />
                </div>
                {bucket.targetValue ? (
                  <span className="max-w-full truncate text-[9px] font-medium tabular-nums text-slate-400">
                    {attainmentPercent}%
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-2 grid min-w-0 grid-flow-col auto-cols-fr gap-2">
          {buckets.map((bucket) => (
            <span key={bucket.label} className="min-w-0 truncate text-center text-[10px] font-medium text-slate-500" title={bucket.label}>
              {bucket.label}
            </span>
          ))}
        </div>
      </article>
    </PortfolioChartCardFrame>
  );
}

function PortfolioDonutCard({
  title,
  subtitle,
  buckets,
  tone,
  formatValue,
  href,
  ariaLabel,
}: {
  title: string;
  subtitle: string;
  buckets: PortfolioVisualBucket[];
  tone: VisualTone;
  formatValue: (value: number) => string;
} & PortfolioChartLinkProps) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const colors = donutToneColors[tone];
  let cumulativePercent = 0;
  const linkedCardClass = href ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md" : "";

  return (
    <PortfolioChartCardFrame href={href} ariaLabel={ariaLabel ?? `Open ${title} scorecard lens`}>
      <article className={`h-full overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 ${linkedCardClass}`}>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <div className="grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 112 112" className="h-24 w-24 -rotate-90" role="img" aria-label={title}>
              <circle cx="56" cy="56" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
              {buckets.map((bucket, index) => {
                const percent = total > 0 ? bucket.value / total : 0;
                const dashLength = percent * circumference;
                const dashOffset = -cumulativePercent * circumference;
                cumulativePercent += percent;

                return (
                  <circle
                    key={bucket.label}
                    cx="56"
                    cy="56"
                    r={radius}
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                    strokeDashoffset={dashOffset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-bold tabular-nums text-slate-900">{formatValue(total)}</span>
              <span className="text-[10px] font-medium text-slate-400">total</span>
            </div>
          </div>
          <div className="min-w-0 overflow-hidden space-y-1.5">
            {buckets.map((bucket, index) => {
              const percent = total > 0 ? Math.round((bucket.value / total) * 100) : 0;
              const attainmentPercent = targetAttainmentPercent(bucket.value, bucket.targetValue);
              return (
                <div key={bucket.label} className="min-w-0 text-[11px]">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-slate-600" title={bucket.label}>
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                      <span className="block min-w-0 truncate">{bucket.label}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-slate-700">{percent}%</span>
                  </div>
                  {bucket.targetValue ? (
                    <span className="mt-0.5 block truncate pl-3.5 text-[10px] font-medium tabular-nums text-slate-400">
                      {formatValue(bucket.value)} / {formatValue(bucket.targetValue)} {bucket.targetLabel ?? "target"} · {attainmentPercent}%
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </article>
    </PortfolioChartCardFrame>
  );
}

function PortfolioVisualRow({
  label,
  description,
  tone,
  children,
}: {
  label: string;
  description: string;
  tone: VisualTone;
  children: React.ReactNode;
}) {
  const pillTone =
    tone === "lives"
      ? "bg-indigo-100 text-indigo-700 ring-indigo-200"
      : tone === "achieved"
        ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
        : "bg-amber-100 text-amber-700 ring-amber-200";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${pillTone}`}>{label}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

function PortfolioDomainGroupSummary({
  domains,
  netSettlement,
  potentialSharedSavings,
}: {
  domains: ReturnType<typeof buildScorecardRollup>["domains"];
  netSettlement: number;
  potentialSharedSavings: number;
}) {
  const domainGroups = buildScorecardDomainGroups(domains);
  const allocatedGroups = allocatePortfolioDomainGroupValues({
    groups: domainGroups,
    netSettlement,
    potentialSharedSavings,
  });

  if (!allocatedGroups.length) return null;

  const totals = allocatedGroups.reduce(
    (sum, item) => ({
      achievedDollars: sum.achievedDollars + item.achievedDollars,
      potentialDollars: sum.potentialDollars + item.potentialDollars,
      remainingOpportunity: sum.remainingOpportunity + item.remainingOpportunity,
    }),
    { achievedDollars: 0, potentialDollars: 0, remainingOpportunity: 0 }
  );

  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-black tracking-[-0.02em] text-slate-900">Portfolio Domain Groups</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Quality and expense performance summarized across the contract portfolio.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Shared-savings and settlement value are allocated by each group&apos;s budgeted incentive share.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {allocatedGroups.map((item) => {
          const group = item.group;
          return (
            <article key={group.key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{group.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {group.domains.map((domain) => domain.label).join(" · ")}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">Domain Group Score</p>
                  <p className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-900">{group.domainGroupScore}%</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">Metric-weighted domain score</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700">Currently Achieved</p>
                  <p className="mt-2 text-xl font-black tracking-[-0.04em] text-emerald-800">{formatDollarAmount(item.achievedDollars)}</p>
                  <p className="mt-1 text-[11px] leading-4 text-emerald-700/80">
                    {sharePercent(item.achievedDollars, totals.achievedDollars)}% of portfolio achieved value
                  </p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-indigo-700">Budgeted</p>
                  <p className="mt-2 text-xl font-black tracking-[-0.04em] text-indigo-800">{formatDollarAmount(item.potentialDollars)}</p>
                  <p className="mt-1 text-[11px] leading-4 text-indigo-700/80">
                    {sharePercent(item.potentialDollars, totals.potentialDollars)}% of portfolio budgeted value
                  </p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.08em] text-amber-700">Remaining Opportunity</p>
                  <p className="mt-2 text-xl font-black tracking-[-0.04em] text-amber-800">{formatDollarAmount(item.remainingOpportunity)}</p>
                  <p className="mt-1 text-[11px] leading-4 text-amber-700/80">
                    {sharePercent(item.remainingOpportunity, totals.remainingOpportunity)}% of portfolio remaining opportunity
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function IncentiveCaptureMeter({
  achieved,
  potential,
  align = "left",
}: {
  achieved: number;
  potential: number;
  align?: "left" | "right";
}) {
  const capturePercent = potential > 0 ? Math.min(Math.max((achieved / potential) * 100, 0), 100) : 0;
  const roundedCapturePercent = Math.round(capturePercent);
  const alignmentClass = align === "right" ? "text-right" : "text-left";
  const rowAlignmentClass = align === "right" ? "justify-end" : "justify-start";

  return (
    <div className={`min-w-[150px] ${alignmentClass}`} title={`${formatDollarAmount(achieved)} achieved of ${formatDollarAmount(potential)} budgeted value`}>
      <div className={`flex items-baseline gap-1.5 ${rowAlignmentClass}`}>
        <span className="font-semibold tabular-nums text-emerald-700">{formatDollarAmount(achieved)}</span>
        <span className="text-[11px] text-slate-400">of</span>
        <span className="font-semibold tabular-nums text-indigo-700">{formatDollarAmount(potential)}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${capturePercent}%` }} />
      </div>
      <p className="mt-0.5 text-[10px] font-medium text-slate-500">{roundedCapturePercent}% captured</p>
    </div>
  );
}

export default function ContractListClient({ mockAgreements }: { mockAgreements: ContractAgreement[] }) {
  const [draftContracts, setDraftContracts] = useState<Contract[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [expandedAgreements, setExpandedAgreements] = useState<Set<string>>(new Set());
  const [agreementSortKey, setAgreementSortKey] = useState<AgreementSortKey>("achieved");
  const [agreementSortDirection, setAgreementSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    setDraftContracts(loadStoredContracts());
    setHydrated(true);
  }, []);

  const agreements = useMemo<ContractAgreement[]>(() => {
    if (!draftContracts.length) return mockAgreements;
    return [
      ...mockAgreements,
      {
        id: "vbca-unassigned-drafts",
        name: "Draft Contracts (Unassigned Agreement)",
        agreementType: "VBCA",
        payors: Array.from(new Set(draftContracts.map((c) => c.payor))),
        contracts: draftContracts,
      },
    ];
  }, [mockAgreements, draftContracts]);

  useEffect(() => {
    setExpandedAgreements(new Set());
  }, [agreements]);

  const allContracts = useMemo(() => agreements.flatMap((a) => a.contracts), [agreements]);
  const drafts = draftContracts.length;

  const portfolio = useMemo(() => {
    const settlements = allContracts.map((contract) => ({
      contract,
      settlement: calculateEstimatedSettlement(contract),
    }));

    const totalLives = allContracts.reduce((sum, c) => sum + c.attributedLives, 0);
    const weightedQualityNumerator = allContracts.reduce((sum, c) => sum + c.qualityScore * c.attributedLives, 0);
    const weightedEdNumerator = allContracts.reduce((sum, c) => sum + c.edVisitsPer1000 * c.attributedLives, 0);

    const statusCounts = {
      "On Track": allContracts.filter((c) => c.status === "On Track").length,
      "At Risk": allContracts.filter((c) => c.status === "At Risk").length,
      "Off Track": allContracts.filter((c) => c.status === "Off Track").length,
    } as const;

    const netSettlement = settlements.reduce((sum, item) => sum + item.settlement.estimatedAmount, 0);
    const upside = settlements
      .filter((item) => item.settlement.estimatedAmount > 0)
      .reduce((sum, item) => sum + item.settlement.estimatedAmount, 0);
    const upsideContractsCount = settlements.filter((item) => item.settlement.estimatedAmount > 0).length;
    const downside = settlements
      .filter((item) => item.settlement.estimatedAmount < 0)
      .reduce((sum, item) => sum + Math.abs(item.settlement.estimatedAmount), 0);
    const downsideContractsCount = settlements.filter((item) => item.settlement.estimatedAmount < 0).length;
    const qualityBlockedUpside = settlements
      .filter((item) => item.settlement.status === "quality_blocked")
      .reduce((sum, item) => sum + Math.max(0, item.settlement.grossDeltaAmount), 0);

    const atRiskLives = allContracts
      .filter((c) => c.status === "At Risk" || c.status === "Off Track")
      .reduce((sum, c) => sum + c.attributedLives, 0);

    const payorMap = new Map<string, { payor: string; lives: number; qualityNumerator: number; edNumerator: number; settlement: number }>();
    settlements.forEach(({ contract, settlement }) => {
      const current = payorMap.get(contract.payor) ?? {
        payor: contract.payor,
        lives: 0,
        qualityNumerator: 0,
        edNumerator: 0,
        settlement: 0,
      };
      current.lives += contract.attributedLives;
      current.qualityNumerator += contract.qualityScore * contract.attributedLives;
      current.edNumerator += contract.edVisitsPer1000 * contract.attributedLives;
      current.settlement += settlement.estimatedAmount;
      payorMap.set(contract.payor, current);
    });

    const payorSummaries = Array.from(payorMap.values())
      .map((item) => ({
        payor: item.payor,
        lives: item.lives,
        avgQuality: item.lives > 0 ? item.qualityNumerator / item.lives : 0,
        avgEd: item.lives > 0 ? item.edNumerator / item.lives : 0,
        settlement: item.settlement,
      }))
      .sort((a, b) => b.lives - a.lives);

    return {
      settlements,
      totalLives,
      avgQuality: totalLives > 0 ? weightedQualityNumerator / totalLives : 0,
      avgEd: totalLives > 0 ? weightedEdNumerator / totalLives : 0,
      statusCounts,
      netSettlement,
      upside,
      upsideContractsCount,
      downside,
      downsideContractsCount,
      qualityBlockedUpside,
      atRiskLives,
      payorSummaries,
    };
  }, [allContracts]);

  const topFinancialPriorities = useMemo(
    () => getTopFinancialPriorityItems(allContracts, { limit: 12 }),
    [allContracts]
  );

  const portfolioScorecardRollup = useMemo(
    () =>
      buildScorecardRollup({
        scopeType: "portfolio",
        scopeId: "enterprise",
        scopeLabel: "Portfolio",
        contracts: allContracts,
      }),
    [allContracts]
  );

  const qualityBlockedInsights = useMemo(
    () => getQualityBlockedSavingsInsights(allContracts),
    [allContracts]
  );

  const agreementSummaries = useMemo(() => {
    return agreements.map((agreement) => {
      const contracts = agreement.contracts;
      const totalLives = contracts.reduce((sum, c) => sum + c.attributedLives, 0);
      const scorecard = buildAgreementScorecard(agreement);

      return {
        agreement,
        totalLives,
        overallStars: scorecard.overallStars,
        achievedDollars: scorecard.achievedDollars ?? 0,
        potentialDollars: scorecard.potentialDollars ?? 0,
      };
    });
  }, [agreements]);

  const portfolioIncentiveTotals = useMemo(
    () => ({
      achievedDollars: agreementSummaries.reduce((sum, item) => sum + item.achievedDollars, 0),
      potentialDollars: agreementSummaries.reduce((sum, item) => sum + item.potentialDollars, 0),
    }),
    [agreementSummaries]
  );
  const portfolioVbcValueTotals = useMemo(() => {
    const potentialSharedSavings = portfolio.settlements.reduce((sum, item) => {
      if (!item.settlement.terms.sharedSavings) return sum;
      return sum + item.settlement.benchmarkSpend * (item.settlement.terms.sharedSavingsCap / 100);
    }, 0);

    const earnedVbcValue = portfolio.netSettlement + portfolioIncentiveTotals.achievedDollars;
    const potentialVbcValue = potentialSharedSavings + portfolioIncentiveTotals.potentialDollars;
    const captureRate = potentialVbcValue > 0
      ? Math.round((earnedVbcValue / potentialVbcValue) * 100)
      : 0;

    return {
      earnedVbcValue,
      potentialVbcValue,
      potentialSharedSavings,
      captureRate,
    };
  }, [portfolio.netSettlement, portfolio.settlements, portfolioIncentiveTotals.achievedDollars, portfolioIncentiveTotals.potentialDollars]);

  const contractPortfolioRows = useMemo(
    () =>
      allContracts.map((contract) => {
        const scorecard = buildContractScorecard(contract);
        return {
          contract,
          achievedDollars: scorecard.achievedDollars ?? 0,
          potentialDollars: scorecard.potentialDollars ?? 0,
          costAmount: annualizedCost(contract),
          targetCostAmount: annualizedTargetCost(contract),
          insuranceSegment: inferInsuranceSegment(contract),
        };
      }),
    [allContracts]
  );

  const portfolioVisualBuckets = useMemo(
    () => ({
      livesByMarket: withLivesTargets(toBuckets(
        contractPortfolioRows,
        (item) => item.contract.market ?? "Unassigned Market",
        (item) => item.contract.attributedLives,
        6
      ), prototypeLivesTargets.market),
      livesByContractType: toBuckets(
        contractPortfolioRows,
        (item) => resolveVbcContractModel(item.contract),
        (item) => item.contract.attributedLives,
        5,
        (item) => derivedLivesTarget(item.contract.attributedLives),
        "target"
      ),
      livesByInsuranceSegment: withLivesTargets(toBuckets(
        contractPortfolioRows,
        (item) => item.insuranceSegment,
        (item) => item.contract.attributedLives
      ), prototypeLivesTargets.insuranceSegment),
      livesByPayor: withLivesTargets(toBuckets(
        contractPortfolioRows,
        (item) => item.contract.payor,
        (item) => item.contract.attributedLives
      ), prototypeLivesTargets.payor),
      achievedByMarket: toBuckets(
        contractPortfolioRows,
        (item) => item.contract.market ?? "Unassigned Market",
        (item) => item.achievedDollars,
        6,
        (item) => item.potentialDollars,
        "budgeted"
      ),
      achievedByContractType: toBuckets(
        contractPortfolioRows,
        (item) => resolveVbcContractModel(item.contract),
        (item) => item.achievedDollars,
        5,
        (item) => item.potentialDollars,
        "budgeted"
      ),
      achievedByInsuranceSegment: toBuckets(
        contractPortfolioRows,
        (item) => item.insuranceSegment,
        (item) => item.achievedDollars,
        5,
        (item) => item.potentialDollars,
        "budgeted"
      ),
      achievedByPayor: toBuckets(
        contractPortfolioRows,
        (item) => item.contract.payor,
        (item) => item.achievedDollars,
        5,
        (item) => item.potentialDollars,
        "budgeted"
      ),
      costByMarket: toBuckets(
        contractPortfolioRows,
        (item) => item.contract.market ?? "Unassigned Market",
        (item) => item.costAmount,
        6,
        (item) => item.targetCostAmount,
        "target"
      ),
      costByContractType: toBuckets(
        contractPortfolioRows,
        (item) => resolveVbcContractModel(item.contract),
        (item) => item.costAmount,
        5,
        (item) => item.targetCostAmount,
        "target"
      ),
      costByInsuranceSegment: toBuckets(
        contractPortfolioRows,
        (item) => item.insuranceSegment,
        (item) => item.costAmount,
        5,
        (item) => item.targetCostAmount,
        "target"
      ),
      costByPayor: toBuckets(
        contractPortfolioRows,
        (item) => item.contract.payor,
        (item) => item.costAmount,
        5,
        (item) => item.targetCostAmount,
        "target"
      ),
    }),
    [contractPortfolioRows]
  );

  const sortedAgreementSummaries = useMemo(() => {
    const sorted = [...agreementSummaries].sort((a, b) => {
      switch (agreementSortKey) {
        case "name":
          return a.agreement.name.localeCompare(b.agreement.name);
        case "lives":
          return a.totalLives - b.totalLives;
        case "achieved":
          return a.achievedDollars - b.achievedDollars;
        case "potential":
          return a.potentialDollars - b.potentialDollars;
        case "quality":
          return a.overallStars - b.overallStars;
        case "contracts":
          return a.agreement.contracts.length - b.agreement.contracts.length;
        default:
          return 0;
      }
    });

    return agreementSortDirection === "asc" ? sorted : sorted.reverse();
  }, [agreementSummaries, agreementSortDirection, agreementSortKey]);

  const formatMoneyCompact = (amount: number) => {
    const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
    const absolute = Math.abs(amount);
    if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(1)}M`;
    if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
    return `${sign}$${absolute.toFixed(0)}`;
  };

  const formatMoneyMagnitude = (amount: number) => formatMoneyCompact(Math.abs(amount)).replace(/^\+/, "");

  const formatPayorLabel = (payors: string[]) => {
    if (payors.length <= 2) return payors.join(", ");
    return `${payors.slice(0, 2).join(", ")} +${payors.length - 2} more`;
  };

  const remainingVbcOpportunity = Math.max(
    portfolioVbcValueTotals.potentialVbcValue - portfolioVbcValueTotals.earnedVbcValue,
    0
  );
  const formatFinancialOsMoney = (amount: number) =>
    amount < 0 ? formatMoneyCompact(amount) : formatMoneyMagnitude(amount);

  return (
    <div>
      <section className="sketch-hero mb-5 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#073b4c] via-[#005A74] to-slate-900 p-6 text-white shadow-xl shadow-slate-900/10 ring-1 ring-white/10 lg:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr),minmax(280px,0.65fr)] lg:items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">
              Contract financial operating system
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-[-0.045em] sm:text-4xl">
              You have earned {formatFinancialOsMoney(portfolioVbcValueTotals.earnedVbcValue)} of {formatFinancialOsMoney(portfolioVbcValueTotals.potentialVbcValue)} budgeted VBC value.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-cyan-50/85">
              Monitor current earnings, remaining opportunity, and the financial levers most likely to unlock contract value. Analytics are available below when you need portfolio composition detail.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-cyan-50/80">
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                {agreements.length} agreements
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/15">
                {allContracts.length} contracts
              </span>
              {hydrated && drafts > 0 && (
                <span className="rounded-full bg-amber-300/20 px-3 py-1 font-semibold text-amber-100 ring-1 ring-amber-200/30">
                  {drafts} draft{drafts > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-cyan-200">Capture rate</p>
            <p className="mt-2 text-4xl font-black tracking-[-0.06em] text-white">
              {portfolioVbcValueTotals.captureRate}%
            </p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-100"
                style={{ width: `${Math.min(Math.max(portfolioVbcValueTotals.captureRate, 0), 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs leading-5 text-cyan-50/80">
              Earned VBC value divided by budgeted VBC value.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <Link href="/scorecards" className="text-sm font-semibold text-cyan-100 hover:text-white hover:underline">
            Open portfolio scorecards →
          </Link>
          <Link
            href="/contracts/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-black text-[#005A74] shadow-sm hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            + New Contract
          </Link>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href={getPopulationInsightsHref({
            scopeType: "portfolio",
            scopeId: "enterprise",
            scopeLabel: "Portfolio",
            lives: portfolio.totalLives,
            source: "contracts-portfolio-lives",
          })}
          className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
          aria-label="View population insights for portfolio lives"
        >
          <article className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">Lives</p>
            <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-900">
              {portfolio.totalLives.toLocaleString()}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Across {allContracts.length} active contracts · View population insights →</p>
          </article>
        </Link>
        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-emerald-700">Current earned VBC value</p>
          <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-emerald-800">
            {formatFinancialOsMoney(portfolioVbcValueTotals.earnedVbcValue)}
          </p>
          <p className="mt-1 text-xs leading-5 text-emerald-700/80">Net settlement + earned incentives</p>
        </article>
        <article className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-indigo-700">Budgeted</p>
          <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-indigo-800">
            {formatFinancialOsMoney(portfolioVbcValueTotals.potentialVbcValue)}
          </p>
          <p className="mt-1 text-xs leading-5 text-indigo-700/80">Budgeted savings + incentives</p>
        </article>
        <article className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.08em] text-amber-700">Remaining opportunity</p>
          <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-amber-800">
            {formatFinancialOsMoney(remainingVbcOpportunity)}
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-700/80">Budgeted value not yet captured</p>
        </article>
      </div>

      <PortfolioDomainGroupSummary
        domains={portfolioScorecardRollup.domains}
        netSettlement={portfolio.netSettlement}
        potentialSharedSavings={portfolioVbcValueTotals.potentialSharedSavings}
      />

      <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.25fr),minmax(360px,0.75fr)] xl:items-start">
        <TopFinancialPrioritiesPanel
          items={topFinancialPriorities}
          title="Top Financial Levers"
          subtitle="Portfolio-ranked priorities across contracts, opportunities, and scorecard domains. Start here before exploring detailed analytics."
          showFilters={false}
          maxItems={5}
        />
        <QualityBlockedSavingsPanel insights={qualityBlockedInsights} mode="portfolio" />
      </div>

      <details open className="group mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 shadow-sm">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-slate-100/70">
          <div>
            <h2 className="text-base font-bold text-slate-900">Portfolio analytics</h2>
            <p className="mt-1 text-sm text-slate-500">
              Optional detail: explore where lives, earned value, and annualized expense are concentrated.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#005A74] ring-1 ring-slate-200 group-open:hidden">
            View charts ▾
          </span>
          <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200 group-open:inline-flex">
            Hide charts ▴
          </span>
        </summary>
        <div className="space-y-6 border-t border-slate-200 p-4">
          <PortfolioVisualRow
            label="Lives distribution"
            description="Where members are concentrated across the portfolio."
            tone="lives"
          >
            <PortfolioDistributionCard
              title="Lives by Market"
              subtitle="Current lives vs internal target"
              buckets={portfolioVisualBuckets.livesByMarket}
              tone="lives"
              formatValue={compactNumber}
              href={scorecardLensHref.market}
              ariaLabel="Open Market scorecard lens"
            />
            <PortfolioDonutCard
              title="Lives by Contract Type"
              subtitle="Current lives vs internal target"
              buckets={portfolioVisualBuckets.livesByContractType}
              tone="lives"
              formatValue={compactNumber}
              href={scorecardLensHref.contractType}
              ariaLabel="Open Contract Type scorecard lens"
            />
            <PortfolioVerticalBarCard
              title="Lives by Insurance Segment"
              subtitle="Current lives vs internal target"
              buckets={portfolioVisualBuckets.livesByInsuranceSegment}
              tone="lives"
              formatValue={compactNumber}
              href={scorecardLensHref.insuranceSegment}
              ariaLabel="Open Insurance Segment scorecard lens"
            />
            <PortfolioDistributionCard
              title="Top Payor Lives"
              subtitle="Current lives vs internal target"
              buckets={portfolioVisualBuckets.livesByPayor}
              tone="lives"
              formatValue={compactNumber}
              href={scorecardLensHref.payor}
              ariaLabel="Open Payor scorecard lens"
            />
          </PortfolioVisualRow>

          <PortfolioVisualRow
            label="Achieved value distribution"
            description="Where captured incentive value is being generated."
            tone="achieved"
          >
            <PortfolioDistributionCard
              title="Achieved Value by Market"
              subtitle="Currently achieved vs budgeted"
              buckets={portfolioVisualBuckets.achievedByMarket}
              tone="achieved"
              formatValue={formatMoneyMagnitude}
              href={scorecardLensHref.market}
              ariaLabel="Open Market scorecard lens"
            />
            <PortfolioDonutCard
              title="Achieved Value by Contract Type"
              subtitle="Currently achieved vs budgeted"
              buckets={portfolioVisualBuckets.achievedByContractType}
              tone="achieved"
              formatValue={formatMoneyMagnitude}
              href={scorecardLensHref.contractType}
              ariaLabel="Open Contract Type scorecard lens"
            />
            <PortfolioVerticalBarCard
              title="Achieved Value by Insurance Segment"
              subtitle="Currently achieved vs budgeted"
              buckets={portfolioVisualBuckets.achievedByInsuranceSegment}
              tone="achieved"
              formatValue={formatMoneyMagnitude}
              href={scorecardLensHref.insuranceSegment}
              ariaLabel="Open Insurance Segment scorecard lens"
            />
            <PortfolioDistributionCard
              title="Achieved Value by Payor"
              subtitle="Currently achieved vs budgeted"
              buckets={portfolioVisualBuckets.achievedByPayor}
              tone="achieved"
              formatValue={formatMoneyMagnitude}
              href={scorecardLensHref.payor}
              ariaLabel="Open Payor scorecard lens"
            />
          </PortfolioVisualRow>

          <PortfolioVisualRow
            label="Expense distribution"
            description="Where annualized expense under management is concentrated."
            tone="cost"
          >
            <PortfolioDistributionCard
              title="Expense by Market"
              subtitle="Current expense vs target expense"
              buckets={portfolioVisualBuckets.costByMarket}
              tone="cost"
              formatValue={formatMoneyMagnitude}
              href={scorecardLensHref.market}
              ariaLabel="Open Market scorecard lens"
            />
            <PortfolioDonutCard
              title="Expense by Contract Type"
              subtitle="Current expense vs target expense"
              buckets={portfolioVisualBuckets.costByContractType}
              tone="cost"
              formatValue={formatMoneyMagnitude}
              href={scorecardLensHref.contractType}
              ariaLabel="Open Contract Type scorecard lens"
            />
            <PortfolioVerticalBarCard
              title="Expense by Insurance Segment"
              subtitle="Current expense vs target expense"
              buckets={portfolioVisualBuckets.costByInsuranceSegment}
              tone="cost"
              formatValue={formatMoneyMagnitude}
              href={scorecardLensHref.insuranceSegment}
              ariaLabel="Open Insurance Segment scorecard lens"
            />
            <PortfolioDistributionCard
              title="Expense by Payor Population"
              subtitle="Current expense vs target expense"
              buckets={portfolioVisualBuckets.costByPayor}
              tone="cost"
              formatValue={formatMoneyMagnitude}
              href={scorecardLensHref.payor}
              ariaLabel="Open Payor scorecard lens"
            />
          </PortfolioVisualRow>
      </div>


      </details>

      <div className="mb-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Agreements</h2>
            <p className="mt-1 text-sm text-slate-500">Drill into agreement and contract-level detail after reviewing the portfolio financial levers.</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="agreement-sort" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sort by
            </label>
            <select
              id="agreement-sort"
              value={agreementSortKey}
              onChange={(event) => setAgreementSortKey(event.target.value as AgreementSortKey)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="name">Agreement Name</option>
              <option value="lives">Lives</option>
              <option value="quality">Quality Score</option>
              <option value="achieved">Total Achieved</option>
              <option value="potential">Budgeted</option>
              <option value="contracts"># of Contracts</option>
            </select>
            <button
              type="button"
              onClick={() => setAgreementSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              aria-label={`Toggle sort direction (currently ${agreementSortDirection === "asc" ? "ascending" : "descending"})`}
            >
              {agreementSortDirection === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>
      </div>


      <div className="space-y-3">
        {sortedAgreementSummaries.map((summary) => {
          const agreement = summary.agreement;
          const isExpanded = expandedAgreements.has(agreement.id);
          const hasDrafts = agreement.contracts.some((contract) => contract.isDraft);

          return (
            <section key={agreement.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() => {
                  setExpandedAgreements((current) => {
                    const next = new Set(current);
                    if (next.has(agreement.id)) next.delete(agreement.id);
                    else next.add(agreement.id);
                    return next;
                  });
                }}
                className="w-full bg-slate-50 px-5 py-4 text-left hover:bg-slate-100"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{agreement.name}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700">
                        {agreement.agreementType}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                        {agreement.payors.length === 1 ? "Single Payor" : "Multi-Payor"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                        {agreement.contracts.length} contract{agreement.contracts.length !== 1 ? "s" : ""}
                      </span>
                      {hasDrafts && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                          Drafts included
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{formatPayorLabel(agreement.payors)}</p>
                    {!hasDrafts && (
                      <Link
                        href={`/agreements/${agreement.id}/scorecard`}
                        className="mt-2 inline-flex text-xs font-semibold text-indigo-600 hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View Agreement Scorecard →
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-4 text-xs">
                    <div className="text-right">
                      <p className="text-slate-500">Lives</p>
                      <Link
                        href={getPopulationInsightsHref({
                          scopeType: "agreement",
                          scopeId: agreement.id,
                          scopeLabel: agreement.name,
                          lives: summary.totalLives,
                          source: "contracts-agreement-lives",
                        })}
                        className="font-semibold text-indigo-700 hover:underline"
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`View population insights for ${agreement.name} lives`}
                      >
                        {summary.totalLives.toLocaleString()}
                      </Link>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500">Quality Score</p>
                      <div className="mt-0.5 flex justify-end">
                        <StarRatingDisplay value={summary.overallStars} roundingMode="half" size="sm" showNumeric />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500">Incentive Capture</p>
                      <div className="mt-0.5">
                        <IncentiveCaptureMeter achieved={summary.achievedDollars} potential={summary.potentialDollars} align="right" />
                      </div>
                    </div>
                    <span className="text-lg text-slate-400">{isExpanded ? "▾" : "▸"}</span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead>
                      <tr className="bg-white">
                        {["Contract", "Payor / Type", "Lives", "Quality Score", "Incentive Capture", ""].map((h) => (
                          <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {agreement.contracts.map((contract) => {
                        const contractScorecard = buildContractScorecard(contract);
                        return (
                          <tr key={contract.id} className="group transition-colors hover:bg-slate-50">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900">{contract.name}</span>
                                {contract.isDraft && (
                                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Draft</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-700">{contract.payor}</p>
                              <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                                {contract.contractType}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-slate-700">
                              {contract.isDraft ? (
                                contract.attributedLives.toLocaleString()
                              ) : (
                                <Link
                                  href={getPopulationInsightsHref({
                                    scopeType: "contract",
                                    scopeId: contract.id,
                                    scopeLabel: contract.name,
                                    lives: contract.attributedLives,
                                    source: "contracts-inventory-contract-lives",
                                  })}
                                  className="font-semibold text-indigo-700 hover:underline"
                                  aria-label={`View population insights for ${contract.name} lives`}
                                >
                                  {contract.attributedLives.toLocaleString()}
                                </Link>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <StarRatingDisplay value={contractScorecard.overallStars} roundingMode="half" size="sm" showNumeric />
                            </td>
                            <td className="px-5 py-4">
                              <IncentiveCaptureMeter
                                achieved={contractScorecard.achievedDollars ?? 0}
                                potential={contractScorecard.potentialDollars ?? 0}
                              />
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <Link href={`/contracts/${contract.id}/configure`} className="text-sm font-medium text-slate-700 hover:underline">
                                  Configure
                                </Link>
                                <Link href={`/contracts/${contract.id}/scorecard`} className="text-sm font-medium text-indigo-600 hover:underline">
                                  Contract Scorecard
                                </Link>
                                <Link href={`/contracts/${contract.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
                                  View →
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
