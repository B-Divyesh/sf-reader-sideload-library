# Organize and sideload an e-ink library — review 6

## Verdict

**PASS — 0 findings and 0 untested claims.**

Reviewed on 6 September 2026 against:

- implementation candidate `9fc7213ef5e3231c73a0da7bfb23ea65bcaccf78`
- documentation base `e0ccba04867fbe1ebff567dfe34281d9af6bad47`
- live site <https://reader-sideload-library.sociobot.in>
- release `v0.1.9`, whose tag resolves to the implementation candidate

The commits after the implementation contain reports and evidence only. A fresh
build produced 47 public files that matched the live runtime byte for byte.

## First screen

Fresh 1440×900 desktop and Pixel 5 browser contexts showed this before any
scrolling:

- Job: **Organize and sideload your e-ink library.**
- Audience: e-ink reader owners who keep EPUB and PDF files.
- First action: **Try it with sample data**.
- Action result: **Open a ready sample catalogue.**
- Facts: no account or background requests; named tools reopen offline after a
  first sample visit; USB and WebDAV tools are free.

All items fit both viewports. The desktop facts ended at 661.55 CSS px in a
900 px viewport. The phone facts ended at 699.98 CSS px in a 727 px viewport.
Neither page had horizontal overflow or a console, page, or serious Axe error.

## Sample and user paths

The landing action entered `/demo/?demo=1` in one click. The persistent label
says **Demo — sample data, nothing is saved to your library**, with **Reset
demo** and **Start for real** always available.

The populated sample contained four distinct records: two EPUBs, a Unicode
metadata PDF, and a protected PDF excluded from transfer. Search for `Zoë`
returned **Field Notes 03 — 秋**. **Autumn Queue** displayed three ordered,
device-safe paths. Markdown export downloaded `reader-highlights.md` with the
expected sample quote.

Normal, invalid, boundary, and recovery checks passed:

- A 1,024-character no-match search showed a clear empty state; reset restored
  blank search, All formats, Catalogue, four rows, and heading focus.
- Reordering changed numbered transfer paths, survived reload, and reset to the
  original order.
- Empty collection names used native validation. A collection with no selected
  books gave a next step. `Boundary / Queue: ?` became `Boundary - Queue- -`.
- Demo USB and WebDAV actions explained that real transfer needs the installed
  app. Invalid WebDAV input was rejected, and passwords cleared after invalid
  and valid attempts without a network call.
- Malformed JSON and quote-free Markdown produced specific recovery messages.
  A valid Markdown import then succeeded.
- A separate clean app preview indexed 50 EPUB files, stored all 50, and made
  50 unique transfer-plan paths with no missing entry.

A sentinel at `rsl:library-state:v1` remained unchanged through sample search,
reorder, reset, and exit. Only `demo:rsl:library-state:v1` was used in sample
mode. **Start for real** removed the sample key and preserved the sentinel.

## Declared claims

`.factory/claims.json` contains 18 claims and 18 unique test markers. Every
declared command was run separately from a clean checkout after `npm ci`; the
two entries that declare `npm run test:release` were each executed.

| Claim | Result | Evidence checked |
| --- | --- | --- |
| `demo-isolated` | PASS | Separate storage, complete reset, real-state sentinel preserved |
| `local-catalogue` | PASS | Local persistence and app-origin-only requests |
| `privacy-requests` | PASS | Only the disclosed GitHub API request; no cookies |
| `core-free` | PASS | Catalogue, collection, USB, WebDAV, and Markdown controls need no account or checkout |
| `desktop-walkthrough` | PASS | Four complete 1280×800 first-party frames and captions |
| `offline-demo` | PASS | Exact advertised sample URL reopened offline on its first reload |
| `nested-library-scan` | PASS | Nested scan, metadata, ignored files, and protected-media exclusion |
| `source-preserved` | PASS | Source bytes unchanged after native inspection |
| `pdf-metadata` | PASS | UTF-16 and PDFDocEncoding metadata remained readable |
| `ordered-collections` | PASS | Title, author, and series search plus ordered safe paths |
| `verified-usb-copy` | PASS | Exact copied bytes and unchanged repeat skip |
| `usb-partial-copy` | PASS | Existing verified file survived an interrupted staging copy |
| `webdav-credentials` | PASS | Failure, success, upload, password clearing, and no credential persistence |
| `webdav-transfer` | PASS | HTTPS rules, PROPFIND, MKCOL, authentication, exact PUT bytes, and recovery errors |
| `highlight-import-formats` | PASS | Markdown, text, JSON, KOReader sidecar, and PDF annotation fixtures |
| `markdown-export` | PASS | Correct filename and Markdown contents |
| `release-manifest` | PASS | Required platforms, workflow publication, hashes, and metadata sources |
| `unsigned-installers` | PASS | Signing identities absent and public disclosure present |

