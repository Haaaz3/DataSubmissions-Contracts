# Oracle Health Data Submissions Prototype Flow Map

## Inputs Reviewed

- Recordings and screenshots covering MIPS, MVP, APP Plus, QRDA, hospital quality reporting, scorecards, and submission workflows.
- Product documentation covering MIPS, MVP Submission, Hospital Quality Reporting, APP, APP Plus, QRDA I/III support, scopes, file naming, and submission capabilities.
- CMS QPP OAuth guidance for CQM and eCQM submissions.

## Available Product Experiences

1. **Vision Platform: Quality Operating System** is the primary Data Submissions experience. It provides customer-scoped strategy, quality workbench, submission, QRDA export, and audit workflows.
2. **Production Today** preserves the screenshot-faithful baseline navigation, tables, scorecards, validation, submission, and QRDA screens.
3. **PM Sandbox** remains available through the shared product switcher and retains its independent routes and workflows.

## Screen Inventory

1. HDIDS Design Lab controls
2. Vision Platform: Home and Strategy
3. Vision Platform: Quality Workbench and validation
4. Vision Platform: Submissions
5. Vision Platform: QRDA Export
6. Vision Platform: Audit
7. Production Today pathway selector
8. Production performance list and score summary
9. Production submission overview, detail, draft, upload, and validation flows
10. Production QRDA export and generated files
11. CMS QPP OAuth status and sign-in entry point
12. Shared design criteria

## Core Flow

1. The user opens Data Submissions in Vision Platform or Production Today.
2. The user selects a customer-scoped program and reporting period.
3. The user reviews score and measure performance.
4. The user investigates opportunities, evidence, and validation results.
5. The user prepares the relevant submission scope and completes review steps.
6. The user submits to CMS or generates a QRDA package.
7. The user tracks confirmations, corrections, approvals, and audit history.

## Vision Platform Flow

1. **Home** summarizes score, strategy, blockers, and the next action for the selected customer.
2. **Strategy** evaluates enabled measures, specialty cohorts, performance forecasts, and program rules.
3. **Quality Workbench** surfaces opportunities and validation evidence for targeted measure work.
4. **Submissions** supports approval and submission readiness.
5. **QRDA Export** creates the required file package after review.
6. **Audit** preserves approvals, traceability, and operational history.

## Production Today Flow

1. The baseline opens at the captured pathway selector or selected program.
2. Users review performance by reporting entity and performance period.
3. Scorecard controls support collection filtering, Summary, Details, and Exports tabs.
4. Users choose a Group, Individual, Subgroup, APM Entity, or Hospital submission scope.
5. Users validate Quality, PI, and IA data, then freeze, submit, or export the package.
6. Users track CMS receipt, validation status, corrections, and generated files.

## CQM/eCQM and CMS QPP OAuth

1. The unified Quality workflow supports eCQM, CQM, and combined eCQM and CQM review.
2. The product makes CMS QPP OAuth status and remaining session time visible before eCQM submission actions.
3. Actions such as Edit, Freeze, Approve, Submit, Export, and score snapshot review remain aware of the selected measure type.

## Click-Through Scenarios

1. MVP ZzMVP4 Score Details
2. APP Plus APM Entity Score
3. MIPS Customer Performance
4. MVP Individual Submission Search
5. QRDA Export Package
6. Hospital Quality Reporting Review
7. Create Submission Draft

## Open Details To Flesh Out

- Exact create-submission wizard steps and required fields.
- CMS API status labels and retry or correction workflow.
- PI and IA import formats, manual entry rules, and validation messages.
- MVP-specific measure selection, subgroup roster behavior, and eligible clinician population rules.
- Details and Exports tab contents behind the score summary page.
- Login and authorization handoff behavior before the pathway selector appears.
- APP Plus 2026 preview rules alongside 2025 production workflows.
