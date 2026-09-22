import { SynapseAgentId, getAgentById } from "@/lib/synapseai/agentRegistry";
import { getScriptedAgentResult, WorkspaceContextInput } from "@/data/synthetic/agentResults";
import { SynapseWorkspace, WorkspaceGoal } from "@/lib/models/workspace";
import { loadWorkspaces, makeId, saveWorkspaces } from "@/lib/storage/synapseStore";

const ACTIVE_WORKSPACE_KEY = "synapse.activeWorkspaceId";
const PAGE_EMBEDDED_WORKSPACES_KEY = "synapse.pageEmbeddedWorkspaces";
const DEFAULT_LAYOUT = {
  sectionOrder: ["kpis", "trend", "visuals", "insights", "actions", "next_questions", "timeline"] as const,
  hiddenSections: [] as const,
};

export async function upsertWorkspaceGoals(params: {
  workspaceId: string;
  goals: WorkspaceGoal[];
}) {
  const { workspaceId, goals } = params;
  const all = await loadWorkspaces();
  const target = all.find((workspace) => workspace.id === workspaceId);
  if (!target) return undefined;

  const updated: SynapseWorkspace = {
    ...target,
    updatedAt: new Date().toISOString(),
    goals,
  };

  await saveWorkspaces([updated]);
  return updated;
}

function synthesizeWorkspaceExecutiveSummary(workspace: Pick<SynapseWorkspace, "blocks" | "contributingAgentIds" | "sourcePrompts">) {
  const insightHighlights = workspace.blocks
    .filter((block) => block.type === "insight")
    .flatMap((block) => block.items ?? []);
  const actionHighlights = workspace.blocks
    .filter((block) => block.type === "actions")
    .flatMap((block) => block.items ?? []);
  const summaryBlockContent = workspace.blocks.find((block) => block.type === "summary")?.content?.trim();

  if (workspace.contributingAgentIds.length <= 1) {
    return summaryBlockContent || "Single-agent workspace focused on the highest-priority findings and immediate actions.";
  }

  const contributingAgents = workspace.contributingAgentIds
    .slice(0, 3)
    .map((agentId) => getAgentById(agentId).shortLabel)
    .join(", ");
  const includesMoreAgents = workspace.contributingAgentIds.length > 3;
  const topInsight = insightHighlights[0] ?? "cross-domain opportunity concentration in the highest-risk segment";
  const topAction = actionHighlights[0] ?? "launching a coordinated intervention sprint across teams";
  const latestPrompt = workspace.sourcePrompts[workspace.sourcePrompts.length - 1];

  return `${workspace.contributingAgentIds.length}-agent executive synthesis (${contributingAgents}${includesMoreAgents ? ", +more" : ""}) indicates ${topInsight.toLowerCase()}. Primary recommendation: ${topAction}.${latestPrompt ? ` Most recent analysis focus: "${latestPrompt}".` : ""}`;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getActiveWorkspaceId() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_WORKSPACE_KEY);
}

export function setActiveWorkspaceId(workspaceId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
}

export function getEmbeddedWorkspaceIds(pageKey: string) {
  if (typeof window === "undefined") return [] as string[];
  const raw = window.localStorage.getItem(PAGE_EMBEDDED_WORKSPACES_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return Array.isArray(parsed?.[pageKey]) ? parsed[pageKey] : [];
  } catch {
    return [];
  }
}

export function setEmbeddedWorkspaceIds(pageKey: string, workspaceIds: string[]) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(PAGE_EMBEDDED_WORKSPACES_KEY);
  let parsed: Record<string, string[]> = {};

  if (raw) {
    try {
      parsed = JSON.parse(raw) as Record<string, string[]>;
    } catch {
      parsed = {};
    }
  }

  parsed[pageKey] = Array.from(new Set(workspaceIds));
  window.localStorage.setItem(PAGE_EMBEDDED_WORKSPACES_KEY, JSON.stringify(parsed));
}