The live site, desktop UI, Privacy, Terms, README, sample guide, installer copy,
and release copy were checked against the inventory. No missing, false,
incomplete, or untested public claim was found. The deterministic file and
transfer work does not have an obvious missing AI step.

## Accessibility, privacy, offline use, and site structure

- Home, Demo, Privacy, Terms, and the designed missing page have route-specific
  titles and metadata, one h1, one main landmark, focused headings, polite route
  announcements, shared navigation, legal links, and no serious or critical Axe
  result.
- The deliberate missing route returned HTTP 404, said **Page not found.**, and
  offered **Return to the home page**. This is expected behavior, not a defect.
- Keyboard Arrow keys and Home/End changed task tabs. The collection dialog
  focused its name field, Escape closed it, and focus returned to its opener.
  The tested focus outline was a visible 3 px solid ring.
- The phone layout had no page overflow, and the 44 px target regression passed.
  At 200% root text size, all five routes retained their heading, main content,
  and usable controls without page overflow.
- Dark mode had no serious or critical Axe result. Reduced motion changed the
  transition to `0.00001s` and smooth scrolling to `auto`.
- The exact sample URL reopened offline with its label and four books. Only the
  current `rsl-shell-v8` cache remained.
- The live sample made only same-origin requests. The full landing-to-sample
  flow used the product origin and the disclosed GitHub releases API. No cookie
  was set.
- All 19 discovered links passed. The two email links were treated as email
  actions. Current Linux, Windows, and macOS release links resolved.
- Live headers include HSTS, CSP with `frame-ancestors 'none'`, `nosniff`, strict
  referrer policy, and camera, microphone, and location denial. Hashed assets
  are immutable; `sw.js` is not cached.

This product has no hosted backend, sign-in, tenant store, health endpoint,
runtime AI call, payment endpoint, or update checker. Tenant isolation, server
restart persistence, health, and product API 429/`Retry-After` checks are not
applicable. The approved free v0.1 deviation is explicit and no checkout is
shown.

## Clean checkout, build, and release

- `npm ci`: PASS — 68 packages, 0 vulnerabilities.
- All 18 declared claim commands: PASS.
- `npm test`: PASS — 18/18 claim mappings, 6/6 unit tests, 10/10 Rust tests,
  and 74/74 browser tests.
- `npm run check`, `npm run build`, Rust format, strict all-target Clippy, and
  `npm audit --audit-level=high`: PASS.
- The README-listed GTK/WebKit prerequisites were installed before Clippy and
  native build measurements. An earlier live-helper attempt before `npm ci`
  failed only because dependencies were not installed; the unchanged helper
  passed after documented setup. No claim command failed.
- `CI=true npm run tauri build`: PASS — DEB, RPM, and AppImage bundles produced.
- Static output: 4,259 bytes JavaScript, 15,055 bytes CSS, 88,276 bytes WOFF2,
  and a 79,982-byte mobile hero.
- Fresh mobile Lighthouse: 99 performance, 100 accessibility, 100 best
  practices, 100 SEO; FCP 0.94 s, LCP 1.20 s, CLS 0.073, TBT 0 ms, and
  302,515 bytes transferred.

GitHub release `v0.1.9` contains Intel and Apple-silicon DMGs, Windows MSI and
EXE, Linux AppImage, DEB, and RPM, plus `SHA256SUMS` and `latest.json`. Every
checksum entry matches GitHub's published digest. A fresh DEB download matched
SHA-256 `bafe49dfb28e812bedd49c3e4d445c5413cc17f0267b169807a9539a515dd259`.

The DEB reports `reader-sideload-library 0.1.9 amd64`; all dynamic libraries
resolved. Its extracted binary ran in a clean XDG consumer profile under Xvfb,
showed the first-run screen, loaded the bundled sample in one click, displayed
four books and the persistent sample label, and retained that sample through a
reload. The only stderr was the expected software-X-server DRI3 warning.

