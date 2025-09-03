import { Connection, Commitment, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

const commitment: Commitment = (process.env.COMMITMENT as Commitment) || 'confirmed';
const rpcPrimary = process.env.RPC_PRIMARY as string;
const rpcSecondary = process.env.RPC_SECONDARY as string | undefined;
export const priorityFee = Number(process.env.PRIORITY_FEE_MICROLAMPORTS || 0);

export const getConnection = (endpoint: string = rpcPrimary): Connection => {
  return new Connection(endpoint, { commitment });
};

export const withFallback = async <T>(fn: (conn: Connection) => Promise<T>): Promise<T> => {
  try {
    return await fn(getConnection(rpcPrimary));
  } catch (e) {
    if (!rpcSecondary) throw e;
    return await fn(getConnection(rpcSecondary));
  }
};

export const getVaultKeypair = (): Keypair => {
  const secret = process.env.VAULT_SECRET_BASE58;
  if (!secret) throw new Error('VAULT_SECRET_BASE58 missing');
  return Keypair.fromSecretKey(bs58.decode(secret));
};

export const findTransactionByMemo = async (
  connection: Connection,
  signer: PublicKey,
  memo: string,
): Promise<string | null> => {
  const sigs = await connection.getSignaturesForAddress(signer, { limit: 20 });
  for (const sig of sigs) {
    const tx = await connection.getTransaction(sig.signature, { commitment: 'confirmed' });
    if (!tx) continue;
    for (const ix of tx.transaction.message.instructions) {
      if (ix.programId.equals(MEMO_PROGRAM_ID)) {
        const data = Buffer.from(ix.data).toString();
        if (data === memo) {
          return sig.signature;
        }
      }
    }
  }
  return null;
};

export const sendAndConfirm = async (
  connection: Connection,
  tx: Transaction,
  payer: Keypair,
  memo: string,
): Promise<string> => {
  const existing = await findTransactionByMemo(connection, payer.publicKey, memo);
  if (existing) return existing;
  const sig = await connection.sendTransaction(tx, { signers: [payer] });
  await connection.confirmTransaction(sig, 'confirmed');
  await connection.confirmTransaction(sig, 'finalized');
  return sig;
};
