import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export type SolanaAnchor = {
  signature: string;
  signer: string;
  explorerUrl: string;
  network: 'devnet';
};

export async function anchorReceipt(receiptHash: string): Promise<SolanaAnchor> {
  const connection = new Connection(rpcUrl, 'confirmed');
  const signer = Keypair.generate();
  const airdrop = await connection.requestAirdrop(signer.publicKey, 0.02 * LAMPORTS_PER_SOL);
  const blockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: airdrop, ...blockhash }, 'confirmed');

  const memo = `PactaAI Regulatory Evidence Receipt v0.1|${receiptHash}`;
  const instruction = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, 'utf8'),
  });

  const signature = await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [signer], { commitment: 'confirmed' });
  return {
    signature,
    signer: signer.publicKey.toBase58(),
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    network: 'devnet',
  };
}
