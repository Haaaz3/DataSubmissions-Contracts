import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { publish } from './publish-repos.mjs';

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
function setup(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'prototype-publish-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const cwd = path.join(root, 'development');
  const targets = ['github', 'cerner'].map(name => ({ name, url: path.join(root, `${name}.git`) }));
  git(root, 'init', '-b', 'main', cwd);
  git(cwd, 'config', 'user.name', 'Publisher test');
  git(cwd, 'config', 'user.email', 'test@example.invalid');
  for (const target of targets) git(root, 'init', '--bare', '-b', 'main', target.url);
  const commit = value => {
    writeFileSync(path.join(cwd, 'prototype.txt'), value);
    git(cwd, 'add', '.'); git(cwd, 'commit', '-m', value);
    return git(cwd, 'rev-parse', 'HEAD');
  };
  commit('initial');
  const run = extra => publish({ cwd, targets, log: () => {}, ...extra });
  const head = target => git(root, 'ls-remote', target.url, 'refs/heads/main').split(/\s/)[0];
  return { cwd, root, targets, commit, run, head };
}

test('preflight is read-only and publishing gives both repositories the same revision', t => {
  const s = setup(t);
  s.run({ check: true });
  assert.ok(s.targets.every(target => s.head(target) === ''));
  const revision = s.run();
  assert.ok(s.targets.every(target => s.head(target) === revision));
  const next = s.commit('updated');
  s.run();
  assert.ok(s.targets.every(target => s.head(target) === next));
});

test('divergence on the second destination prevents updating the first', t => {
  const s = setup(t);
  const initial = s.run();
  const other = path.join(s.root, 'other');
  git(s.root, 'clone', s.targets[1].url, other);
  git(other, 'config', 'user.name', 'Other contributor');
  git(other, 'config', 'user.email', 'other@example.invalid');
  writeFileSync(path.join(other, 'prototype.txt'), 'independent change');
  git(other, 'add', '.'); git(other, 'commit', '-m', 'independent change');
  git(other, 'push', 'origin', 'main');
  const independent = s.head(s.targets[1]);
  s.commit('local update');
  assert.throws(() => s.run(), /changes missing locally/);
  assert.equal(s.head(s.targets[0]), initial);
  assert.equal(s.head(s.targets[1]), independent);
});

test('uncommitted files prevent any publication', t => {
  const s = setup(t);
  writeFileSync(path.join(s.cwd, 'prototype.txt'), 'unsaved draft');
  assert.throws(() => s.run(), /Commit or resolve local changes/);
  assert.ok(s.targets.every(target => s.head(target) === ''));
});

test('a missing destination prevents publication to the reachable destination', t => {
  const s = setup(t);
  const broken = [...s.targets.slice(0, 1), { name: 'missing', url: path.join(s.root, 'absent.git') }];
  assert.throws(() => s.run({ targets: broken }));
  assert.equal(s.head(s.targets[0]), '');
});
