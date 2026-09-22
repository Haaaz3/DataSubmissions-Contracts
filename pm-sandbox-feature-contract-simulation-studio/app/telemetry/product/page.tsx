"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SummaryCard from "@/components/SummaryCard";
import FeatureGuard from "@/components/FeatureGuard";
import TrackPageView from "@/components/telemetry/TrackPageView";
import { getTelemetryEvents } from "@/lib/telemetry/service";
import { buildProductScorecard } from "@/lib/telemetry/productScorecard";
import { loadProjects, loadWorkspaces } from "@/lib/storage/synapseStore";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

function InfoTip({ text }: { text: string }) {
  return (
    <span title={text} className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
      i
    </span>
  );
}

export default function ProductScorecardPage() {
  const [scorecard, setScorecard] = useState<ReturnType<typeof buildProductScorecard> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getTelemetryEvents(), loadProjects(), loadWorkspaces()])
      .then(([events, projects, workspaces]) => {
        if (cancelled) return;
        setScorecard(buildProductScorecard(events, { projects, workspaces }));
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("Unable to load product telemetry right now.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) return <div className="py-20 text-center text-slate-500">{loadError}</div>;
  if (!scorecard) return <div className="py-20 text-center text-slate-500">Loading scorecard...</div>;

  const moduleData = Object.entries(scorecard.moduleCounts)
    .map(([module, count]) => ({ label: module, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const pageData = Object.entries(scorecard.pageCounts)
    .map(([page, count]) => ({ label: page, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const suiteData = Object.entries(scorecard.suiteCounts)
    .map(([suite, count]) => ({ label: suite, value: count }))
    .sort((a, b) => b.value - a.value);

  const funnelData = [
    { label: "Contracts Viewed", value: scorecard.funnelCounts.contractsViewed },
    { label: "Opps Reviewed", value: scorecard.funnelCounts.opportunitiesReviewed },
    { label: "Projects Created", value: scorecard.funnelCounts.projectsCreatedFromOpportunity },
  ];

  return (
    <FeatureGuard page="dashboard">
      <TrackPageView page="/telemetry/product" module="telemetry" />
      <div className="space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">← Back to Dashboard</Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Product Scorecard</h1>
          <p className="mt-2 text-sm text-slate-500">Usage, adoption, stickiness, and workflow conversion metrics.</p>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Adoption & Reach</h2>
            <InfoTip text="Core user adoption and population reach KPIs." />
          </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <SummaryCard label="Active Users" value={scorecard.activeUsers} description="Distinct users with activity" />
          <SummaryCard label="WAU" value={scorecard.wau} description="Users active in last 7 days" />
          <SummaryCard label="MAU" value={scorecard.mau} description="Users active in last 30 days" />
          <SummaryCard label="WAU:MAU" value={scorecard.stickiness} description="Weekly stickiness proxy" />
          <SummaryCard label="Contracts Engaged" value={scorecard.contractsEngaged} description="Distinct contracts interacted with" />
          <SummaryCard label="Projects Engaged" value={scorecard.projectsEngaged} description="Distinct projects interacted with" />
        </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">AI Platform Usage</h2>
            <InfoTip text="How broadly teams are using suites, agents, and AI-driven workflows." />
          </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <SummaryCard label="Suites Activated" value={scorecard.suitesActivated} description="Distinct suite usage" />
          <SummaryCard label="AI Agents" value={scorecard.agentsActivated} description="Distinct agent usage" />
          <SummaryCard label="Projects" value={scorecard.projectCount} description="Total projects" />
          <SummaryCard label="Review Rate" value={scorecard.opportunityReviewRate} description="Opportunities reviewed after view" />
          <SummaryCard label="Opp → Project" value={scorecard.opportunityToProjectConversionRate} description="Reviewed opportunities converted" />
          <SummaryCard label="Engaged Minutes" value={scorecard.estimatedEngagedMinutes} description="Estimated time in app" />
        </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Engagement & Utilization</h2>
            <InfoTip text="Most-used modules and pages by event volume." />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Top Modules</h3>
              <div className="mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleData} layout="vertical" margin={{ left: 20, right: 10, top: 10, bottom: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="label" type="category" width={110} tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Top Pages</h3>
              <div className="mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageData} layout="vertical" margin={{ left: 20, right: 10, top: 10, bottom: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="label" type="category" width={130} tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Workflow & Suite Visuals</h2>
            <InfoTip text="Visual breakdown of AI suite mix and conversion progression." />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Suite Activation Mix</h3>
              <p className="mt-1 text-xs text-slate-500">
                {scorecard.suitesActivated} of {scorecard.suiteDirectoryCount} suites in Agent Suite Directory activated · values represent activated agents per suite.
              </p>
              <div className="mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={suiteData} dataKey="value" nameKey="label" innerRadius={55} outerRadius={95}>
                      {suiteData.map((entry, idx) => (
                        <Cell key={entry.label} fill={["#4f46e5", "#0ea5e9", "#14b8a6", "#f59e0b", "#f97316", "#8b5cf6"][idx % 6]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {suiteData.map((suite) => (
                  <div key={suite.label} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    <span className="font-semibold">{suite.label}</span>
                    <span className="ml-1 text-slate-500">({suite.value} agents)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Opportunity Funnel</h3>
              <div className="mt-3 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </div>
    </FeatureGuard>
  );
}
