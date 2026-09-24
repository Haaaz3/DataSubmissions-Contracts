"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AreaChart,
  Area,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import FeatureGuard from "@/components/FeatureGuard";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import { SynapseAgentId, getSuiteById } from "@/lib/synapseai/agentRegistry";
import { getScriptedAgentResult } from "@/data/synthetic/agentResults";
import {
  getMeasureActionInsightById,
  inferMeasureInsightFromPrompt,
  type MeasureInsightCohort,
} from "@/data/synthetic/measureActionInsights";
import type { AgentResultKpi, AgentResultVisual } from "@/lib/models/agentResult";
import { getOrganizationQualityRows, getProviderQualityRows, toFinancialBand } from "@/lib/qualityData";
import { getActiveWorkspaceId } from "@/lib/workspaces/service";
import { loadWorkspaces } from "@/lib/storage/synapseStore";
import UsHotspotMap from "@/components/charts/UsHotspotMap";

type SortDirection = "asc" | "desc";
type SupportedSystemActionId =
  | "automated-care-management-enrollment"
  | "patient-outbound-outreach"
  | "provider-previsit-prep"
  | "navigation-assistance"
  | "medication-optimization-review"
  | "chart-review-abstraction";

type SupportedSystemAction = {
  id: SupportedSystemActionId;
  label: string;
  description: string;
};

type EditableCohort = MeasureInsightCohort & {
  actionId: SupportedSystemActionId;
};

const SUPPORTED_SYSTEM_ACTIONS: SupportedSystemAction[] = [
  {
    id: "automated-care-management-enrollment",
    label: "Automated Care Management Enrollment",
    description: "Auto-route selected members into longitudinal care-management workflows.",
  },
  {
    id: "patient-outbound-outreach",
    label: "Patient Outbound Outreach",
    description: "Launch outbound messaging campaigns via CRM/scheduling connectors.",
  },
  {
    id: "provider-previsit-prep",
    label: "Provider Pre-visit Prep",
    description: "Insert pre-visit prompts and order guidance into clinician workflow.",
  },
  {
    id: "navigation-assistance",
    label: "Navigation Assistance",
    description: "Route members with access barriers to navigation team workflows.",
  },
  {
    id: "medication-optimization-review",
    label: "Medication Optimization Review",
    description: "Queue pharmacist/provider reviews for therapy optimization.",
  },
  {
    id: "chart-review-abstraction",
    label: "Chart Review & Abstraction",
    description: "Queue charts for abstraction and external evidence validation.",
  },
];

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function sortRows<T>(rows: T[], key: keyof T, direction: SortDirection) {
  return [...rows].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }
    return direction === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
}

function SortHeader({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <span className="text-[10px] text-slate-400">↕</span>
    </span>
  );
}

function formatTrendDelta(value: number | null | undefined) {
  if (value == null) return "N/A";
  if (value > 0) return `+${value.toFixed(1)} pts`;
  if (value < 0) return `${value.toFixed(1)} pts`;
  return "0.0 pts";
}