## Earlier finding disposition

Every earlier review, verification, and polish report was read. Current proof
comes from this review's fresh live contexts, clean commands, source inspection,
or published artifact run.

| Earlier finding | Current disposition |
| --- | --- |
| Initial verification: missing inventory | Resolved — 18 claims, 18 markers, all commands passed. |
| Initial verification: no sample and unclear first read | Resolved — desktop and phone first screens and one-click sample passed. |
| Initial verification: broken paid checkout and conflicting entitlement copy | Resolved — approved free v0.1 deviation is documented; no purchase offer exists. |
| Initial verification: PDF metadata corruption | Resolved — native encoding test and live Unicode search passed. |
| Initial verification: security/cache mismatch | Resolved — required headers, immutable assets, and no-cache service worker observed live. |
| Initial verification: no real 404 | Resolved — designed page returns 404 with direct recovery. |
| Initial verification: short touch targets | Resolved — phone target tests, including the 44 px demo wordmark, passed. |
| Initial verification: incomplete metadata | Resolved — every route has title, description, canonical, Open Graph, Twitter, favicon, and touch icon data. |
| Initial verification: entitlement conflict | Resolved — free-release wording is consistent across site, Terms, and README. |
| Initial verification: `CI=1` build sensitivity | Resolved in documentation — documented `CI=true` build produced all Linux bundles. |
| Verification 2: unlisted claims | Resolved — complete inventory/public-copy cross-check and all 18 commands passed. |
| Verification 2: WebDAV unavailable | Resolved — free UI, credential rules, HTTPS, local server, exact upload, and recovery fixtures passed. |
| Review 1 F-1-1 | Resolved — primary sample action performs search instead of offering a blocked picker. |
| Review 1 F-1-2 | Resolved — reset restores query, filter, tab, rows, order, and focus. |
| Review 1 F-1-3 | Resolved — Demo and 404 share standard header, navigation, and footer. |
| Review 1 F-1-4 | Resolved — route headings receive focus and are announced. |
| Review 1 F-1-5 | Resolved — offline, release, signing, interface, and request claims have exact coverage. |
| Review 2 F-2-1 | Resolved — `/demo/?demo=1` passed its first offline reload. |
| Review 2 F-2-2 | Resolved — the three facts fit all tested first screens. |
| Review 2 F-2-3 | Resolved — install-copy controls name the result. |
| Review 2 F-2-4 | Resolved — **highlights** is used consistently; KOReader files are sidecars. |
| Review 2 F-2-5 | Resolved — README says per-book controls and matches selected-by-default behavior. |
| Review 2 F-2-6 | Resolved — public copy uses **background network requests**. |
| Review 2 F-2-7 | Resolved — audience copy names folder order and highlight export directly. |
| Review 3 F-3-1 | Resolved — all routes include complete Twitter metadata. |
| Review 3 F-3-2 | Resolved — source link says GitHub and external. |
| Review 3 F-3-3 | Resolved — app sections use direct task labels. |
| Review 4 F-4-1 | Resolved — **Choose USB or WebDAV** names the actual choice. |
| Verification 4: desktop first-screen failure | Resolved — required content fits 1366×768, 1536×864, 1440×900, and phone viewports. |
| Verification 8 V8-1 | Resolved — first-screen geometry passed at the previously failing desktop sizes. |
| Verification 8 V8-2 | Resolved — four captioned desktop screenshots load at 1280×800. |
| Verification 8 V8-3 | Resolved — demo wordmark meets the 44 px phone target baseline. |
| Verification 8 V8-4 | Resolved — approved free-model deviation is explicit in README, Terms, and claims. |
| Earlier malformed JSON recovery defect | Resolved — clear error followed by successful Markdown recovery. |
| Review 5 R5-1 | Resolved — missing-page h1 is **Page not found.** |
| Review 5 R5-2 | Resolved — installed and live File cells place format and detail on separate lines. |

Verification reports 3, 5, 6, 7, 9, and 10 recorded no additional open
findings. Their passing areas were rerun above.

## Counts and evidence

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Total findings: 0
- Untested claims: 0

Fresh evidence is under `/work/.evidence/review-6/`, including claim logs,
quality logs, live JSON and screenshots, link and text-resize results,
deployment hashes, Lighthouse output, release metadata and checksums, and
clean-consumer desktop screenshots.
