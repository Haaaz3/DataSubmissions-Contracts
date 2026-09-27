export type ObligationStatus = 'On Track' | 'At Risk' | 'Off Track' | 'Needs Review';
export type ForecastConfidence = 'High' | 'Medium' | 'Low';
export type WorkItemStatus = 'Ready' | 'Assigned' | 'In progress' | 'Blocked';
export type PrimaryPersona = 'Finance & contracting' | 'Quality & operations' | 'Care management';

export type ObligationProgram =
  | 'CMS TEAM'
  | 'MIPS / MVP'
  | 'MSSP ACO'
  | 'Commercial VBC'
  | 'Medicare Advantage'
  | 'Medicaid VBP'
  | 'Hospital quality'
  | 'QRDA reporting';

export interface ObligationDriver {
  id: string;
  label: string;
  detail: string;
  contribution: number;
  status: ObligationStatus;
  current: string;
  target: string;
  destination: string;
}

export interface ObligationWorkItem {
  id: string;
  obligationId: string;
  title: string;
  detail: string;
  facility: string;
  owner: string;
  persona: PrimaryPersona;
  dueLabel: string;
  priority: 'Critical' | 'High' | 'Medium';
  status: WorkItemStatus;
  impactedPopulation: number;
  modeledImpact: number;
  driver: string;
  destination: string;
}

export interface EnterpriseObligation {
  id: string;
  program: ObligationProgram;
  title: string;
  sponsor: string;
  scope: string;
  deadline: string;
  daysToDeadline: number;
  status: ObligationStatus;
  lives: number;
  providers: number;
  modeledValueAtRisk: number;
  modeledRecoverableValue: number;
  forecast: {
    metricLabel: string;
    current: number;
    target: number;
    projected: number;
    unit: string;
    confidence: ForecastConfidence;
    freshness: string;
  };
  drivers: ObligationDriver[];
  workItems: ObligationWorkItem[];
}

export const healthSystemSnapshot = {
  name: 'Northstar Health System',
  markets: 4,
  hospitals: 11,
  ambulatorySites: 97,
  employedClinicians: 2_480,
  attributedLives: 842_000,
  asOf: 'September 25, 2026',
  dataFreshness: 'Claims through Aug 31 · Clinical and ADT feeds through Sep 24',
  disclaimer: 'Synthetic demo data for design exploration. Forecasts are illustrative and are not payment, clinical, or operational recommendations.',
} as const;

const cmsTeamWorkItems: ObligationWorkItem[] = [
  {
    id: 'team-readmit-1', obligationId: 'cms-team', title: 'Assign transition-of-care bundle for high-risk discharges',
    detail: '126 discharges have a high readmission likelihood and no documented 48-hour outreach.', facility: 'Northstar Central Hospital',
    owner: 'Maya Patel, RN', persona: 'Care management', dueLabel: 'Due today', priority: 'Critical', status: 'Ready',
    impactedPopulation: 126, modeledImpact: 684_000, driver: '30-day readmissions', destination: '30-day readmissions worklist',
  },
  {
    id: 'team-readmit-2', obligationId: 'cms-team', title: 'Review post-acute network variance',
    detail: 'Three SNF partners are exceeding expected length-of-stay and readmission thresholds.', facility: 'Enterprise post-acute network',
    owner: 'Derek Huang', persona: 'Finance & contracting', dueLabel: 'Due in 3 days', priority: 'High', status: 'Ready',
    impactedPopulation: 384, modeledImpact: 511_000, driver: 'Post-acute spend', destination: 'Contract performance scenario',
  },
  {
    id: 'team-readmit-3', obligationId: 'cms-team', title: 'Close discharge medication reconciliation gaps',
    detail: '92 high-risk beneficiaries left with incomplete medication reconciliation evidence.', facility: 'Eastside Medical Center',
    owner: 'Clinical pharmacy queue', persona: 'Quality & operations', dueLabel: 'Due in 5 days', priority: 'High', status: 'Assigned',
    impactedPopulation: 92, modeledImpact: 289_000, driver: '30-day readmissions', destination: 'Care transitions workflow',
  },
];

