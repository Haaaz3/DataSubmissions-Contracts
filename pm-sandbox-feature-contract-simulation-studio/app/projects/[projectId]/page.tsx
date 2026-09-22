"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Tabs from "@/components/Tabs";
import ProgressBar from "@/components/ProgressBar";
import HealthBadge from "@/components/HealthBadge";
import AgentActivityTimeline from "@/components/AgentActivityTimeline";
import FeatureGuard from "@/components/FeatureGuard";
import TrackPageView from "@/components/telemetry/TrackPageView";
import { loadProject, loadTasks, loadWorkflowTemplates, loadMetricPoints, loadAuditEvents } from "@/lib/storage/synapseStore";
import { buildSharePackage } from "@/lib/projects/share";
import { saveAuditEvents } from "@/lib/storage/synapseStore";
import { evaluateProjectHealth, buildProjectAlerts } from "@/lib/metrics/health";
import { Project, Task, WorkflowTemplate, MetricPoint, AuditEvent } from "@/lib/models/project";
import { AgentActivityStep } from "@/lib/narrativeUx";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "patient-queue", label: "Patients" },
  { id: "workflow", label: "Workflow Details" },
  { id: "audit", label: "Audit Trail" },
];

type ScenarioStage = { key: string; label: string; helper: string };
type ScenarioDefinition = {
  id: string;
  title: string;
  subtitle: string;
  stages: ScenarioStage[];
  channelMixKeys?: { email: string; sms: string };
};

