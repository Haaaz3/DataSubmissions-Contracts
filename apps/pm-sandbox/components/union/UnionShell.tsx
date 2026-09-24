'use client';

import { useEffect, useRef, useState } from 'react';
import { productNames, type Product, type SourceCriterion } from '@austin/design-criteria';
import { submissionsAdapter } from '@austin/design-criteria/adapters';
import NavBar from '@/components/NavBar';
import AppShell from '@/components/AppShell';
import FeatureControls from '@/components/FeatureControls';
import FooterNav from '@/components/FooterNav';
import CriteriaPanel from './CriteriaPanel';
import './union.css';

export default function UnionShell({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product>('data-submissions');
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [submissionsVisited, setSubmissionsVisited] = useState(true);
  const [liveScenarios, setLiveScenarios] = useState<SourceCriterion[] | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const criteriaButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const restore = () => {
      const url = new URL(window.location.href);
      const requested = url.searchParams.get('product');
      const next = requested === 'data-submissions' || (!requested && ['/','/home'].includes(url.pathname)) ? 'data-submissions' : 'pm-sandbox';
      setProduct(next); if (next === 'data-submissions') setSubmissionsVisited(true);
    };
    restore(); window.addEventListener('popstate', restore);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.channel !== 'austin-ci-v1') return;
      if (event.data.type === 'switch-product' && event.data.product === 'pm-sandbox') changeProduct('pm-sandbox');
      if (event.data.type === 'open-criteria') setCriteriaOpen(true);
      if (event.data.type === 'submissions-context') {
        try { setLiveScenarios(submissionsAdapter(event.data.scenarios)); } catch { /* Keep build-time source adapter if a message is invalid. */ }
      }
    };
    window.addEventListener('message', receive);
    return () => { window.removeEventListener('popstate', restore); window.removeEventListener('message', receive); };
  }, []);
  function changeProduct(next: Product) {
    setProduct(next); if (next === 'data-submissions') setSubmissionsVisited(true);
    const url = new URL(window.location.href);
    url.searchParams.set('product', next);
    window.history.pushState(null, '', url);
  }
  return <div className="union-root">
    <header className="union-bar" hidden={product === 'data-submissions' && !criteriaOpen}>
      <div className="union-brand"><span className="union-mark">CI</span><div><strong>Austin CI</strong><small>Connected product workspace</small></div></div>
      <label className="union-products">Product
        <select aria-label="Select product" value={product} onChange={event => changeProduct(event.target.value as Product)}>
          <option value="data-submissions">Data Submissions</option>
          <option value="pm-sandbox">PM Sandbox</option>
        </select>
      </label>
      <button ref={criteriaButton} className="union-criteria-button" aria-expanded={criteriaOpen} onClick={() => setCriteriaOpen(!criteriaOpen)}>Design criteria</button>
    </header>
    <p className="union-sr" aria-live="polite">Active product: {productNames[product]}</p>
    {criteriaOpen && <CriteriaPanel product={product} liveScenarios={liveScenarios} onClose={() => { setCriteriaOpen(false); criteriaButton.current?.focus(); }} />}
    {/* Keep both products mounted: switching preserves draft state and the current PM route. */}
    <div hidden={product !== 'pm-sandbox' || criteriaOpen}><NavBar /><AppShell>{children}</AppShell><FeatureControls /><FooterNav /></div>
    {submissionsVisited && <div hidden={product !== 'data-submissions' || criteriaOpen} className="union-submissions"><iframe ref={frame} title="Data Submissions" src="/data-submissions/index.html" onLoad={() => frame.current?.contentWindow?.postMessage({ channel: 'austin-ci-v1', type: 'request-context' }, window.location.origin)} /></div>}
  </div>;
}
