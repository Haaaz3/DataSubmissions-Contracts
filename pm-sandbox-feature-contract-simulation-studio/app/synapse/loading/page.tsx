"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { GoalType } from "@/lib/models/cohort";
import type { AuditEvent, KPI, MetricPoint, Project, Task, WorkflowTemplate } from "@/lib/models/project";
import {
  makeId,
  saveAuditEvents,
  saveMetricPoints,
  saveProjects,
  saveTasks,
  saveWorkflowTemplates,
} from "@/lib/storage/synapseStore";

const EXECUTION_MS = 10000;

type WorkflowKind = "outreach" | "previsit" | "pharmacy" | "navigation" | "caremgmt" | "manual" | "generic";

function inferWorkflowKind(actionLabel: string, workflowType: string): WorkflowKind {
  const context = `${actionLabel} ${workflowType}`.toLowerCase();
  if (context.includes("outreach") || context.includes("campaign") || context.includes("sms") || context.includes("email")) return "outreach";
  if (context.includes("pre-visit") || context.includes("visit") || context.includes("provider")) return "previsit";
  if (context.includes("pharmacy") || context.includes("medication") || context.includes("adherence")) return "pharmacy";
  if (context.includes("navigation") || context.includes("access") || context.includes("transport")) return "navigation";
  if (context.includes("care management") || context.includes("enroll") || context.includes("longitudinal")) return "caremgmt";
  if (context.includes("manual") || context.includes("review") || context.includes("abstraction") || context.includes("retrieval")) return "manual";
  return "generic";
}

function inferGoalType(actionLabel: string, workflowType: string): GoalType {
  const text = `${actionLabel} ${workflowType}`.toLowerCase();
  if (text.includes("ed") || text.includes("emergency")) return "ed_utilization";
  if (text.includes("readmission") || text.includes("hospital")) return "readmissions";
  if (text.includes("screen") || text.includes("cancer")) return "cancer_screening";
  return "diabetes";
}

function buildWorkflowTemplateType(kind: WorkflowKind): WorkflowTemplate["type"] {
  if (kind === "outreach") return "screening_campaign";
  if (kind === "previsit") return "provider_panel_microcampaign";
  if (kind === "pharmacy") return "diabetes_control";
  if (kind === "navigation") return "ed_diversion";
  if (kind === "caremgmt") return "diabetes_control";
  if (kind === "manual") return "diabetes_complication_overlay";
  return "diabetes_complication_overlay";
}

