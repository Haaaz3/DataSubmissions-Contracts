import { z } from 'zod';
import { openDB, type DBSchema } from 'idb';

export const productSchema = z.enum(['data-submissions', 'pm-sandbox']);
export type Product = z.infer<typeof productSchema>;
export const productNames: Record<Product, string> = { 'data-submissions': 'Data Submissions', 'pm-sandbox': 'PM Sandbox' };
const text = z.string().trim().min(1).max(8000);
export const sourceSchema = z.object({
  product: productSchema, key: z.string().min(1).max(200),
  document: z.string().min(1).max(500), original: text,
});
export const draftSchema = z.object({
  title: z.string().trim().min(1).max(160), description: text,
  acceptance: text, category: z.enum(['workflow', 'interaction', 'explainability', 'validation', 'visual']),
  status: z.enum(['proposed', 'accepted', 'needs-review']),
});
export type CriterionDraft = z.infer<typeof draftSchema>;
const revisionSchema = draftSchema.extend({ revision: z.number().int().positive(), at: z.string().datetime(), editor: productSchema });
export const criterionSchema = draftSchema.extend({
  id: z.string().min(1).max(240), origin: productSchema, source: sourceSchema.optional(),
  usedBy: z.array(productSchema).min(1).max(2).refine(a => new Set(a).size === a.length),
  revision: z.number().int().positive(), createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
  history: z.array(revisionSchema).max(100),
});
export type Criterion = z.infer<typeof criterionSchema>;
export type SourceCriterion = { source: z.infer<typeof sourceSchema>; draft: CriterionDraft };
export const bundleSchema = z.object({ format: z.literal('austin-ci-design-criteria'), version: z.literal(1), criteria: z.array(criterionSchema).max(2000) });
export function sourceId(source: SourceCriterion['source']) { return `source:${source.product}:${source.key}`; }
export function adopt(record: Criterion, product: Product): Criterion {
  return record.usedBy.includes(product) ? record : { ...record, usedBy: [...record.usedBy, product] };
}
export function refine(record: Criterion, draft: CriterionDraft, editor: Product, expected: number): Criterion {
  if (record.revision !== expected) throw new Error('This criterion changed in another view. Reload it before saving.');
  const changes = draftSchema.parse(draft);
  const now = new Date().toISOString();
  return { ...record, ...changes, revision: record.revision + 1, updatedAt: now,
    history: [...record.history, { ...changes, revision: record.revision + 1, at: now, editor }].slice(-100) };
}
interface CriteriaDB extends DBSchema { criteria: { key: string; value: Criterion } }
export class CriteriaRepository {
  constructor(private name = 'austin-ci-design-criteria-v1') {}
  private db() { return openDB<CriteriaDB>(this.name, 1, { upgrade(db) { db.createObjectStore('criteria', { keyPath: 'id' }); } }); }
  async list() { const db = await this.db(); try { return (await db.getAll('criteria')).map(v => criterionSchema.parse(v)); } finally { db.close(); } }
  async pull(items: SourceCriterion[], product: Product) {
    const validated = items.map(item => ({ source: sourceSchema.parse(item.source), draft: draftSchema.parse(item.draft) }));
    const db = await this.db();
    try {
      const tx = db.transaction('criteria', 'readwrite');
      for (const item of validated) {
        const id = sourceId(item.source); const existing = await tx.store.get(id);
        if (existing) {
          // Re-pulling source material must never overwrite a user's refinement.
          if (!existing.usedBy.includes(product)) await tx.store.put({ ...adopt(existing, product), revision: existing.revision + 1, updatedAt: new Date().toISOString() });
        } else {
          const now = new Date().toISOString();
          await tx.store.put(criterionSchema.parse({ ...item.draft, id, source: item.source, origin: item.source.product,
            usedBy: [...new Set([item.source.product, product])], revision: 1, createdAt: now, updatedAt: now,
            history: [{ ...item.draft, revision: 1, at: now, editor: product }] }));
        }
      }
      await tx.done;
    } finally { db.close(); }
  }
  async create(draft: CriterionDraft, product: Product) {
    const data = draftSchema.parse(draft); const now = new Date().toISOString();
    const value = criterionSchema.parse({ ...data, id: crypto.randomUUID(), origin: product, usedBy: [product], revision: 1, createdAt: now, updatedAt: now,
      history: [{ ...data, revision: 1, at: now, editor: product }] });
    const db = await this.db(); try { await db.add('criteria', value); } finally { db.close(); } return value;
  }
  async save(id: string, draft: CriterionDraft, product: Product, expected: number) {
    // Validate before opening a transaction so invalid input never abandons one.
    draftSchema.parse(draft);
    const db = await this.db();
    try {
      const tx = db.transaction('criteria', 'readwrite'); const old = await tx.store.get(id);
      if (!old) { await tx.done; throw new Error('Criterion no longer exists.'); }
      if (old.revision !== expected) { await tx.done; throw new Error('This criterion changed in another view. Reload it before saving.'); }
      await tx.store.put(refine(old, draft, product, expected)); await tx.done;
    } finally { db.close(); }
  }
  async use(id: string, product: Product) {
    const db = await this.db(); try {
      const tx = db.transaction('criteria', 'readwrite'); const old = await tx.store.get(id);
      if (!old) { await tx.done; throw new Error('Criterion no longer exists.'); }
      if (!old.usedBy.includes(product)) await tx.store.put({ ...adopt(old, product), revision: old.revision + 1, updatedAt: new Date().toISOString() });
      await tx.done;
    } finally { db.close(); }
  }
  async importBundle(input: unknown) {
    const bundle = bundleSchema.parse(input);
    if (new Set(bundle.criteria.map(c => c.id)).size !== bundle.criteria.length) throw new Error('Import has duplicate IDs.');
    // Canonical source IDs prevent imported copies from splitting a source record.
    for (const item of bundle.criteria) if (item.source && item.id !== sourceId(item.source)) throw new Error('Invalid source identity.');
    const db = await this.db(); const result = { added: 0, unchanged: 0, conflicts: [] as string[] };
    try {
      const tx = db.transaction('criteria', 'readwrite');
      for (const item of bundle.criteria) {
        const existing = await tx.store.get(item.id);
        if (!existing) { await tx.store.add(item); result.added++; }
        else if (JSON.stringify(existing) === JSON.stringify(item)) result.unchanged++;
        else result.conflicts.push(item.title);
      }
      await tx.done; return result;
    } finally { db.close(); }
  }
}
export function exportBundle(criteria: Criterion[]) { return bundleSchema.parse({ format: 'austin-ci-design-criteria', version: 1, criteria }); }
