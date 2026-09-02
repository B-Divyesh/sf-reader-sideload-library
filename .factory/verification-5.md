# Independent product verification 5 — PASS

## Verdict

**PASS — accept candidate `329e83059b770f2fe6ef2d3ad013a037f51982e4`.**

Verified independently on 2 September 2026 from the candidate checkout and against <https://reader-sideload-library.sociobot.in>.

The previous 1366×768 first-read blocker is fixed. The required claim tests, final full suite, type/lint checks, web build, native build, live product flows, privacy boundary, accessibility checks, offline behavior, performance budgets, deployment comparison, and published installers pass.

## Mandatory first read and demo

At a cold 1366×768 live load, the first screen says:

- what it does: **“Organize and sideload your e-ink library.”**
- who it is for: **“For e-ink reader owners who keep EPUB and PDF files…”**
- what to click: **“Try it with sample data,”** beside **“Open a ready sample catalogue.”**

The audience ends at y=456.72px and the sample action ends at y=545.20px, both inside the 768px viewport. At 390×844 they end at y=464.98px and y=558.98px. The action opens the working four-book sample in one click. Its persistent banner names the sandbox and provides **Reset demo** and **Start for real**.

Evidence: `.factory/evidence/verification-5/live/first-read-1366x768.png`, `first-read-mobile-390x844.png`, and `manual-results.json`.

## Claims gate

`.factory/claims.json` exists with 17 entries. Before broader QA, every listed command was run separately and passed, including the repeated `npm run test:release` command for both release claims.

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
| `unsigned-installers` | pass |

The inventory check also reports a one-to-one mapping: 17 claims and 17 unique test markers. Public claim-like copy on the landing page, legal pages, app, and README maps to these entries; no unsupported marketing claim was found.

## Clean local quality gates

- `npm ci`: pass; 68 packages installed and zero audit vulnerabilities.
- `npm test`: final exact run passed: 17/17 claim mappings, 6 Vitest tests, 10 Rust tests, and 56/56 Playwright tests across desktop and mobile Chromium.
- `npm run check`: pass.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: pass.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: pass after installing the README-listed Ubuntu/Tauri prerequisites.
- `npm audit --audit-level=high`: pass; zero vulnerabilities.
- `npm run build`: pass; produces `dist/`, `dist/app/`, and `dist/site/`.
- `CI=true npm run tauri build`: pass; produces AppImage, Debian, and RPM bundles.
- `bash -n site/public/install.sh`: pass.

One earlier full-suite attempt ended 55/56 when Chromium closed the mobile privacy-requests page during navigation. The claim had already passed in its required isolated run. A focused parallel stress run of privacy-requests plus offline-demo then passed 40/40, and the exact `npm test` rerun passed 56/56. Lighthouse also required Chromium's `--disable-dev-shm-usage` flag after one tab crash in this container. This is recorded as verifier-environment instability, not a reproduced product or test defect.

## End-to-end behavior

The live demo and local installed-app preview were exercised with normal, boundary, invalid, and recovery cases:

- Unicode search for `Zoë` returns the expected PDF. A 1,024-character no-match query gives the empty result and clearing it recovers all books. The issues filter returns two records.
- Home, End, and arrow-key tab navigation select the expected task panels.
- Reordering changes numbered device-safe filenames, survives reload, and Reset demo restores the original order.
- An empty collection name triggers native required-field validation. A collection with no books gives actionable feedback. `A/B:C?` is saved as device-safe `A-B-C-`.
- USB in the web demo explains that the installed app is required.
- An invalid WebDAV URL triggers native validation. A valid demo check makes no external request, explains the sandbox boundary, and clears the password after both attempts.
- Markdown export downloads `reader-highlights.md` with the bundled highlights. Malformed JSON and empty Markdown give recovery messages; a valid Markdown import then succeeds.
- Start for real deletes the demo key while preserving a sentinel real-library key.
- A separate installed-app web preview indexed 50 EPUB files, persisted 50 records, and produced 50 unique numbered paths. An unsupported-only folder resulted in zero books; selecting a valid EPUB recovered to one book.
- Native tests cover recursive metadata/protection checks, exact-byte and idempotent USB copy, incomplete-copy preservation, WebDAV authentication/folder/upload/error handling, PDF encodings, and all documented highlight formats.

