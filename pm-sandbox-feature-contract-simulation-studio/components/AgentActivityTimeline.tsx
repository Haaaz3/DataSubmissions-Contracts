import { AgentActivityStep } from "@/lib/narrativeUx";

interface AgentActivityTimelineProps {
  title?: string;
  subtitle?: string;
  steps: AgentActivityStep[];
}

const toneByStatus: Record<AgentActivityStep["status"], string> = {
  complete: "bg-emerald-100 text-emerald-700",
  running: "bg-amber-100 text-amber-700",
  queued: "bg-slate-100 text-slate-600",
};

const dotByStatus: Record<AgentActivityStep["status"], string> = {
  complete: "bg-emerald-500",
  running: "bg-amber-500",
  queued: "bg-slate-300",
};

export default function AgentActivityTimeline({
  title = "Agent Activity / Reasoning",
  subtitle = "Transparent, non-PHI summary of what the agent reviewed and why actions are recommended.",
  steps,
}: AgentActivityTimelineProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>

      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dotByStatus[step.status]}`} />
                <div>
                  <p className="text-xs font-semibold text-slate-700">{step.label}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{step.detail}</p>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneByStatus[step.status]}`}>
                {step.status === "complete" ? "Done" : step.status === "running" ? "In progress" : "Queued"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
