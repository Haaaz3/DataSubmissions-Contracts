import { AgentActivityStep } from "@/lib/narrativeUx";

export interface HbA1cMockPatient {
  id: string;
  dueForScreening: boolean;
  hasUpcomingAppointment: boolean;
  screeningCompletedThisYear: boolean;
  latestA1cValue?: number;
  nearestInNetworkDistanceMiles: number;
}

export type HbA1cCohortId =
  | "patient-outbound-outreach"
  | "provider-previsit-prep"
  | "care-management-enrollment"
  | "coverage-friction";

export interface HbA1cCareGapCohort {
  id: HbA1cCohortId;
  name: string;
  definition: string;
  rule: string;
  patientCount: number;
  primaryAutomatedAction: string;
}

export interface HbA1cCareGapAnalysisResult {
  totalPatientsReviewed: number;
  relevantPatients: number;
  cohorts: HbA1cCareGapCohort[];
}

const ACTIVITY_TEMPLATES: Omit<AgentActivityStep, "status">[] = [
  {
    label: "Reviewing patient chart signals (documents, medications, labs, orders)…",
    detail: "Categorizing quality-relevant signal types only (non-PHI).",
  },
  {
    label: "Checking measure eligibility and HbA1c screening status…",
    detail: "Evaluating denominator eligibility and current-year screening closure.",
  },
  {
    label: "Reviewing appointments and care team assignments…",
    detail: "Identifying members with pre-visit opportunities versus outreach needs.",
  },
  {
    label: "Identifying access/coverage friction (in-network distance)…",
    detail: "Flagging barriers such as long travel distance to in-network services.",
  },
  {
    label: "Segmenting patients into action cohorts…",
    detail: "Applying rule-based assignment to the best-fit automated intervention cohort.",
  },
];

export function getHbA1cActivitySteps(activeStepIndex: number): AgentActivityStep[] {
  return ACTIVITY_TEMPLATES.map((step, index) => ({
    ...step,
    status:
      index < activeStepIndex
        ? "complete"
        : index === activeStepIndex
        ? "running"
        : "queued",
  }));
}

export function getInitialHbA1cActivitySteps(): AgentActivityStep[] {
  return getHbA1cActivitySteps(0).map((step) => ({ ...step, status: "queued" }));
}

export function buildHbA1cMockPatients(): HbA1cMockPatient[] {
  return Array.from({ length: 240 }, (_, idx) => {
    const position = idx + 1;
    const screeningCompletedThisYear = position % 5 === 0 || position % 11 === 0;
    const dueForScreening = !screeningCompletedThisYear;
    const hasUpcomingAppointment = position % 4 === 0 || position % 9 === 0;
    const nearestInNetworkDistanceMiles =
      8 + (position % 6) * 4 + (position % 10 === 0 ? 10 : 0);

    const elevatedA1c = screeningCompletedThisYear && (position % 3 === 0 || position % 7 === 0);
    const latestA1cValue = screeningCompletedThisYear
      ? elevatedA1c
        ? 9.1 + (position % 4) * 0.3
        : 6.7 + (position % 5) * 0.2
      : undefined;

    return {
      id: `pt-${String(position).padStart(3, "0")}`,
      dueForScreening,
      hasUpcomingAppointment,
      screeningCompletedThisYear,
      latestA1cValue,
      nearestInNetworkDistanceMiles,
    };
  });
}

export function runHbA1cCareGapAnalysis(): HbA1cCareGapAnalysisResult {
  const patients = buildHbA1cMockPatients();
  const relevantPatients = patients.filter(
    (patient) =>
      patient.dueForScreening ||
      (patient.screeningCompletedThisYear && (patient.latestA1cValue ?? 0) > 9)
  );

  let careManagementCount = 0;
  let coverageFrictionCount = 0;
  let preVisitCount = 0;
  let outreachCount = 0;

  relevantPatients.forEach((patient) => {
    if (patient.screeningCompletedThisYear && (patient.latestA1cValue ?? 0) > 9) {
      careManagementCount += 1;
      return;
    }

    if (patient.dueForScreening && patient.nearestInNetworkDistanceMiles > 20) {
      coverageFrictionCount += 1;
      return;
    }

    if (patient.dueForScreening && patient.hasUpcomingAppointment) {
      preVisitCount += 1;
      return;
    }

    if (patient.dueForScreening && !patient.hasUpcomingAppointment) {
      outreachCount += 1;
    }
  });

  return {
    totalPatientsReviewed: patients.length,
    relevantPatients: relevantPatients.length,
    cohorts: [
      {
        id: "patient-outbound-outreach",
        name: "Patient Outbound Outreach",
        definition: "Due for HbA1c screening and no future appointment.",
        rule: "Due for HbA1c screening AND no future appointment.",
        patientCount: outreachCount,
        primaryAutomatedAction:
          "Create outreach list + draft outreach message + scheduling prompt/work item.",
      },
      {
        id: "provider-previsit-prep",
        name: "Provider Pre-visit Prep",
        definition: "Due for HbA1c screening with an upcoming appointment.",
        rule: "Due for HbA1c screening AND has an upcoming appointment.",
        patientCount: preVisitCount,
        primaryAutomatedAction:
          "Auto-generate pre-visit note to prioritize HbA1c screening (include last A1c date/value placeholders).",
      },
      {
        id: "care-management-enrollment",
        name: "Care Management Enrollment",
        definition: "HbA1c screening completed this year with elevated A1c.",
        rule: "HbA1c screening completed this year AND elevated A1c.",
        patientCount: careManagementCount,
        primaryAutomatedAction:
          "Assign to care management team/queue + suggested next steps note.",
      },
      {
        id: "coverage-friction",
        name: "Coverage Friction",
        definition:
          "Due for screening with access friction (example: nearest in-network provider >20 miles).",
        rule:
          "Due for screening AND distance to nearest in-network provider > 20 miles.",
        patientCount: coverageFrictionCount,
        primaryAutomatedAction:
          "Identify friction reason + recommend resolution path (alternate site/telehealth/transport/out-of-network exception).",
      },
    ],
  };
}

export function getHbA1cSubAgentSummary(cohort: HbA1cCareGapCohort): string {
  switch (cohort.id) {
    case "patient-outbound-outreach":
      return `Created ${cohort.patientCount} outreach tasks with scheduling prompts.`;
    case "provider-previsit-prep":
      return `Generated ${cohort.patientCount} pre-visit notes with HbA1c reminder placeholders.`;
    case "care-management-enrollment":
      return `Assigned ${cohort.patientCount} patients to Care Management – Diabetes.`;
    case "coverage-friction":
      return `Flagged ${cohort.patientCount} patients with coverage friction and recommended options.`;
    default:
      return "Sub-agent run completed.";
  }
}