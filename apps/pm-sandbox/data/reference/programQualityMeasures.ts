import type { HdiObligationId } from "../synthetic/healthIntelligenceObligations";

// Published definitions only. No prototype rates, targets or financial allocations.
export type PublishedMeasure = {
  key: string; id: string; name: string; group: string; collection: string;
  period: string; applicability: string; source: string; from: number; through?: number;
  note?: string; pending?: boolean; familyId?: string;
};
export type ProgramMeasureCatalog = {
  years: number[]; yearLabel: string; coverage: string; note: string; source: string;
  measures: PublishedMeasure[];
};
export const measuresVerifiedOn = "2026-09-30";
export const measureSources = {
  team: "https://www.cms.gov/files/document/team-intro-qm-fs.pdf",
  teamScoring: "https://www.cms.gov/files/document/team-qualityscoring-fs.pdf",
  asm: "https://www.cms.gov/priorities/innovation/files/asm-perf-cat-tech-fs.pdf",
  qpp: "https://www.cms.gov/files/document/2026-eligible-clinician-measures-table-v2.pdf",
  stars: "https://www.cms.gov/files/document/2026-star-ratings-technical-notes.pdf",
  medicaid: "https://www.medicaid.gov/medicaid/quality-of-care/downloads/2026-adult-core-set.pdf",
  hybrid: "https://www.cms.gov/files/document/2026-hospital-ip-hybrid-measures-table.pdf",
};
const teamMeasure = (key: string, id: string, name: string, collection: string, period: string, applicability: string, from: number, through?: number): PublishedMeasure => ({ key, id: `CMIT ${id}`, name, collection, period, applicability, from, through, group: "TEAM", source: measureSources.team });
const teamMeasures: PublishedMeasure[] = [
  teamMeasure("team-hwr-claims", "356", "Hospital-Wide All-Cause Readmission Measure with Claims Data Only (HWR)", "Claims · Hospital IQR", "Jul 1, 2024–Jun 30, 2025", "All inpatient episode categories", 2026, 2026),
  teamMeasure("team-psi90", "135", "CMS Patient Safety and Adverse Events Composite (CMS PSI 90)", "Claims · HAC Reduction Program", "Jul 1, 2023–Jun 30, 2025", "All inpatient episode categories", 2026, 2026),
  teamMeasure("team-pro-2026", "1618", "Hospital-Level Total Hip and/or Total Knee Arthroplasty Patient-Reported Outcome-Based Performance Measure (THA/TKA PRO-PM)", "Patient-reported outcomes · Hospital IQR", "Jul 1, 2024–Jun 30, 2025", "Inpatient lower extremity joint replacement", 2026, 2026),
  ...[2027, 2028].flatMap(year => [
    teamMeasure(`team-hwr-${year}`, "356", "Hybrid Hospital-Wide All-Cause Readmission Measure with Claims and Electronic Health Record Data (HWR)", "Claims + EHR · Hospital IQR", `Jul 1, ${year - 2}–Jun 30, ${year - 1}`, "All inpatient episode categories", year, year),
    teamMeasure(`team-pro-${year}`, "1618", "Hospital-Level Total Hip and/or Total Knee Arthroplasty Patient-Reported Outcome-Based Performance Measure (THA/TKA PRO-PM)", "Patient-reported outcomes · Hospital IQR", `Jul 1, ${year - 2}–Jun 30, ${year - 1}`, "Inpatient lower extremity joint replacement", year, year),
  ]),
  teamMeasure("team-ftr", "134", "Thirty-day Risk-Standardized Death Rate among Surgical Inpatients with Complications (Failure-to-Rescue)", "Hospital IQR", "TBD in CMS fact sheet", "All inpatient episode categories", 2027),
  teamMeasure("team-falls", "1518", "Hospital Harm – Falls with Injury", "eCQM · Hospital IQR", "TBD in CMS fact sheet", "All inpatient episode categories", 2027),
  teamMeasure("team-respiratory", "1788", "Hospital Harm – Postoperative Respiratory Failure", "eCQM · Hospital IQR", "TBD in CMS fact sheet", "All inpatient episode categories", 2027),
  teamMeasure("team-information", "1797", "Patient Understanding of Key Information Related to Recovery After a Hospital-Based Outpatient Procedure or Surgery PRO-PM (Information Transfer PRO-PM)", "Patient-reported outcomes · Hospital OQR", "TBD in CMS fact sheet", "All outpatient episode categories", 2028),
];
const asmMeasure = (id: string, name: string, group: string, collection: string, note?: string, familyId?: string): PublishedMeasure => ({ key: `asm-${id}`, id: `MIPS ${id}`, name, group, collection, period: "PY 2027 · per measure specification", applicability: `${group} cohort`, source: measureSources.asm, from: 2027, note, familyId });
const asmMeasures = [
  asmMeasure("492", "Risk-Standardized Acute Unplanned Cardiovascular-Related Admission Rates for Patients with Heart Failure (Modified for ASM)", "Heart failure", "Administrative claims · CMS calculated", "ASM modification; do not substitute the unmodified MIPS result."),
  asmMeasure("008", "Heart Failure: Beta-Blocker Therapy for Left Ventricular Systolic Dysfunction (LVSD)", "Heart failure", "MIPS CQM or eCQM"),
  asmMeasure("005", "Heart Failure: ACE Inhibitor or ARB or ARNI Therapy for LVSD", "Heart failure", "MIPS CQM or eCQM"),
  asmMeasure("236", "Controlling High Blood Pressure", "Heart failure", "MIPS CQM or eCQM", "Apply ASM cohort and collection-specific specifications.", "blood-pressure"),
  asmMeasure("377", "Functional Status Assessments for Heart Failure", "Heart failure", "eCQM"),
  asmMeasure("238", "Use of High-Risk Medications in Older Adults", "Low back pain", "MIPS CQM or eCQM"),
  asmMeasure("134", "Preventive Care and Screening: Screening for Depression and Follow-Up Plan", "Low back pain", "MIPS CQM or eCQM"),
  asmMeasure("128", "Preventive Care and Screening: BMI Screening and Follow-Up Plan", "Low back pain", "MIPS CQM or eCQM"),
  asmMeasure("220", "Functional Status Change for Patients with Low Back Impairment", "Low back pain", "MIPS CQM"),
  { key: "asm-excess-utilization", id: "TBD", name: "Excess Utilization Measure", group: "Low back pain", collection: "Administrative claims", period: "Not finalized", applicability: "Low back pain cohort", source: measureSources.asm, from: 2027, pending: true, note: "CMS fact sheet: to be proposed in CY 2027 rulemaking. Excluded from the published-measure count." },
];
const qppRows = [
  ["236", "CMS165v14", "Controlling High Blood Pressure", "blood-pressure"],
  ["001", "CMS122v14", "Diabetes: Glycemic Status Assessment Greater Than 9%", "glycemic-status"],
  ["113", "CMS130v14", "Colorectal Cancer Screening", "colorectal-screening"],
  ["112", "CMS125v14", "Breast Cancer Screening", "breast-screening"],
  ["134", "CMS2v15", "Preventive Care and Screening: Screening for Depression and Follow-Up Plan"],
  ["128", "CMS69v14", "Preventive Care and Screening: Body Mass Index (BMI) Screening and Follow-Up Plan"],
  ["377", "CMS90v15", "Functional Status Assessments for Heart Failure"],
  ["130", "CMS68v15", "Documentation of Current Medications in the Medical Record"],
  ["374", "CMS50v14", "Closing the Referral Loop: Receipt of Specialist Report"],
];
const qppMeasures: PublishedMeasure[] = qppRows.map(([id, ecqm, name, familyId]) => ({ key: `qpp-${id}`, id: `QID ${id} · ${ecqm}`, name, familyId, group: "Selected eCQMs", collection: "eCQM", period: "Performance year 2026", applicability: "Selected reporting set; verify MVP membership", source: measureSources.qpp, from: 2026 }));
const starRows = [
  ["C01", "Breast Cancer Screening", "breast-screening"],
  ["C02", "Colorectal Cancer Screening", "colorectal-screening"],
  ["C12", "Diabetes Care – Blood Sugar Controlled"],
  ["C14", "Controlling Blood Pressure", "blood-pressure"],
  ["C17", "Medication Reconciliation Post-Discharge"],
  ["C18", "Plan All-Cause Readmissions"],
  ["C20", "Transitions of Care"],
  ["D08", "Medication Adherence for Diabetes Medications"],
  ["D09", "Medication Adherence for Hypertension (RAS antagonists)"],
  ["D10", "Medication Adherence for Cholesterol (Statins)"],
];
const starMeasures: PublishedMeasure[] = starRows.map(([id, name, familyId]) => ({ key: `stars-${id}`, id, name, familyId, group: id.startsWith("C") ? "Part C" : "Part D", collection: id.startsWith("C") ? "HEDIS" : "Prescription Drug Event data", period: "2026 rating · 2024 measurement data", applicability: id.startsWith("C") ? "Applicable MA plan contracts" : "MA-PD / PDP contracts", source: measureSources.stars, from: 2026, note: id === "C12" ? "Controlled-rate measure; the prototype’s GSD >9% poor-control rate is not the Stars result." : undefined }));
const adultRows = [
  ["CBP-AD", "Controlling High Blood Pressure", "Voluntary", "Administrative, hybrid or EHR", "blood-pressure"],
  ["GSD-AD", "Glycemic Status Assessment for Patients with Diabetes", "Voluntary", "Administrative or hybrid", "glycemic-status"],
  ["COL-AD", "Colorectal Cancer Screening", "Voluntary", "ECDS or EHR", "colorectal-screening"],
  ["BCS-AD", "Breast Cancer Screening", "Voluntary", "ECDS or EHR", "breast-screening"],
  ["CDF-AD", "Screening for Depression and Follow-Up Plan: Age 18 and Older", "Mandatory", "Administrative or EHR"],
  ["FUM-AD", "Follow-Up After Emergency Department Visit for Mental Illness: Age 18 and Older", "Mandatory", "Administrative"],
  ["FUH-AD", "Follow-Up After Hospitalization for Mental Illness: Age 18 and Older", "Mandatory", "Administrative"],
];
const adultMeasures: PublishedMeasure[] = adultRows.map(([id, name, group, collection, familyId]) => ({ key: `adult-${id}`, id, name, familyId, group: `${group} state Core Set reporting`, collection, period: "2026 reporting · generally CY 2025 data", applicability: "State Adult Core Set; not a state VBP contract mandate", source: measureSources.medicaid, from: 2026 }));
const hospitalMeasures: PublishedMeasure[] = [
  { key: "hospital-hwr", id: "CMIT 356 · CMS529v6 core data", name: "Hybrid Hospital-Wide All-Cause Readmission Measure", group: "Hospital IQR", collection: "Claims + EHR", period: "2026 reporting specification", applicability: "Eligible hospital population", source: measureSources.hybrid, from: 2026, note: "CMS529v6 extracts core clinical data; it does not calculate a standalone eCQM rate. TEAM PY1 uses claims only." },
  { ...teamMeasures[1], key: "hospital-psi90", group: "HAC Reduction Program", period: "Use the applicable HAC reporting period", applicability: "Eligible hospital population" },
  { ...teamMeasures[2], key: "hospital-pro", group: "Hospital IQR", period: "Use the applicable IQR cohort period", applicability: "Eligible THA/TKA population" },
  { key: "hospital-hypoglycemia", id: "CMS816v5", name: "Hospital Harm – Severe Hypoglycemia", group: "Hospital IQR", collection: "eCQM", period: "2026 reporting", applicability: "Qualifying inpatient hospitalizations", source: "https://ecqi.healthit.gov/ecqm/hosp-inpt/2026/cms0816v5", from: 2026 },
];

