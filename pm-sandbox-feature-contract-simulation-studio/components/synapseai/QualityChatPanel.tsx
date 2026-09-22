"use client";

import { useCallback, useEffect, useState } from "react";
import AssistantSidePanel from "@/components/synapseai/AssistantSidePanel";
import { useChatWorkspace } from "@/components/synapseai/useChatWorkspace";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import { QUALITY_SINGLE_SAMPLE_PROMPTS, QUALITY_WEEKLY_IMPACT_PROMPT } from "@/lib/synapseai/chatPrompts";
import { getPortfolioMeasures, getRankedQualityOpportunities, toFinancialBand } from "@/lib/qualityData";

type AssistantReply = {
  content: string;
  cta?: {
    label: string;
    href: string;
  };
};

export default function QualityChatPanel({
  isOpen,
  onClose,
  mode = "overlay",
  showCloseButton,
  queuedPromptRequest,
  onQueuedPromptConsumed,
  onCtaClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode?: "overlay" | "docked";
  showCloseButton?: boolean;
  queuedPromptRequest?: { id: string; prompt: string } | null;
  onQueuedPromptConsumed?: () => void;
  onCtaClick?: (href: string) => void;
}) {
  const [input, setInput] = useState("");
  const { flags } = useFeatureFlags();

  const workspace = useChatWorkspace({
    storageKey: "synapse.chat.quality",
    recentThreadsLimit: 8,
    preserveThreadContentOnDelete: true,
  });

  const buildAssistantReply = useCallback((question: string): AssistantReply => {
    const lower = question.toLowerCase();
    const opportunities = getRankedQualityOpportunities(getPortfolioMeasures()).filter((o) => o.hasInsight);
    const top = opportunities[0];
    const asksTopMeasureOpportunity =
      (lower.includes("top measure") || lower.includes("top opportunity") || lower.includes("most impactful")) &&
      (lower.includes("this week") || lower.includes("week") || lower.includes("why"));

    if (asksTopMeasureOpportunity && top) {
      return {
        content: `Top measure opportunity this week: ${top.measureName}

Why this is #1 right now:
• Largest near-term impact opportunity across your current quality portfolio
• High concentration of closable gaps in members already scheduled this week
• Strong operational readiness (standing workflows + available outreach/rooming steps)
• Favorable denominator size means small numerator lift creates visible score movement

This week’s opportunity profile:
• Priority members with active gap: ~128
• Members already on schedule this week: 34
• High-confidence “closable in-visit” subset: 19
• Projected near-term uplift: +1.6 to +2.1 pts (measure-level)
• Estimated financial impact band: ${flags.showFinancialData ? "~$185K–$240K" : "High"}

Why now (timing rationale):
1) Visit cadence is favorable this week (more attributed diabetic follow-ups)
2) Care team can close gaps during routine encounters with minimal workflow friction
3) Comparable measures (e.g., breast/CRC) have larger dependency on external scheduling lag

Recommended execution plan for this week:
• Pre-visit: identify scheduled diabetic members with stale/missing A1c
• Day-of-visit: prompt rooming + PCP with pending A1c action
• Post-visit: 48-hour cleanup for incomplete labs and missing result documentation
• Daily huddle: review remaining open opportunities by PCP panel

If helpful, I can break this down by contract and provider to show exactly where to focus first by expected lift per outreach hour.`,
        cta: {
          label: "View Action Plan",
          href: "/synapse/results?prompt=Build+a+quality+action+plan+for+Avoidable+Emergency+Department+Utilization.&agent=quality_care_gap&suite=oracle_health&route=%2Fquality&insight=measure-action&measureId=ed-avoidance&actionId=closure-plan&source=quality-top-opportunity",
        },
      };
    }

    if ((lower.includes("most impactful") || lower.includes("focus on") || lower.includes("this week")) && top) {
      const impact = flags.showFinancialData
        ? `~$${Math.round(top.estimatedFinancialImpact).toLocaleString()} projected impact`
        : `${toFinancialBand(top.estimatedFinancialImpact)} opportunity band`;
      return {
        content: `${top.measureName} is the highest-impact measure to focus on this week because it has the strongest projected lift (${impact}) and high closure opportunity (${top.patientsLeftToTarget.toLocaleString()} members to target). Ask me to break this down by provider or contract.`,
      };
    }

    return {
      content:
        "I can prioritize measures by impact, care-gap size, and operational readiness. Ask: ‘what should we execute first and why’, and I’ll return ranked recommendations with rationale.",
    };
  }, [flags.showFinancialData]);

  useEffect(() => {
    const nextPrompt = queuedPromptRequest?.prompt?.trim();
    if (!nextPrompt) return;
    workspace.appendTurn(nextPrompt, buildAssistantReply(nextPrompt));
    setInput("");
    onQueuedPromptConsumed?.();
  }, [buildAssistantReply, onQueuedPromptConsumed, queuedPromptRequest, workspace]);

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
      title="Quality Chat Workspace"
      subtitle="Persistent assistant"
      messages={workspace.activeMessages}
      emptyState={`Start by asking: ${QUALITY_WEEKLY_IMPACT_PROMPT}`}
      inputValue={input}
      onInputChange={setInput}
      onSubmit={onSubmit}
      placeholder="Ask a follow-up about quality priorities, patient lists, or initiative impact..."
      onCtaClick={onCtaClick}
      onNewChat={workspace.startNewChat}
      onClearChat={workspace.clearCurrentChat}
      threads={workspace.recentThreads}
      activeThreadId={workspace.activeThreadId}
      onSelectThread={workspace.setActiveThreadId}
      onDeleteThread={workspace.deleteThread}
      topContent={
        <div className="flex flex-wrap gap-1.5">
          {QUALITY_SINGLE_SAMPLE_PROMPTS.map((prompt) => (
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