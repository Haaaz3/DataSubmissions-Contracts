import { AgentResultPayload } from "@/lib/models/agentResult";
import { SynapseAgentId, agentRegistry, getAgentById } from "@/lib/synapseai/agentRegistry";

export interface WorkspaceContextInput {
  workspaceId: string;
  workspaceTitle: string;
  workspaceSummary: string;
  sourcePrompts: string[];
  contributingAgentIds: SynapseAgentId[];
  existingBlockTitles: string[];
}

const domainByAgent: Record<SynapseAgentId, "quality" | "finance" | "friction" | "research" | "operations" | "adherence" | "journey"> = {
  quality_care_gap: "quality",
  pre_visit_prep: "operations",
  health_system_resources: "operations",
  contract_performance: "finance",
  claims_friction: "friction",
  life_sciences_clinical: "research",
  life_sciences_trial_supply: "research",
  trial_portfolio_strategy: "finance",
  trial_population_fit: "research",
  trial_leakage_expansion: "finance",
  trial_feasibility_activation: "operations",
  evidence_therapy_trial: "research",
  payer_utilization: "finance",
  university_evidence: "research",
  pharma_adherence: "adherence",
  mayo_referral: "operations",
  mayo_discharge: "operations",
  cleveland_pathway: "quality",
  cleveland_readmission: "operations",
  kaiser_prevention: "quality",
  kaiser_outreach: "operations",
  optum_prior_auth: "friction",
  optum_leakage: "finance",
  aetna_pharmacy: "adherence",
  aetna_benefits: "friction",
  stanford_trials: "research",
  stanford_guidelines: "research",
  pfizer_adherence: "adherence",
  pfizer_access: "friction",
  roche_oncology: "quality",
  roche_biomarker: "research",
  komodo_journey: "journey",
  komodo_outcomes: "finance",
};

const wordsByDomain = {
  quality: ["screening", "closure", "risk", "outreach", "panel", "A1c", "follow-up", "touchpoint"],
  finance: ["PMPM", "variance", "leakage", "utilization", "margin", "readmit", "trend", "cost"],
  friction: ["denial", "prior-auth", "delay", "rework", "coverage", "appeal", "handoff", "navigation"],
  research: ["guideline", "evidence", "trial", "cohort", "criteria", "biomarker", "protocol", "alignment"],
  operations: ["throughput", "triage", "capacity", "discharge", "handoff", "queue", "coordination", "aging"],
  adherence: ["refill", "persistence", "access", "affordability", "drop-off", "support", "therapy", "engagement"],
  journey: ["transition", "drop-off", "episode", "milestone", "continuity", "escalation", "path", "outcome"],
};

const radialDriversByDomain: Record<
  (typeof domainByAgent)[SynapseAgentId],
  { title: string; description: string; labels: string[]; base: number; spread: number }
> = {
  quality: {
    title: "Quality Opportunity Mix",
    description: "Modeled share of current closure opportunity by quality driver.",
    labels: ["Screening Gaps", "Follow-up Gaps", "PCP Access", "Outreach Reachability", "Documentation Variance"],
    base: 14,
    spread: 12,
  },
  finance: {
    title: "Financial Variance Mix",
    description: "Relative contribution of top PMPM and utilization variance drivers.",
    labels: ["Inpatient Utilization", "Specialist Leakage", "ED Avoidable Spend", "Rx Trend Pressure", "Post-acute Variance"],
    base: 12,
    spread: 14,
  },
  friction: {
    title: "Coverage Friction Mix",
    description: "Modeled share of avoidable friction across authorization and claims workflows.",
    labels: ["Prior Auth Delays", "Denial Rework", "Network Confusion", "Referral Handoffs", "Coverage Exceptions"],
    base: 13,
    spread: 13,
  },
  research: {
    title: "Evidence Alignment Mix",
    description: "Relative contribution of evidence and pathway alignment opportunities.",
    labels: ["Guideline Variance", "Trial Eligibility Gaps", "Biomarker Delays", "Referral Readiness", "Protocol Alignment"],
    base: 11,
    spread: 12,
  },
  operations: {
    title: "Operational Pressure Mix",
    description: "Modeled share of throughput and handoff pressure by operational driver.",
    labels: ["Queue Aging", "Capacity Mismatch", "Handoff Delays", "Scheduling Lag", "Coordination Load"],
    base: 13,
    spread: 12,
  },
  adherence: {
    title: "Adherence Barrier Mix",
    description: "Relative contribution of therapy persistence barriers across priority cohorts.",
    labels: ["Refill Gaps", "Affordability Barriers", "Access Delays", "Side-effect Drop-off", "Engagement Lapse"],
    base: 12,
    spread: 12,
  },
  journey: {
    title: "Journey Risk Mix",
    description: "Modeled share of transition and continuity risks across the care journey.",
    labels: ["Transition Drop-off", "Referral Friction", "Episode Delay", "Follow-up Lapse", "Escalation Need"],
    base: 12,
    spread: 13,
  },
};

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h << 5) - h + text.charCodeAt(i);
  return Math.abs(h);
}

