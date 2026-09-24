"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { SynapseAgentId } from "@/lib/synapseai/agentRegistry";
import Tabs from "@/components/Tabs";
import SummaryCard from "@/components/SummaryCard";
import SynapseBadge from "@/components/SynapseBadge";
import ProgressBar from "@/components/ProgressBar";
import FeatureGuard from "@/components/FeatureGuard";
import { demoCohorts } from "@/data/synthetic/cohorts";
import { workflowTemplateLibrary } from "@/data/synthetic/workflowTemplates";
import { SynapseAIRun } from "@/lib/models/agent";
import { Cohort } from "@/lib/models/cohort";
import { loadDemoCohorts } from "@/lib/storage/demoLoader";
import { loadCohorts, saveAgentRun } from "@/lib/storage/synapseStore";
import { createProjectFromAgent } from "@/lib/projects/createFromAgent";
import { buildSynapseRun, streamSynapseRun } from "@/lib/synapseai/orchestrator";
import AgentConsole from "@/components/synapseai/AgentConsole";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "synapse", label: "SynapseAI" },
  { id: "workflows", label: "Recommended Workflows" },
  { id: "telemetry", label: "Telemetry Plan" },
];

export default function CohortSynapsePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [cohort, setCohort] = useState<Cohort | undefined>();
  const [cohortResolved, setCohortResolved] = useState(false);
  const [agentRun, setAgentRun] = useState<SynapseAIRun | null>(null);
  const [prompt, setPrompt] = useState(searchParams.get("prompt") ?? "");
  const [selectedAgent] = useState<SynapseAgentId>(
    (searchParams.get("agent") as SynapseAgentId) ?? "quality_care_gap"
  );
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    loadCohorts().then((stored) => {
      if (!stored.length) {
        loadDemoCohorts().then(() => {
          setCohort(demoCohorts.find((c) => c.id === params.id));
          setCohortResolved(true);
        });
      } else {
        setCohort(stored.find((c) => c.id === params.id));
        setCohortResolved(true);
      }
    });
  }, [params.id]);

  if (!cohortResolved) {
    return (
      <div className="py-20 text-center text-slate-500">Loading cohort...</div>
    );
  }

  if (!cohort) {
    return (
      <FeatureGuard page="cohorts">
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-slate-500">Cohort not found.</p>
          <Link href="/cohorts" className="text-sm font-medium text-indigo-600 hover:underline">
            ← Back to Cohorts
          </Link>
        </div>
      </FeatureGuard>
    );
  }

  const handleGenerate = async () => {
    const run = buildSynapseRun(
      cohort.id,
      prompt || "Why is this cohort high risk and what should we do?",
      selectedAgent
    );
    setAgentRun(run);
    setStreaming(true);
    await streamSynapseRun(run, (update) => setAgentRun(update));
    await saveAgentRun(run);
    setStreaming(false);
  };

  const handleCreateProject = async () => {
    if (!agentRun) return;
    await createProjectFromAgent(cohort, agentRun);
    window.location.href = "/projects";
  };

  const recommended = workflowTemplateLibrary.filter((template) =>
    agentRun?.output?.recommendedWorkflows?.some((w) => w.type === template.type)
  );

  const trendSeries = Array.from({ length: 6 }).map((_, idx) => ({
    name: `W${idx + 1}`,
    value: Math.max(0, cohort.keyMetricValue + (idx - 3) * 4),
  }));

  const segmentSeries = (agentRun?.output?.segments ?? []).map((segment) => ({
    name: segment.name,
    value: segment.size,
  }));

  const driverSeries = (agentRun?.output?.drivers ?? []).map((driver) => ({
    name: driver.label,
    value: Number(driver.value.match(/\d+/)?.[0] ?? 0),
  }));

  return (
    <FeatureGuard page="cohorts">
      <div className="space-y-10">
      <Link href="/cohorts" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
        ← Back to Cohorts
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SynapseBadge label={cohort.goalType.replace("_", " ")} tone="info" />
            <SynapseBadge label={cohort.dataFreshness} tone="success" />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{cohort.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{cohort.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={streaming}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:bg-indigo-300"
          >
            {streaming ? "SynapseAI thinking…" : "Generate Analysis"}
          </button>
          <button
            onClick={handleCreateProject}
            disabled={!agentRun}
            className={`rounded-lg px-4 py-2 text-xs font-semibold ${
              agentRun
                ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
                : "border border-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            Create Project from Recommendation
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask SynapseAI about this cohort… (e.g., ‘Why is ED utilization high and what should we do?’)"
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={streaming}
            className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:bg-indigo-300"
          >
            Ask SynapseAI
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          {[
            "Show me which segment is most impactable",
            "Create a workflow plan focused on access barriers",
            "What leading indicators should we watch weekly?",
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => setPrompt(chip)}
              className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <Tabs tabs={tabs} defaultTab="overview">
        {(activeTab) => (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <SummaryCard label="Population" value={cohort.size.toLocaleString()} description="Synthetic members" />
                  <SummaryCard label="Churn Rate" value={`${Math.round(cohort.churnRate * 100)}%`} description="Monthly turnover" accent="text-amber-600" />
                  <SummaryCard label="Key Metric" value={cohort.keyMetricValue} description={cohort.keyMetricLabel} />
                  <SummaryCard label="Trend" value={cohort.trend} description="Last 6 weeks" accent="text-indigo-600" />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <p className="text-sm text-slate-600">Cohort definition</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-400">Inclusion</p>
                      <p className="text-sm text-slate-700">{cohort.definition.inclusionCriteria.join(" · ")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Exclusion</p>
                      <p className="text-sm text-slate-700">{cohort.definition.exclusionCriteria.join(" · ")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Timeframe</p>
                      <p className="text-sm text-slate-700">{cohort.definition.timeframeDays} days</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "synapse" && (
              <div className="space-y-6">
                <AgentConsole run={agentRun} />
                {!agentRun ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
                    Ask SynapseAI to generate a deep cohort analysis.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="text-base font-semibold text-slate-900">SynapseAI Summary</h2>
                      <div className="mt-3 whitespace-pre-line text-sm text-slate-600">
                        {agentRun.output.summaryMarkdown}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900">Primary KPI Trend</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendSeries}>
                              <XAxis dataKey="name" hide />
                              <YAxis hide />
                              <Tooltip />
                              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900">Segment Distribution</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={segmentSeries}>
                              <XAxis dataKey="name" hide />
                              <YAxis hide />
                              <Tooltip />
                              <Bar dataKey="value" fill="#34d399" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900">Drivers</h3>
                        <div className="mt-4 space-y-3">
                          {agentRun.output.drivers.map((driver) => (
                            <div key={driver.label} className="rounded-lg bg-slate-50 p-4">
                              <p className="text-xs font-semibold text-slate-700">{driver.label}</p>
                              <p className="text-sm text-slate-600">{driver.value}</p>
                              <p className="text-[10px] text-slate-400">Evidence: {driver.evidenceRefs.join(", ")}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900">Segments</h3>
                        <div className="mt-4 space-y-3">
                          {agentRun.output.segments.map((segment) => (
                            <div key={segment.name} className="rounded-lg bg-slate-50 p-4">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-700">{segment.name}</p>
                                <SynapseBadge label={`${segment.size} members`} tone="info" />
                              </div>
                              <p className="text-sm text-slate-600">{segment.rationale}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900">Assumptions & Confidence</h3>
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-400">Confidence</p>
                          <p className="text-2xl font-semibold text-slate-900">{Math.round(agentRun.output.confidence * 100)}%</p>
                          <ProgressBar value={agentRun.output.confidence * 100} tone="success" />
                        </div>
                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-400">Assumptions</p>
                          <ul className="mt-2 space-y-1 text-xs text-slate-600">
                            {agentRun.output.projectCharterDraft.assumptions.map((a) => (
                              <li key={a}>• {a}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-4">
                          <p className="text-xs text-slate-400">Limitations</p>
                          <ul className="mt-2 space-y-1 text-xs text-slate-600">
                            {agentRun.output.limitations.map((l) => (
                              <li key={l}>• {l}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900">Citations</h3>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {agentRun.output.citations.map((cite) => (
                          <div key={cite.id} className="rounded-lg bg-slate-50 p-4">
                            <p className="text-xs font-semibold text-slate-700">{cite.label}</p>
                            <p className="text-xs text-slate-500">{cite.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-sm font-semibold text-slate-900">Driver Decomposition</h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={driverSeries}>
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <Tooltip />
                            <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === "workflows" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {recommended.length ? (
                  recommended.map((template) => (
                    <div key={template.type} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900">{template.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{template.description}</p>
                      <div className="mt-4">
                        <p className="text-xs text-slate-400">Default SLAs</p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                          {template.SLAs.map((sla) => (
                            <li key={sla.name}>• {sla.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
                    Generate analysis to see recommended workflows.
                  </div>
                )}
              </div>
            )}

            {activeTab === "telemetry" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Telemetry Plan</h3>
                <p className="mt-1 text-xs text-slate-400">Leading + lagging indicators with cadence and limitations.</p>
                <div className="mt-4 space-y-3">
                  {(agentRun?.output.telemetryPlan ?? []).map((metric) => (
                    <div key={metric.key} className="rounded-lg bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">{metric.label}</p>
                        <SynapseBadge label={metric.cadence} tone="info" />
                      </div>
                      <p className="text-xs text-slate-500">{metric.definition}</p>
                      {metric.limitations && <p className="text-[10px] text-amber-500">{metric.limitations}</p>}
                    </div>
                  ))}
                  {!agentRun && (
                    <div className="rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-400">
                      Generate analysis to populate telemetry.
                    </div>
                  )}
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