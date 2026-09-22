export type WorkflowStatus =
  | "Not Started"
  | "Outreach Attempted"
  | "Enrolled in CM"
  | "Declined"
  | "Completed";

export interface CohortMember {
  id:               string;
  cohortId:         string;
  memberId:         string;   // mock member number e.g. "M-10482"
  name:             string;
  age:              number;
  primaryCondition: string;
  riskScore:        number;   // HCC-style 0.0–5.0
  lastContactDate:  string;   // ISO date string "YYYY-MM-DD"
  assignedCM:       string;   // care manager name
}

/** Persisted per-member workflow state (stored in localStorage) */
export interface MemberWorkflowRecord {
  status:      WorkflowStatus;
  notes:       string;
  lastUpdated: string;        // ISO date string
}

/** localStorage key for a cohort's workflow state */
export function workflowStorageKey(cohortId: string): string {
  return `cm-workflow-${cohortId}`;
}

export const WORKFLOW_STAGES: WorkflowStatus[] = [
  "Not Started",
  "Outreach Attempted",
  "Enrolled in CM",
  "Completed",
  "Declined",
];

export const workflowColors: Record<WorkflowStatus, { bg: string; text: string; ring: string }> = {
  "Not Started":       { bg: "bg-slate-100",   text: "text-slate-600",   ring: "ring-slate-200"   },
  "Outreach Attempted":{ bg: "bg-sky-100",     text: "text-sky-700",    ring: "ring-sky-200"     },
  "Enrolled in CM":    { bg: "bg-indigo-100",  text: "text-indigo-700", ring: "ring-indigo-200"  },
  "Completed":         { bg: "bg-emerald-100", text: "text-emerald-700",ring: "ring-emerald-200" },
  "Declined":          { bg: "bg-red-100",     text: "text-red-700",    ring: "ring-red-200"     },
};
