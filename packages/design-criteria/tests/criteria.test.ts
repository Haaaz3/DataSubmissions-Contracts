import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { CriteriaRepository, exportBundle } from '../src/index';
import { pmAdapter, submissionsAdapter } from '../src/adapters';
import scenarios from '../src/submission-scenarios.json';
const repo = () => new CriteriaRepository(`test-${crypto.randomUUID()}`);
const draft = { title: 'Retain context', description: 'Keep the selected scope.', acceptance: 'Switching products retains the open scope.', category: 'workflow' as const, status: 'proposed' as const };
describe('canonical design criteria', () => {
  it('pulls in either direction with stable identities and no duplicate stores', async () => {
    const db = repo();
    await db.pull(submissionsAdapter(scenarios), 'pm-sandbox');
    await db.pull(pmAdapter(), 'data-submissions');
    await db.pull(submissionsAdapter(scenarios), 'data-submissions');
    const items = await db.list(); expect(items).toHaveLength(13);
    expect(items.every(c => c.usedBy.length === 2)).toBe(true);
  });
  it('preserves refinements and provenance when re-pulling original sources', async () => {
    const db = repo(); const source = pmAdapter().slice(0, 1);
    await db.pull(source, 'pm-sandbox'); const first = (await db.list())[0];
    await db.save(first.id, draft, 'data-submissions', first.revision);
    await db.pull(source, 'data-submissions'); const saved = (await db.list())[0];
    expect(saved.title).toBe(draft.title); expect(saved.source).toEqual(first.source); expect(saved.history).toHaveLength(2);
    expect(saved.usedBy).toContain('data-submissions');
  });
  it('rejects stale edits and serializes simultaneous writes', async () => {
    const db = repo(); const initial = await db.create(draft, 'data-submissions');
    const results = await Promise.allSettled([db.save(initial.id, { ...draft, title: 'A' }, 'pm-sandbox', 1), db.save(initial.id, { ...draft, title: 'B' }, 'data-submissions', 1)]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
    expect((await db.list())[0].revision).toBe(2);
  });
  it('adopts a shared record without cloning it', async () => {
    const db = repo(); const initial = await db.create(draft, 'pm-sandbox');
    await db.use(initial.id, 'data-submissions'); await db.use(initial.id, 'data-submissions');
    const saved = await db.list(); expect(saved).toHaveLength(1); expect(saved[0].usedBy).toHaveLength(2);
    expect(saved[0].revision).toBe(2);
  });
  it('round-trips exports while reporting conflicts without overwriting', async () => {
    const db = repo(); const initial = await db.create(draft, 'pm-sandbox');
    const bundle = exportBundle(await db.list()); const target = repo();
    expect((await target.importBundle(bundle)).added).toBe(1);
    expect((await target.importBundle(bundle)).unchanged).toBe(1);
    await target.save(initial.id, { ...draft, title: 'Local refinement' }, 'pm-sandbox', 1);
    expect((await target.importBundle(bundle)).conflicts).toEqual([draft.title]);
    expect((await target.list())[0].title).toBe('Local refinement');
  });
  it('rejects malformed imports, duplicate IDs, and forged source identities atomically', async () => {
    const db = repo(); await db.pull(pmAdapter().slice(0, 1), 'pm-sandbox');
    const bundle = exportBundle(await db.list()); const target = repo();
    await expect(target.importBundle({ ...bundle, version: 2 })).rejects.toThrow();
    await expect(target.importBundle({ ...bundle, criteria: [...bundle.criteria, ...bundle.criteria] })).rejects.toThrow('duplicate');
    await expect(target.importBundle({ ...bundle, criteria: [{ ...bundle.criteria[0], id: 'copy' }] })).rejects.toThrow('identity');
    await expect(target.importBundle({ ...bundle, criteria: [{ ...bundle.criteria[0], title: '' }] })).rejects.toThrow();
    expect(await target.list()).toEqual([]);
  });
  it('validates adapter messages and rejects malformed data', () => {
    expect(() => submissionsAdapter([{ key: 'x', label: 'x', goal: 10 }])).toThrow();
    expect(submissionsAdapter(scenarios)).toHaveLength(6);
  });
  it('surfaces storage failures instead of claiming changes were saved', async () => {
    const db = repo(); const original = globalThis.indexedDB;
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: { open() { throw new Error('storage blocked'); } } });
    try { await expect(db.create(draft, 'pm-sandbox')).rejects.toThrow('storage blocked'); }
    finally { Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: original }); }
  });
});
