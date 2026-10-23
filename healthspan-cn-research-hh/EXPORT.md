# Clean source export

Source commit: 31a2e809885338f68bea950154b67b570cb6a3d1

Healthspan China research-scenario interface. Static, no patient records; food values remain unverified-source labels rather than personalized predictions.

This is a new source snapshot, not Git history or a production-data backup. No GitHub publish or deployment was performed.

## Run

- python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
- Open http://127.0.0.1:4173/

## Packaging changes

- Original-code-only MIT and scope notice added.
- Deployment identity, runtime/cache artifacts and growth hooks excluded.
- Unverified raster touch icon omitted; existing SVG favicon retained.

## Omitted paths/categories

- .openai/hosting.json
- dist/assets/icon-180.png
- All Git history, production data, credentials, private exports, logs and local runtime state.

## Rights

Original software code: MIT, Copyright 2026 Weijia Xian. Existing vendor and component licenses remain unchanged. Articles, photographs, personal data and datasets are not newly MIT-licensed. Retained research facts/citations and synthetic fixtures are explicitly distinguished in their source modules; research papers, source datasets and model weights are not licensed by this export.

The evidence modules retain source links and study populations/limitations. Public study summaries and the healthspan food metadata are excluded from the root MIT grant; source-by-source redistribution rights have not been independently certified. Healthspan food entries remain marked pending_source_check with no effect values.

## Verification

Verification results will be recorded in EXPORT-VALIDATION.json. Dependency installation, production access and live paid model requests are intentionally not performed.
