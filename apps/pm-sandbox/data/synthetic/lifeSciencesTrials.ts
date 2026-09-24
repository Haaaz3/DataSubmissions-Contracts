export type TrialSpecialty = "Oncology" | "Cardiology" | "Neurology";

export interface QualityImpact {
  measure: string;
  impact: "High" | "Medium" | "Emerging";
  rationale: string;
}

export interface DemographicCount {
  label: string;
  count: number;
}

export interface TrialSiteComparisonRow {
  site: string;
  lead: string;
  matched: number;
  existingRelationship: number;
  activeTrials: number;
}

export interface TrialPatientRecord {
  id: string;
  opportunity: "High" | "Medium" | "Low";
  fullName: string;
  mrn: string;
  dateOfBirth: string;
  age: number;
  gender: "F" | "M" | "X";
  birthSex: "Female" | "Male" | "Intersex";
  primaryContact: string;
  contactType: "Mobile" | "Home Phone" | "Work Phone";
  totalUnmetMeasures: number;
  organizationClass: string;
  organization: string;
  provider: string;
  payer: string;
  plan: string;
  registry: string;
  measure: string;
  measureStatus: string;
  scorability: string;
  attributionStatus: string;
}

export interface LifeSciencesTrial {
  id: string;
  specialty: TrialSpecialty;
  name: string;
  description: string;
  matchedPopulationCount: number;
  revenueOpportunityValue: number;
  revenueOpportunity: string;
  revenueLeakageRisk: string;
  sponsor: string;
  phase: "Phase II" | "Phase III" | "Phase IV";
  pipelineStage: "Identified" | "Feasibility Review" | "Outreach Ready" | "Interested";
  therapeuticPriority: "Tier 1" | "Tier 2" | "Tier 3";
  portfolioRecommendation: string;
  adoptionCase: {
    qualityImprovement: string;
    reducedLeakage: string;
    financialPerformance: string;
  };
  eligiblePatients: {
    id: string;
    profile: string;
    rationale: string;
  }[];
  qualityImpacts: QualityImpact[];
  fitReason: string;
  siteComparison: TrialSiteComparisonRow[];
  demographics: {
    age: DemographicCount[];
    race: DemographicCount[];
    ethnicity: DemographicCount[];
    gender: DemographicCount[];
  };
  patientList: TrialPatientRecord[];
}

