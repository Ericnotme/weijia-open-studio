# Clean source export

Source commit: 481e911a814d8878811d28062436d415e182eb0a

Static visit preparation and synthetic-only research engineering scaffold. Not a diagnosis or validated model.

This is a new source snapshot, not Git history or a production-data backup. No GitHub publish or deployment was performed.

## Run

- python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
- Open http://127.0.0.1:4173/

## Packaging changes

- Original-code-only MIT and scope notice added.
- Deployment identity, runtime/cache artifacts and growth hooks excluded.
- Downloadable scaffold ZIP rebuilt from reviewed synthetic-only source with original-code license/scope included; old QA-result JSON excluded.

## Omitted paths/categories

- .openai/hosting.json
- tests/local-qa-result.json
- All Git history, production data, credentials, private exports, logs and local runtime state.

## Rights

Original software code: MIT, Copyright 2026 Weijia Xian. Existing vendor and component licenses remain unchanged. Articles, photographs, personal data and datasets are not newly MIT-licensed. Retained research facts/citations and synthetic fixtures are explicitly distinguished in their source modules; research papers, source datasets and model weights are not licensed by this export.

## Verification

Verification results will be recorded in EXPORT-VALIDATION.json. Dependency installation, production access and live paid model requests are intentionally not performed.
