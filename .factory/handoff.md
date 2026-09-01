# Reader Sideload Library — repair 3 handoff

## Result

Version `0.1.3` repairs every release blocker in verifier report commit `8ff1f3e65c6eea9f9c928e12e47654b90458e03a` for candidate `82950fa5c3cdcac7dd71a396170e176b92ac6407`.

The Tauri 2 desktop app remains the product artifact. The static site remains the deployment artifact. Existing catalogue, collection, USB, highlights, demo, offline, and installer behavior is preserved.

## Failure reproduced

The candidate advertised privacy and transfer behavior that was not fully present in `.factory/claims.json`. An exact phrase-to-claim comparison reported all eight reviewed phrases as `MISSING`: local library storage, no product account or cloud catalogue, no saved WebDAV password, complete USB-copy guarantees, recursive scan behavior, WebDAV HTTPS and credential handling, supported highlight formats, and no analytics/telemetry/CDN runtime requests.

The app also labelled WebDAV as a paid Field feature and disabled it without an existing license. Checkout remained paused. A new user therefore had no route to set up WebDAV, test the connection, or recover from a bad endpoint or app password.

## Repair

- Replaced the eight-claim inventory with 16 specific, observable claims and a one-to-one marker check.
- Added exact browser, native-core, and release-fixture coverage for every claim.
- Made WebDAV a free core tool. It no longer needs a product license or account.
- Added a first-use guide, a connection check, HTTPS enforcement, app-password guidance, timeout handling, disabled redirects, and recovery messages for common WebDAV failures.
- Kept WebDAV address, username, and password out of browser storage. The password field clears after every check or sync attempt.
- Added a local WebDAV protocol fixture that proves `PROPFIND`, authenticated `MKCOL`, encoded paths, and exact uploaded bytes without contacting a real service.
- Added a staged USB-copy regression that simulates a connection failure and proves the existing destination remains unchanged.
- Added nested EPUB/PDF scan fixtures covering title, author, series, cover state, protected-PDF exclusion, and unrelated-file exclusion.
- Added Markdown, JSON, KOReader sidecar, and embedded PDF-annotation import fixtures.
- Narrowed site, app, privacy, terms, and README wording to the behavior the tests prove.
- Advanced package, Cargo, Tauri, release workflow, site, and service-worker versions to `0.1.3`.

The verifier found that the paid WebDAV route was impossible for new users. Rather than preserve an unusable gate or access an out-of-scope billing service, this repair makes WebDAV free. Previously licensed users retain the feature; the obsolete local license cache is removed on normal startup.

## Local verification evidence

Run from the repository root with Node.js 22+ and Rust stable. Native Linux packaging also needs the packages listed in `README.md`.

- Clean `npm ci`: passed; 68 packages installed and 0 vulnerabilities.
- `npm test`: passed; 16/16 claim mappings, 5 Vitest tests, 10 Rust tests, and 44 Playwright tests across desktop and 390 px mobile Chromium.
- Every command in `.factory/claims.json`: passed independently.
- `npm run check`: passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed.
- `npm audit --audit-level=high`: passed with 0 vulnerabilities.
- `npm run build`: passed and produced `dist/`, `dist/app/`, and `dist/site/`.
- `CI=true npm run tauri build`: passed and produced AppImage, Debian, and RPM bundles for version `0.1.3`.
- Factory `verify-url.sh` on the local production site: HTTP 200, one h1, `lang`, main landmark, image alternatives, button names, and 0 console errors.
- Playwright axe: 0 serious or critical findings on landing, demo, privacy, terms, 404, desktop shell, dark mode, desktop, and mobile.
- Keyboard order, visible focus, 390 px reflow, 44 px targets, reduced motion, offline demo reload, and demo storage isolation passed in Playwright.
- The privacy E2E serves the local build through the production hostname, mocks GitHub, and proves the release API is the only third-party request; the cookie jar remains empty.
- Local Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100, LCP 2.12 s, CLS 0.028, TBT 0 ms.
- Site initial JavaScript is 2.94 KB raw / 1.35 KB gzip. App initial JavaScript is 20.44 KB raw / 7.62 KB gzip. Site CSS is 12.15 KB raw / 3.36 KB gzip. Loaded WOFF2 fonts total 88.27 KB. The mobile hero is 79,982 bytes.
- Local Linux bundles: AppImage 79,821,304 bytes, Debian 5,003,184 bytes, RPM 5,003,600 bytes.

## Release and deployment

- Static deploy root: `dist/site`.
- GitHub release workflow: `.github/workflows/release.yml`, triggered by tag `v0.1.3`.
- Production deployment updated only `sf-reader-sideload-library`; custom URL is `https://reader-sideload-library.sociobot.in`.
- Live `/` is byte-identical to `dist/site/index.html`: SHA-256 `631e771a77679d9bff4998975cf15f338d1ba133e0a96f61c02551182cdfd9b2`.
- Live `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; `/definitely-missing` returns the designed page with HTTP 404.
- Live HTML sends CSP and Permissions-Policy; hashed assets send `Cache-Control: public, max-age=31536000, immutable`.
- Live factory `verify-url.sh` reports 0 console errors for home and demo.
- Live Lighthouse mobile: performance 98, accessibility 100, best practices 100, SEO 100, LCP 2.17 s, CLS 0.025, TBT 0 ms, total transfer 177.2 KiB.
- GitHub release and checksum evidence will be added after the tagged workflow finishes.

## Known gaps

- Linux, macOS, and Windows packages remain unsigned. Platform trust prompts are documented.
- Physical-reader compatibility still merits hardware checks across Kobo, PocketBook, reMarkable, and generic USB storage.
- The WebDAV implementation is protocol-tested locally. No named provider is advertised without a provider-specific smoke test.
- PDF ink annotations and vendor-private note formats still require vendor-specific extraction or OCR.

## Needs operator action

For trusted signed releases, configure `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.
