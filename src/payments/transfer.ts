import { PublicKey, SystemProgram, Transaction, ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js';
import { getConnection, getVaultKeypair, priorityFee, sendAndConfirm } from '../clients/solana.js';
import { withMemoLock } from '../utils/idempotency.js';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export async function transferSol(to: string | PublicKey, lamports: number, memo: string): Promise<{ sig: string }> {
  return withMemoLock(memo, async () => {
    const connection = getConnection();
    const payer = getVaultKeypair();
    const destination = typeof to === 'string' ? new PublicKey(to) : to;

    const instructions: TransactionInstruction[] = [];
    if (priorityFee > 0) {
      instructions.push(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }));
    }
    instructions.push(SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: destination, lamports }));
    instructions.push(new TransactionInstruction({ keys: [], programId: MEMO_PROGRAM_ID, data: Buffer.from(memo) }));
    const tx = new Transaction().add(...instructions);
    const sig = await sendAndConfirm(connection, tx, payer, memo);
    return { sig };
  });
}
