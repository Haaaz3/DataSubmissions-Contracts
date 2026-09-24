import Link from "next/link";
import SummaryCard from "@/components/SummaryCard";
import PortfolioBarChart from "@/components/charts/PortfolioBarChart";
import StatusDonutChart from "@/components/charts/StatusDonutChart";
import PmpmTrendChart from "@/components/charts/PmpmTrendChart";
import { mockContracts } from "@/lib/mockData";
import type { ContractStatus } from "@/types/contract";

export default function ExecutiveHomePage() {
  const totalLives = mockContracts.reduce((sum, c) => sum + c.attributedLives, 0);
  const totalCurrentPmpm = mockContracts.reduce((sum, c) => sum + c.currentPmpm, 0);
  const totalTargetPmpm = mockContracts.reduce((sum, c) => sum + c.targetPmpm, 0);

  const averageCurrentPmpm = Math.round(totalCurrentPmpm / mockContracts.length);
  const averageTargetPmpm = Math.round(totalTargetPmpm / mockContracts.length);
  const portfolioVariance = averageCurrentPmpm - averageTargetPmpm;

  const statusCounts = mockContracts.reduce<Record<ContractStatus, number>>(
    (acc, contract) => {
      acc[contract.status] += 1;
      return acc;
    },
    { "On Track": 0, "At Risk": 0, "Off Track": 0 }
  );

  const contractsNeedingAttention = statusCounts["At Risk"] + statusCounts["Off Track"];
  const focusContract = [...mockContracts]
    .sort((a, b) => b.currentPmpm - b.targetPmpm - (a.currentPmpm - a.targetPmpm))[0];

  const highestRiskContracts = [...mockContracts]
    .filter((contract) => contract.status !== "On Track")
    .sort((a, b) => b.currentPmpm - b.targetPmpm - (a.currentPmpm - a.targetPmpm))
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Executive Home</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Portfolio-wide performance across cost, utilization, operations, and contract execution.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Active Contracts" value={mockContracts.length} description="Across payor programs" />
        <SummaryCard label="Lives" value={totalLives.toLocaleString()} description="Members in managed populations" />
        <SummaryCard label="Contracts Needing Attention" value={contractsNeedingAttention} description="At Risk + Off Track" accent="text-amber-600" />
        <SummaryCard
          label="Portfolio PMPM Variance"
          value={`${portfolioVariance > 0 ? "+" : ""}$${portfolioVariance}`}
          description={`Avg current $${averageCurrentPmpm} vs target $${averageTargetPmpm}`}
          accent={portfolioVariance > 0 ? "text-red-600" : "text-emerald-600"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Contract PMPM vs Target</h2>
            <span className="text-xs text-slate-500">Portfolio view</span>
          </div>
          <PortfolioBarChart contracts={mockContracts} />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Contract Status Mix</h2>
          <p className="mt-1 text-xs text-slate-500">Current operational trajectory at a glance</p>
          <div className="mt-3 flex items-center gap-3">
            <StatusDonutChart size="sm" counts={statusCounts} />
            <div className="min-w-0 flex-1 space-y-1.5 text-[11px]">
              {([
                ["On Track", statusCounts["On Track"], "bg-emerald-500"],
                ["At Risk", statusCounts["At Risk"], "bg-amber-500"],
                ["Off Track", statusCounts["Off Track"], "bg-red-500"],
              ] as const).map(([label, count, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <span className="truncate text-slate-600">{label}</span>
                  <span className="ml-auto font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Performance Trend</h2>
            <span className="text-xs text-slate-500">{focusContract.name}</span>
          </div>
          <p className="mb-3 text-xs text-slate-500">Monthly PMPM trajectory with target baseline.</p>
          <PmpmTrendChart data={focusContract.trend} targetPmpm={focusContract.targetPmpm} />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Executive Actions</h2>
          <p className="mt-1 text-xs text-slate-500">Navigate to the highest-value operational workflows.</p>
          <div className="mt-4 space-y-2">
            <Link href="/contracts" className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Review contract performance →</Link>
            <Link href="/population" className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Inspect population signals →</Link>
            <Link href="/actions" className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Open action intelligence →</Link>
            <Link href="/projects" className="block rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Track active projects →</Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-base font-semibold text-slate-900">Priority Contracts Needing Attention</h2>
        <p className="mt-1 text-xs text-slate-500">Ranked by PMPM variance above target.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {highestRiskContracts.map((contract) => {
            const overBy = contract.currentPmpm - contract.targetPmpm;
            return (
              <div key={contract.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{contract.name}</p>
                <p className="mt-1 text-xs text-slate-500">{contract.payor} · {contract.contractType}</p>
                <p className="mt-2 text-sm text-slate-700">Status: <span className="font-semibold">{contract.status}</span></p>
                <p className="text-sm text-slate-700">PMPM variance: <span className={overBy > 0 ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>{overBy > 0 ? "+" : ""}${overBy}</span></p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
