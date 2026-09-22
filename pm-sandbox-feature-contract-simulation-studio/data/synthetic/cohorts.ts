import { Cohort, CohortMember } from "@/lib/models/cohort";

export const demoCohorts: Cohort[] = [
  {
    id: "cohort-ed-utilizers",
    name: "ED Frequent Utilizers",
    description:
      "Synthetic cohort of members with repeat ED visits, flagged for stabilization and diversion outreach.",
    goalType: "ed_utilization",
    definition: {
      inclusionCriteria: ["≥ 3 ED visits in last 6 months", "No active care plan"],
      exclusionCriteria: ["Hospice enrollment"],
      timeframeDays: 180,
    },
    size: 1480,
    churnRate: 0.12,
    createdAt: "2025-01-08",
    dataFreshness: "weekly",
    keyMetricLabel: "ED Visits / 1,000",
    keyMetricValue: 412,
    trend: "up",
  },
  {
    id: "cohort-readmission-risk",
    name: "Recent Discharges (Readmission Risk)",
    description:
      "Synthetic post-discharge cohort tracking 30-day readmission risk and transition-of-care gaps.",
    goalType: "readmissions",
    definition: {
      inclusionCriteria: ["Inpatient discharge in last 30 days", "≥ 2 risk factors"],
      exclusionCriteria: ["Skilled nursing facility resident"],
      timeframeDays: 30,
    },
    size: 920,
    churnRate: 0.28,
    createdAt: "2025-02-02",
    dataFreshness: "daily",
    keyMetricLabel: "Readmission Rate",
    keyMetricValue: 14.6,
    trend: "down",
  },
  {
    id: "cohort-screening-gaps",
    name: "Cancer Screening Gaps",
    description:
      "Synthetic cohort of members missing CRC, breast, or cervical screenings with outreach opportunities.",
    goalType: "cancer_screening",
    definition: {
      inclusionCriteria: ["Eligible for CRC/Breast/Cervical screenings", "No completion in 18 months"],
      exclusionCriteria: ["Active oncology treatment"],
      timeframeDays: 540,
    },
    size: 2040,
    churnRate: 0.18,
    createdAt: "2024-12-19",
    dataFreshness: "monthly",
    keyMetricLabel: "Screening Closure Rate",
    keyMetricValue: 58,
    trend: "flat",
  },
  {
    id: "cohort-diabetes-control",
    name: "Diabetes Poor Control",
    description:
      "Synthetic cohort of diabetic members with A1c uncontrolled or missing recent labs.",
    goalType: "diabetes",
    definition: {
      inclusionCriteria: ["Diabetes diagnosis", "A1c > 9% or missing in 6 months"],
      exclusionCriteria: ["Pregnancy"],
      timeframeDays: 180,
    },
    size: 1760,
    churnRate: 0.15,
    createdAt: "2025-01-18",
    dataFreshness: "weekly",
    keyMetricLabel: "A1c Control Rate",
    keyMetricValue: 52,
    trend: "down",
  },
];

const segmentPool = [
  "Access barrier",
  "Behavioral health overlap",
  "Medication complexity",
  "Transportation barrier",
  "No PCP touchpoint",
  "Care gap backlog",
  "Housing instability",
  "Language support needed",
  "High-cost chronic overlay",
];

function randomPick<T>(items: T[], count: number) {
  return [...items].sort(() => 0.5 - Math.random()).slice(0, count);
}

function buildMembers(cohortId: string, total: number): CohortMember[] {
  return Array.from({ length: total }).map((_, index) => {
    const riskTier = index % 3 === 0 ? "high" : index % 3 === 1 ? "medium" : "low";
    const segments = randomPick(segmentPool, 2 + (index % 2));
    return {
      id: `${cohortId}-member-${index + 1}`,
      cohortId,
      riskTier,
      segments,
      signals: {
        edVisits6m: cohortId === "cohort-ed-utilizers" ? 3 + (index % 4) : undefined,
        recentDischarge: cohortId === "cohort-readmission-risk" ? index % 2 === 0 : undefined,
        openGaps:
          cohortId === "cohort-screening-gaps"
            ? randomPick(["CRC", "Breast", "Cervical"], 1 + (index % 2))
            : undefined,
        lastA1c: cohortId === "cohort-diabetes-control" ? 8.4 + (index % 4) * 0.4 : undefined,
        a1cDate: cohortId === "cohort-diabetes-control" ? "2025-01-05" : undefined,
      },
    };
  });
}

export const demoMembers: CohortMember[] = demoCohorts.flatMap((cohort) =>
  buildMembers(cohort.id, Math.round(cohort.size / 4))
);