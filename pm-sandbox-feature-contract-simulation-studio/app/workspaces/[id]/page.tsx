"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FeatureGuard from "@/components/FeatureGuard";
import { loadWorkspace, saveWorkspaces } from "@/lib/storage/synapseStore";
import { SynapseWorkspace, WorkspaceGoal } from "@/lib/models/workspace";
import { getAgentById, getAgentProfileById, getSuiteById, SynapseAgentId } from "@/lib/synapseai/agentRegistry";
import { getActiveWorkspaceId, setActiveWorkspaceId, upsertWorkspaceGoals } from "@/lib/workspaces/service";
import {
  CartesianGrid,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Sparkline from "@/components/charts/Sparkline";
import UsHotspotMap from "@/components/charts/UsHotspotMap";
import TrackPageView from "@/components/telemetry/TrackPageView";
import { Reorder } from "framer-motion";

const CHART_COLORS = ["#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b", "#f97316", "#8b5cf6"];
const DEFAULT_SECTION_ORDER = ["kpis", "trend", "visuals", "insights", "actions", "next_questions", "timeline"] as const;
type WorkspaceSectionId = (typeof DEFAULT_SECTION_ORDER)[number];

function trendTone(trend?: "up" | "down" | "flat") {
  if (trend === "up") return "text-emerald-700";
  if (trend === "down") return "text-rose-700";
  return "text-slate-600";
}

function renderWorkspaceVisual(block: {
  chartType?: "bar" | "stackedBar" | "donut" | "sparkline" | "line" | "radar" | "polarArea" | "wordCloud" | "geo" | "usMap";
  chartData?: Array<{ label: string; value: number; valueSecondary?: number; valueTertiary?: number }>;
  seriesLabels?: string[];
}) {
  if (!block.chartType || !block.chartData) return null;

  if (block.chartType === "wordCloud") {
    const max = Math.max(...block.chartData.map((d) => d.value), 1);
    return (
      <div className="flex flex-wrap gap-2">
        {block.chartData.map((item) => {
          const size = 11 + Math.round((item.value / max) * 11);
          return (
            <span
              key={`${block.chartType}-${item.label}`}
              className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700"
              style={{ fontSize: `${size}px` }}
            >
              {item.label}
            </span>
          );
        })}
      </div>
    );
  }

  if (block.chartType === "usMap") {
    return <UsHotspotMap data={block.chartData} />;
  }

  if (block.chartType === "geo") {
    const max = Math.max(...block.chartData.map((d) => d.value), 1);
    return (
      <div className="space-y-2">
        {block.chartData.map((item) => (
          <div key={`${block.chartType}-${item.label}`}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500">{item.value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      {block.chartType === "line" ? (
        <LineChart data={block.chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      ) : block.chartType === "bar" ? (
        <BarChart data={block.chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {block.chartData.map((entry, index) => (
              <Cell key={`${block.chartType}-${entry.label}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      ) : block.chartType === "stackedBar" ? (
        <BarChart data={block.chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar stackId="a" dataKey="value" name={block.seriesLabels?.[0] ?? "Primary"} fill="#4f46e5" />
          <Bar stackId="a" dataKey="valueSecondary" name={block.seriesLabels?.[1] ?? "Secondary"} fill="#0ea5e9" />
          <Bar stackId="a" dataKey="valueTertiary" name={block.seriesLabels?.[2] ?? "Tertiary"} fill="#14b8a6" />
        </BarChart>
      ) : block.chartType === "donut" ? (
        <PieChart>
          <Tooltip />
          <Pie data={block.chartData} dataKey="value" nameKey="label" innerRadius={52} outerRadius={80} paddingAngle={2}>
            {block.chartData.map((entry, index) => (
              <Cell key={`${block.chartType}-${entry.label}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      ) : block.chartType === "radar" || block.chartType === "polarArea" ? (
        <RadarChart data={block.chartData} outerRadius={86}>
          <PolarGrid />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis tick={{ fontSize: 10 }} />
          <Radar dataKey="value" fill="#4f46e5" fillOpacity={0.35} stroke="#4f46e5" />
          <Tooltip />
        </RadarChart>
      ) : (
        <BarChart data={block.chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}

const SECTION_LABELS: Record<WorkspaceSectionId, string> = {
  kpis: "KPIs",
  trend: "Trend Snapshot",
  visuals: "Visual Charts",
  insights: "Insights",
  actions: "Actions",
  next_questions: "Next Questions",
  timeline: "Contribution Timeline",
};

export default function WorkspaceDetailPage() {
  const params = useParams<{ id: string }>();
  const [workspace, setWorkspace] = useState<SynapseWorkspace | null>(null);
  const [workspaceResolved, setWorkspaceResolved] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<SynapseAgentId | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [plannedActions, setPlannedActions] = useState<string[]>([]);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalDraft, setGoalDraft] = useState({
    title: "",
    description: "",
    priority: "medium" as WorkspaceGoal["priority"],
    status: "active" as WorkspaceGoal["status"],
    kpiLabel: "",
    baselineValue: "",
    currentValue: "",
    targetValue: "",
    unit: "",
    direction: "down" as WorkspaceGoal["direction"],
    owner: "",
    targetDate: "",
    successMetric: "",
  });

  useEffect(() => {
    setActiveWorkspaceIdState(getActiveWorkspaceId());
    loadWorkspace(params.id).then((item) => {
      if (item) setWorkspace(item);
      setWorkspaceResolved(true);
    });
  }, [params.id]);

  if (!workspaceResolved) {
    return <div className="py-20 text-center text-slate-500">Loading workspace...</div>;
  }

  if (!workspace) {
    return (
      <FeatureGuard page="workspaces">
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-slate-500">Workspace not found.</p>
          <Link href="/workspaces" className="text-sm font-medium text-indigo-600 hover:underline">
            ← Back to Workspaces
          </Link>
        </div>
      </FeatureGuard>
    );
  }

  const originAgent = getAgentById(workspace.originAgentId);
  const isActive = activeWorkspaceId === workspace.id;
  const kpiBlock = workspace.blocks.find((block) => block.type === "kpi");
  const trendBlock = workspace.blocks.find((block) => block.type === "chart" && block.chartType === "sparkline");
  const visualBlocks = workspace.blocks.filter((block) => block.type === "chart" && block.chartType && block.chartType !== "sparkline");
  const insightBlocks = workspace.blocks.filter((block) => block.type === "insight");
  const actionBlocks = workspace.blocks.filter((block) => block.type === "actions");
  const nextQuestionBlocks = workspace.blocks.filter((block) => block.type === "next_questions");
  const insightItems = insightBlocks.flatMap((block) => block.items ?? []);
  const actionItems = actionBlocks.flatMap((block) => block.items ?? []);
  const promptItems = nextQuestionBlocks.flatMap((block) => block.items ?? []);
  const latestSourcePrompt = workspace.sourcePrompts[workspace.sourcePrompts.length - 1];
  const goals = workspace.goals ?? [];

  const insightActionFlows = insightItems.map((insight, index) => {
    const relatedActionCandidates = [
      actionItems[index],
      actionItems[(index + 1) % Math.max(actionItems.length, 1)],
    ].filter((item): item is string => Boolean(item));

    const relatedPromptCandidates = [
      promptItems[index],
      promptItems[(index + 1) % Math.max(promptItems.length, 1)],
      latestSourcePrompt,
    ].filter((item): item is string => Boolean(item));

    const contribution = workspace.contributions[index] ?? workspace.contributions[workspace.contributions.length - 1];

    return {
      insight,
      actions: Array.from(new Set(relatedActionCandidates)).slice(0, 2),
      prompts: Array.from(new Set(relatedPromptCandidates)).slice(0, 3),
      contributionNote: contribution?.notes,
      contributionAgentId: contribution?.agentId,
    };
  });
  const rawLayout = workspace.layout ?? { sectionOrder: [...DEFAULT_SECTION_ORDER], hiddenSections: [] };
  const layout = {
    sectionOrder: (rawLayout.sectionOrder as string[]).filter((sectionId): sectionId is WorkspaceSectionId =>
      (DEFAULT_SECTION_ORDER as readonly string[]).includes(sectionId)
    ),
    hiddenSections: (rawLayout.hiddenSections as string[]).filter((sectionId): sectionId is WorkspaceSectionId =>
      (DEFAULT_SECTION_ORDER as readonly string[]).includes(sectionId)
    ),
  };

  const persistLayout = async (nextLayout: { sectionOrder: WorkspaceSectionId[]; hiddenSections: WorkspaceSectionId[] }) => {
    const updatedWorkspace: SynapseWorkspace = {
      ...workspace,
      updatedAt: new Date().toISOString(),
      layout: nextLayout,
    };
    await saveWorkspaces([updatedWorkspace]);
    setWorkspace(updatedWorkspace);
  };

  const toggleSectionVisibility = (sectionId: WorkspaceSectionId) => {
    const hiddenSections = layout.hiddenSections.includes(sectionId)
      ? layout.hiddenSections.filter((id) => id !== sectionId)
      : [...layout.hiddenSections, sectionId];
    persistLayout({ sectionOrder: layout.sectionOrder as WorkspaceSectionId[], hiddenSections });
  };

  const sectionVisible = (sectionId: WorkspaceSectionId) => !layout.hiddenSections.includes(sectionId);

  const addActionToPlan = (action: string) => {
    setPlannedActions((current) => (current.includes(action) ? current : [...current, action]));
  };

  const resetGoalDraft = () => {
    setGoalDraft({
      title: "",
      description: "",
      priority: "medium",
      status: "active",
      kpiLabel: "",
      baselineValue: "",
      currentValue: "",
      targetValue: "",
      unit: "",
      direction: "down",
      owner: "",
      targetDate: "",
      successMetric: "",
    });
    setEditingGoalId(null);
  };

  const saveGoals = async (nextGoals: WorkspaceGoal[]) => {
    const updated = await upsertWorkspaceGoals({ workspaceId: workspace.id, goals: nextGoals });
    if (updated) {
      setWorkspace(updated);
    }
  };

  const openGoalForEdit = (goal: WorkspaceGoal) => {
    setEditingGoalId(goal.id);
    setGoalDraft({
      title: goal.title,
      description: goal.description ?? "",
      priority: goal.priority,
      status: goal.status,
      kpiLabel: goal.kpiLabel ?? "",
      baselineValue: goal.baselineValue?.toString() ?? "",
      currentValue: goal.currentValue?.toString() ?? "",
      targetValue: goal.targetValue?.toString() ?? "",
      unit: goal.unit ?? "",
      direction: goal.direction ?? "down",
      owner: goal.owner ?? "",
      targetDate: goal.targetDate ?? "",
      successMetric: goal.successMetric ?? "",
    });
  };

  const parseOptionalNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const goalProgressPercent = (goal: WorkspaceGoal) => {
    if (
      goal.baselineValue === undefined ||
      goal.currentValue === undefined ||
      goal.targetValue === undefined ||
      !goal.direction
    ) {
      return undefined;
    }

    const totalDistance =
      goal.direction === "down"
        ? goal.baselineValue - goal.targetValue
        : goal.targetValue - goal.baselineValue;
    const progressDistance =
      goal.direction === "down"
        ? goal.baselineValue - goal.currentValue
        : goal.currentValue - goal.baselineValue;

    if (totalDistance <= 0) return undefined;
    return Math.max(0, Math.min(100, (progressDistance / totalDistance) * 100));
  };

  const goalIsOnTrack = (goal: WorkspaceGoal) => {
    if (goal.currentValue === undefined || goal.targetValue === undefined || !goal.direction) return undefined;
    return goal.direction === "down" ? goal.currentValue <= goal.targetValue : goal.currentValue >= goal.targetValue;
  };

  const formatMetricValue = (value?: number, unit?: string) => {
    if (value === undefined) return "—";
    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  const getGoalHealthBadge = (goal: WorkspaceGoal) => {
    const onTrack = goalIsOnTrack(goal);
    const progress = goalProgressPercent(goal);

    if (goal.status === "complete") {
      return { label: "Complete", className: "bg-emerald-100 text-emerald-700" };
    }

    if (onTrack === undefined) {
      return { label: "Tracking Setup Needed", className: "bg-slate-100 text-slate-600" };
    }

    if (onTrack) {
      return { label: "On Track", className: "bg-emerald-100 text-emerald-700" };
    }

    if ((progress ?? 0) <= 10) {
      return { label: "Off Track", className: "bg-red-100 text-red-700" };
    }

    return { label: "Needs Attention", className: "bg-amber-100 text-amber-700" };
  };

  const saveGoalDraft = async () => {
    if (!goalDraft.title.trim()) return;
    const now = new Date().toISOString();
    if (editingGoalId) {
      await saveGoals(
        goals.map((goal) =>
          goal.id === editingGoalId
            ? {
                ...goal,
                title: goalDraft.title.trim(),
                description: goalDraft.description.trim() || undefined,
                priority: goalDraft.priority,
                status: goalDraft.status,
                kpiLabel: goalDraft.kpiLabel.trim() || undefined,
                baselineValue: parseOptionalNumber(goalDraft.baselineValue),
                currentValue: parseOptionalNumber(goalDraft.currentValue),
                targetValue: parseOptionalNumber(goalDraft.targetValue),
                unit: goalDraft.unit.trim() || undefined,
                direction: goalDraft.direction,
                owner: goalDraft.owner.trim() || undefined,
                targetDate: goalDraft.targetDate || undefined,
                successMetric: goalDraft.successMetric.trim() || undefined,
                updatedAt: now,
              }
            : goal
        )
      );
    } else {
      await saveGoals([
        ...goals,
        {
          id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: goalDraft.title.trim(),
          description: goalDraft.description.trim() || undefined,
          priority: goalDraft.priority,
          status: goalDraft.status,
          kpiLabel: goalDraft.kpiLabel.trim() || undefined,
          baselineValue: parseOptionalNumber(goalDraft.baselineValue),
          currentValue: parseOptionalNumber(goalDraft.currentValue),
          targetValue: parseOptionalNumber(goalDraft.targetValue),
          unit: goalDraft.unit.trim() || undefined,
          direction: goalDraft.direction,
          owner: goalDraft.owner.trim() || undefined,
          targetDate: goalDraft.targetDate || undefined,
          successMetric: goalDraft.successMetric.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    resetGoalDraft();
  };

  const removeGoal = async (goalId: string) => {
    await saveGoals(goals.filter((goal) => goal.id !== goalId));
    if (editingGoalId === goalId) resetGoalDraft();
  };

  const resetAllGoals = async () => {
    const confirmed = window.confirm("Reset all workspace goals? This will remove goal tracking and related goal UI from this workspace.");
    if (!confirmed) return;
    await saveGoals([]);
    resetGoalDraft();
    setShowGoalsModal(false);
  };

  const loadSampleGoals = async () => {
    const now = new Date().toISOString();
    const sampleGoals: WorkspaceGoal[] = [
      {
        id: `goal-sample-ed-${Date.now()}`,
        title: "Reduce avoidable ED utilization in high-risk members",
        description: "Coordinate claims-friction and care-management agents to identify and intervene on repeat low-acuity ED utilizers.",
        priority: "high",
        status: "active",
        kpiLabel: "ED visits per 1,000",
        baselineValue: 320,
        currentValue: 304,
        targetValue: 285,
        unit: "visits/1k",
        direction: "down",
        owner: "Care Management Lead",
        targetDate: "2026-06-30",
        successMetric: "ED visits / 1,000 reduced from 320 to 285 within 90 days",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `goal-sample-quality-${Date.now()}`,
        title: "Improve quality performance to clear shared-savings gate",
        description: "Focus multi-agent outreach on AWV, preventive screening, and care-gap closure cohorts most likely to lift quality score.",
        priority: "high",
        status: "active",
        kpiLabel: "Composite quality score",
        baselineValue: 68,
        currentValue: 71,
        targetValue: 75,
        unit: "pts",
        direction: "up",
        owner: "Quality Program Lead",
        targetDate: "2026-09-30",
        successMetric: "Composite quality score rises from 68 to 75 before year-end",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `goal-sample-settlement-${Date.now()}`,
        title: "Identify top 3 interventions to improve net settlement",
        description: "Use contract-performance and population agents to rank interventions by modeled upside and implementation effort.",
        priority: "medium",
        status: "planned",
        kpiLabel: "Modeled net upside",
        baselineValue: 0,
        currentValue: 120,
        targetValue: 750,
        unit: "$K",
        direction: "up",
        owner: "Population Health Director",
        targetDate: "2026-07-31",
        successMetric: "3 initiatives validated with modeled upside greater than $250K each",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `goal-sample-exec-${Date.now()}`,
        title: "Convert AI findings into a Q2 execution plan",
        description: "Transform multi-agent recommendations into an owner-assigned, milestone-based execution roadmap.",
        priority: "medium",
        status: "planned",
        kpiLabel: "Execution plan completion",
        baselineValue: 0,
        currentValue: 35,
        targetValue: 100,
        unit: "%",
        direction: "up",
        owner: "Operations PMO",
        targetDate: "2026-06-15",
        successMetric: "Top recommendations mapped to owners, milestones, and launch dates",
        createdAt: now,
        updatedAt: now,
      },
    ];

    const existingTitles = new Set(goals.map((goal) => goal.title.trim().toLowerCase()));
    const uniqueSamples = sampleGoals.filter((goal) => !existingTitles.has(goal.title.trim().toLowerCase()));
    if (!uniqueSamples.length) return;

    await saveGoals([...goals, ...uniqueSamples]);
  };

  const renderSection = (sectionId: WorkspaceSectionId) => {
    if (!sectionVisible(sectionId)) return null;

    switch (sectionId) {
      case "kpis":
        return kpiBlock?.kpis ? (
          <div key="kpis" className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {kpiBlock.kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{kpi.value}</p>
                <p className={`mt-1 text-xs font-semibold ${trendTone(kpi.trend)}`}>
                  {kpi.trend === "up" ? "↑ Improving" : kpi.trend === "down" ? "↓ Declining" : "→ Stable"}
                </p>
              </div>
            ))}
          </div>
        ) : null;
      case "trend":
        return trendBlock?.chartData ? (
          <div key="trend" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{trendBlock.title}</p>
            <div className="mt-3">
              <Sparkline data={trendBlock.chartData.map((point) => ({ value: point.value }))} stroke="#0f766e" />
            </div>
          </div>
        ) : null;
      case "visuals":
        return visualBlocks.length > 0 ? (
          <div key="visuals" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {visualBlocks.map((block) => (
              <section key={block.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">{block.title}</h3>
                {block.description ? <p className="mt-1 text-xs text-slate-600">{block.description}</p> : null}
                <div className="mt-3">{renderWorkspaceVisual(block)}</div>
              </section>
            ))}
          </div>
        ) : null;
      case "insights":
        return insightItems.length > 0 ? (
          <div key="insights" className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
            <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-sky-50 to-white px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">✨ Insight → Action → Prompt Flow</p>
                  <p className="mt-1 text-xs text-slate-600">
                    AI findings are translated into execution-ready actions and next prompts.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-700">{insightItems.length} insights</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">{actionItems.length} actions</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{promptItems.length} prompts</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50/40 p-5">
              {insightActionFlows.map((flow, index) => {
                const contributionAgent = flow.contributionAgentId ? getAgentById(flow.contributionAgentId) : null;

                return (
                  <article
                    key={`${flow.insight}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        <span>Card {index + 1}</span>
                        <span>•</span>
                        <span>AI Brief</span>
                      </p>
                      {contributionAgent && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          <span>{contributionAgent.icon}</span>
                          <span>{contributionAgent.shortLabel}</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-3 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">💡 Insight</p>
                      <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-800">{flow.insight}</p>
                    </div>

                    {!!flow.actions.length && (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">⚡ Recommended Actions</p>
                        <div className="mt-2.5 space-y-2">
                          {flow.actions.map((action) => {
                            const added = plannedActions.includes(action);
                            return (
                              <div
                                key={action}
                                className="flex items-start justify-between gap-3 rounded-lg border border-emerald-100 bg-white px-3 py-2.5"
                              >
                                <p className="text-sm leading-relaxed text-slate-700">{action}</p>
                                <button
                                  type="button"
                                  disabled={added}
                                  onClick={() => addActionToPlan(action)}
                                  className="shrink-0 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {added ? "Added" : "Add to plan"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {!!flow.prompts.length && (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">✨ Follow-up Prompts</p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {flow.prompts.map((prompt) => (
                            <span
                              key={prompt}
                              className="rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-800 shadow-sm"
                            >
                              {prompt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {flow.contributionNote && (
                      <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                        {flow.contributionNote}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ) : null;
      case "actions":
        return actionItems.length > 0 ? (
          <div key="actions" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">Action Plan</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                {plannedActions.length} planned
              </span>
            </div>

            {plannedActions.length > 0 && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Selected for execution</p>
                <ul className="mt-1 space-y-1 text-sm text-emerald-900">
                  {plannedActions.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {actionItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ) : null;
      case "next_questions":
        return promptItems.length > 0 ? (
          <div key="next_questions" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Prompt Trail</p>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Source Prompts Used</p>
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {workspace.sourcePrompts.slice(-4).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Suggested Follow-ups</p>
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {promptItems.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null;
      case "timeline":
        return (
          <div key="timeline" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Agent Contribution Timeline</h3>
            <div className="mt-3 space-y-3">
              {workspace.contributions.map((contribution) => {
                const agent = getAgentById(contribution.agentId);
                return (
                  <div key={contribution.id} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{agent.displayName}</p>
                    <p className="mt-1 text-xs text-slate-600">Prompt: {contribution.prompt}</p>
                    <p className="text-xs text-slate-500">{contribution.notes}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <FeatureGuard page="workspaces">
      <TrackPageView page={`/workspaces/${workspace.id}`} module="workspaces" properties={{ workspaceId: workspace.id }} />
      <div className="space-y-8">
        <Link href="/workspaces" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
          ← Back to Workspaces
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase text-slate-500">Synapse Workspace</p>
              {isActive && (
                <span className="mt-2 inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                  Currently Active Agent
                </span>
              )}
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{workspace.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{workspace.summary}</p>
              {goals.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {goals.slice(0, 3).map((goal) => (
                    <span key={goal.id} className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">
                      {goal.title}
                    </span>
                  ))}
                  {goals.length > 3 && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                      +{goals.length - 3} more goals
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowGoalsModal(true);
                  resetGoalDraft();
                }}
                className="whitespace-nowrap rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700"
              >
                {goals.length ? "🎯 Manage Goals" : "🎯 Set Goals"}
              </button>
              <button
                type="button"
                onClick={() => setShowCustomize((prev) => !prev)}
                className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {showCustomize ? "⚙️ Close Customize" : "⚙️ Customize View"}
              </button>
            </div>
          </div>

          <div className="mt-4 inline-flex rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Origin Agent: <span className="ml-1 font-semibold text-slate-900">{originAgent.displayName}</span>
          </div>

          {goals.length > 0 && (
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Goal KPI Progress</p>
                <span className="text-[11px] text-slate-500">{goals.length} goal{goals.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {goals.map((goal) => {
                  const progress = goalProgressPercent(goal);
                  const badge = getGoalHealthBadge(goal);
                  return (
                    <div key={`top-${goal.id}`} className="rounded-lg border border-indigo-100 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{goal.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{goal.kpiLabel ?? goal.successMetric ?? "Define KPI to enable progress tracking"}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded-md bg-slate-50 px-2 py-1"><span className="text-slate-500">Current</span><p className="font-semibold text-slate-800">{formatMetricValue(goal.currentValue, goal.unit)}</p></div>
                        <div className="rounded-md bg-slate-50 px-2 py-1"><span className="text-slate-500">Target</span><p className="font-semibold text-slate-800">{formatMetricValue(goal.targetValue, goal.unit)}</p></div>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${progress ?? 0}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              disabled={isActive}
              onClick={() => {
                setActiveWorkspaceId(workspace.id);
                setActiveWorkspaceIdState(workspace.id);
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {isActive ? "Currently Active Agent" : "Set as Active Workspace"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {workspace.contributingAgentIds.map((agentId) => {
              const agent = getAgentById(agentId);
              return (
                <button
                  key={agentId}
                  type="button"
                  onClick={() => {
                    setSelectedAgentId(agentId);
                    setShowAgentModal(true);
                  }}
                  className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  {agent.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {showGoalsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setShowGoalsModal(false)} role="presentation">
            <div className="w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl max-h-[92vh] overflow-hidden" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Workspace Goals">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Workspace Goals</p>
                  <p className="text-xs text-slate-600">Define explicit outcomes for your multi-agent workspace.</p>
                </div>
                <div className="flex items-center gap-2">
                  {goals.length > 0 && (
                    <button
                      type="button"
                      onClick={resetAllGoals}
                      className="whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Reset Goals
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={loadSampleGoals}
                    className="whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    Load Sample Goals
                  </button>
                  <button type="button" onClick={() => setShowGoalsModal(false)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                    Close
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 max-h-[70vh] overflow-y-auto pr-1">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current goals</p>
                  {goals.length ? goals.map((goal) => (
                    <div key={goal.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{goal.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getGoalHealthBadge(goal).className}`}>
                          {getGoalHealthBadge(goal).label}
                        </span>
                      </div>
                      {goal.description && <p className="mt-1 text-xs text-slate-600">{goal.description}</p>}
                      {goal.successMetric && (
                        <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs font-medium text-emerald-800">
                          Success metric: {goal.successMetric}
                        </p>
                      )}
                      {goal.kpiLabel && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">
                            <span className="text-slate-500">Current</span>
                            <p className="font-semibold text-slate-800">{formatMetricValue(goal.currentValue, goal.unit)}</p>
                          </div>
                          <div className="rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">
                            <span className="text-slate-500">Target</span>
                            <p className="font-semibold text-slate-800">{formatMetricValue(goal.targetValue, goal.unit)}</p>
                          </div>
                        </div>
                      )}
                      {(goal.owner || goal.targetDate) && (
                        <p className="mt-2 text-[11px] text-slate-500">
                          {goal.owner ? `Owner: ${goal.owner}` : "Owner: —"}
                          {goal.targetDate ? ` · Target: ${goal.targetDate}` : ""}
                        </p>
                      )}
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => openGoalForEdit(goal)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">Edit</button>
                        <button type="button" onClick={() => removeGoal(goal.id)} className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">Delete</button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-500">No goals yet.</p>
                  )}
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{editingGoalId ? "Edit goal" : "Add goal"}</p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Goal title</label>
                      <input value={goalDraft.title} onChange={(event) => setGoalDraft((current) => ({ ...current, title: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="e.g., Reduce avoidable ED utilization by 10%" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Description</label>
                      <textarea value={goalDraft.description} onChange={(event) => setGoalDraft((current) => ({ ...current, description: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" rows={3} placeholder="Optional context for agents" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Priority</label>
                        <select value={goalDraft.priority} onChange={(event) => setGoalDraft((current) => ({ ...current, priority: event.target.value as WorkspaceGoal["priority"] }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Status</label>
                        <select value={goalDraft.status} onChange={(event) => setGoalDraft((current) => ({ ...current, status: event.target.value as WorkspaceGoal["status"] }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                          <option value="active">Active</option>
                          <option value="planned">Planned</option>
                          <option value="blocked">Blocked</option>
                          <option value="complete">Complete</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Owner</label>
                        <input value={goalDraft.owner} onChange={(event) => setGoalDraft((current) => ({ ...current, owner: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="Optional" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700">Target date</label>
                        <input type="date" value={goalDraft.targetDate} onChange={(event) => setGoalDraft((current) => ({ ...current, targetDate: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Success metric</label>
                      <input value={goalDraft.successMetric} onChange={(event) => setGoalDraft((current) => ({ ...current, successMetric: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" placeholder="e.g., ED visits / 1,000 drops from 320 to 285" />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button type="button" onClick={resetGoalDraft} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Reset</button>
                      <button type="button" onClick={saveGoalDraft} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">{editingGoalId ? "Save goal" : "Add goal"}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAgentModal && selectedAgentId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onClick={() => setShowAgentModal(false)}
            role="button"
            tabIndex={-1}
          >
            <div
              className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh]"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {(() => {
                const agent = getAgentById(selectedAgentId);
                const suite = getSuiteById(agent.suiteId);
                const profile = getAgentProfileById(selectedAgentId);

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Agent Profile</p>
                        <p className="text-xs text-slate-600">Consistent with Agent Suite Directory hero details.</p>
                      </div>
                      <button
                        onClick={() => setShowAgentModal(false)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
                      >
                        Close
                      </button>
                    </div>

                    <div className="overflow-y-auto p-5 bg-slate-50/60 max-h-[75vh]">
                      <div className="space-y-4">
                        <div className={`rounded-2xl border p-5 shadow-sm ${agent.accent.bg} ${agent.accent.ring}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className={`flex h-11 w-11 items-center justify-center rounded-xl border bg-white/80 text-base ${agent.accent.text}`}>
                                {agent.icon}
                              </span>
                              <div>
                                <p className="text-[11px] font-semibold uppercase text-slate-500">Selected AI Agent</p>
                                <p className="text-base font-semibold text-slate-900">{agent.displayName}</p>
                                <p className="mt-1 text-xs text-slate-700">{agent.shortDescription}</p>
                              </div>
                            </div>
                            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                              {suite.name}
                            </span>
                          </div>

                          <p className="mt-3 text-xs leading-relaxed text-slate-700">{profile.detailedDescription}</p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {profile.excelsAt.slice(0, 3).map((item) => (
                              <span
                                key={item}
                                className="rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
                              <span>🗂️</span>
                              <span>Data utilized</span>
                            </p>
                            <ul className="mt-2 space-y-1 text-[11px] text-slate-700">
                              {profile.dataSources.map((source) => (
                                <li key={source}>• {source}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
                              <span>✨</span>
                              <span>Excels at</span>
                            </p>
                            <ul className="mt-2 space-y-1 text-[11px] text-slate-700">
                              {profile.excelsAt.map((item) => (
                                <li key={item}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
                              <span>⚡</span>
                              <span>Capabilities</span>
                            </p>
                            <ul className="mt-2 space-y-1 text-[11px] text-slate-700">
                              {profile.capabilities.map((capability) => (
                                <li key={capability}>• {capability}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {showCustomize && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Customize Visible Cards</p>
            <p className="mt-1 text-xs text-slate-500">Drag cards to reorder and toggle visibility. Changes are saved automatically.</p>
            <Reorder.Group
              axis="y"
              values={layout.sectionOrder as WorkspaceSectionId[]}
              onReorder={(newOrder) =>
                persistLayout({
                  sectionOrder: newOrder,
                  hiddenSections: layout.hiddenSections as WorkspaceSectionId[],
                })
              }
              className="mt-4 space-y-2"
            >
              {(layout.sectionOrder as WorkspaceSectionId[]).map((sectionId) => {
                const visible = sectionVisible(sectionId);
                return (
                  <Reorder.Item
                    key={sectionId}
                    value={sectionId}
                    className="flex cursor-grab items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 active:cursor-grabbing"
                  >
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-slate-400">⋮⋮</span>
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleSectionVisibility(sectionId)}
                      />
                      {SECTION_LABELS[sectionId]}
                    </label>
                    <span className="text-[11px] text-slate-400">Drag</span>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
        )}

        {(layout.sectionOrder as WorkspaceSectionId[])
          .map((sectionId) => renderSection(sectionId))
          .filter(Boolean)}
      </div>
    </FeatureGuard>
  );
}
