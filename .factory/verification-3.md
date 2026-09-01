# Independent product verification 3 — PASS

## Verdict

**PASS — accept candidate `e46a12d9fb1e8f38c052fc5547a7896807ba192c`.**

Verified on 2026-09-01 from a clean checkout at the candidate commit and against <https://reader-sideload-library.sociobot.in>. The deployed home document is byte-identical to the fresh production build: SHA-256 `7caf8b7f8eeb3293f8f8e638682483ca89da432ab71f2f13054ac2421344e267`.

`v0.1.3` is an ancestor of this candidate. The candidate changes only factory evidence and handoff documents; product and release source are unchanged from the released tag.

## First read and demo

A cold live load says what the product does: **“Organize and sideload your e-ink library.”** It names its audience: e-ink reader owners with EPUB and PDF files. The first action is **“Try it with sample data”**, immediately explained as opening a ready sample catalogue. The same screen lists three plain facts: no account or passive app traffic, offline catalogue tools, and free USB/WebDAV tools.

That action opened `/demo/` in one click. The persistent banner states that sample data is not saved to the user library, provides Reset demo and Start for real, and loaded four realistic books. The demo supports search, ordered collections, and Markdown export. A fresh service-worker context reopened this demo offline after the initial online visit.

## Required claim checks

`.factory/claims.json` exists and declares 16 claims. Every declared command was run first, exactly as listed, and passed:

| Claim | Result |
| --- | --- |
| `demo-isolated` | pass |
| `local-catalogue` | pass |
| `privacy-requests` | pass |
| `core-free` | pass |
| `offline-demo` | pass |
| `nested-library-scan` | pass |
| `source-preserved` | pass |
| `pdf-metadata` | pass |
| `ordered-collections` | pass |
| `verified-usb-copy` | pass |
| `usb-partial-copy` | pass |
| `webdav-credentials` | pass |
| `webdav-transfer` | pass |
| `highlight-import-formats` | pass |
| `markdown-export` | pass |
| `release-manifest` | pass |

The claim-inventory check also reports a one-to-one relationship: 16 claims and 16 unique markers.

## Local verification

- `npm ci`: passed; 68 packages installed and `npm audit --audit-level=high` reported zero vulnerabilities.
- `npm test`: passed — 16 claim mappings, 5 Vitest tests, 10 Rust tests, and 44 Playwright tests across desktop and mobile Chromium.
- `npm run check`: passed.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: passed after installing the README-listed Linux desktop prerequisites in this disposable container.
- `npm run build`: passed and created `dist/`, including `dist/site/`.
- `CI=true npm run tauri build`: passed and created current Linux AppImage, Debian, and RPM bundles.

The built site entry JavaScript is 2.94 KB raw / 1.35 KB gzip, site CSS is 12.15 KB raw / 3.36 KB gzip, app JavaScript is 20.46 KB raw / 7.62 KB gzip, loaded WOFF2 fonts total 88.27 KB, and the mobile hero is 79,982 bytes. These are within the stated budgets.

## Live product checks

- The factory URL check passed: HTTP 200, title, `lang=en`, one `h1`, one `main`, image alternatives, labelled buttons, and no console errors. Evidence was written to `/tmp/tmp.yhTsJeJyHo/verify.json` during verification.
- Independent Playwright checks on cold desktop and 390 px mobile found no console/page errors, no serious or critical axe findings, no horizontal overflow, and a visible skip-link focus outline. Dark/reduced-motion mode reduced button transition duration to `1e-05s`.
- Keyboard checks confirmed the skip link receives first focus. The full suite confirms arrow-key operation of desktop tabs and normal tab navigation.
- Live outgoing requests during landing and demo use stayed same-origin except for the disclosed `https://api.github.com/repos/B-Divyesh/sf-reader-sideload-library/releases/latest` release lookup. The browser cookie jar was empty.
- The live app has no product sign-in and no product server endpoint. The request-allowance and Entra checks therefore do not apply.
- Live headers include HSTS, CSP with `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, and `X-Content-Type-Options`. The hashed JavaScript response uses `Cache-Control: public, max-age=31536000, immutable`; `sw.js` uses `no-cache` for update checks.
- `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, `/robots.txt`, `/sitemap.xml`, `/install.sh`, and `/install.ps1` each returned HTTP 200.

## Release package checks

GitHub latest release is `v0.1.3`. Its manifest includes macOS Apple-silicon and Intel DMGs, Windows MSI, and Linux AppImage, with SHA-256 values. The release additionally includes Debian, RPM, Windows setup, `SHA256SUMS`, and `latest.json`.

A fresh download of `Reader.Sideload.Library_0.1.3_amd64.deb` computed SHA-256 `7a4dbb785b09ffe3b754cf85a65dbf0ba988727c59669d9830ba169205ac0a80`, matching `SHA256SUMS`. Debian package metadata reports package `reader-sideload-library`, version `0.1.3`, architecture `amd64`, and the required GTK/WebKit runtime dependencies. On a 390 px live session, the dynamic download action resolved to the published `v0.1.3` Linux AppImage and the release-status text confirmed the published checksums.

## Defects by severity

None found in the tested scope.

## Known limits

- Linux, macOS, and Windows packages are unsigned as disclosed on the product site.
- This container has no physical e-ink reader or external WebDAV provider. USB and WebDAV behavior was checked with the supplied native fixtures; the physical-device compatibility matrix remains a future hardware exercise.
