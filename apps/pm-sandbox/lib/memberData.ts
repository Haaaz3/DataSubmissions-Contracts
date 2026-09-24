import { CohortMember } from "@/types/workflow";

// ---------------------------------------------------------------------------
// Mock caseload members — 6 high-priority individuals per cohort, representing
// the active caseload a care manager would be working with.
// ---------------------------------------------------------------------------

export const mockMembers: CohortMember[] = [

  // ── cohort-001: Unmanaged High-Risk Diabetes (ma-004) ────────────────────
  { id: "m-001-01", cohortId: "cohort-001", memberId: "M-10482", name: "James Patterson",  age: 67, primaryCondition: "T2 Diabetes + CKD Stage 3",         riskScore: 3.2, lastContactDate: "2026-02-10", assignedCM: "Rosa Chen" },
  { id: "m-001-02", cohortId: "cohort-001", memberId: "M-10491", name: "Maria Gonzalez",   age: 71, primaryCondition: "T2 Diabetes + Hypertension",          riskScore: 2.9, lastContactDate: "2026-02-18", assignedCM: "Rosa Chen" },
  { id: "m-001-03", cohortId: "cohort-001", memberId: "M-10508", name: "Robert Chen",      age: 64, primaryCondition: "T2 Diabetes + Peripheral Neuropathy",  riskScore: 3.5, lastContactDate: "2026-01-28", assignedCM: "Diane Wells" },
  { id: "m-001-04", cohortId: "cohort-001", memberId: "M-10519", name: "Dorothy Williams", age: 73, primaryCondition: "T2 Diabetes + Obesity",                riskScore: 2.7, lastContactDate: "2026-02-22", assignedCM: "Diane Wells" },
  { id: "m-001-05", cohortId: "cohort-001", memberId: "M-10534", name: "Harold Johnson",   age: 69, primaryCondition: "T2 Diabetes + CKD + CHF",              riskScore: 4.1, lastContactDate: "2026-01-15", assignedCM: "Rosa Chen" },
  { id: "m-001-06", cohortId: "cohort-001", memberId: "M-10547", name: "Susan Martinez",   age: 62, primaryCondition: "T2 Diabetes + Retinopathy",            riskScore: 2.8, lastContactDate: "2026-02-25", assignedCM: "Diane Wells" },

  // ── cohort-002: Frequent ED Users (comm-001) ──────────────────────────────
  { id: "m-002-01", cohortId: "cohort-002", memberId: "M-20103", name: "Tyler Brooks",     age: 34, primaryCondition: "Behavioral Health + Anxiety",          riskScore: 3.0, lastContactDate: "2026-02-19", assignedCM: "Marcus Webb" },
  { id: "m-002-02", cohortId: "cohort-002", memberId: "M-20117", name: "Amanda Foster",    age: 29, primaryCondition: "Depression + Substance Use",            riskScore: 3.4, lastContactDate: "2026-02-05", assignedCM: "Lynn Patel" },
  { id: "m-002-03", cohortId: "cohort-002", memberId: "M-20129", name: "Devon Watkins",    age: 41, primaryCondition: "Chronic Back Pain + Anxiety",           riskScore: 2.8, lastContactDate: "2026-01-30", assignedCM: "Marcus Webb" },
  { id: "m-002-04", cohortId: "cohort-002", memberId: "M-20144", name: "Keisha Thomas",    age: 38, primaryCondition: "Depression + Hypertension",             riskScore: 2.6, lastContactDate: "2026-02-14", assignedCM: "Lynn Patel" },
  { id: "m-002-05", cohortId: "cohort-002", memberId: "M-20158", name: "David Kim",        age: 45, primaryCondition: "Behavioral Health + SUD",               riskScore: 3.7, lastContactDate: "2026-01-20", assignedCM: "Marcus Webb" },
  { id: "m-002-06", cohortId: "cohort-002", memberId: "M-20166", name: "Rachel Nguyen",    age: 31, primaryCondition: "Anxiety + Chronic Pain",                riskScore: 2.5, lastContactDate: "2026-02-28", assignedCM: "Lynn Patel" },

  // ── cohort-003: COPD Members with Escalating Costs (mssp-003) ────────────
  { id: "m-003-01", cohortId: "cohort-003", memberId: "M-30201", name: "Walter Bishop",    age: 72, primaryCondition: "COPD + Heart Failure",                  riskScore: 3.1, lastContactDate: "2026-02-12", assignedCM: "Tanya Morris" },
  { id: "m-003-02", cohortId: "cohort-003", memberId: "M-30214", name: "Loretta Hayes",    age: 68, primaryCondition: "COPD + Asthma",                         riskScore: 2.7, lastContactDate: "2026-02-20", assignedCM: "Tanya Morris" },
  { id: "m-003-03", cohortId: "cohort-003", memberId: "M-30228", name: "Frank Morrison",   age: 74, primaryCondition: "COPD + Hypertension + T2D",             riskScore: 3.3, lastContactDate: "2026-01-25", assignedCM: "James Okafor" },
  { id: "m-003-04", cohortId: "cohort-003", memberId: "M-30239", name: "Edna Crawford",    age: 70, primaryCondition: "COPD + CHF",                            riskScore: 3.6, lastContactDate: "2026-02-08", assignedCM: "James Okafor" },
  { id: "m-003-05", cohortId: "cohort-003", memberId: "M-30251", name: "Carl Simmons",     age: 66, primaryCondition: "COPD + Asthma",                         riskScore: 2.4, lastContactDate: "2026-02-24", assignedCM: "Tanya Morris" },
  { id: "m-003-06", cohortId: "cohort-003", memberId: "M-30264", name: "Betty Horton",     age: 75, primaryCondition: "COPD + CKD Stage 2",                    riskScore: 3.0, lastContactDate: "2026-01-18", assignedCM: "James Okafor" },

  // ── cohort-004: Recently Discharged at Readmission Risk (mssp-001) ────────
  { id: "m-004-01", cohortId: "cohort-004", memberId: "M-40301", name: "George Mitchell",  age: 78, primaryCondition: "Heart Failure (recent admit)",          riskScore: 4.2, lastContactDate: "2026-02-27", assignedCM: "Claire Davis" },
  { id: "m-004-02", cohortId: "cohort-004", memberId: "M-40312", name: "Helen Torres",     age: 75, primaryCondition: "Hip Fracture (post-op)",                riskScore: 3.8, lastContactDate: "2026-02-23", assignedCM: "Claire Davis" },
  { id: "m-004-03", cohortId: "cohort-004", memberId: "M-40325", name: "Arthur Reynolds",  age: 82, primaryCondition: "COPD + Pneumonia (recent)",             riskScore: 3.5, lastContactDate: "2026-02-16", assignedCM: "Sam Torres" },
  { id: "m-004-04", cohortId: "cohort-004", memberId: "M-40338", name: "Florence Walker",  age: 71, primaryCondition: "Heart Failure + T2D",                   riskScore: 3.9, lastContactDate: "2026-02-20", assignedCM: "Sam Torres" },
  { id: "m-004-05", cohortId: "cohort-004", memberId: "M-40349", name: "Raymond Flores",   age: 77, primaryCondition: "Sepsis (recent discharge)",             riskScore: 4.0, lastContactDate: "2026-02-26", assignedCM: "Claire Davis" },
  { id: "m-004-06", cohortId: "cohort-004", memberId: "M-40356", name: "Mildred Peterson", age: 69, primaryCondition: "CHF + COPD",                            riskScore: 3.7, lastContactDate: "2026-02-11", assignedCM: "Sam Torres" },

  // ── cohort-005: Members Missing Preventive Screenings (ma-003) ───────────
  { id: "m-005-01", cohortId: "cohort-005", memberId: "M-50401", name: "Nancy Anderson",   age: 62, primaryCondition: "Hypertension + T2D",                    riskScore: 1.6, lastContactDate: "2026-02-17", assignedCM: "Angela Price" },
  { id: "m-005-02", cohortId: "cohort-005", memberId: "M-50414", name: "Karen Wilson",     age: 54, primaryCondition: "Hyperlipidemia",                        riskScore: 1.4, lastContactDate: "2026-02-09", assignedCM: "Angela Price" },
  { id: "m-005-03", cohortId: "cohort-005", memberId: "M-50427", name: "Patricia Davis",   age: 67, primaryCondition: "Osteoporosis risk",                     riskScore: 1.8, lastContactDate: "2026-01-31", assignedCM: "Tom Nguyen" },
  { id: "m-005-04", cohortId: "cohort-005", memberId: "M-50439", name: "Sandra Clark",     age: 58, primaryCondition: "Hypertension",                          riskScore: 1.5, lastContactDate: "2026-02-21", assignedCM: "Tom Nguyen" },
  { id: "m-005-05", cohortId: "cohort-005", memberId: "M-50448", name: "Linda Harris",     age: 71, primaryCondition: "Diabetes screening gap",                riskScore: 2.0, lastContactDate: "2026-02-03", assignedCM: "Angela Price" },
  { id: "m-005-06", cohortId: "cohort-005", memberId: "M-50461", name: "Carol Lewis",      age: 64, primaryCondition: "Depression + screening gap",            riskScore: 1.9, lastContactDate: "2026-02-13", assignedCM: "Tom Nguyen" },

  // ── cohort-006: Members with Transportation Barriers (comm-004) ───────────
  { id: "m-006-01", cohortId: "cohort-006", memberId: "M-60501", name: "Jennifer Robinson",age: 45, primaryCondition: "T2D + transport barrier",               riskScore: 2.1, lastContactDate: "2026-02-15", assignedCM: "Omar Hassan" },
  { id: "m-006-02", cohortId: "cohort-006", memberId: "M-60514", name: "Michael Brown",    age: 52, primaryCondition: "Hypertension + transport barrier",      riskScore: 2.0, lastContactDate: "2026-02-07", assignedCM: "Omar Hassan" },
  { id: "m-006-03", cohortId: "cohort-006", memberId: "M-60528", name: "Lisa Thompson",    age: 38, primaryCondition: "Asthma + missed visits",                riskScore: 2.4, lastContactDate: "2026-01-29", assignedCM: "Priya Shah" },
  { id: "m-006-04", cohortId: "cohort-006", memberId: "M-60539", name: "Kevin White",      age: 49, primaryCondition: "Depression + transport barrier",        riskScore: 2.3, lastContactDate: "2026-02-19", assignedCM: "Priya Shah" },
  { id: "m-006-05", cohortId: "cohort-006", memberId: "M-60552", name: "Diane Jackson",    age: 44, primaryCondition: "Chronic Back Pain",                     riskScore: 2.2, lastContactDate: "2026-02-04", assignedCM: "Omar Hassan" },
  { id: "m-006-06", cohortId: "cohort-006", memberId: "M-60564", name: "Carlos Ramirez",   age: 41, primaryCondition: "T2D + transport barrier",               riskScore: 2.5, lastContactDate: "2026-02-26", assignedCM: "Priya Shah" },

  // ── cohort-007: Medicare Advantage RAF Opportunity (ma-004) ───────────────
  { id: "m-007-01", cohortId: "cohort-007", memberId: "M-70601", name: "Ethel Sanders",    age: 74, primaryCondition: "Suspected CKD + CHF",                   riskScore: 1.8, lastContactDate: "2026-02-16", assignedCM: "Wendy Park" },
  { id: "m-007-02", cohortId: "cohort-007", memberId: "M-70614", name: "Norman Price",     age: 69, primaryCondition: "Undocumented COPD",                     riskScore: 1.9, lastContactDate: "2026-02-06", assignedCM: "Wendy Park" },
  { id: "m-007-03", cohortId: "cohort-007", memberId: "M-70627", name: "Gladys Baker",     age: 77, primaryCondition: "Hypertension + T2D",                    riskScore: 2.1, lastContactDate: "2026-01-27", assignedCM: "Ben Osei" },
  { id: "m-007-04", cohortId: "cohort-007", memberId: "M-70638", name: "Herbert Bennett",  age: 72, primaryCondition: "CHF documentation gap",                 riskScore: 2.0, lastContactDate: "2026-02-22", assignedCM: "Ben Osei" },
  { id: "m-007-05", cohortId: "cohort-007", memberId: "M-70651", name: "Agnes Collins",    age: 68, primaryCondition: "Suspected CKD Stage 3",                 riskScore: 1.7, lastContactDate: "2026-02-10", assignedCM: "Wendy Park" },
  { id: "m-007-06", cohortId: "cohort-007", memberId: "M-70664", name: "Clarence Ross",    age: 75, primaryCondition: "COPD documentation gap",                riskScore: 2.2, lastContactDate: "2026-02-24", assignedCM: "Ben Osei" },

  // ── cohort-008: Rising-Risk Members Without Care Management (Portfolio-Wide)
  { id: "m-008-01", cohortId: "cohort-008", memberId: "M-80701", name: "Tiffany Moore",    age: 41, primaryCondition: "Pre-Diabetes + Obesity",                riskScore: 1.5, lastContactDate: "2026-02-18", assignedCM: "Unassigned" },
  { id: "m-008-02", cohortId: "cohort-008", memberId: "M-80714", name: "Brandon Hall",     age: 38, primaryCondition: "Hypertension (new Dx)",                 riskScore: 1.6, lastContactDate: "2026-02-08", assignedCM: "Unassigned" },
  { id: "m-008-03", cohortId: "cohort-008", memberId: "M-80728", name: "Melissa Young",    age: 44, primaryCondition: "Hyperlipidemia + stress",               riskScore: 1.4, lastContactDate: "2026-01-24", assignedCM: "Unassigned" },
  { id: "m-008-04", cohortId: "cohort-008", memberId: "M-80739", name: "Anthony King",     age: 47, primaryCondition: "Pre-Diabetes + SDOH flags",             riskScore: 1.8, lastContactDate: "2026-02-20", assignedCM: "Unassigned" },
  { id: "m-008-05", cohortId: "cohort-008", memberId: "M-80752", name: "Crystal Scott",    age: 35, primaryCondition: "Depression (unmanaged)",                riskScore: 1.7, lastContactDate: "2026-01-22", assignedCM: "Unassigned" },
  { id: "m-008-06", cohortId: "cohort-008", memberId: "M-80764", name: "Justin Green",     age: 42, primaryCondition: "Obesity + Hypertension",                riskScore: 1.6, lastContactDate: "2026-02-27", assignedCM: "Unassigned" },
  { id: "m-008-07", cohortId: "cohort-008", memberId: "100000",  name: "Jacobs, Leah",     age: 73, primaryCondition: "Type 2 diabetes + SDOH flag (transportation barrier)", riskScore: 1.5, lastContactDate: "2025-09-19", assignedCM: "Unassigned" },

  // ── cohort-009: Transitional Care Management (CMS) Eligible (ma-003) ─────
  { id: "m-009-01", cohortId: "cohort-009", memberId: "M-90801", name: "Shirley Brooks",   age: 79, primaryCondition: "Heart Failure (post-discharge)",        riskScore: 4.0, lastContactDate: "2026-03-01", assignedCM: "Claire Davis" },
  { id: "m-009-02", cohortId: "cohort-009", memberId: "M-90814", name: "Ronald Hayes",     age: 73, primaryCondition: "COPD exacerbation follow-up",           riskScore: 3.7, lastContactDate: "2026-02-28", assignedCM: "Sam Torres" },
  { id: "m-009-03", cohortId: "cohort-009", memberId: "M-90827", name: "Janet Powell",     age: 76, primaryCondition: "Sepsis recovery + med rec needed",      riskScore: 3.9, lastContactDate: "2026-02-25", assignedCM: "Claire Davis" },
  { id: "m-009-04", cohortId: "cohort-009", memberId: "M-90839", name: "Leonard Price",    age: 70, primaryCondition: "Pneumonia post-acute transition",       riskScore: 3.4, lastContactDate: "2026-03-02", assignedCM: "Sam Torres" },
  { id: "m-009-05", cohortId: "cohort-009", memberId: "M-90852", name: "Patricia Greene",  age: 81, primaryCondition: "Post-SNF recovery + CHF",               riskScore: 4.2, lastContactDate: "2026-02-26", assignedCM: "Claire Davis" },
  { id: "m-009-06", cohortId: "cohort-009", memberId: "M-90864", name: "Gerald Hunter",    age: 68, primaryCondition: "Complex discharge + polypharmacy",      riskScore: 3.5, lastContactDate: "2026-03-03", assignedCM: "Sam Torres" },
];

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

