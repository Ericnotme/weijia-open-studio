# Clock architecture and next production decision

Browser / iOS local asset bundle → pure cycle evaluator → paper ledger.

Test mnemonic → BIP39 seed → BIP32 testnet BIP84 key → tb1 address.

Local password → PBKDF2-SHA256 → AES-GCM test vault in local device storage.

Exported non-secret plan → separate Node paper runner → public quote → atomic paper ledger.

These paths are deliberately independent: generating or restoring a test wallet does not arm a strategy, move funds or alter the paper balance. The node runner receives no seed, private key, wallet address or exchange credential.

## Why a real version needs another architecture decision

Native BTC cannot turn itself into fiat merely because a date arrives. A production version must choose a supported exchange/custodian or an on-chain representation/settlement route. These choices have different custody, bridge, liquidity, eligibility and security consequences. They cannot be safely substituted for one another without the user's choice and provider eligibility checks.

A device-local noncustodial key cannot continuously sign when a phone is powered off. A production system needs clearly bounded delegated authority or user confirmation when due, plus an always-on executor and a revocation/recovery path. No broad signing permission is implemented here.

A four-year repeating schedule is different from a future low/high predictor. Clock's reference windows remain research hypotheses. Calendar repetition does not follow an exact 210,000-block halving boundary. The strategy engine operates only on dates explicitly selected by the user, with at most a one-day execution window and no retrospective fills.

## Live implementation backlog (not built)

- Select chain, settlement asset, custody model, provider and target distribution regions.
- Independent threat model and security review; native secure storage; update authenticity and key recovery.
- Explicit bounded authorization, order amount limits, kill switch and durable idempotency.
- Real quotes, order acknowledgement, partial fills, settlement, fees, slippage, failed-order handling and reconciliation.
- A monitored always-on runner, availability targets, clock behavior, backups and alerts.
- Qualified review of applicable financial-service and distribution requirements.

There is no real-fund endpoint or hidden live-mode switch in this release.

## 0.2 decision tooling

Price path (synthetic, or local monthly CSV) → equal-budget benchmark simulator → monthly equity/cost table → local snapshot/export.

The primary bundle no longer imports any key-generation or wallet library. The old testnet bundle remains a separate entry on the same origin to preserve recovery. There is no isolation claim. The no-custody product remains useful even when the timing hypothesis fails: it exposes relative underperformance and cost drag and preserves the rationale for decisions. A subscription remains an unvalidated business hypothesis; the UI simulates costs but does not collect payment.
