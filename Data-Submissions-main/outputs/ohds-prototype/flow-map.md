# Oracle Health Data Submissions Prototype Flow Map

## Inputs Reviewed

- Recording 1: home pathway selection, MIPS performance list, MIPS eCQM/CQM scorecard detail, MIPS group submissions list.
- Recording 2: MVP performance list, MVP empty/loading states, program selector options.
- Recording 3: MIPS score summary with real measure values, score filters, Summary/Details/Exports tabs, Export action, outcome processing date, MVP subgroup performance rows, and MVP individual-submission filters.
- Screenshot set 1: MVP subgroup score detail for ZzMVP2 and ZzMVP4, MVP ID/subgroup ID values, scorecard entity selector values, performance-period dropdown values, CQM empty state, and pathway/login landing layout.
- Recording 4: customer-scoped micro-app switching across MIPS, MVP, APPPLUS, and QRDA; APP Plus performance and score summary for CCPM Community Care Partnership of Maine; MIPS single-customer performance row for Hyperion Health System.
- Product text: MIPS, MVP Submission, Hospital Quality Reporting, APP, APP Plus, QRDA I/III support, scopes, generated file naming conventions, and submission capabilities.
- PDF: Support CQMs and eCQMs in submissions with CMS QPP OAuth, including separate-category and unified-Quality design approaches.

## Screen Inventory

1. HDIDS Design Lab controls
2. Production Today baseline
3. Variant A: Customer Command Center
4. Variant B: Submission Pathway Hub
5. Variant C: Smart Guided Submission
6. Side-by-side compare view
7. Pathway selector home screen
8. Program performance list
9. Performance score summary with measure collection, entity, period, export, and outcome processing date controls
10. Score Summary, Details, and Exports tabs
11. Submission overview
12. Group submissions list
13. Individual submissions list
14. MVP subgroup submissions list
15. Hospital quality reporting readiness path
16. Submission detail and review
17. New submission draft flow
18. Upload and validation
19. Provider profile
20. QRDA export
21. Generated QRDA files
22. Flow map
23. CMS QPP OAuth status and login entry point
24. Unified Quality screen supporting eCQM, CQM, and eCQM & CQM modes

## Core Flow

1. User enters the application at the pathway selector or lands in the selected program.
2. User selects a customer-scoped path: MVP Submission, Hospital Quality Reporting, APP Plus, QRDA, or legacy MIPS.
3. User reviews performance by reporting entity and performance period.
4. User opens a scorecard summary to inspect measure performance.
5. User changes collection filters, reviews Summary/Details/Exports tabs, or exports the score data.
6. User navigates to a submission scope: Group, Individual, Subgroup, APM Entity, or Hospital.
7. User filters, opens, or creates a submission.
8. User validates quality, PI, and IA data, freezes the submission, and submits to CMS or exports QRDA.
9. User tracks CMS receipt, validation status, corrections, and generated files.

## Design Lab Flow

1. User chooses a view: Production Today, Variant A, Variant B, Variant C, or Side-by-Side Compare.
2. User chooses a scenario such as MVP ZzMVP4 Score Details, APP Plus APM Entity Score, QRDA Export Package, Hospital Quality Reporting Review, or Create Submission Draft.
3. Production Today runs the scenario against the captured baseline navigation and screens.
4. Variant A presents the same scenario as a customer command center with pathway cards and ready actions.
5. Variant B presents the same scenario as a guided submission pathway hub.
6. Variant C presents the same scenario as a Smart Submission guided workflow with score optimization, recommendations, review, and submit/register steps.
7. Compare view places the control and Variant A side by side against the same scenario.

## Smart Submissions Demo Insights

1. The strongest pattern is not another left navigation branch; it is a guided workbench that starts with score strategy, then progressively narrows to TINs, recommendations, details, and submission.
2. The demo uses customer context as a persistent header: customer, year, organization count, provider count, and user context stay visible while the user changes level of detail.
3. The dashboard leads with outcome signals: baseline score, projected score, benchmark, estimated lift, provider lift, and TINs needing review.
4. Recommendations are framed as decision cards first, then as a denser table for operational review.
5. Risk/status language matters: Ready, Not Registered, review signal, projected score, and action state are visible before the user opens details.
6. Drill-in is lightweight: detail drawers and modal review preserve context instead of navigating users away from the recommendation list.
7. The final action asks for review/attestation before submit or registration, giving the guided flow a clear close.
8. The TurboTax-style pattern should emphasize percent complete, what is already handled, what remains, and the next best action.

## MVP Specialty Selection Model

1. CMS positions MVPs as a reporting option and publishes finalized MVPs by performance year with filters such as medical specialty.
2. Provider-to-specialty mapping is assumed to be an upstream/preloaded input. The app should not make mapping providers to specialties feel like the first customer task.
3. Specialty should act as the first decision support signal in the prototype: review pre-mapped TIN/NPI roster, specialty, and clinical focus before asking the customer to create an MVP submission.
4. Specialty does not remove customer choice. The customer still confirms the MVP, reporting level, selected clinicians/subgroup, measure set, collection type, and registration/submission package.
5. For 2026 MVP quality reporting, the prototype should guide users through choosing the MVP, choosing quality measures from that MVP, checking collection type, and validating outcome/high-priority measure coverage.
6. The experimental prototypes now include a visible customer action plan and MVP candidate workbench showing MVP ID, real MVP name, most applicable specialties, provider count, measure readiness, and the next action.
7. The specialty filter dynamically updates recommended MVPs. Example: Infectious Disease recommends `M1368 - Prevention and Treatment of Infectious Disorders Including Hepatitis C and HIV`; Cardiology recommends `G0055 - Advancing Care for Heart Disease`; Gynecology recommends `M1366 - Focusing on Women's Health`; Mental Health recommends `M1369 - Quality Care in Mental Health and Substance Use Disorders`.

