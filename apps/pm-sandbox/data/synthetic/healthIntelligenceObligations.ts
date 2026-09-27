export type HdiObligationId = "cms-team" | "vbc-contracts" | "mips-mvp" | "ma-stars" | "medicaid-vbp" | "hospital-quality";

export interface HdiWorkItem {
  id: string;
  title: string;
  practice: string;
  market: string;
  owner: string;
  dueInDays: number;
  impact: number;
  driver: string;
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
    lives: 184200,
    providers: 1260,
    atRiskDollars: 4280000,
    recoverableDollars: 1960000,
    deadline: "PY 2026 reconciliation",
    forecast: { current: 68, target: 82, projected: 74, unit: "% quality score" },
    workItems: [
      { id: "team-readmit-1", title: "Close post-discharge follow-up gap", practice: "Northstar Medical Group", market: "Mid-Atlantic", owner: "Care Management", dueInDays: 12, impact: 740000, driver: "CHF readmissions", evidence: "412 discharges lack a documented 7-day follow-up appointment.", actionLabel: "Review patient worklist", actionType: "Worklist" },
      { id: "team-readmit-2", title: "Resolve medication reconciliation backlog", practice: "Lakeside Physicians", market: "Mid-Atlantic", owner: "Quality Operations", dueInDays: 19, impact: 420000, driver: "COPD readmissions", evidence: "Medication reconciliation is missing for 28% of high-risk discharges.", actionLabel: "Assign review queue", actionType: "Review" },
      { id: "team-readmit-3", title: "Approve transition-of-care protocol", practice: "Summit Family Health", market: "Southeast", owner: "Medical Director", dueInDays: 27, impact: 310000, driver: "All-cause readmissions", evidence: "A new protocol is modeled to reduce avoidable readmissions by 6.4%.", actionLabel: "Open approval brief", actionType: "Approval" },
      { id: "team-readmit-4", title: "Launch high-risk discharge project", practice: "Riverbend Hospitalists", market: "Southeast", owner: "Transformation Office", dueInDays: 34, impact: 210000, driver: "High-risk discharge cohort", evidence: "Pilot roster is ready with 186 attributed patients and named owners.", actionLabel: "Create project brief", actionType: "Project" },
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
    forecast: { current: 78, target: 85, projected: 83, unit: "% projected score" },
    workItems: [
      { id: "mips-evidence-1", title: "Complete eCQM evidence review", practice: "Summit Family Health", market: "Southeast", owner: "Quality Operations", dueInDays: 42, impact: 390000, driver: "eCQM evidence", evidence: "31% of denominator patients need a final evidence review.", actionLabel: "Open Data Submissions", actionType: "Worklist" },
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
      { id: "stars-med-1", title: "Prioritize medication adherence outreach", practice: "Lakeside Physicians", market: "Mid-Atlantic", owner: "Pharmacy Programs", dueInDays: 23, impact: 160000, driver: "Medication adherence", evidence: "1,240 members are within the outreach window with no completed refill signal.", actionLabel: "Review outreach list", actionType: "Worklist" },
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
      { id: "medicaid-state-1", title: "Reconcile state measure definitions", practice: "Summit Family Health", market: "Southeast", owner: "State Programs", dueInDays: 16, impact: 330000, driver: "Measure definition", evidence: "Two state extracts use different denominator exclusions for prenatal care.", actionLabel: "Open reconciliation", actionType: "Review" },
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
      { id: "hqrda-1", title: "Clear emergency department validation queue", practice: "Riverbend Hospital", market: "Southeast", owner: "Hospital Quality", dueInDays: 31, impact: 140000, driver: "QRDA validation", evidence: "18 files need a final validation review before the next package generation.", actionLabel: "Open validation queue", actionType: "Worklist" },
    ],
  },
];

export const hdiCrossProgramOpportunities: HdiCrossProgramOpportunity[] = [
  {
    id: "transitions-readmissions",
    title: "Transitions of care",
    thesis: "The same discharge cohort is being measured through different program lenses. A coordinated follow-up and medication-reconciliation workflow can improve the shared readmission outcome family without creating four separate queues.",
    relationship: "Shared measure family",
    measureSet: [
      "TEAM HWR · CMIT 356",
      "MIPS / ACO readmission measures",
      "MA Plan All-Cause Readmissions",
      "Hospital IQR HWR",
    ],
    obligationIds: ["cms-team", "mips-mvp", "ma-stars", "hospital-quality"],
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
      "MIPS QID 46 · Medication Reconciliation Post-Discharge",
      "MA Stars · Medication Reconciliation Post-Discharge",
      "MA Part D · Diabetes / hypertension / statin adherence",
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
    title: "ED follow-up",
    thesis: "Avoidable ED use, timely follow-up, and chronic-condition management are measured separately, but the intervention is shared: identify the rising-risk patient, close the appointment loop, and return the outcome to both the contract and quality forecast.",
    relationship: "Related opportunity",
    measureSet: [
      "MA Stars · follow-up after ED visit for high-risk chronic conditions",
      "MIPS / MVP · care coordination and chronic-condition measures",
      "VBC · ED utilization and total cost of care",
      "Medicaid VBP · access and follow-up measures",
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
    obligationIds: ["mips-mvp", "hospital-quality", "medicaid-vbp", "vbc-contracts"],
    sharedEvidence: ["Patient-level numerator / denominator", "Source system and timestamp", "Exception reason", "Submission-ready artifact"],
    action: "Resolve one evidence exception queue and publish program-specific outputs",
    recoverableDollars: 760000,
    affectedLives: 12100,
  },
];

export const hdiExecutiveMetrics = {
  obligations: 18,
  programs: 6,
  atRiskDollars: 12330000,
  recoverableDollars: 5330000,
  deadlinesIn30Days: 7,
  forecastCoverage: 86,
};