const trialPatientLists: Record<string, TrialPatientRecord[]> = {
  "onc-ls-001": [
    { id: "PTL-ONC-10001", opportunity: "High", fullName: "Jacobs, Leah", mrn: "100000", dateOfBirth: "Aug 5, 1952", age: 74, gender: "F", birthSex: "Female", primaryContact: "--", contactType: "Home Phone", totalUnmetMeasures: 6, organizationClass: "Cancer Center", organization: "Ellis Fischel Cancer Center", provider: "Dr. Josephine Wells", payer: "Medicare", plan: "Medicare A/B", registry: "Oncology", measure: "Timely Follow-Up", measureStatus: "Open", scorability: "Scorable", attributionStatus: "Attributed" },
    { id: "PTL-ONC-10002", opportunity: "High", fullName: "Wheeler, Skyler", mrn: "100002", dateOfBirth: "Nov 10, 2000", age: 26, gender: "F", birthSex: "Male", primaryContact: "9848278473", contactType: "Mobile", totalUnmetMeasures: 4, organizationClass: "Cancer Center", organization: "CTSU East", provider: "Dr. Robert Hanmei", payer: "Commercial", plan: "Blue Advantage", registry: "Oncology", measure: "Oral Adherence", measureStatus: "Open", scorability: "Scorable", attributionStatus: "Attributed" },
    { id: "PTL-ONC-10003", opportunity: "High", fullName: "Sullivan, Olivia", mrn: "100009", dateOfBirth: "Nov 6, 1964", age: 62, gender: "F", birthSex: "Female", primaryContact: "9693331319", contactType: "Home Phone", totalUnmetMeasures: 5, organizationClass: "Cancer Center", organization: "CTSU West", provider: "Dr. Sarah Chen", payer: "Medicare", plan: "MO Senior", registry: "Oncology", measure: "Care Plan Doc", measureStatus: "Open", scorability: "Scorable", attributionStatus: "Attributed" },
    { id: "PTL-ONC-10004", opportunity: "High", fullName: "Sullivan, Daniel", mrn: "100016", dateOfBirth: "Nov 22, 1961", age: 65, gender: "F", birthSex: "Female", primaryContact: "9105567060", contactType: "Home Phone", totalUnmetMeasures: 5, organizationClass: "Hospital", organization: "MU Hospital", provider: "Dr. Angela Torres", payer: "Commercial", plan: "Aetna PPO", registry: "Oncology", measure: "Visit Completion", measureStatus: "Open", scorability: "Scorable", attributionStatus: "Attributed" },
    { id: "PTL-ONC-10005", opportunity: "High", fullName: "Price, Riley", mrn: "100021", dateOfBirth: "Mar 15, 1960", age: 66, gender: "M", birthSex: "Female", primaryContact: "9156374980", contactType: "Home Phone", totalUnmetMeasures: 3, organizationClass: "Cancer Center", organization: "Ellis Fischel Cancer Center", provider: "Dr. Josephine Wells", payer: "Medicaid", plan: "MO HealthNet", registry: "Oncology", measure: "Lab Completion", measureStatus: "Open", scorability: "Scorable", attributionStatus: "Pending" },
    { id: "PTL-ONC-10006", opportunity: "High", fullName: "Ho, Sophia", mrn: "100023", dateOfBirth: "Aug 9, 1999", age: 27, gender: "M", birthSex: "Female", primaryContact: "9923982346", contactType: "Work Phone", totalUnmetMeasures: 4, organizationClass: "Cancer Center", organization: "CTSU East", provider: "Dr. Robert Hanmei", payer: "Commercial", plan: "United Choice", registry: "Oncology", measure: "Biomarker Capture", measureStatus: "Open", scorability: "Scorable", attributionStatus: "Attributed" },
    { id: "PTL-ONC-10007", opportunity: "High", fullName: "Chen, Skyler", mrn: "100025", dateOfBirth: "Jan 18, 2002", age: 24, gender: "M", birthSex: "Female", primaryContact: "9147869695", contactType: "Work Phone", totalUnmetMeasures: 3, organizationClass: "Cancer Center", organization: "CTSU West", provider: "Dr. Sarah Chen", payer: "Commercial", plan: "Cigna Open", registry: "Oncology", measure: "Referral Closed Loop", measureStatus: "Open", scorability: "Scorable", attributionStatus: "Attributed" },
    { id: "PTL-ONC-10008", opportunity: "High", fullName: "Bryant, Drew", mrn: "100026", dateOfBirth: "Mar 26, 2005", age: 21, gender: "F", birthSex: "Female", primaryContact: "9531546074", contactType: "Work Phone", totalUnmetMeasures: 4, organizationClass: "Hospital", organization: "MU Hospital", provider: "Dr. Angela Torres", payer: "Commercial", plan: "Blue Advantage", registry: "Oncology", measure: "Navigator Outreach", measureStatus: "Open", scorability: "Scorable", attributionStatus: "Attributed" },
  ],
};

const getTrialPatientList = (trialId: string): TrialPatientRecord[] =>
  trialPatientLists[trialId] ?? trialPatientLists["onc-ls-001"];