function buildScenarioMetrics(kind: WorkflowKind, total: number): Record<string, number> {
  if (kind === "outreach") {
    const sent = total;
    const opened = Math.round(sent * 0.62);
    const clicked = Math.round(opened * 0.41);
    const scheduled = Math.round(clicked * 0.54);
    const closed = Math.round(scheduled * 0.48);
    return {
      funnel_sent: sent,
      funnel_opened: opened,
      funnel_clicked: clicked,
      funnel_scheduled: scheduled,
      funnel_closed: closed,
      outreach_email_sent: Math.round(sent * 0.66),
      outreach_sms_sent: Math.round(sent * 0.34),
    };
  }

  if (kind === "previsit") {
    const scheduled = Math.round(total * 0.72);
    const completed = Math.round(scheduled * 0.78);
    const notesAck = Math.round(completed * 0.81);
    const testsCompleted = Math.round(notesAck * 0.69);
    const closed = Math.round(testsCompleted * 0.58);
    return {
      previsit_scheduled: scheduled,
      previsit_completed: completed,
      previsit_note_ack: notesAck,
      previsit_test_completed: testsCompleted,
      previsit_closed: closed,
    };
  }

  if (kind === "pharmacy") {
    const queued = Math.round(total * 0.66);
    const reviewed = Math.round(queued * 0.84);
    const accepted = Math.round(reviewed * 0.62);
    const fillCompleted = Math.round(accepted * 0.74);
    const closed = Math.round(fillCompleted * 0.52);
    return {
      pharmacy_queued: queued,
      pharmacy_reviewed: reviewed,
      pharmacy_accepted: accepted,
      pharmacy_fill_completed: fillCompleted,
      pharmacy_closed: closed,
    };
  }

  if (kind === "navigation") {
    const identified = Math.round(total * 0.61);
    const contacted = Math.round(identified * 0.82);
    const barriersResolved = Math.round(contacted * 0.67);
    const appointmentsCompleted = Math.round(barriersResolved * 0.71);
    const closed = Math.round(appointmentsCompleted * 0.49);
    return {
      navigation_identified: identified,
      navigation_contacted: contacted,
      navigation_barriers_resolved: barriersResolved,
      navigation_appointments_completed: appointmentsCompleted,
      navigation_closed: closed,
    };
  }

  if (kind === "caremgmt") {
    const eligible = Math.round(total * 0.55);
    const enrolled = Math.round(eligible * 0.63);
    const touchpointsCompleted = Math.round(enrolled * 0.76);
    const carePlansActivated = Math.round(touchpointsCompleted * 0.72);
    const closed = Math.round(carePlansActivated * 0.47);
    return {
      caremgmt_eligible: eligible,
      caremgmt_enrolled: enrolled,
      caremgmt_touchpoints_completed: touchpointsCompleted,
      caremgmt_careplans_activated: carePlansActivated,
      caremgmt_closed: closed,
    };
  }

  if (kind === "manual") {
    const chartsQueued = Math.round(total * 0.5);
    const chartsReviewed = Math.round(chartsQueued * 0.86);
    const recordsRetrieved = Math.round(chartsReviewed * 0.64);
    const documentationUpdated = Math.round(recordsRetrieved * 0.73);
    const closed = Math.round(documentationUpdated * 0.42);
    return {
      review_charts_queued: chartsQueued,
      review_charts_reviewed: chartsReviewed,
      review_records_retrieved: recordsRetrieved,
      review_documentation_updated: documentationUpdated,
      review_closed: closed,
    };
  }

  const scoped = Math.round(total * 0.6);
  const engaged = Math.round(scoped * 0.7);
  const actioned = Math.round(engaged * 0.63);
  const closed = Math.round(actioned * 0.46);
  return {
    generic_scoped: scoped,
    generic_engaged: engaged,
    generic_actioned: actioned,
    generic_closed: closed,
  };
}

function getScenarioTaskTitles(kind: WorkflowKind): string[] {
  if (kind === "previsit") {
    return [
      "Validate upcoming appointment denominator",
      "Generate and route pre-visit note packets",
      "Track provider acknowledgement completion",
      "Monitor suggested-test completion status",
      "Confirm encounter-based care-gap closures",
    ];
  }

  if (kind === "pharmacy") {
    return [
      "Identify refill-risk and adherence-risk patients",
      "Queue pharmacist interventions",
      "Track provider acceptance of medication recommendations",
      "Monitor refill and pick-up completion",
      "Confirm medication-related care-gap closures",
    ];
  }

  if (kind === "navigation") {
    return [
      "Identify members with access barriers",
      "Assign navigation outreach tasks",
      "Resolve scheduling and transportation barriers",
      "Track completed follow-up appointments",
      "Confirm barrier-linked care-gap closures",
    ];
  }

  if (kind === "caremgmt") {
    return [
      "Confirm high-risk eligibility and prioritization",
      "Enroll members into care management pathways",
      "Complete initial RN/pharmacist touchpoints",
      "Activate individualized care plans",
      "Track longitudinal care-gap closure outcomes",
    ];
  }

  if (kind === "manual") {
    return [
      "Queue charts for abstraction review",
      "Retrieve missing external clinical records",
      "Validate exclusions and denominator alignment",
      "Update structured documentation for closure evidence",
      "Finalize chart-validated care-gap closure entries",
    ];
  }

  if (kind === "outreach") {
    return [
      "Validate denominator and exclusions",
      "Launch outreach sequence",
      "Monitor engagement funnel",
      "Escalate high-risk non-responders",
      "Close confirmed care gaps",
    ];
  }

  return [
    "Validate scoped population",
    "Launch intervention workflow",
    "Monitor intermediate completion metrics",
    "Escalate blocked records",
    "Confirm closure outcomes",
  ];
}

