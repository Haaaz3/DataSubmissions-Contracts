export type HdiObligationId = "cms-team" | "vbc-contracts" | "mips-mvp" | "ma-stars" | "medicaid-vbp" | "hospital-quality" | "ambulatory-specialty-model";

export interface HdiWorkItem {
  id: string;
  title: string;
  practice: string;
  market: string;
  owner: string;
  dueInDays: number;
  impact: number;
  driver: string;
  qualityMeasureKey?: string;
  evidence: string;
  actionLabel: string;
  actionType: "Worklist" | "Review" | "Approval" | "Project";
}

export interface HdiObligation {
  id: HdiObligationId;
  title: string;
  shortTitle: string;
  sponsor: string;
  category: string;
  scope: string;
  lives: number;
  providers: number;
  atRiskDollars: number;
  recoverableDollars: number;
  deadline: string;
  forecast: { current: number; target: number; projected: number; unit: string };
  workItems: HdiWorkItem[];
}

export interface HdiCrossProgramOpportunity {
  id: string;
  title: string;
  thesis: string;
  relationship: "Shared measure family" | "Related opportunity" | "Evidence reuse";
  measureSet: string[];
  obligationIds: HdiObligationId[];
  sharedEvidence: string[];
  action: string;
  recoverableDollars: number;
  affectedLives: number;
}

