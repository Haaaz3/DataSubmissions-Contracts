"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Tabs from "@/components/Tabs";
import FeatureGuard from "@/components/FeatureGuard";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import { mockContracts } from "@/lib/mockData";
import { Project } from "@/lib/models/project";
import { loadProjects, makeId, saveProjects } from "@/lib/storage/synapseStore";
import { getMeasureActionInsightById } from "@/data/synthetic/measureActionInsights";
import {
  buildAutomatedQualityActionSummary,
  buildUnifiedQualityOpportunityExecution,
  buildContractQualitySummary,
  getOrganizationQualityRows,
  getPortfolioMeasures,
  getProviderQualityRows,
  getRankedQualityOpportunities,
  toFinancialBand,
} from "@/lib/qualityData";
import { getAgentById, getSuiteById } from "@/lib/synapseai/agentRegistry";

type SortDirection = "asc" | "desc";
type CareGapFilter = "top-contracts" | "acute-risk" | "dr-smith" | null;

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

function SectionLoadingRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-5 text-center text-xs text-indigo-600">
        {label}
      </td>
    </tr>
  );
}

function QualityManagerKpiCard({
  label,
  value,
  monthlyDelta,
  tone,
}: {
  label: string;
  value: string;
  monthlyDelta: string;
  tone: "neutral" | "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-700"
      : tone === "negative"
      ? "text-rose-700"
      : "text-slate-700";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
      <p className={`mt-0.5 text-xs font-semibold ${toneClass}`}>{monthlyDelta} vs prior month</p>
    </div>
  );
}

type OpportunityQueueType = "auto" | "review" | "next";


