# Clean source export

Source commit: 4ba2971f0b99a434c2060bcb1bdbe49edf1e8670

AI chat-workbench source. Four public interests only; no private chat corpus. Hosted API remains disabled. Optional local inference requires a separately installed local model.

This is a new source snapshot, not Git history or a production-data backup. No GitHub publish or deployment was performed.

## Run

- Requires Node >=22.13.0. npm ci; npm run dev.
- Optional local chat requires Ollama running at 127.0.0.1:11434 with llama3.2:latest already installed; no automatic model pull.
- npm test runs protocol/boundary tests without model or paid API calls.
- Hosted API deliberately returns 503 until separately implemented and authorized; this export does not enable a paid provider.

## Packaging changes

- Original-code-only MIT and scope notice added.
- Deployment identity, runtime/cache artifacts and growth hooks excluded.
- Vite now reads identity-free export-bindings.json. Vendored build hook skips Sites deployment packaging when the excluded hosting identity is absent; original vendor notice retained.

## Omitted paths/categories

- .openai/hosting.json
- docs/VERIFICATION.md
- docs/local-real-model-results.json
- docs/unit-test-results.txt
- All Git history, production data, credentials, private exports, logs and local runtime state.

## Rights

Original software code: MIT, Copyright 2026 Weijia Xian. Existing vendor and component licenses remain unchanged. Articles, photographs, personal data and datasets are not newly MIT-licensed. Retained research facts/citations and synthetic fixtures are explicitly distinguished in their source modules; research papers, source datasets and model weights are not licensed by this export.

Vendored Sites build plugin: build/sites-vite-plugin.LICENSE (MIT). Vendored shadcn stylesheet: vendor/shadcn-tailwind-4.13.0.LICENSE.md. Dependency licenses remain in their packages/lockfile; no node_modules is redistributed. Authentication/header assumptions are described above; this export is not a public-hosting security certification.

## Verification

Verification results will be recorded in EXPORT-VALIDATION.json. Dependency installation, production access and live paid model requests are intentionally not performed.
