"use client";

import { useCallback, useState } from "react";
import AssistantSidePanel from "@/components/synapseai/AssistantSidePanel";
import { useChatWorkspace } from "@/components/synapseai/useChatWorkspace";
import {
  LIFE_SCIENCES_SINGLE_SAMPLE_PROMPTS,
  LIFE_SCIENCES_WEEKLY_IMPACT_PROMPT,
} from "@/lib/synapseai/chatPrompts";
import { lifeSciencesTrials } from "@/data/synthetic/lifeSciencesTrials";

type AssistantReply = {
  content: string;
  cta?: {
    label: string;
    href: string;
  };
};

export default function LifeSciencesChatPanel({
  isOpen,
  onClose,
  mode = "overlay",
  showCloseButton,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode?: "overlay" | "docked";
  showCloseButton?: boolean;
}) {
  const [input, setInput] = useState("");

  const workspace = useChatWorkspace({
    storageKey: "synapse.chat.life-sciences",
    recentThreadsLimit: 8,
    preserveThreadContentOnDelete: true,
  });

  const buildAssistantReply = useCallback((question: string): AssistantReply => {
    const lower = question.toLowerCase();
    const prioritized = [...lifeSciencesTrials].sort((a, b) => {
      const priorityRank = { "Tier 1": 0, "Tier 2": 1, "Tier 3": 2 };
      if (priorityRank[a.therapeuticPriority] !== priorityRank[b.therapeuticPriority]) {
        return priorityRank[a.therapeuticPriority] - priorityRank[b.therapeuticPriority];
      }
      return b.revenueOpportunityValue - a.revenueOpportunityValue;
    });
    const top = prioritized[0];

    if (!top) {
      return {
        content:
          "I can help with Life Sciences prioritization once trial recommendations are available on this page.",
      };
    }

    if (
      lower.includes("prioritize") ||
      lower.includes("highest") ||
      lower.includes("most impactful") ||
      lower.includes("this week")
    ) {
      return {
        content: `${top.name} is the top trial to prioritize this week.

Why this ranks #1 now:
• ${top.therapeuticPriority} priority with the strongest near-term portfolio value
• ${top.matchedPopulationCount.toLocaleString()} matched eligible lives ready for activation
• Clear quality tie-in across ${top.qualityImpacts.map((impact) => impact.measure).join(", ")}
• Sponsor fit is strong for immediate outreach (${top.sponsor})

Recommended next steps:
1) Launch outreach to the highest-likelihood eligible segment
2) Sequence coordinator follow-up by service-line readiness
3) Monitor referral leakage and conversion daily in the first 2 weeks`,
        cta: {
          label: "View eligible patient population",
          href: `/population?trialId=${top.id}`,
        },
      };
    }

    if (lower.includes("sponsor") || lower.includes("outreach") || lower.includes("fit")) {
      const outreachReady = prioritized
        .filter((trial) => trial.pipelineStage === "Outreach Ready" || trial.pipelineStage === "Interested")
        .slice(0, 3);
      return {
        content: `Top sponsor-fit outreach candidates right now:
${outreachReady.map((trial, index) => `${index + 1}. ${trial.name} (${trial.sponsor}) · ${trial.therapeuticPriority}`).join("\n")}

Execution guidance:
• Start with Tier 1 opportunities that have largest matched populations
• Pair outreach with quality-measure lift messaging for internal alignment
• Use referral-retention framing to reduce downstream leakage risk`,
      };
    }

    if (lower.includes("leakage") || lower.includes("referral") || lower.includes("retention")) {
      return {
        content:
          "To reduce referral leakage while improving trial enrollment, focus on Tier 1 trials with the highest matched populations, trigger early specialist coordination at point-of-care, and run one-click referral + consent workflows for pre-qualified patients.",
      };
    }

    return {
      content:
        "I can help rank trials by impact, identify sponsor-fit opportunities, and build outreach plans that improve quality and reduce referral leakage. Ask me what to prioritize this week and why.",
    };
  }, []);

  const onSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    workspace.appendTurn(trimmed, buildAssistantReply(trimmed));
    setInput("");
  };

  return (
    <AssistantSidePanel
      isOpen={isOpen}
      onClose={onClose}
      mode={mode}
      showCloseButton={showCloseButton}
      title="Life Sciences Chat Workspace"
      subtitle="Persistent assistant"
      messages={workspace.activeMessages}
      emptyState={`Start by asking: ${LIFE_SCIENCES_WEEKLY_IMPACT_PROMPT}`}
      inputValue={input}
      onInputChange={setInput}
      onSubmit={onSubmit}
      placeholder="Ask about trial prioritization, sponsor-fit, quality impact, or referral retention..."
      onNewChat={workspace.startNewChat}
      onClearChat={workspace.clearCurrentChat}
      threads={workspace.recentThreads}
      activeThreadId={workspace.activeThreadId}
      onSelectThread={workspace.setActiveThreadId}
      onDeleteThread={workspace.deleteThread}
      topContent={
        <div className="flex flex-wrap gap-1.5">
          {LIFE_SCIENCES_SINGLE_SAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => workspace.appendTurn(prompt, buildAssistantReply(prompt))}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              {prompt}
            </button>
          ))}
        </div>
      }
    />
  );
}
