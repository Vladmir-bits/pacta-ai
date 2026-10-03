# PactaAI

**Verifiable regulatory intelligence for digital trade.**

PactaAI is a hackathon MVP inspired by a broader technical architecture for explainable regulatory intelligence. It helps users compare digital-trade and data-governance rules across jurisdictions using evidence-linked analysis, then creates a cryptographic **Regulatory Evidence Receipt** that can be anchored to Solana devnet.

## Interpret → Cite → Verify

1. **Interpret** — select jurisdictions and a regulatory topic.
2. **Cite** — review structured obligations with exact source metadata.
3. **Verify** — generate a SHA-256 receipt over the evidence bundle and anchor the receipt hash to Solana devnet.

## Current MVP

This repository implements:

- a React + TypeScript regulatory comparison interface;
- a curated demo corpus for EU, UK, and Singapore cross-border data-transfer rules;
- structured evidence records with source title, article/section, URL, jurisdiction, publication date, and excerpt;
- transparent confidence and uncertainty notes;
- deterministic SHA-256 Regulatory Evidence Receipts;
- Solana devnet anchoring through the Memo program;
- transaction signature and Solana Explorer link;
- local tamper-check demonstration by recalculating the receipt hash.

## What is intentionally not claimed

The original PactaAI technical memo describes a proposed production architecture including automated ingestion, OCR, embeddings/vector retrieval, RAG reasoning, source-hierarchy validation, multilingual expansion, and export workflows. Those are **not all implemented in this hackathon MVP**. The current demo uses a small curated evidence corpus so the provenance and verification layer can be demonstrated honestly and end-to-end.

## Architecture

```text
Curated regulatory evidence
        ↓
Structured comparison
        ↓
Exact citation metadata
        ↓
Evidence bundle
        ↓
SHA-256 Regulatory Evidence Receipt
        ↓
Solana devnet Memo transaction
```

Full legal text and analytical content remain off-chain. Only the compact receipt fingerprint is anchored on-chain.

## Why blockchain?

Regulatory intelligence increasingly depends on AI-generated interpretation. A blockchain does not decide what a law means and does not replace legal review. PactaAI uses Solana only as a tamper-evident timestamp and provenance layer so a later reviewer can verify that a cited evidence bundle and analytical artifact have not changed since anchoring.

## Run locally

```bash
npm install
npm run dev
```

Optional custom RPC:

```bash
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

The demo signer is ephemeral and funded only with devnet SOL. It is not a production wallet or custody design.

## Tech

React, Vite, TypeScript, Web Crypto API, `@solana/web3.js`, Solana devnet.

## Roadmap

- official-source ingestion pipelines;
- PDF/OCR processing;
- vector retrieval and RAG;
- source hierarchy validation;
- multilingual regulatory analysis;
- structured report / CSV / JSON export;
- production wallet / signer architecture;
- human-review workflow for low-confidence legal interpretations.

## Disclaimer

PactaAI is a research and demonstration tool. It does not provide legal advice.
