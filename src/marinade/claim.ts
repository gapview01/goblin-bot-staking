import { PublicKey, ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js';
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import { getConnection, getVaultKeypair, priorityFee, sendAndConfirm } from '../clients/solana.js';
import { withMemoLock } from '../utils/idempotency.js';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export async function claimDelayedUnstake(ticketPubkey: string | PublicKey, memo: string): Promise<{ sig: string; lamportsReceived: number }> {
  return withMemoLock(memo, async () => {
    const connection = getConnection();
    const payer = getVaultKeypair();
    const ticket = typeof ticketPubkey === 'string' ? new PublicKey(ticketPubkey) : ticketPubkey;
    const config = new MarinadeConfig({ connection, publicKey: payer.publicKey });
    const marinade = new Marinade(config);
    const { transaction, amountLamports } = await marinade.claim(ticket);

    if (priorityFee > 0) {
      transaction.addFirst(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }));
    }
    transaction.add(new TransactionInstruction({ keys: [], programId: MEMO_PROGRAM_ID, data: Buffer.from(memo) }));
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.sign(payer);
    const sig = await sendAndConfirm(connection, transaction, payer, memo);
    return { sig, lamportsReceived: amountLamports };
  });
}
