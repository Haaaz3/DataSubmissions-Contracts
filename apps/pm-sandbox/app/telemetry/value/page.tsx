"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SummaryCard from "@/components/SummaryCard";
import FeatureGuard from "@/components/FeatureGuard";
import TrackPageView from "@/components/telemetry/TrackPageView";
import { getTelemetryEvents } from "@/lib/telemetry/service";
import { buildValueScorecard } from "@/lib/telemetry/valueScorecard";
import { loadAllMetricPoints, loadAllTasks, loadProjects } from "@/lib/storage/synapseStore";

export default function ValueScorecardPage() {
  const [scorecard, setScorecard] = useState<ReturnType<typeof buildValueScorecard> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getTelemetryEvents(), loadProjects(), loadAllTasks(), loadAllMetricPoints()])
      .then(([events, projects, tasks, metricPoints]) => {
        if (cancelled) return;
        setScorecard(buildValueScorecard({ events, projects, tasks, metricPoints }));
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("Unable to load value telemetry right now.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) return <div className="py-20 text-center text-slate-500">{loadError}</div>;
  if (!scorecard) return <div className="py-20 text-center text-slate-500">Loading scorecard...</div>;

  return (
    <FeatureGuard page="dashboard">
      <TrackPageView page="/telemetry/value" module="telemetry" />
      <div className="space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">← Back to Dashboard</Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Value Scorecard</h1>
          <p className="mt-2 text-sm text-slate-500">Execution and outcome effectiveness for AI-assisted workflows.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <SummaryCard label="AI Acceptance" value={scorecard.aiRecommendationAcceptanceRate} description="Reviewed to accepted" />
          <SummaryCard label="Project Activation" value={scorecard.projectActivationRate} description="Projects with activity" />
          <SummaryCard label="Healthy Projects" value={scorecard.healthyProjectRate} description="Execution health" />
          <SummaryCard label="KPI Improvement" value={scorecard.primaryKpiImprovementRate} description="AI project KPI lift" />
          <SummaryCard label="AI Task Completion" value={scorecard.avgAiTaskCompletionRate} description="Average completion" />
          <SummaryCard label="AI Projects" value={scorecard.aiProjectCount} description="Attributed projects" />
        </div>
      </div>
    </FeatureGuard>
  );
}
