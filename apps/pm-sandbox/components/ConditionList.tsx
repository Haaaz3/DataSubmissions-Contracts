import { ChronicCondition } from "@/types/population";

interface ConditionListProps {
  conditions: ChronicCondition[];
  /** The prevalence value that maps to 100% bar width. Defaults to the highest value in the list. */
  maxPrevalence?: number;
}

// Color the bar based on prevalence tier
function barColor(pct: number): string {
  if (pct >= 50) return "bg-red-400";
  if (pct >= 30) return "bg-amber-400";
  if (pct >= 15) return "bg-indigo-400";
  return "bg-emerald-400";
}

export default function ConditionList({ conditions, maxPrevalence }: ConditionListProps) {
  const max = maxPrevalence ?? Math.max(...conditions.map((c) => c.prevalencePercent));

  return (
    <ul className="space-y-2.5">
      {conditions.map((c) => {
        const barWidth = Math.round((c.prevalencePercent / max) * 100);
        return (
          <li key={c.condition}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{c.condition}</span>
              <span className="font-semibold text-slate-900">{c.prevalencePercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full transition-all ${barColor(c.prevalencePercent)}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
