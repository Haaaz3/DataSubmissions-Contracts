interface PopulationMetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  /** Visual accent: none | warning | danger | positive */
  accent?: "default" | "warning" | "danger" | "positive";
}

const accentStyles = {
  default:  "border-slate-200 bg-white",
  warning:  "border-amber-300 bg-amber-50",
  danger:   "border-red-300 bg-red-50",
  positive: "border-emerald-300 bg-emerald-50",
};

const valueStyles = {
  default:  "text-slate-900",
  warning:  "text-amber-700",
  danger:   "text-red-700",
  positive: "text-emerald-700",
};

export default function PopulationMetricCard({
  label,
  value,
  subtext,
  accent = "default",
}: PopulationMetricCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${accentStyles[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${valueStyles[accent]}`}>{value}</p>
      {subtext && <p className="mt-0.5 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}