function getScenarioKpiConfig(kind: WorkflowKind) {
  if (kind === "previsit") {
    return {
      primary: { key: "previsit_closed", displayName: "Visit-Based Care Gap Closures", baseline: 0, target: 210, direction: "up" as const },
      leading: [
        { key: "previsit_note_ack_rate", displayName: "Provider Note Acknowledgement Rate", baseline: 0, target: 75, direction: "up" as const },
        { key: "previsit_test_completion_rate", displayName: "Suggested Test Completion Rate", baseline: 0, target: 60, direction: "up" as const },
      ],
    };
  }

  if (kind === "pharmacy") {
    return {
      primary: { key: "pharmacy_closed", displayName: "Medication Gap Closures", baseline: 0, target: 180, direction: "up" as const },
      leading: [
        { key: "pharmacy_acceptance_rate", displayName: "Provider Acceptance Rate", baseline: 0, target: 62, direction: "up" as const },
        { key: "pharmacy_fill_completion_rate", displayName: "Refill Completion Rate", baseline: 0, target: 70, direction: "up" as const },
      ],
    };
  }

  if (kind === "navigation") {
    return {
      primary: { key: "navigation_closed", displayName: "Access-Resolved Care Gap Closures", baseline: 0, target: 150, direction: "up" as const },
      leading: [
        { key: "navigation_barrier_resolution_rate", displayName: "Barrier Resolution Rate", baseline: 0, target: 65, direction: "up" as const },
        { key: "navigation_appointment_completion_rate", displayName: "Appointment Completion Rate", baseline: 0, target: 55, direction: "up" as const },
      ],
    };
  }

  if (kind === "caremgmt") {
    return {
      primary: { key: "caremgmt_closed", displayName: "Longitudinal Program Closures", baseline: 0, target: 140, direction: "up" as const },
      leading: [
        { key: "caremgmt_enrollment_rate", displayName: "Enrollment Conversion Rate", baseline: 0, target: 60, direction: "up" as const },
        { key: "caremgmt_touchpoint_completion_rate", displayName: "Touchpoint Completion Rate", baseline: 0, target: 72, direction: "up" as const },
      ],
    };
  }

  if (kind === "manual") {
    return {
      primary: { key: "review_closed", displayName: "Chart-Validated Closures", baseline: 0, target: 95, direction: "up" as const },
      leading: [
        { key: "review_records_retrieval_rate", displayName: "Record Retrieval Rate", baseline: 0, target: 55, direction: "up" as const },
        { key: "review_documentation_update_rate", displayName: "Documentation Update Rate", baseline: 0, target: 50, direction: "up" as const },
      ],
    };
  }

  if (kind === "outreach") {
    return {
      primary: { key: "funnel_closed", displayName: "Care Gap Closure Rate", baseline: 0, target: 78, direction: "up" as const },
      leading: [
        { key: "open_rate", displayName: "Message Open Rate", baseline: 0, target: 62, direction: "up" as const },
        { key: "cta_click_rate", displayName: "CTA Click Rate", baseline: 0, target: 25, direction: "up" as const },
      ],
    };
  }

  return {
    primary: { key: "generic_closed", displayName: "Workflow Closure Rate", baseline: 0, target: 55, direction: "up" as const },
    leading: [
      { key: "generic_engagement_rate", displayName: "Engagement Rate", baseline: 0, target: 60, direction: "up" as const },
      { key: "generic_action_completion_rate", displayName: "Action Completion Rate", baseline: 0, target: 45, direction: "up" as const },
    ],
  };
}

