import { PopulationInsight } from "@/types/population";
import PriorityBadge from "./PriorityBadge";

const impactColors: Record<string, string> = {
  "Cost":             "bg-indigo-50 text-indigo-700",
  "Quality":          "bg-emerald-50 text-emerald-700",
  "Utilization":      "bg-sky-50 text-sky-700",
  "Patient Outcomes": "bg-violet-50 text-violet-700",
};

interface InsightCardProps {
  insight: PopulationInsight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <PriorityBadge priority={insight.priority} />
        <div className="flex flex-wrap gap-1.5">
          {insight.impactTypes.map((type) => (
            <span
              key={type}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${impactColors[type] ?? "bg-slate-100 text-slate-600"}`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-900 leading-snug">{insight.title}</h3>

      {/* Description */}
      <p className="text-sm leading-relaxed text-slate-600">{insight.description}</p>

      {/* Why it matters */}
      <div className="rounded-lg bg-amber-50 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-0.5">Why it matters</p>
        <p className="text-xs leading-relaxed text-amber-800">{insight.whyItMatters}</p>
      </div>

      {/* Recommended action */}
      <div className="rounded-lg bg-indigo-50 px-3 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-0.5">Recommended Action</p>
        <p className="text-xs leading-relaxed text-indigo-800">{insight.recommendedAction}</p>
      </div>
    </div>
  );
}
