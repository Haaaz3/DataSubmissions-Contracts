"use client";

import type { ContractConfigurationPreview } from "@/lib/contracts/configurationPreview";
import type { ValidationIssue } from "@/lib/contracts/configurationValidation";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ContractConfigurationSummaryRail({
  preview,
  issues,
  currentStep,
  totalSteps,
  saveState,
}: {
  preview: ContractConfigurationPreview;
  issues: ValidationIssue[];
  currentStep: number;
  totalSteps: number;
  saveState: "idle" | "saving" | "saved";
}) {
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return (
    <aside className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Builder Progress</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-700">KPI Summary</p>
        <div className="mt-2 space-y-1 text-xs text-slate-600">
          <p>Total selected: {preview.totalSelectedKpis}</p>
          <p>Scored: {preview.scoredKpis}</p>
          <p>Monitored: {preview.monitoredKpis}</p>
          <p>Gated: {preview.gatedKpis}</p>
          <p>Scored weight total: {preview.scoredWeightTotal}</p>
        </div>
      </div>

      <div className="rounded-lg bg-indigo-50 p-3">
        <p className="text-xs font-semibold text-indigo-700">Financial Preview</p>
        <div className="mt-2 space-y-1 text-xs text-indigo-900">
          <p>Incentive rules: {preview.incentiveRuleCount}</p>
          <p>Est. max upside: {formatMoney(preview.estimatedMaxUpside)}</p>
          <p>Blocked upside est.: {formatMoney(preview.blockedUpsideEstimate)}</p>
          <p>Downside cap: {formatMoney(preview.downsideCapAmount)}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-3">
        <p className="text-xs font-semibold text-slate-700">Validation</p>
        <div className="mt-2 text-xs">
          <p className={errorCount > 0 ? "text-red-600" : "text-emerald-700"}>Errors: {errorCount}</p>
          <p className={warningCount > 0 ? "text-amber-700" : "text-slate-500"}>Warnings: {warningCount}</p>
        </div>
      </div>

      <div className="text-[11px] text-slate-500">
        Save status:{" "}
        <span
          className={
            saveState === "saved"
              ? "font-semibold text-emerald-700"
              : saveState === "saving"
                ? "font-semibold text-indigo-700"
                : "text-slate-500"
          }
        >
          {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Not saved"}
        </span>
      </div>
    </aside>
  );
}