function createActionArtifacts({
  actionLabel,
  workflowType,
  contextName,
  owner,
}: {
  actionLabel: string;
  workflowType: string;
  contextName: string;
  owner: string;
}) {
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);
  const projectId = makeId("project");
  const kind = inferWorkflowKind(actionLabel, workflowType);
  const goalType = inferGoalType(actionLabel, workflowType);
  const denominator = 1200;
  const scenarioMetrics = buildScenarioMetrics(kind, denominator);
  const scenarioMetricEntries = Object.entries(scenarioMetrics);
  const scenarioPrimaryMetric = scenarioMetricEntries[scenarioMetricEntries.length - 1]?.[1] ?? 0;
  const scenarioStartMetric = scenarioMetricEntries[0]?.[1] ?? 1;
  const scenarioConfig = getScenarioKpiConfig(kind);

  const primaryKpi: KPI = {
    ...scenarioConfig.primary,
  };

  const secondaryKPIs: KPI[] = [
    {
      key: scenarioMetricEntries[0]?.[0] ?? "workflow_started",
      displayName: "Workflow Started",
      baseline: 0,
      target: scenarioStartMetric,
      direction: "up",
    },
    {
      key: scenarioMetricEntries[scenarioMetricEntries.length - 1]?.[0] ?? "workflow_closed",
      displayName: "Care Gaps Closed",
      baseline: 0,
      target: scenarioPrimaryMetric,
      direction: "up",
    },
  ];

  const leadingIndicators: KPI[] = scenarioConfig.leading;

  const project: Project = {
    id: projectId,
    name: `${contextName} – ${actionLabel}`,
    goalType,
    status: "active",
    cohortSnapshot: {
      cohortId: `auto-${kind}`,
      cohortVersionHash: "v1-agentic-workflow",
      sizeAtStart: denominator,
      definitionFrozen: true,
      frozenAt: today,
    },
    savedViewSnapshot: {
      synapseRunId: makeId("synapse-run"),
      agentId: "quality_care_gap",
      agentDisplayName: "Quality Care Gap Agent",
      savedAt: today,
      summaryMarkdown: `Automated agent action launched for **${contextName}**.\n\nAction: **${actionLabel}**\nWorkflow: **${workflowType}**\nOwner: **${owner}**`,
      drivers: [
        { label: "Workflow type", value: workflowType, evidenceRefIds: ["wf-type"] },
        { label: "Execution owner", value: owner, evidenceRefIds: ["wf-owner"] },
      ],
      segments: [
        {
          name: contextName,
          size: denominator,
          rationale: "Members selected for automated execution workflow",
          evidenceRefIds: ["segment-1"],
        },
      ],
      workflows: [
        {
          title: actionLabel,
          ownerRole: owner,
          slas: ["Launch in <24h", "Daily monitoring"],
          metrics: scenarioMetricEntries.map(([metricKey]) => metricKey),
        },
      ],
      telemetry: [
        {
          metricKey: "funnel_closed",
          displayName: "Care Gaps Closed",
          cadence: "daily",
          freshness: "daily",
          limitations: ["Synthetic execution telemetry"],
        },
      ],
      citations: [
        { id: "wf-type", label: "Workflow", excerpt: workflowType },
        { id: "wf-owner", label: "Owner", excerpt: owner },
        { id: "segment-1", label: "Execution population", excerpt: `${denominator.toLocaleString()} members in workflow scope.` },
      ],
    },
    sharing: {
      visibility: "private",
      shares: [],
    },
    charter: {
      goalStatement: `Automatically execute ${actionLabel.toLowerCase()} for ${contextName.toLowerCase()} and maximize care-gap closure.`,
      primaryKPI: primaryKpi,
      secondaryKPIs,
      timeframe: {
        startDate: today,
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10),
      },
      owners: {
        executiveSponsor: "Quality Executive Lead",
        clinicalOwner: "Clinical Quality Owner",
        opsOwner: owner,
        analyticsOwner: "Quality Analytics Lead",
      },
      leadingIndicators,
      assumptions: [
        "Automated workflow execution is active and SLA-compliant.",
        "Scenario-specific progression metrics reflect synthetic but realistic execution behavior.",
      ],
    },
    createdFromAgentRunId: undefined,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const workflowTemplate: WorkflowTemplate = {
    id: makeId("workflow"),
    projectId,
    type: buildWorkflowTemplateType(kind),
    title: actionLabel,
    description: `Automated workflow generated from agent action: ${workflowType}`,
    ownerRole: owner,
    SLAs: [{ name: "Initial execution", hours: 24 }, { name: "Follow-up review", days: 7 }],
    evidenceRequired: ["care-gap evidence", "engagement telemetry", "closure confirmation"],
    metricsLinked: scenarioMetricEntries.map(([metricKey]) => metricKey),
    status: "active",
  };

  const taskTitles = getScenarioTaskTitles(kind);
  const tasks: Task[] = [
    { id: makeId("task"), projectId, workflowTemplateId: workflowTemplate.id, title: taskTitles[0], assignedRole: "Quality Analyst", dueDate: today, status: "done", createdAt: nowIso, updatedAt: nowIso },
    { id: makeId("task"), projectId, workflowTemplateId: workflowTemplate.id, title: taskTitles[1], assignedRole: owner, dueDate: today, status: "done", createdAt: nowIso, updatedAt: nowIso },
    { id: makeId("task"), projectId, workflowTemplateId: workflowTemplate.id, title: taskTitles[2], assignedRole: "Operations Analyst", dueDate: today, status: "in_progress", createdAt: nowIso, updatedAt: nowIso },
    { id: makeId("task"), projectId, workflowTemplateId: workflowTemplate.id, title: taskTitles[3], assignedRole: "Care Manager", dueDate: today, status: "todo", createdAt: nowIso, updatedAt: nowIso },
    { id: makeId("task"), projectId, workflowTemplateId: workflowTemplate.id, title: taskTitles[4], assignedRole: "Clinical Ops", dueDate: today, status: "in_progress", createdAt: nowIso, updatedAt: nowIso },
  ];

  const metrics: MetricPoint[] = scenarioMetricEntries.map(([metricKey, value], idx) => ({
    id: makeId("metric"),
    projectId,
    metricKey,
    date: today,
    value,
    confidence: Math.max(0.8, 0.93 - idx * 0.02),
    freshness: "daily",
  }));

  metrics.push({
    id: makeId("metric"),
    projectId,
    metricKey: primaryKpi.key,
    date: today,
    value: Math.round((scenarioPrimaryMetric / Math.max(1, scenarioStartMetric)) * 100),
    confidence: 0.84,
    freshness: "daily",
  });

  const auditEvents: AuditEvent[] = [
    {
      id: makeId("audit"),
      entityType: "Project",
      entityId: projectId,
      eventType: "ProjectCreated",
      timestamp: nowIso,
      actor: "SynapseAI Agent",
      details: `Project created automatically from agent action: ${actionLabel}`,
    },
  ];

  return { project, workflowTemplate, tasks, metrics, auditEvents };
}

