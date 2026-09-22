interface SynapseBadgeProps {
  label: string;
  tone?: "default" | "warning" | "success" | "info";
}

export default function SynapseBadge({ label, tone = "default" }: SynapseBadgeProps) {
  const styles = {
    default: "bg-slate-100 text-slate-600",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-emerald-100 text-emerald-700",
    info: "bg-sky-100 text-sky-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${styles[tone]}`}>
      {label}
    </span>
  );
}