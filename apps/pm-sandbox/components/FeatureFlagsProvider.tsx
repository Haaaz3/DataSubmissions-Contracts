"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultFeatureFlags, FEATURE_FLAGS_STORAGE_KEY, FeatureFlags, PageFeatureKey } from "@/lib/featureFlags";

interface FeatureFlagsContextValue {
  flags: FeatureFlags;
  setFlag: (path: string, value: boolean) => void;
  toggleFlag: (path: string) => void;
  resetFlags: () => void;
  isPageEnabled: (page: PageFeatureKey) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(undefined);

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const normalizeStoredFlags = (stored: unknown): FeatureFlags => {
  if (!isObjectRecord(stored)) return defaultFeatureFlags;

  // Backward compatibility: some older local demo payloads used `features` instead of `pages`.
  const legacyFeatures = isObjectRecord(stored.features) ? (stored.features as Record<string, unknown>) : undefined;
  const pagesSource = isObjectRecord(stored.pages)
    ? (stored.pages as Record<string, unknown>)
    : legacyFeatures;
  const sectionsSource = isObjectRecord(stored.sections) ? (stored.sections as Record<string, unknown>) : undefined;

  const mergedPages = { ...defaultFeatureFlags.pages };
  if (pagesSource) {
    (Object.keys(defaultFeatureFlags.pages) as PageFeatureKey[]).forEach((key) => {
      const candidate = pagesSource[key];
      if (typeof candidate === "boolean") {
        mergedPages[key] = candidate;
      }
    });
  }

  return {
    ...defaultFeatureFlags,
    synapseSearch:
      typeof stored.synapseSearch === "boolean" ? stored.synapseSearch : defaultFeatureFlags.synapseSearch,
    topNavSearch:
      typeof stored.topNavSearch === "boolean" ? stored.topNavSearch : defaultFeatureFlags.topNavSearch,
    showFinancialData:
      typeof stored.showFinancialData === "boolean"
        ? stored.showFinancialData
        : defaultFeatureFlags.showFinancialData,
    pages: mergedPages,
    sections: {
      ...defaultFeatureFlags.sections,
      topValueLevers:
        typeof sectionsSource?.topValueLevers === "boolean"
          ? sectionsSource.topValueLevers
          : defaultFeatureFlags.sections.topValueLevers,
      qualityBlockedSavings:
        typeof sectionsSource?.qualityBlockedSavings === "boolean"
          ? sectionsSource.qualityBlockedSavings
          : defaultFeatureFlags.sections.qualityBlockedSavings,
      scorecardPortfolioLensMap:
        typeof sectionsSource?.scorecardPortfolioLensMap === "boolean"
          ? sectionsSource.scorecardPortfolioLensMap
          : defaultFeatureFlags.sections.scorecardPortfolioLensMap,
      contractScorecardFinancialLevers:
        typeof sectionsSource?.contractScorecardFinancialLevers === "boolean"
          ? sectionsSource.contractScorecardFinancialLevers
          : defaultFeatureFlags.sections.contractScorecardFinancialLevers,
      contractPortfolioEarningsGateToWatch:
        typeof sectionsSource?.contractPortfolioEarningsGateToWatch === "boolean"
          ? sectionsSource.contractPortfolioEarningsGateToWatch
          : defaultFeatureFlags.sections.contractPortfolioEarningsGateToWatch,
      contractPopulationSecondaryPatientList:
        typeof sectionsSource?.contractPopulationSecondaryPatientList === "boolean"
          ? sectionsSource.contractPopulationSecondaryPatientList
          : defaultFeatureFlags.sections.contractPopulationSecondaryPatientList,
    },
  };
};

const readStoredFlags = (): FeatureFlags | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizeStoredFlags(JSON.parse(raw));
  } catch {
    return null;
  }
};

const writeStoredFlags = (flags: FeatureFlags) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(flags));
};

const updateFlagAtPath = (flags: FeatureFlags, path: string, value: boolean): FeatureFlags => {
  if (path === "synapseSearch") {
    return { ...flags, synapseSearch: value };
  }
  if (path === "topNavSearch") {
    return { ...flags, topNavSearch: value };
  }
  if (path.startsWith("pages.")) {
    const key = path.replace("pages.", "") as PageFeatureKey;
    return {
      ...flags,
      pages: {
        ...flags.pages,
        [key]: value,
      },
    };
  }
  if (path.startsWith("sections.")) {
    const key = path.replace("sections.", "") as keyof FeatureFlags["sections"];
    return {
      ...flags,
      sections: {
        ...flags.sections,
        [key]: value,
      },
    };
  }
  return flags;
};

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFeatureFlags);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredFlags();
    if (stored) {
      setFlags(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredFlags(flags);
  }, [flags, hydrated]);

  const setFlag = useCallback((path: string, value: boolean) => {
    setFlags((current) => updateFlagAtPath(current, path, value));
  }, []);

  const toggleFlag = useCallback((path: string) => {
    setFlags((current) => {
      if (path === "synapseSearch") {
        return { ...current, synapseSearch: !current.synapseSearch };
      }
      if (path === "topNavSearch") {
        return { ...current, topNavSearch: !current.topNavSearch };
      }
      if (path.startsWith("pages.")) {
        const key = path.replace("pages.", "") as PageFeatureKey;
        return {
          ...current,
          pages: {
            ...current.pages,
            [key]: !current.pages[key],
          },
        };
      }
      if (path.startsWith("sections.")) {
        const key = path.replace("sections.", "") as keyof FeatureFlags["sections"];
        return {
          ...current,
          sections: {
            ...current.sections,
            [key]: !current.sections[key],
          },
        };
      }
      return current;
    });
  }, []);

  const resetFlags = useCallback(() => {
    setFlags(defaultFeatureFlags);
  }, []);

  const isPageEnabled = useCallback((page: PageFeatureKey) => {
    return flags?.pages?.[page] ?? defaultFeatureFlags.pages[page] ?? true;
  }, [flags.pages]);

  const value = useMemo<FeatureFlagsContextValue>(
    () => ({
      flags,
      setFlag,
      toggleFlag,
      resetFlags,
      isPageEnabled,
    }),
    [flags, isPageEnabled, resetFlags, setFlag, toggleFlag]
  );

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within FeatureFlagsProvider");
  }
  return context;
}
