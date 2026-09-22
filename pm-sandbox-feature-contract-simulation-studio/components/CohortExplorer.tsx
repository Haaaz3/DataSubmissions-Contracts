"use client";

import { useState, useMemo } from "react";
import { Cohort, CohortCategory, CohortContractType } from "@/types/cohort";
import { InsightPriority } from "@/types/population";
import CohortCard from "./CohortCard";

type SortBy = "priority" | "memberCount";

interface CohortExplorerProps {
  cohorts:    Cohort[];
  categories: CohortCategory[];
}

const priorityOrder: Record<InsightPriority, number> = { High: 0, Medium: 1, Low: 2 };
const statusOrder = { "Action Needed": 0, Watch: 1, Improving: 2 } as const;

const contractTypes: CohortContractType[] = [
  "MSSP",
  "Medicare Advantage",
  "Commercial",
  "Portfolio-Wide",
];

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function CohortExplorer({ cohorts, categories }: CohortExplorerProps) {
  const [filterPriority,     setFilterPriority]     = useState<InsightPriority | "All">("All");
  const [filterCategory,     setFilterCategory]     = useState<CohortCategory  | "All">("All");
  const [filterContractType, setFilterContractType] = useState<CohortContractType | "All">("All");
  const [sortBy,             setSortBy]             = useState<SortBy>("priority");

  const filtered = useMemo(() => {
    let result = cohorts;

    if (filterPriority !== "All")
      result = result.filter((c) => c.priority === filterPriority);
    if (filterCategory !== "All")
      result = result.filter((c) => c.category === filterCategory);
    if (filterContractType !== "All")
      result = result.filter((c) => c.contractType === filterContractType);

    return [...result].sort((a, b) => {
      if (sortBy === "memberCount") return b.memberCount - a.memberCount;
      const p = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (p !== 0) return p;
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [cohorts, filterPriority, filterCategory, filterContractType, sortBy]);

  return (
    <div>
      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 mb-6">
        {/* Row 1: Priority + Sort */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Priority</p>
            <div className="flex flex-wrap gap-1.5">
              {(["All", "High", "Medium", "Low"] as const).map((p) => (
                <PillButton key={p} active={filterPriority === p} onClick={() => setFilterPriority(p)}>
                  {p}
                </PillButton>
              ))}
            </div>
          </div>
          <div className="ml-auto">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Sort by</p>
            <div className="flex gap-1.5">
              <PillButton active={sortBy === "priority"}    onClick={() => setSortBy("priority")}>Priority</PillButton>
              <PillButton active={sortBy === "memberCount"} onClick={() => setSortBy("memberCount")}>Member Count</PillButton>
            </div>
          </div>
        </div>

        {/* Row 2: Category */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Category</p>
          <div className="flex flex-wrap gap-1.5">
            <PillButton active={filterCategory === "All"} onClick={() => setFilterCategory("All")}>All</PillButton>
            {categories.map((cat) => (
              <PillButton key={cat} active={filterCategory === cat} onClick={() => setFilterCategory(cat)}>
                {cat}
              </PillButton>
            ))}
          </div>
        </div>

        {/* Row 3: Contract Type */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Contract Type</p>
          <div className="flex flex-wrap gap-1.5">
            <PillButton active={filterContractType === "All"} onClick={() => setFilterContractType("All")}>All</PillButton>
            {contractTypes.map((ct) => (
              <PillButton key={ct} active={filterContractType === ct} onClick={() => setFilterContractType(ct)}>
                {ct}
              </PillButton>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results count ──────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of {cohorts.length} cohorts
        </p>
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400">Try clearing a filter to see more results.</p>
        )}
      </div>

      {/* ── Cohort grid ────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((cohort) => (
            <CohortCard key={cohort.id} cohort={cohort} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm text-slate-400">No cohorts match the current filters.</p>
        </div>
      )}
    </div>
  );
}
