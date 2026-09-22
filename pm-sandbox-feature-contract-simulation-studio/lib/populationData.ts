import {
  MemberPopulationProfile,
  PopulationInsight,
  ChronicCondition,
  PopulationPatientRow,
  PreVisitPlanningRow,
  PreVisitPlanningSummary,
  PreVisitCareGap,
  PopulationMemberDetail,
  MemberEvidenceFact,
  MemberMeasureGap,
  MemberAgentSuggestion,
} from "@/types/population";
import { lifeSciencesTrials } from "@/data/synthetic/lifeSciencesTrials";

// ---------------------------------------------------------------------------
// Mock population profiles — one per contract.
// MSSP/MA populations skew older with higher chronic burden.
// Commercial populations are working-age with different condition mix.
// ---------------------------------------------------------------------------

export const mockPopulationProfiles: MemberPopulationProfile[] = [
  // ── MSSP ─────────────────────────────────────────────────────────────────
  {
    contractId: "mssp-001",
    totalMembers: 4820,
    ageDistribution:    { under18: 0, age18to44: 5, age45to64: 32, age65plus: 63 },
    genderDistribution: { male: 47, female: 52, other: 1 },
    riskDistribution:   { lowRisk: 2169, risingRisk: 1687, highRisk: 964 },
    topChronicConditions: [
      { condition: "Hypertension", prevalencePercent: 68 },
      { condition: "Diabetes",     prevalencePercent: 31 },
      { condition: "COPD",         prevalencePercent: 16 },
      { condition: "CKD",          prevalencePercent: 18 },
      { condition: "CHF",          prevalencePercent: 14 },
    ],
    utilizationMetrics: { edVisitsPer1000: 312, admissionsPer1000: 185, readmissionsRate: 9.8, avgLengthOfStay: 4.2 },
    qualityMetrics:     { diabetesA1cControl: 64, colorectalScreeningRate: 54, breastCancerScreeningRate: 68, medicationAdherence: 71 },
    socialRiskIndicators: { foodInsecurityPercent: 12, transportationBarrierPercent: 15, housingInstabilityPercent: 8 },
    highCostMembers: 241,
  },
  {
    contractId: "mssp-002",
    totalMembers: 3940,
    ageDistribution:    { under18: 0, age18to44: 4, age45to64: 30, age65plus: 66 },
    genderDistribution: { male: 46, female: 53, other: 1 },
    riskDistribution:   { lowRisk: 2049, risingRisk: 1261, highRisk: 630 },
    topChronicConditions: [
      { condition: "Hypertension", prevalencePercent: 64 },
      { condition: "Diabetes",     prevalencePercent: 28 },
      { condition: "CKD",          prevalencePercent: 16 },
      { condition: "COPD",         prevalencePercent: 14 },
      { condition: "CHF",          prevalencePercent: 12 },
    ],
    utilizationMetrics: { edVisitsPer1000: 271, admissionsPer1000: 162, readmissionsRate: 8.4, avgLengthOfStay: 3.9 },
    qualityMetrics:     { diabetesA1cControl: 71, colorectalScreeningRate: 58, breastCancerScreeningRate: 73, medicationAdherence: 76 },
    socialRiskIndicators: { foodInsecurityPercent: 9, transportationBarrierPercent: 11, housingInstabilityPercent: 6 },
    highCostMembers: 197,
  },
  {
    contractId: "mssp-003",
    totalMembers: 5510,
    ageDistribution:    { under18: 0, age18to44: 6, age45to64: 35, age65plus: 59 },
    genderDistribution: { male: 48, female: 51, other: 1 },
    riskDistribution:   { lowRisk: 2094, risingRisk: 1984, highRisk: 1432 },
    topChronicConditions: [
      { condition: "Hypertension", prevalencePercent: 71 },
      { condition: "Diabetes",     prevalencePercent: 38 },
      { condition: "COPD",         prevalencePercent: 24 },
      { condition: "CHF",          prevalencePercent: 22 },
      { condition: "CKD",          prevalencePercent: 20 },
    ],
    utilizationMetrics: { edVisitsPer1000: 388, admissionsPer1000: 224, readmissionsRate: 14.8, avgLengthOfStay: 5.1 },
    qualityMetrics:     { diabetesA1cControl: 55, colorectalScreeningRate: 48, breastCancerScreeningRate: 61, medicationAdherence: 64 },
    socialRiskIndicators: { foodInsecurityPercent: 22, transportationBarrierPercent: 19, housingInstabilityPercent: 14 },
    highCostMembers: 276,
  },

  // ── Medicare Advantage ───────────────────────────────────────────────────
  {
    contractId: "ma-001",
    totalMembers: 6310,
    ageDistribution:    { under18: 0, age18to44: 2, age45to64: 22, age65plus: 76 },
    genderDistribution: { male: 44, female: 55, other: 1 },
    riskDistribution:   { lowRisk: 3155, risingRisk: 1956, highRisk: 1199 },
    topChronicConditions: [
      { condition: "Hypertension", prevalencePercent: 72 },
      { condition: "Diabetes",     prevalencePercent: 32 },
      { condition: "CHF",          prevalencePercent: 18 },
      { condition: "CKD",          prevalencePercent: 15 },
      { condition: "COPD",         prevalencePercent: 13 },
    ],
    utilizationMetrics: { edVisitsPer1000: 265, admissionsPer1000: 155, readmissionsRate: 9.2, avgLengthOfStay: 3.8 },
    qualityMetrics:     { diabetesA1cControl: 74, colorectalScreeningRate: 69, breastCancerScreeningRate: 76, medicationAdherence: 82 },
    socialRiskIndicators: { foodInsecurityPercent: 8, transportationBarrierPercent: 10, housingInstabilityPercent: 5 },
    highCostMembers: 316,
  },
  {
    contractId: "ma-002",
    totalMembers: 7840,
    ageDistribution:    { under18: 0, age18to44: 1, age45to64: 24, age65plus: 75 },
    genderDistribution: { male: 45, female: 54, other: 1 },
    riskDistribution:   { lowRisk: 3450, risingRisk: 2666, highRisk: 1724 },
    topChronicConditions: [
      { condition: "Hypertension", prevalencePercent: 76 },
      { condition: "Diabetes",     prevalencePercent: 36 },
      { condition: "CHF",          prevalencePercent: 21 },
      { condition: "CKD",          prevalencePercent: 19 },
      { condition: "COPD",         prevalencePercent: 17 },
    ],
    utilizationMetrics: { edVisitsPer1000: 305, admissionsPer1000: 188, readmissionsRate: 11.4, avgLengthOfStay: 4.4 },
    qualityMetrics:     { diabetesA1cControl: 68, colorectalScreeningRate: 62, breastCancerScreeningRate: 71, medicationAdherence: 74 },
    socialRiskIndicators: { foodInsecurityPercent: 11, transportationBarrierPercent: 13, housingInstabilityPercent: 7 },
    highCostMembers: 392,
  },
  {
    contractId: "ma-003",
    totalMembers: 5120,
    ageDistribution:    { under18: 0, age18to44: 1, age45to64: 20, age65plus: 79 },
    genderDistribution: { male: 43, female: 56, other: 1 },
    riskDistribution:   { lowRisk: 2765, risingRisk: 1536, highRisk: 819 },
    topChronicConditions: [
      { condition: "Hypertension", prevalencePercent: 70 },
      { condition: "Diabetes",     prevalencePercent: 29 },
      { condition: "CKD",          prevalencePercent: 14 },
      { condition: "CHF",          prevalencePercent: 16 },
      { condition: "COPD",         prevalencePercent: 11 },
    ],
    utilizationMetrics: { edVisitsPer1000: 248, admissionsPer1000: 145, readmissionsRate: 8.1, avgLengthOfStay: 3.6 },
    qualityMetrics:     { diabetesA1cControl: 78, colorectalScreeningRate: 71, breastCancerScreeningRate: 80, medicationAdherence: 86 },
    socialRiskIndicators: { foodInsecurityPercent: 7, transportationBarrierPercent: 9, housingInstabilityPercent: 4 },
    highCostMembers: 256,
  },
  {
    contractId: "ma-004",
    totalMembers: 9200,
    ageDistribution:    { under18: 0, age18to44: 2, age45to64: 26, age65plus: 72 },
    genderDistribution: { male: 46, female: 53, other: 1 },
    riskDistribution:   { lowRisk: 3312, risingRisk: 3496, highRisk: 2392 },
    topChronicConditions: [
      { condition: "Hypertension", prevalencePercent: 78 },
      { condition: "Diabetes",     prevalencePercent: 41 },
      { condition: "CHF",          prevalencePercent: 25 },
      { condition: "CKD",          prevalencePercent: 22 },
      { condition: "COPD",         prevalencePercent: 20 },
    ],
    utilizationMetrics: { edVisitsPer1000: 415, admissionsPer1000: 248, readmissionsRate: 15.6, avgLengthOfStay: 5.4 },
    qualityMetrics:     { diabetesA1cControl: 52, colorectalScreeningRate: 45, breastCancerScreeningRate: 58, medicationAdherence: 61 },
    socialRiskIndicators: { foodInsecurityPercent: 18, transportationBarrierPercent: 21, housingInstabilityPercent: 12 },
    highCostMembers: 460,
  },

  // ── Commercial ───────────────────────────────────────────────────────────
  {
    contractId: "comm-001",
    totalMembers: 2150,
    ageDistribution:    { under18: 8, age18to44: 44, age45to64: 46, age65plus: 2 },
    genderDistribution: { male: 50, female: 49, other: 1 },
    riskDistribution:   { lowRisk: 1032, risingRisk: 688, highRisk: 430 },
    topChronicConditions: [
      { condition: "Hypertension", prevalencePercent: 28 },
      { condition: "Obesity",      prevalencePercent: 22 },
      { condition: "Anxiety",      prevalencePercent: 20 },
      { condition: "Depression",   prevalencePercent: 18 },
      { condition: "Diabetes",     prevalencePercent: 12 },
    ],
    utilizationMetrics: { edVisitsPer1000: 340, admissionsPer1000: 95, readmissionsRate: 7.2, avgLengthOfStay: 3.4 },
    qualityMetrics:     { diabetesA1cControl: 61, colorectalScreeningRate: 38, breastCancerScreeningRate: 55, medicationAdherence: 68 },
    socialRiskIndicators: { foodInsecurityPercent: 14, transportationBarrierPercent: 12, housingInstabilityPercent: 9 },
    highCostMembers: 108,
  },
  {
    contractId: "comm-002",
    totalMembers: 1870,
    ageDistribution:    { under18: 10, age18to44: 48, age45to64: 40, age65plus: 2 },
    genderDistribution: { male: 51, female: 48, other: 1 },
    riskDistribution:   { lowRisk: 1085, risingRisk: 524, highRisk: 261 },
    topChronicConditions: [
      { condition: "MSK / Back Pain", prevalencePercent: 24 },
      { condition: "Hypertension",    prevalencePercent: 22 },
      { condition: "Obesity",         prevalencePercent: 19 },
      { condition: "Depression",      prevalencePercent: 15 },
      { condition: "Diabetes",        prevalencePercent: 9 },
    ],
    utilizationMetrics: { edVisitsPer1000: 278, admissionsPer1000: 82, readmissionsRate: 6.8, avgLengthOfStay: 3.2 },
    qualityMetrics:     { diabetesA1cControl: 72, colorectalScreeningRate: 62, breastCancerScreeningRate: 68, medicationAdherence: 78 },
    socialRiskIndicators: { foodInsecurityPercent: 8, transportationBarrierPercent: 10, housingInstabilityPercent: 6 },
    highCostMembers: 94,
  },
  {
    contractId: "comm-003",
    totalMembers: 3280,
    ageDistribution:    { under18: 5, age18to44: 62, age45to64: 32, age65plus: 1 },
    genderDistribution: { male: 54, female: 45, other: 1 },
    riskDistribution:   { lowRisk: 2230, risingRisk: 788, highRisk: 262 },
    topChronicConditions: [
      { condition: "MSK / Back Pain", prevalencePercent: 28 },
      { condition: "Anxiety",         prevalencePercent: 22 },
      { condition: "Depression",      prevalencePercent: 18 },
      { condition: "Obesity",         prevalencePercent: 16 },
      { condition: "Hypertension",    prevalencePercent: 14 },
    ],
    utilizationMetrics: { edVisitsPer1000: 198, admissionsPer1000: 58, readmissionsRate: 5.1, avgLengthOfStay: 2.8 },
    qualityMetrics:     { diabetesA1cControl: 81, colorectalScreeningRate: 72, breastCancerScreeningRate: 74, medicationAdherence: 88 },
    socialRiskIndicators: { foodInsecurityPercent: 5, transportationBarrierPercent: 6, housingInstabilityPercent: 4 },
    highCostMembers: 164,
  },
  {
    contractId: "comm-004",
    totalMembers: 4100,
    ageDistribution:    { under18: 12, age18to44: 52, age45to64: 34, age65plus: 2 },
    genderDistribution: { male: 49, female: 50, other: 1 },
    riskDistribution:   { lowRisk: 1886, risingRisk: 1394, highRisk: 820 },
    topChronicConditions: [
      { condition: "MSK / Back Pain", prevalencePercent: 26 },
      { condition: "Obesity",         prevalencePercent: 28 },
      { condition: "Depression",      prevalencePercent: 24 },
      { condition: "Hypertension",    prevalencePercent: 31 },
      { condition: "Diabetes",        prevalencePercent: 14 },
    ],
    utilizationMetrics: { edVisitsPer1000: 355, admissionsPer1000: 108, readmissionsRate: 7.8, avgLengthOfStay: 3.5 },
    qualityMetrics:     { diabetesA1cControl: 64, colorectalScreeningRate: 48, breastCancerScreeningRate: 60, medicationAdherence: 70 },
    socialRiskIndicators: { foodInsecurityPercent: 19, transportationBarrierPercent: 22, housingInstabilityPercent: 15 },
    highCostMembers: 205,
  },
  {
    contractId: "comm-005",
    totalMembers: 6750,
    ageDistribution:    { under18: 15, age18to44: 40, age45to64: 42, age65plus: 3 },
    genderDistribution: { male: 48, female: 51, other: 1 },
    riskDistribution:   { lowRisk: 3645, risingRisk: 2025, highRisk: 1080 },
    topChronicConditions: [
      { condition: "Hypertension",    prevalencePercent: 35 },
      { condition: "Obesity",         prevalencePercent: 24 },
      { condition: "MSK / Back Pain", prevalencePercent: 22 },
      { condition: "Depression",      prevalencePercent: 19 },
      { condition: "Diabetes",        prevalencePercent: 16 },
    ],
    utilizationMetrics: { edVisitsPer1000: 290, admissionsPer1000: 98, readmissionsRate: 6.9, avgLengthOfStay: 3.3 },
    qualityMetrics:     { diabetesA1cControl: 69, colorectalScreeningRate: 61, breastCancerScreeningRate: 67, medicationAdherence: 74 },
    socialRiskIndicators: { foodInsecurityPercent: 13, transportationBarrierPercent: 14, housingInstabilityPercent: 10 },
    highCostMembers: 338,
  },
];

