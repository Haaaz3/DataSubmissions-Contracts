import Link from "next/link";
import { buildContractChildSummary } from "@/lib/scorecards/rollups";
import type { Contract } from "@/types/contract";

function formatMoneyCompact(amount: number) {
  const absolute = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(0)}`;
}

export default function ContributingContractsCard({
  contracts,
}: {
  contracts: Contract[];
}) {
  const contractRows = contracts
    .map((contract) => ({
      contract,
      summary: buildContractChildSummary(contract),
    }))
    .sort((a, b) => b.summary.vbcPotentialDollars - a.summary.vbcPotentialDollars);

  return (
    <section className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">Contributing contracts</h3>
        <p className="mt-1 text-sm text-slate-500">
          Contracts included in this scorecard lens, sorted by budgeted VBC value.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50">
              {["Contract", "Lives", "Region", "Market", "Payor", "Budgeted VBC", "Remaining Opportunity", ""].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {contractRows.map(({ contract, summary }) => (
              <tr key={contract.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                  <Link href={summary.href ?? `/contracts/${encodeURIComponent(contract.id)}/scorecard`} className="text-indigo-700 hover:underline">
                    {contract.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums text-slate-700">
                  {contract.attributedLives.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{contract.region ?? "Unassigned"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{contract.market ?? "Unassigned"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{contract.payor}</td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums text-indigo-700">
                  {formatMoneyCompact(summary.vbcPotentialDollars)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold tabular-nums text-amber-700">
                  {formatMoneyCompact(summary.remainingVbcOpportunity)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={summary.href ?? `/contracts/${encodeURIComponent(contract.id)}/scorecard`} className="text-sm font-semibold text-indigo-600 hover:underline">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
