# Changelog

## v53

- Corrected HIV Screening normal scorecard data so it no longer shows a zero numerator.
- Aligned the HIV scorecard with the Quality Workbench story: realistic performance with remaining lab-source mapping opportunity.

## v52

- Rewired Quality Workbench around a shared focused measure across trends, opportunities, patient validation, and outcome explainability.
- Simplified Trending Quality Over Time into the primary control-table view with direct patient, changed-outcome, and opportunity drill-ins.
- Expanded Patient Opportunities to all submitted measures with measure-specific forecast lift, near-miss signal, selected-patient access, and example explainability.
- Added compact Workbench action groups so Trend, Opportunities, and Patient Level Validation behave as one workflow instead of separate destinations.
- Kept Patient Level Validation centered on selected patients, outcome population filters, state-change filtering, and patient outcome explainability.

## v51

- Added a Status changed filter to Patient Level Validation.
- Added a compact patient-table sort control with Status changed first, Outcome population, and Patient ID options.
- Kept the default view on all selected patients while surfacing changed patients first.
- Added a subtle scan cue for rows where prior state differs from current state.

## v50

- Removed remaining sampled-minimum language from Patient Level Validation and Validation Plan.
- Removed numerator/denominator/exclusion counts from the measure selector so the app does not imply fixed component population sizes.
- Defaulted the patient population table to the full selected population for the chosen measure.
- Tightened Patient Level Validation table density and reduced row height.
- Kept numerator, denominator, and exclusion as outcome filters on the selected patient table.

## v49

- Rebuilt Patient Level Validation around outcome populations instead of task tracking.
- Made the measure selector a compact table with selected count, satisfaction rate, WoW change, and numerator/denominator/exclusion counts.
- Defaulted the lower table to all selected validation patients for the chosen measure.
- Replaced review queue/workstream fields with patient, provider, specialty, current state, prior state, state change, evidence summary, and source columns.
- Removed the sampled-minimum strip, review remaining column, and task-management footer actions.

## v48

- Rebuilt Patient Level Validation as a full-width validation work queue instead of a split table/detail layout.
- Added measure-level worklist selection with sample coverage, selected population, changed outcomes, and remaining review counts.
- Added validation round selection for Round 1, November pass, and final reconciliation.
- Added patient filters for review queue, changed outcomes, fall-outs, controls, and all selected patients.
- Removed satisfaction/closeness language from the patient validation table and moved outcome detail into a full-page drill-in.

## v47

- Made Trending Quality Over Time the first/default Quality Workbench view.
- Removed average quality scoring from the trend page so measures are evaluated independently.
- Simplified the trend table measure column to show measure and program only.
- Updated trend charts with narrower measure-specific percent scales and visible Y-axis percentage labels.
- Rebalanced trend data to look like realistic quality movement rather than smooth demo curves.

## v46

- Removed Patient Evidence as a primary Quality Workbench tab.
- Converted patient evidence into an Outcome Explainability pane opened from patient search or patient rows.
- Removed the CQL Logic Map label and replaced the detail with measure outcome validation questions.
- Simplified Patient Level Validation so selected patients and their outcome explanation are the central task.

## v45

- Renamed the combined operational area to Quality Workbench.
- Reduced the workbench to patient opportunities, trending quality over time, patient-level validation, and patient evidence.
- Moved Validation Plan into the Submissions workflow.
- Rebuilt the quality trend view as a table with dated trend charts, WoW percent change, editable customer targets, target gap, and patient drill-in.
- Removed the separate Deploy Baseline and AI Review workflow surfaces.

## v42

- Merged Performance Workbench and Measure Validation into one top-level Performance & Validation workspace.
- Added per-measure attestation-rate trends that update with the selected validation measure.
- Added an Attestation Trends sub-tab for comparing validation confidence across all submitted measures.
- Rewired validation, patient opportunity, readiness, and evidence links into the combined operational workspace.
- Added a standalone editable HTML export containing the full clickable prototype in one file.
- Added a downloadable offline zip package so reviewers can unzip and run the UI locally.

