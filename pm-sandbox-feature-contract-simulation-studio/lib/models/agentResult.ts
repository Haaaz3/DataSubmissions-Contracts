import { SynapseAgentId } from "@/lib/synapseai/agentRegistry";

export interface AgentResultKpi {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  subtext?: string;
}

export interface AgentResultVisual {
  id: string;
  title: string;
  description?: string;
  type: "bar" | "stackedBar" | "donut" | "line" | "radar" | "polarArea" | "wordCloud" | "geo" | "usMap";
  seriesLabels?: string[];
  data: Array<{
    label: string;
    code?: string;
    value: number;
    valueSecondary?: number;
    valueTertiary?: number;
  }>;
}

export interface AgentResultPayload {
  id: string;
  agentId: SynapseAgentId;
  prompt: string;
  routeContext: string;
  title: string;
  summary: string;
  kpis: AgentResultKpi[];
  chartSeries: { value: number }[];
  visuals: AgentResultVisual[];
  insights: string[];
  actions: string[];
  nextQuestions: string[];
}
