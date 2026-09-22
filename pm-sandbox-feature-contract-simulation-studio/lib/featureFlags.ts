export type PageFeatureKey =
  | "dashboard"
  | "actions"
  | "cohorts"
  | "projects"
  | "scorecards"
  | "workspaces"
  | "careManagement"
  | "lifeSciences"
  | "population"
  | "quality"
  | "statewideOutcomesAccess"
  | "contracts";

export interface FeatureFlags {
  synapseSearch: boolean;
  topNavSearch: boolean;
  showFinancialData: boolean;
  pages: Record<PageFeatureKey, boolean>;
  sections: {
    topValueLevers: boolean;
    qualityBlockedSavings: boolean;
    scorecardPortfolioLensMap: boolean;
    contractScorecardFinancialLevers: boolean;
    contractPortfolioEarningsGateToWatch: boolean;
    contractPopulationSecondaryPatientList: boolean;
  };
}

export const FEATURE_FLAGS_STORAGE_KEY = "featureFlags.v1";

export const defaultFeatureFlags: FeatureFlags = {
  synapseSearch: true,
  topNavSearch: false,
  showFinancialData: true,
  pages: {
    dashboard: true,
    actions: true,
    cohorts: true,
    projects: true,
    scorecards: true,
    workspaces: true,
    careManagement: true,
    lifeSciences: true,
    population: true,
    quality: true,
    statewideOutcomesAccess: true,
    contracts: true,
  },
  sections: {
    topValueLevers: false,
    qualityBlockedSavings: true,
    scorecardPortfolioLensMap: false,
    contractScorecardFinancialLevers: false,
    contractPortfolioEarningsGateToWatch: false,
    contractPopulationSecondaryPatientList: false,
  },
};
