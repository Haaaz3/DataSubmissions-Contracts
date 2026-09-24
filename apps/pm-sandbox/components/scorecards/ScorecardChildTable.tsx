"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { allocatePortfolioDomainGroupValues } from "@/components/contracts/portfolioDomainGroupAllocation";
import { buildScorecardDomainGroups } from "@/components/contracts/domainGroups";
import { getPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { ScorecardChildSummary } from "@/types/scorecardRollup";

type SortKey = "name" | "lives" | "opportunityLeft" | "opportunityShare" | "vbcPotential";
type SortDirection = "asc" | "desc";

const columns: Array<{ key: SortKey; label: string; description: string }> = [
  { key: "name", label: "Name", description: "Contract, payor, segment, type, market, region, or scorecard grouping represented by this row." },
  { key: "lives", label: "Lives", description: "Attributed lives included in this row. Click the count to view population insights." },
  { key: "opportunityLeft", label: "Opportunity Left", description: "Remaining value-based care dollars still available to capture for this row." },
  { key: "opportunityShare", label: "Opportunity Share", description: "This row's remaining VBC opportunity as a percentage of the contract portfolio budgeted VBC value." },
  { key: "vbcPotential", label: "Budgeted VBC", description: "Budgeted value-based care dollars available for this row." },
];

function formatMoneyCompact(amount: number, options: { signed?: boolean } = {}) {
  const sign = options.signed ? (amount > 0 ? "+" : amount < 0 ? "-" : "") : amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(0)}`;
}

function opportunitySharePercent(item: ScorecardChildSummary, totalVisibleVbcPotential: number) {
  if (totalVisibleVbcPotential <= 0) return 0;
  return Math.min(Math.max((item.remainingVbcOpportunity / totalVisibleVbcPotential) * 100, 0), 100);
}

function DomainGroupSummaryCell({ item }: { item: ScorecardChildSummary }) {
  const domainGroups = buildScorecardDomainGroups(item.domains);
  const allocatedGroups = allocatePortfolioDomainGroupValues({
    groups: domainGroups,
    netSettlement: item.vbcEarnedDollars - item.achievedDollars,
    potentialSharedSavings: item.vbcPotentialDollars - item.potentialDollars,
  });

  if (!allocatedGroups.length) {
    return <span className="text-xs text-slate-400">No domain groups</span>;
  }

  return (
    <div className="w-[42rem] max-w-[70vw] space-y-2">
      {allocatedGroups.map((allocated) => {
        const group = allocated.group;

        return (
          <div key={group.key} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <div className="border-b border-slate-200 bg-slate-200/80 px-2.5 py-1">
              <p className="text-[11px] font-semibold text-slate-800">{group.label}</p>
            </div>
            <div className="grid grid-cols-[minmax(7rem,0.8fr),repeat(3,minmax(8rem,1fr))] gap-1 p-1">
              <div className="rounded-md border border-slate-100 bg-white px-2 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Group Score</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">{group.domainGroupScore}%</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Current</p>
              </div>
              <div className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-700">Currently Achieved</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-emerald-800">{formatMoneyCompact(allocated.achievedDollars)}</p>
                <p className="mt-0.5 text-[10px] text-emerald-700/80">Allocated VBC value</p>
              </div>
              <div className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-700">Budgeted</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-indigo-800">{formatMoneyCompact(allocated.potentialDollars)}</p>
                <p className="mt-0.5 text-[10px] text-indigo-700/80">Allocated VBC budget</p>
              </div>
              <div className="rounded-md border border-amber-100 bg-amber-50 px-2 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wide text-amber-700">Remaining</p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-amber-800">{formatMoneyCompact(allocated.remainingOpportunity)}</p>
                <p className="mt-0.5 text-[10px] text-amber-700/80">Opportunity left</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ScorecardChildTable({
  items,
  title,
}: {
  items: ScorecardChildSummary[];
  title: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("vbcPotential");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const totalVisibleVbcPotential = useMemo(
    () => items.reduce((sum, item) => sum + item.vbcPotentialDollars, 0),
    [items]
  );

  const sortedItems = useMemo(() => {
    const valueForSort = (item: ScorecardChildSummary) => {
      switch (sortKey) {
        case "name":
          return item.label;
        case "lives":
          return item.attributedLives;
        case "opportunityLeft":
          return item.remainingVbcOpportunity;
        case "opportunityShare":
          return opportunitySharePercent(item, totalVisibleVbcPotential);
        case "vbcPotential":
          return item.vbcPotentialDollars;
        default:
          return item.label;
      }
    };

    return [...items].sort((a, b) => {
      const aValue = valueForSort(a);
      const bValue = valueForSort(b);
      const comparison = typeof aValue === "string" && typeof bValue === "string"
        ? aValue.localeCompare(bValue)
        : Number(aValue) - Number(bValue);

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [items, sortDirection, sortKey, totalVisibleVbcPotential]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "name" ? "asc" : "desc");
  };

  const sortIndicator = (key: SortKey) => {
    if (key !== sortKey) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((column) => {
                return (
                  <Fragment key={column.key}>
                    <th
                      aria-sort={sortKey === column.key ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      <div className="group relative flex flex-col items-start gap-1">
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          aria-describedby={`scorecard-column-${column.key}-tooltip`}
                          className="inline-flex items-center gap-1 rounded text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                          <span>{column.label}</span>
                          <span className={sortKey === column.key ? "text-indigo-600" : "text-slate-300"}>{sortIndicator(column.key)}</span>
                        </button>
                        <span
                          id={`scorecard-column-${column.key}-tooltip`}
                          role="tooltip"
                          className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-72 rounded-lg bg-slate-950 px-3 py-2 text-left text-xs font-medium normal-case leading-5 tracking-normal text-white opacity-0 shadow-xl shadow-slate-900/20 transition-opacity group-focus-within:block group-focus-within:opacity-100 group-hover:block group-hover:opacity-100"
                        >
                          {column.description}
                        </span>
                      </div>
                    </th>
                    {column.key === "lives" ? (
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Domain Groups
                      </th>
                    ) : null}
                  </Fragment>
                );
              })}
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedItems.map((item) => (
              <tr key={`${item.scopeType}:${item.id}`} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{item.label}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <Link
                    href={getPopulationInsightsHref({
                      scopeType: item.scopeType,
                      scopeId: item.id,
                      scopeLabel: item.label,
                      lives: item.attributedLives,
                      source: "scorecard-table-lives",
                    })}
                    className="inline-flex rounded-md text-left font-semibold text-indigo-700 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    aria-label={`View population insights for ${item.label} lives`}
                  >
                    <span>{item.attributedLives.toLocaleString()}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 align-top">
                  <DomainGroupSummaryCell item={item} />
                </td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums text-slate-800">
                  {formatMoneyCompact(item.remainingVbcOpportunity)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums text-slate-900" title={`${formatMoneyCompact(item.remainingVbcOpportunity)} of ${formatMoneyCompact(totalVisibleVbcPotential)} contract portfolio budgeted VBC value`}>
                  {Math.round(opportunitySharePercent(item, totalVisibleVbcPotential))}%
                </td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums text-indigo-700">
                  {formatMoneyCompact(item.vbcPotentialDollars)}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.href ? (
                    <Link href={item.href} className="text-sm font-semibold text-indigo-600 hover:underline">
                      View →
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
