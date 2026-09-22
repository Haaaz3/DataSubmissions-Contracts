"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Contract } from "@/types/contract";
import type { ContractScenarioOverrides } from "@/lib/contracts/scenarioSimulator";
import { loadContractConfiguration } from "@/lib/contracts/configurationStorage";
import { configurationSignature, normalizeContractConfiguration, normalizeKpiCatalogId } from "@/lib/contracts/configurationNormalization";
import { calculateEstimatedSettlement } from "@/lib/contracts/settlement";
import { compareStudio, createStudioInputs, linkedPerformance, setStudioKpi, setStudioPerformance, studioStorySteps, type StudioSnapshot, type StudioInputs } from "@/lib/contracts/scenarioStudio";
import { deleteScenario, readSavedScenarios, saveScenario, type SavedContractScenario } from "@/lib/contracts/scenarioStorage";

const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const deltaMoney = (n: number) => `${n > 0 ? "+" : ""}${money(n)}`;
const buttonClass = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600";
const statusLabels = { shared_savings: "Shared savings eligible", shared_risk: "Downside exposure", quality_blocked: "Quality gate blocked", below_threshold: "Below payout threshold", neutral: "No settlement payout" };

function Lever({ label, value, baseline, target, unit, min = 0, max, step = 1, onChange, onValidity }: {
  label: string; value?: number; baseline?: number; target?: number; unit?: string; min?: number; max?: number; step?: number;
  onChange: (value: number) => void; onValidity: (valid: boolean) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? (value === undefined ? "" : String(value));
  const valid = text.trim() !== "" && Number.isFinite(Number(text)) && Number(text) >= min && (max === undefined || Number(text) <= max) && (step !== 1 || Number.isInteger(Number(text)));
  const sliderMax = max ?? Math.max((baseline ?? value ?? 100) * 1.5, (target ?? 0) * 1.2, value ?? 0, 1);
  return <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm font-semibold text-slate-800">{label}<span className="block text-[11px] font-normal text-slate-500">{unit}</span></label>
      <input aria-label={label} aria-invalid={!valid} type="number" min={min} max={max} step={step} value={text}
        onChange={e => {
          const next = e.target.value; setDraft(next);
          const num = Number(next); const ok = next.trim() !== "" && Number.isFinite(num) && num >= min && (max === undefined || num <= max) && (step !== 1 || Number.isInteger(num));
          onValidity(ok); if (ok) onChange(num);
        }} onBlur={() => { if (valid) setDraft(null); }}
        className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-right text-sm font-semibold tabular-nums focus:border-indigo-500 focus:outline-none" />
    </div>
    {value !== undefined && <input aria-label={`${label} slider`} type="range" min={min} max={sliderMax} step={step} value={Math.min(sliderMax, value)} onChange={e => { setDraft(null); onValidity(true); onChange(Number(e.target.value)); }} className="mt-3 w-full accent-indigo-600" />}
    <div className="mt-1 flex justify-between gap-2 text-[11px] text-slate-500"><span>Baseline {baseline?.toLocaleString("en-US") ?? "needed"}</span>{target !== undefined && <span>Target {target.toLocaleString("en-US")}</span>}</div>
    {!valid && <p className="mt-1 text-xs text-amber-700">Enter {step === 1 ? "a whole number" : "a number"} {max === undefined ? `of at least ${min}` : `from ${min} to ${max}`}. Results retain the last valid value.</p>}
  </div>;
}
function ResultCard({ label, baseline, scenario, detail, partial }: { label: string; baseline: number; scenario: number; detail: string; partial?: boolean }) {
  const delta = scenario - baseline;
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}{partial ? " · Partial estimate" : ""}</p>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs text-slate-500">Scenario</p><p className={`text-3xl font-bold tracking-tight tabular-nums ${scenario < 0 ? "text-rose-700" : "text-indigo-950"}`}>{money(scenario)}</p></div>
      <span className={`rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums ${delta > 0 ? "bg-emerald-50 text-emerald-700" : delta < 0 ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-600"}`}>{deltaMoney(delta)}</span>
    </div>
    <p className="mt-2 text-xs text-slate-500">Baseline <span className="font-semibold text-slate-700">{money(baseline)}</span> · change over the performance period</p>
    <p className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">{detail}</p>
  </section>;
}

