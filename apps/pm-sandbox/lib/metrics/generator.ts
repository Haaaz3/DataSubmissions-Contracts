import { MetricPoint, Project } from "@/lib/models/project";
import { makeId } from "@/lib/storage/synapseStore";

const freshnessMap = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  claims_lagged: "claims_lagged",
} as const;

const cadenceWeeks = {
  daily: 1,
  weekly: 1,
  monthly: 4,
  claims_lagged: 4,
} as const;

const confidenceByCadence = {
  daily: 0.85,
  weekly: 0.8,
  monthly: 0.7,
  claims_lagged: 0.55,
} as const;

function buildSeries(startDate: string, weeks: number) {
  const start = new Date(startDate);
  return Array.from({ length: weeks }).map((_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i * 7);
    return date.toISOString().slice(0, 10);
  });
}

function jitter(value: number, magnitude: number) {
  const variance = (Math.random() - 0.5) * magnitude;
  return Math.max(0, value + variance);
}

export function generateMetricPoints(project: Project, weeks = 16): MetricPoint[] {
  const series = buildSeries(project.charter.timeframe.startDate, weeks);
  const metrics = [
    project.charter.primaryKPI,
    ...project.charter.secondaryKPIs,
    ...project.charter.leadingIndicators,
  ];

  return metrics.flatMap((metric) => {
    const cadence = metric.key.includes("rate") || metric.key.includes("ed_") ? "monthly" : "weekly";
    const step = cadenceWeeks[cadence];
    const trendDirection = metric.direction === "up" ? 1 : -1;
    const deltaPerStep = (metric.target - metric.baseline) / (weeks / step);

    return series
      .filter((_, idx) => idx % step === 0)
      .map((date, idx) => {
        const base = metric.baseline + idx * deltaPerStep;
        const adjusted = jitter(base + trendDirection * idx * 0.4, metric.baseline * 0.05);
        const confidence = confidenceByCadence[cadence] - idx * 0.01;
        return {
          id: makeId("metric"),
          projectId: project.id,
          metricKey: metric.key,
          date,
          value: Number(adjusted.toFixed(1)),
          confidence: Math.max(0.4, Number(confidence.toFixed(2))),
          freshness: freshnessMap[cadence],
          notes: confidence < 0.6 ? "Synthetic claims runout incomplete" : undefined,
        } as MetricPoint;
      });
  });
}