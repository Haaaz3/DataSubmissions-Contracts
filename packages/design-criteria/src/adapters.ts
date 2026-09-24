import { z } from 'zod';
import type { SourceCriterion } from './index';

export const scenarioSchema = z.object({ key: z.string().min(1).max(120), label: z.string().min(1).max(160), goal: z.string().min(1).max(4000), signal: z.string().min(1).max(4000) });
export function submissionsAdapter(input: unknown): SourceCriterion[] {
  return z.array(scenarioSchema).max(100).parse(input).map(s => ({
    source: { product: 'data-submissions', key: `scenario:${s.key}`, document: 'apps/data-submissions/outputs/ohds-prototype/app.js#scenarioDefinitions', original: `${s.goal}\n${s.signal}` },
    draft: { title: s.label, description: s.goal, acceptance: s.signal, category: 'workflow', status: 'proposed' },
  }));
}
// Explicit source mappings: these are product design requirements, not executable medical or financial rules.
const pmRequirements = [
  ['kpi-selection', 'Configure contract-specific measures', 'Select KPIs from the seeded catalog and assign scored, monitored, or gated roles.', 'Reviewers can select KPIs, assign roles, and configure targets and weights without editing code.', 'workflow', 'contract-configuration-studio-mvp.md'],
  ['validation', 'Explain incomplete contract configuration', 'Surface missing required fields, incompatible target ordering, and invalid KPI references.', 'Required basics and at least one KPI are checked; missing targets and scored weights that do not total 100 are visible.', 'validation', 'contract-configuration-studio-mvp.md'],
  ['drafts', 'Preserve configuration drafts', 'Save and reload contract configuration in this browser.', 'A saved draft can be reopened with KPI targets, incentive rules, and financial terms intact.', 'interaction', 'contract-configuration-studio-mvp.md'],
  ['separate-financials', 'Keep settlement and incentives distinct', 'Present settlement separately from configured KPI earnings because the financial pools can overlap.', 'The two financial columns are not added together or described as total revenue or ROI.', 'explainability', 'contract-scenario-studio-presenter-walkthrough.md'],
  ['explicit-assumptions', 'Make modeled assumptions visible', 'Identify modeled defaults and incomplete payout assumptions in scenario previews.', 'Incomplete rules show Needs configuration; totals are marked partial; patient counts are not inferred from percentage measures.', 'explainability', 'contract-scenario-studio-presenter-walkthrough.md'],
  ['scenario-isolation', 'Explore scenarios without changing source contracts', 'Scenario edits operate on a snapshot; reset restores the current contract snapshot.', 'Saving, resetting, and loading a named scenario leaves the source contract and configuration unchanged.', 'interaction', 'contract-scenario-studio-presenter-walkthrough.md'],
  ['studio-accessibility', 'Keep scenario navigation keyboard accessible', 'Contain keyboard focus within the open studio and return focus to its launcher on close.', 'Escape closes the studio and restores focus to the launcher.', 'interaction', 'contract-scenario-studio-presenter-walkthrough.md'],
] as const;
export function pmAdapter(): SourceCriterion[] {
  return pmRequirements.map(([key, title, description, acceptance, category, document]) => ({
    source: { product: 'pm-sandbox', key, document: `apps/pm-sandbox/docs/${document}`, original: `${description}\n${acceptance}` },
    draft: { title, description, acceptance, category, status: 'proposed' },
  }));
}
