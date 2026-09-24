type Accent = "danger" | "warning" | "default";

interface CohortMetricBarProps {
  label:   string;
  value:   number;
  max:     number;
  unit?:   string;
  accent?: Accent;
}

const barColors: Record<Accent, string> = {
  danger:  "bg-red-400",
  warning: "bg-amber-400",
  default: "bg-indigo-400",
};

const valueColors: Record<Accent, string> = {
  danger:  "text-red-700",
  warning: "text-amber-700",
  default: "text-slate-700",
};

export default function CohortMetricBar({
  label,
  value,
  max,
  unit   = "",
  accent = "default",
}: CohortMetricBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={`font-semibold ${valueColors[accent]}`}>
          {value.toLocaleString()}{unit}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className={`h-1.5 rounded-full transition-all ${barColors[accent]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
