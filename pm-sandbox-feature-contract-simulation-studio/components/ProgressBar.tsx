interface ProgressBarProps {
  value: number;
  tone?: "default" | "warning" | "success" | "danger";
}

export default function ProgressBar({ value, tone = "default" }: ProgressBarProps) {
  const styles = {
    default: "bg-indigo-500",
    warning: "bg-amber-500",
    success: "bg-emerald-500",
    danger: "bg-red-500",
  };

  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${styles[tone]}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}