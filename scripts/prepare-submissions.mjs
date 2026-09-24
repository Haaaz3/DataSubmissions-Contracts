import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
const from = new URL('../apps/data-submissions/outputs/ohds-prototype/', import.meta.url);
const to = new URL('../apps/pm-sandbox/public/data-submissions/', import.meta.url);
await mkdir(to, { recursive: true });
for (const name of ['index.html', 'app.js', 'styles.css', 'union-bridge.js']) {
  await cp(new URL(name, from), new URL(name, to));
}
console.log('Prepared original Data Submissions assets for the unified server.');

// Keep the build-time adapter synchronized with the actual prototype's scenario catalog.
const app = await readFile(new URL('app.js', from), 'utf8');
const definition = app.split('const scenarioDefinitions =')[1]?.split('\nconst ')[0];
if (!definition) throw new Error('Data Submissions scenario catalog was not found.');
const scenarios = [...definition.matchAll(/"([^"\n]+)": \{\s*label: "([^"\n]+)".*?goal: "([^"\n]+)",\s*signal: "([^"\n]+)"/gs)]
  .map(([, key, label, goal, signal]) => ({ key, label, goal, signal }));
if (!scenarios.length) throw new Error('No source criteria could be extracted.');
await writeFile(new URL('../packages/design-criteria/src/submission-scenarios.json', import.meta.url), JSON.stringify(scenarios, null, 2) + '\n');
