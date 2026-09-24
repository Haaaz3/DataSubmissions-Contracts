export type SynapseAgentId =
  | "quality_care_gap"
  | "pre_visit_prep"
  | "health_system_resources"
  | "contract_performance"
  | "claims_friction"
  | "life_sciences_clinical"
  | "life_sciences_trial_supply"
  | "trial_portfolio_strategy"
  | "trial_population_fit"
  | "trial_leakage_expansion"
  | "trial_feasibility_activation"
  | "evidence_therapy_trial"
  | "payer_utilization"
  | "university_evidence"
  | "pharma_adherence"
  | "mayo_referral"
  | "mayo_discharge"
  | "cleveland_pathway"
  | "cleveland_readmission"
  | "kaiser_prevention"
  | "kaiser_outreach"
  | "optum_prior_auth"
  | "optum_leakage"
  | "aetna_pharmacy"
  | "aetna_benefits"
  | "stanford_trials"
  | "stanford_guidelines"
  | "pfizer_adherence"
  | "pfizer_access"
  | "roche_oncology"
  | "roche_biomarker"
  | "komodo_journey"
  | "komodo_outcomes";

export type AgentSuiteId =
  | "oracle_health"
  | "life_sciences_suite"
  | "health_system_trial_strategy_suite"
  | "payer_suite"
  | "university_suite"
  | "pharma_suite"
  | "mayo_suite"
  | "cleveland_suite"
  | "kaiser_suite"
  | "optum_suite"
  | "aetna_suite"
  | "stanford_suite"
  | "pfizer_suite"
  | "roche_suite"
  | "komodo_suite";

export interface AgentSuiteDefinition {
  id: AgentSuiteId;
  name: string;
  owner: string;
  description: string;
  category: "Platform" | "Providers" | "Payors" | "Research" | "Pharma" | "Partners";
  logoText: string;
  accent: {
    text: string;
    bg: string;
    ring: string;
    soft: string;
  };
  disclaimer: string;
  routeRecommendations: string[];
}

export interface AgentDefinition {
  id: SynapseAgentId;
  suiteId: AgentSuiteId;
  displayName: string;
  shortLabel: string;
  icon: string;
  accent: {
    text: string;
    bg: string;
    ring: string;
    soft: string;
  };
  shortDescription: string;
  recommendedRoutes: string[];
  disclaimer: string;
  promptExamplesByRoute: Record<string, string[]>;
}

export interface AgentProfileDetails {
  detailedDescription: string;
  dataSources: string[];
  excelsAt: string[];
  capabilities: string[];
}