function buildExecutionSteps(actionLabel: string, workflowType: string) {
  const context = `${actionLabel} ${workflowType}`.toLowerCase();

  if (context.includes("outreach") || context.includes("campaign")) {
    return [
      "Indexing eligible members and validating denominator inclusion",
      "Scrubbing charts for recent closure events and duplicate outreach",
      "Applying NLP to notes for refusal, access barriers, and care-preference signals",
      "Generating personalized outreach cadence and channel sequencing",
      "Routing complex members to clinician review and escalation queue",
      "Launching outreach workflow and activating monitoring telemetry",
    ];
  }

  if (context.includes("pre-visit") || context.includes("visit") || context.includes("provider")) {
    return [
      "Identifying upcoming appointments across eligible members",
      "Reconciling open care gaps against chart and claim evidence",
      "Extracting closure-relevant context from visit notes via NLP",
      "Drafting provider prompts and pre-visit checklist recommendations",
      "Publishing visit-day workflow tasks into operational queues",
      "Activating completion tracking for same-day closure outcomes",
    ];
  }

  if (context.includes("pharmacy") || context.includes("medication") || context.includes("adherence")) {
    return [
      "Screening medication history, refill behavior, and recent clinical markers",
      "Reviewing chart notes for tolerance, side effects, and affordability concerns",
      "Scoring members for intervention urgency and expected response",
      "Building pharmacist-ready intervention packets with evidence trace",
      "Routing medication optimization tasks to appropriate owners",
      "Launching adherence workflow and initiating weekly outcome monitoring",
    ];
  }

  if (context.includes("navigation") || context.includes("access") || context.includes("transport")) {
    return [
      "Identifying members with network, scheduling, and transportation barriers",
      "Scrubbing claims and chart events for unresolved access-related friction",
      "Extracting social-risk and barrier context from free-text documentation",
      "Mapping in-network alternatives and scheduling pathways",
      "Assigning navigation tasks with SLA-based prioritization",
      "Launching barrier-resolution workflow and monitoring closure lift",
    ];
  }

  if (context.includes("care management") || context.includes("enroll") || context.includes("longitudinal")) {
    return [
      "Scoring members for longitudinal care-management eligibility",
      "Prioritizing risk tiers and assigning RN/pharmacist ownership",
      "Generating individualized care-plan recommendations",
      "Activating proactive touchpoint cadence and escalation rules",
      "Tracking adherence, encounter completion, and closure outcomes",
      "Publishing longitudinal KPI telemetry to project dashboard",
    ];
  }

  if (context.includes("manual") || context.includes("review") || context.includes("abstraction") || context.includes("retrieval")) {
    return [
      "Identifying records requiring chart abstraction and validation",
      "Reconciling claims, EHR, and external result discrepancies",
      "Retrieving missing external records and structured evidence",
      "Validating denominator exclusions and closure criteria",
      "Updating chart documentation with verified closure evidence",
      "Publishing review throughput and closure telemetry",
    ];
  }

  return [
    "Indexing eligible members and validating cohort boundaries",
    "Scrubbing each patient chart for closure and exclusion evidence",
    "Applying NLP to patient notes to extract workflow-relevant signals",
    "Scoring members by impactability, effort, and execution readiness",
    "Generating owner-assigned tasks and intervention sequencing",
    "Launching automated action and starting telemetry tracking",
  ];
}

function SynapseLoadingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [complete, setComplete] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  const actionLabel = searchParams.get("actionLabel") ?? "Automated clinical workflow";
  const workflowType = searchParams.get("workflowType") ?? "care-gap execution";
  const contextName = searchParams.get("contextName") ?? "selected population";
  const owner = searchParams.get("owner") ?? "Operations team";
  const source = searchParams.get("source") ?? "";
  const destination = searchParams.get("destination");
  const next = searchParams.get("next");
  const prompt = searchParams.get("prompt");
  const agent = searchParams.get("agent");
  const suite = searchParams.get("suite");
  const route = searchParams.get("route");
  const existingProjectId = searchParams.get("projectId");
  const preCompletedSteps = Number(searchParams.get("completedSteps") ?? "0");
  const isExistingWorkflow = Boolean(existingProjectId);

  const executionSources = new Set(["quality-top-opportunity", "measure-insight-cohort"]);

  const resolveDestination = () => {
    if (destination === "project" || destination === "results") return destination;
    if (executionSources.has(source) || isExistingWorkflow) return "project";
    if (next?.startsWith("/synapse/results") || prompt || agent || suite || route) return "results";
    return "project";
  };

  const resolvedDestination = resolveDestination();

  const steps = useMemo(() => buildExecutionSteps(actionLabel, workflowType), [actionLabel, workflowType]);
  const progressPct = Math.min(100, Math.round((elapsedMs / EXECUTION_MS) * 100));
  const activeStepIndex = Math.min(steps.length - 1, Math.floor((elapsedMs / EXECUTION_MS) * steps.length));
  const normalizedPreCompletedSteps = Number.isFinite(preCompletedSteps)
    ? Math.max(0, Math.min(steps.length - 1, preCompletedSteps))
    : 0;
  const effectiveActiveStepIndex = Math.max(activeStepIndex, normalizedPreCompletedSteps);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedMs((prev) => {
        const next = Math.min(EXECUTION_MS, prev + 125);
        if (next >= EXECUTION_MS) {
          setComplete(true);
        }
        return next;
      });
    }, 125);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const buildResultsHref = useCallback((projectIdValue?: string) => {
    if (next?.startsWith("/synapse/results")) {
      try {
        const [basePath, existingQuery = ""] = next.split("?");
        const params = new URLSearchParams(existingQuery);
        if (projectIdValue) params.set("projectId", projectIdValue);
        const query = params.toString();
        return query ? `${basePath}?${query}` : basePath;
      } catch {
        // fall through to synthetic results href
      }
    }

    const params = new URLSearchParams();
    if (prompt) params.set("prompt", prompt);
    if (agent) params.set("agent", agent);
    if (suite) params.set("suite", suite);
    if (route) params.set("route", route);
    if (source) params.set("source", source);
    if (projectIdValue) params.set("projectId", projectIdValue);

    const query = params.toString();
    return query ? `/synapse/results?${query}` : "/synapse/results";
  }, [next, prompt, agent, suite, route, source]);

  useEffect(() => {
    if (!complete || resolvedDestination !== "results" || creatingProject) return;
    setCreatingProject(true);
    const targetHref = buildResultsHref(existingProjectId ?? undefined);
    router.push(targetHref);
  }, [
    complete,
    creatingProject,
    resolvedDestination,
    existingProjectId,
    next,
    prompt,
    agent,
    suite,
    route,
    source,
    router,
    buildResultsHref,
  ]);

  const handleContinue = async () => {
    if (creatingProject) return;
    setCreatingProject(true);

    if (resolvedDestination === "results") {
      const targetHref = buildResultsHref(existingProjectId ?? undefined);
      router.push(targetHref);
      return;
    }

    if (isExistingWorkflow && existingProjectId) {
      router.push(`/projects/${existingProjectId}`);
      return;
    }

    const artifacts = createActionArtifacts({
      actionLabel,
      workflowType,
      contextName,
      owner,
    });

    await saveProjects([artifacts.project]);
    await saveWorkflowTemplates([artifacts.workflowTemplate]);
    await saveTasks(artifacts.tasks);
    await saveMetricPoints(artifacts.metrics);
    await saveAuditEvents(artifacts.auditEvents);

    router.push(`/projects/${artifacts.project.id}`);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Agent action in progress</p>
            <p className="text-xs text-slate-600">{actionLabel}</p>
            <p className="mt-1 text-[11px] text-slate-500">Context: {contextName} · Owner: {owner}</p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-150"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>{progressPct}% complete</span>
          <span>Auto-executing workflow steps…</span>
        </div>

        <div className="mt-5 space-y-2.5">
          {steps.map((step, idx) => {
            const isComplete = idx < effectiveActiveStepIndex;
            const isActive = idx === effectiveActiveStepIndex;
            return (
              <div
                key={step}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  isComplete
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : isActive
                    ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{idx + 1}. {step}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {isComplete ? "Done" : isActive ? "Running" : "Queued"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {complete ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="text-sm font-semibold text-emerald-900">Automated action completed</p>
            <p className="mt-1 text-xs text-emerald-700">
              {resolvedDestination === "results"
                ? "Agent execution finished. Open the insights page to review findings and save this as a workspace."
                : isExistingWorkflow
                ? "Workflow handoff complete. You can now open the in-progress project details."
                : "Agent execution finished. A project can now be generated automatically with workflow KPIs and engagement funnel metrics."}
            </p>
            <button
              onClick={handleContinue}
              disabled={creatingProject}
              className="mt-3 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {creatingProject
                ? resolvedDestination === "results"
                  ? "Opening insights…"
                  : isExistingWorkflow
                  ? "Opening workflow…"
                  : "Creating project…"
                : resolvedDestination === "results"
                  ? "Open Insights"
                  : "View Project Details"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SynapseLoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Preparing agent workflow…</p>
            <p className="mt-1 text-xs text-slate-600">Loading execution context.</p>
          </div>
        </div>
      }
    >
      <SynapseLoadingPageContent />
    </Suspense>
  );
}
