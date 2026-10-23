# 兑现 · Exit Pilot / Clock

The default homepage is now **Exit Pilot 0.3**, a free cash-goal exit planner. It converts a target net amount and retained coin floor into a three-stage sell checklist, reconciles manual fills, and rehearses synthetic price paths. It does not place live trades. The previous Clock UI is preserved at `/lab.html`. See `docs/EXIT_PRODUCT.md`.

Clock 0.2 turns a Bitcoin-cycle hypothesis into an explicit, inspectable plan: one simulated buy and one simulated sell per four-calendar-year cycle. It includes a separate legacy 12-word **Bitcoin testnet** wallet lab, a browser app, an iPhone Xcode project, and a paper-only background runner.

**This is a research prototype, not a live auto-trading wallet. No real deposits, withdrawals, exchange orders or transaction broadcasts are implemented. Never import a real wallet's mnemonic or use these keys for real funds.**

## Run on Mac, Windows or Linux

Requires Node.js 24 and npm.

```sh
npm ci
npm test
npm run build
npm start
```

Open http://127.0.0.1:4173. The browser UI is responsive and can also be installed using the browser's Add to Dock / Add to Home Screen feature where available. Browser storage stays on that device. There is no cloud account or synchronization.

## What works

- Editable UTC buy/sell dates, 25/50/100% simulated cash allocation, explicit fees, optional four-calendar-year repetition.
- Paper execution during the selected UTC day using a fresh manual or Coinbase reference price. It is never backfilled to an earlier price. No naked short and no repeated action ID.
- Pause/resume, ledger, JSON export, UTC calendar export and isolated four-year demonstration with editable scenario prices. The demonstration is not a historical backtest.
- BIP39 128-bit / 12-word generation and checksum validation; BIP84 testnet address derivation at `m/84'/1'/0'/0/0`; encrypted local backup, password unlock, locking and test-mnemonic restore.
- PBKDF2-SHA256 600,000 iterations + AES-256-GCM with random salt and IV. BIP39 passphrase is empty; the application password encrypts the local vault and is not a BIP39 passphrase.
- Background/inactivity locking; no mnemonic export in the model-context tool; the model-context tool exposes only the paper account and plan.
- iOS native local notifications, share sheet and background locking via Capacitor. The project bundles local web assets rather than opening a remote website.
- A separate restart-safe, paper-only Node runner. It does not need or accept wallet secrets or API trading credentials.

## Where the rule came from

The user's existing Signal Observatory/CycleWatch project recorded a **candidate** bottom window of 2026-10-05 to 2026-11-16, derived from the cited 2025-10-06 anchor plus 364–406 days. Its next-top reference is **the next actual halving date + 525–546 days**. Both are hypotheses. The original project had not independently verified the price extrema, and the future halving date was not frozen.

Clock retains those references without turning them into an authorized trade. No buy/sell date is preselected, no execution is enabled on first launch, and no future peak date is fabricated. An executable simulation needs user-selected dates. Four calendar years are not exactly 210,000 Bitcoin blocks or a guaranteed price cycle.

- Prior project: https://signal-observatory.weijiaxian.chatgpt.site/
- Reference named in that project: https://bitcoin-daily.com/research/
- Bitcoin BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

## Background paper runner

The webpage cannot promise execution when closed. To run simulations continuously, export a plan from the app, then keep the separate process online:

```sh
npm run clockd -- --config /absolute/path/clock-plan.json --enable-paper
# One check only:
npm run clockd -- --config /absolute/path/clock-plan.json --state runtime/account.json --enable-paper --once
```

The runner fetches a public reference quote only on a due execution day. It persists its own paper ledger, separate from the browser, under `runtime/`. Do not run the browser and runner expecting shared balances. The runner refuses a live mode, uses one exclusive account lock and writes state atomically. If a process is killed abruptly, first verify it is no longer running before removing a stale `.lock` file. Never remove a live process's lock.

`Dockerfile` can run the same process, with a user-owned writable `/data` mount holding the exported plan and account file. No runner has been deployed or activated on a remote always-on server as part of this prototype.

