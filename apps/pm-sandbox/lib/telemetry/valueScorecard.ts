import { MetricPoint, Project, Task } from "@/lib/models/project";
import { TelemetryEvent } from "@/lib/models/telemetry";

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hasImproved(project: Project, points: MetricPoint[]) {
  const series = points
    .filter((point) => point.projectId === project.id && point.metricKey === project.charter.primaryKPI.key)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (series.length < 2) return false;
  const baseline = series[0].value;
  const latest = series[series.length - 1].value;
  return project.charter.primaryKPI.direction === "up" ? latest > baseline : latest < baseline;
}

export function buildValueScorecard(params: {
  projects: Project[];
  tasks: Task[];
  metricPoints: MetricPoint[];
  events: TelemetryEvent[];
}) {
  const { projects, tasks, metricPoints, events } = params;
  const aiProjects = projects.filter((project) => project.projectOrigin === "opportunity" || project.projectOrigin === "agent_run");
  const reviewed = events.filter((event) => event.eventName === "opportunity_review_opened").length;
  const accepted = events.filter((event) => event.eventName === "project_created_from_opportunity").length;

  const activatedProjects = projects.filter((project) => tasks.some((task) => task.projectId === project.id));
  const healthyProjects = projects.filter((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const done = projectTasks.filter((task) => task.status === "done").length;
    return projectTasks.length > 0 && done / projectTasks.length >= 0.5;
  });

  const primaryKpiImproved = aiProjects.filter((project) => hasImproved(project, metricPoints));
  const aiTaskCompletionRates = aiProjects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    if (!projectTasks.length) return 0;
    return projectTasks.filter((task) => task.status === "done").length / projectTasks.length;
  });

  return {
    aiRecommendationAcceptanceRate: reviewed ? Number((accepted / reviewed).toFixed(2)) : 0,
    projectActivationRate: projects.length ? Number((activatedProjects.length / projects.length).toFixed(2)) : 0,
    healthyProjectRate: projects.length ? Number((healthyProjects.length / projects.length).toFixed(2)) : 0,
    primaryKpiImprovementRate: aiProjects.length ? Number((primaryKpiImproved.length / aiProjects.length).toFixed(2)) : 0,
    avgAiTaskCompletionRate: Number(avg(aiTaskCompletionRates).toFixed(2)),
    aiProjectCount: aiProjects.length,
  };
}
