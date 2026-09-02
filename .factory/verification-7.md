# Verification 7 — PASS

## Scope and verdict

**PASS** for candidate `7ed94ca4e2133fa106d04b4db09a9fb062a48448` at https://reader-sideload-library.sociobot.in/.

Verification was performed from this clean checkout on 2026-09-02. The released code is `v0.1.7` / `42c8acb13c54a938620e5de029d9b88769b3a87c`; the candidate changes from that release are only `.factory` documentation and evidence. The locally rebuilt `main-DMJ1WN20.js` and `style-lqdXFND3.css` SHA-256 hashes exactly equal the corresponding live assets, so the deployed product matches the candidate code.

## Mandatory first checks

`.factory/claims.json` exists and has 17 entries. Every listed command was run independently after `npm ci`, using the shipped browser/demo or native fixture entry point. All passed; raw output is in `.factory/evidence/verification-7/claim-*.log`.

| Claim IDs | Result |
| --- | --- |
| demo-isolated, local-catalogue, privacy-requests, core-free, offline-demo | PASS — each Playwright demo/app claim passed |
| nested-library-scan, source-preserved, pdf-metadata | PASS — each native core fixture passed |
| ordered-collections, markdown-export, webdav-credentials | PASS — each Playwright demo/app claim passed |
| verified-usb-copy, usb-partial-copy, webdav-transfer, highlight-import-formats | PASS — each native core fixture passed |
| release-manifest, unsigned-installers | PASS — `npm run test:release` passed both tests |

Cold first read, in a fresh live browser at 1366×768 and 390×844:

> Reader Sideload Library organizes and sideloads an e-ink library for people who own DRM-free EPUB and PDF files. The first action is **Try it with sample data**; it opens a ready sample catalogue.

The first screen also plainly states who it is for, what changes, and the three facts (no account/background network requests, offline sample tools, free USB/WebDAV). The one-click demo is live at `/demo/?demo=1`; it is a working four-book catalogue with persistent demo banner, Reset demo, and Start for real.

## Local quality gates

- `npm ci`: PASS, zero audit vulnerabilities.
- `npm test`: PASS — claim inventory 17/17, Vitest 6/6, Rust core 10/10, Playwright 62/62 (desktop and mobile).
- `npm run check`: PASS.
- `npm run build`: PASS, produces `dist/` and `dist/site/`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS after installing the standard Tauri Linux development prerequisites missing from the disposable container.
- `npm audit --audit-level=high`: PASS, zero vulnerabilities.

The local production bundles are well within budget: app JS 21,676 bytes uncompressed; site JS 4,259 bytes uncompressed; site CSS 13,851 bytes uncompressed. Live static JS uses `Cache-Control: public, max-age=31536000, immutable`; `sw.js` uses `no-cache` for updates.

## End-to-end and resilience coverage

- Normal desktop-preview path: selected an EPUB fixture, persisted local catalogue state, created a collection, imported highlights, and verified no background request left the app origin.
- Sample path: searched Unicode metadata, inspected ordered device-safe filenames, reset the sample, and exported downloaded Markdown containing the expected highlight.
- Boundary/recovery paths: encrypted media exclusion, UTF-16/PDFDocEncoding metadata, repeat USB copy skip, incomplete USB staging cleanup, unsafe path rejection, WebDAV HTTPS enforcement, authentication/permission/storage error guidance, and Markdown/text/JSON/KOReader/PDF highlight imports all passed their native or browser fixtures.
- Keyboard/accessibility: tab and Arrow-key tab switching, focused route headings, visible focus behavior, 390px layout, touch target check, dark theme, and reduced-motion behavior passed in the 62-test browser suite.
- PWA: the suite seeds an old `rsl-shell-v6`, verifies service worker activation leaves only `rsl-shell-v7`, then reloads `/demo/?demo=1` offline with its banner and four books. Fresh live offline reload passed independently.

## Live deployment audit

`node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in .factory/evidence/verification-7/live` passed.

- `/`, `/demo/?demo=1`, `/privacy/`, and `/terms/`: HTTP 200; deliberate unknown route: HTTP 404.
- Every checked route: one `<h1>`, one `<main>`, route focus and polite route announcement, complete social metadata, no console/page errors, and zero axe serious/critical findings.
- Demo had no third-party request, preserved an injected real-storage sentinel, reset to four books, and had no 390px horizontal overflow.
- The home page resolved the real GitHub v0.1.7 release asset. A fresh downloaded Linux DEB passed `sha256sum -c SHA256SUMS`; its package metadata is `reader-sideload-library 0.1.7 amd64` and includes the desktop binary/launcher.
- Response headers provide HSTS, nosniff, strict referrer policy, restrictive CSP with `frame-ancestors 'none'`, and `connect-src` limited to self plus the disclosed GitHub release API.
- Privacy claim test recorded landing, demo, and idle-app traffic, allowing only the disclosed GitHub release API as third party; cookie jar was empty. No product server-side API exists, so no product request allowance/rate-limit endpoint applies.
- `/opt/fleet/lib/verify-url.sh` passed: 200, 901 ms load, title/lang/main correct, no missing alt text/unlabelled buttons, no browser errors.
- Fresh Lighthouse mobile result: performance 98, accessibility 100, best practices 100, SEO 100; FCP 1.35 s, LCP 1.80 s, CLS 0.073, TBT 67 ms, transfer 182,286 bytes. Lighthouse reported a `TARGET_CRASHED` only while collecting its final screenshot after producing the scores; Playwright independently reported no page/console errors.

Evidence is retained in `.factory/evidence/verification-7/`, including raw claim logs, full-suite logs, build/lint logs, live JSON/screenshots, headers, release manifest, checksum result, `verify-url` output, and Lighthouse JSON.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Notes

This is a local-first desktop app with no sign-in, payment unlock, or product-hosted server endpoint. Microsoft Entra and API rate-limit checks are therefore not applicable. macOS and Windows installers are intentionally unsigned and disclose that status before download, as claimed and release-tested.
