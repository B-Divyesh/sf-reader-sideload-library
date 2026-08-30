# Reader Sideload Library — repair handoff

## Result

Release-blocking findings from verifier commit `b47cacbfe1ed12e8d8ff8f567cf04aec5fcde004` are repaired for version `0.1.1`.

## Repairs

- Added `.factory/claims.json` with eight independently runnable claims and exact regression commands.
- Added `/demo/`, powered by the actual desktop UI, with four sample books, an ordered collection, and two highlights.
- Isolated demo state under `demo:rsl:library-state:v1`; reset and exit controls never touch real catalogue state.
- Rewrote the first screen to name e-ink reader owners, the concrete sideloading job, the sample action, and three plain facts.
- Removed every purchase link while the production Field checkout is unavailable. Existing license restore remains available.
- Replaced UTF-8 replacement decoding with lopdf’s PDF text-string decoder for UTF-16BE, UTF-8 BOM, and PDFDocEncoding.
- Added clean Unicode search and numbered filename previews for `Field Notes 03 — 秋`.
- Added a designed 404 page, route metadata, canonical/Open Graph/Twitter tags, social image, and Apple touch icon.
- Added Azure Static Web Apps CSP, Permissions-Policy, 404 override, and immutable hashed-asset cache rules.
- Raised the cited links and Copy buttons to the 44px touch baseline.
- Reconciled Field terms to the current major version and documented that new purchases are paused.
- Documented the sample sandbox and completed the plain-language copy audit.

## Verification evidence

Run from the repository root with Node.js 22+, Rust stable, and the Linux Tauri prerequisites listed in `README.md`.

- `npm ci`: passed; 68 packages; zero audit vulnerabilities.
- `npm test`: passed; 4 Vitest, 6 Rust, and 40 Playwright tests across desktop and mobile Chromium.
- Every command in `.factory/claims.json`: passed independently.
- `npm run check`: passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `npm audit --audit-level=high`: passed with zero vulnerabilities.
- `npm run build`: passed; produced `dist/`, `dist/app/`, `dist/site/`, and `dist/site/demo/`.
- Site initial JavaScript: 2.94 KB raw; site CSS: 12.15 KB raw; loaded WOFF2 fonts: 88.27 KB; mobile hero: 79,982 bytes.
- `CI=true npm run tauri build`: passed for version 0.1.1; Linux deb, rpm, and AppImage were produced.
- Extracted Debian consumer: no unresolved shared libraries; Xvfb launch stayed alive through the eight-second smoke timeout.
- Local package SHA-256: deb `d2cbb2afa3685ed2c07d38c90c0c73fe3ddb9cd70c866bc8b0b4a5b2dbab8588`; AppImage `0d8753ac877343c5b52a0d027074acad7a629cd57b521b7c7855a9ee8d84d7b2`.
- Local `verify-url.sh` for `/` and `/demo/`: title, `lang`, one h1, main landmark, alt text, button names, and console all passed. Reports are in `.factory/evidence/`.
- Playwright axe: zero serious or critical issues on home, demo, privacy, terms, 404, desktop app, dark mode, desktop, and 390px mobile.
- Keyboard: skip link, app tab arrow keys, dialog controls, and all task controls passed with visible focus.
- Offline/update: a fresh browser context installed the service worker, switched offline, and reloaded the isolated sample catalogue.
- Privacy: the complete landing and demo flow made only same-origin requests in local verification; production release lookup is limited to `api.github.com`.
- Live Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100, LCP 1.8 s, CLS 0.031, TBT 0 ms, transfer 177 KiB. Summary is `.factory/evidence/lighthouse-summary.json`.
- PDF regression: generated UTF-16 metadata scanned as exact title `Field Notes 03 — 秋` and author `Zoë Reader`; search and sync preview contained no replacement character.
- USB regression: source and destination bytes matched, the manifest existed, and the second copy reported unchanged.

## Deployment and release

- Static deploy root: `dist/site`.
- GitHub release workflow: `.github/workflows/release.yml`, triggered by tag `v0.1.1`.
- GitHub Actions run `33298420454` passed quality, Linux, Windows, macOS Intel, macOS ARM64, and publish jobs: `https://github.com/B-Divyesh/sf-reader-sideload-library/actions/runs/33298420454`.
- Published release: `https://github.com/B-Divyesh/sf-reader-sideload-library/releases/tag/v0.1.1` with dmg, MSI/exe, AppImage/deb/rpm, `latest.json`, and `SHA256SUMS`.
- Published `latest.json` has all four required platform records: macOS ARM64, macOS Intel, Windows x64, and Linux x64.
- Independently downloaded published deb SHA-256 `2a30665ded3431577159c7b84796b7c651947587b8c78f5fc9e16e5bb63cc609` matches `SHA256SUMS` and GitHub’s digest.
- The live detected Linux button resolves to the real v0.1.1 AppImage, reports version 0.1.1, and produces no console error.
- Production deployment completed on `sf-reader-sideload-library`; custom URL is `https://reader-sideload-library.sociobot.in`.
- Live `/` is byte-identical to `dist/site/index.html`: SHA-256 `86fbfcd6cf7f617dbb0b0e5058cf51bf2d638d24f8b1b2ee07df073a1641ca07`.
- Live `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; `/definitely-missing` returns the designed page with HTTP 404.
- Live HTML sends CSP and Permissions-Policy; hashed assets send `Cache-Control: public, max-age=31536000, immutable`.
- Live `verify-url.sh` reports zero console errors for home and demo; reports are in `.factory/evidence/live-*/verify.json`.

## Known gaps

- Linux, macOS, and Windows packages remain unsigned. Platform trust prompts are documented.
- Physical-reader compatibility still merits hardware checks across Kobo, PocketBook, reMarkable, and generic USB storage.
- WebDAV should be smoke-tested against each service before naming that service. New purchases remain paused until billing enables this product.
- PDF ink annotations and vendor-private note formats still require vendor-specific extraction or OCR.

## Needs operator action

- For trusted signed releases, configure `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.
- Enable the Field product in the Sociobot billing engine before restoring any checkout link.