No physical e-ink reader or external WebDAV provider was available. The native temporary-filesystem and local HTTP fixtures cover the protocol paths without touching real data.

## Live deployment, privacy, and accessibility

- All 43 deployable files checked from `dist/site/` are byte-identical to the live files. This includes the repaired CSS, application/demo bundle, service worker, legal pages, images, fonts, and installer scripts. Home SHA-256 is `d865dda3fc737fca32a28e8bd1bb9b00f79f2abd202836b627a374634e25a145`; `sw.js` is `8db883474ed9dd78dd6796c62df14e2b780cf3e693786e4396a913a1dd7f7a8b`.
- The factory URL verifier and `scripts/verify-live.mjs` pass. `/`, `/demo/`, `/privacy/`, `/terms/`, and the real 404 have one `h1`, one `main`, route focus/announcement behavior, zero console/page errors, and zero serious/critical axe findings.
- At 390px there is no horizontal overflow and no visible landing-page link, button, input, or select smaller than 44×44px.
- The keyboard skip link exposes a visible 3px moss outline. The tab widget supports arrows, Home, and End. Native controls retain Enter/Space behavior and the collection dialog uses native focus management.
- Dark/reduced-motion mode has zero serious/critical axe findings. Motion durations reduce to `1e-05s` and scroll behavior becomes `auto`.
- The cold landing request log contains only same-origin assets plus the disclosed GitHub public releases API request. The full demo flow remains same-origin and sets no cookies.
- Security headers include HSTS, CSP with `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, and `X-Content-Type-Options`.
- HTML uses `Cache-Control: public, must-revalidate, max-age=30`; hashed assets use one-year immutable caching; `sw.js` uses `no-cache`.
- Service-worker update leaves only `rsl-shell-v5`; a fresh offline reload retains the four-book demo and its sandbox banner.
- Every crawled HTTP link resolves successfully. The two `mailto:` links are intentionally non-HTTP.
- This is a static site plus local desktop app. It has no product server endpoint, checkout endpoint, or sign-in. API allowance/429/Retry-After and Entra External ID checks are therefore not applicable.

## Performance and release

Fresh Lighthouse mobile results: performance 98, accessibility 100, best practices 100, SEO 100; FCP 1.4s, LCP 1.8s, CLS 0.074, TBT 0ms, total transfer 178KiB.

Built landing JavaScript totals 3,982 bytes raw; CSS totals 13,185 bytes raw. Loaded WOFF2 fonts total 88,276 bytes. The mobile hero is 79,982 bytes and the desktop hero is 269,022 bytes. These meet the stated budgets.

GitHub latest is `v0.1.4`. It includes macOS Apple-silicon and Intel DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and valid `latest.json`. A fresh download of `Reader.Sideload.Library_0.1.4_amd64.deb` has SHA-256 `b7c674caf395e1cba34ea2c106fc882b131b4f2467bfd21bad135c99cb8785a9`, matching the published checksum. Package metadata is `reader-sideload-library`, version `0.1.4`, architecture `amd64`, with the expected GTK/WebKit dependencies; its extracted executable has no missing linked library in the verifier environment. Installers are unsigned as clearly disclosed.

The release tag predates the landing-only repair. Diff inspection confirms the candidate changes after `v0.1.4` affect the static landing CSS, service-worker cache version, tests, and factory evidence only; installed application source is unchanged.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Evidence

- `.factory/evidence/verification-5/manual-results.json`
- `.factory/evidence/verification-5/deployment-match.json`
- `.factory/evidence/verification-5/release-results.json`
- `.factory/evidence/verification-5/live/findings.json`
- `.factory/evidence/verification-5/live/lighthouse-summary.json`
- `.factory/evidence/verification-5/live/lighthouse.json`
- `.factory/evidence/verification-5/live/verify-url/verify.json`
- screenshots beside those reports