function series(seed: number, base: number) {
  return Array.from({ length: 6 }, (_, i) => ({ value: Math.max(3, Math.round(base + i * ((seed % 4) + 1) - (i > 2 ? seed % 3 : 0))) }));
}

function radialDriverMix(seed: number, domain: (typeof domainByAgent)[SynapseAgentId]) {
  const config = radialDriversByDomain[domain];
  return config.labels.map((label, i) => ({
    label,
    value: config.base + ((seed + i * 9) % config.spread),
  }));
}

function buildContractPerformancePayload(params: {
  agentId: SynapseAgentId;
  routeContext: string;
  prompt: string;
  seed: number;
  base: number;
}): AgentResultPayload {
  const { agentId, routeContext, prompt, seed, base } = params;
  const agent = getAgentById(agentId);

  return {
    id: `result-${agentId}`,
    agentId,
    routeContext,
    prompt,
    title: `${agent.displayName} Contract Performance Brief`,
    summary:
      "Contract performance synthesis highlights concentrated PMPM pressure, leakage concentration, and intervention sequencing needed to protect shared-savings performance.",
    kpis: [
      { label: "PMPM variance vs target", value: `+$${12 + (seed % 18)}.4`, trend: "up", subtext: "rolling 90-day" },
      { label: "Avoidable spend concentration", value: `${28 + (seed % 16)}%`, trend: "up", subtext: "top cohort contribution" },
      { label: "Modeled 60-day savings", value: `$${140 + (seed % 160)}K`, trend: "up", subtext: "if prioritized interventions execute" },
    ],
    chartSeries: series(seed, base + 4),
    visuals: [
      {
        id: `${agentId}-pmpm-line`,
        type: "line",
        title: "PMPM Variance Trajectory",
        description: "Observed PMPM variance trend versus target trajectory.",
        data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, i) => ({ label, value: +(9.8 + i * 1.2 + ((seed + i) % 3) * 0.4).toFixed(1) })),
      },
      {
        id: `${agentId}-cost-driver-bar`,
        type: "bar",
        title: "Top Cost Driver Opportunity",
        description: "Potential PMPM relief by dominant driver category.",
        data: [
          { label: "Avoidable ED", value: 24 + (seed % 9) },
          { label: "Post-acute LOS", value: 20 + (seed % 8) },
          { label: "Specialist Leakage", value: 17 + (seed % 7) },
          { label: "Readmissions", value: 14 + (seed % 6) },
          { label: "Rx Trend", value: 11 + (seed % 5) },
        ],
      },
      {
        id: `${agentId}-segment-roi`,
        type: "donut",
        title: "Intervention ROI Mix",
        description: "Share of projected financial impact by segment strategy.",
        data: [
          { label: "High-risk outreach", value: 34 },
          { label: "Post-acute governance", value: 26 },
          { label: "ED diversion", value: 22 },
          { label: "Coding recapture", value: 18 },
        ],
      },
      {
        id: `${agentId}-finance-cloud`,
        type: "wordCloud",
        title: "Contract Finance Theme Cloud",
        description: "Dominant financial and utilization themes in the latest synthesis.",
        data: ["PMPM", "leakage", "variance", "readmit", "ROI", "utilization", "ED", "post-acute"].map((label, i) => ({ label, value: 16 + ((seed + i * 7) % 22) })),
      },
      {
        id: `${agentId}-geo-exposure`,
        type: "geo",
        title: "Regional Financial Exposure",
        description: "Relative concentration of downside risk by region.",
        data: ["West", "South", "Central", "Northeast", "Northwest"].map((label, i) => ({ label, value: 30 + ((seed + i * 11) % 36) })),
      },
    ],
    insights: [
      `Top two contracts account for ${39 + (seed % 18)}% of aggregate PMPM over-target variance.`,
      `Avoidable ED and post-acute leakage are the dominant drivers of short-term margin pressure.`,
      `Prioritizing high-risk outreach + post-acute control in the next 30 days yields the strongest modeled financial recovery.`,
    ],
    actions: [
      "Launch contract control-tower review focused on PMPM outliers and leakage drivers.",
      "Prioritize high-risk segment interventions with highest 60-day ROI before broad rollout.",
      "Stand up weekly finance + care ops governance to track realized PMPM relief.",
    ],
    nextQuestions: [
      "Which contract segments yield the highest PMPM recovery per operational hour?",
      "What intervention sequencing gives fastest margin stabilization in the next 6 weeks?",
    ],
  };
}

