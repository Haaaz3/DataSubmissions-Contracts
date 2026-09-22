"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EmbeddedWorkspaceCard from "@/components/workspaces/EmbeddedWorkspaceCard";
import { SynapseWorkspace } from "@/lib/models/workspace";
import { loadWorkspaces } from "@/lib/storage/synapseStore";
import { demoWorkspaces } from "@/data/synthetic/workspaces";
import { getEmbeddedWorkspaceIds, setEmbeddedWorkspaceIds } from "@/lib/workspaces/service";

export default function EmbeddedWorkspaceSection({ pageKey = "dashboard" }: { pageKey?: string }) {
  const [allWorkspaces, setAllWorkspaces] = useState<SynapseWorkspace[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    loadWorkspaces().then((saved) => {
      const source = saved.length ? saved : demoWorkspaces;
      setAllWorkspaces(source);
      const embedded = getEmbeddedWorkspaceIds(pageKey);
      setSelectedIds(embedded.length ? embedded : source.slice(0, 2).map((workspace) => workspace.id));
    });
  }, [pageKey]);

  const selectedWorkspaces = useMemo(() => {
    const byId = new Map(allWorkspaces.map((workspace) => [workspace.id, workspace]));
    return selectedIds.map((id) => byId.get(id)).filter((item): item is SynapseWorkspace => Boolean(item));
  }, [allWorkspaces, selectedIds]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Embedded AI Workspaces</h2>
          <p className="text-xs text-slate-400">
            Select one or more workspaces to embed on this page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManage(true)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700"
          >
            Manage Embedded Workspaces
          </button>
          <Link href="/workspaces" className="text-xs font-semibold text-indigo-600 hover:underline">
            Explore all workspaces →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {selectedWorkspaces.map((workspace) => (
          <EmbeddedWorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>

      {showManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Select workspaces for this page</p>
              <button
                type="button"
                onClick={() => setShowManage(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-3 max-h-72 space-y-2 overflow-auto">
              {allWorkspaces.map((workspace) => {
                const checked = selectedIds.includes(workspace.id);
                return (
                  <label key={workspace.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          checked ? prev.filter((id) => id !== workspace.id) : [...prev, workspace.id]
                        )
                      }
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{workspace.title}</p>
                      <p className="text-xs text-slate-600">{workspace.summary}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowManage(false)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmbeddedWorkspaceIds(pageKey, selectedIds);
                  setShowManage(false);
                }}
                className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Save Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
