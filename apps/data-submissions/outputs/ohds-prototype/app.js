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
  visionRoute: "home",
  visionStrategyTab: "recommended",
  visionPerformanceTab: "trending-quality",
  visionValidationTab: "patient-level",
  visionSubmissionTab: "package",
  visionEvidenceTab: "evaluation",
  selectedValidationMeasure: "cms349",
  expandedValidationMeasure: "cms349",
  selectedValidationPatient: "HY-10482",
  expandedOutcomePatient: "",
  expandedStatusPatient: "",
  outcomeExplainTab: "logic",
  patientValidationSearch: "",
  patientValidationFilter: "all",
  patientValidationChangeDate: "all",
  patientValidationSort: "changed-first",
  patientValidationSortDirection: "desc",
  patientValidationPage: 1,
  patientValidationPageSize: 35,
  patientValidationRound: "current",
  addPatientSearch: "",
  validationAddedPatients: {},
  acceptedValidationChanges: {},
  journeyTimelineRange: "six-months",
  openQualityPopulationMeasure: "",
  qualityPopulationFilter: "all",
  qualityPopulationSort: "opportunity-first",
  qualityPopulationPage: 1,
  expandedQualityPopulationPatient: "",
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
    issue: "Hospice services rendered source fact incorrectly excludes a patient with valid screening evidence",
    representativePatient: "HY-14729",
    focus: "Incorrect exclusion source data",
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
    coverage: "High evidence density with focused status-change review",
    patients: [
      {
        patient: "HY-10482",
        provider: "Jane Coleman, MD",
        specialty: "Infectious Disease",
        currentState: "Denominator",
        opportunity: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        lockedState: "Denominator",
        lockedDate: "07/27",
        priorState: "Denominator only",
        change: "External lab evidence found",
        changeTone: "info",
        closeness: "83%",
        whySelected: "Patient opportunity with the most supporting source evidence",
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
        lockedState: "Numerator",
        lockedDate: "07/27",
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
        lockedState: "Initial population",
        lockedDate: "07/27",
        priorState: "Not in population",
        change: "New denominator",
        changeTone: "warn",
        closeness: "48%",
        whySelected: "Newly attributed denominator patient after roster refresh",
        evidence: "Claim attribution changed; screening evidence absent",
        review: "Chart chase",
        statusHistory: [
          { date: "07/27", status: "Initial population", label: "Cohort locked", detail: "Patient was locked for validation as initial population only.", source: "Claims", version: "Locked cohort" },
          { date: "08/06", status: "Initial population", label: "Attribution feed received", detail: "Billing attribution candidate arrived, but denominator encounter was not yet accepted.", source: "Claims", version: "Attribution feed v11" },
          { date: "08/22", status: "Denominator", label: "Qualifying encounter accepted", detail: "Claim attribution changed and the patient moved into the denominator without HIV screening evidence.", source: "Claims", version: "Outcome v43" },
          { date: "08/31", status: "Denominator", label: "Current calculation", detail: "Current calculation remains denominator because screening evidence is absent.", source: "Claims", version: "Current outcome snapshot" },
        ],
      },
      {
        patient: "HY-11645",
        provider: "Jane Coleman, MD",
        specialty: "Infectious Disease",
        currentState: "Exclusion",
        satisfaction: "Excluded",
        satisfactionTone: "info",
        lockedState: "Numerator",
        lockedDate: "07/27",
        priorState: "Exclusion",
        change: "Moved from locked numerator to exclusion",
        changeTone: "good",
        closeness: "N/A",
        whySelected: "Representative exclusion record",
        evidence: "Documented exclusion found in EHR problem list",
        review: "Validated",
        statusHistory: [
          { date: "05/14", status: "Initial population", label: "Measurement-period baseline", detail: "Patient was present in the attributed population, but no qualifying denominator encounter was accepted yet.", source: "Attribution roster", version: "Outcome v37" },
          { date: "06/03", status: "Denominator", label: "Qualifying encounter accepted", detail: "Infectious-disease encounter and age criteria moved the patient from initial population to denominator.", source: "EHR encounter feed", version: "Outcome v38" },
          { date: "06/28", status: "Numerator", label: "Screening result accepted", detail: "HIV screening result was mapped to an accepted lab concept and satisfied numerator logic.", source: "Lab + EHR", version: "Outcome v39" },
          { date: "07/27", status: "Numerator", label: "Cohort locked", detail: "Patient was locked as a numerator control for validation.", source: "EHR + Lab", version: "Locked cohort", locked: true },
          { date: "08/15", status: "Exclusion", label: "Exclusion evidence accepted", detail: "Documented exclusion was found in the EHR problem list and changed the calculated outcome.", source: "EHR problem list", version: "Outcome v42" },
          { date: "08/31", status: "Exclusion", label: "Current calculation", detail: "Patient remains excluded in the current calculation.", source: "EHR problem list", version: "Current outcome snapshot" },
        ],
      },
      {
        patient: "HY-12214",
        provider: "Marcus Bell, NP",
        specialty: "Infectious Disease",
        currentState: "Denominator",
        opportunity: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        lockedState: "Denominator",
        lockedDate: "07/27",
        priorState: "Denominator",
        priorOpportunity: "Near miss",
        change: "No change",
        changeTone: "info",
        closeness: "76%",
        whySelected: "Patient opportunity with registry evidence that needs EMR confirmation",
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
    coverage: "Balanced controls plus status-change patients",
    patients: [
      {
        patient: "HY-11790",
        provider: "Elena Morales, MD",
        specialty: "Psychiatry",
        currentState: "Denominator",
        satisfaction: "Not satisfied",
        satisfactionTone: "bad",
        lockedState: "Numerator",
        lockedDate: "07/27",
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
        lockedState: "Denominator",
        lockedDate: "07/02",
        priorState: "Denominator",
        change: "Documentation recovered",
        changeTone: "good",
        closeness: "100%",
        whySelected: "Recovered numerator validates documentation logic",
        evidence: "Screening and follow-up plan both coded",
        review: "Validated",
        numeratorEvidence: [
          {
            title: "Accepted depression screening event",
            details: [
              ["Instrument", "PHQ-9"],
              ["Screening date", "2026-08-24"],
              ["Source", "EHR structured behavioral health note"],
              ["Provider", "Caroline Meyer, LCSW"],
            ],
            note: "Screening evidence placed Elena in the denominator at lock and remains accepted.",
          },
          {
            title: "Follow-up care plan accepted",
            details: [
              ["Encounter date", "2026-08-24"],
              ["Source", "EHR structured behavioral health note"],
              ["Provider", "Caroline Meyer, LCSW"],
              ["Concept", "Follow-up care planned"],
            ],
            note: "This clinical evidence satisfied the numerator criterion and moved Elena from Denominator to Numerator on 08/31.",
          },
        ],
        statusHistory: [
          { date: "05/20", status: "Initial population", label: "Measurement-period baseline", detail: "Behavioral-health attribution was present, but a qualifying depression screening encounter had not been accepted.", source: "Roster + EHR", version: "Outcome v35" },
          { date: "06/17", status: "Denominator", label: "Screening event accepted", detail: "PHQ-9 screening moved the patient into the denominator, but no accepted follow-up plan was linked.", source: "EHR structured behavioral health note", version: "Outcome v37" },
          { date: "07/02", status: "Denominator", label: "Cohort locked", detail: "Screening was present, but the follow-up plan numerator criterion was not satisfied.", source: "EHR", version: "Locked cohort", locked: true },
          { date: "08/31", status: "Numerator", label: "Follow-up plan evidence accepted", detail: "Follow-up plan documented for the positive screening was accepted as numerator evidence.", source: "EHR structured behavioral health note", version: "Current outcome snapshot" },
        ],
      },
      {
        patient: "HY-12372",
        provider: "Avery Nelson, NP",
        specialty: "Mental Health",
        currentState: "Denominator",
        opportunity: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Denominator",
        change: "One criterion improved",
        changeTone: "info",
        closeness: "79%",
        whySelected: "Patient opportunity near benchmark threshold",
        evidence: "Screening present; follow-up plan in note text only",
        review: "Note review",
      },
      {
        patient: "HY-12944",
        provider: "Jane Coleman, MD",
        specialty: "Infectious Disease",
        currentState: "Denominator",
        opportunity: "Potential exclusion",
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
    coverage: "Small-stratum validation with high-risk status changes",
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
        currentState: "Denominator",
        opportunity: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Denominator",
        change: "Lab source added",
        changeTone: "info",
        closeness: "74%",
        whySelected: "Patient opportunity with a newly arrived lab source",
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
        lockedState: "Numerator",
        lockedDate: "07/16",
        priorState: "Denominator",
        change: "BP evidence recovered",
        changeTone: "good",
        closeness: "100%",
        whySelected: "Outcome changed after vitals feed update",
        evidence: "Most recent controlled BP now linked to qualifying encounter",
        review: "Validated",
        statusHistory: [
          { date: "05/08", status: "Initial population", label: "Measurement-period baseline", detail: "Patient was attributed to the APP Plus population before denominator encounter evidence was accepted.", source: "APM attribution roster", version: "Outcome v34" },
          { date: "06/06", status: "Denominator", label: "Hypertension encounter accepted", detail: "Diagnosis and qualifying encounter moved the patient into the denominator.", source: "EHR encounter + problem list", version: "Outcome v36" },
          { date: "07/02", status: "Numerator", label: "Controlled BP evidence linked", detail: "Most recent controlled blood pressure was linked to the qualifying encounter and satisfied numerator logic.", source: "Vitals feed + EHR encounter", version: "Outcome v39" },
          { date: "07/16", status: "Numerator", label: "Cohort locked", detail: "Patient locked as numerator after controlled blood pressure evidence was accepted.", source: "Vitals feed + EHR encounter", version: "Locked cohort", locked: true },
          { date: "08/31", status: "Numerator", label: "Current calculation", detail: "Patient remains numerator with controlled blood pressure evidence accepted.", source: "Vitals feed + EHR encounter", version: "Current outcome snapshot" },
        ],
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
        currentState: "Denominator",
        opportunity: "Near miss",
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
    coverage: "Registry reconciliation sample with status-change patients",
    patients: [
      {
        patient: "HY-14013",
        provider: "Thomas Riley, MD",
        specialty: "Family Medicine",
        currentState: "Denominator",
        opportunity: "Near miss",
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
        satisfaction: "Excluded - review",
        satisfactionTone: "warn",
        lockedState: "Numerator",
        lockedDate: "07/27",
        priorState: "Numerator",
        change: "Hospice source fact added",
        changeTone: "warn",
        closeness: "N/A",
        whySelected: "Incorrect hospice exclusion changed a valid numerator patient to excluded",
        evidence: "Hospice services rendered source fact appears mismatched; colonoscopy numerator evidence is present",
        review: "Source correction",
        expectedOutcome: "Numerator",
        numeratorEvidence: [
          {
            title: "Accepted colorectal screening event",
            details: [
              ["Procedure", "Colonoscopy, CPT 45378"],
              ["Date", "2024-11-18"],
              ["Source", "EHR procedure history + registry reconciliation"],
              ["Provider", "Alicia Nguyen, NP"],
            ],
            note: "Screening evidence is linked to Denise Foster's Hyperion MRN and should satisfy numerator criteria.",
          },
          {
            title: "Screening date within allowed lookback",
            details: [
              ["Measurement period", "PY 2026"],
              ["Lookback status", "Within CMS130 accepted lookback window"],
              ["Evidence link", "Procedure record, encounter attribution, and registry entry agree"],
            ],
          },
        ],
        sourceIssue: {
          title: "Incorrect hospice exclusion",
          fact: "Hospice services rendered",
          source: "Claims supplemental feed",
          sourceId: "CLM-HSP-88341",
          serviceDate: "2026-07-18",
          received: "2026-08-29 04:12 ET",
          organization: "Harbor Hospice Services",
          code: "HCPCS Q5001 / revenue 0651",
          matchReason: "Matched by name and date of birth only; source MRN HSP-557219 does not match Hyperion MRN MRN-4114729.",
          issue: "The hospice services rendered fact was attached to Denise Foster's quality record, but no hospice election, discharge, or palliative-care documentation exists in Hyperion's chart.",
          expectedFix: "Reject the hospice exclusion fact and recalculate CMS130v14. With the hospice exclusion removed, Denise should return to Numerator / MET.",
        },
        sources: ["EHR", "Registry", "Claims"],
        statusHistory: [
          { date: "05/06", status: "Initial population", label: "Measurement-period baseline", detail: "Denise was attributed to the APP Plus population before colorectal denominator evidence was accepted.", source: "APM attribution roster", version: "Outcome v34" },
          { date: "05/29", status: "Denominator", label: "Denominator encounter accepted", detail: "Age and qualifying encounter criteria moved Denise from initial population to denominator.", source: "EHR encounter feed", version: "Outcome v35" },
          { date: "06/18", status: "Numerator", label: "Colonoscopy evidence matched", detail: "Colonoscopy evidence linked to Denise Foster's Hyperion MRN and satisfied numerator criteria.", source: "EHR procedure history + registry reconciliation", version: "Outcome v37" },
          { date: "07/27", status: "Numerator", label: "Cohort locked", detail: "Denise was locked as a numerator patient with accepted colorectal screening evidence.", source: "EHR procedure history + registry reconciliation", version: "Locked cohort", locked: true },
          { date: "08/17", status: "Numerator", label: "Prior validation snapshot", detail: "Colonoscopy evidence remained accepted and the patient stayed numerator.", source: "EHR + Registry", version: "Prior outcome snapshot" },
          { date: "08/29", status: "Exclusion", label: "Hospice source fact added", detail: "Claims supplemental feed attached a hospice services rendered fact by name and date of birth only.", source: "Claims supplemental feed", version: "Source load CLM-HSP-88341" },
          { date: "08/31", status: "Exclusion", label: "Current calculation", detail: "Current calculation remains excluded until the mismatched hospice fact is rejected and CMS130v14 is recalculated.", source: "Claims + EHR + Registry", version: "Current outcome snapshot" },
        ],
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
    coverage: "Opportunities weighted by benchmark proximity and lab-source density",
    patients: [
      {
        patient: "HY-15086",
        provider: "Alicia Nguyen, NP",
        specialty: "Primary Care",
        currentState: "Numerator",
        satisfaction: "Satisfied",
        satisfactionTone: "good",
        priorState: "Denominator",
        priorOpportunity: "Near miss",
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
        currentState: "Denominator",
        opportunity: "Near miss",
        satisfaction: "Not satisfied",
        satisfactionTone: "warn",
        priorState: "Denominator",
        change: "One criterion improved",
        changeTone: "info",
        closeness: "77%",
        whySelected: "Near miss one criterion away from satisfying numerator logic",
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
        whySelected: "Cross-specialty denominator control for attribution review",
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
    current: "66%",
    wowChange: "-2.0%",
    wowTone: "bad",
    target: 85,
    action: "Reconcile registry evidence",
    trend: [
      { label: "07/06", value: 66 },
      { label: "07/20", value: 67 },
      { label: "08/03", value: 66 },
      { label: "08/17", value: 68 },
      { label: "08/31", value: 66 },
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

const visionValidationSignals = {
  cms349: {
    status: "Review mapping",
    risk: "Lab source mapping",
    rationale: "HIV numerator review depends on external lab evidence and accepted LOINC mapping.",
    actionType: "changes",
    actionLabel: "Review status changes",
  },
  cms2: {
    status: "Review documentation",
    risk: "Follow-up plan coding",
    rationale: "Several patients moved after the follow-up-plan concept update.",
    actionType: "changes",
    actionLabel: "Review status changes",
  },
  cms153: {
    status: "Ready",
    risk: "Small-volume monitoring",
    rationale: "Outcome movement is low and source evidence is stable across the selected women’s health cohort.",
    actionType: "patients",
    actionLabel: "Open population",
  },
  cms165: {
    status: "Review attribution",
    risk: "Vitals feed and billing attribution",
    rationale: "Some controlled BP evidence appears under encounters that need attribution confirmation.",
    actionType: "opportunities",
    actionLabel: "Open opportunities",
  },
  cms130: {
    status: "Reconcile registry",
    risk: "Incorrect hospice exclusion",
    rationale: "A hospice services rendered source fact appears mismatched and is excluding a patient with valid colorectal screening evidence.",
    actionType: "changes",
    actionLabel: "Review status changes",
    spotlightPatient: "HY-14729",
  },
  cms122: {
    status: "Resolve mapping",
    risk: "A1c result value mapping",
    rationale: "The measure remains below target and has lab-value mapping issues that affect numerator calculation.",
    actionType: "opportunities",
    actionLabel: "Open opportunities",
  },
};

const visionOutcomeShiftRows = [
  { patient: "HY-11106", measure: "CMS349v8 HIV Screening", prior: "Initial population", current: "Denominator", cause: "Attribution change", version: "outcome v42 -> v43", action: "Confirm roster attribution" },
  { patient: "HY-11790", measure: "CMS2v15 Depression Screening", prior: "Numerator", current: "Denominator", cause: "Concept change", version: "context v18 -> v19", action: "Review follow-up code" },
  { patient: "HY-12104", measure: "CMS153v14 Chlamydia Screening", prior: "Exclusion", current: "Denominator", cause: "Measure logic", version: "measure v14.1 -> v14.2", action: "Reconcile criteria" },
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

function applyScenario(scenarioKey, mutateProductionRoute) {
  const scenario = scenarioDefinitions[scenarioKey];
  if (!scenario) return;
  state.scenario = scenarioKey;
  state.labStep = 0;
  state.visionRoute = "home";
  state.visionStrategyLocked = false;
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
  if (state.labMode === "vision") {
    return renderDesignLab();
  }
  if (state.labMode !== "production") {
    state.labMode = "vision";
    labModeSelect.value = state.labMode;
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

function percentNumber(value) {
  const parsed = Number.parseFloat(String(value || "").replace("%", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function mixNumber(start, end, strength) {
  return Math.round(start + (end - start) * strength);
}

function mixRgb(start, end, strength) {
  return `rgb(${mixNumber(start[0], end[0], strength)}, ${mixNumber(start[1], end[1], strength)}, ${mixNumber(start[2], end[2], strength)})`;
}

function wowChangeDomain() {
  const values = Object.values(visionAttestationTrends).map((trend) => percentNumber(trend.wowChange));
  return {
    positive: Math.max(1, ...values.filter((value) => value > 0)),
    negative: Math.max(1, ...values.filter((value) => value < 0).map((value) => Math.abs(value))),
  };
}

function wowChangeHeatStyle(change) {
  const value = percentNumber(change);
  const domain = wowChangeDomain();
  if (value === 0) {
    return "background:#f2f4f7;border-color:#d8dee8;color:#26364d;";
  }

  const isPositive = value > 0;
  const max = isPositive ? domain.positive : domain.negative;
  const strength = Math.min(1, Math.max(0.08, Math.abs(value) / max));
  const fillStrength = 0.12 + (strength * 0.88);
  const edgeStrength = Math.min(1, fillStrength + 0.12);
  const palette = isPositive
    ? {
      light: [232, 247, 237],
      strong: [0, 108, 48],
      border: [24, 128, 67],
      text: "#0f3f23",
    }
    : {
      light: [255, 235, 232],
      strong: [171, 31, 24],
      border: [196, 45, 35],
      text: "#651b16",
    };
  const start = mixRgb(palette.light, palette.strong, fillStrength);
  const end = mixRgb(palette.light, palette.strong, edgeStrength);
  const border = mixRgb(palette.light, palette.border, Math.min(1, fillStrength + 0.08));
  const text = fillStrength >= 0.42 ? "#fff" : palette.text;
  return `background:linear-gradient(90deg, ${start} 0%, ${end} 100%);border-color:${border};color:${text};`;
}

function renderWowChangeHeat(change, tone = "neutral") {
  const value = percentNumber(change);
  const direction = value > 0 ? "increase" : value < 0 ? "decrease" : "no change";
  return `<strong class="delta-heat value-scale ${tone}" style="${wowChangeHeatStyle(change)}" aria-label="${escapeHtml(`${change} week-over-week ${direction}`)}">${escapeHtml(change)}</strong>`;
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
const validationLockedSnapshotLabel = "07/27";
const validationLockDateOptions = ["05/08", "05/21", "06/04", "06/18", "07/02", "07/16", "07/27"];
const patientValidationPageSizeOptions = [20, 35, 50];
const defaultPatientValidationPageSize = 35;
const qualityPopulationPageSize = 35;

const validationAddPatientCandidates = {
  cms349: [
    {
      patient: "HY-10977",
      provider: "Rita Holmes, PA",
      specialty: "Immunology",
      currentState: "Exclusion",
      satisfaction: "Excluded",
      satisfactionTone: "info",
      lockedState: "Numerator",
      lockedDate: "07/27",
      priorState: "Exclusion",
      change: "Hospice evidence added after cohort lock",
      changeTone: "good",
      closeness: "N/A",
      whySelected: "Manual add: status changed from locked numerator to current exclusion",
      evidence: "Hospice services documented after the validation cohort was frozen.",
      review: "Added to validation",
      sources: ["EHR", "Claims"],
    },
    {
      patient: "HY-11248",
      provider: "Jane Coleman, MD",
      specialty: "Infectious Disease",
      currentState: "Denominator",
      opportunity: "Near miss",
      satisfaction: "Not satisfied",
      satisfactionTone: "warn",
      lockedState: "Denominator",
      lockedDate: "07/27",
      priorState: "Denominator",
      change: "New external lab candidate",
      changeTone: "info",
      closeness: "89%",
      whySelected: "Manual add: high-value near miss with outside lab evidence",
      evidence: "External lab evidence appears in registry feed but not in accepted eCQM source.",
      review: "Added to validation",
      sources: ["Registry", "Lab"],
    },
  ],
  cms2: [
    {
      patient: "HY-11842",
      provider: "Elena Morales, MD",
      specialty: "Psychiatry",
      currentState: "Numerator",
      satisfaction: "Satisfied",
      satisfactionTone: "good",
      lockedState: "Denominator",
      lockedDate: "07/27",
      priorState: "Denominator",
      change: "Follow-up note codified",
      changeTone: "good",
      closeness: "100%",
      whySelected: "Manual add: recovered numerator after documentation mapping update",
      evidence: "Follow-up plan was codified from structured documentation after mapping refresh.",
      review: "Added to validation",
      sources: ["EHR"],
    },
  ],
};

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
  let filteredPatients = patients;
  if (["numerator", "denominator", "exclusion"].includes(filter)) {
    filteredPatients = patients.filter((patient) => patientOutcomeCategory(patient) === filter);
  } else if (filter === "changed") {
    filteredPatients = patients.filter(patientHasStateChange);
  }

  const changeDate = selectedPatientValidationChangeDate(measure);
  if (changeDate !== "all") {
    filteredPatients = filteredPatients.filter((patient) => patientLatestStatusChangeDate(patient) === changeDate);
  }
  return filteredPatients;
}

function focusValidationMeasure(measureId, options = {}) {
  const measure = validationMeasureById(measureId);
  const filter = options.filter || "all";
  state.patientValidationChangeDate = options.changeDate || "all";
  const matchingPatients = patientsForValidationFilter(measure, filter);
  const fallbackPatient = matchingPatients[0] || validationPatientsForMeasure(measure)[0];
  state.selectedValidationMeasure = measure.id;
  state.expandedValidationMeasure = measure.id;
  state.selectedValidationPatient = options.patientId || fallbackPatient?.patient || state.selectedValidationPatient;
  state.patientValidationFilter = filter;
  state.patientValidationSearch = options.patientId || "";
  state.patientValidationSort = options.sort || state.patientValidationSort || "changed-first";
  state.patientValidationSortDirection = options.sortDirection || state.patientValidationSortDirection || "desc";
  state.patientValidationPage = 1;
  state.expandedOutcomePatient = options.openOutcome ? state.selectedValidationPatient : "";
  state.expandedStatusPatient = options.openStatus ? state.selectedValidationPatient : "";
  state.outcomeExplainTab = "logic";
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
    validationPatientSearchValues(patient, measure).some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
}

function validationPatientSearchValues(patient, measure) {
  return [
    patient.patient,
    patientDisplayName(patient),
    patientMrn(patient),
    patient.provider,
    patient.specialty,
    patient.currentState,
    patient.priorState,
    patient.lockedState,
    patientLatestStatusChangeDate(patient),
    patientCurrentOutcome(patient),
    patientPriorOutcome(patient),
    patientLockedOutcome(patient),
    patientStatusTimelineText(patient),
    patientOpportunityLabel(patient),
    patient.evidence,
    patient.change,
    patient.review,
    patientDataSources(patient),
    patientSourceIssueSearchText(patient),
    measure.measure,
    measure.code,
    measure.subgroup,
  ];
}

function patientSourceIssueSearchText(patient) {
  return patient.sourceIssue ? Object.values(patient.sourceIssue).join(" ") : "";
}

function validationAddedPatientsForMeasure(measureId) {
  return state.validationAddedPatients?.[measureId] || [];
}

function validationCandidatePoolForMeasure(measure) {
  const selectedIds = new Set(validationPatientsForMeasure(measure).map((patient) => patient.patient));
  const curated = validationAddPatientCandidates[measure.id] || [];
  const generated = Array.from({ length: 18 }, (_, index) => generatedPatientForMeasure(measure, measure.selected + index + 1));
  return [...curated, ...generated]
    .map((patient) => ({
      ...patient,
      lockedDate: patient.lockedDate || validationLockedSnapshotLabel,
      lockedState: patient.lockedState || patient.priorState || patient.currentState,
      candidate: true,
    }))
    .filter((patient, index, patients) =>
      !selectedIds.has(patient.patient)
      && patients.findIndex((candidate) => candidate.patient === patient.patient) === index,
    );
}

function validationCandidateSearchMatch(query, measure = selectedValidationMeasure()) {
  const normalizedQuery = query.trim().toLowerCase();
  const candidates = validationCandidatePoolForMeasure(measure);
  if (!normalizedQuery) return candidates[0] ? { measure, patient: candidates[0], alreadySelected: false } : null;

  const selectedMatch = validationPatientsForMeasure(measure).find((patient) =>
    validationPatientSearchValues(patient, measure).some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
  if (selectedMatch) return { measure, patient: selectedMatch, alreadySelected: true };

  const measureCandidate = candidates.find((patient) =>
    validationPatientSearchValues(patient, measure).some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
  if (measureCandidate) return { measure, patient: measureCandidate, alreadySelected: false };

  const crossMeasureMatch = allValidationPatients().find(({ patient, measure: sourceMeasure }) =>
    validationPatientSearchValues(patient, sourceMeasure).some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
  if (!crossMeasureMatch) return null;
  return {
    measure,
    patient: {
      ...crossMeasureMatch.patient,
      whySelected: `Manual add: patient found in ${crossMeasureMatch.measure.code} and added for ${measure.code} validation review`,
      review: "Added to validation",
    },
    alreadySelected: false,
  };
}

function addPatientToValidationMeasure(measureId, patient) {
  const measure = validationMeasureById(measureId);
  if (validationPatientsForMeasure(measure).some((selected) => selected.patient === patient.patient)) {
    focusValidationMeasure(measureId, { patientId: patient.patient, filter: "all", openStatus: true });
    return { added: false, reason: "already-selected", patient };
  }

  const addedPatient = {
    ...patient,
    added: true,
    candidate: false,
    generated: false,
    lockedDate: patient.lockedDate || validationLockedSnapshotLabel,
    lockedState: patient.lockedState || patient.priorState || patient.currentState,
    priorState: patient.priorState || patient.currentState,
    whySelected: String(patient.whySelected || "").startsWith("Manual add")
      ? patient.whySelected
      : `Manual add: ${patient.whySelected || "customer selected this patient for validation"}`,
    review: "Added to validation",
  };
  state.validationAddedPatients = {
    ...state.validationAddedPatients,
    [measureId]: [...validationAddedPatientsForMeasure(measureId), addedPatient],
  };
  focusValidationMeasure(measureId, { patientId: addedPatient.patient, filter: "all", openStatus: true });
  return { added: true, patient: addedPatient };
}

function acceptValidationStatusChange(measureId, patientId) {
  const measure = validationMeasureById(measureId);
  const patient = validationPatientsForMeasure(measure).find((candidate) => candidate.patient === patientId);
  if (!patient) return { accepted: false, reason: "missing-patient" };

  const latestMovement = patientLatestStatusMovement(patient);
  if (!latestMovement) return { accepted: false, reason: "no-status-change", patient };

  const acceptedDate = "09/09";
  state.acceptedValidationChanges = {
    ...state.acceptedValidationChanges,
    [patient.patient]: {
      acceptedDate,
      status: patientCurrentOutcome(patient),
      movement: latestMovement.movement,
      originalLockedDate: patientOriginalLockedSnapshot(patient),
      originalLockedState: patientOriginalLockedOutcome(patient),
      label: latestMovement.label,
      reason: latestMovement.detail,
      acceptedBy: "Quality manager",
    },
  };
  state.selectedValidationMeasure = measure.id;
  state.selectedValidationPatient = patient.patient;
  state.patientValidationFilter = "all";
  state.patientValidationChangeDate = "all";
  state.patientValidationPage = 1;
  state.expandedStatusPatient = patient.patient;
  state.expandedOutcomePatient = "";
  return { accepted: true, patient, acceptedDate };
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

function canonicalOutcomeState(value) {
  const stateText = String(value || "").toLowerCase();
  if (stateText.includes("not in population") || stateText.includes("initial population")) return "Initial population";
  if (stateText.includes("not met") || stateText.includes("denominator only")) return "Denominator";
  if (stateText.includes("numerator") || stateText.includes("met")) return "Numerator";
  if ((stateText.includes("exclusion") || stateText.includes("excluded")) && !stateText.includes("candidate")) return "Exclusion";
  return "Denominator";
}

function patientCurrentOutcome(patient) {
  return canonicalOutcomeState(patient.currentState);
}

function patientPriorOutcome(patient) {
  return canonicalOutcomeState(patient.priorState);
}

function acceptedValidationChangeForPatient(patient) {
  return state.acceptedValidationChanges?.[patient.patient] || null;
}

function patientOriginalLockedSnapshot(patient) {
  return patient.lockedDate || validationLockedSnapshotLabel;
}

function patientOriginalLockedOutcome(patient) {
  return canonicalOutcomeState(patient.lockedState || patient.priorState || patient.currentState);
}

function patientLockedSnapshot(patient) {
  const accepted = acceptedValidationChangeForPatient(patient);
  return accepted?.acceptedDate || patientOriginalLockedSnapshot(patient);
}

function patientLockedOutcome(patient) {
  const accepted = acceptedValidationChangeForPatient(patient);
  return accepted?.status || patientOriginalLockedOutcome(patient);
}

function patientLockedStatusSubline(patient) {
  const accepted = acceptedValidationChangeForPatient(patient);
  return accepted
    ? `Accepted ${accepted.acceptedDate}`
    : `Locked ${patientOriginalLockedSnapshot(patient)}`;
}

function patientStatusMovementSubline(patient) {
  const accepted = acceptedValidationChangeForPatient(patient);
  return accepted
    ? `Original lock ${accepted.originalLockedDate}`
    : `Since ${patientStatusHistoryStartDate(patient)}`;
}

function patientStatusHistoryStartDate(patient) {
  return patientStatusHistory(patient)[0]?.date || patientOriginalLockedSnapshot(patient);
}

function validationLockDateForSeed(seed, offset = 0) {
  return validationLockDateOptions[(Math.abs(seed) + offset) % validationLockDateOptions.length];
}

function statusDateSortValue(dateText) {
  const [month, day] = String(dateText || "").split("/").map((part) => Number.parseInt(part, 10));
  return (month || 0) * 100 + (day || 0);
}

function normalizePatientStatusEvent(event, fallbackPatient, index) {
  return {
    date: event.date || (index === 0 ? patientOriginalLockedSnapshot(fallbackPatient) : validationCurrentSnapshotLabel),
    status: canonicalOutcomeState(event.status || event.state || event.outcome || fallbackPatient.currentState),
    label: event.label || event.reason || "Outcome calculation",
    detail: event.detail || event.evidence || fallbackPatient.evidence || "Outcome recalculated for the locked validation cohort.",
    source: event.source || patientDataSources(fallbackPatient),
    version: event.version || "Outcome refresh",
    locked: Boolean(event.locked),
    accepted: Boolean(event.accepted),
  };
}

function withAcceptedStatusHistory(events, patient) {
  const accepted = acceptedValidationChangeForPatient(patient);
  if (!accepted) return events;
  return [
    ...events,
    {
      date: accepted.acceptedDate,
      status: accepted.status,
      label: "Status change accepted",
      detail: `${accepted.movement} accepted. ${accepted.status} is now the locked validation status.`,
      source: accepted.acceptedBy || "Quality manager",
      version: "Accepted validation baseline",
      accepted: true,
    },
  ].sort((first, second) => statusDateSortValue(first.date) - statusDateSortValue(second.date));
}

function patientStatusHistory(patient) {
  if (Array.isArray(patient.statusHistory) && patient.statusHistory.length) {
    const events = patient.statusHistory
      .map((event, index) => normalizePatientStatusEvent(event, patient, index))
      .sort((first, second) => statusDateSortValue(first.date) - statusDateSortValue(second.date));
    return withAcceptedStatusHistory(events, patient);
  }

  const locked = patientOriginalLockedOutcome(patient);
  const prior = patientPriorOutcome(patient);
  const current = patientCurrentOutcome(patient);
  const sources = patientDataSources(patient);
  const events = [
    {
      date: patientOriginalLockedSnapshot(patient),
      status: locked,
      label: "Cohort locked",
      detail: "Patient entered the frozen validation cohort with this calculated status.",
      source: sources,
      version: "Locked cohort",
    },
  ];

  if (locked !== prior) {
    events.push({
      date: "08/10",
      status: prior,
      label: statusMovementLabelForPatient(patient, locked, prior),
      detail: statusMovementDetailForPatient(patient, locked, prior),
      source: statusMovementSourceForPatient(patient, sources),
      version: statusMovementVersionForPatient(patient, "Outcome refresh"),
    });
  }

  events.push({
    date: validationPriorSnapshotLabel,
    status: prior,
    label: "Prior validation snapshot",
    detail: prior === events[events.length - 1].status
      ? "Status was unchanged at the prior review point."
      : `Prior snapshot calculated as ${prior}.`,
    source: sources,
    version: "Prior outcome snapshot",
  });

  events.push({
    date: validationCurrentSnapshotLabel,
    status: current,
    label: prior === current ? "Current calculation" : statusMovementLabelForPatient(patient, prior, current),
    detail: prior === current
      ? "No status movement from the prior review point to the current calculation."
      : statusMovementDetailForPatient(patient, prior, current),
    source: statusMovementSourceForPatient(patient, sources),
    version: statusMovementVersionForPatient(patient, "Current outcome snapshot"),
  });

  return withAcceptedStatusHistory(events, patient);
}

function patientStatusTimelineRows(patient) {
  const events = patientStatusHistory(patient);
  return events.map((event, index) => {
    const previous = index > 0 ? events[index - 1] : null;
    const changed = previous ? previous.status !== event.status : false;
    return {
      ...event,
      changed,
      from: previous?.status || event.status,
      locked: event.locked || /lock/i.test(event.label) || event.version === "Locked cohort",
      movement: event.accepted
        ? "Accepted as locked status"
        : event.locked || /lock/i.test(event.label) || event.version === "Locked cohort"
          ? "Validation cohort locked"
          : changed ? `${previous.status} -> ${event.status}` : index === 0 ? "Measurement baseline" : "No status change",
    };
  });
}

function patientStatusChangeCount(patient) {
  return patientStatusTimelineRows(patient).filter((event) => event.changed).length;
}

function patientStatusMovementFlag(patient) {
  const changeCount = patientStatusChangeCount(patient);
  return changeCount >= 3
    ? `<span class="status-change-flag">High movement · ${changeCount} changes</span>`
    : "";
}

function patientLatestStatusMovement(patient) {
  return [...patientStatusTimelineRows(patient)].reverse().find((event) => event.changed) || null;
}

function patientLatestStatusChange(patient) {
  return acceptedValidationChangeForPatient(patient) ? null : patientLatestStatusMovement(patient);
}

function patientLatestStatusChangeDate(patient) {
  return patientLatestStatusChange(patient)?.date || "";
}

function patientValidationChangeDateDisplay(patient) {
  const accepted = acceptedValidationChangeForPatient(patient);
  if (accepted) return { date: accepted.acceptedDate, label: "Accepted" };
  const latestChange = patientLatestStatusChange(patient);
  return {
    date: latestChange?.date || "-",
    label: latestChange?.label || "No movement",
  };
}

function patientStatusTimelineText(patient) {
  return patientStatusTimelineRows(patient)
    .filter((event, index) => index === 0 || event.changed || event.locked || event.accepted)
    .map((event) => `${event.date}: ${event.movement}`)
    .join("; ");
}

function patientOutcomeCategory(patient) {
  const currentState = patientCurrentOutcome(patient);
  if (currentState === "Initial population") return "initial";
  if (currentState === "Exclusion") return "exclusion";
  if (currentState === "Numerator") return "numerator";
  return "denominator";
}

function patientOutcomeCategoryName(category) {
  const names = {
    all: "All selected",
    changed: "Status changed",
    initial: "Initial population",
    numerator: "Numerator",
    denominator: "Denominator",
    exclusion: "Exclusion",
  };
  return names[category] || "All selected";
}

function patientOutcomeBadge(patient) {
  const category = patientOutcomeCategory(patient);
  const tone = category === "numerator" ? "good" : category === "exclusion" ? "info" : category === "initial" ? "neutral" : "warn";
  return visionBadge(patientOutcomeCategoryName(category), tone);
}

function outcomeStatusTone(status) {
  const category = patientOutcomeCategory({ currentState: status });
  if (category === "numerator") return "good";
  if (category === "exclusion") return "info";
  if (category === "initial") return "neutral";
  return "warn";
}

function patientIsNearMiss(patient) {
  if (patientCurrentOutcome(patient) !== "Denominator") return false;
  const opportunity = String(patient.opportunity || "").toLowerCase();
  const evidence = String(patient.evidence || "").toLowerCase();
  const change = String(patient.change || "").toLowerCase();
  const closeness = Number.parseInt(patient.closeness, 10);
  return opportunity.includes("near miss")
    || evidence.includes("one numerator")
    || change.includes("one criterion")
    || closeness >= 75;
}

function patientOpportunityLabel(patient) {
  if (patientCurrentOutcome(patient) === "Numerator") return "Met";
  if (patientCurrentOutcome(patient) === "Exclusion") return "Excluded";
  if (patientCurrentOutcome(patient) === "Initial population") return "IPP only";
  if (patient.opportunity === "Potential exclusion") return "Potential exclusion";
  return patientIsNearMiss(patient) ? "Near miss" : "Opportunity";
}

function patientOpportunityBadge(patient) {
  const label = patientOpportunityLabel(patient);
  const tone = label === "Met" ? "good" : label === "Excluded" ? "info" : label === "Near miss" ? "warn" : "neutral";
  return visionBadge(label, tone);
}

function patientCriteriaProgress(patient) {
  const current = patientCurrentOutcome(patient);
  if (current === "Numerator") return "Numerator criteria satisfied";
  if (current === "Exclusion") return "Exclusion criteria evidenced";
  if (current === "Initial population") return "In IP only";
  if (patientIsNearMiss(patient)) return "One numerator criterion missing";
  if (patient.opportunity === "Potential exclusion") return "Potential exclusion evidence";
  return "Numerator evidence missing";
}

function patientStatusChangeLabel(patient) {
  const accepted = acceptedValidationChangeForPatient(patient);
  if (accepted) return `Accepted as ${accepted.status}`;
  const latestChange = patientLatestStatusChange(patient);
  return latestChange ? latestChange.movement : "No status change";
}

function patientStatusChangeTone(patient) {
  if (acceptedValidationChangeForPatient(patient)) return "good";
  const latestChange = patientLatestStatusChange(patient);
  if (!latestChange) return "neutral";
  if (patient.sourceIssue) return "warn";
  const current = latestChange.status;
  if (current === "Numerator" || current === "Exclusion") return "good";
  if (current === "Denominator") return "warn";
  return "info";
}

function patientHasStatusChange(patient) {
  return Boolean(patientLatestStatusChange(patient));
}

function patientHasStateChange(patient) {
  return patientHasStatusChange(patient);
}

function changedPatientCountForMeasure(measure) {
  return validationPatientsForMeasure(measure).filter(patientHasStateChange).length;
}

function validationSignalForMeasure(measureOrId) {
  const measureId = typeof measureOrId === "string" ? measureOrId : measureOrId.id;
  return visionValidationSignals[measureId] || {
    status: "Review",
    risk: "Validation review needed",
    rationale: "Review selected patient outcomes before submission approval.",
    actionType: "patients",
    actionLabel: "Open population",
  };
}

function compactValidationActionLabel(label) {
  return {
    "Review status changes": "Changes",
    "Review mapping": "Mapping",
    "Review documentation": "Docs",
    "Open opportunities": "Opportunities",
    "Open population": "Patients",
  }[label] || label;
}

function renderValidationActionStack(measure, options = {}) {
  const signal = validationSignalForMeasure(measure);
  const actionLabel = options.compact ? compactValidationActionLabel(signal.actionLabel) : signal.actionLabel;
  const primaryAction = signal.actionType === "opportunities"
    ? `data-workbench-opportunities="${measure.id}"`
    : signal.actionType === "changes"
      ? `data-validation-changes="${measure.id}"`
      : `data-validation-measure="${measure.id}"`;
  const secondaryAction = signal.actionType === "patients"
    ? ""
    : `<button class="grid-link" data-validation-measure="${measure.id}" type="button">Patients</button>`;
  return `
    <div class="grid-action-links ${options.compact ? "compact" : ""}">
      <button class="grid-link primary" ${primaryAction} type="button">${actionLabel}</button>
      ${secondaryAction}
    </div>
  `;
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
  const denominatorToNumerator = category === "numerator" && index % 3 === 1;
  const numeratorFallout = category === "denominator" && index % 13 === 0;
  const populationAdd = category === "denominator" && !numeratorFallout && index % 9 === 0;
  const exclusionChange = category === "exclusion" && index % 22 === 0;
  const removedEvidence = numeratorFallout ? removedNumeratorEvidenceForMeasure(measure, { patient: `HY-${number}`, evidence: base.evidence || "", sources: base.sources }) : null;
  const templates = {
    numerator: {
      currentState: "Numerator",
      satisfaction: "Satisfied",
      satisfactionTone: "good",
      priorState: denominatorToNumerator ? "Denominator" : "Numerator",
      change: denominatorToNumerator ? "Numerator evidence accepted" : "No change",
      changeTone: denominatorToNumerator ? "good" : "info",
      evidence: denominatorToNumerator
        ? `${measure.code} numerator evidence was accepted after cohort lock and moved the patient from denominator to numerator.`
        : `${measure.code} numerator evidence, qualifying encounter, and attribution are present.`,
      sources: ["EHR", "Lab"],
      statusMovementLabel: denominatorToNumerator ? "Numerator evidence accepted" : "",
      statusMovementDetail: denominatorToNumerator
        ? `${measure.code} numerator evidence was accepted into the current calculation and changed the patient from Denominator to Numerator.`
        : "",
      statusMovementSource: denominatorToNumerator ? "EHR + Lab" : "",
      statusMovementVersion: denominatorToNumerator ? "Current outcome snapshot" : "",
    },
    denominator: {
      currentState: "Denominator",
      opportunity: index % 6 === 0 ? "Near miss" : "Opportunity",
      satisfaction: "Not satisfied",
      satisfactionTone: index % 6 === 0 ? "warn" : "bad",
      priorState: numeratorFallout ? "Denominator" : populationAdd ? "Not in population" : "Denominator",
      change: numeratorFallout ? "Numerator evidence removed" : populationAdd ? "New denominator" : "No change",
      changeTone: numeratorFallout || populationAdd ? "warn" : "info",
      evidence: numeratorFallout
        ? `${measure.code} denominator criteria are still met; previously accepted numerator evidence was removed from the current calculation.`
        : index % 6 === 0
        ? `${measure.code} denominator criteria are met; one numerator evidence condition is missing.`
        : `${measure.code} denominator criteria are met; numerator evidence is not present in the calculation.`,
      sources: numeratorFallout ? ["EHR", "Lab"] : index % 5 === 0 ? ["EHR", "Claims"] : ["EHR"],
      statusMovementLabel: numeratorFallout ? "Numerator evidence removed" : populationAdd ? "Denominator evidence accepted" : "",
      statusMovementDetail: numeratorFallout
        ? removedEvidence.shortReason.charAt(0).toUpperCase() + removedEvidence.shortReason.slice(1) + "; denominator criteria still pass."
        : populationAdd ? `${measure.code} denominator evidence was accepted after cohort lock.` : "",
      statusMovementSource: numeratorFallout ? removedEvidence.source : populationAdd ? "Claims + EHR" : "",
      statusMovementVersion: numeratorFallout ? removedEvidence.version : populationAdd ? "Outcome refresh v43" : "",
    },
    exclusion: {
      currentState: "Exclusion",
      satisfaction: "Excluded",
      satisfactionTone: "info",
      priorState: exclusionChange ? "Denominator" : "Exclusion",
      change: exclusionChange ? "Exclusion evidence added" : "No change",
      changeTone: exclusionChange ? "good" : "info",
      evidence: `${measure.code} exclusion evidence is present and linked to the qualifying population.`,
      sources: ["EHR"],
      statusMovementLabel: exclusionChange ? "Exclusion evidence accepted" : "",
      statusMovementDetail: exclusionChange ? `${measure.code} exclusion evidence was accepted and moved the patient out of denominator reporting.` : "",
      statusMovementSource: exclusionChange ? "EHR" : "",
      statusMovementVersion: exclusionChange ? "Current outcome snapshot" : "",
    },
  };
  const lockedState = numeratorFallout ? "Numerator" : templates[category].priorState;
  return {
    ...templates[category],
    patient: `HY-${number}`,
    provider: base.provider,
    specialty: base.specialty,
    lockedDate: validationLockDateForSeed(number, measureIndex),
    lockedState,
    closeness: category === "numerator" ? "100%" : category === "denominator" ? `${58 + (index % 30)}%` : "N/A",
    whySelected: `${patientOutcomeCategoryName(category)} validation patient`,
    review: "Available",
    generated: true,
  };
}

function validationPatientsForMeasure(measure) {
  const seededPatients = measure.patients.map((patient, index) => ({
    lockedDate: patient.lockedDate || validationLockDateForSeed(patientNumericSeed(patient), index),
    lockedState: patient.lockedState || patient.priorState || patient.currentState,
    ...patient,
    generated: false,
  }));
  const needed = Math.max(0, measure.selected - seededPatients.length);
  const generatedPatients = Array.from({ length: needed }, (_, index) => generatedPatientForMeasure(measure, index));
  const baseSelection = [...seededPatients, ...generatedPatients].slice(0, measure.selected);
  const selectedIds = new Set(baseSelection.map((patient) => patient.patient));
  const addedPatients = validationAddedPatientsForMeasure(measure.id)
    .filter((patient) => !selectedIds.has(patient.patient))
    .map((patient) => ({
      lockedDate: patient.lockedDate || validationLockDateForSeed(patientNumericSeed(patient), 3),
      lockedState: patient.lockedState || patient.priorState || patient.currentState,
      ...patient,
      added: true,
      generated: false,
    }));
  return [...baseSelection, ...addedPatients].sort((first, second) => {
    const order = { numerator: 0, denominator: 1, exclusion: 2 };
    if (first.added !== second.added) return Number(second.added) - Number(first.added);
    return order[patientOutcomeCategory(first)] - order[patientOutcomeCategory(second)]
      || first.patient.localeCompare(second.patient);
  });
}

function qualityTargetGapBadge(measureId) {
  const gap = qualityTargetGapValue(measureId);
  return visionBadge(gap >= 0 ? `+${gap}%` : `${gap}%`, gap >= 0 ? "good" : "warn");
}

function qualityTargetGapValue(measureId) {
  return currentTrendValue(measureId) - qualityTargetFor(measureId);
}

function qualityTargetGapText(measureId) {
  const gap = qualityTargetGapValue(measureId);
  return gap >= 0 ? `+${gap}%` : `${gap}%`;
}

function qualityTargetGapTone(measureId) {
  return qualityTargetGapValue(measureId) >= 0 ? "good" : "warn";
}

function validationPopulationRateSummary(measure) {
  const counts = patientValidationFilterCounts(measure);
  const scoredPatients = counts.numerator + counts.denominator;
  const rate = scoredPatients ? Math.round((counts.numerator / scoredPatients) * 100) : 0;
  const totalRate = currentTrendValue(measure.id);
  const delta = rate - totalRate;
  return {
    counts,
    delta,
    rate,
    rateText: `${rate}%`,
    deltaText: `${delta >= 0 ? "+" : ""}${delta} pts vs total`,
    deltaTone: Math.abs(delta) <= 5 ? "good" : delta > 0 ? "warn" : "bad",
    denominatorText: `${counts.numerator} numerator / ${counts.denominator} denominator / ${counts.exclusion} exclusion`,
  };
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
    { id: "quality-performance", label: "Quality Performance" },
    { id: "validation-tracking", label: "Validation Population Tracking" },
  ];
  const activeTab = normalizeVisionPerformanceTab(state.visionPerformanceTab);
  state.visionPerformanceTab = activeTab;
  const tabContent = activeTab === "validation-tracking"
    ? renderVisionValidationTrackingTab()
    : renderVisionQualityPerformanceTab();
  return renderVisionScreenFrame({
    id: "performance",
    crumb: "Quality & Validation",
    title: "Quality & Validation Workbench",
    subtitle: "Monitor measure movement, validate selected populations, and explain patient outcomes before submission approval.",
    filters: `<span>Focused measure: ${selected.measure}</span><span>Score refresh: Today 6:10 AM</span><span>Prior comparison: ${validationPriorSnapshotLabel} -> ${validationCurrentSnapshotLabel}</span>`,
    body: `
      ${renderVisionTabs(tabs, "visionPerformanceTab")}
      ${tabContent}
    `,
  });
}

function renderVisionNearMissTab() {
  return renderVisionQualityPerformanceTab();
}


function qualityOpportunityForMeasure(measureId) {
  return visionMeasureOpportunityRows.find((row) => row.measureId === measureId) || {
    measureId,
    nearMiss: 0,
    lift: "+0.0 pts",
    issue: "No high-impact opportunity modeled",
    focus: "Monitor",
    representativePatient: selectedValidationPatient(validationMeasureById(measureId)).patient,
    benchmark: "N/A",
    closeness: "N/A",
  };
}

const qualityPopulationTotals = {
  cms349: { total: 4366, numerator: 3231, denominator: 1129, exclusion: 6, nearMiss: 428, changed: 86 },
  cms2: { total: 8057, numerator: 6761, denominator: 1058, exclusion: 238, nearMiss: 112, changed: 57 },
  cms153: { total: 102, numerator: 8, denominator: 87, exclusion: 7, nearMiss: 39, changed: 12 },
  cms165: { total: 2660, numerator: 1012, denominator: 1380, exclusion: 268, nearMiss: 96, changed: 44 },
  cms130: { total: 4872, numerator: 3492, denominator: 1211, exclusion: 169, nearMiss: 84, changed: 31 },
  cms122: { total: 17807, numerator: 5680, denominator: 10342, exclusion: 1785, nearMiss: 73, changed: 58 },
};

const qualityPopulationChangeDates = ["08/29", "08/22", "08/15", "08/06", "07/18", "06/28", "06/10", "05/30"];

function selectedQualityPopulationMeasure() {
  return validationMeasureById(state.openQualityPopulationMeasure || state.selectedValidationMeasure);
}

function qualityPopulationCounts(measure) {
  const opportunity = qualityOpportunityForMeasure(measure.id);
  return qualityPopulationTotals[measure.id] || {
    total: 1000,
    numerator: 620,
    denominator: 330,
    exclusion: 50,
    nearMiss: Number(opportunity.nearMiss) || 0,
    changed: Math.max(8, Math.round((Number(opportunity.nearMiss) || 0) * 0.14)),
  };
}

function qualityPopulationFilterCount(measure, filter) {
  const counts = qualityPopulationCounts(measure);
  const filterMap = {
    all: counts.total,
    "near-miss": counts.nearMiss,
    changed: counts.changed,
    numerator: counts.numerator,
    denominator: counts.denominator,
    exclusion: counts.exclusion,
  };
  return filterMap[filter] ?? counts.total;
}

function qualityPopulationFilterLabel(filter) {
  const labels = {
    all: "All patients",
    "near-miss": "Near misses",
    changed: "Status changed",
    numerator: "Numerator",
    denominator: "Denominator",
    exclusion: "Exclusion",
  };
  return labels[filter] || "All population";
}

function qualityPopulationStatusForIndex(measure, filter, index) {
  if (filter === "numerator") return "Numerator";
  if (filter === "exclusion") return "Exclusion";
  if (filter === "near-miss" || filter === "denominator") return "Denominator";
  if (filter === "changed") {
    const sequence = ["Denominator", "Numerator", "Exclusion", "Denominator", "Numerator"];
    return sequence[index % sequence.length];
  }
  const counts = qualityPopulationCounts(measure);
  if (state.qualityPopulationSort === "opportunity-first" && index < counts.nearMiss) return "Denominator";
  if (index % 17 === 0 && index < counts.nearMiss + counts.changed) return "Denominator";
  if (index % 19 === 0) return "Exclusion";
  if (index % 5 === 0) return "Denominator";
  return "Numerator";
}

function qualityPopulationPatientId(measure, index) {
  const measureIndex = Math.max(0, visionValidationPatientMeasures.findIndex((candidate) => candidate.id === measure.id));
  return `HY-${30000 + measureIndex * 3000 + index}`;
}

function qualityPopulationSeedPatient(measure, filter, index) {
  const opportunity = qualityOpportunityForMeasure(measure.id);
  if (index > 0) return null;
  const validationPatients = validationPatientsForMeasure(measure);
  if (filter === "changed") {
    const signal = validationSignalForMeasure(measure);
    return validationPatients.find((patient) => patient.patient === signal.spotlightPatient)
      || validationPatients.find(patientHasStatusChange)
      || null;
  }
  if (filter === "near-miss" || filter === "all") {
    const representative = validationPatients.find((patient) => patient.patient === opportunity.representativePatient);
    if (representative && (filter === "all" || patientIsNearMiss(representative))) return representative;
    return validationPatients.find(patientIsNearMiss) || representative || null;
  }
  return validationPatients.find((patient) => patientOutcomeCategory(patient) === filter) || null;
}

function qualityPopulationPatientForIndex(measure, filter, index) {
  const seeded = qualityPopulationSeedPatient(measure, filter, index);
  if (seeded) {
    return {
      ...seeded,
      qualityPopulationIndex: index,
      qualityPopulation: true,
      opportunitySignal: patientIsNearMiss(seeded) ? "Near miss" : patientOpportunityLabel(seeded),
      source: patientDataSources(seeded),
    };
  }

  const status = qualityPopulationStatusForIndex(measure, filter, index);
  const providerBase = measure.patients[index % measure.patients.length] || { provider: "Quality Clinician, MD", specialty: "Primary Care" };
  const patient = qualityPopulationPatientId(measure, index + 1);
  const seed = patientNumericSeed({ patient });
  const changeDate = qualityPopulationChangeDates[index % qualityPopulationChangeDates.length];
  const hasStatusChange = filter === "changed" || (state.qualityPopulationSort === "status-changed-first" && index < qualityPopulationCounts(measure).changed) || index % 13 === 0;
  const nearMiss = filter === "near-miss" || (status === "Denominator" && (state.qualityPopulationSort === "opportunity-first" ? index < qualityPopulationCounts(measure).nearMiss : index % 4 === 0));
  const priorStatus = status === "Numerator" ? "Denominator" : status === "Exclusion" ? "Numerator" : index % 2 === 0 ? "Initial population" : "Numerator";
  const focus = qualityOpportunityForMeasure(measure.id).focus;
  const evidence = nearMiss
    ? `${focus}: one numerator criterion needs review before this patient can move to numerator.`
    : status === "Numerator"
      ? `${measure.code} numerator evidence, attribution, and qualifying encounter are present.`
      : status === "Exclusion"
        ? `${measure.code} denominator exclusion evidence is accepted in the current calculation.`
        : `${measure.code} denominator criteria are met; numerator evidence is missing from accepted sources.`;
  return {
    patient,
    provider: providerBase.provider,
    specialty: providerBase.specialty,
    currentState: status,
    opportunity: nearMiss ? "Near miss" : status === "Denominator" ? "Opportunity" : "",
    priorState: hasStatusChange ? priorStatus : status,
    lockedState: hasStatusChange ? priorStatus : status,
    lockedDate: validationLockDateForSeed(seed, index),
    change: hasStatusChange ? `${priorStatus} moved to ${status}` : "No status change",
    closeness: nearMiss ? `${72 + (index % 18)}%` : status === "Numerator" ? "100%" : "N/A",
    evidence,
    review: nearMiss ? "Performance opportunity" : "Population row",
    sources: index % 5 === 0 ? ["EHR", "Claims"] : index % 3 === 0 ? ["Lab", "EHR"] : ["EHR"],
    qualityPopulation: true,
    opportunitySignal: nearMiss ? "Near miss" : status === "Denominator" ? "Open opportunity" : "Monitor",
    statusHistory: hasStatusChange ? [
      { date: validationLockDateForSeed(seed, index), status: priorStatus, label: "Population baseline", detail: "Patient status when population tracking began for this measure.", source: "Calculated population", version: "Baseline" },
      { date: changeDate, status, label: `${priorStatus} moved to ${status}`, detail: evidence, source: patientDataSources({ evidence, sources: index % 5 === 0 ? ["EHR", "Claims"] : ["EHR"] }), version: `Outcome refresh ${index + 41}` },
    ] : [],
    qualityPopulationIndex: index,
  };
}

function qualityPopulationPatientById(measure, patientId, index = null) {
  const validationPatient = validationPatientsForMeasure(measure).find((patient) => patient.patient === patientId);
  if (validationPatient) return {
    ...validationPatient,
    qualityPopulation: true,
    opportunitySignal: patientIsNearMiss(validationPatient) ? "Near miss" : patientOpportunityLabel(validationPatient),
  };
  const parsedIndex = Number.isFinite(Number(index))
    ? Number(index)
    : Math.max(0, patientNumericSeed({ patient: patientId }) - (30000 + Math.max(0, visionValidationPatientMeasures.findIndex((candidate) => candidate.id === measure.id)) * 3000) - 1);
  return qualityPopulationPatientForIndex(measure, state.qualityPopulationFilter || "all", parsedIndex);
}

function sortedQualityPopulationIndex(measure, filter, index) {
  const counts = qualityPopulationCounts(measure);
  if (state.qualityPopulationSort === "status-changed-first" && filter === "all") {
    return index < counts.changed ? index : index + counts.nearMiss;
  }
  if (state.qualityPopulationSort === "patient-name") return index * 7;
  return index;
}

function qualityPopulationPageInfo(measure) {
  const filter = state.qualityPopulationFilter || "all";
  const total = qualityPopulationFilterCount(measure, filter);
  const totalPages = Math.max(1, Math.ceil(total / qualityPopulationPageSize));
  const page = Math.min(Math.max(Number(state.qualityPopulationPage) || 1, 1), totalPages);
  const start = (page - 1) * qualityPopulationPageSize;
  const end = Math.min(start + qualityPopulationPageSize, total);
  const rows = Array.from({ length: Math.max(0, end - start) }, (_, rowIndex) =>
    qualityPopulationPatientForIndex(measure, filter, sortedQualityPopulationIndex(measure, filter, start + rowIndex)));
  return { end, page, rows, start, total, totalPages };
}

function renderQualityPopulationFilterButton(filter, measure) {
  const active = state.qualityPopulationFilter === filter;
  return `<button class="${active ? "active" : ""}" data-quality-population-filter="${filter}" type="button">${qualityPopulationFilterLabel(filter)}<strong>${qualityPopulationFilterCount(measure, filter).toLocaleString()}</strong></button>`;
}

function patientPopulationStatusSummaryLabel(patient) {
  const latestMovement = patientLatestStatusMovement(patient);
  return latestMovement ? latestMovement.movement : "Current status";
}

function patientPopulationStatusSummarySubline(patient) {
  const latestMovement = patientLatestStatusMovement(patient);
  return latestMovement ? `${latestMovement.date} | ${latestMovement.label}` : "No status movement";
}

function patientPopulationStatusTimelineText(patient) {
  const movementRows = patientStatusTimelineRows(patient).filter((event) => event.changed);
  if (!movementRows.length) return `${validationCurrentSnapshotLabel}: Current status ${patientCurrentOutcome(patient)}`;
  return movementRows.map((event) => `${event.date}: ${event.movement}`).join("; ");
}

function renderQualityPopulationStatusPanel(patient, measure) {
  return renderMeasureJourneyDetail(patient, measure, {
    contextClass: "quality-measure-journey",
    includeAccept: false,
    includeLocking: false,
  });
}

function renderQualityPopulationPane(measure) {
  const pageInfo = qualityPopulationPageInfo(measure);
  const opportunity = qualityOpportunityForMeasure(measure.id);
  const activeFilter = state.qualityPopulationFilter || "all";
  const rangeStart = pageInfo.total ? pageInfo.start + 1 : 0;
  return `
    <tr class="quality-population-detail-row">
      <td colspan="8">
        <section class="quality-population-pane">
          <div class="quality-population-header">
            <div>
              <span class="vision-kicker">Measure population</span>
              <h4>${measure.measure}</h4>
              <p>${qualityPopulationCounts(measure).total.toLocaleString()} calculated patients · ${opportunity.nearMiss} near misses · ${attestationTrendFor(measure.id).wowChange} WoW movement</p>
            </div>
          </div>
          <div class="validation-worklist-controls quality-population-controls">
            <div class="validation-filter-group" aria-label="Measure population filters">
              ${["all", "near-miss", "changed", "numerator", "denominator", "exclusion"].map((filter) => renderQualityPopulationFilterButton(filter, measure)).join("")}
            </div>
            <label class="validation-sort-control">
              <span>Sort</span>
              <select data-quality-population-sort>
                <option value="opportunity-first" ${state.qualityPopulationSort === "opportunity-first" ? "selected" : ""}>Opportunities first</option>
                <option value="status-changed-first" ${state.qualityPopulationSort === "status-changed-first" ? "selected" : ""}>Status changed first</option>
                <option value="patient-name" ${state.qualityPopulationSort === "patient-name" ? "selected" : ""}>Patient name</option>
              </select>
            </label>
          </div>
          <table class="vision-table quality-population-table resizable-data-grid">
            <thead><tr><th>Patient</th><th>MRN</th><th>Provider</th><th>Specialty</th><th>Current status</th><th>Change date</th><th>Status summary</th><th>Opportunity signal</th><th>Evidence gap / source signal</th></tr></thead>
            <tbody>
              ${pageInfo.rows.map((patient) => `
                <tr class="${patientIsNearMiss(patient) ? "near-miss-row" : ""} ${patientHasStatusChange(patient) ? "state-changed" : ""} ${state.expandedQualityPopulationPatient === patient.patient ? "selected-patient-row" : ""}">
                  <td><strong>${patientDisplayName(patient)}</strong><span class="subline">${patient.patient}</span></td>
                  <td><strong>${patientMrn(patient)}</strong></td>
                  <td><strong>${patient.provider}</strong></td>
                  <td>${patient.specialty}</td>
                  <td><strong>${patientCurrentOutcome(patient)}</strong>${patientIsNearMiss(patient) ? `<span class="subline">Near miss</span>` : ""}</td>
                  <td><strong>${patientLatestStatusChangeDate(patient) || "-"}</strong><span class="subline">${patientHasStatusChange(patient) ? "Status changed" : "No change"}</span></td>
                  <td><button class="grid-link status-movement-link ${state.expandedQualityPopulationPatient === patient.patient ? "active" : ""}" data-quality-population-status="${measure.id}:${patient.patient}:${patient.qualityPopulationIndex ?? ""}" title="${escapeHtml(patientPopulationStatusTimelineText(patient))}" type="button">${patientPopulationStatusSummaryLabel(patient)}</button><span class="subline">${patientPopulationStatusSummarySubline(patient)}</span></td>
                  <td><strong>${patient.opportunitySignal}</strong><span class="subline">${patient.closeness || "N/A"} criteria proximity</span></td>
                  <td><span class="evidence-summary">${patient.evidence}</span><span class="subline">Sources: ${patientDataSources(patient)}</span></td>
                </tr>
                ${state.expandedQualityPopulationPatient === patient.patient ? `
                  <tr class="patient-outcome-detail-row quality-population-status-detail-row">
                    <td colspan="9">
                      ${renderQualityPopulationStatusPanel(patient, measure)}
                    </td>
                  </tr>
                ` : ""}
              `).join("")}
            </tbody>
          </table>
          <div class="patient-table-pager">
            <span>Showing ${rangeStart}-${pageInfo.end} of ${pageInfo.total.toLocaleString()} ${qualityPopulationFilterLabel(activeFilter).toLowerCase()} patients</span>
            <div>
              <button class="vision-row-button" data-quality-population-page="${pageInfo.page - 1}" ${pageInfo.page <= 1 ? "disabled" : ""} type="button">Previous</button>
              <button class="vision-row-button" data-quality-population-page="${pageInfo.page + 1}" ${pageInfo.page >= pageInfo.totalPages ? "disabled" : ""} type="button">Next</button>
            </div>
          </div>
        </section>
      </td>
    </tr>
  `;
}


function renderVisionQualityPerformanceTab() {
  const totalNearMisses = visionMeasureOpportunityRows.reduce((sum, row) => sum + Number(row.nearMiss), 0);
  const totalLift = "5.5";
  const belowTarget = visionValidationPatientMeasures.filter((measure) => currentTrendValue(measure.id) < qualityTargetFor(measure.id)).length;
  return `
    <div class="workbench-summary-row">
      <div>
        <span class="vision-kicker">Quality performance</span>
        <strong>${belowTarget} measures below target · ${totalNearMisses} near-miss patients · +${totalLift} pts modeled lift</strong>
        <em>Population-level quality movement, week-over-week change, trend, and the highest-value opportunities to improve performance.</em>
      </div>
    </div>
    <article class="vision-card spaced quality-performance-workspace">
      <div class="vision-section-title compact">
        <span class="vision-kicker">Selected Measure Population</span>
      </div>
      <table class="vision-table quality-performance-table resizable-data-grid">
        <thead><tr><th>Measure</th><th>Current</th><th>Target</th><th>Gap</th><th>WoW</th><th>Trend</th><th>Near misses</th><th>Primary opportunity</th></tr></thead>
        <tbody>
          ${visionValidationPatientMeasures.map((measure) => {
            const trend = attestationTrendFor(measure.id);
            const target = qualityTargetFor(measure.id);
            const opportunity = qualityOpportunityForMeasure(measure.id);
            const isPopulationOpen = state.openQualityPopulationMeasure === measure.id;
            return `
            <tr class="${isPopulationOpen ? "selected" : ""}" data-quality-population-row="${measure.id}" tabindex="0" aria-expanded="${isPopulationOpen ? "true" : "false"}" title="${isPopulationOpen ? "Collapse measure population" : "Open measure population"}">
              <td>
                <div class="measure-row-entry">
                  <span class="row-disclosure" aria-hidden="true"></span>
                  <div>
                    <strong>${measure.measure}</strong>
                    <span class="subline">${measure.code} / ${measure.mvp}</span>
                  </div>
                </div>
              </td>
              <td class="numeric"><strong>${trend.current}</strong></td>
              <td class="numeric">
                <label class="grid-number-cell">
                  <input type="number" min="50" max="100" value="${target}" data-quality-target="${measure.id}" aria-label="${measure.measure} customer target" />
                  <span>%</span>
                </label>
              </td>
              <td class="numeric"><strong class="gap-text ${qualityTargetGapTone(measure.id)}" data-quality-gap="${measure.id}">${qualityTargetGapText(measure.id)}</strong></td>
              <td class="numeric wow-grid-cell">${renderWowChangeHeat(trend.wowChange, trend.wowTone)}</td>
              <td>${renderAttestationTrendChart(measure, { table: true })}</td>
              <td class="numeric"><button class="grid-link metric-link" data-quality-population="${measure.id}" data-quality-filter="near-miss" type="button">${opportunity.nearMiss}</button><span class="subline">${opportunity.closeness} close</span></td>
              <td><strong>${opportunity.focus}</strong><span class="subline">${opportunity.issue}</span></td>
            </tr>
            ${isPopulationOpen ? renderQualityPopulationPane(measure) : ""}
          `;
          }).join("")}
        </tbody>
      </table>
    </article>
  `;
}


function renderVisionPopulationValidationTab() {
  return renderVisionQualityPerformanceTab();
}

function renderVisionAttestationTrendsTab() {
  return renderVisionPopulationValidationTab();
}

function renderVisionTrendingQualityTab() {
  return renderVisionPopulationValidationTab();
}

const validationPatientNames = {
  "HY-10482": { name: "Lambert, Mike", dob: "Nov 20, 1977" },
  "HY-10731": { name: "Chen, Alana", dob: "Jan 12, 1984" },
  "HY-10977": { name: "Morrison, Gail", dob: "May 5, 1948" },
  "HY-11106": { name: "Ortiz, Renee", dob: "Aug 2, 1969" },
  "HY-11248": { name: "Delgado, Marcus", dob: "Oct 18, 1985" },
  "HY-11645": { name: "Powers, Frederick", dob: "Mar 4, 1968" },
  "HY-12214": { name: "Watkins, Simone", dob: "Jun 17, 1991" },
  "HY-11790": { name: "Jackson, Terry", dob: "Sep 9, 1975" },
  "HY-11842": { name: "Ibrahim, Layla", dob: "Feb 7, 1979" },
  "HY-11903": { name: "Santos, Elena", dob: "May 19, 1982" },
  "HY-12372": { name: "Wells, Morgan", dob: "Dec 2, 1990" },
  "HY-12944": { name: "Patel, Rina", dob: "Apr 30, 1971" },
  "HY-12104": { name: "Dawson, Emily", dob: "Feb 14, 1998" },
  "HY-12466": { name: "Reed, Claire", dob: "Oct 6, 2001" },
  "HY-12812": { name: "Kim, Nora", dob: "Jul 22, 1999" },
  "HY-13077": { name: "Moore, Helen", dob: "Nov 3, 1987" },
  "HY-13218": { name: "Lambert, Mike", dob: "Nov 20, 1977" },
  "HY-13540": { name: "Brooks, Martin", dob: "Jan 8, 1964" },
  "HY-13822": { name: "Grant, Luis", dob: "Jun 11, 1970" },
  "HY-14013": { name: "Rivera, Ana", dob: "Aug 19, 1960" },
  "HY-14355": { name: "Miller, Jordan", dob: "Mar 27, 1958" },
  "HY-14729": { name: "Foster, Denise", dob: "Dec 1, 1949", mrn: "MRN-4114729" },
  "HY-15086": { name: "Bennett, Paul", dob: "Apr 3, 1966" },
  "HY-15319": { name: "Harris, Olivia", dob: "Sep 16, 1973" },
  "HY-15602": { name: "Nguyen, Alex", dob: "Jan 25, 1980" },
};

const generatedPatientLastNames = ["Adler", "Baxter", "Carter", "Diaz", "Ellis", "Franklin", "Gibson", "Holland", "Irwin", "Keller", "Lawson", "Morgan", "Novak", "Olsen", "Porter", "Quinn", "Russell", "Sawyer", "Taylor", "Valdez"];
const generatedPatientFirstNames = ["Avery", "Blair", "Casey", "Dana", "Elliot", "Finley", "Harper", "Jordan", "Kai", "Leslie", "Marlowe", "Noel", "Parker", "Quinn", "Reese", "Sage", "Taylor", "Val", "Wren", "Zion"];


function patientNumericSeed(patient) {
  return Number.parseInt(String(patient.patient).replace(/\D/g, "").slice(-5), 10) || 10482;
}

function patientDisplayName(patient) {
  if (validationPatientNames[patient.patient]?.name) return validationPatientNames[patient.patient].name;
  const seed = patientNumericSeed(patient);
  const lastName = generatedPatientLastNames[seed % generatedPatientLastNames.length];
  const firstName = generatedPatientFirstNames[Math.floor(seed / 3) % generatedPatientFirstNames.length];
  return `${lastName}, ${firstName}`;
}

function patientMrn(patient) {
  if (validationPatientNames[patient.patient]?.mrn) return validationPatientNames[patient.patient].mrn;
  return `MRN-${String(4100000 + patientNumericSeed(patient)).slice(-7)}`;
}

function patientDob(patient) {
  if (validationPatientNames[patient.patient]?.dob) return validationPatientNames[patient.patient].dob;
  const numericId = patientNumericSeed(patient) % 100;
  const year = 1955 + (numericId % 45);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][numericId % 12];
  return `${month} ${(numericId % 27) + 1}, ${year}`;
}

function patientOverallResult(patient) {
  const current = patientCurrentOutcome(patient);
  if (current === "Numerator") return { label: "Met", tone: "met" };
  if (current === "Exclusion") return { label: "Excluded", tone: "excluded" };
  if (current === "Initial population") return { label: "No Data", tone: "neutral" };
  return { label: "Not Achieved", tone: "not-met" };
}

function patientOutcomeAnswer(patient, measure) {
  const current = patientCurrentOutcome(patient);
  if (patient.sourceIssue?.expectedFix) {
    return `Current calculation is Excluded because ${patient.sourceIssue.fact.toLowerCase()} is being accepted as denominator-exclusion evidence for ${measure.code}. The supporting source detail indicates the hospice fact is likely attached to the wrong record, while the colorectal screening evidence is valid. ${patient.sourceIssue.expectedFix}`;
  }
  if (patientHasNumeratorFallout(patient)) {
    const removed = removedNumeratorEvidenceForMeasure(measure, patient);
    return `Patient still meets initial population and denominator criteria for ${measure.code}, but fell out of the numerator because ${removed.shortReason}. The current evidence supports Denominator / Not Achieved.`;
  }
  if (current === "Numerator") {
    return `Patient meets denominator and numerator criteria for ${measure.code}. The qualifying encounter, attribution, and numerator evidence are all present, so the evidence supports Met.`;
  }
  if (current === "Exclusion") {
    return `Patient has denominator exclusion evidence for ${measure.code}. The patient remains in the selected validation population as an exclusion control, and the evidence supports Excluded.`;
  }
  if (patientIsNearMiss(patient)) {
    return `Patient meets initial population and denominator criteria for ${measure.code}, but one numerator criterion is not achieved. The regulatory outcome remains Denominator / Not Achieved; the near-miss flag shows criteria progress, not a status change.`;
  }
  return `Patient meets initial population and denominator criteria for ${measure.code}, but the numerator evidence is not currently achieved. The evidence supports Denominator / Not Achieved.`;
}

function measureNumeratorCriteria(measure) {
  const label = measure.measure.toLowerCase();
  if (label.includes("hiv")) {
    return [
      "Has HIV screening result during the measurement period",
      "Screening result is mapped to an accepted LOINC/result concept",
    ];
  }
  if (label.includes("depression")) {
    return [
      "Depression screening completed with accepted instrument",
      "Follow-up plan documented when screening is positive",
    ];
  }
  if (label.includes("chlamydia")) {
    return [
      "Chlamydia screening lab performed during eligible window",
      "Lab result is linked to the qualifying encounter",
    ];
  }
  if (label.includes("blood pressure")) {
    return [
      "Has systolic blood pressure less than 140 mmHg",
      "Has diastolic blood pressure less than 90 mmHg",
    ];
  }
  if (label.includes("colorectal")) {
    return [
      "Has accepted colorectal screening event",
      "Screening date is within the allowed lookback window",
    ];
  }
  if (label.includes("glycemic")) {
    return [
      "Glycemic assessment performed during measurement period",
      "Result value is mapped to the accepted lab concept",
    ];
  }
  return [
    "Has qualifying numerator event",
    "Numerator event is linked to accepted source evidence",
  ];
}

function criterionResultBadge(result) {
  const tone = result === "Satisfied"
    ? "satisfied"
    : result === "Not satisfied" ? "not-satisfied" : result === "Partial" ? "partial" : result === "Excluded" ? "excluded" : "not-evidenced";
  const label = result === "Satisfied"
    ? "Met"
    : result === "Not satisfied" || result === "Partial"
      ? "Not Achieved"
      : result === "Excluded" ? "Excluded" : "No Data";
  return `<span class="criterion-result ${tone}">${label}</span>`;
}

function criterionRow(criteria, evidence, result) {
  return { criteria, evidence, result };
}


function patientHasNumeratorFallout(patient) {
  const latestMovement = patientLatestStatusMovement(patient);
  return latestMovement?.from === "Numerator" && latestMovement.status === "Denominator";
}

function removedNumeratorEvidenceForMeasure(measure, patient) {
  const label = measure.measure.toLowerCase();
  const suffix = String(patient.patient || "00000").replace(/\D/g, "").slice(-3) || "000";
  if (label.includes("hiv")) {
    return {
      criteria: "Screening result is mapped to an accepted LOINC/result concept",
      title: "Removed HIV screening mapping",
      shortReason: "the previously accepted HIV screening result lost its accepted LOINC/result mapping",
      details: [
        ["Previously accepted evidence", `HIV screening observation OBS-HIV-${suffix}`],
        ["Removed on", "2026-08-10"],
        ["Dropped condition", "LOINC 75622-1 no longer maps to an accepted HIV screening result"],
        ["Source", "External lab interface"],
      ],
      note: "Denominator criteria are still met. The dropped numerator mapping is what moved the patient from Numerator to Denominator.",
      marker: "The accepted HIV screening code/mapping was removed, so the numerator criterion is no longer satisfied.",
      source: "Lab + EHR",
      version: "Outcome refresh v43",
    };
  }
  if (label.includes("depression")) {
    return {
      criteria: "Follow-up plan documented when screening is positive",
      title: "Removed follow-up plan concept",
      shortReason: "the follow-up-plan code no longer qualifies as accepted numerator evidence",
      details: [
        ["Previously accepted evidence", `Follow-up plan concept BH-FUP-${suffix}`],
        ["Removed on", "2026-08-10"],
        ["Dropped condition", "SNOMED follow-up plan mapping removed from accepted numerator value set"],
        ["Source", "EHR behavioral health note"],
      ],
      note: "The screening still places the patient in denominator. The removed follow-up-plan concept is what caused the numerator fall-out.",
      marker: "The follow-up-plan code was removed from accepted numerator evidence, so this criterion is no longer satisfied.",
      source: "EHR",
      version: "Context refresh v19",
    };
  }
  if (label.includes("chlamydia")) {
    return {
      criteria: "Lab result is linked to the qualifying encounter",
      title: "Removed lab-result linkage",
      shortReason: "the screening lab is no longer linked to the qualifying encounter",
      details: [
        ["Previously accepted evidence", `Chlamydia NAAT result LAB-CT-${suffix}`],
        ["Removed on", "2026-08-10"],
        ["Dropped condition", "Result-to-encounter link no longer accepted"],
        ["Source", "Lab interface"],
      ],
      note: "The patient remains denominator eligible, but the numerator lab linkage dropped from the current calculation.",
      marker: "The lab-result linkage was removed, so the numerator criterion is no longer satisfied.",
      source: "Lab + EHR",
      version: "Outcome refresh v43",
    };
  }
  if (label.includes("blood pressure")) {
    return {
      criteria: "Has diastolic blood pressure less than 90 mmHg",
      title: "Removed controlled blood pressure evidence",
      shortReason: "the controlled blood pressure reading is no longer attributed to the qualifying encounter",
      details: [
        ["Previously accepted evidence", `BP reading VITAL-${suffix}`],
        ["Removed on", "2026-08-10"],
        ["Dropped condition", "Controlled BP value no longer tied to an attributed encounter"],
        ["Source", "Vitals feed"],
      ],
      note: "The diagnosis and denominator encounter still qualify. The removed controlled BP evidence caused the numerator fall-out.",
      marker: "The controlled BP evidence was removed from accepted numerator evidence, so this criterion is no longer satisfied.",
      source: "Vitals + Claims",
      version: "Attribution refresh v43",
    };
  }
  if (label.includes("colorectal")) {
    return {
      criteria: "Screening date is within the allowed lookback window",
      title: "Removed colorectal screening evidence",
      shortReason: "the accepted colorectal screening event no longer qualifies in the current calculation",
      details: [
        ["Previously accepted evidence", `Colorectal screening event CRC-${suffix}`],
        ["Removed on", "2026-08-10"],
        ["Dropped condition", "Screening event no longer linked to accepted registry/EHR evidence"],
        ["Source", "EHR + Registry"],
      ],
      note: "The denominator remains valid, but the accepted numerator screening evidence dropped from the current calculation.",
      marker: "The colorectal screening evidence was removed, so this criterion is no longer satisfied.",
      source: "EHR + Registry",
      version: "Registry reconciliation v43",
    };
  }
  if (label.includes("glycemic")) {
    return {
      criteria: "Result value is mapped to the accepted lab concept",
      title: "Removed A1c result mapping",
      shortReason: "the A1c result value no longer maps to the accepted lab concept",
      details: [
        ["Previously accepted evidence", `A1c result LAB-A1C-${suffix}`],
        ["Removed on", "2026-08-10"],
        ["Dropped condition", "A1c result-value mapping no longer accepted"],
        ["Source", "Lab interface"],
      ],
      note: "The assessment still places the patient in denominator. The removed lab-value mapping caused the numerator fall-out.",
      marker: "The A1c result mapping was removed from accepted numerator evidence, so this criterion is no longer satisfied.",
      source: "Lab + EHR",
      version: "Lab mapping refresh v43",
    };
  }
  const [, secondCriterion] = measureNumeratorCriteria(measure);
  return {
    criteria: secondCriterion,
    title: "Removed numerator evidence",
    shortReason: "previously accepted numerator evidence is no longer present in the calculation",
    details: [
      ["Previously accepted evidence", `Numerator evidence ${suffix}`],
      ["Removed on", "2026-08-10"],
      ["Dropped condition", "Accepted numerator evidence removed from current outcome calculation"],
      ["Source", patientDataSources(patient)],
    ],
    note: "The patient remains denominator eligible, but the removed numerator evidence caused the numerator fall-out.",
    marker: "Previously accepted numerator evidence was removed, so this criterion is no longer satisfied.",
    source: patientDataSources(patient),
    version: "Outcome refresh v43",
  };
}

function statusMovementLabelForPatient(patient, fromStatus, toStatus) {
  if (patient.statusMovementLabel) return patient.statusMovementLabel;
  if (fromStatus === "Numerator" && toStatus === "Denominator") return "Numerator evidence removed";
  if (fromStatus === "Denominator" && toStatus === "Numerator") return "Numerator evidence accepted";
  if (toStatus === "Exclusion") return "Exclusion evidence accepted";
  if (fromStatus === "Initial population" && toStatus === "Denominator") return "Denominator evidence accepted";
  return patient.change === "No change" ? "Interim recalculation" : patient.change;
}

function statusMovementDetailForPatient(patient, fromStatus, toStatus) {
  if (patient.statusMovementDetail) return patient.statusMovementDetail;
  if (fromStatus === "Numerator" && toStatus === "Denominator") {
    return "Previously accepted numerator evidence was removed or no longer maps to accepted measure logic; denominator criteria still pass.";
  }
  if (fromStatus === "Denominator" && toStatus === "Numerator") {
    return "Numerator evidence was accepted into the current calculation and moved the patient to numerator.";
  }
  if (toStatus === "Exclusion") return patient.evidence || "Accepted exclusion evidence moved the patient out of denominator reporting.";
  if (fromStatus === "Initial population" && toStatus === "Denominator") return patient.evidence || "Denominator evidence was accepted after the cohort was locked.";
  return patient.evidence || `Status moved from ${fromStatus} to ${toStatus}.`;
}

function statusMovementSourceForPatient(patient, fallbackSource) {
  return patient.statusMovementSource || fallbackSource;
}

function statusMovementVersionForPatient(patient, fallbackVersion) {
  return patient.statusMovementVersion || fallbackVersion;
}

function patientOutcomeChangeHighlight(patient, measure) {
  const latestMovement = patientLatestStatusMovement(patient);
  if (!latestMovement) return null;
  const current = patientCurrentOutcome(patient);
  const label = measure.measure.toLowerCase();
  if (patient.sourceIssue || current === "Exclusion") {
    return {
      sectionId: "exclusions",
      criteria: "Hospice services rendered",
      marker: `${latestMovement.date} - ${latestMovement.movement}. This exclusion evidence changed the calculated status.`,
    };
  }
  if (latestMovement.from === "Numerator" && latestMovement.status === "Denominator") {
    const removed = removedNumeratorEvidenceForMeasure(measure, patient);
    return {
      sectionId: "numerator",
      criteria: removed.criteria,
      marker: `${latestMovement.date} - ${latestMovement.movement}. ${removed.marker}`,
    };
  }
  if (current === "Numerator" && label.includes("depression")) {
    return {
      sectionId: "numerator",
      criteria: "Follow-up plan documented when screening is positive",
      marker: `${latestMovement.date} - ${latestMovement.movement}. This clinical evidence satisfied this numerator criterion.`,
    };
  }
  if (current === "Numerator") {
    return {
      sectionId: "numerator",
      criteria: measureNumeratorCriteria(measure)[1],
      marker: `${latestMovement.date} - ${latestMovement.movement}. This numerator evidence changed the calculated status.`,
    };
  }
  if (current === "Denominator") {
    return {
      sectionId: "denominator",
      criteria: "Patient qualifies for denominator population",
      marker: `${latestMovement.date} - ${latestMovement.movement}. This denominator evidence changed the calculated status.`,
    };
  }
  return null;
}

function evidenceDetailMarkup(title, details = [], note = "") {
  return `
    <div class="source-evidence-detail">
      <strong>${escapeHtml(title)}</strong>
      <dl>
        ${details.map(([label, value]) => `
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        `).join("")}
      </dl>
      ${note ? `<p>${escapeHtml(note)}</p>` : ""}
    </div>
  `;
}

function sourceIssueEvidenceMarkup(patient) {
  const issue = patient.sourceIssue;
  if (!issue) return "";
  return evidenceDetailMarkup(issue.fact, [
    ["Source", issue.source],
    ["Claim / source ID", issue.sourceId],
    ["Service date", issue.serviceDate],
    ["Received", issue.received],
    ["Rendering organization", issue.organization],
    ["Code", issue.code],
    ["Match logic", issue.matchReason],
  ], issue.issue);
}

function numeratorCriterionRows(patient, measure) {
  const [firstCriterion, secondCriterion] = measureNumeratorCriteria(measure);
  const current = patientCurrentOutcome(patient);
  if (patientHasNumeratorFallout(patient)) {
    const removed = removedNumeratorEvidenceForMeasure(measure, patient);
    const priorEvidence = "Previously satisfied at lock, but no accepted numerator event remains in the current calculation.";
    return [
      criterionRow(firstCriterion, removed.criteria === firstCriterion ? evidenceDetailMarkup(removed.title, removed.details, removed.note) : priorEvidence, removed.criteria === firstCriterion ? "Not satisfied" : "Not evidenced"),
      criterionRow(secondCriterion, removed.criteria === secondCriterion ? evidenceDetailMarkup(removed.title, removed.details, removed.note) : "No accepted evidence supplied.", removed.criteria === secondCriterion ? "Not satisfied" : "Not evidenced"),
    ];
  }
  if (patient.numeratorEvidence?.length) {
    return [
      criterionRow(firstCriterion, numeratorEvidenceForMeasure(measure, patient, 0), "Satisfied"),
      criterionRow(secondCriterion, numeratorEvidenceForMeasure(measure, patient, 1), "Satisfied"),
    ];
  }
  if (current === "Numerator") {
    return [
      criterionRow(firstCriterion, numeratorEvidenceForMeasure(measure, patient, 0), "Satisfied"),
      criterionRow(secondCriterion, numeratorEvidenceForMeasure(measure, patient, 1), "Satisfied"),
    ];
  }
  if (patientIsNearMiss(patient)) {
    return [
      criterionRow(firstCriterion, nearMissEvidenceForMeasure(measure, patient), "Satisfied"),
      criterionRow(secondCriterion, patient.evidence, "Not satisfied"),
    ];
  }
  return [
    criterionRow(firstCriterion, "No accepted evidence supplied.", "Not evidenced"),
    criterionRow(secondCriterion, patient.evidence || "No accepted evidence supplied.", "Not satisfied"),
  ];
}

function numeratorEvidenceForMeasure(measure, patient, index) {
  if (patient.numeratorEvidence?.[index]) {
    const evidence = patient.numeratorEvidence[index];
    return evidenceDetailMarkup(evidence.title, evidence.details, evidence.note);
  }
  const label = measure.measure.toLowerCase();
  if (label.includes("hiv")) return index === 0 ? "HIV screening result on 2026-05-14" : "LOINC 75622-1 mapped to accepted screening result";
  if (label.includes("depression")) return index === 0 ? "PHQ-9 screening on 2026-04-08" : "Follow-up plan SNOMED evidence on 2026-04-08";
  if (label.includes("chlamydia")) return index === 0 ? "Chlamydia NAAT result on 2026-03-22" : "Result linked to qualifying outpatient encounter";
  if (label.includes("blood pressure")) return index === 0 ? "Systolic blood pressure = 135 mmHg on 2026-03-26" : "Diastolic blood pressure = 85 mmHg on 2026-03-26";
  if (label.includes("colorectal")) return index === 0 ? "FIT-DNA result in EHR registry source" : "Screening date within accepted lookback";
  if (label.includes("glycemic")) return index === 0 ? "A1c assessment documented on 2026-06-12" : "A1c result value mapped to accepted lab concept";
  return index === 0 ? patient.evidence : "Accepted source evidence linked to measure logic";
}

function nearMissEvidenceForMeasure(measure, patient) {
  const label = measure.measure.toLowerCase();
  if (label.includes("hiv")) return "External lab screening evidence found";
  if (label.includes("depression")) return "Screening evidence present";
  if (label.includes("chlamydia")) return "Lab evidence found";
  if (label.includes("blood pressure")) return "Controlled BP value found under related encounter";
  if (label.includes("colorectal")) return "Registry screening event found";
  if (label.includes("glycemic")) return "Assessment event present";
  return patient.evidence || "One numerator criterion is evidenced";
}

function patientCriteriaSections(patient, measure) {
  const current = patientCurrentOutcome(patient);
  const isExcluded = current === "Exclusion";
  const isNumerator = current === "Numerator";
  const isNearMiss = patientIsNearMiss(patient);
  const potentialExclusion = patient.opportunity === "Potential exclusion";
  const numeratorRows = numeratorCriterionRows(patient, measure);
  const numeratorSatisfied = numeratorRows.length > 0 && numeratorRows.every((row) => row.result === "Satisfied");
  const exclusionEvidence = patient.sourceIssue
    ? sourceIssueEvidenceMarkup(patient)
    : isExcluded
      ? "Hospice services documented and coded"
      : "No accepted evidence supplied.";
  return [
    {
      id: "initial",
      title: "Initial population",
      logicOperator: "AND",
      status: "Satisfied",
      count: "3 / 3 criteria satisfied",
      tone: "satisfied",
      open: current === "Initial population",
      rows: [
        criterionRow("Patient age is within measure range", `DOB ${patientDob(patient)}; age is in measurement range`, "Satisfied"),
        criterionRow("Has qualifying encounter during measurement period", `Qualifying encounter attributed to ${patient.provider}`, "Satisfied"),
        criterionRow("Meets submitted specialty and program attribution", `${patient.specialty} / ${measure.mvp}`, "Satisfied"),
      ],
    },
    {
      id: "denominator",
      title: "Denominator",
      logicOperator: "AND",
      status: current === "Initial population" ? "Not evidenced" : "Satisfied",
      count: current === "Initial population" ? "0 / 1 criteria satisfied" : "1 / 1 criteria satisfied",
      tone: current === "Initial population" ? "not-evidenced" : "satisfied",
      open: false,
      rows: [
        criterionRow("Patient qualifies for denominator population", current === "Initial population" ? "Denominator-specific evidence is not present." : `${measure.code} denominator criteria are met.`, current === "Initial population" ? "Not evidenced" : "Satisfied"),
      ],
    },
    {
      id: "exclusions",
      title: "Denominator exclusions",
      logicOperator: "OR",
      status: isExcluded ? "Excluded" : potentialExclusion ? "Not satisfied" : "Not evidenced",
      count: isExcluded ? "1 / 6 criteria satisfied" : "0 / 6 criteria satisfied",
      tone: isExcluded ? "excluded" : potentialExclusion ? "not-satisfied" : "not-evidenced",
      open: isExcluded || potentialExclusion,
      rows: [
        criterionRow("Hospice services rendered", exclusionEvidence, isExcluded ? "Satisfied" : "Not evidenced"),
        criterionRow("Pregnancy or renal diagnosis", "No accepted evidence supplied.", "Not evidenced"),
        criterionRow("Advanced illness, frailty, or nursing home criteria", "No accepted evidence supplied.", "Not evidenced"),
        criterionRow("Palliative care in measurement period", potentialExclusion ? patient.evidence : "No accepted evidence supplied.", potentialExclusion ? "Not satisfied" : "Not evidenced"),
      ],
    },
    {
      id: "numerator",
      title: "Numerator",
      logicOperator: "AND",
      status: numeratorSatisfied ? "Satisfied" : isNearMiss ? "Partial" : "Not evidenced",
      count: numeratorSatisfied ? "2 / 2 criteria satisfied" : isNearMiss ? "1 / 2 criteria satisfied" : "0 / 2 criteria satisfied",
      tone: numeratorSatisfied ? "satisfied" : isNearMiss ? "partial" : "not-evidenced",
      open: numeratorSatisfied || current === "Denominator" || isNearMiss,
      rows: numeratorRows,
    },
  ];
}

function renderPatientCriteriaSection(section, options = {}) {
  const highlight = options.highlight;
  const sectionOpen = section.open || highlight?.sectionId === section.id;
  return `
    <details class="smart-criteria-section ${section.tone} ${highlight?.sectionId === section.id ? "status-change-section" : ""}" ${sectionOpen ? "open" : ""}>
      <summary>
        <span>${section.title}</span>
        ${criterionResultBadge(section.status)}
        <strong>${section.count}</strong>
      </summary>
      <table class="smart-criteria-table">
        <colgroup>
          <col class="criteria-col" />
          <col class="evidence-col" />
          <col class="result-col" />
        </colgroup>
        <thead><tr><th>Specification criteria</th><th>Patient evidence</th><th>Result</th></tr></thead>
        <tbody>
          ${section.rows.map((row, index) => {
            const isHighlighted = highlight?.sectionId === section.id && row.criteria === highlight.criteria;
            return `
            ${index > 0 ? `<tr class="criteria-logic-divider" aria-label="${section.logicOperator}"><td colspan="3"><span>${section.logicOperator}</span></td></tr>` : ""}
            <tr class="${isHighlighted ? "status-change-evidence-row" : ""}">
              <td>${row.criteria}</td>
              <td>${row.evidence}${isHighlighted ? `<span class="status-change-marker">${highlight.marker}</span>` : ""}</td>
              <td>${criterionResultBadge(row.result)}</td>
            </tr>
          `;
          }).join("")}
        </tbody>
      </table>
    </details>
  `;
}

function renderNearMissExplanation(patient, measure) {
  const statusChange = patientStatusChangeLabel(patient);
  return `
    <div class="smart-near-miss-panel">
      <div>
        <span class="vision-kicker">Regulatory outcome</span>
        <strong>${patientCurrentOutcome(patient)}</strong>
        <p>This patient is still counted as ${patientCurrentOutcome(patient).toLowerCase()} for ${measure.code}.</p>
      </div>
      <div>
        <span class="vision-kicker">Near-miss signal</span>
        <strong>${patientCriteriaProgress(patient)}</strong>
        <p>${patient.evidence}</p>
      </div>
      <div>
        <span class="vision-kicker">Status change logic</span>
        <strong>${statusChange}</strong>
        <p>Near miss reflects criteria progress inside the same outcome population. It only becomes a status change if the patient moves to Numerator, Exclusion, Initial population, or a different population bucket.</p>
      </div>
    </div>
    ${renderPatientCriteriaSection(patientCriteriaSections(patient, measure).find((section) => section.id === "numerator"))}
  `;
}

function renderSmartInsightsSideRail(patient, measure) {
  const sources = patientDataSources(patient).split(",").map((source) => source.trim()).filter(Boolean);
  return `
    <aside class="smart-insights-side">
      <details class="smart-side-section legend" aria-label="Legend">
        <summary>Legend</summary>
        <div class="smart-legend-row">${criterionResultBadge("Satisfied")}<span>Evidence meets the criterion</span></div>
        <div class="smart-legend-row">${criterionResultBadge("Not satisfied")}<span>Evidence does not meet the criterion</span></div>
        <div class="smart-legend-row">${criterionResultBadge("Not evidenced")}<span>No evidence found</span></div>
      </details>
      <details class="smart-side-section">
        <summary>Key patient data</summary>
        <div class="smart-side-facts">
          <span>Patient ID</span><strong>${patient.patient}</strong>
          <span>MRN</span><strong>${patientMrn(patient)}</strong>
          <span>Provider</span><strong>${patient.provider}</strong>
          <span>Specialty</span><strong>${patient.specialty}</strong>
          <span>Program</span><strong>${measure.mvp}</strong>
        </div>
      </details>
      <details class="smart-side-section">
        <summary>Data sources</summary>
        <div class="source-chip-list">
          ${sources.map((source) => `<span>${source}</span>`).join("")}
        </div>
      </details>
      ${patient.sourceIssue ? renderSourceIssueSideSection(patient) : ""}
    </aside>
  `;
}

function renderSourceIssueSideSection(patient) {
  const issue = patient.sourceIssue;
  return `
    <details class="smart-side-section source-issue-section" open>
      <summary>Source issue</summary>
      <div class="smart-side-facts issue-details">
        <span>Incorrect fact</span><strong>${escapeHtml(issue.fact)}</strong>
        <span>Source</span><strong>${escapeHtml(issue.source)}</strong>
        <span>Service date</span><strong>${escapeHtml(issue.serviceDate)}</strong>
        <span>Source ID</span><strong>${escapeHtml(issue.sourceId)}</strong>
        <span>Why flagged</span><strong>${escapeHtml(issue.matchReason)}</strong>
        <span>Expected fix</span><strong>${escapeHtml(issue.expectedFix)}</strong>
      </div>
    </details>
  `;
}


function renderVisionPatientOutcomePanel(measure, patient, options = {}) {
  const result = patientOverallResult(patient);
  const activeTab = patientIsNearMiss(patient) && state.outcomeExplainTab === "near-miss" ? "near-miss" : "logic";
  return `
    <aside class="patient-outcome-panel smart-insights-panel ${options.standalone ? "standalone" : ""}">
      <div class="smart-insights-titlebar">
        <strong>Smart Insights</strong>
        ${options.dismissible ? `<button class="smart-close-button" data-close-outcome-explanation type="button" aria-label="Close outcome explanation">&times;</button>` : ""}
      </div>
      <div class="smart-insights-summary">
        <div>
          <strong>${patientDisplayName(patient)}</strong>
          <span>DOB: ${patientDob(patient)} · MRN: ${patientMrn(patient)}</span>
        </div>
        <div>
          <span>Measure</span>
          <strong>${measure.code}</strong>
          <em>(${measure.code}) - ${measure.measure}</em>
        </div>
        <div class="smart-overall-result">
          <span>Overall Result</span>
          <strong><span class="smart-result-badge ${result.tone}">${result.label}</span></strong>
          <em>Last Evaluated: 2026-${validationCurrentSnapshotLabel.replace("/", "-")}</em>
        </div>
      </div>
      <div class="patient-outcome-answer final-interpretation">
        <strong>Final Interpretation</strong>
        <p>${patientOutcomeAnswer(patient, measure)}</p>
      </div>
      <div class="outcome-explain-tabs" role="tablist">
        <button class="${activeTab === "logic" ? "active" : ""}" data-outcome-tab="logic" type="button">Outcome logic</button>
        ${patientIsNearMiss(patient) ? `<button class="${activeTab === "near-miss" ? "active" : ""}" data-outcome-tab="near-miss" type="button">Near-miss detail</button>` : ""}
      </div>
      <div class="smart-insights-body">
        <div class="smart-criteria-stack">
          ${activeTab === "near-miss"
            ? renderNearMissExplanation(patient, measure)
            : patientCriteriaSections(patient, measure).map(renderPatientCriteriaSection).join("")}
        </div>
        ${renderSmartInsightsSideRail(patient, measure)}
      </div>
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
  const changeDateDirection = sort === "change-date" && state.patientValidationSortDirection === "asc" ? "asc" : "desc";
  const rows = [...patients];
  const outcomeOrder = { numerator: 0, denominator: 1, exclusion: 2, initial: 3 };
  const expandedPatient = state.expandedOutcomePatient;
  const expandedStatusPatient = state.expandedStatusPatient;
  const expandedSort = (first, second) =>
    Number(second.patient === expandedPatient || second.patient === expandedStatusPatient)
    - Number(first.patient === expandedPatient || first.patient === expandedStatusPatient);
  const changeDateSort = (first, second) => {
    const firstDate = patientLatestStatusChangeDate(first);
    const secondDate = patientLatestStatusChangeDate(second);
    if (Boolean(firstDate) !== Boolean(secondDate)) return firstDate ? -1 : 1;
    const firstValue = statusDateSortValue(firstDate);
    const secondValue = statusDateSortValue(secondDate);
    return changeDateDirection === "asc" ? firstValue - secondValue : secondValue - firstValue;
  };
  if (sort === "patient-id") {
    return rows.sort((first, second) =>
      expandedSort(first, second)
      || patientDisplayName(first).localeCompare(patientDisplayName(second))
      || first.patient.localeCompare(second.patient));
  }
  if (sort === "outcome") {
    return rows.sort((first, second) =>
      expandedSort(first, second)
      || outcomeOrder[patientOutcomeCategory(first)] - outcomeOrder[patientOutcomeCategory(second)]
      || first.patient.localeCompare(second.patient),
    );
  }
  if (sort === "change-date") {
    return rows.sort((first, second) =>
      expandedSort(first, second)
      || changeDateSort(first, second)
      || Number(patientHasStateChange(second)) - Number(patientHasStateChange(first))
      || first.patient.localeCompare(second.patient),
    );
  }
  return rows.sort((first, second) =>
    expandedSort(first, second)
    || Number(patientHasStateChange(second)) - Number(patientHasStateChange(first))
    || changeDateSort(first, second)
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

function expandedValidationPatient(measure) {
  if (!state.expandedOutcomePatient) return null;
  return validationPatientsForMeasure(measure).find((patient) => patient.patient === state.expandedOutcomePatient) || null;
}

function patientValidationPageInfo(patients) {
  const pageSize = selectedPatientValidationPageSize();
  const total = patients.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(Number(state.patientValidationPage) || 1, 1), totalPages);
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  return {
    end,
    page,
    pageSize,
    rows: patients.slice(start, end),
    start,
    total,
    totalPages,
  };
}

function selectedPatientValidationPageSize() {
  const size = Number(state.patientValidationPageSize) || defaultPatientValidationPageSize;
  return patientValidationPageSizeOptions.includes(size) ? size : defaultPatientValidationPageSize;
}

function patientValidationChangeDateOptions(measure) {
  return [...new Set(validationPatientsForMeasure(measure)
    .map(patientLatestStatusChangeDate)
    .filter(Boolean))]
    .sort((first, second) => statusDateSortValue(second) - statusDateSortValue(first));
}

function selectedPatientValidationChangeDate(measure = selectedValidationMeasure()) {
  const selectedDate = state.patientValidationChangeDate || "all";
  if (selectedDate === "all") return "all";
  return patientValidationChangeDateOptions(measure).includes(selectedDate) ? selectedDate : "all";
}

function patientValidationFilterLabel(filter) {
  if (filter === "all") return "selected patients";
  if (filter === "changed") return "patients with status changes";
  return `${patientOutcomeCategoryName(filter).toLowerCase()} patients`;
}

function renderAddValidationPatientPanel(measure) {
  const searchValue = escapeHtml(state.addPatientSearch || "");
  return `
    <div class="validation-add-patient-panel">
      <div class="validation-add-copy">
        <strong>Add validation patient</strong>
        <span>Search the calculated ${measure.code} population by patient name, MRN, patient ID, provider, status, or evidence source.</span>
      </div>
      <div class="validation-add-controls">
        <input type="search" data-add-validation-patient-search value="${searchValue}" placeholder="Morrison, MRN, HY-10977, provider..." />
        <button class="vision-row-button primary" data-add-validation-patient-action="${measure.id}" type="button">Add patient</button>
      </div>
    </div>
  `;
}

function statusDateDisplay(dateText, includeYear = false) {
  const [month, day] = String(dateText || "").split("/").map((part) => Number.parseInt(part, 10));
  const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Math.max(0, Math.min(11, (month || 1) - 1))];
  return includeYear ? `${monthName} ${day || 1}, 2026` : `${monthName} ${day || 1}`;
}

function statusDateFull(dateText) {
  return `${dateText}/2026`;
}

function statusDateDayOfYear(dateText) {
  const [month, day] = String(dateText || "").split("/").map((part) => Number.parseInt(part, 10));
  const daysByMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const safeMonth = Math.max(1, Math.min(12, month || 1));
  const priorDays = daysByMonth.slice(0, safeMonth - 1).reduce((sum, days) => sum + days, 0);
  return priorDays + Math.max(1, Math.min(daysByMonth[safeMonth - 1], day || 1));
}

function statusDateFromDayOfYear(dayOfYear) {
  const daysByMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let remaining = Math.max(1, Math.min(365, dayOfYear));
  let month = 1;
  while (remaining > daysByMonth[month - 1] && month < 12) {
    remaining -= daysByMonth[month - 1];
    month += 1;
  }
  return `${String(month).padStart(2, "0")}/${String(remaining).padStart(2, "0")}`;
}

function statusDateOffset(dateText, days) {
  return statusDateFromDayOfYear(statusDateDayOfYear(dateText) + days);
}

function measureJourneyRangeConfig() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (state.journeyTimelineRange === "full-year") {
    return {
      id: "full-year",
      months,
      startDate: "01/01",
      endDate: "12/31",
      startValue: 1,
      endValue: 365,
      label: "Jan 1 - Dec 31, 2026",
    };
  }

  const [currentMonth] = validationCurrentSnapshotLabel.split("/").map((part) => Number.parseInt(part, 10));
  const startMonth = Math.max(1, currentMonth - 5);
  const startDate = `${String(startMonth).padStart(2, "0")}/01`;
  return {
    id: "six-months",
    months: months.slice(startMonth - 1, currentMonth),
    startDate,
    endDate: validationCurrentSnapshotLabel,
    startValue: statusDateDayOfYear(startDate),
    endValue: statusDateDayOfYear(validationCurrentSnapshotLabel),
    label: `${months[startMonth - 1]} 1 - ${statusDateDisplay(validationCurrentSnapshotLabel)}, 2026`,
  };
}

function statusDateRangePercent(dateText, range) {
  const value = statusDateDayOfYear(dateText);
  const span = Math.max(1, range.endValue - range.startValue);
  return Math.max(3, Math.min(97, 3 + ((value - range.startValue) / span) * 94));
}

function measureJourneyStatusClass(status) {
  const canonical = canonicalOutcomeState(status);
  if (canonical === "Numerator") return "met";
  if (canonical === "Exclusion") return "excluded";
  if (canonical === "Initial population") return "neutral";
  return "open";
}

function measureJourneyStatusText(status) {
  const canonical = canonicalOutcomeState(status);
  if (canonical === "Numerator") return "Numerator";
  if (canonical === "Exclusion") return "Excluded";
  if (canonical === "Initial population") return "Initial population";
  return "Denominator";
}

function measureJourneyDotLabel(event) {
  if (event.locked) return "L";
  if (event.accepted) return "✓";
  return event.changed ? "" : "•";
}

function measureJourneyEvents(patient, options = {}) {
  const includeLocking = options.includeLocking !== false;
  return measureJourneyTimelineRows(patient, { includeLocking })
    .filter((event, index) => index === 0 || event.changed || (includeLocking && (event.locked || event.accepted)))
    .map((event) => includeLocking ? event : { ...event, accepted: false, locked: false });
}

function measureJourneyTimelineRows(patient, options = {}) {
  const includeLocking = options.includeLocking !== false;
  const rows = patientStatusTimelineRows(patient);
  if (!includeLocking || !rows[0]?.locked) return rows;

  const lockEvent = rows[0];
  const lockStatus = canonicalOutcomeState(lockEvent.status);
  const baselineDate = statusDateOffset(lockEvent.date, -56);
  const denominatorDate = statusDateOffset(lockEvent.date, -28);
  const baseline = {
    date: baselineDate,
    status: "Initial population",
    label: "Measurement-period baseline",
    detail: "Patient was present in the attributed population before denominator criteria were met.",
    source: "Attribution roster",
    version: "Outcome baseline",
    locked: false,
    accepted: false,
    changed: false,
    from: "Initial population",
    movement: "Measurement baseline",
  };
  const denominator = {
    date: denominatorDate,
    status: "Denominator",
    label: "Denominator criteria met",
    detail: "Qualifying denominator evidence moved the patient from initial population to denominator.",
    source: patientDataSources(patient),
    version: "Pre-lock outcome snapshot",
    locked: false,
    accepted: false,
    changed: true,
    from: "Initial population",
    movement: "Initial population -> Denominator",
  };
  const prefix = [baseline, denominator];
  let priorStatus = "Denominator";

  if (lockStatus !== "Denominator") {
    const preLockDate = statusDateOffset(lockEvent.date, -14);
    prefix.push({
      date: preLockDate,
      status: lockStatus,
      label: `${measureJourneyStatusText(lockStatus)} criteria met`,
      detail: `Accepted evidence moved the patient from Denominator to ${measureJourneyStatusText(lockStatus)} before validation lock.`,
      source: patientDataSources(patient),
      version: "Pre-lock outcome snapshot",
      locked: false,
      accepted: false,
      changed: true,
      from: priorStatus,
      movement: `${priorStatus} -> ${lockStatus}`,
    });
    priorStatus = lockStatus;
  }

  return [
    ...prefix,
    { ...lockEvent, changed: priorStatus !== lockStatus, from: priorStatus },
    ...rows.slice(1),
  ];
}

function measureJourneySegments(patient, range, options = {}) {
  const currentValue = statusDateDayOfYear(validationCurrentSnapshotLabel);
  const dataEndValue = Math.min(range.endValue, currentValue);
  const dataEndDate = dataEndValue === range.endValue ? range.endDate : validationCurrentSnapshotLabel;
  const statusEvents = measureJourneyTimelineRows(patient, options).filter((event, index) => index === 0 || event.changed);
  const beforeRange = [...statusEvents].reverse().find((event) => statusDateDayOfYear(event.date) <= range.startValue);
  const visibleEvents = statusEvents.filter((event) => {
    const value = statusDateDayOfYear(event.date);
    return value > range.startValue && value <= dataEndValue;
  });
  const starts = beforeRange
    ? [{ ...beforeRange, date: range.startDate, boundary: true }, ...visibleEvents]
    : visibleEvents;
  const segments = [];

  if (!beforeRange && starts.length && statusDateDayOfYear(starts[0].date) > range.startValue) {
    segments.push({ startDate: range.startDate, endDate: starts[0].date, status: "No snapshot", label: "No snapshot", tone: "neutral" });
  }

  starts.forEach((event, index) => {
    const next = starts[index + 1];
    segments.push({
      startDate: event.date,
      endDate: next?.date || dataEndDate,
      status: event.status,
      label: measureJourneyStatusText(event.status),
      tone: measureJourneyStatusClass(event.status),
    });
  });
  if (dataEndValue < range.endValue) {
    segments.push({ startDate: validationCurrentSnapshotLabel, endDate: range.endDate, status: "Not yet observed", label: "Not yet observed", tone: "future" });
  }
  return segments;
}

function measureJourneyEventSubtitle(event) {
  if (event.locked) return measureJourneyStatusText(event.status);
  if (event.accepted) return "Accepted baseline";
  return event.label || event.movement;
}

function measureJourneyTimelineEventLabel(event, index) {
  if (event.locked) return "Locked";
  if (event.accepted) return "Accepted";
  if (event.changed) return String(event.movement || "Status changed").replace(/ -> /g, " &rarr; ");
  return index === 0 ? "Baseline" : measureJourneyStatusText(event.status);
}

function renderMeasureJourneyTimeline(patient, options = {}) {
  const range = measureJourneyRangeConfig();
  const includeLocking = options.includeLocking !== false;
  const events = measureJourneyEvents(patient, { includeLocking }).filter((event) => {
    const value = statusDateDayOfYear(event.date);
    return value >= range.startValue && value <= range.endValue;
  });
  const segments = measureJourneySegments(patient, range, { includeLocking });
  const hasCurrentBoundarySegment = segments.some((segment) =>
    segment.startDate === validationCurrentSnapshotLabel && segment.tone !== "future");
  const latestMovement = [...events].reverse().find((event) => event.changed) || null;
  const changeCount = events.filter((event) => event.changed).length;
  return `
    <section class="measure-journey-timeline-panel">
      <div class="measure-journey-panel-header">
        <h4>Status changes</h4>
        <div class="measure-journey-range-controls">
          <span>${range.label}</span>
          <div class="measure-journey-range-toggle" role="group" aria-label="Timeline range">
            <button class="${range.id === "six-months" ? "active" : ""}" data-journey-range="six-months" type="button">Last 6 months</button>
            <button class="${range.id === "full-year" ? "active" : ""}" data-journey-range="full-year" type="button">Full measurement period</button>
          </div>
        </div>
      </div>
      <div class="measure-journey-timeline" aria-label="Patient status changes from ${range.label}">
        <div class="measure-journey-months" style="--journey-month-count:${range.months.length}" aria-hidden="true">
          ${range.months.map((month) => `<span>${month}</span>`).join("")}
        </div>
        <div class="measure-journey-track" style="--journey-month-count:${range.months.length}">
          ${segments.map((segment) => {
            const isCurrentEnd = range.id === "six-months" && segment.endDate === validationCurrentSnapshotLabel;
            const isCurrentSegment = isCurrentEnd && segment.startDate === validationCurrentSnapshotLabel && segment.tone !== "future";
            const start = isCurrentSegment ? 91.5 : statusDateRangePercent(segment.startDate, range);
            const end = isCurrentSegment || (isCurrentEnd && !hasCurrentBoundarySegment)
              ? 100
              : isCurrentEnd ? 91.5 : statusDateRangePercent(segment.endDate, range);
            const width = Math.max(2.5, end - start);
            const contextLabel = segment.status === "No snapshot"
              ? "No earlier snapshot"
              : segment.status === "Not yet observed" ? segment.label : "";
            return `<span class="measure-journey-segment ${segment.tone}" style="left:${start}%;width:${width}%" title="${segment.label}">${contextLabel ? `<span class="measure-journey-segment-label">${contextLabel}</span>` : ""}</span>`;
          }).join("")}
          ${events.map((event, index) => {
            const isLatest = latestMovement && event.changed && event.date === latestMovement.date && event.status === latestMovement.status;
            const position = range.id === "six-months" && event.date === validationCurrentSnapshotLabel
              ? 91.5
              : statusDateRangePercent(event.date, range);
            const edgeClass = position < 5 ? "edge-start" : position > 95 ? "edge-end" : "";
            const markerTone = event.locked ? "lock" : measureJourneyStatusClass(event.status);
            const eventLabel = measureJourneyTimelineEventLabel(event, index);
            const laneClass = event.locked || (!event.changed && !isLatest) ? "upper" : isLatest ? "lower" : index % 2 ? "lower" : "upper";
            return `
              <div class="measure-journey-event ${laneClass} ${event.locked ? "lock-event" : ""} ${isLatest ? "latest" : ""} ${event.changed ? "status-change" : "context-event"} ${edgeClass}" style="left:${position}%">
                ${isLatest ? `<span class="measure-journey-transition-status incoming">${measureJourneyStatusText(event.from)}</span><span class="measure-journey-transition-status outgoing">${measureJourneyStatusText(event.status)}</span>` : ""}
                <span class="measure-journey-dot ${markerTone}">${isLatest ? "" : measureJourneyDotLabel(event)}</span>
                ${isLatest
                  ? `<button class="measure-journey-event-copy measure-journey-event-link measure-journey-selected-link" data-jump-to-changed-criteria type="button" aria-label="Open evidence for ${event.movement} on ${statusDateDisplay(event.date)}"><strong>${statusDateDisplay(event.date)}</strong><em>${eventLabel}</em><span>Evidence &darr;</span></button>`
                  : event.changed
                    ? `<button class="measure-journey-event-copy measure-journey-event-link" data-toast="Supporting evidence opened" type="button" aria-label="Open evidence for ${event.movement} on ${statusDateDisplay(event.date)}"><strong>${statusDateDisplay(event.date)}</strong><em>${eventLabel}</em><span>Evidence &darr;</span></button>`
                    : `<span class="measure-journey-event-copy" title="${event.movement || measureJourneyEventSubtitle(event)}"><strong>${statusDateDisplay(event.date)}</strong><em>${eventLabel}</em></span>`}
              </div>
            `;
          }).join("")}
        </div>
      </div>
      <div class="measure-journey-legend">
        <span><i class="open"></i>Denominator</span>
        <span><i class="met"></i>Numerator</span>
        <span><i class="excluded"></i>Excluded</span>
        ${range.id === "full-year" ? `<span><i class="future"></i>Not yet observed</span>` : ""}
        <strong>${changeCount} status ${changeCount === 1 ? "change" : "changes"} tracked</strong>
      </div>
    </section>
  `;
}

function compactCriteriaCount(count) {
  return String(count || "").replace(" criteria satisfied", "").trim();
}

function measureJourneySectionCount(section, highlight, movement) {
  if (!highlight || highlight.sectionId !== section.id || !movement) return compactCriteriaCount(section.count);
  if (section.id === "numerator" && movement.from === "Denominator" && movement.status === "Numerator") return "1 / 2 -> 2 / 2";
  if (section.id === "numerator" && movement.from === "Numerator" && movement.status === "Denominator") return "2 / 2 -> 1 / 2";
  if (section.id === "exclusions" && movement.status === "Exclusion") return "0 / 6 -> 1 / 6";
  if (section.id === "denominator" && movement.from === "Initial population" && movement.status === "Denominator") return "0 / 1 -> 1 / 1";
  return compactCriteriaCount(section.count);
}

function renderMeasureJourneyCriteriaSection(section, options = {}) {
  const { highlight, movement } = options;
  const isChangedSection = highlight?.sectionId === section.id;
  const sectionOpen = section.open || isChangedSection;
  return `
    <details class="journey-criteria-section ${section.tone} ${isChangedSection ? "changed" : ""}" ${sectionOpen ? "open" : ""}>
      <summary>
        <span class="journey-chevron" aria-hidden="true">›</span>
        <strong>${section.title}</strong>
        ${isChangedSection ? `<span class="journey-change-chip"><span>1</span>Changed ${movement?.date || "today"}</span>` : ""}
        ${criterionResultBadge(section.status)}
        <span class="journey-section-count">${measureJourneySectionCount(section, highlight, movement)}</span>
      </summary>
      <table class="journey-criteria-table">
        <thead><tr><th>Measure criterion</th><th>Patient evidence</th><th>Result</th></tr></thead>
        <tbody>
          ${section.rows.map((row, index) => {
            const isHighlighted = isChangedSection && row.criteria === highlight.criteria;
            return `
              ${index > 0 ? `<tr class="criteria-logic-divider" aria-label="${section.logicOperator}"><td colspan="3"><span>${section.logicOperator}</span></td></tr>` : ""}
              <tr class="${isHighlighted ? "caused-change" : ""}">
                <td>${isHighlighted ? `<span class="journey-caused-label"><span>1</span>Status changed here</span>` : ""}${row.criteria}</td>
                <td>${row.evidence}${isHighlighted ? `<button class="grid-link journey-supporting-evidence" data-toast="Supporting evidence opened" type="button">View supporting evidence</button>` : ""}</td>
                <td>${criterionResultBadge(row.result)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </details>
  `;
}

function renderMeasureJourneySelectedChange(patient, measure, options = {}) {
  const includeAccept = options.includeAccept !== false;
  const includeLocking = options.includeLocking !== false;
  const movement = patientLatestStatusMovement(patient);
  const activeChange = includeAccept ? patientLatestStatusChange(patient) : null;
  const accepted = includeLocking ? acceptedValidationChangeForPatient(patient) : null;
  const hasSelectedChange = Boolean(accepted || movement);
  const selectedMovement = accepted
    ? { date: accepted.acceptedDate, movement: `${accepted.originalLockedState} -> ${accepted.status}`, detail: accepted.reason, status: accepted.status }
    : movement || { date: validationCurrentSnapshotLabel, movement: `Current status: ${patientCurrentOutcome(patient)}`, detail: "Current calculation matches the tracked status.", status: patientCurrentOutcome(patient) };
  const highlight = patientOutcomeChangeHighlight(patient, measure);
  const sections = patientCriteriaSections(patient, measure);
  return `
    <section class="measure-journey-change-panel">
      <div class="measure-journey-change-heading">
        <div class="measure-journey-change-title">
          ${hasSelectedChange ? `<span class="measure-journey-change-index" aria-hidden="true">1</span>` : ""}
          <div>
            <h4>${hasSelectedChange ? `${selectedMovement.date} · ${selectedMovement.movement}` : `Current status · ${patientCurrentOutcome(patient)}`}</h4>
          </div>
        </div>
        <div class="measure-journey-change-actions">
          <button class="grid-link" data-expand-journey-criteria type="button">Expand all</button>
          ${includeAccept && activeChange
            ? `<button class="vision-row-button primary" data-accept-status-change="${measure.id}:${patient.patient}" type="button">Accept change</button>`
            : includeAccept && accepted ? `${visionBadge("Accepted", "good")}` : ""}
        </div>
      </div>
      <div class="journey-criteria-stack">
        ${sections.map((section) => renderMeasureJourneyCriteriaSection(section, { highlight, movement })).join("")}
      </div>
    </section>
  `;
}

function renderPatientStatusTimelinePanel(patient, measure = selectedValidationMeasure()) {
  const rows = patientStatusTimelineRows(patient).filter((event, index) => index === 0 || event.changed || event.locked || event.accepted);
  const activeChange = patientLatestStatusChange(patient);
  const latestMovement = patientLatestStatusMovement(patient);
  const highlight = patientOutcomeChangeHighlight(patient, measure);
  const result = patientOverallResult(patient);
  return `
    <div class="status-history-panel compact-status-history">
      <div class="status-history-label">
        <strong>Status history through measurement period</strong>
        <span>Baseline, validation lock, true status changes, and accepted baselines only.</span>
      </div>
      <table class="status-history-table">
        <thead>
          <tr><th>Date</th><th>Calculated status</th><th>Status change</th><th>Reason</th><th>Source / version</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${rows.map((event) => {
            const isLatestMovement = latestMovement && event.changed && event.date === latestMovement.date && event.status === latestMovement.status;
            return `
            <tr class="${event.accepted ? "accepted" : event.changed ? "changed" : ""} ${isLatestMovement ? "latest-change" : ""}">
              <td><strong>${event.date}</strong></td>
              <td>${visionBadge(event.status, outcomeStatusTone(event.status))}</td>
              <td><strong>${event.movement}</strong></td>
              <td>${event.label}<span class="subline">${event.detail}</span></td>
              <td>${event.source}<span class="subline">${event.version}</span></td>
              <td>
                ${activeChange && event.date === activeChange.date && event.status === activeChange.status
                  ? `<button class="grid-link primary" data-accept-status-change="${measure.id}:${patient.patient}" type="button">Accept change</button>`
                  : event.accepted ? `${visionBadge("Accepted", "good")}<span class="subline">New locked status</span>` : ""}
              </td>
            </tr>
            ${isLatestMovement ? `
              <tr class="status-change-context-row">
                <td colspan="6">
                  <div class="status-change-context-card">
                    <div class="status-change-context-heading">
                      <div>
                        <span class="vision-kicker">Current outcome explainability</span>
                        <strong>${measure.code} - ${measure.measure}</strong>
                        <em>${patientDisplayName(patient)} · ${patientMrn(patient)} · Evaluated ${validationCurrentSnapshotLabel}</em>
                      </div>
                      <span class="smart-result-badge ${result.tone}">${result.label}</span>
                    </div>
                    <div class="smart-criteria-stack status-change-criteria-stack">
                      ${patientCriteriaSections(patient, measure)
                        .map((section) => renderPatientCriteriaSection(section, { highlight }))
                        .join("")}
                    </div>
                  </div>
                </td>
              </tr>
            ` : ""}
          `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderValidationStatusDrawerHeader(patient, measure, result) {
  const latestMovement = patientLatestStatusMovement(patient);
  const accepted = acceptedValidationChangeForPatient(patient);
  const latestDate = accepted ? accepted.acceptedDate : latestMovement?.date || validationCurrentSnapshotLabel;
  const latestMovementLabel = accepted
    ? `${accepted.originalLockedState} -> ${accepted.status}`
    : latestMovement?.movement || "No status change";
  const latestDetail = accepted
    ? accepted.reason
    : latestMovement?.detail || "Current calculation matches the locked validation status.";
  const latestSource = accepted
    ? accepted.acceptedBy || "Quality manager"
    : latestMovement?.source || patientDataSources(patient);
  const latestVersion = accepted
    ? "Accepted validation baseline"
    : latestMovement?.version || "Current outcome snapshot";
  return `
    <div class="status-drawer-summary">
      <div class="status-drawer-identity">
        <span class="vision-kicker">Patient status detail</span>
        <strong>${patientDisplayName(patient)} / ${patientMrn(patient)}</strong>
        <em>${patient.patient} · ${measure.code} - ${measure.measure}</em>
      </div>
      <div class="status-change-focus ${latestMovement || accepted ? "changed" : ""}">
        <span>${accepted ? "Accepted status change" : latestMovement ? "Latest status change" : "Current status"}</span>
        <strong>${latestDate} · ${latestMovementLabel}</strong>
        <em>${latestDetail}</em>
        ${patientStatusMovementFlag(patient)}
      </div>
      <div class="status-drawer-actions">
        <span class="smart-result-badge ${result.tone}">${result.label}</span>
        <button class="smart-close-button quality-detail-dismiss" data-close-outcome-explanation type="button" aria-label="Collapse patient detail" title="Collapse patient detail">&times;</button>
      </div>
    </div>
    <div class="status-lock-strip">
      <div>
        <span>Locked</span>
        <strong>${patientOriginalLockedSnapshot(patient)}</strong>
        <em>${patientOriginalLockedOutcome(patient)}</em>
      </div>
      <div>
        <span>Current</span>
        <strong>${validationCurrentSnapshotLabel}</strong>
        <em>${patientCurrentOutcome(patient)}</em>
      </div>
      <div>
        <span>Source / version</span>
        <strong>${latestSource}</strong>
        <em>${latestVersion}</em>
      </div>
    </div>
  `;
}

function renderMeasureJourneyDetail(patient, measure, options = {}) {
  const contextClass = options.contextClass || "";
  const includeAccept = options.includeAccept !== false;
  const includeLocking = options.includeLocking !== false;
  return `
    <div class="status-movement-review-panel validation-status-drawer measure-journey-detail ${contextClass}">
      <section class="measure-journey-hero">
        <div>
          <h3>${measure.measure}</h3>
          <p>${measure.code} · ${patientDisplayName(patient)} · ${patientMrn(patient)}</p>
        </div>
        <div class="measure-journey-current">
          <span>Illustrative data</span>
          <strong class="${measureJourneyStatusClass(patientCurrentOutcome(patient))}">${measureJourneyStatusText(patientCurrentOutcome(patient))}</strong>
          <em>Current as of ${statusDateFull(validationCurrentSnapshotLabel)}</em>
        </div>
        <button class="smart-close-button quality-detail-dismiss" data-close-outcome-explanation type="button" aria-label="Collapse patient detail" title="Collapse patient detail">&times;</button>
      </section>
      ${renderMeasureJourneyTimeline(patient, { includeLocking })}
      ${renderMeasureJourneySelectedChange(patient, measure, { includeAccept, includeLocking })}
    </div>
  `;
}

function renderStatusMovementExplainabilityPanel(patient, measure = selectedValidationMeasure()) {
  return renderMeasureJourneyDetail(patient, measure);
}

function renderPatientValidationSortHeader(sortKey, label) {
  const active = state.patientValidationSort === sortKey;
  const direction = state.patientValidationSortDirection === "asc" ? "ascending" : "descending";
  const indicator = active ? (state.patientValidationSortDirection === "asc" ? "↑" : "↓") : "↕";
  return `
    <button
      class="table-sort-button ${active ? "active" : ""}"
      data-validation-sort-column="${sortKey}"
      type="button"
      aria-label="Sort ${label} ${active && direction === "descending" ? "ascending" : "descending"}"
    >
      <span>${label}</span>
      <span class="sort-indicator" aria-hidden="true">${indicator}</span>
    </button>
  `;
}

function renderInlinePatientValidationPane(selected, visiblePatients, filterCounts, activeFilter, selectedTotal) {
  const expandedStatusPatient = validationPatientsForMeasure(selected).find((patient) => patient.patient === state.expandedStatusPatient);
  const changeDateOptions = patientValidationChangeDateOptions(selected);
  const activeChangeDate = selectedPatientValidationChangeDate(selected);
  const pageInfo = patientValidationPageInfo(visiblePatients);
  const pageRows = pageInfo.rows;
  const rangeStart = pageInfo.total ? pageInfo.start + 1 : 0;
  const rangeLabel = `${rangeStart}-${pageInfo.end} of ${pageInfo.total}`;
  return `
    <div class="inline-patient-validation-pane" aria-live="polite">
      <div class="selected-patient-header inline">
        <div>
          <span class="vision-kicker">Selected patient population</span>
          <h3>${selected.measure}</h3>
          <p>${selected.code} · ${selected.mvp} · ${selectedTotal} patients selected for validation</p>
        </div>
        <div class="validation-snapshot-note">
          <span>Frozen cohorts</span>
          <strong>May-Jul baselines</strong>
          <em>Status changes through ${validationCurrentSnapshotLabel}</em>
        </div>
      </div>
      ${renderAddValidationPatientPanel(selected)}
      <div class="validation-worklist-controls">
        <div class="validation-filter-group" aria-label="Patient validation filters">
          ${renderPatientValidationFilterButton("all", "All selected", filterCounts.all, true)}
          ${renderPatientValidationFilterButton("changed", "Status changed", filterCounts.changed, true)}
          ${renderPatientValidationFilterButton("numerator", "Numerator", filterCounts.numerator, true)}
          ${renderPatientValidationFilterButton("denominator", "Denominator", filterCounts.denominator, true)}
          ${renderPatientValidationFilterButton("exclusion", "Exclusion", filterCounts.exclusion, true)}
        </div>
        <div class="validation-table-controls">
          <label class="validation-sort-control">
            <span>Change date</span>
            <select data-validation-change-date>
              <option value="all" ${activeChangeDate === "all" ? "selected" : ""}>All dates</option>
              ${changeDateOptions.map((date) => `<option value="${date}" ${activeChangeDate === date ? "selected" : ""}>${date}</option>`).join("")}
            </select>
          </label>
          <label class="validation-sort-control">
            <span>Rows</span>
            <select data-validation-page-size>
              ${patientValidationPageSizeOptions.map((size) => `<option value="${size}" ${selectedPatientValidationPageSize() === size ? "selected" : ""}>${size}</option>`).join("")}
            </select>
          </label>
          <label class="validation-sort-control">
            <span>Sort</span>
            <select data-validation-sort>
              <option value="changed-first" ${state.patientValidationSort === "changed-first" ? "selected" : ""}>Status changed first</option>
              <option value="change-date" ${state.patientValidationSort === "change-date" ? "selected" : ""}>Change date</option>
              <option value="outcome" ${state.patientValidationSort === "outcome" ? "selected" : ""}>Outcome population</option>
              <option value="patient-id" ${state.patientValidationSort === "patient-id" ? "selected" : ""}>Patient name</option>
            </select>
          </label>
        </div>
      </div>
      <div class="inline-patient-table-scroll">
        <table class="vision-table selected-patient-table validation-queue-table resizable-data-grid">
          <thead><tr><th>Patient</th><th>MRN</th><th>Provider</th><th>Specialty</th><th>Locked status</th><th>Current status</th><th>${renderPatientValidationSortHeader("change-date", "Change date")}</th><th>Status summary</th><th>Evidence summary</th></tr></thead>
          <tbody>
            ${pageRows.length ? pageRows.map((row) => {
              const changeDateDisplay = patientValidationChangeDateDisplay(row);
              return `
                <tr class="${patientHasStateChange(row) ? "state-changed" : ""} ${expandedStatusPatient?.patient === row.patient ? "selected-patient-row" : ""}">
                  <td><strong title="${escapeHtml(patientDisplayName(row))}">${patientDisplayName(row)}</strong><span class="subline">${row.patient}${row.added ? " · Added" : ""}</span></td>
                  <td><strong>${patientMrn(row)}</strong></td>
                  <td><strong title="${escapeHtml(row.provider)}">${row.provider}</strong></td>
                  <td><span title="${escapeHtml(row.specialty)}">${row.specialty}</span></td>
                  <td><strong>${patientLockedOutcome(row)}</strong><span class="subline">${patientLockedStatusSubline(row)}</span></td>
                  <td><strong>${patientCurrentOutcome(row)}</strong>${patientIsNearMiss(row) ? `<span class="subline">Near miss</span>` : ""}<span class="subline">${validationCurrentSnapshotLabel}</span></td>
                  <td><strong>${changeDateDisplay.date}</strong><span class="subline">${changeDateDisplay.label}</span></td>
                  <td><button class="grid-link status-movement-link ${state.expandedStatusPatient === row.patient ? "active" : ""}" data-open-status-movement="${row.patient}" title="${escapeHtml(patientStatusTimelineText(row))}" type="button">${patientStatusChangeLabel(row)}</button>${patientStatusMovementFlag(row)}<span class="subline">${patientStatusMovementSubline(row)}</span></td>
                  <td><span class="evidence-summary" title="${escapeHtml(row.evidence)}">${row.evidence}</span><span class="subline" title="${escapeHtml(patientDataSources(row))}">Sources: ${patientDataSources(row)}</span></td>
                </tr>
                ${expandedStatusPatient?.patient === row.patient ? `
                  <tr class="patient-status-detail-row">
                    <td colspan="9">
                      ${renderStatusMovementExplainabilityPanel(row, selected)}
                    </td>
                  </tr>
                ` : ""}
            `;
            }).join("") : `
              <tr><td colspan="9"><div class="empty-state">No patients match this outcome filter.</div></td></tr>
            `}
          </tbody>
        </table>
      </div>
      <div class="patient-table-pager">
        <span>Showing ${rangeLabel} ${patientValidationFilterLabel(activeFilter)} · ${pageInfo.pageSize} rows/page</span>
        <div>
          <button class="vision-row-button" data-validation-page="${pageInfo.page - 1}" ${pageInfo.page <= 1 ? "disabled" : ""} type="button">Previous</button>
          <button class="vision-row-button" data-validation-page="${pageInfo.page + 1}" ${pageInfo.page >= pageInfo.totalPages ? "disabled" : ""} type="button">Next</button>
        </div>
      </div>
    </div>
  `;
}

function renderValidationMeasurePicker(selected) {
  return `
    <label class="validation-measure-picker">
      <span>Measure</span>
      <select data-validation-measure-select>
        ${visionValidationPatientMeasures.map((measure) => `
          <option value="${measure.id}" ${measure.id === selected.id ? "selected" : ""}>${measure.measure} (${measure.code})</option>
        `).join("")}
      </select>
    </label>
  `;
}

function renderValidationMeasureOverviewTable() {
  const activeFilter = state.patientValidationFilter || "all";
  return `
    <table class="vision-table validation-measure-overview-table resizable-data-grid">
      <thead>
        <tr>
          <th>Measure</th>
          <th>Selected</th>
          <th>Status changes</th>
          <th>Numerator</th>
          <th>Denominator</th>
          <th>Exclusion</th>
          <th>Latest change</th>
          <th>Primary validation focus</th>
        </tr>
      </thead>
      <tbody>
        ${visionValidationPatientMeasures.map((measure) => {
          const counts = patientValidationFilterCounts(measure);
          const signal = validationSignalForMeasure(measure);
          const latestChangeDate = patientValidationChangeDateOptions(measure)[0] || "-";
          const isExpanded = state.expandedValidationMeasure === measure.id;
          const visiblePatients = isExpanded ? patientValidationRowsForMeasure(measure) : [];
          return `
            <tr class="${isExpanded ? "selected" : ""}" data-validation-measure-row="${measure.id}" tabindex="0" aria-expanded="${isExpanded ? "true" : "false"}" title="${isExpanded ? "Collapse validation population" : "Open validation population"}">
              <td>
                <div class="measure-row-entry">
                  <button class="row-disclosure-button" data-validation-measure-toggle="${measure.id}" type="button" aria-label="${isExpanded ? "Collapse" : "Open"} ${measure.measure}" aria-expanded="${isExpanded ? "true" : "false"}">
                    <span class="row-disclosure" aria-hidden="true"></span>
                  </button>
                  <div>
                    <strong>${measure.measure}</strong>
                    <span class="subline">${measure.code} / ${measure.mvp}</span>
                  </div>
                </div>
              </td>
              <td class="numeric"><strong>${counts.all}</strong></td>
              <td class="numeric"><strong>${counts.changed}</strong></td>
              <td class="numeric">${counts.numerator}</td>
              <td class="numeric">${counts.denominator}</td>
              <td class="numeric">${counts.exclusion}</td>
              <td><strong>${latestChangeDate}</strong><span class="subline">${counts.changed ? "Status movement" : "No movement"}</span></td>
              <td><strong>${signal.risk}</strong><span class="subline">${signal.rationale}</span></td>
            </tr>
            ${isExpanded ? `
              <tr class="validation-measure-detail-row">
                <td colspan="8">
                  ${renderInlinePatientValidationPane(measure, visiblePatients, counts, activeFilter, counts.all)}
                </td>
              </tr>
            ` : ""}
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

function renderVisionValidationTrackingTab() {
  return `
    <article class="vision-card patient-validation-workspace validation-tracking-workspace compact-patient-validation">
      <div class="validation-tracking-topbar">
        <div>
          <span class="vision-kicker">Validation population tracking</span>
          <h3>Selected patients by measure</h3>
          <p>Track the locked validation cohort, filter by outcome status or status movement, add known patients, and explain any patient outcome.</p>
        </div>
      </div>
      ${renderValidationMeasureOverviewTable()}
    </article>
  `;
}

function renderVisionSelectedPatientsTab() {
  return renderVisionValidationTrackingTab();
}

function renderVisionPopulationValidationTab() {
  return renderVisionQualityPerformanceTab();
}

function renderVisionAttestationTrendsTab() {
  return renderVisionPopulationValidationTab();
}

function renderVisionTrendingQualityTab() {
  return renderVisionPopulationValidationTab();
}


function renderVisionValidationPlanTab() {
  const totalSelected = visionValidationPatientMeasures.reduce((sum, measure) => sum + validationPatientsForMeasure(measure).length, 0);
  const belowTarget = visionValidationPatientMeasures.filter((measure) => currentTrendValue(measure.id) < qualityTargetFor(measure.id)).length;
  return `
    <div class="vision-grid-4">
      <article class="vision-card"><span class="vision-kicker">Submitted measures</span><strong class="vision-metric">6</strong><p>Across the selected MVP + APP Plus mix</p></article>
      <article class="vision-card"><span class="vision-kicker">Eligible patients</span><strong class="vision-metric">${totalSelected.toLocaleString()}</strong><p>Across full measure populations</p></article>
      <article class="vision-card"><span class="vision-kicker">Comparison window</span><strong class="vision-metric">${validationPriorSnapshotLabel} -> ${validationCurrentSnapshotLabel}</strong><p>Prior state vs. current state</p></article>
      <article class="vision-card"><span class="vision-kicker">Below target</span><strong class="vision-metric danger">${belowTarget}</strong><p>Measures needing closer review</p></article>
    </div>
    <div class="validation-method-grid spaced">
      <article class="vision-card">
        <div class="vision-section-title">
          <span class="vision-kicker">Validation plan</span>
          <h3>Freeze the selected population and reconcile outcome movement</h3>
          <p>The customer validates the full eligible population for each submitted measure, then uses the same population to review changes after data, mapping, or logic updates.</p>
        </div>
        <table class="vision-table">
          <thead><tr><th>Measure</th><th>Program</th><th>Eligible patients</th><th>Satisfaction rate</th><th>WoW change</th><th>Target</th><th>Status</th></tr></thead>
          <tbody>
            ${visionValidationPatientMeasures.map((measure) => {
              const trend = attestationTrendFor(measure.id);
              const target = qualityTargetFor(measure.id);
              const status = currentTrendValue(measure.id) >= target ? "On target" : "Needs review";
              return `
              <tr>
                <td><strong>${measure.measure}</strong><span class="subline">${measure.code}</span></td>
                <td>${measure.mvp}</td>
                <td>${validationPatientsForMeasure(measure).length.toLocaleString()}</td>
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
  content.classList.add("vision-mode-content");
  sidebar.innerHTML = "";
  content.innerHTML = `
    <section class="design-lab-canvas vision-canvas">
      ${renderVisionPlatform()}
    </section>
  `;
  content.querySelectorAll("[data-open-production]").forEach((button) => {
    button.addEventListener("click", () => {
      state.labMode = "production";
      applyScenario(button.dataset.openProduction, true);
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
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
      scrollExpandedOutcomeIntoView();
    });
  });
  content.querySelectorAll("[data-validation-changes]").forEach((button) => {
    button.addEventListener("click", () => {
      const signal = validationSignalForMeasure(button.dataset.validationChanges);
      focusValidationMeasure(button.dataset.validationChanges, {
        filter: "changed",
        patientId: signal.spotlightPatient,
        openStatus: Boolean(signal.spotlightPatient),
      });
      state.visionValidationTab = "patient-level";
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
      if (state.expandedStatusPatient) scrollExpandedOutcomeIntoView();
    });
  });
  content.querySelectorAll("[data-quality-population]").forEach((button) => {
    button.addEventListener("click", () => {
      const measureId = button.dataset.qualityPopulation;
      state.openQualityPopulationMeasure = measureId;
      state.selectedValidationMeasure = measureId;
      state.qualityPopulationFilter = button.dataset.qualityFilter || state.qualityPopulationFilter || "all";
      state.qualityPopulationPage = 1;
      state.expandedQualityPopulationPatient = "";
      state.expandedOutcomePatient = "";
      state.expandedStatusPatient = "";
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-quality-population-row]").forEach((row) => {
    const selectMeasure = () => {
      const measureId = row.dataset.qualityPopulationRow;
      const isOpen = state.openQualityPopulationMeasure === measureId;
      state.openQualityPopulationMeasure = isOpen ? "" : measureId;
      state.selectedValidationMeasure = measureId;
      state.qualityPopulationFilter = "all";
      state.qualityPopulationPage = 1;
      state.expandedQualityPopulationPatient = "";
      state.expandedOutcomePatient = "";
      state.expandedStatusPatient = "";
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    };
    row.addEventListener("click", (event) => {
      if (event.target.closest("button, input, select, a, label")) return;
      selectMeasure();
    });
    row.addEventListener("keydown", (event) => {
      if (event.target.closest("button, input, select, a, label")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectMeasure();
    });
  });
  content.querySelectorAll("[data-close-quality-population]").forEach((button) => {
    button.addEventListener("click", () => {
      state.openQualityPopulationMeasure = "";
      state.expandedQualityPopulationPatient = "";
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-quality-population-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.qualityPopulationFilter = button.dataset.qualityPopulationFilter;
      state.qualityPopulationPage = 1;
      state.expandedQualityPopulationPatient = "";
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-quality-population-sort]").forEach((select) => {
    select.addEventListener("change", () => {
      state.qualityPopulationSort = select.value;
      state.qualityPopulationPage = 1;
      state.expandedQualityPopulationPatient = "";
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-quality-population-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.qualityPopulationPage = Number(button.dataset.qualityPopulationPage) || 1;
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-quality-population-status]").forEach((button) => {
    button.addEventListener("click", () => {
      const [measureId, patientId, index] = button.dataset.qualityPopulationStatus.split(":");
      const measure = validationMeasureById(measureId);
      const patient = qualityPopulationPatientById(measure, patientId, index);
      const fromPopulationPane = Boolean(button.closest(".quality-population-pane"));
      state.openQualityPopulationMeasure = measureId;
      state.selectedValidationMeasure = measureId;
      state.selectedValidationPatient = patient.patient;
      if (!fromPopulationPane) {
        state.qualityPopulationFilter = "all";
        state.qualityPopulationPage = 1;
      }
      state.expandedQualityPopulationPatient = state.expandedQualityPopulationPatient === patient.patient ? "" : patient.patient;
      state.expandedOutcomePatient = "";
      state.expandedStatusPatient = "";
      state.outcomeExplainTab = "logic";
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
      if (state.expandedQualityPopulationPatient) scrollExpandedOutcomeIntoView();
    });
  });
  content.querySelectorAll("[data-workbench-opportunities]").forEach((button) => {
    button.addEventListener("click", () => {
      focusValidationMeasure(button.dataset.workbenchOpportunities, { filter: "all" });
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-workbench-trend-measure]").forEach((button) => {
    button.addEventListener("click", () => {
      focusValidationMeasure(button.dataset.workbenchTrendMeasure, { filter: "all" });
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-opportunity-patients]").forEach((button) => {
    button.addEventListener("click", () => {
      state.openQualityPopulationMeasure = button.dataset.opportunityPatients;
      state.selectedValidationMeasure = button.dataset.opportunityPatients;
      state.qualityPopulationFilter = "near-miss";
      state.qualityPopulationPage = 1;
      state.expandedQualityPopulationPatient = "";
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-opportunity-explain]").forEach((button) => {
    button.addEventListener("click", () => {
      const [measureId, patientId] = button.dataset.opportunityExplain.split(":");
      state.openQualityPopulationMeasure = measureId;
      state.selectedValidationMeasure = measureId;
      state.qualityPopulationFilter = "all";
      state.qualityPopulationPage = 1;
      state.expandedQualityPopulationPatient = patientId;
      state.selectedValidationPatient = patientId;
      state.visionPerformanceTab = "quality-performance";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.patientValidationFilter = button.dataset.validationFilter;
      state.patientValidationChangeDate = "all";
      state.patientValidationPage = 1;
      state.expandedOutcomePatient = "";
      state.expandedStatusPatient = "";
      state.outcomeExplainTab = "logic";
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-measure-select]").forEach((select) => {
    select.addEventListener("change", () => {
      focusValidationMeasure(select.value, { filter: "all" });
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-measure-row]").forEach((row) => {
    const toggleMeasure = () => {
      const measureId = row.dataset.validationMeasureRow;
      if (state.expandedValidationMeasure === measureId) {
        state.expandedValidationMeasure = "";
      } else {
        focusValidationMeasure(measureId, { filter: "all" });
      }
      state.expandedOutcomePatient = "";
      state.expandedStatusPatient = "";
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    };
    row.addEventListener("click", (event) => {
      if (event.target.closest("button, input, select, a, label")) return;
      toggleMeasure();
    });
    row.addEventListener("keydown", (event) => {
      if (event.target.closest("button, input, select, a, label")) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleMeasure();
    });
  });
  content.querySelectorAll("[data-validation-measure-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("[data-validation-measure-row]");
      if (!row) return;
      const measureId = button.dataset.validationMeasureToggle;
      if (state.expandedValidationMeasure === measureId) {
        state.expandedValidationMeasure = "";
      } else {
        focusValidationMeasure(measureId, { filter: "all" });
      }
      state.expandedOutcomePatient = "";
      state.expandedStatusPatient = "";
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-sort]").forEach((select) => {
    select.addEventListener("change", () => {
      if (select.value === "change-date" && state.patientValidationSort !== "change-date") {
        state.patientValidationSortDirection = "desc";
      }
      state.patientValidationSort = select.value;
      state.patientValidationPage = 1;
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-sort-column]").forEach((button) => {
    button.addEventListener("click", () => {
      const sortKey = button.dataset.validationSortColumn;
      if (state.patientValidationSort === sortKey) {
        state.patientValidationSortDirection = state.patientValidationSortDirection === "asc" ? "desc" : "asc";
      } else {
        state.patientValidationSort = sortKey;
        state.patientValidationSortDirection = "desc";
      }
      state.patientValidationPage = 1;
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-change-date]").forEach((select) => {
    select.addEventListener("change", () => {
      state.patientValidationChangeDate = select.value;
      state.patientValidationPage = 1;
      state.expandedOutcomePatient = "";
      state.expandedStatusPatient = "";
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-page-size]").forEach((select) => {
    select.addEventListener("change", () => {
      state.patientValidationPageSize = Number(select.value) || defaultPatientValidationPageSize;
      state.patientValidationPage = 1;
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.patientValidationPage = Number(button.dataset.validationPage) || 1;
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-validation-round]").forEach((select) => {
    select.addEventListener("change", () => {
      state.patientValidationRound = select.value;
      state.visionPerformanceTab = "validation-tracking";
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
        focusValidationMeasure(match.measure.id, { patientId: match.patient.patient, filter: "all", openStatus: true });
        state.visionRoute = "performance";
        showToast(`${match.patient.patient} opened`);
      } else {
        state.visionRoute = "performance";
        showToast("No matching patient found");
      }
      state.visionPerformanceTab = "validation-tracking";
      render();
      if (state.expandedStatusPatient) scrollExpandedOutcomeIntoView();
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
  content.querySelectorAll("[data-add-validation-patient-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const measureId = button.dataset.addValidationPatientAction;
      const measure = validationMeasureById(measureId);
      const input = button.closest(".validation-add-patient-panel")?.querySelector("[data-add-validation-patient-search]");
      const query = input?.value || "";
      state.addPatientSearch = query;
      if (!query.trim()) {
        showToast("Search for a patient first");
        render();
        return;
      }
      const match = validationCandidateSearchMatch(query, measure);
      if (!match) {
        showToast("No matching patient found");
        render();
        return;
      }
      const result = addPatientToValidationMeasure(measureId, match.patient);
      state.visionValidationTab = "patient-level";
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
      scrollExpandedOutcomeIntoView();
      showToast(result.added ? `${result.patient.patient} added to ${measure.code}` : `${result.patient.patient} already selected`);
    });
  });
  content.querySelectorAll("[data-add-validation-patient-search]").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        input.closest(".validation-add-patient-panel")?.querySelector("[data-add-validation-patient-action]")?.click();
      }
    });
  });
  content.querySelectorAll("[data-open-patient-explanation]").forEach((button) => {
    button.addEventListener("click", () => {
      const patientId = button.dataset.openPatientExplanation;
      state.selectedValidationPatient = patientId;
      state.patientValidationSearch = patientId;
      state.patientValidationPage = 1;
      state.expandedStatusPatient = state.expandedStatusPatient === patientId ? "" : patientId;
      state.expandedOutcomePatient = "";
      state.outcomeExplainTab = "logic";
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
      if (state.expandedStatusPatient) scrollExpandedOutcomeIntoView();
    });
  });
  content.querySelectorAll("[data-close-outcome-explanation]").forEach((button) => {
    button.addEventListener("click", () => {
      const wasQualityPopulation = Boolean(state.expandedQualityPopulationPatient);
      state.expandedOutcomePatient = "";
      state.expandedStatusPatient = "";
      state.expandedQualityPopulationPatient = "";
      state.outcomeExplainTab = "logic";
      state.visionPerformanceTab = wasQualityPopulation ? "quality-performance" : "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-open-status-movement]").forEach((button) => {
    button.addEventListener("click", () => {
      const patientId = button.dataset.openStatusMovement;
      state.selectedValidationPatient = patientId;
      state.patientValidationSearch = patientId;
      state.patientValidationPage = 1;
      state.expandedStatusPatient = state.expandedStatusPatient === patientId ? "" : patientId;
      state.expandedOutcomePatient = "";
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
    });
  });
  content.querySelectorAll("[data-accept-status-change]").forEach((button) => {
    button.addEventListener("click", () => {
      const [measureId, patientId] = button.dataset.acceptStatusChange.split(":");
      const result = acceptValidationStatusChange(measureId, patientId);
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = "performance";
      render();
      showToast(result.accepted
        ? `${result.patient.patient} status change accepted; locked status updated`
        : "No unresolved status change to accept");
    });
  });
  content.querySelectorAll("[data-expand-journey-criteria]").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.closest(".measure-journey-change-panel");
      const sections = [...(panel?.querySelectorAll(".journey-criteria-section") || [])];
      const shouldOpen = sections.some((section) => !section.open);
      sections.forEach((section) => {
        section.open = shouldOpen;
      });
      button.textContent = shouldOpen ? "Collapse all" : "Expand all";
    });
  });
  content.querySelectorAll("[data-journey-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.journeyTimelineRange = button.dataset.journeyRange;
      render();
      scrollExpandedOutcomeIntoView();
    });
  });
  content.querySelectorAll("[data-jump-to-changed-criteria]").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.closest(".measure-journey-detail");
      const changedSection = panel?.querySelector(".journey-criteria-section.changed");
      if (!changedSection) return;
      changedSection.open = true;
      changedSection.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    });
  });
  content.querySelectorAll("[data-outcome-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.outcomeExplainTab = button.dataset.outcomeTab;
      state.visionPerformanceTab = "validation-tracking";
      state.visionRoute = state.expandedOutcomePatient ? "performance" : state.visionRoute;
      render();
      if (state.expandedOutcomePatient) scrollExpandedOutcomeIntoView();
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
  bindToastButtons();
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