export const enterpriseObligations: EnterpriseObligation[] = [
  {
    id: 'cms-team', program: 'CMS TEAM', title: 'CMS TEAM Episode Performance', sponsor: 'CMS', scope: '4 hospitals · lower-extremity joint replacement',
    deadline: 'PY 2026 reconciliation', daysToDeadline: 97, status: 'Off Track', lives: 18_460, providers: 286,
    modeledValueAtRisk: 5_800_000, modeledRecoverableValue: 2_100_000,
    forecast: { metricLabel: 'Episode cost variance', current: 8.6, target: 0, projected: 6.4, unit: '% above target', confidence: 'High', freshness: 'Daily clinical · monthly claims' },
    drivers: [
      { id: 'readmissions', label: '30-day readmissions', detail: 'Readmissions are above the target rate in two acute facilities.', contribution: 2_400_000, status: 'Off Track', current: '16.8%', target: '14.4%', destination: '30-day readmissions dashboard' },
      { id: 'post-acute', label: 'Post-acute spend', detail: 'SNF length-of-stay variance is concentrated in three partners.', contribution: 1_480_000, status: 'At Risk', current: '+$211 / episode', target: '+$0 / episode', destination: 'Post-acute network review' },
      { id: 'ed-revisits', label: 'ED revisits', detail: 'Seven-day revisits have improved but remain above the modeled threshold.', contribution: 760_000, status: 'At Risk', current: '11.1%', target: '9.5%', destination: 'ED revisit cohort' },
    ],
    workItems: cmsTeamWorkItems,
  },
  {
    id: 'mips-mvp', program: 'MIPS / MVP', title: 'MVP Quality Submission', sponsor: 'CMS QPP', scope: '143 clinicians · 3 MVP subgroups',
    deadline: 'Registration and submission readiness', daysToDeadline: 64, status: 'At Risk', lives: 118_000, providers: 143,
    modeledValueAtRisk: 1_760_000, modeledRecoverableValue: 1_080_000,
    forecast: { metricLabel: 'Projected performance', current: 84.9, target: 89, projected: 88.3, unit: 'points', confidence: 'Medium', freshness: 'Weekly measure refresh' },
    drivers: [
      { id: 'measure-evidence', label: 'Evidence completeness', detail: 'Validation work is concentrated in three clinical measures.', contribution: 690_000, status: 'At Risk', current: '87%', target: '95%', destination: 'Data Submissions quality workbench' },
      { id: 'registration', label: 'MVP registration', detail: 'Two specialty cohorts still require customer confirmation.', contribution: 420_000, status: 'Needs Review', current: '1 of 3 ready', target: '3 of 3 ready', destination: 'Data Submissions strategy' },
    ],
    workItems: [
      { id: 'mips-evidence-1', obligationId: 'mips-mvp', title: 'Review 37 high-impact validation records', detail: 'Evidence changes could recover performance for two enabled measures.', facility: 'Enterprise ambulatory quality', owner: 'Quality validation team', persona: 'Quality & operations', dueLabel: 'Due in 2 days', priority: 'High', status: 'Ready', impactedPopulation: 37, modeledImpact: 390_000, driver: 'Evidence completeness', destination: 'Data Submissions quality workbench' },
    ],
  },
  {
    id: 'mssp-aco', program: 'MSSP ACO', title: 'MSSP ACO Shared Savings', sponsor: 'CMS', scope: '226,000 attributed beneficiaries · 2 ACOs',
    deadline: '2026 performance close', daysToDeadline: 97, status: 'At Risk', lives: 226_000, providers: 1_140,
    modeledValueAtRisk: 4_200_000, modeledRecoverableValue: 1_670_000,
    forecast: { metricLabel: 'Shared savings trajectory', current: 2.1, target: 4.0, projected: 2.8, unit: '% savings', confidence: 'Medium', freshness: 'Monthly claims lag' },
    drivers: [
      { id: 'avoidable-utilization', label: 'Avoidable utilization', detail: 'High-cost utilization in two markets is offsetting primary-care gains.', contribution: 1_860_000, status: 'At Risk', current: '+4.2%', target: '≤ 0%', destination: 'ACO utilization cohorts' },
    ],
    workItems: [
      { id: 'aco-utilization-1', obligationId: 'mssp-aco', title: 'Prioritize complex-care cohort outreach', detail: '2,180 beneficiaries account for the largest avoidable utilization opportunity.', facility: 'North region', owner: 'ACO operations', persona: 'Care management', dueLabel: 'Due this week', priority: 'High', status: 'In progress', impactedPopulation: 2180, modeledImpact: 720_000, driver: 'Avoidable utilization', destination: 'Population cohort' },
    ],
  },
  {
    id: 'commercial-vbc', program: 'Commercial VBC', title: 'Commercial Value-Based Portfolio', sponsor: '3 commercial payers', scope: '14 contracts · 184,000 members',
    deadline: 'Q4 performance checkpoint', daysToDeadline: 36, status: 'At Risk', lives: 184_000, providers: 1_330,
    modeledValueAtRisk: 3_480_000, modeledRecoverableValue: 1_390_000,
    forecast: { metricLabel: 'Portfolio margin variance', current: 12.4, target: 5, projected: 8.1, unit: '% above target cost', confidence: 'Medium', freshness: 'Monthly claims lag' },
    drivers: [
      { id: 'network-leakage', label: 'Network leakage', detail: 'Specialty leakage is concentrated in cardiology and oncology.', contribution: 1_150_000, status: 'At Risk', current: '9.8%', target: '6.5%', destination: 'Contract network analysis' },
    ],
    workItems: [
      { id: 'vbc-network-1', obligationId: 'commercial-vbc', title: 'Review specialty leakage intervention', detail: 'Two markets are missing referral pathway adherence targets.', facility: 'South market', owner: 'Contracting strategy', persona: 'Finance & contracting', dueLabel: 'Due in 4 days', priority: 'High', status: 'Ready', impactedPopulation: 1430, modeledImpact: 410_000, driver: 'Network leakage', destination: 'Contract scenario studio' },
    ],
  },
  {
    id: 'ma-stars', program: 'Medicare Advantage', title: 'Medicare Advantage Stars', sponsor: 'Medicare Advantage plans', scope: '146,000 members · 8 measures',
    deadline: 'Stars measurement close', daysToDeadline: 74, status: 'On Track', lives: 146_000, providers: 980,
    modeledValueAtRisk: 1_120_000, modeledRecoverableValue: 680_000,
    forecast: { metricLabel: 'Stars measure attainment', current: 4.08, target: 4.1, projected: 4.13, unit: 'stars', confidence: 'High', freshness: 'Weekly quality refresh' },
    drivers: [
      { id: 'med-adherence', label: 'Medication adherence', detail: 'Adherence improvement is protecting the forecast across three plans.', contribution: 480_000, status: 'On Track', current: '88.2%', target: '87.5%', destination: 'Quality measure drivers' },
    ],
    workItems: [
      { id: 'ma-adherence-1', obligationId: 'ma-stars', title: 'Sustain adherence outreach in flagged ZIP codes', detail: 'Keep outreach coverage stable through measurement close.', facility: 'West market', owner: 'Pharmacy operations', persona: 'Quality & operations', dueLabel: 'Due in 8 days', priority: 'Medium', status: 'In progress', impactedPopulation: 660, modeledImpact: 185_000, driver: 'Medication adherence', destination: 'Quality driver dashboard' },
    ],
  },
  {
    id: 'medicaid-vbp', program: 'Medicaid VBP', title: 'Medicaid State Quality Pool', sponsor: 'State Medicaid agencies', scope: '2 state programs · 92,000 members',
    deadline: 'State quality attestation', daysToDeadline: 42, status: 'Needs Review', lives: 92_000, providers: 620,
    modeledValueAtRisk: 960_000, modeledRecoverableValue: 540_000,
    forecast: { metricLabel: 'Quality pool attainment', current: 76.2, target: 82, projected: 79.4, unit: '%', confidence: 'Low', freshness: 'Claims data lagged 45 days' },
    drivers: [
      { id: 'state-data', label: 'State data reconciliation', detail: 'The latest state file is incomplete for two measures.', contribution: 360_000, status: 'Needs Review', current: '81% matched', target: '98% matched', destination: 'State program reconciliation' },
    ],
    workItems: [
      { id: 'medicaid-reconcile-1', obligationId: 'medicaid-vbp', title: 'Reconcile state file measure exceptions', detail: 'Resolve 212 unmatched records before attestation.', facility: 'State program operations', owner: 'Medicaid reporting', persona: 'Finance & contracting', dueLabel: 'Due in 6 days', priority: 'High', status: 'Blocked', impactedPopulation: 212, modeledImpact: 260_000, driver: 'State data reconciliation', destination: 'State program reconciliation' },
    ],
  },
  {
    id: 'hospital-quality', program: 'Hospital quality', title: 'Hospital Quality Reporting', sponsor: 'CMS', scope: '11 hospitals · inpatient quality portfolio',
    deadline: 'Hospital submission package', daysToDeadline: 51, status: 'On Track', lives: 0, providers: 0,
    modeledValueAtRisk: 830_000, modeledRecoverableValue: 390_000,
    forecast: { metricLabel: 'Submission readiness', current: 88, target: 95, projected: 94, unit: '% complete', confidence: 'High', freshness: 'Daily readiness refresh' },
    drivers: [
      { id: 'hqr-validation', label: 'Package validation', detail: 'Two facilities have unresolved file-quality warnings.', contribution: 190_000, status: 'At Risk', current: '88%', target: '95%', destination: 'Hospital quality readiness' },
    ],
    workItems: [
      { id: 'hqr-package-1', obligationId: 'hospital-quality', title: 'Resolve two submission package warnings', detail: 'Correct measure mapping warnings before package freeze.', facility: 'Lakeside Hospital', owner: 'Hospital quality reporting', persona: 'Quality & operations', dueLabel: 'Due in 3 days', priority: 'High', status: 'Ready', impactedPopulation: 2, modeledImpact: 190_000, driver: 'Package validation', destination: 'Data Submissions hospital quality' },
    ],
  },
  {
    id: 'qrda-reporting', program: 'QRDA reporting', title: 'QRDA Export and Audit', sponsor: 'CMS and payer reporting', scope: '22 outbound packages · enterprise reporting',
    deadline: 'Quarter-end file delivery', daysToDeadline: 18, status: 'At Risk', lives: 0, providers: 0,
    modeledValueAtRisk: 410_000, modeledRecoverableValue: 210_000,
    forecast: { metricLabel: 'File package readiness', current: 79, target: 100, projected: 92, unit: '% complete', confidence: 'Medium', freshness: 'Daily package status' },
    drivers: [
      { id: 'file-validation', label: 'File validation', detail: 'Three packages need remediation before partner delivery.', contribution: 210_000, status: 'At Risk', current: '19 of 22 ready', target: '22 of 22 ready', destination: 'QRDA generated files' },
    ],
    workItems: [
      { id: 'qrda-package-1', obligationId: 'qrda-reporting', title: 'Remediate three QRDA package exceptions', detail: 'Correct validation issues and rerun file generation.', facility: 'Enterprise reporting', owner: 'Submission operations', persona: 'Quality & operations', dueLabel: 'Due in 2 days', priority: 'Critical', status: 'Ready', impactedPopulation: 3, modeledImpact: 210_000, driver: 'File validation', destination: 'Data Submissions QRDA export' },
    ],
  },
];

