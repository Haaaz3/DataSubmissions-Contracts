import type { FinancialScenario } from "@/data/synthetic/portfolioFinancialScenarios";
import { envelopePosition, improvement, signedMoney } from "@/lib/health-intelligence/financialEnvelope";

export default function FinancialEnvelope({ scenario, compact = false, axisMaximum }: { scenario: FinancialScenario; compact?: boolean; axisMaximum?: number }) {
  const minimum = axisMaximum ? -axisMaximum : scenario.downside;
  const maximum = axisMaximum ?? scenario.upside;
  const position = (value: number) => envelopePosition(value, minimum, maximum) + "%";
  const trackTop = compact ? "top-2" : "top-7";
  return <div>
    {compact && <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs tabular-nums"><span className="font-bold text-slate-900">{signedMoney(scenario.projected)} <span className="font-normal text-slate-500">projected</span></span><span className="font-semibold text-[#176b75]">{signedMoney(scenario.withActions)} <span className="font-normal">with actions</span></span></div>}
    <div role="img" aria-label={"Financial envelope: maximum downside " + signedMoney(scenario.downside) + ", maximum upside " + signedMoney(scenario.upside) + ", projected settlement " + signedMoney(scenario.projected) + ", with actions " + signedMoney(scenario.withActions) + ". Improvement " + signedMoney(improvement(scenario)) + "."} className={"relative " + (compact ? "my-2 h-7" : "mt-5 h-14")}>
      {!compact && <div className="absolute inset-x-0 top-0 flex justify-between text-[11px] text-slate-500"><span>Repayment / reduced payment</span><span>Earnings / additional payment</span></div>}
      <div className={"absolute inset-x-0 h-3 rounded-sm bg-slate-100 " + trackTop} />
      <div className={"absolute h-3 rounded-l-sm bg-[#ecd1ae] " + trackTop} style={{ left: position(scenario.downside), width: (envelopePosition(0, minimum, maximum) - envelopePosition(scenario.downside, minimum, maximum)) + "%" }} />
      <div className={"absolute h-3 rounded-r-sm bg-[#b8dcd4] " + trackTop} style={{ left: position(0), width: (envelopePosition(scenario.upside, minimum, maximum) - envelopePosition(0, minimum, maximum)) + "%" }} />
      <span className={"absolute w-px -translate-x-1/2 bg-slate-400 " + (compact ? "top-1 h-5" : "top-6 h-5")} style={{ left: position(0) }} />
      <span className={"absolute h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-white bg-slate-900 shadow-sm " + (compact ? "top-1.5" : "top-[26px]")} style={{ left: position(scenario.projected) }} />
      <span className={"absolute h-3 w-3 -translate-x-1/2 rotate-45 border-2 border-[#176b75] bg-white " + trackTop} style={{ left: position(scenario.withActions) }} />
    </div>
    {compact ? <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[10px] tabular-nums text-slate-500"><span>Range {signedMoney(scenario.downside)} to {signedMoney(scenario.upside)}</span><span className="font-semibold text-[#176b75]">{signedMoney(improvement(scenario))} improvement</span></div> : <div className="relative flex justify-between gap-2 text-xs tabular-nums">
      <span className="text-[#985216]">{signedMoney(scenario.downside)}<span className="ml-1 text-slate-500">Max downside</span></span>
      <span className="absolute -translate-x-1/2 text-slate-500" style={{ left: position(0) }}>$0 · Break-even</span>
      <span className="text-[#176b75]">{signedMoney(scenario.upside)}<span className="ml-1 text-slate-500">Max upside</span></span>
    </div>}
  </div>;
}