function QualityPageContent() {
  const searchParams = useSearchParams();
  const { flags } = useFeatureFlags();

  const portfolioMeasures = useMemo(() => getPortfolioMeasures(), []);
  const suite = getSuiteById("oracle_health");
  const qualityAgent = getAgentById("quality_care_gap");
  const resourcesAgent = getAgentById("health_system_resources");

  const requestedCareGapFilter = searchParams.get("careGapFilter") as CareGapFilter;
  const [displayedCareGapFilter, setDisplayedCareGapFilter] = useState<CareGapFilter>(requestedCareGapFilter);
  const [isFilterUpdating, setIsFilterUpdating] = useState(false);

  const rankedOpportunities = useMemo(
    () => getRankedQualityOpportunities(portfolioMeasures).filter((opportunity) => opportunity.hasInsight),
    [portfolioMeasures]
  );
  const topOpportunities = useMemo(() => rankedOpportunities.slice(0, 5), [rankedOpportunities]);
  const topOpportunityIds = useMemo(() => new Set(topOpportunities.map((opportunity) => opportunity.id)), [topOpportunities]);

  const orderedPortfolioMeasures = useMemo(() => {
    const topIdsInOrder = topOpportunities.map((item) => item.id);
    const remaining = portfolioMeasures.filter((measure) => !topIdsInOrder.includes(measure.id));
    const topRows = topIdsInOrder
      .map((id) => portfolioMeasures.find((measure) => measure.id === id))
      .filter((measure): measure is (typeof portfolioMeasures)[number] => Boolean(measure));
    return [...topRows, ...remaining];
  }, [portfolioMeasures, topOpportunities]);

  const contractSummary = useMemo(
    () => buildContractQualitySummary(mockContracts).filter((contract) => contract.measuresCount > 0),
    []
  );
  const organizationRows = useMemo(() => getOrganizationQualityRows(), []);
  const providerRows = useMemo(() => getProviderQualityRows(), []);

  const [measureSort, setMeasureSort] = useState<{ key: string; dir: SortDirection }>({ key: "financialImpact", dir: "desc" });
  const [contractSort, setContractSort] = useState<{ key: string; dir: SortDirection }>({ key: "estimatedFinancialImpact", dir: "desc" });
  const [organizationSort, setOrganizationSort] = useState<{ key: string; dir: SortDirection }>({ key: "qualityScore", dir: "desc" });
  const [providerSort, setProviderSort] = useState<{ key: string; dir: SortDirection }>({ key: "qualityScore", dir: "desc" });
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<
    | { type: "impact" | "approval"; opportunityId: string }
    | null
  >(null);
  const [, setActionProjectMap] = useState<Record<string, string>>({});
  const [governance] = useState({
    maxAutomatedMembersPerDay: 2400,
    maxAutomatedStaffHoursPerWeek: 420,
    minimumConfidence: 0.75,
    requireApprovalForHighCostActions: true,
    allowedChannels: {
      sms: true,
      portal: true,
      rnOutreach: true,
      navigator: true,
    },
  });

  useEffect(() => {
    if (requestedCareGapFilter === displayedCareGapFilter) return;
    setIsFilterUpdating(true);
    const timeout = window.setTimeout(() => {
      setDisplayedCareGapFilter(requestedCareGapFilter);
      setIsFilterUpdating(false);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [requestedCareGapFilter, displayedCareGapFilter]);

  const currency = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }), []);
  const formatFinancial = (value: number) => (flags.showFinancialData ? currency.format(value) : toFinancialBand(value));

  const buildMeasureInsightHref = (opportunity: {
    id: string;
    measureName: string;
  }) => {
    const params = new URLSearchParams({
      prompt: `Build a quality action plan for ${opportunity.measureName}.`,
      agent: qualityAgent.id,
      suite: suite.id,
      route: "/quality",
      insight: "measure-action",
      measureId: opportunity.id,
      actionId: "closure-plan",
      source: "quality-top-opportunity",
    });

    return `/synapse/results?${params.toString()}`;
  };

  const buildCreateProjectHref = (opportunity: { actionLabel: string; measureName: string }) => {
    const params = new URLSearchParams({
      destination: "project",
      source: "quality-top-opportunity",
      actionLabel: opportunity.actionLabel,
      workflowType: "quality care-gap intervention",
      contextName: opportunity.measureName,
      owner: "Quality Operations",
      next: "/quality",
    });
    return `/synapse/loading?${params.toString()}`;
  };

  const populationMeasureByQualityId: Record<string, string> = {
    "a1c-control": "A1c Control",
    "colorectal-screen": "Colorectal Screening",
    "breast-screen": "Breast Screening",
    "statin-adherence": "Medication Adherence",
    "bp-control": "Follow-up after ED",
    "followup-hosp": "Post Discharge Follow-up",
    "copd-controller": "COPD Management",
    "ed-avoidance": "Follow-up after ED",
  };

  const buildPopulationHref = (filters: Partial<Record<"measure" | "organization" | "provider" | "payer" | "measureStatus" | "attributionStatus", string>>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    return query ? `/population?${query}` : "/population";
  };

  const buildTopOpportunityPopulationHref = (opportunity: {
    id: string;
    measureName: string;
    patientsLeftToTarget: number;
  }) => {
    const measure = populationMeasureByQualityId[opportunity.id] ?? opportunity.measureName;
    const params = new URLSearchParams({
      measure,
      source: "quality-top-opportunity",
      measureId: opportunity.id,
      expectedCount: String(opportunity.patientsLeftToTarget),
    });
    return `/population?${params.toString()}`;
  };


  const sortedOpportunities = topOpportunities;
  const unifiedOpportunities = useMemo(
    () =>
      buildUnifiedQualityOpportunityExecution(sortedOpportunities, {
        requireApprovalForHighCostActions: governance.requireApprovalForHighCostActions,
        highCostThreshold: 350000,
      }),
    [sortedOpportunities, governance.requireApprovalForHighCostActions]
  );
  const unifiedExecutionSummary = useMemo(() => {
    return {
      automated: unifiedOpportunities.filter((item) => item.executionMode === "automated").length,
      approvalRequired: unifiedOpportunities.filter((item) => item.executionMode === "approval_required").length,
      manual: unifiedOpportunities.filter((item) => item.executionMode === "manual").length,
    };
  }, [unifiedOpportunities]);
  const automatedActionSummary = useMemo(
    () => buildAutomatedQualityActionSummary(rankedOpportunities),
    [rankedOpportunities]
  );
  const automatedActionById = useMemo(
    () => new Map(automatedActionSummary.actions.map((action) => [action.id, action] as const)),
    [automatedActionSummary.actions]
  );
  const autoRunningOpportunities = useMemo(
    () => unifiedOpportunities.filter((item) => item.executionMode === "automated"),
    [unifiedOpportunities]
  );
  const approvalQueueOpportunities = useMemo(
    () => unifiedOpportunities.filter((item) => item.executionMode === "approval_required"),
    [unifiedOpportunities]
  );
  const recommendedQueueOpportunities = useMemo(
    () => unifiedOpportunities.filter((item) => item.executionMode === "manual"),
    [unifiedOpportunities]
  );
  useEffect(() => {
    if (!unifiedOpportunities.length) {
      setSelectedOpportunityId(null);
      return;
    }
    if (!unifiedOpportunities.some((opportunity) => opportunity.id === selectedOpportunityId)) {
      setSelectedOpportunityId(unifiedOpportunities[0].id);
    }
  }, [unifiedOpportunities, selectedOpportunityId]);

  const selectedOpportunity =
    unifiedOpportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ??
    unifiedOpportunities[0];

  const measureRows = useMemo(
    () =>
      orderedPortfolioMeasures.map((measure) => {
        const opportunity = rankedOpportunities.find((item) => item.id === measure.id);
        const status = topOpportunityIds.has(measure.id)
          ? "Top Opportunity"
          : measure.performance.ratePercent >= measure.targetPercent
          ? "Full Credit"
          : measure.performance.ratePercent >= measure.targetPercent - 5
          ? "Partial Credit"
          : "No Credit";
        return {
          id: measure.id,
          shortName: measure.shortName,
          domain: measure.domain,
          status,
          current: measure.performance.ratePercent,
          target: measure.targetPercent,
          careGaps: measure.performance.gapMembers,
          financialImpact: opportunity?.estimatedFinancialImpact ?? measure.performance.gapMembers * 220,
        };
      }),
    [orderedPortfolioMeasures, rankedOpportunities, topOpportunityIds]
  );

  const filteredContractSummary = useMemo(() => {
    if (!displayedCareGapFilter) return contractSummary;
    if (displayedCareGapFilter === "top-contracts") return [...contractSummary].sort((a, b) => b.estimatedFinancialImpact - a.estimatedFinancialImpact).slice(0, 3);
    if (displayedCareGapFilter === "acute-risk") return [...contractSummary].sort((a, b) => b.totalGaps - a.totalGaps || b.belowTarget - a.belowTarget).slice(0, 5);
    return [...contractSummary].sort((a, b) => b.totalGaps - a.totalGaps).slice(0, 3).map((contract, idx) => (idx === 0 ? { ...contract, contractName: `${contract.contractName} · Dr. Smith panel` } : contract));
  }, [contractSummary, displayedCareGapFilter]);

  const filteredMeasureRows = useMemo(() => {
    if (!displayedCareGapFilter) return measureRows;
    if (displayedCareGapFilter === "top-contracts") {
      const topSet = new Set(topOpportunities.slice(0, 3).map((item) => item.id));
      return measureRows.filter((row) => topSet.has(row.id));
    }
    if (displayedCareGapFilter === "acute-risk") {
      const acuteIds = new Set(["a1c-control", "bp-control", "statin-adherence"]);
      return measureRows.filter((row) => acuteIds.has(row.id));
    }
    return measureRows.slice(0, 5);
  }, [measureRows, displayedCareGapFilter, topOpportunities]);

  const filteredOrganizations = useMemo(() => {
    if (!displayedCareGapFilter) return organizationRows;
    if (displayedCareGapFilter === "top-contracts") return [...organizationRows].sort((a, b) => b.attributedLives - a.attributedLives).slice(0, 3);
    if (displayedCareGapFilter === "acute-risk") return [...organizationRows].sort((a, b) => b.careGaps - a.careGaps).slice(0, 4);
    return [...organizationRows].sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 1);
  }, [organizationRows, displayedCareGapFilter]);

  const filteredProviders = useMemo(() => {
    if (!displayedCareGapFilter) return providerRows;
    if (displayedCareGapFilter === "top-contracts") return [...providerRows].sort((a, b) => b.panelSize - a.panelSize).slice(0, 6);
    if (displayedCareGapFilter === "acute-risk") return [...providerRows].sort((a, b) => b.careGaps - a.careGaps).slice(0, 8);
    const smithMatch = providerRows.find((provider) => provider.providerName.toLowerCase().includes("smith"));
    if (smithMatch) return [smithMatch];
    const fallback = [...providerRows].sort((a, b) => b.panelSize - a.panelSize)[0];
    return fallback ? [{ ...fallback, providerName: "Dr. Smith" }] : [];
  }, [providerRows, displayedCareGapFilter]);

  const sortedMeasures = useMemo(() => sortRows(filteredMeasureRows, measureSort.key as keyof (typeof filteredMeasureRows)[number], measureSort.dir), [filteredMeasureRows, measureSort]);
  const sortedContracts = useMemo(() => sortRows(filteredContractSummary, contractSort.key as keyof (typeof filteredContractSummary)[number], contractSort.dir), [filteredContractSummary, contractSort]);
  const sortedOrganizations = useMemo(() => sortRows(filteredOrganizations, organizationSort.key as keyof (typeof filteredOrganizations)[number], organizationSort.dir), [filteredOrganizations, organizationSort]);
  const sortedProviders = useMemo(() => sortRows(filteredProviders, providerSort.key as keyof (typeof filteredProviders)[number], providerSort.dir), [filteredProviders, providerSort]);
  const activeModalOpportunity = useMemo(
    () =>
      detailModal
        ? unifiedOpportunities.find((opportunity) => opportunity.id === detailModal.opportunityId) ?? null
        : null,
    [detailModal, unifiedOpportunities]
  );
  const activeModalAction = useMemo(() => {
    if (!activeModalOpportunity?.autoActionId) return null;
    return automatedActionById.get(activeModalOpportunity.autoActionId) ?? null;
  }, [activeModalOpportunity, automatedActionById]);
  const filterLabel =
    requestedCareGapFilter === "top-contracts"
      ? "Only show me patients for my top 3 contracts"
      : requestedCareGapFilter === "acute-risk"
      ? "Show me patients at high risk of acute care utilization"
      : requestedCareGapFilter === "dr-smith"
      ? "Show me patients attributed to Dr. Smith"
      : null;

  const renderOpportunityRows = (
    opportunities: typeof unifiedOpportunities,
    emptyLabel: string,
    queueType: OpportunityQueueType
  ) => (
    <div className="mt-1 overflow-x-auto rounded-lg border border-indigo-100 bg-white/95">
      <div className="border-b border-indigo-100 bg-indigo-50/60 px-3 py-2 text-[11px] text-indigo-800">
        {queueType === "auto"
          ? "Monitoring active autonomous workflows. Focus on live impact and workflow health."
          : queueType === "review"
          ? "These opportunities are blocked by governance or constraints and need explicit review."
          : "Recommended opportunities ranked by impact and readiness to launch."}
      </div>
      <table className="min-w-full table-fixed divide-y divide-slate-100">
        <thead>
          <tr className="bg-slate-50">
            {["Measure", "Current vs Goal", "Patients", "Why this matters", "Action"].map((header) => (
              <th key={header} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isFilterUpdating ? <SectionLoadingRow colSpan={5} label="Updating opportunities…" /> : null}
          {!isFilterUpdating && opportunities.length === 0 ? <SectionLoadingRow colSpan={5} label={emptyLabel} /> : null}
          {!isFilterUpdating
            ? opportunities.map((opportunity, index) => (
                <tr key={opportunity.id} onClick={() => setSelectedOpportunityId(opportunity.id)} className={`cursor-pointer transition ${opportunity.id === selectedOpportunity?.id ? "bg-indigo-50/70 ring-1 ring-inset ring-indigo-200" : "hover:bg-indigo-50/40"}`}>
                  <td className="px-3 py-2 text-xs font-semibold text-slate-900">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {queueType === "auto" && index === 0 ? (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                          #1 Impact
                        </span>
                      ) : null}
                      {queueType === "review" ? (
                        <span className="rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          Review
                        </span>
                      ) : null}
                      <span>{opportunity.measureName}</span>
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-slate-600">{opportunity.actionLabel}</p>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">{opportunity.currentPerformance}% current · {opportunity.targetPerformance}% goal</td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    <Link
                      href={buildTopOpportunityPopulationHref(opportunity as (typeof sortedOpportunities)[number])}
                      onClick={(event) => event.stopPropagation()}
                      className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600"
                    >
                      {opportunity.patientsLeftToTarget.toLocaleString()}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {opportunity.rationale.split(".")[0]}.
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={buildTopOpportunityPopulationHref(opportunity as (typeof sortedOpportunities)[number])}
                        onClick={(event) => event.stopPropagation()}
                        className="text-[11px] font-semibold text-indigo-700 hover:underline"
                      >
                        View patient list →
                      </Link>
                      {getMeasureActionInsightById(opportunity.id) ? (
                        <Link
                          href={buildMeasureInsightHref(opportunity)}
                          onClick={(event) => event.stopPropagation()}
                          className="text-[11px] font-semibold text-slate-700 hover:underline"
                        >
                          Review plan
                        </Link>
                      ) : null}
                      {queueType === "review" ? (
                        <Link
                          href={buildCreateProjectHref(opportunity)}
                          onClick={(event) => event.stopPropagation()}
                          className="text-[11px] font-semibold text-amber-700 hover:underline"
                        >
                          Approve and launch
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );

  const toggleSort = <T,>(current: { key: keyof T; dir: SortDirection }, setState: (value: { key: keyof T; dir: SortDirection }) => void, key: keyof T) => {
    setState({ key, dir: current.key === key && current.dir === "desc" ? "asc" : "desc" });
  };

  const inferGoalTypeFromAction = (measureName: string): Project["goalType"] => {
    const normalized = measureName.toLowerCase();
    if (normalized.includes("screen") || normalized.includes("cancer")) return "cancer_screening";
    if (normalized.includes("ed") || normalized.includes("hospital")) return "ed_utilization";
    if (normalized.includes("readmission")) return "readmissions";
    return "diabetes";
  };

  const deriveWorkflowLabel = (actionExecuted: string) =>
    actionExecuted.split("·")[0]?.trim() || "Autonomous Workflow";
  const buildAutonomousProject = useCallback((action: (typeof automatedActionSummary.actions)[number]): Project => {
    const nowIso = new Date().toISOString();
    const today = nowIso.slice(0, 10);
    const nextReviewDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10);
    const needsReview =
      governance.requireApprovalForHighCostActions &&
      action.metrics.projectedFinancialImpact >= 220000;
    const workflowLabel = deriveWorkflowLabel(action.actionExecuted);

    return {
      id: makeId("project"),
      name: `${action.measureName} – ${workflowLabel}`,
      goalType: inferGoalTypeFromAction(action.measureName),
      status: "active",
      cohortSnapshot: {
        cohortId: `quality-autonomous-${action.measureId}`,
        cohortVersionHash: `v1-quality-autonomous-${action.id}`,
        sizeAtStart: Math.max(1, action.metrics.targetedMembers),
        definitionFrozen: true,
        frozenAt: today,
      },
      savedViewSnapshot: {
        synapseRunId: makeId("synapse-run"),
        agentId: qualityAgent.id,
        agentDisplayName: qualityAgent.displayName,
        savedAt: today,
        summaryMarkdown: `Autonomous action initiated from Quality Execution Center.\n\nAction: **${action.actionExecuted}**\n\nWhy: ${action.whyExecuted}\n\nResult summary: ${action.executionResult}`,
        drivers: [
          { label: "Targeted members", value: action.metrics.targetedMembers.toLocaleString(), evidenceRefIds: ["auto-target"] },
          { label: "Projected closures", value: action.metrics.projectedClosures.toLocaleString(), evidenceRefIds: ["auto-closures"] },
          { label: "Confidence", value: `${Math.round(action.confidence * 100)}%`, evidenceRefIds: ["auto-confidence"] },
        ],
        segments: [
          {
            name: `${action.measureName} closure cohort`,
            size: Math.max(1, action.metrics.targetedMembers),
            rationale: action.whyExecuted,
            evidenceRefIds: ["auto-target"],
          },
        ],
        workflows: [
          {
            title: action.actionExecuted,
            ownerRole: "Quality Operations",
            slas: ["Weekly checkpoint", "2-week KPI review"],
            metrics: ["quality_closure_rate", "projected_financial_impact"],
          },
        ],
        telemetry: [
          {
            metricKey: "quality_closure_rate",
            displayName: `${action.measureName} Closure Rate`,
            cadence: "weekly",
            freshness: "weekly",
            limitations: ["Synthetic autonomous execution telemetry"],
          },
        ],
        citations: [
          { id: "auto-target", label: "Targeted population", excerpt: `${action.metrics.targetedMembers.toLocaleString()} members targeted.` },
          { id: "auto-closures", label: "Projected closure impact", excerpt: `${action.metrics.projectedClosures.toLocaleString()} projected closures.` },
          { id: "auto-confidence", label: "Execution confidence", excerpt: `${Math.round(action.confidence * 100)}% confidence based on resource feasibility.` },
        ],
      },
      sharing: {
        visibility: "private",
        shares: [],
      },
      charter: {
        goalStatement: `Autonomously execute and monitor ${action.measureName.toLowerCase()} gap-closure intervention.`,
        primaryKPI: {
          key: `quality_${action.measureId}_closure_rate`,
          displayName: `${action.measureName} Closure Rate`,
          baseline: 0,
          target: Math.max(1, action.metrics.projectedClosures),
          direction: "up",
        },
        secondaryKPIs: [
          {
            key: "projected_financial_impact",
            displayName: "Projected Financial Impact",
            baseline: Math.round(action.metrics.projectedFinancialImpact * 0.65),
            target: action.metrics.projectedFinancialImpact,
            direction: "up",
          },
        ],
        timeframe: {
          startDate: today,
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10),
        },
        owners: {
          executiveSponsor: "Quality Executive Lead",
          clinicalOwner: "Clinical Quality Owner",
          opsOwner: "Population Health Operations",
          analyticsOwner: "Quality Analytics Lead",
        },
        leadingIndicators: [
          { key: "appointments_scheduled", displayName: "Appointments Scheduled", baseline: 0, target: action.metrics.appointmentsScheduled, direction: "up" },
          { key: "outreach_completed", displayName: "Outreach Completed", baseline: 0, target: action.metrics.outreachCompleted, direction: "up" },
        ],
        assumptions: [action.whyExecuted, `Resources agent constraints considered: ${automatedActionSummary.resourceSnapshot.constrainedAreas.join("; ")}`],
      },
      projectType: "autonomous",
      executionMode: "autonomous",
      autonomousStatus: needsReview ? "needs_review" : "monitoring",
      originPage: "/quality",
      originAgentId: qualityAgent.id,
      supportingAgentIds: [resourcesAgent.id],
      tags: ["Autonomous", "Quality", "Resource-Aware", "Auto-Executed", `auto-action:${action.id}`],
      checkpoints: {
        cadence: "weekly",
        nextReviewDate,
      },
      governance: {
        maxAutomatedMembersPerDay: governance.maxAutomatedMembersPerDay,
        maxAutomatedStaffHoursPerWeek: governance.maxAutomatedStaffHoursPerWeek,
        minimumConfidence: governance.minimumConfidence,
        requireApprovalForHighCostActions: governance.requireApprovalForHighCostActions,
        allowedChannels: Object.entries(governance.allowedChannels)
          .filter(([, enabled]) => enabled)
          .map(([channel]) => channel),
      },
      createdFromAgentRunId: undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }, [
    automatedActionSummary,
    governance.allowedChannels,
    governance.maxAutomatedMembersPerDay,
    governance.maxAutomatedStaffHoursPerWeek,
    governance.minimumConfidence,
    governance.requireApprovalForHighCostActions,
    qualityAgent.displayName,
    qualityAgent.id,
    resourcesAgent.id,
  ]);

  useEffect(() => {
    let cancelled = false;

    const syncAutonomousProjects = async () => {
      const storedProjects = await loadProjects();
      const existingMap = storedProjects.reduce<Record<string, string>>((acc, project) => {
        const actionTag = project.tags?.find((tag) => tag.startsWith("auto-action:"));
        if (!actionTag) return acc;
        const actionId = actionTag.replace("auto-action:", "");
        acc[actionId] = project.id;
        return acc;
      }, {});

      const missingActions = automatedActionSummary.actions.filter((action) => !existingMap[action.id]);
      if (missingActions.length) {
        const projectsToCreate = missingActions.map((action) => buildAutonomousProject(action));
        await saveProjects(projectsToCreate);
      }

      const refreshedProjects = await loadProjects();
      const actionById = new Map(
        automatedActionSummary.actions.map((action) => [action.id, action] as const)
      );
      const renamedProjects = refreshedProjects
        .map((project) => {
          const actionTag = project.tags?.find((tag) => tag.startsWith("auto-action:"));
          if (!actionTag) return null;
          const actionId = actionTag.replace("auto-action:", "");
          const action = actionById.get(actionId);
          if (!action) return null;
          const expectedName = `${action.measureName} – ${deriveWorkflowLabel(action.actionExecuted)}`;
          if (project.name === expectedName) return null;
          return {
            ...project,
            name: expectedName,
            updatedAt: new Date().toISOString(),
          };
        })
        .filter((project): project is Project => Boolean(project));

      if (renamedProjects.length) {
        await saveProjects(renamedProjects);
      }

      const latestProjects = renamedProjects.length ? await loadProjects() : refreshedProjects;
      const refreshedMap = latestProjects.reduce<Record<string, string>>((acc, project) => {
        const actionTag = project.tags?.find((tag) => tag.startsWith("auto-action:"));
        if (!actionTag) return acc;
        const actionId = actionTag.replace("auto-action:", "");
        acc[actionId] = project.id;
        return acc;
      }, {});

      if (!cancelled) {
        setActionProjectMap(refreshedMap);
      }
    };

    void syncAutonomousProjects();
    return () => {
      cancelled = true;
    };
  }, [automatedActionSummary.actions, buildAutonomousProject]);

  return (
    <FeatureGuard page="quality">
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quality Performance</h1>
          <p className="mt-2 max-w-2xl text-slate-500">Monitor portfolio-wide quality measures and drill into contract-level care gaps.</p>
          {filterLabel ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
              <span className="font-semibold">Care Gap filter active:</span>
              <span>{filterLabel}</span>
              <Link href="/quality" className="font-semibold underline">Clear</Link>
            </div>
          ) : null}
          {isFilterUpdating ? <p className="mt-2 text-xs font-medium text-indigo-600">Updating quality components for selected filter…</p> : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Quality manager KPI snapshot</p>
            <p className="text-xs text-slate-500">Monthly trend overview</p>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <QualityManagerKpiCard
              label="Overall Quality Score"
              value={`${Math.round(
                portfolioMeasures.reduce((sum, measure) => sum + measure.performance.ratePercent, 0) /
                  Math.max(1, portfolioMeasures.length)
              )}%`}
              monthlyDelta="+1.3 pts"
              tone="positive"
            />
            <QualityManagerKpiCard
              label="Measures Below Goal"
              value={String(portfolioMeasures.filter((measure) => measure.performance.ratePercent < measure.targetPercent).length)}
              monthlyDelta="-1"
              tone="positive"
            />
            <QualityManagerKpiCard
              label="Open Care Gaps"
              value={portfolioMeasures
                .reduce((sum, measure) => sum + measure.performance.gapMembers, 0)
                .toLocaleString()}
              monthlyDelta="-4.2%"
              tone="positive"
            />
            <QualityManagerKpiCard
              label="Total Population"
              value={mockContracts.reduce((sum, contract) => sum + contract.attributedLives, 0).toLocaleString()}
              monthlyDelta="+1.9%"
              tone="positive"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Today&apos;s Quality Work Queue</h2>
              <p className="mt-1 max-w-3xl text-xs text-slate-600">
                Highest-priority actions to improve quality performance this week, based on care gaps, patient impact, and operational readiness.
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Recommended by {qualityAgent.displayName} with staffing and capacity checks from {resourcesAgent.displayName}.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                  {unifiedExecutionSummary.automated} auto-executed
                </span>
                <span className="inline-flex whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">
                  {unifiedExecutionSummary.approvalRequired} approval required
                </span>
                <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                  {unifiedExecutionSummary.manual} manual
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Operational Capacity This Week</p>
            <p className="mt-1 text-[11px] text-slate-600">
              Capacity estimates are provided by the {resourcesAgent.displayName}. Current constraints are concentrated in {automatedActionSummary.resourceSnapshot.constrainedAreas[0]?.toLowerCase() ?? "staffing"}.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
              <div className="rounded-md border border-slate-200 bg-white px-2 py-2"><p className="text-[10px] uppercase text-slate-500">Care mgr FTE</p><p className="font-semibold text-slate-800">{automatedActionSummary.resourceSnapshot.careManagersAvailableFte}</p></div>
              <div className="rounded-md border border-slate-200 bg-white px-2 py-2"><p className="text-[10px] uppercase text-slate-500">RN hrs</p><p className="font-semibold text-slate-800">{automatedActionSummary.resourceSnapshot.outreachRnHours}</p></div>
              <div className="rounded-md border border-slate-200 bg-white px-2 py-2"><p className="text-[10px] uppercase text-slate-500">Call center/day</p><p className="font-semibold text-slate-800">{automatedActionSummary.resourceSnapshot.callCenterDailyCapacity.toLocaleString()}</p></div>
              <div className="rounded-md border border-slate-200 bg-white px-2 py-2"><p className="text-[10px] uppercase text-slate-500">Digital/day</p><p className="font-semibold text-slate-800">{automatedActionSummary.resourceSnapshot.digitalOutreachDailyCapacity.toLocaleString()}</p></div>
              <div className="rounded-md border border-slate-200 bg-white px-2 py-2"><p className="text-[10px] uppercase text-slate-500">PCP slots (14d)</p><p className="font-semibold text-slate-800">{automatedActionSummary.resourceSnapshot.pcpOpenSlots14d.toLocaleString()}</p></div>
            </div>
            <p className="mt-2">
              Current constraints: <span className="font-semibold text-slate-700">{automatedActionSummary.resourceSnapshot.constrainedAreas.join(" • ")}</span>
            </p>
          </div>

          <Tabs
            tabs={[
              { id: "auto", label: `Already in progress (${autoRunningOpportunities.length})` },
              { id: "review", label: `Needs manager approval (${approvalQueueOpportunities.length})` },
              { id: "next", label: `Ready to launch (${recommendedQueueOpportunities.length})` },
            ]}
            defaultTab="auto"
          >
            {(activeTab) =>
              activeTab === "auto"
                ? renderOpportunityRows(autoRunningOpportunities, "No automated opportunities in progress.", "auto")
                : activeTab === "review"
                ? renderOpportunityRows(approvalQueueOpportunities, "No opportunities require approval.", "review")
                : renderOpportunityRows(recommendedQueueOpportunities, "No additional recommendations right now.", "next")
            }
          </Tabs>

        </div>

        {detailModal && activeModalOpportunity ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
            <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {detailModal.type === "impact" ? "Automated execution impact" : "Approval rationale"}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{activeModalOpportunity.measureName}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailModal(null)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              {detailModal.type === "impact" ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Execution summary</p>
                    <p className="mt-1 text-sm text-slate-800">{activeModalOpportunity.actionExecutionDetail ?? "Execution detail pending."}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Why it was auto-executed</p>
                    <p className="mt-1 text-sm text-slate-800">{activeModalOpportunity.whyExecuted ?? "No additional context available."}</p>
                  </div>
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Impact</p>
                    <p className="mt-1 text-sm text-slate-800">{activeModalOpportunity.executionResult ?? "Impact details pending."}</p>
                  </div>
                  {activeModalAction ? (
                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div className="rounded-md border border-slate-200 bg-white px-2 py-2"><p className="text-slate-500">Targeted</p><p className="font-semibold text-slate-900">{activeModalAction.metrics.targetedMembers.toLocaleString()}</p></div>
                      <div className="rounded-md border border-slate-200 bg-white px-2 py-2"><p className="text-slate-500">Outreach</p><p className="font-semibold text-slate-900">{activeModalAction.metrics.outreachCompleted.toLocaleString()}</p></div>
                      <div className="rounded-md border border-slate-200 bg-white px-2 py-2"><p className="text-slate-500">Projected closures</p><p className="font-semibold text-slate-900">{activeModalAction.metrics.projectedClosures.toLocaleString()}</p></div>
                      <div className="rounded-md border border-slate-200 bg-white px-2 py-2"><p className="text-slate-500">Projected impact</p><p className="font-semibold text-emerald-700">{formatFinancial(activeModalAction.metrics.projectedFinancialImpact)}</p></div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Why approval is required</p>
                    <p className="mt-1 text-sm text-slate-800">{activeModalOpportunity.blockerReason ?? "This action has governance constraints and needs review before execution."}</p>
                  </div>
                  {activeModalOpportunity.blockedMembers != null ? (
                    <p className="text-xs text-slate-600">
                      Members currently impacted by this constraint: <span className="font-semibold text-slate-900">{activeModalOpportunity.blockedMembers.toLocaleString()}</span>
                    </p>
                  ) : null}
                  {activeModalOpportunity.recommendedUnlock ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Recommended unlock</p>
                      <p className="mt-1 text-sm text-slate-800">{activeModalOpportunity.recommendedUnlock}</p>
                    </div>
                  ) : null}
                  <div>
                    <Link
                      href={buildCreateProjectHref(activeModalOpportunity)}
                      className="inline-flex rounded-md border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                    >
                      {activeModalOpportunity.approvalActionLabel ?? "Approve and launch"}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Supporting Analytics</h2>
          <Tabs
            tabs={[
              { id: "measures", label: "Measures" },
              { id: "contracts", label: "Contracts" },
              { id: "organizations", label: "Organizations" },
              { id: "providers", label: "Providers" },
            ]}
            defaultTab="measures"
          >
            {(activeTab) => {
              const helperTextByTab: Record<string, string> = {
                measures: "Use this view to see which quality measures are furthest from goal.",
                contracts: "Use this view to see which payer contracts are most at risk.",
                organizations: "Use this view to compare clinics, sites, and regions.",
                providers: "Use this view to identify provider panels with the most open gaps.",
              };
              if (activeTab === "contracts") {
                return (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">{helperTextByTab[activeTab]}</p>
                    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead><tr className="bg-slate-50">{[["Contract", "contractName"], ["Payor", "payor"], ["Measures", "measuresCount"], ["Avg", "average"], ["Below Target", "belowTarget"], ["Care Gaps", "totalGaps"], ["Financial Impact", "estimatedFinancialImpact"]].map(([header, key]) => <th key={header} onClick={() => toggleSort(contractSort as never, setContractSort as never, key as never)} className="cursor-pointer px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"><SortHeader label={header} /></th>)}<th className="px-4 py-2" /></tr></thead>
                      <tbody className="divide-y divide-slate-100">{isFilterUpdating ? <SectionLoadingRow colSpan={8} label="Updating contracts…" /> : sortedContracts.map((contract) => <tr key={contract.contractId}><td className="px-4 py-2.5 text-xs font-semibold text-slate-900">{contract.contractName}</td><td className="px-4 py-2.5 text-xs text-slate-600">{contract.payor}</td><td className="px-4 py-2.5 text-xs text-slate-600">{contract.measuresCount}</td><td className="px-4 py-2.5 text-xs text-slate-700">{contract.average}%</td><td className="px-4 py-2.5 text-xs text-slate-700">{contract.belowTarget}</td><td className="px-4 py-2.5 text-xs text-slate-700"><Link href={buildPopulationHref({ payer: contract.payor, measureStatus: "Open" })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{contract.totalGaps.toLocaleString()}</Link></td><td className="px-4 py-2.5 text-xs font-semibold text-emerald-700">{formatFinancial(contract.estimatedFinancialImpact)}</td><td className="px-4 py-2.5 text-right"><Link href={`/quality/${contract.contractId}`} className="text-xs font-semibold text-indigo-700 hover:underline">View →</Link></td></tr>)}</tbody>
                    </table>
                    </div>
                  </div>
                );
              }

              if (activeTab === "organizations") {
                return (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">{helperTextByTab[activeTab]}</p>
                    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-[1200px] divide-y divide-slate-100"><thead><tr className="bg-slate-50">{[["Organization", "organizationName"], ["Type", "type"], ["Region", "region"], ["Providers", "providerCount"], ["Lives", "attributedLives"], ["Eligible", "eligibleMembers"], ["Unattributed", "unattributedEligibleMembers"], ["Quality", "qualityScore"], ["Below", "belowTargetMeasures"], ["Gaps", "careGaps"], ["Financial", "estimatedFinancialImpact"]].map(([header, key]) => <th key={header} onClick={() => toggleSort(organizationSort as never, setOrganizationSort as never, key as never)} className="cursor-pointer whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"><SortHeader label={header} /></th>)}</tr></thead><tbody className="divide-y divide-slate-100">{isFilterUpdating ? <SectionLoadingRow colSpan={11} label="Updating organizations…" /> : sortedOrganizations.map((org, idx) => <tr key={org.id}><td className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-slate-900">#{idx + 1} {org.organizationName}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">{org.type}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">{org.region}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">{org.providerCount}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ organization: org.organizationName })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{org.attributedLives.toLocaleString()}</Link></td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ organization: org.organizationName })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{org.eligibleMembers.toLocaleString()}</Link></td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ organization: org.organizationName, attributionStatus: "Pending" })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{org.unattributedEligibleMembers.toLocaleString()}</Link></td><td className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-slate-900">{org.qualityScore}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">{org.belowTargetMeasures}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ organization: org.organizationName, measureStatus: "Open" })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{org.careGaps.toLocaleString()}</Link></td><td className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-emerald-700">{formatFinancial(org.estimatedFinancialImpact)}</td></tr>)}</tbody></table>
                    </div>
                    </div>
                  </div>
                );
              }

              if (activeTab === "providers") {
                return (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">{helperTextByTab[activeTab]}</p>
                    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-[1100px] divide-y divide-slate-100"><thead><tr className="bg-slate-50">{[["Provider", "providerName"], ["Specialty", "specialty"], ["Organization", "organizationName"], ["Panel", "panelSize"], ["Eligible", "eligibleMembers"], ["Quality", "qualityScore"], ["Below", "belowTargetMeasures"], ["Gaps", "careGaps"], ["Closure", "closureRate"], ["Financial", "estimatedFinancialImpact"]].map(([header, key]) => <th key={header} onClick={() => toggleSort(providerSort as never, setProviderSort as never, key as never)} className="cursor-pointer whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"><SortHeader label={header} /></th>)}</tr></thead><tbody className="divide-y divide-slate-100">{isFilterUpdating ? <SectionLoadingRow colSpan={10} label="Updating providers…" /> : sortedProviders.map((provider, idx) => <tr key={provider.id}><td className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-slate-900">#{idx + 1} {provider.providerName}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">{provider.specialty}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">{provider.organizationName}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ provider: provider.providerName })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{provider.panelSize.toLocaleString()}</Link></td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ provider: provider.providerName })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{provider.eligibleMembers.toLocaleString()}</Link></td><td className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-slate-900">{provider.qualityScore}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">{provider.belowTargetMeasures}</td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600"><Link href={buildPopulationHref({ provider: provider.providerName, measureStatus: "Open" })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{provider.careGaps.toLocaleString()}</Link></td><td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">{provider.closureRate}%</td><td className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-emerald-700">{formatFinancial(provider.estimatedFinancialImpact)}</td></tr>)}</tbody></table>
                    </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600">{helperTextByTab[activeTab]}</p>
                  <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead><tr className="bg-slate-50">{[["Measure", "shortName"], ["Domain", "domain"], ["Status", "status"], ["Current", "current"], ["Target", "target"], ["Care Gaps", "careGaps"], ["Financial Impact", "financialImpact"]].map(([header, key]) => <th key={header} onClick={() => toggleSort(measureSort as never, setMeasureSort as never, key as never)} className="cursor-pointer px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500"><SortHeader label={header} /></th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">{isFilterUpdating ? <SectionLoadingRow colSpan={7} label="Updating measures…" /> : sortedMeasures.map((measure) => <tr key={measure.id}><td className="px-4 py-2.5 text-xs font-semibold text-slate-900">{measure.shortName}</td><td className="px-4 py-2.5 text-xs text-slate-600">{measure.domain}</td><td className="px-4 py-2.5 text-xs text-slate-600">{measure.status}</td><td className="px-4 py-2.5 text-xs text-slate-700">{measure.current}%</td><td className="px-4 py-2.5 text-xs text-slate-700">{measure.target}%</td><td className="px-4 py-2.5 text-xs text-slate-700"><Link href={buildPopulationHref({ measure: populationMeasureByQualityId[measure.id] ?? measure.shortName })} className="font-semibold text-indigo-700 underline decoration-dotted underline-offset-2 hover:text-indigo-600">{measure.careGaps.toLocaleString()}</Link></td><td className="px-4 py-2.5 text-xs font-semibold text-emerald-700">{formatFinancial(measure.financialImpact)}</td></tr>)}</tbody>
                  </table>
                  </div>
                </div>
              );
            }}
          </Tabs>
        </div>
      </div>
    </FeatureGuard>
  );
}

export default function QualityPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading quality dashboard...</div>}>
      <QualityPageContent />
    </Suspense>
  );
}
