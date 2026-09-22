"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SummaryCard from "@/components/SummaryCard";
import HealthBadge from "@/components/HealthBadge";
import ProgressBar from "@/components/ProgressBar";
import Sparkline from "@/components/charts/Sparkline";
import FeatureGuard from "@/components/FeatureGuard";
import TrackPageView from "@/components/telemetry/TrackPageView";
import { loadDemoProjects } from "@/lib/storage/demoLoader";
import { loadMetricPoints, loadProjects, loadTasks, makeId, saveProjects } from "@/lib/storage/synapseStore";
import { evaluateProjectHealth } from "@/lib/metrics/health";
import type { ProjectHealth } from "@/lib/metrics/health";
import { ExecutionModeSchema, MetricPoint, Project } from "@/lib/models/project";
import type { GoalType } from "@/lib/models/cohort";

function inferGoalTypeFromText(input: string): GoalType {
  const value = input.toLowerCase();
  if (value.includes("ed") || value.includes("emergency")) return "ed_utilization";
  if (value.includes("readmission") || value.includes("hospital")) return "readmissions";
  if (value.includes("screen") || value.includes("cancer")) return "cancer_screening";
  return "diabetes";
}

function parseGoalType(value: string | null | undefined): GoalType | null {
  if (value === "ed_utilization" || value === "readmissions" || value === "cancer_screening" || value === "diabetes") {
    return value;
  }
  return null;
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsPageFallback />}>
      <ProjectsPageContent />
    </Suspense>
  );
}

function ProjectsPageFallback() {
  return (
    <FeatureGuard page="projects">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SynapseAI Projects</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Loading project workspace…
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </FeatureGuard>
  );
}

function ProjectsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projectTypeFilter, setProjectTypeFilter] = useState<"all" | "standard" | "autonomous">("all");
  const [autonomousStatusFilter, setAutonomousStatusFilter] = useState<"all" | "executed" | "monitoring" | "needs_review" | "escalated" | "completed">("all");

  const intent = searchParams.get("intent");
  const createIntent = intent === "create-quality-project" || intent === "create-cohort-project";
  const isQualityIntent = intent === "create-quality-project";

  const measureName = searchParams.get("measureName") ?? "Quality Opportunity";
  const actionLabel = searchParams.get("actionLabel") ?? "Execute next best action";
  const rationale = searchParams.get("rationale") ?? "";
  const suggestedPrompt = searchParams.get("suggestedPrompt") ?? "";
  const measureId = searchParams.get("measureId") ?? "quality-opportunity";
  const currentPerformance = Number(searchParams.get("currentPerformance") ?? 0);
  const targetPerformance = Number(searchParams.get("targetPerformance") ?? 0);
  const patientsLeftToTarget = Number(searchParams.get("patientsLeftToTarget") ?? 0);
  const estimatedFinancialImpact = Number(searchParams.get("estimatedFinancialImpact") ?? 0);
  const gapMagnitude = Number(searchParams.get("gapMagnitude") ?? 0);

  const cohortId = searchParams.get("cohortId") ?? "cohort-insight";
  const cohortName = searchParams.get("cohortName") ?? "Actionable Cohort";
  const cohortDescription = searchParams.get("cohortDescription") ?? "";
  const cohortPatientCount = Number(searchParams.get("patientCount") ?? 0);
  const cohortRecommendedAction = searchParams.get("recommendedAction") ?? "Execute recommended cohort workflow";
  const cohortPrimaryOwner = searchParams.get("primaryOwner") ?? "Population Health Operations";
  const cohortWorkflowSystem = searchParams.get("workflowSystem") ?? "Synapse workflow";
  const cohortEstimatedImpact = searchParams.get("estimatedImpact") ?? "Expected impact available in insight";
  const cohortEstimatedImpactValue = Number(searchParams.get("estimatedImpactValue") ?? 0);
  const promptFromSource = searchParams.get("prompt") ?? "";

  const displayTitle = isQualityIntent ? measureName : cohortName;
  const displayAction = isQualityIntent ? actionLabel : cohortRecommendedAction;
  const displayRationale = isQualityIntent ? rationale : cohortDescription;

  const [projectName, setProjectName] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("diabetes");

  useEffect(() => {
    loadProjects().then((stored) => {
      if (stored.length) {
        setProjects(stored);
        setLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!createIntent) return;
    setProjectName(`${displayTitle} – ${displayAction}`);
    setGoalType(
      parseGoalType(searchParams.get("goalType")) ??
        inferGoalTypeFromText(`${displayTitle} ${displayAction}`)
    );
  }, [createIntent, displayTitle, displayAction, searchParams]);

  const handleLoadDemo = async () => {
    await loadDemoProjects();
    const stored = await loadProjects();
    setProjects(stored);
    setLoaded(true);
  };

  const totalActive = projects.filter((p) => p.status === "active").length;
  const totalCohorts = new Set(projects.map((p) => p.cohortSnapshot.cohortId)).size;
  const [filterGoal, setFilterGoal] = useState("all");
  const showAutonomousStatusFilter = projectTypeFilter !== "standard";

  const filteredProjects = projects
    .filter((p) => (filterGoal === "all" ? true : p.goalType === filterGoal))
    .filter((p) => (projectTypeFilter === "all" ? true : (p.projectType ?? "standard") === projectTypeFilter))
    .filter((p) =>
      !showAutonomousStatusFilter || autonomousStatusFilter === "all"
        ? true
        : (p.autonomousStatus ?? "monitoring") === autonomousStatusFilter
    );

  const activeFilterChips = [
    filterGoal !== "all" ? { key: "goal", label: `Goal: ${filterGoal.replace("_", " ")}` } : null,
    projectTypeFilter !== "all" ? { key: "type", label: `Type: ${projectTypeFilter}` } : null,
    showAutonomousStatusFilter && autonomousStatusFilter !== "all"
      ? { key: "status", label: `Status: ${autonomousStatusFilter.replace("_", " ")}` }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  const handleCreateProject = async () => {
    if (!createIntent || !projectName.trim()) return;
    setCreating(true);
    const nowIso = new Date().toISOString();
    const today = nowIso.slice(0, 10);
    const endDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10);

    const baselineCount = isQualityIntent ? patientsLeftToTarget : cohortPatientCount;
    const impactValue = isQualityIntent ? estimatedFinancialImpact : cohortEstimatedImpactValue || cohortPatientCount;

    const project: Project = {
      id: makeId("project"),
      name: projectName.trim(),
      goalType,
      status: "draft",
      cohortSnapshot: {
        cohortId: isQualityIntent ? `quality-${measureId}` : cohortId,
        cohortVersionHash: isQualityIntent ? "v1-quality-opportunity" : "v1-cohort-insight",
        sizeAtStart: Math.max(1, baselineCount || 50),
        definitionFrozen: true,
        frozenAt: today,
      },
      savedViewSnapshot: {
        synapseRunId: makeId("synapse-run"),
        agentId: "quality_care_gap",
        agentDisplayName: "Quality Care Gap Agent",
        savedAt: today,
        summaryMarkdown: isQualityIntent
          ? `Selected quality opportunity: **${measureName}**\n\nNext best action: **${actionLabel}**\n\nRationale: ${rationale || "Not provided"}\n\nPrompt context: ${suggestedPrompt || "N/A"}`
          : `Selected actionable cohort: **${cohortName}**\n\nRecommended action: **${cohortRecommendedAction}**\n\nDescription: ${cohortDescription || "Not provided"}\n\nPrompt context: ${promptFromSource || "N/A"}`,
        drivers: [
          isQualityIntent
            ? { label: "Gap magnitude", value: `+${gapMagnitude}%`, evidenceRefIds: ["quality-gap"] }
            : { label: "Cohort size", value: cohortPatientCount.toLocaleString(), evidenceRefIds: ["cohort-size"] },
          isQualityIntent
            ? { label: "Members to target", value: patientsLeftToTarget.toLocaleString(), evidenceRefIds: ["members-target"] }
            : { label: "Expected impact", value: cohortEstimatedImpact, evidenceRefIds: ["cohort-impact"] },
        ],
        segments: [
          {
            name: isQualityIntent ? "Members missing closure" : cohortName,
            size: Math.max(1, baselineCount || 1),
            rationale: isQualityIntent
              ? "Population requiring next best action execution"
              : (cohortDescription || "Actionable cohort identified by insight engine"),
            evidenceRefIds: [isQualityIntent ? "members-target" : "cohort-size"],
          },
        ],
        workflows: [
          {
            title: displayAction,
            ownerRole: isQualityIntent ? "Quality Operations" : cohortPrimaryOwner,
            slas: ["Launch within 14 days", "Weekly checkpoint"],
            metrics: ["quality_closure_rate", "members_closed"],
          },
        ],
        telemetry: [
          {
            metricKey: isQualityIntent ? "quality_closure_rate" : "cohort_action_completion_rate",
            displayName: isQualityIntent ? `${measureName} Closure Rate` : `${cohortName} Action Completion`,
            cadence: "weekly",
            freshness: "weekly",
            limitations: ["Synthetic demo telemetry"],
          },
        ],
        citations: [
          isQualityIntent
            ? { id: "quality-gap", label: "Current vs target", excerpt: `${currentPerformance}% current vs ${targetPerformance}% target.` }
            : { id: "cohort-size", label: "Actionable cohort", excerpt: `${cohortPatientCount.toLocaleString()} members in selected cohort.` },
          isQualityIntent
            ? { id: "members-target", label: "Population in gap", excerpt: `${patientsLeftToTarget.toLocaleString()} members left to target.` }
            : { id: "cohort-impact", label: "Expected impact", excerpt: cohortEstimatedImpact },
        ],
      },
      sharing: {
        visibility: "private",
        shares: [],
      },
      charter: {
        goalStatement: isQualityIntent
          ? `Improve ${measureName.toLowerCase()} by executing ${actionLabel.toLowerCase()}.`
          : `Execute ${cohortRecommendedAction.toLowerCase()} for ${cohortName.toLowerCase()}.`,
        primaryKPI: {
          key: isQualityIntent ? `quality_${measureId}_rate` : `cohort_${cohortId}_action_completion`,
          displayName: isQualityIntent ? `${measureName} Rate` : `${cohortName} Action Completion`,
          baseline: isQualityIntent ? currentPerformance || 0 : 0,
          target: isQualityIntent ? targetPerformance || Math.max((currentPerformance || 0) + 5, 70) : 100,
          direction: "up",
        },
        secondaryKPIs: [
          {
            key: isQualityIntent ? "members_left_to_target" : "cohort_expected_impact",
            displayName: isQualityIntent ? "Members Left to Target" : "Expected Cohort Impact",
            baseline: Math.max(0, baselineCount || 0),
            target: isQualityIntent
              ? Math.max(0, Math.round((patientsLeftToTarget || 0) * 0.65))
              : Math.max(0, Math.round((baselineCount || 0) * 1.15)),
            direction: isQualityIntent ? "down" : "up",
          },
        ],
        timeframe: {
          startDate: today,
          endDate,
        },
        owners: {
          executiveSponsor: "Quality Executive Lead",
          clinicalOwner: isQualityIntent ? "Clinical Quality Owner" : cohortPrimaryOwner,
          opsOwner: isQualityIntent ? "Population Ops Manager" : cohortWorkflowSystem,
          analyticsOwner: "Quality Analytics Lead",
        },
        leadingIndicators: [
          {
            key: "action_launch_rate",
            displayName: "Action Launch Rate",
            baseline: 0,
            target: 100,
            direction: "up",
          },
          {
            key: isQualityIntent ? "estimated_financial_impact" : "cohort_expected_impact",
            displayName: isQualityIntent ? "Estimated Financial Impact" : "Expected Cohort Impact",
            baseline: Math.max(0, Math.round(impactValue * 0.6)),
            target: Math.max(0, impactValue),
            direction: "up",
          },
        ],
        assumptions: [
          displayRationale || "Selected insight rationale for this project.",
          isQualityIntent
            ? suggestedPrompt || "Prompt context handed off from quality opportunity selection."
            : promptFromSource || "Prompt context handed off from cohort insight selection.",
        ],
      },
      projectType: "standard",
      executionMode: ExecutionModeSchema.enum.manual,
      tags: ["Manual", isQualityIntent ? "Quality" : "Cohort"],
      createdFromAgentRunId: undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await saveProjects([project]);
    const stored = await loadProjects();
    setProjects(stored);
    setLoaded(true);
    setCreating(false);
    router.replace("/projects");
  };

  return (
    <FeatureGuard page="projects">
      <TrackPageView page="/projects" module="projects" />
      <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SynapseAI Projects</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Track execution, leading indicators, and outcomes for synthetic cohort initiatives.
          </p>
        </div>
        <button
          onClick={handleLoadDemo}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {loaded ? "Reload demo projects" : "Load demo projects"}
        </button>
      </div>

      {createIntent && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Create a new project</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{displayTitle}</h2>
              <p className="mt-1 text-sm text-slate-600">Next best action: {displayAction}</p>
              <p className="mt-1 text-xs text-slate-600">
                {isQualityIntent
                  ? `${patientsLeftToTarget.toLocaleString()} members to target · $${estimatedFinancialImpact.toLocaleString()} estimated impact`
                  : `${cohortPatientCount.toLocaleString()} cohort members · ${cohortEstimatedImpact}`}
              </p>
            </div>
            <button
              onClick={() => router.replace("/projects")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dismiss
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Project name</label>
              <input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Goal type</label>
              <select
                value={goalType}
                onChange={(event) => setGoalType(event.target.value as GoalType)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="diabetes">diabetes</option>
                <option value="cancer_screening">cancer screening</option>
                <option value="readmissions">readmissions</option>
                <option value="ed_utilization">ed utilization</option>
              </select>
            </div>
          </div>

          {displayRationale ? <p className="mt-3 text-xs text-slate-600">Rationale: {displayRationale}</p> : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleCreateProject}
              disabled={creating || !projectName.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            >
              {creating ? "Creating project…" : "Create Project"}
            </button>
            <button
              onClick={() => router.replace("/projects")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Projects" value={projects.length} description="Synthetic initiatives" />
        <SummaryCard label="Active" value={totalActive} description="In-flight" accent="text-emerald-600" />
        <SummaryCard label="Cohorts Covered" value={totalCohorts} description="Unique cohorts" accent="text-indigo-600" />
        <SummaryCard label="Avg Health" value={projects.length ? "At Risk" : "—"} description="Portfolio pulse" accent="text-amber-600" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[160px] flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-500">Goal</span>
            <select
              value={filterGoal}
              onChange={(event) => setFilterGoal(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="all">All</option>
              <option value="ed_utilization">ED</option>
              <option value="readmissions">Readmit</option>
              <option value="cancer_screening">Cancer</option>
              <option value="diabetes">Diabetes</option>
            </select>
          </label>

          <label className="flex min-w-[140px] flex-col gap-1 text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-500">Type</span>
            <select
              value={projectTypeFilter}
              onChange={(event) => {
                const nextType = event.target.value as "all" | "standard" | "autonomous";
                setProjectTypeFilter(nextType);
                if (nextType === "standard") {
                  setAutonomousStatusFilter("all");
                }
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="all">All</option>
              <option value="standard">Standard</option>
              <option value="autonomous">Auto</option>
            </select>
          </label>

          {showAutonomousStatusFilter ? (
            <label className="flex min-w-[170px] flex-col gap-1 text-xs">
              <span className="font-semibold uppercase tracking-wide text-slate-500">Status</span>
              <select
                value={autonomousStatusFilter}
                onChange={(event) =>
                  setAutonomousStatusFilter(
                    event.target.value as
                      | "all"
                      | "executed"
                      | "monitoring"
                      | "needs_review"
                      | "escalated"
                      | "completed"
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700"
              >
                <option value="all">All</option>
                <option value="executed">Executed</option>
                <option value="monitoring">Monitoring</option>
                <option value="needs_review">Needs review</option>
                <option value="escalated">Escalated</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          ) : null}

          <button
            onClick={() => {
              setFilterGoal("all");
              setProjectTypeFilter("all");
              setAutonomousStatusFilter("all");
            }}
            className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear filters
          </button>
        </div>

        {activeFilterChips.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeFilterChips.map((chip) => (
              <span key={chip.key} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                {chip.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50">
              {[
                "Project",
                "Goal",
                "Health",
                "Execution",
                "Primary KPI",
                "Sparkline",
                "",
              ].map((header) => (
                <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredProjects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </FeatureGuard>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const [health, setHealth] = useState<{
    status: ProjectHealth;
    executionScore: number;
    taskCompletionRate: number;
    primaryMetric?: MetricPoint;
  }>({
    status: "At Risk" as ProjectHealth,
    executionScore: 0.6,
    taskCompletionRate: 0,
    primaryMetric: undefined,
  });
  const [sparkline, setSparkline] = useState<{ value: number }[]>([]);

  const projectType = project.projectType ?? "standard";
  const tags = project.tags ?? [];

  useEffect(() => {
    Promise.all([loadMetricPoints(project.id), loadTasks(project.id)]).then(([points, tasks]) => {
      const result = evaluateProjectHealth(project, points, tasks);
      setHealth(result);
      const series = points
        .filter((p) => p.metricKey === project.charter.primaryKPI.key)
        .slice(0, 6)
        .map((p) => ({ value: p.value }));
      setSparkline(series);
    });
  }, [project]);

  return (
    <tr className="group hover:bg-slate-50">
      <td className="px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{project.name}</p>
          <p className="text-xs text-slate-400">{project.cohortSnapshot.cohortId}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${projectType === "autonomous" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"}`}>
              {projectType === "autonomous" ? "Autonomous Project" : "Standard Project"}
            </span>
            {project.autonomousStatus ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {project.autonomousStatus.replace("_", " ")}
              </span>
            ) : null}
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-xs text-slate-500 capitalize">{project.goalType.replace("_", " ")}</td>
      <td className="px-5 py-4">
        <HealthBadge status={health.status} />
      </td>
      <td className="px-5 py-4">
        <ProgressBar value={health.taskCompletionRate} tone={health.status === "On Track" ? "success" : health.status === "Off Track" ? "danger" : "warning"} />
      </td>
      <td className="px-5 py-4 text-sm text-slate-700">
        {project.charter.primaryKPI.displayName}
      </td>
      <td className="px-5 py-4">
        {sparkline.length ? <Sparkline data={sparkline} /> : <span className="text-xs text-slate-300">—</span>}
      </td>
      <td className="px-5 py-4 text-right">
        <Link href={`/projects/${project.id}`} className="text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:underline">
          View →
        </Link>
      </td>
    </tr>
  );
}