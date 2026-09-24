"use client";

import type { ContractConfigurationPreview } from "@/lib/contracts/configurationPreview";
import type { ValidationIssue } from "@/lib/contracts/configurationValidation";
import type { ContractConfiguration, KpiCatalogItem } from "@/types/contractConfiguration";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ContractConfigurationReviewStep({
  config,
  preview,
  issues,
  catalog,
}: {
  config: ContractConfiguration;
  preview: ContractConfigurationPreview;
  issues: ValidationIssue[];
  catalog: KpiCatalogItem[];
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-900">Review & Preview</h2>
      <p className="mt-1 text-xs text-slate-500">Validate configuration details before saving or activating.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">KPI coverage</p>
          <p className="mt-1 text-sm text-slate-700">{preview.totalSelectedKpis} selected · {preview.scoredKpis} scored</p>
        </div>
        <div className="rounded-lg bg-indigo-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Maximum potential upside</p>
          <p className="mt-1 text-sm font-semibold text-indigo-800">{formatMoney(preview.estimatedMaxUpside)}</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Illustrative blocked upside</p>
          <p className="mt-1 text-sm font-semibold text-amber-800">{formatMoney(preview.blockedUpsideEstimate)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contract Basics</p>
        <p className="mt-2 text-sm text-slate-700">
          {config.basics.name || "Unnamed contract"} · {config.basics.payer || "Unknown payer"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {config.basics.contractType.replaceAll("_", " ")} · {config.basics.lineOfBusiness.replaceAll("_", " ")}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected KPIs</p>
        <div className="mt-2 space-y-1">
          {config.selectedMetrics.map((selection) => {
            const kpi = catalog.find((item) => item.id === selection.kpiCatalogItemId);
            return (
              <p key={selection.id} className="text-sm text-slate-700">
                {kpi?.name ?? selection.kpiCatalogItemId} <span className="text-xs text-slate-500">({selection.role})</span>
              </p>
            );
          })}
          {config.selectedMetrics.length === 0 && <p className="text-sm text-slate-500">No KPIs selected.</p>}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Validation Issues</p>
        <div className="mt-2 space-y-1">
          {issues.map((issue) => (
            <p key={issue.code} className={`text-sm ${issue.severity === "error" ? "text-red-700" : "text-amber-700"}`}>
              {issue.message}
            </p>
          ))}
          {issues.length === 0 && <p className="text-sm text-emerald-700">No validation issues detected.</p>}
        </div>
      </div>
    </section>
  );
}
