import { PublicKey, ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js';
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import { getConnection, getVaultKeypair, priorityFee, sendAndConfirm } from '../clients/solana.js';
import { withMemoLock } from '../utils/idempotency.js';
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export async function unstakeInstant(msolLamports: number, memo: string): Promise<{ sig: string; estFeeBps: number }> {
  return withMemoLock(memo, async () => {
    const connection = getConnection();
    const payer = getVaultKeypair();
    const config = new MarinadeConfig({ connection, publicKey: payer.publicKey });
    const marinade = new Marinade(config);
    const { transaction, fee } = await marinade.liquidUnstake(msolLamports);

    if (priorityFee > 0) {
      transaction.addFirst(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }));
    }
    transaction.add(new TransactionInstruction({ keys: [], programId: MEMO_PROGRAM_ID, data: Buffer.from(memo) }));
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.sign(payer);
    const sig = await sendAndConfirm(connection, transaction, payer, memo);
    return { sig, estFeeBps: fee || 0 };
  });
}

export async function requestDelayedUnstake(msolLamports: number, memo: string): Promise<{ sig: string; ticketPubkey: string }> {
  return withMemoLock(memo, async () => {
    const connection = getConnection();
    const payer = getVaultKeypair();
    const config = new MarinadeConfig({ connection, publicKey: payer.publicKey });
    const marinade = new Marinade(config);
    const { transaction, ticketAddress } = await marinade.unstake(msolLamports);

    if (priorityFee > 0) {
      transaction.addFirst(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }));
    }
    transaction.add(new TransactionInstruction({ keys: [], programId: MEMO_PROGRAM_ID, data: Buffer.from(memo) }));
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.sign(payer);
    const sig = await sendAndConfirm(connection, transaction, payer, memo);
    return { sig, ticketPubkey: ticketAddress.toBase58() };
  });
}
