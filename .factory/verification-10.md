# Organize and sideload an e-ink library — verification 10

## Verdict

**PASS — accept implementation `9fc7213ef5e3231c73a0da7bfb23ea65bcaccf78`.**

- Findings: **0**
- Untested claims: **0**
- Documentation SHA reviewed: `b5790a60da5376cce6a0240bf37250ad141913be`
- Release: `v0.1.9`
- Live URL: <https://reader-sideload-library.sociobot.in>

The live files are byte-identical to a clean build from the documentation SHA,
whose product implementation is the tagged implementation above. Report-only
commits after the implementation do not require another product image.

## First screen

Before scrolling in fresh desktop and phone browser contexts:

- Job: organize DRM-free EPUB and PDF files, keep collection order, and
  sideload them to an e-ink reader.
- Audience: e-ink reader owners who keep their own EPUB and PDF files.
- First action: **Try it with sample data**. The adjacent text says
  **Open a ready sample catalogue.**

The job, audience, action, action outcome, and three facts fit at 1440×900 and
on a fresh Pixel 5 browser viewport. Separate 1366×768, 1536×864, 1440×900,
and 390×844 checks also passed. No console errors occurred.

## Sample and main paths

- The one-click action opens `/demo/?demo=1` with four realistic books, one
  ordered collection, two highlights, and one protected PDF warning.
- The persistent banner says **Demo — sample data, nothing is saved to your
  library** and keeps **Reset demo** and **Start for real** available.
- Unicode search finds `Zoë`. A 1,024-character no-match search shows a clear
  empty state.
- Reordering the collection changes numbered device filenames and survives a
  reload. Reset restores the original order, blank search, All formats,
  Catalogue, four rows, and focus on the Catalogue heading.
- The real-library sentinel remained unchanged throughout sample use. Reset
  stayed in the demo namespace. Start for real deleted the demo key and left
  the sentinel unchanged.
- Markdown export produced `reader-highlights.md` with the expected two sample
  highlights.

Normal, invalid, boundary, and recovery checks passed for required collection
names, an empty collection, unsafe collection characters, USB in browser demo,
invalid WebDAV URLs, WebDAV password clearing, sample WebDAV isolation,
malformed JSON, empty Markdown, and a valid import after errors.

## Declared claims

Every command in `.factory/claims.json` was run independently from the clean
checkout. All 18 passed.

| Claim | Result |
| --- | --- |
| `demo-isolated` | PASS |
| `local-catalogue` | PASS |
| `privacy-requests` | PASS |
| `core-free` | PASS |
| `desktop-walkthrough` | PASS |
| `offline-demo` | PASS |
| `nested-library-scan` | PASS |
| `source-preserved` | PASS |
| `pdf-metadata` | PASS |
| `ordered-collections` | PASS |
| `verified-usb-copy` | PASS |
| `usb-partial-copy` | PASS |
| `webdav-credentials` | PASS |
| `webdav-transfer` | PASS |
| `highlight-import-formats` | PASS |
| `markdown-export` | PASS |
| `release-manifest` | PASS |
| `unsigned-installers` | PASS |

The one-to-one inventory reports 18 claims and 18 unique test markers. A fresh
public-copy audit found no unlisted claim, banned marketing term, or mixed
`notes`/`highlights` terminology. The deterministic local utility does not have
an obvious missing AI step; adding a model would weaken its offline and privacy
contract.

## Accessibility, routes, privacy, and offline use

- Home, Demo, Privacy, Terms, and the 404 page have one h1, one main landmark,
  route titles, descriptions, canonical/social metadata, focused h1s, route
  announcements, shared navigation, and legal links.
- The deliberate missing route returns HTTP 404. Its heading is **Page not
  found.** and **Return to the home page** links to `/`.
- The v0.1.9 File cell regression passed in tests and live rendering. `EPUB`
  and `Cover found` occupy separate lines; the published DEB shows the same
  layout.
- The factory URL verifier passed. Axe CLI found zero violations on four live
  routes. Playwright Axe found zero serious or critical issues on all five
  routes and in dark/reduced-motion states.
- Keyboard tab Home/End behavior, dialog focus, Escape close, visible route
  focus, 44 px phone targets, 390 px reflow, and 200% text resize passed.
- Reduced motion removes the transition and restores automatic scrolling.
- The sample reopened offline from the exact advertised URL with four books
  and its sample banner. The service-worker cache was `rsl-shell-v8`.
- The browser set no cookies. Sample requests stayed on the product origin.
  The landing page contacted only the disclosed GitHub releases API.
- All 19 discovered links passed. Privacy, Terms, installer, source, and
  current release links are live.

HTTP redirects to HTTPS. Live headers include HSTS, CSP, nosniff, referrer and
permissions policies. Hashed assets are immutable; `sw.js` is not cached.
There is no backend, tenant, health endpoint, server state, or product request
rate limit to verify.

