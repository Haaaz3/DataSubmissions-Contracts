import { CohortStatus } from "@/types/cohort";

const styles: Record<CohortStatus, string> = {
  "Action Needed": "bg-red-100 text-red-700 ring-1 ring-red-200",
  "Watch":         "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  "Improving":     "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
};

interface CohortStatusBadgeProps {
  status: CohortStatus;
}

export default function CohortStatusBadge({ status }: CohortStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