export async function upsertWorkspaceFromAgentPrompt(params: {
  mode: "create" | "add";
  agentId: SynapseAgentId;
  prompt: string;
  routeContext: string;
  workspaceId?: string;
  workspaceName?: string;
}) {
  const { mode, agentId, prompt, routeContext, workspaceId, workspaceName } = params;
  const now = new Date().toISOString();
  const existing = await loadWorkspaces();
  const targetId = workspaceId ?? getActiveWorkspaceId();
  const agent = getAgentById(agentId);
  const asWorkspaceContext = (workspace: SynapseWorkspace): WorkspaceContextInput => ({
    workspaceId: workspace.id,
    workspaceTitle: workspace.title,
    workspaceSummary: workspace.summary,
    sourcePrompts: workspace.sourcePrompts,
    contributingAgentIds: workspace.contributingAgentIds,
    existingBlockTitles: workspace.blocks.map((block) => block.title),
  });

  const targetWorkspace = mode === "add" && targetId ? existing.find((workspace) => workspace.id === targetId) : undefined;
  const result = getScriptedAgentResult({
    agentId,
    prompt,
    routeContext,
    workspaceContext: targetWorkspace ? asWorkspaceContext(targetWorkspace) : undefined,
  });
  const requestedTitle = workspaceName?.trim() || `${agent.shortLabel} Workspace`;

  const normalizedPrompt = normalizeText(prompt);
  const dedupeSignature = `${agentId}|${routeContext}|${normalizeText(requestedTitle)}|${normalizedPrompt}`;
  const dedupeId = `workspace-${hashText(dedupeSignature)}`;
  const dedupeMatch = existing.find((workspace) => workspace.id === dedupeId);

  const resultBlockIds = {
    summary: makeId("ws-block"),
    kpi: makeId("ws-block"),
    trend: makeId("ws-block"),
    insight: makeId("ws-block"),
    action: makeId("ws-block"),
    next: makeId("ws-block"),
  };

  if (mode === "create" || !targetId) {
    if (dedupeMatch) {
      setActiveWorkspaceId(dedupeMatch.id);
      return dedupeMatch;
    }

    let created: SynapseWorkspace = {
      id: dedupeId,
      title: requestedTitle,
      summary: result.summary,
      status: "active",
      originAgentId: agentId,
      contributingAgentIds: [agentId],
      sourcePrompts: [prompt],
      createdAt: now,
      updatedAt: now,
      lastRefreshedAt: now,
      share: { visibility: "private", sharedWith: [] },
      goals: [],
      layout: {
        sectionOrder: [...DEFAULT_LAYOUT.sectionOrder],
        hiddenSections: [...DEFAULT_LAYOUT.hiddenSections],
      },
      blocks: [
        {
          id: resultBlockIds.summary,
          type: "summary",
          title: result.title,
          content: result.summary,
        },
        {
          id: resultBlockIds.kpi,
          type: "kpi",
          title: "Signal KPIs",
          kpis: result.kpis.map((kpi) => ({
            label: kpi.label,
            value: kpi.value,
            trend: kpi.trend,
          })),
        },
        {
          id: resultBlockIds.trend,
          type: "chart",
          title: "Trend Snapshot",
          chartType: "sparkline",
          chartData: result.chartSeries.map((point, index) => ({
            label: `P${index + 1}`,
            value: point.value,
          })),
        },
        {
          id: resultBlockIds.insight,
          type: "insight",
          title: "Insights",
          items: result.insights,
        },
        {
          id: resultBlockIds.action,
          type: "actions",
          title: "Recommended Actions",
          items: result.actions,
        },
        {
          id: resultBlockIds.next,
          type: "next_questions",
          title: "Next Questions",
          items: result.nextQuestions,
        },
        ...result.visuals.map((visual) => ({
          id: makeId("ws-block"),
          type: "chart" as const,
          title: visual.title,
          description: visual.description,
          chartType: visual.type,
          seriesLabels: visual.seriesLabels,
          chartData: visual.data.map((entry) => ({
            label: entry.label,
            value: entry.value,
            valueSecondary: entry.valueSecondary,
            valueTertiary: entry.valueTertiary,
          })),
        })),
      ],
      contributions: [
        {
          id: makeId("ws-contrib"),
          agentId,
          prompt,
          routeContext,
          createdAt: now,
          influencedBlockIds: Object.values(resultBlockIds),
          notes: `Initial workspace seeded by ${agent.displayName}.`,
        },
      ],
    };
    created = {
      ...created,
      summary: synthesizeWorkspaceExecutiveSummary(created),
    };
    await saveWorkspaces([created]);
    setActiveWorkspaceId(created.id);
    return created;
  }

  const target = existing.find((workspace) => workspace.id === targetId);
  if (!target) {
    return upsertWorkspaceFromAgentPrompt({ mode: "create", agentId, prompt, routeContext, workspaceName });
  }

  let updated: SynapseWorkspace = {
    ...target,
    updatedAt: now,
    lastRefreshedAt: now,
    contributingAgentIds: Array.from(new Set([...target.contributingAgentIds, agentId])),
    sourcePrompts: Array.from(new Set([...target.sourcePrompts, prompt])),
    goals: target.goals ?? [],
    layout: target.layout ?? {
      sectionOrder: [...DEFAULT_LAYOUT.sectionOrder],
      hiddenSections: [...DEFAULT_LAYOUT.hiddenSections],
    },
    blocks: [
      ...target.blocks,
      {
        id: resultBlockIds.summary,
        type: "summary",
        title: `${result.title} (${agent.shortLabel})`,
        content: result.summary,
      },
      {
        id: resultBlockIds.kpi,
        type: "kpi",
        title: `${agent.shortLabel} KPIs`,
        kpis: result.kpis.map((kpi) => ({
          label: kpi.label,
          value: kpi.value,
          trend: kpi.trend,
        })),
      },
      {
        id: resultBlockIds.trend,
        type: "chart",
        title: `Trend Snapshot (${agent.shortLabel})`,
        chartType: "sparkline",
        chartData: result.chartSeries.map((point, index) => ({
          label: `P${index + 1}`,
          value: point.value,
        })),
      },
      {
        id: resultBlockIds.insight,
        type: "insight",
        title: `${agent.shortLabel} Insights`,
        items: result.insights,
      },
      {
        id: resultBlockIds.action,
        type: "actions",
        title: `${agent.shortLabel} Actions`,
        items: result.actions,
      },
      ...result.visuals.map((visual) => ({
        id: makeId("ws-block"),
        type: "chart" as const,
        title: `${visual.title} (${agent.shortLabel})`,
        description: visual.description,
        chartType: visual.type,
        seriesLabels: visual.seriesLabels,
        chartData: visual.data.map((entry) => ({
          label: entry.label,
          value: entry.value,
          valueSecondary: entry.valueSecondary,
          valueTertiary: entry.valueTertiary,
        })),
      })),
    ],
    contributions: [
      ...target.contributions,
      {
        id: makeId("ws-contrib"),
        agentId,
        prompt,
        routeContext,
        createdAt: now,
        influencedBlockIds: [
          resultBlockIds.summary,
          resultBlockIds.kpi,
          resultBlockIds.trend,
          resultBlockIds.insight,
          resultBlockIds.action,
        ],
        notes: `${agent.displayName} contributed additional insights.`,
      },
    ],
  };

  updated = {
    ...updated,
    summary: synthesizeWorkspaceExecutiveSummary(updated),
  };

  await saveWorkspaces([updated]);
  setActiveWorkspaceId(updated.id);
  return updated;
}

function hashText(input: string) {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}
