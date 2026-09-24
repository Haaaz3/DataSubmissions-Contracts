"use client";

import { motion } from "framer-motion";
import { SynapseAIRun } from "@/lib/models/agent";
import SynapseBadge from "@/components/SynapseBadge";

interface AgentConsoleProps {
  run: SynapseAIRun | null;
}

export default function AgentConsole({ run }: AgentConsoleProps) {
  if (!run) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-400">
        Ask SynapseAI to see the agent activity timeline.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">SynapseAI Activity</h3>
          <p className="text-xs text-slate-400">Streaming agent pipeline</p>
        </div>
        <SynapseBadge label="SynapseAI" tone="info" />
      </div>
      <div className="mt-4 space-y-3">
        {run.steps.map((step) => (
          <motion.div
            key={step.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="text-xs font-semibold text-slate-700">{step.name}</p>
              <p className="text-[10px] text-slate-400">
                {step.startedAt ? `Started ${step.startedAt.slice(11, 19)}` : "Queued"}
              </p>
            </div>
            <SynapseBadge
              label={step.status === "running" ? "Thinking…" : step.status === "complete" ? "Done" : "Queued"}
              tone={step.status === "complete" ? "success" : step.status === "running" ? "warning" : "default"}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}