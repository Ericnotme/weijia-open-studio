# Clean source export

Source commit: d168a13d391e77b25ad803adc8eacb164008f586

Offline synthetic quantitative research and paper-simulation source. Inspect research/src/ for the actual engines and optional, separately opted-in API adapter. No real market data, private runtime logs or credentials.

This is a new source snapshot, not Git history or a production-data backup. No GitHub publish or deployment was performed.

## Run

- Static: python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
- Engine tests: cd research && npm test
- Rebuild: cd research && npm run build (generates research/dist/index.html); copy this to root dist/index.html only when intentionally updating the static entrypoint.
- Optional paid API CLI is not run or enabled by this export; see research/docs/openai-provider.md.

## Packaging changes

- Original-code-only MIT and scope notice added.
- Deployment identity, runtime/cache artifacts and growth hooks excluded.
- Expanded existing fanshi-research-source.zip into research/ with its original MIT license. Its recovered generated HTML initially matched current Site dist/index.html. The nested research build omits its self-download link because sources are already present; the main dist entrypoint retains working archive downloads. Both downloadable source ZIP names now contain the same regenerated, clean latest source and existing MIT notice; no legacy archive snapshot is copied.

## Omitted paths/categories

- .openai/hosting.json
- All Git history, production data, credentials, private exports, logs and local runtime state.

## Rights

Original software code: MIT, Copyright 2026 Weijia Xian. Existing vendor and component licenses remain unchanged. Articles, photographs, personal data and datasets are not newly MIT-licensed. Retained research facts/citations and synthetic fixtures are explicitly distinguished in their source modules; research papers, source datasets and model weights are not licensed by this export.

Existing FanShi MIT license and copyright are preserved at research/LICENSE and within both regenerated source ZIPs. The existing package is not relicensed under the new root copyright.

## Verification

Verification results will be recorded in EXPORT-VALIDATION.json. Dependency installation, production access and live paid model requests are intentionally not performed.
