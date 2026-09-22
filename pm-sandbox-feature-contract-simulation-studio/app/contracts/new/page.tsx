"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Contract, ContractType, ContractStatus, VbcTerms } from "@/types/contract";
import { saveContract, generateContractId } from "@/lib/contractStore";
import StatusBadge from "@/components/StatusBadge";
import FeatureGuard from "@/components/FeatureGuard";

// ── Form state types ───────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Basics
  name:                    string;
  payor:                   string;
  contractType:            ContractType | "";
  status:                  ContractStatus | "";
  performancePeriodStart:  string;
  performancePeriodEnd:    string;
  // Step 2 — Population & Financials
  attributedLives:         string;
  benchmarkPmpm:           string;
  targetPmpm:              string;
  qualityScore:            string;
  edVisitsPer1000:         string;
  // Step 3 — VBC Terms
  sharedSavings:           boolean;
  sharedSavingsRate:       string;
  sharedSavingsThreshold:  string;
  sharedSavingsCap:        string;
  qualityGate:             string;
  sharedRisk:              boolean;
  sharedRiskRate:          string;
  sharedRiskThreshold:     string;
  downsideRiskCap:         string;
  populationHealthBudget:  string;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

const INITIAL: FormData = {
  name: "", payor: "", contractType: "", status: "",
  performancePeriodStart: "", performancePeriodEnd: "",
  attributedLives: "", benchmarkPmpm: "", targetPmpm: "",
  qualityScore: "", edVisitsPer1000: "",
  sharedSavings: true,
  sharedSavingsRate: "50", sharedSavingsThreshold: "2", sharedSavingsCap: "10",
  qualityGate: "70",
  sharedRisk: false,
  sharedRiskRate: "30", sharedRiskThreshold: "4", downsideRiskCap: "8",
  populationHealthBudget: "",
};

// ── Validation ─────────────────────────────────────────────────────────────

