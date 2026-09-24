// ---------------------------------------------------------------------------
// Population Membership Insights — data model
// ---------------------------------------------------------------------------

export interface AgeDistribution {
  under18: number;    // percent
  age18to44: number;
  age45to64: number;
  age65plus: number;
}

export interface GenderDistribution {
  male: number;   // percent
  female: number;
  other: number;
}

export interface RiskDistribution {
  lowRisk: number;     // member count
  risingRisk: number;
  highRisk: number;
}

export interface ChronicCondition {
  condition: string;
  prevalencePercent: number;
}

export interface UtilizationMetrics {
  edVisitsPer1000: number;
  admissionsPer1000: number;
  readmissionsRate: number;   // percent
  avgLengthOfStay: number;    // days
}

export interface QualityMetrics {
  diabetesA1cControl: number;          // percent in control
  colorectalScreeningRate: number;
  breastCancerScreeningRate: number;
  medicationAdherence: number;
}

export interface SocialRiskIndicators {
  foodInsecurityPercent: number;
  transportationBarrierPercent: number;
  housingInstabilityPercent: number;
}

export interface MemberPopulationProfile {
  contractId: string;
  totalMembers: number;
  ageDistribution: AgeDistribution;
  genderDistribution: GenderDistribution;
  riskDistribution: RiskDistribution;
  topChronicConditions: ChronicCondition[];
  utilizationMetrics: UtilizationMetrics;
  qualityMetrics: QualityMetrics;
  socialRiskIndicators: SocialRiskIndicators;
  highCostMembers: number;  // members in top 5% cost tier
}

// ---------------------------------------------------------------------------
// Population Insights
// ---------------------------------------------------------------------------

export type ImpactType = "Cost" | "Quality" | "Utilization" | "Patient Outcomes";
export type InsightPriority = "High" | "Medium" | "Low";

export interface PopulationInsight {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  recommendedAction: string;
  impactTypes: ImpactType[];
  priority: InsightPriority;
  contractId?: string;  // undefined = applies across all contracts
}

// ---------------------------------------------------------------------------
// Population Patient List (table on overview page)
// ---------------------------------------------------------------------------

export type PatientOpportunityLevel = "High" | "Medium" | "Low";

export interface PopulationPatientRow {
  id: string;
  opportunity: PatientOpportunityLevel;
  name: string;
  mrn: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  birthSex: string;
  primaryContact: string;
  contactType: string;
  totalUnmetMeasures: number;
  providerName: string;
  recentVisitDate: string;
  nextAttributedProviderVisitDate: string;

  // Filter metadata
  organizationClass: string;
  organization: string;
  provider: string;
  payer: string;
  plan: string;
  registry: string;
  measure: string;
  measureStatus: string;
  scorability: string;
  attributionStatus: string;
}

export interface PreVisitCareGap {
  id: string;
  measureName: string;
  priority: "High" | "Medium" | "Low";
  rationale: string;
  recommendedAction: string;
}

export interface PreVisitPlanningRow {
  patientId: string;
  patientName: string;
  mrn: string;
  providerName: string;
  organization: string;
  payer: string;
  opportunity: PatientOpportunityLevel;
  appointmentDate: string;
  appointmentInDays: number;
  totalOpenGaps: number;
  totalClosableGaps: number;
  topCareGaps: PreVisitCareGap[];
  preVisitPrepSummary: string;
  prepScore: number;
}

export interface PreVisitPlanningSummary {
  totalAttributedWithUpcomingVisits: number;
  totalPrepCandidates: number;
  highPriorityPrepCount: number;
  avgClosableGapsPerVisit: number;
  next7DayVisits: number;
}

// ---------------------------------------------------------------------------
// Member Level View (agentic patient workspace)
// ---------------------------------------------------------------------------

export interface MemberCommunicationMethod {
  id: string;
  type: "portal" | "sms" | "phone" | "email";
  label: string;
  destination: string;
  available: boolean;
}

export interface MemberEvidenceFact {
  id: string;
  date: string;
  sourceType:
    | "clinical-note"
    | "document"
    | "claim"
    | "lab"
    | "order"
    | "appointment"
    | "agent-inference";
  agent: string;
  title: string;
  detail: string;
  impact?: string;
  confidence?: number;
}

export interface MemberMeasureGap {
  id: string;
  measureName: string;
  status: "Open" | "In Progress" | "Closed" | "Inferred Closed";
  scorability: string;
  priority: "High" | "Medium" | "Low";
  supportingFactIds: string[];
  recommendedAction: string;
}

export interface MemberAgentSuggestion {
  id: string;
  agentId: string;
  agentLabel: string;
  category: "Evidence" | "Referral" | "Trial" | "Care Gap" | "Access" | "Outreach";
  title: string;
  summary: string;
  whyItMatters: string;
  evidenceFactIds: string[];
  confidence: number;
  nextAction: string;
}

export interface MemberMedication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  lastFillDate: string;
  adherenceStatus: string;
}

export interface MemberCondition {
  id: string;
  name: string;
  onsetDate: string;
  status: string;
}

export interface MemberOrder {
  id: string;
  orderType: string;
  description: string;
  status: string;
  placedDate: string;
}

export interface MemberLabResult {
  id: string;
  name: string;
  value: string;
  referenceRange: string;
  collectedDate: string;
}

export interface MemberAppointment {
  id: string;
  date: string;
  visitType: string;
  provider: string;
  status: string;
}

export interface MemberVital {
  id: string;
  date: string;
  label: string;
  value: string;
}

export interface MemberDocument {
  id: string;
  date: string;
  type: string;
  title: string;
  source: string;
}

export interface MemberClinicalNote {
  id: string;
  date: string;
  author: string;
  noteType: string;
  excerpt: string;
}

export interface PopulationMemberDetail {
  id: string;
  name: string;
  mrn: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  birthSex: string;
  payer: string;
  plan: string;
  organization: string;
  providerName: string;
  attributionStatus: string;
  registry: string;
  opportunity: PatientOpportunityLevel;
  preferredLanguage: string;
  portalEnrolled: boolean;
  communicationMethods: MemberCommunicationMethod[];
  measureGaps: MemberMeasureGap[];
  evidenceFacts: MemberEvidenceFact[];
  agentSuggestions: MemberAgentSuggestion[];
  documents: MemberDocument[];
  clinicalNotes: MemberClinicalNote[];
  medications: MemberMedication[];
  conditions: MemberCondition[];
  orders: MemberOrder[];
  labs: MemberLabResult[];
  appointments: MemberAppointment[];
  vitals: MemberVital[];
  suggestedPrompts: string[];
}
