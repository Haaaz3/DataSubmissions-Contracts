import Link from "next/link";
import { SynapseWorkspace } from "@/lib/models/workspace";
import { getAgentById } from "@/lib/synapseai/agentRegistry";

export default function EmbeddedWorkspaceCard({ workspace }: { workspace: SynapseWorkspace }) {
  const kpiBlock = workspace.blocks.find((block) => block.type === "kpi");
  const insightBlock = workspace.blocks.find((block) => block.type === "insight");
  const actionsBlock = workspace.blocks.find((block) => block.type === "actions");
  const nextQuestionsBlock = workspace.blocks.find((block) => block.type === "next_questions");
  const topInsight = insightBlock?.items?.[0];
  const topAction = actionsBlock?.items?.[0];
  const nextPrompt = nextQuestionsBlock?.items?.[0] ?? workspace.sourcePrompts[workspace.sourcePrompts.length - 1];
  const goals = workspace.goals ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500">Embedded AI Workspace</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{workspace.title}</h3>
          <p className="mt-2 text-xs text-slate-600">{workspace.summary}</p>
        </div>
        <Link
          href={`/workspaces/${workspace.id}`}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700"
        >
          Open
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Workspace goals</p>
        <Link
          href={`/workspaces/${workspace.id}#goals`}
          className="text-[11px] font-semibold text-indigo-700 hover:underline"
        >
          {goals.length ? `Manage (${goals.length})` : "Set goals"}
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {workspace.contributingAgentIds.map((agentId) => {
          const agent = getAgentById(agentId);
          return (
            <span key={agentId} className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
              {agent.shortLabel}
            </span>
          );
        })}
      </div>

      {kpiBlock?.kpis?.length ? (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {kpiBlock.kpis.slice(0, 3).map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
              <p className="text-[10px] text-slate-500">{kpi.label}</p>
              <p className="text-sm font-semibold text-slate-900">{kpi.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {actionsBlock?.items?.length ? (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase text-slate-500">Top Actions</p>
          <ul className="mt-1 space-y-1 text-xs text-slate-700">
            {actionsBlock.items.slice(0, 2).map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {(topInsight || topAction || nextPrompt) && (
        <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3">
          <p className="text-[11px] font-semibold uppercase text-indigo-700">Insight → Action → Prompt</p>
          <div className="mt-2 space-y-2 text-xs text-slate-700">
            {topInsight && (
              <p>
                <span className="font-semibold text-indigo-700">Insight:</span> {topInsight}
              </p>
            )}
            {topAction && (
              <p>
                <span className="font-semibold text-emerald-700">Action:</span> {topAction}
              </p>
            )}
            {nextPrompt && (
              <p>
                <span className="font-semibold text-amber-700">Prompt:</span> {nextPrompt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
