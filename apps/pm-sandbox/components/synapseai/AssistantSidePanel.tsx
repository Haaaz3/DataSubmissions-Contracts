"use client";

type AssistantPanelMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string;
  cta?: { label: string; href: string };
};

type AssistantPanelThread = { id: string; title: string };

export default function AssistantSidePanel({
  isOpen,
  onClose,
  mode = "overlay",
  className,
  showCloseButton,
  title,
  subtitle,
  messages,
  emptyState,
  inputValue,
  onInputChange,
  onSubmit,
  placeholder,
  onCtaClick,
  onNewChat,
  onClearChat,
  threads,
  activeThreadId,
  onSelectThread,
  onDeleteThread,
  topContent,
  headerActions,
  renderMessageActions,
}: {
  isOpen: boolean;
  onClose: () => void;
  mode?: "overlay" | "docked";
  className?: string;
  showCloseButton?: boolean;
  title: string;
  subtitle: string;
  messages: AssistantPanelMessage[];
  emptyState: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  onCtaClick?: (href: string) => void;
  onNewChat?: () => void;
  onClearChat?: () => void;
  threads?: AssistantPanelThread[];
  activeThreadId?: string | null;
  onSelectThread?: (threadId: string) => void;
  onDeleteThread?: (threadId: string) => void;
  topContent?: React.ReactNode;
  headerActions?: React.ReactNode;
  renderMessageActions?: (message: AssistantPanelMessage) => React.ReactNode;
}) {
  const shouldShowCloseButton = showCloseButton ?? mode === "overlay";

  if (!isOpen) return null;

  const panelContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{title}</p>
          <p className="text-sm font-semibold text-slate-900">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          {shouldShowCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      {topContent ? <div className="border-b border-slate-100 p-3">{topContent}</div> : null}

      <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-500">{emptyState}</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-md px-2.5 py-2 text-xs ${
                msg.role === "user"
                  ? "ml-10 bg-indigo-100 text-indigo-900"
                  : "mr-10 bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {msg.title ? <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">{msg.title}</p> : null}
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                {msg.role === "user" ? "You" : "Agent"}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.role === "assistant" && msg.cta ? (
                <button
                  type="button"
                  onClick={() => onCtaClick?.(msg.cta!.href)}
                  className="mt-2 inline-flex rounded-full border border-indigo-300 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  {msg.cta.label}
                </button>
              ) : null}
              {renderMessageActions ? <div className="mt-2 flex flex-wrap gap-1.5">{renderMessageActions(msg)}</div> : null}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        {onNewChat || onClearChat ? (
          <div className="mb-2 flex items-center gap-2">
            {onNewChat ? <button type="button" onClick={onNewChat} className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600">New chat</button> : null}
            {onClearChat ? <button type="button" onClick={onClearChat} className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600">Clear chat</button> : null}
          </div>
        ) : null}
        {threads && onSelectThread ? (
          <div className="mb-2 max-h-24 space-y-1 overflow-y-auto rounded border border-slate-100 bg-slate-50 p-1.5">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`flex items-center gap-1 rounded ${
                  activeThreadId === thread.id ? "bg-indigo-100" : "hover:bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectThread(thread.id)}
                  className={`block min-w-0 flex-1 truncate rounded px-2 py-1 text-left text-[11px] ${
                    activeThreadId === thread.id ? "text-indigo-800" : "text-slate-600"
                  }`}
                >
                  {thread.title}
                </button>
                {onDeleteThread ? (
                  <button
                    type="button"
                    onClick={() => onDeleteThread(thread.id)}
                    className="mr-1 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-50"
                    aria-label={`Delete ${thread.title}`}
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === "docked") {
    return (
      <aside className={`h-full min-h-[60vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className ?? ""}`}>
        {panelContent}
      </aside>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/35" onClick={onClose}>
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-xl border-l border-slate-200 bg-white shadow-2xl ${className ?? ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        {panelContent}
      </aside>
    </div>
  );
}
