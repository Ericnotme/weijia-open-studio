# Clean source export

Source commit: f5747f2a734581c007ee7df1fe658366c0cbe2b5

Jinniu health-scenario teaching simulator. Uncalibrated synthetic assumptions, not personal medical predictions. The source-export map is explicitly disabled until licensed geography is supplied.

This is a new source snapshot, not Git history or a production-data backup. No GitHub publish or deployment was performed.

## Run

- python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
- Open http://127.0.0.1:4173/

## Packaging changes

- Original-code-only MIT and scope notice added.
- Deployment identity, runtime/cache artifacts and growth hooks excluded.
- Unverified DataV boundary file omitted; map explicitly disabled with on-page notice, no failing fetch. Core scenario calculation remains available. MAP_DATA_URL is an opt-in configuration point for appropriately licensed local data.

## Omitted paths/categories

- .openai/hosting.json
- GROWTH_MEASUREMENT.md
- dist/jinniu.json
- dist/portfolio-growth.js
- dist/robots.txt
- dist/sitemap.xml
- All Git history, production data, credentials, private exports, logs and local runtime state.

## Rights

Original software code: MIT, Copyright 2026 Weijia Xian. Existing vendor and component licenses remain unchanged. Articles, photographs, personal data and datasets are not newly MIT-licensed. Retained research facts/citations and synthetic fixtures are explicitly distinguished in their source modules; research papers, source datasets and model weights are not licensed by this export.

## Verification

Verification results will be recorded in EXPORT-VALIDATION.json. Dependency installation, production access and live paid model requests are intentionally not performed.
