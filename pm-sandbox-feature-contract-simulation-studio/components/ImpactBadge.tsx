import { ImpactType } from "@/types/population";

const colors: Record<ImpactType, string> = {
  "Cost":             "bg-indigo-50 text-indigo-700",
  "Quality":          "bg-emerald-50 text-emerald-700",
  "Utilization":      "bg-sky-50 text-sky-700",
  "Patient Outcomes": "bg-violet-50 text-violet-700",
};

interface ImpactBadgeProps {
  type: ImpactType;
}

export default function ImpactBadge({ type }: ImpactBadgeProps) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[type] ?? "bg-slate-100 text-slate-600"}`}>
      {type}
    </span>
  );
}
