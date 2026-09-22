"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 p-1 text-[11px] font-semibold">
      <button
        type="button"
        onClick={() => setTheme("default")}
        aria-pressed={theme === "default"}
        className={`rounded-full px-2.5 py-1 transition ${
          theme === "default" ? "bg-white text-[#005A74]" : "text-white/80 hover:bg-white/15 hover:text-white"
        }`}
      >
        Default
      </button>
      <button
        type="button"
        onClick={() => setTheme("sketch")}
        aria-pressed={theme === "sketch"}
        className={`rounded-full px-2.5 py-1 transition ${
          theme === "sketch" ? "bg-white text-slate-950" : "text-white/80 hover:bg-white/15 hover:text-white"
        }`}
      >
        Sketch
      </button>
    </div>
  );
}
