/* Optional adapter only. The original prototype continues to run on its own. */
(() => {
  if (window.parent === window) return;
  const send = (payload) => window.parent.postMessage({ channel: 'austin-ci-v1', ...payload }, window.location.origin);
  const scenarios = Object.entries(scenarioDefinitions).map(([key, s]) => ({ key, label: s.label, goal: s.goal, signal: s.signal }));
  const publish = () => send({ type: 'submissions-context', scenarios, scenario: state.scenario });
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.channel !== 'austin-ci-v1') return;
    if (event.data.type === 'request-context') publish();
  });
  // Extend the existing select without changing any program's original behavior.
  for (const [id, stateKey] of [['programSelect', 'program'], ['labModeSelect', 'labMode']]) {
    const select = document.getElementById(id);
    if (!select) continue;
    const group = document.createElement('optgroup');
    group.label = 'Products';
    group.append(new Option('PM Sandbox', 'pm-sandbox'));
    select.append(group);
    // Capture before the prototype's handler so a product is never treated as a program/view.
    select.addEventListener('change', (event) => {
      if (select.value !== 'pm-sandbox') return;
      event.stopImmediatePropagation();
      select.value = state[stateKey];
      publish();
      send({ type: 'switch-product', product: 'pm-sandbox' });
    }, true);
  }
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'lab-btn'; button.textContent = 'Shared design criteria';
  button.addEventListener('click', () => { publish(); send({ type: 'open-criteria' }); });
  document.querySelector('.lab-bar')?.append(button);
  document.querySelector('#scenarioSelect')?.addEventListener('change', publish);
  publish();
})();
