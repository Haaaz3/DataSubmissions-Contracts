const state = {
  program: "MIPS",
  route: "performance",
  selectedOrg: null,
  selectedSubmission: null,
  selectedSubmissionScope: null,
  selectedIndividualGroup: "",
  selectedIndividualClinician: "",
  scoreTab: "Summary",
  labMode: "vision",
  scenario: "mvp-zmvp4",
  labStep: 0,
  mvpSpecialty: null,
  mvpSpecialties: null,
  practiceComposition: "multi",
  visionRoute: "home",
  visionStrategyTab: "recommended",
  visionPerformanceTab: "trending-quality",
  visionValidationTab: "patient-level",
  visionSubmissionTab: "package",
  visionEvidenceTab: "evaluation",
  selectedValidationMeasure: "cms349",
  selectedValidationPatient: "HY-10482",
  patientValidationSearch: "",
  patientValidationFilter: "all",
  patientValidationSort: "changed-first",
  patientValidationRound: "current",
  qualityTargets: {
    cms349: 85,
    cms2: 85,
    cms153: 85,
    cms165: 85,
    cms130: 85,
    cms122: 85,
  },
  visionStrategyLocked: false,
  visionStrategyEditMode: false,
  visionSubgroupSelections: {
    "infectious-disease": true,
    "mental-health": true,
    "womens-health": true,
    "heart-disease": false,
  },
  selectedVisionStrategy: "mvp-specialty-subgroups",
  selectedVisionSubgroup: "infectious-disease",
};

const defaultScenarioByProgram = {
  MIPS: "mips-performance",
  MVP: "mvp-zmvp4",
  APPPLUS: "appplus-score",
  QRDA: "qrda-export",
};

const programOrder = ["MVP", "APPPLUS", "QRDA", "MIPS"];

const scenarioDefinitions = {
  "mvp-zmvp4": {
    label: "MVP ZzMVP4 Score Details",
    program: "MVP",
    route: "performance-detail",
    selectedOrg: "ZzMVP4",
    goal: "Inspect an MVP subgroup scorecard, confirm measure details, and export results.",
    signal: "Can a user get from customer context to the correct MVP subgroup without losing program/year context?",
  },
  "appplus-score": {
    label: "APP Plus APM Entity Score",
    program: "APPPLUS",
    route: "performance-detail",
    selectedOrg: "CCPM Community Care Partnership of Maine",
    goal: "Review APP Plus APM Entity quality performance and export score data.",
    signal: "Can APP Plus feel like one micro-app among peers while still showing APM-specific scope?",
  },
  "mips-performance": {
    label: "MIPS Customer Performance",
    program: "MIPS",
    route: "performance",
    selectedOrg: null,
    goal: "Check customer-level MIPS performance and provider count.",
    signal: "Can the user understand they are looking at one customer across submission pathways?",
  },
  "mvp-individual": {
    label: "MVP Individual Submission Search",
    program: "MVP",
    route: "submissions-Individual",
    selectedOrg: null,
    goal: "Find individual MVP submissions using subgroup and eligible clinician filters.",
    signal: "Can required filters and disabled dependent fields be understood quickly?",
  },
  "qrda-export": {
    label: "QRDA Export Package",
    program: "QRDA",
    route: "export-qrda",
    selectedOrg: null,
    goal: "Generate a QRDA I or QRDA III package for the selected program and scope.",
    signal: "Can QRDA be treated as a submission pathway rather than a disconnected utility?",
  },
  "new-submission": {
    label: "Create Submission Draft",
    program: "MVP",
    route: "new-submission",
    selectedOrg: "ZzMVP4",
    goal: "Create a pathway-specific draft submission and understand what supplemental data is missing.",
    signal: "Can draft creation expose Quality, PI, IA, and package readiness without extra navigation?",
  },
};

const customerProfiles = {
  zmdi: {
    name: "Hyperion Health System",
    reportingYear: "PY 2026",
    strategy: "Show legacy as disabled",
    activeSummary: "MVP Submission + APP Plus + QRDA",
    inactiveNote: "Traditional MIPS remains visible only as transition context.",
    programs: {
      MVP: { status: "active", label: "MVP Submission", note: "4 MVP subgroups" },
      APPPLUS: { status: "active", label: "Active", note: "APP Plus score review" },
      QRDA: { status: "active", label: "Active", note: "QRDA package generation" },
      MIPS: { status: "legacy", label: "Transition only", note: "Legacy scorecard available for customer context" },
    },
  },
  ccpm: {
    name: "CCPM Community Care Partnership of Maine",
    reportingYear: "PY 2026",
    strategy: "Hide retired paths, disable unused paths",
    activeSummary: "MVP Submission + APP Plus + QRDA",
    inactiveNote: "Traditional MIPS is removed from the top-line customer workspace unless needed for transition context.",
    programs: {
      MVP: { status: "active", label: "MVP Submission", note: "MVP submission workflow visible" },
      APPPLUS: { status: "active", label: "Primary", note: "1 APM Entity" },
      QRDA: { status: "active", label: "Active", note: "QRDA III package support" },
      MIPS: { status: "hidden", label: "Retired", note: "Hidden from this customer experience" },
    },
  },
};

