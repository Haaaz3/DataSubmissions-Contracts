"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { mockCohorts } from "@/lib/cohortData";
import { mockContracts } from "@/lib/mockData";
import { getAggregatePopulation } from "@/lib/populationData";
import { daysSinceContact, formatMemberName, getMembersForCohort, inferMemberSex } from "@/lib/memberData";
import {
  WorkflowStatus,
  MemberWorkflowRecord,
  workflowStorageKey,
  workflowColors,
} from "@/types/workflow";
import PriorityBadge from "@/components/PriorityBadge";
import WorkflowStatusBadge from "@/components/WorkflowStatusBadge";
import FeatureGuard from "@/components/FeatureGuard";
import Tabs from "@/components/Tabs";

type CohortPipelineRow = {
  cohortId:    string;
  cohortName:  string;
  contractName: string;
  priority:    string;
  status:      string;
  totalMembers: number;
  counts:      Record<WorkflowStatus, number>;
};

type CarePlan = {
  id: string;
  cohortId: string;
  title: string;
  diseaseCategory: string;
  focus: string;
  owner: string;
  dueInDays: number;
  progress: number;
  membersInPlan: number;
  goals: string[];
  interventions: string[];
};

type AssignmentType = "human" | "agent";

type MemberAssignmentRecord = {
  type: AssignmentType;
  assignee: string;
  updatedAt: string;
};

type AssignmentGroupKey = "human" | "agent";

type RankedAssignedMember = {
  cohortId: string;
  memberId: string;
  assignmentType: AssignmentType;
  memberName: string;
  riskScore: number;
  primaryCondition: string;
  payerCategory: "Medicare" | "Commercial" | "MSSP" | "Other";
};

type OnboardingConsentStatus = "pending" | "accepted" | "declined";

type MemberOnboardingRecord = {
  consentStatus: OnboardingConsentStatus;
  consentDate: string;
  assessmentCompleted: boolean;
  assessmentSummary: string;
  assignedCarePlanId: string;
  planConfigured: boolean;
  trackingActive: boolean;
  lastUpdated: string;
};

const ACTIVE_STAGES: WorkflowStatus[]   = ["Outreach Attempted", "Enrolled in CM"];
const TERMINAL_STAGES: WorkflowStatus[] = ["Completed", "Declined"];
const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const ASK_GENERATED_COHORTS_KEY = "cm-ask-generated-cohorts";
const DELETED_COHORT_IDS_KEY = "cm-deleted-cohort-ids";
const ASSIGNMENTS_STORAGE_KEY = "cm-member-assignments-v1";
const CARE_PLANS_STORAGE_KEY = "cm-care-plans-v1";
const ONBOARDING_STORAGE_KEY = "cm-onboarding-v1";
const HUMAN_ASSIGNMENT_REBALANCED_KEY = "cm-human-assignment-rebalanced-v1";
const RISING_RISK_COHORT_ID = "cohort-008";
const CARE_MANAGEMENT_AGENT_OPTIONS = ["CM Agent"] as const;
const HUMAN_CARE_MANAGER_OPTIONS = [
  "Rosa Chen",
  "Diane Wells",
  "Marcus Webb",
  "Lynn Patel",
  "Tanya Morris",
  "James Okafor",
  "Claire Davis",
  "Sam Torres",
  "Angela Price",
  "Tom Nguyen",
  "Omar Hassan",
  "Priya Shah",
  "Wendy Park",
  "Ben Osei",
  "Alex Rivera",
  "Jordan Kim",
  "Maya Thompson",
  "Noah Bennett",
] as const;
const CARE_TO_COHORTS_ID_MAP: Record<string, string> = {
  "cohort-001": "cohort-diabetes-control",
  "cohort-002": "cohort-ed-utilizers",
  "cohort-003": "cohort-ed-utilizers",
  "cohort-004": "cohort-readmission-risk",
  "cohort-005": "cohort-screening-gaps",
  "cohort-006": "cohort-ed-utilizers",
  "cohort-007": "cohort-diabetes-control",
  "cohort-008": "cohort-rising-risk-cm",
  "cohort-009": "cohort-readmission-risk",
};

const DISEASE_CATEGORY_ORDER = [
  "Diabetes",
  "Heart Failure / CHF",
  "Pulmonary / COPD",
  "Kidney / CKD",
  "Preventive Care",
  "Transitions of Care",
  "Complex / Rising Risk",
  "General Care Management",
] as const;

function isAssignedAssigneeName(assignee: string) {
  const normalized = assignee.trim().toLowerCase();
  return normalized !== "" && normalized !== "unassigned" && normalized !== "none" && normalized !== "n/a";
}

function deriveDiseaseCategory(cohortName: string, focus: string) {
  const text = `${cohortName} ${focus}`.toLowerCase();
  if (text.includes("diabetes") || text.includes("a1c")) return "Diabetes";
  if (text.includes("chf") || text.includes("heart failure") || text.includes("cardiac")) return "Heart Failure / CHF";
  if (text.includes("copd") || text.includes("pulmonary") || text.includes("asthma")) return "Pulmonary / COPD";
  if (text.includes("ckd") || text.includes("kidney") || text.includes("renal")) return "Kidney / CKD";
  if (text.includes("screen") || text.includes("preventive") || text.includes("wellness")) return "Preventive Care";
  if (text.includes("readmission") || text.includes("transition") || text.includes("post-discharge") || text.includes("toc")) {
    return "Transitions of Care";
  }
  if (text.includes("rising risk") || text.includes("high risk") || text.includes("complex")) return "Complex / Rising Risk";
  return "General Care Management";
}

function deriveDiseaseCategoryFromCondition(primaryCondition: string) {
  const text = primaryCondition.toLowerCase();
  if (text.includes("diabetes") || text.includes("a1c") || text.includes("glycemic")) return "Diabetes";
  if (text.includes("chf") || text.includes("heart failure") || text.includes("cardiac")) return "Heart Failure / CHF";
  if (text.includes("copd") || text.includes("pulmonary") || text.includes("asthma")) return "Pulmonary / COPD";
  if (text.includes("ckd") || text.includes("kidney") || text.includes("renal")) return "Kidney / CKD";
  if (text.includes("screen") || text.includes("preventive") || text.includes("wellness")) return "Preventive Care";
  if (text.includes("readmission") || text.includes("transition") || text.includes("post-discharge") || text.includes("discharge")) {
    return "Transitions of Care";
  }
  if (text.includes("rising risk") || text.includes("high risk") || text.includes("complex")) return "Complex / Rising Risk";
  return "General Care Management";
}

function defaultGoalsForPlan(category: string, priority: string, cohortName: string) {
  const urgencyGoal =
    priority === "High"
      ? "Follow your care plan every day and contact your care team within 24 hours if symptoms worsen"
      : priority === "Medium"
      ? "Complete your first care-plan check-in and follow recommended steps this week"
      : "Follow your preventive and self-management plan consistently this month";

  const clinicalGoal =
    category === "Diabetes"
      ? "Check blood sugar as directed and keep glucose closer to your target range"
      : category === "Heart Failure / CHF"
      ? "Reduce fluid and heart-failure flare-ups by following your daily symptom and weight plan"
      : category === "Pulmonary / COPD"
      ? "Reduce breathing flare-ups by using inhalers correctly and following your breathing action plan"
      : category === "Kidney / CKD"
      ? "Protect kidney health by taking medications as directed and completing kidney follow-up visits"
      : category === "Preventive Care"
      ? "Complete your overdue preventive screenings and wellness visits"
      : category === "Transitions of Care"
      ? "Recover safely after discharge by following your discharge instructions and follow-up plan"
      : "Improve your day-to-day health stability by following your personalized care plan";

  return [urgencyGoal, clinicalGoal, `Track your progress weekly for the ${cohortName} plan`];
}

