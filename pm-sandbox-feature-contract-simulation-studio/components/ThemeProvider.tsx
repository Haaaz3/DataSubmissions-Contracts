"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AppTheme = "default" | "sketch";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "app.theme.v1";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "sketch" ? "sketch" : "default";
}

function applyThemeAttribute(theme: AppTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.appTheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("default");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyThemeAttribute(stored);
    setHydrated(true);
  }, []);

  const setTheme = useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    applyThemeAttribute(nextTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const nextTheme: AppTheme = current === "sketch" ? "default" : "sketch";
      applyThemeAttribute(nextTheme);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      }
      return nextTheme;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {hydrated && theme === "sketch" ? (
        <div className="theme-review-banner border-b border-slate-300 bg-white px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
          Sketch theme active — conceptual UX for internal review, not approved final design
        </div>
      ) : null}
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
