import Link from "next/link";
import { Cohort } from "@/types/cohort";
import PriorityBadge from "./PriorityBadge";
import CohortStatusBadge from "./CohortStatusBadge";
import TrendPill from "./TrendPill";
import ImpactBadge from "./ImpactBadge";
import CohortMetricBar from "./CohortMetricBar";

interface CohortCardProps {
  cohort: Cohort;
}

export default function CohortCard({ cohort }: CohortCardProps) {
  return (
    <Link
      href={`/cohorts/${cohort.id}`}
      className="group block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:ring-2 hover:ring-indigo-300 hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={cohort.priority} />
            <CohortStatusBadge status={cohort.status} />
            <TrendPill direction={cohort.trendDirection} percent={cohort.trendPercent} />
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {cohort.category}
          </span>
        </div>

        <p className="text-[10px] text-slate-400 mb-1">
          {cohort.contractName ?? "Portfolio-Wide"}
          <span className="mx-1.5 text-slate-200">·</span>
          {cohort.contractType}
        </p>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 leading-snug">
          {cohort.name}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 italic">{cohort.visualTagline}</p>
      </div>

      {/* Member stats + impact areas */}
      <div className="px-5 pb-3">
        <div className="flex flex-wrap items-center gap-3 mb-2.5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900">{cohort.memberCount.toLocaleString()}</span>
            <span className="text-xs text-slate-400">members</span>
          </div>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-500">{cohort.percentOfPopulation}% of population</span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">{cohort.membersPreviewCount} flagged this week</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {cohort.impactAreas.map((area) => (
            <ImpactBadge key={area} type={area} />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pb-3">
        <p className="text-xs leading-relaxed text-slate-600 line-clamp-2">{cohort.description}</p>
      </div>

      {/* Metrics */}
      <div className="px-5 pb-4 space-y-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Key Metrics</p>
        <CohortMetricBar
          label="ED Visits / 1,000"
          value={cohort.keyMetrics.edVisitsPer1000}
          max={700}
          accent={cohort.keyMetrics.edVisitsPer1000 > 350 ? "danger" : cohort.keyMetrics.edVisitsPer1000 > 280 ? "warning" : "default"}
        />
        <CohortMetricBar
          label="Readmission Rate"
          value={cohort.keyMetrics.readmissionsRate}
          max={30}
          unit="%"
          accent={cohort.keyMetrics.readmissionsRate > 14 ? "danger" : cohort.keyMetrics.readmissionsRate > 10 ? "warning" : "default"}
        />
        <CohortMetricBar
          label="Quality Gap"
          value={cohort.keyMetrics.qualityGapPercent}
          max={100}
          unit="%"
          accent={cohort.keyMetrics.qualityGapPercent > 40 ? "danger" : cohort.keyMetrics.qualityGapPercent > 25 ? "warning" : "default"}
        />
      </div>

      {/* Opportunity footer */}
      <div className="border-t border-slate-100 bg-indigo-50 px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 mb-0.5">Opportunity</p>
        <p className="text-xs text-indigo-800 leading-snug">{cohort.opportunitySummary}</p>
      </div>
    </Link>
  );
}
