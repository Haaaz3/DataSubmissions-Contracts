"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AssistantSidePanel from "@/components/synapseai/AssistantSidePanel";
import QualityChatPanel from "@/components/synapseai/QualityChatPanel";
import { useChatWorkspace } from "@/components/synapseai/useChatWorkspace";
import {
  agentSuites,
  defaultAgentByRoute,
  defaultSuiteByRoute,
  getAgentById,
  getAgentProfileById,
  getAgentsForSuite,
  getSuiteById,
  SynapseAgentId,
  AgentSuiteId,
  AgentSuiteDefinition,
} from "@/lib/synapseai/agentRegistry";
import { QUALITY_SINGLE_SAMPLE_PROMPTS } from "@/lib/synapseai/chatPrompts";

export default function GlobalSynapseSearch({
  variant = "default",
}: {
  variant?: "default" | "header";
}) {
  type ChatContext = "quality" | "population";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const defaultSuite = defaultSuiteByRoute[pathname] ?? defaultSuiteByRoute["/"];
  const defaultAgent = defaultAgentByRoute[pathname] ?? defaultAgentByRoute["/"];
  const [selectedSuite, setSelectedSuite] = useState<AgentSuiteId>(defaultSuite);
  const [selectedAgent, setSelectedAgent] = useState<SynapseAgentId>(defaultAgent);
  const [expanded, setExpanded] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteSuites, setFavoriteSuites] = useState<AgentSuiteId[]>([]);
  const [favoriteAgents, setFavoriteAgents] = useState<SynapseAgentId[]>([]);
  const [isQualityChatOpen, setIsQualityChatOpen] = useState(false);
  const [isPopulationChatOpen, setIsPopulationChatOpen] = useState(false);
  const [qualityPromptRequest, setQualityPromptRequest] = useState<{ id: string; prompt: string } | null>(null);
  const shouldOpenDirectoryFromQuery = searchParams.get("openDirectory") === "true";
  const suiteFromQuery = searchParams.get("suite");
  const agentFromQuery = searchParams.get("agent");
  const promptFromQuery = searchParams.get("prompt");

  const placeholders: Record<string, string> = {
    cohorts: "Ask Oracle Health AI about this cohort…",
    actions: "Ask Oracle Health AI about actions…",
    care: "Ask Oracle Health AI about care management…",
    population: "Ask Oracle Health AI about population trends…",
    projects: "Ask Oracle Health AI about projects…",
    quality: "Ask Oracle Health AI about quality performance…",
    contracts: "Ask Oracle Health AI about contracts…",
    dashboard: "Ask Oracle Health AI about the portfolio…",
    default: "Ask Oracle Health AI…",
  };

  const contextKey = pathname === "/"
    ? "dashboard"
    : pathname.startsWith("/actions")
    ? "actions"
    : pathname.startsWith("/care-management")
    ? "care"
    : pathname.startsWith("/population")
    ? "population"
    : pathname.startsWith("/projects")
    ? "projects"
    : pathname.startsWith("/quality")
    ? "quality"
    : pathname.startsWith("/contracts")
    ? "contracts"
    : pathname.startsWith("/cohorts")
    ? "cohorts"
    : "default";

  const suite = getSuiteById(selectedSuite);
  const suiteAgents = useMemo(() => getAgentsForSuite(selectedSuite), [selectedSuite]);
  const favoriteSuiteItems = useMemo(
    () => favoriteSuites.map((suiteId) => getSuiteById(suiteId)),
    [favoriteSuites]
  );
  const favoriteAgentItems = useMemo(
    () => favoriteAgents.map((agentId) => getAgentById(agentId)),
    [favoriteAgents]
  );
  const filteredSuites = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return agentSuites;
    return agentSuites.filter((suiteItem) =>
      [suiteItem.name, suiteItem.owner, suiteItem.description].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [searchTerm]);
  const suitesByCategory = useMemo(() => {
    return filteredSuites.reduce<Record<string, AgentSuiteDefinition[]>>((acc, suiteItem) => {
      acc[suiteItem.category] = acc[suiteItem.category] ?? [];
      acc[suiteItem.category].push(suiteItem);
      return acc;
    }, {});
  }, [filteredSuites]);
  const filteredAgents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const agents = suiteAgents;
    if (!term) return agents;
    return agents.filter((agentItem) =>
      [agentItem.displayName, agentItem.shortLabel, agentItem.shortDescription].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, suiteAgents]);
  const agent = getAgentById(selectedAgent);
  const agentProfile = getAgentProfileById(selectedAgent);
  const defaultPromptChips = agent.promptExamplesByRoute[contextKey] ?? agent.promptExamplesByRoute.default;
  const supportsMultiTurn = contextKey === "quality" || contextKey === "population";
  const isPatientDetailRoute = pathname.startsWith("/population/member/");
  const promptChips = contextKey === "quality" ? [...QUALITY_SINGLE_SAMPLE_PROMPTS] : defaultPromptChips;
  const placeholderText = placeholders[contextKey] ?? placeholders.default;
  const isRecommended = defaultAgent === selectedAgent;

  const toChatContext = (value: string): ChatContext | null =>
    value === "quality" || value === "population" ? value : null;

  const populationWorkspace = useChatWorkspace({
    storageKey: "synapse.chat.population",
    recentThreadsLimit: 8,
  });

  const suiteCategoryConfig = {
    Platform: { icon: "🧩", text: "text-indigo-700", bg: "bg-indigo-50" },
    Providers: { icon: "🏥", text: "text-emerald-700", bg: "bg-emerald-50" },
    Payors: { icon: "🧾", text: "text-cyan-700", bg: "bg-cyan-50" },
    Research: { icon: "🔬", text: "text-sky-700", bg: "bg-sky-50" },
    Pharma: { icon: "💊", text: "text-rose-700", bg: "bg-rose-50" },
    Partners: { icon: "🛰️", text: "text-orange-700", bg: "bg-orange-50" },
  } as const;

  const buildPopulationAssistantReply = (question: string) => {
    const lower = question.toLowerCase();

    const asksDrSmithCrcList =
      (lower.includes("dr. smith") || lower.includes("dr smith")) &&
      (lower.includes("colorectal") || lower.includes("crc") || lower.includes("colon")) &&
      (lower.includes("appointment") || lower.includes("this week") || lower.includes("visit"));

    if (asksDrSmithCrcList) {
      return { content: `I found Dr. Smith-attributed patients with appointments this week who are overdue for colorectal cancer (CRC) screening.

Matched patients this week (5):
• Maria Thompson — Tue 10:20 AM — Age 58 — CRC screening overdue 14 months
• James Patel — Tue 2:40 PM — Age 62 — No FIT/FOBT in last 24 months
• Linda Alvarez — Wed 9:00 AM — Age 55 — Colonoscopy overdue (last completed 11 years ago)
• Robert Chen — Thu 1:30 PM — Age 60 — Prior FIT positive, follow-up diagnostic colonoscopy not documented
• Angela Brooks — Fri 11:10 AM — Age 57 — CRC care gap open, no screening result on file

Why these members were selected:
1) PCP attribution = Dr. Smith
2) Upcoming appointment in the next 7 days
3) Active CRC care gap based on age/risk criteria and missing or stale screening evidence

Recommended in-visit closure plan:
• Confirm screening modality preference (FIT vs colonoscopy)
• Place/renew order during visit
• For FIT: provide kit in clinic + set 7-day return reminder
• For colonoscopy: route to GI scheduler before check-out
• Document shared decision-making and contraindications, if any

Operational prep before clinic:
• Pre-print care-gap summary for rooming staff
• Queue pending orders in chart for one-click PCP sign-off
• Flag prior abnormal results requiring escalated follow-up

If you want, I can rank these five by “highest likelihood to close in one visit” and draft outreach scripts for your MA team.` };
    }

    const isSmith = lower.includes("dr. smith") || lower.includes("dr smith");
    const isColorectal =
      lower.includes("colorectal") || lower.includes("crc") || lower.includes("colon");
    const isAppointments =
      lower.includes("appointment") || lower.includes("visit") || lower.includes("this week");

    if (isSmith && isColorectal && isAppointments) {
      return { content: "I can build that list. I’ll focus on Dr. Smith’s attributed panel, upcoming appointments this week, and open colorectal screening gaps. Next step: use “Open filtered patient list” from Population and I’ll refine by priority/high closability." };
    }

    return { content: "Got it — I can translate that into a patient-list query using provider, appointment window, and care-gap filters. You can ask follow-ups like: ‘rank by closure likelihood’ or ‘only show high opportunity members’." };
  };

  const enqueueQualityPrompt = (promptText: string) => {
    const nextPrompt = promptText.trim();
    if (!nextPrompt) return;
    setQualityPromptRequest({
      id: `quality-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      prompt: nextPrompt,
    });
    setIsQualityChatOpen(true);
  };

  const handleAsk = () => {
    if (!prompt.trim()) return;

    if (supportsMultiTurn) {
      const ctx = toChatContext(contextKey);
      if (!ctx) return;
      if (ctx === "quality") {
        enqueueQualityPrompt(prompt);
      } else {
        populationWorkspace.appendTurn(prompt, buildPopulationAssistantReply(prompt));
        setIsPopulationChatOpen(true);
      }
      setExpanded(false);
      setPrompt("");
      return;
    }

    router.push(
      `/synapse/results?prompt=${encodeURIComponent(prompt)}&agent=${selectedAgent}&suite=${selectedSuite}&route=${encodeURIComponent(pathname)}`
    );
    setPrompt("");
  };

  const handleAgentSelect = (agentId: SynapseAgentId) => {
    const selectedAgentItem = getAgentById(agentId);
    setSelectedSuite(selectedAgentItem.suiteId);
    setSelectedAgent(agentId);
  };

  const toggleFavoriteSuite = (suiteId: AgentSuiteId) => {
    setFavoriteSuites((prev) =>
      prev.includes(suiteId) ? prev.filter((item) => item !== suiteId) : [...prev, suiteId]
    );
  };

  const toggleFavoriteAgent = (agentId: SynapseAgentId) => {
    setFavoriteAgents((prev) =>
      prev.includes(agentId) ? prev.filter((item) => item !== agentId) : [...prev, agentId]
    );
  };

  useEffect(() => {
    const storedSuites = localStorage.getItem("synapse.favoriteSuites");
    const storedAgents = localStorage.getItem("synapse.favoriteAgents");
    if (storedSuites) {
      try {
        const parsedSuites = JSON.parse(storedSuites);
        if (Array.isArray(parsedSuites)) {
          setFavoriteSuites(parsedSuites);
        }
      } catch (error) {
        console.warn("Failed to parse favorite suites", error);
      }
    }
    if (storedAgents) {
      try {
        const parsedAgents = JSON.parse(storedAgents);
        if (Array.isArray(parsedAgents)) {
          setFavoriteAgents(parsedAgents);
        }
      } catch (error) {
        console.warn("Failed to parse favorite agents", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("synapse.favoriteSuites", JSON.stringify(favoriteSuites));
  }, [favoriteSuites]);

  useEffect(() => {
    localStorage.setItem("synapse.favoriteAgents", JSON.stringify(favoriteAgents));
  }, [favoriteAgents]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  useEffect(() => {
    if (!shouldOpenDirectoryFromQuery) return;
    setShowSelector(true);
    setExpanded(true);
    if (suiteFromQuery) {
      setSelectedSuite(suiteFromQuery as AgentSuiteId);
    }
    if (agentFromQuery) {
      setSelectedAgent(agentFromQuery as SynapseAgentId);
    }
    if (promptFromQuery) {
      setPrompt(promptFromQuery);
    }
  }, [shouldOpenDirectoryFromQuery, suiteFromQuery, agentFromQuery, promptFromQuery]);

  useEffect(() => {
    if (shouldOpenDirectoryFromQuery || suiteFromQuery || agentFromQuery) return;
    const nextDefaultSuite = defaultSuiteByRoute[pathname] ?? defaultSuiteByRoute["/"];
    const nextDefaultAgent = defaultAgentByRoute[pathname] ?? defaultAgentByRoute["/"];
    setSelectedSuite(nextDefaultSuite);
    setSelectedAgent(nextDefaultAgent);
  }, [pathname, shouldOpenDirectoryFromQuery, suiteFromQuery, agentFromQuery]);

  const navigateWithLoading = (params: URLSearchParams) => {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
    setExpanded(false);
    if (!params.get("destination")) {
      params.set("destination", "results");
    }
    router.push(`/synapse/loading?${params.toString()}`);
  };

  const openPatientCopilotFromDirectory = () => {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
    setShowSelector(false);
    setExpanded(false);

    const params = new URLSearchParams(searchParams.toString());
    params.set("openCopilot", "true");
    params.set("copilotAgent", selectedAgent);
    if (!params.get("copilotPrompt")) {
      const promptSeed = prompt.trim() || (promptChips[0] ?? "Why was this patient auto-enrolled in the care management program?");
      params.set("copilotPrompt", promptSeed);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const openChatFromPrompt = (promptText: string) => {
    const ctx = toChatContext(contextKey);
    if (!ctx) return;
    setExpanded(false);
    if (ctx === "quality") {
      enqueueQualityPrompt(promptText);
      return;
    }
    populationWorkspace.appendTurn(promptText, buildPopulationAssistantReply(promptText));
    setIsPopulationChatOpen(true);
  };

  const handleCtaNavigate = (href: string) => {
    setIsQualityChatOpen(false);
    setIsPopulationChatOpen(false);
    router.push(href);
  };

  return (
    <div
      className={`relative rounded-2xl border bg-white shadow-sm space-y-3 ${
        variant === "header"
          ? "border-white/40 p-3 shadow-black/10"
          : "border-slate-200 p-4"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
            suite.accent.bg
          } ${suite.accent.text} border-transparent ${expanded ? "shadow-sm" : ""}`}
        >
          <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${suite.accent.soft} ${suite.accent.text} border-white/60 text-[10px] font-semibold`}>
            {suite.logoText}
          </span>
          <span className="flex items-center gap-1">
            <span>{suite.name}</span>
            <span className="text-[10px] opacity-80">·</span>
            <span className="text-[10px] font-semibold opacity-90">{agent.shortLabel}</span>
          </span>
          <span className="text-[11px]">{expanded ? "▲" : "▼"}</span>
        </button>
        {isRecommended && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
            Recommended
          </span>
        )}
        <div className="flex-1 min-w-[220px]">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder={`${placeholderText} (e.g., '${promptChips[0]}')`}
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>
        <button
          onClick={handleAsk}
          className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Ask
        </button>
        <button
          onClick={() => setShowSelector(true)}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
        >
          Agent Suite Directory
        </button>
      </div>

      {expanded && (
        <div
          className={`space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 ${
            variant === "header"
              ? "absolute left-0 right-0 top-[calc(100%+10px)] z-40 shadow-xl"
              : ""
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white/80 p-3">
            <div className="flex items-start gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${suite.accent.soft} ${suite.accent.text} border-white/60 text-xs font-semibold`}>
                {suite.logoText}
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">{suite.name} · {agent.displayName}</p>
                <p className="text-[11px] text-slate-600">{agent.shortDescription}</p>
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-[11px] text-slate-500 hover:text-slate-700"
            >
              Collapse
            </button>
          </div>

          <div className="space-y-4">
            {!supportsMultiTurn && (favoriteSuiteItems.length > 0 || favoriteAgentItems.length > 0) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">★</span>
                  <p className="text-[11px] font-semibold uppercase text-amber-700">Quick Access Favorites</p>
                </div>
                {favoriteSuiteItems.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {favoriteSuiteItems.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedSuite(item.id)}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                          selectedSuite === item.id
                            ? "border-amber-300 bg-amber-100 text-amber-800"
                            : "border-amber-200 text-amber-700 hover:bg-amber-100/60"
                        }`}
                      >
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${item.accent.soft} ${item.accent.text} border-white/70 text-[9px] font-semibold`}>
                          {item.logoText}
                        </span>
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
                {favoriteAgentItems.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {favoriteAgentItems.slice(0, 4).map((item) => {
                      const parentSuite = getSuiteById(item.suiteId);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleAgentSelect(item.id)}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                            selectedAgent === item.id
                              ? "border-amber-300 bg-amber-100 text-amber-800"
                              : "border-amber-200 text-amber-700 hover:bg-amber-100/60"
                          }`}
                        >
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full ${item.accent.soft} ${item.accent.text}`}>
                            {item.icon}
                          </span>
                          <span>{item.shortLabel}</span>
                          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            {parentSuite.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <p className="text-[11px] text-slate-600">
              {supportsMultiTurn
                ? "Tip: Ask a question to start chat. Use Agent Suite Directory only when you want to switch agents."
                : "Use Agent Suite Directory for full browsing and profile details."}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase text-slate-500">Suggested prompts</p>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                  {promptChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setPrompt("");
                    if (supportsMultiTurn) {
                      openChatFromPrompt(chip);
                      return;
                    }
                    const params = new URLSearchParams({
                      prompt: chip,
                      agent: selectedAgent,
                      suite: selectedSuite,
                      route: pathname,
                    });
                    navigateWithLoading(params);
                  }}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-600">{suite.disclaimer} · {agent.disclaimer}</p>
        </div>
      )}

      <QualityChatPanel
        isOpen={isQualityChatOpen}
        onClose={() => setIsQualityChatOpen(false)}
        queuedPromptRequest={qualityPromptRequest}
        onQueuedPromptConsumed={() => setQualityPromptRequest(null)}
        onCtaClick={handleCtaNavigate}
      />

      <AssistantSidePanel
        isOpen={isPopulationChatOpen}
        onClose={() => setIsPopulationChatOpen(false)}
        title="Population Chat Workspace"
        subtitle="Multi-turn assistant for Pre-visit Prep Agent"
        messages={populationWorkspace.activeMessages}
        emptyState="Start by asking for a specific patient list or pre-visit planning cohort."
        inputValue={prompt}
        onInputChange={setPrompt}
        onSubmit={handleAsk}
        placeholder="Ask a follow-up about attributed patients, visits, and closable care gaps..."
        onCtaClick={handleCtaNavigate}
        onNewChat={populationWorkspace.startNewChat}
        onClearChat={populationWorkspace.clearCurrentChat}
        threads={populationWorkspace.recentThreads}
        activeThreadId={populationWorkspace.activeThreadId}
        onSelectThread={populationWorkspace.setActiveThreadId}
        onDeleteThread={populationWorkspace.deleteThread}
      />

      {showSelector && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setShowSelector(false)}
          role="button"
          tabIndex={-1}
        >
          <div
            className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl max-h-[90vh]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Agent Suite Directory</p>
                <p className="text-xs text-slate-600">Search, filter, and select from a growing catalog of suites and agents.</p>
              </div>
              <button
                onClick={() => setShowSelector(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
              >
                Close
              </button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-[280px_minmax(340px,1fr)_minmax(360px,1.1fr)]">
              <div className="border-r border-slate-100 bg-slate-50 p-4 overflow-y-auto">
                <label className="text-[11px] font-semibold uppercase text-slate-500">Search Suites & Agents</label>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search suites, agents, or capabilities"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
                />
                <div className="mt-5">
                  <p className="text-[11px] font-semibold uppercase text-slate-500">Recommended</p>
                  <div className="mt-2 space-y-2">
                    {agentSuites
                      .filter((suiteItem) => suiteItem.routeRecommendations.includes(pathname))
                      .slice(0, 3)
                      .map((suiteItem) => (
                        <button
                          key={suiteItem.id}
                          onClick={() => setSelectedSuite(suiteItem.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-semibold ${
                            selectedSuite === suiteItem.id
                              ? `${suiteItem.accent.bg} ${suiteItem.accent.text} border-transparent`
                              : "border-slate-200 text-slate-600 hover:bg-white"
                          }`}
                        >
                          {suiteItem.name}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {Object.entries(suitesByCategory).map(([category, suites]) => {
                    const config = suiteCategoryConfig[category as keyof typeof suiteCategoryConfig];
                    return (
                      <div key={category} className="space-y-2">
                        <div className={`flex items-center gap-2 rounded-lg px-2 py-1 ${config.bg}`}>
                          <span className={config.text}>{config.icon}</span>
                          <span className={`text-[11px] font-semibold uppercase ${config.text}`}>{category}</span>
                          <span className="text-[10px] text-slate-500">{suites.length}</span>
                        </div>
                        <div className="space-y-2">
                          {suites.map((suiteItem) => (
                            <div
                              key={suiteItem.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                setSelectedSuite(suiteItem.id);
                                const suiteDefault = getAgentsForSuite(suiteItem.id)[0]?.id ?? defaultAgent;
                                setSelectedAgent(suiteDefault);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  setSelectedSuite(suiteItem.id);
                                  const suiteDefault = getAgentsForSuite(suiteItem.id)[0]?.id ?? defaultAgent;
                                  setSelectedAgent(suiteDefault);
                                }
                              }}
                              className={`w-full cursor-pointer rounded-lg border px-3 py-2 text-left text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                                selectedSuite === suiteItem.id
                                  ? `${suiteItem.accent.bg} ${suiteItem.accent.text} border-transparent`
                                  : "border-slate-200 text-slate-600 hover:bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${suiteItem.accent.soft} ${suiteItem.accent.text} border-white/70 text-[9px] font-semibold`}>
                                    {suiteItem.logoText}
                                  </span>
                                  <span>{suiteItem.name}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleFavoriteSuite(suiteItem.id);
                                  }}
                                  className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[13px] leading-none font-semibold ${
                                    favoriteSuites.includes(suiteItem.id)
                                      ? "border-amber-300 bg-amber-100 text-amber-800"
                                      : "border-slate-200 text-slate-500"
                                  }`}
                                  aria-label={favoriteSuites.includes(suiteItem.id) ? "Remove favorite" : "Add favorite"}
                                >
                                  {favoriteSuites.includes(suiteItem.id) ? "★" : "☆"}
                                </button>
                              </div>
                              <span className="block text-[11px] font-normal text-slate-500">{suiteItem.owner}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-r border-slate-100 p-5 overflow-y-auto">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{suite.name}</p>
                    <p className="text-xs text-slate-600">{suite.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${suite.accent.soft} ${suite.accent.text} border-white/70 text-xs font-semibold`}>
                      {suite.logoText}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${suite.accent.bg} ${suite.accent.text}`}>
                      {suite.owner}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-semibold uppercase text-slate-500">Available Agents</p>
                  <div className="mt-2 space-y-2">
                    {filteredAgents.map((item) => (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleAgentSelect(item.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleAgentSelect(item.id);
                          }
                        }}
                        className={`group w-full cursor-pointer rounded-lg border px-3 py-2 text-left text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          selectedAgent === item.id
                            ? `${item.accent.bg} ${item.accent.text} ring-1 ${item.accent.ring}`
                            : "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        <div className="relative flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${item.accent.soft} ${item.accent.text}`}>
                              {item.icon}
                            </span>
                            <div>
                              <p className="text-xs font-semibold">{item.displayName}</p>
                              <p className="text-[10px] text-slate-500">{item.shortLabel}</p>
                            </div>
                          </div>
                          <div className="pointer-events-none absolute left-2 top-full z-10 mt-1 hidden w-64 rounded-lg border border-slate-200 bg-white p-2 text-[11px] text-slate-700 shadow-lg group-hover:block group-focus-within:block">
                            <p className="font-semibold text-slate-900">{item.displayName}</p>
                            <p className="mt-1 leading-relaxed">{item.shortDescription}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedAgent === item.id && (
                              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                Selected
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleFavoriteAgent(item.id);
                              }}
                              className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[13px] leading-none font-semibold ${
                                favoriteAgents.includes(item.id)
                                  ? "border-amber-300 bg-amber-100 text-amber-800"
                                  : "border-slate-200 text-slate-500"
                              }`}
                              aria-label={favoriteAgents.includes(item.id) ? "Remove favorite" : "Add favorite"}
                            >
                              {favoriteAgents.includes(item.id) ? "★" : "☆"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[11px] text-slate-500">{suite.disclaimer} · {agent.disclaimer}</p>
                </div>
              </div>

              <div className="bg-slate-50/60 p-5 overflow-y-auto">
                <div className="space-y-4">
                  <div className={`rounded-2xl border p-5 shadow-sm ${agent.accent.bg} ${agent.accent.ring}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl border bg-white/80 text-base ${agent.accent.text}`}>
                          {agent.icon}
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold uppercase text-slate-500">Selected AI Agent</p>
                          <p className="text-base font-semibold text-slate-900">{agent.displayName}</p>
                          <p className="mt-1 text-xs text-slate-700">{agent.shortDescription}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {suite.name}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-slate-700">{agentProfile.detailedDescription}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {agentProfile.excelsAt.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
                        <span>🗂️</span>
                        <span>Data utilized</span>
                      </p>
                      <ul className="mt-2 space-y-1 text-[11px] text-slate-700">
                        {agentProfile.dataSources.map((source) => (
                          <li key={source}>• {source}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
                        <span>✨</span>
                        <span>Excels at</span>
                      </p>
                      <ul className="mt-2 space-y-1 text-[11px] text-slate-700">
                        {agentProfile.excelsAt.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-slate-500">
                        <span>⚡</span>
                        <span>Capabilities</span>
                      </p>
                      <ul className="mt-2 space-y-1 text-[11px] text-slate-700">
                        {agentProfile.capabilities.map((capability) => (
                          <li key={capability}>• {capability}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-500">Selected agent</p>
                  <p className="text-sm font-semibold text-slate-900">{agent.displayName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isPatientDetailRoute ? (
                    <button
                      onClick={openPatientCopilotFromDirectory}
                      className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Open Patient Copilot
                    </button>
                  ) : null}
                  <button
                    onClick={() => setShowSelector(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300"
                  >
                    Use selected agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}