## Provider Assignment Practice Model

1. Practices start from TIN/NPI combinations because MIPS eligibility and reporting are evaluated against the clinician's NPI association with a TIN.
2. Individual reporting means one clinician's NPI under one TIN. Group reporting means the whole TIN, generally all clinicians billing under that TIN.
3. Subgroup reporting is MVP-only. It is a subset of a single-TIN group, requires advance registration during the performance year, identifies included clinicians, and receives a subgroup identifier used for submission.
4. APM Entity reporting follows the clinicians identified as participating in the MIPS APM.
5. A clinician may have multiple possible participation paths; the prototype should show likely score/submission implications instead of assuming one fixed route.
6. The experimental prototypes now include a compact Provider Assignment Planner table that shows specialty cohort, TIN/NPI basis, recommended reporting level, real MVP name, and rationale without consuming a full dashboard row per cohort.

## Step Hierarchy Feedback

1. Avoid multiple competing step systems on the same screen. The Customer Action Plan is the only primary workflow sequence in the experimental variants.
2. Each workflow card uses explicit labels such as `Step 1: Input`, `Step 2: Choose`, `Step 3: Validate`, and `Step 4: Submit`.
3. Future workflow cards are visible but greyed/locked until the previous step is completed.
4. The first visible workflow action should be clear: review pre-mapped specialty cohorts and recommended MVPs.

## Dynamic Customer Pathway Strategy

1. Each customer has a configured submission mix instead of a fixed global set of micro-apps.
2. Active paths are selectable and shown first: MVP Submission, Hospital Quality Reporting, APP Plus, and QRDA in the current future-state examples.
3. Traditional MIPS is treated as a transition/legacy path in the Design Lab, not as the default future path.
4. Unused pathways can be handled two ways:
   - Greyed out when the customer benefits from seeing that a pathway exists but is not configured.
   - Removed when showing the pathway would create noise or imply unsupported work.
5. Variant A emphasizes customer strategy, next actions, and current readiness signals.
6. Variant B emphasizes guided workflow stages and pathway-specific scope rules.

## CQM/eCQM And CMS QPP OAuth Complexity

1. The PDF shows two design approaches:
   - Separate eCQM and CQM categories, where each category has its own tab state, action menu, edit flow, and approval/freeze behavior.
   - A unified Quality screen, where users manage eCQMs and CQMs together under one Quality workflow.
2. The prototype now favors the unified Quality approach because it aligns better with APP Plus and the guided submission model.
3. eCQM submit/approval actions introduce CMS QPP OAuth session complexity, so the UI must show whether the user is logged into CMS QPP and how much session time remains.
4. Quality workflows need a visible measure-type mode: eCQM, CQM, or eCQM & CQM.
5. Category-aware actions still matter even in a unified screen: Edit, Freeze, Approve, Submit, Export, and score snapshot review may vary based on selected measure mode.
6. Guided flows should treat CMS QPP OAuth as a prerequisite, not an error that appears only at the end.

## Redwood / OJET Reskin Direction

1. Production Today remains the screenshot-faithful control: blue production top bar, gray left rail, original table-first scorecards, original tabs, and no experimental signal cards.
2. Variant A, Variant B, Variant C, and Compare are skinned with a Redwood-inspired OJET shell: dark Oracle application surfaces, Redwood red accent, warm neutral canvas, restrained cards, compact form controls, and lower-radius enterprise components.
3. Experimental variants should carry modern readiness, risk, score movement, and next-best-action signals, while the Production Today control preserves the current app shape for A/B comparison.
4. Existing production tables remain in the control because they preserve the current app signal; variants can progressively replace table-first review with guided workbenches, score optimization, and pathway readiness views.
5. The scoped skin applies to Design Lab variants, Smart Guided Submission, compare mode, QRDA, and HQR so A/B testing focuses on workflow and information architecture without corrupting the baseline.
6. Browser validation confirmed Production Today reverted to the production palette and structure, while Variant A/B/C/Compare keep MVP Submission and Hospital Quality Reporting visible, retain Redwood accents, and avoid horizontal overflow.

## Click-Through Scenarios

1. MVP ZzMVP4 Score Details: submission strategy, subgroup selection, score detail, score export.
2. APP Plus APM Entity Score: active APP Plus customer mix, APM Entity score review, outlier signals, export.
3. MIPS Customer Performance: legacy MIPS reference, customer score review, future pathway routing.
4. MVP Individual Submission Search: MVP Submission, dependent subgroup/clinician filters, individual draft.
5. QRDA Export Package: export pathway, QRDA category/program, scope confirmation, ZIP generation.
6. Hospital Quality Reporting Review: submission strategy, hospital readiness, package validation, submit/export.
7. Create Submission Draft: active pathway selection, Quality/PI/IA readiness, draft save/review.

## Open Details To Flesh Out

- Exact create-submission wizard steps and required fields.
- CMS API status labels and retry/correction workflow.
- PI and IA import formats, manual entry rules, and validation messages.
- MVP-specific measure set selection, subgroup roster behavior, and eligible clinician population rules.
- Details and Exports tab contents behind the score summary page.
- Login/auth handoff behavior before the pathway selector appears.
- Whether APP Plus should remain exposed only as `APPPLUS` or split into separate APP and APP Plus micro-apps in future workflow designs.
- APP Plus 2026 preview rules and how those should coexist with 2025 production workflows.