function defaultInterventionsForPlan(
  cohortId: string,
  category: string,
  focus: string
) {
  const fromCohort = mockCohorts.find((c) => c.id === cohortId)?.interventionIdeas ?? [];
  if (fromCohort.length > 0) return fromCohort.slice(0, 3);

  const categoryIntervention =
    category === "Diabetes"
      ? "Take diabetes medications as prescribed, check blood sugar daily, and bring your log to visits"
      : category === "Heart Failure / CHF"
      ? "Weigh yourself daily, limit sodium as instructed, and call your care team for rapid weight gain"
      : category === "Pulmonary / COPD"
      ? "Use maintenance/rescue inhalers correctly, avoid known triggers, and follow your COPD action plan"
      : category === "Kidney / CKD"
      ? "Take kidney-protective medications, stay hydrated as instructed, and complete lab/nephrology appointments"
      : category === "Preventive Care"
      ? "Schedule and complete overdue screenings, vaccines, and your annual wellness visit"
      : category === "Transitions of Care"
      ? "Review your discharge instructions, take medications exactly as prescribed, and attend follow-up within 7 days"
      : "Follow your personalized daily action steps and report any new barriers to your care manager";

  return [
    `Follow this focus in your daily routine: ${focus}`,
    categoryIntervention,
    "Track your symptoms and progress, and discuss concerns during each check-in",
  ];
}

function sortByPriority(rows: CohortPipelineRow[]) {
  return [...rows].sort((a, b) => {
    const priorityDiff = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
    if (priorityDiff !== 0) return priorityDiff;
    return a.cohortName.localeCompare(b.cohortName);
  });
}

function buildAskGeneratedRow(prompt: string): CohortPipelineRow {
  const normalized = prompt.trim();
  const lower = normalized.toLowerCase();
  const priority =
    lower.includes("urgent") || lower.includes("high risk") || lower.includes("readmission")
      ? "High"
      : lower.includes("preventive") || lower.includes("screening")
      ? "Low"
      : "Medium";
  const status = priority === "High" ? "Action Needed" : priority === "Medium" ? "Watch" : "Improving";
  const totalMembers = priority === "High" ? 48 : priority === "Medium" ? 36 : 24;
  const outreach = Math.round(totalMembers * 0.28);
  const enrolled = Math.round(totalMembers * 0.18);
  const completed = Math.max(1, Math.round(totalMembers * 0.08));
  const declined = Math.max(0, Math.round(totalMembers * 0.04));
  const notStarted = Math.max(0, totalMembers - outreach - enrolled - completed - declined);

  return {
    cohortId: `ask-${Date.now()}`,
    cohortName: normalized.slice(0, 70),
    contractName: "Portfolio-Wide",
    priority,
    status,
    totalMembers,
    counts: {
      "Not Started": notStarted,
      "Outreach Attempted": outreach,
      "Enrolled in CM": enrolled,
      "Completed": completed,
      "Declined": declined,
    },
  };
}

function buildRow(cohortId: string, saved: Record<string, MemberWorkflowRecord>): CohortPipelineRow {
  const cohort  = mockCohorts.find((c) => c.id === cohortId)!;
  const members = getMembersForCohort(cohortId);
  const counts = {
    "Not Started":        0,
    "Outreach Attempted": 0,
    "Enrolled in CM":     0,
    "Completed":          0,
    "Declined":           0,
  } as Record<WorkflowStatus, number>;
  members.forEach((m) => {
    const s: WorkflowStatus = saved[m.id]?.status ?? "Not Started";
    counts[s]++;
  });
  return {
    cohortId,
    cohortName:   cohort.name,
    contractName: cohort.contractName ?? "Portfolio-Wide",
    priority:     cohort.priority,
    status:       cohort.status,
    totalMembers: members.length,
    counts,
  };
}

function applyRisingRiskEnrollmentDefaults(
  cohortId: string,
  saved: Record<string, MemberWorkflowRecord>
): Record<string, MemberWorkflowRecord> {
  if (cohortId !== RISING_RISK_COHORT_ID) return saved;
  const members = getMembersForCohort(cohortId);
  const now = new Date().toISOString().slice(0, 10);
  const next = { ...saved };
  for (const member of members) {
    next[member.id] = {
      status: "Enrolled in CM",
      notes: next[member.id]?.notes ?? "",
      lastUpdated: next[member.id]?.lastUpdated ?? now,
    };
  }
  return next;
}

function applyRisingRiskCaseStatusDefaults(
  onboarding: Record<string, MemberOnboardingRecord>
): Record<string, MemberOnboardingRecord> {
  const members = getMembersForCohort(RISING_RISK_COHORT_ID);
  const today = new Date().toISOString().slice(0, 10);
  const next = { ...onboarding };

  for (const member of members) {
    const existing = next[member.id];
    next[member.id] = {
      consentStatus: existing?.consentStatus ?? "pending",
      consentDate: existing?.consentDate ?? "",
      assessmentCompleted: existing?.assessmentCompleted ?? false,
      assessmentSummary: existing?.assessmentSummary ?? "",
      assignedCarePlanId: existing?.assignedCarePlanId ?? "",
      planConfigured: existing?.planConfigured ?? false,
      trackingActive: true,
      lastUpdated: existing?.lastUpdated ?? today,
    };
  }

  return next;
}

export default function CareManagementPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading care management...</div>}>
      <CareManagementPageContent />
    </Suspense>
  );
}

function CareManagementPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [rows,      setRows]      = useState<CohortPipelineRow[]>([]);
  const [hydrated,  setHydrated]  = useState(false);
  const [processedPrompt, setProcessedPrompt] = useState<string | null>(null);
  const [savedWorkflowByCohort, setSavedWorkflowByCohort] = useState<Record<string, Record<string, MemberWorkflowRecord>>>({});
  const [expandedPatientLists, setExpandedPatientLists] = useState<Record<string, boolean>>({});
  const [assignmentsByMemberId, setAssignmentsByMemberId] = useState<Record<string, MemberAssignmentRecord>>({});
  const [bulkAssignmentSelectionByCohort, setBulkAssignmentSelectionByCohort] = useState<Record<string, string>>({});
  const [selectedPatientIdsByCohort, setSelectedPatientIdsByCohort] = useState<Record<string, string[]>>({});
  const [carePlanOverridesById, setCarePlanOverridesById] = useState<Record<string, Partial<CarePlan>>>({});
  const [expandedCarePlanEditors, setExpandedCarePlanEditors] = useState<Record<string, boolean>>({});
  const [isHumanCareManagersExpanded, setIsHumanCareManagersExpanded] = useState(false);
  const [expandedHumanManagerPatients, setExpandedHumanManagerPatients] = useState<Record<string, boolean>>({});
  const [isCareManagementAgentsExpanded, setIsCareManagementAgentsExpanded] = useState(false);
  const [expandedCareManagementAgentPatients, setExpandedCareManagementAgentPatients] = useState<Record<string, boolean>>({});
  const [onboardingByMemberId, setOnboardingByMemberId] = useState<Record<string, MemberOnboardingRecord>>({});
  const [isOnboardingDrawerOpen, setIsOnboardingDrawerOpen] = useState(false);
  const [onboardingDrawerMemberId, setOnboardingDrawerMemberId] = useState<string | null>(null);
  const [onboardingDrawerCohortId, setOnboardingDrawerCohortId] = useState<string | null>(null);

  useEffect(() => {
    let deletedIds: string[] = [];
    try {
      const rawDeleted = localStorage.getItem(DELETED_COHORT_IDS_KEY);
      if (rawDeleted) {
        const parsed = JSON.parse(rawDeleted) as string[];
        if (Array.isArray(parsed)) deletedIds = parsed;
      }
    } catch {
      deletedIds = [];
    }

    const built = mockCohorts.map((cohort) => {
      let saved: Record<string, MemberWorkflowRecord> = {};
      try {
        const raw = localStorage.getItem(workflowStorageKey(cohort.id));
        if (!raw) {
          saved = {};
        } else {
          saved = JSON.parse(raw) as Record<string, MemberWorkflowRecord>;
        }
      } catch {
        saved = {};
      }
      saved = applyRisingRiskEnrollmentDefaults(cohort.id, saved);
      try {
        localStorage.setItem(workflowStorageKey(cohort.id), JSON.stringify(saved));
      } catch {
        // ignore storage errors
      }
      return buildRow(cohort.id, saved);
    }).filter((row) => !deletedIds.includes(row.cohortId));

    const workflowMap: Record<string, Record<string, MemberWorkflowRecord>> = {};
    mockCohorts.forEach((cohort) => {
      try {
        const raw = localStorage.getItem(workflowStorageKey(cohort.id));
        const saved = raw
          ? (JSON.parse(raw) as Record<string, MemberWorkflowRecord>)
          : {};
        workflowMap[cohort.id] = applyRisingRiskEnrollmentDefaults(cohort.id, saved);
      } catch {
        workflowMap[cohort.id] = applyRisingRiskEnrollmentDefaults(cohort.id, {});
      }
    });

    let askGenerated: CohortPipelineRow[] = [];
    try {
      const raw = localStorage.getItem(ASK_GENERATED_COHORTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CohortPipelineRow[];
        if (Array.isArray(parsed)) askGenerated = parsed;
      }
    } catch {
      askGenerated = [];
    }

    askGenerated = askGenerated.filter((row) => !deletedIds.includes(row.cohortId));

    setRows(sortByPriority([...built, ...askGenerated]));
    setSavedWorkflowByCohort(workflowMap);

    try {
      const rawAssignments = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      const parsedAssignments = rawAssignments
        ? (JSON.parse(rawAssignments) as Record<string, MemberAssignmentRecord>)
        : {};

      const hasRebalanced = localStorage.getItem(HUMAN_ASSIGNMENT_REBALANCED_KEY) === "true";

      if (!hasRebalanced) {
        const allNonAskMembers = mockCohorts.flatMap((cohort) => getMembersForCohort(cohort.id));
        const nextAssignments = { ...parsedAssignments };

        const humanAssignedMemberIds = allNonAskMembers
          .filter((member) => {
            const persisted = parsedAssignments[member.id];
            const assignmentType = persisted?.type ?? "human";
            const assignee = persisted?.assignee ?? member.assignedCM;
            return assignmentType === "human" && isAssignedAssigneeName(assignee);
          })
          .map((member) => member.id)
          .sort((a, b) => a.localeCompare(b));

        const updatedAt = new Date().toISOString();
        humanAssignedMemberIds.forEach((memberId, index) => {
          const managerName = HUMAN_CARE_MANAGER_OPTIONS[index % HUMAN_CARE_MANAGER_OPTIONS.length];
          nextAssignments[memberId] = {
            type: "human",
            assignee: managerName,
            updatedAt,
          };
        });

        localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(nextAssignments));
        localStorage.setItem(HUMAN_ASSIGNMENT_REBALANCED_KEY, "true");
        setAssignmentsByMemberId(nextAssignments);
      } else {
        setAssignmentsByMemberId(parsedAssignments ?? {});
      }
    } catch {
      setAssignmentsByMemberId({});
    }

    try {
      const rawOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (rawOnboarding) {
        const parsed = JSON.parse(rawOnboarding) as Record<string, MemberOnboardingRecord>;
        const withDefaults = applyRisingRiskCaseStatusDefaults(parsed ?? {});
        setOnboardingByMemberId(withDefaults);
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(withDefaults));
      } else {
        const withDefaults = applyRisingRiskCaseStatusDefaults({});
        setOnboardingByMemberId(withDefaults);
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(withDefaults));
      }
    } catch {
      const withDefaults = applyRisingRiskCaseStatusDefaults({});
      setOnboardingByMemberId(withDefaults);
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(withDefaults));
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const raw = localStorage.getItem(CARE_PLANS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Record<string, Partial<CarePlan>>) : {};
      setCarePlanOverridesById(parsed ?? {});
    } catch {
      setCarePlanOverridesById({});
    }
  }, [hydrated]);

  const togglePatientList = (cohortId: string) => {
    setExpandedPatientLists((prev) => ({
      ...prev,
      [cohortId]: !prev[cohortId],
    }));
  };

  const getDefaultAssignment = (memberId: string, fallbackHumanAssignee: string): MemberAssignmentRecord => {
    const persisted = assignmentsByMemberId[memberId];
    if (persisted) return persisted;

    const normalizedFallback = fallbackHumanAssignee.trim().toLowerCase();
    const fallbackIsUnassigned =
      normalizedFallback === "" ||
      normalizedFallback === "unassigned" ||
      normalizedFallback === "none" ||
      normalizedFallback === "n/a";

    return {
      type: "human",
      assignee: fallbackIsUnassigned ? HUMAN_CARE_MANAGER_OPTIONS[0] : fallbackHumanAssignee,
      updatedAt: new Date().toISOString(),
    };
  };

  const updateMemberAssignment = (
    memberId: string,
    assignment: MemberAssignmentRecord
  ) => {
    setAssignmentsByMemberId((prev) => {
      const next = {
        ...prev,
        [memberId]: assignment,
      };
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const getOnboardingRecord = (memberId: string): MemberOnboardingRecord => {
    return (
      onboardingByMemberId[memberId] ?? {
        consentStatus: "pending",
        consentDate: "",
        assessmentCompleted: false,
        assessmentSummary: "",
        assignedCarePlanId: "",
        planConfigured: false,
        trackingActive: false,
        lastUpdated: "",
      }
    );
  };

  const updateOnboardingRecord = (
    memberId: string,
    patch: Partial<MemberOnboardingRecord>
  ) => {
    setOnboardingByMemberId((prev) => {
      const current = prev[memberId] ?? getOnboardingRecord(memberId);
      const next = {
        ...prev,
        [memberId]: {
          ...current,
          ...patch,
          lastUpdated: new Date().toISOString().slice(0, 10),
        },
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const ensureOnboardingStarted = (memberId: string, defaultPlanId?: string) => {
    const existing = onboardingByMemberId[memberId];
    if (existing) return;
    updateOnboardingRecord(memberId, {
      consentStatus: "pending",
      assignedCarePlanId: defaultPlanId ?? "",
      assessmentSummary: "",
      assessmentCompleted: false,
      planConfigured: false,
      trackingActive: false,
      consentDate: "",
    });
  };

  const onboardingStageLabel = (rec: MemberOnboardingRecord) => {
    if (rec.trackingActive) return "Active";
    if (rec.planConfigured) return "Plan Configured";
    if (rec.assignedCarePlanId) return "Plan Assigned";
    if (rec.assessmentCompleted) return "Assessment Done";
    if (rec.consentStatus === "accepted") return "Consent Accepted";
    if (rec.consentStatus === "declined") return "Consent Declined";
    return "Not Started";
  };

  const openOnboardingDrawer = (memberId: string, cohortId: string, defaultPlanId?: string) => {
    ensureOnboardingStarted(memberId, defaultPlanId);
    setOnboardingDrawerMemberId(memberId);
    setOnboardingDrawerCohortId(cohortId);
    setIsOnboardingDrawerOpen(true);
  };

  const applyBulkAssignment = (
    cohortId: string,
    memberIds: string[],
    targetValue: string
  ) => {
    if (!targetValue || memberIds.length === 0) return;
    const [type, ...assigneeParts] = targetValue.split(":");
    const assignee = assigneeParts.join(":");
    if (!assignee) return;

    setAssignmentsByMemberId((prev) => {
      const next = { ...prev };
      const updatedAt = new Date().toISOString();
      memberIds.forEach((memberId) => {
        next[memberId] = {
          type: type as AssignmentType,
          assignee,
          updatedAt,
        };
      });
      localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    setBulkAssignmentSelectionByCohort((prev) => ({
      ...prev,
      [cohortId]: targetValue,
    }));
  };

  const togglePatientSelection = (cohortId: string, memberId: string) => {
    setSelectedPatientIdsByCohort((prev) => {
      const current = prev[cohortId] ?? [];
      const nextForCohort = current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId];
      return {
        ...prev,
        [cohortId]: nextForCohort,
      };
    });
  };

  const toggleSelectAllPatients = (cohortId: string, memberIds: string[]) => {
    setSelectedPatientIdsByCohort((prev) => {
      const current = prev[cohortId] ?? [];
      const allSelected = memberIds.length > 0 && memberIds.every((id) => current.includes(id));
      return {
        ...prev,
        [cohortId]: allSelected ? [] : memberIds,
      };
    });
  };

  useEffect(() => {
    if (!hydrated) return;
    const promptFromGlobalAsk = searchParams.get("createCohortPrompt");
    if (!promptFromGlobalAsk || !promptFromGlobalAsk.trim()) return;
    if (processedPrompt === promptFromGlobalAsk) return;

    const created = buildAskGeneratedRow(promptFromGlobalAsk);
    setRows((prev) => {
      const nextRows = sortByPriority([...prev, created]);
      localStorage.setItem(
        ASK_GENERATED_COHORTS_KEY,
        JSON.stringify(nextRows.filter((r) => r.cohortId.startsWith("ask-")))
      );
      return nextRows;
    });
    setProcessedPrompt(promptFromGlobalAsk);
    router.replace(pathname);
  }, [hydrated, searchParams, processedPrompt, pathname, router]);

  const handleDeleteCohort = (cohortId: string, cohortName: string) => {
    const confirmed = window.confirm(`Delete cohort "${cohortName}"? This action cannot be undone.`);
    if (!confirmed) return;

    setRows((prev) => {
      const nextRows = prev.filter((row) => row.cohortId !== cohortId);
      const deletedIds = Array.from(
        new Set([
          ...(JSON.parse(localStorage.getItem(DELETED_COHORT_IDS_KEY) || "[]") as string[]),
          cohortId,
        ])
      );
      localStorage.setItem(DELETED_COHORT_IDS_KEY, JSON.stringify(deletedIds));

      const remainingAsk = nextRows.filter((r) => r.cohortId.startsWith("ask-"));
      localStorage.setItem(ASK_GENERATED_COHORTS_KEY, JSON.stringify(remainingAsk));
      return nextRows;
    });
  };

  const isAssignedAssignee = (assignee: string) => {
    return isAssignedAssigneeName(assignee);
  };

  // ── Aggregate stats ──────────────────────────────────────────────────────
  const assignedMembers: RankedAssignedMember[] = rows.flatMap((row) => {
    if (row.cohortId.startsWith("ask-")) return [];
    const members = getMembersForCohort(row.cohortId);
    const contractLower = row.contractName.toLowerCase();
    const payerCategory: RankedAssignedMember["payerCategory"] = contractLower.includes("medicare") || contractLower.includes("ma")
      ? "Medicare"
      : contractLower.includes("commercial")
      ? "Commercial"
      : contractLower.includes("mssp") || contractLower.includes("aco")
      ? "MSSP"
      : "Other";
    return members.filter((member) => {
      const assignment = getDefaultAssignment(member.id, member.assignedCM);
      return isAssignedAssignee(assignment.assignee);
    }).map((member) => ({
      cohortId: row.cohortId,
      memberId: member.id,
      assignmentType: getDefaultAssignment(member.id, member.assignedCM).type,
      memberName: formatMemberName(member.name),
      riskScore: member.riskScore,
      primaryCondition: member.primaryCondition,
      payerCategory,
    }));
  });

  const totalMembers = assignedMembers.length;
  const statusCountForAssigned = (status: WorkflowStatus) =>
    assignedMembers.reduce((sum, member) => {
      const workflow = savedWorkflowByCohort[member.cohortId] ?? {};
      const currentStatus = workflow[member.memberId]?.status ?? "Not Started";
      return sum + (currentStatus === status ? 1 : 0);
    }, 0);

  const enrolled   = statusCountForAssigned("Enrolled in CM");
  const outreach   = statusCountForAssigned("Outreach Attempted");
  const completed  = statusCountForAssigned("Completed");
  const notStarted = statusCountForAssigned("Not Started");
  const aggregatePopulation = getAggregatePopulation();
  const totalAttributedLives = mockContracts.reduce((sum, contract) => sum + contract.attributedLives, 0);
  const weightedPmpm = totalAttributedLives
    ? Math.round(
        mockContracts.reduce(
          (sum, contract) => sum + contract.currentPmpm * contract.attributedLives,
          0
        ) / totalAttributedLives
      )
    : 0;
  const edAdmitsPer1000 = aggregatePopulation.avgEdVisitsPer1000;
  const inpatientAdmissionsPer1000 = aggregatePopulation.avgAdmissionsPer1000;

  const assignmentGroups: Record<AssignmentGroupKey, { label: string; members: RankedAssignedMember[] }> = {
    human: {
      label: "Human Care Managers",
      members: assignedMembers.filter((member) => member.assignmentType === "human"),
    },
    agent: {
      label: "Care Management Agents",
      members: assignedMembers.filter((member) => member.assignmentType === "agent"),
    },
  };

  const getStatusCountForGroup = (members: RankedAssignedMember[], status: WorkflowStatus) =>
    members.reduce((sum, member) => {
      const workflow = savedWorkflowByCohort[member.cohortId] ?? {};
      const currentStatus = workflow[member.memberId]?.status ?? "Not Started";
      return sum + (currentStatus === status ? 1 : 0);
    }, 0);

  const assignmentGroupKpis = (Object.entries(assignmentGroups) as [AssignmentGroupKey, { label: string; members: RankedAssignedMember[] }][]).map(
    ([key, group]) => {
      const groupAssigned = group.members.length;
      const shareOfAssigned = totalMembers > 0 ? groupAssigned / totalMembers : 0;
      return {
        key,
        label: group.label,
        assigned: groupAssigned,
        enrolled: getStatusCountForGroup(group.members, "Enrolled in CM"),
        outreach: getStatusCountForGroup(group.members, "Outreach Attempted"),
        completed: getStatusCountForGroup(group.members, "Completed"),
        pmpm: Math.round(weightedPmpm * shareOfAssigned),
        edAdmitsPer1000: Math.round(edAdmitsPer1000 * shareOfAssigned),
        inpatientAdmissionsPer1000: Math.round(inpatientAdmissionsPer1000 * shareOfAssigned),
      };
    }
  );

  const humanCareManagerCaseloads = HUMAN_CARE_MANAGER_OPTIONS.map((managerName) => {
    const assignedPatients = assignedMembers
      .filter((member) => member.assignmentType === "human")
      .filter((member) => {
        const assignment = getDefaultAssignment(member.memberId, "");
        return assignment.assignee === managerName;
      })
      .map((member) => member.memberName)
      .sort((a, b) => a.localeCompare(b));

    return {
      managerName,
      assignedPatients,
      caseloadCount: assignedPatients.length,
    };
  });

  const careManagementAgentOptions = Array.from(
    new Set([
      ...CARE_MANAGEMENT_AGENT_OPTIONS,
      ...assignedMembers
        .filter((member) => member.assignmentType === "agent")
        .map((member) => getDefaultAssignment(member.memberId, "").assignee),
    ])
  );

  const careManagementAgentCaseloads = careManagementAgentOptions.map((agentName) => {
    const assignedPatients = assignedMembers
      .filter((member) => member.assignmentType === "agent")
      .filter((member) => {
        const assignment = getDefaultAssignment(member.memberId, "");
        return assignment.assignee === agentName;
      })
      .map((member) => member.memberName)
      .sort((a, b) => a.localeCompare(b));

    return {
      agentName,
      assignedPatients,
      caseloadCount: assignedPatients.length,
    };
  });

  const saveCarePlanOverrides = (next: Record<string, Partial<CarePlan>>) => {
    setCarePlanOverridesById(next);
    localStorage.setItem(CARE_PLANS_STORAGE_KEY, JSON.stringify(next));
  };

  const updateCarePlanField = (planId: string, field: keyof CarePlan, value: string | number | string[]) => {
    const next = {
      ...carePlanOverridesById,
      [planId]: {
        ...(carePlanOverridesById[planId] ?? {}),
        [field]: value,
      },
    };
    saveCarePlanOverrides(next);
  };

  const updateCarePlanListItem = (
    planId: string,
    field: "goals" | "interventions",
    index: number,
    value: string
  ) => {
    const current = (carePlanOverridesById[planId]?.[field] as string[] | undefined) ?? [];
    const nextItems = [...current];
    nextItems[index] = value;
    updateCarePlanField(planId, field, nextItems);
  };

  const addCarePlanListItem = (plan: CarePlan, field: "goals" | "interventions") => {
    const current = ((carePlanOverridesById[plan.id]?.[field] as string[] | undefined) ?? plan[field]) as string[];
    updateCarePlanField(plan.id, field, [...current, ""]);
  };

  const removeCarePlanListItem = (plan: CarePlan, field: "goals" | "interventions", index: number) => {
    const current = ((carePlanOverridesById[plan.id]?.[field] as string[] | undefined) ?? plan[field]) as string[];
    const nextItems = current.filter((_, i) => i !== index);
    updateCarePlanField(plan.id, field, nextItems);
  };

  const carePlans: CarePlan[] = rows.map((row) => {
    const engagedMembers = row.counts["Outreach Attempted"] + row.counts["Enrolled in CM"] + row.counts["Completed"];
    const progress = row.totalMembers ? Math.round((engagedMembers / row.totalMembers) * 100) : 0;
    const focus = row.priority === "High"
      ? "Complex care + rapid outreach"
      : row.priority === "Medium"
      ? "Medication adherence + PCP follow-up"
      : "Preventive care and engagement";
    const diseaseCategory = deriveDiseaseCategory(row.cohortName, focus);
    const defaults: CarePlan = {
      id: `cp-${row.cohortId}`,
      cohortId: row.cohortId,
      title: `${row.cohortName} Care Plan`,
      diseaseCategory,
      focus,
      owner: row.priority === "High" ? "RN Care Manager" : "Care Coordinator",
      dueInDays: row.priority === "High" ? 7 : row.priority === "Medium" ? 14 : 21,
      progress,
      membersInPlan: engagedMembers,
      goals: defaultGoalsForPlan(diseaseCategory, row.priority, row.cohortName),
      interventions: defaultInterventionsForPlan(row.cohortId, diseaseCategory, focus),
    };

    const override = carePlanOverridesById[defaults.id] ?? {};
    return {
      ...defaults,
      ...override,
      progress,
      membersInPlan: engagedMembers,
      goals: (override.goals as string[] | undefined) ?? defaults.goals,
      interventions: (override.interventions as string[] | undefined) ?? defaults.interventions,
    };
  });

  const groupedCarePlans = DISEASE_CATEGORY_ORDER.map((category) => ({
    category,
    plans: carePlans.filter((plan) => plan.diseaseCategory === category),
  })).filter((group) => group.plans.length > 0);

  if (!hydrated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm text-slate-400">Loading care management data…</span>
      </div>
    );
  }

  return (
    <FeatureGuard page="careManagement">
      <div className="space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Care Management Team</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Track intervention progress across all cohorts. Mark members through the pipeline from
          outreach to enrolled to completed — state is saved in your browser.
        </p>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-sm font-semibold text-indigo-900">Create cohorts from the global Ask bar</p>
        <p className="mt-1 text-xs text-indigo-700">
          Use the header Ask bar while on this page. Submitted prompts are converted into ask-generated cohorts automatically.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: "pipeline", label: "Pipeline" },
          { id: "onboarding", label: "Onboarding" },
          { id: "care-plans", label: "Care Plans" },
        ]}
        defaultTab="pipeline"
      >
        {(activeTab) => (
          <>
            {activeTab === "pipeline" && (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
                  {[
                    { label: "Total Assigned",  value: totalMembers, sub: "assigned across all cohorts",   accent: "text-slate-900"    },
                    { label: "Enrolled in CM",     value: enrolled,     sub: "active care management", accent: "text-indigo-700" },
                    { label: "Outreach Attempted", value: outreach,     sub: "awaiting response",      accent: "text-sky-700"    },
                    { label: "Completed",          value: completed,    sub: "interventions closed",   accent: "text-emerald-700" },
                    { label: "PMPM",               value: `$${weightedPmpm}`, sub: "portfolio weighted average", accent: "text-violet-700" },
                    { label: "ED admits / 1000",   value: edAdmitsPer1000, sub: "avg synthetic utilization", accent: "text-rose-700" },
                    { label: "In-patient admits / 1000", value: inpatientAdmissionsPer1000, sub: "avg synthetic utilization", accent: "text-amber-700" },
                  ].map((card) => (
                    <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-medium text-slate-500">{card.label}</p>
                      <p className={`mt-1 text-3xl font-bold ${card.accent}`}>{card.value}</p>
                      <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Group KPIs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900">Team Assignment Groups</h2>
                    <span className="text-[11px] text-slate-500">Human vs Agent performance</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {assignmentGroupKpis.map((group) => (
                      <div key={group.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">{group.label}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${group.key === "human" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>
                            {group.key === "human" ? "Human" : "Agent"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">Assigned</p><p className="font-semibold text-slate-900">{group.assigned}</p></div>
                          <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">Enrolled</p><p className="font-semibold text-indigo-700">{group.enrolled}</p></div>
                          <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">Outreach</p><p className="font-semibold text-sky-700">{group.outreach}</p></div>
                          <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">Completed</p><p className="font-semibold text-emerald-700">{group.completed}</p></div>
                          <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">PMPM</p><p className="font-semibold text-violet-700">${group.pmpm}</p></div>
                          <div className="rounded-lg bg-slate-50 p-2"><p className="text-slate-500">ED admits / 1000</p><p className="font-semibold text-rose-700">{group.edAdmitsPer1000}</p></div>
                          <div className="rounded-lg bg-slate-50 p-2 col-span-2"><p className="text-slate-500">In-patient admits / 1000</p><p className="font-semibold text-amber-700">{group.inpatientAdmissionsPer1000}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setIsHumanCareManagersExpanded((prev) => !prev)}
                        className="flex w-full items-center justify-between text-left"
                        aria-expanded={isHumanCareManagersExpanded}
                      >
                        <span className="text-xs font-semibold text-slate-700">Human Care Managers</span>
                        <span className="text-xs font-semibold text-emerald-700">
                          {isHumanCareManagersExpanded ? "Hide ▲" : "Show ▼"}
                        </span>
                      </button>
                      {isHumanCareManagersExpanded && (
                        <div className="mt-3 grid gap-2">
                          {humanCareManagerCaseloads.map((manager) => (
                            <div
                              key={`human-care-manager-${manager.managerName}`}
                              className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedHumanManagerPatients((prev) => ({
                                    ...prev,
                                    [manager.managerName]: !prev[manager.managerName],
                                  }))
                                }
                                className="flex w-full items-center justify-between gap-2 text-left"
                                aria-expanded={!!expandedHumanManagerPatients[manager.managerName]}
                              >
                                <Link
                                  href={`/?careManager=${encodeURIComponent(manager.managerName)}`}
                                  className="text-xs font-semibold text-indigo-700 hover:underline"
                                >
                                  {manager.managerName}
                                </Link>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                    {manager.caseloadCount} patients
                                  </span>
                                  <span className="text-[10px] font-semibold text-emerald-700">
                                    {expandedHumanManagerPatients[manager.managerName] ? "Hide ▲" : "Show ▼"}
                                  </span>
                                </div>
                              </button>
                              {expandedHumanManagerPatients[manager.managerName] && (
                                manager.caseloadCount > 0 ? (
                                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-slate-700">
                                    {manager.assignedPatients.map((patientName) => (
                                      <li key={`${manager.managerName}-${patientName}`}>{patientName}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-2 text-[11px] text-slate-500">No assigned patients</p>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setIsCareManagementAgentsExpanded((prev) => !prev)}
                        className="flex w-full items-center justify-between text-left"
                        aria-expanded={isCareManagementAgentsExpanded}
                      >
                        <span className="text-xs font-semibold text-slate-700">Care Management Agents</span>
                        <span className="text-xs font-semibold text-violet-700">
                          {isCareManagementAgentsExpanded ? "Hide ▲" : "Show ▼"}
                        </span>
                      </button>
                      {isCareManagementAgentsExpanded && (
                        <div className="mt-3 grid gap-2">
                          {careManagementAgentCaseloads.map((agent) => (
                            <div
                              key={`care-management-agent-${agent.agentName}`}
                              className="rounded-lg border border-violet-100 bg-violet-50/40 p-3"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCareManagementAgentPatients((prev) => ({
                                    ...prev,
                                    [agent.agentName]: !prev[agent.agentName],
                                  }))
                                }
                                className="flex w-full items-center justify-between gap-2 text-left"
                                aria-expanded={!!expandedCareManagementAgentPatients[agent.agentName]}
                              >
                                <p className="text-xs font-semibold text-slate-800">{agent.agentName}</p>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200">
                                    {agent.caseloadCount} patients
                                  </span>
                                  <span className="text-[10px] font-semibold text-violet-700">
                                    {expandedCareManagementAgentPatients[agent.agentName] ? "Hide ▲" : "Show ▼"}
                                  </span>
                                </div>
                              </button>
                              {expandedCareManagementAgentPatients[agent.agentName] && (
                                agent.caseloadCount > 0 ? (
                                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-slate-700">
                                    {agent.assignedPatients.map((patientName) => (
                                      <li key={`${agent.agentName}-${patientName}`}>{patientName}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-2 text-[11px] text-slate-500">No assigned patients</p>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Not-started callout */}
                {notStarted > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
                    <span className="mt-0.5 text-amber-500 text-lg">⚠</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        {notStarted} caseload members have not been contacted yet
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Open a cohort below to begin outreach and update member status.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pipeline table */}
                <div>
                  <h2 className="mb-4 text-base font-semibold text-slate-900">Pipeline by Cohort</h2>
                  <div className="space-y-3">
                    {rows.map((row) => {
                      const total = row.totalMembers || 1;
                      const activeCount    = ACTIVE_STAGES.reduce((s, st) => s + row.counts[st], 0);
                      const terminalCount  = TERMINAL_STAGES.reduce((s, st) => s + row.counts[st], 0);
                      const progressPct    = Math.round(((activeCount + terminalCount) / total) * 100);

                      const isAskGenerated = row.cohortId.startsWith("ask-");
                      const cohortDetailId = CARE_TO_COHORTS_ID_MAP[row.cohortId] ?? row.cohortId;

                      const members = isAskGenerated ? [] : getMembersForCohort(row.cohortId);
                      const workflowForCohort = savedWorkflowByCohort[row.cohortId] ?? {};
                      const isExpanded = expandedPatientLists[row.cohortId] ?? false;
                      const humanCareManagerOptions = Array.from(
                        new Set([...HUMAN_CARE_MANAGER_OPTIONS, ...members.map((m) => m.assignedCM)])
                      );
                      const selectedIds = selectedPatientIdsByCohort[row.cohortId] ?? [];
                      const allSelected =
                        members.length > 0 && members.every((member) => selectedIds.includes(member.id));

                      return (
                        <div
                          key={row.cohortId}
                          className="rounded-xl border border-slate-200 bg-white shadow-sm hover:ring-2 hover:ring-indigo-200 transition-all overflow-hidden"
                        >
                          {/* Header */}
                          <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <PriorityBadge priority={row.priority as "High" | "Medium" | "Low"} />
                                {isAskGenerated && (
                                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">Ask-generated</span>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-slate-900 truncate">{row.cohortName}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{row.contractName} · {row.totalMembers} in caseload</p>
                            </div>

                            {/* Stage badges */}
                            <div className="flex flex-wrap gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePatientList(row.cohortId)}
                                className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-100"
                              >
                                {isExpanded ? "Hide Patients" : "Show Patients"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteCohort(row.cohortId, row.cohortName);
                                }}
                                className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100"
                              >
                                Delete
                              </button>
                              {(["Not Started", "Outreach Attempted", "Enrolled in CM", "Completed", "Declined"] as WorkflowStatus[]).map((s) => {
                                const c = row.counts[s];
                                if (c === 0) return null;
                                return (
                                  <span key={s} className="flex items-center gap-1">
                                    <WorkflowStatusBadge status={s} />
                                    <span className={`text-[10px] font-bold ${workflowColors[s].text}`}>{c}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                  Patient List
                                </p>
                                {members.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-500">{selectedIds.length} selected</span>
                                    <select
                                      value={bulkAssignmentSelectionByCohort[row.cohortId] ?? ""}
                                      onChange={(event) => {
                                        const nextValue = event.target.value;
                                        setBulkAssignmentSelectionByCohort((prev) => ({
                                          ...prev,
                                          [row.cohortId]: nextValue,
                                        }));
                                      }}
                                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                                    >
                                      <option value="">Bulk assign…</option>
                                      <optgroup label="Human Care Managers">
                                        {humanCareManagerOptions.map((cmName) => (
                                          <option key={`bulk-human-${cmName}`} value={`human:${cmName}`}>
                                            {cmName}
                                          </option>
                                        ))}
                                      </optgroup>
                                      <optgroup label="Care Management Agents">
                                        {CARE_MANAGEMENT_AGENT_OPTIONS.map((agentName) => (
                                          <option key={`bulk-agent-${agentName}`} value={`agent:${agentName}`}>
                                            {agentName}
                                          </option>
                                        ))}
                                      </optgroup>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        applyBulkAssignment(
                                          row.cohortId,
                                          selectedIds,
                                          bulkAssignmentSelectionByCohort[row.cohortId] ?? ""
                                        )
                                      }
                                      disabled={!bulkAssignmentSelectionByCohort[row.cohortId] || selectedIds.length === 0}
                                      className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      Apply to Selected
                                    </button>
                                  </div>
                                )}
                              </div>

                              {members.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-xs text-slate-500">
                                  No member-level list is available for this ask-generated cohort yet.
                                </div>
                              ) : (
                                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                                    <thead className="bg-slate-50">
                                      <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">
                                          <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={() =>
                                              toggleSelectAllPatients(
                                                row.cohortId,
                                                members.map((member) => member.id)
                                              )
                                            }
                                            aria-label="Select all patients"
                                          />
                                        </th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Patient</th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Condition</th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Risk</th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Enrolled</th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Assigned</th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Assignment</th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Last Contact</th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Care Plan Assigned</th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Case Status</th>
                                        <th className="px-3 py-2 text-left font-semibold text-slate-500">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {members.map((member) => {
                                        const workflowStatus: WorkflowStatus =
                                          workflowForCohort[member.id]?.status ?? "Not Started";
                                        const assignment = getDefaultAssignment(member.id, member.assignedCM);
                                        const onboarding = getOnboardingRecord(member.id);
                                        const onboardingStarted = !!onboardingByMemberId[member.id];
                                        const onboardingLabel = onboardingStageLabel(onboarding);
                                        const memberDiseaseCategory = deriveDiseaseCategoryFromCondition(member.primaryCondition);
                                        const alignedPlan = row.cohortId === RISING_RISK_COHORT_ID
                                          ? carePlans.find((plan) => plan.cohortId === RISING_RISK_COHORT_ID)
                                          : carePlans.find((plan) => plan.diseaseCategory === memberDiseaseCategory)
                                            ?? carePlans.find((plan) => plan.cohortId === row.cohortId);
                                        return (
                                          <tr key={member.id}>
                                            <td className="px-3 py-2">
                                              <input
                                                type="checkbox"
                                                checked={selectedIds.includes(member.id)}
                                                onChange={() => togglePatientSelection(row.cohortId, member.id)}
                                                aria-label={`Select ${formatMemberName(member.name)}`}
                                              />
                                            </td>
                                            <td className="px-3 py-2 text-slate-700">
                                              <p className="font-semibold text-slate-800">{formatMemberName(member.name)}</p>
                                              <p className="text-[10px] text-slate-500">{member.memberId} · Age {member.age} · Sex {inferMemberSex(member.name)}</p>
                                            </td>
                                            <td className="px-3 py-2 text-slate-600">{member.primaryCondition}</td>
                                            <td className="px-3 py-2 text-slate-700">{member.riskScore.toFixed(1)}</td>
                                            <td className="px-3 py-2">
                                              {workflowStatus === "Enrolled in CM" ? (
                                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
                                                  Yes · Enrolled
                                                </span>
                                              ) : (
                                                <span className="text-[10px] text-slate-400">—</span>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 text-slate-700">
                                              <p className="font-semibold text-slate-800">{assignment.assignee}</p>
                                              <p className="text-[10px] text-slate-500">
                                                {assignment.type === "human" ? "Human CM" : "CM Agent"}
                                              </p>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                  <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                      assignment.type === "human"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-violet-100 text-violet-700"
                                                    }`}
                                                  >
                                                    {assignment.type === "human" ? "Human CM" : "CM Agent"}
                                                  </span>
                                                </div>
                                                <select
                                                  value={`${assignment.type}:${assignment.assignee}`}
                                                  onChange={(event) => {
                                                    const [type, ...assigneeParts] = event.target.value.split(":");
                                                    const assignee = assigneeParts.join(":");
                                                    updateMemberAssignment(member.id, {
                                                      type: type as AssignmentType,
                                                      assignee,
                                                      updatedAt: new Date().toISOString(),
                                                    });
                                                  }}
                                                  className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700"
                                                >
                                                  <optgroup label="Human Care Managers">
                                                    {humanCareManagerOptions.map((cmName) => (
                                                      <option key={`human-${cmName}`} value={`human:${cmName}`}>
                                                        {cmName}
                                                      </option>
                                                    ))}
                                                  </optgroup>
                                                  <optgroup label="Care Management Agents">
                                                    {CARE_MANAGEMENT_AGENT_OPTIONS.map((agentName) => (
                                                      <option key={`agent-${agentName}`} value={`agent:${agentName}`}>
                                                        {agentName}
                                                      </option>
                                                    ))}
                                                  </optgroup>
                                                </select>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2 text-slate-600">
                                              <p>{member.lastContactDate}</p>
                                              <p className="text-[10px] text-slate-400">{daysSinceContact(member.lastContactDate)}d ago</p>
                                            </td>
                                            <td className="px-3 py-2 text-slate-700">
                                              <p className="font-semibold text-slate-800">{alignedPlan?.title ?? "Unassigned"}</p>
                                              <p className="text-[10px] text-slate-500">{memberDiseaseCategory}</p>
                                            </td>
                                            <td className="px-3 py-2">
                                              <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                                {onboardingLabel}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  openOnboardingDrawer(
                                                    member.id,
                                                    row.cohortId,
                                                    `cp-${row.cohortId}`
                                                  )
                                                }
                                                className="block rounded-md border border-indigo-200 bg-white px-2 py-1 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-50"
                                              >
                                                {onboardingStarted ? "Continue Onboarding" : "Start Onboarding"}
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Progress bar */}
                          <div className="h-1.5 flex w-full">
                            <div className="bg-slate-200"   style={{ width: `${(row.counts["Not Started"]        / total) * 100}%` }} />
                            <div className="bg-sky-400"     style={{ width: `${(row.counts["Outreach Attempted"] / total) * 100}%` }} />
                            <div className="bg-indigo-500"  style={{ width: `${(row.counts["Enrolled in CM"]     / total) * 100}%` }} />
                            <div className="bg-emerald-500" style={{ width: `${(row.counts["Completed"]          / total) * 100}%` }} />
                            <div className="bg-red-400"     style={{ width: `${(row.counts["Declined"]           / total) * 100}%` }} />
                          </div>

                          <div className="px-5 py-2 bg-slate-50 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">{progressPct}% of caseload contacted or in progress</span>
                            {isAskGenerated ? (
                              <span className="text-[10px] font-medium text-indigo-500">Generated in dashboard</span>
                            ) : (
                              <Link href={`/cohorts/${cohortDetailId}`} className="text-[10px] font-medium text-indigo-500 hover:underline">
                                Open cohort →
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pipeline Legend</p>
                  <div className="flex flex-wrap gap-4">
                    {(["Not Started", "Outreach Attempted", "Enrolled in CM", "Completed", "Declined"] as WorkflowStatus[]).map((s) => (
                      <div key={s} className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          s === "Not Started"        ? "bg-slate-300"   :
                          s === "Outreach Attempted" ? "bg-sky-400"     :
                          s === "Enrolled in CM"     ? "bg-indigo-500"  :
                          s === "Completed"          ? "bg-emerald-500" : "bg-red-400"
                        }`} />
                        <span className="text-xs text-slate-600">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "onboarding" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="text-sm font-semibold text-indigo-900">Patient Onboarding Workflow (Simulated)</p>
                  <p className="mt-1 text-xs text-indigo-700">
                    Simulate care management onboarding with consent, assessment, care plan assignment/configuration, and tracking.
                  </p>
                </div>

                <div className="space-y-4">
                  {rows
                    .filter((row) => !row.cohortId.startsWith("ask-"))
                    .map((row) => {
                      const members = getMembersForCohort(row.cohortId);
                      const planForCohort = carePlans.find((p) => p.cohortId === row.cohortId);

                      return (
                        <div key={`onboarding-${row.cohortId}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">{row.cohortName}</h3>
                              <p className="text-xs text-slate-500">{members.length} members</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {members.slice(0, 8).map((member) => {
                              const rec = getOnboardingRecord(member.id);
                              const stepsCompleted = [
                                rec.consentStatus !== "pending",
                                rec.assessmentCompleted,
                                !!rec.assignedCarePlanId,
                                rec.planConfigured,
                                rec.trackingActive,
                              ].filter(Boolean).length;
                              const pct = Math.round((stepsCompleted / 5) * 100);

                              return (
                                <div key={`onboard-member-${member.id}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                  <div className="mb-2 flex items-center justify-between gap-2">
                                    <div>
                                      <p className="text-xs font-semibold text-slate-900">{formatMemberName(member.name)}</p>
                                      <p className="text-[10px] text-slate-500">{member.memberId} · {member.primaryCondition}</p>
                                    </div>
                                    <span className="text-[10px] font-semibold text-indigo-700">{pct}% onboarding complete</span>
                                  </div>

                                  <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                    <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                                  </div>

                                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    <label className="text-[11px] font-semibold text-slate-600">
                                      Consent
                                      <select
                                        value={rec.consentStatus}
                                        onChange={(e) =>
                                          updateOnboardingRecord(member.id, {
                                            consentStatus: e.target.value as OnboardingConsentStatus,
                                            consentDate:
                                              e.target.value === "accepted" && !rec.consentDate
                                                ? new Date().toISOString().slice(0, 10)
                                                : rec.consentDate,
                                          })
                                        }
                                        className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="declined">Declined</option>
                                      </select>
                                    </label>

                                    <label className="text-[11px] font-semibold text-slate-600">
                                      Consent Date
                                      <input
                                        type="date"
                                        value={rec.consentDate}
                                        onChange={(e) => updateOnboardingRecord(member.id, { consentDate: e.target.value })}
                                        className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                                      />
                                    </label>

                                    <label className="text-[11px] font-semibold text-slate-600">
                                      Care Plan Assignment
                                      <select
                                        value={rec.assignedCarePlanId || planForCohort?.id || ""}
                                        onChange={(e) => updateOnboardingRecord(member.id, { assignedCarePlanId: e.target.value })}
                                        className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                                      >
                                        <option value="">Select plan...</option>
                                        {carePlans
                                          .filter((p) => p.cohortId === row.cohortId)
                                          .map((p) => (
                                            <option key={`assign-${member.id}-${p.id}`} value={p.id}>
                                              {p.title}
                                            </option>
                                          ))}
                                      </select>
                                    </label>
                                  </div>

                                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                    <label className="flex items-center gap-2 text-[11px] text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={rec.assessmentCompleted}
                                        onChange={(e) =>
                                          updateOnboardingRecord(member.id, { assessmentCompleted: e.target.checked })
                                        }
                                      />
                                      Assessment Completed
                                    </label>
                                    <label className="flex items-center gap-2 text-[11px] text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={rec.planConfigured}
                                        onChange={(e) => updateOnboardingRecord(member.id, { planConfigured: e.target.checked })}
                                      />
                                      Plan Configured
                                    </label>
                                    <label className="flex items-center gap-2 text-[11px] text-slate-700">
                                      <input
                                        type="checkbox"
                                        checked={rec.trackingActive}
                                        onChange={(e) => updateOnboardingRecord(member.id, { trackingActive: e.target.checked })}
                                      />
                                      Tracking Active
                                    </label>
                                  </div>

                                  <label className="mt-2 block text-[11px] font-semibold text-slate-600">
                                    Assessment Summary
                                    <textarea
                                      value={rec.assessmentSummary}
                                      onChange={(e) =>
                                        updateOnboardingRecord(member.id, { assessmentSummary: e.target.value })
                                      }
                                      rows={2}
                                      placeholder="Needs, barriers, goals, and onboarding notes..."
                                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                                    />
                                  </label>

                                  {rec.lastUpdated && (
                                    <p className="mt-1 text-[10px] text-slate-400">Last updated {rec.lastUpdated}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === "care-plans" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="text-sm font-semibold text-indigo-900">Care Plans</p>
                  <p className="mt-1 text-xs text-indigo-700">
                    View and configure patient action plans by cohort, including goals and intervention steps patients can follow.
                  </p>
                </div>

                <div className="space-y-5">
                  {groupedCarePlans.map((group) => (
                    <div key={group.category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">{group.category}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {group.plans.length} plans
                        </span>
                      </div>
                      {group.plans.map((plan) => {
                        const planCohortDetailId = CARE_TO_COHORTS_ID_MAP[plan.cohortId] ?? plan.cohortId;
                        const planIsAskGenerated = plan.cohortId.startsWith("ask-");
                        const isEditorOpen = expandedCarePlanEditors[plan.id] ?? false;
                        return (
                          <div
                            key={plan.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{plan.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{plan.focus}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <p className="text-xs text-slate-500">Owner</p>
                                  <p className="text-xs font-semibold text-slate-700">{plan.owner}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedCarePlanEditors((prev) => ({
                                      ...prev,
                                      [plan.id]: !prev[plan.id],
                                    }))
                                  }
                                  className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                                >
                                  {isEditorOpen ? "Hide Editor" : "Configure"}
                                </button>
                                <Link
                                  href={planIsAskGenerated ? "/care-management" : `/cohorts/${planCohortDetailId}`}
                                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                  Open Cohort
                                </Link>
                              </div>
                            </div>

                            <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-indigo-500" style={{ width: `${plan.progress}%` }} />
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                              <span>{plan.membersInPlan} members engaged</span>
                              <span>Due in {plan.dueInDays} days</span>
                            </div>

                            <div className="mt-3 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                              <div>
                                <p className="mb-1 font-semibold text-slate-700">Goals</p>
                                <ul className="list-disc space-y-1 pl-4">
                                  {plan.goals.map((goal, idx) => (
                                    <li key={`${plan.id}-goal-${idx}`}>{goal || "(empty goal)"}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="mb-1 font-semibold text-slate-700">Interventions</p>
                                <ul className="list-disc space-y-1 pl-4">
                                  {plan.interventions.map((intervention, idx) => (
                                    <li key={`${plan.id}-intervention-${idx}`}>{intervention || "(empty intervention)"}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {isEditorOpen && (
                              <div className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div className="grid gap-2 sm:grid-cols-2">
                                  <label className="text-[11px] font-semibold text-slate-600">
                                    Plan Title
                                    <input
                                      value={plan.title}
                                      onChange={(event) => updateCarePlanField(plan.id, "title", event.target.value)}
                                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                                    />
                                  </label>
                                  <label className="text-[11px] font-semibold text-slate-600">
                                    Owner
                                    <input
                                      value={plan.owner}
                                      onChange={(event) => updateCarePlanField(plan.id, "owner", event.target.value)}
                                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                                    />
                                  </label>
                                  <label className="text-[11px] font-semibold text-slate-600 sm:col-span-2">
                                    Focus
                                    <input
                                      value={plan.focus}
                                      onChange={(event) => updateCarePlanField(plan.id, "focus", event.target.value)}
                                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                                    />
                                  </label>
                                  <label className="text-[11px] font-semibold text-slate-600">
                                    Due in (days)
                                    <input
                                      type="number"
                                      min={1}
                                      value={plan.dueInDays}
                                      onChange={(event) => updateCarePlanField(plan.id, "dueInDays", Math.max(1, Number(event.target.value || 1)))}
                                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                                    />
                                  </label>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <div className="mb-2 flex items-center justify-between">
                                      <p className="text-[11px] font-semibold text-slate-700">Patient-Centered Goals</p>
                                      <button
                                        type="button"
                                        onClick={() => addCarePlanListItem(plan, "goals")}
                                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                                      >
                                        + Add Goal
                                      </button>
                                    </div>
                                    <div className="space-y-2">
                                      {plan.goals.map((goal, idx) => (
                                        <div key={`${plan.id}-goal-edit-${idx}`} className="flex items-center gap-2">
                                          <input
                                            value={goal}
                                            onChange={(event) =>
                                              updateCarePlanListItem(plan.id, "goals", idx, event.target.value)
                                            }
                                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeCarePlanListItem(plan, "goals", idx)}
                                            className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="mb-2 flex items-center justify-between">
                                      <p className="text-[11px] font-semibold text-slate-700">Patient-Centered Interventions</p>
                                      <button
                                        type="button"
                                        onClick={() => addCarePlanListItem(plan, "interventions")}
                                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                                      >
                                        + Add Intervention
                                      </button>
                                    </div>
                                    <div className="space-y-2">
                                      {plan.interventions.map((intervention, idx) => (
                                        <div key={`${plan.id}-intervention-edit-${idx}`} className="flex items-center gap-2">
                                          <input
                                            value={intervention}
                                            onChange={(event) =>
                                              updateCarePlanListItem(plan.id, "interventions", idx, event.target.value)
                                            }
                                            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeCarePlanListItem(plan, "interventions", idx)}
                                            className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Tabs>

      {(() => {
        if (!isOnboardingDrawerOpen || !onboardingDrawerMemberId || !onboardingDrawerCohortId) return null;
        const member = getMembersForCohort(onboardingDrawerCohortId).find((m) => m.id === onboardingDrawerMemberId);
        if (!member) return null;
        const rec = getOnboardingRecord(member.id);
        const stepsCompleted = [
          rec.consentStatus !== "pending",
          rec.assessmentCompleted,
          !!rec.assignedCarePlanId,
          rec.planConfigured,
          rec.trackingActive,
        ].filter(Boolean).length;
        const pct = Math.round((stepsCompleted / 5) * 100);

        return (
          <>
            <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={() => setIsOnboardingDrawerOpen(false)} />
            <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Onboarding Workflow</p>
                  <h3 className="text-lg font-semibold text-slate-900">{formatMemberName(member.name)}</h3>
                  <p className="text-xs text-slate-500">{member.memberId} · {member.primaryCondition}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOnboardingDrawerOpen(false)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Progress</span>
                  <span className="font-semibold text-indigo-700">{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-600">
                  Consent
                  <select
                    value={rec.consentStatus}
                    onChange={(e) =>
                      updateOnboardingRecord(member.id, {
                        consentStatus: e.target.value as OnboardingConsentStatus,
                        consentDate:
                          e.target.value === "accepted" && !rec.consentDate
                            ? new Date().toISOString().slice(0, 10)
                            : rec.consentDate,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                  </select>
                </label>

                <label className="text-[11px] font-semibold text-slate-600">
                  Consent Date
                  <input
                    type="date"
                    value={rec.consentDate}
                    onChange={(e) => updateOnboardingRecord(member.id, { consentDate: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                  />
                </label>

                <label className="text-[11px] font-semibold text-slate-600">
                  Care Plan Assignment
                  <select
                    value={rec.assignedCarePlanId || `cp-${onboardingDrawerCohortId}`}
                    onChange={(e) => updateOnboardingRecord(member.id, { assignedCarePlanId: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                  >
                    <option value="">Select plan...</option>
                    {carePlans
                      .filter((p) => p.cohortId === onboardingDrawerCohortId)
                      .map((p) => (
                        <option key={`drawer-assign-${member.id}-${p.id}`} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={rec.assessmentCompleted}
                    onChange={(e) => updateOnboardingRecord(member.id, { assessmentCompleted: e.target.checked })}
                  />
                  Assessment Completed
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={rec.planConfigured}
                    onChange={(e) => updateOnboardingRecord(member.id, { planConfigured: e.target.checked })}
                  />
                  Plan Configured
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={rec.trackingActive}
                    onChange={(e) => updateOnboardingRecord(member.id, { trackingActive: e.target.checked })}
                  />
                  Tracking Active
                </label>

                <label className="text-[11px] font-semibold text-slate-600">
                  Assessment Summary
                  <textarea
                    value={rec.assessmentSummary}
                    onChange={(e) => updateOnboardingRecord(member.id, { assessmentSummary: e.target.value })}
                    rows={3}
                    placeholder="Needs, barriers, goals, and onboarding notes..."
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-normal text-slate-700"
                  />
                </label>
              </div>
            </aside>
          </>
        );
      })()}
      </div>
    </FeatureGuard>
  );
}
