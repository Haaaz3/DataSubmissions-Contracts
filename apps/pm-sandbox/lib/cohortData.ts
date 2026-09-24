import { Cohort, CohortCategory } from "@/types/cohort";

// ---------------------------------------------------------------------------
// Mock cohorts — each represents a meaningful population segment that a
// population health leader would need to act on.  Ordered by priority.
// ---------------------------------------------------------------------------

export const mockCohorts: Cohort[] = [
  // ── High Priority / Action Needed ────────────────────────────────────────

  {
    id:                  "cohort-001",
    name:                "Unmanaged High-Risk Diabetes Members",
    contractId:          "ma-004",
    contractName:        "United MA Compass — Midwest",
    contractType:        "Medicare Advantage",
    category:            "Chronic Disease",
    visualTagline:       "Nearly half the diabetic population has no A1c control",
    description:         "1,960 Medicare Advantage members with diagnosed Type 2 Diabetes whose A1c remains above 9.0 — indicating poor glycemic control — with no active care management assignment.",
    memberCount:         1960,
    percentOfPopulation: 21.3,
    trendDirection:      "up",
    trendPercent:        8,
    priority:            "High",
    status:              "Action Needed",
    impactAreas:         ["Cost", "Quality", "Patient Outcomes"],
    topConditions:       ["Type 2 Diabetes", "Hypertension", "CKD Stage 3", "Peripheral Neuropathy", "Obesity"],
    keyMetrics: {
      edVisitsPer1000:   420,
      admissionsPer1000: 210,
      readmissionsRate:  14.2,
      qualityGapPercent: 48,
      avgRiskScore:      2.8,
    },
    whyItMatters:
      "Uncontrolled diabetes is the single largest quality and cost driver in this contract. Members with A1c >9 generate 38% more ED visits and 2.2× higher PMPM spend than controlled counterparts. Every 1-point improvement in A1c control rate lifts the composite quality score by approximately 1.5 points.",
    opportunitySummary:  "Closing the A1c control gap to 75% could yield ~$18 PMPM savings and +5 quality score points.",
    recommendedAction:   "Launch structured diabetes care management: monthly outreach to members with A1c >9, remote glucometer monitoring for top 300 highest-risk patients, and PCP co-management protocol implementation.",
    membersPreviewCount: 47,
    interventionIdeas: [
      "Monthly care manager outreach to members with A1c >9 using structured motivational interviewing protocol",
      "Remote glucometer monitoring program with automated alerts to PCP for readings outside target range",
      "PCP co-management dashboard alerts and diabetes-specific care plan templates embedded in EHR",
    ],
    trendHistory: [
      { label: "Jan", memberCount: 1810 },
      { label: "Feb", memberCount: 1890 },
      { label: "Mar", memberCount: 1960 },
    ],
  },

  {
    id:                  "cohort-002",
    name:                "Frequent ED Users",
    contractId:          "comm-001",
    contractName:        "Aetna Commercial ACO — Large Employer",
    contractType:        "Commercial",
    category:            "Utilization",
    visualTagline:       "340 members driving disproportionate emergency spend",
    description:         "340 Commercial members with 4+ ED visits in the past 12 months, many with underlying behavioral health conditions and no primary care relationship. This cohort accounts for 28% of total ED spend in the contract.",
    memberCount:         340,
    percentOfPopulation: 8.3,
    trendDirection:      "up",
    trendPercent:        15,
    priority:            "High",
    status:              "Action Needed",
    impactAreas:         ["Cost", "Utilization", "Patient Outcomes"],
    topConditions:       ["Behavioral Health", "Chronic Back Pain", "Substance Use Disorder", "Anxiety", "Depression"],
    keyMetrics: {
      edVisitsPer1000:   680,
      admissionsPer1000: 290,
      readmissionsRate:  18.1,
      qualityGapPercent: 35,
      avgRiskScore:      3.1,
    },
    whyItMatters:
      "Frequent ED users represent 8% of members but drive 28% of emergency department costs. The majority have behavioral health comorbidities that are treatable in ambulatory settings but go unmanaged due to access barriers and care fragmentation. Behavioral health claims in this contract grew 22% YoY.",
    opportunitySummary:  "Targeted navigation for the top 100 high-frequency users could divert ~35% of avoidable ED visits and save ~$12 PMPM.",
    recommendedAction:   "Assign dedicated care navigators to the top 100 high-frequency ED members and embed a behavioral health navigator to coordinate EAP-linked telehealth therapy.",
    membersPreviewCount: 22,
    interventionIdeas: [
      "Assign dedicated care navigators to top 100 high-frequency ED users with weekly check-in protocol",
      "Implement 24/7 nurse triage line as ED alternative for members with non-emergent presentations",
      "Behavioral health co-location program integrating mental health services directly into primary care",
    ],
    trendHistory: [
      { label: "Jan", memberCount: 296 },
      { label: "Feb", memberCount: 318 },
      { label: "Mar", memberCount: 340 },
    ],
  },

  {
    id:                  "cohort-003",
    name:                "COPD Members with Escalating Costs",
    contractId:          "mssp-003",
    contractName:        "Pioneer ACO — Southeast",
    contractType:        "MSSP",
    category:            "Chronic Disease",
    visualTagline:       "COPD driving ED rates 38% above the ACO benchmark",
    description:         "1,322 ACO members with a COPD diagnosis driving emergency department utilization 38% above the 280-per-1,000 ACO benchmark, with no active respiratory disease management program in place.",
    memberCount:         1322,
    percentOfPopulation: 24.1,
    trendDirection:      "up",
    trendPercent:        12,
    priority:            "High",
    status:              "Action Needed",
    impactAreas:         ["Cost", "Utilization", "Patient Outcomes"],
    topConditions:       ["COPD", "Asthma", "Heart Failure", "Hypertension", "Type 2 Diabetes"],
    keyMetrics: {
      edVisitsPer1000:   388,
      admissionsPer1000: 198,
      readmissionsRate:  16.4,
      qualityGapPercent: 42,
      avgRiskScore:      2.6,
    },
    whyItMatters:
      "COPD is the primary driver of the contract's $60 PMPM overage. Members with COPD generate 388 ED visits per 1,000 — 38% above benchmark — and have a 16.4% readmission rate. Without a respiratory disease management program, costs will continue to escalate through the performance period.",
    opportunitySummary:  "A structured respiratory disease management program could reduce ED visits to near-benchmark and save ~$22 PMPM.",
    recommendedAction:   "Deploy a respiratory disease management program with rescue inhaler protocols, inhaler technique education, and mandatory 30-day post-ED follow-up calls for all COPD members.",
    membersPreviewCount: 38,
    interventionIdeas: [
      "Deploy respiratory disease management program with rescue inhaler protocols and COPD action plans",
      "30-day post-ED follow-up calls for all COPD members with any hospital or ED contact",
      "Home-based pulmonary rehabilitation for members with 2+ ED visits in the past 6 months",
    ],
    trendHistory: [
      { label: "Jan", memberCount: 1180 },
      { label: "Feb", memberCount: 1248 },
      { label: "Mar", memberCount: 1322 },
    ],
  },

  {
    id:                  "cohort-004",
    name:                "Recently Discharged at Readmission Risk",
    contractId:          "mssp-001",
    contractName:        "ACO REACH — Northeast",
    contractType:        "MSSP",
    category:            "Post-Acute Risk",
    visualTagline:       "22.8% readmission rate — nearly 3× the ACO target",
    description:         "480 ACO members discharged from an inpatient stay in the last 30 days with 2 or more documented social or clinical risk factors, placing them at high risk for readmission within the 30-day window.",
    memberCount:         480,
    percentOfPopulation: 5.0,
    trendDirection:      "up",
    trendPercent:        6,
    priority:            "High",
    status:              "Action Needed",
    impactAreas:         ["Cost", "Utilization", "Patient Outcomes"],
    topConditions:       ["Heart Failure", "COPD", "Pneumonia", "Hip Fracture", "Sepsis"],
    keyMetrics: {
      edVisitsPer1000:   510,
      admissionsPer1000: 320,
      readmissionsRate:  22.8,
      qualityGapPercent: 28,
      avgRiskScore:      3.4,
    },
    whyItMatters:
      "The contract's 14.8% readmission rate is nearly double the 8% benchmark, representing a critical off-track driver. 22% of members have food insecurity and 19% report transportation barriers — the highest SDOH burden in the portfolio — compounding weak discharge follow-up and increasing re-hospitalization risk.",
    opportunitySummary:  "Standardized discharge protocols with 48-hour follow-up could reduce the readmission rate to ~9%, saving significant downstream costs.",
    recommendedAction:   "Standardize discharge bundles with 48-hour follow-up calls and integrate a community health worker program targeting members with 2+ social risk factors at discharge.",
    membersPreviewCount: 31,
    interventionIdeas: [
      "Standardize 48-hour post-discharge follow-up call protocol for all discharged members regardless of diagnosis",
      "Community health worker assignment for all members with 2+ social risk factors identified at discharge screening",
      "Medication reconciliation checklist integrated into the discharge workflow to prevent adverse drug events",
    ],
    trendHistory: [
      { label: "Jan", memberCount: 432 },
      { label: "Feb", memberCount: 456 },
      { label: "Mar", memberCount: 480 },
    ],
  },

  // ── Medium Priority / Watch ───────────────────────────────────────────────

  {
    id:                  "cohort-005",
    name:                "Members Missing Preventive Screenings",
    contractId:          "ma-003",
    contractName:        "Aetna Medicare — West Coast",
    contractType:        "Medicare Advantage",
    category:            "Quality Gap",
    visualTagline:       "Breast screening and flu gaps holding the contract at 4.5 Stars",
    description:         "1,882 Medicare Advantage members who are overdue for one or more HEDIS-required preventive screenings — primarily breast cancer screening and annual flu vaccination — preventing the contract from reaching 5.0 Stars.",
    memberCount:         1882,
    percentOfPopulation: 21.0,
    trendDirection:      "down",
    trendPercent:        4,
    priority:            "Medium",
    status:              "Watch",
    impactAreas:         ["Quality", "Patient Outcomes"],
    topConditions:       ["Hypertension", "Hyperlipidemia", "Type 2 Diabetes", "Osteoporosis", "Depression Screening Gap"],
    keyMetrics: {
      edVisitsPer1000:   265,
      admissionsPer1000: 140,
      readmissionsRate:  7.2,
      qualityGapPercent: 68,
      avgRiskScore:      1.8,
    },
    whyItMatters:
      "Breast cancer screening at 80% and flu vaccination at 78% are the two measures keeping this contract at 4.5 Stars instead of 5.0. Closing both gaps would unlock an estimated $45K quality bonus in 2026. The cohort is trending in the right direction (-4%) but needs structured outreach to clear the threshold.",
    opportunitySummary:  "Closing both gaps unlocks an estimated $45K Stars quality bonus and improves early detection outcomes for 1,882 members.",
    recommendedAction:   "Run targeted outreach campaigns in October/November for flu vaccination and a mammography reminder program for women aged 50–74.",
    membersPreviewCount: 18,
    interventionIdeas: [
      "Targeted flu vaccination outreach campaign in October/November with pharmacist-led administration at member-accessible locations",
      "Annual wellness visit prompts integrated into EHR for PCP reminder workflows tied to HEDIS gap closure",
      "Member-facing portal reminders with self-scheduling links for preventive screenings and mammography",
    ],
    trendHistory: [
      { label: "Jan", memberCount: 2040 },
      { label: "Feb", memberCount: 1960 },
      { label: "Mar", memberCount: 1882 },
    ],
  },

  {
    id:                  "cohort-006",
    name:                "Members with Transportation Barriers",
    contractId:          "comm-004",
    contractName:        "Humana Commercial PCMH — Retail Sector",
    contractType:        "Commercial",
    category:            "Social Risk",
    visualTagline:       "Missed visits converting to avoidable ED encounters",
    description:         "902 Commercial PCMH members who have self-reported transportation as a barrier to care, showing 40% higher ED utilization than members without transport barriers — the worst social risk profile in the commercial portfolio.",
    memberCount:         902,
    percentOfPopulation: 21.9,
    trendDirection:      "stable",
    trendPercent:        2,
    priority:            "Medium",
    status:              "Watch",
    impactAreas:         ["Utilization", "Patient Outcomes"],
    topConditions:       ["Hypertension", "Type 2 Diabetes", "Depression", "Asthma", "Chronic Back Pain"],
    keyMetrics: {
      edVisitsPer1000:   355,
      admissionsPer1000: 162,
      readmissionsRate:  11.3,
      qualityGapPercent: 44,
      avgRiskScore:      2.2,
    },
    whyItMatters:
      "Members with transportation barriers miss an average of 2.3 scheduled primary care visits per year — each of which carries a high probability of converting to an ED encounter. At 355 ED visits per 1,000, this cohort is 27% above the commercial benchmark and trending stable without intervention.",
    opportunitySummary:  "Addressing transport barriers through NEMT and telehealth access could reduce ED visits to near-benchmark and save ~$10 PMPM.",
    recommendedAction:   "Partner with an NEMT vendor for non-emergency medical transport and expand same-day telehealth access as a complementary option for shift workers who cannot attend daytime appointments.",
    membersPreviewCount: 14,
    interventionIdeas: [
      "Partner with an NEMT vendor to provide non-emergency medical transport as a covered benefit for high-risk members",
      "Expand same-day telehealth access as a primary visit alternative for retail sector shift workers",
      "Care coordinator screening for transportation barriers at every care management touchpoint with automatic NEMT referral",
    ],
    trendHistory: [
      { label: "Jan", memberCount: 885 },
      { label: "Feb", memberCount: 894 },
      { label: "Mar", memberCount: 902 },
    ],
  },

  {
    id:                  "cohort-007",
    name:                "Medicare Advantage RAF Opportunity",
    contractId:          "ma-004",
    contractName:        "United MA Compass — Midwest",
    contractType:        "Medicare Advantage",
    category:            "Risk Adjustment",
    visualTagline:       "1,240 members with suspected undocumented HCC conditions",
    description:         "1,240 Medicare Advantage members identified through claims analysis as likely having chronic conditions (CKD, CHF, COPD) that are insufficiently documented to support accurate Risk Adjustment Factor (RAF) scores, resulting in potential underpayment.",
    memberCount:         1240,
    percentOfPopulation: 13.5,
    trendDirection:      "stable",
    trendPercent:        1,
    priority:            "Medium",
    status:              "Watch",
    impactAreas:         ["Cost", "Quality"],
    topConditions:       ["Undocumented CKD", "Undocumented CHF", "Hypertension", "Type 2 Diabetes", "COPD"],
    keyMetrics: {
      edVisitsPer1000:   310,
      admissionsPer1000: 158,
      readmissionsRate:  9.4,
      qualityGapPercent: 22,
      avgRiskScore:      1.9,
    },
    whyItMatters:
      "RAF underdocumentation directly reduces CMS capitation payments, creating a structural revenue shortfall in an already high-cost contract. Accurate HCC coding also supports better care planning — members with undocumented conditions are less likely to receive appropriate chronic disease management.",
    opportunitySummary:  "Proper HCC documentation for this cohort could improve RAF scores and recover an estimated $280–$420K in annual capitation revenue.",
    recommendedAction:   "Run an annual wellness visit campaign targeting the top 400 RAF opportunity members with retrospective claims review and structured HEDIS documentation protocol at each visit.",
    membersPreviewCount: 29,
    interventionIdeas: [
      "Annual wellness visit campaign targeting top 400 RAF opportunity members with suspected undocumented HCC conditions",
      "Retrospective claims review with clinical coding team for conditions present in problem lists but missing from encounter data",
      "Structured HEDIS documentation protocol embedded into EHR annual visit template to capture all relevant chronic conditions",
    ],
    trendHistory: [
      { label: "Jan", memberCount: 1228 },
      { label: "Feb", memberCount: 1235 },
      { label: "Mar", memberCount: 1240 },
    ],
  },

  {
    id:                  "cohort-008",
    name:                "Rising-Risk Members Without Care Management",
    contractId:          undefined,
    contractName:        undefined,
    contractType:        "Portfolio-Wide",
    category:            "Rising Risk",
    visualTagline:       "4,890 members on a trajectory toward high-cost status",
    description:         "4,890 members across the portfolio who have transitioned from low-risk to rising-risk stratification in the past 6 months — primarily driven by new chronic diagnoses, increased utilization, and unaddressed social risk factors — with no active care management enrollment.",
    memberCount:         4890,
    percentOfPopulation: 8.1,
    trendDirection:      "up",
    trendPercent:        14,
    priority:            "Medium",
    status:              "Watch",
    impactAreas:         ["Cost", "Patient Outcomes"],
    topConditions:       ["Hypertension", "Pre-Diabetes", "Obesity", "Hyperlipidemia", "Depression"],
    keyMetrics: {
      edVisitsPer1000:   318,
      admissionsPer1000: 145,
      readmissionsRate:  10.8,
      qualityGapPercent: 38,
      avgRiskScore:      1.7,
    },
    whyItMatters:
      "Rising-risk members without intervention have a 34% probability of transitioning to high-risk status within 12 months. Earlier intervention through care management enrollment is 4× more cost-effective than managing members after they reach high-risk status. Social risk factors (food insecurity 13%, transport barriers 14%) are accelerating the trajectory.",
    opportunitySummary:  "Enrolling this cohort in structured care management could prevent an estimated $25 PMPM escalation and avert ~340 avoidable ED visits annually.",
    recommendedAction:   "Automate care management enrollment triggers for members meeting 2+ rising-risk criteria, with a 90-day structured touchpoint program and PCP co-management handoff protocol.",
    membersPreviewCount: 52,
    interventionIdeas: [
      "Automate care management enrollment for all members meeting 2+ rising-risk criteria (new Dx, increased utilization, SDOH flag)",
      "90-day structured touchpoint program with monthly care manager check-ins and PCP co-management handoff at day 90",
      "Social risk screening integration at every primary care visit for rising-risk members with automatic SDOH referral workflow",
    ],
    trendHistory: [
      { label: "Jan", memberCount: 4290 },
      { label: "Feb", memberCount: 4580 },
      { label: "Mar", memberCount: 4890 },
    ],
  },
];