export const lifeSciencesTrials: LifeSciencesTrial[] = [
  {
    id: "onc-ls-001",
    specialty: "Oncology",
    name: "PRECISION-LUNG IO-201",
    description:
      "Immunotherapy combination study for metastatic non-small cell lung cancer focused on biomarker-matched populations.",
    matchedPopulationCount: 126,
    revenueOpportunityValue: 1100000,
    revenueOpportunity: "$1.1M annual site revenue",
    revenueLeakageRisk: "$420K at-risk downstream infusion and oncology follow-up if referred externally",
    sponsor: "Helix Oncology Partners",
    phase: "Phase III",
    pipelineStage: "Outreach Ready",
    therapeuticPriority: "Tier 1",
    portfolioRecommendation: "Lead with this trial as an anchor oncology study for sponsor conversations.",
    adoptionCase: {
      qualityImprovement: "Improves timely oncology follow-up reliability and documented pathway adherence.",
      reducedLeakage: "Keeps biomarker-matched lung cancer patients in-network for infusion and specialist follow-up.",
      financialPerformance: "High-acuity trial visits plus ancillary imaging create strong incremental margin.",
    },
    eligiblePatients: [
      { id: "PT-ONC-1042", profile: "Female, 65-74, NSCLC stage IV", rationale: "PD-L1 high expression and recent progression on standard regimen" },
      { id: "PT-ONC-1128", profile: "Male, 55-64, NSCLC metastatic", rationale: "Meets ECOG criteria and active pulmonary oncology follow-up" },
      { id: "PT-ONC-1179", profile: "Female, 45-54, recurrent NSCLC", rationale: "Biomarker-positive with sufficient organ function for protocol" },
    ],
    qualityImpacts: [
      {
        measure: "Timely Oncology Follow-Up",
        impact: "High",
        rationale: "Requires structured follow-up visits and care pathway adherence.",
      },
      {
        measure: "Medication Adherence (Oral Oncology)",
        impact: "Medium",
        rationale: "Protocol cadence reinforces adherence monitoring and refill checks.",
      },
    ],
    fitReason: "Strong thoracic oncology volume and established molecular diagnostics program.",
    siteComparison: [
      { site: "Ellis Fischel Cancer Center", lead: "Dr. Josephine Wells, MD", matched: 40, existingRelationship: 27, activeTrials: 11 },
      { site: "Clinical & Translational Science Unit (East)", lead: "Dr. Robert Hanmei, PharmD", matched: 32, existingRelationship: 22, activeTrials: 8 },
      { site: "Clinical & Translational Science Unit (West)", lead: "Dr. Sarah Chen, MD, MPH", matched: 26, existingRelationship: 18, activeTrials: 7 },
      { site: "MU Hospital & Women's & Children's", lead: "Dr. Angela Torres, MD, FACP", matched: 28, existingRelationship: 20, activeTrials: 10 },
    ],
    demographics: {
      age: [
        { label: "18–29", count: 18 },
        { label: "30–39", count: 24 },
        { label: "40–49", count: 31 },
        { label: "50–59", count: 29 },
        { label: "60+", count: 24 },
      ],
      race: [
        { label: "White", count: 70 },
        { label: "Black or African American", count: 29 },
        { label: "Asian", count: 14 },
        { label: "Other / Multi-racial", count: 13 },
      ],
      ethnicity: [
        { label: "Not Hispanic or Latino", count: 94 },
        { label: "Hispanic or Latino", count: 24 },
        { label: "Unknown / Declined", count: 8 },
      ],
      gender: [
        { label: "Female", count: 68 },
        { label: "Male", count: 54 },
        { label: "Non-binary / Other", count: 4 },
      ],
    },
    patientList: getTrialPatientList("onc-ls-001"),
  },
  {
    id: "onc-ls-002",
    specialty: "Oncology",
    name: "BREAST-PROTECT CDKX",
    description:
      "Adjuvant targeted-therapy trial for HR+/HER2- early breast cancer with risk-stratified monitoring.",
    matchedPopulationCount: 178,
    revenueOpportunityValue: 940000,
    revenueOpportunity: "$940K annual site revenue",
    revenueLeakageRisk: "$350K adjuvant oncology management leakage without local protocol access",
    sponsor: "NovaCure Biopharma",
    phase: "Phase III",
    pipelineStage: "Feasibility Review",
    therapeuticPriority: "Tier 1",
    portfolioRecommendation: "Bundle with precision-lung as a dual oncology growth portfolio.",
    adoptionCase: {
      qualityImprovement: "Raises treatment plan documentation consistency across multidisciplinary teams.",
      reducedLeakage: "Retains high-risk early breast cancer patients for coordinated oncology navigation.",
      financialPerformance: "Stable screening-to-treatment pipeline supports sustained specialty line growth.",
    },
    eligiblePatients: [
      { id: "PT-ONC-2031", profile: "Female, 35-44, early HR+/HER2-", rationale: "Post-surgical candidate with elevated recurrence risk profile" },
      { id: "PT-ONC-2194", profile: "Female, 55-64, adjuvant pathway", rationale: "Completed baseline workup and fits protocol timeline" },
      { id: "PT-ONC-2272", profile: "Female, 45-54, node-positive disease", rationale: "Eligible receptor profile and navigation support in place" },
    ],
    qualityImpacts: [
      {
        measure: "Cancer Treatment Plan Documentation",
        impact: "High",
        rationale: "Trial workflows improve documentation completeness and treatment planning consistency.",
      },
      {
        measure: "Patient Navigation Engagement",
        impact: "Emerging",
        rationale: "Additional care navigation touchpoints may reduce patient leakage.",
      },
    ],
    fitReason: "High breast oncology panel and multidisciplinary tumor board infrastructure.",
    siteComparison: [
      { site: "Ellis Fischel Cancer Center", lead: "Dr. Lila Morgan, MD", matched: 58, existingRelationship: 39, activeTrials: 13 },
      { site: "Women's Health Research Pavilion", lead: "Dr. Renee Talbot, MD", matched: 44, existingRelationship: 31, activeTrials: 10 },
      { site: "Regional Oncology North", lead: "Dr. Priya Das, MD", matched: 38, existingRelationship: 23, activeTrials: 6 },
      { site: "Regional Oncology South", lead: "Dr. Steven Hart, MD", matched: 38, existingRelationship: 28, activeTrials: 9 },
    ],
    demographics: {
      age: [
        { label: "18–29", count: 22 },
        { label: "30–39", count: 36 },
        { label: "40–49", count: 44 },
        { label: "50–59", count: 42 },
        { label: "60+", count: 34 },
      ],
      race: [
        { label: "White", count: 96 },
        { label: "Black or African American", count: 43 },
        { label: "Asian", count: 20 },
        { label: "Other / Multi-racial", count: 19 },
      ],
      ethnicity: [
        { label: "Not Hispanic or Latino", count: 132 },
        { label: "Hispanic or Latino", count: 35 },
        { label: "Unknown / Declined", count: 11 },
      ],
      gender: [
        { label: "Female", count: 103 },
        { label: "Male", count: 71 },
        { label: "Non-binary / Other", count: 4 },
      ],
    },
    patientList: getTrialPatientList("onc-ls-001"),
  },
  {
    id: "car-ls-001",
    specialty: "Cardiology",
    name: "HF-OPTIMIZE REMOTE",
    description:
      "Heart failure trial assessing remote hemodynamic monitoring and proactive medication titration.",
    matchedPopulationCount: 242,
    revenueOpportunityValue: 1300000,
    revenueOpportunity: "$1.3M annual site revenue",
    revenueLeakageRisk: "$510K in heart failure monitoring and readmission-management spend at risk",
    sponsor: "CardiaAxis Therapeutics",
    phase: "Phase III",
    pipelineStage: "Interested",
    therapeuticPriority: "Tier 1",
    portfolioRecommendation: "Prioritize as top cardiology study for near-term sponsor conversion.",
    adoptionCase: {
      qualityImprovement: "Directly supports heart failure readmission and post-discharge follow-up performance.",
      reducedLeakage: "Keeps high-utilization CHF members in-network through remote management pathways.",
      financialPerformance: "Improved avoidable utilization plus trial payments strengthen total contribution.",
    },
    eligiblePatients: [
      { id: "PT-CAR-3018", profile: "Male, 65-74, HFrEF", rationale: "Recent admission with active cardiology follow-up and device compatibility" },
      { id: "PT-CAR-3176", profile: "Female, 75+, HFpEF", rationale: "High readmission risk with caregiver support for remote monitoring" },
      { id: "PT-CAR-3291", profile: "Male, 55-64, chronic HF", rationale: "Medication titration candidate with repeat ED utilization" },
    ],
    qualityImpacts: [
      {
        measure: "Heart Failure 30-Day Readmission",
        impact: "High",
        rationale: "Protocol-driven surveillance and rapid intervention can reduce avoidable readmissions.",
      },
      {
        measure: "Post-Discharge Follow-Up",
        impact: "High",
        rationale: "Enrollment requirements tighten post-discharge outreach timelines.",
      },
    ],
    fitReason: "Large advanced heart failure cohort and existing remote monitoring nursing team.",
    siteComparison: [
      { site: "Heart & Vascular Institute", lead: "Dr. Miguel Perez, MD", matched: 74, existingRelationship: 54, activeTrials: 17 },
      { site: "Advanced HF Clinic East", lead: "Dr. Allison Reid, MD", matched: 61, existingRelationship: 39, activeTrials: 12 },
      { site: "Advanced HF Clinic West", lead: "Dr. Marcus Lee, MD", matched: 55, existingRelationship: 33, activeTrials: 9 },
      { site: "Regional Cardio Outreach", lead: "Dr. Amina Yusuf, MD", matched: 52, existingRelationship: 30, activeTrials: 8 },
    ],
    demographics: {
      age: [
        { label: "18–29", count: 28 },
        { label: "30–39", count: 48 },
        { label: "40–49", count: 61 },
        { label: "50–59", count: 56 },
        { label: "60+", count: 49 },
      ],
      race: [
        { label: "White", count: 132 },
        { label: "Black or African American", count: 60 },
        { label: "Asian", count: 25 },
        { label: "Other / Multi-racial", count: 25 },
      ],
      ethnicity: [
        { label: "Not Hispanic or Latino", count: 177 },
        { label: "Hispanic or Latino", count: 48 },
        { label: "Unknown / Declined", count: 17 },
      ],
      gender: [
        { label: "Female", count: 116 },
        { label: "Male", count: 121 },
        { label: "Non-binary / Other", count: 5 },
      ],
    },
    patientList: getTrialPatientList("onc-ls-001"),
  },
  {
    id: "car-ls-002",
    specialty: "Cardiology",
    name: "AF-STROKE SHIELD",
    description:
      "Atrial fibrillation outcomes study comparing anticoagulation optimization pathways in high-risk populations.",
    matchedPopulationCount: 311,
    revenueOpportunityValue: 870000,
    revenueOpportunity: "$870K annual site revenue",
    revenueLeakageRisk: "$290K in stroke-prevention pathway leakage to external specialty networks",
    sponsor: "Vascura Clinical",
    phase: "Phase IV",
    pipelineStage: "Identified",
    therapeuticPriority: "Tier 2",
    portfolioRecommendation: "Use as pipeline expansion once HF-OPTIMIZE outreach is complete.",
    adoptionCase: {
      qualityImprovement: "Strengthens anticoagulation adherence and stroke-prevention quality workflows.",
      reducedLeakage: "Preserves electrophysiology and anticoag management visits in-system.",
      financialPerformance: "Adds trial revenue while supporting avoidable stroke-cost prevention goals.",
    },
    eligiblePatients: [
      { id: "PT-CAR-4024", profile: "Male, 75+, persistent AF", rationale: "CHA2DS2-VASc high and active anticoag monitoring visits" },
      { id: "PT-CAR-4180", profile: "Female, 65-74, paroxysmal AF", rationale: "Prior TIA history and protocol-eligible renal profile" },
      { id: "PT-CAR-4266", profile: "Male, 55-64, AF with HTN", rationale: "Medication adherence gaps suitable for pathway intervention" },
    ],
    qualityImpacts: [
      {
        measure: "Anticoagulation Adherence",
        impact: "Medium",
        rationale: "Frequent protocol contacts improve adherence checks and medication persistence.",
      },
      {
        measure: "Stroke Prevention in AF",
        impact: "High",
        rationale: "Trial pathways reinforce risk stratification and proactive intervention.",
      },
    ],
    fitReason: "Strong electrophysiology service line and high AF attributed population.",
    siteComparison: [
      { site: "Heart Rhythm Center", lead: "Dr. Evan Cole, MD", matched: 96, existingRelationship: 67, activeTrials: 20 },
      { site: "Cardiology South Pavilion", lead: "Dr. Helen Wright, MD", matched: 78, existingRelationship: 52, activeTrials: 15 },
      { site: "Cardiology North Pavilion", lead: "Dr. Dan Patel, MD", matched: 72, existingRelationship: 47, activeTrials: 13 },
      { site: "Community AF Access Clinic", lead: "Dr. Susan Kim, MD", matched: 65, existingRelationship: 41, activeTrials: 11 },
    ],
    demographics: {
      age: [
        { label: "18–29", count: 39 },
        { label: "30–39", count: 63 },
        { label: "40–49", count: 79 },
        { label: "50–59", count: 72 },
        { label: "60+", count: 58 },
      ],
      race: [
        { label: "White", count: 167 },
        { label: "Black or African American", count: 78 },
        { label: "Asian", count: 33 },
        { label: "Other / Multi-racial", count: 33 },
      ],
      ethnicity: [
        { label: "Not Hispanic or Latino", count: 229 },
        { label: "Hispanic or Latino", count: 60 },
        { label: "Unknown / Declined", count: 22 },
      ],
      gender: [
        { label: "Female", count: 138 },
        { label: "Male", count: 166 },
        { label: "Non-binary / Other", count: 7 },
      ],
    },
    patientList: getTrialPatientList("onc-ls-001"),
  },
  {
    id: "neuro-ls-001",
    specialty: "Neurology",
    name: "NEURO-RECOVER POST-STROKE",
    description:
      "Post-ischemic stroke functional recovery trial integrating rehab intensity and digital cognitive tracking.",
    matchedPopulationCount: 94,
    revenueOpportunityValue: 760000,
    revenueOpportunity: "$760K annual site revenue",
    revenueLeakageRisk: "$240K in neuro-rehab and follow-up visits leaking to external facilities",
    sponsor: "NeuroFrontier Labs",
    phase: "Phase II",
    pipelineStage: "Feasibility Review",
    therapeuticPriority: "Tier 2",
    portfolioRecommendation: "Position as differentiated neurology program tied to stroke-center status.",
    adoptionCase: {
      qualityImprovement: "Improves follow-up within seven days and coordinated transition documentation.",
      reducedLeakage: "Retains post-stroke rehab and specialist neuro follow-up in-system.",
      financialPerformance: "Protects rehab referral value while creating sponsored trial reimbursement.",
    },
    eligiblePatients: [
      { id: "PT-NEU-5015", profile: "Male, 65-74, post-ischemic stroke", rationale: "Recent discharge with outpatient PT/OT plan already active" },
      { id: "PT-NEU-5142", profile: "Female, 55-64, moderate deficit", rationale: "Cognitive tracking baseline complete and caregiver support present" },
      { id: "PT-NEU-5288", profile: "Male, 75+, early recovery phase", rationale: "Within enrollment window and meets functional inclusion criteria" },
    ],
    qualityImpacts: [
      {
        measure: "Stroke Follow-Up Within 7 Days",
        impact: "High",
        rationale: "Protocol imposes strict follow-up windows and coordinated transitions of care.",
      },
      {
        measure: "Care Coordination Documentation",
        impact: "Medium",
        rationale: "Cross-disciplinary handoffs improve care plan completeness.",
      },
    ],
    fitReason: "Comprehensive stroke center status with robust inpatient-to-outpatient transition model.",
    siteComparison: [
      { site: "Neurosciences Institute", lead: "Dr. Carla Mendez, MD", matched: 27, existingRelationship: 18, activeTrials: 7 },
      { site: "Stroke Recovery Clinic", lead: "Dr. Ira Gold, MD", matched: 25, existingRelationship: 16, activeTrials: 6 },
      { site: "Neuro Rehab East", lead: "Dr. Jenna Hayes, DPT", matched: 22, existingRelationship: 13, activeTrials: 4 },
      { site: "Neuro Rehab West", lead: "Dr. Reena Shah, MD", matched: 20, existingRelationship: 12, activeTrials: 5 },
    ],
    demographics: {
      age: [
        { label: "18–29", count: 11 },
        { label: "30–39", count: 19 },
        { label: "40–49", count: 23 },
        { label: "50–59", count: 22 },
        { label: "60+", count: 19 },
      ],
      race: [
        { label: "White", count: 52 },
        { label: "Black or African American", count: 21 },
        { label: "Asian", count: 10 },
        { label: "Other / Multi-racial", count: 11 },
      ],
      ethnicity: [
        { label: "Not Hispanic or Latino", count: 70 },
        { label: "Hispanic or Latino", count: 18 },
        { label: "Unknown / Declined", count: 6 },
      ],
      gender: [
        { label: "Female", count: 47 },
        { label: "Male", count: 45 },
        { label: "Non-binary / Other", count: 2 },
      ],
    },
    patientList: getTrialPatientList("onc-ls-001"),
  },
  {
    id: "neuro-ls-002",
    specialty: "Neurology",
    name: "MS-TRAJECTORY IMMUNE",
    description:
      "Relapsing-remitting multiple sclerosis study evaluating personalized immune-modulating pathway selection.",
    matchedPopulationCount: 138,
    revenueOpportunityValue: 990000,
    revenueOpportunity: "$990K annual site revenue",
    revenueLeakageRisk: "$330K infusion and complex neuro-care leakage risk without local enrollment",
    sponsor: "AxonBridge Pharma",
    phase: "Phase III",
    pipelineStage: "Outreach Ready",
    therapeuticPriority: "Tier 3",
    portfolioRecommendation: "Advance after stroke program to complete a balanced neurology portfolio.",
    adoptionCase: {
      qualityImprovement: "Supports specialist access and longitudinal neurology care-plan adherence.",
      reducedLeakage: "Keeps infusion and specialty MS management in-network.",
      financialPerformance: "Expands infusion-center utilization and funded specialist follow-up encounters.",
    },
    eligiblePatients: [
      { id: "PT-NEU-6011", profile: "Female, 35-44, RRMS", rationale: "Recent relapse history with infusion-center access and protocol compatibility" },
      { id: "PT-NEU-6187", profile: "Male, 45-54, RRMS", rationale: "Specialist follow-up cadence aligns with study visit requirements" },
      { id: "PT-NEU-6249", profile: "Female, 25-34, RRMS", rationale: "Disease activity pattern meets personalized pathway inclusion" },
    ],
    qualityImpacts: [
      {
        measure: "Neurology Care Plan Adherence",
        impact: "Medium",
        rationale: "Frequent protocol checkpoints support continuity and longitudinal plan adherence.",
      },
      {
        measure: "Specialist Access Timeliness",
        impact: "Emerging",
        rationale: "Trial infrastructure expands specialty scheduling efficiency for complex neurology care.",
      },
    ],
    fitReason: "High MS clinic volume and existing infusion center capacity.",
    siteComparison: [
      { site: "MS Specialty Clinic", lead: "Dr. Adrienne Lowe, MD", matched: 42, existingRelationship: 30, activeTrials: 10 },
      { site: "Neuro Immunology East", lead: "Dr. Nolan Brooks, MD", matched: 35, existingRelationship: 22, activeTrials: 8 },
      { site: "Neuro Immunology West", lead: "Dr. Tara Fields, MD", matched: 32, existingRelationship: 19, activeTrials: 6 },
      { site: "Regional Infusion Neurology", lead: "Dr. Vimal Rao, MD", matched: 29, existingRelationship: 16, activeTrials: 5 },
    ],
    demographics: {
      age: [
        { label: "18–29", count: 20 },
        { label: "30–39", count: 30 },
        { label: "40–49", count: 36 },
        { label: "50–59", count: 29 },
        { label: "60+", count: 23 },
      ],
      race: [
        { label: "White", count: 74 },
        { label: "Black or African American", count: 33 },
        { label: "Asian", count: 16 },
        { label: "Other / Multi-racial", count: 15 },
      ],
      ethnicity: [
        { label: "Not Hispanic or Latino", count: 103 },
        { label: "Hispanic or Latino", count: 26 },
        { label: "Unknown / Declined", count: 9 },
      ],
      gender: [
        { label: "Female", count: 83 },
        { label: "Male", count: 52 },
        { label: "Non-binary / Other", count: 3 },
      ],
    },
    patientList: getTrialPatientList("onc-ls-001"),
  },
];
