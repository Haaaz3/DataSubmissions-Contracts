"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type WorkspaceMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string;
  cta?: { label: string; href: string };
  evidenceIds?: string[];
  timestamp: string;
};

export type WorkspaceThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  messages: WorkspaceMessage[];
};

export function useChatWorkspace({
  storageKey,
  maxStoredThreads = 24,
  recentThreadsLimit = 8,
  preserveThreadContentOnDelete = false,
}: {
  storageKey: string;
  maxStoredThreads?: number;
  recentThreadsLimit?: number;
  preserveThreadContentOnDelete?: boolean;
}) {
  const [threads, setThreads] = useState<WorkspaceThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const summarizeTitle = useCallback((text: string) => {
    const cleaned = text.trim().replace(/\s+/g, " ");
    return cleaned.length > 46 ? `${cleaned.slice(0, 46)}…` : cleaned || "New chat";
  }, []);

  const startNewChat = useCallback((seedTitle?: string) => {
    const now = new Date().toISOString();
    const id = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const thread: WorkspaceThread = {
      id,
      title: seedTitle ? summarizeTitle(seedTitle) : "New chat",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    setThreads((prev) => [thread, ...prev]);
    setActiveThreadId(id);
    return id;
  }, [summarizeTitle]);

  const appendTurn = useCallback(
    (
      userText: string,
      assistantReply: {
        content: string;
        title?: string;
        cta?: { label: string; href: string };
        evidenceIds?: string[];
      }
    ) => {
      const now = new Date().toISOString();
      const userMessage: WorkspaceMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText,
        timestamp: now,
      };
      const assistantMessage: WorkspaceMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "assistant",
        content: assistantReply.content,
        title: assistantReply.title,
        cta: assistantReply.cta,
        evidenceIds: assistantReply.evidenceIds,
        timestamp: now,
      };

      let targetThreadId = activeThreadId;
      if (!targetThreadId || !threads.some((thread) => thread.id === targetThreadId)) {
        targetThreadId = startNewChat(userText);
      }

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === targetThreadId
            ? {
                ...thread,
                title:
                  thread.messages.length === 0 && thread.title === "New chat"
                    ? summarizeTitle(userText)
                    : thread.title,
                updatedAt: now,
                messages: [...thread.messages, userMessage, assistantMessage],
              }
            : thread
        )
      );
    },
    [activeThreadId, startNewChat, summarizeTitle, threads]
  );

  const appendAssistantMessage = useCallback(
    (assistantReply: {
      content: string;
      title?: string;
      cta?: { label: string; href: string };
      evidenceIds?: string[];
    }) => {
      const now = new Date().toISOString();
      const assistantMessage: WorkspaceMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: "assistant",
        content: assistantReply.content,
        title: assistantReply.title,
        cta: assistantReply.cta,
        evidenceIds: assistantReply.evidenceIds,
        timestamp: now,
      };

      let targetThreadId = activeThreadId;
      if (!targetThreadId || !threads.some((thread) => thread.id === targetThreadId)) {
        targetThreadId = startNewChat(assistantReply.title ?? assistantReply.content);
      }

      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === targetThreadId
            ? {
                ...thread,
                title:
                  thread.messages.length === 0 && thread.title === "New chat"
                    ? summarizeTitle(assistantReply.title ?? assistantReply.content)
                    : thread.title,
                updatedAt: now,
                messages: [...thread.messages, assistantMessage],
              }
            : thread
        )
      );
    },
    [activeThreadId, startNewChat, summarizeTitle, threads]
  );

  const clearCurrentChat = useCallback(() => {
    if (!activeThreadId) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === activeThreadId
          ? { ...thread, messages: [], updatedAt: new Date().toISOString(), title: "New chat" }
          : thread
      )
    );
  }, [activeThreadId]);

  const deleteThread = useCallback(
    (threadId: string) => {
      const now = new Date().toISOString();
      setThreads((prev) => {
        if (preserveThreadContentOnDelete) {
          const next = prev.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  archivedAt: thread.archivedAt ?? now,
                  updatedAt: now,
                }
              : thread
          );
          return next;
        }

        const next = prev.filter((thread) => thread.id !== threadId);
        if (activeThreadId === threadId) {
          setActiveThreadId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    [activeThreadId, preserveThreadContentOnDelete]
  );

  useEffect(() => {
    try {
      const threadsRaw = localStorage.getItem(`${storageKey}.threads`);
      const activeRaw = localStorage.getItem(`${storageKey}.activeThread`);
      const parsedThreads = threadsRaw ? (JSON.parse(threadsRaw) as WorkspaceThread[]) : [];
      const nextThreads = Array.isArray(parsedThreads) ? parsedThreads : [];
      const nextActiveThreadId =
        activeRaw && nextThreads.some((thread) => thread.id === activeRaw)
          ? activeRaw
          : nextThreads[0]?.id ?? null;
      setThreads(nextThreads);
      setActiveThreadId(nextActiveThreadId);
    } catch {
      setThreads([]);
      setActiveThreadId(null);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}.threads`, JSON.stringify(threads.slice(0, maxStoredThreads)));
    localStorage.setItem(`${storageKey}.activeThread`, activeThreadId ?? "");
  }, [activeThreadId, maxStoredThreads, storageKey, threads]);

  const activeMessages = useMemo(() => {
    const thread = threads.find((item) => item.id === activeThreadId);
    return thread?.messages ?? [];
  }, [activeThreadId, threads]);

  const recentThreads = useMemo(
    () => threads.filter((thread) => !thread.archivedAt).slice(0, recentThreadsLimit),
    [threads, recentThreadsLimit]
  );

  return {
    threads,
    recentThreads,
    activeThreadId,
    setActiveThreadId,
    activeMessages,
    startNewChat,
    appendTurn,
    appendAssistantMessage,
    clearCurrentChat,
    deleteThread,
  };
}
