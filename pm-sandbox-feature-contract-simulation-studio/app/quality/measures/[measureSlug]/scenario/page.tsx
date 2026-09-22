"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";

interface ScenarioCriteria {
  primaryLever: boolean;
  workflowAcceleration: boolean;
  outreachAutomation: boolean;
  navigationSupport: boolean;
  documentationCleanup: boolean;
  interventionWindowDays: number;
}

type ScenarioConfig = {
  title: string;
  measureName: string;
  baselineRate: number;
  targetRate: number;
  maxProjectedRate: number;
  description: string;
  levers: {
    primaryLever: { label: string; impact: number };
    workflowAcceleration: { label: string; impact: number };
    outreachAutomation: { label: string; impact: number };
    navigationSupport: { label: string; impact: number };
    documentationCleanup: { label: string; impact: number };
  };
  briefTitle: string;
  evidenceTitle: string;
};

const scenarioConfigs: Record<string, ScenarioConfig> = {
  "diabetes-a1c-control": {
    title: "Clinical Scenario — Diabetes A1c Control",
    measureName: "Diabetes A1c Control",
    baselineRate: 68,
    targetRate: 75,
    maxProjectedRate: 78,
    description: "Model the quality lift from lab closure, pharmacist escalation, and access support for members with uncontrolled diabetes.",
    levers: {
      primaryLever: { label: "Auto-stage A1c lab orders for overdue members", impact: 1.6 },
      workflowAcceleration: { label: "Escalate A1c >9 cases to pharmacist review", impact: 1.4 },
      outreachAutomation: { label: "Launch SMS/phone lab completion outreach", impact: 1.1 },
      navigationSupport: { label: "Add transport and food-resource navigation", impact: 0.8 },
      documentationCleanup: { label: "Reconcile external A1c results", impact: 0.7 },
    },
    briefTitle: "Clinical Brief — Diabetes A1c Control",
    evidenceTitle: "Evidence Packet — Diabetes A1c Control",
  },
  "colorectal-screening": {
    title: "Intervention Scenario — Colorectal Screening",
    measureName: "Colorectal Screening",
    baselineRate: 61,
    targetRate: 70,
    maxProjectedRate: 73,
    description: "Estimate performance lift from FIT kit outreach, GI scheduling support, and documentation cleanup.",
    levers: {
      primaryLever: { label: "Send mailed FIT kits with reminder cadence", impact: 2.0 },
      workflowAcceleration: { label: "Reserve GI scheduling slots for positive FIT/high-risk members", impact: 1.2 },
      outreachAutomation: { label: "Automate multi-channel screening reminders", impact: 1.4 },
      navigationSupport: { label: "Provide prep, transport, and escort navigation", impact: 0.9 },
      documentationCleanup: { label: "Abstract outside colonoscopy/FIT results", impact: 0.8 },
    },
    briefTitle: "Policy Brief — Colorectal Screening",
    evidenceTitle: "Evidence Packet — Colorectal Screening",
  },
  "breast-cancer-screening": {
    title: "Intervention Scenario — Breast Cancer Screening",
    measureName: "Breast Cancer Screening",
    baselineRate: 67,
    targetRate: 72,
    maxProjectedRate: 75,
    description: "Estimate improvement from imaging access, PCP prompts, navigation, and external result capture.",
    levers: {
      primaryLever: { label: "Reserve mammography access blocks", impact: 1.4 },
      workflowAcceleration: { label: "Auto-insert PCP order prompts for overdue members", impact: 1.0 },
      outreachAutomation: { label: "Run personalized scheduling outreach", impact: 1.1 },
      navigationSupport: { label: "Route access barriers to navigation", impact: 0.8 },
      documentationCleanup: { label: "Retrieve and abstract outside imaging results", impact: 0.7 },
    },
    briefTitle: "Policy Brief — Breast Cancer Screening",
    evidenceTitle: "Evidence Packet — Breast Cancer Screening",
  },
  "medication-adherence": {
    title: "Policy Change Scenario — Medication Adherence",
    measureName: "Medication Adherence",
    baselineRate: 72,
    targetRate: 80,
    maxProjectedRate: 82,
    description: "Configure action-oriented interventions to estimate projected medication adherence lift. Interventions are based on identified drivers and recommended actions.",
    levers: {
      primaryLever: { label: "Remove step therapy requirements", impact: 1.7 },
      workflowAcceleration: { label: "Reduce prior authorization turnaround time", impact: 1.4 },
      outreachAutomation: { label: "Automate refill reminder outreach", impact: 1.1 },
      navigationSupport: { label: "Reduce member copay/pharmacy access barriers", impact: 1.1 },
      documentationCleanup: { label: "Simplify prior authorization requirements", impact: 1.2 },
    },
    briefTitle: "Policy Brief — Medication Adherence",
    evidenceTitle: "HEOR Evidence Packet — Medication Adherence",
  },
};