export const agentRegistry: AgentDefinition[] = [
  {
    id: "quality_care_gap",
    suiteId: "oracle_health",
    displayName: "Quality Care Gap Agent",
    shortLabel: "Quality",
    icon: "🎯",
    accent: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      ring: "ring-emerald-300",
      soft: "bg-emerald-100/60",
    },
    shortDescription: "Targets screening/chronic care gaps and closure workflows.",
    recommendedRoutes: ["/quality", "/cohorts", "/projects"],
    disclaimer: "Synthetic decision support only. Not clinical advice.",
    promptExamplesByRoute: {
      default: [
        "Which quality gaps are most urgent?",
        "Suggest a closure outreach plan",
        "Show gap closure velocity by segment",
      ],
      "/quality": [
        "Which quality measures need improvement?",
        "Show screening gaps by cohort",
        "Draft a screening improvement plan",
      ],
      "/projects": [
        "Are gap-closure workflows on pace?",
        "Which segments are lagging?",
        "What outreach needs escalation?",
      ],
    },
  },
  {
    id: "pre_visit_prep",
    suiteId: "oracle_health",
    displayName: "Pre-visit Prep Agent",
    shortLabel: "Pre-visit",
    icon: "🗓️",
    accent: {
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      ring: "ring-indigo-300",
      soft: "bg-indigo-100/60",
    },
    shortDescription: "Prioritizes upcoming attributed visits and highlights closable care gaps.",
    recommendedRoutes: ["/population", "/quality", "/projects"],
    disclaimer: "Synthetic pre-visit planning support only. Not clinical advice.",
    promptExamplesByRoute: {
      default: [
        "Which upcoming visits have the highest closure opportunity?",
        "Summarize pre-visit actions for next week",
        "Show top closable gaps before appointments",
      ],
      "/population": [
        "Rank upcoming attributed visits by closure opportunity",
        "What should each PCP address during the next appointment?",
        "Which care gaps are most likely to close this week?",
      ],
    },
  },
  {
    id: "health_system_resources",
    suiteId: "oracle_health",
    displayName: "Health System Resources Agent",
    shortLabel: "Resources",
    icon: "🏥",
    accent: {
      text: "text-cyan-700",
      bg: "bg-cyan-50",
      ring: "ring-cyan-300",
      soft: "bg-cyan-100/60",
    },
    shortDescription:
      "Assesses staffing, clinic capacity, and operational constraints across the health system.",
    recommendedRoutes: ["/quality", "/projects", "/care-management"],
    disclaimer: "Synthetic operational planning support only.",
    promptExamplesByRoute: {
      default: [
        "Summarize current staffing constraints",
        "Where do we have outreach capacity this week?",
        "Show resource bottlenecks affecting quality outcomes",
      ],
      "/quality": [
        "What staffing and clinic capacity should shape care-gap actions?",
        "Which channels can absorb additional outreach this week?",
        "What resource constraints limit gap closure this month?",
      ],
    },
  },
  {
    id: "contract_performance",
    suiteId: "oracle_health",
    displayName: "Contract Performance Agent",
    shortLabel: "Contract",
    icon: "📈",
    accent: {
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      ring: "ring-indigo-300",
      soft: "bg-indigo-100/60",
    },
    shortDescription: "Focuses on PMPM variance, utilization, and margin risk.",
    recommendedRoutes: ["/contracts", "/projects", "/actions"],
    disclaimer: "Synthetic financial insights only. Not actuarial guidance.",
    promptExamplesByRoute: {
      default: [
        "Where is PMPM variance highest?",
        "Summarize margin risk drivers",
        "Recommend contract optimization workflows",
      ],
      "/contracts": [
        "Highlight contract performance risks",
        "Where are savings leaking?",
        "Which utilization driver matters most?",
      ],
      "/projects": [
        "Summarize progress vs targets",
        "Which leading indicators need attention?",
        "Is the project on pace for savings?",
      ],
    },
  },
  {
    id: "claims_friction",
    suiteId: "oracle_health",
    displayName: "Claims Coverage Friction Agent",
    shortLabel: "Claims",
    icon: "🧭",
    accent: {
      text: "text-amber-700",
      bg: "bg-amber-50",
      ring: "ring-amber-300",
      soft: "bg-amber-100/60",
    },
    shortDescription: "Surfaces denials, authorization bottlenecks, and coverage gaps.",
    recommendedRoutes: ["/population", "/projects", "/contracts"],
    disclaimer: "Synthetic claims insights only. Not payer guidance.",
    promptExamplesByRoute: {
      default: [
        "Where is coverage friction spiking?",
        "Summarize denial patterns",
        "Suggest navigation workflows",
      ],
      "/population": [
        "Identify coverage friction segments",
        "Show prior auth bottlenecks",
        "What friction is driving ED use?",
      ],
      "/projects": [
        "Which workflows address coverage friction?",
        "Show friction trend impact",
        "Where do denials cluster?",
      ],
    },
  },
  {
    id: "life_sciences_clinical",
    suiteId: "oracle_health",
    displayName: "Life Sciences Clinical Intelligence Agent",
    shortLabel: "LifeSci",
    icon: "🧠",
    accent: {
      text: "text-cyan-700",
      bg: "bg-cyan-50",
      ring: "ring-cyan-300",
      soft: "bg-cyan-100/60",
    },
    shortDescription:
      "Analyzes phenotype/history, suggests evidence-based therapies and relevant trials, and builds access qualification checklists.",
    recommendedRoutes: ["/life-sciences", "/population", "/cohorts", "/quality"],
    disclaimer: "Synthetic educational support only. Not clinical diagnosis, treatment, or trial eligibility advice.",
    promptExamplesByRoute: {
      default: [
        "Summarize evidence-based therapy options for this phenotype",
        "Show likely trial-fit candidates and expected outcomes delta",
        "Create an access qualification checklist",
      ],
      "/life-sciences": [
        "Which patient phenotypes are strongest fits for active trial opportunities?",
        "Draft therapy + trial recommendations with readmission and exacerbation delta",
        "Show coverage barriers and required submission criteria",
      ],
    },
  },
  {
    id: "life_sciences_trial_supply",
    suiteId: "life_sciences_suite",
    displayName: "Life Sciences Trial Supply & Site Gap Agent",
    shortLabel: "Trial Supply",
    icon: "🧪",
    accent: {
      text: "text-violet-700",
      bg: "bg-violet-50",
      ring: "ring-violet-300",
      soft: "bg-violet-100/60",
    },
    shortDescription:
      "Shows pharma where eligible trial populations are across the network, including site gaps, feasibility, and enrollment velocity recommendations.",
    recommendedRoutes: ["/life-sciences", "/population", "/cohorts"],
    disclaimer:
      "Synthetic de-identified population intelligence only. Not patient-level eligibility determination.",
    promptExamplesByRoute: {
      default: [
        "Where are the eligible patients for Trial X across the network?",
        "Show site gap regions with high eligibility density and no active sites",
        "Recommend open-site vs route-to-site actions with enrollment velocity forecast",
      ],
      "/life-sciences": [
        "Generate a heat map of eligible lives for Trial X",
        "Show time-to-enrollment forecast by region",
        "Recommend whether to boot up a site or route to an existing site",
      ],
    },
  },
  {
    id: "trial_portfolio_strategy",
    suiteId: "health_system_trial_strategy_suite",
    displayName: "Trial Portfolio Strategy Agent",
    shortLabel: "Portfolio Strategy",
    icon: "🧭",
    accent: {
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      ring: "ring-indigo-300",
      soft: "bg-indigo-100/60",
    },
    shortDescription:
      "Ranks which trials to host based on population fit, sponsor-fit, quality upside, leakage retention, and financial return.",
    recommendedRoutes: ["/life-sciences", "/projects", "/population"],
    disclaimer:
      "Synthetic strategy support only. Not an investment recommendation or contractual guidance.",
    promptExamplesByRoute: {
      default: [
        "Which trials represent the biggest total opportunity for our health system?",
        "Rank trial opportunities by quality lift, retention, and financial upside",
        "Which trial portfolio should we prioritize in the next 2 quarters?",
      ],
      "/life-sciences": [
        "Show the top 5 trials to host now and why",
        "Compare trial options by sponsor fit and expected strategic value",
        "Which opportunities have the strongest near-term execution confidence?",
      ],
    },
  },
  {
    id: "trial_population_fit",
    suiteId: "health_system_trial_strategy_suite",
    displayName: "Trial Population Fit & Opportunity Agent",
    shortLabel: "Population Fit",
    icon: "🧬",
    accent: {
      text: "text-cyan-700",
      bg: "bg-cyan-50",
      ring: "ring-cyan-300",
      soft: "bg-cyan-100/60",
    },
    shortDescription:
      "Quantifies eligible lives, density, confidence/completeness, and phenotype fit to support hosting decisions.",
    recommendedRoutes: ["/life-sciences", "/population", "/cohorts"],
    disclaimer:
      "Synthetic de-identified intelligence only. Not patient-level trial eligibility determination.",
    promptExamplesByRoute: {
      default: [
        "Where do we have the strongest eligible patient density for trial hosting?",
        "Show eligible lives with confidence and completeness by therapeutic area",
        "Which trial opportunities have enough population depth to launch successfully?",
      ],
      "/population": [
        "Which cohorts can sustain enrollment velocity for top trial candidates?",
        "Show population fit by specialty and geography",
        "Where are we overestimating opportunity due to low data completeness?",
      ],
    },
  },
  {
    id: "trial_leakage_expansion",
    suiteId: "health_system_trial_strategy_suite",
    displayName: "Trial Leakage & Expansion Story Agent",
    shortLabel: "Leakage + Expansion",
    icon: "🏗️",
    accent: {
      text: "text-amber-700",
      bg: "bg-amber-50",
      ring: "ring-amber-300",
      soft: "bg-amber-100/60",
    },
    shortDescription:
      "Builds the expansion story for non-research sites by quantifying business lost when patients leave for trial access elsewhere.",
    recommendedRoutes: ["/life-sciences", "/population", "/projects", "/contracts"],
    disclaimer:
      "Synthetic market and leakage analysis only. Validate with local operational and finance teams.",
    promptExamplesByRoute: {
      default: [
        "Where are we losing patients because trial options are not offered locally?",
        "Show the business we are losing when patients seek trials elsewhere",
        "Which non-research sites should become trial feeder or hosting sites first?",
      ],
      "/life-sciences": [
        "Build an expansion case for non-research sites using leakage and missed trial revenue",
        "Which sites have the strongest case to become trial-capable within 12 months?",
        "Estimate retention upside from adding trial capacity by region",
      ],
    },
  },
  {
    id: "trial_feasibility_activation",
    suiteId: "health_system_trial_strategy_suite",
    displayName: "Trial Feasibility & Activation Agent",
    shortLabel: "Feasibility",
    icon: "🚀",
    accent: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      ring: "ring-emerald-300",
      soft: "bg-emerald-100/60",
    },
    shortDescription:
      "Forecasts time-to-feasibility, activation readiness, and enrollment velocity with screen-fail reduction guidance.",
    recommendedRoutes: ["/life-sciences", "/projects", "/cohorts"],
    disclaimer:
      "Synthetic feasibility projections only. Not a substitute for protocol feasibility and regulatory review.",
    promptExamplesByRoute: {
      default: [
        "Which trial opportunities can we activate fastest with high enrollment confidence?",
        "Compare feasibility timelines across candidate sites",
        "Where can we reduce screen-fail drag and improve enrollment velocity?",
      ],
      "/projects": [
        "Build a phased activation plan for top trial opportunities",
        "What operational blockers will delay first-patient-in?",
        "Which sites should host vs route to existing trial centers?",
      ],
    },
  },
  {
    id: "evidence_therapy_trial",
    suiteId: "oracle_health",
    displayName: "Evidence-Based Therapy & Trial Agent",
    shortLabel: "Therapy",
    icon: "🧬",
    accent: {
      text: "text-fuchsia-700",
      bg: "bg-fuchsia-50",
      ring: "ring-fuchsia-300",
      soft: "bg-fuchsia-100/60",
    },
    shortDescription: "Highlights therapy alignment and trial eligibility signals (synthetic).",
    recommendedRoutes: ["/quality", "/cohorts"],
    disclaimer: "Synthetic educational support only. Not clinical or eligibility advice.",
    promptExamplesByRoute: {
      default: [
        "Where are evidence-based therapy gaps?",
        "Show referral escalation opportunities",
        "Summarize trial eligibility signals",
      ],
      "/quality": [
        "Which therapies lack adherence?",
        "Show evidence-aligned care gaps",
        "What trial pathways are underused?",
      ],
    },
  },
  {
    id: "payer_utilization",
    suiteId: "payer_suite",
    displayName: "Payer Utilization Steward Agent",
    shortLabel: "Utilization",
    icon: "🧾",
    accent: {
      text: "text-cyan-700",
      bg: "bg-cyan-50",
      ring: "ring-cyan-300",
      soft: "bg-cyan-100/60",
    },
    shortDescription: "Optimizes medical expense, utilization, and network leakage risk.",
    recommendedRoutes: ["/contracts", "/population", "/actions"],
    disclaimer: "Payer suite: synthetic utilization insights only.",
    promptExamplesByRoute: {
      default: [
        "Where is utilization rising fastest?",
        "Summarize avoidable admissions risk",
        "Which lines of business are under stress?",
      ],
      "/contracts": [
        "Highlight utilization variances",
        "Where is network leakage highest?",
        "Show inpatient drivers",
      ],
    },
  },
  {
    id: "university_evidence",
    suiteId: "university_suite",
    displayName: "University Evidence & Trial Agent",
    shortLabel: "Evidence",
    icon: "🎓",
    accent: {
      text: "text-sky-700",
      bg: "bg-sky-50",
      ring: "ring-sky-300",
      soft: "bg-sky-100/60",
    },
    shortDescription: "Surfaces evidence-based interventions and research signals.",
    recommendedRoutes: ["/quality", "/cohorts", "/population"],
    disclaimer: "University suite: research-only insights. Not clinical guidance.",
    promptExamplesByRoute: {
      default: [
        "What evidence supports this intervention?",
        "Summarize new trial insights",
        "Show literature gaps",
      ],
      "/quality": [
        "Map quality gaps to evidence-based guidelines",
        "Show high-value research-backed interventions",
        "Which trials are most relevant?",
      ],
    },
  },
  {
    id: "pharma_adherence",
    suiteId: "pharma_suite",
    displayName: "Pharma Adherence & Access Agent",
    shortLabel: "Adherence",
    icon: "💊",
    accent: {
      text: "text-rose-700",
      bg: "bg-rose-50",
      ring: "ring-rose-300",
      soft: "bg-rose-100/60",
    },
    shortDescription: "Identifies adherence risk and access barriers to therapy.",
    recommendedRoutes: ["/population", "/quality", "/projects"],
    disclaimer: "Pharma suite: synthetic adherence insights only.",
    promptExamplesByRoute: {
      default: [
        "Where is adherence slipping?",
        "Summarize access barriers",
        "Which cohorts need outreach?",
      ],
      "/population": [
        "Identify high-risk adherence segments",
        "Show access-related utilization impacts",
        "Where are refill delays clustering?",
      ],
    },
  },
  {
    id: "mayo_referral",
    suiteId: "mayo_suite",
    displayName: "Mayo Specialty Referral Triage Agent",
    shortLabel: "Referral",
    icon: "🧭",
    accent: {
      text: "text-slate-700",
      bg: "bg-slate-50",
      ring: "ring-slate-300",
      soft: "bg-slate-100/60",
    },
    shortDescription: "Prioritizes specialty referrals and balances access capacity.",
    recommendedRoutes: ["/cohorts", "/projects", "/population"],
    disclaimer: "Provider suite: synthetic operations insights only.",
    promptExamplesByRoute: {
      default: [
        "Which referrals need escalation?",
        "Show specialty access bottlenecks",
        "Summarize referral aging",
      ],
    },
  },
  {
    id: "mayo_discharge",
    suiteId: "mayo_suite",
    displayName: "Mayo Discharge Readiness Agent",
    shortLabel: "Discharge",
    icon: "🏥",
    accent: {
      text: "text-slate-700",
      bg: "bg-slate-50",
      ring: "ring-slate-300",
      soft: "bg-slate-100/60",
    },
    shortDescription: "Flags delayed discharge risks and downstream handoff gaps.",
    recommendedRoutes: ["/projects", "/population"],
    disclaimer: "Provider suite: synthetic operations insights only.",
    promptExamplesByRoute: {
      default: [
        "Which discharges are delayed?",
        "Summarize barriers to discharge",
        "Highlight post-acute gaps",
      ],
    },
  },
  {
    id: "cleveland_pathway",
    suiteId: "cleveland_suite",
    displayName: "Cleveland Pathway Variance Agent",
    shortLabel: "Pathway",
    icon: "🧩",
    accent: {
      text: "text-violet-700",
      bg: "bg-violet-50",
      ring: "ring-violet-300",
      soft: "bg-violet-100/60",
    },
    shortDescription: "Surfaces care pathway variance and opportunity hotspots.",
    recommendedRoutes: ["/quality", "/cohorts", "/projects"],
    disclaimer: "Provider suite: synthetic operations insights only.",
    promptExamplesByRoute: {
      default: [
        "Where are pathway variances highest?",
        "Show guideline deviations",
        "Identify improvement opportunities",
      ],
    },
  },
  {
    id: "cleveland_readmission",
    suiteId: "cleveland_suite",
    displayName: "Cleveland Readmission Prevention Agent",
    shortLabel: "Readmit",
    icon: "🛡️",
    accent: {
      text: "text-violet-700",
      bg: "bg-violet-50",
      ring: "ring-violet-300",
      soft: "bg-violet-100/60",
    },
    shortDescription: "Predicts readmission risk and recommends interventions.",
    recommendedRoutes: ["/population", "/projects"],
    disclaimer: "Provider suite: synthetic operations insights only.",
    promptExamplesByRoute: {
      default: [
        "Which cohorts are at readmission risk?",
        "Suggest prevention outreach",
        "Highlight post-acute gaps",
      ],
    },
  },
  {
    id: "kaiser_prevention",
    suiteId: "kaiser_suite",
    displayName: "Kaiser Preventive Screening Recovery Agent",
    shortLabel: "Prevention",
    icon: "🩺",
    accent: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      ring: "ring-emerald-300",
      soft: "bg-emerald-100/60",
    },
    shortDescription: "Identifies missed screenings and preventive outreach needs.",
    recommendedRoutes: ["/quality", "/cohorts"],
    disclaimer: "Provider suite: synthetic prevention insights only.",
    promptExamplesByRoute: {
      default: [
        "Which screenings are overdue?",
        "Highlight preventive outreach gaps",
        "Show screening recovery opportunities",
      ],
    },
  },
  {
    id: "kaiser_outreach",
    suiteId: "kaiser_suite",
    displayName: "Kaiser Population Outreach Agent",
    shortLabel: "Outreach",
    icon: "📣",
    accent: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      ring: "ring-emerald-300",
      soft: "bg-emerald-100/60",
    },
    shortDescription: "Optimizes outreach sequencing and engagement strategy.",
    recommendedRoutes: ["/population", "/projects"],
    disclaimer: "Provider suite: synthetic outreach insights only.",
    promptExamplesByRoute: {
      default: [
        "Which members need outreach now?",
        "Prioritize engagement cohorts",
        "Show outreach impact by channel",
      ],
    },
  },
  {
    id: "optum_prior_auth",
    suiteId: "optum_suite",
    displayName: "Optum Prior Auth Navigator",
    shortLabel: "Prior Auth",
    icon: "🧾",
    accent: {
      text: "text-cyan-700",
      bg: "bg-cyan-50",
      ring: "ring-cyan-300",
      soft: "bg-cyan-100/60",
    },
    shortDescription: "Reduces authorization friction and denial risk.",
    recommendedRoutes: ["/actions", "/contracts"],
    disclaimer: "Payor suite: synthetic utilization insights only.",
    promptExamplesByRoute: {
      default: [
        "Where are prior auth delays?",
        "Summarize authorization friction",
        "Suggest denials prevention",
      ],
    },
  },
  {
    id: "optum_leakage",
    suiteId: "optum_suite",
    displayName: "Optum Network Leakage Guard",
    shortLabel: "Leakage",
    icon: "🛰️",
    accent: {
      text: "text-cyan-700",
      bg: "bg-cyan-50",
      ring: "ring-cyan-300",
      soft: "bg-cyan-100/60",
    },
    shortDescription: "Surfaces out-of-network drift and retention risks.",
    recommendedRoutes: ["/contracts", "/population"],
    disclaimer: "Payor suite: synthetic utilization insights only.",
    promptExamplesByRoute: {
      default: [
        "Where is network leakage rising?",
        "Show high-risk facilities",
        "Recommend retention interventions",
      ],
    },
  },
  {
    id: "aetna_pharmacy",
    suiteId: "aetna_suite",
    displayName: "Aetna Pharmacy Access Agent",
    shortLabel: "Pharmacy",
    icon: "💊",
    accent: {
      text: "text-teal-700",
      bg: "bg-teal-50",
      ring: "ring-teal-300",
      soft: "bg-teal-100/60",
    },
    shortDescription: "Flags medication access barriers and adherence risk.",
    recommendedRoutes: ["/population", "/quality"],
    disclaimer: "Payor suite: synthetic pharmacy insights only.",
    promptExamplesByRoute: {
      default: [
        "Where are access barriers highest?",
        "Which members need support?",
        "Show adherence risk signals",
      ],
    },
  },
  {
    id: "aetna_benefits",
    suiteId: "aetna_suite",
    displayName: "Aetna Benefit Navigation Agent",
    shortLabel: "Benefits",
    icon: "🧾",
    accent: {
      text: "text-teal-700",
      bg: "bg-teal-50",
      ring: "ring-teal-300",
      soft: "bg-teal-100/60",
    },
    shortDescription: "Guides members through coverage and benefit options.",
    recommendedRoutes: ["/population", "/actions"],
    disclaimer: "Payor suite: synthetic benefit insights only.",
    promptExamplesByRoute: {
      default: [
        "Highlight benefit utilization gaps",
        "Which benefits are underused?",
        "Where is navigation friction highest?",
      ],
    },
  },
  {
    id: "stanford_trials",
    suiteId: "stanford_suite",
    displayName: "Stanford Trial Matching Agent",
    shortLabel: "Trials",
    icon: "🔬",
    accent: {
      text: "text-sky-700",
      bg: "bg-sky-50",
      ring: "ring-sky-300",
      soft: "bg-sky-100/60",
    },
    shortDescription: "Surfaces trial eligibility and referral opportunities.",
    recommendedRoutes: ["/quality", "/cohorts"],
    disclaimer: "University suite: research-only insights.",
    promptExamplesByRoute: {
      default: [
        "Which cohorts match trial criteria?",
        "Show referral opportunities",
        "Summarize trial availability",
      ],
    },
  },
  {
    id: "stanford_guidelines",
    suiteId: "stanford_suite",
    displayName: "Stanford Guideline Alignment Agent",
    shortLabel: "Guidelines",
    icon: "📚",
    accent: {
      text: "text-sky-700",
      bg: "bg-sky-50",
      ring: "ring-sky-300",
      soft: "bg-sky-100/60",
    },
    shortDescription: "Maps care pathways to evidence-based guidelines.",
    recommendedRoutes: ["/quality", "/projects"],
    disclaimer: "University suite: research-only insights.",
    promptExamplesByRoute: {
      default: [
        "Highlight guideline deviations",
        "Summarize evidence alignment",
        "Which measures need updates?",
      ],
    },
  },
  {
    id: "pfizer_adherence",
    suiteId: "pfizer_suite",
    displayName: "Pfizer Therapy Adherence Agent",
    shortLabel: "Adherence+",
    icon: "💊",
    accent: {
      text: "text-rose-700",
      bg: "bg-rose-50",
      ring: "ring-rose-300",
      soft: "bg-rose-100/60",
    },
    shortDescription: "Monitors adherence risk and support opportunities.",
    recommendedRoutes: ["/population", "/projects"],
    disclaimer: "Pharma suite: synthetic adherence insights only.",
    promptExamplesByRoute: {
      default: [
        "Where is adherence dropping?",
        "Which cohorts need support?",
        "Summarize adherence barriers",
      ],
    },
  },
  {
    id: "pfizer_access",
    suiteId: "pfizer_suite",
    displayName: "Pfizer Access Barrier Agent",
    shortLabel: "Access",
    icon: "🚪",
    accent: {
      text: "text-rose-700",
      bg: "bg-rose-50",
      ring: "ring-rose-300",
      soft: "bg-rose-100/60",
    },
    shortDescription: "Identifies coverage and affordability barriers.",
    recommendedRoutes: ["/population", "/actions"],
    disclaimer: "Pharma suite: synthetic access insights only.",
    promptExamplesByRoute: {
      default: [
        "Where are access barriers highest?",
        "Highlight affordability risks",
        "Suggest support pathways",
      ],
    },
  },
  {
    id: "roche_oncology",
    suiteId: "roche_suite",
    displayName: "Roche Oncology Pathway Agent",
    shortLabel: "Oncology",
    icon: "🎗️",
    accent: {
      text: "text-purple-700",
      bg: "bg-purple-50",
      ring: "ring-purple-300",
      soft: "bg-purple-100/60",
    },
    shortDescription: "Optimizes oncology pathways and infusion access.",
    recommendedRoutes: ["/quality", "/projects"],
    disclaimer: "Pharma suite: synthetic oncology insights only.",
    promptExamplesByRoute: {
      default: [
        "Where are oncology delays highest?",
        "Highlight infusion bottlenecks",
        "Show pathway deviations",
      ],
    },
  },
  {
    id: "roche_biomarker",
    suiteId: "roche_suite",
    displayName: "Roche Biomarker Gap Agent",
    shortLabel: "Biomarkers",
    icon: "🧬",
    accent: {
      text: "text-purple-700",
      bg: "bg-purple-50",
      ring: "ring-purple-300",
      soft: "bg-purple-100/60",
    },
    shortDescription: "Surfaces biomarker testing gaps and referral needs.",
    recommendedRoutes: ["/quality", "/cohorts"],
    disclaimer: "Pharma suite: synthetic oncology insights only.",
    promptExamplesByRoute: {
      default: [
        "Which cohorts lack biomarker testing?",
        "Show testing turnaround gaps",
        "Summarize oncology testing rates",
      ],
    },
  },
  {
    id: "komodo_journey",
    suiteId: "komodo_suite",
    displayName: "Komodo Patient Journey Agent",
    shortLabel: "Journey",
    icon: "🗺️",
    accent: {
      text: "text-orange-700",
      bg: "bg-orange-50",
      ring: "ring-orange-300",
      soft: "bg-orange-100/60",
    },
    shortDescription: "Analyzes longitudinal journeys and care transitions.",
    recommendedRoutes: ["/population", "/projects"],
    disclaimer: "Partner suite: synthetic journey insights only.",
    promptExamplesByRoute: {
      default: [
        "Map end-to-end care journeys",
        "Where are transition drop-offs?",
        "Summarize journey bottlenecks",
      ],
    },
  },
  {
    id: "komodo_outcomes",
    suiteId: "komodo_suite",
    displayName: "Komodo Outcomes Benchmark Agent",
    shortLabel: "Outcomes",
    icon: "📊",
    accent: {
      text: "text-orange-700",
      bg: "bg-orange-50",
      ring: "ring-orange-300",
      soft: "bg-orange-100/60",
    },
    shortDescription: "Benchmarks outcomes and highlights variance vs peers.",
    recommendedRoutes: ["/quality", "/contracts"],
    disclaimer: "Partner suite: synthetic outcomes insights only.",
    promptExamplesByRoute: {
      default: [
        "Benchmark outcomes vs peers",
        "Where are performance gaps?",
        "Show outcomes trends",
      ],
    },
  },
];