export const allObligationWorkItems = enterpriseObligations.flatMap((obligation) => obligation.workItems);

export const cmsTeamReadmissionTrend = [
  { month: 'Apr', rate: 17.4, target: 14.4, episodes: 624 },
  { month: 'May', rate: 17.2, target: 14.4, episodes: 651 },
  { month: 'Jun', rate: 17.1, target: 14.4, episodes: 688 },
  { month: 'Jul', rate: 16.9, target: 14.4, episodes: 702 },
  { month: 'Aug', rate: 16.8, target: 14.4, episodes: 731 },
  { month: 'Sep', rate: 16.1, target: 14.4, episodes: 748 },
];

export const cmsTeamReadmissionCohorts = [
  { id: 'readmit-patient-1', patient: 'Discharge cohort 23891', facility: 'Northstar Central Hospital', diagnosis: 'Hip replacement', risk: 'High', dischargeAge: '18h', owner: 'Unassigned', avoidableCost: 18400, status: 'Ready' as WorkItemStatus },
  { id: 'readmit-patient-2', patient: 'Discharge cohort 23874', facility: 'Eastside Medical Center', diagnosis: 'Knee replacement', risk: 'High', dischargeAge: '31h', owner: 'Maya Patel, RN', avoidableCost: 16200, status: 'Assigned' as WorkItemStatus },
  { id: 'readmit-patient-3', patient: 'Discharge cohort 23866', facility: 'Northstar Central Hospital', diagnosis: 'Hip replacement', risk: 'Medium', dischargeAge: '42h', owner: 'Unassigned', avoidableCost: 11800, status: 'Ready' as WorkItemStatus },
  { id: 'readmit-patient-4', patient: 'Discharge cohort 23852', facility: 'Lakeside Hospital', diagnosis: 'Knee replacement', risk: 'High', dischargeAge: '23h', owner: 'Care transitions team', avoidableCost: 14900, status: 'In progress' as WorkItemStatus },
  { id: 'readmit-patient-5', patient: 'Discharge cohort 23841', facility: 'Eastside Medical Center', diagnosis: 'Hip replacement', risk: 'Medium', dischargeAge: '47h', owner: 'Unassigned', avoidableCost: 9700, status: 'Ready' as WorkItemStatus },
];