const cohortsByContractId = new Map<string, Cohort[]>();
for (const cohort of mockCohorts) {
  if (!cohort.contractId) continue;
  const current = cohortsByContractId.get(cohort.contractId);
  if (current) current.push(cohort);
  else cohortsByContractId.set(cohort.contractId, [cohort]);
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

export function getCohortsForContract(contractId: string): Cohort[] {
  return cohortsByContractId.get(contractId) ?? [];
}

export function getCohortById(id: string): Cohort | undefined {
  return mockCohorts.find((c) => c.id === id);
}

/** Top N cohorts sorted by priority then status urgency. */
export function getTopCohorts(n = 3): Cohort[] {
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const statusOrder   = { "Action Needed": 0, Watch: 1, Improving: 2 };
  return [...mockCohorts]
    .sort((a, b) => {
      const p = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (p !== 0) return p;
      return statusOrder[a.status] - statusOrder[b.status];
    })
    .slice(0, n);
}

export function getAllCategories(): CohortCategory[] {
  return [...new Set(mockCohorts.map((c) => c.category))];
}

export function generateStaticCohortParams(): { id: string }[] {
  return mockCohorts.map((c) => ({ id: c.id }));
}

export const cohortSummary = {
  total:                mockCohorts.length,
  highPriority:         mockCohorts.filter((c) => c.priority === "High").length,
  actionNeededMembers:  mockCohorts
    .filter((c) => c.status === "Action Needed")
    .reduce((sum, c) => sum + c.memberCount, 0),
  qualityCohorts:       mockCohorts.filter((c) => c.impactAreas.includes("Quality")).length,
};