function buildClaimsFrictionPayload(params: {
  agentId: SynapseAgentId;
  routeContext: string;
  prompt: string;
  seed: number;
  base: number;
}): AgentResultPayload {
  const { agentId, routeContext, prompt, seed, base } = params;
  const agent = getAgentById(agentId);

  return {
    id: `result-${agentId}`,
    agentId,
    routeContext,
    prompt,
    title: `${agent.displayName} Claims Friction Intelligence`,
    summary:
      "Claims friction analysis identifies concentrated denial rework, auth aging, and workflow breakpoints slowing care progression and increasing avoidable operational drag.",
    kpis: [
      { label: "Preventable denial rate", value: `${15 + (seed % 11)}%`, trend: "up", subtext: "across top service lines" },
      { label: "Auth requests >72h", value: `${22 + (seed % 14)}%`, trend: "up", subtext: "aging queue exposure" },
      { label: "Rework hours / week", value: `${68 + (seed % 44)}h`, trend: "flat", subtext: "manual remediation load" },
    ],
    chartSeries: series(seed, base + 2),
    visuals: [
      {
        id: `${agentId}-aging-line`,
        type: "line",
        title: "Authorization Aging Trend",
        description: "Share of requests crossing 72-hour threshold over time.",
        data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, i) => ({ label, value: +(18 + i * 1.1 + ((seed + i) % 4) * 0.6).toFixed(1) })),
      },
      {
        id: `${agentId}-denial-pareto`,
        type: "stackedBar",
        title: "Denial Root-cause Stack by Service Line",
        description: "Stacked composition of preventable denials by root cause across top service lines.",
        seriesLabels: ["Documentation", "Medical Necessity", "Coding/Eligibility"],
        data: [
          {
            label: "Imaging",
            value: 18 + (seed % 6),
            valueSecondary: 11 + (seed % 5),
            valueTertiary: 8 + (seed % 4),
          },
          {
            label: "Cardiology",
            value: 16 + (seed % 6),
            valueSecondary: 10 + (seed % 5),
            valueTertiary: 7 + (seed % 4),
          },
          {
            label: "Endocrinology",
            value: 13 + (seed % 5),
            valueSecondary: 9 + (seed % 4),
            valueTertiary: 6 + (seed % 3),
          },
          {
            label: "MSK",
            value: 11 + (seed % 5),
            valueSecondary: 7 + (seed % 4),
            valueTertiary: 5 + (seed % 3),
          },
          {
            label: "Pulmonary",
            value: 9 + (seed % 4),
            valueSecondary: 6 + (seed % 3),
            valueTertiary: 4 + (seed % 3),
          },
        ],
      },
      {
        id: `${agentId}-friction-donut`,
        type: "donut",
        title: "Claims Friction Mix",
        description: "Operational friction split across major workflow bottlenecks.",
        data: [
          { label: "Prior auth delays", value: 31 },
          { label: "Denial rework", value: 29 },
          { label: "Referral handoff", value: 21 },
          { label: "Coverage exception", value: 19 },
        ],
      },
      {
        id: `${agentId}-friction-cloud`,
        type: "wordCloud",
        title: "Claims Ops Theme Cloud",
        description: "Most frequent operational friction signals in the latest run.",
        data: ["denial", "prior-auth", "rework", "handoff", "coverage", "appeal", "queue", "aging"].map((label, i) => ({ label, value: 14 + ((seed + i * 8) % 22) })),
      },
      {
        id: `${agentId}-geo-friction`,
        type: "geo",
        title: "Regional Friction Hotspots",
        description: "Relative concentration of auth/denial friction by region.",
        data: ["West", "South", "Central", "Northeast", "Northwest"].map((label, i) => ({ label, value: 26 + ((seed + i * 10) % 34) })),
      },
    ],
    insights: [
      `Top two denial categories contribute ${52 + (seed % 16)}% of preventable rework volume.`,
      `Authorization aging beyond 72 hours is concentrated in a narrow set of high-volume service lines.`,
      `Documentation and routing defects create the largest avoidable friction loop in current claims operations.`,
    ],
    actions: [
      "Deploy pre-submission quality checks for the highest-volume denial pathways.",
      "Create same-day escalation lane for requests aging past 72 hours.",
      "Run weekly root-cause huddle with UM and claims ops to close repeat friction patterns.",
    ],
    nextQuestions: [
      "Which provider groups are responsible for the highest preventable denial rework?",
      "What workflow policy changes would reduce >72h auth aging by 30% next quarter?",
    ],
  };
}

