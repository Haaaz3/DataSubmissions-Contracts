import type { AgreementFinancialContributionSummaryInsight } from "@/types/contractInsights";

const toneClass: Record<AgreementFinancialContributionSummaryInsight["tone"], string> = {
  default: "border-slate-200 bg-white text-slate-700",
  warning: "border-amber-200 bg-amber-50/60 text-amber-800",
  danger: "border-red-200 bg-red-50/60 text-red-800",
  positive: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
};

export default function AgreementFinancialInsightCards({
  insights,
}: {
  insights: AgreementFinancialContributionSummaryInsight[];
}) {
  return (
    <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {insights.map((insight) => (
        <article key={insight.label} className={`rounded-xl border p-4 ${toneClass[insight.tone]}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">{insight.label}</p>
          <p className="mt-1 text-sm">{insight.description}</p>
        </article>
      ))}
    </section>
  );
}