export const agentSuites: AgentSuiteDefinition[] = [
  {
    id: "oracle_health",
    name: "Oracle Health",
    owner: "Oracle Health",
    description: "Core platform agents for contracts, quality, and portfolio performance.",
    category: "Platform",
    logoText: "OH",
    accent: {
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      ring: "ring-indigo-300",
      soft: "bg-indigo-100/60",
    },
    disclaimer: "Oracle Health suite: synthetic decision support only.",
    routeRecommendations: ["/", "/contracts", "/quality", "/projects"],
  },
  {
    id: "life_sciences_suite",
    name: "Life Sciences Network",
    owner: "Life Sciences Partner",
    description:
      "Pharma-focused trial supply intelligence connecting de-identified patient reality to site strategy and enrollment feasibility.",
    category: "Pharma",
    logoText: "LS",
    accent: {
      text: "text-violet-700",
      bg: "bg-violet-50",
      ring: "ring-violet-300",
      soft: "bg-violet-100/60",
    },
    disclaimer:
      "Life Sciences suite: synthetic de-identified feasibility intelligence only.",
    routeRecommendations: ["/life-sciences", "/population", "/cohorts"],
  },
  {
    id: "health_system_trial_strategy_suite",
    name: "Health System Trial Strategy Suite",
    owner: "Oracle Health",
    description:
      "Dedicated strategy suite for deciding which trials to host, quantifying opportunity, reducing leakage, and building site expansion business cases.",
    category: "Platform",
    logoText: "TS",
    accent: {
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      ring: "ring-indigo-300",
      soft: "bg-indigo-100/60",
    },
    disclaimer:
      "Synthetic strategy intelligence only. Validate with clinical operations, legal, and finance before action.",
    routeRecommendations: ["/life-sciences", "/population", "/projects", "/contracts"],
  },
  {
    id: "payer_suite",
    name: "Payer Intelligence",
    owner: "Major Payor",
    description: "Utilization, network leakage, and medical expense insights.",
    category: "Payors",
    logoText: "PI",
    accent: {
      text: "text-cyan-700",
      bg: "bg-cyan-50",
      ring: "ring-cyan-300",
      soft: "bg-cyan-100/60",
    },
    disclaimer: "Payer suite: synthetic utilization insights only.",
    routeRecommendations: ["/contracts", "/population", "/actions"],
  },
  {
    id: "mayo_suite",
    name: "Mayo Clinic",
    owner: "Major Health System",
    description: "Referral optimization and inpatient throughput intelligence.",
    category: "Providers",
    logoText: "MC",
    accent: {
      text: "text-slate-700",
      bg: "bg-slate-50",
      ring: "ring-slate-300",
      soft: "bg-slate-100/60",
    },
    disclaimer: "Mayo suite: synthetic operational insights only.",
    routeRecommendations: ["/projects", "/population"],
  },
  {
    id: "cleveland_suite",
    name: "Cleveland Clinic",
    owner: "Major Health System",
    description: "Care pathway variance and readmission prevention insights.",
    category: "Providers",
    logoText: "CC",
    accent: {
      text: "text-violet-700",
      bg: "bg-violet-50",
      ring: "ring-violet-300",
      soft: "bg-violet-100/60",
    },
    disclaimer: "Cleveland suite: synthetic operational insights only.",
    routeRecommendations: ["/quality", "/projects"],
  },
  {
    id: "kaiser_suite",
    name: "Kaiser Permanente",
    owner: "Integrated Delivery Network",
    description: "Preventive screening recovery and outreach orchestration.",
    category: "Providers",
    logoText: "KP",
    accent: {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      ring: "ring-emerald-300",
      soft: "bg-emerald-100/60",
    },
    disclaimer: "Kaiser suite: synthetic population insights only.",
    routeRecommendations: ["/population", "/cohorts"],
  },
  {
    id: "optum_suite",
    name: "Optum",
    owner: "UnitedHealthcare",
    description: "Prior auth, network leakage, and utilization stewardship.",
    category: "Payors",
    logoText: "OP",
    accent: {
      text: "text-cyan-700",
      bg: "bg-cyan-50",
      ring: "ring-cyan-300",
      soft: "bg-cyan-100/60",
    },
    disclaimer: "Optum suite: synthetic utilization insights only.",
    routeRecommendations: ["/contracts", "/actions"],
  },
  {
    id: "aetna_suite",
    name: "Aetna",
    owner: "CVS Health",
    description: "Pharmacy access, benefit navigation, and member support.",
    category: "Payors",
    logoText: "AE",
    accent: {
      text: "text-teal-700",
      bg: "bg-teal-50",
      ring: "ring-teal-300",
      soft: "bg-teal-100/60",
    },
    disclaimer: "Aetna suite: synthetic member insights only.",
    routeRecommendations: ["/population", "/actions"],
  },
  {
    id: "university_suite",
    name: "University Research",
    owner: "Academic Medical Center",
    description: "Evidence-based guidance and trial intelligence.",
    category: "Research",
    logoText: "UR",
    accent: {
      text: "text-sky-700",
      bg: "bg-sky-50",
      ring: "ring-sky-300",
      soft: "bg-sky-100/60",
    },
    disclaimer: "University suite: research-only insights.",
    routeRecommendations: ["/quality", "/cohorts"],
  },
  {
    id: "stanford_suite",
    name: "Stanford Medicine",
    owner: "Academic Medical Center",
    description: "Trial matching and guideline alignment intelligence.",
    category: "Research",
    logoText: "SM",
    accent: {
      text: "text-sky-700",
      bg: "bg-sky-50",
      ring: "ring-sky-300",
      soft: "bg-sky-100/60",
    },
    disclaimer: "Stanford suite: research-only insights.",
    routeRecommendations: ["/quality", "/cohorts"],
  },
  {
    id: "pharma_suite",
    name: "Pharma Partner",
    owner: "Life Sciences Partner",
    description: "Adherence, access, and therapy pathway support.",
    category: "Pharma",
    logoText: "LP",
    accent: {
      text: "text-rose-700",
      bg: "bg-rose-50",
      ring: "ring-rose-300",
      soft: "bg-rose-100/60",
    },
    disclaimer: "Pharma suite: synthetic adherence insights only.",
    routeRecommendations: ["/population", "/projects"],
  },
  {
    id: "pfizer_suite",
    name: "Pfizer",
    owner: "Life Sciences Partner",
    description: "Adherence recovery and access support programs.",
    category: "Pharma",
    logoText: "PF",
    accent: {
      text: "text-rose-700",
      bg: "bg-rose-50",
      ring: "ring-rose-300",
      soft: "bg-rose-100/60",
    },
    disclaimer: "Pfizer suite: synthetic adherence insights only.",
    routeRecommendations: ["/population", "/projects"],
  },
  {
    id: "roche_suite",
    name: "Roche",
    owner: "Life Sciences Partner",
    description: "Oncology pathway optimization and biomarker intelligence.",
    category: "Pharma",
    logoText: "RO",
    accent: {
      text: "text-purple-700",
      bg: "bg-purple-50",
      ring: "ring-purple-300",
      soft: "bg-purple-100/60",
    },
    disclaimer: "Roche suite: synthetic oncology insights only.",
    routeRecommendations: ["/quality", "/cohorts"],
  },
  {
    id: "komodo_suite",
    name: "Komodo Health",
    owner: "Digital Health Partner",
    description: "Journey analytics and outcomes benchmarking insights.",
    category: "Partners",
    logoText: "KH",
    accent: {
      text: "text-orange-700",
      bg: "bg-orange-50",
      ring: "ring-orange-300",
      soft: "bg-orange-100/60",
    },
    disclaimer: "Komodo suite: synthetic analytics insights only.",
    routeRecommendations: ["/population", "/projects"],
  },
];

