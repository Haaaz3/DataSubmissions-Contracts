"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import type { FinancialPriorityCategory, FinancialPriorityItem } from "@/types/contractInsights";

const categoryOptions: Array<{ key: "all" | FinancialPriorityCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "quick_win", label: "Quick wins" },
  { key: "downside", label: "Risks" },
  { key: "quality_salvage", label: "Blocked value" },
  { key: "upside", label: "Upside" },
  { key: "risk_adjustment", label: "Risk adj." },
];

const toneClass: Record<FinancialPriorityCategory, string> = {
  upside: "bg-emerald-100 text-emerald-700",
  downside: "bg-red-100 text-red-700",
  quick_win: "bg-indigo-100 text-indigo-700",
  quality_salvage: "bg-amber-100 text-amber-700",
  risk_adjustment: "bg-sky-100 text-sky-700",
};

const toneLabel: Record<FinancialPriorityCategory, string> = {
  upside: "Upside",
  downside: "Downside",
  quick_win: "Quick win",
  quality_salvage: "Quality salvage",
  risk_adjustment: "Risk adjustment",
};

function deriveEffort(item: FinancialPriorityItem): "Low" | "Medium" | "High" {
  if (item.category === "quick_win") return "Low";
  if (item.category === "quality_salvage") return "Medium";
  if (item.type === "domain") return "Medium";
  if (item.priorityScore >= 90) return "High";
  if (item.timeToImpactDays && item.timeToImpactDays <= 120) return "Low";
  return "Medium";
}

function formatTimeline(item: FinancialPriorityItem) {
  if (item.timeToImpactDays && item.timeToImpactDays > 0) return `${item.timeToImpactDays}d`;
  if (item.category === "quick_win") return "30-90d";
  if (item.category === "quality_salvage") return "90-180d";
  return "90d+";
}

function rankingRationale(item: FinancialPriorityItem) {
  const effort = deriveEffort(item).toLowerCase();
  const timeline = formatTimeline(item);

  if (item.category === "quality_salvage") {
    return `Ranks highly because recoverable value is meaningful, with ${effort} effort and a ${timeline} path once quality thresholds are met.`;
  }

  if (item.category === "quick_win") {
    return `Ranks highly because it combines near-term impact (${timeline}) with ${effort} operational lift and ${item.confidence.toLowerCase()} confidence.`;
  }

  if (item.category === "downside") {
    return `Ranks highly because it reduces financial risk exposure and warrants action despite ${effort} execution complexity.`;
  }

  return `Ranks based on balanced impact, ${item.confidence.toLowerCase()} confidence, and expected time to results (${timeline}).`;
}

function summarizePriority(item: FinancialPriorityItem) {
  if (item.category === "quality_salvage") return "Blocked by quality gate";
  if (item.category === "quick_win") return "";
  if (item.category === "downside") return "High downside exposure";
  if (item.category === "risk_adjustment") return "Coding capture opportunity";
  return "High-value upside lever";
}

interface TopFinancialPrioritiesPanelProps {
  title?: string;
  subtitle?: string;
  items: FinancialPriorityItem[];
  showFilters?: boolean;
  maxItems?: number;
}

export default function TopFinancialPrioritiesPanel({
  title = "Top Value Levers",
  subtitle = "The highest-impact opportunities and risks to act on now.",
  items,
  showFilters = true,
  maxItems = 5,
}: TopFinancialPrioritiesPanelProps) {
  const { flags } = useFeatureFlags();
  const [activeCategory, setActiveCategory] = useState<"all" | FinancialPriorityCategory>("all");
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const scoped = activeCategory === "all" ? items : items.filter((item) => item.category === activeCategory);
    return scoped.slice(0, maxItems);
  }, [activeCategory, items, maxItems]);

  if (!flags.sections.topValueLevers) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              aria-label="How priorities are ranked"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              i
            </button>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {isInfoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setIsInfoOpen(false)}
          role="button"
          tabIndex={-1}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="How top financial priorities are ranked"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">How this ranking works</p>
                <h4 className="mt-1 text-lg font-semibold text-slate-900">Top Financial Priorities</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              This list highlights the financial opportunities and risks that deserve the most immediate attention.
              Items are ranked using a blend of expected financial impact, performance risk, quality recovery
              potential, confidence in the signal, and speed to expected results.
            </p>

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What we consider</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Financial upside or downside magnitude</li>
                <li>Whether performance is off track or at risk</li>
                <li>Savings blocked by quality thresholds</li>
                <li>Confidence in the underlying opportunity</li>
                <li>Time to expected impact</li>
              </ul>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-700">
              In short, we prioritize the levers that are most material, most actionable, and most time-sensitive.
            </p>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {categoryOptions.map((option) => {
            const active = option.key === activeCategory;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setActiveCategory(option.key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">No priorities available for this filter.</p>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {filteredItems.map((item, index) => (
            <article key={item.id} className="bg-white px-3 py-3 transition-colors hover:bg-slate-50/80 sm:px-4">
              {(() => {
                const prioritySummary = summarizePriority(item);
                return (
                  <>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
                      {index + 1}
                    </span>
                    <Link
                      href={item.ctaHref}
                      className="truncate text-sm font-bold text-slate-900 hover:text-indigo-700 hover:underline"
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      title={rankingRationale(item)}
                      aria-label={`Why ${item.label} is ranked here`}
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      i
                    </button>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    {prioritySummary && <span className="font-medium text-slate-700">{prioritySummary}</span>}
                    {prioritySummary && item.supportingDetail && <span className="text-slate-300">·</span>}
                    {item.supportingDetail && (
                      <>
                        <span>{item.supportingDetail}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-base font-black tabular-nums text-slate-900">{item.displayValue}</p>
                  <p className="text-[11px] font-semibold text-slate-500">impact</p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${toneClass[item.category]}`}>
                  {toneLabel[item.category]}
                </span>
                <span className="font-semibold text-slate-500">{formatTimeline(item)} path</span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-slate-500">{item.confidence} confidence</span>
              </div>
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