const scenarioDefinitions: ScenarioDefinition[] = [
  {
    id: "outreach",
    title: "Automated Outreach Performance",
    subtitle: "Live KPI rollup from outreach workflow execution.",
    stages: [
      { key: "funnel_sent", label: "Outreach sent", helper: "Total launched" },
      { key: "funnel_opened", label: "Opened", helper: "Message engagement" },
      { key: "funnel_clicked", label: "Clicked CTA", helper: "Intent signal" },
      { key: "funnel_scheduled", label: "Appointments", helper: "Booked visits" },
      { key: "funnel_closed", label: "Care gaps closed", helper: "Outcome conversion" },
    ],
    channelMixKeys: { email: "outreach_email_sent", sms: "outreach_sms_sent" },
  },
  {
    id: "previsit",
    title: "Pre-Visit Note Prep Performance",
    subtitle: "Measure visit-time execution and provider adoption of pre-visit guidance.",
    stages: [
      { key: "previsit_scheduled", label: "Patients scheduled", helper: "Visits in scope" },
      { key: "previsit_completed", label: "Appointments completed", helper: "Patients seen" },
      { key: "previsit_note_ack", label: "Provider note acknowledged", helper: "Provider acknowledgement" },
      { key: "previsit_test_completed", label: "Suggested tests completed", helper: "Orders completed" },
      { key: "previsit_closed", label: "Care gaps closed", helper: "Visit-linked closures" },
    ],
  },
  {
    id: "pharmacy",
    title: "Medication Optimization Performance",
    subtitle: "Track pharmacist intervention throughput to adherence closure outcomes.",
    stages: [
      { key: "pharmacy_queued", label: "Patients queued", helper: "Intervention candidates" },
      { key: "pharmacy_reviewed", label: "Pharmacy reviews completed", helper: "Clinical reviews" },
      { key: "pharmacy_accepted", label: "Provider accepted recommendations", helper: "Recommendation acceptance" },
      { key: "pharmacy_fill_completed", label: "Refills completed", helper: "Medication fulfillment" },
      { key: "pharmacy_closed", label: "Care gaps closed", helper: "Medication-linked closures" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation Workflow Performance",
    subtitle: "Track barrier-resolution effectiveness and downstream closure impact.",
    stages: [
      { key: "navigation_identified", label: "Members identified", helper: "Barrier cohort" },
      { key: "navigation_contacted", label: "Members contacted", helper: "Outreach completed" },
      { key: "navigation_barriers_resolved", label: "Barriers resolved", helper: "Access friction resolved" },
      { key: "navigation_appointments_completed", label: "Appointments completed", helper: "Follow-up completed" },
      { key: "navigation_closed", label: "Care gaps closed", helper: "Navigation-linked closures" },
    ],
  },
  {
    id: "caremgmt",
    title: "Care Management Program Performance",
    subtitle: "Monitor longitudinal enrollment and care-plan effectiveness.",
    stages: [
      { key: "caremgmt_eligible", label: "Members eligible", helper: "Program candidates" },
      { key: "caremgmt_enrolled", label: "Members enrolled", helper: "Enrollment completed" },
      { key: "caremgmt_touchpoints_completed", label: "Touchpoints completed", helper: "RN/Pharmacist activities" },
      { key: "caremgmt_careplans_activated", label: "Care plans activated", helper: "Plan adoption" },
      { key: "caremgmt_closed", label: "Care gaps closed", helper: "Longitudinal closures" },
    ],
  },
  {
    id: "manual",
    title: "Chart Review & Abstraction Performance",
    subtitle: "Track abstraction throughput and verified closure/documentation outcomes.",
    stages: [
      { key: "review_charts_queued", label: "Charts queued", helper: "Review candidates" },
      { key: "review_charts_reviewed", label: "Charts reviewed", helper: "Reviews completed" },
      { key: "review_records_retrieved", label: "External records retrieved", helper: "Evidence retrieval" },
      { key: "review_documentation_updated", label: "Documentation updated", helper: "Structured updates" },
      { key: "review_closed", label: "Care gaps closed", helper: "Validated closures" },
    ],
  },
  {
    id: "generic",
    title: "Workflow Performance",
    subtitle: "Scenario-specific KPI rollup from the automated workflow.",
    stages: [
      { key: "generic_scoped", label: "Members scoped", helper: "Initial denominator" },
      { key: "generic_engaged", label: "Members engaged", helper: "Engagement progression" },
      { key: "generic_actioned", label: "Actions completed", helper: "Action completion" },
      { key: "generic_closed", label: "Care gaps closed", helper: "Closure outcomes" },
    ],
  },
];

function resolveScenario(metricsByKey: Record<string, number>): ScenarioDefinition | null {
  const preferredOrder = ["caremgmt", "generic"];
  for (const id of preferredOrder) {
    const scenario = scenarioDefinitions.find((item) => item.id === id);
    if (!scenario) continue;
    if (scenario.stages.some((stage) => (metricsByKey[stage.key] ?? 0) > 0)) {
      return scenario;
    }
  }
  return null;
}

type DemoQueuePatient = {
  id: string;
  name: string;
  riskTier: "High" | "Medium";
  reason: string;
  lastAction: string;
  nextStep: string;
};

function ExecutiveMetric({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper: string;
  tone?: "neutral" | "success" | "warning" | "critical";
}) {
  const toneClasses: Record<"neutral" | "success" | "warning" | "critical", string> = {
    neutral: "border-slate-200 text-slate-900",
    success: "border-emerald-200 text-emerald-700",
    warning: "border-amber-200 text-amber-700",
    critical: "border-rose-200 text-rose-700",
  };

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function CompactKpi({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClasses: Record<"neutral" | "success" | "warning", string> = {
    neutral: "border-slate-200 bg-white text-slate-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${toneClasses[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
      <p className="text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}

function GoalAnswerCard({
  question,
  answer,
  context,
}: {
  question: string;
  answer: string;
  context: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">{question}</p>
      <p className="mt-2 text-base font-semibold text-slate-900">{answer}</p>
      <p className="mt-1 text-xs text-slate-600">{context}</p>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [projectResolved, setProjectResolved] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadProject(params.projectId).then((proj) => {
      setProject(proj ?? null);
      setProjectResolved(true);
    });
    loadTasks(params.projectId).then(setTasks);
    loadWorkflowTemplates(params.projectId).then(setWorkflows);
    loadMetricPoints(params.projectId).then(setMetrics);
    loadAuditEvents(params.projectId).then(setAudit);
  }, [params.projectId]);

  if (!projectResolved) {
    return <div className="py-20 text-center text-slate-500">Loading project...</div>;
  }

  if (!project) {
    return (
      <FeatureGuard page="projects">
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-slate-500">Project not found.</p>
          <Link href="/projects" className="text-sm font-medium text-indigo-600 hover:underline">
            ← Back to Projects
          </Link>
        </div>
      </FeatureGuard>
    );
  }

  const mockWorkflowDetails: WorkflowTemplate[] = [
    {
      id: "wf-cm-enrollment",
      projectId: project.id,
      type: "diabetes_control",
      title: "Care Management Enrollment Orchestration",
      description: "Automated enrollment workflow for high-risk members with RN and pharmacist routing.",
      ownerRole: "Population Health Operations",
      SLAs: [
        { name: "Initial outreach", hours: 24 },
        { name: "Care plan activation", days: 7 },
      ],
      evidenceRequired: ["Risk score", "Enrollment confirmation", "Care-plan activation"],
      metricsLinked: ["caremgmt_enrolled", "caremgmt_closed", "projected_financial_impact"],
      status: "active",
    },
    {
      id: "wf-followup-monitoring",
      projectId: project.id,
      type: "diabetes_control",
      title: "Care Plan Activation & Outcomes Monitoring",
      description: "Tracks care-plan activation, touchpoint completion, and care-management-attributed outcomes.",
      ownerRole: "Quality Analytics Lead",
      SLAs: [{ name: "Weekly outcome refresh", days: 7 }],
      evidenceRequired: ["Touchpoint logs", "Closure evidence", "Financial impact rollup"],
      metricsLinked: ["caremgmt_touchpoints_completed", "caremgmt_closed"],
      status: "active",
    },
  ];

  const mockTasks: Task[] = [
    {
      id: "task-1",
      projectId: project.id,
      workflowTemplateId: "wf-cm-enrollment",
      title: "Finalize high-risk cohort prioritization",
      assignedRole: "Quality Analyst",
      dueDate: "2026-03-17",
      status: "done",
      createdAt: "2026-03-15T08:00:00.000Z",
      updatedAt: "2026-03-16T10:00:00.000Z",
    },
    {
      id: "task-2",
      projectId: project.id,
      workflowTemplateId: "wf-cm-enrollment",
      title: "Auto-enroll members into RN/pharmacist pathways",
      assignedRole: "Population Health Operations",
      dueDate: "2026-03-17",
      status: "done",
      createdAt: "2026-03-15T09:00:00.000Z",
      updatedAt: "2026-03-16T11:00:00.000Z",
    },
    {
      id: "task-3",
      projectId: project.id,
      workflowTemplateId: "wf-followup-monitoring",
      title: "Complete first-touch care management outreach",
      assignedRole: "Care Management Lead",
      dueDate: "2026-03-19",
      status: "in_progress",
      createdAt: "2026-03-16T08:00:00.000Z",
      updatedAt: "2026-03-18T09:15:00.000Z",
    },
    {
      id: "task-4",
      projectId: project.id,
      workflowTemplateId: "wf-followup-monitoring",
      title: "Publish weekly enrollment and care-plan activation summary",
      assignedRole: "Quality Analytics Lead",
      dueDate: "2026-03-21",
      status: "todo",
      createdAt: "2026-03-16T10:30:00.000Z",
      updatedAt: "2026-03-18T09:15:00.000Z",
    },
  ];

  const primaryMockValue =
    project.charter.primaryKPI.direction === "down"
      ? Math.max(0, Math.round(project.charter.primaryKPI.baseline * 0.9))
      : Math.round(project.charter.primaryKPI.baseline + Math.max(8, project.charter.primaryKPI.target * 0.12));

  const mockMetrics: MetricPoint[] = [
    {
      id: "metric-primary",
      projectId: project.id,
      metricKey: project.charter.primaryKPI.key,
      date: "2026-03-18",
      value: primaryMockValue,
      confidence: 0.92,
      freshness: "daily",
    },
    ...project.charter.leadingIndicators.slice(0, 2).map((kpi, idx) => ({
      id: `metric-leading-${idx}`,
      projectId: project.id,
      metricKey: kpi.key,
      date: "2026-03-18",
      value: Math.round(kpi.baseline + (kpi.target - kpi.baseline) * 0.62),
      confidence: 0.9,
      freshness: "daily" as const,
    })),
    {
      id: "metric-cm-enrolled",
      projectId: project.id,
      metricKey: "caremgmt_enrolled",
      date: "2026-03-18",
      value: 740,
      confidence: 0.93,
      freshness: "daily",
    },
    {
      id: "metric-cm-closed",
      projectId: project.id,
      metricKey: "caremgmt_closed",
      date: "2026-03-18",
      value: 312,
      confidence: 0.91,
      freshness: "daily",
    },
    {
      id: "metric-cm-touchpoints",
      projectId: project.id,
      metricKey: "caremgmt_touchpoints_completed",
      date: "2026-03-18",
      value: 564,
      confidence: 0.94,
      freshness: "daily",
    },
    {
      id: "metric-fin-impact",
      projectId: project.id,
      metricKey: "projected_financial_impact",
      date: "2026-03-18",
      value: 468000,
      confidence: 0.9,
      freshness: "weekly",
    },
  ];

  const mockAuditEvents: AuditEvent[] = [
    {
      id: "audit-1",
      entityType: "Project",
      entityId: project.id,
      eventType: "ProjectCreated",
      timestamp: "2026-03-15T09:00:00.000Z",
      actor: "Quality Care Gap Agent",
      details: "Project created from autonomous care management enrollment trigger.",
    },
    {
      id: "audit-2",
      entityType: "Workflow",
      entityId: "wf-cm-enrollment",
      eventType: "WorkflowActivated",
      timestamp: "2026-03-15T10:15:00.000Z",
      actor: "SynapseAI Agent",
      details: "Enrollment workflow activated and ownership assigned to Population Health Operations.",
    },
    {
      id: "audit-3",
      entityType: "Cohort",
      entityId: project.cohortSnapshot.cohortId,
      eventType: "CohortFrozen",
      timestamp: "2026-03-15T10:40:00.000Z",
      actor: "SynapseAI Agent",
      details: "Cohort definition frozen for reproducible execution and outcome tracking.",
    },
    {
      id: "audit-4",
      entityType: "Task",
      entityId: "task-2",
      eventType: "TaskCompleted",
      timestamp: "2026-03-16T11:00:00.000Z",
      actor: "Population Health Operations",
      details: "Automated enrollment completed for prioritized high-risk members.",
    },
    {
      id: "audit-5",
      entityType: "Metric",
      entityId: "metric-fin-impact",
      eventType: "MetricPublished",
      timestamp: "2026-03-18T08:00:00.000Z",
      actor: "Quality Analytics Lead",
      details: "Projected financial impact updated based on current closure trajectory.",
    },
    {
      id: "audit-6",
      entityType: "Project",
      entityId: project.id,
      eventType: "CheckpointScheduled",
      timestamp: "2026-03-18T09:10:00.000Z",
      actor: "Quality Executive Lead",
      details: "Weekly checkpoint scheduled to review enrollment progress, care-plan activation, and outcomes.",
    },
  ];

  const shouldUseMockData = true;

  const effectiveTasks = shouldUseMockData ? mockTasks : tasks;
  const effectiveWorkflows = shouldUseMockData ? mockWorkflowDetails : workflows;
  const effectiveMetrics = shouldUseMockData ? mockMetrics : metrics;
  const effectiveAudit = shouldUseMockData ? mockAuditEvents : audit;

  const health = evaluateProjectHealth(project, effectiveMetrics, effectiveTasks);
  const alerts = buildProjectAlerts(project, effectiveMetrics, effectiveTasks);
  const completedTasks = effectiveTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = effectiveTasks.filter((t) => t.status === "in_progress").length;
  const blockedTasks = effectiveTasks.filter((t) => t.status === "blocked").length;
  const todoTasks = effectiveTasks.filter((t) => t.status === "todo").length;

  const metricValue = (key: string) => effectiveMetrics.find((m) => m.metricKey === key)?.value ?? 0;
  const metricByKey = effectiveMetrics.reduce<Record<string, number>>((acc, metric) => {
    acc[metric.metricKey] = metric.value;
    return acc;
  }, {});
  const scenario = resolveScenario(metricByKey);
  const scenarioStages = scenario?.stages.map((stage) => ({
    ...stage,
    value: metricByKey[stage.key] ?? 0,
  })) ?? [];
  const hasScenario = Boolean(scenario && scenarioStages.some((stage) => stage.value > 0));
  const channelMix = scenario?.channelMixKeys
    ? {
        email: metricValue(scenario.channelMixKeys.email),
        sms: metricValue(scenario.channelMixKeys.sms),
      }
    : null;
  const sourceAction = "Automated Care Management Enrollment";
  const sourceDriver = "High-risk members with unresolved chronic and utilization risk";
  const sourceRationale =
    "This project automatically enrolls eligible high-risk patients into a care management program with RN and pharmacist support.";
  const targetedMembers = project.cohortSnapshot.sizeAtStart;
  const projectedClosures = metricValue("caremgmt_closed") || metricValue("funnel_closed") || metricValue("generic_closed") || metricValue("previsit_closed") || metricValue("pharmacy_closed") || metricValue("navigation_closed") || metricValue("review_closed");
  const enrolledMembers = metricValue("caremgmt_enrolled") || Math.round(targetedMembers * 0.4);
  const projectedFinancialImpact = metricValue("projected_financial_impact") || 468000;
  const enrolledRate = Math.round((enrolledMembers / Math.max(1, targetedMembers)) * 100);
  const completionPct = effectiveTasks.length ? Math.round((completedTasks / effectiveTasks.length) * 100) : 0;
  const stageLabel =
    blockedTasks > 0
      ? "Blocked — intervention required"
      : inProgressTasks > 0
      ? "Execution in progress"
      : todoTasks > 0
      ? "Queued to start"
      : "Monitoring / completed";
  const impactWindow = `${project.charter.timeframe.startDate} → ${project.charter.timeframe.endDate}`;
  const nextReviewDate = project.checkpoints?.nextReviewDate ?? "No checkpoint scheduled";

  const statusTone =
    health.status === "On Track"
      ? "success"
      : health.status === "At Risk"
      ? "warning"
      : "critical";

  const agentReasoningSteps: AgentActivityStep[] = [
    {
      label: "Identified members eligible for care management enrollment",
      detail: "Agent evaluated risk, utilization patterns, and open care gaps to identify enrollment candidates.",
      status: "complete",
    },
    {
      label: "Built and froze the enrollment cohort",
      detail: `${targetedMembers.toLocaleString()} eligible members were frozen into cohort ${project.cohortSnapshot.cohortId} for reproducible execution.`,
      status: "complete",
    },
    {
      label: "Validated care management capacity",
      detail: "Confirmed staffing and operational capacity before initiating automatic enrollment.",
      status: blockedTasks > 0 ? "running" : "complete",
    },
    {
      label: "Auto-enrolled patients into care management pathways",
      detail: `Enrollment workflow is active with KPI tracking for ${project.charter.primaryKPI.displayName}.`,
      status: inProgressTasks > 0 ? "running" : "complete",
    },
    {
      label: "Monitoring enrollment progression and outcomes",
      detail:
        alerts[0]?.detail ??
        `No critical alerts detected. Next enrollment checkpoint is ${nextReviewDate}.`,
      status: blockedTasks > 0 ? "running" : "queued",
    },
  ];

  const patientQueue: DemoQueuePatient[] = [
    {
      id: "pp-00001",
      name: "Leah Jacobs",
      riskTier: "High",
      reason: "Repeat low-acuity ED utilization + diabetes risk escalation",
      lastAction: "Auto-enrolled and assigned RN + pharmacist pathway",
      nextStep: "Complete 48-hour outreach and first medication review",
    },
    {
      id: "pp-00002",
      name: "Marisol Vega",
      riskTier: "High",
      reason: "Recent acute event + unresolved chronic care plan gaps",
      lastAction: "Enrolled and assigned transitional care management pathway",
      nextStep: "Complete RN follow-up and activate individualized care plan",
    },
    {
      id: "pp-00003",
      name: "Noah Patel",
      riskTier: "Medium",
      reason: "Medication adherence decline requiring longitudinal support",
      lastAction: "Enrolled into pharmacist-supported care management track",
      nextStep: "Complete adherence coaching and care-plan milestone check",
    },
  ];

  const buildPatientHref = (patientId: string) => {
    const params = new URLSearchParams({
      source: "project-workflow",
      sourceAgentLabel: project.savedViewSnapshot.agentDisplayName,
      initiative: "care-management-auto-enrollment",
      projectId: project.id,
      projectName: project.name,
      workflowTitle: sourceAction,
    });
    return `/population/member/${patientId}?${params.toString()}`;
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const pkg = buildSharePackage(project, effectiveWorkflows, effectiveTasks, effectiveMetrics, effectiveAudit);
      const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.id}-share.json`;
      link.click();
      await saveAuditEvents([
        {
          id: `${project.id}-share-${Date.now()}`,
          entityType: "Project",
          entityId: project.id,
          eventType: "ProjectShared",
          timestamp: new Date().toISOString(),
          actor: "Demo User",
          details: "Share package exported.",
        },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <FeatureGuard page="projects">
      <TrackPageView page={`/projects/${params.projectId}`} module="projects" properties={{ projectId: params.projectId }} />
      <div className="space-y-10">
        <div className="flex items-center justify-between gap-3">
          <Link href="/projects" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
            ← Back to Projects
          </Link>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isExporting ? "Exporting…" : "Export snapshot"}
          </button>
        </div>

        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-white p-7 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <HealthBadge status={health.status} />
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                {project.goalType.replace("_", " ")}
              </span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                {stageLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500">Created {project.createdAt.slice(0, 10)} · Updated {project.updatedAt.slice(0, 10)}</p>
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">{project.name}</h1>
          <p className="mt-2 max-w-4xl text-sm text-slate-700">
            {sourceRationale} The goal is to accelerate enrollment conversion, activate care plans quickly, and improve downstream outcomes.
          </p>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">What this is</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{sourceAction}</p>
            <p className="mt-1 text-xs text-slate-600">
              Owned by {project.charter.owners.opsOwner ?? "Operations"}. Triggered by {sourceDriver.toLowerCase()} and routed into RN/pharmacist care management pathways.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Why this is auto-running</p>
              <p className="mt-1 text-xs text-slate-700">Quality Performance Agent prioritized this intervention based on impact and closure potential.</p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">Resource + governance checks</p>
              <p className="mt-1 text-xs text-slate-700">Resources Agent validated operational capacity and governance constraints before auto-launch.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Projected impact</p>
              <p className="mt-1 text-xs text-slate-700">Estimated {projectedClosures.toLocaleString()} closures and ${projectedFinancialImpact.toLocaleString()} financial impact in this window.</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <CompactKpi
              label="Current status"
              value={health.status}
              helper={`${completionPct}% task completion · ${blockedTasks} blocked`}
              tone={health.status === "On Track" ? "success" : "warning"}
            />
            <CompactKpi
              label="Projected closures"
              value={projectedClosures.toLocaleString()}
              helper={`${enrolledRate}% enrollment conversion · care-management-attributed`}
              tone="success"
            />
            <CompactKpi
              label="Expected impact"
              value={`$${projectedFinancialImpact.toLocaleString()}`}
              helper="Forecasted value protected/realized"
              tone={statusTone === "critical" ? "warning" : "success"}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="#agent-decision-trail" className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">
              See agent reasoning
            </Link>
          </div>
        </div>

      <Tabs tabs={tabs} defaultTab="overview">
        {(activeTab) => (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <GoalAnswerCard
                    question="1) What is this project and why was it created?"
                    answer={sourceAction}
                    context={`Created to automatically enroll high-risk eligible patients into care management. Cohort size: ${targetedMembers.toLocaleString()} members. Impact window: ${impactWindow}.`}
                  />
                  <GoalAnswerCard
                    question="2) What has the agent done automatically and why?"
                    answer={`${completedTasks} enrollment actions completed automatically`}
                    context={`${project.savedViewSnapshot.agentDisplayName} identified eligible members, validated capacity, auto-enrolled patients, and activated care management outreach and monitoring.`}
                  />
                  <GoalAnswerCard
                    question="3) What is the current status?"
                    answer={`${health.status} · ${stageLabel}`}
                    context={`${inProgressTasks} enrollment workflows in progress, ${todoTasks} queued, ${blockedTasks} blocked. Next review: ${nextReviewDate}.`}
                  />
                  <GoalAnswerCard
                    question="4) What is the overall impact?"
                    answer={`$${projectedFinancialImpact.toLocaleString()} projected`}
                    context={`${projectedClosures.toLocaleString()} projected care-management-attributed closures and ${enrolledRate}% enrollment conversion from targeted members.`}
                  />
                </div>

                <div id="agent-decision-trail">
                  <AgentActivityTimeline
                    title="Agent decision trail"
                    subtitle="Transparent summary of what the agent did, why it did it, and what changed in execution state."
                    steps={agentReasoningSteps}
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900">Priority patient preview</h3>
                  <p className="mt-1 text-xs text-slate-600">Immediate members with next actions generated by the workflow.</p>
                  <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead>
                        <tr className="bg-slate-50">
                          {["Patient", "Risk", "Why selected", "Next step"].map((header) => (
                            <th key={header} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {patientQueue.slice(0, 3).map((patient) => (
                          <tr key={patient.id} className="hover:bg-slate-50/70">
                            <td className="px-3 py-2 text-xs font-semibold text-slate-900">
                              <Link href={buildPatientHref(patient.id)} className="text-indigo-700 hover:underline">
                                {patient.name}
                              </Link>
                            </td>
                            <td className="px-3 py-2 text-xs text-slate-600">{patient.riskTier}</td>
                            <td className="px-3 py-2 text-xs text-slate-600">{patient.reason}</td>
                            <td className="px-3 py-2 text-xs text-slate-600">{patient.nextStep}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">Current project status</h3>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                        health.status === "On Track"
                          ? "bg-emerald-100 text-emerald-700"
                          : health.status === "At Risk"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                        {health.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs text-slate-500">Task completion</p>
                        <ProgressBar value={completionPct} tone={health.status === "Off Track" ? "danger" : "success"} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Execution score</p>
                        <ProgressBar value={Math.round(health.executionScore * 100)} tone={health.status === "On Track" ? "success" : "warning"} />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">Done</p>
                        <p className="text-lg font-bold text-slate-900">{completedTasks}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">In progress</p>
                        <p className="text-lg font-bold text-indigo-700">{inProgressTasks}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">Queued</p>
                        <p className="text-lg font-bold text-slate-900">{todoTasks}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">Blocked</p>
                        <p className="text-lg font-bold text-rose-700">{blockedTasks}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-900">Escalations & risks</h3>
                    <div className="mt-3 space-y-2">
                      {alerts.length ? (
                        alerts.map((alert) => (
                          <div key={alert.title} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-xs font-semibold text-amber-800">{alert.title}</p>
                            <p className="mt-1 text-xs text-amber-700">{alert.detail}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                          No active escalation required right now.
                        </div>
                      )}
                    </div>
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Next checkpoint</p>
                      <p className="text-sm font-semibold text-slate-900">{nextReviewDate}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">Care management impact outlook</h3>
                    <p className="text-xs text-slate-600">Window: {impactWindow}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <ExecutiveMetric
                      label="Targeted population"
                      value={targetedMembers.toLocaleString()}
                      helper="Initial denominator"
                    />
                    <ExecutiveMetric
                      label="Enrolled members"
                      value={enrolledMembers.toLocaleString()}
                      helper={`${enrolledRate}% conversion`}
                    />
                    <ExecutiveMetric
                      label="Projected closures"
                      value={projectedClosures.toLocaleString()}
                      helper="Expected care-management-attributed outcomes"
                      tone="success"
                    />
                    <ExecutiveMetric
                      label="Projected financial impact"
                      value={`$${projectedFinancialImpact.toLocaleString()}`}
                      helper="Estimated total upside/protection"
                      tone="success"
                    />
                  </div>

                  {hasScenario && scenario ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{scenario.title}</p>
                        {channelMix ? (
                          <p className="text-xs text-slate-500">
                            Email {channelMix.email.toLocaleString()} · SMS/Text {channelMix.sms.toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{scenario.subtitle}</p>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5">
                        {scenarioStages.map((stage, idx) => (
                          <div key={stage.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{idx + 1}. {stage.label}</p>
                            <p className="mt-1 text-lg font-bold text-slate-900">{stage.value.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">
                              {idx === 0
                                ? "Baseline"
                                : `${scenarioStages[idx - 1].value ? Math.round((stage.value / scenarioStages[idx - 1].value) * 100) : 0}% from prior`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                      Scenario progression metrics are not yet available. Impact model currently uses project KPI forecasts.
                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === "patient-queue" ? (
              <div id="patient-review-queue" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Patient review queue</h3>
                <p className="mt-1 text-xs text-slate-600">Members currently being worked by this workflow with evidence-backed next steps.</p>
                <div className="mt-3 overflow-x-auto rounded-xl border border-emerald-100 bg-white">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead>
                      <tr className="bg-slate-50">
                        {[
                          "Patient",
                          "Risk",
                          "Why selected",
                          "Last action",
                          "Next step",
                          "",
                        ].map((header) => (
                          <th key={header} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {patientQueue.map((patient, idx) => (
                        <tr key={patient.id}>
                          <td className="px-3 py-2 text-xs font-semibold text-slate-900">#{idx + 1} {patient.name} ({patient.id})</td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${patient.riskTier === "High" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                              {patient.riskTier}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">{patient.reason}</td>
                          <td className="px-3 py-2 text-xs text-slate-600">{patient.lastAction}</td>
                          <td className="px-3 py-2 text-xs text-slate-600">{patient.nextStep}</td>
                          <td className="px-3 py-2 text-right">
                            <Link href={buildPatientHref(patient.id)} className="text-xs font-semibold text-indigo-700 hover:underline">
                              Open patient →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeTab === "workflow" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
                  <h3 className="text-sm font-semibold text-slate-900">Workflow summary</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Primary workflow: {sourceAction} · Owner: {project.charter.owners.opsOwner ?? "Operations"} · KPI: {project.charter.primaryKPI.displayName}
                  </p>
                </div>
                {(["todo", "in_progress", "blocked", "done"] as const).map((status) => (
                  <div key={status} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 capitalize">{status.replace("_", " ")}</h3>
                    <div className="mt-3 space-y-3">
                      {effectiveTasks.filter((t) => t.status === status).map((task) => (
                        <div key={task.id} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                          <p className="font-semibold text-slate-700">{task.title}</p>
                          <p className="text-[10px] text-slate-400">{task.assignedRole} · due {task.dueDate}</p>
                          {task.reasonCode && <p className="text-[10px] text-amber-500">{task.reasonCode}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "audit" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900">Care Management Enrollment Audit Log</h3>
                <div className="mt-4 space-y-3">
                  {effectiveAudit.map((event) => (
                    <div key={event.id} className="rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700">{event.eventType}</p>
                      <p>{event.details}</p>
                      <p className="text-[10px] text-slate-400">{event.timestamp} · {event.actor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Tabs>
      </div>
    </FeatureGuard>
  );
}