## v41

- Added a Selected Patients tab to the Measure Validation Workbench as the first validation view.
- Built a measure-by-measure validation population UI showing selected patients, measure satisfaction, prior outcome state, outcome change, selection rationale, evidence/action, and review status.
- Added an interactive measure selector for HIV Screening, Depression Screening, and Chlamydia Screening validation packets.
- Rewired general validation entry points so sample validation opens the selected-patient population before patient-level evidence drill-in.

## v40

- Consolidated Performance, Measure Detail, Patient Evidence, and Readiness into two operational panes: Performance Workbench and Measure Validation.
- Added a validation sampling plan with 5 numerator / 5 denominator / 5 exclusion guardrails, fall-out focus, frozen populations, and reconciliation passes.
- Added near-miss scoring, population closeness, outcome shift tracking, deploy baseline summaries, and an AI validation review concept.
- Rewired click-through paths so measure opportunities, patient evidence, readiness review, and submission preparation stay inside the streamlined workflow.

## v39

- Reworked the Vision Platform into a cleaner desktop-app shell inspired by the attached redesign reference.
- Added focused Home, Strategy, Performance, Measure Detail, Patient Evidence, Readiness, Submissions, QRDA Export, and Audit screens.
- Moved recommendation inputs and rules out of the central workflow and into Strategy assumptions plus FAQ/reference.
- Simplified Strategy to one primary decision action while preserving prior-year baseline, candidate strategies, forecasting, and interactive MVP/provider mix detail.

## v38

- Renamed the prototype customer to Hyperion Health System across the app and public review copy.

## v37

- Removed the central recommendation-input and phase-checklist panels from the visible A/B prototype routes.
- Added a compact FAQ menu in the persistent Design Lab controls for inputs, rules, rationale, and submission context.
- Replaced the Vision Platform reference button with a normal FAQ/reference dropdown in the app navigation pane.
- Reworded first-step labels so the customer starts by comparing/selecting strategy, not reviewing inferred inputs.

## v36

- Added the prior-year submission as a persistent baseline inside the Choose Strategy rail.
- Reframed forecasted strategies as editable starting points instead of fixed pre-built choices.
- Removed the redundant header-level Approve Strategy action.
- Added a single Lock Strategy action in the selected strategy workspace.
- Made the MVP strategy mix manually adjustable with include/exclude controls for subgroup cohorts.

## v35

- Moved recommendation inputs, customer confirmations, and CMS/rules context into a dedicated Phase FAQ screen in the Vision Platform navigation.
- Removed non-actionable confirmation/rules cards from the central Strategy workflow.
- Restored the Strategy screen to a compact selector plus selected-strategy workspace so the MVP/provider mix is the primary interaction.
- Compressed the MVP subgroup table so forecast, current performance, measure fit, and provider mix stay visible without crowding the page.

## v34

- Removed the non-actionable customer-question/system-role/output row from the Vision Platform workspace.
- Moved recommendation inputs and supporting context into a collapsed FAQ/reference section.
- Made candidate submission strategies the first interactive content on the Strategy screen.
- Kept strategy-specific rules, customer decisions, subgroup mix, and provider detail in the active decision workspace.

## v33

- Reworked the Vision Platform into a standard desktop app layout with a persistent left navigation pane.
- Removed the large horizontal step strip and the context popover from the vision workflow.
- Expanded candidate submission strategies with scope, forecast, input evidence, customer decisions, and rules/constraints.
- Converted the MVP specialty subgroup mix into an interactive operational table with provider roster detail.

## v32

- Removed month/timebox labels from the Vision Platform stages.
- Converted the vision flow into a full-width desktop workspace with ancillary context hidden behind a compact menu.
- Removed the persistent Next Action rail.
- Added an interactive MVP specialty subgroup mixer with provider, specialty, NPI, score, forecast, and inclusion detail.
- Clarified the input signals used to generate strategy recommendations.

