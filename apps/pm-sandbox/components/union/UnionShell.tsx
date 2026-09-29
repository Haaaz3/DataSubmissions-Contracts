'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productNames, type Product, type SourceCriterion } from '@austin/design-criteria';
import { submissionsAdapter } from '@austin/design-criteria/adapters';
import NavBar from '@/components/NavBar';
import AppShell from '@/components/AppShell';
import FeatureControls from '@/components/FeatureControls';
import FooterNav from '@/components/FooterNav';
import HealthDataIntelligenceCommandPlane from '@/components/health-intelligence/HealthDataIntelligenceCommandPlane';
import CriteriaPanel from './CriteriaPanel';
import './union.css';

type DataSubmissionsTarget = { program: string; route: string; scenario?: string };

export default function UnionShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product>('data-submissions');
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [submissionsVisited, setSubmissionsVisited] = useState(true);
  const [liveScenarios, setLiveScenarios] = useState<SourceCriterion[] | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const pendingSubmissionsTarget = useRef<DataSubmissionsTarget | null>(null);
  const criteriaButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const restore = () => {
      const url = new URL(window.location.href);
      const requested = url.searchParams.get('product');
      const next: Product = requested === 'data-submissions' || requested === 'hdi-command-center'
        ? requested
        : (!requested && ['/','/home'].includes(url.pathname) ? 'data-submissions' : 'pm-sandbox');
      setProduct(next); if (next === 'data-submissions') setSubmissionsVisited(true);
    };
    restore(); window.addEventListener('popstate', restore);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.channel !== 'austin-ci-v1') return;
      if (event.data.type === 'switch-product' && (event.data.product === 'pm-sandbox' || event.data.product === 'hdi-command-center')) changeProduct(event.data.product);
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
  function postSubmissionsTarget(target: DataSubmissionsTarget) {
    frame.current?.contentWindow?.postMessage({ channel: 'austin-ci-v1', type: 'open-submissions-route', ...target }, window.location.origin);
    pendingSubmissionsTarget.current = null;
  }
  function openDataSubmissions(target: DataSubmissionsTarget) {
    pendingSubmissionsTarget.current = target;
    changeProduct('data-submissions');
    window.setTimeout(() => {
      if (pendingSubmissionsTarget.current) postSubmissionsTarget(pendingSubmissionsTarget.current);
    }, 0);
  }
  function handleSubmissionsLoad() {
    frame.current?.contentWindow?.postMessage({ channel: 'austin-ci-v1', type: 'request-context' }, window.location.origin);
    if (pendingSubmissionsTarget.current) postSubmissionsTarget(pendingSubmissionsTarget.current);
  }
  function openPmAnalytics() {
    window.location.assign('/quality');
  }
  function openPatientWorklist(measure: string) {
    const normalized = measure.toLowerCase();
    const mappedMeasure = normalized.includes('medication') || normalized.includes('adherence')
      ? 'Medication Adherence'
      : normalized.includes('ed') || normalized.includes('follow-up')
      ? 'Follow-up after ED'
      : normalized.includes('evidence') || normalized.includes('ecqm') || normalized.includes('cqm')
      ? 'A1c Control'
      : 'Post Discharge Follow-up';
    const params = new URLSearchParams({ product: 'pm-sandbox', measure: mappedMeasure, source: 'hdi-shared-measure', context: measure });
    setProduct('pm-sandbox');
    router.push(`/population?${params.toString()}`);
  }
  return <div className="union-root">
    <header className="union-bar" hidden={product === 'data-submissions' && !criteriaOpen}>
      <div className="union-brand"><span className="union-mark">CI</span><div><strong>Austin CI</strong><small>Connected product workspace</small></div></div>
      <label className="union-products">Product
        <select aria-label="Select product" value={product} onChange={event => changeProduct(event.target.value as Product)}>
          <option value="data-submissions">Data Submissions</option>
          <option value="pm-sandbox">PM Sandbox</option>
          <option value="hdi-command-center">HDI Command Center</option>
        </select>
      </label>
      <button ref={criteriaButton} className="union-criteria-button" aria-expanded={criteriaOpen} onClick={() => setCriteriaOpen(!criteriaOpen)}>Design criteria</button>
    </header>
    <p className="union-sr" aria-live="polite">Active product: {productNames[product]}</p>
    {criteriaOpen && <CriteriaPanel product={product} liveScenarios={liveScenarios} onClose={() => { setCriteriaOpen(false); criteriaButton.current?.focus(); }} />}
    {/* Keep all products mounted: switching preserves draft state and the current PM route. */}
    <div hidden={product !== 'pm-sandbox' || criteriaOpen}><NavBar /><AppShell>{children}</AppShell><FeatureControls /><FooterNav /></div>
    <div hidden={product !== 'hdi-command-center' || criteriaOpen}><NavBar /><AppShell wide><HealthDataIntelligenceCommandPlane onOpenDataSubmissions={openDataSubmissions} onOpenPmAnalytics={openPmAnalytics} onOpenPatientWorklist={openPatientWorklist} /></AppShell></div>
    {submissionsVisited && <div hidden={product !== 'data-submissions' || criteriaOpen} className="union-submissions"><iframe ref={frame} title="Data Submissions" src="/data-submissions/index.html" onLoad={handleSubmissionsLoad} /></div>}
  </div>;
}
