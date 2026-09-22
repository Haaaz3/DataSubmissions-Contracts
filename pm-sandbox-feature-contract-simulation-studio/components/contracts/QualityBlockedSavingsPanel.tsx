"use client";

import Link from "next/link";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import type { QualityBlockedSavingsInsight } from "@/types/contractInsights";

interface QualityBlockedSavingsPanelProps {
  insights?: QualityBlockedSavingsInsight[];
  insight?: QualityBlockedSavingsInsight | null;
  mode?: "portfolio" | "contract";
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function QualityBlockedSavingsPanel({
  insights = [],
  insight,
  mode = "portfolio",
}: QualityBlockedSavingsPanelProps) {
  const { flags } = useFeatureFlags();

  if (!flags.sections.qualityBlockedSavings) {
    return null;
  }

  if (mode === "portfolio" && !flags.sections.contractPortfolioEarningsGateToWatch) {
    return null;
  }

  if (mode === "contract") {
    if (!insight) return null;

    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm ring-1 ring-amber-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-amber-700">Savings at risk from quality gaps</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{formatMoney(insight.blockedSavingsAmount)} currently blocked</h3>
            <p className="mt-1 text-xs text-slate-600">
              Quality score {insight.qualityScore} vs gate {insight.qualityGate} · {insight.pointsToThreshold.toFixed(1)} points to threshold
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Unlock value path
          </span>
        </div>

        {insight.topMeasures.length > 0 && (
          <div className="mt-4 space-y-2">
            {insight.topMeasures.map((measure) => (
              <article key={measure.measureId} className="rounded-lg border border-amber-100 bg-white px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{measure.measureName}</p>
                  <span className="text-xs font-semibold text-amber-700">Gap {measure.gap.toFixed(1)} pts</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600">
                  {measure.currentRate.toFixed(1)}% current vs {measure.targetRate.toFixed(1)}% target · {measure.estimatedContribution}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {insight.ctaLinks.map((cta) => (
            <Link
              key={cta.label}
              href={cta.href}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50"
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  const totalBlocked = insights.reduce((sum, item) => sum + item.blockedSavingsAmount, 0);
  const topContracts = [...insights]
    .sort((a, b) => b.blockedSavingsAmount - a.blockedSavingsAmount)
    .slice(0, 3);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-amber-700">
              Earnings gates to watch
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h3 className="text-base font-bold tracking-[-0.02em] text-slate-900">
                Unlock quality-blocked savings
              </h3>
              <button
                type="button"
                title="Dollars are modeled as recoverable when gross savings exist, but payout is blocked until the contract quality gate is met."
                aria-label="How quality-blocked savings are calculated"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                i
              </button>
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Contract gate metrics currently preventing shared savings, incentives, or settlement earnings.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
            {insights.length} blocked contract{insights.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">Blocked by quality gates</p>
          <p className="mt-1 text-2xl font-black tabular-nums tracking-[-0.04em] text-amber-900">
            {formatMoney(totalBlocked)}
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800/80">
            Recoverable when contract-level quality gate thresholds are met.
          </p>
        </div>
      </div>

      <div className="p-5">
        {topContracts.length === 0 ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-800">No quality gates are currently blocking earnings.</p>
            <p className="mt-1 text-xs leading-5 text-emerald-700">
              Continue monitoring quality thresholds as settlement periods progress.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {topContracts.map((item) => (
              <article key={item.contractId} className="bg-white p-3 transition-colors hover:bg-slate-50/80">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/contracts/${item.contractId}`}
                      className="block truncate text-sm font-bold text-slate-900 hover:text-indigo-700 hover:underline"
                    >
                      {item.contractName}
                    </Link>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Quality {item.qualityScore} / gate {item.qualityGate} · {item.pointsToThreshold.toFixed(1)} pts short
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black tabular-nums text-amber-800">{formatMoney(item.blockedSavingsAmount)}</p>
                    <p className="text-[11px] font-semibold text-amber-700">blocked</p>
                  </div>
                </div>

                {item.topMeasures.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Gate metrics to close</p>
                    {item.topMeasures.slice(0, 2).map((measure) => (
                      <div key={measure.measureId} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-700">{measure.measureName}</span>
                        <span className="font-bold tabular-nums text-slate-900">
                          {measure.currentRate.toFixed(1)}% / {measure.targetRate.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    {item.topMeasures[0]?.estimatedContribution ?? "Monitor quality gate recovery"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {topContracts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/quality" className="rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700">
              Review quality blockers
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