const VISUAL_COLORS = ["#4f46e5", "#0ea5e9", "#14b8a6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

function renderAgentVisual(visual: AgentResultVisual) {
  if (visual.type === "wordCloud") {
    const max = Math.max(...visual.data.map((d) => d.value), 1);
    return (
      <div className="flex flex-wrap gap-2">
        {visual.data.map((item) => {
          const size = 11 + Math.round((item.value / max) * 11);
          return (
            <span
              key={`${visual.id}-${item.label}`}
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

  if (visual.type === "usMap") {
    return <UsHotspotMap data={visual.data} />;
  }

  if (visual.type === "geo") {
    const max = Math.max(...visual.data.map((d) => d.value), 1);
    return (
      <div className="space-y-2">
        {visual.data.map((item) => (
          <div key={`${visual.id}-${item.label}`}>
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
      {visual.type === "line" ? (
        <LineChart data={visual.data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      ) : visual.type === "bar" ? (
        <BarChart data={visual.data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {visual.data.map((entry, index) => (
              <Cell key={`${visual.id}-${entry.label}`} fill={VISUAL_COLORS[index % VISUAL_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      ) : visual.type === "stackedBar" ? (
        <BarChart data={visual.data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar stackId="a" dataKey="value" name={visual.seriesLabels?.[0] ?? "Primary"} fill="#4f46e5" />
          <Bar stackId="a" dataKey="valueSecondary" name={visual.seriesLabels?.[1] ?? "Secondary"} fill="#0ea5e9" />
          <Bar stackId="a" dataKey="valueTertiary" name={visual.seriesLabels?.[2] ?? "Tertiary"} fill="#14b8a6" />
        </BarChart>
      ) : visual.type === "donut" ? (
        <PieChart>
          <Tooltip />
          <Pie data={visual.data} dataKey="value" nameKey="label" innerRadius={52} outerRadius={80} paddingAngle={2}>
            {visual.data.map((entry, index) => (
              <Cell key={`${visual.id}-${entry.label}`} fill={VISUAL_COLORS[index % VISUAL_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      ) : visual.type === "radar" || visual.type === "polarArea" ? (
        <RadarChart data={visual.data} outerRadius={86}>
          <PolarGrid />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis tick={{ fontSize: 10 }} />
          <Radar dataKey="value" fill="#4f46e5" fillOpacity={0.35} stroke="#4f46e5" />
          <Tooltip />
        </RadarChart>
      ) : (
        <BarChart data={visual.data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
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

function trendTone(trend?: AgentResultKpi["trend"]) {
  if (trend === "up") return "text-emerald-700";
  if (trend === "down") return "text-rose-700";
  return "text-slate-600";
}

function inferActionIdFromRecommendation(recommendedAction: string): SupportedSystemActionId {
  const text = recommendedAction.toLowerCase();
  if (text.includes("care management") || text.includes("care-management")) return "automated-care-management-enrollment";
  if (text.includes("outreach") || text.includes("campaign")) return "patient-outbound-outreach";
  if (text.includes("pre-visit") || text.includes("provider")) return "provider-previsit-prep";
  if (text.includes("navigation") || text.includes("barrier")) return "navigation-assistance";
  if (text.includes("medication") || text.includes("pharmac")) return "medication-optimization-review";
  if (text.includes("chart") || text.includes("abstraction") || text.includes("retrieval")) return "chart-review-abstraction";
  return "patient-outbound-outreach";
}

function derivePatientCountFromDefinition(cohort: Pick<EditableCohort, "criteria" | "resourceNeed" | "actionId" | "automationSummary">) {
  const criteriaCount = Math.max(1, cohort.criteria.length);
  const actionBase: Record<SupportedSystemActionId, number> = {
    "automated-care-management-enrollment": 220,
    "patient-outbound-outreach": 520,
    "provider-previsit-prep": 360,
    "navigation-assistance": 260,
    "medication-optimization-review": 180,
    "chart-review-abstraction": 140,
  };

  const resourceMultiplier = cohort.resourceNeed === "High" ? 0.78 : cohort.resourceNeed === "Low" ? 1.18 : 1;
  const criteriaMultiplier = Math.max(0.45, 1.15 - (criteriaCount - 1) * 0.12);
  const automationBoost = cohort.automationSummary?.trim() ? 1.06 : 1;

  return Math.max(25, Math.round(actionBase[cohort.actionId] * resourceMultiplier * criteriaMultiplier * automationBoost));
}

function MeasureTrendTooltip(props: TooltipProps<number, string>) {
  const { active, payload, label } = props as TooltipProps<number, string> & {
    payload?: Array<{ payload?: unknown }>;
    label?: string;
  };
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as
    | {
        month: string;
        priorYear: number;
        currentYear: number | null;
        target: number;
        priorYearMoM: number | null;
        currentYearMoM: number | null;
      }
    | undefined;

  if (!point) return null;

  return (
    <div className="min-w-[240px] rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 space-y-1.5 text-xs">
        <p className="flex items-center justify-between text-slate-700">
          <span>Prior year</span>
          <span className="font-semibold text-emerald-700">{point.priorYear.toFixed(1)}%</span>
        </p>
        <p className="flex items-center justify-between text-slate-700">
          <span>Prior year MoM</span>
          <span className="font-semibold text-emerald-700">{formatTrendDelta(point.priorYearMoM)}</span>
        </p>
        <p className="flex items-center justify-between text-slate-700">
          <span>Current year</span>
          <span className="font-semibold text-indigo-700">
            {point.currentYear == null ? "No data" : `${point.currentYear.toFixed(1)}%`}
          </span>
        </p>
        <p className="flex items-center justify-between text-slate-700">
          <span>Current year MoM</span>
          <span className="font-semibold text-indigo-700">{formatTrendDelta(point.currentYearMoM)}</span>
        </p>
        <p className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2 text-slate-700">
          <span>Target</span>
          <span className="font-semibold text-emerald-700">{point.target}%</span>
        </p>
      </div>
    </div>
  );
}

export default function SynapseResultsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading insight...</div>}>
      <SynapseResultsPageContent />
    </Suspense>
  );
}

function SynapseResultsPageContent() {
  const { flags } = useFeatureFlags();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeWorkspaceName, setActiveWorkspaceName] = useState<string | null>(null);
  const [isWorkspaceNameEditorOpen, setIsWorkspaceNameEditorOpen] = useState(false);
  const [workspaceNameDraft, setWorkspaceNameDraft] = useState("");

  useEffect(() => {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
  }, []);

  const agentId = (searchParams.get("agent") as SynapseAgentId | null) ?? "quality_care_gap";
  const suiteId = searchParams.get("suite") ?? "oracle_health";
  const route = searchParams.get("route") ?? "/quality";
  const prompt = searchParams.get("prompt") ?? "Which quality measures need improvement?";
  const insightType = searchParams.get("insight");
  const measureId = searchParams.get("measureId");
  const isMeasureActionRequest = insightType === "measure-action";
  const source = searchParams.get("source");
  const executionMode = searchParams.get("executionMode") ?? "manual";
  const projectId = searchParams.get("projectId");
  const hasExecutionContext = source === "quality-top-opportunity" && isMeasureActionRequest;

  const executionModeLabel: Record<string, string> = {
    automated: "Auto-running",
    approval_required: "Needs review",
    manual: "Recommended",
  };
  const executionModeClass: Record<string, string> = {
    automated: "border-emerald-300 bg-emerald-50 text-emerald-700",
    approval_required: "border-amber-300 bg-amber-50 text-amber-700",
    manual: "border-slate-300 bg-slate-50 text-slate-700",
  };

  const suite = getSuiteById(suiteId as never);
  const suiteName = suite?.name ?? "Synapse AI";

  useEffect(() => {
    let cancelled = false;
    const nextActiveId = getActiveWorkspaceId();
    setActiveWorkspaceId(nextActiveId);

    loadWorkspaces().then((items) => {
      if (cancelled) return;
      const active = items.find((workspace) => workspace.id === nextActiveId);
      setActiveWorkspaceName(active?.title ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const buildWorkspaceIntentHref = (intent: "create" | "add", workspaceName?: string) => {
    const params = new URLSearchParams({
      intent,
      agent: agentId,
      prompt,
      route,
    });

    if (intent === "create") {
      const trimmedName = workspaceName?.trim();
      if (trimmedName) params.set("name", trimmedName);
    }

    if (intent === "add" && activeWorkspaceId) {
      params.set("workspaceId", activeWorkspaceId);
    }

    return `/workspaces?${params.toString()}`;
  };

  const measureInsight = useMemo(() => {
    if (isMeasureActionRequest) {
      return getMeasureActionInsightById(measureId) ?? inferMeasureInsightFromPrompt(prompt);
    }
    return inferMeasureInsightFromPrompt(prompt);
  }, [isMeasureActionRequest, measureId, prompt]);

  const rankedCohorts = useMemo(() => {
    if (!measureInsight) return [];
    return [...measureInsight.cohorts].sort(
      (a, b) =>
        (b.efficiencyScore ?? 0) - (a.efficiencyScore ?? 0) ||
        (b.estimatedImpactValue ?? 0) - (a.estimatedImpactValue ?? 0)
    );
  }, [measureInsight]);

  const [editableCohorts, setEditableCohorts] = useState<EditableCohort[]>([]);
  const [isCohortEditorOpen, setIsCohortEditorOpen] = useState(false);
  const [editingCohortId, setEditingCohortId] = useState<string | null>(null);
  const [draftCohort, setDraftCohort] = useState<EditableCohort | null>(null);
  const [newCriterion, setNewCriterion] = useState("");

  useEffect(() => {
    setEditableCohorts(
      rankedCohorts.map((cohort) => ({
        ...cohort,
        actionId: inferActionIdFromRecommendation(cohort.recommendedAction),
      }))
    );
  }, [rankedCohorts]);

  useEffect(() => {
    if (!isCohortEditorOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCohortEditorOpen]);

  const organizationRows = useMemo(() => getOrganizationQualityRows({ measureId: measureInsight?.measureId }), [measureInsight?.measureId]);
  const providerRows = useMemo(() => getProviderQualityRows({ measureId: measureInsight?.measureId }), [measureInsight?.measureId]);

  const [orgSort, setOrgSort] = useState<{ key: string; dir: SortDirection }>({ key: "qualityScore", dir: "desc" });
  const [providerSort, setProviderSort] = useState<{ key: string; dir: SortDirection }>({ key: "qualityScore", dir: "desc" });

  const sortedOrganizations = useMemo(() => sortRows(organizationRows, orgSort.key as keyof (typeof organizationRows)[number], orgSort.dir), [organizationRows, orgSort]);
  const sortedProviders = useMemo(() => sortRows(providerRows, providerSort.key as keyof (typeof providerRows)[number], providerSort.dir), [providerRows, providerSort]);

  const toggleSort = <T,>(current: { key: keyof T; dir: SortDirection }, setState: (value: { key: keyof T; dir: SortDirection }) => void, key: keyof T) => {
    setState({ key, dir: current.key === key && current.dir === "desc" ? "asc" : "desc" });
  };

  const buildCohortProjectHref = (cohort: EditableCohort) => {
    const currentParams = searchParams.toString();
    const nextUrl = currentParams ? `/synapse/results?${currentParams}` : "/synapse/results";
    const params = new URLSearchParams({
      destination: "project",
      source: "measure-insight-cohort",
      actionLabel: cohort.recommendedAction,
      workflowType: cohort.workflowSystem,
      contextName: cohort.name,
      owner: cohort.primaryOwner,
      next: nextUrl,
    });
    return `/synapse/loading?${params.toString()}`;
  };

  const getTopCohortCta = (cohort: EditableCohort, idx: number) => {
    if (idx !== 0 || !hasExecutionContext) {
      return {
        href: buildCohortProjectHref(cohort),
        label: `Agent auto-execute: ${cohort.ctaLabel} →`,
      };
    }

    if (executionMode === "automated") {
      return {
        href: projectId ? `/projects/${projectId}` : "/quality",
        label: "Open active workflow in Quality →",
      };
    }

    if (executionMode === "approval_required") {
      return {
        href: "/quality",
        label: "Review blocker in Quality →",
      };
    }

    return {
      href: buildCohortProjectHref(cohort),
      label: `Launch recommended action: ${cohort.ctaLabel} →`,
    };
  };

  const visibleCohorts = [...editableCohorts]
    .sort(
      (a, b) =>
        (b.efficiencyScore ?? 0) - (a.efficiencyScore ?? 0) ||
        (b.estimatedImpactValue ?? 0) - (a.estimatedImpactValue ?? 0)
    )
    .slice(0, 3);

  const openCreateCohort = () => {
    const defaultAction = SUPPORTED_SYSTEM_ACTIONS[0];
    setEditingCohortId(null);
    setDraftCohort({
      id: `custom-${Date.now()}`,
      name: "New Cohort",
      patientCount: 0,
      cohortDescription: "",
      recommendedAction: defaultAction.label,
      actionId: defaultAction.id,
      primaryOwner: "Population Health Operations",
      workflowSystem: "Workflow queue",
      estimatedImpact: "TBD",
      automationSummary: "",
      resourceNeed: "Medium",
      criteria: [],
      ctaLabel: "Launch action",
    });
    setNewCriterion("");
    setIsCohortEditorOpen(true);
  };

  const openEditCohort = (cohort: EditableCohort) => {
    setEditingCohortId(cohort.id);
    setDraftCohort({ ...cohort });
    setNewCriterion("");
    setIsCohortEditorOpen(true);
  };

  const duplicateCohort = (cohort: EditableCohort) => {
    const duplicateId = `${cohort.id}-copy-${Date.now()}`;
    const duplicated: EditableCohort = {
      ...cohort,
      id: duplicateId,
      name: `${cohort.name} (Copy)`,
    };
    setEditableCohorts((prev) => [duplicated, ...prev]);
  };

  const deleteCohort = (cohortId: string) => {
    setEditableCohorts((prev) => prev.filter((cohort) => cohort.id !== cohortId));
    if (editingCohortId === cohortId) {
      setIsCohortEditorOpen(false);
      setDraftCohort(null);
      setEditingCohortId(null);
      setNewCriterion("");
    }
  };

  const addCriterionToDraft = () => {
    if (!draftCohort) return;
    const trimmed = newCriterion.trim();
    if (!trimmed) return;
    setDraftCohort({
      ...draftCohort,
      criteria: [...draftCohort.criteria, trimmed],
    });
    setNewCriterion("");
  };

  const removeCriterionFromDraft = (index: number) => {
    if (!draftCohort) return;
    setDraftCohort({
      ...draftCohort,
      criteria: draftCohort.criteria.filter((_, idx) => idx !== index),
    });
  };

  const saveCohort = () => {
    if (!draftCohort?.actionId) return;
    const action = SUPPORTED_SYSTEM_ACTIONS.find((item) => item.id === draftCohort.actionId);
    const derivedPatientCount = derivePatientCountFromDefinition(draftCohort);
    const next = {
      ...draftCohort,
      recommendedAction: action?.label ?? draftCohort.recommendedAction,
      patientCount: derivedPatientCount,
    };

    setEditableCohorts((prev) => {
      if (editingCohortId) {
        return prev.map((item) => (item.id === editingCohortId ? next : item));
      }
      return [next, ...prev];
    });

    setIsCohortEditorOpen(false);
    setDraftCohort(null);
    setEditingCohortId(null);
  };

  const formatFinancial = (value: number) => (flags.showFinancialData ? USD.format(value) : toFinancialBand(value));

  if (isMeasureActionRequest && !measureInsight) {
    return (
      <FeatureGuard page="quality">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Action plan unavailable</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">We could not find a measure-specific action plan</h1>
          <p className="mt-2 text-sm text-slate-700">
            This measure does not yet have a fully generated synthetic insight package. You can still open a broader agent response or return to Quality Opportunities.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/synapse/results?${new URLSearchParams({ prompt, agent: agentId, suite: suiteId, route }).toString()}`}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Open general agent response
            </Link>
            <Link href="/quality" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Back to Quality
            </Link>
          </div>
        </div>
      </FeatureGuard>
    );
  }

  if (measureInsight) {
    const chartData = measureInsight.trend.map((point, idx) => {
      const denominator2025 = Math.round((measureInsight.totalScorablePatients * (idx + 1)) / 12);
      const denominator2026 = idx <= 2 ? Math.round((measureInsight.totalScorablePatients * (idx + 1)) / 12) : null;
      return {
        ...point,
        denominator2025,
        denominator2026,
      };
    });

    const momHighlights = chartData.slice(0, 3).filter((point) => point.currentYear != null);

    return (
      <FeatureGuard page="quality">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href="/quality" className="text-lg text-slate-500 hover:text-slate-700">←</Link>
                  <h1 className="text-2xl font-bold text-slate-900">{measureInsight.measureName}</h1>
                  <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{suiteName} AI Agent</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{measureInsight.contextualSummary}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-slate-500">Last Updated: {measureInsight.lastUpdated}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {measureInsight.kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{kpi.value}</p>
                  <p className="text-xs text-slate-500">{kpi.delta}</p>
                </div>
              ))}
            </div>

            {hasExecutionContext ? (
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Action plan status</p>
                <p className="mt-1 text-sm text-slate-800">
                  This action plan was generated from a top quality opportunity and includes agent analysis, proposed execution cohorts, and project pathways.
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 font-semibold ${executionModeClass[executionMode] ?? executionModeClass.manual}`}>
                    {executionModeLabel[executionMode] ?? executionModeLabel.manual}
                  </span>
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    Analysis complete
                  </span>
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    Proposed projects: {visibleCohorts.length}
                  </span>
                </div>
              </div>
            ) : null}

            {measureInsight.financialModel ? (
              <div className="mt-6 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Financial impact depth if target is achieved</p>
                {flags.showFinancialData ? (
                  <>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      <div className="rounded-md border border-slate-200 bg-white px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Current value</p><p className="text-sm font-bold text-slate-900">{USD.format(measureInsight.financialModel.currentPerformanceImpact)}</p></div>
                      <div className="rounded-md border border-emerald-200 bg-white px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">At target upside</p><p className="text-sm font-bold text-emerald-800">+{USD.format((measureInsight.financialModel.tiers[0]?.incrementalImpact ?? 0) + (measureInsight.financialModel.tiers[1]?.incrementalImpact ?? 0))}</p></div>
                      <div className="rounded-md border border-slate-200 bg-white px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Maximum incentive</p><p className="text-sm font-bold text-slate-900">{USD.format(measureInsight.financialModel.maxIncentive)}</p></div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Current value</p><p className="text-sm font-bold text-slate-900">{toFinancialBand(measureInsight.financialModel.currentPerformanceImpact)}</p></div>
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Target upside</p><p className="text-sm font-bold text-slate-900">{toFinancialBand((measureInsight.financialModel.tiers[0]?.incrementalImpact ?? 0) + (measureInsight.financialModel.tiers[1]?.incrementalImpact ?? 0))}</p></div>
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Incentive potential</p><p className="text-sm font-bold text-slate-900">{toFinancialBand(measureInsight.financialModel.maxIncentive)}</p></div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Measure Performance Trend ({measureInsight.measureName}, YTD 2026)</p>
              <p className="mt-1 text-xs text-slate-500">Performance trend compared to prior year with target baseline.</p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Prior year</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />Current year</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Target</span>
              </div>

              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priorYearGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="currentYearGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} domain={[0, "dataMax + 8"]} />
                    <Tooltip content={<MeasureTrendTooltip />} cursor={{ stroke: "#64748b", strokeWidth: 1, strokeDasharray: "4 4" }} />

                    <ReferenceLine
                      y={measureInsight.targetPerformance}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      label={{
                        value: `Target ${measureInsight.targetPerformance}%`,
                        position: "insideTopRight",
                        fill: "#b45309",
                        fontSize: 10,
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="priorYear"
                      name="Prior year"
                      stroke="#059669"
                      strokeWidth={2.2}
                      fill="url(#priorYearGradient)"
                      dot={{ r: 2.5, fill: "#059669", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#059669" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="currentYear"
                      name="Current year"
                      stroke="#4f46e5"
                      strokeWidth={2.4}
                      fill="url(#currentYearGradient)"
                      dot={{ r: 3, fill: "#4f46e5", strokeWidth: 0 }}
                      activeDot={{ r: 5.5, fill: "#4f46e5" }}
                      connectNulls={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {momHighlights.map((point) => (
                  <div key={`mom-${point.month}`} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{point.month} MoM</p>
                    <p className="text-sm font-semibold text-slate-900">{formatTrendDelta(point.currentYearMoM)}</p>
                  </div>
                ))}
              </div>
          </div>

          <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">What the agent did</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">5-step automated analysis pipeline (click to expand)</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Collapsed by default</span>
              </div>
            </summary>
            <div className="mt-4 space-y-3">
              {[
                {
                  icon: "🧠",
                  title: "Ingested denominator and multimodal clinical signals",
                  detail:
                    "Pulled structured and semi-structured data (labs, meds, vitals, appointments, orders, and workflow history) to establish each member’s true closure status.",
                  status: "Completed",
                },
                {
                  icon: "📚",
                  title: "Automatically scrubbed every patient chart",
                  detail:
                    "Systematically reviewed chart-level evidence for every eligible member across encounter history, ordering patterns, completion events, and prior interventions.",
                  status: "Completed",
                },
                {
                  icon: "📝",
                  title: "Applied NLP to patient notes and documentation",
                  detail:
                    "Parsed unstructured notes to extract closure-relevant signals such as completed screenings, refusals, contraindications, access barriers, outside results, and follow-up intent.",
                  status: "Completed",
                },
                {
                  icon: "⚙️",
                  title: "Applied measure logic and actionability scoring",
                  detail:
                    "Reconciled structured + NLP-derived evidence, then scored each member by closure potential, operational friction, and intervention fit to prioritize next-best actions.",
                  status: "Completed",
                },
                {
                  icon: "🤖",
                  title: "Auto-generated cohorts and workflow plans",
                  detail:
                    "Clustered members into execution-ready cohorts and generated automation-ready workflow plans with clear owners, sequencing, and impact expectations.",
                  status: "Ready",
                },
              ].map((step, idx) => (
                <div key={step.title} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-base" aria-hidden>{step.icon}</span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{idx + 1}. {step.title}</p>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">{step.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>

          <div id="cohorts-section" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Actionable cohorts</p>
                <p className="mt-1 text-xs text-slate-500">
                  Execution-ready cohorts prioritized by expected impact and operational effort.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500">Showing top {Math.min(visibleCohorts.length, editableCohorts.length)} of {editableCohorts.length} cohorts</p>
                <button
                  type="button"
                  onClick={openCreateCohort}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  Create cohort
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {visibleCohorts.map((cohort, idx) => (
                <div
                  key={cohort.id}
                  className={`rounded-xl border bg-white p-5 shadow-sm ${
                    idx === 0
                      ? "border-emerald-300 ring-2 ring-emerald-100"
                      : "border-slate-200"
                  }`}
                >
                  {idx === 0 ? (
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <div className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Top suggested action
                      </div>
                      {hasExecutionContext ? (
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${executionModeClass[executionMode] ?? executionModeClass.manual}`}>
                          {executionModeLabel[executionMode] ?? executionModeLabel.manual}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      #{idx + 1}
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{cohort.name}</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{cohort.patientCount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">patients</p>
                  <p className="mt-3 text-sm text-slate-700">{cohort.cohortDescription}</p>

                  <div className="mt-3 rounded-md bg-indigo-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                      {idx === 0 && hasExecutionContext && executionMode === "automated"
                        ? "Auto-executed action"
                        : "Recommended action"}
                    </p>
                    <p className="mt-1 text-sm text-indigo-900">{cohort.recommendedAction}</p>
                    <p className="mt-1 text-[11px] text-indigo-800">
                      System action (1:1): {SUPPORTED_SYSTEM_ACTIONS.find((item) => item.id === cohort.actionId)?.label}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Owner</p>
                      <p className="mt-0.5 font-semibold text-slate-800">{cohort.primaryOwner}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Workflow</p>
                      <p className="mt-0.5 font-semibold text-slate-800">{cohort.workflowSystem}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Efficiency score</p>
                      <p className="mt-0.5 font-semibold text-slate-800">{cohort.efficiencyScore ?? "—"}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Criteria matched</p>
                      <p className="mt-0.5 font-semibold text-slate-800">{cohort.criteria?.length ?? 0}</p>
                    </div>
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-wide text-emerald-700">Expected impact</p>
                      <p className="mt-0.5 font-semibold text-emerald-900">{cohort.estimatedImpactValue != null ? `${cohort.estimatedImpactValue.toLocaleString()} expected closures` : cohort.estimatedImpact}</p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Financial insight</p>
                      <p className="mt-0.5 font-semibold text-slate-800">
                        {cohort.expectedTierLabel ?? "Tier progression pending"}
                        {cohort.incrementalFinancialImpact != null ? ` · ${formatFinancial(cohort.incrementalFinancialImpact)}` : ""}
                      </p>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 sm:col-span-2">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Resourcing need</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cohort.resourceNeed === "High" ? "bg-rose-100 text-rose-700" : cohort.resourceNeed === "Medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {cohort.resourceNeed ?? "Low"}
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const cta = getTopCohortCta(cohort, idx);
                    return (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={cta.href}
                          className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                        >
                          {cta.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditCohort(cohort)}
                          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit cohort
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateCohort(cohort)}
                          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCohort(cohort.id)}
                          className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>

          {isCohortEditorOpen && draftCohort ? (
            <div className="fixed inset-0 z-50 bg-slate-900/35" onClick={() => setIsCohortEditorOpen(false)}>
              <div
                role="dialog"
                aria-modal="true"
                className="mx-auto mt-16 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <h3 className="text-base font-semibold text-slate-900">
                  {editingCohortId ? "Edit cohort" : "Create cohort"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">Each cohort must map to exactly one supported action.</p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="text-xs text-slate-600">Cohort name
                    <input className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm" value={draftCohort.name} onChange={(e) => setDraftCohort({ ...draftCohort, name: e.target.value })} />
                  </label>
                  <label className="text-xs text-slate-600">Patient count
                    <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm font-semibold text-slate-800">
                      {derivePatientCountFromDefinition(draftCohort).toLocaleString()} (auto-generated)
                    </div>
                  </label>
                  <label className="text-xs text-slate-600 md:col-span-2">Description
                    <textarea className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm" rows={3} value={draftCohort.cohortDescription} onChange={(e) => setDraftCohort({ ...draftCohort, cohortDescription: e.target.value })} />
                  </label>
                  <label className="text-xs text-slate-600">Owner
                    <input className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm" value={draftCohort.primaryOwner} onChange={(e) => setDraftCohort({ ...draftCohort, primaryOwner: e.target.value })} />
                  </label>
                  <label className="text-xs text-slate-600">Workflow system
                    <input className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm" value={draftCohort.workflowSystem} onChange={(e) => setDraftCohort({ ...draftCohort, workflowSystem: e.target.value })} />
                  </label>
                  <label className="text-xs text-slate-600">Resource need
                    <select
                      className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm"
                      value={draftCohort.resourceNeed ?? "Medium"}
                      onChange={(e) => setDraftCohort({ ...draftCohort, resourceNeed: e.target.value as "Low" | "Medium" | "High" })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </label>
                  <label className="text-xs text-slate-600">CTA label
                    <input className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm" value={draftCohort.ctaLabel} onChange={(e) => setDraftCohort({ ...draftCohort, ctaLabel: e.target.value })} />
                  </label>
                  <label className="text-xs text-slate-600 md:col-span-2">Estimated impact
                    <input className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm" value={draftCohort.estimatedImpact} onChange={(e) => setDraftCohort({ ...draftCohort, estimatedImpact: e.target.value })} />
                  </label>
                  <label className="text-xs text-slate-600 md:col-span-2">Automation summary
                    <textarea className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm" rows={2} value={draftCohort.automationSummary ?? ""} onChange={(e) => setDraftCohort({ ...draftCohort, automationSummary: e.target.value })} />
                  </label>
                  <label className="text-xs text-slate-600 md:col-span-2">Supported action (required, 1:1)
                    <select
                      className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm"
                      value={draftCohort.actionId}
                      onChange={(e) => setDraftCohort({ ...draftCohort, actionId: e.target.value as SupportedSystemActionId })}
                    >
                      {SUPPORTED_SYSTEM_ACTIONS.map((action) => (
                        <option key={action.id} value={action.id}>{action.label}</option>
                      ))}
                    </select>
                  </label>
                  <div className="rounded-md border border-indigo-200 bg-indigo-50 p-2.5 text-xs text-indigo-800 md:col-span-2">
                    <p className="font-semibold">Selected system action</p>
                    <p className="mt-0.5">
                      {SUPPORTED_SYSTEM_ACTIONS.find((action) => action.id === draftCohort.actionId)?.description}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-600">Cohort criteria</p>
                    <div className="mt-1 flex gap-2">
                      <input
                        className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm"
                        value={newCriterion}
                        onChange={(e) => setNewCriterion(e.target.value)}
                        placeholder="Add criterion (e.g., Upcoming PCP visit in 30 days)"
                      />
                      <button type="button" onClick={addCriterionToDraft} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {draftCohort.criteria.map((criterion, idx) => (
                        <span key={`${criterion}-${idx}`} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                          {criterion}
                          <button
                            type="button"
                            onClick={() => removeCriterionFromDraft(idx)}
                            className="rounded-full bg-slate-200 px-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {!draftCohort.criteria.length ? (
                        <p className="text-[11px] text-slate-500">No criteria added yet.</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsCohortEditorOpen(false)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Cancel</button>
                  <button type="button" onClick={saveCohort} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Save cohort</button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Organizations</h3>
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr className="bg-slate-50">
                      {[["Organization", "organizationName"], ["Type", "type"], ["Region", "region"], ["Providers", "providerCount"], ["Eligible", "eligibleMembers"], ["Quality", "qualityScore"], ["Gaps", "careGaps"], ["Financial", "estimatedFinancialImpact"]].map(([header, key]) => (
                        <th key={header} onClick={() => toggleSort(orgSort as never, setOrgSort as never, key as never)} className="cursor-pointer px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"><SortHeader label={header} /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedOrganizations.map((org, idx) => (
                      <tr key={org.id}>
                        <td className="px-3 py-2 text-xs font-semibold text-slate-900">#{idx + 1} {org.organizationName}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{org.type}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{org.region}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{org.providerCount}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{org.eligibleMembers.toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs font-semibold text-slate-900">{org.qualityScore}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{org.careGaps.toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs font-semibold text-emerald-700">{formatFinancial(org.estimatedFinancialImpact)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-base font-semibold text-slate-900">Providers</h3>
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr className="bg-slate-50">
                      {[["Provider", "providerName"], ["Specialty", "specialty"], ["Organization", "organizationName"], ["Eligible", "eligibleMembers"], ["Quality", "qualityScore"], ["Gaps", "careGaps"], ["Closure", "closureRate"], ["Financial", "estimatedFinancialImpact"]].map(([header, key]) => (
                        <th key={header} onClick={() => toggleSort(providerSort as never, setProviderSort as never, key as never)} className="cursor-pointer px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"><SortHeader label={header} /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedProviders.map((provider, idx) => (
                      <tr key={provider.id}>
                        <td className="px-3 py-2 text-xs font-semibold text-slate-900">#{idx + 1} {provider.providerName}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{provider.specialty}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{provider.organizationName}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{provider.eligibleMembers.toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs font-semibold text-slate-900">{provider.qualityScore}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{provider.careGaps.toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{provider.closureRate}%</td>
                        <td className="px-3 py-2 text-xs font-semibold text-emerald-700">{formatFinancial(provider.estimatedFinancialImpact)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </FeatureGuard>
    );
  }

  const genericResult = getScriptedAgentResult({ agentId, prompt, routeContext: route });

  return (
    <FeatureGuard page="projects">
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Agent Response</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{genericResult.title}</h1>
          <p className="mt-2 text-sm text-slate-700">{genericResult.summary}</p>

          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Workspace actions</p>
            <p className="mt-1 text-xs text-slate-700">Save this agent response as a new workspace or add it to your current active workspace.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setWorkspaceNameDraft(genericResult.title);
                  setIsWorkspaceNameEditorOpen(true);
                }}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Save as New Workspace
              </button>
              <button
                type="button"
                disabled={!activeWorkspaceId}
                onClick={() => {
                  if (!activeWorkspaceId) return;
                  router.push(buildWorkspaceIntentHref("add"));
                }}
                className="inline-flex items-center rounded-lg border border-indigo-300 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add to Active Workspace
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-600">
              {activeWorkspaceId && activeWorkspaceName
                ? `Active workspace: ${activeWorkspaceName}`
                : "No active workspace selected. Set one in Workspaces to enable add-mode."}
            </p>
          </div>
        </div>

        {isWorkspaceNameEditorOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={() => setIsWorkspaceNameEditorOpen(false)}>
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="text-sm font-semibold text-slate-900">Save as New Workspace</h3>
              <p className="mt-1 text-xs text-slate-600">Name your workspace before saving this agent response.</p>
              <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">Workspace name</label>
              <input
                value={workspaceNameDraft}
                onChange={(event) => setWorkspaceNameDraft(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-2.5 py-2 text-sm text-slate-900"
                placeholder="Enter workspace name"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWorkspaceNameEditorOpen(false)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmedName = workspaceNameDraft.trim();
                    if (!trimmedName) return;
                    router.push(buildWorkspaceIntentHref("create", trimmedName));
                    setIsWorkspaceNameEditorOpen(false);
                  }}
                  disabled={!workspaceNameDraft.trim()}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save Workspace
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {genericResult.kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{kpi.value}</p>
              <p className={`mt-1 text-xs font-semibold ${trendTone(kpi.trend)}`}>
                {kpi.trend === "up" ? "↑ Improving" : kpi.trend === "down" ? "↓ Declining" : "→ Stable"}
                {kpi.subtext ? ` · ${kpi.subtext}` : ""}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {genericResult.visuals.map((visual) => (
            <section key={visual.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">{visual.title}</h3>
              {visual.description ? <p className="mt-1 text-xs text-slate-600">{visual.description}</p> : null}
              <div className="mt-3">{renderAgentVisual(visual)}</div>
            </section>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Key Insights</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {genericResult.insights.map((insight) => (
                <li key={insight}>• {insight}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Recommended Actions</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {genericResult.actions.map((action) => (
                <li key={action}>• {action}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Suggested Follow-ups</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {genericResult.nextQuestions.map((question) => (
                <li key={question}>• {question}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </FeatureGuard>
  );
}