export const hdiObligations: HdiObligation[] = [
  {
    id: "cms-team",
    title: "CMS TEAM Episode Performance",
    shortTitle: "CMS TEAM",
    sponsor: "CMS",
    category: "Episode-based payment",
    scope: "2 hospitals · 5 surgical episode categories",
    lives: 118000,
    providers: 820,
    atRiskDollars: 2750000,
    recoverableDollars: 1100000,
    deadline: "PY 2026 reconciliation",
    forecast: { current: 68, target: 82, projected: 74, unit: "CQS points (modeled)" },
    workItems: [
      { id: "team-readmit-1", title: "Close post-discharge follow-up gap", practice: "Northstar Medical Group", market: "Mid-Atlantic", owner: "Care Management", dueInDays: 12, impact: 460000, driver: "HWR · CMIT 356", qualityMeasureKey: "team-hwr-claims", evidence: "412 surgical discharges need transition review in the modeled roster. Follow-up is an intervention, not the HWR measure itself.", actionLabel: "Review patient worklist", actionType: "Worklist" },
      { id: "team-readmit-2", title: "Review inpatient safety events", practice: "Lakeside Physicians", market: "Mid-Atlantic", owner: "Quality Operations", dueInDays: 19, impact: 270000, driver: "CMS PSI 90 · CMIT 135", qualityMeasureKey: "team-psi90", evidence: "Review modeled inpatient safety flags and source documentation before hospital-level reporting.", actionLabel: "Assign review queue", actionType: "Review" },
      { id: "team-readmit-3", title: "Reconcile THA/TKA patient-reported outcomes", practice: "Summit Family Health", market: "Southeast", owner: "Medical Director", dueInDays: 27, impact: 200000, driver: "THA/TKA PRO-PM · CMIT 1618", qualityMeasureKey: "team-pro-2026", evidence: "Reconcile preoperative and postoperative outcome assessments for the applicable inpatient joint-replacement cohort.", actionLabel: "Open approval brief", actionType: "Approval" },
      { id: "team-readmit-4", title: "Launch high-risk discharge project", practice: "Riverbend Hospitalists", market: "Southeast", owner: "Transformation Office", dueInDays: 34, impact: 130000, driver: "High-risk discharge cohort", evidence: "Pilot roster is ready with 186 attributed patients and named owners.", actionLabel: "Create project brief", actionType: "Project" },
    ],
  },
  {
    id: "vbc-contracts",
    title: "Commercial VBC Contracts",
    shortTitle: "VBC CONTRACTS",
    sponsor: "Five payer partners",
    category: "Contract performance",
    scope: "14 contracts · 318,500 covered lives",
    lives: 318500,
    providers: 2104,
    atRiskDollars: 3120000,
    recoverableDollars: 1220000,
    deadline: "Dec 31, 2026",
    forecast: { current: 71, target: 79, projected: 76, unit: "% value capture" },
    workItems: [
      { id: "vbc-ed-1", title: "Review avoidable ED utilization", practice: "Northstar Medical Group", market: "Mid-Atlantic", owner: "Contracting", dueInDays: 21, impact: 680000, driver: "ED utilization", evidence: "PMPM is $18 above target in the rising-risk cohort.", actionLabel: "Open contract analysis", actionType: "Worklist" },
      { id: "vbc-ed-2", title: "Validate attributed member leakage", practice: "Lakeside Physicians", market: "Mid-Atlantic", owner: "Network Analytics", dueInDays: 45, impact: 260000, driver: "Attribution leakage", evidence: "2.4% of attributed lives have no in-network primary-care touchpoint.", actionLabel: "Review attribution", actionType: "Review" },
    ],
  },
  {
    id: "mips-mvp",
    title: "MIPS and MVP Reporting",
    shortTitle: "MIPS / MVP",
    sponsor: "CMS QPP",
    category: "Quality reporting",
    scope: "9 specialty groups · 812 eligible clinicians",
    lives: 246700,
    providers: 812,
    atRiskDollars: 1860000,
    recoverableDollars: 980000,
    deadline: "Mar 31, 2027",
    forecast: { current: 78, target: 85, projected: 83, unit: "MIPS points (modeled)" },
    workItems: [
      { id: "mips-evidence-1", title: "Complete eCQM evidence review", practice: "Summit Family Health", market: "Southeast", owner: "Quality Operations", dueInDays: 42, impact: 390000, driver: "Blood pressure control · QID 236", qualityMeasureKey: "qpp-236", evidence: "31% of denominator patients need a final evidence review.", actionLabel: "Open Data Submissions", actionType: "Worklist" },
      { id: "mips-evidence-2", title: "Confirm MVP subgroup roster", practice: "Riverbend Hospitalists", market: "Southeast", owner: "MIPS Program Lead", dueInDays: 58, impact: 190000, driver: "Subgroup registration", evidence: "Roster is 94% reconciled against the current TIN/NPI assignment.", actionLabel: "Review roster", actionType: "Review" },
    ],
  },
  {
    id: "ma-stars",
    title: "Medicare Advantage Stars",
    shortTitle: "MA STARS",
    sponsor: "Health plan partners",
    category: "Plan quality",
    scope: "4 plans · 92,400 attributed lives",
    lives: 92400,
    providers: 486,
    atRiskDollars: 920000,
    recoverableDollars: 280000,
    deadline: "Oct 15, 2026",
    forecast: { current: 84, target: 86, projected: 86, unit: "% measure attainment" },
    workItems: [
      { id: "stars-med-1", title: "Prioritize medication adherence outreach", practice: "Lakeside Physicians", market: "Mid-Atlantic", owner: "Pharmacy Programs", dueInDays: 23, impact: 160000, driver: "Diabetes medication adherence · D08", qualityMeasureKey: "stars-D08", evidence: "1,240 members are within the outreach window with no completed refill signal.", actionLabel: "Review outreach list", actionType: "Worklist" },
    ],
  },
  {
    id: "medicaid-vbp",
    title: "Medicaid State VBP",
    shortTitle: "MEDICAID VBP",
    sponsor: "State Medicaid agencies",
    category: "State program",
    scope: "3 state programs · 74,800 covered lives",
    lives: 74800,
    providers: 376,
    atRiskDollars: 1410000,
    recoverableDollars: 670000,
    deadline: "Nov 30, 2026",
    forecast: { current: 62, target: 75, projected: 70, unit: "% quality gate" },
    workItems: [
      { id: "medicaid-state-1", title: "Reconcile state measure definitions", practice: "Summit Family Health", market: "Southeast", owner: "State Programs", dueInDays: 16, impact: 330000, driver: "Depression screening · CDF-AD", qualityMeasureKey: "adult-CDF-AD", evidence: "Validate the published Adult Core Set definition before configuring a state-specific VBP requirement.", actionLabel: "Open reconciliation", actionType: "Review" },
    ],
  },
  {
    id: "hospital-quality",
    title: "Hospital Quality and QRDA",
    shortTitle: "HOSPITAL QUALITY",
    sponsor: "CMS Hospital Quality",
    category: "Hospital reporting",
    scope: "2 hospitals · 1,140 beds",
    lives: 0,
    providers: 934,
    atRiskDollars: 740000,
    recoverableDollars: 220000,
    deadline: "Feb 28, 2027",
    forecast: { current: 88, target: 90, projected: 90, unit: "% submission readiness" },
    workItems: [
      { id: "hqrda-1", title: "Validate inpatient hypoglycemia reporting", practice: "Riverbend Hospital", market: "Southeast", owner: "Hospital Quality", dueInDays: 31, impact: 140000, driver: "Severe hypoglycemia · CMS816v5", qualityMeasureKey: "hospital-hypoglycemia", evidence: "18 files need a final validation review before the next package generation.", actionLabel: "Open validation queue", actionType: "Worklist" },
    ],
  },
  {
    id: "ambulatory-specialty-model",
    title: "Ambulatory Specialty Model",
    shortTitle: "AMBULATORY SPECIALTY",
    sponsor: "CMS Innovation Center",
    category: "Mandatory specialty model · PY 2027 preparation",
    scope: "8 modeled practices · heart failure / low back pain",
    lives: 18400,
    providers: 164,
    atRiskDollars: 420000,
    recoverableDollars: 150000,
    deadline: "First performance year: Jan–Dec 2027",
    forecast: { current: 74, target: 80, projected: 77, unit: "% performance readiness" },
    workItems: [
      { id: "asm-follow-up-1", title: "Prepare heart-failure functional assessments", practice: "Northstar Specialty Network", market: "Mid-Atlantic", owner: "Ambulatory Operations", dueInDays: 29, impact: 110000, driver: "HF functional status · MIPS 377", qualityMeasureKey: "asm-377", evidence: "Prepare initial and follow-up assessment capture for the 2027 heart-failure cohort. Workload and dollars are modeled.", actionLabel: "Open preparation worklist", actionType: "Worklist" },
      { id: "asm-lbp-1", title: "Validate low-back-pain outcome collection", practice: "Northstar Specialty Network", market: "Mid-Atlantic", owner: "Specialty Quality", dueInDays: 45, impact: 40000, driver: "Low back functional status · MIPS 220", qualityMeasureKey: "asm-220", evidence: "Prepare the MIPS CQM collection workflow for functional status change in the 2027 low-back-pain cohort.", actionLabel: "Review collection workflow", actionType: "Review" },
    ],
  },
];