function validateStep(step: number, f: FormData): FieldErrors {
  const e: FieldErrors = {};
  if (step === 1) {
    if (!f.name.trim())              e.name                   = "Contract name is required";
    if (!f.payor.trim())             e.payor                  = "Payor name is required";
    if (!f.contractType)             e.contractType           = "Contract type is required";
    if (!f.status)                   e.status                 = "Status is required";
    if (!f.performancePeriodStart)   e.performancePeriodStart = "Start date is required";
    if (!f.performancePeriodEnd)     e.performancePeriodEnd   = "End date is required";
    if (f.performancePeriodStart && f.performancePeriodEnd &&
        f.performancePeriodEnd <= f.performancePeriodStart)
      e.performancePeriodEnd = "End date must be after start date";
  }
  if (step === 2) {
    const lives = Number(f.attributedLives);
    if (!f.attributedLives || isNaN(lives) || lives < 1)
      e.attributedLives = "Enter a valid number of lives";
    const bench = Number(f.benchmarkPmpm);
    if (!f.benchmarkPmpm || isNaN(bench) || bench < 1)
      e.benchmarkPmpm = "Enter a valid benchmark PMPM (e.g. 850)";
    const target = Number(f.targetPmpm);
    if (!f.targetPmpm || isNaN(target) || target < 1)
      e.targetPmpm = "Enter a valid target PMPM (e.g. 820)";
    const qs = Number(f.qualityScore);
    if (f.qualityScore && (isNaN(qs) || qs < 0 || qs > 100))
      e.qualityScore = "Quality score must be 0–100";
    const ed = Number(f.edVisitsPer1000);
    if (f.edVisitsPer1000 && (isNaN(ed) || ed < 0))
      e.edVisitsPer1000 = "Enter a valid ED visits number";
  }
  if (step === 3 && f.sharedSavings) {
    const rate = Number(f.sharedSavingsRate);
    if (isNaN(rate) || rate < 0 || rate > 100)
      e.sharedSavingsRate = "Must be 0–100%";
    const thr = Number(f.sharedSavingsThreshold);
    if (isNaN(thr) || thr < 0 || thr > 100)
      e.sharedSavingsThreshold = "Must be 0–100%";
    const cap = Number(f.sharedSavingsCap);
    if (isNaN(cap) || cap < 0 || cap > 100)
      e.sharedSavingsCap = "Must be 0–100%";
    const qg = Number(f.qualityGate);
    if (isNaN(qg) || qg < 0 || qg > 100)
      e.qualityGate = "Must be 0–100";
  }
  if (step === 3 && f.sharedRisk) {
    const rate = Number(f.sharedRiskRate);
    if (isNaN(rate) || rate < 0 || rate > 100)
      e.sharedRiskRate = "Must be 0–100%";
    const thr = Number(f.sharedRiskThreshold);
    if (isNaN(thr) || thr < 0 || thr > 100)
      e.sharedRiskThreshold = "Must be 0–100%";
    const cap = Number(f.downsideRiskCap);
    if (isNaN(cap) || cap < 0 || cap > 100)
      e.downsideRiskCap = "Must be 0–100%";
  }
  return e;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Field({
  label, error, required = false, hint, children,
}: {
  label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-[10px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-slate-800 placeholder-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 ${
    err ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
  }`;

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
        checked
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${checked ? "bg-white" : "bg-slate-400"}`} />
      {checked ? `${label}: On` : `${label}: Off`}
    </button>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-0.5 text-xs text-slate-400">{description}</p>
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Contract Basics" },
  { num: 2, label: "Population" },
  { num: 3, label: "VBC Terms" },
  { num: 4, label: "Review" },
];

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done   = step.num < current;
        const active = step.num === current;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                done   ? "bg-emerald-500 text-white" :
                active ? "bg-indigo-600 text-white ring-4 ring-indigo-100" :
                         "bg-slate-100 text-slate-400"
              }`}>
                {done ? "✓" : step.num}
              </div>
              <span className={`mt-1 hidden text-[10px] font-medium sm:block ${
                active ? "text-indigo-600" : done ? "text-emerald-600" : "text-slate-400"
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 mb-5 h-px w-12 sm:w-20 ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Review row ─────────────────────────────────────────────────────────────

function ReviewRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right ${accent ?? "text-slate-900"}`}>{value}</span>
    </div>
  );
}

// ── Main form component ────────────────────────────────────────────────────

export default function NewContractPage() {
  const router = useRouter();
  const [step,   setStep]   = useState(1);
  const [form,   setForm]   = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const next = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const back = () => { setErrors({}); setStep((s) => s - 1); };

  const handleSave = () => {
    setSaving(true);
    const id = generateContractId();
    const lives   = Number(form.attributedLives);
    const bench   = Number(form.benchmarkPmpm);
    const target  = Number(form.targetPmpm);
    const budget  = Number(form.populationHealthBudget) || 0;

    const vbcTerms: VbcTerms = {
      performancePeriodStart:  form.performancePeriodStart,
      performancePeriodEnd:    form.performancePeriodEnd,
      benchmarkPmpm:           bench,
      sharedSavings:           form.sharedSavings,
      sharedSavingsRate:       Number(form.sharedSavingsRate),
      sharedSavingsThreshold:  Number(form.sharedSavingsThreshold),
      sharedSavingsCap:        Number(form.sharedSavingsCap),
      qualityGate:             Number(form.qualityGate),
      sharedRisk:              form.sharedRisk,
      sharedRiskRate:          Number(form.sharedRiskRate),
      sharedRiskThreshold:     Number(form.sharedRiskThreshold),
      downsideRiskCap:         Number(form.downsideRiskCap),
      populationHealthBudget:  budget,
    };

    const contract: Contract = {
      id, isDraft: true,
      name:            form.name.trim(),
      payor:           form.payor.trim(),
      contractType:    form.contractType as ContractType,
      status:          form.status as ContractStatus,
      attributedLives: lives,
      currentPmpm:     bench,   // starts at benchmark — no performance data yet
      targetPmpm:      target,
      qualityScore:    Number(form.qualityScore) || 0,
      edVisitsPer1000: Number(form.edVisitsPer1000) || 0,
      trend:           [],
      opportunities:   [],
      vbcTerms,
    };

    saveContract(contract);
    router.push(`/contracts/${id}`);
  };

  // ── Computed projections ─────────────────────────────────────────────────
  const bench  = Number(form.benchmarkPmpm) || 0;
  const target = Number(form.targetPmpm)    || 0;
  const lives  = Number(form.attributedLives) || 0;
  const annualBenchmark   = bench  * lives * 12;
  const annualTarget      = target * lives * 12;
  const potentialSavings  = Math.max(bench - target, 0) * lives * 12;
  const providerShare     = form.sharedSavings
    ? potentialSavings * (Number(form.sharedSavingsRate) / 100)
    : 0;
  const maxEarnings       = annualBenchmark * (Number(form.sharedSavingsCap) / 100);
  const maxExposure       = form.sharedRisk
    ? annualBenchmark * (Number(form.downsideRiskCap) / 100)
    : 0;

  const fmtDollar = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(2)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${n.toFixed(0)}`;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <FeatureGuard page="contracts">
      <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <Link href="/contracts" className="mb-3 inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
          ← Back to Contracts
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Contract</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter the details of your value-based care contract. Your progress is saved as a draft.
        </p>
      </div>

      {/* Stepper */}
      <Stepper current={step} />

      {/* ── Step 1: Contract Basics ────────────────────────────────────── */}
      {step === 1 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <SectionHeader
            title="Contract Basics"
            description="Identify the contract, payor, and performance period."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Contract Name" required error={errors.name}>
                <input
                  className={inputCls(errors.name)}
                  placeholder="e.g. ACO REACH — Pacific Northwest"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Payor / Payer" required error={errors.payor}>
              <input
                className={inputCls(errors.payor)}
                placeholder="e.g. CMS, Aetna, UnitedHealth"
                value={form.payor}
                onChange={(e) => set("payor", e.target.value)}
              />
            </Field>

            <Field label="Contract Type" required error={errors.contractType}>
              <select
                className={inputCls(errors.contractType)}
                value={form.contractType}
                onChange={(e) => set("contractType", e.target.value)}
              >
                <option value="">Select type…</option>
                <option value="MSSP">MSSP / ACO</option>
                <option value="Medicare Advantage">Medicare Advantage</option>
                <option value="Commercial">Commercial</option>
              </select>
            </Field>

            <Field label="Contract Status" required error={errors.status}>
              <select
                className={inputCls(errors.status)}
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="">Select status…</option>
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Off Track">Off Track</option>
              </select>
            </Field>

            <div className="sm:col-span-2">
              <p className="mb-3 text-xs font-semibold text-slate-700">
                Performance Period<span className="ml-0.5 text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Date" error={errors.performancePeriodStart}>
                  <input
                    type="date"
                    className={inputCls(errors.performancePeriodStart)}
                    value={form.performancePeriodStart}
                    onChange={(e) => set("performancePeriodStart", e.target.value)}
                  />
                </Field>
                <Field label="End Date" error={errors.performancePeriodEnd}>
                  <input
                    type="date"
                    className={inputCls(errors.performancePeriodEnd)}
                    value={form.performancePeriodEnd}
                    onChange={(e) => set("performancePeriodEnd", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Population & Financials ───────────────────────────── */}
      {step === 2 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <SectionHeader
            title="Population & Financials"
            description="Define the attributed population size and PMPM benchmarks."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Lives" required error={errors.attributedLives}
              hint="Total members in this contract">
              <input
                type="number"
                min={1}
                className={inputCls(errors.attributedLives)}
                placeholder="e.g. 5000"
                value={form.attributedLives}
                onChange={(e) => set("attributedLives", e.target.value)}
              />
            </Field>

            <Field label="Benchmark PMPM ($)" required error={errors.benchmarkPmpm}
              hint="Historical baseline — what the payer currently spends">
              <input
                type="number"
                min={1}
                className={inputCls(errors.benchmarkPmpm)}
                placeholder="e.g. 900"
                value={form.benchmarkPmpm}
                onChange={(e) => set("benchmarkPmpm", e.target.value)}
              />
            </Field>

            <Field label="Target PMPM ($)" required error={errors.targetPmpm}
              hint="Agreed performance target — must beat this to share savings">
              <input
                type="number"
                min={1}
                className={inputCls(errors.targetPmpm)}
                placeholder="e.g. 860"
                value={form.targetPmpm}
                onChange={(e) => set("targetPmpm", e.target.value)}
              />
            </Field>

            <Field label="Quality Score Baseline" error={errors.qualityScore}
              hint="Starting composite quality score (0–100)">
              <input
                type="number"
                min={0}
                max={100}
                className={inputCls(errors.qualityScore)}
                placeholder="e.g. 78"
                value={form.qualityScore}
                onChange={(e) => set("qualityScore", e.target.value)}
              />
            </Field>

            <Field label="ED Visits / 1,000" error={errors.edVisitsPer1000}
              hint="Current emergency department utilization rate">
              <input
                type="number"
                min={0}
                className={inputCls(errors.edVisitsPer1000)}
                placeholder="e.g. 310"
                value={form.edVisitsPer1000}
                onChange={(e) => set("edVisitsPer1000", e.target.value)}
              />
            </Field>

            {/* Live financial preview */}
            {lives > 0 && bench > 0 && target > 0 && (
              <div className="sm:col-span-2 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                  Financial Preview
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Annual Benchmark Spend", value: fmtDollar(annualBenchmark) },
                    { label: "Annual Target Spend",    value: fmtDollar(annualTarget)    },
                    { label: "Budgeted Savings Pool", value: fmtDollar(potentialSavings), accent: "text-emerald-700" },
                  ].map((row) => (
                    <div key={row.label} className="text-center">
                      <p className={`text-base font-bold ${row.accent ?? "text-indigo-800"}`}>{row.value}</p>
                      <p className="text-[10px] text-indigo-500">{row.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: VBC Terms ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Shared Savings */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Shared Savings</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Upside-only — provider earns a share of savings below benchmark.
                </p>
              </div>
              <Toggle
                checked={form.sharedSavings}
                onChange={(v) => set("sharedSavings", v)}
                label="Shared Savings"
              />
            </div>

            {form.sharedSavings && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="Savings Rate (%)" error={errors.sharedSavingsRate}
                  hint="% of savings returned to provider">
                  <input type="number" min={0} max={100} className={inputCls(errors.sharedSavingsRate)}
                    placeholder="e.g. 50" value={form.sharedSavingsRate}
                    onChange={(e) => set("sharedSavingsRate", e.target.value)} />
                </Field>

                <Field label="Savings Threshold (%)" error={errors.sharedSavingsThreshold}
                  hint="Min savings % before sharing begins">
                  <input type="number" min={0} max={100} className={inputCls(errors.sharedSavingsThreshold)}
                    placeholder="e.g. 2" value={form.sharedSavingsThreshold}
                    onChange={(e) => set("sharedSavingsThreshold", e.target.value)} />
                </Field>

                <Field label="Savings Cap (%)" error={errors.sharedSavingsCap}
                  hint="Max % of benchmark spend provider can earn">
                  <input type="number" min={0} max={100} className={inputCls(errors.sharedSavingsCap)}
                    placeholder="e.g. 10" value={form.sharedSavingsCap}
                    onChange={(e) => set("sharedSavingsCap", e.target.value)} />
                </Field>

                <Field label="Quality Gate (min score)" error={errors.qualityGate}
                  hint="Minimum quality score to earn any savings">
                  <input type="number" min={0} max={100} className={inputCls(errors.qualityGate)}
                    placeholder="e.g. 70" value={form.qualityGate}
                    onChange={(e) => set("qualityGate", e.target.value)} />
                </Field>
              </div>
            )}
          </div>

          {/* Downside Risk */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Downside Risk</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Provider owes a share of losses above benchmark (two-sided model).
                </p>
              </div>
              <Toggle
                checked={form.sharedRisk}
                onChange={(v) => set("sharedRisk", v)}
                label="Downside Risk"
              />
            </div>

            {form.sharedRisk && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="Risk Rate (%)" error={errors.sharedRiskRate}
                  hint="% of excess losses provider owes">
                  <input type="number" min={0} max={100} className={inputCls(errors.sharedRiskRate)}
                    placeholder="e.g. 30" value={form.sharedRiskRate}
                    onChange={(e) => set("sharedRiskRate", e.target.value)} />
                </Field>

                <Field label="Risk Threshold (%)" error={errors.sharedRiskThreshold}
                  hint="Min loss % before risk sharing begins">
                  <input type="number" min={0} max={100} className={inputCls(errors.sharedRiskThreshold)}
                    placeholder="e.g. 4" value={form.sharedRiskThreshold}
                    onChange={(e) => set("sharedRiskThreshold", e.target.value)} />
                </Field>

                <Field label="Downside Risk Cap (%)" error={errors.downsideRiskCap}
                  hint="Max % of benchmark spend provider can lose">
                  <input type="number" min={0} max={100} className={inputCls(errors.downsideRiskCap)}
                    placeholder="e.g. 8" value={form.downsideRiskCap}
                    onChange={(e) => set("downsideRiskCap", e.target.value)} />
                </Field>
              </div>
            )}
          </div>

          {/* Investment */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader
              title="Population Health Investment"
              description="Annual budget allocated to care management, quality programs, and interventions."
            />
            <div className="max-w-xs">
              <Field label="Annual Budget ($)" hint="Optional — e.g. 250000 for $250K">
                <input type="number" min={0} className={inputCls()}
                  placeholder="e.g. 250000"
                  value={form.populationHealthBudget}
                  onChange={(e) => set("populationHealthBudget", e.target.value)} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Review ────────────────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-5">
          {/* Summary header */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{form.name}</h2>
              <StatusBadge status={form.status as ContractStatus} />
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Draft
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {form.payor} · {form.contractType} ·{" "}
              {form.performancePeriodStart} to {form.performancePeriodEnd}
            </p>
          </div>

          {/* 3-column review grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Contract basics */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Basics</p>
              <ReviewRow label="Payor"           value={form.payor} />
              <ReviewRow label="Type"            value={form.contractType} />
              <ReviewRow label="Status"          value={form.status} />
              <ReviewRow label="Period"          value={`${form.performancePeriodStart} → ${form.performancePeriodEnd}`} />
              <button onClick={() => setStep(1)} className="mt-3 text-[10px] font-medium text-indigo-500 hover:text-indigo-700">
                Edit basics
              </button>
            </div>

            {/* Population */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">Population</p>
              <ReviewRow label="Lives" value={Number(form.attributedLives).toLocaleString()} />
              <ReviewRow label="Benchmark PMPM"   value={`$${form.benchmarkPmpm}`} />
              <ReviewRow label="Target PMPM"      value={`$${form.targetPmpm}`}
                accent={Number(form.targetPmpm) < Number(form.benchmarkPmpm) ? "text-emerald-700" : "text-amber-700"} />
              <ReviewRow label="Quality Baseline" value={form.qualityScore ? `${form.qualityScore} / 100` : "—"} />
              <ReviewRow label="ED Visits / 1k"   value={form.edVisitsPer1000 || "—"} />
              <button onClick={() => setStep(2)} className="mt-3 text-[10px] font-medium text-indigo-500 hover:text-indigo-700">
                Edit population
              </button>
            </div>

            {/* VBC Terms */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">VBC Terms</p>
              {form.sharedSavings ? (
                <>
                  <ReviewRow label="Shared Savings"    value="Enabled" accent="text-emerald-700" />
                  <ReviewRow label="Savings Rate"      value={`${form.sharedSavingsRate}%`} />
                  <ReviewRow label="Savings Threshold" value={`${form.sharedSavingsThreshold}%`} />
                  <ReviewRow label="Savings Cap"       value={`${form.sharedSavingsCap}%`} />
                  <ReviewRow label="Quality Gate"      value={`≥ ${form.qualityGate}`} />
                </>
              ) : (
                <ReviewRow label="Shared Savings" value="Disabled" accent="text-slate-400" />
              )}
              {form.sharedRisk ? (
                <>
                  <ReviewRow label="Downside Risk"     value="Enabled" accent="text-amber-700" />
                  <ReviewRow label="Risk Rate"         value={`${form.sharedRiskRate}%`} />
                  <ReviewRow label="Downside Cap"      value={`${form.downsideRiskCap}%`} />
                </>
              ) : (
                <ReviewRow label="Downside Risk" value="Disabled" accent="text-slate-400" />
              )}
              <button onClick={() => setStep(3)} className="mt-3 text-[10px] font-medium text-indigo-500 hover:text-indigo-700">
                Edit VBC terms
              </button>
            </div>
          </div>

          {/* Financial projections */}
          {lives > 0 && bench > 0 && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-indigo-500">
                Financial Projections
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Annual Benchmark",       value: fmtDollar(annualBenchmark),  sub: "at benchmark PMPM",          color: "text-indigo-800" },
                  { label: "Annual Target",          value: fmtDollar(annualTarget),     sub: "at target PMPM",             color: "text-indigo-800" },
                  { label: "Max Provider Earnings",  value: form.sharedSavings ? fmtDollar(Math.min(providerShare, maxEarnings)) : "N/A", sub: `if at savings cap (${form.sharedSavingsCap}%)`, color: "text-emerald-700" },
                  { label: "Max Provider Exposure",  value: form.sharedRisk    ? fmtDollar(maxExposure) : "None", sub: `downside risk cap (${form.downsideRiskCap}%)`, color: form.sharedRisk ? "text-red-600" : "text-slate-400" },
                ].map((proj) => (
                  <div key={proj.label} className="text-center rounded-lg bg-white/70 py-3 px-2">
                    <p className={`text-lg font-bold ${proj.color}`}>{proj.value}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-indigo-700">{proj.label}</p>
                    <p className="text-[10px] text-indigo-400">{proj.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        {step > 1 ? (
          <button
            onClick={back}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            ← Back
          </button>
        ) : (
          <Link href="/contracts" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
        )}

        {step < 4 ? (
          <button
            onClick={next}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Next: {STEPS[step]?.label} →
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {saving ? "Saving…" : "Save Contract"}
          </button>
        )}
      </div>
      </div>
    </FeatureGuard>
  );
}
