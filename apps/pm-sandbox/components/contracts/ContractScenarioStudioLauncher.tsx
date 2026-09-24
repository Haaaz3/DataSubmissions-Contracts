"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Contract } from "@/types/contract";
import ContractScenarioSimulator from "./ContractScenarioSimulator";

export default function ContractScenarioStudioLauncher({ contract }: { contract: Contract }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const triggerElement = trigger.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = dialog.current!;
    const focusable = () => Array.from(root.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, summary, [tabindex="0"]')).filter(el => !el.hasAttribute("disabled") && el.getClientRects().length > 0);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key === "Tab") {
        const elements = focusable(); const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); triggerElement?.focus(); };
  }, [open]);
  return <>
    <button ref={trigger} type="button" onClick={() => setOpen(true)} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">Open Scenario Studio</button>
    {open && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/65 p-2 backdrop-blur-sm sm:p-4" onClick={() => setOpen(false)}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-label="Contract Scenario Studio" onClick={e => e.stopPropagation()} className="flex max-h-[96dvh] w-full max-w-[1440px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">Contract Scenario Studio</p><h1 className="mt-1 text-base font-semibold text-slate-900">{contract.name}</h1></div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Close</button>
        </header>
        <div className="overflow-y-auto overscroll-contain bg-slate-50/50 p-3 sm:p-5"><ContractScenarioSimulator key={contract.id} contract={contract} /></div>
      </div>
    </div>, document.body)}
  </>;
}