export const defaultAgentByRoute: Record<string, SynapseAgentId> = {
  "/": "contract_performance",
  "/actions": "contract_performance",
  "/care-management": "quality_care_gap",
  "/population": "pre_visit_prep",
  "/projects": "contract_performance",
  "/quality": "quality_care_gap",
  "/contracts": "contract_performance",
  "/cohorts": "quality_care_gap",
  "/life-sciences": "trial_portfolio_strategy",
};

export const defaultSuiteByRoute: Record<string, AgentSuiteId> = {
  "/": "oracle_health",
  "/actions": "oracle_health",
  "/care-management": "oracle_health",
  "/population": "oracle_health",
  "/projects": "oracle_health",
  "/quality": "oracle_health",
  "/contracts": "oracle_health",
  "/cohorts": "oracle_health",
  "/life-sciences": "health_system_trial_strategy_suite",
};

export function getAgentById(id: SynapseAgentId) {
  return agentRegistry.find((agent) => agent.id === id) ?? agentRegistry[0];
}

export function getSuiteById(id: AgentSuiteId) {
  return agentSuites.find((suite) => suite.id === id) ?? agentSuites[0];
}

export function getAgentsForSuite(suiteId: AgentSuiteId) {
  return agentRegistry.filter((agent) => agent.suiteId === suiteId);
}

