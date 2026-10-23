# Exit Pilot — cash-goal exit planner

Research and implementation date: 2026-09-22.

## User task

“I want to recover a specific amount of cash while keeping at least a fixed amount of my original coins. Work out my sell quantities, show when my constraints conflict, and update what remains after actual fills.”

Target user hypothesis: a spot holder with an existing position and a cash-use goal who currently converts that goal into percentage orders with spreadsheets or manual arithmetic. Neither the size of this segment nor willingness to pay has been established. This is a candidate differentiator, not a validated killer feature.

## Competitive findings

- 3Commas SmartTrade already offers split targets, step sell, simultaneous TP/SL, and trailing orders: https://3commas.io/smart-trade
- Cryptohopper already offers trailing sell/buy and automated re-entry: https://www.cryptohopper.com/features/trailing-orders
- DeFi Saver provides automated position and leverage management: https://www.defisaver.com/

Consequently, ordinary split take-profit is not an unmet feature. The hypothesis tested here is whether a simpler complete workflow — cash goal, fixed retained coin floor, net cost calculation, remaining-goal reconciliation — removes meaningful work. Public feature pages alone do not prove that competitors cannot reproduce this workflow or that no competing product implements it.

## Delivered

- BTC, ETH or SOL single-asset spot planning with explicit initial units, total cash goal and prior recovered cash.
- Three user-priced stages with cash-goal weights. Integer cents and 1e-8 display units; fixed fee, percentage fee and adverse slippage assumptions.
- Fixed retained floor based on plan-creation units. Feasibility detection and blocked order-list export for conflicts.
- Manual fill ledger: actual net proceeds, partial-fill reconciliation, overfill credit and goal completion. An observed reserve breach is recorded as a fact and blocks new generated orders.
- Four synthetic path rehearsals. Thresholds trigger only at observed path points. Simulated actions never enter the actual-fill ledger.
- CSV planning checklist, canonical JSON backup/restore and device-local persistence.
- Optional public reference-price fetch with honest failure handling.
- Previous cycle lab preserved at /lab.html and testnet lab at /testnet.html.

## Not delivered / claims not made

No live exchange connection, on-chain signer, deposit, background auto-execution, notification delivery, tax calculation, market prediction, account synchronization or payment. The CSV is an explanatory checklist, not a native exchange import/API format. A cash goal is not a guarantee. Reference USD values do not imply a completed fiat withdrawal, stablecoin safety or available liquidity. Default inputs are examples, not asset-allocation or price recommendations.

## Validation

Nine new focused tests cover net sizing, smallest-unit rounding, reserve constraints, overfill and partial-fill accounting, reserve-breach handling, gap/fall simulation behavior, and backup validation. All 24 repository tests pass. Static DOM references and local routes were checked. The managed environment does not provide a compatible browser preview for this plain static application; responsive CSS was implemented but no browser visual QA was performed.

## Next evidence to gather

Give the free workflow to holders with existing positions. Observe whether they can create a correct plan without help, whether they export or save it, and whether they return to reconcile real fills. Ask about their current substitute and the last time the task caused friction. Do not equate page views, compliments or demo clicks with demand, or build live execution on the assumption that this hypothesis is already validated.
