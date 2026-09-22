import { TelemetryEvent } from "@/lib/models/telemetry";
import { Project } from "@/lib/models/project";
import { SynapseWorkspace } from "@/lib/models/workspace";
import { agentSuites, getAgentById, SynapseAgentId } from "@/lib/synapseai/agentRegistry";

function uniqueCount(values: Array<string | undefined>) {
  return new Set(values.filter(Boolean) as string[]).size;
}

function estimateEngagedMinutes(events: TelemetryEvent[]) {
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  let totalMs = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(sorted[i - 1].occurredAt).getTime();
    const cur = new Date(sorted[i].occurredAt).getTime();
    const delta = cur - prev;
    if (delta > 0) {
      totalMs += Math.min(delta, 30 * 60 * 1000); // cap inactive gaps at 30 min
    }
  }
  return Number((totalMs / (1000 * 60)).toFixed(1));
}

export function buildProductScorecard(
  events: TelemetryEvent[],
  context?: { projects?: Project[]; workspaces?: SynapseWorkspace[] }
) {
  const pageViews = events.filter((event) => event.eventName === "page_viewed");
  const reviewed = events.filter((event) => event.eventName === "opportunity_review_opened");
  const converted = events.filter((event) => event.eventName === "project_created_from_opportunity");
  const contractsPageViews = events.filter((event) => event.module === "contracts" && event.eventName === "page_viewed");
  const workspaceOpened = events.filter((event) => event.module === "workspaces" && event.eventName === "page_viewed");
  const pageCounts = pageViews.reduce<Record<string, number>>((acc, event) => {
    const key = event.page ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const activeUsers = uniqueCount(events.map((event) => event.userId));
  const wau = uniqueCount(
    events
      .filter((event) => Date.now() - new Date(event.occurredAt).getTime() <= 7 * 24 * 60 * 60 * 1000)
      .map((event) => event.userId)
  );
  const mau = uniqueCount(
    events
      .filter((event) => Date.now() - new Date(event.occurredAt).getTime() <= 30 * 24 * 60 * 60 * 1000)
      .map((event) => event.userId)
  );

  const moduleCounts = pageViews.reduce<Record<string, number>>((acc, event) => {
    const key = event.module ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const eventAgentIds = new Set<string>();
  events.forEach((event) => {
    if (event.originAgentId) eventAgentIds.add(event.originAgentId);
    (event.contributingAgentIds ?? []).forEach((id) => eventAgentIds.add(id));
  });
  (context?.projects ?? []).forEach((project) => {
    eventAgentIds.add(project.savedViewSnapshot.agentId);
  });
  (context?.workspaces ?? []).forEach((workspace) => {
    eventAgentIds.add(workspace.originAgentId);
    workspace.contributingAgentIds.forEach((id) => eventAgentIds.add(id));
  });

  const suiteIds = new Set<string>();
  const suiteCounts: Record<string, number> = {};
  eventAgentIds.forEach((agentId) => {
    const suiteId = getAgentById(agentId as SynapseAgentId).suiteId;
    suiteIds.add(suiteId);
    suiteCounts[suiteId] = (suiteCounts[suiteId] ?? 0) + 1;
  });

  const contractsEngaged = uniqueCount(events.map((event) => event.contractId));
  const projectsEngaged = uniqueCount(events.map((event) => event.projectId));

  return {
    activeUsers,
    wau,
    mau,
    stickiness: mau ? Number((wau / mau).toFixed(2)) : 0,
    opportunityReviewRate: pageViews.length ? Number((reviewed.length / pageViews.length).toFixed(2)) : 0,
    opportunityToProjectConversionRate: reviewed.length ? Number((converted.length / reviewed.length).toFixed(2)) : 0,
    workspaceAdoptionRate: activeUsers ? Number((uniqueCount(workspaceOpened.map((e) => e.userId)) / activeUsers).toFixed(2)) : 0,
    suitesActivated: suiteIds.size,
    suiteDirectoryCount: agentSuites.length,
    agentsActivated: eventAgentIds.size,
    projectCount: context?.projects?.length ?? 0,
    contractsEngaged,
    projectsEngaged,
    estimatedEngagedMinutes: estimateEngagedMinutes(events),
    funnelCounts: {
      contractsViewed: contractsPageViews.length,
      opportunitiesReviewed: reviewed.length,
      projectsCreatedFromOpportunity: converted.length,
    },
    moduleCounts,
    pageCounts,
    suiteCounts,
  };
}
