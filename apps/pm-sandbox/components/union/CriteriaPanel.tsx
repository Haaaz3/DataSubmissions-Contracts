'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CriteriaRepository, exportBundle, productNames, type Criterion, type CriterionDraft, type Product, type SourceCriterion } from '@austin/design-criteria';
import { pmAdapter, submissionsAdapter } from '@austin/design-criteria/adapters';
import scenarios from '@austin/design-criteria/submission-scenarios';

const repository = new CriteriaRepository();
const blank: CriterionDraft = { title: '', description: '', acceptance: '', category: 'workflow', status: 'proposed' };
const channelName = 'austin-ci-criteria-updates';

export default function CriteriaPanel({ product, liveScenarios, onClose }: { product: Product; liveScenarios: SourceCriterion[] | null; onClose: () => void }) {
  const [records, setRecords] = useState<Criterion[]>([]);
  const [filter, setFilter] = useState<'current' | 'all'>('current');
  const [query, setQuery] = useState('');
  const [sourceProduct, setSourceProduct] = useState<Product>(product === 'pm-sandbox' ? 'data-submissions' : 'pm-sandbox');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<Criterion | 'new' | null>(null);
  const [draft, setDraft] = useState<CriterionDraft>(blank);
  const heading = useRef<HTMLHeadingElement>(null);
  const notify = useRef<BroadcastChannel | null>(null);
  const load = useCallback(async () => { setRecords(await repository.list()); setReady(true); }, []);
  useEffect(() => {
    heading.current?.focus();
    const refresh = () => { void load().catch(() => setError('The criteria library could not be opened. Check whether this browser allows local storage.')); };
    refresh();
    if ('BroadcastChannel' in window) { notify.current = new BroadcastChannel(channelName); notify.current.onmessage = refresh; }
    window.addEventListener('focus', refresh);
    return () => { notify.current?.close(); window.removeEventListener('focus', refresh); };
  }, [load]);
  async function act(action: () => Promise<string>) {
    setBusy(true); setError(''); setMessage('');
    try { const result = await action(); await load(); notify.current?.postMessage('changed'); setMessage(result); }
    catch (e) { setError(e instanceof Error ? e.message : 'The change could not be saved.'); }
    finally { setBusy(false); }
  }
  const sources = sourceProduct === 'pm-sandbox' ? pmAdapter() : liveScenarios ?? submissionsAdapter(scenarios);
  const visible = records.filter(c => (filter === 'all' || c.usedBy.includes(product)) && `${c.title} ${c.description} ${c.acceptance}`.toLowerCase().includes(query.toLowerCase()));
  function startEdit(record: Criterion | 'new') { setEditing(record); setDraft(record === 'new' ? { ...blank } : { title: record.title, description: record.description, acceptance: record.acceptance, category: record.category, status: record.status }); setError(''); }
  return <section className="union-criteria" aria-labelledby="criteria-heading">
    <div className="union-criteria-title">
      <div><p className="union-eyebrow">AUSTIN CI · SHARED LIBRARY</p><h1 id="criteria-heading" ref={heading} tabIndex={-1}>Design criteria</h1><p>Refine once. Use across both products.</p></div>
      <button onClick={onClose}>Return to {productNames[product]}</button>
    </div>
    <p className="union-note">Working in <strong>{productNames[product]}</strong>. Changes to a shared criterion are visible in both products. Design criteria do not change clinical rules or simulation calculations.</p>
    <div className="union-toolbar">
      <button disabled={!ready || busy} onClick={() => startEdit('new')}>New criterion</button>
      <button disabled={!ready || busy} onClick={() => {
        const blob = new Blob([JSON.stringify(exportBundle(records), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'austin-ci-design-criteria.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}>Export library</button>
      <label className="union-file">Import library<input aria-label="Import criteria JSON" type="file" accept="application/json,.json" disabled={!ready || busy} onChange={event => {
        const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
        void act(async () => {
          if (file.size > 5_000_000) throw new Error('Choose a criteria JSON file smaller than 5 MB.');
          const result = await repository.importBundle(JSON.parse(await file.text()));
          return `${result.added} added; ${result.unchanged} unchanged.${result.conflicts.length ? ` Conflicts kept locally (review the imported file): ${result.conflicts.join(', ')}` : ''}`;
        });
      }} /></label>
    </div>
    {error && <p className="union-error" role="alert">{error}</p>}
    <p role="status" className="union-status">{busy ? 'Saving…' : message}</p>
    <div className="union-columns">
      <aside className="union-sources"><h2>Pull from a product</h2><p>Adopt source requirements into {productNames[product]}. Existing refinements are kept.</p>
        <label>Source product<select aria-label="Source product" value={sourceProduct} onChange={e => setSourceProduct(e.target.value as Product)}>{Object.entries(productNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <button className="union-primary" disabled={!ready || busy} onClick={() => void act(async () => { await repository.pull(sources, product); return `${sources.length} source requirements are now available in ${productNames[product]}.`; })}>Pull all {sources.length} criteria</button>
        {sources.map(item => <article key={item.source.key}><h3>{item.draft.title}</h3><p>{item.draft.description}</p><button disabled={!ready || busy} onClick={() => void act(async () => { await repository.pull([item], product); return `Available in ${productNames[product]}: ${item.draft.title}`; })}>Pull criterion</button></article>)}
      </aside>
      <div className="union-library">
        <div className="union-toolbar"><label>Show<select aria-label="Show" value={filter} onChange={e => setFilter(e.target.value as 'current' | 'all')}><option value="current">Used in {productNames[product]}</option><option value="all">Entire shared library</option></select></label><label>Search<input aria-label="Search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find criteria…" type="search" /></label></div>
        {editing && <form className="union-editor" onSubmit={e => {
          e.preventDefault(); void act(async () => {
            if (editing === 'new') await repository.create(draft, product); else await repository.save(editing.id, draft, product, editing.revision);
            setEditing(null); return 'Criterion saved to the shared library.';
          });
        }}><h2>{editing === 'new' ? 'New criterion' : `Refine criterion · revision ${editing.revision}`}</h2>
          <label>Title<input aria-label="Title" required maxLength={160} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
          <label>Design requirement<textarea aria-label="Design requirement" required maxLength={8000} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label>
          <label>Acceptance criteria<textarea aria-label="Acceptance criteria" required maxLength={8000} value={draft.acceptance} onChange={e => setDraft({ ...draft, acceptance: e.target.value })} /></label>
          <div className="union-toolbar"><label>Category<select aria-label="Category" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as CriterionDraft['category'] })}>{['workflow', 'interaction', 'explainability', 'validation', 'visual'].map(x => <option key={x}>{x}</option>)}</select></label><label>Status<select aria-label="Status" value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as CriterionDraft['status'] })}>{['proposed', 'accepted', 'needs-review'].map(x => <option key={x}>{x}</option>)}</select></label></div>
          <div className="union-toolbar"><button className="union-primary" disabled={busy} type="submit">Save shared criterion</button><button type="button" disabled={busy} onClick={() => setEditing(null)}>Cancel</button>{editing !== 'new' && <button type="button" disabled={busy} onClick={() => void act(async () => { const latest = (await repository.list()).find(c => c.id === editing.id); if (latest) startEdit(latest); return 'Loaded the latest revision.'; })}>Reload latest revision</button>}</div>
        </form>}
        <p className="union-count">{visible.length} {visible.length === 1 ? 'criterion' : 'criteria'}</p>
        {!visible.length && <div className="union-empty"><h2>{records.length ? 'No criteria match this view' : 'Build your shared design language'}</h2><p>Pull requirements from either product or create a criterion. Use “Entire shared library” to adopt criteria created in the other product.</p></div>}
        {visible.map(record => <article className="union-record" key={record.id}>
          <div className="union-record-meta"><span>{record.category} · {record.status}</span><span>Revision {record.revision}</span></div>
          <h2>{record.title}</h2><p>{record.description}</p><h3>Acceptance criteria</h3><p className="union-preserve">{record.acceptance}</p>
          <p className="union-record-use">Used in: {record.usedBy.map(p => productNames[p]).join(' + ')}</p>
          <details><summary>Source and revision history</summary><p>Origin: {productNames[record.origin]}</p>{record.source && <><p className="union-source-path">{record.source.document}</p><p className="union-preserve">{record.source.original}</p></>}<ol>{record.history.map(h => <li key={h.revision}><strong>Revision {h.revision} · {productNames[h.editor]}</strong><p>{h.title} · {h.status} · {h.category}</p><p className="union-preserve">{h.description}</p><p className="union-preserve">{h.acceptance}</p><time>{h.at}</time></li>)}</ol></details>
          <div className="union-toolbar"><button disabled={busy} onClick={() => startEdit(record)}>Refine</button>{!record.usedBy.includes(product) && <button disabled={busy} onClick={() => void act(async () => { await repository.use(record.id, product); return `Now used in ${productNames[product]}.`; })}>Use in {productNames[product]}</button>}</div>
        </article>)}
      </div>
    </div>
    <p className="union-note">Saved in this browser on this site. Export the library to move it to another browser. Imports never overwrite conflicting local records. The latest 100 text revisions are retained.</p>
  </section>;
}
