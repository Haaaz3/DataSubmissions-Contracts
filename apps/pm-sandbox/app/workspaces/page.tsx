"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FeatureGuard from "@/components/FeatureGuard";
import SummaryCard from "@/components/SummaryCard";
import TrackPageView from "@/components/telemetry/TrackPageView";
import { loadDemoProjects } from "@/lib/storage/demoLoader";
import { loadWorkspaces } from "@/lib/storage/synapseStore";
import { SynapseWorkspace } from "@/lib/models/workspace";
import { SynapseAgentId, getAgentById } from "@/lib/synapseai/agentRegistry";
import { getActiveWorkspaceId, setActiveWorkspaceId, upsertWorkspaceFromAgentPrompt } from "@/lib/workspaces/service";

export default function WorkspacesPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading workspaces...</div>}>
      <WorkspacesPageContent />
    </Suspense>
  );
}

function WorkspacesPageContent() {
  const [workspaces, setWorkspaces] = useState<SynapseWorkspace[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setActiveWorkspaceIdState(getActiveWorkspaceId());

    loadWorkspaces().then((items) => {
      if (items.length) {
        setWorkspaces(items);
        setLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    const handleWorkspaceReset = () => {
      setWorkspaces([]);
      setLoaded(false);
    };
    window.addEventListener("synapse:workspaces-reset", handleWorkspaceReset);
    return () => window.removeEventListener("synapse:workspaces-reset", handleWorkspaceReset);
  }, []);

  useEffect(() => {
    const mode = searchParams.get("intent");
    const agentId = searchParams.get("agent") as SynapseAgentId | null;
    const prompt = searchParams.get("prompt");
    const routeContext = searchParams.get("route") ?? "/";
    const workspaceId = searchParams.get("workspaceId") ?? undefined;
    const workspaceName = searchParams.get("name") ?? undefined;
    if (!mode || !agentId || !prompt) return;

    upsertWorkspaceFromAgentPrompt({
      mode: mode === "add" ? "add" : "create",
      agentId,
      prompt,
      routeContext,
      workspaceId,
      workspaceName,
    }).then(async (savedWorkspace) => {
      const items = await loadWorkspaces();
      setWorkspaces(items);
      setLoaded(true);
      setActiveWorkspaceIdState(savedWorkspace.id);
      router.replace(`/workspaces/${savedWorkspace.id}`);
    });
  }, [searchParams, router]);

  const handleLoadDemo = async () => {
    await loadDemoProjects();
    const items = await loadWorkspaces();
    setWorkspaces(items);
    setLoaded(true);
    setActiveWorkspaceIdState(getActiveWorkspaceId());
  };

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null;

  return (
    <FeatureGuard page="workspaces">
      <TrackPageView page="/workspaces" module="workspaces" />
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Synapse Workspaces</h1>
            <p className="mt-2 text-sm text-slate-500">
              Persistent AI canvases with multi-agent lineage, visuals, actions, and shared operating context.
            </p>
          </div>
          <button
            onClick={handleLoadDemo}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
          >
            {loaded ? "Reload demo workspaces" : "Load demo workspaces"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard label="Workspaces" value={workspaces.length} description="Persistent AI canvases" />
          <SummaryCard
            label="Multi-Agent"
            value={workspaces.filter((workspace) => workspace.contributingAgentIds.length > 1).length}
            description="With contributing agents"
          />
          <SummaryCard
            label="Shared"
            value={workspaces.filter((workspace) => workspace.share.visibility === "shared").length}
            description="Shared operating views"
          />
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
          <p className="text-[11px] font-semibold uppercase text-indigo-700">Current Active Workspace</p>
          {activeWorkspace ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{activeWorkspace.title}</p>
                <p className="text-xs text-slate-600">{activeWorkspace.summary}</p>
              </div>
              <Link
                href={`/workspaces/${activeWorkspace.id}`}
                className="rounded-full border border-indigo-300 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700"
              >
                Open Active Workspace
              </Link>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-600">No active workspace selected yet.</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                workspace.id === activeWorkspaceId
                  ? "border-indigo-300 ring-1 ring-indigo-200"
                  : "border-slate-200"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                {workspace.id === activeWorkspaceId ? (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                    Active Workspace
                  </span>
                ) : <span />}
                {workspace.id !== activeWorkspaceId && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWorkspaceId(workspace.id);
                      setActiveWorkspaceIdState(workspace.id);
                    }}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-slate-300"
                  >
                    Set Active
                  </button>
                )}
              </div>

              <Link
                href={`/workspaces/${workspace.id}`}
                className="block rounded-xl hover:bg-slate-50/50"
              >
              <p className="text-sm font-semibold text-slate-900">{workspace.title}</p>
              <p className="mt-1 text-xs text-slate-600">{workspace.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {workspace.contributingAgentIds.map((agentId) => {
                  const agent = getAgentById(agentId);
                  return (
                    <span key={agentId} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700">
                      {agent.shortLabel}
                    </span>
                  );
                })}
              </div>

              <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-2 text-xs text-indigo-700">
                <span className="font-semibold">Workspace Goals:</span>{" "}
                {(workspace.goals?.length ?? 0) > 0
                  ? `${workspace.goals?.length} defined`
                  : "Not set"}
              </div>
              </Link>

              <div className="mt-3 flex justify-end">
                <Link
                  href={`/workspaces/${workspace.id}#goals`}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  {(workspace.goals?.length ?? 0) > 0 ? "Manage goals →" : "Set goals →"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FeatureGuard>
  );
}
