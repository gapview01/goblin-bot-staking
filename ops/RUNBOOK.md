# Runbook (Pilot)

## Local (DEV)
1) Ensure Solana/Anchor toolchain is installed (no code yet).
2) Use devnet only for this pilot.
3) When code is added, build & test here before any deploy.

## Environments
- DEV: devnet (sandbox)
- STAGE: testnet (rehearsal)
- PROD: mainnet-beta (not used during pilot)

## Rollback
- Revert to previous tag (e.g., pilot-v0.1.0) and redeploy to DEV.