const measureInventoryProfiles = {
  zmdi: {
    id: "zmdi",
    customerName: "Hyperion Health System",
    ownerType: "EC + APM-ready",
    period: "PY 2026",
    lastRefresh: "2026-07-15",
    summary: "One customer-level enabled measure inventory drives the in-app routing. EC measures support MVP, transition MIPS review, and QRDA export; some enabled measures remain analytics-only until the customer selects them for a submission.",
    measures: [
      { id: "CMS153v14", name: "Chlamydia Screening in Women", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Women's Health", programs: ["MVP", "MIPS", "QRDA"], status: "Submission selected" },
      { id: "CMS349v8", name: "HIV Screening", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Infectious Disease", programs: ["MVP", "MIPS", "QRDA"], status: "Submission selected" },
      { id: "CMS2v15", name: "Preventive Care and Screening: Screening for Depression and Follow-Up Plan", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Mental Health", programs: ["MVP", "MIPS", "QRDA"], status: "Submission selected" },
      { id: "CMS130v14", name: "Colorectal Cancer Screening", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Primary Care", programs: ["MVP", "MIPS", "QRDA"], status: "Submission selected" },
      { id: "CMS122v14", name: "Diabetes: Hemoglobin A1c Poor Control", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Primary Care", programs: [], status: "Enabled, not submission selected" },
    ],
  },
  ambulatory: {
    id: "ambulatory",
    customerName: "Oracle-demo Ambulatory Group",
    ownerType: "EC only",
    period: "PY 2026",
    lastRefresh: "2026-07-15",
    summary: "This customer has one enabled clinician measure inventory. MVP Submission is the recommended future path; Traditional MIPS is shown only as transition context.",
    measures: [
      { id: "CMS145v14", name: "CAD: Beta-Blocker Therapy", type: "CQM", owner: "EC", scope: "Eligible clinician", specialty: "Cardiology", programs: ["MVP", "MIPS", "QRDA"], status: "Submission selected" },
      { id: "CMS165v14", name: "Controlling High Blood Pressure", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Primary Care", programs: ["MVP", "MIPS", "QRDA"], status: "Submission selected" },
      { id: "CMS125v14", name: "Breast Cancer Screening", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Primary Care", programs: ["MVP", "MIPS", "QRDA"], status: "Submission selected" },
      { id: "CMS69v14", name: "BMI Screening and Follow-Up", type: "CQM", owner: "EC", scope: "Eligible clinician", specialty: "Primary Care", programs: ["MIPS"], status: "Enabled for transition review" },
      { id: "CMS138v14", name: "Preventive Care and Screening: Tobacco Use", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Primary Care", programs: [], status: "Enabled, not submission selected" },
    ],
  },
  appplus: {
    id: "appplus",
    customerName: "CCPM Community Care Partnership of Maine",
    ownerType: "APM Entity + EC",
    period: "PY 2026",
    lastRefresh: "2026-06-22",
    summary: "The customer-level inventory includes APM Entity CQMs and EC measures. APP Plus is primary, MVP remains visible for specialty cohort planning, and QRDA supports supported export packages.",
    measures: [
      { id: "112", name: "Breast Cancer Screening", type: "CQM", owner: "APM", scope: "APM Entity", specialty: "Primary Care", programs: ["APPPLUS", "QRDA"], status: "Submission selected" },
      { id: "113", name: "Colorectal Cancer Screening", type: "CQM", owner: "APM", scope: "APM Entity", specialty: "Primary Care", programs: ["APPPLUS", "QRDA"], status: "Submission selected" },
      { id: "236", name: "Controlling High Blood Pressure", type: "CQM", owner: "APM", scope: "APM Entity", specialty: "Primary Care", programs: ["APPPLUS", "QRDA"], status: "Submission selected" },
      { id: "001", name: "Diabetes: Glycemic Status Assessment Greater Than 9%", type: "CQM", owner: "APM", scope: "APM Entity", specialty: "Endocrinology", programs: ["APPPLUS", "QRDA"], status: "Submission selected" },
      { id: "CMS2v15", name: "Screening for Depression and Follow-Up Plan", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Mental Health", programs: ["MVP", "MIPS", "QRDA"], status: "Submission selected" },
      { id: "CMS68v14", name: "Documentation of Current Medications", type: "eCQM", owner: "EC", scope: "Eligible clinician", specialty: "Primary Care", programs: [], status: "Enabled, not submission selected" },
    ],
  },
};

const smartRecommendations = [
  {
    tin: "428739421",
    name: "National Capital Nephrology",
    pathway: "MVP",
    providers: 31,
    projectedScore: "97.28",
    status: "Ready",
    reviewSignal: "Moderate uplift",
    action: "Register",
  },
  {
    tin: "412888813",
    name: "ZzMidwest Heart Institute LLC",
    pathway: "MVP",
    providers: 373,
    projectedScore: "95.4",
    status: "Not Registered",
    reviewSignal: "Moderate risk",
    action: "Details",
  },
  {
    tin: "561299822",
    name: "Roadstar Oncology Affiliates of MN",
    pathway: "MVP",
    providers: 8,
    projectedScore: "94.98",
    status: "Not Registered",
    reviewSignal: "Low uplift",
    action: "Details",
  },
  {
    tin: "451490506",
    name: "WHC Physician Group, LLC",
    pathway: "Subgroup",
    providers: 528,
    projectedScore: "93.78",
    status: "Ready",
    reviewSignal: "High uplift",
    action: "Register",
  },
  {
    tin: "948720138",
    name: "Metroneal Associates",
    pathway: "APP Plus",
    providers: 13,
    projectedScore: "93.5",
    status: "Ready",
    reviewSignal: "Low uplift",
    action: "Details",
  },
];

const mvpCatalogRows = [
  {
    id: "G0055",
    name: "Advancing Care for Heart Disease",
    specialties: ["Cardiology", "Internal Medicine", "Family Medicine", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "ZzMVP2",
    providers: 45,
    measures: "4 quality measures, outcome/high-priority required",
    action: "Use for heart disease subgroup",
    status: "Recommended",
  },
  {
    id: "G0057",
    name: "Adopting Best Practices and Promoting Patient Safety within Emergency Medicine",
    specialties: ["Emergency Medicine", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "ED clinician cohort",
    providers: 18,
    measures: "Quality + PI + IA readiness review",
    action: "Review roster fit",
    status: "Candidate",
  },
  {
    id: "M0001",
    name: "Advancing Cancer Care",
    specialties: ["Oncology", "Hematology", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "Oncology practice",
    providers: 8,
    measures: "Patient experience, end-of-life, diagnostics",
    action: "Review oncology roster",
    status: "Candidate",
  },
  {
    id: "G0053",
    name: "Advancing Rheumatology Patient Care",
    specialties: ["Rheumatology", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "Rheumatology specialty group",
    providers: 7,
    measures: "Rheumatology conditions and care management",
    action: "Review specialty fit",
    status: "Candidate",
  },
  {
    id: "M1366",
    name: "Focusing on Women's Health",
    specialties: ["Gynecology", "Obstetrics", "Urogynecology", "Certified Nurse Mid-Wives", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "ZzMVP3",
    providers: 45,
    measures: "Women's health quality measure fit",
    action: "Use for women's health subgroup",
    status: "Recommended",
  },
  {
    id: "M1368",
    name: "Prevention and Treatment of Infectious Disorders Including Hepatitis C and HIV",
    specialties: ["Infectious Disease", "Immunology", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "ZzMVP4",
    providers: 45,
    measures: "HIV, chlamydia, preventive screening readiness",
    action: "Use for ZzMVP4 subgroup",
    status: "Recommended",
  },
  {
    id: "M1369",
    name: "Quality Care in Mental Health and Substance Use Disorders",
    specialties: ["Mental Health", "Behavioral Health", "Psychiatry", "Clinical Social Workers", "Nurse Practitioners", "Physician Assistants"],
    currentFit: "ZzMVP5",
    providers: 53,
    measures: "Behavioral health and SUD measure fit",
    action: "Use for behavioral health subgroup",
    status: "Recommended",
  },
  {
    id: "M1422",
    name: "Gastroenterology Care",
    specialties: ["Gastroenterology", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "GI specialty group",
    providers: 12,
    measures: "eCQM/CQM collection type check",
    action: "Validate measures",
    status: "Candidate",
  },
  {
    id: "M0002",
    name: "Optimal Care for Kidney Health",
    specialties: ["Nephrology"],
    currentFit: "Nephrology cohort",
    providers: 31,
    measures: "Kidney health measure set",
    action: "Review nephrology cohort",
    status: "Candidate",
  },
  {
    id: "M0005",
    name: "Value in Primary Care",
    specialties: ["Preventive Medicine", "Internal Medicine", "Family Medicine", "Geriatrics", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "Primary care group",
    providers: 61,
    measures: "Broad primary care prevention measures",
    action: "Evaluate group reporting fit",
    status: "Candidate",
  },
  {
    id: "M1425",
    name: "Surgical Care",
    specialties: ["General Surgery", "Neurosurgery", "Cardiothoracic Surgery", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "Surgical subgroup",
    providers: 21,
    measures: "Outcome/high-priority measure required",
    action: "Create subgroup draft",
    status: "Needs review",
  },
  {
    id: "M1503",
    name: "Vascular Surgery",
    specialties: ["Vascular Surgery", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "Vascular practice",
    providers: 9,
    measures: "Case minimum and data completeness check",
    action: "Check denominator volume",
    status: "Needs review",
  },
  {
    id: "G0054",
    name: "Coordinating Stroke Care to Promote Prevention and Cultivate Positive Outcomes",
    specialties: ["Neurology", "Neurosurgical", "Vascular Surgery", "Nonphysician Practitioners", "Nurse Practitioner", "Physician Assistants"],
    currentFit: "Stroke care cohort",
    providers: 14,
    measures: "Stroke prevention and outcomes",
    action: "Compare with vascular surgery",
    status: "Candidate",
  },
];

const mvpMeasureRequirements = {
  G0055: ["CMS145v14", "CMS165v14"],
  G0057: [],
  M0001: [],
  G0053: [],
  M1366: ["CMS153v14"],
  M1368: ["CMS349v8", "CMS2v15"],
  M1369: ["CMS2v15"],
  M1422: ["CMS130v14"],
  M0002: [],
  M0005: ["CMS130v14", "CMS122v14", "CMS2v15"],
  M1425: [],
  M1503: [],
  G0054: [],
};

const providerAssignmentRows = [
  {
    specialty: "Cardiology",
    cohort: "Heart disease clinicians",
    tinNpi: "45 TIN/NPI combinations under TIN 3130ccdb",
    recommendedLevel: "Subgroup",
    mvpId: "G0055",
    mvpName: "Advancing Care for Heart Disease",
    rationale: "Specialty cohort is large enough to register separately while preserving group PI reporting.",
  },
  {
    specialty: "Infectious Disease",
    cohort: "Infectious disease and immunology subgroup",
    tinNpi: "45 TIN/NPI combinations under TIN 3130ccdb",
    recommendedLevel: "Subgroup",
    mvpId: "M1368",
    mvpName: "Prevention and Treatment of Infectious Disorders Including Hepatitis C and HIV",
    rationale: "Specialty and measure set align to HIV, hepatitis C, and preventive screening quality work.",
  },
  {
    specialty: "Mental Health",
    cohort: "Behavioral health and psychiatry clinicians",
    tinNpi: "53 TIN/NPI combinations under TIN 3130ccdb",
    recommendedLevel: "Subgroup",
    mvpId: "M1369",
    mvpName: "Quality Care in Mental Health and Substance Use Disorders",
    rationale: "Specialty-specific MVP avoids mixing behavioral health performance with unrelated group measures.",
  },
  {
    specialty: "Gynecology",
    cohort: "Women's health clinicians",
    tinNpi: "45 TIN/NPI combinations under TIN 3130ccdb",
    recommendedLevel: "Subgroup",
    mvpId: "M1366",
    mvpName: "Focusing on Women's Health",
    rationale: "Women’s health specialty filter gives a cleaner MVP fit than generic group reporting.",
  },
  {
    specialty: "Family Medicine",
    cohort: "Primary care clinicians",
    tinNpi: "61 TIN/NPI combinations under TIN 3130ccdb",
    recommendedLevel: "Group or Subgroup",
    mvpId: "M0005",
    mvpName: "Value in Primary Care",
    rationale: "Single-specialty or small multi-specialty practices can often evaluate MVP group reporting; larger multi-specialty practices may need subgroup or individual paths.",
  },
  {
    specialty: "Emergency Medicine",
    cohort: "Emergency department clinicians",
    tinNpi: "18 TIN/NPI combinations across ED billing group",
    recommendedLevel: "Individual or Subgroup",
    mvpId: "G0057",
    mvpName: "Adopting Best Practices and Promoting Patient Safety within Emergency Medicine",
    rationale: "Roster, ED attribution, and registration timing determine whether individual or subgroup reporting is cleaner.",
  },
];

const mvpReportingLevelRules = [
  {
    level: "Group",
    status: "Allowed for selected cases",
    rule: "Single-specialty practices and multispecialty small practices can report an MVP as a group.",
    userDecision: "Confirm practice specialty mix and small-practice status before enabling group MVP submission.",
  },
  {
    level: "Group",
    status: "Blocked for large multispecialty",
    rule: "Multispecialty practices that are not small practices cannot report an MVP as a group beginning with PY 2026.",
    userDecision: "Route to individual, subgroup, or APM Entity when the TIN is multispecialty and not small.",
  },
  {
    level: "Subgroup",
    status: "Registration required",
    rule: "Subgroup reporting is MVP-only, tied to a single TIN, and requires advance registration with included clinicians.",
    userDecision: "Collect subgroup roster, composition type, narrative rationale, selected MVP, subgroup identifier, and whole-TIN PI context.",
  },
  {
    level: "Individual / APM Entity",
    status: "Alternative paths",
    rule: "Clinicians may participate through multiple levels and receive the highest final score for the same TIN/NPI combination.",
    userDecision: "Forecast individual, subgroup, group, and APM Entity outcomes before locking the submission path.",
  },
];

const providerMvpForecastRows = [
  { provider: "Jane Coleman, MD", npi: "1942000000", selectedSpecialty: "Infectious Disease", mvpId: "M1368", mvpName: "Prevention and Treatment of Infectious Disorders Including Hepatitis C and HIV", current: "61.2", forecast: "74.8", delta: "+13.6", confidence: "High", gaps: "HIV Screening denominator, depression follow-up numerator" },
  { provider: "Marcus Bell, NP", npi: "1942000001", selectedSpecialty: "Infectious Disease", mvpId: "M1368", mvpName: "Prevention and Treatment of Infectious Disorders Including Hepatitis C and HIV", current: "58.9", forecast: "70.4", delta: "+11.5", confidence: "Medium", gaps: "Low HIV numerator; chlamydia denominator volume" },
  { provider: "Nadia Singh, MD", npi: "1942000002", selectedSpecialty: "Cardiology", mvpId: "G0055", mvpName: "Advancing Care for Heart Disease", current: "67.4", forecast: "79.1", delta: "+11.7", confidence: "High", gaps: "CAD beta-blocker numerator and blood pressure control" },
  { provider: "Robert Kane, PA", npi: "1942000003", selectedSpecialty: "Cardiology", mvpId: "G0055", mvpName: "Advancing Care for Heart Disease", current: "48.2", forecast: "55.9", delta: "+7.7", confidence: "Low", gaps: "Case minimum risk; measure attribution review" },
  { provider: "Elena Morales, MD", npi: "1942000004", selectedSpecialty: "Mental Health", mvpId: "M1369", mvpName: "Quality Care in Mental Health and Substance Use Disorders", current: "69.1", forecast: "82.6", delta: "+13.5", confidence: "High", gaps: "Depression follow-up and SUD screening" },
  { provider: "Priya Shah, CNM", npi: "1942000005", selectedSpecialty: "Gynecology", mvpId: "M1366", mvpName: "Focusing on Women's Health", current: "63.8", forecast: "77.0", delta: "+13.2", confidence: "Medium", gaps: "Chlamydia screening stratification and breast cancer screening" },
  { provider: "Thomas Riley, MD", npi: "1942000006", selectedSpecialty: "Family Medicine", mvpId: "M0005", mvpName: "Value in Primary Care", current: "72.5", forecast: "81.3", delta: "+8.8", confidence: "High", gaps: "Colorectal screening and blood pressure control" },
];

const mvpIndividualGroups = [
  { id: "ZzMVP2", name: "Heart disease clinicians", specialty: "Cardiology", mvpId: "G0055", mvpName: "Advancing Care for Heart Disease" },
  { id: "ZzMVP3", name: "Women's health clinicians", specialty: "Gynecology", mvpId: "M1366", mvpName: "Focusing on Women's Health" },
  { id: "ZzMVP4", name: "Infectious disease and immunology subgroup", specialty: "Infectious Disease", mvpId: "M1368", mvpName: "Prevention and Treatment of Infectious Disorders Including Hepatitis C and HIV" },
  { id: "ZzMVP5", name: "Behavioral health and psychiatry clinicians", specialty: "Mental Health", mvpId: "M1369", mvpName: "Quality Care in Mental Health and Substance Use Disorders" },
];

const mvpIndividualClinicians = {
  ZzMVP2: [
    { name: "Nadia Singh, MD", npi: "1942000002", forecast: "79.1", current: "67.4", confidence: "High" },
    { name: "Robert Kane, PA", npi: "1942000003", forecast: "55.9", current: "48.2", confidence: "Low" },
  ],
  ZzMVP3: [
    { name: "Priya Shah, CNM", npi: "1942000005", forecast: "77.0", current: "63.8", confidence: "Medium" },
  ],
  ZzMVP4: [
    { name: "Jane Coleman, MD", npi: "1942000000", forecast: "74.8", current: "61.2", confidence: "High" },
    { name: "Marcus Bell, NP", npi: "1942000001", forecast: "70.4", current: "58.9", confidence: "Medium" },
  ],
  ZzMVP5: [
    { name: "Elena Morales, MD", npi: "1942000004", forecast: "82.6", current: "69.1", confidence: "High" },
  ],
};

const customerPhaseSteps = [
  {
    phase: "Start",
    title: "Customer Context Loaded",
    decision: "Use the customer’s fixed enabled measures, roster, TIN/NPI eligibility, and participation context to infer which in-app submission paths are available.",
    evidence: "Enabled clinician measures, roster, TIN/NPI eligibility, QPP/APM participation",
  },
  {
    phase: "Path",
    title: "Pick the Recommended Path",
    decision: "Show only the submission paths supported by the known customer setup, with future-state paths prioritized over retiring Traditional MIPS.",
    evidence: "MVP, APP Plus, QRDA availability and transition context",
  },
  {
    phase: "Configure",
    title: "Configure the Path",
    decision: "For MVPs, ask only the necessary follow-up questions: practice composition, specialties, MVP, reporting level, subgroup rationale, and provider forecast.",
    evidence: "Composition, specialty, MVP fit, reporting level, subgroup narrative, forecast score",
  },
  {
    phase: "Submit",
    title: "Register and Submit",
    decision: "Register the MVP/subgroup when required, freeze the package, submit through CMS QPP/API, or generate export files.",
    evidence: "CMS QPP OAuth, subgroup identifier, validation status, receipt status",
  },
];

const smartScoreLift = {
  baseline: "89.5%",
  projected: "93.78",
  benchmark: "88.17",
  recommendationLift: "+5.54",
  providersLift: "9",
  opportunity: "61.4%",
  tinsNeedingReview: "7 TINs",
};

const qppSession = {
  status: "active",
  label: "Logged into CMS QPP",
  remaining: "15 mins",
  user: "b.g.sunil.kumar@oracle.com",
};

const previousSubmissionBaseline = {
  year: "PY 2025",
  path: "Traditional MIPS group",
  delivery: "CMS QPP API + QRDA III export",
  score: "72.4",
  providers: "61 providers",
  measures: "6 quality measures, PI, IA",
  status: "Submitted",
};

const visionStages = [
  {
    id: "strategy",
    sequence: "Step 1",
    label: "Strategy",
    title: "Choose or edit submission strategy",
    promise: "Start from last year’s baseline or a forecasted strategy, adjust the mix, then lock the plan.",
    customerQuestion: "What is the most effective strategy for this organization?",
    systemAction: "Forecasts program fit from enabled measures, provider specialty mix, and current performance.",
    artifact: "Approved 2026 submission strategy",
    primaryAction: "Lock Strategy",
  },
  {
    id: "improve",
    sequence: "Step 2",
    label: "Improve",
    title: "Turn gaps into routed work",
    promise: "Move from planning to score improvement while teams can still act.",
    customerQuestion: "Which issues can my teams actually fix this month?",
    systemAction: "Finds likely evidence, separates documentation, workflow, and data-mapping issues, then routes work.",
    artifact: "Prioritized quality work queue",
    primaryAction: "Open Work Queue",
  },
  {
    id: "monitor",
    sequence: "Step 3",
    label: "Monitor",
    title: "Catch changes before they become submission risk",
    promise: "Watch week-over-week satisfaction changes and surface credible exceptions.",
    customerQuestion: "Where should I direct attention this week?",
    systemAction: "Flags sudden drops, unlikely improvements, stale feeds, and mapping shifts.",
    artifact: "Exception watchlist",
    primaryAction: "Review Exceptions",
  },
  {
    id: "validate",
    sequence: "Step 4",
    label: "Validate",
    title: "Validate the representative population",
    promise: "Focus human judgment on the exceptions that matter, not the entire submission.",
    customerQuestion: "Can I stand behind this submission?",
    systemAction: "Selects a representative validation population and performs deep patient, data, and logic checks.",
    artifact: "Validated submission package",
    primaryAction: "Approve Validation",
  },
  {
    id: "submit",
    sequence: "Step 5",
    label: "Submit",
    title: "Submit securely without the scramble",
    promise: "Send the approved version through secure OAuth and track CMS response.",
    customerQuestion: "Was the approved data submitted successfully?",
    systemAction: "Uses the active CMS QPP connection to submit, track receipt, and resolve final exceptions.",
    artifact: "CMS receipt and audit trail",
    primaryAction: "Submit to CMS",
  },
];

const visionScreens = [
  { id: "home", label: "Home", stage: "strategy", detail: "Score, strategy, blockers" },
  { id: "strategy", label: "Strategy", stage: "strategy", detail: "Forecast and choose" },
  { id: "performance", label: "Quality Workbench", stage: "improve", detail: "Opportunities and validation" },
  { id: "submissions", label: "Submissions", stage: "submit", detail: "Approve and submit" },
  { id: "qrda", label: "QRDA Export", stage: "submit", detail: "Generate file package" },
  { id: "audit", label: "Audit", stage: "submit", detail: "Approvals and traceability" },
];

const visionStrategyInputs = [
  { label: "Enabled measure signal", source: "Customer measure configuration", value: "eCQM + CQM measures available", detail: "Supports infectious disease, mental health, women’s health, APP Plus, and QRDA; cardiology MVP is unavailable until supporting measures are enabled.", impact: "3 MVP subgroups supported; cardiology blocked" },
  { label: "Specialty signal", source: "Roster + customer-confirmed specialty", value: "4 specialty cohorts", detail: "Cardiology 45, infectious disease 45, women’s health 45, mental health 53.", impact: "Cohorts are customer-confirmed, not inferred from TIN/NPI" },
  { label: "Performance signal", source: "Current measure performance", value: "+5.5 point modeled lift", detail: "Forecast compares current score, case volume, denominator gaps, and measure availability by provider.", impact: "Provider/MVP forecast drives ranking" },
  { label: "Program signal", source: "Participation and CMS rules", value: "MVP primary, APP Plus available", detail: "Traditional MIPS is transition context; QRDA is a supporting export path after approval.", impact: "Prioritize MVP; keep APP Plus and QRDA available" },
];

const visionMvpSubgroupRows = [
  {
    id: "infectious-disease",
    subgroup: "Infectious disease and immunology subgroup",
    specialty: "Infectious Disease",
    mvpId: "M1368",
    mvpName: "Prevention and Treatment of Infectious Disorders Including Hepatitis C and HIV",
    providers: 45,
    reportingLevel: "Subgroup",
    currentScore: "37%",
    projectedScore: "93.8",
    lift: "+5.5 pts",
    measureFit: "CMS349v8 and CMS2v15 enabled",
    confidence: "High",
    rationale: "Specialty and enabled measures align to HIV, hepatitis C, and preventive screening quality work.",
  },
  {
    id: "mental-health",
    subgroup: "Behavioral health and psychiatry clinicians",
    specialty: "Mental Health",
    mvpId: "M1369",
    mvpName: "Quality Care in Mental Health and Substance Use Disorders",
    providers: 53,
    reportingLevel: "Subgroup",
    currentScore: "41%",
    projectedScore: "91.6",
    lift: "+4.2 pts",
    measureFit: "CMS2v15 enabled",
    confidence: "Medium",
    rationale: "Specialty-specific MVP avoids mixing behavioral health performance with unrelated group measures.",
  },
  {
    id: "womens-health",
    subgroup: "Women’s health clinicians",
    specialty: "Women’s Health",
    mvpId: "M1366",
    mvpName: "Focusing on Women’s Health",
    providers: 45,
    reportingLevel: "Subgroup",
    currentScore: "55%",
    projectedScore: "89.4",
    lift: "+2.8 pts",
    measureFit: "CMS153v14 enabled",
    confidence: "Medium",
    rationale: "Submission can preserve women’s health quality work while keeping non-aligned clinicians outside the cohort.",
  },
  {
    id: "heart-disease",
    subgroup: "Heart disease clinicians",
    specialty: "Cardiology",
    mvpId: "G0055",
    mvpName: "Advancing Care for Heart Disease",
    providers: 45,
    reportingLevel: "Unavailable",
    currentScore: "40%",
    projectedScore: "Not modeled",
    lift: "Blocked",
    measureFit: "Required cardiology measures not enabled",
    confidence: "Blocked",
    rationale: "Keep visible as unavailable so the customer understands why cardiology is not recommended for this setup.",
  },
];

const visionProviderMixRows = {
  "infectious-disease": [
    { provider: "Jane Coleman, MD", specialty: "Infectious Disease", npi: "1942000000", current: "61.2", forecast: "74.8", recommendation: "Include" },
    { provider: "Marcus Bell, NP", specialty: "Infectious Disease", npi: "1942000001", current: "58.9", forecast: "70.4", recommendation: "Include" },
    { provider: "Rita Holmes, PA", specialty: "Immunology", npi: "1942000018", current: "52.6", forecast: "67.1", recommendation: "Review" },
  ],
  "mental-health": [
    { provider: "Elena Morales, MD", specialty: "Psychiatry", npi: "1942000004", current: "69.1", forecast: "82.6", recommendation: "Include" },
    { provider: "Caroline Meyer, LCSW", specialty: "Behavioral Health", npi: "1942000024", current: "64.7", forecast: "80.2", recommendation: "Include" },
    { provider: "Avery Nelson, NP", specialty: "Mental Health", npi: "1942000025", current: "47.4", forecast: "61.9", recommendation: "Review" },
  ],
  "womens-health": [
    { provider: "Priya Shah, CNM", specialty: "Women’s Health", npi: "1942000005", current: "63.8", forecast: "77.0", recommendation: "Include" },
    { provider: "Megan Park, MD", specialty: "Gynecology", npi: "1942000031", current: "57.0", forecast: "70.8", recommendation: "Include" },
    { provider: "Lena Ortiz, NP", specialty: "Obstetrics", npi: "1942000032", current: "48.3", forecast: "62.5", recommendation: "Review" },
  ],
  "heart-disease": [
    { provider: "Nadia Singh, MD", specialty: "Cardiology", npi: "1942000002", current: "67.4", forecast: "Not modeled", recommendation: "Blocked" },
    { provider: "Robert Kane, PA", specialty: "Cardiology", npi: "1942000003", current: "48.2", forecast: "Not modeled", recommendation: "Blocked" },
    { provider: "Thomas Riley, MD", specialty: "Family Medicine", npi: "1942000006", current: "72.5", forecast: "Not modeled", recommendation: "Blocked" },
  ],
};

const visionStrategyRows = [
  {
    id: "mvp-specialty-subgroups",
    path: "MVP specialty subgroups",
    recommendation: "Recommended",
    strategy: "Submit MVPs by specialty cohort, with subgroup rationale and provider forecast before registration.",
    fit: "Strong",
    measureCoverage: "Supported by enabled EC measures",
    performance: "93.8 projected",
    lift: "+5.5 pts",
    effort: "Medium",
    scope: "MVP subgroup registration",
  },
  {
    id: "mvp-mixed",
    path: "MVP mixed subgroup + individual",
    recommendation: "Candidate",
    strategy: "Use subgroups where cohorts are stable; route low-confidence providers through individual review.",
    fit: "Moderate",
    measureCoverage: "Partial specialty coverage",
    performance: "91.2 projected",
    lift: "+2.9 pts",
    effort: "High",
    scope: "MVP subgroup and individual review",
  },
  {
    id: "appplus",
    path: "APP Plus APM Entity",
    recommendation: "Available",
    strategy: "Use APM Entity submission if the customer’s participation contract is the driving strategy.",
    fit: "Conditional",
    measureCoverage: "Supported when APM measures apply",
    performance: "88.6 projected",
    lift: "+0.8 pts",
    effort: "Low",
    scope: "APM Entity submission",
  },
  {
    id: "qrda-support",
    path: "QRDA file support",
    recommendation: "Supporting path",
    strategy: "Generate QRDA only from an approved MVP or APP Plus package, not as the primary strategy.",
    fit: "Support",
    measureCoverage: "Export-ready after strategy approval",
    performance: "No score change",
    lift: "0 pts",
    effort: "Low",
    scope: "QRDA I or QRDA III package",
  },
  {
    id: "traditional-mips",
    path: "Traditional MIPS",
    recommendation: "Transition only",
    strategy: "Keep for legacy review while customers migrate to MVP-based submissions.",
    fit: "Retiring",
    measureCoverage: "Do not optimize future-state around it",
    performance: "85.4 projected",
    lift: "-2.1 pts",
    effort: "Medium",
    scope: "Legacy review only",
  },
];

const visionStrategyContext = {
  "mvp-specialty-subgroups": {
    bestFor: "Multispecialty organizations where specialty-specific MVPs are better representations of care than one blended group submission.",
    primaryDecision: "Approve the specialty subgroup strategy, then register each supported MVP subgroup with its roster, composition, and narrative rationale.",
    inputs: [
      "Enabled EC measure inventory supports infectious disease, mental health, and women's health MVPs.",
      "Provider roster contains distinct specialty cohorts with enough volume for subgroup planning.",
      "Forecasting shows the highest modeled lift when providers are assigned to specialty-fit MVPs.",
    ],
    customerDecisions: [
      "Confirm whether each subgroup is single-specialty or multispecialty.",
      "Approve the providers included in each subgroup.",
      "Approve selected MVP, measure mode, and subgroup narrative before CMS registration.",
    ],
    constraints: [
      "Do not infer specialty from TIN/NPI alone.",
      "Large multispecialty practices should not be routed to MVP group reporting when subgroup or individual paths are required.",
      "Unavailable MVPs stay visible with the exact measure gap that blocks selection.",
    ],
  },
  "mvp-mixed": {
    bestFor: "Customers with one or two strong specialty cohorts plus several clinicians whose specialty, attribution, or performance is not clean enough for immediate subgroup registration.",
    primaryDecision: "Use subgroup registration for clean cohorts and route uncertain clinicians through individual review before package approval.",
    inputs: [
      "Specialty roster contains mixed-confidence provider assignments.",
      "Some MVPs have partial measure coverage or lower case-volume confidence.",
      "Provider-level forecasts show meaningful variance within the same TIN.",
    ],
    customerDecisions: [
      "Choose which clinicians stay in subgroup reporting.",
      "Choose which clinicians need individual review.",
      "Resolve measure gaps before locking each draft.",
    ],
    constraints: [
      "Higher operational effort because the customer manages both subgroup and individual paths.",
      "Requires clearer review state so clinicians do not disappear from the strategy.",
      "Should not be presented as simpler than the specialty subgroup strategy.",
    ],
  },
  appplus: {
    bestFor: "Customers whose APM Entity participation is the governing submission strategy and whose APM measure package is already supported.",
    primaryDecision: "Confirm APM Entity participation and use APP Plus as the primary submission package.",
    inputs: [
      "APM Entity measures are enabled for the customer.",
      "Participation context indicates APP Plus eligibility.",
      "Quality performance is modeled at the APM Entity level rather than specialty subgroup level.",
    ],
    customerDecisions: [
      "Confirm APM Entity participation.",
      "Approve APM measure package and reporting period.",
      "Use MVP only for adjacent specialty strategy planning when appropriate.",
    ],
    constraints: [
      "Not a replacement for MVP when the customer is not participating as an APM Entity.",
      "Provider specialty mix is less central than APM participation and measure package fit.",
      "QRDA remains a package/export mechanism after approval.",
    ],
  },
  "qrda-support": {
    bestFor: "Customers that need a file package after a strategy has already been approved.",
    primaryDecision: "Generate the correct QRDA package from the approved MVP or APP Plus submission version.",
    inputs: [
      "Approved strategy identifies program, scope, period, and collection type.",
      "Enabled measures have export-ready data after validation.",
      "Submission status determines whether QRDA is a support path or final handoff.",
    ],
    customerDecisions: [
      "Choose QRDA I or QRDA III only after the submission package is approved.",
      "Confirm program, scope, and reporting period.",
      "Download or transmit the frozen package.",
    ],
    constraints: [
      "Should not appear as the primary strategy recommendation.",
      "Must avoid sending a different version than the one approved in validation.",
      "Hospital reporting is out of app and should not appear as a top-line path here.",
    ],
  },
  "traditional-mips": {
    bestFor: "Transition review, historical comparison, and customer education while traditional MIPS winds down.",
    primaryDecision: "Use only as context unless a customer still has a required legacy submission use case.",
    inputs: [
      "Legacy MIPS measures are still visible for this customer.",
      "Future-state strategy should prioritize MVP-based paths.",
      "Customer may need to compare old and new score expectations during transition.",
    ],
    customerDecisions: [
      "Review historical performance if needed.",
      "Avoid planning a future operating model around traditional MIPS.",
      "Use MVP or APP Plus for the active submission strategy when supported.",
    ],
    constraints: [
      "Retiring path should not compete visually with recommended active paths.",
      "Selection is disabled in the prototype to keep the presentation focused.",
      "Keep enough context to explain why the customer is being routed elsewhere.",
    ],
  },
};

const visionWorkQueueRows = [
  { type: "Evidence likely exists", owner: "Chart chase", count: "428 patients", next: "Agent review queued" },
  { type: "Documentation gap", owner: "Clinical operations", count: "112 patients", next: "Workflow follow-up" },
  { type: "Data mapping issue", owner: "Interface team", count: "3 feeds", next: "Mapping ticket ready" },
];

const visionMonitorRows = [
  { signal: "Depression screening dropped 7.4 pts", cause: "Documentation workflow changed", action: "Route to clinic manager" },
  { signal: "HIV screening improved 18.2 pts", cause: "Improvement exceeds expected trend", action: "Audit sample evidence" },
  { signal: "Blood pressure denominator shifted", cause: "Possible feed or mapping change", action: "Review data lineage" },
];

const visionValidationRows = [
  { check: "Population representativeness", status: "Ready", detail: "Sample mirrors specialty, payer, and measure mix." },
  { check: "Patient qualification logic", status: "Review", detail: "37 records need human judgment." },
  { check: "Evidence traceability", status: "Ready", detail: "Every accepted record links to source evidence." },
];

const visionSubmissionRows = [
  { step: "Package approved", status: "Complete", detail: "MVP subgroup and APP Plus package frozen." },
  { step: "CMS QPP OAuth", status: "Active", detail: `${qppSession.user} - ${qppSession.remaining} remaining.` },
  { step: "CMS receipt", status: "Waiting", detail: "Receipt appears here after secure submission." },
];

const visionMeasureOpportunityRows = [
  {
    measureId: "cms349",
    measure: "HIV Screening",
    id: "CMS349v8",
    subgroup: "M1368 infectious disease",
    benchmark: "88.2%",
    nearMiss: "428",
    closeness: "72%",
    lift: "+3.4 pts",
    issue: "External lab evidence found, LOINC mapping incomplete",
    representativePatient: "HY-10482",
    focus: "Lab source mapping",
  },
  {
    measureId: "cms2",
    measure: "Screening for Depression and Follow-Up Plan",
    id: "CMS2v15",
    subgroup: "M1368 and M1369",
    benchmark: "91.0%",
    nearMiss: "112",
    closeness: "81%",
    lift: "+1.2 pts",
    issue: "Follow-up plan documented, not coded consistently",
    representativePatient: "HY-12372",
    focus: "Documentation capture",
  },
  {
    measureId: "cms165",
    measure: "Controlling High Blood Pressure",
    id: "CMS165v14",
    subgroup: "APP Plus",
    benchmark: "86.0%",
    nearMiss: "96",
    closeness: "88%",
    lift: "+0.9 pts",
    issue: "Controlled BP present under non-Hyperion encounter attribution",
    representativePatient: "HY-13822",
    focus: "Attribution + vitals feed",
  },
  {
    measureId: "cms130",
    measure: "Colorectal Cancer Screening",
    id: "CMS130v14",
    subgroup: "APP Plus",
    benchmark: "82.5%",
    nearMiss: "84",
    closeness: "82%",
    lift: "+0.8 pts",
    issue: "Registry evidence found, source reconciliation incomplete",
    representativePatient: "HY-14013",
    focus: "Registry reconciliation",
  },
  {
    measureId: "cms122",
    measure: "Diabetes: Glycemic Status Assessment Greater Than 9%",
    id: "CMS122v14",
    subgroup: "APP Plus",
    benchmark: "78.0%",
    nearMiss: "73",
    closeness: "77%",
    lift: "+0.7 pts",
    issue: "A1c assessment present, result value missing from accepted feed",
    representativePatient: "HY-15319",
    focus: "Lab value mapping",
  },
  {
    measureId: "cms153",
    measure: "Chlamydia Screening in Women",
    id: "CMS153v14",
    subgroup: "M1366 women's health",
    benchmark: "74.0%",
    nearMiss: "39",
    closeness: "64%",
    lift: "+0.3 pts",
    issue: "Small stratum volumes and missing lab-source evidence",
    representativePatient: "HY-12812",
    focus: "Small-volume review",
  },
];

const visionValidationPatientMeasures = [
  {
    id: "cms349",
    measure: "HIV Screening",
    code: "CMS349v8",
    mvp: "M1368",
    subgroup: "Infectious disease and immunology subgroup",
    selected: 50,
    reviewComplete: "62%",
    changed: 18,
    coverage: "High evidence density with focused fall-out review",
    patients: [
      {
        patient: "HY-10482",
        provider: "Jane Coleman, MD",
        specialty: "Infectious Disease",
        currentState: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Denominator only",
        change: "External lab evidence found",
        changeTone: "info",
        closeness: "83%",
        whySelected: "Fall-out with the most supporting source evidence",
        evidence: "LOINC mapping missing from supported lab feed",
        review: "Mapping review",
      },
      {
        patient: "HY-10731",
        provider: "Marcus Bell, NP",
        specialty: "Infectious Disease",
        currentState: "Numerator",
        satisfaction: "Satisfied",
        satisfactionTone: "good",
        priorState: "Numerator",
        change: "No change",
        changeTone: "info",
        closeness: "100%",
        whySelected: "Clean numerator control with complete source trail",
        evidence: "Screening result, encounter, and attribution all evidenced",
        review: "Validated",
      },
      {
        patient: "HY-11106",
        provider: "Rita Holmes, PA",
        specialty: "Immunology",
        currentState: "Denominator",
        satisfaction: "Not satisfied",
        satisfactionTone: "bad",
        priorState: "Not in population",
        change: "New denominator",
        changeTone: "warn",
        closeness: "48%",
        whySelected: "Newly attributed denominator patient after roster refresh",
        evidence: "Claim attribution changed; screening evidence absent",
        review: "Chart chase",
      },
      {
        patient: "HY-11645",
        provider: "Jane Coleman, MD",
        specialty: "Infectious Disease",
        currentState: "Exclusion",
        satisfaction: "Excluded",
        satisfactionTone: "info",
        priorState: "Denominator",
        change: "Exclusion added",
        changeTone: "good",
        closeness: "N/A",
        whySelected: "Representative exclusion record",
        evidence: "Documented exclusion found in EHR problem list",
        review: "Validated",
      },
      {
        patient: "HY-12214",
        provider: "Marcus Bell, NP",
        specialty: "Infectious Disease",
        currentState: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Near miss",
        change: "No change",
        changeTone: "info",
        closeness: "76%",
        whySelected: "Fall-out with registry evidence that needs EMR confirmation",
        evidence: "Registry says screened; EMR source event not linked",
        review: "Customer review",
      },
    ],
  },
  {
    id: "cms2",
    measure: "Depression Screening and Follow-Up Plan",
    code: "CMS2v15",
    mvp: "M1368 / M1369",
    subgroup: "Infectious disease and mental health subgroups",
    selected: 32,
    reviewComplete: "71%",
    changed: 7,
    coverage: "Balanced controls plus changed-outcome patients",
    patients: [
      {
        patient: "HY-11790",
        provider: "Elena Morales, MD",
        specialty: "Psychiatry",
        currentState: "Denominator",
        satisfaction: "Not satisfied",
        satisfactionTone: "bad",
        priorState: "Numerator",
        change: "Follow-up concept changed",
        changeTone: "warn",
        closeness: "67%",
        whySelected: "Outcome changed after context version update",
        evidence: "Screening present; follow-up plan code no longer qualifies",
        review: "Clinical review",
      },
      {
        patient: "HY-11903",
        provider: "Caroline Meyer, LCSW",
        specialty: "Behavioral Health",
        currentState: "Numerator",
        satisfaction: "Satisfied",
        satisfactionTone: "good",
        priorState: "Denominator",
        change: "Documentation recovered",
        changeTone: "good",
        closeness: "100%",
        whySelected: "Recovered numerator validates documentation logic",
        evidence: "Screening and follow-up plan both coded",
        review: "Validated",
      },
      {
        patient: "HY-12372",
        provider: "Avery Nelson, NP",
        specialty: "Mental Health",
        currentState: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Denominator",
        change: "One criterion improved",
        changeTone: "info",
        closeness: "79%",
        whySelected: "Fall-out near benchmark threshold",
        evidence: "Screening present; follow-up plan in note text only",
        review: "Note review",
      },
      {
        patient: "HY-12944",
        provider: "Jane Coleman, MD",
        specialty: "Infectious Disease",
        currentState: "Exclusion candidate",
        satisfaction: "Needs review",
        satisfactionTone: "warn",
        priorState: "Not met",
        change: "Potential exclusion found",
        changeTone: "warn",
        closeness: "N/A",
        whySelected: "Completes missing exclusion sample for this measure",
        evidence: "Documented reason appears in unstructured note",
        review: "Reviewer needed",
      },
    ],
  },
  {
    id: "cms153",
    measure: "Chlamydia Screening in Women",
    code: "CMS153v14",
    mvp: "M1366",
    subgroup: "Women's health clinicians",
    selected: 27,
    reviewComplete: "81%",
    changed: 5,
    coverage: "Small-stratum validation with high-risk fall-outs",
    patients: [
      {
        patient: "HY-12104",
        provider: "Priya Shah, CNM",
        specialty: "Women's Health",
        currentState: "Denominator",
        satisfaction: "Not satisfied",
        satisfactionTone: "bad",
        priorState: "Excluded",
        change: "Measure logic change",
        changeTone: "warn",
        closeness: "58%",
        whySelected: "Outcome shifted from exclusion to denominator",
        evidence: "Exclusion criteria no longer satisfied after spec update",
        review: "Reconcile criteria",
      },
      {
        patient: "HY-12466",
        provider: "Megan Park, MD",
        specialty: "Gynecology",
        currentState: "Numerator",
        satisfaction: "Satisfied",
        satisfactionTone: "good",
        priorState: "Numerator",
        change: "No change",
        changeTone: "info",
        closeness: "100%",
        whySelected: "Clean numerator record for small-volume stratum",
        evidence: "Screening lab result and encounter confirmed",
        review: "Validated",
      },
      {
        patient: "HY-12812",
        provider: "Lena Ortiz, NP",
        specialty: "Obstetrics",
        currentState: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Denominator",
        change: "Lab source added",
        changeTone: "info",
        closeness: "74%",
        whySelected: "Fall-out with a newly arrived lab source",
        evidence: "Lab present; result date outside accepted window",
        review: "Date review",
      },
      {
        patient: "HY-13077",
        provider: "Megan Park, MD",
        specialty: "Gynecology",
        currentState: "Exclusion",
        satisfaction: "Excluded",
        satisfactionTone: "info",
        priorState: "Exclusion",
        change: "No change",
        changeTone: "info",
        closeness: "N/A",
        whySelected: "Representative exclusion control",
        evidence: "Hospice exclusion documented and coded",
        review: "Validated",
      },
    ],
  },
  {
    id: "cms165",
    measure: "Controlling High Blood Pressure",
    code: "CMS165v14",
    mvp: "APP Plus",
    subgroup: "APM Entity quality package",
    selected: 44,
    reviewComplete: "76%",
    changed: 6,
    coverage: "High-volume outcome controls with attribution checks",
    patients: [
      {
        patient: "HY-13218",
        provider: "Thomas Riley, MD",
        specialty: "Family Medicine",
        currentState: "Numerator",
        satisfaction: "Satisfied",
        satisfactionTone: "good",
        priorState: "Denominator",
        change: "BP evidence recovered",
        changeTone: "good",
        closeness: "100%",
        whySelected: "Outcome changed after vitals feed update",
        evidence: "Most recent controlled BP now linked to qualifying encounter",
        review: "Validated",
      },
      {
        patient: "HY-13540",
        provider: "Nadia Singh, MD",
        specialty: "Cardiology",
        currentState: "Denominator",
        satisfaction: "Not satisfied",
        satisfactionTone: "bad",
        priorState: "Denominator",
        change: "No change",
        changeTone: "info",
        closeness: "54%",
        whySelected: "High-volume denominator control with low evidence ambiguity",
        evidence: "BP values remain above numerator threshold",
        review: "Validated",
      },
      {
        patient: "HY-13822",
        provider: "Robert Kane, PA",
        specialty: "Cardiology",
        currentState: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Not in population",
        change: "New attribution",
        changeTone: "warn",
        closeness: "88%",
        whySelected: "Potential miss tied to billing-provider attribution",
        evidence: "Controlled BP appears under non-Hyperion encounter",
        review: "Claim review",
      },
    ],
  },
  {
    id: "cms130",
    measure: "Colorectal Cancer Screening",
    code: "CMS130v14",
    mvp: "APP Plus",
    subgroup: "APM Entity quality package",
    selected: 41,
    reviewComplete: "69%",
    changed: 9,
    coverage: "Registry reconciliation sample with changed outcomes",
    patients: [
      {
        patient: "HY-14013",
        provider: "Thomas Riley, MD",
        specialty: "Family Medicine",
        currentState: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Denominator",
        change: "Registry evidence found",
        changeTone: "info",
        closeness: "82%",
        whySelected: "Registry indicates screening, calculation lacks accepted source",
        evidence: "Colonoscopy record needs source reconciliation",
        review: "Registry check",
      },
      {
        patient: "HY-14355",
        provider: "Alicia Nguyen, NP",
        specialty: "Primary Care",
        currentState: "Numerator",
        satisfaction: "Satisfied",
        satisfactionTone: "good",
        priorState: "Numerator",
        change: "No change",
        changeTone: "info",
        closeness: "100%",
        whySelected: "Stable numerator control across registry and EHR",
        evidence: "FIT-DNA result and date confirmed",
        review: "Validated",
      },
      {
        patient: "HY-14729",
        provider: "Alicia Nguyen, NP",
        specialty: "Primary Care",
        currentState: "Exclusion",
        satisfaction: "Excluded",
        satisfactionTone: "info",
        priorState: "Denominator",
        change: "Hospice exclusion added",
        changeTone: "good",
        closeness: "N/A",
        whySelected: "Representative exclusion changed since last snapshot",
        evidence: "Hospice record now available in EHR source",
        review: "Validated",
      },
    ],
  },
  {
    id: "cms122",
    measure: "Diabetes: Glycemic Status Assessment Greater Than 9%",
    code: "CMS122v14",
    mvp: "APP Plus",
    subgroup: "APM Entity quality package",
    selected: 36,
    reviewComplete: "58%",
    changed: 8,
    coverage: "Fall-outs weighted by benchmark proximity and lab-source density",
    patients: [
      {
        patient: "HY-15086",
        provider: "Alicia Nguyen, NP",
        specialty: "Primary Care",
        currentState: "Numerator",
        satisfaction: "Satisfied",
        satisfactionTone: "good",
        priorState: "Near miss",
        change: "A1c result mapped",
        changeTone: "good",
        closeness: "100%",
        whySelected: "Outcome changed after lab value mapping fix",
        evidence: "A1c result now mapped to accepted lab concept",
        review: "Validated",
      },
      {
        patient: "HY-15319",
        provider: "Thomas Riley, MD",
        specialty: "Family Medicine",
        currentState: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Denominator",
        change: "One criterion improved",
        changeTone: "info",
        closeness: "77%",
        whySelected: "Fall-out one criterion away from satisfying numerator logic",
        evidence: "Assessment present; result value missing from feed",
        review: "Data review",
      },
      {
        patient: "HY-15602",
        provider: "Marcus Bell, NP",
        specialty: "Infectious Disease",
        currentState: "Denominator",
        satisfaction: "Not satisfied",
        satisfactionTone: "bad",
        priorState: "Denominator",
        change: "No change",
        changeTone: "info",
        closeness: "42%",
        whySelected: "Low-confidence denominator control for cross-specialty attribution",
        evidence: "Diabetes diagnosis present; glycemic assessment absent",
        review: "Chart chase",
      },
    ],
  },
];

const visionAttestationTrends = {
  cms349: {
    current: "74%",
    wowChange: "+7.2%",
    wowTone: "good",
    target: 85,
    action: "Review HIV lab-source mapping",
    trend: [
      { label: "07/06", value: 68 },
      { label: "07/20", value: 69 },
      { label: "08/03", value: 70 },
      { label: "08/17", value: 69 },
      { label: "08/31", value: 74 },
    ],
  },
  cms2: {
    current: "81%",
    wowChange: "+3.8%",
    wowTone: "good",
    target: 85,
    action: "Confirm follow-up-plan documentation",
    trend: [
      { label: "07/06", value: 77 },
      { label: "07/20", value: 78 },
      { label: "08/03", value: 77 },
      { label: "08/17", value: 78 },
      { label: "08/31", value: 81 },
    ],
  },
  cms153: {
    current: "88%",
    wowChange: "+3.5%",
    wowTone: "good",
    target: 85,
    action: "Maintain sample coverage",
    trend: [
      { label: "07/06", value: 85 },
      { label: "07/20", value: 86 },
      { label: "08/03", value: 84 },
      { label: "08/17", value: 85 },
      { label: "08/31", value: 88 },
    ],
  },
  cms165: {
    current: "79%",
    wowChange: "+3.9%",
    wowTone: "good",
    target: 85,
    action: "Review attribution and vitals feed",
    trend: [
      { label: "07/06", value: 76 },
      { label: "07/20", value: 75 },
      { label: "08/03", value: 77 },
      { label: "08/17", value: 76 },
      { label: "08/31", value: 79 },
    ],
  },
  cms130: {
    current: "69%",
    wowChange: "+1.5%",
    wowTone: "warn",
    target: 85,
    action: "Reconcile registry evidence",
    trend: [
      { label: "07/06", value: 66 },
      { label: "07/20", value: 67 },
      { label: "08/03", value: 66 },
      { label: "08/17", value: 68 },
      { label: "08/31", value: 69 },
    ],
  },
  cms122: {
    current: "58%",
    wowChange: "+1.8%",
    wowTone: "warn",
    target: 85,
    action: "Review A1c lab-value mapping",
    trend: [
      { label: "07/06", value: 55 },
      { label: "07/20", value: 56 },
      { label: "08/03", value: 56 },
      { label: "08/17", value: 57 },
      { label: "08/31", value: 58 },
    ],
  },
};

const visionOutcomeShiftRows = [
  { patient: "HY-10482", measure: "CMS349v8 HIV Screening", prior: "Denominator only", current: "Near miss", cause: "Data change", version: "outcome v42 -> v43", action: "Map lab result" },
  { patient: "HY-11790", measure: "CMS2v15 Depression Screening", prior: "Numerator", current: "Not met", cause: "Concept change", version: "context v18 -> v19", action: "Review follow-up code" },
  { patient: "HY-12104", measure: "CMS153v14 Chlamydia Screening", prior: "Excluded", current: "Denominator", cause: "Measure logic", version: "measure v14.1 -> v14.2", action: "Reconcile criteria" },
];

const periods = {
  MIPS: ["eCQM 2026 Analytics Calendar 2026", "CQM 2025 Performance Year", "eCQM 2025 Performance Year"],
  MVP: ["CQM 2026 Analytics Calendar 2026", "eCQM 2026 Analytics Calendar 2026", "eCQM CQM 2025 Analytics Calendar 2025", "eCQM CQM 2025 Analytics Calendar 2026"],
  APP: ["APP 2025 Performance Year", "APP 2026 Preview"],
  APPPLUS: ["eCQM 2026 Analytics Calendar 2026", "APP Plus 2025 Performance Year", "APP Plus 2026 Preview"],
  QRDA: ["CY2025", "CY2026 Preview"],
  HQR: ["Hospital Quality Reporting CY2026 Preview", "Hospital IQR CY2025 Submission", "Hospital eCQM CY2026 Preview"],
};

const performanceRows = {
  MIPS: [
    { name: "Hyperion Health System", period: "eCQM 2026 Analytics Calendar 2026", quality: "59% (17.6 out of 30)", providers: 61 },
  ],
  MVP: [
    { participation: "Subgroup", name: "ZzMVP2", mvp: "Heart Disease", period: "eCQM 2026 Analytics Calendar 2026", quality: "40% (11.9 out of 30)", providers: 45 },
    { participation: "Subgroup", name: "ZzMVP3", mvp: "Women's Health", period: "eCQM 2026 Analytics Calendar 2026", quality: "55% (16.65 out of 30)", providers: 45 },
    { participation: "Subgroup", name: "ZzMVP4", mvp: "Infectious Disease, Immunology", period: "eCQM 2026 Analytics Calendar 2026", quality: "37% (11.18 out of 30)", providers: 45 },
    { participation: "Subgroup", name: "ZzMVP5", mvp: "Mental Health, Behavioral Health, Psychiatry", period: "eCQM 2026 Analytics Calendar 2026", quality: "41% (12.3 out of 30)", providers: 53 },
  ],
  APP: [
    { name: "ACO Entity View Test", period: "APP 2025 Performance Year", quality: "loading", providers: 0 },
    { name: "TIN 1: CernerDemo", period: "APP 2025 Performance Year", quality: "loading", providers: 0 },
  ],
  APPPLUS: [
    { name: "CCPM Community Care Partnership of Maine", period: "eCQM 2026 Analytics Calendar 2026", quality: "30% (15.1 out of 50)", tins: 0 },
  ],
  HQR: [
    { name: "Hyperion Health System", period: "Hospital Quality Reporting CY2026 Preview", quality: "86% readiness", providers: 0 },
    { name: "Northern Coast Medical Center", period: "Hospital IQR CY2025 Submission", quality: "74% readiness", providers: 0 },
  ],
};

const submissions = {
  MIPS: {
    Group: [
      { name: "Hyperion Health System", practice: "Hyperion Health System", tin: "3130ccdb", composite: "72.4", quality: "72.4", pi: "pending", ia: "pending" },
      { name: "MIPS Org View Test", practice: "MIPS Org View Test", tin: "000011111", composite: "loading", quality: "FROZEN", pi: "loading", ia: "loading" },
      { name: "TIN 1: CernerDemo", practice: "TIN 1: CernerDemo", tin: "000000011", composite: "loading", quality: "loading", pi: "loading", ia: "loading" },
      { name: "TIN 3: CernerDemo", practice: "TIN 3: CernerDemo", tin: "000988985", composite: "loading", quality: "loading", pi: "loading", ia: "loading" },
      { name: "TIN 4: CernerDemo", practice: "TIN 4: CernerDemo", tin: "000989984", composite: "loading", quality: "loading", pi: "loading", ia: "loading" },
    ],
    Individual: [
      { name: "Individual Submission - Jane Clinician", practice: "TIN 1: CernerDemo", tin: "NPI 1942000000", composite: "draft", quality: "0.0", pi: "pending", ia: "pending" },
    ],
  },
  MVP: {
    Group: [],
    Individual: [],
    Subgroup: [
      { name: "ZzMVP2", practice: "ZzMVP2", tin: "SG-00000002", composite: "40%", quality: "11.9 / 30", pi: "pending", ia: "pending" },
      { name: "ZzMVP3", practice: "ZzMVP3", tin: "SG-00000003", composite: "55%", quality: "16.65 / 30", pi: "pending", ia: "pending" },
    ],
  },
  APP: {
    Group: [
      { name: "APP Group Quality Submission", practice: "ACO Entity View Test", tin: "APM 1000001", composite: "draft", quality: "0.0", pi: "pending", ia: "pending" },
    ],
    Individual: [],
    "APM Entity": [],
  },
  APPPLUS: {
    Group: [
      { name: "CCPM Community Care Partnership of Maine", practice: "CCPM Community Care Partnership of Maine", tin: "0", composite: "30%", quality: "15.1 / 50", pi: "pending", ia: "pending" },
    ],
    Individual: [],
    "APM Entity": [],
  },
  HQR: {
    Hospital: [
      { name: "Hospital Quality eCQM Package", practice: "Hyperion Health System", tin: "CCN 200001", composite: "draft", quality: "86% readiness", pi: "not applicable", ia: "not applicable" },
      { name: "Hospital IQR Submission", practice: "Northern Coast Medical Center", tin: "CCN 200114", composite: "review", quality: "74% readiness", pi: "not applicable", ia: "not applicable" },
    ],
  },
};

const measures = [
  { measure: "Breast Cancer Screening", id: "CMS125v14", ipp: "--", denomExclusions: "--", denom: "--", numerator: "--", exceptions: "--", notMet: "--", rate: "75.38%", score: "0.0", children: [
    { measure: "CMS125v14 - Breast Cancer Screening - Stratum 1", ipp: "579", denomExclusions: "4", denom: "575", numerator: "449", exceptions: "0", notMet: "126" },
    { measure: "CMS125v14 - Breast Cancer Screening - Stratum 2", ipp: "2266", denomExclusions: "71", denom: "2195", numerator: "1639", exceptions: "0", notMet: "556" },
  ] },
  { measure: "Cervical Cancer Screening", id: "CMS124v14", ipp: "2220", denomExclusions: "169", denom: "2051", numerator: "1084", exceptions: "0", notMet: "967", rate: "52.85%", score: "7.5" },
  { measure: "Chlamydia Screening in Women", id: "CMS153v14", ipp: "--", denomExclusions: "--", denom: "--", numerator: "--", exceptions: "--", notMet: "--", rate: "10.42%", score: "5.5", children: [
    { measure: "CMS153v14 - Chlamydia Screening in Women - Stratum 1", ipp: "42", denomExclusions: "2", denom: "40", numerator: "3", exceptions: "0", notMet: "37" },
    { measure: "CMS153v14 - Chlamydia Screening in Women - Stratum 2", ipp: "60", denomExclusions: "4", denom: "56", numerator: "7", exceptions: "0", notMet: "49" },
  ] },
  { measure: "Colorectal Cancer Screening", id: "CMS130v14", ipp: "--", denomExclusions: "--", denom: "--", numerator: "--", exceptions: "--", notMet: "--", rate: "74.25%", score: "0.0", children: [
    { measure: "CMS130v14 - Colorectal Cancer Screening - Stratum 1", ipp: "435", denomExclusions: "2", denom: "433", numerator: "282", exceptions: "0", notMet: "151" },
    { measure: "CMS130v14 - Colorectal Cancer Screening - Stratum 2", ipp: "4437", denomExclusions: "167", denom: "4270", numerator: "3210", exceptions: "0", notMet: "1060" },
  ] },
  { measure: "Controlling High Blood Pressure", id: "CMS165v14", ipp: "2660", denomExclusions: "268", denom: "2392", numerator: "1012", exceptions: "0", notMet: "1380", rate: "42.31%", score: "1.9" },
  { measure: "Coronary Artery Disease (CAD): Beta-Blocker Therapy - Prior Myocardial Infarction (MI) or Left Ventricular Systolic Dysfunction (LVEF <=40%)", id: "CMS145v14", ipp: "--", denomExclusions: "--", denom: "--", numerator: "--", exceptions: "--", notMet: "--", rate: "53.7%", score: "1.0", children: [
    { measure: "CMS145v14 - Coronary Artery Disease (CAD): Beta-Blocker Therapy - Prior Myocardial Infarction (MI) - Population 2 - Group", ipp: "444", denomExclusions: "0", denom: "0", numerator: "0", exceptions: "0", notMet: "0" },
  ] },
  { measure: "Preventive Care and Screening: Body Mass Index (BMI) Screening", id: "CMS69v14", ipp: "7778", denomExclusions: "100", denom: "7678", numerator: "2110", exceptions: "0", notMet: "5568", rate: "27.48%", score: "1.9" },
];

const mvpScorecards = {
  ZzMVP2: {
    mvpId: "G0055",
    subgroupId: "SG-00000002",
    measures: [
      { measure: "Coronary Artery Disease (CAD): Beta-Blocker Therapy - Prior Myocardial Infarction (MI) or Left Ventricular Systolic Dysfunction (LVEF <= 40%)", id: "CMS145v14", ipp: "--", denomExclusions: "--", denom: "--", numerator: "--", exceptions: "--", notMet: "--", rate: "52.83%", score: "1.0", children: [
        { measure: "CMS145v14 - Coronary Artery Disease (CAD): Beta-Blocker Therapy-Left Ventricular Systolic Dysfunction (LVEF <=40%) - Population 1 - Group", ipp: "434", denomExclusions: "0", denom: "0", numerator: "0", exceptions: "0", notMet: "0" },
      ] },
    ],
  },
  ZzMVP3: {
    mvpId: "M1366",
    subgroupId: "SG-00000003",
    measures: [
      { measure: "Chlamydia Screening in Women", id: "CMS153v14", ipp: "--", denomExclusions: "--", denom: "--", numerator: "--", exceptions: "--", notMet: "--", rate: "10.42%", score: "5.5", children: [
        { measure: "CMS153v14 - Chlamydia Screening in Women - Stratum 1", ipp: "42", denomExclusions: "2", denom: "40", numerator: "3", exceptions: "0", notMet: "37" },
        { measure: "CMS153v14 - Chlamydia Screening in Women - Stratum 2", ipp: "60", denomExclusions: "4", denom: "56", numerator: "7", exceptions: "0", notMet: "49" },
      ] },
    ],
  },
  ZzMVP4: {
    mvpId: "M1368",
    subgroupId: "SG-00000004",
    measures: [
      { measure: "Chlamydia Screening in Women", id: "CMS153v14", ipp: "--", denomExclusions: "--", denom: "--", numerator: "--", exceptions: "--", notMet: "--", rate: "9.64%", score: "5.4", children: [
        { measure: "CMS153v14 - Chlamydia Screening in Women - Stratum 1", ipp: "40", denomExclusions: "2", denom: "38", numerator: "3", exceptions: "0", notMet: "35" },
        { measure: "CMS153v14 - Chlamydia Screening in Women - Stratum 2", ipp: "47", denomExclusions: "2", denom: "45", numerator: "5", exceptions: "0", notMet: "40" },
      ] },
      { measure: "HIV Screening", id: "CMS349v8", ipp: "4366", denomExclusions: "0", denom: "4366", numerator: "3231", exceptions: "6", notMet: "1129", rate: "74.0%", score: "7.4" },
      { measure: "Preventive Care and Screening: Screening for Depression and Follow-Up Plan", id: "CMS2v15", ipp: "8057", denomExclusions: "238", denom: "7819", numerator: "6761", exceptions: "0", notMet: "1058", rate: "86.47%", score: "9.5" },
    ],
  },
  ZzMVP5: {
    mvpId: "M1369",
    subgroupId: "SG-00000005",
    measures: [
      { measure: "Preventive Care and Screening: Screening for Depression and Follow-Up Plan", id: "CMS2v15", ipp: "8057", denomExclusions: "238", denom: "7819", numerator: "6761", exceptions: "0", notMet: "1058", rate: "86.47%", score: "9.5" },
    ],
  },
};

const scorecardsByProgram = {
  MIPS: {
    "Hyperion Health System": {
      measures,
      entities: ["Hyperion Health System"],
    },
  },
  APPPLUS: {
    "CCPM Community Care Partnership of Maine": {
      measures: [
        measures[0],
        measures[3],
        measures[4],
      ],
      entities: ["CCPM Community Care Partnership of Maine"],
    },
  },
  HQR: {
    "Hyperion Health System": {
      measures: [
        measures[1],
        measures[3],
        measures[6],
      ],
      entities: ["Hyperion Health System", "Northern Coast Medical Center"],
    },
  },
};

const pathwayCards = [
  {
    title: "Traditional MIPS",
    text: "The original framework available to MIPS eligible clinicians for collecting and reporting data to MIPS. Performance is measured across Quality, Improvement Activities, Promoting Interoperability, and Cost.",
    buttons: [{ label: "Open MIPS", program: "MIPS" }],
  },
  {
    title: "MIPS Value Pathways (MVP)",
    text: "MVPs are one way to meet MIPS reporting requirements. MVPs include a subset of measures and activities tied to a specialty, clinical condition, or episode of care.",
    buttons: [{ label: "Open MVP", program: "MVP" }],
  },
  {
    title: "APM Performance Pathways (APP Plus)",
    text: "APM Performance Pathways provide predetermined measure sets for MIPS APM participants. APP Plus supports expanded quality measure reporting for the 2025 performance period and preview workflows.",
    buttons: [{ label: "Open APP Plus", program: "APPPLUS" }],
  },
  {
    title: "Quality Reporting Document Architecture (QRDA)",
    text: "QRDA supports Category I and Category III file generation for program, scope, and performance-period based quality data exchange.",
    buttons: [{ label: "Open QRDA", program: "QRDA" }],
  },
];

const navByProgram = {
  MIPS: ["Performance", "Submissions", "Group", "Individual", "Upload", "Provider Profile", "Flow Map"],
  MVP: ["Performance", "Submissions", "Group", "Individual", "Subgroup", "Upload", "Flow Map"],
  APP: ["Performance", "Submissions", "Group", "Individual", "APM Entity", "Upload", "Flow Map"],
  APPPLUS: ["Performance", "Submissions", "Group", "Individual", "APM Entity", "Upload", "Flow Map"],
  QRDA: ["Export QRDA", "Generated QRDA Files", "Flow Map"],
  HQR: ["Performance", "Submissions", "Hospital", "Upload", "Flow Map"],
};

const programSelect = document.getElementById("programSelect");
const labModeSelect = document.getElementById("labModeSelect");
const scenarioSelect = document.getElementById("scenarioSelect");
const runScenarioButton = document.getElementById("runScenarioButton");
const prototypeFaqMenu = document.getElementById("prototypeFaqMenu");
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const toast = document.getElementById("toast");

programSelect.addEventListener("change", (event) => {
  setProgram(event.target.value, event.target.value === "QRDA" ? "export-qrda" : "performance");
});

document.querySelector(".brand").addEventListener("click", () => {
  state.route = "home";
  render();
});

labModeSelect.addEventListener("change", (event) => {
  state.labMode = event.target.value;
  state.labStep = 0;
  state.visionRoute = "home";
  state.visionStrategyLocked = false;
  applyScenario(state.scenario, state.labMode === "production");
});

scenarioSelect.addEventListener("change", (event) => {
  state.scenario = event.target.value;
  state.labStep = 0;
  state.visionRoute = "home";
  state.visionStrategyLocked = false;
  resetMvpSpecialtySelection();
  if (state.labMode === "production") {
    applyScenario(state.scenario, true);
  } else {
    render();
  }
});

runScenarioButton.addEventListener("click", () => {
  applyScenario(state.scenario, state.labMode === "production");
});

document.querySelectorAll("[data-global-faq]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.globalFaq;
    const stageIndex = target === "current" ? state.labStep : visionStages.findIndex((stage) => stage.id === target);
    state.labMode = "vision";
    state.labStep = stageIndex >= 0 ? stageIndex : 0;
    state.visionRoute = "phase-faq";
    labModeSelect.value = state.labMode;
    prototypeFaqMenu?.removeAttribute("open");
    render();
  });
});

function setProgram(program, route = "performance") {
  state.program = program;
  state.route = route;
  state.selectedOrg = null;
  state.selectedSubmission = null;
  state.selectedSubmissionScope = null;
  state.selectedIndividualGroup = "";
  state.selectedIndividualClinician = "";
  state.scoreTab = "Summary";
  programSelect.value = program;
  render();
}

function setRoute(route) {
  state.route = route;
  state.selectedOrg = null;
  state.selectedSubmission = null;
  state.selectedSubmissionScope = route.startsWith("submissions-") ? route.replace("submissions-", "") : null;
  state.scoreTab = "Summary";
  render();
}

function resetMvpSpecialtySelection() {
  state.mvpSpecialty = null;
  state.mvpSpecialties = null;
  state.practiceComposition = "multi";
}

function applyScenario(scenarioKey, mutateProductionRoute) {
  const scenario = scenarioDefinitions[scenarioKey];
  if (!scenario) return;
  state.scenario = scenarioKey;
  state.labStep = 0;
  state.visionRoute = "home";
  state.visionStrategyLocked = false;
  resetMvpSpecialtySelection();
  scenarioSelect.value = scenarioKey;
  labModeSelect.value = state.labMode;
  if (mutateProductionRoute) {
    state.program = scenario.program;
    state.route = scenario.route;
    state.selectedOrg = scenario.selectedOrg;
    state.selectedSubmission = null;
    state.selectedSubmissionScope = scenario.route.startsWith("submissions-") ? scenario.route.replace("submissions-", "") : null;
    state.selectedIndividualGroup = scenarioKey === "mvp-individual" ? "" : state.selectedIndividualGroup;
    state.selectedIndividualClinician = "";
    state.scoreTab = "Summary";
    programSelect.value = scenario.program;
  }
  render();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function render() {
  labModeSelect.value = state.labMode;
  scenarioSelect.value = state.scenario;
  content.classList.remove("flush");
  content.classList.remove("vision-mode-content");
  if (state.labMode !== "production") {
    return renderDesignLab();
  }
  document.querySelector(".app-shell").classList.remove("design-lab-mode");
  const isHome = state.route === "home";
  document.querySelector(".body-grid").classList.toggle("home-mode", isHome);
  document.querySelector(".app-shell").classList.toggle("home-mode", isHome);
  renderSidebar();
  if (state.route === "home") return renderHome();
  if (state.route === "performance") return renderPerformance();
  if (state.route === "performance-detail") return renderPerformanceDetail();
  if (state.route === "submissions-overview") return renderSubmissionsOverview();
  if (state.route.startsWith("submissions-")) return renderSubmissions(state.route.replace("submissions-", ""));
  if (state.route === "submission-detail") return renderSubmissionDetail();
  if (state.route === "new-submission") return renderNewSubmission();
  if (state.route === "upload") return renderUpload();
  if (state.route === "provider-profile") return renderProviderProfile();
  if (state.route === "export-qrda") return renderQrdaExport();
  if (state.route === "generated-qrda-files") return renderQrdaFiles();
  if (state.route === "flow-map") return renderFlowMap();
}

function renderSidebar() {
  if (state.route === "home") {
    sidebar.innerHTML = "";
    return;
  }
  const items = navByProgram[state.program];
  const active = routeLabel(state.route);
  sidebar.innerHTML = `
    <div class="program-title">${programLabel(state.program)}</div>
    <nav class="nav-list" aria-label="${programLabel(state.program)} navigation">
      ${items.map((item) => navButton(item, active)).join("")}
    </nav>
    <div class="nav-spacer"></div>
    <div class="engine"><strong>${state.program === "QRDA" ? "QRDA EXPORT ENGINE" : state.program + " SCORING ENGINE"}</strong>ORACLE</div>
  `;
  sidebar.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => setRoute(navRoute(button.dataset.nav)));
  });
}

function navButton(item, active) {
  const child = ["Group", "Individual", "Subgroup", "APM Entity", "Hospital"].includes(item) ? " child" : "";
  const selected = item === active ? " active" : "";
  return `<button class="nav-item${child}${selected}" data-nav="${item}">${item}</button>`;
}

function navRoute(label) {
  const map = {
    Performance: "performance",
    Submissions: "submissions-overview",
    Group: "submissions-Group",
    Individual: "submissions-Individual",
    Subgroup: "submissions-Subgroup",
    "APM Entity": "submissions-APM Entity",
    Hospital: "submissions-Hospital",
    Upload: "upload",
    "Provider Profile": "provider-profile",
    "Export QRDA": "export-qrda",
    "Generated QRDA Files": "generated-qrda-files",
    "Flow Map": "flow-map",
  };
  return map[label] || "performance";
}

function routeLabel(route) {
  if (route === "performance" || route === "performance-detail") return "Performance";
  if (route.startsWith("submissions-") || route === "submission-detail" || route === "new-submission") return route.replace("submissions-", "");
  if (route === "upload") return "Upload";
  if (route === "provider-profile") return "Provider Profile";
  if (route === "export-qrda") return "Export QRDA";
  if (route === "generated-qrda-files") return "Generated QRDA Files";
  if (route === "flow-map") return "Flow Map";
  return "";
}

function programLabel(program) {
  if (program === "APPPLUS") return "APP Plus";
  if (program === "MVP") return "MVP Submission";
  if (program === "HQR") return "Hospital Quality Reporting";
  return program;
}

function submissionTitle(program) {
  if (program === "MVP") return "MVP Submission";
  if (program === "QRDA") return "QRDA Package";
  return `${programLabel(program)} Submission`;
}

function strategyTitle(program) {
  if (program === "MVP") return "MVP Submission Strategy";
  if (program === "HQR") return "Hospital Quality Reporting Strategy";
  return `${programLabel(program)} Submission Strategy`;
}

function scenarioCustomer(scenario) {
  return scenario.program === "APPPLUS" ? customerProfiles.ccpm : customerProfiles.zmdi;
}

function availablePrograms(profile) {
  return programOrder.filter((program) => profile.programs[program]?.status !== "hidden");
}

function programStatus(profile, program) {
  return profile.programs[program] || { status: "disabled", label: "Not configured", note: "This pathway is not part of the customer strategy." };
}

function currentMeasureProfile() {
  return state.program === "APPPLUS" || state.scenario === "appplus-score" ? measureInventoryProfiles.appplus : measureInventoryProfiles.zmdi;
}

function measureCounts(profile) {
  return profile.measures.reduce((counts, measure) => {
    counts.total += 1;
    counts[measure.owner] = (counts[measure.owner] || 0) + 1;
    counts[measure.type] = (counts[measure.type] || 0) + 1;
    if (measure.programs.length) counts.submissionSelected += 1;
    else counts.analyticsOnly += 1;
    measure.programs.forEach((program) => {
      counts.programs[program] = (counts.programs[program] || 0) + 1;
    });
    return counts;
  }, { total: 0, EC: 0, APM: 0, eCQM: 0, CQM: 0, submissionSelected: 0, analyticsOnly: 0, programs: {} });
}

function enabledSpecialties(profile) {
  return [...new Set(profile.measures.filter((measure) => measure.owner === "EC").map((measure) => measure.specialty))];
}

function enabledMeasureIds(profile = currentMeasureProfile()) {
  return new Set(profile.measures.map((measure) => measure.id));
}

function mvpMeasureFit(row, profile = currentMeasureProfile()) {
  const required = mvpMeasureRequirements[row.id] || [];
  const enabled = enabledMeasureIds(profile);
  if (!required.length) {
    return { status: "review", label: "Needs measure review", reason: "Measure fit must be confirmed before this MVP can be selected." };
  }
  const matched = required.filter((id) => enabled.has(id));
  if (matched.length === required.length) {
    return { status: "ready", label: "Recommended", reason: "Enabled measure coverage supports this MVP." };
  }
  if (matched.length > 0) {
    return { status: "partial", label: "Partial fit", reason: "Some supporting measures are enabled; review gaps before selecting." };
  }
  return { status: "blocked", label: "Not available", reason: "This MVP is not supported by the customer’s enabled measure set." };
}

function pathwayEligibility(profile = currentMeasureProfile()) {
  const counts = measureCounts(profile);
  const mvpMeasures = counts.programs.MVP || 0;
  const appPlusMeasures = counts.programs.APPPLUS || 0;
  const qrdaMeasures = counts.programs.QRDA || 0;
  const mipsMeasures = counts.programs.MIPS || 0;
  return {
    MVP: {
      status: mvpMeasures > 0 ? "recommended" : "hidden",
      label: mvpMeasures > 0 ? "Recommended" : "No MVP-selected measures",
      evidence: mvpMeasures > 0 ? "Best fit based on enabled clinician quality measures and specialty coverage." : "No supported MVP path found from this customer setup.",
      next: "Confirm practice composition, choose specialty focus, then pick a supported MVP.",
    },
    APPPLUS: {
      status: appPlusMeasures > 0 ? "recommended" : counts.EC > 0 ? "applicable" : "hidden",
      label: appPlusMeasures > 0 ? "Primary" : counts.EC > 0 ? "Available if APM entity applies" : "Not applicable",
      evidence: appPlusMeasures > 0 ? "Customer has APM Entity reporting signals." : counts.EC > 0 ? "Available only if APM Entity participation applies." : "Not supported by this customer setup.",
      next: "Confirm APM Entity participation and APP Plus measure package.",
    },
    QRDA: {
      status: qrdaMeasures > 0 ? "applicable" : "hidden",
      label: qrdaMeasures > 0 ? "Export path" : "No QRDA-selected measures",
      evidence: qrdaMeasures > 0 ? "Export is available for supported clinician/APM submission packages." : "No supported QRDA export path found.",
      next: "Generate QRDA I/III files for the selected path and scope.",
    },
    MIPS: {
      status: mipsMeasures > 0 ? "transition" : "hidden",
      label: mipsMeasures > 0 ? "Transition only" : "No MIPS-selected measures",
      evidence: mipsMeasures > 0 ? "Legacy context only while Traditional MIPS retires." : "No legacy MIPS context needed.",
      next: "Keep as reference; steer new decisions toward MVP where possible.",
    },
  };
}

function availableProgramsFromMeasures(profile = currentMeasureProfile()) {
  const eligibility = pathwayEligibility(profile);
  return programOrder.filter((program) => eligibility[program]?.status !== "hidden");
}

function eligibilityRank(status) {
  const order = { recommended: 0, applicable: 1, transition: 2, hidden: 3 };
  return order[status] ?? 4;
}

function sortedEligiblePrograms(profile = currentMeasureProfile()) {
  const eligibility = pathwayEligibility(profile);
  return availableProgramsFromMeasures(profile).sort((a, b) => eligibilityRank(eligibility[a].status) - eligibilityRank(eligibility[b].status));
}

function pathwayEligibilityClass(status) {
  if (status === "recommended") return "ok";
  if (status === "applicable") return "";
  if (status === "transition") return "warn";
  return "disabled";
}

function firstEligibleProgram(profile = currentMeasureProfile()) {
  return sortedEligiblePrograms(profile)[0] || "MVP";
}

function selectedIndividualGroup() {
  return mvpIndividualGroups.find((group) => group.id === state.selectedIndividualGroup) || null;
}

function cliniciansForSelectedGroup() {
  return state.selectedIndividualGroup ? (mvpIndividualClinicians[state.selectedIndividualGroup] || []) : [];
}

function selectedIndividualClinician() {
  return cliniciansForSelectedGroup().find((clinician) => clinician.npi === state.selectedIndividualClinician) || null;
}

function individualDraftName() {
  const clinician = selectedIndividualClinician();
  return clinician ? `Individual MVP Draft - ${clinician.name}` : "Individual MVP Draft";
}

function statusLabel(status) {
  const labels = {
    active: "Active",
    legacy: "Transition",
    disabled: "Unavailable",
    hidden: "Hidden",
    recommended: "Recommended",
    applicable: "Applicable",
    transition: "Transition",
  };
  return labels[status] || status;
}

function currentWorkflow(scenario) {
  const steps = workflowSteps(scenario);
  const index = Math.min(state.labStep, steps.length - 1);
  return { steps, index, step: steps[index] };
}

function workflowPercent(workflow) {
  return Math.round(((workflow.index + 1) / workflow.steps.length) * 100);
}

function workflowBadge(index) {
  return ["Start", "Choose", "Validate", "Package", "Track"][index] || `Step ${index + 1}`;
}

function renderGuidedChecklist(scenario, options = {}) {
  const workflow = currentWorkflow(scenario);
  const percent = workflowPercent(workflow);
  return `
    <section class="guided-checklist ${options.compact ? "compact" : ""}">
      <div class="checklist-topline">
        <div>
          <span class="eyebrow">Primary Workflow</span>
          <strong>Start here: ${workflow.step.title}</strong>
        </div>
        <span>${percent}% complete</span>
      </div>
      <div class="progress-track" aria-label="${percent}% complete">
        <div style="width: ${percent}%"></div>
      </div>
      <ol>
        ${workflow.steps.map((step, index) => `
          <li class="${index === workflow.index ? "active" : index < workflow.index ? "complete" : ""}">
            <button data-lab-step="${index}">
              <span>${index < workflow.index ? "Done" : workflowBadge(index)}</span>
              <strong>${step.title}</strong>
            </button>
          </li>
        `).join("")}
      </ol>
    </section>
  `;
}

function renderCustomerPhaseGuide(scenario, options = {}) {
  const workflow = currentWorkflow(scenario);
  const activeIndex = Math.min(workflow.index, customerPhaseSteps.length - 1);
  const percent = workflowPercent(workflow);
  return `
    <section class="customer-phase-guide primary-sequence ${options.compact ? "compact" : ""}">
      <div class="phase-guide-title">
        <div>
          <span class="eyebrow">Customer Action Plan</span>
          <h3>Start here: Step ${activeIndex + 1}: ${customerPhaseSteps[activeIndex].phase}</h3>
          <p>${customerPhaseSteps[activeIndex].title}. ${customerPhaseSteps[activeIndex].decision}</p>
        </div>
        <span>${percent}% complete</span>
      </div>
      <div class="progress-track" aria-label="${percent}% complete">
        <div style="width: ${percent}%"></div>
      </div>
      <div class="phase-card-row">
        ${customerPhaseSteps.map((step, index) => `
          <article class="${index === activeIndex ? "active" : index < activeIndex ? "complete" : "locked"}">
            <div class="step-card-top">
              <span>Step ${index + 1}</span>
              <em>${step.phase}</em>
            </div>
            <strong>${step.title}</strong>
            <p>${step.decision}</p>
            <em>${step.evidence}</em>
            <small>${index < activeIndex ? "Completed" : index === activeIndex ? "Current step" : `Locked until Step ${index} is complete`}</small>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function scenarioDefaultSpecialty(scenario) {
  if (state.scenario === "mvp-zmvp4") return "Infectious Disease";
  if (state.scenario === "mvp-individual") return "Cardiology";
  if (state.scenario === "new-submission") return "Infectious Disease";
  if (scenario.selectedOrg === "ZzMVP2") return "Cardiology";
  if (scenario.selectedOrg === "ZzMVP3") return "Gynecology";
  if (scenario.selectedOrg === "ZzMVP5") return "Mental Health";
  return "All Specialties";
}

function scenarioDefaultSpecialties(scenario) {
  if (state.scenario === "mvp-zmvp4") return ["Infectious Disease", "Mental Health", "Cardiology"];
  if (state.scenario === "new-submission") return ["Infectious Disease", "Mental Health"];
  const specialty = scenarioDefaultSpecialty(scenario);
  return specialty === "All Specialties" ? ["Primary Care"] : [specialty];
}

function selectedPracticeComposition() {
  return state.practiceComposition || "multi";
}

function selectedMvpSpecialty(scenario) {
  return selectedMvpSpecialties(scenario)[0] || scenarioDefaultSpecialty(scenario);
}

function selectedMvpSpecialties(scenario) {
  if (Array.isArray(state.mvpSpecialties) && state.mvpSpecialties.length) return state.mvpSpecialties;
  if (state.mvpSpecialty) return [state.mvpSpecialty];
  return selectedPracticeComposition() === "multi" ? scenarioDefaultSpecialties(scenario) : [scenarioDefaultSpecialty(scenario)];
}

function mvpSpecialtyOptions() {
  const options = new Set(["All Specialties"]);
  mvpCatalogRows.forEach((row) => row.specialties.forEach((specialty) => options.add(specialty)));
  return [...options].sort((a, b) => a === "All Specialties" ? -1 : b === "All Specialties" ? 1 : a.localeCompare(b));
}

function mvpClinicalSpecialtyOptions() {
  return mvpSpecialtyOptions().filter((option) => option !== "All Specialties");
}

function matchesSpecialty(row, specialty) {
  return specialty === "All Specialties" || row.specialties.includes(specialty);
}

function matchesAnySpecialty(row, specialties) {
  return !specialties.length || specialties.includes("All Specialties") || specialties.some((specialty) => row.specialties.includes(specialty));
}

function recommendedMvpRows(scenario) {
  const specialties = selectedMvpSpecialties(scenario);
  const exact = mvpCatalogRows.filter((row) => matchesAnySpecialty(row, specialties));
  const source = exact.length ? exact : mvpCatalogRows;
  return source.slice().sort((a, b) => {
    const aMatch = matchesAnySpecialty(a, specialties) ? 0 : 1;
    const bMatch = matchesAnySpecialty(b, specialties) ? 0 : 1;
    if (aMatch !== bMatch) return aMatch - bMatch;
    const fitOrder = { ready: 0, partial: 1, review: 2, blocked: 3 };
    const fitDelta = (fitOrder[mvpMeasureFit(a).status] ?? 4) - (fitOrder[mvpMeasureFit(b).status] ?? 4);
    if (fitDelta !== 0) return fitDelta;
    const order = { Recommended: 0, Candidate: 1, "Needs review": 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });
}

function renderProviderAssignmentPlanner(scenario, options = {}) {
  const specialties = selectedMvpSpecialties(scenario);
  const rows = providerAssignmentRows.filter((row) => specialties.includes("All Specialties") || specialties.includes(row.specialty));
  const visibleRows = (rows.length ? rows : providerAssignmentRows).slice(0, options.compact ? 3 : 6);
  return `
    <section class="provider-assignment-planner ${options.compact ? "compact" : ""}">
      <div class="phase-guide-title">
        <div>
          <span class="eyebrow">MVP Assignment Planning</span>
          <h3>Choose specialty, then assign providers to an MVP</h3>
          <p>The facility selects the specialty/MVP context. TIN/NPI tells us roster and eligibility, but it is not enough to infer specialty or the best MVP.</p>
        </div>
        <span>TIN/NPI based</span>
      </div>
      <div class="assignment-practice-note">
        <strong>Preloaded input</strong>
        <span>TIN/NPI eligibility, provider roster, and historical measure performance are loaded. Specialty and MVP intent are customer-selected inputs.</span>
      </div>
      <div class="assignment-table-wrap">
        <table class="assignment-table">
          <thead>
            <tr>
              <th>Specialty</th>
              <th>Cohort</th>
              <th>TIN/NPI Basis</th>
              <th>Recommended Level</th>
              <th>MVP</th>
              <th>Rationale</th>
            </tr>
          </thead>
          <tbody>
            ${visibleRows.map((row) => `
              <tr>
                <td><strong>${row.specialty}</strong></td>
                <td>${row.cohort}</td>
                <td>${row.tinNpi}</td>
                <td><span class="status-chip ready">${row.recommendedLevel}</span></td>
                <td><strong>${row.mvpId}</strong><span class="subline">${row.mvpName}</span></td>
                <td>${row.rationale}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function selectedSpecialtySummary(scenario) {
  const specialties = selectedMvpSpecialties(scenario);
  return specialties.length > 2 ? `${specialties.slice(0, 2).join(", ")} +${specialties.length - 2}` : specialties.join(", ");
}

function renderPracticeSpecialtyGate(scenario, options = {}) {
  const composition = selectedPracticeComposition();
  const specialties = selectedMvpSpecialties(scenario);
  const specialtyOptions = mvpClinicalSpecialtyOptions();
  const singleSpecialty = selectedMvpSpecialty(scenario);
  return `
    <section class="practice-specialty-gate ${composition} ${options.compact ? "compact" : ""}">
      <div class="phase-guide-title">
        <div>
          <span class="eyebrow">Step 1: Practice Composition</span>
          <h3>Is the practice single-specialty or multi-specialty?</h3>
          <p>This is the first MVP routing decision. It determines whether the customer selects one specialty or several specialties before the MVP submission list is narrowed.</p>
        </div>
        <span>${composition === "single" ? "Single-specialty" : "Multi-specialty"} basis</span>
      </div>
      <div class="composition-toggle" role="radiogroup" aria-label="Practice composition">
        <label class="${composition === "single" ? "selected" : ""}">
          <input type="radio" name="practice-composition" value="single" data-practice-composition${composition === "single" ? " checked" : ""} />
          <strong>Single-specialty</strong>
          <span>Choose one specialty and show matching MVPs.</span>
        </label>
        <label class="${composition === "multi" ? "selected" : ""}">
          <input type="radio" name="practice-composition" value="multi" data-practice-composition${composition === "multi" ? " checked" : ""} />
          <strong>Multi-specialty</strong>
          <span>Choose all applicable specialties and show MVPs that fit any selected specialty.</span>
        </label>
      </div>
      ${composition === "single" ? `
        <label class="single-specialty-select">
          Step 2: Specialty
          <select data-mvp-specialty aria-label="Single specialty">
            ${specialtyOptions.map((option) => `<option value="${option}"${option === singleSpecialty ? " selected" : ""}>${option}</option>`).join("")}
          </select>
        </label>
      ` : `
        <div class="specialty-check-grid" aria-label="Selected specialties">
          <div>
            <span>Step 2: Specialties</span>
            <strong>${specialties.length} selected</strong>
          </div>
          ${specialtyOptions.map((option) => `
            <label class="${specialties.includes(option) ? "checked" : ""}">
              <input type="checkbox" value="${option}" data-mvp-specialty-option${specialties.includes(option) ? " checked" : ""} />
              <span>${option}</span>
            </label>
          `).join("")}
        </div>
      `}
    </section>
  `;
}

function renderMvpReportingLevelRules(options = {}) {
  return `
    <section class="mvp-reporting-rules ${options.compact ? "compact" : ""}">
      <div class="phase-guide-title">
        <div>
          <span class="eyebrow">MVP Reporting Level Rules</span>
          <h3>Group reporting depends on specialty mix and small-practice status</h3>
          <p>Use this decision table before enabling a group MVP package for the selected facility.</p>
        </div>
        <span>PY 2026 rule</span>
      </div>
      <div class="assignment-table-wrap">
        <table class="assignment-table">
          <thead>
            <tr><th>Level</th><th>Status</th><th>Rule</th><th>Prototype Decision</th></tr>
          </thead>
          <tbody>
            ${mvpReportingLevelRules.map((row) => `
              <tr>
                <td><strong>${row.level}</strong></td>
                <td><span class="status-chip ${row.status.includes("Blocked") ? "warn" : "ready"}">${row.status}</span></td>
                <td>${row.rule}</td>
                <td>${row.userDecision}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSubgroupCompositionForm(options = {}) {
  return `
    <section class="subgroup-composition ${options.compact ? "compact" : ""}">
      <div class="phase-guide-title">
        <div>
          <span class="eyebrow">CMS Registration Input</span>
          <h3>Subgroup composition and rationale</h3>
          <p>Capture why these clinicians belong together before registration or provider assignment is locked.</p>
        </div>
        <span>Informational narrative</span>
      </div>
      <div class="composition-grid">
        <label>
          Subgroup composition
          <select aria-label="Subgroup composition">
            <option>Single-specialty subgroup</option>
            <option selected>Multispecialty subgroup</option>
          </select>
        </label>
        <label>
          Registration name
          <input value="West Side Musculoskeletal Care Subgroup" aria-label="Subgroup registration name" />
        </label>
        <label>
          Clinicians included
          <input value="Orthopedic surgeons, physical therapists, NPs, associated clinicians" aria-label="Clinicians included" />
        </label>
      </div>
      <label class="composition-narrative">
        Subgroup Composition Narrative <span>(for informational purposes only)</span>
        <textarea aria-label="Subgroup composition narrative">This subgroup represents our west side practice, which uses one EHR platform and collaborates on patient care across orthopedic surgeons, physical therapists, nurse practitioners (NPs), and other associated clinicians.</textarea>
      </label>
      <div class="composition-example">
        <strong>CMS-style example</strong>
        <span>Describe and provide rationale for how the facility chose which clinicians to include in the subgroup, such as shared practice location, EHR platform, patient population, care team, or specialty focus.</span>
      </div>
    </section>
  `;
}

function mvpForecastRowsForSpecialties(specialties) {
  const rows = specialties.includes("All Specialties") ? providerMvpForecastRows : providerMvpForecastRows.filter((row) => specialties.includes(row.selectedSpecialty));
  return rows.length ? rows : providerMvpForecastRows.slice(0, 4);
}

function renderProviderMvpForecast(scenario, options = {}) {
  const specialties = selectedMvpSpecialties(scenario);
  const rows = mvpForecastRowsForSpecialties(specialties).slice(0, options.compact ? 3 : 7);
  const avgForecast = rows.length ? Math.round(rows.reduce((sum, row) => sum + Number(row.forecast), 0) / rows.length) : 0;
  return `
    <section class="provider-mvp-forecast ${options.compact ? "compact" : ""}">
      <div class="phase-guide-title">
        <div>
          <span class="eyebrow">Provider Performance Forecast</span>
          <h3>Forecast performance as providers are assigned to the selected MVP</h3>
          <p>Projected score uses the provider’s historical measure performance against the measures included in the selected MVP. Practice composition and specialties are selected by the facility.</p>
        </div>
        <span>${avgForecast}% projected avg</span>
      </div>
      <div class="forecast-controls">
        <label>Practice composition<select data-practice-composition-select aria-label="Forecast practice composition"><option value="single"${selectedPracticeComposition() === "single" ? " selected" : ""}>Single-specialty</option><option value="multi"${selectedPracticeComposition() === "multi" ? " selected" : ""}>Multi-specialty</option></select></label>
        <label>Selected specialties<input value="${selectedSpecialtySummary(scenario)}" aria-label="Selected specialty summary" readonly /></label>
        <label>Assignment mode<select aria-label="Assignment mode"><option>Subgroup recommended</option><option>Individual review</option><option>APM Entity if applicable</option><option>Group if allowed</option></select></label>
      </div>
      <div class="assignment-table-wrap">
        <table class="assignment-table forecast-table">
          <thead>
            <tr><th>Provider</th><th>Selected Specialty</th><th>MVP</th><th class="numeric">Current</th><th class="numeric">Forecast</th><th>Confidence</th><th>Performance Drivers</th><th></th></tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td><strong>${row.provider}</strong><span class="subline">NPI ${row.npi}</span></td>
                <td>${row.selectedSpecialty}</td>
                <td><strong>${row.mvpId}</strong><span class="subline">${row.mvpName}</span></td>
                <td class="numeric">${row.current}</td>
                <td class="numeric"><strong>${row.forecast}</strong><span class="subline">${row.delta}</span></td>
                <td><span class="status-chip ${row.confidence === "High" ? "ready" : "warn"}">${row.confidence}</span></td>
                <td>${row.gaps}</td>
                <td><button class="link" data-toast="${row.provider} assigned to ${row.mvpId} forecast cohort">Assign</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderMvpSelectionWorkbench(scenario, options = {}) {
  const active = scenario.program === "MVP" || state.scenario.startsWith("mvp") || state.scenario === "new-submission";
  const specialties = selectedMvpSpecialties(scenario);
  const specialtySummary = selectedSpecialtySummary(scenario);
  const filteredRows = recommendedMvpRows(scenario);
  const visibleRows = options.compact ? filteredRows.slice(0, 3) : filteredRows;
  const supportedCount = visibleRows.filter((row) => ["ready", "partial"].includes(mvpMeasureFit(row).status)).length;
  const unavailableCount = visibleRows.filter((row) => mvpMeasureFit(row).status === "blocked").length;
  return `
    <section class="mvp-selection-workbench ${active ? "active" : ""} ${options.compact ? "compact" : ""}">
      <div class="mvp-selector-heading">
        <div>
          <span class="eyebrow">MVP Submission Decision</span>
          <h3>Facility chooses composition, specialties, MVP, measures, and reporting level</h3>
          <p>The prototype does not infer specialty from TIN/NPI. The facility first declares whether the practice is single-specialty or multi-specialty, then selects the applicable specialties to narrow the MVP submission list.</p>
        </div>
        <div class="mvp-rule-card">
          <span>Rule of thumb</span>
          <strong>Composition comes first.</strong>
          <em>TIN/NPI supports roster and eligibility; it does not choose the MVP. Group reporting depends on specialty mix and small-practice status.</em>
        </div>
      </div>
      ${renderPracticeSpecialtyGate(scenario, { compact: options.compact })}
      <div class="mvp-choice-controls">
        <label>Step 3: MVP reporting level<select><option>Subgroup</option><option>Individual</option><option>APM Entity</option><option>Group if allowed</option></select></label>
        <label>Step 4: Measure mode<select><option>eCQM & CQM</option><option>eCQM</option><option>CQM</option></select></label>
        <button class="btn small" data-toast="MVP specialty fit recalculated">Recalculate Fit</button>
      </div>
      ${renderMvpReportingLevelRules({ compact: options.compact })}
      ${renderSubgroupCompositionForm({ compact: options.compact })}
      <div class="mvp-filter-summary">
        <strong>Recommended MVPs</strong>
        <span>${supportedCount} supported for ${specialtySummary}${unavailableCount ? `; ${unavailableCount} unavailable because of enabled-measure coverage` : ""}</span>
      </div>
      <div class="mvp-catalog-grid">
        ${visibleRows.map((row) => {
          const fit = mvpMeasureFit(row);
          const specialtyMatch = matchesAnySpecialty(row, specialties);
          const disabled = fit.status === "blocked";
          return `
          <article class="mvp-candidate ${specialtyMatch && !disabled ? "recommended" : ""} ${fit.status} ${row.status === "Needs review" ? "review" : ""}">
            <div>
              <span>${row.id}</span>
              <strong>${row.name}</strong>
              <em>${row.specialties.join(", ")}</em>
            </div>
            <dl>
              <div><dt>Fit</dt><dd>${row.currentFit}</dd></div>
              <div><dt>Providers</dt><dd>${row.providers}</dd></div>
              <div><dt>Readiness</dt><dd>${fit.reason}</dd></div>
            </dl>
            <div class="mvp-candidate-footer">
              <span class="status-chip ${fit.status === "ready" ? "ready" : fit.status === "blocked" ? "disabled" : "warn"}">${fit.label}</span>
              <button class="link" ${disabled ? "disabled" : `data-toast="${row.id} selected for MVP submission planning"`}>${disabled ? "Unavailable" : row.action}</button>
            </div>
          </article>
        `;
        }).join("")}
      </div>
      ${renderProviderMvpForecast(scenario, { compact: options.compact })}
    </section>
  `;
}

function periodSelect(extraClass = "", selectedValue = null) {
  const selected = selectedValue || (state.program === "MVP" ? "eCQM 2026 Analytics Calendar 2026" : periods[state.program][0]);
  return `<select class="${extraClass}" aria-label="Performance period">${periods[state.program].map((p) => `<option${p === selected ? " selected" : ""}>${p}</option>`).join("")}</select>`;
}

function renderQppOAuthStatus(options = {}) {
  const connected = qppSession.status === "active";
  return `
    <div class="qpp-status ${connected ? "active" : "needed"} ${options.compact ? "compact" : ""}">
      <div>
        <span>CMS QPP OAuth</span>
        <strong>${connected ? `${qppSession.label} (${qppSession.remaining})` : "Login required for CMS session"}</strong>
        ${options.compact ? "" : `<em>${connected ? qppSession.user : "Connect before eCQM submit or approval."}</em>`}
      </div>
      <button class="${connected ? "lab-btn" : "btn"}" data-toast="${connected ? "CMS QPP session refreshed" : "CMS QPP OAuth login started"}">${connected ? "Refresh" : "Login to CMS QPP"}</button>
    </div>
  `;
}

function renderQualityModeControls() {
  return `
    <div class="quality-mode-row">
      ${renderQppOAuthStatus({ compact: true })}
      <label>
        Measure Type
        <select aria-label="Measure type">
          <option>eCQM & CQM</option>
          <option>eCQM</option>
          <option>CQM</option>
        </select>
      </label>
      <div class="search-control"><input placeholder="Search measures by name" /><button aria-label="Search">⌕</button></div>
    </div>
  `;
}

function renderUnifiedQualityPanel() {
  const ecqmMeasures = measures.slice(0, 3);
  const cqmMeasures = measures.slice(3, 6);
  return `
    <section class="quality-workbench">
      <div class="quality-tabs" role="tablist">
        <button class="active">Quality</button>
        <button disabled>PI</button>
        <button disabled>IA</button>
      </div>
      ${renderQualityModeControls()}
      <div class="quality-summary-strip">
        <div><span>Performance Period</span><strong>eCQM & CQM 2026 Analytics Calendar 2026</strong></div>
        <div><span>Performance Data Date</span><strong>Jul 14, 2026</strong></div>
        <div><span>Quality Score</span><strong>${state.program === "APPPLUS" ? "4% (2.0 out of 50)" : "0% (0.0 out of 30)"}</strong></div>
        <div><span>Status</span><strong>DRAFT</strong></div>
      </div>
      <h3>eCQM</h3>
      ${qualityMeasureRows(ecqmMeasures)}
      <h3>CQM</h3>
      ${qualityMeasureRows(cqmMeasures)}
    </section>
  `;
}

function qualityMeasureRows(measureList) {
  return `
    <div class="table-wrap compact-table">
      <table>
        <thead><tr><th>Measure</th><th>Measure ID</th><th>Outcome</th><th>High Priority</th><th class="numeric">Performance Rate</th><th class="numeric">Points</th></tr></thead>
        <tbody>
          ${measureList.map((measure, index) => `
            <tr>
              <td><strong>${measure.measure}</strong></td>
              <td>${measure.id.replace("CMS", "")}</td>
              <td>${index === 0 ? "Yes" : "No"}</td>
              <td>${index === 1 ? "Yes" : "No"}</td>
              <td class="numeric">${measure.rate}</td>
              <td class="numeric">${measure.score}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderMeasurePathwayMatrix(profile, options = {}) {
  const eligibility = pathwayEligibility(profile);
  const programs = options.showHidden ? programOrder : sortedEligiblePrograms(profile);
  return `
    <div class="measure-pathway-matrix ${options.compact ? "compact" : ""}">
      ${programs.map((program) => {
        const rule = eligibility[program];
        const visible = rule.status !== "hidden";
        return `
          <article class="measure-pathway ${rule.status} ${visible ? "" : "hidden-path"}">
            <div>
              <span class="status-pill ${pathwayEligibilityClass(rule.status)}">${statusLabel(rule.status)}</span>
              <h3>${programLabel(program)}</h3>
              <p>${rule.evidence}</p>
            </div>
            <em>${rule.next}</em>
            ${visible ? `<button class="btn small" data-open-eligible-program="${program}">Open Path</button>` : `<button class="btn small secondary" disabled>Not shown</button>`}
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderMeasureIntake() {
  const profile = currentMeasureProfile();
  const primaryProgram = firstEligibleProgram(profile);
  content.innerHTML = `
    <section class="content-inner measure-intake">
      <div class="intake-hero">
        <div>
          <span class="eyebrow">Path Finder</span>
          <h1>Find the customer’s submission path</h1>
          <p>The customer’s enabled measures, roster, TIN/NPI eligibility, and participation context are already loaded. The customer should only see the inferred path choices and the next decision.</p>
        </div>
        <div class="intake-selector">
          <dl>
            <div><dt>Customer</dt><dd>${profile.customerName}</dd></div>
            <div><dt>Measure owner mix</dt><dd>${profile.ownerType}</dd></div>
            <div><dt>Period</dt><dd>${profile.period}</dd></div>
            <div><dt>Last refresh</dt><dd>${profile.lastRefresh}</dd></div>
          </dl>
        </div>
      </div>
      ${renderSubmissionPathChecklist(profile)}
      <section class="intake-section">
        <div class="section-heading-row">
          <div>
            <span class="eyebrow">Recommended Paths</span>
            <h2>Paths inferred from the fixed customer setup</h2>
          </div>
          <button class="btn" data-continue-pathways>Continue to Pathway Selection</button>
        </div>
        ${renderMeasurePathwayMatrix(profile)}
      </section>
      <button class="btn secondary" data-open-eligible-program="${primaryProgram}">Open ${programLabel(primaryProgram)}</button>
    </section>
  `;
  bindMeasureIntakeControls();
}

function renderSubmissionPathChecklist(profile) {
  const primary = firstEligibleProgram(profile);
  return `
    <section class="path-finder-checklist" aria-label="Submission path checklist">
      <article class="complete">
        <span>Step 1</span>
        <strong>Customer setup loaded</strong>
        <p>Enabled measures, roster, TIN/NPI eligibility, and participation context are already known for this customer.</p>
      </article>
      <article class="active">
        <span>Step 2</span>
        <strong>Recommended path: ${programLabel(primary)}</strong>
        <p>The system narrows available paths from the customer’s fixed configuration. Unsupported paths are hidden or disabled.</p>
      </article>
      <article class="locked">
        <span>Step 3</span>
        <strong>Configure the selected path</strong>
        <p>For MVP, confirm practice composition, specialties, reporting level, subgroup rationale, and provider forecast.</p>
      </article>
      <article class="locked">
        <span>Step 4</span>
        <strong>Validate and submit</strong>
        <p>Freeze the package, confirm CMS QPP session, submit or export, and track receipt status.</p>
      </article>
    </section>
  `;
}

function renderMeasurePathwayQualifier(options = {}) {
  const profile = currentMeasureProfile();
  const titles = {
    command: "Path finder: start from what the customer already has enabled",
    hub: "Path finder: show only submission paths this customer can use",
    smart: "Smart path finder: infer the next best submission path",
  };
  const label = options.mode === "smart" ? "Smart Path Finder" : options.mode === "hub" ? "Submission Path Finder" : "Submission Path Finder";
  return `
    <section class="measure-qualifier ${options.compact ? "compact" : ""} ${options.mode || ""}">
      <div class="section-heading-row">
        <div>
          <span class="eyebrow">${label}</span>
          <h3>${titles[options.mode] || "Infer the customer’s submission path from known setup"}</h3>
          <p>Measures stay behind the scenes. The customer sees the recommended paths and the next decision they need to make.</p>
        </div>
      </div>
      ${renderSubmissionPathChecklist(profile)}
      ${renderMeasurePathwayMatrix(profile, { compact: true })}
    </section>
  `;
}

function renderHome() {
  content.innerHTML = `
    <section class="content-inner home-content">
      <div class="login-marker">LOGIN SCREEN!!</div>
      <h1>Select Oracle Health Data Submissions Pathways</h1>
      <p class="intro">The Quality Payment Program is changing how clinicians receive reimbursement from Medicare patients. This prototype maps the existing submission shell and leaves room for new paths as traditional MIPS evolves.</p>
      <p class="intro">The application operates as a Qualified Registry for reporting quality category data, previewing measure scores, creating submission-ready data, and sending information directly to CMS workflows.</p>
      <div class="pathway-grid">
        ${pathwayCards.map((card) => `
          <article class="pathway-card">
            <h2>${card.title}</h2>
            <p>${card.text}</p>
            <div class="button-row">${card.buttons.map((button) => `<button class="btn" data-program="${button.program}">${button.label}</button>`).join("")}</div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
  content.querySelectorAll("[data-program]").forEach((button) => {
    button.addEventListener("click", () => setProgram(button.dataset.program, button.dataset.program === "QRDA" ? "export-qrda" : "performance"));
  });
}

function bindMeasureIntakeControls(root = content) {
  root.querySelectorAll("[data-continue-pathways]").forEach((button) => {
    button.addEventListener("click", () => {
      state.route = "home";
      render();
    });
  });
  root.querySelectorAll("[data-open-eligible-program]").forEach((button) => {
    button.addEventListener("click", () => {
      const program = button.dataset.openEligibleProgram;
      setProgram(program, program === "QRDA" ? "export-qrda" : "performance");
    });
  });
}

function renderPerformance() {
  const rows = performanceRows[state.program] || [];
  content.classList.add("flush");
  content.innerHTML = `
    <section class="content-inner flush">
      <div class="toolbar">
        <h1>${programLabel(state.program)} Performance</h1>
        <div class="select-period">${periodSelect()}</div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              ${state.program === "MVP" ? "<th>Participation</th>" : ""}
              <th>Name</th>
              ${state.program === "MVP" ? "<th>MVP</th>" : ""}
              <th>Performance Period</th>
              <th class="numeric">Quality Score</th>
              <th class="numeric">${state.program === "APPPLUS" ? "TINs" : "Providers"}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map((row) => `
              <tr>
                ${state.program === "MVP" ? `<td>${row.participation || "Group"}</td>` : ""}
                <td><button class="link" data-org="${row.name}">${row.name}</button></td>
                ${state.program === "MVP" ? `<td>${row.mvp || "Value in Primary Care"}</td>` : ""}
                <td>${row.period}</td>
                <td class="numeric">${scoreCell(row.quality)}</td>
                <td class="numeric">${state.program === "APPPLUS" ? row.tins : row.providers}</td>
              </tr>
            `).join("") : `<tr><td colspan="${state.program === "MVP" ? 6 : 4}"><div class="empty-state">No scorecards found for the selected performance period</div></td></tr>`}
          </tbody>
        </table>
      </div>
      <div class="pager"><span>First</span><span>Previous</span><strong>1</strong><span>Next</span><span>Last</span></div>
    </section>
  `;
  content.querySelectorAll("[data-org]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedOrg = button.dataset.org;
      state.route = "performance-detail";
      render();
    });
  });
}

function renderPerformanceDetail() {
  const org = state.selectedOrg || "MIPS Org View Test";
  const isMvp = state.program === "MVP";
  const scorecard = isMvp ? (mvpScorecards[org] || mvpScorecards.ZzMVP2) : ((scorecardsByProgram[state.program] || {})[org] || { measures, entities: [org] });
  content.innerHTML = `
    <section class="content-inner flush">
      <button class="btn ghost" data-back="performance">Back to ${programLabel(state.program)} Performance</button>
      <div class="score-header">
        <div>
          <h1>View Scores for ${org}</h1>
          ${isMvp ? `<p class="score-meta"><strong>MVP ID:</strong> ${scorecard.mvpId}<br /><strong>Subgroup ID:</strong> ${scorecard.subgroupId}</p>` : ""}
        </div>
        ${scoreHeaderControls(org, scorecard)}
      </div>
      <div class="tabs">
        ${["Summary", "Details", "Exports"].map((tab) => `<button class="tab${state.scoreTab === tab ? " active" : ""}" data-score-tab="${tab}">${tab}</button>`).join("")}
      </div>
      ${renderScoreTabContent(scorecard, isMvp)}
    </section>
  `;
  content.querySelector("[data-score-entity]")?.addEventListener("change", (event) => {
    state.selectedOrg = event.target.value;
    render();
  });
  content.querySelectorAll("[data-score-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.scoreTab = button.dataset.scoreTab;
      render();
    });
  });
  bindBackButtons();
  bindToastButtons();
}

function renderScoreTabContent(scorecard, isMvp) {
  if (state.scoreTab === "Details") {
    return `
      <h2>Measure Details</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Measure</th><th>Population</th><th>Supporting Facts</th><th>Last Calculated</th><th>Status</th></tr></thead>
          <tbody>
            ${scorecard.measures.slice(0, 5).map((measure) => `
              <tr><td>${measure.measure}</td><td>${measure.id}</td><td>${measure.children ? measure.children.length + " strata" : "Aggregate measure"}</td><td>2026-07-15</td><td><span class="status-pill ok">Available</span></td></tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }
  if (state.scoreTab === "Exports") {
    return `
      <h2>Exports</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Export Name</th><th>Format</th><th>Scope</th><th>Generated</th><th>Status</th><th></th></tr></thead>
          <tbody>
            <tr><td>score-summary-${state.program.toLowerCase()}-2026.csv</td><td>CSV</td><td>${programLabel(state.program)}</td><td>2026-07-15</td><td><span class="status-pill ok">Ready</span></td><td><button class="link" data-toast="Score export downloaded">Download</button></td></tr>
            <tr><td>score-details-${state.program.toLowerCase()}-2026.xlsx</td><td>XLSX</td><td>${programLabel(state.program)}</td><td>2026-07-15</td><td><span class="status-pill">Draft</span></td><td><button class="link" data-toast="Export queued">Regenerate</button></td></tr>
          </tbody>
        </table>
      </div>
    `;
  }
  return `
    <h2>${state.program === "MIPS" || state.program === "APPPLUS" ? "CQM" : "eCQM"}</h2>
    ${measureTable(true, scorecard.measures)}
    <h2>${state.program === "MIPS" || state.program === "APPPLUS" ? "eCQM" : "CQM"}</h2>
    ${isMvp ? measureTable(false, [], "No measures found for the selected performance period.") : measureTable(false, measures)}
  `;
}

function scoreValue(value) {
  if (!value) return 0;
  const match = String(value).match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function readinessTone(value) {
  const score = scoreValue(value);
  if (score >= 80) return "ok";
  if (score >= 50) return "watch";
  return "risk";
}

function renderRedwoodProgramOverview(rows) {
  const profile = state.program === "APPPLUS" ? customerProfiles.ccpm : customerProfiles.zmdi;
  const active = programStatus(profile, state.program);
  const primaryScore = rows[0]?.quality || (state.program === "QRDA" ? "Ready" : "Pending");
  const tone = readinessTone(primaryScore);
  const totalProviders = rows.reduce((sum, row) => sum + Number(row.providers || row.tins || 0), 0);
  const packageLabel = state.program === "HQR" ? "Hospital package" : state.program === "QRDA" ? "Export package" : "Submission package";
  return `
    <section class="redwood-overview" aria-label="${programLabel(state.program)} summary">
      <article class="redwood-hero-card">
        <div>
          <span class="eyebrow">Customer Strategy</span>
          <h2>${profile.name}</h2>
          <p>${profile.activeSummary}</p>
        </div>
        <div class="radial-score ${tone}" style="--score:${Math.min(scoreValue(primaryScore), 100)}%">
          <strong>${primaryScore}</strong>
          <span>${state.program === "HQR" ? "Readiness" : "Quality"}</span>
        </div>
      </article>
      <article class="redwood-kpi">
        <span>Configured Path</span>
        <strong>${active.label}</strong>
        <em>${active.note}</em>
      </article>
      <article class="redwood-kpi">
        <span>Entities</span>
        <strong>${rows.length || 1}</strong>
        <em>${state.program === "MVP" ? "Subgroups" : state.program === "HQR" ? "Hospitals" : "Reporting entities"}</em>
      </article>
      <article class="redwood-kpi">
        <span>Population</span>
        <strong>${totalProviders || "Ready"}</strong>
        <em>${state.program === "APPPLUS" ? "TINs" : "Providers / records"}</em>
      </article>
      <article class="redwood-next">
        <span>Next Best Action</span>
        <strong>${packageLabel}</strong>
        <button class="btn small" data-toast="${programLabel(state.program)} readiness review opened">Review</button>
      </article>
    </section>
  `;
}

function renderScoreTrendCard(scorecard) {
  const rows = scorecard.measures || [];
  const top = rows.slice(0, 3);
  const average = top.length ? Math.round(top.reduce((sum, measure) => sum + scoreValue(measure.score), 0) / top.length * 10) / 10 : 0;
  return `
    <section class="score-signal-band">
      <article>
        <span>Quality Signal</span>
        <strong>${average} pts</strong>
        <em>average across visible measures</em>
      </article>
      <article>
        <span>CMS QPP OAuth</span>
        <strong>Active</strong>
        <em>${qppSession.remaining} remaining</em>
      </article>
      <article>
        <span>Weakest Measure</span>
        <strong>${top.slice().sort((a, b) => scoreValue(a.score) - scoreValue(b.score))[0]?.id || "Pending"}</strong>
        <em>prioritize before freeze</em>
      </article>
      <article>
        <span>Submission Mode</span>
        <strong>eCQM & CQM</strong>
        <em>unified quality review</em>
      </article>
    </section>
  `;
}

function renderMeasureInsightRail(scorecard) {
  const rows = (scorecard.measures || measures).slice(0, 4);
  return `
    <aside class="insight-rail">
      <span class="eyebrow">Measure Signals</span>
      <h3>Prioritized Review</h3>
      ${rows.map((measure) => {
        const value = Math.min(scoreValue(measure.rate), 100);
        const tone = readinessTone(measure.rate);
        return `
          <div class="measure-signal ${tone}">
            <div>
              <strong>${measure.id}</strong>
              <span>${measure.measure}</span>
            </div>
            <div class="mini-meter" aria-label="${value}% performance rate"><span style="width:${value}%"></span></div>
            <em>${measure.rate} · ${measure.score} pts</em>
          </div>
        `;
      }).join("")}
      <button class="btn secondary" data-toast="Measure insight drawer opened">Open Insights</button>
    </aside>
  `;
}

function scoreHeaderControls(org, scorecard) {
  const collection = `<select aria-label="Measure collection type"><option>${state.program === "MVP" || state.program === "APPPLUS" ? "eCQM & CQM" : "eCQM"}</option><option>eCQM</option><option>CQM</option></select>`;
  const entity = `<select aria-label="Reporting entity" data-score-entity>${scoreEntityOptions(org, scorecard)}</select>`;
  const period = periodSelect("", "eCQM 2026 Analytics Calendar 2026");
  const orderedControls = state.program === "MVP" ? `${collection}${entity}${period}` : `${collection}${period}${entity}`;
  return `
    <div class="score-controls">
      ${orderedControls}
      <button class="btn secondary" data-toast="Score export started">⇩ Export</button>
      <span class="processing-date"><strong>Outcome Processing Date:</strong> 2026-07-15</span>
    </div>
  `;
}

function scoreEntityOptions(selected, scorecard = null) {
  if (state.program !== "MVP") {
    const entities = scorecard?.entities || [selected];
    return entities.map((name) => `<option${name === selected ? " selected" : ""}>${name}</option>`).join("");
  }
  return ["ZzMVP2", "ZzMVP3", "ZzMVP4", "ZzMVP5"].map((name) => `<option${name === selected ? " selected" : ""}>${name}</option>`).join("");
}

function measureTable(expanded, measureList = measures, emptyMessage = null) {
  const rows = emptyMessage ? `<tr><td colspan="10"><div class="empty-state compact">${emptyMessage}</div></td></tr>` : measureList.flatMap((measure) => {
    const parent = `
      <tr>
        <td><strong>${measure.measure}</strong></td>
        <td><strong>${measure.id}</strong></td>
        <td class="numeric">${measure.ipp}</td>
        <td class="numeric">${measure.denomExclusions}</td>
        <td class="numeric">${measure.denom}</td>
        <td class="numeric">${measure.numerator}</td>
        <td class="numeric">${measure.exceptions}</td>
        <td class="numeric">${measure.notMet}</td>
        <td class="numeric"><strong>${measure.rate}</strong></td>
        <td class="numeric"><strong>${measure.score}</strong></td>
      </tr>
    `;
    const children = expanded && measure.children ? measure.children.map((child) => `
      <tr>
        <td>- ${child.measure || child}</td><td></td><td class="numeric">${child.ipp || "0"}</td><td class="numeric">${child.denomExclusions || "0"}</td><td class="numeric">${child.denom || "0"}</td><td class="numeric">${child.numerator || "0"}</td><td class="numeric">${child.exceptions || "0"}</td><td class="numeric">${child.notMet || "0"}</td><td></td><td></td>
      </tr>
    `).join("") : "";
    return parent + children;
  }).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Measure</th><th>Measure ID</th><th class="numeric">IPP</th><th class="numeric">Denominator Exclusions</th><th class="numeric">Performance Denominator</th><th class="numeric">Numerator</th><th class="numeric">Exceptions</th><th class="numeric">Not Met</th><th class="numeric">Performance Rate</th><th class="numeric">Quality Measure Score</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderSubmissionsOverview() {
  const scopes = navByProgram[state.program].filter((item) => ["Group", "Individual", "Subgroup", "APM Entity", "Hospital"].includes(item));
  content.innerHTML = `
    <section class="content-inner">
      <div class="toolbar">
        <h1>${programLabel(state.program)} Submissions</h1>
        <button class="btn" data-new>+ New</button>
      </div>
      <div class="summary-grid">
        ${scopes.map((scope) => {
          const rows = ((submissions[state.program] || {})[scope]) || [];
          return `<button class="metric metric-button" data-scope="${scope}"><span>${scope}</span><strong>${rows.length}</strong><em>${rows.length === 1 ? "submission" : "submissions"}</em></button>`;
        }).join("")}
      </div>
      <h2>Recent Submission Activity</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Submission</th><th>Scope</th><th>Entity</th><th>Status</th><th>Quality</th><th>Next Step</th></tr></thead>
          <tbody>
            ${scopes.flatMap((scope) => (((submissions[state.program] || {})[scope]) || []).slice(0, 2).map((row) => `
              <tr>
                <td><button class="link" data-submission="${row.name}">${row.name}</button></td>
                <td>${scope}</td>
                <td>${row.practice}</td>
                <td><span class="status-pill ${row.quality === "FROZEN" ? "ok" : ""}">${row.quality === "FROZEN" ? "Frozen" : "Draft"}</span></td>
                <td>${scoreCell(row.quality)}</td>
                <td>${row.quality === "FROZEN" ? "Submit to CMS" : "Review missing PI/IA"}</td>
              </tr>
            `)).join("") || `<tr><td colspan="6"><div class="empty-state">No submissions found for this program.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;
  content.querySelector("[data-new]")?.addEventListener("click", () => {
    state.selectedSubmissionScope = "Group";
    state.route = "new-submission";
    render();
  });
  content.querySelectorAll("[data-scope]").forEach((button) => {
    button.addEventListener("click", () => setRoute(`submissions-${button.dataset.scope}`));
  });
  content.querySelectorAll("[data-submission]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSubmission = button.dataset.submission;
      state.selectedSubmissionScope = scope;
      state.route = "submission-detail";
      render();
    });
  });
}

function renderSubmissions(scope) {
  const scopeRows = ((submissions[state.program] || {})[scope]) || [];
  const isMvpIndividual = state.program === "MVP" && scope === "Individual";
  const selectedGroup = selectedIndividualGroup();
  const availableClinicians = cliniciansForSelectedGroup();
  const selectedClinician = selectedIndividualClinician();
  const individualRows = isMvpIndividual
    ? selectedClinician
      ? [{ name: individualDraftName(), clinician: selectedClinician.name, practice: selectedGroup.id, mvp: selectedGroup.mvpName, composite: "draft", quality: selectedClinician.forecast, pi: "pending", ia: "pending", npi: selectedClinician.npi, confidence: selectedClinician.confidence }]
      : availableClinicians.map((clinician) => ({ name: `Candidate - ${clinician.name}`, clinician: clinician.name, practice: selectedGroup?.id || "", mvp: selectedGroup?.mvpName || "", composite: "review", quality: clinician.forecast, pi: "pending", ia: "pending", npi: clinician.npi, confidence: clinician.confidence }))
    : scopeRows;
  const displayRows = isMvpIndividual ? individualRows : scopeRows;
  content.innerHTML = `
    <section class="content-inner flush">
      <div class="toolbar">
        <h1>${scope} Submissions</h1>
        <button class="btn" data-new>+ New</button>
      </div>
      <div class="filter-row ${isMvpIndividual ? "wide-filters" : ""}">
        <div class="field"><label>Performance Period</label>${periodSelect()}</div>
        ${isMvpIndividual ? `
          <div class="field"><label>MVP Group/Subgroup</label><select data-individual-group aria-label="MVP Group/Subgroup"><option value="">-- Select Group/Subgroup --</option>${mvpIndividualGroups.map((group) => `<option value="${group.id}"${group.id === state.selectedIndividualGroup ? " selected" : ""}>${group.id} - ${group.name}</option>`).join("")}</select></div>
          <div class="field"><label><span class="required">*</span> Eligible Clinician</label><select data-individual-clinician aria-label="Eligible Clinician" ${state.selectedIndividualGroup ? "" : "disabled"}><option value="">${state.selectedIndividualGroup ? "-- Select Clinician --" : "Select subgroup first"}</option>${availableClinicians.map((clinician) => `<option value="${clinician.npi}"${clinician.npi === state.selectedIndividualClinician ? " selected" : ""}>${clinician.name} - NPI ${clinician.npi}</option>`).join("")}</select></div>
        ` : `
          <div class="field"><label>${scope === "APM Entity" ? "APM Entity" : state.program === "MVP" ? "MVP Group/Subgroup" : scope + " Practice"}</label><select><option></option><option>Hyperion Health System</option><option>ZzMVP2</option><option>MIPS Org View Test</option><option>TIN 1: CernerDemo</option></select></div>
        `}
        <div class="field"><label>Submission Name</label><div class="search-control"><input placeholder="Submission Name" /><button aria-label="Search">⌕</button></div></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            ${isMvpIndividual
              ? `<tr><th>Submission Name</th><th>Eligible Clinician</th><th>MVP Group/Subgroup</th><th>MVP</th><th class="numeric">Composite Score</th><th class="numeric">Quality Score</th><th class="numeric">PI Score</th><th class="numeric">IA Score</th></tr>`
              : `<tr><th>Submission Name</th><th>${scope === "APM Entity" ? "APM Entity" : state.program === "MVP" ? "MVP Group/Subgroup" : scope + " Practice"}</th><th class="numeric">Composite Score</th><th class="numeric">Quality Score</th><th class="numeric">PI Score</th><th class="numeric">IA Score</th></tr>`}
          </thead>
          <tbody>
            ${displayRows.length ? displayRows.map((row) => isMvpIndividual ? `
              <tr>
                <td><button class="link" data-submission="${row.name}">${row.name}</button></td>
                <td>${row.clinician || "Eligible Clinician"}<span class="subline">NPI ${row.npi || "pending"}</span></td>
                <td>${row.practice}</td>
                <td>${row.mvp || "Heart Disease"}</td>
                <td class="numeric">${scoreCell(row.composite)}</td>
                <td class="numeric">${scoreCell(row.quality)}</td>
                <td class="numeric">${scoreCell(row.pi)}</td>
                <td class="numeric">${scoreCell(row.ia)}</td>
              </tr>
            ` : `
              <tr>
                <td><button class="link" data-submission="${row.name}">${row.name}</button></td>
                <td>${row.practice}<span class="subline">${state.program === "MVP" ? "Subgroup ID" : "TIN"}: ${row.tin}</span></td>
                <td class="numeric">${scoreCell(row.composite)}</td>
                <td class="numeric">${scoreCell(row.quality)}</td>
                <td class="numeric">${scoreCell(row.pi)}</td>
                <td class="numeric">${scoreCell(row.ia)}</td>
              </tr>
            `).join("") : `<tr><td colspan="${isMvpIndividual ? 8 : 6}"><div class="empty-state">${isMvpIndividual ? "Select an MVP subgroup to view eligible clinicians and forecast individual drafts." : "No Submissions found"}</div></td></tr>`}
          </tbody>
        </table>
      </div>
      ${isMvpIndividual ? `
        <div class="individual-flow-actions">
          <span>${selectedClinician ? `${selectedClinician.name} selected for ${selectedGroup.mvpId}` : state.selectedIndividualGroup ? "Select an eligible clinician to create or open an individual draft." : "Start by selecting an MVP group/subgroup."}</span>
          <button class="btn" data-create-individual-draft ${selectedClinician ? "" : "disabled"}>Create Individual Draft</button>
        </div>
      ` : ""}
      <div class="pager"><span>First</span><span>Previous</span><strong>1</strong><span>Next</span><span>Last</span></div>
    </section>
  `;
  content.querySelector("[data-new]").addEventListener("click", () => {
    state.selectedSubmissionScope = scope;
    state.route = "new-submission";
    render();
  });
  content.querySelector("[data-individual-group]")?.addEventListener("change", (event) => {
    state.selectedIndividualGroup = event.target.value;
    state.selectedIndividualClinician = "";
    const group = selectedIndividualGroup();
    if (group) {
      state.practiceComposition = "single";
      state.mvpSpecialty = group.specialty;
      state.mvpSpecialties = [group.specialty];
    }
    render();
  });
  content.querySelector("[data-individual-clinician]")?.addEventListener("change", (event) => {
    state.selectedIndividualClinician = event.target.value;
    render();
  });
  content.querySelector("[data-create-individual-draft]")?.addEventListener("click", () => {
    state.selectedSubmission = individualDraftName();
    state.route = "submission-detail";
    render();
  });
  content.querySelectorAll("[data-submission]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSubmission = button.dataset.submission;
      state.route = "submission-detail";
      render();
    });
  });
}

function renderSubmissionDetail() {
  const name = state.selectedSubmission || "MIPS Org View Test";
  const selectedGroup = selectedIndividualGroup();
  const selectedClinician = selectedIndividualClinician();
  const isIndividualDetail = state.program === "MVP" && (state.selectedSubmissionScope === "Individual" || name.includes("Individual"));
  content.innerHTML = `
    <section class="content-inner">
      <button class="btn ghost" data-back="submissions-${isIndividualDetail ? "Individual" : "Group"}">Back to Submissions</button>
      <div class="toolbar">
        <h1>${name}</h1>
        <div class="button-row">
          <button class="btn secondary" data-toast="Submission saved for final review">Save for Final Review</button>
          <button class="btn" data-toast="Prototype event: CMS submit request queued">Submit to CMS</button>
        </div>
      </div>
      <div class="detail-layout">
        <div>
          <div class="summary-grid">
            <div class="metric"><span>Workflow Status</span><strong>${isIndividualDetail ? "Draft Review" : "Frozen"}</strong></div>
            <div class="metric"><span>${isIndividualDetail ? "Clinician" : "Composite Score"}</span><strong>${isIndividualDetail ? selectedClinician?.name || "Selected clinician" : "0.0"}</strong></div>
            <div class="metric"><span>${isIndividualDetail ? "Forecast Score" : "Quality Score"}</span><strong>${isIndividualDetail ? selectedClinician?.forecast || "Pending" : "0.0"}</strong></div>
            <div class="metric"><span>CMS QPP OAuth</span><strong>Active</strong></div>
          </div>
          ${isIndividualDetail ? `
            <div class="pathway-context-strip">
              <div><span>MVP Group/Subgroup</span><strong>${selectedGroup?.id || "Selected subgroup"}</strong></div>
              <div><span>MVP</span><strong>${selectedGroup?.mvpId || "MVP"}</strong><em>${selectedGroup?.mvpName || "Selected MVP"}</em></div>
              <div><span>NPI</span><strong>${selectedClinician?.npi || "Selected NPI"}</strong></div>
            </div>
          ` : ""}
          ${renderUnifiedQualityPanel()}
        </div>
        <aside>
          <div class="panel">
            <h3>Submission Workflow</h3>
            <ol class="steps">
              <li><span class="step-mark">1</span><span>Select program, period, and submission scope</span></li>
              <li><span class="step-mark">2</span><span>Confirm eCQM, CQM, or unified Quality measure mode</span></li>
              <li><span class="step-mark">3</span><span>Login to CMS QPP for eCQM submit/approval actions</span></li>
              <li><span class="step-mark">4</span><span>Freeze submission-ready measures</span></li>
              <li><span class="step-mark">5</span><span>Submit to CMS API or export QRDA package</span></li>
              <li><span class="step-mark">6</span><span>Track receipt, validation, and correction status</span></li>
            </ol>
          </div>
          <div class="panel">
            <h3>Validation Summary</h3>
            <p><span class="status-pill ok">Ready</span> Demographics and provider identifiers present.</p>
            <p><span class="status-pill warn">Review</span> Several measures are returning zero denominators in demo data.</p>
          </div>
        </aside>
      </div>
    </section>
  `;
  bindBackButtons();
  bindToastButtons();
}

function renderNewSubmission() {
  const isIndividualDraft = state.program === "MVP" && state.selectedSubmissionScope === "Individual";
  const selectedGroup = selectedIndividualGroup();
  const availableClinicians = cliniciansForSelectedGroup();
  const selectedClinician = selectedIndividualClinician();
  content.innerHTML = `
    <section class="content-inner">
      <button class="btn ghost" data-back="submissions-${state.selectedSubmissionScope || "Group"}">Back to Submissions</button>
      <h1>${isIndividualDraft ? "New Individual MVP Submission" : `New ${submissionTitle(state.program)}`}</h1>
      <div class="detail-layout">
        <div class="panel">
          <div class="filter-row">
            <div class="field"><label>Performance Period</label>${periodSelect()}</div>
            <div class="field"><label>Submission Scope</label><select data-draft-scope aria-label="Submission Scope"><option${state.selectedSubmissionScope === "Group" ? " selected" : ""}>Group</option><option${state.selectedSubmissionScope === "Individual" ? " selected" : ""}>Individual</option><option${state.selectedSubmissionScope === "Subgroup" ? " selected" : ""}>Subgroup</option><option${state.selectedSubmissionScope === "APM Entity" ? " selected" : ""}>APM Entity</option></select></div>
            <div class="field"><label>Submission Name</label><input value="${isIndividualDraft ? individualDraftName() : `${submissionTitle(state.program)} Draft`}" /></div>
          </div>
          ${isIndividualDraft ? `
            <div class="individual-draft-panel">
              <div class="field"><label>MVP Group/Subgroup</label><select data-individual-group aria-label="Draft MVP Group/Subgroup"><option value="">-- Select Group/Subgroup --</option>${mvpIndividualGroups.map((group) => `<option value="${group.id}"${group.id === state.selectedIndividualGroup ? " selected" : ""}>${group.id} - ${group.name}</option>`).join("")}</select></div>
              <div class="field"><label>Eligible Clinician</label><select data-individual-clinician aria-label="Draft Eligible Clinician" ${state.selectedIndividualGroup ? "" : "disabled"}><option value="">${state.selectedIndividualGroup ? "-- Select Clinician --" : "Select subgroup first"}</option>${availableClinicians.map((clinician) => `<option value="${clinician.npi}"${clinician.npi === state.selectedIndividualClinician ? " selected" : ""}>${clinician.name} - NPI ${clinician.npi}</option>`).join("")}</select></div>
              <div class="draft-kpi"><span>MVP</span><strong>${selectedGroup?.mvpId || "Select subgroup"}</strong><em>${selectedGroup?.mvpName || "MVP will populate after subgroup selection"}</em></div>
              <div class="draft-kpi"><span>Forecast</span><strong>${selectedClinician?.forecast || "--"}</strong><em>${selectedClinician ? `${selectedClinician.confidence} confidence` : "Select clinician"}</em></div>
            </div>
          ` : ""}
          <h2>Data Sources</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Category</th><th>Source</th><th>Status</th><th>Last Refresh</th></tr></thead>
              <tbody>
                <tr><td>Quality</td><td>Unified eCQM & CQM scorecards</td><td><span class="status-pill ok">Available</span></td><td>Today</td></tr>
                <tr><td>CMS QPP OAuth</td><td>CMS QPP session for submit and approval actions</td><td><span class="status-pill ok">Active for 15 mins</span></td><td>Just now</td></tr>
                <tr><td>Promoting Interoperability</td><td>Imported CEHRT numerator / denominator file</td><td><span class="status-pill warn">Needs import</span></td><td>Not loaded</td></tr>
                <tr><td>Improvement Activities</td><td>Manual selection and attestation</td><td><span class="status-pill warn">Needs selection</span></td><td>Not started</td></tr>
              </tbody>
            </table>
          </div>
          <div class="split-actions">
            <span class="muted">${isIndividualDraft ? "Individual draft carries subgroup, clinician, MVP, and forecast context forward." : "Prototype creates a draft and routes to review."}</span>
            <button class="btn" data-create-draft ${isIndividualDraft && !selectedClinician ? "disabled" : ""}>Create Draft</button>
          </div>
        </div>
        <aside class="panel">
          <h3>Expected Next Screens</h3>
          <ol class="steps">
            <li><span class="step-mark">1</span><span>Choose reporting entity and scope.</span></li>
            <li><span class="step-mark">2</span><span>Select Quality mode: eCQM, CQM, or both.</span></li>
            <li><span class="step-mark">3</span><span>Confirm CMS QPP OAuth session.</span></li>
            <li><span class="step-mark">4</span><span>Preview scores and warnings.</span></li>
            <li><span class="step-mark">5</span><span>Freeze and submit or export.</span></li>
          </ol>
        </aside>
      </div>
    </section>
  `;
  content.querySelector("[data-draft-scope]")?.addEventListener("change", (event) => {
    state.selectedSubmissionScope = event.target.value;
    render();
  });
  content.querySelector("[data-individual-group]")?.addEventListener("change", (event) => {
    state.selectedIndividualGroup = event.target.value;
    state.selectedIndividualClinician = "";
    const group = selectedIndividualGroup();
    if (group) {
      state.practiceComposition = "single";
      state.mvpSpecialty = group.specialty;
      state.mvpSpecialties = [group.specialty];
    }
    render();
  });
  content.querySelector("[data-individual-clinician]")?.addEventListener("change", (event) => {
    state.selectedIndividualClinician = event.target.value;
    render();
  });
  content.querySelector("[data-create-draft]")?.addEventListener("click", () => {
    state.selectedSubmission = isIndividualDraft ? individualDraftName() : `${submissionTitle(state.program)} Draft`;
    state.route = "submission-detail";
    render();
  });
  bindBackButtons();
  bindToastButtons();
}

function renderUpload() {
  content.innerHTML = `
    <section class="content-inner">
      <h1>${programLabel(state.program)} Upload</h1>
      <div class="panel">
        <div class="filter-row">
          <div class="field"><label>Upload Type</label><select><option>PI numerator / denominator import</option><option>IA attestation import</option><option>QRDA validation package</option></select></div>
          <div class="field"><label>Performance Period</label>${periodSelect()}</div>
          <div class="field"><label>File</label><input value="demo-pi-import.csv" /></div>
          <button class="btn" data-toast="Prototype upload validated">Validate Upload</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>File Name</th><th>Type</th><th>Status</th><th>Rows</th><th>Issues</th></tr></thead>
            <tbody>
              <tr><td>demo-pi-import.csv</td><td>PI Measures</td><td><span class="status-pill warn">Needs review</span></td><td>0</td><td>Demo data contains zero values</td></tr>
              <tr><td>mips-quality-scorecards.json</td><td>Quality Scorecards</td><td><span class="status-pill ok">Loaded</span></td><td>6</td><td>None</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
  bindToastButtons();
}

function renderProviderProfile() {
  content.innerHTML = `
    <section class="content-inner">
      <h1>Provider Profile</h1>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Provider</th><th>NPI</th><th>Practice</th><th>Participation</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Jane Clinician</td><td>1942000000</td><td>TIN 1: CernerDemo</td><td>MIPS Individual</td><td><span class="status-pill ok">Eligible</span></td></tr>
            <tr><td>Group Practice Roster</td><td>Multiple</td><td>MIPS Org View Test</td><td>MIPS Group</td><td><span class="status-pill warn">Verify roster</span></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderQrdaExport() {
  content.innerHTML = `
    <section class="content-inner">
      <h1>QRDA Export</h1>
      <div class="panel">
        <div class="filter-row">
          <div class="field"><label>QRDA Category</label><select><option>QRDA I</option><option>QRDA III</option></select></div>
          <div class="field"><label>Program</label><select><option>MIPS</option><option>APP Plus</option><option>MVP</option></select></div>
          <div class="field"><label>Submission Scope</label><select><option>Individual</option><option>Group</option><option>Subgroup</option><option>APM Entity</option></select></div>
          <button class="btn" data-toast="QRDA export job started">Export QRDA</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Output Convention</th><th>Category</th><th>Program</th><th>Scope</th><th>Bulk Export</th></tr></thead>
            <tbody>
              <tr><td>QRDA1_MIPS_INDIV_TIN_NPI_CY2025_timestamp.zip</td><td>1</td><td>MIPS</td><td>Individual</td><td>No</td></tr>
              <tr><td>QRDA3_APP_PLUS_GROUP_CY2025_timestamp.zip</td><td>3</td><td>APP Plus</td><td>Group</td><td>Yes</td></tr>
              <tr><td>QRDA1_MVP_GROUP_TIN_CY2025_timestamp.zip</td><td>1</td><td>MVP</td><td>Group</td><td>No</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
  bindToastButtons();
}

function renderQrdaFiles() {
  content.innerHTML = `
    <section class="content-inner">
      <h1>Generated QRDA Files</h1>
      <div class="table-wrap">
        <table>
          <thead><tr><th>File Name</th><th>Program</th><th>Scope</th><th>Generated</th><th>Status</th><th></th></tr></thead>
          <tbody>
            <tr><td>QRDA1_MIPS_4_GROUP_CY2025_07-20-26_111924.zip</td><td>MIPS</td><td>Group</td><td>Today</td><td><span class="status-pill ok">Ready</span></td><td><button class="link" data-toast="Download started">Download</button></td></tr>
            <tr><td>QRDA3_MVP_1_INDIV_CY2025_07-20-26_112015.zip</td><td>MVP</td><td>Individual</td><td>Today</td><td><span class="status-pill warn">Warnings</span></td><td><button class="link" data-toast="Download started">Download</button></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;
  bindToastButtons();
}

function renderFlowMap() {
  content.innerHTML = `
    <section class="content-inner">
      <h1>Prototype Flow Map</h1>
      <div class="flow-grid">
        <article class="flow-card">
          <h3>Program Entry</h3>
          <ol><li>Home pathway cards</li><li>Program selector in header</li><li>Program-specific left navigation</li></ol>
        </article>
        <article class="flow-card">
          <h3>Performance Review</h3>
          <ol><li>Performance list by reporting entity</li><li>Open scorecard summary</li><li>Review eCQM, CQM, PI, and IA tables</li></ol>
        </article>
        <article class="flow-card">
          <h3>Submission Creation</h3>
          <ol><li>Choose Group, Individual, Subgroup, or APM Entity</li><li>Filter existing submissions</li><li>Create draft, freeze, review, and submit</li></ol>
        </article>
        <article class="flow-card">
          <h3>Supplemental Data</h3>
          <ol><li>Upload PI numerator / denominator values</li><li>Select IA attestations</li><li>Validate missing or zeroed values</li></ol>
        </article>
        <article class="flow-card">
          <h3>QRDA Path</h3>
          <ol><li>Select QRDA I or III</li><li>Choose program and scope</li><li>Generate and download ZIP package</li></ol>
        </article>
        <article class="flow-card">
          <h3>CMS Response</h3>
          <ol><li>Submit through CMS API or QRDA export</li><li>Track receipt and validation status</li><li>Correct and resubmit when needed</li></ol>
        </article>
      </div>
    </section>
  `;
}

function currentVisionStage() {
  const index = Math.min(Math.max(state.labStep, 0), visionStages.length - 1);
  return { index, stage: visionStages[index], percent: Math.round(((index + 1) / visionStages.length) * 100) };
}

function visionStageIdForScreen(screenId) {
  if (["performance", "validation", "measure-detail", "patient-evidence", "readiness"].includes(screenId)) return "improve";
  return visionScreens.find((screen) => screen.id === screenId)?.stage || "strategy";
}

function visionScreenForStage(stageId) {
  if (["improve", "monitor", "validate"].includes(stageId)) return "performance";
  if (stageId === "submit") return "submissions";
  return "strategy";
}

function activeVisionScreenId() {
  if (state.visionRoute === "phase-faq") return "phase-faq";
  if (state.visionRoute === "patient-evidence") return "patient-evidence";
  if (state.visionRoute === "measure-detail") return "performance";
  if (state.visionRoute === "validation" || state.visionRoute === "readiness") return "performance";
  if (visionScreens.some((screen) => screen.id === state.visionRoute)) return state.visionRoute;
  return visionScreenForStage(currentVisionStage().stage.id);
}

function visionStageForActiveScreen() {
  const stageId = visionStageIdForScreen(activeVisionScreenId());
  return visionStages.find((stage) => stage.id === stageId) || visionStages[0];
}

function visionBadge(label, tone = "info") {
  return `<span class="vision-badge ${tone}">${label}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderVisionTabs(tabs, stateKey) {
  const rawActiveValue = state[stateKey] || tabs[0]?.id;
  const activeValue = stateKey === "visionPerformanceTab" ? normalizeVisionPerformanceTab(rawActiveValue) : rawActiveValue;
  return `
    <div class="vision-tabs" role="tablist">
      ${tabs.map((tab) => `
        <button class="vision-tab ${activeValue === tab.id ? "active" : ""}" data-vision-tab="${stateKey}:${tab.id}" type="button">${tab.label}</button>
      `).join("")}
    </div>
  `;
}

const validationCurrentSnapshotLabel = "08/31";
const validationPriorSnapshotLabel = "08/17";

function validationMeasureById(measureId) {
  return visionValidationPatientMeasures.find((measure) => measure.id === measureId) || visionValidationPatientMeasures[0];
}

function selectedValidationMeasure() {
  return validationMeasureById(state.selectedValidationMeasure);
}

function selectedValidationPatient(measure = selectedValidationMeasure()) {
  return validationPatientsForMeasure(measure).find((patient) => patient.patient === state.selectedValidationPatient) || validationPatientsForMeasure(measure)[0];
}

function patientsForValidationFilter(measure, filter = "all") {
  const patients = validationPatientsForMeasure(measure);
  if (["numerator", "denominator", "exclusion"].includes(filter)) {
    return patients.filter((patient) => patientOutcomeCategory(patient) === filter);
  }
  if (filter === "changed") return patients.filter(patientHasStateChange);
  return patients;
}

function focusValidationMeasure(measureId, options = {}) {
  const measure = validationMeasureById(measureId);
  const filter = options.filter || "all";
  const matchingPatients = patientsForValidationFilter(measure, filter);
  const fallbackPatient = matchingPatients[0] || validationPatientsForMeasure(measure)[0];
  state.selectedValidationMeasure = measure.id;
  state.selectedValidationPatient = options.patientId || fallbackPatient?.patient || state.selectedValidationPatient;
  state.patientValidationFilter = filter;
  state.patientValidationSearch = options.patientId || "";
  state.patientValidationSort = options.sort || state.patientValidationSort || "changed-first";
}

function allValidationPatients() {
  return visionValidationPatientMeasures.flatMap((measure) =>
    validationPatientsForMeasure(measure).map((patient) => ({ measure, patient })),
  );
}

function patientValidationSearchMatch(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return null;
  return allValidationPatients().find(({ patient, measure }) =>
    [
      patient.patient,
      patient.provider,
      patient.specialty,
      patient.currentState,
      patient.evidence,
      measure.measure,
      measure.code,
      measure.subgroup,
    ].some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
}

function attestationTrendFor(measureId) {
  return visionAttestationTrends[measureId] || visionAttestationTrends.cms349;
}

function qualityTargetFor(measureId) {
  return state.qualityTargets[measureId] || attestationTrendFor(measureId).target;
}

function currentTrendValue(measureId) {
  return Number.parseInt(attestationTrendFor(measureId).current, 10);
}

function patientOutcomeCategory(patient) {
  const currentState = String(patient.currentState).toLowerCase();
  if (currentState.includes("exclusion")) return "exclusion";
  if (currentState.includes("numerator")) return "numerator";
  return "denominator";
}

function patientOutcomeCategoryName(category) {
  const names = {
    all: "All selected",
    changed: "Status changed",
    numerator: "Numerator",
    denominator: "Denominator",
    exclusion: "Exclusion",
  };
  return names[category] || "All selected";
}

function patientOutcomeBadge(patient) {
  const category = patientOutcomeCategory(patient);
  const tone = category === "numerator" ? "good" : category === "exclusion" ? "info" : "warn";
  return visionBadge(patientOutcomeCategoryName(category), tone);
}

function patientHasStateChange(patient) {
  return patient.change !== "No change";
}

function changedPatientCountForMeasure(measure) {
  return validationPatientsForMeasure(measure).filter(patientHasStateChange).length;
}

function patientDataSources(patient) {
  if (patient.sources?.length) return patient.sources.join(", ");
  const text = `${patient.evidence} ${patient.change} ${patient.review || ""}`.toLowerCase();
  const sources = [];
  if (text.includes("lab") || text.includes("loinc") || text.includes("a1c")) sources.push("Lab");
  if (text.includes("registry")) sources.push("Registry");
  if (text.includes("claim") || text.includes("attribution") || text.includes("billing")) sources.push("Claims");
  if (text.includes("note") || text.includes("ehr") || text.includes("problem list") || text.includes("documentation")) sources.push("EHR");
  return [...new Set(sources)].join(", ") || "EHR";
}

function generatedOutcomeCategoryForMeasure(index) {
  if (index % 11 === 0) return "exclusion";
  if (index % 3 === 0 || index % 7 === 0) return "denominator";
  return "numerator";
}

function generatedPatientForMeasure(measure, index) {
  const category = generatedOutcomeCategoryForMeasure(index);
  const measureIndex = Math.max(0, visionValidationPatientMeasures.findIndex((candidate) => candidate.id === measure.id));
  const categoryOffsets = { numerator: 100, denominator: 300, exclusion: 700 };
  const base = measure.patients[index % measure.patients.length] || {
    provider: "Quality Clinician, MD",
    specialty: "Primary Care",
  };
  const number = 20000 + (measureIndex * 1000) + (categoryOffsets[category] || 0) + index;
  const changed = index % 9 === 0;
  const templates = {
    numerator: {
      currentState: "Numerator",
      satisfaction: "Satisfied",
      satisfactionTone: "good",
      priorState: changed ? "Denominator" : "Numerator",
      change: changed ? "Numerator evidence added" : "No change",
      changeTone: changed ? "good" : "info",
      evidence: `${measure.code} numerator evidence, qualifying encounter, and attribution are present.`,
      sources: ["EHR", "Lab"],
    },
    denominator: {
      currentState: index % 6 === 0 ? "Near miss" : "Denominator",
      satisfaction: "Not satisfied",
      satisfactionTone: index % 6 === 0 ? "warn" : "bad",
      priorState: changed ? "Not in population" : "Denominator",
      change: changed ? "New denominator" : "No change",
      changeTone: changed ? "warn" : "info",
      evidence: index % 6 === 0
        ? `${measure.code} denominator criteria are met; one numerator evidence condition is missing.`
        : `${measure.code} denominator criteria are met; numerator evidence is not present in the calculation.`,
      sources: index % 5 === 0 ? ["EHR", "Claims"] : ["EHR"],
    },
    exclusion: {
      currentState: "Exclusion",
      satisfaction: "Excluded",
      satisfactionTone: "info",
      priorState: changed ? "Denominator" : "Exclusion",
      change: changed ? "Exclusion evidence added" : "No change",
      changeTone: changed ? "good" : "info",
      evidence: `${measure.code} exclusion evidence is present and linked to the qualifying population.`,
      sources: ["EHR"],
    },
  };
  return {
    ...templates[category],
    patient: `HY-${number}`,
    provider: base.provider,
    specialty: base.specialty,
    closeness: category === "numerator" ? "100%" : category === "denominator" ? `${58 + (index % 30)}%` : "N/A",
    whySelected: `${patientOutcomeCategoryName(category)} validation patient`,
    review: "Available",
    generated: true,
  };
}

function validationPatientsForMeasure(measure) {
  const seededPatients = measure.patients.map((patient) => ({ ...patient, generated: false }));
  const needed = Math.max(0, measure.selected - seededPatients.length);
  const generatedPatients = Array.from({ length: needed }, (_, index) => generatedPatientForMeasure(measure, index));
  return [...seededPatients, ...generatedPatients].slice(0, measure.selected).sort((first, second) => {
    const order = { numerator: 0, denominator: 1, exclusion: 2 };
    return order[patientOutcomeCategory(first)] - order[patientOutcomeCategory(second)]
      || first.patient.localeCompare(second.patient);
  });
}

function qualityTargetGapBadge(measureId) {
  const gap = currentTrendValue(measureId) - qualityTargetFor(measureId);
  return visionBadge(gap >= 0 ? `+${gap}%` : `${gap}%`, gap >= 0 ? "good" : "warn");
}

function trendChartScale(trend, target) {
  const values = trend.trend.map((point) => point.value);
  values.push(target);
  const yMin = Math.max(0, Math.floor((Math.min(...values) - 4) / 5) * 5);
  const yMax = Math.min(100, Math.ceil((Math.max(...values) + 4) / 5) * 5);
  const fallbackMax = Math.min(100, yMin + 10);
  return { yMin, yMax: yMax > yMin ? yMax : fallbackMax };
}

function normalizeVisionPerformanceTab(tabId) {
  const tabMap = {
    summary: "patient-opportunities",
    "near-misses": "patient-opportunities",
    "measure-detail": "patient-opportunities",
    "validation-plan": "patient-level",
    "selected-patients": "patient-level",
    "attestation-trends": "trending-quality",
    outcomes: "trending-quality",
    "patient-evidence": "patient-level",
  };
  return tabMap[tabId] || tabId || "trending-quality";
}

function renderAttestationTrendChart(measure, options = {}) {
  const trend = attestationTrendFor(measure.id);
  const target = qualityTargetFor(measure.id);
  const width = options.table ? 390 : 420;
  const height = options.table ? 132 : options.compact ? 154 : 190;
  const pad = { left: 48, right: 18, top: 16, bottom: 34 };
  const { yMin, yMax } = trendChartScale(trend, target);
  const yRange = Math.max(yMax - yMin, 1);
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const yForValue = (value) => pad.top + plotHeight - (plotHeight * (value - yMin)) / yRange;
  const points = trend.trend.map((point, index) => {
    const x = pad.left + (plotWidth * index) / Math.max(trend.trend.length - 1, 1);
    const y = yForValue(point.value);
    return { ...point, x, y };
  });
  const yTicks = [yMax, Math.round((yMin + yMax) / 2), yMin];
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const targetY = yForValue(target);
  if (options.table) {
    return `
      <div class="attestation-chart-cell">
        <svg class="attestation-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${measure.measure} quality trend">
          ${yTicks.map((tick) => `
            <line x1="${pad.left}" y1="${yForValue(tick)}" x2="${width - pad.right}" y2="${yForValue(tick)}" class="grid-line" />
            <text x="${pad.left - 10}" y="${yForValue(tick) + 4}" class="y-axis-label">${tick}%</text>
          `).join("")}
          <line x1="${pad.left}" y1="${targetY}" x2="${width - pad.right}" y2="${targetY}" class="target-line" />
          <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${height - pad.bottom}" class="axis-line" />
          <line x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}" class="axis-line" />
          <polyline points="${polyline}" class="attestation-line" />
          ${points.map((point) => `
            <circle cx="${point.x}" cy="${point.y}" r="4" class="attestation-point" />
            <text x="${point.x}" y="${height - 12}" class="axis-label">${point.label}</text>
          `).join("")}
        </svg>
      </div>
    `;
  }
  return `
    <section class="attestation-chart-card ${options.compact ? "compact" : ""}">
      <div class="attestation-chart-header">
        <div>
          <span class="vision-kicker">Trending quality over time</span>
          <h4>${measure.measure}</h4>
        </div>
        <div>
          <strong>${trend.current}</strong>
          <span>${trend.wowChange} WoW</span>
        </div>
      </div>
      <svg class="attestation-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${measure.measure} attestation trend">
        ${yTicks.map((tick) => `
          <line x1="${pad.left}" y1="${yForValue(tick)}" x2="${width - pad.right}" y2="${yForValue(tick)}" class="grid-line" />
          <text x="${pad.left - 10}" y="${yForValue(tick) + 4}" class="y-axis-label">${tick}%</text>
        `).join("")}
        <line x1="${pad.left}" y1="${targetY}" x2="${width - pad.right}" y2="${targetY}" class="target-line" />
        <text x="${width - pad.right - 48}" y="${targetY - 6}" class="target-label">${target}% target</text>
        <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${height - pad.bottom}" class="axis-line" />
        <line x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}" class="axis-line" />
        <polyline points="${polyline}" class="attestation-line" />
        ${points.map((point) => `
          <circle cx="${point.x}" cy="${point.y}" r="4.5" class="attestation-point" />
          <text x="${point.x}" y="${height - 12}" class="axis-label">${point.label}</text>
        `).join("")}
      </svg>
    </section>
  `;
}

function renderVisionScreenFrame({ id, crumb, title, subtitle, filters = "", actions = "", body }) {
  return `
    <section class="vision-screen-card" id="vision-${id}">
      <header class="vision-screen-topbar">
        <div>
          <div class="vision-crumb">${crumb}</div>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        <div class="vision-topbar-right">
          <div class="vision-filters">
            ${filters || `
              <span>Performance Year: 2026</span>
              <span>Customer: Hyperion Health System</span>
            `}
          </div>
          ${actions ? `<div class="vision-top-actions">${actions}</div>` : ""}
        </div>
      </header>
      <div class="vision-screen-content">
        ${body}
      </div>
    </section>
  `;
}

function renderVisionPlatform() {
  const activeScreen = activeVisionScreenId();
  return `
    <div class="vision-app-shell vision-v2-shell">
      ${renderVisionNavigation()}
      <main class="vision-workspace vision-v2-main">
        ${renderVisionActiveScreen(activeScreen)}
      </main>
    </div>
  `;
}

function renderVisionNavigation() {
  const active = activeVisionScreenId();
  const activeNav = ["patient-evidence", "validation", "measure-detail", "readiness"].includes(active) ? "performance" : active;
  const activeStage = visionStageForActiveScreen();
  return `
    <aside class="vision-nav-pane" aria-label="Quality operating system navigation">
      <div class="vision-nav-brand">
        <div class="vision-logo">OH</div>
        <div>
          <span>Oracle Health Data Submissions</span>
          <strong>Quality Operating System</strong>
        </div>
      </div>
      <div class="vision-nav-customer">
        <span>Customer</span>
        <strong>Hyperion Health System</strong>
        <em>PY 2026 strategy workspace</em>
      </div>
      <nav class="vision-left-nav" aria-label="Workflow areas">
        ${visionScreens.map((screen) => `
          <button class="${activeNav === screen.id ? "active" : ""}" data-vision-screen="${screen.id}" type="button" aria-label="${screen.label}">
            <strong>${screen.label}</strong>
            <span>${screen.detail}</span>
          </button>
        `).join("")}
      </nav>
      <div class="vision-reference-nav">
        <span>Help</span>
        <details class="vision-reference-menu" ${state.visionRoute === "phase-faq" ? "open" : ""}>
          <summary>FAQ and reference</summary>
          <div>
            <button class="${state.visionRoute === "phase-faq" ? "active" : ""}" data-vision-faq-stage="${activeStage.id}" type="button">
              <strong>${activeStage.label} FAQ</strong>
              <span>Inputs, rules, rationale</span>
            </button>
            <button data-vision-faq-stage="strategy" type="button">
              <strong>Recommendation inputs</strong>
              <span>Enabled measures, specialty mix, performance forecast</span>
            </button>
            <button data-vision-faq-stage="submit" type="button">
              <strong>Submission rules</strong>
              <span>QPP OAuth, validation, export, receipt tracking</span>
            </button>
          </div>
        </details>
      </div>
      <div class="vision-nav-footer">
        <span>Active package</span>
        <strong>${state.visionStrategyLocked ? "Strategy locked" : "Draft strategy"}</strong>
        <em>${selectedVisionStrategy().path}</em>
        <button class="lab-btn" data-open-production="mvp-zmvp4">Open Production Control</button>
      </div>
    </aside>
  `;
}

function renderVisionActiveScreen(activeScreen) {
  if (activeScreen === "phase-faq") {
    const stage = currentVisionStage().stage;
    return renderVisionScreenFrame({
      id: "faq",
      crumb: `${stage.label} / FAQ`,
      title: `${stage.label} FAQ and Reference`,
      subtitle: "Supporting context lives here so the primary workflow can stay focused on the customer decision.",
      actions: `<button class="vision-btn" data-vision-workflow type="button">Back to ${stage.label}</button>`,
      body: renderVisionFaqScreen(stage),
    });
  }
  if (activeScreen === "strategy") return renderVisionStrategyScreen();
  if (activeScreen === "patient-evidence") return renderVisionPatientEvidenceScreen();
  if (activeScreen === "performance") return renderVisionPerformanceScreen();
  if (activeScreen === "validation") return renderVisionPerformanceScreen();
  if (activeScreen === "submissions") return renderVisionSubmissionScreen();
  if (activeScreen === "qrda") return renderVisionQrdaScreen();
  if (activeScreen === "audit") return renderVisionAuditScreen();
  return renderVisionHomeScreen();
}

function renderVisionHomeScreen() {
  const selected = selectedVisionStrategy();
  const summary = visionStrategyDraftSummary();
  return renderVisionScreenFrame({
    id: "home",
    crumb: "Home",
    title: "Regulatory Performance Copilot",
    subtitle: "Projected score, recommended strategy, top risks, and submission status for Hyperion Health System.",
    actions: `<button class="vision-btn secondary" data-vision-screen="strategy" type="button">Review strategy</button>`,
    body: `
      <div class="vision-grid-2">
        <article class="vision-card vision-score-card">
          <h2>Projected to submit at 88.3</h2>
          <p><strong>With the recommended MVP subgroup strategy: 93.8</strong> ${visionBadge("+5.5 pts modeled lift", "good")}</p>
          <div class="vision-mini-grid three">
            <div><span>Current</span><strong>84.9</strong></div>
            <div><span>Projected</span><strong>88.3</strong></div>
            <div><span>Optimized</span><strong>93.8</strong></div>
          </div>
          <div class="vision-projection-bar">
            <span class="current" style="width:84.9%"></span>
            <span class="projected" style="width:88.3%"></span>
            <span class="optimized" style="width:93.8%"></span>
          </div>
          <div class="vision-scale"><span>0</span><span>50</span><span>100</span></div>
          <p class="vision-note">Forecast uses enabled clinician measures, customer-confirmed specialty cohorts, provider-level performance, and program eligibility signals.</p>
        </article>
        <article class="vision-soft-card">
          <span class="vision-kicker">Recommended Strategy</span>
          <h2>${selected.path}</h2>
          <p>${selected.strategy}</p>
          <div class="vision-status-row"><strong>Included mix</strong><span>${summary.subgroups} MVP subgroups / ${summary.providers} providers</span></div>
          <div class="vision-status-row"><strong>Projected score</strong><strong>${selected.performance}</strong></div>
          <div class="vision-status-row"><strong>Confidence</strong>${visionBadge(selected.fit, "good")}</div>
          <div class="vision-status-row"><strong>Modeled impact</strong><strong>+$185K reimbursement opportunity</strong></div>
          <button class="vision-btn" data-vision-screen="strategy" type="button">Choose strategy</button>
        </article>
      </div>
      <div class="vision-grid-3 spaced">
        <article class="vision-card">
          <h2>Top Actions</h2>
          <ul class="vision-list">
            <li><span class="vision-dot good"></span><span><strong>Choose MVP specialty subgroups</strong><em>Highest modeled fit from enabled measures and specialty cohorts.</em></span></li>
            <li><span class="vision-dot warn"></span><span><strong>Review medium-confidence cohorts</strong><em>Mental health and women's health need customer confirmation.</em></span></li>
            <li><span class="vision-dot good"></span><span><strong>Open evidence work queue</strong><em>428 patients likely have supporting evidence available.</em></span></li>
          </ul>
          <button class="vision-btn secondary" data-vision-screen="performance" type="button">Open opportunities</button>
        </article>
        <article class="vision-card">
          <h2>Critical Blockers</h2>
          <ul class="vision-list">
            <li><span class="vision-dot bad"></span><span>Cardiology MVP blocked because required measures are not enabled.</span></li>
            <li><span class="vision-dot warn"></span><span>37 validation records need human judgment before approval.</span></li>
            <li><span class="vision-dot warn"></span><span>3 data feeds have mapping issues that could move forecast confidence.</span></li>
          </ul>
          <button class="vision-btn secondary" data-vision-jump="submissions:validation-plan" type="button">Review blockers</button>
        </article>
        <article class="vision-card">
          <h2>Submission Status</h2>
          <div class="vision-status-row"><strong>MVP Submission</strong>${visionBadge("Ready to plan", "good")}</div>
          <div class="vision-status-row"><strong>APP Plus</strong>${visionBadge("Available", "info")}</div>
          <div class="vision-status-row"><strong>QRDA Export</strong>${visionBadge("Supporting path", "info")}</div>
          <div class="vision-status-row"><strong>Traditional MIPS</strong>${visionBadge("Transition only", "warn")}</div>
          <button class="vision-btn secondary" data-vision-screen="submissions" type="button">Prepare submission</button>
        </article>
      </div>
    `,
  });
}

function renderVisionStrategyScreen() {
  const tabs = [
    { id: "recommended", label: "Recommended Path" },
    { id: "compare", label: "Compare Options" },
    { id: "simulate", label: "Simulate" },
    { id: "assumptions", label: "Assumptions" },
  ];
  const activeTab = state.visionStrategyTab || "recommended";
  const body = `
    ${renderVisionTabs(tabs, "visionStrategyTab")}
    ${activeTab === "compare" ? renderVisionStrategyCompareTab() : activeTab === "simulate" ? renderVisionStrategySimulateTab() : activeTab === "assumptions" ? renderVisionStrategyAssumptionsTab() : renderVisionStrategyRecommendedTab()}
  `;
  return renderVisionScreenFrame({
    id: "strategy",
    crumb: "Strategy",
    title: "Choose the Best Reporting Path",
    subtitle: "Compare last year's baseline against forecasted paths, then choose the strategy Hyperion wants to operationalize.",
    filters: `<span>Scope: Hyperion Health System</span><span>Performance Year: 2026</span>`,
    body,
  });
}

function renderVisionStrategyRecommendedTab() {
  const selected = selectedVisionStrategy();
  const summary = visionStrategyDraftSummary();
  return `
    <div class="vision-grid-2 strategy-decision-grid">
      <article class="vision-card">
        <div class="vision-section-title">
          <span class="vision-kicker">Choose strategy</span>
          <h3>Candidate submission strategies</h3>
          <p>Previous year is shown as a baseline. Active candidates are ranked by modeled score, measure coverage, specialty fit, and effort.</p>
        </div>
        <div class="vision-table-wrap">
          <table class="vision-table vision-strategy-table">
            <thead><tr><th>Path</th><th>Forecast</th><th>Effort</th><th>Status</th><th></th></tr></thead>
            <tbody>
              <tr class="baseline-row">
                <td><strong>${previousSubmissionBaseline.path}</strong><span class="subline">${previousSubmissionBaseline.year} / ${previousSubmissionBaseline.measures}</span></td>
                <td>${previousSubmissionBaseline.score}</td>
                <td>Known</td>
                <td>${visionBadge("Baseline", "info")}</td>
                <td></td>
              </tr>
              ${visionStrategyRows.map((row) => `
                <tr class="${row.id === selected.id ? "selected" : ""} ${row.recommendation === "Transition only" ? "disabled" : ""}">
                  <td><strong>${row.path}</strong><span class="subline">${row.strategy}</span></td>
                  <td><strong>${row.performance}</strong><span class="subline">${row.lift}</span></td>
                  <td>${row.effort}<span class="subline">${row.scope}</span></td>
                  <td>${visionBadge(row.recommendation, strategyTone(row))}</td>
                  <td><button class="vision-row-button" data-vision-strategy="${row.id}" type="button">${row.id === selected.id ? "Viewing" : "View"}</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </article>
      <article class="vision-soft-card selected-vision-strategy">
        <span class="vision-kicker">${selected.recommendation}</span>
        <h2>${selected.path}</h2>
        <p>${selected.strategy}</p>
        <div class="vision-mini-grid four">
          <div><span>Score</span><strong>${selected.performance.replace(" projected", "")}</strong></div>
          <div><span>Lift</span><strong>${selected.lift.replace(" pts", "")}</strong></div>
          <div><span>Fit</span><strong>${selected.fit}</strong></div>
          <div><span>Effort</span><strong>${selected.effort}</strong></div>
        </div>
        <div class="vision-status-row"><strong>Previous baseline</strong><span>${previousSubmissionBaseline.path} / ${previousSubmissionBaseline.score}</span></div>
        <div class="vision-status-row"><strong>Current mix</strong><span>${summary.subgroups} subgroups, ${summary.providers} providers, ${summary.reviewCount} cohorts need review</span></div>
        <div class="vision-status-row"><strong>Decision</strong><span>${strategyContextFor(selected).primaryDecision}</span></div>
        <div class="vision-action-row">
          <button class="vision-btn secondary" data-customize-vision-strategy type="button" ${selected.id !== "mvp-specialty-subgroups" ? "disabled" : ""}>Edit provider mix</button>
          <button class="vision-btn" data-lock-vision-strategy="${selected.id}" type="button" ${selected.recommendation === "Transition only" ? "disabled" : ""}>Use this strategy</button>
        </div>
      </article>
    </div>
    ${selected.id === "mvp-specialty-subgroups" ? renderVisionMvpSubgroupMixer() : renderStrategyOperationalPanel(selected)}
  `;
}

function renderVisionStrategyCompareTab() {
  return `
    <div class="vision-card">
      <div class="vision-section-title">
        <span class="vision-kicker">Compare options</span>
        <h3>Forecasted strategy options</h3>
        <p>This view keeps every candidate visible, including unavailable paths, so customers can understand why a path was recommended or blocked.</p>
      </div>
      <table class="vision-table">
        <thead><tr><th>Option</th><th>Modeled score</th><th>Provider scope</th><th>Measure signal</th><th>Customer decision</th></tr></thead>
        <tbody>
          <tr><td><strong>${previousSubmissionBaseline.path}</strong><span class="subline">${previousSubmissionBaseline.status} last year</span></td><td>${previousSubmissionBaseline.score}</td><td>${previousSubmissionBaseline.providers}</td><td>${previousSubmissionBaseline.measures}</td><td>Baseline only</td></tr>
          ${visionStrategyRows.map((row) => {
            const context = strategyContextFor(row);
            return `
              <tr class="${row.recommendation === "Transition only" ? "disabled" : ""}">
                <td><strong>${row.path}</strong><span class="subline">${row.recommendation}</span></td>
                <td>${row.performance}<span class="subline">${row.lift}</span></td>
                <td>${row.scope}</td>
                <td>${row.measureCoverage}</td>
                <td>${context.customerDecisions[0]}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderVisionStrategySimulateTab() {
  return `
    <div class="vision-grid-2 strategy-sim-grid">
      <article class="vision-card">
        <h2>What-if simulator</h2>
        <div class="vision-form-row"><strong>Program path</strong>
          <label><input type="radio" name="vision-sim-program" checked /> MVP specialty subgroups</label>
          <label><input type="radio" name="vision-sim-program" /> MVP mixed subgroup + individual</label>
          <label><input type="radio" name="vision-sim-program" /> APP Plus APM Entity</label>
        </div>
        <div class="vision-form-row"><strong>Measure improvement focus</strong>
          <span class="vision-select">HIV Screening / CMS349v8</span>
          <p>Assumed improvement: close 18% of missing evidence and documentation gaps.</p>
          <div class="vision-slider"></div>
        </div>
        <div class="vision-form-row"><strong>Provider mix</strong>
          <label><input type="checkbox" checked /> Include infectious disease subgroup</label>
          <label><input type="checkbox" checked /> Include mental health subgroup</label>
          <label><input type="checkbox" checked /> Include women's health subgroup</label>
          <label><input type="checkbox" disabled /> Cardiology remains blocked until measures are enabled</label>
        </div>
      </article>
      <div class="vision-grid-2 compact-grid">
        <article class="vision-card">
          <h2>Impact Summary</h2>
          <table class="vision-table">
            <thead><tr><th>Scenario</th><th>Score</th><th>Impact</th></tr></thead>
            <tbody>
              <tr><td>Current forecast</td><td>88.3</td><td>$0</td></tr>
              <tr><td>Recommended strategy</td><td>93.8</td><td><strong>+$185K</strong></td></tr>
              <tr><td>With HIV evidence closure</td><td>95.1</td><td><strong>+$226K</strong></td></tr>
            </tbody>
          </table>
          <button class="vision-btn" data-lock-vision-strategy="mvp-specialty-subgroups" type="button">Use recommended scenario</button>
        </article>
        <article class="vision-card">
          <h2>Projected Trend</h2>
          <div class="vision-linechart">
            <svg viewBox="0 0 300 130" aria-hidden="true">
              <path d="M0 98 C62 70, 105 64, 145 49 S229 30,300 21" fill="none" stroke="#07142f" stroke-dasharray="4 4" stroke-width="3"/>
              <path d="M0 98 C60 76, 110 72, 151 59 S230 43,300 35" fill="none" stroke="#075bff" stroke-width="3"/>
              <path d="M0 98 C80 86, 165 82, 300 77" fill="none" stroke="#a7b1c2" stroke-width="3"/>
            </svg>
          </div>
        </article>
      </div>
    </div>
  `;
}

function renderVisionStrategyAssumptionsTab() {
  return `
    <div class="vision-card">
      <div class="vision-section-title">
        <span class="vision-kicker">Assumptions</span>
        <h3>Inputs used to generate recommendations</h3>
        <p>These are reference details for the quality manager, not the first task in the workflow.</p>
      </div>
      <div class="vision-grid-4">
        ${visionStrategyInputs.map((item) => `
          <article class="vision-mini-card">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
            <em>${item.source}</em>
            <p>${item.detail}</p>
          </article>
        `).join("")}
      </div>
    </div>
  `;
}

function renderVisionPerformanceScreen() {
  const selected = selectedValidationMeasure();
  const tabs = [
    { id: "trending-quality", label: "Trending Quality Over Time" },
    { id: "patient-opportunities", label: "Patient Opportunities" },
    { id: "patient-level", label: "Patient Level Validation" },
  ];
  const activeTab = normalizeVisionPerformanceTab(state.visionPerformanceTab);
  const tabContent = activeTab === "patient-opportunities"
    ? renderVisionNearMissTab()
    : activeTab === "trending-quality"
      ? renderVisionTrendingQualityTab()
      : activeTab === "patient-level"
        ? renderVisionSelectedPatientsTab()
        : renderVisionTrendingQualityTab();
  return renderVisionScreenFrame({
    id: "performance",
    crumb: "Quality Workbench",
    title: "Quality Workbench",
    subtitle: "Monitor measure movement, work patient opportunities, and validate selected patient outcomes from one place.",
    filters: `<span>Focused measure: ${selected.measure}</span><span>Score refresh: Today 6:10 AM</span><span>Prior comparison: ${validationPriorSnapshotLabel} -> ${validationCurrentSnapshotLabel}</span>`,
    body: `
      ${renderVisionTabs(tabs, "visionPerformanceTab")}
      ${tabContent}
    `,
  });
}

function renderVisionNearMissTab() {
  const selected = selectedValidationMeasure();
  const totalNearMisses = visionMeasureOpportunityRows.reduce((sum, row) => sum + Number(row.nearMiss), 0);
  const totalLift = "5.5";
  return `
    <div class="workbench-summary-row">
      <div>
        <span class="vision-kicker">Patient opportunities</span>
        <strong>${totalNearMisses} near-miss patients · +${totalLift} pts modeled lift</strong>
        <em>Focused on submitted measures where evidence, workflow, or mapping changes could move performance.</em>
      </div>
      <div class="inline-action-group">
        <button class="vision-row-button" data-validation-measure="${selected.id}" type="button">Open ${selected.measure} patients</button>
        <button class="vision-row-button" data-workbench-trend-measure="${selected.id}" type="button">View trend</button>
      </div>
    </div>
    <article class="vision-card spaced">
      <div class="vision-section-title compact">
        <span class="vision-kicker">Performance lift</span>
        <h3>Measures ranked by actionable opportunity</h3>
      </div>
      <table class="vision-table">
        <thead><tr><th>Measure</th><th>Current / target</th><th>Patient signal</th><th>Modeled lift</th><th>Likely reason</th><th></th></tr></thead>
        <tbody>
          ${visionMeasureOpportunityRows.map((row) => `
            <tr class="${row.measureId === selected.id ? "selected" : ""}">
              <td><strong>${row.measure}</strong><span class="subline">${row.id} / ${row.subgroup}</span></td>
              <td><strong>${attestationTrendFor(row.measureId).current}</strong><span class="subline">Target ${qualityTargetFor(row.measureId)}% · benchmark ${row.benchmark}</span></td>
              <td><strong>${row.nearMiss}</strong><span class="subline">${row.closeness} close · ${changedPatientCountForMeasure(validationMeasureById(row.measureId))} status changes</span></td>
              <td>${visionBadge(row.lift, row.lift.includes("3.4") ? "bad" : row.lift.includes("1.2") ? "good" : "warn")}</td>
              <td><strong>${row.focus}</strong><span class="subline">${row.issue}</span></td>
              <td>
                <div class="row-action-stack">
                  <button class="vision-row-button" data-opportunity-patients="${row.measureId}" type="button">Open patients</button>
                  <button class="vision-row-button" data-opportunity-explain="${row.measureId}:${row.representativePatient}" type="button">Explain example</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </article>
  `;
}

function renderVisionValidationScreen() {
  return renderVisionPerformanceScreen();
}

function patientOutcomeAnswer(patient, measure) {
  if (patient.satisfaction === "Satisfied") {
    return `This patient satisfies ${measure.code}. The numerator evidence, qualifying encounter, and attribution are all present in the active calculation.`;
  }
  if (patient.satisfaction === "Excluded") {
    return `This patient is excluded from ${measure.code}. The exclusion evidence is present and should be kept in the validation sample as a control record.`;
  }
  if (patient.currentState.toLowerCase().includes("near miss")) {
    return `This patient is close to satisfying ${measure.code}, but one evidence or mapping condition is still blocking the numerator.`;
  }
  return `This patient is included in the denominator for ${measure.code}, but the numerator evidence is not currently sufficient.`;
}

function patientOutcomeRows(patient, measure) {
  const category = patientOutcomeCategory(patient);
  return [
    {
      check: "Patient attribution",
      detail: `${patient.provider} / ${patient.specialty}`,
      result: visionBadge("Confirmed", "good"),
    },
    {
      check: "Outcome population",
      detail: `${measure.subgroup}; this record is counted in the ${patientOutcomeCategoryName(category).toLowerCase()} population.`,
      result: patientOutcomeBadge(patient),
    },
    {
      check: "Current calculation evidence",
      detail: patient.evidence,
      result: visionBadge(patient.currentState, patient.satisfactionTone),
    },
    {
      check: `Prior snapshot comparison (${validationPriorSnapshotLabel} -> ${validationCurrentSnapshotLabel})`,
      detail: `Prior state was ${patient.priorState.toLowerCase()}. Current state is ${patient.currentState.toLowerCase()}.`,
      result: visionBadge(patient.change, patient.changeTone),
    },
    {
      check: "Source data used",
      detail: patientDataSources(patient),
      result: visionBadge("Available", "info"),
    },
  ];
}

function renderVisionPatientOutcomePanel(measure, patient, options = {}) {
  return `
    <aside class="patient-outcome-panel ${options.standalone ? "standalone" : ""}">
      <div class="patient-outcome-header">
        <span class="vision-kicker">Outcome explainability</span>
        <h3>${patient.patient} / ${measure.code}</h3>
        <p>${measure.measure} · ${measure.mvp}</p>
      </div>
      <div class="patient-outcome-metrics">
        <div><span>Current state</span><strong>${patient.currentState}</strong></div>
        <div><span>Prior state</span><strong>${patient.priorState}</strong></div>
        <div><span>Change</span><strong>${patient.change}</strong></div>
      </div>
      <div class="patient-outcome-answer">
        <strong>Why is this patient in this outcome state?</strong>
        <p>${patientOutcomeAnswer(patient, measure)}</p>
      </div>
      <table class="vision-table compact outcome-explainability-table">
        <thead><tr><th>Validation question</th><th>Evidence found</th><th>Outcome</th></tr></thead>
        <tbody>
          ${patientOutcomeRows(patient, measure).map((row) => `
            <tr>
              <td><strong>${row.check}</strong></td>
              <td>${row.detail}</td>
              <td>${row.result}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="vision-action-row">
        <button class="vision-btn secondary" data-toast="Patient chart opened" type="button">View chart</button>
        <button class="vision-btn secondary" data-toast="Outcome explanation exported" type="button">Export explanation</button>
      </div>
    </aside>
  `;
}

function patientValidationRowsForMeasure(measure) {
  const filter = state.patientValidationFilter || "all";
  return sortPatientValidationRows(patientsForValidationFilter(measure, filter));
}

function sortPatientValidationRows(patients) {
  const sort = state.patientValidationSort || "changed-first";
  const rows = [...patients];
  const outcomeOrder = { numerator: 0, denominator: 1, exclusion: 2 };
  if (sort === "patient-id") {
    return rows.sort((first, second) => first.patient.localeCompare(second.patient));
  }
  if (sort === "outcome") {
    return rows.sort((first, second) =>
      outcomeOrder[patientOutcomeCategory(first)] - outcomeOrder[patientOutcomeCategory(second)]
      || first.patient.localeCompare(second.patient),
    );
  }
  return rows.sort((first, second) =>
    Number(patientHasStateChange(second)) - Number(patientHasStateChange(first))
    || first.patient.localeCompare(second.patient),
  );
}

function patientValidationFilterCounts(measure) {
  const patients = validationPatientsForMeasure(measure);
  return {
    all: patients.length,
    changed: patients.filter(patientHasStateChange).length,
    numerator: patients.filter((patient) => patientOutcomeCategory(patient) === "numerator").length,
    denominator: patients.filter((patient) => patientOutcomeCategory(patient) === "denominator").length,
    exclusion: patients.filter((patient) => patientOutcomeCategory(patient) === "exclusion").length,
  };
}

function renderPatientValidationFilterButton(filter, label, count, showCount = false) {
  const active = state.patientValidationFilter === filter;
  return `<button class="${active ? "active" : ""}" data-validation-filter="${filter}" type="button">${label}${showCount ? `<strong>${count}</strong>` : ""}</button>`;
}

function renderVisionSelectedPatientsTab() {
  const selected = selectedValidationMeasure();
  const searchValue = escapeHtml(state.patientValidationSearch);
  const visiblePatients = patientValidationRowsForMeasure(selected);
  const filterCounts = patientValidationFilterCounts(selected);
  const activeFilter = state.patientValidationFilter || "all";
  const selectedTotal = validationPatientsForMeasure(selected).length;
  return `
    <article class="vision-card patient-validation-workspace compact-patient-validation">
      <div class="validation-worklist-header compact">
        <div>
          <span class="vision-kicker">Patient level validation</span>
          <h3>Validate selected patient populations</h3>
          <p>Choose a submitted measure, filter its selected patients by outcome population or state change, then open explainability for any patient.</p>
        </div>
        <div class="selected-patient-actions">
          <div class="patient-search-bar">
            <label>
              <span>Open patient</span>
              <input type="search" data-patient-search value="${searchValue}" placeholder="HY-10482, provider, specialty..." />
            </label>
            <button class="vision-btn secondary" data-patient-search-action type="button">Search</button>
          </div>
          <div class="inline-action-group">
            <button class="vision-row-button" data-workbench-trend-measure="${selected.id}" type="button">Trend</button>
            <button class="vision-row-button" data-workbench-opportunities="${selected.id}" type="button">Opportunities</button>
          </div>
        </div>
      </div>
      <div class="patient-validation-measure-table-wrap">
        <table class="vision-table patient-validation-measure-table compact">
          <thead><tr><th>Measure</th><th>Program</th><th>Selected patients</th><th>Satisfaction rate</th><th>WoW change</th><th>Target</th><th></th></tr></thead>
          <tbody>
            ${visionValidationPatientMeasures.map((measure) => {
              const trend = attestationTrendFor(measure.id);
              const target = qualityTargetFor(measure.id);
              return `
                <tr class="${measure.id === selected.id ? "selected" : ""}">
                  <td><strong>${measure.measure}</strong><span class="subline">${measure.code}</span></td>
                  <td>${measure.mvp}</td>
                  <td><strong>${validationPatientsForMeasure(measure).length}</strong></td>
                  <td><strong>${trend.current}</strong></td>
                  <td>${visionBadge(trend.wowChange, trend.wowTone)}<span class="subline">${validationPriorSnapshotLabel} -> ${validationCurrentSnapshotLabel}</span></td>
                  <td>${target}%</td>
                  <td><button class="vision-row-button" data-validation-measure="${measure.id}" type="button">${measure.id === selected.id ? "Open" : "Open population"}</button></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </article>
    <article class="vision-card spaced selected-patient-pane">
      <div class="selected-patient-header">
          <div>
            <span class="vision-kicker">Selected patient population</span>
            <h3>${selected.measure}</h3>
            <p>${selected.code} · ${selected.mvp} · showing ${visiblePatients.length} of ${selectedTotal} selected patients${activeFilter === "all" ? "" : ` filtered to ${patientOutcomeCategoryName(activeFilter).toLowerCase()}`}</p>
          </div>
          <div class="validation-snapshot-note">
            <span>Comparison window</span>
            <strong>${validationPriorSnapshotLabel} -> ${validationCurrentSnapshotLabel}</strong>
          </div>
      </div>
      <div class="validation-worklist-controls">
        <div class="validation-filter-group" aria-label="Patient validation filters">
          ${renderPatientValidationFilterButton("all", "All selected", filterCounts.all, true)}
          ${renderPatientValidationFilterButton("changed", "Status changed", filterCounts.changed, true)}
          ${renderPatientValidationFilterButton("numerator", "Numerator", filterCounts.numerator, true)}
          ${renderPatientValidationFilterButton("denominator", "Denominator", filterCounts.denominator, true)}
          ${renderPatientValidationFilterButton("exclusion", "Exclusion", filterCounts.exclusion, true)}
        </div>
        <label class="validation-sort-control">
          <span>Sort</span>
          <select data-validation-sort>
            <option value="changed-first" ${state.patientValidationSort === "changed-first" ? "selected" : ""}>Status changed first</option>
            <option value="outcome" ${state.patientValidationSort === "outcome" ? "selected" : ""}>Outcome population</option>
            <option value="patient-id" ${state.patientValidationSort === "patient-id" ? "selected" : ""}>Patient ID</option>
          </select>
        </label>
      </div>
      <table class="vision-table selected-patient-table validation-queue-table">
        <thead><tr><th>Patient</th><th>Provider / specialty</th><th>Outcome</th><th>Current (${validationCurrentSnapshotLabel})</th><th>Prior (${validationPriorSnapshotLabel})</th><th>State change</th><th>Evidence summary</th><th>Sources</th><th></th></tr></thead>
        <tbody>
          ${visiblePatients.length ? visiblePatients.map((row) => `
              <tr class="${patientHasStateChange(row) ? "state-changed" : ""}">
                <td><strong>${row.patient}</strong><span class="subline">${selected.code}</span></td>
                <td><strong>${row.provider}</strong><span class="subline">${row.specialty}</span></td>
                <td>${patientOutcomeBadge(row)}</td>
                <td><strong>${row.currentState}</strong></td>
                <td>${row.priorState}</td>
                <td>${visionBadge(row.change, row.changeTone)}</td>
                <td>${row.evidence}</td>
                <td>${patientDataSources(row)}</td>
                <td><button class="vision-row-button" data-open-patient-explanation="${row.patient}" type="button">Explain</button></td>
              </tr>
          `).join("") : `
            <tr><td colspan="9"><div class="empty-state">No patients match this outcome filter.</div></td></tr>
          `}
        </tbody>
      </table>
    </article>
  `;
}

function renderVisionTrendingQualityTab() {
  const belowTarget = visionValidationPatientMeasures.filter((measure) => currentTrendValue(measure.id) < qualityTargetFor(measure.id)).length;
  const totalChanged = visionValidationPatientMeasures.reduce((sum, measure) => sum + changedPatientCountForMeasure(measure), 0);
  const totalSelected = visionValidationPatientMeasures.reduce((sum, measure) => sum + validationPatientsForMeasure(measure).length, 0);
  const largestMove = visionValidationPatientMeasures.reduce((largest, measure) => {
    const currentChange = Math.abs(Number.parseFloat(attestationTrendFor(measure.id).wowChange));
    const largestChange = Math.abs(Number.parseFloat(attestationTrendFor(largest.id).wowChange));
    return currentChange > largestChange ? measure : largest;
  }, visionValidationPatientMeasures[0]);
  const largestMoveTrend = attestationTrendFor(largestMove.id);
  return `
    <div class="workbench-summary-row">
      <div>
        <span class="vision-kicker">Population validation</span>
        <strong>${visionValidationPatientMeasures.length} measures · ${belowTarget} below target · ${totalChanged} changed patient outcomes</strong>
        <em>Largest WoW movement is ${largestMoveTrend.wowChange} on ${largestMove.measure}; selected validation population contains ${totalSelected} patients.</em>
      </div>
      <div class="inline-action-group">
        <button class="vision-row-button" data-validation-changes="${largestMove.id}" type="button">Review largest change</button>
        <button class="vision-row-button" data-validation-measure="${selectedValidationMeasure().id}" type="button">Open selected patients</button>
      </div>
    </div>
    <article class="vision-card spaced quality-trend-workspace">
      <div class="vision-section-title compact">
        <span class="vision-kicker">Measure trends</span>
        <h3>Trending quality over time</h3>
      </div>
      <table class="vision-table quality-trend-table">
        <thead>
          <tr>
            <th>Measure</th>
            <th>Current quality</th>
            <th>WoW change</th>
            <th>Customer target</th>
            <th>Gap to target</th>
            <th>Trend</th>
            <th>Changed outcomes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
      ${visionValidationPatientMeasures.map((measure) => {
        const trend = attestationTrendFor(measure.id);
        const target = qualityTargetFor(measure.id);
        return `
          <tr class="${measure.id === selectedValidationMeasure().id ? "selected" : ""}">
            <td><strong>${measure.measure}</strong><span class="subline">${measure.code} / ${measure.mvp}</span></td>
            <td><strong>${trend.current}</strong><span class="subline">${validationPatientsForMeasure(measure).length} selected patients</span></td>
            <td><span class="wow-change-badge ${trend.wowTone}">${trend.wowChange}</span></td>
            <td>
              <label class="quality-target-control">
                <input type="number" min="50" max="100" value="${target}" data-quality-target="${measure.id}" aria-label="${measure.measure} customer target" />
                <span>%</span>
              </label>
            </td>
            <td data-quality-gap="${measure.id}">${qualityTargetGapBadge(measure.id)}</td>
            <td>${renderAttestationTrendChart(measure, { table: true })}</td>
            <td>
              <button class="vision-row-button" data-validation-changes="${measure.id}" type="button">${changedPatientCountForMeasure(measure)} changed</button>
              <span class="subline">${validationPriorSnapshotLabel} -> ${validationCurrentSnapshotLabel}</span>
            </td>
            <td>
              <div class="row-action-stack">
                <button class="vision-row-button" data-validation-measure="${measure.id}" type="button">Patients</button>
                <button class="vision-row-button" data-workbench-opportunities="${measure.id}" type="button">Opportunities</button>
              </div>
            </td>
          </tr>
        `;
      }).join("")}
        </tbody>
      </table>
    </article>
  `;
}

function renderVisionAttestationTrendsTab() {
  return renderVisionTrendingQualityTab();
}

function renderVisionValidationPlanTab() {
  const totalSelected = visionValidationPatientMeasures.reduce((sum, measure) => sum + validationPatientsForMeasure(measure).length, 0);
  const belowTarget = visionValidationPatientMeasures.filter((measure) => currentTrendValue(measure.id) < qualityTargetFor(measure.id)).length;
  return `
    <div class="vision-grid-4">
      <article class="vision-card"><span class="vision-kicker">Submitted measures</span><strong class="vision-metric">6</strong><p>Across the selected MVP + APP Plus mix</p></article>
      <article class="vision-card"><span class="vision-kicker">Selected patients</span><strong class="vision-metric">${totalSelected}</strong><p>Frozen validation population</p></article>
      <article class="vision-card"><span class="vision-kicker">Comparison window</span><strong class="vision-metric">${validationPriorSnapshotLabel} -> ${validationCurrentSnapshotLabel}</strong><p>Prior state vs. current state</p></article>
      <article class="vision-card"><span class="vision-kicker">Below target</span><strong class="vision-metric danger">${belowTarget}</strong><p>Measures needing closer review</p></article>
    </div>
    <div class="validation-method-grid spaced">
      <article class="vision-card">
        <div class="vision-section-title">
          <span class="vision-kicker">Validation plan</span>
          <h3>Freeze the selected population and reconcile outcome movement</h3>
          <p>The customer validates the selected patients for each submitted measure, then uses the same population to review changes after data, mapping, or logic updates.</p>
        </div>
        <table class="vision-table">
          <thead><tr><th>Measure</th><th>Program</th><th>Selected patients</th><th>Satisfaction rate</th><th>WoW change</th><th>Target</th><th>Status</th></tr></thead>
          <tbody>
            ${visionValidationPatientMeasures.map((measure) => {
              const trend = attestationTrendFor(measure.id);
              const target = qualityTargetFor(measure.id);
              const status = currentTrendValue(measure.id) >= target ? "On target" : "Needs review";
              return `
              <tr>
                <td><strong>${measure.measure}</strong><span class="subline">${measure.code}</span></td>
                <td>${measure.mvp}</td>
                <td>${validationPatientsForMeasure(measure).length}</td>
                <td><strong>${trend.current}</strong></td>
                <td>${visionBadge(trend.wowChange, trend.wowTone)}<span class="subline">${validationPriorSnapshotLabel} -> ${validationCurrentSnapshotLabel}</span></td>
                <td>${target}%</td>
                <td>${visionBadge(status, status === "On target" ? "good" : "warn")}</td>
              </tr>
            `;
            }).join("")}
          </tbody>
        </table>
      </article>
      <aside class="vision-soft-card">
        <h2>Recommended Validation Design</h2>
        <p><strong>Keep validation anchored to selected patients, outcome state, and explainability.</strong></p>
        <div class="vision-status-row"><strong>Selected population</strong><span>Frozen patients for each submitted measure</span></div>
        <div class="vision-status-row"><strong>Outcome view</strong><span>Filter patients by numerator, denominator, or exclusion</span></div>
        <div class="vision-status-row"><strong>Comparison</strong><span>Review prior state against current state</span></div>
        <div class="vision-status-row"><strong>Reconciliation</strong><span>Reopen frozen packets after logic stabilizes</span></div>
        <div class="vision-action-row">
          <button class="vision-btn" data-toast="Validation population frozen" type="button">Freeze population</button>
          <button class="vision-btn secondary" data-vision-jump="performance:trending-quality" type="button">Track quality trends</button>
        </div>
      </aside>
    </div>
  `;
}

function renderVisionPatientEvidenceTab() {
  const measure = selectedValidationMeasure();
  const patient = selectedValidationPatient(measure);
  return renderVisionPatientOutcomePanel(measure, patient, { standalone: true });
}

function renderVisionPatientEvidenceScreen() {
  const measure = selectedValidationMeasure();
  const patient = selectedValidationPatient(measure);
  return renderVisionScreenFrame({
    id: "patient-evidence",
    crumb: "Outcome Explainability",
    title: `${patient.patient} / ${measure.code}`,
    subtitle: "Explain why a selected patient is in the current measure outcome state.",
    filters: `<span>Measurement Period: 2026</span><span>Source refresh: Today 6:10 AM</span>`,
    actions: `<button class="vision-btn secondary" data-vision-jump="performance:patient-level" type="button">Back to validation</button>`,
    body: `
      ${renderVisionPatientOutcomePanel(measure, patient, { standalone: true })}
    `,
  });
}

function renderVisionReadinessScreen() {
  return renderVisionScreenFrame({
    id: "readiness",
    crumb: "Readiness",
    title: "Fix What Blocks Submission",
    subtitle: "Keep setup health separate from strategy selection so blockers are managed as work, not extra context.",
    filters: `<span>Program: MVP specialty subgroups</span><span>Package: Draft SUB-2026-00912</span>`,
    body: `
      <div class="vision-grid-4">
        <article class="vision-card"><span class="vision-kicker">Ready</span><strong class="vision-metric">8</strong><p>domains/checks</p></article>
        <article class="vision-card"><span class="vision-kicker">Warnings</span><strong class="vision-metric">5</strong><p>review before approval</p></article>
        <article class="vision-card"><span class="vision-kicker">Blocked</span><strong class="vision-metric danger">3</strong><p>must resolve</p></article>
        <article class="vision-card"><span class="vision-kicker">Risk</span><strong class="vision-metric">Med</strong><p>submission readiness</p></article>
      </div>
      <div class="vision-grid-2 spaced">
        <article class="vision-card">
          <h2>Readiness by Domain</h2>
          <table class="vision-table">
            <thead><tr><th>Domain</th><th>Status</th><th>Impact</th><th></th></tr></thead>
            <tbody>
              <tr><td><strong>Subgroup registration</strong></td><td>${visionBadge("Warning", "warn")}</td><td>Mental health narrative needs customer confirmation</td><td><button class="vision-row-button" data-vision-screen="strategy" type="button">Review</button></td></tr>
              <tr><td><strong>Personnel</strong></td><td>${visionBadge("Blocked", "bad")}</td><td>14 clinicians missing valid aliases for attribution</td><td><button class="vision-row-button" data-toast="Personnel worklist opened" type="button">Fix</button></td></tr>
              <tr><td><strong>Data sources</strong></td><td>${visionBadge("Warning", "warn")}</td><td>HIV lab feed mapping affects numerator confidence</td><td><button class="vision-row-button" data-vision-jump="performance:patient-opportunities" type="button">Open</button></td></tr>
              <tr><td><strong>Security</strong></td><td>${visionBadge("Ready", "good")}</td><td>CMS QPP OAuth connection available</td><td><button class="vision-row-button" data-vision-screen="submissions" type="button">View</button></td></tr>
              <tr><td><strong>QRDA package</strong></td><td>${visionBadge("Ready", "good")}</td><td>Export can be generated after package approval</td><td><button class="vision-row-button" data-vision-screen="qrda" type="button">View</button></td></tr>
            </tbody>
          </table>
        </article>
        <article class="vision-soft-card">
          <h2>Recommended Fix Order</h2>
          <ol class="vision-ordered-list">
            <li>Resolve clinician attribution aliases that affect subgroup rosters.</li>
            <li>Confirm subgroup composition and narrative for CMS registration.</li>
            <li>Review HIV lab mapping before final patient validation.</li>
          </ol>
          <button class="vision-btn" data-vision-screen="submissions" type="button">Continue to submission prep</button>
        </article>
      </div>
    `,
  });
}

function renderVisionSubmissionScreen() {
  const tabs = [
    { id: "package", label: "Submission Package" },
    { id: "validation-plan", label: "Validation Plan" },
    { id: "cms", label: "CMS Connection" },
    { id: "qrda-linked", label: "Linked QRDA Package" },
    { id: "history", label: "Submission History" },
  ];
  const activeTab = state.visionSubmissionTab || "package";
  const tabContent = activeTab === "validation-plan"
    ? renderVisionValidationPlanTab()
    : activeTab === "cms"
      ? renderVisionCmsConnectionTab()
      : activeTab === "qrda-linked"
        ? renderVisionLinkedQrdaTab()
        : activeTab === "history"
          ? renderVisionSubmissionHistoryTab()
          : renderVisionSubmissionPackageTab();
  return renderVisionScreenFrame({
    id: "submissions",
    crumb: "Submissions",
    title: "Guided Submission",
    subtitle: "Prepare, approve, and submit the selected strategy through a governed workflow.",
    filters: `<span>Draft: SUB-2026-00912</span><span>Program: MVP specialty subgroups</span>`,
    body: `
      ${renderVisionTabs(tabs, "visionSubmissionTab")}
      <div class="vision-stepper">
        <div class="done"><span>1</span>Pre-check</div>
        <div class="done"><span>2</span>Optimize</div>
        <div class="active"><span>3</span>Validate</div>
        <div><span>4</span>Approve</div>
        <div><span>5</span>Submit</div>
        <div><span>6</span>Archive</div>
      </div>
      ${tabContent}
    `,
  });
}

function renderVisionSubmissionPackageTab() {
  return `
      <div class="vision-grid-2">
        <article class="vision-card">
          <h2>Submission Package</h2>
          <table class="vision-table">
            <tbody>
              <tr><td>Strategy</td><td><strong>MVP specialty subgroups</strong></td></tr>
              <tr><td>Subgroups</td><td><strong>3 included, 1 blocked</strong></td></tr>
              <tr><td>Providers</td><td><strong>143 included</strong></td></tr>
              <tr><td>Projected final score</td><td><strong>93.8</strong></td></tr>
              <tr><td>OAuth session</td><td><strong>${qppSession.label} / ${qppSession.remaining}</strong></td></tr>
            </tbody>
          </table>
          <div class="vision-action-row">
            <button class="vision-btn secondary" data-vision-jump="submissions:validation-plan" type="button">Review validation plan</button>
            <button class="vision-btn" data-toast="Submission package approved" type="button">Approve package</button>
          </div>
        </article>
        <article class="vision-soft-card">
          <h2>What Will Be Submitted</h2>
          <div class="vision-status-row"><strong>Infectious disease subgroup</strong>${visionBadge("Ready", "good")}</div>
          <div class="vision-status-row"><strong>Mental health subgroup</strong>${visionBadge("Needs narrative", "warn")}</div>
          <div class="vision-status-row"><strong>Women's health subgroup</strong>${visionBadge("Ready", "good")}</div>
          <div class="vision-status-row"><strong>Cardiology MVP</strong>${visionBadge("Excluded", "bad")}</div>
          <button class="vision-btn secondary" data-vision-screen="strategy" type="button">Edit strategy mix</button>
        </article>
      </div>
      <div class="vision-grid-2 spaced">
        <article class="vision-card">
          <h2>Submission Status</h2>
          <table class="vision-table">
            <thead><tr><th>Step</th><th>Status</th><th>Detail</th></tr></thead>
            <tbody>
              ${visionSubmissionRows.map((row) => `<tr><td><strong>${row.step}</strong></td><td>${row.status}</td><td>${row.detail}</td></tr>`).join("")}
            </tbody>
          </table>
        </article>
        <article class="vision-card">
          <h2>Linked QRDA Export</h2>
          <p>QRDA files are generated from the same approved package so downloaded files and API submission cannot drift apart.</p>
          <div class="vision-file-row"><span>III</span><strong>QRDA_III_Hyperion_2026.xml</strong><button class="vision-row-button" data-vision-screen="qrda" type="button">Open</button></div>
          <div class="vision-file-row"><span>ZIP</span><strong>CMS_Upload_Package.zip</strong><button class="vision-row-button" data-vision-screen="qrda" type="button">Open</button></div>
        </article>
      </div>
  `;
}

function renderVisionCmsConnectionTab() {
  return `
    <div class="vision-grid-2">
      <article class="vision-card">
        <h2>CMS QPP Connection</h2>
        <table class="vision-table">
          <tbody>
            <tr><td>OAuth session</td><td><strong>${qppSession.label}</strong></td></tr>
            <tr><td>Time remaining</td><td><strong>${qppSession.remaining}</strong></td></tr>
            <tr><td>Authorized scope</td><td><strong>MVP subgroup submission</strong></td></tr>
            <tr><td>Package version</td><td><strong>SUB-2026-00912 / approved draft</strong></td></tr>
          </tbody>
        </table>
        <div class="vision-action-row">
          <button class="vision-btn secondary" data-toast="CMS connection refreshed" type="button">Refresh connection</button>
          <button class="vision-btn" data-toast="CMS submission queued" type="button">Submit approved package</button>
        </div>
      </article>
      <article class="vision-soft-card">
        <h2>Final Gates</h2>
        <div class="vision-status-row"><strong>Validation plan</strong>${visionBadge("Ready", "good")}</div>
        <div class="vision-status-row"><strong>Patient-level validation</strong>${visionBadge("87% complete", "warn")}</div>
        <div class="vision-status-row"><strong>Population validation</strong>${visionBadge("2 below target", "warn")}</div>
        <div class="vision-status-row"><strong>Customer approval</strong>${visionBadge("Pending", "warn")}</div>
      </article>
    </div>
  `;
}

function renderVisionLinkedQrdaTab() {
  return `
    <article class="vision-card">
      <h2>Linked QRDA Package</h2>
      <p>QRDA files are generated from the same approved package so downloaded files and API submission cannot drift apart.</p>
      <div class="vision-file-row"><span>III</span><strong>QRDA_III_Hyperion_2026.xml</strong><button class="vision-row-button" data-vision-screen="qrda" type="button">Open</button></div>
      <div class="vision-file-row"><span>ZIP</span><strong>CMS_Upload_Package.zip</strong><button class="vision-row-button" data-vision-screen="qrda" type="button">Open</button></div>
    </article>
  `;
}

function renderVisionSubmissionHistoryTab() {
  return `
    <article class="vision-card">
      <h2>Submission History</h2>
      <table class="vision-table">
        <thead><tr><th>Date</th><th>Package</th><th>Event</th><th>Owner</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Aug 31, 2026</td><td>SUB-2026-00912</td><td>Validation population refreshed</td><td>Quality Manager</td><td>${visionBadge("Current", "info")}</td></tr>
          <tr><td>Aug 24, 2026</td><td>SUB-2026-00912</td><td>Patient-level review packet exported</td><td>Quality Analyst</td><td>${visionBadge("Complete", "good")}</td></tr>
          <tr><td>Aug 17, 2026</td><td>SUB-2026-00912</td><td>Submission package created</td><td>System</td><td>${visionBadge("Complete", "good")}</td></tr>
        </tbody>
      </table>
    </article>
  `;
}

function renderVisionQrdaScreen() {
  return renderVisionScreenFrame({
    id: "qrda",
    crumb: "QRDA Export",
    title: "Generate QRDA Files",
    subtitle: "Generate validated file packages as a supporting workflow after the strategy and package are approved.",
    filters: `<span>Performance Year: 2026</span><span>Customer: Hyperion Health System</span>`,
    actions: `<button class="vision-btn secondary" data-vision-screen="submissions" type="button">Back to submission</button>`,
    body: `
      <div class="vision-grid-2">
        <article class="vision-soft-card">
          <h2>Export Scope</h2>
          <table class="vision-table">
            <tbody>
              <tr><td>Source package</td><td><strong>SUB-2026-00912 approved MVP draft</strong></td></tr>
              <tr><td>QRDA category</td><td><strong>QRDA III summary + QRDA I patient files</strong></td></tr>
              <tr><td>Reporting level</td><td><strong>MVP subgroup</strong></td></tr>
              <tr><td>Measures</td><td><strong>All approved strategy measures</strong></td></tr>
            </tbody>
          </table>
          <button class="vision-btn" data-toast="QRDA package validated" type="button">Validate and generate</button>
        </article>
        <article class="vision-card">
          <h2>QRDA Readiness</h2>
          <div class="vision-status-row"><strong>Measure selection</strong>${visionBadge("Passed", "good")}</div>
          <div class="vision-status-row"><strong>Entity identifiers</strong>${visionBadge("Passed", "good")}</div>
          <div class="vision-status-row"><strong>TIN / NPI mapping</strong>${visionBadge("1 warning", "warn")}</div>
          <div class="vision-status-row"><strong>Data completeness</strong>${visionBadge("72%", "warn")}</div>
          <div class="vision-status-row"><strong>Schema validation</strong>${visionBadge("Passed", "good")}</div>
        </article>
      </div>
      <div class="vision-grid-2 spaced">
        <article class="vision-card">
          <h2>Generated Package</h2>
          <div class="vision-file-row"><span>III</span><strong>QRDA_III_Hyperion_2026.xml</strong><button class="vision-row-button" data-toast="QRDA III downloaded" type="button">Download</button></div>
          <div class="vision-file-row"><span>I</span><strong>QRDA_I_Hyperion_patient_files.zip</strong><button class="vision-row-button" data-toast="QRDA I downloaded" type="button">Download</button></div>
          <div class="vision-file-row"><span>VAL</span><strong>Validation_Report_2026.pdf</strong><button class="vision-row-button" data-toast="Validation report downloaded" type="button">Download</button></div>
        </article>
        <article class="vision-card">
          <h2>Recent QRDA Exports</h2>
          <table class="vision-table">
            <thead><tr><th>Date</th><th>Scope</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Jan 22, 10:38 AM</td><td>MVP subgroup</td><td>QRDA III</td><td>${visionBadge("Ready", "good")}</td></tr>
              <tr><td>Jan 20, 4:11 PM</td><td>All NPIs</td><td>QRDA I</td><td>${visionBadge("Ready", "good")}</td></tr>
              <tr><td>Jan 18, 9:02 AM</td><td>MVP subgroup</td><td>QRDA III</td><td>${visionBadge("Warnings", "warn")}</td></tr>
            </tbody>
          </table>
        </article>
      </div>
    `,
  });
}

function renderVisionAuditScreen() {
  return renderVisionScreenFrame({
    id: "audit",
    crumb: "Audit",
    title: "Audit Center",
    subtitle: "Durable traceability for strategy decisions, evidence review, approvals, CMS submission, and file exports.",
    filters: `<span>Date range: Last 30 days</span><span>Event: All</span><span>User: All</span>`,
    body: `
      <div class="vision-grid-4">
        <article class="vision-card"><span class="vision-kicker">Submission events</span><strong class="vision-metric">28</strong></article>
        <article class="vision-card"><span class="vision-kicker">Evidence views</span><strong class="vision-metric">142</strong></article>
        <article class="vision-card"><span class="vision-kicker">File events</span><strong class="vision-metric">19</strong></article>
        <article class="vision-card"><span class="vision-kicker">Worklist actions</span><strong class="vision-metric">11</strong></article>
      </div>
      <article class="vision-card spaced">
        <h2>Audit Events</h2>
        <table class="vision-table">
          <thead><tr><th>Date / Time</th><th>User</th><th>Event</th><th>Object</th><th>Outcome</th></tr></thead>
          <tbody>
            <tr><td>Jan 22, 10:42 AM</td><td>Quality Admin</td><td>Approved submission strategy</td><td>SUB-2026-00912</td><td>${visionBadge("Success", "good")}</td></tr>
            <tr><td>Jan 22, 10:30 AM</td><td>Reviewer A</td><td>Created patient worklist</td><td>HIV evidence cohort</td><td>${visionBadge("Success", "good")}</td></tr>
            <tr><td>Jan 22, 10:21 AM</td><td>Reviewer A</td><td>Viewed outcome explanation</td><td>CMS349v8 / HY-10482</td><td>${visionBadge("Success", "good")}</td></tr>
            <tr><td>Jan 22, 10:39 AM</td><td>Quality Admin</td><td>Generated QRDA package</td><td>QRDA_III_Hyperion_2026.xml</td><td>${visionBadge("Success", "good")}</td></tr>
            <tr><td>Jan 21, 4:08 PM</td><td>Analyst B</td><td>Resolved attribution alias</td><td>NPI roster</td><td>${visionBadge("Success", "good")}</td></tr>
          </tbody>
        </table>
        <button class="vision-btn secondary" data-toast="Audit report exported" type="button">Export audit report</button>
      </article>
    `,
  });
}

function renderVisionStageContent(stage) {
  if (stage.id === "strategy") return renderVisionStrategyStage();
  if (stage.id === "improve") return renderVisionImproveStage();
  if (stage.id === "monitor") return renderVisionMonitorStage();
  if (stage.id === "validate") return renderVisionValidateStage();
  return renderVisionSubmitStage();
}

function selectedVisionStrategy() {
  return visionStrategyRows.find((row) => row.id === state.selectedVisionStrategy) || visionStrategyRows[0];
}

function selectedVisionSubgroup() {
  return visionMvpSubgroupRows.find((row) => row.id === state.selectedVisionSubgroup) || visionMvpSubgroupRows[0];
}

function isVisionSubgroupIncluded(row) {
  if (row.confidence === "Blocked") return false;
  return state.visionSubgroupSelections[row.id] !== false;
}

function includedVisionSubgroups() {
  return visionMvpSubgroupRows.filter((row) => isVisionSubgroupIncluded(row));
}

function visionStrategyDraftSummary() {
  const included = includedVisionSubgroups();
  const providers = included.reduce((sum, row) => sum + Number(row.providers || 0), 0);
  const reviewCount = included.filter((row) => row.confidence !== "High").length;
  return {
    subgroups: included.length,
    providers,
    reviewCount,
    blocked: visionMvpSubgroupRows.filter((row) => row.confidence === "Blocked").length,
  };
}

function resetVisionStrategyMix() {
  state.visionSubgroupSelections = {
    "infectious-disease": true,
    "mental-health": true,
    "womens-health": true,
    "heart-disease": false,
  };
  state.visionStrategyEditMode = false;
  state.visionStrategyLocked = false;
}

function strategyContextFor(row) {
  return visionStrategyContext[row.id] || {
    bestFor: row.strategy,
    primaryDecision: "Review the modeled strategy before approval.",
    inputs: [row.measureCoverage],
    customerDecisions: ["Confirm the customer wants to use this strategy."],
    constraints: ["No additional constraints modeled."],
  };
}

function renderEvidenceList(items) {
  return `
    <ul>
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function strategyTone(row) {
  if (row.recommendation === "Recommended") return "ready";
  if (row.recommendation === "Transition only") return "disabled";
  if (row.recommendation === "Supporting path") return "support";
  return "warn";
}

function renderStrategyInputSummary() {
  return `
    <section class="strategy-input-summary" aria-label="Inputs used by the recommendation engine">
      <div class="vision-section-title">
        <span class="eyebrow">Recommendation inputs</span>
        <h3>Known customer facts used to model the strategy</h3>
      </div>
      <div class="strategy-input-grid">
        ${visionStrategyInputs.map((item) => `
          <article>
            <span>${item.label}</span>
            <strong>${item.value}</strong>
            <em>${item.source}</em>
            <p>${item.impact}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderStrategyCandidateList(selected) {
  return `
    <section class="strategy-candidate-list" aria-label="Candidate submission strategies">
      <div class="vision-section-title">
        <span class="eyebrow">Choose strategy</span>
        <h3>Starting points</h3>
        <p>Compare last year’s submission against the forecasted options.</p>
      </div>
      <article class="previous-strategy-baseline">
        <span class="status-chip support">Previous year baseline</span>
        <strong>${previousSubmissionBaseline.year} ${previousSubmissionBaseline.path}</strong>
        <dl>
          <div><dt>Score</dt><dd>${previousSubmissionBaseline.score}</dd></div>
          <div><dt>Roster</dt><dd>${previousSubmissionBaseline.providers}</dd></div>
          <div><dt>Delivery</dt><dd>${previousSubmissionBaseline.delivery}</dd></div>
          <div><dt>Measures</dt><dd>${previousSubmissionBaseline.measures}</dd></div>
        </dl>
      </article>
      ${visionStrategyRows.map((row) => {
        const context = strategyContextFor(row);
        return `
          <button class="strategy-candidate ${row.id === selected.id ? "selected" : ""} ${strategyTone(row)}" data-vision-strategy="${row.id}">
            <div class="strategy-candidate-head">
              <strong>${row.path}</strong>
              <span class="status-chip ${strategyTone(row)}">${row.recommendation}</span>
            </div>
            <dl>
              <div><dt>Forecast</dt><dd>${row.performance}</dd></div>
              <div><dt>Fit</dt><dd>${row.fit}</dd></div>
              <div><dt>Scope</dt><dd>${row.scope}</dd></div>
              <div><dt>Effort</dt><dd>${row.effort}</dd></div>
            </dl>
            <small>${context.bestFor}</small>
          </button>
        `;
      }).join("")}
    </section>
  `;
}

function renderSelectedStrategyDetail(selected) {
  const summary = visionStrategyDraftSummary();
  const locked = state.visionStrategyLocked ? "Locked" : state.visionStrategyEditMode ? "Manual edits active" : "Forecasted draft";
  const metrics = `
    <div class="strategy-detail-metrics">
      <div><span>Modeled score</span><strong>${selected.performance}</strong><em>${selected.lift} vs baseline</em></div>
      <div><span>Measure fit</span><strong>${selected.fit}</strong><em>${selected.measureCoverage}</em></div>
      <div><span>Workflow effort</span><strong>${selected.effort}</strong><em>${selected.scope}</em></div>
    </div>
  `;
  return `
    <section class="selected-strategy-detail">
      <div class="selected-strategy-header">
        <div>
          <span class="status-chip ${strategyTone(selected)}">${selected.recommendation}</span>
          <h3>${selected.path}</h3>
          <p>${selected.strategy}</p>
          <div class="selected-strategy-summary">
            <span>${selected.performance}</span>
            <span>${selected.lift}</span>
            <span>${selected.fit} fit</span>
            <span>${locked}</span>
          </div>
        </div>
        <div class="selected-strategy-actions">
          <button class="btn secondary" data-customize-vision-strategy ${selected.id !== "mvp-specialty-subgroups" ? "disabled" : ""}>Customize Mix</button>
          <button class="btn" data-lock-vision-strategy="${selected.id}" ${selected.recommendation === "Transition only" ? "disabled" : ""}>Lock Strategy</button>
        </div>
      </div>
      <div class="strategy-baseline-comparison">
        <div><span>Previous submission</span><strong>${previousSubmissionBaseline.path}</strong><em>${previousSubmissionBaseline.score} · ${previousSubmissionBaseline.providers}</em></div>
        <div><span>Selected draft</span><strong>${selected.path}</strong><em>${selected.performance} · ${selected.lift}</em></div>
        <div><span>Current mix</span><strong>${summary.subgroups} subgroups · ${summary.providers} providers</strong><em>${summary.reviewCount} cohort needs review · ${summary.blocked} blocked</em></div>
      </div>
      ${selected.id === "mvp-specialty-subgroups" ? renderVisionMvpSubgroupMixer() : `
        ${metrics}
        ${renderStrategyOperationalPanel(selected)}
      `}
    </section>
  `;
}

function renderStrategyOperationalPanel(selected) {
  const rows = selected.id === "qrda-support" ? [
    { item: "Approved source package", status: "Required", detail: "Use the approved MVP or APP Plus package as the file source." },
    { item: "QRDA category", status: "Select", detail: "Choose Category I or Category III for the supported export." },
    { item: "Package version", status: "Lock", detail: "Generate only from the frozen submission version." },
  ] : selected.id === "appplus" ? [
    { item: "APM entity", status: "Confirm", detail: "Confirm the APM Entity participation record." },
    { item: "Quality package", status: "Configure", detail: "Use the enabled APP Plus measure package." },
    { item: "Submission forecast", status: "Review", detail: "Review projected score and gaps before approval." },
  ] : selected.id === "mvp-mixed" ? [
    { item: "Clean cohorts", status: "Register", detail: "Move stable specialty cohorts into subgroup registration." },
    { item: "Uncertain clinicians", status: "Review", detail: "Route mixed-confidence clinicians into individual review." },
    { item: "Package assembly", status: "Draft", detail: "Build subgroup and individual packages after assignment." },
  ] : [
    { item: "Legacy view", status: "Disabled", detail: "Use only for transition review and historical comparison." },
    { item: "Future strategy", status: "Use MVP", detail: "Route supported work into MVP or APP Plus paths." },
    { item: "Customer message", status: "Explain", detail: "Show why this path is not the recommended operating model." },
  ];
  return `
    <div class="strategy-operational-panel">
      <div class="vision-section-title">
        <span class="eyebrow">Operational workspace</span>
        <h3>What the team can do from this strategy</h3>
      </div>
      <table class="vision-table">
        <thead><tr><th>Work item</th><th>Status</th><th>Submission detail</th></tr></thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td><strong>${row.item}</strong></td>
              <td><span class="status-chip ${row.status === "Disabled" ? "disabled" : row.status === "Review" ? "warn" : "ready"}">${row.status}</span></td>
              <td>${row.detail}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderStrategyFaq(selected) {
  const context = strategyContextFor(selected);
  return `
    <section class="vision-faq" id="strategy-faq" aria-label="Strategy FAQ and reference">
      <div class="vision-section-title">
        <span class="eyebrow">FAQ and reference</span>
        <h3>Recommendation inputs and supporting context</h3>
      </div>
      <details>
        <summary>What inputs generated these strategy recommendations?</summary>
        ${renderStrategyInputSummary()}
      </details>
      <details>
        <summary>Why is ${selected.path} being shown?</summary>
        <div class="faq-body">
          <p>${context.bestFor}</p>
          ${renderEvidenceList(context.inputs)}
        </div>
      </details>
      <details>
        <summary>What does the customer still need to confirm?</summary>
        <div class="faq-body">
          ${renderEvidenceList(context.customerDecisions)}
        </div>
      </details>
      <details>
        <summary>What is hidden, disabled, or treated as supporting context?</summary>
        <div class="faq-body">
          <p>Hospital quality reporting is treated as an out-of-app experience. Traditional MIPS remains transition context. QRDA appears as a support path after a strategy has been approved.</p>
          ${renderEvidenceList(context.constraints)}
        </div>
      </details>
    </section>
  `;
}

function renderActiveStrategyContext(tone = "") {
  const selected = selectedVisionStrategy();
  return `
    <div class="active-strategy-context ${tone}">
      <div>
        <span>Active strategy</span>
        <strong>${selected.path}</strong>
        <em>${selected.scope} · ${selected.performance} · ${selected.lift}</em>
      </div>
      <button class="lab-btn" data-lab-step="0">Review Strategy</button>
    </div>
  `;
}

function renderVisionTaskStrip(tasks, activeIndex = 0) {
  return `
    <div class="vision-task-strip">
      ${tasks.map((task, index) => `
        <button class="${index < activeIndex ? "complete" : index === activeIndex ? "active" : ""}" data-toast="${task} opened">
          <span>${index + 1}</span>
          <strong>${task}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function renderVisionStrategyStage() {
  const selected = selectedVisionStrategy();
  return `
    <section class="vision-stage-content strategy-stage-content">
      <div class="strategy-workspace-grid">
        ${renderStrategyCandidateList(selected)}
        ${renderSelectedStrategyDetail(selected)}
      </div>
    </section>
  `;
}

function renderVisionFaqScreen(stage) {
  const selected = selectedVisionStrategy();
  const context = strategyContextFor(selected);
  if (stage.id === "strategy") {
    return `
      <section class="phase-faq-screen">
        ${renderStrategyFaq(selected)}
      </section>
    `;
  }
  return `
    <section class="phase-faq-screen">
      <div class="phase-faq-grid">
        <article>
          <span class="eyebrow">Customer question</span>
          <h3>${stage.customerQuestion}</h3>
          <p>${stage.promise}</p>
        </article>
        <article>
          <span class="eyebrow">System role</span>
          <h3>${stage.systemAction}</h3>
          <p>Current active strategy: ${selected.path}. Supporting strategy context is retained here so the operational screen stays focused.</p>
        </article>
        <article>
          <span class="eyebrow">Output</span>
          <h3>${stage.artifact}</h3>
          <p>${context.primaryDecision}</p>
        </article>
      </div>
      <details open>
        <summary>What inputs matter in this phase?</summary>
        <div class="faq-body">
          ${renderEvidenceList(context.inputs)}
        </div>
      </details>
      <details>
        <summary>What does the customer still need to confirm?</summary>
        <div class="faq-body">
          ${renderEvidenceList(context.customerDecisions)}
        </div>
      </details>
      <details>
        <summary>What rules and constraints are being enforced?</summary>
        <div class="faq-body">
          ${renderEvidenceList(context.constraints)}
        </div>
      </details>
    </section>
  `;
}

function renderVisionMvpSubgroupMixer() {
  const selected = selectedVisionSubgroup();
  const providers = visionProviderMixRows[selected.id] || [];
  const summary = visionStrategyDraftSummary();
  return `
    <section class="subgroup-mixer">
      <div class="vision-section-title">
        <span class="eyebrow">Exact submission strategy mix</span>
        <h3>MVP specialty subgroups and provider mix</h3>
        <p>Select a subgroup to inspect the roster, or adjust the included cohorts before locking the strategy.</p>
      </div>
      <div class="subgroup-mix-toolbar">
        <div>
          <strong>${summary.subgroups} subgroups included · ${summary.providers} providers</strong>
          <span>${state.visionStrategyEditMode ? "Manual mix" : "Recommended mix"} · ${state.visionStrategyLocked ? "Locked" : "Unlocked"}</span>
        </div>
        <button class="link" data-reset-vision-strategy>Use recommended mix</button>
      </div>
      <div class="subgroup-strategy-table-wrap">
        <table class="vision-table subgroup-strategy-table">
          <thead>
            <tr>
              <th>Include</th>
              <th>Specialty cohort</th>
              <th>MVP</th>
              <th>Level</th>
              <th class="numeric">Providers</th>
              <th class="numeric">Forecast</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
          ${visionMvpSubgroupRows.map((row) => {
            const included = isVisionSubgroupIncluded(row);
            const blocked = row.confidence === "Blocked";
            return `
              <tr class="${row.id === selected.id ? "selected" : ""} ${blocked ? "blocked" : ""} ${!included ? "excluded" : ""}">
                <td>
                  <label class="mix-checkbox">
                    <input type="checkbox" data-toggle-vision-subgroup="${row.id}" ${included ? "checked" : ""} ${blocked ? "disabled" : ""} />
                    <span>${blocked ? "Blocked" : included ? "In" : "Out"}</span>
                  </label>
                  <span class="subline">${row.confidence}</span>
                </td>
                <td><strong>${row.subgroup}</strong><span class="subline">${row.specialty}</span></td>
                <td><strong>${row.mvpId}</strong><span class="subline">${row.mvpName}</span><span class="subline">${row.measureFit}</span></td>
                <td>${row.reportingLevel}</td>
                <td class="numeric">${row.providers}</td>
                <td class="numeric"><strong>${row.projectedScore}</strong><span class="subline">${row.currentScore} current · ${row.lift}</span></td>
                <td><button class="link" data-vision-subgroup="${row.id}">${row.id === selected.id ? "Viewing" : "View"}</button></td>
              </tr>
            `;
          }).join("")}
          </tbody>
        </table>
      </div>
      <div class="subgroup-detail-grid">
        <div class="subgroup-detail">
          <div class="subgroup-detail-header">
            <div>
              <span class="eyebrow">${selected.reportingLevel}</span>
              <h3>${selected.subgroup}</h3>
              <p>${selected.mvpId} · ${selected.mvpName}</p>
            </div>
            <span class="status-chip ${selected.confidence === "High" ? "ready" : selected.confidence === "Blocked" ? "disabled" : "warn"}">${selected.confidence}</span>
          </div>
          <div class="subgroup-metrics">
            <div><span>Providers</span><strong>${selected.providers}</strong></div>
            <div><span>Current</span><strong>${selected.currentScore}</strong></div>
            <div><span>Forecast</span><strong>${selected.projectedScore}</strong></div>
            <div><span>Lift</span><strong>${selected.lift}</strong></div>
          </div>
          <p class="subgroup-rationale">${selected.rationale}</p>
        </div>
        <div class="subgroup-provider-panel">
          <div class="vision-section-title">
            <span class="eyebrow">Provider roster detail</span>
            <h3>${selected.specialty} provider mix</h3>
          </div>
          <table class="vision-table provider-mix-table">
            <thead><tr><th>Provider</th><th>Specialty</th><th>NPI</th><th>Current</th><th>Forecast</th><th>Recommendation</th></tr></thead>
            <tbody>
              ${providers.map((provider) => `
                <tr>
                  <td><strong>${provider.provider}</strong></td>
                  <td>${provider.specialty}</td>
                  <td>${provider.npi}</td>
                  <td>${provider.current}</td>
                  <td>${provider.forecast}</td>
                  <td><span class="status-chip ${provider.recommendation === "Include" ? "ready" : provider.recommendation === "Blocked" ? "disabled" : "warn"}">${provider.recommendation}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderVisionImproveStage() {
  const selected = selectedVisionStrategy();
  return `
    <section class="vision-stage-content">
      ${renderActiveStrategyContext("teal")}
      <div class="vision-recommendation teal">
        <span>Agentic work queue</span>
        <h3>Route the right issue to the right team</h3>
        <p>${selected.path} is active. The platform separates evidence that can be found automatically from problems that need documentation, workflow, or data-mapping intervention.</p>
      </div>
      <div class="vision-kpi-row">
        <div><span>Evidence found</span><strong>428</strong><em>Patients ready for support review</em></div>
        <div><span>Actionable gaps</span><strong>112</strong><em>Routed before year end</em></div>
        <div><span>Data issues</span><strong>3</strong><em>Feeds or mappings need attention</em></div>
      </div>
      <table class="vision-table">
        <thead><tr><th>Issue type</th><th>Owner</th><th>Volume</th><th>Work item</th><th></th></tr></thead>
        <tbody>
          ${visionWorkQueueRows.map((row) => `
            <tr><td><strong>${row.type}</strong></td><td>${row.owner}</td><td>${row.count}</td><td>${row.next}</td><td><button class="btn small" data-toast="${row.type} queue opened">Open</button></td></tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderVisionMonitorStage() {
  return `
    <section class="vision-stage-content">
      ${renderActiveStrategyContext("amber")}
      <div class="vision-recommendation amber">
        <span>Exception monitoring</span>
        <h3>Abnormal changes come to the quality manager</h3>
        <p>Week-over-week satisfaction rates are watched for unexpected drops, unlikely jumps, stale feeds, and denominator shifts.</p>
      </div>
      <div class="vision-trend-strip">
        <div><span>Depression screening</span><strong>-7.4 pts</strong><em>Needs review</em></div>
        <div><span>HIV screening</span><strong>+18.2 pts</strong><em>Audit sample</em></div>
        <div><span>Blood pressure</span><strong>+0.8 pts</strong><em>Expected trend</em></div>
      </div>
      <table class="vision-table">
        <thead><tr><th>Signal</th><th>Likely cause</th><th>Action</th><th></th></tr></thead>
        <tbody>
          ${visionMonitorRows.map((row) => `
            <tr><td><strong>${row.signal}</strong></td><td>${row.cause}</td><td>${row.action}</td><td><button class="btn small" data-toast="${row.signal} assigned">Assign</button></td></tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderVisionValidateStage() {
  return `
    <section class="vision-stage-content">
      ${renderActiveStrategyContext()}
      <div class="vision-recommendation">
        <span>Representative validation</span>
        <h3>Validate the data that best represents the organization</h3>
        <p>The platform chooses the validation population, checks patient qualification logic, and leaves human judgment for true exceptions.</p>
      </div>
      <div class="vision-kpi-row">
        <div><span>Validation population</span><strong>1,240</strong><em>Representative records selected</em></div>
        <div><span>Auto-validated</span><strong>97%</strong><em>Evidence and logic confirmed</em></div>
        <div><span>Needs judgment</span><strong>37</strong><em>Exceptions queued for review</em></div>
      </div>
      <table class="vision-table">
        <thead><tr><th>Validation check</th><th>Status</th><th>Detail</th><th></th></tr></thead>
        <tbody>
          ${visionValidationRows.map((row) => `
            <tr>
              <td><strong>${row.check}</strong></td>
              <td><span class="status-chip ${row.status === "Ready" ? "ready" : "warn"}">${row.status}</span></td>
              <td>${row.detail}</td>
              <td><button class="btn small" data-toast="${row.check} opened">${row.status === "Ready" ? "Review" : "Resolve"}</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderVisionSubmitStage() {
  return `
    <section class="vision-stage-content">
      ${renderActiveStrategyContext("green")}
      <div class="vision-recommendation green">
        <span>Secure submission</span>
        <h3>Approved data is sent through the active CMS QPP connection</h3>
        <p>No file handoffs, credential chasing, or version ambiguity. The audit trail shows exactly what was approved and submitted.</p>
      </div>
      <div class="vision-kpi-row">
        <div><span>Submission package</span><strong>Frozen</strong><em>Approved version locked</em></div>
        <div><span>OAuth session</span><strong>Active</strong><em>${qppSession.remaining} remaining</em></div>
        <div><span>CMS response</span><strong>Pending</strong><em>Receipt tracked in workspace</em></div>
      </div>
      <table class="vision-table">
        <thead><tr><th>Submission step</th><th>Status</th><th>Detail</th><th></th></tr></thead>
        <tbody>
          ${visionSubmissionRows.map((row) => `
            <tr><td><strong>${row.step}</strong></td><td>${row.status}</td><td>${row.detail}</td><td><button class="btn small" data-toast="${row.step} reviewed">Open</button></td></tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderDesignLab() {
  document.querySelector(".app-shell").classList.add("design-lab-mode");
  document.querySelector(".app-shell").classList.remove("home-mode");
  document.querySelector(".body-grid").classList.add("home-mode");
  content.classList.toggle("vision-mode-content", state.labMode === "vision");
  sidebar.innerHTML = "";
  const scenario = scenarioDefinitions[state.scenario];
  const workflow = currentWorkflow(scenario);
  content.innerHTML = `
    <section class="design-lab-canvas ${state.labMode === "vision" ? "vision-canvas" : ""}">
      ${state.labMode === "vision" ? renderVisionPlatform() : `
        <div class="lab-scenario">
          <div>
            <span class="eyebrow">Scenario</span>
            <h1>${scenario.label}</h1>
            <p>${scenario.goal}</p>
          </div>
          <div class="lab-signal">
            <span>Test Signal</span>
            <strong>${workflow.step.signal || scenario.signal}</strong>
          </div>
        </div>
        ${state.labMode === "compare" ? renderCompareView(scenario) : renderVariantView(state.labMode, scenario)}
      `}
    </section>
  `;
  content.querySelectorAll("[data-open-production]").forEach((button) => {
    button.addEventListener("click", () => {
      state.labMode = "production";
      applyScenario(button.dataset.openProduction, true);
    });
  });
  content.querySelectorAll("[data-switch-lab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.labMode = button.dataset.switchLab;
      state.visionRoute = "home";
      render();
    });
  });
  content.querySelectorAll("[data-vision-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const [screenId, tabId] = button.dataset.visionJump.split(":");
      const routeId = screenId === "validation" && tabId === "plan"
        ? "submissions"
        : ["validation", "measure-detail", "patient-evidence", "readiness"].includes(screenId)
          ? "performance"
          : screenId;
      const normalizedTabId = routeId === "performance"
        ? normalizeVisionPerformanceTab(tabId || screenId)
        : screenId === "validation" && tabId === "plan"
          ? "validation-plan"
          : tabId;
      state.visionRoute = routeId;
      if (routeId === "performance" && normalizedTabId) {
        state.visionPerformanceTab = normalizedTabId;
      }
      if (routeId === "submissions" && normalizedTabId) {
        state.visionSubmissionTab = normalizedTabId;
      }
      if (screenId === "validation" && normalizedTabId && routeId === "performance") {
        state.visionValidationTab = normalizedTabId;
      }
      const stageId = visionStageIdForScreen(screenId);
      const stageIndex = visionStages.findIndex((stage) => stage.id === stageId);
      state.labStep = stageIndex >= 0 ? stageIndex : state.labStep;
      render();
    });
  });
  content.querySelectorAll("[data-vision-screen]").forEach((button) => {
    button.addEventListener("click", () => {
      const screenId = button.dataset.visionScreen;
      state.visionRoute = screenId === "validation" ? "performance" : screenId;
      const stageId = visionStageIdForScreen(screenId);
      const stageIndex = visionStages.findIndex((stage) => stage.id === stageId);
      state.labStep = stageIndex >= 0 ? stageIndex : state.labStep;
      render();
    });
  });
  content.querySelectorAll("[data-vision-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const [key, value] = button.dataset.visionTab.split(":");
      if (key && Object.prototype.hasOwnProperty.call(state, key)) {
        state[key] = value;
        render();
      }
    });
  });
  content.querySelectorAll("[data-lab-step]").forEach((button) => {
    button.addEventListener("click", () => {
      state.labStep = Number(button.dataset.labStep);
      state.visionRoute = visionScreenForStage(visionStages[state.labStep]?.id || "strategy");
      render();
    });
  });
  content.querySelectorAll("[data-lab-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextScenario = button.dataset.labNext;
      const steps = workflowSteps(scenarioDefinitions[nextScenario] || scenario);
      state.labStep = Math.min(state.labStep + 1, steps.length - 1);
      state.visionRoute = visionScreenForStage(visionStages[state.labStep]?.id || "strategy");
      render();
    });
  });
  content.querySelectorAll("[data-lab-prev]").forEach((button) => {
    button.addEventListener("click", () => {
      state.labStep = Math.max(state.labStep - 1, 0);
      state.visionRoute = visionScreenForStage(visionStages[state.labStep]?.id || "strategy");
      render();
    });
  });
  content.querySelectorAll("[data-vision-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const delta = Number(button.dataset.visionNext);
      state.labStep = Math.min(Math.max(state.labStep + delta, 0), visionStages.length - 1);
      state.visionRoute = visionScreenForStage(visionStages[state.labStep]?.id || "strategy");
      render();
    });
  });
  content.querySelectorAll("[data-vision-faq]").forEach((button) => {
    button.addEventListener("click", () => {
      state.visionRoute = "phase-faq";
      render();
    });
  });
  content.querySelectorAll("[data-vision-faq-stage]").forEach((button) => {
    button.addEventListener("click", () => {
      const stageIndex = visionStages.findIndex((stage) => stage.id === button.dataset.visionFaqStage);
      state.labStep = stageIndex >= 0 ? stageIndex : state.labStep;
      state.visionRoute = "phase-faq";
      render();
    });
  });
  content.querySelectorAll("[data-vision-workflow]").forEach((button) => {
    button.addEventListener("click", () => {
      state.visionRoute = visionScreenForStage(currentVisionStage().stage.id);
      render();
    });
  });
  content.querySelectorAll("[data-vision-strategy]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedVisionStrategy = button.dataset.visionStrategy;
      state.visionRoute = "strategy";
      state.visionStrategyLocked = false;
      render();
    });
  });
  content.querySelectorAll("[data-customize-vision-strategy]").forEach((button) => {
    button.addEventListener("click", () => {
      state.visionStrategyEditMode = true;
      state.visionStrategyLocked = false;
      showToast("MVP strategy mix is editable");
      render();
    });
  });
  content.querySelectorAll("[data-lock-vision-strategy]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedVisionStrategy = button.dataset.lockVisionStrategy;
      state.visionStrategyLocked = true;
      showToast(`${selectedVisionStrategy().path} locked for 2026 strategy`);
      state.labStep = Math.min(state.labStep + 1, visionStages.length - 1);
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-reset-vision-strategy]").forEach((button) => {
    button.addEventListener("click", () => {
      resetVisionStrategyMix();
      showToast("Recommended MVP mix restored");
      render();
    });
  });
  content.querySelectorAll("[data-toggle-vision-subgroup]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.visionSubgroupSelections[checkbox.dataset.toggleVisionSubgroup] = checkbox.checked;
      state.selectedVisionSubgroup = checkbox.dataset.toggleVisionSubgroup;
      state.visionStrategyEditMode = true;
      state.visionStrategyLocked = false;
      render();
    });
  });
  content.querySelectorAll("[data-vision-subgroup]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedVisionSubgroup = button.dataset.visionSubgroup;
      state.visionRoute = "strategy";
      render();
    });
  });
  content.querySelectorAll("[data-validation-measure]").forEach((button) => {
    button.addEventListener("click", () => {
      focusValidationMeasure(button.dataset.validationMeasure, { filter: "all" });
      state.visionValidationTab = "patient-level";
      state.visionPerformanceTab = "patient-level";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-changes]").forEach((button) => {
    button.addEventListener("click", () => {
      focusValidationMeasure(button.dataset.validationChanges, { filter: "changed" });
      state.visionValidationTab = "patient-level";
      state.visionPerformanceTab = "patient-level";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-workbench-opportunities]").forEach((button) => {
    button.addEventListener("click", () => {
      focusValidationMeasure(button.dataset.workbenchOpportunities, { filter: "all" });
      state.visionPerformanceTab = "patient-opportunities";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-workbench-trend-measure]").forEach((button) => {
    button.addEventListener("click", () => {
      focusValidationMeasure(button.dataset.workbenchTrendMeasure, { filter: "all" });
      state.visionPerformanceTab = "trending-quality";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-opportunity-patients]").forEach((button) => {
    button.addEventListener("click", () => {
      focusValidationMeasure(button.dataset.opportunityPatients, { filter: "all" });
      state.visionValidationTab = "patient-level";
      state.visionPerformanceTab = "patient-level";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-opportunity-explain]").forEach((button) => {
    button.addEventListener("click", () => {
      const [measureId, patientId] = button.dataset.opportunityExplain.split(":");
      focusValidationMeasure(measureId, { patientId, filter: "all" });
      state.visionPerformanceTab = "patient-level";
      state.visionRoute = "patient-evidence";
      render();
    });
  });
  content.querySelectorAll("[data-validation-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.patientValidationFilter = button.dataset.validationFilter;
      state.visionPerformanceTab = "patient-level";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-sort]").forEach((select) => {
    select.addEventListener("change", () => {
      state.patientValidationSort = select.value;
      state.visionPerformanceTab = "patient-level";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-round]").forEach((select) => {
    select.addEventListener("change", () => {
      state.patientValidationRound = select.value;
      state.visionPerformanceTab = "patient-level";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-patient-search-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.closest(".patient-search-bar")?.querySelector("[data-patient-search]");
      const query = input?.value || "";
      state.patientValidationSearch = query;
      const match = patientValidationSearchMatch(query);
      if (match) {
        state.selectedValidationMeasure = match.measure.id;
        state.selectedValidationPatient = match.patient.patient;
        state.visionRoute = "patient-evidence";
        showToast(`${match.patient.patient} opened`);
      } else {
        state.visionRoute = "performance";
        showToast("No matching patient found");
      }
      state.visionPerformanceTab = "patient-level";
      render();
    });
  });
  content.querySelectorAll("[data-patient-search]").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        input.closest(".patient-search-bar")?.querySelector("[data-patient-search-action]")?.click();
      }
    });
  });
  content.querySelectorAll("[data-open-patient-explanation]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedValidationPatient = button.dataset.openPatientExplanation;
      state.patientValidationSearch = button.dataset.openPatientExplanation;
      state.visionPerformanceTab = "patient-level";
      state.visionRoute = "patient-evidence";
      render();
    });
  });
  content.querySelectorAll("[data-quality-target]").forEach((input) => {
    const updateQualityTarget = (showMessage = false) => {
      const value = Math.min(Math.max(Number(input.value) || 85, 50), 100);
      state.qualityTargets[input.dataset.qualityTarget] = value;
      input.value = value;
      const row = input.closest("tr");
      const gapCell = row?.querySelector("[data-quality-gap]");
      if (gapCell) {
        gapCell.innerHTML = qualityTargetGapBadge(input.dataset.qualityTarget);
      }
      if (showMessage) {
        showToast(`Quality target updated to ${value}%`);
        render();
      }
    };
    input.addEventListener("input", () => {
      const rawValue = input.value.trim();
      const value = Number(input.value);
      if (Number.isFinite(value) && rawValue && (value >= 50 || rawValue.length >= 3)) {
        state.qualityTargets[input.dataset.qualityTarget] = Math.min(Math.max(value, 50), 100);
        updateQualityTarget(false);
      }
    });
    input.addEventListener("change", () => updateQualityTarget(true));
    input.addEventListener("blur", () => updateQualityTarget(false));
  });
  content.querySelectorAll("[data-lab-program]").forEach((button) => {
    button.addEventListener("click", () => {
      const program = button.dataset.labProgram;
      const status = button.dataset.pathwayStatus;
      if (status === "disabled") {
        showToast(`${programLabel(program)} is not configured for this customer.`);
        return;
      }
      const nextScenario = defaultScenarioByProgram[program];
      if (!nextScenario) return;
      state.scenario = nextScenario;
      state.labStep = 0;
      state.visionRoute = "home";
      resetMvpSpecialtySelection();
      scenarioSelect.value = nextScenario;
      render();
    });
  });
  content.querySelectorAll("[data-open-eligible-program]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextScenario = defaultScenarioByProgram[button.dataset.openEligibleProgram];
      if (!nextScenario) return;
      state.scenario = nextScenario;
      state.labStep = 0;
      state.visionRoute = "home";
      resetMvpSpecialtySelection();
      scenarioSelect.value = nextScenario;
      render();
    });
  });
  content.querySelectorAll("[data-mvp-specialty]").forEach((select) => {
    select.addEventListener("change", () => {
      state.mvpSpecialty = select.value;
      state.mvpSpecialties = [select.value];
      state.practiceComposition = "single";
      render();
    });
  });
  content.querySelectorAll("[data-practice-composition]").forEach((input) => {
    input.addEventListener("change", () => {
      state.practiceComposition = input.value;
      const current = selectedMvpSpecialties(scenario);
      if (state.practiceComposition === "single") {
        const selected = current[0] || scenarioDefaultSpecialty(scenario);
        state.mvpSpecialty = selected;
        state.mvpSpecialties = [selected];
      } else {
        state.mvpSpecialties = current.length ? current : scenarioDefaultSpecialties(scenario);
        state.mvpSpecialty = state.mvpSpecialties[0] || null;
      }
      render();
    });
  });
  content.querySelectorAll("[data-practice-composition-select]").forEach((select) => {
    select.addEventListener("change", () => {
      state.practiceComposition = select.value;
      const current = selectedMvpSpecialties(scenario);
      state.mvpSpecialties = state.practiceComposition === "single" ? [current[0] || scenarioDefaultSpecialty(scenario)] : current;
      state.mvpSpecialty = state.mvpSpecialties[0] || null;
      render();
    });
  });
  content.querySelectorAll("[data-mvp-specialty-option]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const selected = [...content.querySelectorAll("[data-mvp-specialty-option]:checked")].map((item) => item.value);
      state.practiceComposition = "multi";
      state.mvpSpecialties = selected.length ? selected : scenarioDefaultSpecialties(scenario);
      state.mvpSpecialty = state.mvpSpecialties[0] || null;
      render();
    });
  });
  bindToastButtons();
}

function renderCompareView(scenario) {
  const workflow = currentWorkflow(scenario);
  return `
    <div class="compare-grid">
      <article class="compare-pane">
        <div class="pane-heading">
          <span>Control</span>
          <strong>Production Today</strong>
        </div>
        ${renderProductionSnapshot(scenario)}
        <button class="lab-btn secondary" data-open-production="${state.scenario}">Open Control Full Screen</button>
      </article>
      <article class="compare-pane">
        <div class="pane-heading">
          <span>Variant A</span>
          <strong>Customer Command Center</strong>
        </div>
        ${renderCommandCenterSnapshot(scenario, true)}
        <button class="lab-btn secondary" data-switch-lab="variantA">Open Variant A</button>
      </article>
    </div>
    <div class="compare-runner">
      <div>
        <span class="eyebrow">Current Click-Through Step</span>
        <strong>${workflow.index === 0 ? "Start here" : workflowBadge(workflow.index)}: ${workflow.step.title}</strong>
        <p>${workflow.step.body}</p>
      </div>
      <div class="workflow-actions compact-actions">
        <button class="lab-btn" data-lab-prev ${workflow.index === 0 ? "disabled" : ""}>Back</button>
        <button class="lab-btn" data-lab-next="${state.scenario}" ${workflow.index === workflow.steps.length - 1 ? "disabled" : ""}>Next Step</button>
      </div>
    </div>
    <div class="comparison-notes">
      <div><strong>Navigation Distance</strong><span>Compare click count, visible context, and whether program/scope is carried forward.</span></div>
      <div><strong>Orientation</strong><span>Check whether the user knows the customer, program, year, scope, and next action at each step.</span></div>
      <div><strong>Policy Flexibility</strong><span>Look for places where retired or emerging pathways can be added without another left-rail branch.</span></div>
    </div>
  `;
}

function renderVariantView(mode, scenario) {
  if (mode === "vision") {
    return renderVisionPlatform(scenario);
  }
  if (mode === "smart") {
    return renderSmartGuidedSubmission(scenario);
  }
  if (mode === "variantB") {
    return renderPathwayHub(scenario);
  }
  return renderCommandCenter(scenario);
}

function renderProductionSnapshot(scenario) {
  const row = performanceRows[scenario.program]?.[0];
  const program = programLabel(scenario.program);
  return `
    <div class="mini-shell">
      <div class="mini-topbar">Oracle Health Data Submissions <span>${program}</span></div>
      <div class="mini-body">
        <div class="mini-rail"><strong>${program}</strong><span>Performance</span><span>Submissions</span><span>Upload</span></div>
        <div class="mini-content">
          <h3>${scenario.route === "performance-detail" ? `View Scores for ${scenario.selectedOrg}` : `${program} Performance`}</h3>
          ${scenario.route === "performance-detail" ? miniScoreRows(scenario.program, scenario.selectedOrg) : `
            <table><thead><tr><th>Name</th><th>Quality Score</th><th>${scenario.program === "APPPLUS" ? "TINs" : "Providers"}</th></tr></thead>
            <tbody><tr><td>${row?.name || "Selected entity"}</td><td>${scoreCell(row?.quality || "pending")}</td><td>${row?.providers ?? row?.tins ?? 0}</td></tr></tbody></table>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderCommandCenter(scenario) {
  const workflow = currentWorkflow(scenario);
  return `
    <div class="variant-layout">
      ${renderCommandCenterSnapshot(scenario, false)}
      <aside class="lab-panel">
        <h2>Scenario Runner</h2>
        <div class="scenario-progress-note">
          <span>Current step</span>
          <strong>Step ${workflow.index + 1}: ${workflow.step.title}</strong>
          <em>${workflowPercent(workflow)}% complete</em>
        </div>
        <div class="workflow-actions">
          <button class="btn ghost" data-lab-prev ${workflow.index === 0 ? "disabled" : ""}>Back</button>
          <button class="btn" data-lab-next="${state.scenario}" ${workflow.index === workflow.steps.length - 1 ? "disabled" : ""}>Next Step</button>
        </div>
        <button class="btn" data-open-production="${state.scenario}">Run Against Production</button>
      </aside>
    </div>
  `;
}

function renderCommandCenterSnapshot(scenario, compact) {
  const profile = scenarioCustomer(scenario);
  const workflow = currentWorkflow(scenario);
  return `
    <div class="command-center ${compact ? "compact" : ""}">
      <header class="customer-header">
        <div>
          <span class="eyebrow">Customer</span>
          <h2>${profile.name}</h2>
          <p>${profile.activeSummary}</p>
        </div>
        <div class="customer-status">
          <span>${profile.reportingYear}</span>
          <strong>${programLabel(scenario.program)}</strong>
          <small>${programStatus(profile, scenario.program).label}</small>
        </div>
      </header>
      <div class="pathway-strip">
        ${availablePrograms(profile).map((program) => {
          const availability = programStatus(profile, program);
          return `
            <button class="${program === scenario.program ? "selected" : ""} ${availability.status}" data-lab-program="${program}" data-pathway-status="${availability.status}">
              <strong>${programLabel(program)}</strong>
              <span>${availability.label}</span>
            </button>
          `;
        }).join("")}
      </div>
      <div class="strategy-note">
        <strong>${profile.strategy}</strong>
        <span>${profile.inactiveNote}</span>
      </div>
      ${renderProviderAssignmentPlanner(scenario, { compact })}
      ${renderMvpSelectionWorkbench(scenario, { compact })}
      <div class="workbench-grid">
        <section class="lab-panel">
          <div class="panel-title-row">
            <h3>${workflow.step.title}</h3>
            <span>${workflowBadge(workflow.index)} phase</span>
          </div>
          <p class="workflow-copy">${workflow.step.body}</p>
          ${renderWorkflowEvidence(scenario, workflow.step)}
        </section>
        <section class="lab-panel">
          <h3>Ready Actions</h3>
          ${workflow.step.actions.map((action) => `
            <button class="action-row" ${action.next ? `data-lab-next="${state.scenario}"` : `data-toast="${action.toast}"`}>
              ${action.label}<span>${action.verb}</span>
            </button>
          `).join("")}
        </section>
      </div>
    </div>
  `;
}

function renderPathwayHub(scenario) {
  const profile = scenarioCustomer(scenario);
  const workflow = currentWorkflow(scenario);
  return `
    <div class="hub-layout">
      <aside class="hub-nav">
        <h2>${profile.name}</h2>
        <p>${profile.activeSummary}</p>
        ${availablePrograms(profile).map((program) => {
          const availability = programStatus(profile, program);
          return `
          <button class="${program === scenario.program ? "selected" : ""} ${availability.status}" data-lab-program="${program}" data-pathway-status="${availability.status}">
            <strong>${programLabel(program)}</strong>
            <span>${pathwayDescription(program)}</span>
            <em>${statusLabel(availability.status)}: ${availability.note}</em>
          </button>
        `;
        }).join("")}
        <div class="hidden-path-note">${profile.inactiveNote}</div>
      </aside>
      <section class="hub-main">
        <div class="hub-title">
          <span class="eyebrow">Guided Workflow</span>
          <h2>${scenario.label}</h2>
        </div>
        ${renderProviderAssignmentPlanner(scenario)}
        ${renderMvpSelectionWorkbench(scenario)}
        <div class="lab-panel">
          <div class="panel-title-row">
            <h3>${workflow.step.title}</h3>
            <span>${programLabel(scenario.program)}</span>
          </div>
          <p class="workflow-copy">${workflow.step.body}</p>
          ${renderWorkflowEvidence(scenario, workflow.step)}
          <div class="workflow-actions">
            <button class="btn ghost" data-lab-prev ${workflow.index === 0 ? "disabled" : ""}>Back</button>
            <button class="btn" data-lab-next="${state.scenario}" ${workflow.index === workflow.steps.length - 1 ? "disabled" : ""}>Next Step</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderSmartGuidedSubmission(scenario) {
  const workflow = currentWorkflow(scenario);
  const profile = scenarioCustomer(scenario);
  return `
    <div class="smart-shell">
      <header class="smart-topbar">
        <strong>Oracle Health Smart Submissions</strong>
        <div><span>AA</span>Amit Mehta</div>
      </header>
      <section class="smart-context">
        <div>
          <span class="eyebrow">Customer Workspace</span>
          <h2>${scenario.program === "APPPLUS" ? "Oracle-demo APM Entity" : "Oracle-demo"}</h2>
        </div>
        <dl>
          <div><dt>Year</dt><dd>2026</dd></div>
          <div><dt>Organizations</dt><dd>178</dd></div>
          <div><dt>Providers</dt><dd>8,547</dd></div>
          <div><dt>Pathway Mix</dt><dd>${scenarioCustomer(scenario).activeSummary}</dd></div>
        </dl>
      </section>
      <div class="smart-pathway-strip">
        ${availablePrograms(profile).map((program) => {
          const availability = programStatus(profile, program);
          return `
            <button class="${program === scenario.program ? "selected" : ""} ${availability.status}" data-lab-program="${program}" data-pathway-status="${availability.status}">
              <strong>${programLabel(program)}</strong>
              <span>${availability.label}</span>
            </button>
          `;
        }).join("")}
      </div>
      ${renderProviderAssignmentPlanner(scenario, { compact: scenario.program !== "MVP" })}
      ${renderMvpSelectionWorkbench(scenario, { compact: scenario.program !== "MVP" })}
      <div class="smart-workspace">
        <main>
          ${renderSmartStage(scenario, workflow)}
        </main>
        <aside class="smart-aide">
          <span class="eyebrow">Recommended Next Best Action</span>
          <h3>${workflow.step.title}</h3>
          <p>${workflow.step.body}</p>
          <div class="smart-aide-list">
            <div><strong>${smartScoreLift.recommendationLift}</strong><span>projected point lift</span></div>
            <div><strong>${smartScoreLift.tinsNeedingReview}</strong><span>need review before submission</span></div>
            <div><strong>Low risk</strong><span>CMS-calc gap after recommendations</span></div>
          </div>
          <div class="workflow-actions">
            <button class="btn ghost" data-lab-prev ${workflow.index === 0 ? "disabled" : ""}>Back</button>
            <button class="btn" data-lab-next="${state.scenario}" ${workflow.index === workflow.steps.length - 1 ? "disabled" : ""}>Continue</button>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderSmartStage(scenario, workflow) {
  if (workflow.index === 0) return renderSmartScoreDashboard(scenario);
  if (workflow.index === 1) return renderSmartRecommendationCards();
  if (workflow.index === workflow.steps.length - 1) return renderSmartSubmitReview(scenario);
  return renderSmartRecommendationTable(scenario);
}

function renderSmartScoreDashboard(scenario) {
  return `
    <section class="smart-panel">
      <div class="smart-panel-title">
        <div>
          <span class="eyebrow">Score Optimization</span>
          <h3>${strategyTitle(scenario.program)}</h3>
        </div>
        <button class="lab-btn" data-lab-next="${state.scenario}">Review Recommendations</button>
      </div>
      <div class="score-optimizer">
        <div>
          <span>Baseline</span>
          <strong>${smartScoreLift.baseline}</strong>
          <em>Current projected score</em>
        </div>
        <div>
          <span>Recommended Setup</span>
          <strong>${smartScoreLift.projected}</strong>
          <em>${smartScoreLift.recommendationLift} estimated lift</em>
        </div>
        <div>
          <span>CMS Benchmark</span>
          <strong>${smartScoreLift.benchmark}</strong>
          <em>1.3% gap after recommendations</em>
        </div>
      </div>
      <div class="quality-complexity-band">
        ${renderQppOAuthStatus({ compact: true })}
        <div>
          <span>Quality Mode</span>
          <strong>eCQM & CQM</strong>
          <em>Unified Quality screen, APP Plus aligned</em>
        </div>
        <div>
          <span>Submission Actions</span>
          <strong>Edit, Freeze, Approve</strong>
          <em>Category-aware action menu</em>
        </div>
      </div>
      <div class="recommendation-impact">
        <div><span>Eligible Clinicians</span><strong>${smartScoreLift.opportunity}</strong><em>can improve with recommended settings</em></div>
        <div><span>Provider Lift</span><strong>${smartScoreLift.providersLift}</strong><em>additional clinicians likely to benefit</em></div>
        <div><span>Manual Review</span><strong>${smartScoreLift.tinsNeedingReview}</strong><em>not auto-submitted until confirmed</em></div>
      </div>
    </section>
  `;
}

function renderSmartRecommendationCards() {
  return `
    <section class="smart-panel">
      <div class="smart-panel-title">
        <div>
          <span class="eyebrow">Recommendations</span>
          <h3>Top Performing TINs</h3>
        </div>
        <button class="lab-btn" data-lab-next="${state.scenario}">View All TINs</button>
      </div>
      <div class="smart-card-grid">
        ${smartRecommendations.slice(0, 3).map((row) => `
          <article class="recommendation-card">
            <div class="card-status ${row.status === "Ready" ? "ready" : "warn"}">${row.status}</div>
            <h4>${row.tin}</h4>
            <p>${row.name}</p>
            <dl>
              <div><dt>Projected</dt><dd>${row.projectedScore}</dd></div>
              <div><dt>Providers</dt><dd>${row.providers}</dd></div>
            </dl>
            <span>${row.reviewSignal}</span>
            <button class="btn" data-lab-next="${state.scenario}">${row.action}</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSmartRecommendationTable(scenario) {
  return `
    <section class="smart-panel">
      <div class="smart-panel-title">
        <div>
          <span class="eyebrow">Recommendation Details</span>
          <h3>Review TINs and Pathway Fit</h3>
        </div>
        <div class="smart-filters">
          <input value="" placeholder="Search by TIN or name" />
          <select><option>All Pathways</option><option>MVP Submission</option><option>APP Plus</option><option>QRDA</option><option>Traditional MIPS transition</option></select>
          <select><option>eCQM & CQM</option><option>eCQM</option><option>CQM</option></select>
          <select><option>All Statuses</option><option>Ready</option><option>Not Registered</option></select>
        </div>
      </div>
      <div class="smart-table-wrap">
        <table class="smart-table">
          <thead><tr><th>TIN / Name</th><th>Pathway</th><th>Providers</th><th>Projected Score</th><th>Status</th><th>Review Signals</th><th>Actions</th></tr></thead>
          <tbody>
            ${smartRecommendations.map((row, index) => `
              <tr>
                <td><strong>${row.name}</strong><span>${row.tin}</span></td>
                <td>${row.pathway}</td>
                <td>${row.providers}</td>
                <td><strong>${row.projectedScore}</strong><span>Baseline 88.44</span></td>
                <td><span class="status-chip ${row.status === "Ready" ? "ready" : "warn"}">${row.status}</span></td>
                <td>${row.reviewSignal}</td>
                <td>
                  <button class="link" data-toast="Insight panel opened for ${row.name}">Insights</button>
                  <button class="btn small" data-lab-step="${Math.min(workflowSteps(scenario).length - 1, index === 3 ? 3 : 2)}">${row.action}</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSmartSubmitReview(scenario) {
  const row = smartRecommendations[3];
  const pathwayLabel = scenario.program === "APPPLUS" ? "APP Plus APM Entity" : "MVP Subgroup";
  return `
    <section class="smart-panel">
      <div class="entity-score-band">
        <div><span>Group Submissions</span><strong>1</strong><em>across 528 providers</em></div>
        <div><span>Subgroup Submissions</span><strong>1</strong><em>recommended</em></div>
        <div><span>Individual Pathways</span><strong>2</strong><em>not recommended</em></div>
        <div><span>Projected Score</span><strong>${row.projectedScore}</strong><em>+5.54 vs baseline</em></div>
      </div>
      <div class="smart-modal-preview">
        <div class="modal-card">
          <div class="modal-heading">
            <h3>${scenario.program === "QRDA" ? "Generate Recommended Package" : "Submit Recommendation"}</h3>
            <button class="link" data-toast="Review closed">Close</button>
          </div>
          <dl class="modal-summary">
            <div><dt>TIN</dt><dd>${row.tin}</dd></div>
            <div><dt>Name</dt><dd>${row.name}</dd></div>
            <div><dt>Pathway</dt><dd>${pathwayLabel}</dd></div>
            <div><dt>Projected Score</dt><dd>${row.projectedScore}</dd></div>
            <div><dt>Quality Mode</dt><dd>eCQM & CQM</dd></div>
            <div><dt>CMS QPP OAuth</dt><dd>Active (${qppSession.remaining})</dd></div>
          </dl>
          <div class="measure-review-list">
            <h4>Measures Included</h4>
            <div><span>236</span>Controlling High Blood Pressure</div>
            <div><span>134</span>Screening for Depression and Follow-Up Plan</div>
            <div><span>001</span>Diabetes: Glycemic Status Assessment Greater Than 9%</div>
            <div><span>110</span>Preventive Care and Screening: Influenza Immunization</div>
          </div>
          <label class="attestation"><input type="checkbox" checked /> I have reviewed the data I am submitting.</label>
          <div class="workflow-actions">
            <button class="btn ghost" data-lab-prev>Back</button>
            <button class="btn" data-toast="${programLabel(scenario.program)} recommendation submitted for review">Submit</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderScenarioFocus(scenario) {
  if (scenario.program === "MVP") {
    const entity = scenario.selectedOrg || "ZzMVP4";
    const card = mvpScorecards[entity] || mvpScorecards.ZzMVP4;
    return `
      <dl class="focus-list">
        <div><dt>Program</dt><dd>MVP</dd></div>
        <div><dt>Subgroup</dt><dd>${entity}</dd></div>
        <div><dt>MVP ID</dt><dd>${card.mvpId}</dd></div>
        <div><dt>Quality Score</dt><dd>${performanceRows.MVP.find((row) => row.name === entity)?.quality || "37% (11.18 out of 30)"}</dd></div>
      </dl>
      ${miniScoreRows("MVP", entity)}
    `;
  }
  if (scenario.program === "APPPLUS") {
    return `
      <dl class="focus-list">
        <div><dt>Program</dt><dd>APP Plus</dd></div>
        <div><dt>Entity</dt><dd>CCPM Community Care Partnership of Maine</dd></div>
        <div><dt>Quality Score</dt><dd>30% (15.1 out of 50)</dd></div>
        <div><dt>Outcome Date</dt><dd>2026-07-15</dd></div>
      </dl>
      ${miniScoreRows("APPPLUS", "CCPM Community Care Partnership of Maine")}
    `;
  }
  if (scenario.program === "QRDA") {
    return `
      <dl class="focus-list">
        <div><dt>Export Type</dt><dd>QRDA I / QRDA III</dd></div>
        <div><dt>Programs</dt><dd>MVP Submission, APP Plus, QRDA export</dd></div>
        <div><dt>Scopes</dt><dd>Individual, Group, Subgroup, APM Entity</dd></div>
        <div><dt>Status</dt><dd>Ready to configure</dd></div>
      </dl>
    `;
  }
  return `
    <dl class="focus-list">
      <div><dt>Program</dt><dd>${programLabel(scenario.program)}</dd></div>
      <div><dt>Customer</dt><dd>Hyperion Health System</dd></div>
      <div><dt>Quality Score</dt><dd>59% (17.6 out of 30)</dd></div>
      <div><dt>Providers</dt><dd>61</dd></div>
    </dl>
  `;
}

function miniScoreRows(program, entity) {
  const card = program === "MVP" ? mvpScorecards[entity] : ((scorecardsByProgram[program] || {})[entity] || { measures });
  return `
    <table class="mini-table">
      <thead><tr><th>Measure</th><th>Rate</th><th>Score</th></tr></thead>
      <tbody>
        ${(card.measures || measures).slice(0, 4).map((measure) => `<tr><td>${measure.measure}</td><td>${measure.rate}</td><td>${measure.score}</td></tr>`).join("")}
      </tbody>
    </table>
  `;
}

function renderWorkflowEvidence(scenario, step) {
  if (step.view === "scope") {
    return `
      <div class="signal-grid">
        <div><span>Customer Mix</span><strong>${scenarioCustomer(scenario).activeSummary}</strong></div>
        <div><span>Selected Path</span><strong>${programLabel(scenario.program)}</strong></div>
        <div><span>Reporting Year</span><strong>2026</strong></div>
      </div>
    `;
  }
  if (step.view === "submissions") {
    const scope = scenario.route.replace("submissions-", "") || "Subgroup";
    const rows = submissions[scenario.program]?.[scope] || submissions[scenario.program]?.Subgroup || [];
    return `
      <div class="mini-list">
        ${(rows.length ? rows : submissions.MVP.Subgroup).map((row) => `
          <button class="mini-list-row" data-lab-next="${state.scenario}">
            <strong>${row.name}</strong>
            <span>${row.tin} · ${row.quality}</span>
          </button>
        `).join("")}
      </div>
    `;
  }
  if (step.view === "draft") {
    return `
      <div class="readiness-board">
        <div><span>Quality</span><strong>eCQM & CQM</strong><em>Unified Quality screen ready</em></div>
        <div><span>CMS QPP OAuth</span><strong>Active</strong><em>${qppSession.remaining} remaining</em></div>
        <div><span>PI</span><strong>Needs values</strong><em>2 numerator fields missing</em></div>
        <div><span>IA</span><strong>Attestation</strong><em>1 activity requires review</em></div>
        <div><span>Package</span><strong>Draft</strong><em>Not submitted to CMS</em></div>
      </div>
    `;
  }
  if (step.view === "qrda") {
    return `
      <div class="qrda-flow">
        <label>Category<select><option>QRDA III aggregate package</option><option>QRDA I patient-level package</option></select></label>
        <label>Program<select><option>${programLabel(scenario.program === "QRDA" ? "APPPLUS" : scenario.program)}</option><option>MVP Submission</option><option>APP Plus</option><option>Traditional MIPS transition</option></select></label>
        <label>Scope<select><option>APM Entity</option><option>Subgroup</option><option>Individual</option><option>Group if allowed</option></select></label>
      </div>
    `;
  }
  return renderScenarioFocus(scenario);
}

function workflowSteps(scenario) {
  const action = (label, verb = "Continue", next = true) => ({ label, verb, next, toast: `${label} noted` });
  const terminal = (label, verb = "Done") => ({ label, verb, next: false, toast: `${label} queued` });
  const map = {
    "mvp-zmvp4": [
      { title: "Compare Submission Strategies", body: "Start with the candidate strategy list. The system has already used the customer’s fixed enabled measures, roster, eligibility, and participation context to remove unsupported paths and rank viable options.", signal: "The first visible customer action is choosing a supported submission strategy.", view: "scope", actions: [action("Open recommended strategy"), terminal("Explain legacy MIPS", "Note")] },
      { title: "Configure MVP Path", body: "Ask whether the practice is single-specialty or multi-specialty, then collect only the relevant specialties. The MVP list is narrowed by specialty and disabled when the customer does not have supporting measures enabled.", signal: "The customer sees a short viable MVP list with clear unavailable reasons.", view: "submissions", actions: [action("Select MVP candidate"), terminal("Compare levels", "Compare")] },
      { title: "Forecast Provider Fit", body: "Forecast each provider’s performance against the selected MVP before assigning the provider to an individual, subgroup, group, or APM Entity path.", signal: "Provider assignment is based on predicted performance and readiness, not a static TIN/NPI specialty inference.", view: "score", actions: [action("Review provider forecast"), terminal("Flag low confidence", "Flag")] },
      { title: "Register and Package", body: "Register the MVP or subgroup when needed, preserve the subgroup ID, freeze the submission-ready package, and queue the CMS submit or export action.", signal: "Submission intent is obvious and carries customer, MVP, level, subgroup, and performance period forward.", view: "score", actions: [terminal("Queue MVP package", "Queue"), terminal("Download details", "Download")] },
    ],
    "appplus-score": [
      { title: "Choose APP Plus Strategy", body: "Open the customer workspace with APP Plus as the active strategy, MVP Submission available when specialty cohorts fit, and QRDA available as the supported export path.", signal: "Unused programs do not compete with the active submission strategy.", view: "scope", actions: [action("Open APP Plus"), terminal("View transition note", "View")] },
      { title: "Open APM Entity", body: "Land on the APM Entity score context with the entity name, score, and reporting period already selected.", signal: "APP Plus feels like a peer pathway but keeps APM-specific language.", view: "score", actions: [action("Review CQM scores"), terminal("Open entity roster", "Open")] },
      { title: "Resolve Score Signals", body: "Surface high-volume measures, weak rates, selected eCQM/CQM mode, and missing supplemental inputs before export.", signal: "The screen tells users what needs attention instead of only listing numbers.", view: "score", actions: [action("Review outliers"), terminal("Assign follow-up", "Assign")] },
      { title: "Export APP Plus Package", body: "Prepare a package with program, entity, year, and file format already scoped from the customer strategy.", signal: "The export path carries context forward.", view: "qrda", actions: [terminal("Queue APP Plus export", "Queue"), terminal("Download score data", "Download")] },
    ],
    "mips-performance": [
      { title: "Compare Future Pathways", body: "Use Traditional MIPS only as a baseline while MVP Submission, APP Plus, and QRDA carry the future in-app strategy.", signal: "Users understand MIPS is not the primary future pathway.", view: "scope", actions: [action("Open legacy scorecard"), terminal("View migration note", "Note")] },
      { title: "Review Customer Score", body: "Display the customer-level quality score and provider count using the same production data shape.", signal: "Legacy data remains accessible without driving the future workflow.", view: "score", actions: [action("Open score detail"), terminal("Export legacy report", "Export")] },
      { title: "Route to Future Pathway", body: "Offer the next likely customer action: MVP Submission, APP Plus review, or QRDA package generation.", signal: "The UI nudges users from MIPS reference data toward configured future paths.", view: "scope", actions: [terminal("Recommend MVP path", "Recommend"), terminal("Create QRDA package", "Queue")] },
    ],
    "mvp-individual": [
      { title: "Choose Individual Strategy", body: "Keep the user inside MVP Submission and let them choose the individual path when the provider forecast shows it is better than subgroup or group reporting.", signal: "The dependent filters make sense because selected specialty and pathway context are explicit.", view: "scope", actions: [action("Choose Individual scope"), terminal("Review subgroup scope", "Review")] },
      { title: "Choose Composition, Specialty, and MVP", body: "Choose the individual clinician, confirm whether the practice context is single-specialty or multi-specialty, select the facility-confirmed specialty set, then filter available MVPs by patient population and measure fit.", signal: "Disabled fields explain what must be selected before an eligible clinician or MVP can be chosen.", view: "submissions", actions: [action("Select clinician"), terminal("Clear filters", "Clear")] },
      { title: "Forecast Individual Draft", body: "Show clinician, chosen MVP, TIN/NPI, quality measures, forecast score, QPP OAuth status, and missing supplemental data before draft creation.", signal: "The user can see whether the individual MVP submission is viable before registering or packaging.", view: "draft", actions: [terminal("Create individual draft", "Create"), terminal("Save filter set", "Save")] },
    ],
    "qrda-export": [
      { title: "Choose Export Strategy", body: "Treat QRDA as the package/output path for the approved strategy, with customer and active program context carried forward.", signal: "File generation is no longer a detached utility screen.", view: "scope", actions: [action("Configure QRDA package"), terminal("View generated files", "Open")] },
      { title: "Choose Category and Program", body: "Select QRDA I or QRDA III, then choose from only the customer’s configured programs.", signal: "Users cannot accidentally generate files for programs the customer does not use.", view: "qrda", actions: [action("Choose QRDA III"), terminal("Switch category", "Switch")] },
      { title: "Confirm Scope", body: "Scope options adapt to the program: subgroup for MVP, APM Entity for APP Plus, and individual when supported.", signal: "Program rules are visible in the controls instead of hidden behind validation errors.", view: "qrda", actions: [action("Confirm scope"), terminal("Preview package name", "Preview")] },
      { title: "Generate Package", body: "Queue a ZIP package and expose status, warnings, and download actions in the same pathway.", signal: "Users can understand package readiness and next action immediately.", view: "qrda", actions: [terminal("Generate ZIP", "Generate"), terminal("Download history", "Open")] },
    ],
    "new-submission": [
      { title: "Choose Draft Pathway", body: "Create a draft from the customer’s active pathway list, then choose MVP Submission, APP Plus, or QRDA based on the customer’s submission strategy.", signal: "Draft creation respects each customer’s configured submission mix.", view: "scope", actions: [action("Create MVP draft"), terminal("Use APP Plus instead", "Switch")] },
      { title: "Choose Composition, MVP, and Measures", body: "For MVP drafts, start with single-specialty vs multi-specialty composition, choose the applicable specialties, pick the MVP, choose the reporting level, then confirm 4 quality measures and collection type.", signal: "MVP setup is visible before the user commits to the draft.", view: "draft", actions: [action("Resolve missing inputs"), terminal("Create anyway", "Create")] },
      { title: "Save for Review", body: "Persist the draft with owner, due date, selected MVP, subgroup or clinician roster, CMS QPP OAuth state, and submission path.", signal: "The draft has operational context, not just form fields.", view: "draft", actions: [terminal("Save draft", "Save"), terminal("Assign reviewer", "Assign")] },
    ],
  };
  return map[state.scenario] || [
    { title: "Select Customer", body: "Choose the customer and configured submission pathways.", signal: scenario.signal, view: "scope", actions: [action("Open pathway")] },
  ];
}

function scenarioSteps(scenario) {
  return workflowSteps(scenario).map((step) => step.title);
}

function pathwayDescription(program) {
  const descriptions = {
    MIPS: "Traditional quality performance and submissions",
    MVP: "MVP submission and subgroup reporting",
    APPPLUS: "APM entity reporting and APP Plus scores",
    QRDA: "File generation and package history",
  };
  return descriptions[program];
}

function scoreCell(value) {
  if (value === "loading") return `<span class="spinner" aria-label="Loading"></span>`;
  if (value === "pending") return `<span class="status-pill warn">Pending</span>`;
  if (value === "draft") return `<span class="status-pill">Draft</span>`;
  if (value === "FROZEN") return `<span class="spinner" aria-label="Loading"></span><span class="subline">FROZEN</span>`;
  return value;
}

function bindBackButtons() {
  content.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.back));
  });
}

function bindToastButtons() {
  content.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.toast));
  });
}

render();
