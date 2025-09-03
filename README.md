# Goblin Bot — Staking Driver POC

[![Staking Driver CI](https://github.com/gapview01/goblin-bot-staking/actions/workflows/staking-driver.yml/badge.svg?branch=poc/staking-driver-v1)](https://github.com/gapview01/goblin-bot-staking/actions/workflows/staking-driver.yml)

Minimal TypeScript driver for staking SOL via [Marinade](https://marinade.finance/). It exposes
small, idempotent functions for staking, unstaking, claiming tickets, transfers
and profit calculation.

> **Warning:** no commits to `main`. All work happens on `poc/staking-driver-v1`.

## Install

```sh
npm install
```

Copy `.env.example` to `.env` and fill in RPC endpoints and vault secret.

## Environment Variables

- `RPC_PRIMARY` – primary Solana RPC
- `RPC_SECONDARY` – optional fallback RPC
- `VAULT_SECRET_BASE58` – base58 encoded payer keypair
- `COMMITMENT` – RPC commitment level (default `confirmed`)
- `PRIORITY_FEE_MICROLAMPORTS` – optional priority fee

## Tests

```sh
npm test
```

## Scope

The driver only handles individual staking actions. It does **not** include any
timers, strategies or orchestration. See [docs/DRIVER_SCOPE.md](docs/DRIVER_SCOPE.md).

Idempotency details are in [docs/IDEMPOTENCY.md](docs/IDEMPOTENCY.md).