export default function MeasureScenarioPage({ params }: { params: Promise<{ measureSlug: string }> }) {
  const { measureSlug } = use(params);
  const config = scenarioConfigs[measureSlug] ?? scenarioConfigs["medication-adherence"];
  const [targetRate, setTargetRate] = useState(config.targetRate);
  const [criteria, setCriteria] = useState<ScenarioCriteria>({
    primaryLever: true,
    workflowAcceleration: true,
    outreachAutomation: true,
    navigationSupport: measureSlug !== "breast-cancer-screening",
    documentationCleanup: false,
    interventionWindowDays: 45,
  });

  const projection = useMemo(() => {
    const projectedDeltaRaw =
      (criteria.primaryLever ? config.levers.primaryLever.impact : 0) +
      (criteria.workflowAcceleration ? config.levers.workflowAcceleration.impact : 0) +
      (criteria.outreachAutomation ? config.levers.outreachAutomation.impact : 0) +
      (criteria.navigationSupport ? config.levers.navigationSupport.impact : 0) +
      (criteria.documentationCleanup ? config.levers.documentationCleanup.impact : 0) +
      Math.max(0, (75 - criteria.interventionWindowDays) / 30) * 0.4;

    const projectedDelta = Math.max(0, Number(projectedDeltaRaw.toFixed(1)));
    const projectedRate = Math.min(config.maxProjectedRate, Number((config.baselineRate + projectedDelta).toFixed(1)));
    return { delta: projectedDelta, projectedRate };
  }, [config, criteria]);

  const selectedInterventions = useMemo(
    () =>
      [
        criteria.primaryLever ? config.levers.primaryLever.label : undefined,
        criteria.workflowAcceleration ? config.levers.workflowAcceleration.label : undefined,
        criteria.outreachAutomation ? config.levers.outreachAutomation.label : undefined,
        criteria.navigationSupport ? config.levers.navigationSupport.label : undefined,
        criteria.documentationCleanup ? config.levers.documentationCleanup.label : undefined,
        `${criteria.interventionWindowDays}-day execution window`,
      ].filter((item): item is string => Boolean(item)),
    [config, criteria]
  );

  const targetProgress = useMemo(() => {
    const gapBaseline = Math.max(targetRate - config.baselineRate, 0);
    const gapAfter = Math.max(targetRate - projection.projectedRate, 0);
    const gapClosed = gapBaseline - gapAfter;
    const percentGapClosed = gapBaseline === 0 ? 100 : Math.max(0, Math.min(100, (gapClosed / gapBaseline) * 100));
    return Number(percentGapClosed.toFixed(1));
  }, [config.baselineRate, projection.projectedRate, targetRate]);

  const exportScenarioFile = (type: "policy-brief" | "evidence-packet") => {
    const payload = {
      type,
      title: type === "policy-brief" ? config.briefTitle : config.evidenceTitle,
      generatedAt: new Date().toISOString(),
      measure: config.measureName,
      assumptions: [
        "Projection is based on selected interventions targeting identified quality measure barriers.",
        "Intervention effects are additive and capped at a conservative maximum projected rate.",
      ],
      selectedInterventions,
      baselineRate: config.baselineRate,
      targetRate,
      inputs: criteria,
      outputs: projection,
      confidence: "Medium",
      limitations: [
        "Projection reflects portfolio-level deterministic logic and should be validated in phased rollout.",
        "Impact may vary by provider capacity, member engagement, and payer policy configuration.",
      ],
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${type}-${measureSlug}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/quality/measures/${measureSlug}/drivers`} className="text-sm font-semibold text-indigo-700 hover:underline">
          ← Back to drivers
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">{config.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{config.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Intervention levers</p>
          <div className="mt-4 space-y-3">
            <ToggleRow label={config.levers.primaryLever.label} checked={criteria.primaryLever} onChange={(checked) => setCriteria((prev) => ({ ...prev, primaryLever: checked }))} />
            <ToggleRow label={config.levers.workflowAcceleration.label} checked={criteria.workflowAcceleration} onChange={(checked) => setCriteria((prev) => ({ ...prev, workflowAcceleration: checked }))} />
            <ToggleRow label={config.levers.outreachAutomation.label} checked={criteria.outreachAutomation} onChange={(checked) => setCriteria((prev) => ({ ...prev, outreachAutomation: checked }))} />
            <ToggleRow label={config.levers.navigationSupport.label} checked={criteria.navigationSupport} onChange={(checked) => setCriteria((prev) => ({ ...prev, navigationSupport: checked }))} />
            <ToggleRow label={config.levers.documentationCleanup.label} checked={criteria.documentationCleanup} onChange={(checked) => setCriteria((prev) => ({ ...prev, documentationCleanup: checked }))} />
            <label className="block rounded-lg border border-slate-200 p-3 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>Execution window</span>
                <span className="font-semibold">{criteria.interventionWindowDays} days</span>
              </div>
              <input aria-label="Execution window days" type="range" min={30} max={120} step={15} value={criteria.interventionWindowDays} onChange={(event) => setCriteria((prev) => ({ ...prev, interventionWindowDays: Number(event.target.value) }))} className="mt-2 w-full" />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Projected Impact</p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Baseline performance</p>
              <p className="text-2xl font-bold text-slate-900">{config.baselineRate}%</p>
            </div>
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-indigo-700">Target</p>
                <input
                  aria-label="Target measure performance"
                  type="number"
                  min={0}
                  max={100}
                  value={targetRate}
                  onChange={(event) => setTargetRate(Math.max(0, Math.min(100, Number(event.target.value) || 0)))}
                  className="w-16 rounded-md border border-indigo-200 bg-white px-2 py-1 text-right text-xs font-semibold text-indigo-700"
                />
              </div>
              <p className="mt-2 text-2xl font-bold text-indigo-700">{targetRate}%</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">Projected change</p>
            <p className="text-2xl font-bold text-emerald-700">+{projection.delta} pts</p>
            <p className="mt-1 text-sm text-emerald-800">Projected rate: {projection.projectedRate}%</p>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs text-slate-700">
              This scenario closes {targetProgress}% of the gap to target for {config.measureName}.
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-500">Projection updates automatically as interventions are selected.</p>
          <p className="mt-1 text-xs text-slate-500">Selected interventions: {selectedInterventions.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button onClick={() => exportScenarioFile("policy-brief")} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">
          Export policy brief
        </button>
        <button onClick={() => exportScenarioFile("evidence-packet")} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
          Export evidence packet
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3 text-xs text-slate-700">
      <span>{label}</span>
      <input aria-label={label} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