export const programMeasureCatalogs: Record<HdiObligationId, ProgramMeasureCatalog> = {
  "cms-team": { years: [2026, 2027, 2028], yearLabel: "Performance year", coverage: "Published TEAM set", note: "Hospital measures feed the TEAM composite quality score. Episode applicability and source measurement periods differ. Later-year periods marked TBD remain unresolved in the CMS fact sheet.", source: measureSources.team, measures: teamMeasures },
  "ambulatory-specialty-model": { years: [2027], yearLabel: "Performance year", coverage: "Published ASM set", note: "First performance year: 2027. Report the measures for the assigned heart-failure or low-back-pain cohort. Claims measures are calculated by CMS; the excess-utilization measure remains pending.", source: measureSources.asm, measures: asmMeasures },
  "mips-mvp": { years: [2026], yearLabel: "Performance year", coverage: "Selected published measures", note: "Selected 2026 eCQMs, not the full QPP inventory or a universal MVP set. Confirm the registered pathway and collection type. Shared clinical concepts do not imply identical specifications.", source: measureSources.qpp, measures: qppMeasures },
  "ma-stars": { years: [2026], yearLabel: "Rating year", coverage: "Selected published measures", note: "Rating year differs from measurement year. These 2026 Stars examples use 2024 data. Applicability and thresholds depend on the plan contract and rating methodology.", source: measureSources.stars, measures: starMeasures },
  "medicaid-vbp": { years: [2026], yearLabel: "Reporting year", coverage: "Selected Adult Core Set measures", note: "Federal Core Set reporting is not a substitute for a state VBP contract. No state or contract is selected here; state-specific VBP obligations remain unconfigured.", source: measureSources.medicaid, measures: adultMeasures },
  "hospital-quality": { years: [2026], yearLabel: "Reporting year", coverage: "Selected published measures", note: "Hospital IQR and HAC Reduction are separate programs. QRDA is a reporting format, not a quality measure. This is a selected inventory, not the complete hospital reporting set.", source: measureSources.hybrid, measures: hospitalMeasures },
  "vbc-contracts": { years: [2026], yearLabel: "Contract year", coverage: "Contract-defined", note: "Commercial requirements depend on the executed contract and quality exhibit. No universal CMS measure set applies.", source: "", measures: [] },
};
export function publishedMeasuresFor(program: HdiObligationId, year: number) {
  const catalog = programMeasureCatalogs[program];
  if (!catalog.years.includes(year)) return [];
  return catalog.measures.filter(measure => measure.from <= year && (measure.through === undefined || measure.through >= year));
}
