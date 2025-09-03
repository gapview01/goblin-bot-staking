# Idempotency & Memos

Each transaction accepts a memo used as an idempotency key. Before
broadcasting, the driver scans recent signatures for an existing memo. If found,
that signature is returned instead of resubmitting.

A local in-memory lock also prevents concurrent reuse of the same memo, avoiding
duplicate sends when retries occur in parallel.