function buildPayload(agentId: SynapseAgentId): AgentResultPayload {
  const agent = getAgentById(agentId);
  const seed = hash(agentId);
  const domain = domainByAgent[agentId];
  const routeContext = agent.recommendedRoutes[0] ?? "/";
  const prompt = agent.promptExamplesByRoute.default?.[0] ?? `Summarize ${agent.shortLabel} priorities`;
  const base = 10 + (seed % 12);

  if (agentId === "contract_performance") {
    return buildContractPerformancePayload({ agentId, routeContext, prompt, seed, base });
  }

  if (agentId === "claims_friction") {
    return buildClaimsFrictionPayload({ agentId, routeContext, prompt, seed, base });
  }

  if (agentId === "life_sciences_trial_supply") {
    return {
      id: `result-${agentId}`,
      agentId,
      routeContext,
      prompt,
      title: "Network Trial Supply Intelligence — Eligibility, Site Gaps, and Enrollment Feasibility",
      summary:
        "De-identified network analysis surfaces where eligible patients already are, highlights geographic site gaps, and recommends the fastest path to enrollment through site activation, routing, and provider awareness actions.",
      kpis: [
        { label: "Eligible Lives (de-identified)", value: "12,840", trend: "up", subtext: "across target phenotype segments" },
        { label: "High-Density Site Gap Regions", value: "9", trend: "flat", subtext: "no active trial sites" },
        { label: "Median Time-to-Enrollment", value: "7.5 weeks", trend: "down", subtext: "with recommended strategy mix" },
      ],
      chartSeries: [{ value: 54 }, { value: 58 }, { value: 63 }, { value: 69 }, { value: 74 }, { value: 78 }],
      visuals: [
        {
          id: `${agentId}-eligible-heatmap`,
          type: "usMap",
          title: "U.S. Eligible Lives Density Map",
          description: "De-identified aggregated eligibility density by U.S. state.",
          data: [
            { label: "California", code: "CA", value: 2980 },
            { label: "Texas", code: "TX", value: 2720 },
            { label: "Florida", code: "FL", value: 2260 },
            { label: "New York", code: "NY", value: 2140 },
            { label: "Illinois", code: "IL", value: 1890 },
            { label: "Pennsylvania", code: "PA", value: 1680 },
            { label: "Ohio", code: "OH", value: 1540 },
            { label: "Georgia", code: "GA", value: 1495 },
            { label: "North Carolina", code: "NC", value: 1375 },
            { label: "Michigan", code: "MI", value: 1210 },
            { label: "Arizona", code: "AZ", value: 1135 },
            { label: "Washington", code: "WA", value: 980 },
          ],
        },
        {
          id: `${agentId}-site-gap-overlay`,
          type: "usMap",
          title: "U.S. Site Gap Concentration Map",
          description: "States with high eligibility density and no active trial site coverage.",
          data: [
            { label: "Missouri", code: "MO", value: 9 },
            { label: "Tennessee", code: "TN", value: 8 },
            { label: "Alabama", code: "AL", value: 7 },
            { label: "South Carolina", code: "SC", value: 7 },
            { label: "Kentucky", code: "KY", value: 6 },
            { label: "Louisiana", code: "LA", value: 6 },
            { label: "Oklahoma", code: "OK", value: 5 },
            { label: "Arkansas", code: "AR", value: 5 },
            { label: "Kansas", code: "KS", value: 4 },
          ],
        },
        {
          id: `${agentId}-time-to-enrollment`,
          type: "line",
          title: "Time-to-Enrollment Forecast",
          description: "Projected enrollment timing under recommended execution scenarios.",
          data: [
            { label: "Week 2", value: 8 },
            { label: "Week 4", value: 19 },
            { label: "Week 6", value: 33 },
            { label: "Week 8", value: 49 },
            { label: "Week 10", value: 67 },
            { label: "Week 12", value: 84 },
          ],
        },
        {
          id: `${agentId}-recommended-actions`,
          type: "bar",
          title: "Recommended Action Mix",
          description: "Priority actions by projected enrollment velocity contribution.",
          data: [
            { label: "Open site", value: 42 },
            { label: "Route to active site", value: 36 },
            { label: "Provider awareness campaign", value: 22 },
          ],
        },
      ],
      insights: [
        "Eligible patient concentration is highest in regions with partial or absent site coverage, indicating immediate expansion opportunity.",
        "Two site activations plus targeted routing could materially shorten time-to-enrollment versus routing-only strategy.",
        "Provider-facing awareness campaigns are most impactful in regions with high eligibility but low referral momentum.",
      ],
      actions: [
        "Boot up 2 new sites in top site-gap regions with strongest projected enrollment velocity.",
        "Route eligible populations in adjacent non-site regions to nearest active trial centers.",
        "Launch a provider-facing awareness campaign focused on high-density, low-referral geographies.",
      ],
      nextQuestions: [
        "Which trial indication should be prioritized first for site expansion based on readiness and supply density?",
        "What operating threshold should trigger open-site vs route-to-site decisions?",
      ],
    };
  }

  const baseGeoVisualData =
    agentId === "evidence_therapy_trial"
      ? [
          { label: "California", code: "CA", value: 78 },
          { label: "Texas", code: "TX", value: 72 },
          { label: "Florida", code: "FL", value: 68 },
          { label: "New York", code: "NY", value: 64 },
          { label: "Illinois", code: "IL", value: 59 },
          { label: "Pennsylvania", code: "PA", value: 56 },
          { label: "Ohio", code: "OH", value: 53 },
          { label: "Michigan", code: "MI", value: 49 },
          { label: "Georgia", code: "GA", value: 58 },
          { label: "North Carolina", code: "NC", value: 54 },
          { label: "Virginia", code: "VA", value: 46 },
          { label: "Washington", code: "WA", value: 51 },
          { label: "Arizona", code: "AZ", value: 47 },
          { label: "Massachusetts", code: "MA", value: 52 },
          { label: "Colorado", code: "CO", value: 44 },
          { label: "Minnesota", code: "MN", value: 41 },
        ]
      : ["West", "South", "Central", "Northeast", "Northwest"].map((label, i) => ({ label, value: 20 + ((seed + i * 13) % 65) }));

  return {
    id: `result-${agentId}`,
    agentId,
    routeContext,
    prompt,
    title: `${agent.displayName} Priority Insight Summary`,
    summary: `${agent.displayName} identified concentrated ${domain} opportunity with localized hotspots, accelerating trend pressure, and a clear intervention sequence for near-term measurable lift.`,
    kpis: [
      { label: `${agent.shortLabel} Risk Index`, value: `${58 + (seed % 35)}`, trend: "up", subtext: "rolling 90-day signal" },
      { label: "Intervention-ready cohort", value: `${220 + (seed % 480)}`, trend: "flat", subtext: "members / episodes" },
      { label: "Projected 60-day impact", value: `${6 + (seed % 11)}%`, trend: "up", subtext: "modeled improvement" },
    ],
    chartSeries: series(seed, base),
    visuals: [
      {
        id: `${agentId}-line`,
        type: "line",
        title: `${agent.shortLabel} Signal Trend`,
        description: "Trend line for leading pressure indicators.",
        data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, i) => ({ label, value: base + i * ((seed % 5) + 1) })),
      },
      {
        id: `${agentId}-radar`,
        type: "radar",
        title: `${agent.shortLabel} Multi-factor Risk Radar`,
        description: "Comparative risk profile across dominant factors.",
        data: ["Access", "Quality", "Cost", "Workflow", "Outcome"].map((label, i) => ({ label, value: 35 + ((seed + i * 7) % 55) })),
      },
      {
        id: `${agentId}-polar`,
        type: "polarArea",
        title: radialDriversByDomain[domain].title,
        description: radialDriversByDomain[domain].description,
        data: radialDriverMix(seed, domain),
      },
      {
        id: `${agentId}-cloud`,
        type: "wordCloud",
        title: `${agent.shortLabel} Theme Cloud`,
        description: "Most frequent themes extracted from synthetic signals.",
        data: wordsByDomain[domain].map((label, i) => ({ label, value: 12 + ((seed + i * 9) % 38) })),
      },
      {
        id: `${agentId}-geo`,
        type: agentId === "evidence_therapy_trial" ? "usMap" : "geo",
        title: `${agent.shortLabel} Geographic Hotspots`,
        description:
          agentId === "evidence_therapy_trial"
            ? "State-level concentration of evidence-based therapy and trial opportunity hotspots."
            : "Regional concentration of impact/risk hotspots.",
        data: baseGeoVisualData,
      },
    ],
    insights: [
      `Top two hotspots explain ${36 + (seed % 24)}% of ${domain} pressure across the monitored population.`,
      `High-friction subgroup shows ${(1.3 + (seed % 8) / 10).toFixed(1)}x worse progression versus baseline cohorts.`,
      `Intervention timing in the next 14 days yields the highest modeled impact for ${agent.shortLabel.toLowerCase()} outcomes.`,
    ],
    actions: [
      `Launch targeted ${agent.shortLabel.toLowerCase()} intervention on top-risk segments this sprint.`,
      "Stand up weekly control-tower review for trend and hotspot movement.",
      "Escalate workflow remediation for top recurring root-cause themes.",
    ],
    nextQuestions: [
      "Which segment has the fastest improvement potential with current resources?",
      "What threshold should trigger automatic escalation next cycle?",
    ],
  };
}