// ---------------------------------------------------------------------------
// Population insights — actionable findings tied to population data patterns.
// contractId is optional; omitting it means the insight spans all contracts.
// ---------------------------------------------------------------------------

export const mockInsights: PopulationInsight[] = [
  {
    id: "pop-001",
    title: "High ED utilization among COPD patients",
    description:
      "COPD patients in the Southeast Pioneer ACO are visiting the emergency department at 388 visits per 1,000 — 38% above the ACO benchmark of 280.",
    whyItMatters:
      "Frequent ED visits signal poor respiratory disease management, drive cost above target PMPM, and are largely preventable with proactive outreach.",
    recommendedAction:
      "Deploy a respiratory disease management program targeting the 1,322 COPD and high-risk members, including rescue inhaler protocols and 30-day follow-up calls after each ED visit.",
    impactTypes: ["Cost", "Utilization", "Patient Outcomes"],
    priority: "High",
    contractId: "mssp-003",
  },
  {
    id: "pop-002",
    title: "Uncontrolled diabetes driving inpatient admissions",
    description:
      "41% of members in the United MA Midwest contract have diabetes, and only 52% have A1c levels in control — the lowest across all Medicare Advantage contracts.",
    whyItMatters:
      "Uncontrolled diabetes is the leading driver of preventable inpatient admissions and long-term complications including CKD and CHF, compounding costs across multiple conditions.",
    recommendedAction:
      "Launch a structured diabetes care management program: monthly outreach to members with A1c >9, remote glucometer monitoring for the top 500 highest-risk diabetics, and PCP co-management protocols.",
    impactTypes: ["Cost", "Quality", "Patient Outcomes"],
    priority: "High",
    contractId: "ma-004",
  },
  {
    id: "pop-003",
    title: "Critical preventive screening gaps in commercial population",
    description:
      "Colorectal screening compliance is at 38% and breast cancer screening at 55% in the Aetna Commercial ACO — among the lowest across all contracts.",
    whyItMatters:
      "Screening compliance is directly tied to quality contract thresholds and shared savings eligibility. Poor rates also mean late-stage diagnoses with significantly higher treatment costs.",
    recommendedAction:
      "Run a targeted preventive care outreach campaign: mailed FIT-kit kits for colorectal screening eligibles, and SMS-based mammography reminders for women aged 50–74.",
    impactTypes: ["Quality", "Patient Outcomes"],
    priority: "Medium",
    contractId: "comm-001",
  },
  {
    id: "pop-004",
    title: "High-cost member concentration requires intensive management",
    description:
      "460 members (5%) in the United MA Midwest contract account for a disproportionate share of total spend, with the highest concentration of any contract in the portfolio.",
    whyItMatters:
      "Without focused care management, high-cost members follow predictable escalation patterns — unmanaged CHF, COPD, and CKD admissions that repeat every 60–90 days.",
    recommendedAction:
      "Assign dedicated care managers to the top 460 high-cost members, establish weekly check-ins for members with 2+ chronic conditions, and co-locate a care coordinator at the 3 highest-volume PCPs.",
    impactTypes: ["Cost", "Utilization"],
    priority: "High",
    contractId: "ma-004",
  },
  {
    id: "pop-005",
    title: "Transportation barriers driving missed appointments and ED use",
    description:
      "22% of members in the Humana Retail contract report transportation as a barrier to care — the highest rate in the commercial portfolio. These members show 40% higher ED utilization.",
    whyItMatters:
      "Missed primary care appointments create care gaps, delay chronic disease management, and shift utilization to costlier settings, directly impacting both cost and quality metrics.",
    recommendedAction:
      "Partner with a non-emergency medical transport (NEMT) vendor and ride-share integration for the 900+ affected members. Expand same-day telehealth access as a complementary option for shift workers.",
    impactTypes: ["Utilization", "Patient Outcomes"],
    priority: "Medium",
    contractId: "comm-004",
  },
  {
    id: "pop-006",
    title: "Medication non-adherence threatening MA Star Rating",
    description:
      "Medication adherence in the Humana Gold Plus suburban contract is 74% — below the 80% threshold needed to maintain current Star Rating on the plan all-cause adherence measure.",
    whyItMatters:
      "Star Rating is a direct revenue multiplier for Medicare Advantage plans. Dropping below 4 Stars can reduce plan bonus payments by up to 5% and affect member retention.",
    recommendedAction:
      "Implement a pharmacy-led medication adherence program: automatic 90-day refill enrollment, pharmacist outreach to the 400+ members with adherence gaps, and targeted statin/ACE inhibitor review.",
    impactTypes: ["Quality", "Cost"],
    priority: "Medium",
    contractId: "ma-002",
  },
  {
    id: "pop-007",
    title: "Social risk factors compounding chronic disease burden",
    description:
      "Across the Pioneer ACO Southeast contract, 22% of members report food insecurity, 19% face transportation barriers, and 14% have housing instability — the highest social risk profile in the ACO portfolio.",
    whyItMatters:
      "Social determinants of health account for up to 40% of health outcomes. Members with multiple social risk factors have 2–3x higher hospitalization rates and are harder to reach through standard outreach.",
    recommendedAction:
      "Integrate a community health worker (CHW) program targeting members with 2+ social risk factors. Partner with local food banks, housing assistance programs, and Medicaid transportation benefits.",
    impactTypes: ["Cost", "Patient Outcomes", "Utilization"],
    priority: "High",
    contractId: "mssp-003",
  },
  {
    id: "pop-008",
    title: "Rising-risk members lack structured care management enrollment",
    description:
      "Across all contracts, 19,801 members are classified as rising-risk. Only an estimated 30% of these members are enrolled in any care management or care coordination program.",
    whyItMatters:
      "Rising-risk members are the highest-leverage intervention target: they have not yet incurred high costs but are on a trajectory toward complex, expensive care without proactive management.",
    recommendedAction:
      "Establish a rising-risk outreach protocol: automated care management enrollment triggers for members meeting 2+ risk criteria, with a 90-day structured touchpoint program and PCP co-management handoff.",
    impactTypes: ["Cost", "Utilization", "Patient Outcomes"],
    priority: "High",
  },
];

