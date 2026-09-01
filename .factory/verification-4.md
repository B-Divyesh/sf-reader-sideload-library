# Independent product verification 4 — FAIL

## Verdict

**FAIL — do not release candidate `cf5706b4f7195334b8d099da3b354f63066b034c`.**

Verified on 2026-09-01 from the clean candidate checkout and against <https://reader-sideload-library.sociobot.in>.

The product, claims, deployment, release files, privacy behavior, accessibility automation, and build gates otherwise passed. One explicit acceptance gate fails: the cold desktop first screen does not show the audience statement or the one-click sample action at a common 1366×768 laptop viewport.

## Release-blocking finding

### High — the desktop first screen does not say who it is for or show what to click

At 1366×768, the large headline consumes almost the full left column. The audience sentence begins at y=742px and ends at y=842px, so it is cut off by the 768px viewport. **Try it with sample data** begins at y=893px and is completely below the fold.

The first visible screen therefore does not answer all three required questions: what it does, who it is for, and what to click first. This is an explicit automatic FAIL in the work order even though the same copy is visible at 1440×900 and the mobile 390×844 layout passes.

Evidence:

- `.factory/evidence/verification-4/live/first-read-desktop-1366x768.png`
- `.factory/evidence/verification-4/live/first-read-desktop-1366x768.json`

The intended first read, once scrolled, is clear: it organizes and sideloads DRM-free EPUB/PDF libraries for e-ink reader owners; the first action is **Try it with sample data**. The problem is placement, not wording or demo behavior.

## Claims gate

`.factory/claims.json` exists with 17 entries and the inventory check reports 17 unique claim markers. Every listed command was run before broader QA and passed. The identical `npm run test:release` command was run separately for both release claims.

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

## Clean local verification

- `npm ci`: pass; 68 packages installed and zero audit vulnerabilities.
- `npm test`: pass; 17/17 claim mappings, 6 Vitest tests, 10 Rust tests, and 52 Playwright tests across desktop and mobile Chromium.
- `npm run check`: pass.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: pass.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: pass after installing the README-listed Linux GUI prerequisites in the disposable verifier container.
- `npm audit --audit-level=high`: pass; zero vulnerabilities.
- `npm run build`: pass; `dist/` and `dist/site/` were produced.
- `CI=true npm run tauri build`: pass; fresh AppImage, Debian, and RPM bundles were produced.

## End-to-end behavior

The live sample opens in one click once its action is reached. Its persistent banner says sample work is not saved to the real library and supplies **Reset demo** and **Start for real**.

Verified normal, boundary, invalid, and recovery paths:

- Unicode author search returns the expected PDF; a 1,024-character no-match query produces the correct empty state; clearing it restores all four books.
- The issues filter returns two records.
- Home, End, and arrow keys operate the three task tabs.
- Reordering updates numbered device-safe filenames, survives reload, and Reset demo restores the original order.
- An empty collection name triggers native validation; a collection with no selected books gives actionable feedback; `A/B:C?` is saved as device-safe `A-B-C-`.
- An invalid WebDAV URL triggers native validation. A valid URL in demo mode makes no request, explains the sandbox boundary, clears the password, and does not persist credentials.
- USB in the web demo explains that transfer requires the installed app.
- Markdown export downloads `reader-highlights.md` with the two sample highlights.
- Start for real deletes only `demo:rsl:library-state:v1`; a sentinel real-library key remains unchanged.
- A separate 50-file app-preview run indexed 50 EPUBs, created 50 unique planned paths with no missing entries, recovered from an unsupported-file folder, rejected malformed JSON and empty Markdown with actionable errors, then imported and exported a valid highlight.
- Native Rust fixtures passed recursive metadata/protection checks, exact-byte USB copy and repeat skip, interrupted-copy preservation, WebDAV authentication/folder/upload/error recovery, and all documented highlight formats.

Physical e-ink hardware and an external WebDAV provider were not available. The native filesystem and local HTTP fixtures cover those protocol paths.

## Live deployment, privacy, and accessibility

- The built and live bytes match for `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, `/sw.js`, `/install.sh`, and `/install.ps1`. Home SHA-256: `cbd2bbfcfc9e2946e526156a3c441e8f2fc6178a0f669be23f1811e733cfccd4`.
- `v0.1.4` is an ancestor of the candidate. Candidate changes after the tag are verification scripts and factory evidence/docs, not product or release source.
- The factory URL verifier passed: HTTP 200, title, `lang=en`, one h1, main landmark, image alternatives, labelled buttons, and no console errors.
- Live Playwright/axe checks found zero serious or critical findings on home, demo, privacy, terms, the real 404, 390px mobile, and dark/reduced-motion modes.
- Mobile 390×844 has no horizontal overflow, all checked visible controls meet the 44px baseline, and the audience plus sample action are fully visible.
- Focus styling is a visible 3px moss outline. Dialog, tab, reset, route-focus, and live-region behavior passed the supplied and independent checks.
- Reduced motion changes transitions to `0.01ms`; no animation remains.
- Across the landing and full demo flow, the only third-party request is the disclosed GitHub public release API lookup. Demo actions make no third-party request. The cookie jar is empty.
- Security headers include HSTS, CSP with `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, and `X-Content-Type-Options`.
- Hashed assets use `Cache-Control: public, max-age=31536000, immutable`; `sw.js` uses `no-cache`; HTML revalidates after 30 seconds.
- Service-worker `rsl-shell-v4` installs and updates successfully. A fresh offline reload retains the four-book demo and banner.
- All crawled HTTP links resolve; the two `mailto:` links are intentionally non-HTTP.
- There is no product server endpoint, checkout, or sign-in. The API allowance/429, Retry-After, and Entra External ID checks are not applicable.

## Performance and release

Fresh mobile Lighthouse: performance 93, accessibility 100, best practices 100, SEO 100; LCP 2.2s, FCP 1.5s, CLS 0.074, TBT 240ms, total transfer 177KiB.

The built landing JavaScript is 3,982 bytes raw / 1,928 bytes gzip. CSS is 12,827 bytes raw / 3,660 bytes gzip. Loaded WOFF2 fonts total 88,270 bytes. The mobile hero is 79,982 bytes. These meet the stated static budgets.

GitHub latest is `v0.1.4`, with Apple-silicon and Intel DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`. A fresh download of `Reader.Sideload.Library_0.1.4_amd64.deb` passed its published checksum. Package metadata reports version 0.1.4, amd64, and the expected WebKit/GTK dependencies. Installers are unsigned as disclosed.

## Defects by severity

- **High / release-blocking:** desktop first-read contract fails at 1366×768 because the audience and sample action are below the fold.
- **Medium:** none.
- **Low:** none.

## Evidence

Detailed JSON, screenshots, Lighthouse output, live route results, and the 50-book boundary result are under `.factory/evidence/verification-4/`.
