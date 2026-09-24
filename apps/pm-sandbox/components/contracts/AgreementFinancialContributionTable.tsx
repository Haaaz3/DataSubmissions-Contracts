import Link from "next/link";
import { getContractPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { AgreementFinancialContributionSummary } from "@/types/contractInsights";

function formatMoney(amount: number, withSign = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    signDisplay: withSign ? "always" : "auto",
  }).format(amount);
}

export default function AgreementFinancialContributionTable({
  summary,
}: {
  summary: AgreementFinancialContributionSummary;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Financial contribution by contract</p>
        <h3 className="text-base font-semibold text-slate-900">Agreement economics breakdown</h3>
        <p className="text-xs text-slate-500">Contract-level contribution to settlement, downside, and quality-blocked savings.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50">
              {[
                "Contract",
                "Lives",
                "Net Settlement",
                "Gross Upside",
                "Gross Downside",
                "Quality-Blocked",
                "Exposure Share",
                "",
              ].map((heading) => (
                <th key={heading} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {summary.rows.map((row) => (
              <tr key={row.contractId} className="transition-all duration-200 hover:bg-slate-50/80">
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.contractName}</td>
                <td className="px-4 py-3 text-sm tabular-nums text-slate-700">
                  <Link
                    href={getContractPopulationInsightsHref({
                      contractId: row.contractId,
                      source: "agreement-financial-contribution-lives",
                    })}
                    className="font-semibold text-indigo-700 hover:underline"
                    aria-label={`View population insights for ${row.contractName} lives`}
                  >
                    {row.attributedLives.toLocaleString()}
                  </Link>
                  <p className="text-[11px] text-slate-500">{row.livesSharePercent.toFixed(1)}%</p>
                </td>
                <td className={`px-4 py-3 text-sm font-semibold tabular-nums ${row.netSettlementEstimate >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {formatMoney(row.netSettlementEstimate, true)}
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-emerald-700">{formatMoney(row.grossUpsideAmount)}</td>
                <td className="px-4 py-3 text-sm tabular-nums text-red-700">{formatMoney(row.grossDownsideAmount)}</td>
                <td className="px-4 py-3 text-sm tabular-nums text-amber-700">{formatMoney(row.qualityBlockedSavingsAmount)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <p className="tabular-nums">{row.exposureSharePercent.toFixed(1)}%</p>
                  <div className="mt-1 h-1.5 w-28 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${Math.min(row.exposureSharePercent, 100)}%` }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/contracts/${row.contractId}`} className="text-xs font-semibold text-indigo-600 hover:underline">
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
