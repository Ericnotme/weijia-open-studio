# Clean source export

Source commit: 278e445e78fe8c189200e958299dd66ab9edec51

Care Compass: source for a health-record interface with account-isolated D1/R2 storage. This export contains empty schema and code, never records or uploads. Public self-hosting requires a trusted authentication gateway; do not trust client-supplied identity headers.

This is a new source snapshot, not Git history or a production-data backup. No GitHub publish or deployment was performed.

## Run

- Requires Node >=22.13.0. Install locked dependencies yourself with npm ci, then npm run dev.
- Use the loopback local preview only. Sign in using /signin-with-chatgpt?return_to=/ (synthetic local identity).
- After dependencies/build: npm run build, then apply the checked-in drizzle SQL to a new local DB using the generated Wrangler config before saving records.
- Do not deploy directly to a public origin: configure your own trusted identity gateway and empty D1/R2 resources; never accept browser-provided oai-authenticated-user-* headers.

## Packaging changes

- Original-code-only MIT and scope notice added.
- Deployment identity, runtime/cache artifacts and growth hooks excluded.
- Vite now reads identity-free export-bindings.json. Vendored build hook skips Sites deployment packaging when the excluded hosting identity is absent; original vendor notice retained.

## Omitted paths/categories

- .openai/hosting.json
- GROWTH_MEASUREMENT.md
- public/portfolio-growth.js
- tsconfig.tsbuildinfo
- All Git history, production data, credentials, private exports, logs and local runtime state.

## Rights

Original software code: MIT, Copyright 2026 Weijia Xian. Existing vendor and component licenses remain unchanged. Articles, photographs, personal data and datasets are not newly MIT-licensed. Retained research facts/citations and synthetic fixtures are explicitly distinguished in their source modules; research papers, source datasets and model weights are not licensed by this export.

Vendored Sites build plugin: build/sites-vite-plugin.LICENSE (MIT). Vendored shadcn stylesheet: vendor/shadcn-tailwind-4.13.0.LICENSE.md. Dependency licenses remain in their packages/lockfile; no node_modules is redistributed. Authentication/header assumptions are described above; this export is not a public-hosting security certification.

## Verification

Verification results will be recorded in EXPORT-VALIDATION.json. Dependency installation, production access and live paid model requests are intentionally not performed.
