import { MemoProgram } from '@solana/web3.js';
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import { getConnection, getVaultKeypair } from '../src/clients/solana.js';

async function main() {
  const connection = getConnection();
  const payer = getVaultKeypair();
  const marinade = new Marinade(new MarinadeConfig({ connection, publicKey: payer.publicKey }));
  const { transaction } = await marinade.deposit(1);
  transaction.add(MemoProgram.writeUtf8('dry-run'));
  console.log('Dry run built transaction with', transaction.instructions.length, 'instructions');
}

main();
