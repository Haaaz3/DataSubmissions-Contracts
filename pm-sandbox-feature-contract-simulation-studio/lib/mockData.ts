import { Contract, ContractAgreement } from "@/types/contract";

// ---------------------------------------------------------------------------
// Seeded mock data — 16 contracts across MSSP, Medicare Advantage, Commercial.
// Replace with real API data when integrating a backend.
// ---------------------------------------------------------------------------

export const mockContracts: Contract[] = [
  // ── MSSP ─────────────────────────────────────────────────────────────────
  {
    id: "mssp-001",
    name: "ACO REACH — Northeast Region",
    payor: "CMS",
    contractType: "MSSP",
    vbcContractModel: "Shared Risk",
    attributedLives: 4820,
    currentPmpm: 910,
    targetPmpm: 875,
    qualityScore: 78,
    edVisitsPer1000: 312,
    status: "At Risk",
    trend: [
      { month: "Sep 2024", pmpm: 870, qualityScore: 80 },
      { month: "Oct 2024", pmpm: 885, qualityScore: 79 },
      { month: "Nov 2024", pmpm: 892, qualityScore: 78 },
      { month: "Dec 2024", pmpm: 905, qualityScore: 77 },
      { month: "Jan 2025", pmpm: 908, qualityScore: 78 },
      { month: "Feb 2025", pmpm: 910, qualityScore: 78 },
    ],
    opportunities: [
      {
        title: "Reduce avoidable ED visits",
        description:
          "312 ED visits per 1,000 is above the 280 benchmark. Deploying care navigators for the top 200 high-risk members could reduce this by ~15%.",
        demographics: {
          ageBands: ["65+", "45-64"],
          genders: ["Female", "Male"],
          riskTiers: ["High Risk", "Rising Risk"],
          segments: ["Frequent ED Utilizers", "Limited PCP Follow-up"],
        },
        originAgentId: "contract_performance",
        contributingAgentIds: ["claims_friction", "quality_care_gap"],
        executiveSummary:
          "AI synthesis indicates avoidable ED concentration in a small high-risk cohort with limited PCP follow-up; prioritize rapid outreach and diversion pathways.",
        confidence: "High",
        impactEstimate: {
          pmpmDelta: -18,
          qualityLiftPoints: 2,
          timelineDays: 90,
        },
        ownerRole: "Care Management Lead",
        workflowTypes: ["ed_frequent_utilizer", "ed_diversion"],
        projectPlanActions: [
          "Launch navigator outreach to top 200 high-utilizers within 48 hours.",
          "Implement urgent care diversion scripting for low-acuity presentations.",
          "Stand up weekly multidisciplinary review for repeat ED utilizers.",
        ],
        primaryKpi: {
          key: "ed_visits_per_1000_mm",
          displayName: "ED Visits per 1,000",
          baseline: 312,
          target: 280,
          direction: "down",
        },
        leadingKpis: [
          {
            key: "contact_within_48h_rate",
            displayName: "48h Contact Rate",
            baseline: 54,
            target: 80,
            direction: "up",
          },
          {
            key: "urgent_care_conversion_rate",
            displayName: "Urgent Care Conversion Rate",
            baseline: 22,
            target: 38,
            direction: "up",
          },
        ],
      },
      {
        title: "Close annual wellness visit gaps",
        description:
          "Only 54% of attributed members completed an AWV this year. Closing this gap to 70% would improve quality score by an estimated 5 points and strengthen shared savings eligibility.",
        demographics: {
          ageBands: ["65+"],
          genders: ["Female", "Male"],
          riskTiers: ["Rising Risk", "Low Risk"],
          segments: ["AWV Overdue", "Preventive Care Gap"],
        },
        originAgentId: "quality_care_gap",
        contributingAgentIds: ["contract_performance"],
        executiveSummary:
          "Preventive access gaps are suppressing quality performance; focused outreach and scheduling acceleration can quickly improve annual wellness completion and recover quality-linked value.",
        confidence: "High",
        impactEstimate: {
          qualityLiftPoints: 5,
          timelineDays: 60,
        },
        ownerRole: "Quality Outreach Lead",
        workflowTypes: ["provider_panel_microcampaign", "preventive_gap_outreach"],
        projectPlanActions: [
          "Generate AWV gap lists by PCP panel and prioritize high-risk members.",
          "Run outbound scheduling campaign with evening and weekend appointment capacity.",
          "Escalate unresponsive high-risk members to care management outreach.",
        ],
        primaryKpi: {
          key: "awv_completion_rate",
          displayName: "AWV Completion Rate",
          baseline: 54,
          target: 70,
          direction: "up",
        },
        leadingKpis: [
          {
            key: "outreach_completion_rate",
            displayName: "Outreach Completion Rate",
            baseline: 61,
            target: 85,
            direction: "up",
          },
        ],
      },
      {
        title: "Tighten SNF length-of-stay management",
        description:
          "Average SNF stay is 14.2 days vs. an 11-day peer benchmark. Standardizing transition planning and concurrent review could reduce avoidable post-acute days and save an estimated 12 PMPM.",
        demographics: {
          ageBands: ["65+"],
          genders: ["Female", "Male"],
          riskTiers: ["High Risk"],
          segments: ["Post-Acute Transition", "SNF Length-of-Stay Outliers"],
        },
        originAgentId: "contract_performance",
        contributingAgentIds: ["mayo_discharge"],
        executiveSummary:
          "Post-acute utilization variance is driven by delayed transition planning and inconsistent concurrent review; stronger SNF governance can reduce avoidable length-of-stay days.",
        confidence: "Medium",
        impactEstimate: {
          pmpmDelta: -12,
          timelineDays: 150,
        },
        ownerRole: "Post-Acute Network Lead",
        workflowTypes: ["post_acute_network", "snf_length_of_stay"],
        projectPlanActions: [
          "Implement preferred SNF placement protocol with daily throughput review.",
          "Standardize concurrent review for stays exceeding expected length-of-stay thresholds.",
          "Escalate LOS outliers to weekly post-acute leadership huddle.",
        ],
        primaryKpi: {
          key: "snf_los_days",
          displayName: "SNF Length of Stay (days)",
          baseline: 14.2,
          target: 11,
          direction: "down",
        },
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 875,
      sharedSavings: true,
      sharedSavingsRate: 50,
      sharedSavingsThreshold: 2,
      sharedSavingsCap: 10,
      qualityGate: 70,
      sharedRisk: true,
      sharedRiskRate: 40,
      sharedRiskThreshold: 2,
      downsideRiskCap: 8,
      populationHealthBudget: 235000,
    },
  },
  {
    id: "mssp-002",
    name: "ACO REACH — Great Lakes",
    payor: "CMS",
    contractType: "MSSP",
    vbcContractModel: "Shared Savings",
    attributedLives: 3940,
    currentPmpm: 845,
    targetPmpm: 860,
    qualityScore: 84,
    edVisitsPer1000: 271,
    status: "On Track",
    trend: [
      { month: "Sep 2024", pmpm: 862, qualityScore: 81 },
      { month: "Oct 2024", pmpm: 858, qualityScore: 82 },
      { month: "Nov 2024", pmpm: 854, qualityScore: 83 },
      { month: "Dec 2024", pmpm: 851, qualityScore: 84 },
      { month: "Jan 2025", pmpm: 847, qualityScore: 84 },
      { month: "Feb 2025", pmpm: 845, qualityScore: 84 },
    ],
    opportunities: [
      {
        title: "Expand telehealth chronic care visits",
        description:
          "Telehealth utilization is 31% below the national ACO benchmark. Expanding access for rural members could improve quality scores and reduce travel-related no-shows.",
        demographics: {
          ageBands: ["45-64", "65+"],
          genders: ["Female", "Male"],
          riskTiers: ["Rising Risk"],
          segments: ["Rural Access Barrier", "Chronic Care Members"],
        },
      },
      {
        title: "Close colorectal screening gaps",
        description:
          "Colorectal screening compliance is at 58%. A mailed FIT-kit program targeting members aged 50–75 could lift compliance into the low 70s, improve quality by 4 points, and deliver a fast preventive care win.",
        demographics: {
          ageBands: ["45-64", "65+"],
          genders: ["Female", "Male"],
          riskTiers: ["Low Risk", "Rising Risk"],
          segments: ["Preventive Screening Overdue"],
        },
        originAgentId: "quality_care_gap",
        contributingAgentIds: ["kaiser_prevention"],
        executiveSummary:
          "This is a highly executable preventive campaign with strong evidence, low operational complexity, and fast quality impact.",
        confidence: "High",
        impactEstimate: {
          qualityLiftPoints: 4,
          timelineDays: 45,
        },
        ownerRole: "Preventive Care Program Manager",
        workflowTypes: ["preventive_screening_outreach", "mailed_fit_kit"],
        projectPlanActions: [
          "Deploy mailed FIT kits to overdue members aged 50–75.",
          "Launch reminder outreach for kit completion at 14 and 30 days.",
          "Route abnormal results to GI scheduling navigation within 72 hours.",
        ],
        primaryKpi: {
          key: "colorectal_screening_rate",
          displayName: "Colorectal Screening Rate",
          baseline: 58,
          target: 72,
          direction: "up",
        },
      },
      {
        title: "Improve HbA1c control for diabetic members",
        description:
          "28% of diabetic members have uncontrolled HbA1c (>9%). Structured outreach, remote monitoring, and pharmacist escalation could reduce avoidable complications and save an estimated 9 PMPM while improving quality by 3 points.",
        demographics: {
          ageBands: ["45-64", "65+"],
          genders: ["Female", "Male"],
          riskTiers: ["High Risk", "Rising Risk"],
          segments: ["Diabetes Uncontrolled", "Care Management Eligible"],
        },
        originAgentId: "quality_care_gap",
        contributingAgentIds: ["contract_performance"],
        executiveSummary:
          "A targeted diabetes management bundle offers both utilization and quality upside, but requires more sustained clinical execution than a preventive outreach campaign.",
        confidence: "Medium",
        impactEstimate: {
          pmpmDelta: -9,
          qualityLiftPoints: 3,
          timelineDays: 120,
        },
        ownerRole: "Diabetes Care Management Lead",
        workflowTypes: ["diabetes_care_management", "remote_monitoring"],
        projectPlanActions: [
          "Prioritize uncontrolled diabetic members for nurse outreach and medication review.",
          "Enroll highest-risk members into remote glucose monitoring.",
          "Escalate persistently uncontrolled members to pharmacist and PCP review.",
        ],
        primaryKpi: {
          key: "a1c_control_rate",
          displayName: "HbA1c Control Rate",
          baseline: 72,
          target: 80,
          direction: "up",
        },
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 860,
      sharedSavings: true,
      sharedSavingsRate: 50,
      sharedSavingsThreshold: 2,
      sharedSavingsCap: 10,
      qualityGate: 72,
      sharedRisk: true,
      sharedRiskRate: 38,
      sharedRiskThreshold: 2,
      downsideRiskCap: 8,
      populationHealthBudget: 182000,
    },
  },
  {
    id: "mssp-003",
    name: "Pioneer ACO — Southeast",
    payor: "CMS",
    contractType: "MSSP",
    vbcContractModel: "Full Risk",
    attributedLives: 5510,
    currentPmpm: 980,
    targetPmpm: 920,
    qualityScore: 63,
    edVisitsPer1000: 388,
    status: "Off Track",
    trend: [
      { month: "Sep 2024", pmpm: 935, qualityScore: 68 },
      { month: "Oct 2024", pmpm: 948, qualityScore: 67 },
      { month: "Nov 2024", pmpm: 958, qualityScore: 66 },
      { month: "Dec 2024", pmpm: 965, qualityScore: 65 },
      { month: "Jan 2025", pmpm: 974, qualityScore: 64 },
      { month: "Feb 2025", pmpm: 980, qualityScore: 63 },
    ],
    opportunities: [
      {
        title: "Crisis intervention for high-utilizers",
        description:
          "Top 5% of members account for 42% of spend. A rapid-response care team targeting the top 300 members could reduce avoidable acute utilization and save an estimated 28 PMPM.",
        demographics: {
          ageBands: ["45-64", "65+"],
          genders: ["Female", "Male"],
          riskTiers: ["High Risk"],
          segments: ["Top 5% Cost", "Frequent Acute Utilizers"],
        },
        originAgentId: "contract_performance",
        contributingAgentIds: ["claims_friction", "kaiser_outreach"],
        executiveSummary:
          "A concentrated high-risk cohort is driving a disproportionate share of downside exposure; rapid-response complex care intervention offers meaningful near-term reduction in financial risk.",
        confidence: "High",
        impactEstimate: {
          pmpmDelta: -28,
          timelineDays: 75,
        },
        ownerRole: "Complex Care Operations Director",
        workflowTypes: ["high_risk_case_management", "acute_utilization_reduction"],
        projectPlanActions: [
          "Stand up a rapid-response care team for the top 300 highest-cost members.",
          "Complete interdisciplinary care plans within 7 days of outreach acceptance.",
          "Review acute utilization changes weekly and escalate unresolved barriers.",
        ],
        primaryKpi: {
          key: "avoidable_acute_admissions_rate",
          displayName: "Avoidable Acute Admissions Rate",
          baseline: 18,
          target: 14,
          direction: "down",
        },
      },
      {
        title: "Improve post-acute care transitions",
        description:
          "30-day readmission rate is 14.8%, nearly double the national benchmark. Standardized discharge bundles and 48-hour follow-up could reduce readmissions and save an estimated 16 PMPM.",
        demographics: {
          ageBands: ["65+"],
          genders: ["Female", "Male"],
          riskTiers: ["High Risk"],
          segments: ["Recent Discharges", "Readmission Risk"],
        },
        originAgentId: "mayo_discharge",
        contributingAgentIds: ["contract_performance"],
        executiveSummary:
          "Transitions-of-care reliability is a major opportunity for both quality and cost improvement; this lever has strong evidence but requires cross-team execution discipline.",
        confidence: "High",
        impactEstimate: {
          pmpmDelta: -16,
          timelineDays: 105,
        },
        ownerRole: "Transitions of Care Director",
        workflowTypes: ["toc_readmission_bundle", "post_discharge_followup"],
        projectPlanActions: [
          "Implement discharge bundles for all high-risk inpatient discharges.",
          "Complete 48-hour follow-up calls with medication reconciliation.",
          "Escalate members with unresolved post-discharge barriers to care management within 72 hours.",
        ],
        primaryKpi: {
          key: "readmission_30_day_rate",
          displayName: "30-Day Readmission Rate",
          baseline: 14.8,
          target: 11.5,
          direction: "down",
        },
      },
      {
        title: "Address social determinants of health",
        description:
          "Food insecurity and transportation barriers affect 22% of attributed members. Expanding community health worker support and closed-loop referral workflows could reduce avoidable utilization over time and save an estimated 14 PMPM.",
        demographics: {
          ageBands: ["45-64", "65+"],
          genders: ["Female", "Male"],
          riskTiers: ["Rising Risk", "High Risk"],
          segments: ["Food Insecurity", "Transportation Barrier"],
        },
        originAgentId: "kaiser_outreach",
        contributingAgentIds: ["contract_performance"],
        executiveSummary:
          "This is a strategically important lever with meaningful upside, but results depend on community partnerships, referral closure, and sustained member engagement.",
        confidence: "Low",
        impactEstimate: {
          pmpmDelta: -14,
          timelineDays: 240,
        },
        ownerRole: "Community Health Strategy Lead",
        workflowTypes: ["sdoh_navigation", "community_health_worker_program"],
        projectPlanActions: [
          "Identify highest-risk members with food and transportation barriers.",
          "Deploy community health worker outreach and referral navigation.",
          "Track referral closure and downstream utilization monthly.",
        ],
        primaryKpi: {
          key: "sdoh_referral_closure_rate",
          displayName: "SDOH Referral Closure Rate",
          baseline: 28,
          target: 55,
          direction: "up",
        },
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 920,
      sharedSavings: true,
      sharedSavingsRate: 50,
      sharedSavingsThreshold: 2,
      sharedSavingsCap: 10,
      qualityGate: 70,
      sharedRisk: true,
      sharedRiskRate: 45,
      sharedRiskThreshold: 2,
      downsideRiskCap: 10,
      populationHealthBudget: 330000,
    },
  },

  // ── Medicare Advantage ───────────────────────────────────────────────────
  {
    id: "ma-001",
    name: "BlueCross MA Preferred — Metro",
    payor: "BlueCross BlueShield",
    contractType: "Medicare Advantage",
    vbcContractModel: "Shared Risk",
    attributedLives: 6310,
    currentPmpm: 1050,
    targetPmpm: 1100,
    qualityScore: 86,
    edVisitsPer1000: 265,
    status: "On Track",
    trend: [
      { month: "Sep 2024", pmpm: 1080, qualityScore: 83 },
      { month: "Oct 2024", pmpm: 1070, qualityScore: 84 },
      { month: "Nov 2024", pmpm: 1060, qualityScore: 85 },
      { month: "Dec 2024", pmpm: 1055, qualityScore: 85 },
      { month: "Jan 2025", pmpm: 1052, qualityScore: 86 },
      { month: "Feb 2025", pmpm: 1050, qualityScore: 86 },
    ],
    opportunities: [
      {
        title: "Improve HEDIS medication adherence",
        description:
          "Statin adherence is at 74%. Reaching 80% would strengthen Stars performance and improve 2026 quality-linked revenue, with a relatively short path to impact.",
        demographics: {
          ageBands: ["65+"],
          genders: ["Female", "Male"],
          riskTiers: ["Rising Risk"],
          segments: ["Medication Non-adherence", "Stars Opportunity"],
        },
        originAgentId: "quality_care_gap",
        contributingAgentIds: ["contract_performance"],
        executiveSummary:
          "Medication adherence is a well-understood Stars lever with strong evidence, strong operational playbooks, and a short time to measurable quality improvement.",
        confidence: "High",
        impactEstimate: {
          qualityLiftPoints: 3,
          timelineDays: 60,
        },
        ownerRole: "Stars Performance Lead",
        workflowTypes: ["medication_adherence_outreach", "pharmacy_gap_closure"],
        projectPlanActions: [
          "Target non-adherent members with pharmacy and outreach interventions.",
          "Coordinate refill reminders and 90-day fill conversion campaigns.",
          "Escalate persistent non-adherence cases to pharmacist review.",
        ],
        primaryKpi: {
          key: "statin_adherence_rate",
          displayName: "Statin Adherence Rate",
          baseline: 74,
          target: 80,
          direction: "up",
        },
      },
      {
        title: "Expand in-home assessment coverage",
        description:
          "Only 40% of members with 3+ chronic conditions received an in-home assessment. Expanding to 60% could improve HCC capture and deliver an estimated 24 PMPM in financial lift.",
        demographics: {
          ageBands: ["65+"],
          genders: ["Female", "Male"],
          riskTiers: ["High Risk"],
          segments: ["Multi-Chronic", "RAF Capture Gap"],
        },
        originAgentId: "contract_performance",
        contributingAgentIds: ["payer_utilization"],
        executiveSummary:
          "In-home assessment expansion is a high-value risk adjustment lever with clear documentation dependency and moderate operational complexity.",
        confidence: "High",
        impactEstimate: {
          pmpmDelta: -24,
          timelineDays: 90,
        },
        ownerRole: "Risk Adjustment Program Director",
        workflowTypes: ["hcc_capture", "in_home_assessment_expansion"],
        projectPlanActions: [
          "Prioritize multi-chronic members for in-home assessment scheduling.",
          "Expand assessment vendor capacity for peak outreach windows.",
          "Monitor completed assessments and HCC capture yield weekly.",
        ],
        primaryKpi: {
          key: "in_home_assessment_rate",
          displayName: "In-Home Assessment Rate",
          baseline: 40,
          target: 60,
          direction: "up",
        },
      },
      {
        title: "Reduce 30-day readmissions",
        description:
          "Current readmission rate is 9.2%. A structured post-discharge call program targeting CHF and COPD patients could bring this below 8%.",
        demographics: {
          ageBands: ["65+"],
          genders: ["Female", "Male"],
          riskTiers: ["High Risk"],
          segments: ["CHF/COPD", "Post-Discharge"],
        },
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 1100,
      sharedSavings: true,
      sharedSavingsRate: 45,
      sharedSavingsThreshold: 1.5,
      sharedSavingsCap: 9,
      qualityGate: 75,
      sharedRisk: true,
      sharedRiskRate: 45,
      sharedRiskThreshold: 1.5,
      downsideRiskCap: 9,
      populationHealthBudget: 332000,
    },
  },
  {
    id: "ma-002",
    name: "Humana Gold Plus — Suburban Markets",
    payor: "Humana",
    contractType: "Medicare Advantage",
    vbcContractModel: "Full Risk",
    attributedLives: 7840,
    currentPmpm: 1180,
    targetPmpm: 1150,
    qualityScore: 74,
    edVisitsPer1000: 305,
    status: "At Risk",
    trend: [
      { month: "Sep 2024", pmpm: 1145, qualityScore: 76 },
      { month: "Oct 2024", pmpm: 1152, qualityScore: 76 },
      { month: "Nov 2024", pmpm: 1160, qualityScore: 75 },
      { month: "Dec 2024", pmpm: 1168, qualityScore: 75 },
      { month: "Jan 2025", pmpm: 1174, qualityScore: 74 },
      { month: "Feb 2025", pmpm: 1180, qualityScore: 74 },
    ],
    opportunities: [
      {
        title: "Recover RAF accuracy through coding improvement",
        description:
          "HCC recapture rate is 68% vs. an 82% peer average. Prospective risk coding outreach for members with known chronic conditions could recover $40–$55 PMPM in risk-adjusted revenue.",
        originAgentId: "contract_performance",
        contributingAgentIds: ["payer_utilization"],
        executiveSummary:
          "Risk adjustment leakage is materially affecting contract performance; targeted coding recapture intervention offers near-term financial lift.",
        confidence: "High",
        impactEstimate: {
          revenueLiftPmpm: 45,
          timelineDays: 120,
        },
        ownerRole: "Analytics Owner",
        workflowTypes: ["provider_panel_microcampaign"],
        projectPlanActions: [
          "Prioritize members with suspected HCC gaps for prospective review.",
          "Distribute coding opportunity packets to top PCP panels weekly.",
          "Audit recapture closure and denial leakage in monthly governance review.",
        ],
        primaryKpi: {
          key: "hcc_recapture_rate",
          displayName: "HCC Recapture Rate",
          baseline: 68,
          target: 82,
          direction: "up",
        },
      },
      {
        title: "Reduce specialty imaging overuse",
        description:
          "Advanced imaging spend is 24% above benchmark. Tightening prior-authorization review and redirecting low-value ordering patterns could save an estimated 17 PMPM.",
        confidence: "Medium",
        impactEstimate: {
          pmpmDelta: -17,
          timelineDays: 135,
        },
        ownerRole: "Utilization Management Director",
        workflowTypes: ["advanced_imaging_review", "prior_auth_optimization"],
        projectPlanActions: [
          "Identify top specialty imaging outlier patterns by ordering provider.",
          "Tighten prior-authorization review criteria for non-emergent MRI and CT orders.",
          "Review provider adherence and imaging trend reduction monthly.",
        ],
        primaryKpi: {
          key: "advanced_imaging_pmpm",
          displayName: "Advanced Imaging PMPM",
          baseline: 42,
          target: 34,
          direction: "down",
        },
      },
      {
        title: "Improve Stars measures — plan all-cause readmission",
        description:
          "Plan all-cause readmission is rated 2 Stars. A 30/60/90-day post-discharge care coordination protocol could move this to 3 Stars by next measurement year.",
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 1150,
      sharedSavings: true,
      sharedSavingsRate: 44,
      sharedSavingsThreshold: 1.5,
      sharedSavingsCap: 9,
      qualityGate: 75,
      sharedRisk: true,
      sharedRiskRate: 46,
      sharedRiskThreshold: 1.5,
      downsideRiskCap: 10,
      populationHealthBudget: 560000,
    },
  },
  {
    id: "ma-003",
    name: "Aetna Medicare Select — West Coast",
    payor: "Aetna",
    contractType: "Medicare Advantage",
    vbcContractModel: "Pay for Performance",
    attributedLives: 5120,
    currentPmpm: 1090,
    targetPmpm: 1120,
    qualityScore: 88,
    edVisitsPer1000: 248,
    status: "On Track",
    trend: [
      { month: "Sep 2024", pmpm: 1110, qualityScore: 85 },
      { month: "Oct 2024", pmpm: 1105, qualityScore: 86 },
      { month: "Nov 2024", pmpm: 1100, qualityScore: 87 },
      { month: "Dec 2024", pmpm: 1096, qualityScore: 87 },
      { month: "Jan 2025", pmpm: 1093, qualityScore: 88 },
      { month: "Feb 2025", pmpm: 1090, qualityScore: 88 },
    ],
    opportunities: [
      {
        title: "Pursue 5-Star bonus threshold",
        description:
          "Current composite Star Rating is 4.5. Improving breast cancer screening compliance from 71% to 80% and flu vaccination from 78% to 85% could push to 5 Stars.",
      },
      {
        title: "Expand virtual-first primary care",
        description:
          "Virtual PCP utilization is 28% — below the 40% plan average. Incentivizing members to complete routine visits via telehealth reduces facility cost by ~$80 per visit.",
      },
      {
        title: "Optimize end-of-life care spend",
        description:
          "ICU utilization in the last 30 days of life is above the 20th percentile. Palliative care outreach for members with Stage III/IV diagnoses can improve experience and reduce cost.",
      },
    ],
  },
  {
    id: "ma-004",
    name: "United MA Compass — Midwest",
    payor: "UnitedHealthcare",
    contractType: "Medicare Advantage",
    vbcContractModel: "Shared Risk",
    attributedLives: 9200,
    currentPmpm: 1240,
    targetPmpm: 1180,
    qualityScore: 61,
    edVisitsPer1000: 415,
    status: "Off Track",
    trend: [
      { month: "Sep 2024", pmpm: 1195, qualityScore: 65 },
      { month: "Oct 2024", pmpm: 1205, qualityScore: 64 },
      { month: "Nov 2024", pmpm: 1215, qualityScore: 63 },
      { month: "Dec 2024", pmpm: 1225, qualityScore: 62 },
      { month: "Jan 2025", pmpm: 1234, qualityScore: 62 },
      { month: "Feb 2025", pmpm: 1240, qualityScore: 61 },
    ],
    opportunities: [
      {
        title: "Implement high-risk member stratification",
        description:
          "No formal risk-stratification model is in use. Deploying a predictive model to identify the top 500 members by 12-month cost risk could improve care management targeting and save an estimated 8 PMPM over time.",
        confidence: "Medium",
        impactEstimate: {
          pmpmDelta: -8,
          timelineDays: 180,
        },
        ownerRole: "Population Health Analytics",
        workflowTypes: ["risk_model_deployment", "care_management_targeting"],
        projectPlanActions: [
          "Deploy predictive risk scoring across the attributed population.",
          "Prioritize the top 500 members for care management targeting.",
          "Track targeted-member engagement and downstream utilization quarterly.",
        ],
        primaryKpi: {
          key: "high_risk_targeting_precision",
          displayName: "High-Risk Targeting Precision",
          baseline: 42,
          target: 68,
          direction: "up",
        },
      },
      {
        title: "Reduce avoidable inpatient admissions",
        description:
          "Ambulatory care-sensitive condition admission rate is 35% above the plan norm. Embedding care managers in the 5 highest-volume primary care practices could save an estimated 30 PMPM.",
        confidence: "High",
        impactEstimate: {
          pmpmDelta: -30,
          timelineDays: 120,
        },
        ownerRole: "Regional Care Management VP",
        workflowTypes: ["embedded_care_management", "avoidable_admission_reduction"],
        projectPlanActions: [
          "Embed care managers in the five highest-volume primary care practices.",
          "Launch admission-prevention huddles for ambulatory care-sensitive conditions.",
          "Track practice-level admission reductions monthly.",
        ],
        primaryKpi: {
          key: "avoidable_inpatient_admission_rate",
          displayName: "Avoidable Inpatient Admission Rate",
          baseline: 19,
          target: 14,
          direction: "down",
        },
      },
      {
        title: "Address pharmacy cost escalation",
        description:
          "Specialty pharmacy spend grew 31% YoY. Engaging a specialty pharmacy management vendor and tightening step-therapy protocols could save an estimated 36 PMPM, but requires significant cross-functional change.",
        confidence: "Medium",
        impactEstimate: {
          pmpmDelta: -36,
          timelineDays: 210,
        },
        ownerRole: "Pharmacy Strategy Lead",
        workflowTypes: ["specialty_pharmacy_management", "step_therapy_optimization"],
        projectPlanActions: [
          "Select and onboard specialty pharmacy management partner.",
          "Review high-cost biologic protocols and tighten step-therapy governance.",
          "Track specialty trend performance and provider adoption monthly.",
        ],
        primaryKpi: {
          key: "specialty_pharmacy_pmpm",
          displayName: "Specialty Pharmacy PMPM",
          baseline: 126,
          target: 98,
          direction: "down",
        },
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 1180,
      sharedSavings: true,
      sharedSavingsRate: 42,
      sharedSavingsThreshold: 1.5,
      sharedSavingsCap: 8,
      qualityGate: 76,
      sharedRisk: true,
      sharedRiskRate: 48,
      sharedRiskThreshold: 1.5,
      downsideRiskCap: 10,
      populationHealthBudget: 685000,
    },
  },

  // ── Commercial ───────────────────────────────────────────────────────────
  {
    id: "comm-001",
    name: "Aetna Commercial ACO — Large Employer",
    payor: "Aetna",
    contractType: "Commercial",
    vbcContractModel: "Pay for Performance",
    attributedLives: 2150,
    currentPmpm: 480,
    targetPmpm: 450,
    qualityScore: 71,
    edVisitsPer1000: 340,
    status: "Off Track",
    trend: [
      { month: "Sep 2024", pmpm: 440, qualityScore: 74 },
      { month: "Oct 2024", pmpm: 450, qualityScore: 73 },
      { month: "Nov 2024", pmpm: 460, qualityScore: 72 },
      { month: "Dec 2024", pmpm: 468, qualityScore: 72 },
      { month: "Jan 2025", pmpm: 475, qualityScore: 71 },
      { month: "Feb 2025", pmpm: 480, qualityScore: 71 },
    ],
    opportunities: [
      {
        title: "Address behavioral health cost drivers",
        description:
          "Behavioral health claims are up 22% YoY. Embedding a behavioral health navigator and expanding telehealth access could curb growth.",
      },
      {
        title: "Strengthen primary care utilization",
        description:
          "PCP visit rate is below benchmark. Members who see their PCP regularly have 30% lower downstream specialty and ED costs.",
      },
      {
        title: "Negotiate specialist referral guidelines",
        description:
          "Out-of-network specialist spend is 18% above peer average. Implementing a preferred specialist list with warm referral handoffs can redirect volume.",
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 450,
      sharedSavings: true,
      sharedSavingsRate: 40,
      sharedSavingsThreshold: 1,
      sharedSavingsCap: 8,
      qualityGate: 68,
      sharedRisk: true,
      sharedRiskRate: 35,
      sharedRiskThreshold: 1,
      downsideRiskCap: 7,
      populationHealthBudget: 94000,
    },
  },
  {
    id: "comm-002",
    name: "United Commercial Value — Mid-Market",
    payor: "UnitedHealthcare",
    contractType: "Commercial",
    vbcContractModel: "Shared Savings",
    attributedLives: 1870,
    currentPmpm: 415,
    targetPmpm: 430,
    qualityScore: 82,
    edVisitsPer1000: 278,
    status: "On Track",
    trend: [
      { month: "Sep 2024", pmpm: 425, qualityScore: 80 },
      { month: "Oct 2024", pmpm: 422, qualityScore: 81 },
      { month: "Nov 2024", pmpm: 420, qualityScore: 81 },
      { month: "Dec 2024", pmpm: 418, qualityScore: 82 },
      { month: "Jan 2025", pmpm: 416, qualityScore: 82 },
      { month: "Feb 2025", pmpm: 415, qualityScore: 82 },
    ],
    opportunities: [
      {
        title: "Capture preventive care upside",
        description:
          "Preventive screening rates are solid but cancer screening compliance lags at 62%. Reaching 75% would qualify for a $45K quality bonus.",
      },
      {
        title: "Optimize pharmacy spend",
        description:
          "Generic dispensing rate is 78% vs. an 85% target. Outreach to prescribers about therapeutic substitution opportunities could save ~$30 PMPM.",
      },
      {
        title: "Grow attributed lives",
        description:
          "Attribution is stable but 14% of eligible members remain unattributed. A PCP outreach campaign could expand attributed lives and spread fixed costs.",
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 430,
      sharedSavings: true,
      sharedSavingsRate: 40,
      sharedSavingsThreshold: 1,
      sharedSavingsCap: 8,
      qualityGate: 70,
      sharedRisk: true,
      sharedRiskRate: 35,
      sharedRiskThreshold: 1,
      downsideRiskCap: 7,
      populationHealthBudget: 82000,
    },
  },
  {
    id: "comm-003",
    name: "Cigna Total Care — Tech Sector",
    payor: "Cigna",
    contractType: "Commercial",
    vbcContractModel: "Pay for Performance",
    attributedLives: 3280,
    currentPmpm: 395,
    targetPmpm: 410,
    qualityScore: 91,
    edVisitsPer1000: 198,
    status: "On Track",
    trend: [
      { month: "Sep 2024", pmpm: 408, qualityScore: 89 },
      { month: "Oct 2024", pmpm: 405, qualityScore: 90 },
      { month: "Nov 2024", pmpm: 403, qualityScore: 90 },
      { month: "Dec 2024", pmpm: 400, qualityScore: 91 },
      { month: "Jan 2025", pmpm: 397, qualityScore: 91 },
      { month: "Feb 2025", pmpm: 395, qualityScore: 91 },
    ],
    opportunities: [
      {
        title: "Leverage mental health parity for retention",
        description:
          "Member satisfaction surveys show mental health access as a top concern. Expanding EAP-linked therapy sessions from 8 to 16 annually could improve retention and reduce burnout-related absenteeism.",
      },
      {
        title: "Introduce musculoskeletal care pathway",
        description:
          "MSK claims are the top non-pharmacy cost driver. A digital PT-first pathway for back/knee pain could reduce surgical referrals by 25% and save $18 PMPM.",
      },
      {
        title: "Extend shared savings opportunity",
        description:
          "Current performance puts this contract in a strong position for the 2026 shared savings tier. Sustaining ED rates below 200 per 1,000 for two more quarters locks in the bonus.",
      },
    ],
  },
  {
    id: "comm-004",
    name: "Humana Commercial PCMH — Retail Sector",
    payor: "Humana",
    contractType: "Commercial",
    vbcContractModel: "Shared Savings",
    attributedLives: 4100,
    currentPmpm: 462,
    targetPmpm: 445,
    qualityScore: 69,
    edVisitsPer1000: 355,
    status: "At Risk",
    trend: [
      { month: "Sep 2024", pmpm: 441, qualityScore: 73 },
      { month: "Oct 2024", pmpm: 447, qualityScore: 72 },
      { month: "Nov 2024", pmpm: 451, qualityScore: 71 },
      { month: "Dec 2024", pmpm: 455, qualityScore: 70 },
      { month: "Jan 2025", pmpm: 459, qualityScore: 70 },
      { month: "Feb 2025", pmpm: 462, qualityScore: 69 },
    ],
    opportunities: [
      {
        title: "Target high-ED-utilizer cohort",
        description:
          "355 ED visits per 1,000 is driven by 180 members with 4+ visits in the past year. Intensive case management for this group could reduce total ED spend by $22 PMPM across the population.",
        originAgentId: "contract_performance",
        contributingAgentIds: ["claims_friction", "kaiser_outreach"],
        executiveSummary:
          "A small repeat-utilizer segment is driving disproportionate ED spend; focused case management can bend both utilization and PMPM trendlines.",
        confidence: "High",
        impactEstimate: {
          pmpmDelta: -22,
          qualityLiftPoints: 2,
          timelineDays: 45,
        },
        ownerRole: "Care Management Lead",
        workflowTypes: ["ed_frequent_utilizer"],
        projectPlanActions: [
          "Enroll top 180 repeat-utilizers into intensive case management.",
          "Complete individualized care plans within 14 days of enrollment.",
          "Monitor repeat ED utilization weekly and escalate unresolved barriers.",
        ],
        primaryKpi: {
          key: "ed_visits_per_1000_mm",
          displayName: "ED Visits per 1,000",
          baseline: 355,
          target: 300,
          direction: "down",
        },
        leadingKpis: [
          {
            key: "reach_rate",
            displayName: "High-risk Member Reach Rate",
            baseline: 49,
            target: 78,
            direction: "up",
          },
        ],
      },
      {
        title: "Improve diabetes and hypertension control",
        description:
          "Uncontrolled hypertension affects 34% of members with a diagnosis. A nurse-led remote monitoring program could reduce complications, improve quality by 3 points, and save an estimated 13 PMPM.",
        confidence: "Medium",
        impactEstimate: {
          pmpmDelta: -13,
          qualityLiftPoints: 3,
          timelineDays: 150,
        },
        ownerRole: "Chronic Disease Program Lead",
        workflowTypes: ["remote_monitoring", "nurse_led_hypertension_management"],
        projectPlanActions: [
          "Enroll uncontrolled members into a nurse-led remote monitoring pathway.",
          "Escalate persistently elevated readings to PCP review and medication adjustment.",
          "Track blood pressure control and complication-related utilization monthly.",
        ],
        primaryKpi: {
          key: "hypertension_control_rate",
          displayName: "Hypertension Control Rate",
          baseline: 66,
          target: 78,
          direction: "up",
        },
      },
      {
        title: "Address shift-worker access gaps",
        description:
          "Nineteen percent of the population works non-standard hours, limiting PCP access. Extended-hours clinics and same-day virtual urgent care could reduce avoidable ED use over time and save an estimated 11 PMPM.",
        confidence: "Low",
        impactEstimate: {
          pmpmDelta: -11,
          timelineDays: 180,
        },
        ownerRole: "Access Transformation Lead",
        workflowTypes: ["extended_hours_access", "virtual_urgent_care_expansion"],
        projectPlanActions: [
          "Pilot evening and weekend access for high-need populations.",
          "Expand same-day virtual urgent care access for non-emergent complaints.",
          "Monitor shift-worker PCP attachment and ED diversion trends quarterly.",
        ],
        primaryKpi: {
          key: "after_hours_access_utilization",
          displayName: "After-Hours Access Utilization",
          baseline: 12,
          target: 28,
          direction: "up",
        },
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 445,
      sharedSavings: true,
      sharedSavingsRate: 42,
      sharedSavingsThreshold: 1,
      sharedSavingsCap: 8,
      qualityGate: 70,
      sharedRisk: true,
      sharedRiskRate: 38,
      sharedRiskThreshold: 1,
      downsideRiskCap: 8,
      populationHealthBudget: 176000,
    },
  },
  {
    id: "comm-005",
    name: "BlueCross Commercial ACO — Public Sector",
    payor: "BlueCross BlueShield",
    contractType: "Commercial",
    vbcContractModel: "Shared Risk",
    attributedLives: 6750,
    currentPmpm: 505,
    targetPmpm: 520,
    qualityScore: 77,
    edVisitsPer1000: 290,
    status: "On Track",
    trend: [
      { month: "Sep 2024", pmpm: 522, qualityScore: 75 },
      { month: "Oct 2024", pmpm: 518, qualityScore: 75 },
      { month: "Nov 2024", pmpm: 514, qualityScore: 76 },
      { month: "Dec 2024", pmpm: 511, qualityScore: 76 },
      { month: "Jan 2025", pmpm: 508, qualityScore: 77 },
      { month: "Feb 2025", pmpm: 505, qualityScore: 77 },
    ],
    opportunities: [
      {
        title: "Accelerate chronic disease registry enrollment",
        description:
          "Only 61% of members with diabetes, COPD, or CHF are enrolled in a care management program. Reaching 80% could yield a 2-point quality improvement and $12 PMPM savings.",
      },
      {
        title: "Reduce non-emergent ambulance transport",
        description:
          "Ambulance claims are 19% above the state benchmark. Partnering with local EMS for nurse triage line enrollment could divert 15% of low-acuity calls.",
      },
      {
        title: "Improve flu and pneumococcal vaccination rates",
        description:
          "Flu vaccination is at 64% — below the 72% contract threshold. A targeted outreach campaign in October/November could close the gap and meet the quality incentive.",
      },
    ],
  },
  {
    id: "mssp-004",
    name: "ACO REACH — Mountain Region",
    payor: "CMS",
    contractType: "MSSP",
    vbcContractModel: "Shared Savings",
    attributedLives: 4380,
    currentPmpm: 902,
    targetPmpm: 890,
    qualityScore: 76,
    edVisitsPer1000: 298,
    status: "At Risk",
    trend: [
      { month: "Sep 2024", pmpm: 884, qualityScore: 78 },
      { month: "Oct 2024", pmpm: 889, qualityScore: 78 },
      { month: "Nov 2024", pmpm: 894, qualityScore: 77 },
      { month: "Dec 2024", pmpm: 897, qualityScore: 77 },
      { month: "Jan 2025", pmpm: 900, qualityScore: 76 },
      { month: "Feb 2025", pmpm: 902, qualityScore: 76 },
    ],
    opportunities: [
      {
        title: "Strengthen CHF transition bundle adherence",
        description:
          "Follow-up within 7 days after CHF discharge sits at 62%. Raising this to 80% could reduce readmissions and improve both cost and quality trajectories.",
      },
      {
        title: "Expand community paramedicine referral pathways",
        description:
          "Low-acuity ED transports remain elevated in frontier counties. Community paramedicine referrals and home-based triage can reduce avoidable ED utilization.",
      },
      {
        title: "Improve nephrology referral timeliness for CKD members",
        description:
          "Delayed nephrology engagement is linked to avoidable inpatient renal events. Earlier referral triggers for stage 3+ CKD members can reduce downstream spend.",
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 890,
      sharedSavings: true,
      sharedSavingsRate: 50,
      sharedSavingsThreshold: 2,
      sharedSavingsCap: 10,
      qualityGate: 71,
      sharedRisk: true,
      sharedRiskRate: 40,
      sharedRiskThreshold: 2,
      downsideRiskCap: 8,
      populationHealthBudget: 201000,
    },
  },
  {
    id: "ma-005",
    name: "Kaiser MA Partnership — Pacific Northwest",
    payor: "Kaiser",
    contractType: "Medicare Advantage",
    vbcContractModel: "Full Risk",
    attributedLives: 4680,
    currentPmpm: 1068,
    targetPmpm: 1095,
    qualityScore: 87,
    edVisitsPer1000: 236,
    status: "On Track",
    trend: [
      { month: "Sep 2024", pmpm: 1098, qualityScore: 84 },
      { month: "Oct 2024", pmpm: 1090, qualityScore: 85 },
      { month: "Nov 2024", pmpm: 1082, qualityScore: 86 },
      { month: "Dec 2024", pmpm: 1076, qualityScore: 86 },
      { month: "Jan 2025", pmpm: 1071, qualityScore: 87 },
      { month: "Feb 2025", pmpm: 1068, qualityScore: 87 },
    ],
    opportunities: [
      {
        title: "Scale home-based palliative consult access",
        description:
          "Members with advanced chronic conditions are under-enrolled in palliative services. Expanding home-based consult capacity can improve experience and lower acute utilization.",
      },
      {
        title: "Close osteoporosis management gap post-fracture",
        description:
          "Only 57% of eligible members receive bone density testing or treatment after fracture. Improving closure to 75% supports Stars and reduces secondary fracture risk.",
      },
      {
        title: "Optimize preferred SNF network steering",
        description:
          "Variation in post-acute placements is increasing LOS and cost. Preferred network steering and concurrent review can stabilize post-acute spend.",
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 1095,
      sharedSavings: true,
      sharedSavingsRate: 45,
      sharedSavingsThreshold: 1.5,
      sharedSavingsCap: 9,
      qualityGate: 76,
      sharedRisk: true,
      sharedRiskRate: 44,
      sharedRiskThreshold: 1.5,
      downsideRiskCap: 9,
      populationHealthBudget: 300000,
    },
  },
  {
    id: "comm-006",
    name: "Cigna Employer Direct — Manufacturing",
    payor: "Cigna",
    contractType: "Commercial",
    vbcContractModel: "Pay for Performance",
    attributedLives: 2840,
    currentPmpm: 434,
    targetPmpm: 420,
    qualityScore: 73,
    edVisitsPer1000: 322,
    status: "At Risk",
    trend: [
      { month: "Sep 2024", pmpm: 416, qualityScore: 75 },
      { month: "Oct 2024", pmpm: 421, qualityScore: 75 },
      { month: "Nov 2024", pmpm: 425, qualityScore: 74 },
      { month: "Dec 2024", pmpm: 429, qualityScore: 74 },
      { month: "Jan 2025", pmpm: 432, qualityScore: 73 },
      { month: "Feb 2025", pmpm: 434, qualityScore: 73 },
    ],
    opportunities: [
      {
        title: "Reduce musculoskeletal imaging leakage",
        description:
          "MSK imaging utilization is above contracted targets. Introduce conservative management-first prior auth pathways to reduce low-value imaging.",
      },
      {
        title: "Launch shift-friendly primary care access pods",
        description:
          "Second and third shift workers have low preventive visit completion. Extended-hours clinics and virtual triage can improve PCP attachment.",
      },
      {
        title: "Deploy injury prevention micro-campaign",
        description:
          "Workforce injury-related claims are climbing YoY. Targeted ergonomic and occupational medicine campaigns can bend trendlines.",
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 420,
      sharedSavings: true,
      sharedSavingsRate: 41,
      sharedSavingsThreshold: 1,
      sharedSavingsCap: 8,
      qualityGate: 69,
      sharedRisk: true,
      sharedRiskRate: 36,
      sharedRiskThreshold: 1,
      downsideRiskCap: 7,
      populationHealthBudget: 118000,
    },
  },
  {
    id: "comm-007",
    name: "BlueShield Select Value — Education Sector",
    payor: "Blue Shield",
    contractType: "Commercial",
    vbcContractModel: "Shared Savings",
    attributedLives: 3560,
    currentPmpm: 448,
    targetPmpm: 460,
    qualityScore: 84,
    edVisitsPer1000: 259,
    status: "On Track",
    trend: [
      { month: "Sep 2024", pmpm: 467, qualityScore: 81 },
      { month: "Oct 2024", pmpm: 462, qualityScore: 82 },
      { month: "Nov 2024", pmpm: 458, qualityScore: 83 },
      { month: "Dec 2024", pmpm: 454, qualityScore: 83 },
      { month: "Jan 2025", pmpm: 451, qualityScore: 84 },
      { month: "Feb 2025", pmpm: 448, qualityScore: 84 },
    ],
    opportunities: [
      {
        title: "Expand digital PT-first pathway",
        description:
          "Orthopedic referrals are trending up despite stable prevalence. A PT-first digital triage pathway can preserve quality while reducing specialty spend.",
      },
      {
        title: "Increase preventive immunization compliance",
        description:
          "Adult immunization rates in younger dependents lag targets. Targeted reminders and employer-sponsored clinic events can close this quality gap.",
      },
      {
        title: "Optimize maternity episode navigation",
        description:
          "Episode variation in maternity care is driving avoidable NICU exposure. Navigator-led prenatal engagement can improve outcomes and reduce avoidable cost.",
      },
    ],
    vbcTerms: {
      performancePeriodStart: "2026-01-01",
      performancePeriodEnd: "2026-12-31",
      benchmarkPmpm: 460,
      sharedSavings: true,
      sharedSavingsRate: 40,
      sharedSavingsThreshold: 1,
      sharedSavingsCap: 8,
      qualityGate: 70,
      sharedRisk: true,
      sharedRiskRate: 35,
      sharedRiskThreshold: 1,
      downsideRiskCap: 7,
      populationHealthBudget: 134000,
    },
  },
];

// ---------------------------------------------------------------------------
// Derived summary values — computed once from the mock dataset
// ---------------------------------------------------------------------------

export const summaryStats = {
  totalContracts: mockContracts.length,
  totalAttributedLives: mockContracts.reduce((sum, c) => sum + c.attributedLives, 0),
  contractsAtRisk: mockContracts.filter(
    (c) => c.status === "At Risk" || c.status === "Off Track"
  ).length,
};

const byId = (id: string) => {
  const contract = mockContracts.find((c) => c.id === id);
  if (!contract) throw new Error(`Missing mock contract for agreement mapping: ${id}`);
  return contract;
};

export const mockContractAgreements: ContractAgreement[] = [
  {
    id: "vbca-cms-population-health-enterprise",
    name: "CMS Population Health Enterprise VBCA",
    agreementType: "VBCA",
    payors: ["CMS"],
    contracts: [byId("mssp-001"), byId("mssp-002"), byId("mssp-003"), byId("mssp-004")],
  },
  {
    id: "vbca-bcbs-enterprise-value-collaborative",
    name: "BlueCross BlueShield Enterprise Value Collaborative VBCA",
    agreementType: "VBCA",
    payors: ["BlueCross BlueShield"],
    contracts: [byId("ma-001"), byId("comm-005")],
  },
  {
    id: "vbca-humana-enterprise-value-collaborative",
    name: "Humana Enterprise Value Collaborative VBCA",
    agreementType: "VBCA",
    payors: ["Humana"],
    contracts: [byId("ma-002"), byId("comm-004")],
  },
  {
    id: "vbca-aetna-enterprise-value-collaborative",
    name: "Aetna Enterprise Value Collaborative VBCA",
    agreementType: "VBCA",
    payors: ["Aetna"],
    contracts: [byId("ma-003"), byId("comm-001")],
  },
  {
    id: "vbca-unitedhealthcare-enterprise-value-collaborative",
    name: "UnitedHealthcare Enterprise Value Collaborative VBCA",
    agreementType: "VBCA",
    payors: ["UnitedHealthcare"],
    contracts: [byId("ma-004"), byId("comm-002")],
  },
  {
    id: "vbca-cigna-enterprise-value-collaborative",
    name: "Cigna Enterprise Value Collaborative VBCA",
    agreementType: "VBCA",
    payors: ["Cigna"],
    contracts: [byId("comm-003"), byId("comm-006")],
  },
  {
    id: "vbca-kaiser-ma-value-acceleration",
    name: "Kaiser MA Value Acceleration VBCA",
    agreementType: "VBCA",
    payors: ["Kaiser"],
    contracts: [byId("ma-005")],
  },
  {
    id: "vbca-blue-shield-commercial-expansion-coalition",
    name: "Blue Shield Commercial Expansion Coalition VBCA",
    agreementType: "VBCA",
    payors: ["Blue Shield"],
    contracts: [byId("comm-007")],
  },
];

const contractRegionMarketById: Record<string, { region: string; market: string }> = {
  "mssp-001": { region: "Northeast", market: "Illinois" },
  "mssp-002": { region: "Midwest", market: "Wisconsin" },
  "mssp-003": { region: "Southeast", market: "Greater Macon" },
  "mssp-004": { region: "West", market: "Greater Rome" },
  "ma-001": { region: "Northeast", market: "Greater Charlotte" },
  "ma-002": { region: "South", market: "Greater Winston" },
  "ma-003": { region: "West", market: "Northwest North Carolina" },
  "ma-004": { region: "Midwest", market: "Wisconsin" },
  "ma-005": { region: "West", market: "Greater Rome" },
  "comm-001": { region: "Northeast", market: "Greater Charlotte" },
  "comm-002": { region: "Midwest", market: "Illinois" },
  "comm-003": { region: "West", market: "Northwest North Carolina" },
  "comm-004": { region: "South", market: "Greater Winston" },
  "comm-005": { region: "Northeast", market: "Greater Macon" },
  "comm-006": { region: "Midwest", market: "Wisconsin" },
  "comm-007": { region: "West", market: "Greater Charlotte" },
};

const agreementIdByContractId = new Map<string, string>();
mockContractAgreements.forEach((agreement) => {
  agreement.contracts.forEach((contract) => {
    agreementIdByContractId.set(contract.id, agreement.id);
  });
});

function inferMockInsuranceSegment(contract: Contract) {
  if (contract.contractType === "Medicare Advantage") return "MA";
  if (contract.contractType === "MSSP") return "Medicare";
  if (/medicaid/i.test(contract.payor)) return "Medicaid";
  if (/aca/i.test(contract.payor)) return "ACA";
  return "Commercial";
}

mockContracts.forEach((contract) => {
  const regionMarket = contractRegionMarketById[contract.id];
  if (regionMarket) {
    contract.region = regionMarket.region;
    contract.market = regionMarket.market;
  }

  contract.insuranceSegment = inferMockInsuranceSegment(contract);

  const agreementId = agreementIdByContractId.get(contract.id);
  if (agreementId) {
    contract.agreementId = agreementId;
  }
});
