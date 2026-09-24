"use client";

import Link from "next/link";
import { getPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { ScorecardChildSummary } from "@/types/scorecardRollup";
import type { ScorecardView } from "@/components/scorecards/ScorecardViewSelector";

interface ScorecardQualityBlockedLensCardProps {
  items: ScorecardChildSummary[];
  view: ScorecardView;
}

function formatMoneyCompact(amount: number) {
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000) return `$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `$${(absolute / 1_000).toFixed(1)}K`;
  return `$${absolute.toFixed(0)}`;
}

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function lensLabel(view: ScorecardView) {
  if (view === "payor") return "payors";
  if (view === "insuranceSegment") return "insurance segments";
  if (view === "contractType") return "contract types";
  if (view === "market") return "markets";
  if (view === "region") return "regions";
  if (view === "agreement") return "agreements";
  return "contracts";
}

function captureRate(item: ScorecardChildSummary) {
  if (item.vbcPotentialDollars <= 0) return 0;
  return Math.min(Math.max((item.vbcEarnedDollars / item.vbcPotentialDollars) * 100, 0), 100);
}

export default function ScorecardQualityBlockedLensCard({ items, view }: ScorecardQualityBlockedLensCardProps) {
  const blockedItems = [...items]
    .filter((item) => item.qualityBlockedSavingsAmount > 0)
    .sort((a, b) => b.qualityBlockedSavingsAmount - a.qualityBlockedSavingsAmount)
    .slice(0, 3);
  const totalBlocked = items.reduce((sum, item) => sum + item.qualityBlockedSavingsAmount, 0);
  const label = lensLabel(view);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-amber-700">Earnings gates to watch</p>
            <h3 className="mt-1 text-base font-bold text-slate-900">Unlock quality-blocked savings</h3>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Top {label} in this lens where quality gates may be blocking earnings.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
            {blockedItems.length} shown
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">Blocked in current lens</p>
          <p className="mt-1 text-2xl font-black tabular-nums tracking-[-0.04em] text-amber-900">
            {formatMoneyCompact(totalBlocked)}
          </p>
        </div>
      </div>

      <div className="p-5">
        {blockedItems.length === 0 ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-800">No quality gates are currently blocking this lens.</p>
            <p className="mt-1 text-xs leading-5 text-emerald-700">Continue monitoring as scorecard periods progress.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {blockedItems.map((item) => (
              <article key={`${item.scopeType}:${item.id}`} className="bg-white p-3 transition-colors hover:bg-slate-50/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {item.href ? (
                      <Link href={item.href} className="block truncate text-sm font-bold text-slate-900 hover:text-indigo-700 hover:underline">
                        {item.label}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-bold text-slate-900">{item.label}</p>
                    )}
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      <Link
                        href={getPopulationInsightsHref({
                          scopeType: item.scopeType,
                          scopeId: item.id,
                          scopeLabel: item.label,
                          lives: item.attributedLives,
                          source: "scorecard-quality-blocked-lives",
                        })}
                        className="font-semibold text-indigo-700 hover:underline"
                        aria-label={`View population insights for ${item.label} lives`}
                      >
                        {formatNumber(item.attributedLives)} lives
                      </Link>{" "}
                      · {Math.round(captureRate(item))}% VBC capture
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black tabular-nums text-amber-800">{formatMoneyCompact(item.qualityBlockedSavingsAmount)}</p>
                    <p className="text-[11px] font-semibold text-amber-700">blocked</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {blockedItems.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/quality" className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700">
              Review blockers
            </Link>
            <Link href="/actions" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-50">
              Launch workflows
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