export const agentProfileDetails: Record<SynapseAgentId, AgentProfileDetails> = {
  quality_care_gap: {
    detailedDescription:
      "Identifies high-impact preventive and chronic-care quality gaps, prioritizes members by closure likelihood, and recommends operationally realistic outreach plans.",
    dataSources: ["Synthetic EHR quality measures", "Care gap registries", "Outreach response history", "Provider attribution"],
    excelsAt: ["Prioritizing closure-ready gaps", "Segmenting cohorts by risk and access", "Finding measurable quality lift opportunities"],
    capabilities: ["Generate ranked gap-closure worklists", "Suggest channel-specific outreach strategies", "Summarize closure velocity and lagging measures"],
  },
  pre_visit_prep: {
    detailedDescription:
      "Builds a pre-visit planning queue for attributed patients with upcoming appointments, then ranks likely care-gap closure opportunities with visit-ready actions.",
    dataSources: [
      "Synthetic attribution panel data",
      "Upcoming appointment schedules",
      "Quality gap status and scorability",
      "Recent utilization and outreach context",
    ],
    excelsAt: [
      "Prioritizing closure-ready upcoming visits",
      "Summarizing top gaps per appointment",
      "Creating actionable visit-day prep tasks",
    ],
    capabilities: [
      "Generate ranked pre-visit worklists",
      "Recommend patient-specific gap closure actions",
      "Draft appointment-focused copilot prompts and outreach",
    ],
  },
  health_system_resources: {
    detailedDescription:
      "Models health-system operating capacity (staffing, channel throughput, scheduling inventory, and care-manager bandwidth) so execution plans are realistic and resource-aware.",
    dataSources: [
      "Synthetic staffing rosters",
      "Call-center and digital outreach throughput",
      "Clinic scheduling inventory",
      "Care management caseload snapshots",
    ],
    excelsAt: [
      "Identifying resource-constrained interventions",
      "Prioritizing execution by operational feasibility",
      "Balancing quality impact with workforce limits",
    ],
    capabilities: [
      "Estimate capacity by outreach channel",
      "Flag bottlenecks impacting quality action plans",
      "Recommend feasible execution strategies for care-gap closure",
    ],
  },
  contract_performance: {
    detailedDescription:
      "Analyzes contract economics and utilization trends to spotlight margin pressure, PMPM variance drivers, and performance-improvement opportunities.",
    dataSources: ["Synthetic contract terms", "PMPM trend tables", "Utilization/utilization-mix feeds", "Episode cost summaries"],
    excelsAt: ["Explaining PMPM variance", "Highlighting margin risk drivers", "Connecting utilization shifts to financial impact"],
    capabilities: ["Produce contract risk summaries", "Recommend optimization focus areas", "Flag early-warning indicators vs targets"],
  },
  claims_friction: {
    detailedDescription:
      "Detects coverage friction patterns across prior auth, denials, and handoff breakdowns that delay care and increase avoidable utilization.",
    dataSources: ["Synthetic claims and denial events", "Authorization timelines", "Coverage policy mappings", "Navigation workflow logs"],
    excelsAt: ["Finding bottleneck points in coverage journeys", "Pinpointing denial clusters", "Prioritizing friction-reduction workflows"],
    capabilities: ["Surface high-friction member segments", "Summarize denial root-cause themes", "Recommend operational navigation interventions"],
  },
  life_sciences_clinical: {
    detailedDescription:
      "Provides patient-level evidence intelligence by synthesizing phenotype and treatment history, suggesting evidence-based therapy options, surfacing relevant trial pathways, and outlining access qualification requirements.",
    dataSources: [
      "Synthetic phenotype/history summaries",
      "Evidence and guideline concordance mappings",
      "Synthetic trial-fit and referral signal heuristics",
      "Coverage and access-friction markers",
      "Utilization and outcome proxy baselines",
    ],
    excelsAt: [
      "Patient drilldown for therapy and trial relevance",
      "Estimating likely outcomes delta (e.g., readmission/exacerbation risk)",
      "Translating access barriers into actionable qualification checklists",
    ],
    capabilities: [
      "Recommend evidence-based therapy options with rationale",
      "Summarize likely trial-fit opportunities by phenotype",
      "Generate access feasibility analysis and submission criteria checklist",
    ],
  },
  life_sciences_trial_supply: {
    detailedDescription:
      "Provides pharma-facing network intelligence to identify where de-identified eligible trial populations exist, forecast feasibility and time-to-enrollment, and recommend site activation, routing, or awareness actions.",
    dataSources: [
      "De-identified aggregated eligibility counts",
      "Geographic density and referral-flow patterns",
      "Synthetic site footprint and trial activation status",
      "Feasibility and enrollment velocity proxies",
      "Provider network awareness and referral readiness signals",
    ],
    excelsAt: [
      "Identifying trial-eligible geographic hotspots across the network",
      "Detecting site gaps where no active sites exist",
      "Recommending open-site vs route-to-site strategy with enrollment forecasts",
    ],
    capabilities: [
      "Generate de-identified eligibility heat maps for a target trial",
      "Estimate trial feasibility and time-to-enrollment by region",
      "Recommend actions: open site, route to active site, or launch provider awareness campaign",
    ],
  },
  trial_portfolio_strategy: {
    detailedDescription:
      "Acts as the health-system strategy advisor for trial hosting decisions by ranking candidate studies across population fit, sponsor alignment, quality impact, retention lift, and financial outcomes.",
    dataSources: [
      "Synthetic matched population and density intelligence",
      "Sponsor-fit and service-line priority markers",
      "Quality measure linkage and impact rationale",
      "Leakage/retention and referral-outflow signals",
      "Revenue, reimbursement, and VBC downside proxy models",
    ],
    excelsAt: [
      "Portfolio-level trial prioritization",
      "Balancing strategic, quality, and financial value in one ranking",
      "Defensible executive narratives for why to host specific trials",
    ],
    capabilities: [
      "Rank trial opportunities with explainable weighted criteria",
      "Generate executive-ready prioritization summaries",
      "Compare multiple portfolio scenarios by strategic objective",
    ],
  },
  trial_population_fit: {
    detailedDescription:
      "Quantifies opportunity realism by combining eligible-lives counts, density, confidence/completeness, phenotype depth, and service-line readiness for trial hosting decisions.",
    dataSources: [
      "Synthetic de-identified cohort and phenotype aggregates",
      "Population density and geography overlays",
      "Confidence/completeness and data quality indicators",
      "Site-level referral and specialty utilization patterns",
    ],
    excelsAt: [
      "Testing whether opportunity size is truly hostable",
      "Identifying high-density regions for early activation",
      "Separating strong opportunities from low-confidence signal noise",
    ],
    capabilities: [
      "Produce opportunity heatmaps by therapeutic area",
      "Score trial-fit opportunity confidence by region/site",
      "Recommend where to sequence pilots based on population strength",
    ],
  },
  trial_leakage_expansion: {
    detailedDescription:
      "Builds expansion business cases by showing where patients leave the system for external trial access, quantifying lost downstream value, and identifying non-research sites that should become feeder or hosting sites.",
    dataSources: [
      "Synthetic referral-outflow and market leakage signals",
      "External trial destination and transfer patterns",
      "Service-line margin and downstream retention proxies",
      "Site capability/readiness indicators for expansion planning",
    ],
    excelsAt: [
      "Telling the 'business we are losing' story with data",
      "Prioritizing expansion candidates among non-research sites",
      "Linking trial access expansion to retention and revenue outcomes",
    ],
    capabilities: [
      "Quantify leakage tied to missing local trial availability",
      "Generate site-by-site expansion opportunity narratives",
      "Recommend feeder-site vs full-site expansion strategies",
    ],
  },
  trial_feasibility_activation: {
    detailedDescription:
      "Translates strategic trial choices into execution plans by forecasting time-to-feasibility, activation readiness, enrollment velocity, and screen-fail risk reduction opportunities.",
    dataSources: [
      "Synthetic protocol complexity and operational readiness proxies",
      "Historical activation cadence and enrollment velocity patterns",
      "Coordinator bandwidth and workflow readiness markers",
      "Screen-fail and pre-screen quality signal heuristics",
    ],
    excelsAt: [
      "Finding fast-path activation opportunities",
      "Reducing launch delays and enrollment drag",
      "Sequencing site activation with realistic capacity constraints",
    ],
    capabilities: [
      "Forecast feasibility timelines by site/trial",
      "Recommend activation sequencing and ownership plans",
      "Identify interventions to reduce screen-fail and improve enrollment velocity",
    ],
  },
  evidence_therapy_trial: {
    detailedDescription:
      "Maps care pathways to synthetic evidence patterns and trial-signal heuristics to reveal therapy alignment opportunities.",
    dataSources: ["Synthetic protocol/guideline mappings", "Therapy pattern summaries", "Eligibility-signal heuristics", "Referral activity trends"],
    excelsAt: ["Spotting evidence-alignment gaps", "Highlighting referral opportunities", "Structuring trial-signal summaries"],
    capabilities: ["Summarize therapy alignment by cohort", "Flag probable trial referral candidates", "Draft evidence-based escalation recommendations"],
  },
  payer_utilization: {
    detailedDescription:
      "Provides a payer-operational view of medical expense pressure and utilization pattern shifts across key populations and service lines.",
    dataSources: ["Synthetic utilization feeds", "Inpatient/outpatient event data", "Network spend distributions", "LOB performance summaries"],
    excelsAt: ["Detecting avoidable-utilization pressure", "Comparing risk across lines of business", "Prioritizing action by cost impact"],
    capabilities: ["Generate utilization heatmaps", "Identify rising expense cohorts", "Recommend utilization-management focus areas"],
  },
  university_evidence: {
    detailedDescription:
      "Synthesizes research-oriented evidence signals into practical intervention options for quality and population initiatives.",
    dataSources: ["Synthetic evidence abstracts", "Guideline concordance scores", "Intervention outcome proxies", "Cohort phenotype tags"],
    excelsAt: ["Translating evidence into operational actions", "Highlighting evidence strength by use case", "Identifying research-informed opportunities"],
    capabilities: ["Map interventions to quality gaps", "Summarize likely value by segment", "Provide research-oriented rationale briefs"],
  },
  pharma_adherence: {
    detailedDescription:
      "Tracks therapy adherence signals and access barriers to prioritize support interventions for at-risk members.",
    dataSources: ["Synthetic refill/adherence signals", "Specialty access timelines", "Therapy persistence patterns", "Support-program engagement logs"],
    excelsAt: ["Detecting adherence deterioration early", "Separating access vs behavior drivers", "Prioritizing high-value support outreach"],
    capabilities: ["Create adherence risk cohorts", "Summarize barrier archetypes", "Recommend targeted intervention sequencing"],
  },
  mayo_referral: {
    detailedDescription:
      "Optimizes specialty referral flow by identifying aging queues, triage bottlenecks, and access-capacity mismatches.",
    dataSources: ["Synthetic referral queues", "Specialty capacity snapshots", "Wait-time distributions", "Escalation workflow logs"],
    excelsAt: ["Prioritizing referral triage", "Spotting capacity bottlenecks", "Improving referral-throughput planning"],
    capabilities: ["Rank referrals for escalation", "Summarize access delays by specialty", "Recommend queue-balancing actions"],
  },
  mayo_discharge: {
    detailedDescription:
      "Analyzes inpatient discharge readiness signals to reduce avoidable length-of-stay and handoff breakdowns.",
    dataSources: ["Synthetic inpatient progression data", "Discharge barrier tags", "Post-acute placement timing", "Care-team coordination logs"],
    excelsAt: ["Identifying likely delayed discharges", "Pinpointing process barriers", "Improving transition reliability"],
    capabilities: ["Highlight discharge-risk units/cohorts", "Summarize barrier patterns", "Recommend handoff readiness interventions"],
  },
  cleveland_pathway: {
    detailedDescription:
      "Finds clinically meaningful pathway variance and operational drift from expected care patterns.",
    dataSources: ["Synthetic pathway definitions", "Order/procedure pattern summaries", "Deviation markers", "Outcome proxy trends"],
    excelsAt: ["Detecting high-variance pathways", "Grouping deviation archetypes", "Targeting pathway-standardization opportunities"],
    capabilities: ["Report pathway variance by cohort", "Flag repeat deviation motifs", "Recommend high-yield pathway interventions"],
  },
  cleveland_readmission: {
    detailedDescription:
      "Surfaces readmission vulnerability and prioritizes practical prevention actions across discharge and follow-up windows.",
    dataSources: ["Synthetic readmission risk indicators", "Transition-of-care events", "Follow-up adherence signals", "Post-acute utilization patterns"],
    excelsAt: ["Early readmission-risk stratification", "Post-discharge intervention targeting", "Detecting transition failure points"],
    capabilities: ["Generate prevention-focused outreach lists", "Summarize readmission contributors", "Recommend risk-reduction playbooks"],
  },
  kaiser_prevention: {
    detailedDescription:
      "Targets preventive-care recovery by identifying overdue screenings and closure opportunities with strong completion potential.",
    dataSources: ["Synthetic preventive screening registries", "Eligibility and due-date logic", "Outreach response trends", "Panel attribution context"],
    excelsAt: ["Finding recoverable preventive gaps", "Optimizing screening outreach timing", "Improving completion performance"],
    capabilities: ["Build overdue screening campaigns", "Prioritize members by closure likelihood", "Track screening recovery progress"],
  },
  kaiser_outreach: {
    detailedDescription:
      "Orchestrates population outreach sequencing to improve engagement efficiency and program conversion.",
    dataSources: ["Synthetic member contact history", "Channel engagement signals", "Risk segmentation", "Campaign performance metrics"],
    excelsAt: ["Channel and sequence optimization", "High-response cohort targeting", "Reducing outreach waste"],
    capabilities: ["Recommend next-best outreach channel", "Prioritize campaign cohorts", "Summarize engagement lift opportunities"],
  },
  optum_prior_auth: {
    detailedDescription:
      "Reduces prior-authorization friction by highlighting delay patterns, denial risk hotspots, and intervention opportunities.",
    dataSources: ["Synthetic prior-auth submissions", "Review timelines", "Denial reason clusters", "Appeal outcomes"],
    excelsAt: ["Detecting auth-delay drivers", "Preventing avoidable denials", "Improving authorization throughput"],
    capabilities: ["Flag high-friction authorization pathways", "Summarize denial-risk patterns", "Recommend prevention-focused workflows"],
  },
  optum_leakage: {
    detailedDescription:
      "Monitors out-of-network drift and retention risks to protect network performance and continuity.",
    dataSources: ["Synthetic network utilization patterns", "Referral destination trends", "Provider leakage indicators", "Cost-impact summaries"],
    excelsAt: ["Leakage hot-spot detection", "Retention risk segmentation", "Prioritizing containment actions"],
    capabilities: ["Identify high-leakage cohorts", "Quantify leakage impact", "Recommend retention and steering interventions"],
  },
  aetna_pharmacy: {
    detailedDescription:
      "Assesses medication access and refill behavior to identify where pharmacy support can improve outcomes and adherence.",
    dataSources: ["Synthetic pharmacy claims", "Refill cadence patterns", "Formulary/access constraints", "Medication support interactions"],
    excelsAt: ["Access-barrier pattern detection", "Adherence-risk prioritization", "Program targeting for pharmacy support"],
    capabilities: ["Create pharmacy risk cohorts", "Summarize access vs adherence drivers", "Recommend support-pathway actions"],
  },
  aetna_benefits: {
    detailedDescription:
      "Improves benefit navigation by revealing underused benefits and confusion points across member journeys.",
    dataSources: ["Synthetic benefit utilization data", "Navigation touchpoint logs", "Member support interactions", "Coverage pattern summaries"],
    excelsAt: ["Detecting benefit underutilization", "Identifying navigation friction", "Prioritizing education opportunities"],
    capabilities: ["Highlight underused high-value benefits", "Segment members by likely benefit need", "Recommend navigation messaging priorities"],
  },
  stanford_trials: {
    detailedDescription:
      "Finds plausible trial-matching opportunities using synthetic eligibility and referral-signal logic.",
    dataSources: ["Synthetic trial criteria summaries", "Cohort phenotype tags", "Referral readiness indicators", "Eligibility-signal heuristics"],
    excelsAt: ["Trial-opportunity discovery", "Referral candidate prioritization", "Structured trial-fit screening"],
    capabilities: ["Surface trial-relevant cohorts", "Summarize referral-ready populations", "Draft trial matching briefs"],
  },
  stanford_guidelines: {
    detailedDescription:
      "Measures pathway alignment to guideline intent and flags where operational practice diverges.",
    dataSources: ["Synthetic guideline mappings", "Care-pattern summaries", "Measure performance trends", "Deviation indicator sets"],
    excelsAt: ["Guideline variance detection", "Quality alignment analysis", "Prioritizing standardization opportunities"],
    capabilities: ["Summarize guideline-concordance by cohort", "Highlight high-impact deviations", "Recommend evidence-alignment actions"],
  },
  pfizer_adherence: {
    detailedDescription:
      "Focuses on sustained therapy persistence and identifies members likely to benefit from timely adherence support.",
    dataSources: ["Synthetic persistence/refill patterns", "Support engagement data", "Access timing markers", "Drop-off risk indicators"],
    excelsAt: ["Persistence-risk stratification", "Intervention timing optimization", "Adherence recovery targeting"],
    capabilities: ["Generate adherence recovery cohorts", "Flag near-term drop-off risk", "Recommend support cadence by segment"],
  },
  pfizer_access: {
    detailedDescription:
      "Highlights affordability and coverage barriers that block timely therapy initiation and continuation.",
    dataSources: ["Synthetic access barrier events", "Coverage and PA signals", "Affordability proxy markers", "Support case patterns"],
    excelsAt: ["Barrier root-cause analysis", "Access-risk prioritization", "Support-pathway optimization"],
    capabilities: ["Identify high-friction access cohorts", "Summarize key barrier archetypes", "Recommend barrier-removal interventions"],
  },
  roche_oncology: {
    detailedDescription:
      "Supports oncology pathway reliability by spotlighting delay points, escalation needs, and treatment-flow variance.",
    dataSources: ["Synthetic oncology pathway markers", "Infusion scheduling patterns", "Referral lag indicators", "Episode progression summaries"],
    excelsAt: ["Oncology delay hotspot detection", "Pathway reliability analysis", "Prioritizing escalation workflows"],
    capabilities: ["Summarize oncology bottlenecks", "Highlight pathway variance by cohort", "Recommend throughput-improvement actions"],
  },
  roche_biomarker: {
    detailedDescription:
      "Identifies biomarker testing gaps and operational handoff issues that may delay pathway decisions.",
    dataSources: ["Synthetic testing-order timelines", "Result turnaround distributions", "Referral and handoff signals", "Oncology cohort markers"],
    excelsAt: ["Testing-gap identification", "Turnaround-delay detection", "Biomarker pathway readiness analysis"],
    capabilities: ["Flag likely missed-testing cohorts", "Summarize turnaround bottlenecks", "Recommend testing workflow improvements"],
  },
  komodo_journey: {
    detailedDescription:
      "Maps longitudinal patient journeys to find transition drop-offs and care-continuity risks.",
    dataSources: ["Synthetic longitudinal event sequences", "Cross-setting transition markers", "Program engagement timelines", "Journey milestone flags"],
    excelsAt: ["Journey bottleneck mapping", "Transition-risk detection", "Continuity opportunity identification"],
    capabilities: ["Visualize common journey pathways", "Detect drop-off inflection points", "Recommend continuity-focused interventions"],
  },
  komodo_outcomes: {
    detailedDescription:
      "Benchmarks outcome patterns and variance to reveal where focused action can improve comparative performance.",
    dataSources: ["Synthetic outcomes benchmark sets", "Peer-comparison aggregates", "Trend trajectories", "Segment-level performance summaries"],
    excelsAt: ["Outcome variance interpretation", "Benchmark gap prioritization", "Trend-based performance signaling"],
    capabilities: ["Generate benchmark variance summaries", "Identify outlier segments", "Recommend targeted improvement priorities"],
  },
};

export function getAgentProfileById(id: SynapseAgentId) {
  return agentProfileDetails[id];
}