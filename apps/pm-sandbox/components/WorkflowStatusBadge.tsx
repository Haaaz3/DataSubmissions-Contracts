import { WorkflowStatus, workflowColors } from "@/types/workflow";

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  size?: "sm" | "md";
}

export default function WorkflowStatusBadge({ status, size = "sm" }: WorkflowStatusBadgeProps) {
  const { bg, text, ring } = workflowColors[status];
  const padding = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]";
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ring-1 ${bg} ${text} ${ring} ${padding}`}>
      {status}
    </span>
  );
}
