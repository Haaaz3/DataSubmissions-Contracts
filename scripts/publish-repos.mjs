import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const destinations = [
  { name: 'GitHub.com', url: 'https://github.com/Haaaz3/DataSubmissions-Contracts.git' },
  { name: 'Cerner Git', url: 'https://github.cerner.com/AD2005431/Austin-CI-Proto.git' },
];

// Preflight both repositories before publishing. Never force-push or delete refs.
export function publish({ cwd = process.cwd(), targets = destinations, check = false, log = console.log } = {}) {
  const git = (...args) => execFileSync('git', args, {
    cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  }).trim();
  if (git('branch', '--show-current') !== 'main') throw new Error('Publish from main only.');
  if (git('status', '--porcelain')) throw new Error('Commit or resolve local changes before publishing.');
  const commit = git('rev-parse', 'HEAD');
  const remoteHead = url => git('ls-remote', url, 'refs/heads/main').split(/\s/)[0];
  for (const target of targets) {
    if (remoteHead(target.url)) {
      git('fetch', '--no-tags', target.url, 'refs/heads/main');
      try { git('merge-base', '--is-ancestor', 'FETCH_HEAD', commit); }
      catch { throw new Error(`${target.name} has changes missing locally. Fetch and reconcile them before publishing either repository.`); }
    }
    git('push', '--dry-run', target.url, `${commit}:refs/heads/main`);
    log(`Ready: ${target.name}`);
  }
  if (check) { log('Both destinations passed preflight; no changes published.'); return commit; }
  const completed = [];
  try {
    for (const target of targets) {
      git('push', target.url, `${commit}:refs/heads/main`);
      completed.push(target.name);
    }
    for (const target of targets) {
      if (remoteHead(target.url) !== commit) throw new Error(`${target.name} changed during verification.`);
    }
  } catch (error) {
    throw new Error(`Publishing did not finish. Pushes completed: ${completed.join(', ') || 'none'}. Recheck both destinations before retrying. ${error.message}`);
  }
  log(`Verified both repositories at ${commit}`);
  return commit;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { publish({ cwd: fileURLToPath(new URL('..', import.meta.url)), check: process.argv.includes('--check') }); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
