# Staking Driver Scope

This proof-of-concept driver performs basic Marinade interactions:
- stake SOL for mSOL
- instant or delayed unstake
- claim delayed tickets
- guarded SOL transfers

It intentionally omits orchestration, scheduling and strategy logic. Higher level
components must handle timers, batching and policy decisions.
