import { InsightPriority } from "@/types/population";

const styles: Record<InsightPriority, string> = {
  High:   "bg-red-100 text-red-700 ring-1 ring-red-200",
  Medium: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  Low:    "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

interface PriorityBadgeProps {
  priority: InsightPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[priority]}`}>
      {priority} Priority
    </span>
  );
}