## iPhone and App Store

The generated Xcode project is at `ios/App/App.xcodeproj`. On a Mac with a compatible Xcode:

```sh
npm ci
npm run ios:sync
npm run ios:open
```

Choose your own signing team and unique bundle identifier, build to a simulator, then validate a real device. No signing certificate, App Store Connect credential, organization account or production entitlement is included. This environment generated the project and synchronized native plugins, but did not compile/sign an iOS binary or perform device QA. Nothing has been submitted to App Store/TestFlight.

Apple's cryptocurrency-wallet guideline 3.1.5(i) requires organization enrollment for apps facilitating virtual-currency storage. Exchange functionality has jurisdiction/permission conditions under 3.1.5(iii). Guideline 4.2 concerns minimum native utility. This prototype's notifications and share integration do not guarantee approval. See `docs/APP_STORE.md` and Apple's current guidelines before any submission.

## GitHub

The source package is ready for a new **dedicated** `clock-lock` repository. Existing unrelated repositories were not modified. The connected GitHub interface can write existing repositories but did not expose new-repository creation in this session; the package has not been pushed to a GitHub repository.

After creating an empty repository, add the unpacked source, then commit and push using your normal GitHub workflow. Start private while reviewing the prototype; change visibility deliberately when ready. `.env`, runtime state and wallet data are excluded. GitHub Actions runs the strategy/wallet tests and web build.

## Verification and limits

`npm test` covers timing boundaries, exactly one buy and sell, stale/future quotes, no backfills, no naked shorts, four-year anniversary/leap-day handling, fees and loss scenarios, mnemonic generation/checksum/restore, encryption randomness, wrong passwords and tamper rejection.

The product needs further development before real funds: a selected settlement asset and exchange/DEX route, jurisdiction and provider eligibility, user authorization/revocation, signing and custody architecture, operational monitoring, reconciliation, fees/slippage controls, independent security review and incident recovery. These are unimplemented requirements, not hidden live features. Wallet address generation alone cannot exchange BTC for dollars.

## Source map

- `src/strategy.mjs` — deterministic cycle and simulated fill engine.
- `src/wallet.mjs` — testnet address and encrypted test-vault functions.
- `src/app.mjs`, `dist/index.html`, `dist/style.css` — browser/native UI.
- `scripts/clockd.mjs` — independent paper runner.
- `ios/` — generated iPhone app project.
- `tests/` — meaningful strategy and wallet checks.
- `docs/` — architecture, release prerequisites and review notes.

Project code is MIT licensed. Bundled dependencies retain their own licenses; see `dist/THIRD_PARTY_NOTICES.txt`. The application's encryption integration has not been independently audited, even where its underlying libraries have upstream audits.

## Decision lab added in 0.2

- First-screen comparisons of holding, equal monthly purchases from one upfront capital pool, full calendar timing, and a core/satellite split.
- Five expressly synthetic monthly stress paths, 4/8/12-year horizons, timing shifts, editable buy/sell month, fees/slippage and simulated software cost. No success probabilities or predictive return claims.
- Optional strict `date,price` monthly CSV import (13–241 contiguous monthly points). No server upload; provenance is unverified.
- Equal starting capital, equal evaluation endpoints, terminal liquidation for every benchmark. Monthly drawdown includes costs but misses intramonth events. No interest, tax, inflation or liquidity model.
- Local snapshots and decision journal with reason, review condition/date, and JSON export. No claim of immutable registration or automatic prospective tracking.
- Paper JSON import validates before replacement and always restores paused. The test wallet is removed from the main bundle and retained separately.

`src/lab.mjs` contains deterministic math; `src/lab-ui.mjs` the workspace; `src/testnet.mjs` the preserved lab. The webpage is static, and no payment or live trading service has been enabled.

## Exit Pilot source

- `src/exit-engine.mjs`: integer net-proceeds sizing and goal reconciliation.
- `src/exit-app.mjs`, `dist/index.html`, `dist/exit.css`: goal, order checklist, scenarios and manual fill UI.
- `tests/exit.test.mjs`: arithmetic, lifecycle and validation cases.
