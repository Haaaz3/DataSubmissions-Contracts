"use client";

import { useEffect, useMemo, useState } from "react";
import FeatureGuard from "@/components/FeatureGuard";
import SummaryCard from "@/components/SummaryCard";
import {
  buildCountyCohortCounts,
  CohortDefinition,
  seededFriction,
  seededHotspots,
  seededTopInsights,
} from "@/lib/statewideOutcomesAccessData";

const COHORT_LOGIC_STORAGE_KEY = "statewideOutcomesAccess.cohortLogic.v1";

export default function StatewideOutcomesAccessPage() {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(seededHotspots[0].id);
  const [showCohortBuilder, setShowCohortBuilder] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [showHeorPacket, setShowHeorPacket] = useState(false);

  const [cohortDefinition, setCohortDefinition] = useState<CohortDefinition>({
    name: "Policy-changeable diabetes cohort",
    adultsWithDiabetes: true,
    repeatedEdThreshold: 2,
    nonAdherenceRisk: true,
    therapyIntensification: true,
  });
  const [population, setPopulation] = useState("Adults");
  const [conditions, setConditions] = useState<string[]>(["Diabetes", "Hypertension", "COPD"]);
  const [edVisitsThreshold, setEdVisitsThreshold] = useState(2);
  const [admissionsThreshold, setAdmissionsThreshold] = useState(1);
  const [readmissionsThreshold, setReadmissionsThreshold] = useState(1);
  const [riskFlags, setRiskFlags] = useState<string[]>(["Non-adherence risk", "Rising risk", "Care gap risk"]);
  const [interventions, setInterventions] = useState<string[]>(["Therapy intensification", "PA friction", "Step therapy friction"]);

  const [scenarioAIdea, setScenarioAIdea] = useState("PA modernization");
  const [scenarioBIdea, setScenarioBIdea] = useState("Step therapy exception rule");
  const [scenarioAControls, setScenarioAControls] = useState({
    paTurnaroundDays: 2,
    autoApprovalHours: 24,
    autoApprovedRequestsPct: 40,
    adminDenialReductionPct: 10,
    providerSubmissionSuccessLiftPct: 15,
  });
  const [scenarioBControls, setScenarioBControls] = useState({
    removeStepTherapyPct: 50,
    highRiskFirstLineException: true,
    therapySwitchReductionPct: 30,
    medicationAccessSpeedLiftPct: 20,
    stepEditAbandonmentReductionPct: 15,
  });

  const selectedHotspot = useMemo(
    () => seededHotspots.find((item) => item.id === selectedHotspotId) ?? seededHotspots[0],
    [selectedHotspotId]
  );
  const friction = seededFriction[selectedHotspot.id];
  const countyCohortCounts = useMemo(() => buildCountyCohortCounts(cohortDefinition), [cohortDefinition]);
  const scenarioA = useMemo(() => {
    const strength =
      (5 - scenarioAControls.paTurnaroundDays) * 1.2 +
      (72 - scenarioAControls.autoApprovalHours) / 12 +
      scenarioAControls.autoApprovedRequestsPct * 0.06 +
      scenarioAControls.adminDenialReductionPct * 0.18 +
      scenarioAControls.providerSubmissionSuccessLiftPct * 0.12;
    return {
      abandonmentReductionPct: Math.round(6 + strength),
      adherenceLiftPct: Number((3.1 + strength * 0.45).toFixed(1)),
      edReductionPct: Number((2.2 + strength * 0.3).toFixed(1)),
      admitsReductionPct: Number((1.9 + strength * 0.26).toFixed(1)),
      qualityLiftPct: Number((2.3 + strength * 0.32).toFixed(1)),
      confidence: "High" as const,
    };
  }, [scenarioAControls]);
  const scenarioB = useMemo(() => {
    const strength =
      scenarioBControls.removeStepTherapyPct * 0.08 +
      (scenarioBControls.highRiskFirstLineException ? 3 : 0) +
      scenarioBControls.therapySwitchReductionPct * 0.1 +
      scenarioBControls.medicationAccessSpeedLiftPct * 0.1 +
      scenarioBControls.stepEditAbandonmentReductionPct * 0.14;
    return {
      abandonmentReductionPct: Math.round(4 + strength),
      adherenceLiftPct: Number((2.8 + strength * 0.42).toFixed(1)),
      edReductionPct: Number((1.8 + strength * 0.28).toFixed(1)),
      admitsReductionPct: Number((1.6 + strength * 0.22).toFixed(1)),
      qualityLiftPct: Number((2.0 + strength * 0.3).toFixed(1)),
      confidence: "Medium" as const,
    };
  }, [scenarioBControls]);
  const recommendation = useMemo(() => {
    const scenarioAScore =
      scenarioA.adherenceLiftPct + scenarioA.edReductionPct + scenarioA.admitsReductionPct + scenarioA.abandonmentReductionPct;
    const scenarioBScore =
      scenarioB.adherenceLiftPct + scenarioB.edReductionPct + scenarioB.admitsReductionPct + scenarioB.abandonmentReductionPct;

    const confidenceRank: Record<"Low" | "Medium" | "High", number> = {
      Low: 1,
      Medium: 2,
      High: 3,
    };

    const chooseA =
      scenarioAScore > scenarioBScore ||
      (scenarioAScore === scenarioBScore && confidenceRank[scenarioA.confidence] >= confidenceRank[scenarioB.confidence]);

    return {
      recommendedScenario: chooseA ? "Scenario A" : "Scenario B",
      alternateScenario: chooseA ? "Scenario B" : "Scenario A",
      recommendedOutput: chooseA ? scenarioA : scenarioB,
      alternateOutput: chooseA ? scenarioB : scenarioA,
      scoreDelta: Math.abs(scenarioAScore - scenarioBScore),
    };
  }, [scenarioA, scenarioB]);
  const cohortLogicText = `${population} with ${conditions.join(" and ")} AND ED visits >= ${edVisitsThreshold} AND admissions >= ${admissionsThreshold} AND readmissions >= ${readmissionsThreshold} AND ${riskFlags.join(" + ")}`;
  const scenarioADefinition = `Reduce PA turnaround to ${scenarioAControls.paTurnaroundDays} days, auto-approve after ${scenarioAControls.autoApprovalHours}h, and increase auto-approved requests to ${scenarioAControls.autoApprovedRequestsPct}%`;
  const scenarioBDefinition = `Remove step therapy for ${scenarioBControls.removeStepTherapyPct}% of members with high-risk exception ${scenarioBControls.highRiskFirstLineException ? "ON" : "OFF"}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedLogic = window.localStorage.getItem(COHORT_LOGIC_STORAGE_KEY);
    if (storedLogic) setCohortDefinition((previous) => ({ ...previous, name: storedLogic }));
  }, []);

  return (
    <FeatureGuard page="statewideOutcomesAccess">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Statewide Outcomes &amp; Access</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            State-level command center for outcomes/utilization hotspots and access frictions. Aggregated / De-identified insights only.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {seededTopInsights.map((tile) => (
            <SummaryCard
              key={tile.id}
              label={tile.label}
              value={tile.value}
              description={tile.description}
              accent={tile.accent}
              tooltipTitle={tile.tooltipTitle}
              tooltipLines={tile.tooltipLines}
            />
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Hotspots</p>
              <p className="text-xs text-slate-500">Aggregated county/segment level signals only</p>
            </div>
          </div>
          <div className="space-y-2">
            {seededHotspots.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.conditionFocus}</p>
                  <p className="text-xs text-slate-600">{item.counties.join(", ")} · ED +{item.edTrendPct}% · Avoidable admits +{item.avoidableAdmitsTrendPct}% · Quality {item.qualityDeltaPct}%</p>
                </div>
                <button
                  onClick={() => setSelectedHotspotId(item.id)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  View drivers
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Coverage Friction & Outcomes Agent</p>
              <p className="text-xs text-slate-500">Selected hotspot: {selectedHotspot.conditionFocus} ({selectedHotspot.counties.join(", ")})</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <Metric label="PA delay rate" value={`${friction.paDelayRatePct}%`} />
            <Metric label="Step-therapy failures" value={`${friction.stepTherapyFailureRatePct}%`} />
            <Metric label="Abandonment proxy" value={`${friction.abandonmentProxyPct}%`} />
            <Metric label="Time-to-therapy" value={`${friction.timeToTherapyDays} days`} />
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Association insight: Higher PA delays are associated with delayed therapy starts and increased avoidable utilization in this aggregated cohort.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
            <li>Time window: trailing 30 days of aggregated, de-identified claims and authorization signals.</li>
            <li>Baseline: compared against each county cohort&apos;s prior 90-day trend and statewide peer median.</li>
            <li>Where PA delay is elevated, we also observe higher abandonment proxy and longer time-to-therapy.</li>
            <li>Caution: this is correlation for decision support, not proof of causation.</li>
          </ul>

          <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-indigo-900">Test policy changes</p>
              <button onClick={() => setShowCohortBuilder(true)} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">Define cohort</button>
            </div>
            <p className="mt-1 text-xs text-indigo-900/90">
              The next step lets you define a target cohort and simulate how coverage policy changes could influence ED utilization,
              adherence, and time-to-therapy outcomes.
            </p>
            <p className="mt-2 text-xs font-medium text-indigo-900">
              Define the population you want to simulate, then compare Scenario A vs Scenario B.
            </p>
          </div>
        </div>

        {showCohortBuilder && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Cohort Builder (Aggregated counts only)</p>
              <button onClick={() => setShowScenarios(true)} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">Run scenarios</button>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Configured cohort definition</p>
                  <p className="mt-1 text-xs text-slate-600">{cohortLogicText}</p>
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") window.localStorage.setItem(COHORT_LOGIC_STORAGE_KEY, cohortLogicText);
                  }}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Save Cohort
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Population</p>
                <select value={population} onChange={(e) => setPopulation(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs">
                  {"Adults,Pediatrics,All Members".split(",").map((opt) => <option key={opt}>{opt}</option>)}
                </select>
                <p className="mt-2 text-[11px] font-semibold uppercase text-slate-500">Conditions</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {["Diabetes", "Hypertension", "COPD", "CHF", "Asthma", "Depression"].map((c) => (
                    <button key={c} type="button" onClick={() => setConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${conditions.includes(c) ? "bg-indigo-600 text-white" : "border border-slate-300 text-slate-700"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-700 space-y-2">
                <label>ED visits ≥ {edVisitsThreshold}<input type="range" min={0} max={5} value={edVisitsThreshold} onChange={(e) => setEdVisitsThreshold(Number(e.target.value))} className="w-full" /></label>
                <label>Admissions ≥ {admissionsThreshold}<input type="range" min={0} max={4} value={admissionsThreshold} onChange={(e) => setAdmissionsThreshold(Number(e.target.value))} className="w-full" /></label>
                <label>Readmissions ≥ {readmissionsThreshold}<input type="range" min={0} max={4} value={readmissionsThreshold} onChange={(e) => setReadmissionsThreshold(Number(e.target.value))} className="w-full" /></label>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Risk flags</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-slate-700">
                  {["Non-adherence risk", "High cost risk", "Rising risk", "Care gap risk"].map((flag) => (
                    <label key={flag} className="flex items-center gap-1.5"><input type="checkbox" checked={riskFlags.includes(flag)} onChange={(e) => setRiskFlags((prev) => e.target.checked ? [...prev, flag] : prev.filter((x) => x !== flag))} />{flag}</label>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Interventions</p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-slate-700">
                  {["Therapy intensification", "Outreach needed", "PA friction", "Step therapy friction"].map((flag) => (
                    <label key={flag} className="flex items-center gap-1.5"><input type="checkbox" checked={interventions.includes(flag)} onChange={(e) => setInterventions((prev) => e.target.checked ? [...prev, flag] : prev.filter((x) => x !== flag))} />{flag}</label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Cohort size by county</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-700">
                  {countyCohortCounts.map((row) => (
                    <li key={row.county}>{row.county}: {row.count.toLocaleString()}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-[11px] font-semibold uppercase text-slate-500">Equity lens</p>
                <p className="mt-2 text-xs text-slate-700">Rural vs Urban split: 42% / 58%</p>
                <p className="mt-1 text-xs text-slate-500">SDOH risk distribution: Not available</p>
              </div>
            </div>
          </div>
        )}

        {showScenarios && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Scenario Explorer</p>
            </div>
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Why run scenarios?</p>
              <p className="mt-1">Scenario Explorer helps test how policy changes could shift utilization and outcomes before implementation.</p>
              <p className="mt-1">It models coverage policy levers (e.g., PA modernization and exception rules) and estimates downstream effects like ED utilization, adherence, and time-to-therapy.</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><span className="font-semibold text-slate-700">Policy proposal / brief:</span> executive summary, recommended change, expected impact, and operational considerations.</li>
                <li><span className="font-semibold text-slate-700">HEOR evidence packet:</span> methods/assumptions, cohort definitions, outcomes/utilization deltas, confidence, and limitations.</li>
              </ul>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-900">Scenario A: PA modernization</p>
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[11px] font-semibold text-slate-600">Scenario A definition</p>
                  <p className="mt-1 text-xs text-slate-700">{scenarioADefinition}</p>
                </div>
                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
                  <label className="text-[11px] font-semibold text-slate-600">Scenario idea</label>
                  <input value={scenarioAIdea} onChange={(e) => setScenarioAIdea(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs" />
                  <p className="mt-1 text-[11px] text-slate-500">Describe the policy or access change you want to model</p>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Generated from: {scenarioAIdea}</p>
                <div className="mt-2 space-y-2 text-xs text-slate-700">
                  <label>Reduce prior authorization turnaround time: 5 days → {scenarioAControls.paTurnaroundDays} days<input type="range" min={1} max={5} value={scenarioAControls.paTurnaroundDays} onChange={(e) => setScenarioAControls((prev) => ({ ...prev, paTurnaroundDays: Number(e.target.value) }))} className="w-full" /></label>
                  <label>Add auto-approval after X hours: 72h → {scenarioAControls.autoApprovalHours}h<input type="range" min={24} max={72} step={12} value={scenarioAControls.autoApprovalHours} onChange={(e) => setScenarioAControls((prev) => ({ ...prev, autoApprovalHours: Number(e.target.value) }))} className="w-full" /></label>
                  <label>% of requests auto-approved: {scenarioAControls.autoApprovedRequestsPct}%<input type="range" min={0} max={40} value={scenarioAControls.autoApprovedRequestsPct} onChange={(e) => setScenarioAControls((prev) => ({ ...prev, autoApprovedRequestsPct: Number(e.target.value) }))} className="w-full" /></label>
                  <label>Reduce administrative denial rate: -{scenarioAControls.adminDenialReductionPct}%<input type="range" min={0} max={25} value={scenarioAControls.adminDenialReductionPct} onChange={(e) => setScenarioAControls((prev) => ({ ...prev, adminDenialReductionPct: Number(e.target.value) }))} className="w-full" /></label>
                  <label>Improve provider submission success rate: +{scenarioAControls.providerSubmissionSuccessLiftPct}%<input type="range" min={0} max={25} value={scenarioAControls.providerSubmissionSuccessLiftPct} onChange={(e) => setScenarioAControls((prev) => ({ ...prev, providerSubmissionSuccessLiftPct: Number(e.target.value) }))} className="w-full" /></label>
                </div>
                <ScenarioOutputView output={scenarioA} />
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-semibold text-slate-900">Scenario B: Step-therapy exception rule</p>
                <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[11px] font-semibold text-slate-600">Scenario B definition</p>
                  <p className="mt-1 text-xs text-slate-700">{scenarioBDefinition}</p>
                </div>
                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
                  <label className="text-[11px] font-semibold text-slate-600">Scenario idea</label>
                  <input value={scenarioBIdea} onChange={(e) => setScenarioBIdea(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-xs" />
                  <p className="mt-1 text-[11px] text-slate-500">Describe the policy or access change you want to model</p>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">Generated from: {scenarioBIdea}</p>
                <div className="mt-2 space-y-2 text-xs text-slate-700">
                  <label>Remove step therapy for % of members: {scenarioBControls.removeStepTherapyPct}%<input type="range" min={0} max={50} value={scenarioBControls.removeStepTherapyPct} onChange={(e) => setScenarioBControls((prev) => ({ ...prev, removeStepTherapyPct: Number(e.target.value) }))} className="w-full" /></label>
                  <label className="flex items-center justify-between">Allow first-line exception for high-risk patients<input type="checkbox" checked={scenarioBControls.highRiskFirstLineException} onChange={(e) => setScenarioBControls((prev) => ({ ...prev, highRiskFirstLineException: e.target.checked }))} /></label>
                  <label>Reduce therapy switching requirements: -{scenarioBControls.therapySwitchReductionPct}%<input type="range" min={0} max={40} value={scenarioBControls.therapySwitchReductionPct} onChange={(e) => setScenarioBControls((prev) => ({ ...prev, therapySwitchReductionPct: Number(e.target.value) }))} className="w-full" /></label>
                  <label>Improve medication access speed: +{scenarioBControls.medicationAccessSpeedLiftPct}%<input type="range" min={0} max={30} value={scenarioBControls.medicationAccessSpeedLiftPct} onChange={(e) => setScenarioBControls((prev) => ({ ...prev, medicationAccessSpeedLiftPct: Number(e.target.value) }))} className="w-full" /></label>
                  <label>Reduce abandonment due to step edits: -{scenarioBControls.stepEditAbandonmentReductionPct}%<input type="range" min={0} max={25} value={scenarioBControls.stepEditAbandonmentReductionPct} onChange={(e) => setScenarioBControls((prev) => ({ ...prev, stepEditAbandonmentReductionPct: Number(e.target.value) }))} className="w-full" /></label>
                </div>
                <ScenarioOutputView output={scenarioB} />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-indigo-900">Recommendation</p>
                <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                  Recommended scenario: {recommendation.recommendedScenario}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-indigo-900">Why this scenario</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-indigo-900/90">
                    <li>
                      {recommendation.recommendedScenario} produces stronger combined impact across adherence and utilization metrics
                      (score delta: {recommendation.scoreDelta}).
                    </li>
                    <li>
                      Projected ED reduction {recommendation.recommendedOutput.edReductionPct}% and avoidable admits reduction {recommendation.recommendedOutput.admitsReductionPct}%
                      are favorable for near-term operational outcomes.
                    </li>
                    <li>Confidence level for this option is {recommendation.recommendedOutput.confidence}.</li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-indigo-900">Operational impact</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-indigo-900/90">
                    <li>Expected to reduce therapy delays and downstream avoidable utilization pressure.</li>
                    <li>Implementation should include workflow updates for authorization review and exception handling.</li>
                    <li>Monitor admin workload weekly during rollout to manage throughput and policy adherence.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-indigo-900">Evidence to include in HEOR packet</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-indigo-900/90">
                    <li>Methods and assumptions for scenario modeling and baseline selection.</li>
                    <li>Cohort definition, inclusion logic, and county-level aggregation approach.</li>
                    <li>Outcome/utilization deltas for adherence, ED, admits, and time-to-therapy.</li>
                    <li>Confidence grading, data completeness notes, and known limitations.</li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-indigo-900">Tradeoffs / considerations</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-indigo-900/90">
                    <li>{recommendation.alternateScenario} may be simpler in some markets depending on current policy maturity.</li>
                    <li>Any recommendation should be validated with phased rollout and post-policy monitoring.</li>
                    <li>These are modeled associations and should be interpreted as decision support, not causal proof.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button onClick={() => setShowProposal(true)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                  Generate policy proposal
                </button>
                <button onClick={() => setShowHeorPacket(true)} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">
                  Generate HEOR evidence packet
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">Assumptions and confidence are model-based, aggregated and de-identified.</p>
          </div>
        )}


        {showProposal && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Policy Proposal Package</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">
              <li>Requested changes: PA modernization and targeted step-therapy exceptions.</li>
              <li>Rationale: aggregated association between friction signals and outcomes/utilization trends.</li>
              <li>Guardrails: eligibility criteria, audit sampling, and time-window monitoring.</li>
              <li>Scenario A definition: {scenarioADefinition}</li>
              <li>Scenario B definition: {scenarioBDefinition}</li>
            </ul>
            <div className="mt-3 flex gap-2">
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">Copy to clipboard</button>
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">Export PDF</button>
            </div>
          </div>
        )}

        {showHeorPacket && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">HEOR Evidence Packet</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">
              <li>Cohort definition and county distributions (aggregated).</li>
              <li>Baseline ED/admission/quality rates and friction signal summaries.</li>
              <li>Modeled impact by scenario with confidence and assumptions.</li>
              <li>Data completeness notes and limitations.</li>
              <li>Scenario A definition: {scenarioADefinition}</li>
              <li>Scenario B definition: {scenarioBDefinition}</li>
            </ul>
            <div className="mt-3 flex gap-2">
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">Download</button>
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">Send for review</button>
            </div>
          </div>
        )}
      </div>
    </FeatureGuard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ScenarioOutputView({ output }: { output: { abandonmentReductionPct: number; adherenceLiftPct: number; edReductionPct: number; admitsReductionPct: number; qualityLiftPct: number; confidence: "Low" | "Medium" | "High" } }) {
  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
      <p>Abandonment reduction: {output.abandonmentReductionPct}%</p>
      <p>Adherence lift: {output.adherenceLiftPct}%</p>
      <p>ED reduction: {output.edReductionPct}%</p>
      <p>Avoidable admits reduction: {output.admitsReductionPct}%</p>
      <p>Projected quality lift: {output.qualityLiftPct}%</p>
      <p className="mt-1 font-semibold">Confidence: {output.confidence}</p>
    </div>
  );
}




