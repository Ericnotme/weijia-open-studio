> Clean source export: see [EXPORT.md](EXPORT.md) for license scope and differences from the hosted edition.

# 霓虹底牌 · Neon Ante

A standalone Chinese-language poker deckbuilding browser game inspired by the core loop of Balatro. Independently implemented name, interface, content and audio; no original game assets or source code are included. It is not an official port or a complete recreation of the commercial game.

## Playable scope

- 52-card deck, eight-card starting hand, up to five selected cards per play or discard.
- Nine poker hands, correct scoring subsets, ace-low straights, card point values, hand levels, chips and multiplicative scoring.
- 24 original joker definitions with per-card, conditional, economic, growing, degrading and multiplicative effects. Global joker effects resolve left to right; jokers can be reordered or sold.
- Eight antes, small/big/boss blinds (24 total), eight boss modifiers, skip rewards, wins, losses and endless continuation.
- Shops with joker/planet/arcana offers, paid rerolls, three-choice booster packs, and six permanent run vouchers.
- Nine planet upgrades, six arcana effects, and four permanent card enhancements.
- Blind rewards, unused-hand rewards, interest, limited inventory and explicit transaction validation.
- Exact score previews and detailed scoring breakdowns, deck inspection, keyboard input, synthesized optional sounds and responsive layouts.
- Device-local autosave with deterministic RNG state; no account, server persistence, multiplayer or real-money betting.
- Feature-detected WebMCP read, select and play tools using the same game state as the visible interface.

## Architecture

`dist/game.mjs` is the independent deterministic rules engine. `dist/app.mjs` owns browser presentation, input, sound and local storage. `dist/style.css` and `dist/index.html` are the user interface. No runtime dependencies or external asset requests are required. The Site uses static hosting with no build step.

## Validation

- Core assertions passed for nine hands, ace edge cases, wildcard flushes, scoring subsets, joker order, enhancements, boss debuffs, permanent upgrades, RNG restore, invalid-action non-mutation, shop capacity and transaction behavior.
- All 24 blind transitions and endless continuation were exercised with deliberately boosted test hand levels. This verifies state flow, not ordinary-difficulty balance or a normal-play victory.
- DOM simulation passed for start, selection, scoring, payout, purchases, consumables, pack selection, next blind, discards, reference dialogs, keyboard play, save and restart.
- Local asset and DOM ID checks passed; JavaScript syntax validated.
- No real-browser visual QA or Safari-device QA was performed. No supported WebMCP browser context was available; tool registration and valid/invalid actions were tested in DOM simulation only.

## Limitations

This is a complete playable core loop with a curated content set, not the original game's full joker collection, achievements, unlock trees, challenge decks, controller support, localization or platform integration. Original balance and long-term progression are not reproduced in full. Progress is local to the browser and can be lost if site data is cleared.

## Source reference

Balatro, by LocalThunk / Playstack: https://www.playbalatro.com/
