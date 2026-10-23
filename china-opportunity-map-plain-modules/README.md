# china-opportunity-map-plain-modules

Partial module export, NOT the full website or product. Synthetic fixtures only.

Requires Node.js 24+. No dependency install is needed. Run `npm test`.

No UI, maps, district datasets, geographic polygons, original city calibration, photos or production settings. City types narrowed to a synthetic city; model calibration is synthetic. Inverse normal approximation replaced with original quadrature/bisection implementation to avoid uncertain third-party implementation provenance. Tests use Node native type stripping; JazzRoom constructor rewritten equivalently to erase types. Original interactive prompt strings are software UI, not personal essays.

MIT applies to original code only; no third-party data license is granted. No performance, investment or policy claims are established by these tests. No browser UI is included.
