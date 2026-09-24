"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AssistantSidePanel from "@/components/synapseai/AssistantSidePanel";
import { useChatWorkspace } from "@/components/synapseai/useChatWorkspace";
import QualityChatPanel from "@/components/synapseai/QualityChatPanel";

export default function PersistentAssistant({
  variant = "auto",
}: {
  variant?: "auto" | "desktop-docked" | "mobile-overlay";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isQualityChatOpen, setIsQualityChatOpen] = useState(false);
  const [input, setInput] = useState("");

  const isQualityRoute = pathname.startsWith("/quality");

  const context = useMemo(() => {
    if (pathname.startsWith("/population")) {
      return {
        label: "Population Assistant",
        hint: "Ask for attributed patients with closable gaps",
        placeholder: "Ask about attributed panels, visits, and care gaps...",
        samplePrompts: [
          "Show attributed patients with appointments this week and open CRC gaps.",
          "Rank patients by likely closure in one visit.",
          "Which list should MA outreach first?",
        ],
        storageKey: "synapse.chat.population",
      };
    }
    if (pathname.startsWith("/projects")) {
      return {
        label: "Project Assistant",
        hint: "Ask what to execute next in this project",
        placeholder: "Ask about status, actions, or blockers...",
        samplePrompts: [
          "What should we execute next this week?",
          "Which blockers are highest risk to timeline?",
          "Summarize open actions by owner.",
        ],
        storageKey: "synapse.chat.projects",
      };
    }
    return {
      label: "Oracle Health AI Assistant",
      hint: "Ask me anything about this page",
      placeholder: "Ask Oracle Health AI...",
      samplePrompts: [],
      storageKey: "synapse.chat.general",
    };
  }, [pathname]);

  const workspace = useChatWorkspace({
    storageKey: context.storageKey,
    recentThreadsLimit: 8,
  });

  const shouldShow =
    pathname.startsWith("/quality") ||
    pathname.startsWith("/population") ||
    pathname.startsWith("/projects");

  const isDesktopDocked = variant === "desktop-docked";
  const isMobileOverlay = variant === "mobile-overlay" || variant === "auto";
  const shouldRenderDocked = isDesktopDocked;

  if (!shouldShow) return null;

  if (isQualityRoute) {
    if (shouldRenderDocked) {
      return (
        <div className="sticky top-20 h-[calc(100vh-6.5rem)]">
          <QualityChatPanel
            isOpen
            onClose={() => undefined}
            mode="docked"
            showCloseButton={false}
            onCtaClick={(href) => {
              router.push(href);
            }}
          />
        </div>
      );
    }

    if (!isMobileOverlay) return null;

    return (
      <>
        {!isQualityChatOpen ? (
          <button
            type="button"
            onClick={() => setIsQualityChatOpen(true)}
            className="fixed bottom-24 right-4 z-40 rounded-full border border-indigo-300 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50"
          >
            Quality Assistant · Ask what measure to prioritize this week
          </button>
        ) : null}

        <QualityChatPanel
          isOpen={isQualityChatOpen}
          onClose={() => setIsQualityChatOpen(false)}
            mode="overlay"
            showCloseButton
          onCtaClick={(href) => {
            setIsQualityChatOpen(false);
            router.push(href);
          }}
        />
      </>
    );
  }

  const onSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    workspace.appendTurn(trimmed, {
      content:
        "I can help with that. For deeper analysis, use the page-level assistant prompts or ask me to navigate you to the right workflow.",
    });
    setInput("");
  };

  const openPanel = () => {
    if (shouldRenderDocked) return;
    setIsOpen(true);
  };

  if (shouldRenderDocked) {
    return (
      <div className="sticky top-20 h-[calc(100vh-6.5rem)]">
        <AssistantSidePanel
          isOpen
          onClose={() => undefined}
          mode="docked"
          showCloseButton={false}
          title={context.label}
          subtitle="Persistent assistant"
          messages={workspace.activeMessages}
          emptyState="I’m always available here to help you navigate, execute workflows, and learn the system."
          inputValue={input}
          onInputChange={setInput}
          onSubmit={onSubmit}
          placeholder={context.placeholder}
          onNewChat={workspace.startNewChat}
          onClearChat={workspace.clearCurrentChat}
          threads={workspace.recentThreads}
          activeThreadId={workspace.activeThreadId}
          onSelectThread={workspace.setActiveThreadId}
          onDeleteThread={workspace.deleteThread}
          topContent={
            context.samplePrompts.length ? (
              <div className="flex flex-wrap gap-1.5">
                {context.samplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      workspace.appendTurn(prompt, {
                        content:
                          "Great starting point. I can break this down into prioritized next steps and direct you to the right workflow.",
                      });
                    }}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null
          }
          onCtaClick={(href) => {
            router.push(href);
          }}
        />
      </div>
    );
  }

  if (!isMobileOverlay) return null;

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-40 rounded-full border border-indigo-300 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50"
        >
          {context.label} · {context.hint}
        </button>
      ) : null}

      <AssistantSidePanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={context.label}
        subtitle="Persistent assistant"
        messages={workspace.activeMessages}
        emptyState="I’m always available here to help you navigate, execute workflows, and learn the system."
        inputValue={input}
        onInputChange={setInput}
        onSubmit={onSubmit}
        placeholder={context.placeholder}
        onNewChat={workspace.startNewChat}
        onClearChat={workspace.clearCurrentChat}
        threads={workspace.recentThreads}
        activeThreadId={workspace.activeThreadId}
        onSelectThread={workspace.setActiveThreadId}
        onDeleteThread={workspace.deleteThread}
        topContent={
          context.samplePrompts.length ? (
            <div className="flex flex-wrap gap-1.5">
              {context.samplePrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    workspace.appendTurn(prompt, {
                      content:
                        "Great starting point. I can break this down into prioritized next steps and direct you to the right workflow.",
                    });
                    openPanel();
                  }}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null
        }
        onCtaClick={(href) => {
          setIsOpen(false);
          router.push(href);
        }}
      />
    </>
  );
}
