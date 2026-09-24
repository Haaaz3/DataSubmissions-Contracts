export type ScorecardIconName =
  | "layers"
  | "file"
  | "gauge"
  | "shieldCheck"
  | "users"
  | "checkCircle"
  | "alertTriangle"
  | "clock"
  | "dashboard"
  | "sparkles"
  | "flag"
  | "activity"
  | "banknote"
  | "calculator"
  | "trendingUp"
  | "trendingDown"
  | "heartPulse"
  | "smile"
  | "shield"
  | "document"
  | "chevronDown";

function iconPath(name: ScorecardIconName) {
  switch (name) {
    case "layers":
      return <path d="M12 3 3 7.5 12 12l9-4.5L12 3Zm-9 9 9 4.5 9-4.5M3 16.5 12 21l9-4.5" />;
    case "file":
      return <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M9 13h6M9 17h6" />;
    case "gauge":
      return <path d="M4.9 19a9 9 0 1 1 14.2 0M12 13l4-4M12 19h.01" />;
    case "shieldCheck":
      return <path d="M12 3 5 6v6c0 4.4 2.8 7.8 7 9 4.2-1.2 7-4.6 7-9V6l-7-3Zm-3 9 2 2 4-4" />;
    case "users":
      return <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />;
    case "checkCircle":
      return <path d="M22 11.1V12A10 10 0 1 1 16.2 3.1M22 4 12 14.01l-3-3" />;
    case "alertTriangle":
      return <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01" />;
    case "clock":
      return <path d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />;
    case "dashboard":
      return <path d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h5v8H3v-8Zm7 4h11v4H10v-4Z" />;
    case "sparkles":
      return <path d="m12 3 1.7 3.8L18 8.5l-4.3 1.7L12 14l-1.7-3.8L6 8.5l4.3-1.7L12 3Zm7 8 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2ZM5 14l.8 1.8L7.6 17l-1.8.8L5 19.6l-.8-1.8L2.4 17l1.8-.8L5 14Z" />;
    case "flag":
      return <path d="M4 21V5m0 0h10l-1.5 3L14 11H4Z" />;
    case "activity":
      return <path d="M22 12h-4l-3 7-6-14-3 7H2" />;
    case "banknote":
      return <path d="M3 7h18v10H3V7Zm3 0a3 3 0 0 1-3 3m18-3a3 3 0 0 0 3 3m-18 4a3 3 0 0 0-3 3m18-3a3 3 0 0 1 3 3M12 10h.01M12 14h.01" />;
    case "calculator":
      return <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4h8M8 11h2m4 0h2M8 15h2m4 0h2" />;
    case "trendingUp":
      return <path d="m3 17 6-6 4 4 8-8M14 7h7v7" />;
    case "trendingDown":
      return <path d="m3 7 6 6 4-4 8 8M14 17h7v-7" />;
    case "heartPulse":
      return <path d="M20.8 8.6c0 5.6-8.8 11.4-8.8 11.4S3.2 14.2 3.2 8.6A5.4 5.4 0 0 1 12 5a5.4 5.4 0 0 1 8.8 3.6ZM7 11h3l1-2 2 4 1-2h3" />;
    case "smile":
      return <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />;
    case "shield":
      return <path d="M12 3 5 6v6c0 4.4 2.8 7.8 7 9 4.2-1.2 7-4.6 7-9V6l-7-3Z" />;
    case "document":
      return <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5M8 13h8M8 17h5" />;
    case "chevronDown":
      return <path d="m6 9 6 6 6-6" />;
    default:
      return <circle cx="12" cy="12" r="8" />;
  }
}

export default function ScorecardIcon({
  name,
  className = "h-4 w-4",
}: {
  name: ScorecardIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {iconPath(name)}
    </svg>
  );
}
