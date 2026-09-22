interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: "default" | "warning" | "danger";
  compact?: boolean;
}

const highlightStyles = {
  default: "border-slate-200",
  warning: "border-amber-400",
  danger:  "border-red-400",
};

export default function KpiCard({
  label,
  value,
  subtext,
  highlight = "default",
  compact = false,
}: KpiCardProps) {
  return (
    <div className={`rounded-lg border-l-4 bg-white shadow-sm ${highlightStyles[highlight]} ${compact ? "p-3" : "p-5"}`}>
      <p className={`font-medium uppercase text-slate-500 ${compact ? "text-[10px] tracking-[0.06em]" : "text-xs tracking-wide"}`}>
        {label}
      </p>
      <p className={`font-bold text-slate-900 ${compact ? "mt-0.5 text-lg" : "mt-1 text-2xl"}`}>{value}</p>
      {subtext && <p className={`${compact ? "mt-0.5 text-[11px]" : "mt-1 text-xs"} text-slate-500`}>{subtext}</p>}
    </div>
  );
}
