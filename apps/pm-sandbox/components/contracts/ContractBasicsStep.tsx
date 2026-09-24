"use client";

import type { ContractConfiguration } from "@/types/contractConfiguration";

type Basics = ContractConfiguration["basics"];

export default function ContractBasicsStep({
  basics,
  onChange,
}: {
  basics: Basics;
  onChange: <K extends keyof Basics>(key: K, value: Basics[K]) => void;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-base font-semibold text-slate-900">Contract Basics</h2>
      <p className="mt-1 text-xs text-slate-500">Define baseline metadata for this contract configuration.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Contract name</span>
          <input
            value={basics.name}
            onChange={(event) => onChange("name", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Contract name"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-slate-700">Payer</span>
          <input
            value={basics.payer}
            onChange={(event) => onChange("payer", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Payer"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-slate-700">Line of business</span>
          <select
            value={basics.lineOfBusiness}
            onChange={(event) => onChange("lineOfBusiness", event.target.value as Basics["lineOfBusiness"])}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="mssp_aco">MSSP / ACO</option>
            <option value="medicare_advantage">Medicare Advantage</option>
            <option value="commercial">Commercial</option>
            <option value="medicaid">Medicaid</option>
            <option value="exchange">Exchange</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-slate-700">Contract type</span>
          <select
            value={basics.contractType}
            onChange={(event) => onChange("contractType", event.target.value as Basics["contractType"])}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="upside_only">Upside only</option>
            <option value="two_sided_risk">Two-sided risk</option>
            <option value="pay_for_performance">Pay for performance</option>
            <option value="bundle">Bundle</option>
            <option value="capitation_quality">Capitation + quality</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-slate-700">Start date</span>
          <input
            type="date"
            value={basics.startDate}
            onChange={(event) => onChange("startDate", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-slate-700">End date</span>
          <input
            type="date"
            value={basics.endDate ?? ""}
            onChange={(event) => onChange("endDate", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold text-slate-700">Performance year</span>
          <input
            type="number"
            min={2000}
            max={2100}
            value={basics.performanceYear ?? ""}
            onChange={(event) =>
              onChange("performanceYear", event.target.value ? Number(event.target.value) : undefined)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Attribution method</span>
          <input
            value={basics.attributionMethod ?? ""}
            onChange={(event) => onChange("attributionMethod", event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="e.g., Prospective attribution"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Eligible population notes</span>
          <textarea
            value={basics.eligiblePopulationNote ?? ""}
            onChange={(event) => onChange("eligiblePopulationNote", event.target.value)}
            className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
    </section>
  );
}
