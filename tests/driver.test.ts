import { describe, it, expect, vi } from 'vitest';
import { PublicKey, Transaction, Keypair } from '@solana/web3.js';

vi.mock('../src/clients/solana.ts', () => {
  const payer = Keypair.generate();
  const connection = {
    sendTransaction: vi.fn().mockResolvedValue('sig123'),
    confirmTransaction: vi.fn().mockResolvedValue({}),
    getLatestBlockhash: vi.fn().mockResolvedValue({ blockhash: '11111111111111111111111111111111', lastValidBlockHeight: 1 }),
    getSignaturesForAddress: vi.fn().mockResolvedValue([]),
    getTransaction: vi.fn(),
  } as any;
  return {
    getConnection: () => connection,
    getVaultKeypair: () => payer,
    priorityFee: 0,
    findTransactionByMemo: vi.fn().mockResolvedValue(null),
    sendAndConfirm: (conn: any, tx: Transaction, p: any, memo: string) => conn.sendTransaction(tx, { signers: [p] }),
  };
});

vi.mock('@marinade.finance/marinade-ts-sdk', () => {
  const { Transaction, Keypair } = require('@solana/web3.js');
  return {
    Marinade: vi.fn().mockImplementation(() => ({
      deposit: vi.fn().mockResolvedValue({ transaction: new Transaction(), associatedMSolTokenAccountAddress: Keypair.generate().publicKey }),
      liquidUnstake: vi.fn().mockResolvedValue({ transaction: new Transaction(), fee: 5 }),
      unstake: vi.fn().mockResolvedValue({ transaction: new Transaction(), ticketAddress: Keypair.generate().publicKey }),
      claim: vi.fn().mockResolvedValue({ transaction: new Transaction(), amountLamports: 7 }),
    })),
    MarinadeConfig: vi.fn(),
  };
});

import { transferSol } from '../src/payments/transfer.js';
import { stake } from '../src/marinade/stake.js';
import { computeProfit } from '../src/accounting/profit.js';

describe('profit', () => {
  it('clamps negative profit to zero', () => {
    expect(computeProfit(100, 200, 10).profitLamports).toBe(0);
  });
});

describe('transfer', () => {
  it('sends a transaction', async () => {
    const { sig } = await transferSol(new PublicKey('11111111111111111111111111111111'), 1, 'memo1');
    expect(sig).toBe('sig123');
  });
});

describe('stake', () => {
  it('stakes via marinade', async () => {
    const { sig, msolAta } = await stake(1, 'memo2');
    expect(sig).toBe('sig123');
    expect(msolAta).toBeDefined();
  });
});