## Clean checkout and release artifact

- Clean checkout: `b5790a60da5376cce6a0240bf37250ad141913be`.
- `npm ci`: PASS; 68 packages, zero vulnerabilities.
- `npm test`: PASS; 18/18 claim mappings, 6/6 unit tests, 10/10 Rust tests,
  and 74/74 Playwright tests.
- `npm run check`, `npm run build`, Rust format, and
  `npm audit --audit-level=high`: PASS.
- The first all-target Clippy attempt reported the absent GTK/WebKit host
  packages. After installing the exact README-listed Tauri prerequisites, the
  unchanged command passed with warnings denied. This is a documented clean
  host prerequisite, not a product finding.
- `CI=true npm run tauri build`: PASS; DEB, RPM, and AppImage bundles were
  produced.
- GitHub release `v0.1.9` contains Intel and Apple-silicon DMGs, Windows
  MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- A fresh public DEB download matched its published SHA-256. Its package is
  `reader-sideload-library 0.1.9 amd64`, and all linked libraries resolved.
- The extracted published DEB ran under Xvfb in a clean XDG consumer profile.
  It rendered the first-run screen, loaded the bundled sample, displayed four
  books, and kept the sample banner visible.

Fresh mobile Lighthouse scores are 99 performance, 100 accessibility,
100 best practices, and 100 SEO. FCP is 1.0 s, LCP is 1.2 s, CLS is 0.073,
TBT is 30 ms, and total transfer is 295 KiB. The build reports 3.31 KiB raw
landing JavaScript, 14.81 KiB CSS, and 88.27 KiB WOFF2 fonts.

## Earlier finding disposition

| Earlier finding | Current disposition and proof |
| --- | --- |
| Initial claims inventory absent | Resolved — 18 entries, 18 unique markers, and every declared command passed. |
| Initial one-click sample and first-read failures | Resolved — fresh desktop and phone first reads and one-click entry passed. |
| Initial broken checkout and conflicting entitlement text | Resolved — the approved free v0.1 deviation is explicit; no checkout is offered; `core-free` passed. |
| Initial PDF metadata corruption | Resolved — Unicode/PDF encoding native claims passed and live `Zoë` search returns one PDF. |
| Initial security/cache mismatch | Resolved — current security and cache headers passed. |
| Initial missing 404 | Resolved — the styled route returns 404 with recovery. |
| Initial short touch targets | Resolved — mobile controls and the 44 px demo wordmark passed. |
| Initial incomplete metadata | Resolved — route title, description, canonical, Open Graph, and Twitter checks passed. |
| Initial `CI=1` build sensitivity | Resolved in documentation — the documented `CI=true` command produced all Linux bundles. |
| Verification 2 unlisted claims and missing WebDAV path | Resolved — inventory/public-copy audit and UI/native WebDAV checks passed. |
| Review 1 F-1-1 through F-1-5 | Resolved — usable sample action, full reset, shared route structure, focus/announcement, and exact claims coverage passed. |
| Review 2 F-2-1 through F-2-7 | Resolved — exact offline path, first-screen facts, install labels, highlight terms, inclusion wording, request wording, and audience text passed. |
| Review 3 F-3-1 through F-3-3 | Resolved — route Twitter metadata, named external source, and direct task labels passed. |
| Review 4 F-4-1 | Resolved — **Choose USB or WebDAV** remains direct and tested. |
| Verification 4 desktop first screen | Resolved — required content fits every tested desktop viewport. |
| Verification 8 V8-1 through V8-4 | Resolved — first-screen geometry, four-frame walkthrough, phone target size, and free-model deviation passed. |
| Earlier malformed JSON recovery | Resolved — malformed JSON reports a specific error and a valid Markdown import succeeds afterward. |
| Review 5 R5-1 | Resolved — live 404 heading is **Page not found.** with a working recovery link. |
| Review 5 R5-2 | Resolved — live and installed-app File details render on separate lines. |

## Finding count

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Untested claims: 0

## Evidence

Evidence is under `.factory/evidence/verification-10/`:

- `claim-commands.log` — all 18 declared commands and PASS results.
- `quality-gates.log` — full test, build, Clippy, audit, and native build output.
- `deployment-match.json` — 47 public build files matched live byte for byte.
- `fresh-device-first-read.json` — independent desktop/phone first reads and
  focused v0.1.9 regressions.
- `live/findings.json`, `manual-live.json`, and `live/verify-url/` — live
  routes, sample, recovery, accessibility, offline, and screenshots.
- `axe-cli.json`, `text-resize.json`, and `link-check.json` — accessibility,
  reflow, and link results.
- `lighthouse.json` — full mobile Lighthouse result.
- `release/` — public release metadata, checksums, linkage, and clean-consumer
  screenshots.
