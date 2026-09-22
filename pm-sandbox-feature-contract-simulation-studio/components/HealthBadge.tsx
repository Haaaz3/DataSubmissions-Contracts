interface HealthBadgeProps {
  status: "On Track" | "At Risk" | "Off Track";
}

export default function HealthBadge({ status }: HealthBadgeProps) {
  const styles = {
    "On Track": "bg-emerald-100 text-emerald-700",
    "At Risk": "bg-amber-100 text-amber-700",
    "Off Track": "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}