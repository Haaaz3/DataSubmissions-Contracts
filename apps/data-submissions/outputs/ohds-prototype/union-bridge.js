/* Optional adapter only. The original prototype continues to run on its own. */
(() => {
  if (window.parent === window) return;
  const send = (payload) => window.parent.postMessage({ channel: 'austin-ci-v1', ...payload }, window.location.origin);
  const scenarios = Object.entries(scenarioDefinitions).map(([key, s]) => ({ key, label: s.label, goal: s.goal, signal: s.signal }));
  const publish = () => send({ type: 'submissions-context', scenarios, scenario: state.scenario });
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.channel !== 'austin-ci-v1') return;
    if (event.data.type === 'request-context') publish();
    if (event.data.type === 'open-submissions-route') {
      state.labMode = 'production';
      if (typeof labModeSelect !== 'undefined' && labModeSelect) labModeSelect.value = 'production';
      const scenario = event.data.scenario;
      if (scenario && scenarioDefinitions[scenario]) applyScenario(scenario, true);
      else setProgram(event.data.program || 'MIPS', event.data.route || 'performance');
      publish();
    }
  });
  // Extend the existing select without changing any program's original behavior.
  for (const [id, stateKey] of [['programSelect', 'program'], ['labModeSelect', 'labMode']]) {
    const select = document.getElementById(id);
    if (!select) continue;
    const group = document.createElement('optgroup');
    group.label = 'Products';
    const products = [
      ['PM Sandbox', 'pm-sandbox'],
      ['HDI Command Center', 'hdi-command-center'],
    ];
    products.forEach(([label, value]) => group.append(new Option(label, value)));
    select.append(group);
    // Capture before the prototype's handler so a product is never treated as a program/view.
    select.addEventListener('change', (event) => {
      if (!products.some(([, value]) => select.value === value)) return;
      const product = select.value;
      event.stopImmediatePropagation();
      select.value = state[stateKey];
      publish();
      send({ type: 'switch-product', product });
    }, true);
  }
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'lab-btn'; button.textContent = 'Shared design criteria';
  button.addEventListener('click', () => { publish(); send({ type: 'open-criteria' }); });
  document.querySelector('.lab-bar')?.append(button);
  document.querySelector('#scenarioSelect')?.addEventListener('change', publish);
  publish();
})();
