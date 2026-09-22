# Share Package Guide (VS Code + CLINE)

This file explains exactly how peers should run and review this app after you share the zip.

## 1) Extract and open in VS Code

1. Unzip the shared archive.
2. Open the extracted folder in VS Code.

## 2) Recommended local environment

- Node.js 20+
- npm 10+
- VS Code
- CLINE extension (if they are collaborating through CLINE prompts/workflows)

## 3) Install dependencies

```bash
npm install
```

## 4) Run the app

Use stable dev mode (recommended):

```bash
npm run dev:stable
```

Then open:

- http://localhost:3000

## 5) Validate locally (optional but recommended)

```bash
npm run lint
npm run build
npx vitest run
```

## 6) Suggested multi-agent demo flow

1. Go to `/synapse/results`.
2. Run one agent prompt (e.g., Contract Performance).
3. Save to a workspace.
4. Run a second agent with a different lens (e.g., Claims Friction).
5. Add to active workspace.
6. Open `/workspaces` and inspect how insights/visuals accumulate.

## 7) What to review / give feedback on

- Do agents feel differentiated in tone, visuals, and recommendations?
- Does context from active workspace visibly influence new agent outputs?
- Are workspace cards and visualizations easy to understand?
- What would improve multi-agent collaboration UX?

## 8) Notes for CLINE collaborators

If peers are using CLINE inside VS Code:

- Keep prompts scoped (UI/UX, data realism, workflow logic, or architecture).
- Ask CLINE to run lint/build/tests after changes.
- Keep commits focused by feature area.
