"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SummaryCard from "@/components/SummaryCard";
import SynapseBadge from "@/components/SynapseBadge";
import ProgressBar from "@/components/ProgressBar";
import FeatureGuard from "@/components/FeatureGuard";
import { demoCohorts } from "@/data/synthetic/cohorts";
import { loadDemoCohorts } from "@/lib/storage/demoLoader";
import { loadCohorts } from "@/lib/storage/synapseStore";

const trendCopy = {
  up: "Trending up",
  down: "Trending down",
  flat: "Flat trend",
};

export default function CohortsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading cohorts...</div>}>
      <CohortsPageContent />
    </Suspense>
  );
}

function CohortsPageContent() {
  const searchParams = useSearchParams();
  const promptParam = searchParams.get("prompt");
  const [cohorts, setCohorts] = useState(demoCohorts);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCohorts().then((stored) => {
      if (stored.length) {
        setCohorts(stored);
        setLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (promptParam) {
      setLoaded(true);
    }
  }, [promptParam]);

  const totalMembers = cohorts.reduce((sum, c) => sum + c.size, 0);
  const averageChurn =
    cohorts.reduce((sum, c) => sum + c.churnRate, 0) / (cohorts.length || 1);
  const weeklyFresh = cohorts.filter((c) => c.dataFreshness === "weekly").length;

  const handleLoadDemo = async () => {
    await loadDemoCohorts();
    const stored = await loadCohorts();
    setCohorts(stored.length ? stored : demoCohorts);
    setLoaded(true);
  };

  return (
    <FeatureGuard page="cohorts">
      <div className="space-y-10">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SynapseAI Cohorts</h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Select a synthetic cohort to generate SynapseAI analysis and launch projects with
            explainable recommendations.
          </p>
        </div>
        <button
          onClick={handleLoadDemo}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {loaded ? "Reload demo cohorts" : "Load demo cohorts"}
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Cohorts"
          value={cohorts.length}
          description="Synthetic cohorts loaded"
        />
        <SummaryCard
          label="Total Members"
          value={totalMembers.toLocaleString()}
          description="Synthetic population size"
          accent="text-indigo-600"
        />
        <SummaryCard
          label="Avg Churn"
          value={`${Math.round(averageChurn * 100)}%`}
          description="Monthly cohort turnover"
          accent="text-amber-600"
        />
        <SummaryCard
          label="Weekly Refresh"
          value={weeklyFresh}
          description="Cohorts with weekly data"
          accent="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {cohorts.map((cohort) => (
          <div key={cohort.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <SynapseBadge label={cohort.goalType.replace("_", " ")} tone="info" />
                  <SynapseBadge label={cohort.dataFreshness} tone="success" />
                </div>
                <h2 className="mt-3 text-lg font-semibold text-slate-900">{cohort.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{cohort.description}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
                <p className="text-xs text-slate-400">Population size</p>
                <p className="text-2xl font-bold text-slate-900">{cohort.size.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Churn {Math.round(cohort.churnRate * 100)}%</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">Key metric</p>
                <p className="text-lg font-semibold text-slate-900">{cohort.keyMetricValue}</p>
                <p className="text-[10px] text-slate-400">{cohort.keyMetricLabel}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">Trend</p>
                <p className="text-sm font-semibold text-slate-900">{trendCopy[cohort.trend]}</p>
                <ProgressBar value={cohort.trend === "up" ? 68 : cohort.trend === "down" ? 38 : 50} tone={
                  cohort.trend === "up" ? "warning" : cohort.trend === "down" ? "success" : "default"
                } />
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-400">Data freshness</p>
                <p className="text-sm font-semibold text-slate-900 capitalize">{cohort.dataFreshness}</p>
                <p className="text-[10px] text-slate-400">Synthetic refresh cadence</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Definition: {cohort.definition.inclusionCriteria.join(" · ")}
              </div>
              <a
                href={`/cohorts/${cohort.id}${promptParam ? `?prompt=${encodeURIComponent(promptParam)}` : ""}`}
                className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Ask SynapseAI →
              </a>
            </div>
          </div>
        ))}
      </div>
      </div>
    </FeatureGuard>
  );
}