export const hdiCrossProgramOpportunities: HdiCrossProgramOpportunity[] = [
  {
    id: "transitions-readmissions",
    title: "Transitions of care",
    thesis: "Hospital readmission measures share discharge evidence; eligible populations, measurement periods and risk adjustment differ across TEAM, Hospital IQR and MA.",
    relationship: "Shared measure family",
    measureSet: [
      "TEAM HWR · CMIT 356",
      "MA Stars C18 · Plan All-Cause Readmissions",
      "Hospital IQR · Hybrid HWR",
    ],
    obligationIds: ["cms-team", "ma-stars", "hospital-quality"],
    sharedEvidence: ["Index discharge and episode type", "48-hour outreach", "Medication reconciliation", "30-day readmission outcome"],
    action: "Create one transition-of-care worklist with program-specific evidence views",
    recoverableDollars: 2240000,
    affectedLives: 1840,
  },
  {
    id: "medication-continuity",
    title: "Medication continuity",
    thesis: "Medication reconciliation after discharge and medication adherence are not the same measure, but they rely on overlapping pharmacy, care-management, and patient outreach workflows. Fixing the handoff creates lift across quality and contract performance.",
    relationship: "Related opportunity",
    measureSet: [
      "MIPS QID 130 · Documentation of Current Medications",
      "MA Stars C17 · Medication Reconciliation Post-Discharge",
      "MA Part D D08 / D09 / D10 · Medication adherence",
      "VBC · avoidable utilization and PMPM",
    ],
    obligationIds: ["vbc-contracts", "mips-mvp", "ma-stars", "cms-team"],
    sharedEvidence: ["Discharge medication list", "Refill or proportion-of-days-covered signal", "Pharmacist outreach", "Post-discharge encounter"],
    action: "Route the same high-risk medication cohort to pharmacy and care-transition owners",
    recoverableDollars: 1180000,
    affectedLives: 3120,
  },
  {
    id: "ed-follow-up",
    title: "Follow-up and referrals",
    thesis: "ED follow-up, hospital transitions and referral closure have different eligible events and timing rules. Coordinate the workflows while retaining each measure’s separate result.",
    relationship: "Related opportunity",
    measureSet: [
      "MA Stars C20 · Transitions of Care",
      "MIPS QID 374 · Closing the Referral Loop",
      "VBC · ED utilization and total cost of care",
      "Adult Core Set FUM-AD · Mental-health ED follow-up",
    ],
    obligationIds: ["vbc-contracts", "mips-mvp", "ma-stars", "medicaid-vbp"],
    sharedEvidence: ["ED visit", "High-risk condition", "7-day follow-up appointment", "Primary-care connection"],
    action: "Open a rising-risk ED cohort and assign follow-up by practice",
    recoverableDollars: 940000,
    affectedLives: 2680,
  },
  {
    id: "digital-evidence",
    title: "Evidence reuse",
    thesis: "The same clinical event and structured evidence can support MIPS/MVP, hospital quality, state programs, and payer contracts when the denominator, timing, and provenance are made explicit.",
    relationship: "Evidence reuse",
    measureSet: [
      "MIPS / MVP eCQM and CQM evidence",
      "Hospital QRDA / IQR submission evidence",
      "Medicaid state measure extracts",
      "VBC contract quality exhibits",
    ],
    obligationIds: ["mips-mvp", "hospital-quality", "medicaid-vbp", "vbc-contracts", "ambulatory-specialty-model"],
    sharedEvidence: ["Patient-level numerator / denominator", "Source system and timestamp", "Exception reason", "Submission-ready artifact"],
    action: "Resolve one evidence exception queue and publish program-specific outputs",
    recoverableDollars: 760000,
    affectedLives: 12100,
  },
];

export const hdiExecutiveMetrics = {
  obligations: 20,
  programs: hdiObligations.length,
  atRiskDollars: hdiObligations.reduce((sum, program) => sum + program.atRiskDollars, 0),
  recoverableDollars: hdiObligations.reduce((sum, program) => sum + program.recoverableDollars, 0),
  deadlinesIn30Days: hdiObligations.flatMap(program => program.workItems).filter(item => item.dueInDays <= 30).length,
  forecastCoverage: 86,
};
