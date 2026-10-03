export type Jurisdiction = 'European Union' | 'United Kingdom' | 'Singapore';
export type Topic = 'Cross-border data transfer' | 'Data localization';

export type EvidenceRecord = {
  id: string;
  jurisdiction: Jurisdiction;
  topic: Topic;
  sourceTitle: string;
  publicationDate: string;
  article: string;
  sourceUrl: string;
  excerpt: string;
  obligation: string;
};

export type ComparisonResult = {
  topic: Topic;
  left: EvidenceRecord;
  right: EvidenceRecord;
  explanation: string;
  confidence: 'High' | 'Medium';
  uncertainty: string;
  methodologyVersion: string;
};

export type EvidenceReceipt = {
  receiptVersion: 'pacta-evidence-v0.1';
  topic: Topic;
  jurisdictions: [Jurisdiction, Jurisdiction];
  evidenceIds: string[];
  evidenceHashes: string[];
  analysisHash: string;
  methodologyVersion: string;
  generatedAt: string;
  receiptHash: string;
};
