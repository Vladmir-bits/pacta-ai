import type { ComparisonResult, EvidenceReceipt, EvidenceRecord, Jurisdiction, Topic } from '../types';
import { evidence } from '../data/regulations';

const encoder = new TextEncoder();

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function getEvidence(jurisdiction: Jurisdiction, topic: Topic): EvidenceRecord {
  const match = evidence.find((item) => item.jurisdiction === jurisdiction && item.topic === topic);
  if (!match) throw new Error(`No evidence record for ${jurisdiction} / ${topic}`);
  return match;
}

export function compareJurisdictions(left: Jurisdiction, right: Jurisdiction, topic: Topic): ComparisonResult {
  const leftEvidence = getEvidence(left, topic);
  const rightEvidence = getEvidence(right, topic);
  const incomplete = [leftEvidence, rightEvidence].some((record) => record.article === 'Demo dataset note');

  return {
    topic,
    left: leftEvidence,
    right: rightEvidence,
    explanation: incomplete
      ? 'The current curated corpus is incomplete for at least one selected jurisdiction, so PactaAI does not generate a substantive legal comparison. The missing evidence is explicitly flagged for human review.'
      : `${left} and ${right} both regulate the selected topic, but the applicable legal instruments, terminology, and compliance mechanisms differ. Review the cited provisions below before relying on the comparison.`,
    confidence: incomplete ? 'Medium' : 'High',
    uncertainty: incomplete
      ? 'One or more evidence records are placeholders identifying a corpus gap. No legal conclusion should be drawn until an official source is added.'
      : 'This MVP uses a curated evidence corpus and deterministic summaries. It does not yet run production RAG or legal source-hierarchy validation.',
    methodologyVersion: 'pacta-compare-v0.1',
  };
}

export async function createReceipt(result: ComparisonResult): Promise<EvidenceReceipt> {
  const evidenceHashes = await Promise.all([
    sha256(JSON.stringify(result.left)),
    sha256(JSON.stringify(result.right)),
  ]);
  const analysisHash = await sha256(JSON.stringify({ explanation: result.explanation, confidence: result.confidence, uncertainty: result.uncertainty }));
  const base = {
    receiptVersion: 'pacta-evidence-v0.1' as const,
    topic: result.topic,
    jurisdictions: [result.left.jurisdiction, result.right.jurisdiction] as [Jurisdiction, Jurisdiction],
    evidenceIds: [result.left.id, result.right.id],
    evidenceHashes,
    analysisHash,
    methodologyVersion: result.methodologyVersion,
    generatedAt: new Date().toISOString(),
  };
  const receiptHash = await sha256(JSON.stringify(base));
  return { ...base, receiptHash };
}

export async function verifyReceipt(receipt: EvidenceReceipt, result: ComparisonResult): Promise<boolean> {
  const regenerated = await createReceiptAt(result, receipt.generatedAt);
  return regenerated.receiptHash === receipt.receiptHash;
}

async function createReceiptAt(result: ComparisonResult, generatedAt: string): Promise<EvidenceReceipt> {
  const evidenceHashes = await Promise.all([sha256(JSON.stringify(result.left)), sha256(JSON.stringify(result.right))]);
  const analysisHash = await sha256(JSON.stringify({ explanation: result.explanation, confidence: result.confidence, uncertainty: result.uncertainty }));
  const base = {
    receiptVersion: 'pacta-evidence-v0.1' as const,
    topic: result.topic,
    jurisdictions: [result.left.jurisdiction, result.right.jurisdiction] as [Jurisdiction, Jurisdiction],
    evidenceIds: [result.left.id, result.right.id],
    evidenceHashes,
    analysisHash,
    methodologyVersion: result.methodologyVersion,
    generatedAt,
  };
  return { ...base, receiptHash: await sha256(JSON.stringify(base)) };
}
