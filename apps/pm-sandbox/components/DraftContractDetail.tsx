"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Contract, VbcTerms } from "@/types/contract";
import { loadStoredContractById, deleteStoredContract } from "@/lib/contractStore";
import { useRouter } from "next/navigation";
import ContractScenarioStudioLauncher from "./contracts/ContractScenarioStudioLauncher";
import StatusBadge from "./StatusBadge";

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function pct(n: number): string { return `${n}%`; }

// ── VBC Term display row ───────────────────────────────────────────────────

function TermRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-semibold ${accent ?? "text-slate-900"}`}>{value}</span>
    </div>
  );
}

function TermPanel({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${color}`}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wide opacity-60">{title}</p>
      {children}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function DraftContractDetail({ contractId }: { contractId: string }) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [notFound, setNotFound]  = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const c = loadStoredContractById(contractId);
    if (c) setContract(c);
    else setNotFound(true);
  }, [contractId]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500">Contract not found.</p>
        <Link href="/contracts" className="text-sm font-medium text-indigo-600 hover:underline">
          ← Back to Contracts
        </Link>
      </div>
    );
  }

  if (!contract) return null;

  const vbc = contract.vbcTerms as VbcTerms;

  // ── Financial projections ────────────────────────────────────────────────
  const lives   = contract.attributedLives;
  const bench   = vbc.benchmarkPmpm;
  const target  = contract.targetPmpm;
  const annualBenchmark  = bench  * lives * 12;
  const annualTarget     = target * lives * 12;
  const potentialSavings = Math.max(bench - target, 0) * lives * 12;
  const providerShare    = vbc.sharedSavings ? potentialSavings * (vbc.sharedSavingsRate / 100) : 0;
  const maxEarnings      = annualBenchmark * (vbc.sharedSavingsCap / 100);
  const maxExposure      = vbc.sharedRisk  ? annualBenchmark * (vbc.downsideRiskCap / 100) : 0;
  const overTarget       = bench > target;

  const handleDelete = () => {
    deleteStoredContract(contractId);
    router.push("/contracts");
  };

  return (
    <div className="space-y-10">
      {/* Back link */}
      <Link href="/contracts" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
        ← Back to Contracts
      </Link>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{contract.name}</h1>
            <StatusBadge status={contract.status} />
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
              Draft
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {contract.payor}
            <span className="mx-2 text-slate-300">·</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
              {contract.contractType}
            </span>
            <span className="mx-2 text-slate-300">·</span>
            {lives.toLocaleString()} lives
            <span className="mx-2 text-slate-300">·</span>
            <span className="text-slate-400">
              {vbc.performancePeriodStart} → {vbc.performancePeriodEnd}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ContractScenarioStudioLauncher contract={contract} />
          <Link
            href={`/contracts/new?edit=${contractId}`}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Edit Contract
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* ── KPI summary ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Lives",  value: lives.toLocaleString(),         sub: "Total population",         border: "border-slate-200" },
          { label: "Benchmark PMPM",    value: `$${bench.toLocaleString()}`,    sub: "Historical baseline",      border: "border-slate-200" },
          { label: "Target PMPM",       value: `$${target.toLocaleString()}`,   sub: overTarget ? `$${bench - target} below benchmark` : "At benchmark", border: overTarget ? "border-emerald-200" : "border-amber-200" },
          { label: "Quality Baseline",  value: contract.qualityScore ? `${contract.qualityScore} / 100` : "—", sub: "Composite score",       border: "border-slate-200" },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border-l-4 bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100 ${kpi.border}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{kpi.value}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── VBC Financial Terms ─────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Value-Based Contract Terms</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Shared Savings panel */}
          <TermPanel
            title="Shared Savings"
            color={vbc.sharedSavings ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}
          >
            {vbc.sharedSavings ? (
              <>
                <TermRow label="Status"             value="Enabled" accent="text-emerald-700" />
                <TermRow label="Savings Rate"       value={pct(vbc.sharedSavingsRate)}      />
                <TermRow label="Savings Threshold"  value={pct(vbc.sharedSavingsThreshold)} />
                <TermRow label="Savings Cap"        value={pct(vbc.sharedSavingsCap)}       />
                <TermRow label="Quality Gate"       value={`≥ ${vbc.qualityGate} score`}    />
              </>
            ) : (
              <TermRow label="Status" value="Not included" accent="text-slate-400" />
            )}
          </TermPanel>

          {/* Downside Risk panel */}
          <TermPanel
            title="Downside Risk"
            color={vbc.sharedRisk ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}
          >
            {vbc.sharedRisk ? (
              <>
                <TermRow label="Status"             value="Two-sided model" accent="text-amber-700" />
                <TermRow label="Risk Rate"          value={pct(vbc.sharedRiskRate)}          />
                <TermRow label="Risk Threshold"     value={pct(vbc.sharedRiskThreshold)}     />
                <TermRow label="Downside Cap"       value={pct(vbc.downsideRiskCap)}         />
              </>
            ) : (
              <>
                <TermRow label="Status" value="Upside-only" accent="text-emerald-700" />
                <p className="mt-2 text-[10px] text-slate-400">No downside risk. Provider bears no financial exposure for excess costs.</p>
              </>
            )}
          </TermPanel>

          {/* Investment + Population */}
          <TermPanel title="Population Health" color="border-indigo-200 bg-indigo-50">
            <TermRow label="Lives"    value={lives.toLocaleString()}                         />
            <TermRow label="Contract Period"     value={`${vbc.performancePeriodStart} → ${vbc.performancePeriodEnd}`} />
            <TermRow label="Annual Budget"       value={vbc.populationHealthBudget > 0 ? fmtDollar(vbc.populationHealthBudget) : "—"} />
            {contract.edVisitsPer1000 > 0 && (
              <TermRow label="ED Visits / 1k"   value={contract.edVisitsPer1000}                        />
            )}
          </TermPanel>
        </div>
      </div>

      {/* ── Financial Projections ───────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Financial Projections</h2>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
          <p className="mb-4 text-xs text-slate-500">
            Estimated annual financials based on {lives.toLocaleString()} lives and defined contract terms.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: "Annual Benchmark Spend",
                value: fmtDollar(annualBenchmark),
                sub: `${lives.toLocaleString()} lives × $${bench} × 12`,
                color: "text-indigo-800",
              },
              {
                label: "Annual Target Spend",
                value: fmtDollar(annualTarget),
                sub: `${lives.toLocaleString()} lives × $${target} × 12`,
                color: "text-indigo-800",
              },
              {
                label: "Max Provider Earnings",
                value: vbc.sharedSavings ? fmtDollar(Math.min(providerShare, maxEarnings)) : "N/A",
                sub: vbc.sharedSavings ? `${vbc.sharedSavingsRate}% of savings, capped at ${vbc.sharedSavingsCap}%` : "No shared savings",
                color: vbc.sharedSavings ? "text-emerald-700" : "text-slate-400",
              },
              {
                label: "Max Provider Exposure",
                value: vbc.sharedRisk ? fmtDollar(maxExposure) : "None",
                sub: vbc.sharedRisk ? `${vbc.downsideRiskCap}% downside cap` : "Upside-only contract",
                color: vbc.sharedRisk ? "text-red-600" : "text-emerald-700",
              },
            ].map((proj) => (
              <div key={proj.label} className="rounded-lg bg-white/70 py-4 px-3 text-center">
                <p className={`text-xl font-bold ${proj.color}`}>{proj.value}</p>
                <p className="mt-1 text-[10px] font-semibold text-indigo-700">{proj.label}</p>
                <p className="mt-0.5 text-[10px] text-indigo-400">{proj.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Draft notice ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">This is a draft contract</p>
        <p className="mt-1 text-xs text-amber-700">
          Performance trend data, population profiles, and action intelligence will appear once the contract is live
          and data begins flowing. Contract details are stored in your browser.
        </p>
      </div>

      {/* ── Delete confirm ──────────────────────────────────────────────── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Delete contract?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This will permanently remove &quot;{contract.name}&quot; from your browser. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
