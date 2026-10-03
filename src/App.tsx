import { useMemo, useState } from 'react';
import { anchorReceipt, type SolanaAnchor } from './lib/solana';
import { compareJurisdictions, createReceipt, verifyReceipt } from './lib/evidence';
import type { EvidenceReceipt, Jurisdiction, Topic } from './types';

const jurisdictions: Jurisdiction[] = ['European Union', 'United Kingdom', 'Singapore'];
const topics: Topic[] = ['Cross-border data transfer', 'Data localization'];

export default function App() {
  const [left, setLeft] = useState<Jurisdiction>('European Union');
  const [right, setRight] = useState<Jurisdiction>('Singapore');
  const [topic, setTopic] = useState<Topic>('Cross-border data transfer');
  const [receipt, setReceipt] = useState<EvidenceReceipt | null>(null);
  const [anchor, setAnchor] = useState<SolanaAnchor | null>(null);
  const [status, setStatus] = useState('Ready');
  const [tampered, setTampered] = useState(false);
  const result = useMemo(() => compareJurisdictions(left, right, topic), [left, right, topic]);

  async function generateReceipt() {
    setStatus('Generating evidence receipt…');
    const next = await createReceipt(result);
    setReceipt(next);
    setAnchor(null);
    setTampered(false);
    setStatus('Receipt ready');
  }

  async function anchorOnSolana() {
    if (!receipt) return;
    try {
      setStatus('Funding ephemeral devnet signer…');
      const proof = await anchorReceipt(receipt.receiptHash);
      setAnchor(proof);
      setStatus('Verified on Solana devnet');
    } catch (error) {
      console.error(error);
      setStatus('Devnet transaction failed — retry or configure another RPC endpoint.');
    }
  }

  async function runTamperCheck() {
    if (!receipt) return;
    const altered = { ...result, explanation: `${result.explanation} [locally modified]` };
    const valid = await verifyReceipt(receipt, altered);
    setTampered(!valid);
  }

  return (
    <main>
      <header className="hero">
        <div className="eyebrow">PACTA AI · REGTECH & COMPLIANCE</div>
        <h1>Verifiable regulatory intelligence for digital trade.</h1>
        <p>Interpret rules across jurisdictions, trace every conclusion to source evidence, and anchor a cryptographic receipt to Solana.</p>
        <div className="flow"><span>Interpret</span><b>→</b><span>Cite</span><b>→</b><span>Verify</span></div>
      </header>

      <section className="panel controls">
        <label>Jurisdiction A<select value={left} onChange={(e) => setLeft(e.target.value as Jurisdiction)}>{jurisdictions.map((j) => <option key={j}>{j}</option>)}</select></label>
        <label>Jurisdiction B<select value={right} onChange={(e) => setRight(e.target.value as Jurisdiction)}>{jurisdictions.filter((j) => j !== left).map((j) => <option key={j}>{j}</option>)}</select></label>
        <label>Topic<select value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>{topics.map((t) => <option key={t}>{t}</option>)}</select></label>
      </section>

      <section className="comparison">
        {[result.left, result.right].map((item) => (
          <article className="panel evidence" key={item.id}>
            <div className="badge">{item.jurisdiction}</div>
            <h2>{item.sourceTitle}</h2>
            <div className="meta">{item.article} · {item.publicationDate}</div>
            <h3>Obligation</h3><p>{item.obligation}</p>
            <h3>Evidence</h3><blockquote>“{item.excerpt}”</blockquote>
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">Open official/source record ↗</a>
          </article>
        ))}
      </section>

      <section className="panel analysis">
        <div><div className={`confidence ${result.confidence.toLowerCase()}`}>{result.confidence} confidence</div><h2>Comparison</h2></div>
        <p>{result.explanation}</p>
        <div className="warning"><strong>Uncertainty:</strong> {result.uncertainty}</div>
      </section>

      <section className="panel receipt">
        <div className="section-title"><div><div className="eyebrow">REGULATORY EVIDENCE RECEIPT</div><h2>Make the analytical artifact auditable</h2></div><button onClick={generateReceipt}>Generate receipt</button></div>
        {!receipt ? <p className="muted">Generate a receipt to hash the evidence bundle and analytical output.</p> : <>
          <div className="receipt-grid">
            <div><span>Methodology</span><strong>{receipt.methodologyVersion}</strong></div>
            <div><span>Evidence records</span><strong>{receipt.evidenceIds.length}</strong></div>
            <div><span>Generated</span><strong>{new Date(receipt.generatedAt).toLocaleString()}</strong></div>
            <div><span>Network</span><strong>{anchor ? 'Solana devnet' : 'Not anchored yet'}</strong></div>
          </div>
          <code>{receipt.receiptHash}</code>
          <div className="actions"><button className="primary" onClick={anchorOnSolana}>Anchor to Solana devnet</button><button className="secondary" onClick={runTamperCheck}>Simulate evidence modification</button></div>
          <p className="status">{status}</p>
          {anchor && <div className="verified"><strong>✓ Anchored</strong><span>Signer: {anchor.signer}</span><a href={anchor.explorerUrl} target="_blank" rel="noreferrer">View transaction on Solana Explorer ↗</a></div>}
          {tampered && <div className="failed"><strong>Verification failed</strong><span>The locally modified analytical record no longer matches the anchored receipt.</span></div>}
        </>}
      </section>

      <footer>This MVP is a research demonstration and does not provide legal advice. Full legal text remains off-chain; Solana stores only a compact verification fingerprint.</footer>
    </main>
  );
}