export function getMembersForCohort(cohortId: string): CohortMember[] {
  return mockMembers.filter((m) => m.cohortId === cohortId);
}

export function getMemberById(id: string): CohortMember | undefined {
  return mockMembers.find((m) => m.id === id);
}

/** Normalize display name to "Surname, First" when possible. */
export function formatMemberName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes(",")) return trimmed;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return trimmed;
  const first = parts.slice(0, -1).join(" ");
  const last = parts[parts.length - 1];
  return `${last}, ${first}`;
}

/** Initials from either "First Last" or "Last, First" formats. */
export function memberInitials(name: string): string {
  const normalized = formatMemberName(name);
  if (!normalized) return "";
  if (normalized.includes(",")) {
    const [last, first] = normalized.split(",").map((p) => p.trim());
    return `${(last?.[0] ?? "")}${(first?.[0] ?? "")}`.toUpperCase();
  }
  return normalized
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Synthetic sex flag derived from first-name heuristics for UI display. */
export function inferMemberSex(name: string): "F" | "M" {
  const normalized = name.trim();
  const firstToken = normalized.includes(",")
    ? normalized.split(",")[1]?.trim().split(/\s+/)[0]
    : normalized.split(/\s+/)[0];
  const first = (firstToken ?? "").toLowerCase();

  const likelyFemale = new Set([
    "amanda", "agnes", "betty", "carol", "claire", "crystal", "diane", "dorothy", "edna",
    "ethel", "florence", "gladys", "helen", "janet", "jennifer", "karen", "keisha", "leah",
    "linda", "lisa", "loretta", "maria", "melissa", "mildred", "nancy", "patricia", "rachel",
    "sandra", "shirley", "susan", "tiffany",
  ]);

  return likelyFemale.has(first) ? "F" : "M";
}

/** Days since lastContactDate (positive = days ago) */
export function daysSinceContact(dateStr: string): number {
  const parsed = new Date(dateStr).getTime();
  if (Number.isNaN(parsed)) return 0;
  const diff = Date.now() - parsed;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