function applyWorkspaceContext(base: AgentResultPayload, ctx?: WorkspaceContextInput): AgentResultPayload {
  if (!ctx) return base;

  const contextThemes = Array.from(
    new Set(
      [
        ...ctx.sourcePrompts.flatMap((p) => p.toLowerCase().split(/\W+/)),
        ...ctx.existingBlockTitles.flatMap((t) => t.toLowerCase().split(/\W+/)),
      ].filter((token) => token.length > 4)
    )
  )
    .slice(0, 6)
    .map((label, i) => ({ label, value: 18 + i * 7 }));

  const priorAgentCount = ctx.contributingAgentIds.length;

  return {
    ...base,
    summary: `${base.summary} Building on workspace \"${ctx.workspaceTitle}\", this agent is contextualizing prior findings from ${priorAgentCount} agent contribution${priorAgentCount === 1 ? "" : "s"}.`,
    insights: [
      `Context-aware synthesis: current workspace themes indicate strongest overlap around ${contextThemes.slice(0, 2).map((t) => t.label).join(" and ")}.`,
      ...base.insights,
    ],
    actions: [
      `Align this agent run with existing workspace priorities in ${ctx.workspaceTitle} before launching net-new interventions.`,
      ...base.actions,
    ],
    visuals: contextThemes.length
      ? [
          {
            id: `${base.agentId}-workspace-context`,
            type: "wordCloud",
            title: "Workspace Context Theme Overlay",
            description: "Themes inferred from active workspace prompts and cards.",
            data: contextThemes,
          },
          ...base.visuals,
        ]
      : base.visuals,
  };
}

const scriptedResults: AgentResultPayload[] = agentRegistry.map((agent) => buildPayload(agent.id));

const fallbackByAgent: Record<SynapseAgentId, AgentResultPayload> = Object.fromEntries(
  scriptedResults.map((r) => [r.agentId, r])
) as Record<SynapseAgentId, AgentResultPayload>;

export function getScriptedAgentResult(params: {
  agentId: SynapseAgentId;
  routeContext: string;
  prompt: string;
  workspaceContext?: WorkspaceContextInput;
}): AgentResultPayload {
  const { agentId, routeContext, prompt, workspaceContext } = params;
  const promptLower = prompt.toLowerCase();

  const matched = scriptedResults.find((result) => {
    if (result.agentId !== agentId) return false;
    if (result.routeContext === routeContext) return true;
    return promptLower.includes(result.prompt.toLowerCase().split(" ")[0]);
  });

  if (matched) {
    return applyWorkspaceContext({ ...matched, prompt, routeContext }, workspaceContext);
  }

  const fallback = fallbackByAgent[agentId];
  return applyWorkspaceContext({
    ...fallback,
    id: `${fallback.id}-${Date.now()}`,
    prompt,
    routeContext,
  }, workspaceContext);
}
