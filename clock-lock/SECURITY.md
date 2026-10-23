# Security scope

Clock 0.2 is a local decision lab and paper-trading tool. The main entry has no wallet module, wallet connection, mnemonic field, exchange key field, transaction signer or real-fund execution endpoint. It does not read the legacy vault. Do not deposit real assets, import real mnemonics, or store exchange API credentials in it.

The app never transmits a mnemonic, password or derived wallet address. The test vault is encrypted locally. Its password is not persisted. The app locks on backgrounding and after five minutes of inactivity. JavaScript strings cannot be guaranteed erased from managed runtime memory, and browser local storage is not a hardware keystore. A malicious local script, compromised delivery, extension or device can defeat browser-level protection. No independent product security audit has been completed.

Native builds currently use the same encrypted test vault in WKWebView storage; they do not claim Secure Enclave custody or production key management. True background trading is not implemented on iOS. The separate Node runner is paper-only and cannot sign or broadcast blockchain transactions.

No private user credentials belong in bug reports. Report reproducible issues with a newly generated test wallet and fictional funds. Never publish the mnemonic itself. Production deployment must add independent signing/custody review, provider authorization, transaction reconciliation and recovery testing before any live funds are enabled.

## 0.2 product boundary

The legacy test-wallet lab is retained at `/testnet.html` to preserve test-wallet recovery. It shares the same web origin and encrypted vault key as before: separating entry points is NOT origin isolation and does not make this a production wallet. A compromised same-origin delivery can still alter the page or read origin storage. Never enter a real mnemonic anywhere on this site.

Main and legacy entries have explicit document CSPs. Main quote requests allow Coinbase; the legacy page has `connect-src none`. These reduce accidental network surfaces and script injection exposure in ordinary operation, but an attacker controlling delivery can replace policies. These are not independent audit results.

No strategy, hardware wallet or access-control architecture guarantees returns. The decision lab has synthetic paths and optional user-imported monthly data, not a verified track record. JSON snapshots have local timestamps, not immutable or independently witnessed registration.

Backup import only accepts validated paper accounts/plans, strips unknown top-level properties and restores paused. No secret vault data is included in plan, experiment or journal exports. Data and journal persistence are local only. Clearing browser storage removes them; export for durable user-controlled copies.

## 0.3 exit planner

The default homepage is a single-asset goal planner with a manual-fill ledger. It has no wallet, signer, exchange key, live order, payment or background execution path. The local key `clock.exit.v1` is distinct from the previous cycle account and test vault. Restored files are validated and canonicalized; unknown fields are discarded. Exports never include wallet state. The price provider is called only by an explicit user action. Returned prices are references, not guaranteed executable quotes.