## v31

- Reworked the Vision Platform into a production-like desktop workbench with actionable phase steps.
- Simplified the right rail from Customer Lens to a compact Next Action panel.
- Expanded Strategy into a compare-and-select workflow driven by enabled measures, specialty mix, APM context, and forecast performance.
- Added row-level actions for improvement work queues, monitoring exceptions, validation checks, and submission status.

## v30

- Added a default Vision Platform mode organized around Strategy, Improve, Monitor, Validate, and Submit.
- Reduced each future-state screen to one customer task, one decision, and one next action.
- Reframed the demo around inferred strategy, agentic work queues, abnormality monitoring, representative validation, and secure OAuth submission.
- Kept Production Today available as the control while making the visionary flow the presentation default.

## v29

- Simplified path finding so customer setup is loaded first and the first visible customer action is choosing a supported submission path.
- Removed the customer inventory selector and raw enabled-measure table from the primary flow.
- Updated MVP recommendations to disable unavailable MVPs when the customer’s enabled measures do not support them.
- Reworked guided step language around Start, Path, Configure, and Submit.

## v28

- Fixed MVP Individual Submissions so subgroup selection enables eligible clinicians.
- Added clinician-driven forecast rows and a Create Individual Draft progression.
- Made + New from Individual scope open a pre-scoped individual MVP draft.
- Carried subgroup, MVP, NPI, clinician, and forecast context into the draft detail screen.

## v27

- Made MVP practice composition the first selection: single-specialty vs multi-specialty.
- Added multi-specialty specialty selection before MVP catalog narrowing.
- Updated MVP recommendations, provider assignment, and forecasting to use the selected specialty mix.
- Reworded the guided MVP flow so composition and specialties precede MVP/reporting-level selection.

## v26

- Changed measure routing to use one customer-level enabled measure inventory.
- Removed EH/hospital measures and handoff UI from app-facing prototype paths.
- Distinguished enabled-only measures from submission-selected measures.
- Updated routing cards to derive MVP, APP Plus, MIPS transition, and QRDA from submission-selected measures.

## v25

- Added CMS-style subgroup composition inputs to MVP setup.
- Captures single-specialty vs multispecialty subgroup composition.
- Adds subgroup composition narrative and rationale before registration/assignment.
- Threads subgroup narrative requirements into MVP reporting-level decision copy.

## v24

- Removed Hospital Quality Reporting as a top-line in-app submission path.
- Kept EH/hospital measures visible as a separate out-of-app handoff signal.
- Added MVP reporting-level rules for group, subgroup, individual, and APM Entity selection.
- Changed MVP setup so specialty is facility-selected, not inferred from TIN/NPI.
- Added provider-level MVP performance forecasting before assignment.

## v23

- Restored Production Today so the measure inventory is not the first production screen.
- Restored the production pathway selector to the original broad card behavior.
- Kept measure-driven routing inside the design lab variants with distinct command-center, pathway-hub, and smart-scan treatments.

## v22

- Added a first-screen Enabled Measure Inventory intake flow.
- Classifies EC, EH, APM, eCQM, and CQM measure coverage before showing submission paths.
- Narrows the pathway selector by applicable programs for each customer/site measure profile.
- Added the same measure-driven routing signal to Redwood/OJET lab variants.

## v21

- Converted Provider Assignment Planner from large cards into a compact table.
- Kept Production Today as the screenshot-faithful control.
- Preserved Redwood/OJET styling for experimental variants only.
- Dynamic MVP specialty filter updates recommended MVPs using real MVP names.

## v20

- Made Customer Action Plan the single primary workflow sequencer.
- Added locked future steps and clearer step labels.
- Treated provider-specialty mapping as a preloaded input.

## v19

- Removed competing numeric step badges from experimental variants.
- Clarified first action as reviewing pre-mapped specialty cohorts.
