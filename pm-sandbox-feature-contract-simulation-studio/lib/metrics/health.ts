import { MetricPoint, Project, Task } from "@/lib/models/project";

export type ProjectHealth = "On Track" | "At Risk" | "Off Track";

function latestMetric(points: MetricPoint[], key: string) {
  return points
    .filter((p) => p.metricKey === key)
    .sort((a, b) => (a.date > b.date ? -1 : 1))[0];
}

export function evaluateProjectHealth(project: Project, points: MetricPoint[], tasks: Task[]) {
  const primary = latestMetric(points, project.charter.primaryKPI.key);
  const leading = project.charter.leadingIndicators
    .map((kpi) => latestMetric(points, kpi.key))
    .filter(Boolean) as MetricPoint[];

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const taskCompletionRate = tasks.length ? completedTasks / tasks.length : 0;

  const leadingAvgConfidence = leading.length
    ? leading.reduce((sum, p) => sum + p.confidence, 0) / leading.length
    : 0.5;

  const primaryTrendScore = primary
    ? project.charter.primaryKPI.direction === "down"
      ? primary.value <= project.charter.primaryKPI.baseline * 0.95
      : primary.value >= project.charter.primaryKPI.baseline * 1.05
    : false;

  const executionScore = taskCompletionRate * 0.5 + leadingAvgConfidence * 0.5;
  const riskSignals = [
    taskCompletionRate < 0.4,
    leadingAvgConfidence < 0.6,
    primary && !primaryTrendScore,
  ].filter(Boolean).length;

  const status: ProjectHealth =
    riskSignals >= 2 || executionScore < 0.5
      ? "Off Track"
      : riskSignals === 1 || executionScore < 0.7
      ? "At Risk"
      : "On Track";

  return {
    status,
    executionScore: Number(executionScore.toFixed(2)),
    taskCompletionRate: Number((taskCompletionRate * 100).toFixed(0)),
    primaryMetric: primary,
  };
}

export function buildProjectAlerts(project: Project, points: MetricPoint[], tasks: Task[]) {
  const alerts: { title: string; detail: string; severity: "info" | "warning" | "critical" }[] = [];

  const completed = tasks.filter((t) => t.status === "done").length;
  if (tasks.length && completed / tasks.length < 0.35) {
    alerts.push({
      title: "Stalled execution",
      detail: "Fewer than 35% of tasks are complete. Outreach workflow is falling behind.",
      severity: "warning",
    });
  }

  const primary = points.filter((p) => p.metricKey === project.charter.primaryKPI.key);
  if (primary.length) {
    const recent = primary[0];
    if (recent.confidence < 0.6) {
      alerts.push({
        title: "Data freshness degraded",
        detail: "Primary KPI confidence dropped below 0.6 due to synthetic claims lag.",
        severity: "info",
      });
    }
  }

  return alerts;
}