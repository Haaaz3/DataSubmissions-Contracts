import { ContractStatus } from "@/types/contract";

const statusStyles: Record<ContractStatus, string> = {
  "On Track": "bg-emerald-100 text-emerald-800",
  "At Risk":  "bg-amber-100 text-amber-800",
  "Off Track": "bg-red-100 text-red-800",
};

interface StatusBadgeProps {
  status: ContractStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