// ---------------------------------------------------------------------------
// Population patient list rows (overview table)
// ---------------------------------------------------------------------------

export const mockPopulationPatients: PopulationPatientRow[] = [
  {
    id: "pp-001",
    opportunity: "High",
    name: "Wheeler, Jess",
    mrn: "102938",
    dateOfBirth: "Dec 18, 1953",
    age: 72,
    gender: "M",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 0,
    providerName: "Frank Wilson",
    recentVisitDate: "Jun 26, 2014",
    nextAttributedProviderVisitDate: "--",
    organizationClass: "ACO",
    organization: "Northeast Care Network",
    provider: "Frank Wilson",
    payer: "CMS",
    plan: "MSSP",
    registry: "Chronic Care",
    measure: "A1c Control",
    measureStatus: "Open",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
  {
    id: "pp-002",
    opportunity: "High",
    name: "Ray, Antione",
    mrn: "133219",
    dateOfBirth: "May 4, 2000",
    age: 25,
    gender: "M",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 0,
    providerName: "Sherry Johnson",
    recentVisitDate: "Apr 17, 2014",
    nextAttributedProviderVisitDate: "--",
    organizationClass: "MA",
    organization: "Suburban MA Partners",
    provider: "Sherry Johnson",
    payer: "Humana",
    plan: "Gold Plus",
    registry: "Preventive Care",
    measure: "Colorectal Screening",
    measureStatus: "Open",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
  {
    id: "pp-003",
    opportunity: "High",
    name: "Nichols, Bryant",
    mrn: "130005",
    dateOfBirth: "Jan 1, 2005",
    age: 21,
    gender: "M",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 0,
    providerName: "--",
    recentVisitDate: "Dec 28, 2013",
    nextAttributedProviderVisitDate: "--",
    organizationClass: "Commercial",
    organization: "Aetna Employer Alliance",
    provider: "Unassigned",
    payer: "Aetna",
    plan: "Commercial ACO",
    registry: "Behavioral Health",
    measure: "Follow-up after ED",
    measureStatus: "Open",
    scorability: "Potentially Scorable",
    attributionStatus: "Pending",
  },
  {
    id: "pp-004",
    opportunity: "High",
    name: "Aguilar, Daryl",
    mrn: "111854",
    dateOfBirth: "Apr 17, 1969",
    age: 56,
    gender: "M",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 0,
    providerName: "Andrea Sullivan",
    recentVisitDate: "Aug 17, 2014",
    nextAttributedProviderVisitDate: "--",
    organizationClass: "ACO",
    organization: "Southeast Pioneer ACO",
    provider: "Andrea Sullivan",
    payer: "CMS",
    plan: "ACO REACH",
    registry: "Respiratory",
    measure: "COPD Management",
    measureStatus: "Open",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
  {
    id: "pp-005",
    opportunity: "High",
    name: "Morris, Kate",
    mrn: "69375",
    dateOfBirth: "Dec 23, 1963",
    age: 62,
    gender: "F",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 0,
    providerName: "--",
    recentVisitDate: "Jul 13, 2014",
    nextAttributedProviderVisitDate: "--",
    organizationClass: "MA",
    organization: "Metro MA Preferred",
    provider: "Unassigned",
    payer: "BlueCross BlueShield",
    plan: "MA Preferred",
    registry: "Medication",
    measure: "Adherence",
    measureStatus: "Open",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
  {
    id: "pp-006",
    opportunity: "High",
    name: "Ho, Lacy",
    mrn: "88752",
    dateOfBirth: "Aug 29, 1933",
    age: 92,
    gender: "M",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 0,
    providerName: "Nicole Kraft",
    recentVisitDate: "Jul 31, 2014",
    nextAttributedProviderVisitDate: "--",
    organizationClass: "ACO",
    organization: "Great Lakes ACO",
    provider: "Nicole Kraft",
    payer: "CMS",
    plan: "MSSP",
    registry: "Transitions",
    measure: "Post Discharge Follow-up",
    measureStatus: "Open",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
  {
    id: "pp-007",
    opportunity: "High",
    name: "Jacobs, Benjamin",
    mrn: "70412",
    dateOfBirth: "Oct 4, 1952",
    age: 73,
    gender: "M",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 0,
    providerName: "--",
    recentVisitDate: "Apr 15, 2014",
    nextAttributedProviderVisitDate: "--",
    organizationClass: "Commercial",
    organization: "Retail Sector PCMH",
    provider: "Unassigned",
    payer: "Humana",
    plan: "Commercial PCMH",
    registry: "Social Risk",
    measure: "Transportation",
    measureStatus: "Open",
    scorability: "Potentially Scorable",
    attributionStatus: "Pending",
  },
  {
    id: "pp-008",
    opportunity: "High",
    name: "Jefferson, Sabrina",
    mrn: "9145",
    dateOfBirth: "May 25, 1985",
    age: 40,
    gender: "F",
    birthSex: "--",
    primaryContact: "8162019081",
    contactType: "Home Phone",
    totalUnmetMeasures: 0,
    providerName: "--",
    recentVisitDate: "Aug 11, 2016",
    nextAttributedProviderVisitDate: "--",
    organizationClass: "Commercial",
    organization: "Public Sector Alliance",
    provider: "Unassigned",
    payer: "BlueCross BlueShield",
    plan: "Commercial ACO",
    registry: "Women Health",
    measure: "Breast Screening",
    measureStatus: "Open",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
  {
    id: "pp-009",
    opportunity: "High",
    name: "Rush, Rebecka",
    mrn: "140281",
    dateOfBirth: "Mar 28, 2002",
    age: 23,
    gender: "F",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 0,
    providerName: "Carlos Torres",
    recentVisitDate: "Sep 10, 2014",
    nextAttributedProviderVisitDate: "--",
    organizationClass: "Commercial",
    organization: "Tech Sector Care Org",
    provider: "Carlos Torres",
    payer: "Cigna",
    plan: "Total Care",
    registry: "Behavioral Health",
    measure: "Depression Follow-up",
    measureStatus: "Open",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
  {
    id: "pp-010",
    opportunity: "Medium",
    name: "Parker, Joan",
    mrn: "55287",
    dateOfBirth: "Nov 5, 1960",
    age: 65,
    gender: "F",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 2,
    providerName: "Angela Price",
    recentVisitDate: "Jan 12, 2015",
    nextAttributedProviderVisitDate: "Sep 4, 2016",
    organizationClass: "MA",
    organization: "West Coast MA Group",
    provider: "Angela Price",
    payer: "Aetna",
    plan: "Medicare Select",
    registry: "Preventive Care",
    measure: "Colorectal Screening",
    measureStatus: "In Progress",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
  {
    id: "pp-011",
    opportunity: "Medium",
    name: "Ortiz, Manuel",
    mrn: "110284",
    dateOfBirth: "Jul 14, 1971",
    age: 54,
    gender: "M",
    birthSex: "--",
    primaryContact: "9134478001",
    contactType: "Mobile",
    totalUnmetMeasures: 1,
    providerName: "Diane Wells",
    recentVisitDate: "Mar 16, 2015",
    nextAttributedProviderVisitDate: "Aug 29, 2016",
    organizationClass: "ACO",
    organization: "Northeast Care Network",
    provider: "Diane Wells",
    payer: "CMS",
    plan: "ACO REACH",
    registry: "Diabetes",
    measure: "A1c Control",
    measureStatus: "In Progress",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
  {
    id: "pp-012",
    opportunity: "Low",
    name: "Webb, Alison",
    mrn: "67219",
    dateOfBirth: "Feb 2, 1991",
    age: 35,
    gender: "F",
    birthSex: "--",
    primaryContact: "--",
    contactType: "--",
    totalUnmetMeasures: 1,
    providerName: "Marcus Webb",
    recentVisitDate: "May 8, 2015",
    nextAttributedProviderVisitDate: "Oct 10, 2016",
    organizationClass: "Commercial",
    organization: "Aetna Employer Alliance",
    provider: "Marcus Webb",
    payer: "Aetna",
    plan: "Commercial ACO",
    registry: "Preventive Care",
    measure: "Medication Adherence",
    measureStatus: "Closed",
    scorability: "Scorable",
    attributionStatus: "Attributed",
  },
];

const TARGET_SYNTHETIC_PATIENT_COUNT = 60890;

const FIRST_NAMES = [
  "Avery", "Jordan", "Taylor", "Alex", "Riley", "Cameron", "Morgan", "Casey", "Parker", "Drew",
  "Skyler", "Reese", "Quinn", "Harper", "Mason", "Nora", "Elena", "Liam", "Noah", "Sophia",
  "Ethan", "Mia", "Olivia", "Isabella", "Mateo", "Aria", "Zoe", "Caleb", "Leah", "Daniel",
];

const LAST_NAMES = [
  "Wheeler", "Ray", "Nichols", "Aguilar", "Morris", "Ho", "Jacobs", "Jefferson", "Rush", "Parker",
  "Ortiz", "Webb", "Patel", "Chen", "Johnson", "Sullivan", "Torres", "Ramirez", "Diaz", "Clark",
  "Evans", "Brooks", "Bryant", "Reed", "Foster", "Griffin", "Bennett", "Coleman", "Hayes", "Price",
];

const CONTACT_TYPES = ["Mobile", "Home Phone", "Work Phone"] as const;

function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  return function random() {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildSyntheticPopulationPatients(targetCount = TARGET_SYNTHETIC_PATIENT_COUNT): PopulationPatientRow[] {
  const random = seededRandom(20260312);
  const templates = mockPopulationPatients;
  const rows: PopulationPatientRow[] = [];

  for (let i = 0; i < targetCount; i++) {
    const template = templates[i % templates.length];
    const first = FIRST_NAMES[randomInt(random, 0, FIRST_NAMES.length - 1)];
    const last = LAST_NAMES[randomInt(random, 0, LAST_NAMES.length - 1)];
    const age = Math.max(18, Math.min(96, template.age + randomInt(random, -8, 8)));

    const dobYear = new Date().getFullYear() - age;
    const dobMonth = randomInt(random, 0, 11);
    const dobDay = randomInt(random, 1, 28);
    const dob = new Date(dobYear, dobMonth, dobDay);

    const recentVisit = new Date(2026, randomInt(random, 0, 11), randomInt(random, 1, 28));
    const nextVisitOffset = randomInt(random, 15, 180);
    const nextVisit = new Date(recentVisit.getTime() + nextVisitOffset * 24 * 60 * 60 * 1000);

    const opportunityRoll = random();
    const opportunity: PopulationPatientRow["opportunity"] =
      opportunityRoll < 0.28 ? "High" : opportunityRoll < 0.67 ? "Medium" : "Low";

    const measureStatusRoll = random();
    const measureStatus =
      opportunity === "High"
        ? measureStatusRoll < 0.82
          ? "Open"
          : "In Progress"
        : opportunity === "Medium"
        ? measureStatusRoll < 0.48
          ? "Open"
          : measureStatusRoll < 0.9
          ? "In Progress"
          : "Closed"
        : measureStatusRoll < 0.2
        ? "Open"
        : measureStatusRoll < 0.55
        ? "In Progress"
        : "Closed";

    const totalUnmetMeasures =
      measureStatus === "Closed"
        ? randomInt(random, 0, 1)
        : opportunity === "High"
        ? randomInt(random, 3, 6)
        : opportunity === "Medium"
        ? randomInt(random, 1, 4)
        : randomInt(random, 0, 2);

    const hasContact = random() > 0.18;
    const contactType = CONTACT_TYPES[randomInt(random, 0, CONTACT_TYPES.length - 1)];
    const phone = `9${randomInt(random, 10, 99)}${randomInt(random, 100, 999)}${randomInt(random, 1000, 9999)}`;

    rows.push({
      ...template,
      id: `pp-${String(i + 1).padStart(5, "0")}`,
      opportunity,
      name: `${last}, ${first}`,
      mrn: String(100000 + i),
      dateOfBirth: formatDate(dob),
      age,
      gender: random() < 0.52 ? "F" : "M",
      birthSex: random() < 0.52 ? "Female" : "Male",
      primaryContact: hasContact ? phone : "--",
      contactType: hasContact ? contactType : "--",
      totalUnmetMeasures,
      measureStatus,
      recentVisitDate: formatDate(recentVisit),
      nextAttributedProviderVisitDate:
        template.providerName === "--" || random() < 0.22 ? "--" : formatDate(nextVisit),
      attributionStatus:
        template.providerName === "--" || random() < 0.2 ? "Pending" : "Attributed",
      providerName: template.provider === "Unassigned" && random() < 0.72 ? "--" : template.provider,
    });
  }

  return rows;
}

const generatedPopulationPatients = buildSyntheticPopulationPatients();

const populationProfileByContractId = new Map(
  mockPopulationProfiles.map((profile) => [profile.contractId, profile] as const)
);

const contractInsightsByContractId = new Map<string, PopulationInsight[]>();
const globalPopulationInsights = mockInsights.filter((insight) => !insight.contractId);

// ---------------------------------------------------------------------------
// Utility functions for derived / aggregated views
// ---------------------------------------------------------------------------

export function getPopulationProfile(contractId: string): MemberPopulationProfile | undefined {
  return populationProfileByContractId.get(contractId);
}

export function getInsightsForContract(contractId: string): PopulationInsight[] {
  const cached = contractInsightsByContractId.get(contractId);
  if (cached) return cached;

  // Return insights specific to this contract plus any global insights
  const scoped = mockInsights.filter((insight) => insight.contractId === contractId);
  const combined = [...globalPopulationInsights, ...scoped];
  contractInsightsByContractId.set(contractId, combined);
  return combined;
}

export function getPopulationPatients(): PopulationPatientRow[] {
  return generatedPopulationPatients;
}

function parseDateLabel(value: string): Date | null {
  if (!value || value === "--" || value === "TBD") return null;
  const asDate = new Date(value);
  return Number.isNaN(asDate.getTime()) ? null : asDate;
}

function toDayDiff(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function derivePreVisitCareGaps(row: PopulationPatientRow): PreVisitCareGap[] {
  const priority = row.opportunity;
  const primary: PreVisitCareGap = {
    id: `${row.id}-previsit-primary`,
    measureName: row.measure,
    priority,
    rationale:
      row.measureStatus === "Open"
        ? "Open measure likely closable during scheduled visit with focused prep."
        : "In-progress measure can be advanced to closure with visit-day action.",
    recommendedAction:
      row.measureStatus === "Open"
        ? "Pre-stage order/documentation checklist and complete during visit."
        : "Finalize pending clinical steps and close gap before checkout.",
  };

  const followUp: PreVisitCareGap = {
    id: `${row.id}-previsit-followup`,
    measureName: "Follow-up after ED",
    priority: row.opportunity === "Low" ? "Medium" : "High",
    rationale: "Recent utilization pattern suggests benefit from proactive follow-up coordination.",
    recommendedAction: "Confirm visit goals, assess barriers, and schedule post-visit follow-up touchpoint.",
  };

  const adherence: PreVisitCareGap = {
    id: `${row.id}-previsit-adherence`,
    measureName: "Medication Adherence",
    priority: row.opportunity === "High" ? "High" : "Medium",
    rationale: "Visit is a high-value moment to resolve refill, access, or side-effect barriers.",
    recommendedAction: "Run med reconciliation and identify adherence intervention before discharge.",
  };

  return [primary, followUp, adherence].slice(0, 2 + (row.opportunity === "High" ? 1 : 0));
}

export function getPreVisitPlanningRows(): PreVisitPlanningRow[] {
  const now = new Date();
  return generatedPopulationPatients
    .filter((row) => row.attributionStatus === "Attributed")
    .map((row) => {
      const apptDate = parseDateLabel(row.nextAttributedProviderVisitDate);
      return { row, apptDate };
    })
    .filter((item): item is { row: PopulationPatientRow; apptDate: Date } => Boolean(item.apptDate))
    .map(({ row, apptDate }) => {
      const appointmentInDays = toDayDiff(now, apptDate);
      const topCareGaps = derivePreVisitCareGaps(row);
      const totalOpenGaps = row.measureStatus === "Closed" ? 0 : Math.max(1, row.totalUnmetMeasures);
      const totalClosableGaps = Math.min(topCareGaps.length, totalOpenGaps + (row.measureStatus === "Open" ? 1 : 0));
      const opportunityWeight = row.opportunity === "High" ? 30 : row.opportunity === "Medium" ? 18 : 10;
      const urgencyWeight = Math.max(0, 25 - Math.min(25, appointmentInDays));
      const closableWeight = totalClosableGaps * 12;
      const prepScore = Math.min(100, opportunityWeight + urgencyWeight + closableWeight);

      return {
        patientId: row.id,
        patientName: row.name,
        mrn: row.mrn,
        providerName: row.providerName,
        organization: row.organization,
        payer: row.payer,
        opportunity: row.opportunity,
        appointmentDate: row.nextAttributedProviderVisitDate,
        appointmentInDays,
        totalOpenGaps,
        totalClosableGaps,
        topCareGaps,
        preVisitPrepSummary:
          `Prioritize ${topCareGaps[0]?.measureName ?? "quality gaps"} and complete ${Math.max(1, totalClosableGaps)} closure actions during this visit.`,
        prepScore,
      } satisfies PreVisitPlanningRow;
    })
    .sort((a, b) => {
      if (a.appointmentInDays !== b.appointmentInDays) return a.appointmentInDays - b.appointmentInDays;
      return b.prepScore - a.prepScore;
    });
}

export function getPreVisitPlanningSummary(rows = getPreVisitPlanningRows()): PreVisitPlanningSummary {
  const total = rows.length;
  const highPriorityPrepCount = rows.filter((row) => row.opportunity === "High" || row.prepScore >= 75).length;
  const next7DayVisits = rows.filter((row) => row.appointmentInDays <= 7).length;
  const totalClosable = rows.reduce((sum, row) => sum + row.totalClosableGaps, 0);

  return {
    totalAttributedWithUpcomingVisits: total,
    totalPrepCandidates: total,
    highPriorityPrepCount,
    avgClosableGapsPerVisit: total ? Number((totalClosable / total).toFixed(1)) : 0,
    next7DayVisits,
  };
}

function buildMemberEvidenceFacts(row: PopulationPatientRow): MemberEvidenceFact[] {
  return [
    {
      id: `${row.id}-fact-note-mammo`,
      date: "2025-05-14",
      sourceType: "clinical-note",
      agent: "chart_scrubbing_agent",
      title: "Out-of-network mammogram detected in note",
      detail:
        "Chart-scrubbing agent parsed PCP note text indicating completed mammogram at an external imaging center in May 2025.",
      impact: "Structured evidence generated and breast screening gap marked as Inferred Closed.",
      confidence: 0.92,
    },
    {
      id: `${row.id}-fact-claim-followup`,
      date: "2026-01-22",
      sourceType: "claim",
      agent: "claims_friction_agent",
      title: "Recent ED claim without attributed follow-up",
      detail:
        "Claims pattern indicates low-acuity ED encounter and no completed attributed follow-up visit within 7 days.",
      impact: "Member prioritized for post-ED outreach workflow.",
      confidence: 0.86,
    },
    {
      id: `${row.id}-fact-lab-a1c`,
      date: "2026-02-08",
      sourceType: "lab",
      agent: "quality_care_gap_agent",
      title: "A1c remains above control threshold",
      detail: "Most recent A1c value remains above control threshold for measure closure.",
      impact: "Supports diabetes care management escalation.",
      confidence: 0.88,
    },
    {
      id: `${row.id}-fact-referral`,
      date: "2026-02-18",
      sourceType: "agent-inference",
      agent: "evidence_therapy_trial_agent",
      title: "Referral + trial signal identified",
      detail:
        "Evidence/trial agent identified likely eligibility pattern for referral to specialty program and trial pre-screen review.",
      impact: "Recommend specialist referral and research coordinator handoff.",
      confidence: 0.74,
    },
  ];
}

function buildMemberMeasureGaps(row: PopulationPatientRow): MemberMeasureGap[] {
  return [
    {
      id: `${row.id}-measure-primary`,
      measureName: row.measure,
      status: row.measureStatus === "Closed" ? "Closed" : row.measureStatus === "In Progress" ? "In Progress" : "Open",
      scorability: row.scorability,
      priority: row.opportunity,
      supportingFactIds: [`${row.id}-fact-claim-followup`, `${row.id}-fact-lab-a1c`],
      recommendedAction: "Execute agent-suggested outreach and close next attributable care opportunity.",
    },
    {
      id: `${row.id}-measure-breast-screen`,
      measureName: "Breast Cancer Screening",
      status: "Inferred Closed",
      scorability: "Scorable",
      priority: "Medium",
      supportingFactIds: [`${row.id}-fact-note-mammo`],
      recommendedAction: "Submit structured abstraction for quality closure confirmation.",
    },
    {
      id: `${row.id}-measure-followup`,
      measureName: "Follow-up after ED",
      status: "Open",
      scorability: "Potentially Scorable",
      priority: "High",
      supportingFactIds: [`${row.id}-fact-claim-followup`, `${row.id}-fact-referral`],
      recommendedAction: "Schedule follow-up and deploy navigator outreach within 48 hours.",
    },
  ];
}

function buildMemberAgentSuggestions(row: PopulationPatientRow): MemberAgentSuggestion[] {
  return [
    {
      id: `${row.id}-agent-caregap`,
      agentId: "quality_care_gap",
      agentLabel: "Quality Care Gap Agent",
      category: "Care Gap",
      title: "Close remaining quality opportunities this week",
      summary: "Member has actionable open measures with evidence-backed closure paths.",
      whyItMatters: "Closing these gaps improves contract quality performance and reduces avoidable utilization risk.",
      evidenceFactIds: [`${row.id}-fact-lab-a1c`, `${row.id}-fact-claim-followup`],
      confidence: 0.9,
      nextAction: "Launch targeted portal + RN follow-up outreach workflow.",
    },
    {
      id: `${row.id}-agent-evidence`,
      agentId: "evidence_therapy_trial",
      agentLabel: "Evidence & Trial Agent",
      category: "Evidence",
      title: "Evidence-based escalation opportunity",
      summary: "Clinical pattern suggests candidate for guideline-aligned specialist escalation.",
      whyItMatters: "Timely escalation can reduce downstream ED and admission risk.",
      evidenceFactIds: [`${row.id}-fact-referral`],
      confidence: 0.76,
      nextAction: "Initiate referral review and trial pre-screen conversation.",
    },
    {
      id: `${row.id}-agent-chart`,
      agentId: "claims_friction",
      agentLabel: "Chart Scrubbing + Claims Friction",
      category: "Care Gap",
      title: "Recovered external closure evidence",
      summary: "Agent detected out-of-network mammogram note and converted it into structured quality evidence.",
      whyItMatters: "Prevents false-open gap status and reduces unnecessary outreach burden.",
      evidenceFactIds: [`${row.id}-fact-note-mammo`],
      confidence: 0.92,
      nextAction: "Confirm abstraction acceptance and close breast screening gap.",
    },
  ];
}

function buildPopulationMemberDetail(row: PopulationPatientRow): PopulationMemberDetail {
  const evidenceFacts = buildMemberEvidenceFacts(row);
  const measureGaps = buildMemberMeasureGaps(row);
  const agentSuggestions = buildMemberAgentSuggestions(row);

  return {
    id: row.id,
    name: row.name,
    mrn: row.mrn,
    dateOfBirth: row.dateOfBirth,
    age: row.age,
    gender: row.gender,
    birthSex: row.birthSex,
    payer: row.payer,
    plan: row.plan,
    organization: row.organization,
    providerName: row.providerName,
    attributionStatus: row.attributionStatus,
    registry: row.registry,
    opportunity: row.opportunity,
    preferredLanguage: "English",
    portalEnrolled: true,
    communicationMethods: [
      {
        id: `${row.id}-comm-portal`,
        type: "portal",
        label: "Patient Portal",
        destination: `${row.name.split(",")[0].toLowerCase()}@portal.demo`,
        available: true,
      },
      {
        id: `${row.id}-comm-phone`,
        type: "phone",
        label: "Primary Phone",
        destination: row.primaryContact,
        available: row.primaryContact !== "--",
      },
    ],
    measureGaps,
    evidenceFacts,
    agentSuggestions,
    documents: [
      { id: `${row.id}-doc-1`, date: "2026-01-22", type: "Discharge Summary", title: "ED discharge summary", source: "In-network hospital" },
      { id: `${row.id}-doc-2`, date: "2025-05-14", type: "Imaging report", title: "External mammogram mention", source: "Out-of-network" },
    ],
    clinicalNotes: [
      { id: `${row.id}-note-1`, date: "2026-02-03", author: "Andrea Sullivan, MD", noteType: "PCP Follow-up", excerpt: "Discussed preventive screenings and transportation barriers; member open to portal reminders." },
      { id: `${row.id}-note-2`, date: "2025-05-14", author: "Chart Scrubbing Agent", noteType: "Agent abstraction", excerpt: "Detected mammogram completion from external provider note; generated structured closure candidate." },
    ],
    medications: [
      { id: `${row.id}-med-1`, name: "Metformin", dose: "1000 mg", frequency: "BID", lastFillDate: "2026-02-01", adherenceStatus: "At risk" },
      { id: `${row.id}-med-2`, name: "Atorvastatin", dose: "40 mg", frequency: "Daily", lastFillDate: "2026-01-20", adherenceStatus: "Active" },
    ],
    conditions: [
      { id: `${row.id}-cond-1`, name: row.registry, onsetDate: "2019-06-01", status: "Active" },
      { id: `${row.id}-cond-2`, name: "Hypertension", onsetDate: "2020-03-15", status: "Active" },
    ],
    orders: [
      { id: `${row.id}-ord-1`, orderType: "Lab", description: "HbA1c", status: "Ordered", placedDate: "2026-02-08" },
      { id: `${row.id}-ord-2`, orderType: "Referral", description: "Specialist referral review", status: "Pending", placedDate: "2026-02-18" },
    ],
    labs: [
      { id: `${row.id}-lab-1`, name: "HbA1c", value: "9.1%", referenceRange: "< 8.0%", collectedDate: "2026-02-08" },
      { id: `${row.id}-lab-2`, name: "LDL", value: "102 mg/dL", referenceRange: "< 100 mg/dL", collectedDate: "2026-02-08" },
    ],
    appointments: [
      { id: `${row.id}-appt-1`, date: row.recentVisitDate, visitType: "PCP", provider: row.providerName, status: "Completed" },
      { id: `${row.id}-appt-2`, date: row.nextAttributedProviderVisitDate === "--" ? "TBD" : row.nextAttributedProviderVisitDate, visitType: "Follow-up", provider: row.providerName, status: row.nextAttributedProviderVisitDate === "--" ? "Not Scheduled" : "Scheduled" },
    ],
    vitals: [
      { id: `${row.id}-vital-1`, date: "2026-02-03", label: "BP", value: "146/92" },
      { id: `${row.id}-vital-2`, date: "2026-02-03", label: "BMI", value: "31.2" },
    ],
    suggestedPrompts: [
      "Why is this member still high priority?",
      "Summarize open care gaps and supporting evidence",
      "Did chart scrubbing find closure evidence from external notes?",
      "What referral or trial opportunities are available?",
      "Draft a patient portal message for immediate follow-up",
    ],
  };
}

export function getPopulationMemberDetail(memberId: string) {
  const row = generatedPopulationPatients.find((patient) => patient.id === memberId);
  if (row) return buildPopulationMemberDetail(row);

  const trialPatient = lifeSciencesTrials
    .flatMap((trial) => trial.patientList)
    .find((patient) => patient.id === memberId);

  if (!trialPatient) return null;

  const trialRow: PopulationPatientRow = {
    id: trialPatient.id,
    opportunity: trialPatient.opportunity,
    name: trialPatient.fullName,
    mrn: trialPatient.mrn,
    dateOfBirth: trialPatient.dateOfBirth,
    age: trialPatient.age,
    gender: trialPatient.gender,
    birthSex: trialPatient.birthSex,
    primaryContact: trialPatient.primaryContact,
    contactType: trialPatient.contactType,
    totalUnmetMeasures: trialPatient.totalUnmetMeasures,
    providerName: trialPatient.provider,
    recentVisitDate: "--",
    nextAttributedProviderVisitDate: "--",
    organizationClass: trialPatient.organizationClass,
    organization: trialPatient.organization,
    provider: trialPatient.provider,
    payer: trialPatient.payer,
    plan: trialPatient.plan,
    registry: trialPatient.registry,
    measure: trialPatient.measure,
    measureStatus: trialPatient.measureStatus,
    scorability: trialPatient.scorability,
    attributionStatus: trialPatient.attributionStatus,
  };

  return buildPopulationMemberDetail(trialRow);
}

/** Aggregate population stats across all contracts. */
export function getAggregatePopulation() {
  const profiles = mockPopulationProfiles;
  const totalMembers = profiles.reduce((s, p) => s + p.totalMembers, 0);

  return {
    totalMembers,
    highRiskMembers:   profiles.reduce((s, p) => s + p.riskDistribution.highRisk, 0),
    risingRiskMembers: profiles.reduce((s, p) => s + p.riskDistribution.risingRisk, 0),
    lowRiskMembers:    profiles.reduce((s, p) => s + p.riskDistribution.lowRisk, 0),
    highCostMembers:   profiles.reduce((s, p) => s + p.highCostMembers, 0),

    // Weighted average age distribution (percentages)
    ageDistribution: {
      under18:   +(profiles.reduce((s, p) => s + (p.ageDistribution.under18   * p.totalMembers), 0) / totalMembers).toFixed(1),
      age18to44: +(profiles.reduce((s, p) => s + (p.ageDistribution.age18to44 * p.totalMembers), 0) / totalMembers).toFixed(1),
      age45to64: +(profiles.reduce((s, p) => s + (p.ageDistribution.age45to64 * p.totalMembers), 0) / totalMembers).toFixed(1),
      age65plus: +(profiles.reduce((s, p) => s + (p.ageDistribution.age65plus * p.totalMembers), 0) / totalMembers).toFixed(1),
    },

    // Average utilization (simple mean across contracts)
    avgEdVisitsPer1000:    +(profiles.reduce((s, p) => s + p.utilizationMetrics.edVisitsPer1000,    0) / profiles.length).toFixed(0),
    avgAdmissionsPer1000:  +(profiles.reduce((s, p) => s + p.utilizationMetrics.admissionsPer1000,  0) / profiles.length).toFixed(0),
    avgReadmissionsRate:   +(profiles.reduce((s, p) => s + p.utilizationMetrics.readmissionsRate,   0) / profiles.length).toFixed(1),
    avgLengthOfStay:       +(profiles.reduce((s, p) => s + p.utilizationMetrics.avgLengthOfStay,    0) / profiles.length).toFixed(1),

    // Average quality metrics
    avgA1cControl:        +(profiles.reduce((s, p) => s + p.qualityMetrics.diabetesA1cControl,       0) / profiles.length).toFixed(0),
    avgColorectalScreen:  +(profiles.reduce((s, p) => s + p.qualityMetrics.colorectalScreeningRate,  0) / profiles.length).toFixed(0),
    avgBreastScreen:      +(profiles.reduce((s, p) => s + p.qualityMetrics.breastCancerScreeningRate,0) / profiles.length).toFixed(0),
    avgMedAdherence:      +(profiles.reduce((s, p) => s + p.qualityMetrics.medicationAdherence,      0) / profiles.length).toFixed(0),

    // Average social risk
    avgFoodInsecurity:        +(profiles.reduce((s, p) => s + p.socialRiskIndicators.foodInsecurityPercent,       0) / profiles.length).toFixed(0),
    avgTransportBarrier:      +(profiles.reduce((s, p) => s + p.socialRiskIndicators.transportationBarrierPercent,0) / profiles.length).toFixed(0),
    avgHousingInstability:    +(profiles.reduce((s, p) => s + p.socialRiskIndicators.housingInstabilityPercent,   0) / profiles.length).toFixed(0),
  };
}

/** Weighted aggregate of top chronic conditions across all contracts. */
export function getAggregateConditions(): ChronicCondition[] {
  const totalMembers = mockPopulationProfiles.reduce((s, p) => s + p.totalMembers, 0);
  const conditionMap = new Map<string, number>();

  for (const profile of mockPopulationProfiles) {
    for (const cond of profile.topChronicConditions) {
      const weighted = (cond.prevalencePercent * profile.totalMembers) / totalMembers;
      conditionMap.set(cond.condition, (conditionMap.get(cond.condition) ?? 0) + weighted);
    }
  }

  return Array.from(conditionMap.entries())
    .map(([condition, prevalencePercent]) => ({
      condition,
      prevalencePercent: Math.round(prevalencePercent * 10) / 10,
    }))
    .sort((a, b) => b.prevalencePercent - a.prevalencePercent)
    .slice(0, 8);
}
