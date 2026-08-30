# Reader Sideload Library — repair 2 handoff

## Result

Candidate `64f731e0675f8f05593d4f4c9df6e4bb0c80f615` is repaired as version `0.1.2`. The completed product findings and v0.1.1 behavior remain intact.

## Failure reproduced

The factory deploy configuration runs this exact clean command:

```sh
npm ci && npm test && npm run build:site
```

On the unmodified candidate, `npm test` ran unrestricted `cargo test`. Cargo selected the default Tauri desktop dependency graph and failed in `glib-sys v0.18.1` because the static worker has no `glib-2.0.pc`:

```text
error: failed to run custom build command for `glib-sys v0.18.1`
Package 'glib-2.0', required by 'virtual:world', not found
```

The failure was a test-boundary defect. Rust catalogue and transfer tests do not need Tauri, GTK, GLib, or WebKit, but the manifest made those dependencies unconditional.

## Repair

- Added a default `desktop` Cargo feature for Tauri and the dialog plugin.
- Made the native binary require `desktop`, so installer builds keep their full behavior.
- Gated Tauri command attributes, native startup, and the Tauri build script behind `desktop`.
- Changed Rust core tests to run with `--no-default-features --lib`.
- Added `scripts/check-rust-core-isolation.mjs`, which fails if Tauri, GTK, GLib, or WebKit re-enters the core test graph.
- Updated all three native claim commands to use the isolated Rust test path.
- Advanced package, Cargo, Tauri, site, manifest, and release-workflow versions to `0.1.2`.
- Kept the original desktop app artifact class, Tauri stack, static landing deployment, demo, claims, visual system, and privacy model.

## Verification evidence

Run from the repository root with Node.js 22+ and Rust stable. Platform GUI packages are needed only for native desktop development and packaging.

- Cold Rust target plus exact factory command: passed.
- `npm test`: passed; 4 Vitest, 6 Rust, and 40 Playwright tests across desktop and 390px mobile Chromium.
- `npm run test:rust-core`: passed; dependency regression reported no Tauri or Linux GUI libraries.
- Every command in `.factory/claims.json`: passed independently; logs are under `/work/.evidence/claims/` in the worker evidence.
- `npm run check`: passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `npm audit --audit-level=high`: passed with zero vulnerabilities.
- `npm run build`: passed and produced `dist/`, `dist/app/`, and `dist/site/`.
- Local `verify-url.sh` for `/` and `/demo/`: title, `lang`, one h1, main landmark, alt text, button names, and console all passed.
- Playwright axe: zero serious or critical findings on landing, demo, privacy, terms, 404, desktop shell, dark mode, desktop, and mobile.
- Keyboard, 390px reflow, visible focus, 44px targets, reduced motion, offline demo reload, and demo storage isolation passed in Playwright.
- Privacy claim: the complete landing and demo flow allowed only same-origin requests and the documented GitHub releases API.
- Release fixture: staging normalized four platform assets; `latest.json` selected macOS ARM64, macOS Intel, Windows x64, and Linux x64; every generated SHA-256 entry verified.
- Shell installer syntax and all three release Node scripts passed syntax checks.
- Site initial JavaScript is 2.94 KB raw; CSS is 12.15 KB raw; loaded WOFF2 fonts total 88.27 KB; mobile hero is 79,982 bytes.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100, LCP 1.4 s, CLS 0.031, TBT 0 ms, transfer 177 KiB.

## Release and deployment

- Static deploy root: `dist/site`.
- GitHub release workflow: `.github/workflows/release.yml`, triggered by tag `v0.1.2`.
- GitHub Actions run `33299554556` passed quality, macOS ARM64, macOS Intel, Windows x64, Linux x64, and publish jobs: `https://github.com/B-Divyesh/sf-reader-sideload-library/actions/runs/33299554556`.
- Published release: `https://github.com/B-Divyesh/sf-reader-sideload-library/releases/tag/v0.1.2`.
- Exact assets: ARM64 and Intel `.dmg`, Windows `.msi` and `.exe`, Linux `.AppImage`, `.deb`, and `.rpm`, plus `latest.json` and `SHA256SUMS`.
- `latest.json` reports version `0.1.2` and all four required platform records with v0.1.2 URLs.
- Independently downloaded `Reader.Sideload.Library_0.1.2_amd64.deb` SHA-256 `92251b3eecbad4cf40a6aee302bd2995204ca2f708a29b09dbbd7485f5583528` matches both `SHA256SUMS` and GitHub metadata. Its package metadata reports version `0.1.2` and architecture `amd64`.
- The one-line Linux installer completed in an isolated temporary home. Its installed AppImage SHA-256 `9ede42f783708549528651d677e93ec329086fb45cff9ae9b77d35fffa566aa8` matches `latest.json`.
- Production deployment updated only `sf-reader-sideload-library`; custom URL is `https://reader-sideload-library.sociobot.in`.
- Live `/` is byte-identical to `dist/site/index.html`: SHA-256 `85b7b3cf82f701e77c10bd1c0ea354c9f26a4aafe3cefb10e78f9db70dc42c39`.
- Live `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; `/definitely-missing` returns the designed page with HTTP 404.
- Live HTML sends CSP and Permissions-Policy; hashed assets send `Cache-Control: public, max-age=31536000, immutable`.
- Live `verify-url.sh` reports zero console errors for home and demo.
- A fresh live browser resolved the Linux button to the exact v0.1.2 AppImage, showed version 0.1.2, contacted only the site and GitHub API, and reopened the four-book demo offline.

## Known gaps

- Linux, macOS, and Windows packages remain unsigned. Platform trust prompts are documented.
- Physical-reader compatibility still merits hardware checks across Kobo, PocketBook, reMarkable, and generic USB storage.
- WebDAV should be smoke-tested against each service before naming that service. New purchases remain paused until billing enables this product.
- PDF ink annotations and vendor-private note formats still require vendor-specific extraction or OCR.

## Needs operator action

- For trusted signed releases, configure `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.
- Enable the Field product in the Sociobot billing engine before restoring any checkout link.