export default function ContractScenarioSimulator({ contract }: { contract: Contract }) {
  const [original] = useState<StudioSnapshot>(() => structuredClone({ contract, configuration: loadContractConfiguration(contract.id) }));
  const [snapshot, setSnapshot] = useState(original);
  const [inputs, setInputs] = useState(() => createStudioInputs(original));
  const [activeStep, setActiveStep] = useState("baseline");
  const [presentation, setPresentation] = useState(false);
  const [name, setName] = useState("");
  const [storage] = useState(readSavedScenarios);
  const [saved, setSaved] = useState<SavedContractScenario[]>(storage.data[contract.id] ?? []);
  const [notice, setNotice] = useState(storage.issue ?? "");
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const [revision, setRevision] = useState(0);
  const comparison = useMemo(() => compareStudio(snapshot, inputs), [snapshot, inputs]);
  const { settlement, baselineIncentives, scenarioIncentives } = comparison;
  const baselineInputs = useMemo(() => ({ ...createStudioInputs(snapshot), baselineKpiValues: inputs.baselineKpiValues,
    kpiValues: { ...inputs.baselineKpiValues }, ruleAssumptions: inputs.ruleAssumptions }), [snapshot, inputs.baselineKpiValues, inputs.ruleAssumptions]);
  const steps = useMemo(() => studioStorySteps(snapshot, baselineInputs), [snapshot, baselineInputs]);
  const terms = calculateEstimatedSettlement(snapshot.contract).terms;
  const configured = snapshot.configuration.selectedMetrics.length > 0;
  const hasInvalid = Object.values(invalid).some(Boolean);
  const changedConfig = configurationSignature(snapshot.configuration) !== configurationSignature(original.configuration);
  const anyGatesBlocked = scenarioIncentives.gates.some(g => !g.passed);
  const maxDriver = Math.max(1, ...settlement.driverSteps.slice(1).map(s => Math.abs(s.deltaFromPrevious)));
  const update = (next: StudioInputs) => { setInputs(next); setActiveStep("custom"); };
  const validity = (id: string) => (valid: boolean) => setInvalid(old => ({ ...old, [id]: !valid }));
  const applyInputs = (next: StudioInputs, step: string) => { setInputs(structuredClone(next)); setActiveStep(step); setInvalid({}); setRevision(r => r + 1); };
  const reset = () => { setSnapshot(original); applyInputs(createStudioInputs(original), "baseline"); setNotice(""); };
  const save = () => {
    try {
      const record = saveScenario({ contractId: contract.id, name: name || (activeStep === "custom" ? "Custom care scenario" : steps.find(s => s.id === activeStep)?.title ?? "Care scenario"), overrides: inputs.overrides, snapshot, inputs });
      setSaved(old => [record, ...old].slice(0, 20)); setNotice(`Saved “${record.name}” in this browser.`); setName("");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save scenario."); }
  };
  const load = (record: SavedContractScenario) => {
    const nextSnapshot = record.version === 2 && record.snapshot ? { ...record.snapshot, configuration: normalizeContractConfiguration(record.snapshot.configuration) } : original;
    setSnapshot(structuredClone(nextSnapshot));
    let next = record.version === 2 && record.inputs ? record.inputs : { ...createStudioInputs(original), overrides: record.overrides };
    Object.entries(next.overrides).forEach(([key, value]) => { next = setStudioPerformance(nextSnapshot, next, key as keyof ContractScenarioOverrides, value); });
    applyInputs(next, "custom");
    setNotice(record.version === 2 ? `Loaded “${record.name}” with its captured baseline.` : `Loaded “${record.name}”. KPI assumptions initialized from current configuration for this legacy scenario.`);
  };
  const remove = (record: SavedContractScenario) => { try { deleteScenario(contract.id, record.id); setSaved(old => old.filter(s => s.id !== record.id)); setNotice(`Deleted “${record.name}”.`); } catch (error) { setNotice(error instanceof Error ? error.message : "Could not delete scenario."); } };
  const standardLever = (key: keyof ContractScenarioOverrides, label: string, unit: string, max?: number, target?: number, min = 0, step = 0.1) =>
    <Lever key={`${revision}-${key}`} label={label} unit={unit} value={inputs.overrides[key]} baseline={createStudioInputs(snapshot).overrides[key]} target={target} min={min} max={max} step={step} onChange={value => update(setStudioPerformance(snapshot, inputs, key, value))} onValidity={validity(key)} />;
  return <div className="space-y-5">
    <section className="rounded-2xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-5 text-white sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Care decisions. Financial consequences.</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Turn better care into contract value</h2>
          <p className="mt-2 text-sm text-indigo-100">{snapshot.contract.attributedLives.toLocaleString("en-US")} lives · {terms.performancePeriodStart} to {terms.performancePeriodEnd}</p>
        </div>
        <div className="flex gap-2"><button className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold hover:bg-white/10" onClick={reset}>Reset</button>
          <button aria-pressed={presentation} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-indigo-900" onClick={() => setPresentation(p => !p)}>{presentation ? "Show workbench" : "Presentation view"}</button></div>
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-3" aria-label="Guided scenario story">
        {steps.map((s, i) => <button key={s.id} aria-pressed={activeStep === s.id} onClick={() => applyInputs(s.inputs, s.id)} className={`rounded-xl border p-3 text-left transition-colors motion-reduce:transition-none ${activeStep === s.id ? "border-white bg-white text-indigo-950" : "border-indigo-400/30 bg-white/5 text-indigo-100 hover:bg-white/10"}`}>
          <span className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${activeStep === s.id ? "bg-indigo-100" : "bg-white/10"}`}>{i + 1}</span><span className="text-sm font-semibold">{s.title}</span>
        </button>)}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-indigo-100">{activeStep === "custom" ? "Custom scenario · adjust assumptions to explore your next decision." : steps.find(s => s.id === activeStep)?.description}</p>
      <p className="mt-2 text-xs font-medium text-white">PMPM ${snapshot.contract.currentPmpm.toLocaleString("en-US")} → ${inputs.overrides.currentPmpm.toLocaleString("en-US")} · ED / 1,000 {snapshot.contract.edVisitsPer1000} → {inputs.overrides.edVisitsPer1000}{scenarioIncentives.kpis.filter(k => !linkedPerformance[normalizeKpiCatalogId(snapshot.configuration.selectedMetrics.find(s => s.id === k.id)!.kpiCatalogItemId)] && k.value !== k.baseline).map(k => ` · ${k.name} ${k.baseline ?? "?"} → ${k.value ?? "?"}`).join("")}</p>
    </section>

    {((notice && !presentation) || changedConfig) && <div role="status" className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">{!presentation && notice}{changedConfig && <p className="mt-1 font-semibold">This saved scenario uses a different configuration snapshot. Reset returns to the current contract.</p>}</div>}
    {hasInvalid && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Correct the highlighted inputs. Results show the last valid assumptions; saving is paused.</p>}

    <div className={`grid items-start gap-5 ${presentation ? "" : "lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.4fr)]"}`}>
      {!presentation && <div className="order-2 space-y-4 lg:order-1">
        <div className="flex items-end justify-between"><div><h3 className="text-base font-bold text-slate-900">Care performance levers</h3><p className="text-xs text-slate-500">Change a value to model the impact instantly.</p></div><span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase text-indigo-700">What if?</span></div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          {standardLever("currentPmpm", "Actual PMPM", "$ per member per month", undefined, snapshot.contract.targetPmpm, 0, 0.01)}
          {standardLever("edVisitsPer1000", "ED visits / 1,000", "Visits per 1,000 members", undefined, undefined)}
          {standardLever("qualityScore", "Composite quality", "Score / 100", 100, terms.qualityGate)}
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">ED improvement can earn a linked KPI incentive. Settlement savings require a separate PMPM cost assumption; no automatic cost conversion is applied.</p>
        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900">Configured measures</h3>
          {!configured && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No KPIs configured yet. Settlement simulation is available. <Link className="font-semibold text-indigo-700 underline" href={`/contracts/${contract.id}/configure`}>Configure Contract</Link></p>}
          {scenarioIncentives.kpis.map(k => {
            const selection = snapshot.configuration.selectedMetrics.find(s => s.id === k.id)!;
            const target = snapshot.configuration.metricTargets.find(t => t.contractMetricSelectionId === k.id);
            const linked = linkedPerformance[normalizeKpiCatalogId(selection.kpiCatalogItemId)];
            return <div key={k.id} className="space-y-2">
              {!linked && createStudioInputs(snapshot).baselineKpiValues[k.id] === undefined && <Lever key={`${revision}-base-${k.id}`} label={`${k.name} baseline assumption`} value={inputs.baselineKpiValues[k.id]} unit={k.unit} max={k.unit === "percent" || k.unit === "score" ? 100 : undefined} step={0.1} onValidity={validity(`base-${k.id}`)} onChange={value => { update({ ...inputs, baselineKpiValues: { ...inputs.baselineKpiValues, [k.id]: value }, kpiValues: { ...inputs.kpiValues, [k.id]: inputs.kpiValues[k.id] === undefined || inputs.kpiValues[k.id] === inputs.baselineKpiValues[k.id] ? value : inputs.kpiValues[k.id] } }); }} />}
              {!linked && <Lever key={`${revision}-${k.id}`} label={k.name} value={k.value} baseline={k.baseline} target={k.target} unit={k.unit === "percent" ? "% of eligible population" : k.unit} max={k.unit === "percent" || k.unit === "score" ? 100 : undefined} step={0.1} onValidity={validity(k.id)} onChange={value => update(setStudioKpi(snapshot, inputs, k.id, value))} />}
              <div className={`rounded-xl px-3 py-2 ${k.issue ? "bg-amber-50" : "bg-slate-50"}`}>
                <div className="flex items-center justify-between gap-2 text-xs"><span className="font-medium text-slate-700">{linked ? k.name : k.role === "gated" ? "Quality gate" : "Target progress"}</span><span className={k.targetMet ? "font-semibold text-emerald-700" : "text-slate-500"}>{k.issue ? "Needs configuration" : k.targetMet ? "Target met" : `${Math.round(k.achievement * 100)}% attainment`}</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div style={{ width: `${k.achievement * 100}%` }} className="h-full rounded-full bg-indigo-500 transition-[width] duration-300 motion-reduce:transition-none" /></div>
                <p className="mt-1 text-[11px] text-slate-500">{k.issue ?? `${k.role} · ${k.direction.replaceAll("_", " ")} · ${target?.targetType === "range" ? `range ${target.minRangeValue}–${target.maxRangeValue}` : `target ${k.target ?? "—"}`}${target?.targetType === "improvement_over_baseline" ? " (endpoint relative to baseline)" : ""}`}</p>
              </div>
            </div>;
          })}
        </section>
        <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">Contract and payout assumptions</summary>
          <div className="mt-3 space-y-2">
            {standardLever("benchmarkPmpm", "Benchmark PMPM", "$ per member per month", undefined, undefined, 0.01, 0.01)}
            {standardLever("attributedLives", "Attributed lives", "Members", undefined, undefined, 1, 1)}
            {standardLever("sharedSavingsRate", "Shared savings rate", "% of qualifying savings", 100)}
            {standardLever("sharedRiskRate", "Shared risk rate", "% of qualifying losses", 100)}
            {standardLever("qualityGate", "Settlement quality gate", "Minimum composite score", 100)}
            <p className="text-xs text-slate-500">Settlement thresholds, caps, participation, and period remain the contract terms. Configured incentive gates are defined in Configure Contract.</p>
            {snapshot.configuration.incentiveRules.filter(r => r.incentiveType === "per_unit_payout" || r.payoutBasis === "per_unit" || r.payoutBasis === "percent").map(rule => <div key={rule.id} className="space-y-2 border-t border-slate-200 pt-3">
              <p className="text-xs font-semibold text-slate-800">{rule.name} · explicit payout assumptions</p>
              {(rule.payoutBasis === "percent" ? ["monetaryBase"] as const : ["eligibleUnits", "dollarRate"] as const).map(key => <Lever key={`${revision}-${rule.id}-${key}`} label={`${rule.name}: ${key === "monetaryBase" ? "monetary base" : key === "eligibleUnits" ? "eligible units" : "dollars per unit"}`} value={inputs.ruleAssumptions[rule.id]?.[key]} unit={key === "eligibleUnits" ? "Explicit eligible count" : "$"} step={key === "eligibleUnits" ? 1 : 0.01} onValidity={validity(`${rule.id}-${key}`)} onChange={value => update({ ...inputs, ruleAssumptions: { ...inputs.ruleAssumptions, [rule.id]: { ...inputs.ruleAssumptions[rule.id], [key]: value } } })} />)}
              <p className="text-[11px] text-slate-500">Applied to both baseline and scenario for a like-for-like comparison.</p>
            </div>)}
          </div>
        </details>
      </div>}

      <div className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-0">
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultCard label="Shared-savings settlement" baseline={settlement.baseline.estimatedAmount} scenario={settlement.scenario.estimatedAmount} detail={statusLabels[settlement.scenario.status]} />
          {configured ? <ResultCard label="Configured KPI incentives" baseline={baselineIncentives.total} scenario={scenarioIncentives.total} partial={scenarioIncentives.partial || baselineIncentives.partial} detail={anyGatesBlocked ? `${money(scenarioIncentives.blockedAmount)} modeled earnings held by quality gates` : scenarioIncentives.gates.length ? "Quality requirements passed · contract incentive cap applied" : "No configured quality gates · contract incentive cap applied"} /> : <section className="flex flex-col justify-center rounded-2xl border border-dashed border-slate-300 p-5"><p className="font-semibold text-slate-700">Connect care targets to incentives</p><p className="mt-2 text-sm text-slate-500">Configure selected KPIs and payout rules to explore the incentive story.</p></section>}
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">These are separate comparisons, not additive dollars. Configured incentives may overlap with shared savings. Estimates cover the contract performance period. Domain economics and configured withholds are excluded.</p>
        <div className={`rounded-xl border px-4 py-3 ${anyGatesBlocked ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
          <p className={`text-sm font-semibold ${anyGatesBlocked ? "text-amber-900" : "text-emerald-900"}`}>{anyGatesBlocked ? "Better performance creates value. Quality determines release." : "Follow the value from care performance to payment."}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">{settlement.deltaSettlement === 0 ? "Settlement is unchanged from baseline." : `The modeled settlement changes by ${deltaMoney(settlement.deltaSettlement)}.`} {configured ? anyGatesBlocked ? "Meet the remaining quality requirements to release eligible KPI incentives." : `Configured incentive earnings change by ${deltaMoney(scenarioIncentives.total - baselineIncentives.total)}.` : "Explore PMPM and sharing terms to see what moves the outcome."}</p>
          {configured && <div className="mt-2 flex flex-wrap gap-2">{scenarioIncentives.gates.map((g, i) => <span key={i} className={`rounded-full bg-white px-2 py-1 text-[11px] font-medium ${g.passed ? "text-emerald-800" : "text-amber-800"}`}>{g.passed ? "✓" : "○"} {g.name} · {g.passed ? "Passed" : "Not met"}</span>)}</div>}
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-900">What moves the settlement?</h3><span className="text-xs font-semibold text-indigo-700">{deltaMoney(settlement.deltaSettlement)} total change</span></div>
          <p className="mt-1 text-[11px] text-slate-500">Sequential effects: cost → quality → population → terms.</p>
          <div className="mt-4 space-y-3" role="img" aria-label={`Settlement driver changes total ${deltaMoney(settlement.deltaSettlement)}`}>
            {settlement.driverSteps.slice(1).map(driver => <div key={driver.id} className="grid grid-cols-[minmax(100px,1fr)_1fr_auto] items-center gap-3 text-xs">
              <span className="text-slate-600">{driver.label.replace(" impact", "")}</span><div className="flex h-3 items-center rounded-full bg-slate-100"><div className={`h-3 rounded-full ${driver.deltaFromPrevious < 0 ? "bg-rose-400" : "bg-indigo-500"}`} style={{ width: `${Math.abs(driver.deltaFromPrevious) / maxDriver * 100}%` }} /></div><span className="min-w-20 text-right font-semibold tabular-nums text-slate-800">{deltaMoney(driver.deltaFromPrevious)}</span>
            </div>)}
          </div>
          <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 text-xs"><span className="text-slate-500">{settlement.baselineOperationalStatus} → <strong className="text-slate-800">{settlement.scenarioOperationalStatus}</strong></span><span className="text-slate-500">Operational status</span></div>
        </section>
        {configured && <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-900">Configured incentive earnings</h3>
          <div className="mt-3 space-y-3">{scenarioIncentives.rules.length === 0 && <p className="text-xs text-slate-500">No incentive rules configured.</p>}{scenarioIncentives.rules.map(rule => <div key={rule.id} className="border-t border-slate-100 pt-3 first:border-0 first:pt-0">
            <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{rule.name}</p><p className={`mt-1 text-[10px] font-bold uppercase tracking-wide ${rule.status === "earned" ? "text-emerald-700" : rule.status === "incomplete" ? "text-amber-700" : "text-slate-500"}`}>{rule.status === "incomplete" ? "Needs configuration" : rule.status.replaceAll("_", " ")}</p></div><div className="text-right"><p className="text-sm font-bold tabular-nums text-slate-900">{rule.status === "incomplete" ? "—" : money(rule.amount)}</p><p className="text-[11px] text-slate-500">Baseline {money(baselineIncentives.rules.find(r => r.id === rule.id)?.amount ?? 0)}</p></div></div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{rule.explanation}</p>
          </div>)}</div>
          {snapshot.configuration.financialTerms.incentiveCapAmount !== undefined && <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">Aggregate incentive cap: {money(snapshot.configuration.financialTerms.incentiveCapAmount)}. Rule amounts shown before the aggregate cap.</p>}
        </section>}
        {!presentation && <details className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><summary className="cursor-pointer font-semibold">Model assumptions and calculation detail</summary><div className="mt-3 space-y-2">
          <p>Settlement source: {settlement.baseline.assumptionsSource === "contract_terms" ? "contract terms" : "modeled defaults"}. Scenario inputs are hypothetical; source contracts are unchanged.</p>
          {settlement.scenario.breakdown.map(row => <p key={row.label}><strong>{row.label}:</strong> {row.value}</p>)}
          <p>Excluded: domain bonuses, penalties, modifiers, configured withholds{snapshot.configuration.financialTerms.withholdAmount ? ` (${money(snapshot.configuration.financialTerms.withholdAmount)})` : ""}, and configured downside caps. Settlement downside caps remain governed by VBC terms.</p>
          <p>Configured payment cadence: {snapshot.configuration.financialTerms.settlementFrequency}. Dollar amounts are full-period estimates, not per-payment amounts.</p>
          {scenarioIncentives.issues.map((issue, i) => <p key={i} className="text-amber-800">{issue}</p>)}
        </div></details>}
      </div>
    </div>
    {!presentation && <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-3"><div className="mr-auto"><h3 className="text-sm font-bold text-slate-900">Saved scenarios</h3><p className="text-xs text-slate-500">Keep up to 20 options per contract in this browser, including their baseline.</p></div><input aria-label="Scenario name" value={name} onChange={e => setName(e.target.value)} placeholder="Name this scenario" maxLength={100} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" /><button disabled={hasInvalid} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40" onClick={save}>Save Scenario</button></div>
      {saved.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{saved.map(record => <div key={record.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{record.name}</p><p className="text-[11px] text-slate-500">{new Date(record.createdAt).toLocaleDateString()} · {record.version === 2 ? "Baseline captured" : "Legacy scenario"}</p></div><div className="flex gap-1"><button aria-label={`Load ${record.name}`} className={buttonClass} onClick={() => load(record)}>Load</button><button aria-label={`Delete ${record.name}`} className={buttonClass} onClick={() => remove(record)}>Delete</button></div></div>)}</div>}
    </section>}
    <p className="text-center text-[11px] text-slate-400">Illustrative planning model · synthetic contract data · not a settlement adjudication</p>
  </div>;
}
