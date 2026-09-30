import type { HdiObligationId } from "./healthIntelligenceObligations";

export type MeasureDefinition = {
  id: string;
  name: string;
  standard: "HEDIS" | "eCQM";
  year: number;
  method: string;
  population: string;
  outcome: string;
  direction: "Higher is better" | "Lower is better";
  source: string;
};

export type MeasureObligation = {
  id: string;
  programId: HdiObligationId;
  label: string;
  definitionId: string;
  contractId?: string;
};

export type SharedMeasureFamily = {
  id: string;
  name: string;
  focus: string;
  definitions: [MeasureDefinition, MeasureDefinition];
  obligations: MeasureObligation[];
  reuse: string;
  review: string;
  nextAction: string;
};

const ncqa = "https://www.ncqa.org/report-cards/health-plans/state-of-health-care-quality-report/";
const ecqi = "https://ecqi.healthit.gov/ecqm/ec/2026/";

// Illustrative adoption within this prototype, not a payer or CMS requirement catalog.
// Separate definitions intentionally prevent HEDIS and eCQM results being merged.
function exampleObligations(hedisId: string, ecqmId: string): MeasureObligation[] {
  return [
    { id: "aetna-commercial", programId: "vbc-contracts", label: "Aetna Commercial ACO — Large Employer", definitionId: hedisId, contractId: "comm-001" },
    { id: "united-commercial", programId: "vbc-contracts", label: "United Commercial Value — Mid-Market", definitionId: hedisId, contractId: "comm-002" },
    { id: "ma-quality", programId: "ma-stars", label: "Medicare Advantage quality obligation", definitionId: hedisId },
    { id: "medicaid-quality", programId: "medicaid-vbp", label: "Medicaid VBP quality obligation", definitionId: hedisId },
    { id: "mips-ecqm", programId: "mips-mvp", label: "MIPS clinician reporting — eCQM collection", definitionId: ecqmId },
  ];
}

export const sharedMeasureFamilies: SharedMeasureFamily[] = [
  {
    id: "blood-pressure", name: "Blood pressure control", focus: "Controlled BP below 140/90 mmHg",
    definitions: [
      { id: "CBP", name: "Controlling High Blood Pressure", standard: "HEDIS", year: 2026, method: "Plan reporting; method must be confirmed", population: "Ages 18–85 with hypertension; apply the plan enrollment and eligibility rules.", outcome: "Blood pressure below 140/90 mmHg during the measurement year.", direction: "Higher is better", source: ncqa + "controlling-high-blood-pressure-cbp/" },
      { id: "CMS165v14", name: "Controlling High Blood Pressure", standard: "eCQM", year: 2026, method: "Electronic clinical quality measure", population: "Ages 18–85; qualifying visit and hypertension beginning before or within the first six months of the year.", outcome: "Most recent qualifying BP below 140/90 mmHg.", direction: "Higher is better", source: ecqi + "cms0165v14" },
    ],
    obligations: exampleObligations("CBP", "CMS165v14"),
    reuse: "Dated systolic and diastolic readings, encounter context and hypertension diagnoses.",
    review: "Same clinical threshold, different eligibility and collection rules. Confirm the applicable HEDIS method, qualifying encounters, reading selection and exclusions. CBP and BPC-E are separate measures.",
    nextAction: "Reconcile missing or unstructured BP readings before arranging repeat measurement.",
  },
  {
    id: "glycemic-status", name: "Diabetes glycemic status", focus: "Poor control above 9% · lower rate is better",
    definitions: [
      { id: "GSD >9%", name: "Glycemic Status Assessment for Patients With Diabetes", standard: "HEDIS", year: 2026, method: "Plan reporting; method must be confirmed", population: "Ages 18–75 with diabetes; apply the plan enrollment and eligibility rules.", outcome: "The greater-than-9% rate. GSD also has a separate less-than-8% rate; do not combine them.", direction: "Lower is better", source: ncqa + "glycemic-status-assessment-for-patients-with-diabetes-gsd/" },
      { id: "CMS122v14", name: "Diabetes: Glycemic Status Assessment Greater Than 9%", standard: "eCQM", year: 2026, method: "Electronic clinical quality measure", population: "Ages 18–75 with diabetes and a qualifying visit during the year.", outcome: "Most recent HbA1c or GMI above 9%, or a missing assessment/result, contributes to the poor-control numerator.", direction: "Lower is better", source: ecqi + "cms0122v14" },
    ],
    obligations: exampleObligations("GSD >9%", "CMS122v14"),
    reuse: "Dated HbA1c / glucose management indicator (GMI) values and source results.",
    review: "Compare the GSD >9% rate with CMS122, not the GSD <8% rate. Recheck diabetes eligibility, exclusions and missing-result handling for each specification.",
    nextAction: "Separate missing lab evidence from documented poor control so the follow-up goes to the right team.",
  },
  {
    id: "colorectal-screening", name: "Colorectal cancer screening", focus: "Appropriate screening within the test-specific interval",
    definitions: [
      { id: "COL-E", name: "Colorectal Cancer Screening", standard: "HEDIS", year: 2026, method: "Electronic Clinical Data Systems (ECDS)", population: "Screening concept covers ages 45–75; verify the specification’s age anchor and enrollment rules.", outcome: "Appropriate colorectal screening; the lookback depends on the test used.", direction: "Higher is better", source: ncqa + "colorectal-cancer-screening-col/" },
      { id: "CMS130v14", name: "Colorectal Cancer Screening", standard: "eCQM", year: 2026, method: "Electronic clinical quality measure", population: "Initial population: ages 46–75 at year-end, with a qualifying visit.", outcome: "Qualifying screening in the specified interval: for example, annual stool blood testing or colonoscopy within 10 years.", direction: "Higher is better", source: ecqi + "cms0130v14" },
    ],
    obligations: exampleObligations("COL-E", "CMS130v14"),
    reuse: "Screening type, completion date, procedure report and external results.",
    review: "The familiar 45–75 screening description is not the eCQM’s year-end age test. Confirm age anchors, accepted tests, lookbacks, enrollment and exclusions before sharing a result.",
    nextAction: "Reconcile external screening records and test dates before creating new outreach.",
  },
  {
    id: "breast-screening", name: "Breast cancer screening", focus: "Mammography evidence within the reporting window",
    definitions: [
      { id: "BCS-E", name: "Breast Cancer Screening", standard: "HEDIS", year: 2026, method: "Electronic Clinical Data Systems (ECDS)", population: "Screening concept covers persons ages 40–74 recommended for routine screening; confirm detailed eligibility.", outcome: "A qualifying mammogram within the applicable screening window.", direction: "Higher is better", source: ncqa + "breast-cancer-screening-bcs-e/" },
      { id: "CMS125v14", name: "Breast Cancer Screening", standard: "eCQM", year: 2026, method: "Electronic clinical quality measure", population: "Initial population: women ages 42–74 at year-end, with a qualifying visit.", outcome: "Qualifying mammography within the measure window; ultrasound and MRI do not substitute for mammography.", direction: "Higher is better", source: ecqi + "cms0125v14" },
    ],
    obligations: exampleObligations("BCS-E", "CMS125v14"),
    reuse: "Mammogram completion date, modality and the imaging report.",
    review: "Check age anchors and sex/gender eligibility as well as enrollment, the screening window and mastectomy exclusions. Similar names do not guarantee the same denominator.",
    nextAction: "Retrieve completed mammography reports before assigning screening outreach.",
  },
];
