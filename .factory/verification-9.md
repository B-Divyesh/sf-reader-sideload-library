# Verify Reader Sideload Library — PASS

## Verdict

**PASS — accept implementation `d13b19677dfa9b01d626a7c65905783c047d5d88`.**

Verification ran on 6 September 2026 against a fresh clone and the live site at
<https://reader-sideload-library.sociobot.in>. There are **0 findings** and
**0 untested claims**.

The reviewed implementation is `d13b19677dfa9b01d626a7c65905783c047d5d88`.
The repository documentation head is
`3d2f474e619b855a024bf6b176dee1dd19a6c945`; changes after the implementation
commit contain only verification evidence, the handoff, and the live verifier.
The freshly built home page and live home page have the same SHA-256:
`390647649434c366daa82cfc9d824966c4353e3d0055c09f32d1d3bb4fc9f45f`.

The work order mentioned a failed build wrapper. No `build.log` is present in
the checkout, and the failure did not reproduce: `npm run build` completed and
created `dist/` plus `dist/site/`.

## First screen and sample

Fresh 1536×864 desktop and 390×844 phone contexts saw, before scrolling:

- Job: **Organize and sideload your e-ink library.**
- Audience: e-ink reader owners who keep EPUB and PDF files.
- First action: **Try it with sample data**, followed by “Open a ready sample catalogue.”
- Three facts covering accounts/network requests, offline use, and free USB/WebDAV tools.

The action opened `/demo/?demo=1` in one click. The persistent banner says
**Demo — sample data, nothing is saved to your library** and keeps **Reset
demo** and **Start for real** visible. The populated sample contained four
books, two issues, an ordered three-book collection, and two highlights.

Live checks proved that search finds Unicode metadata, a 1,024-character query
gets a useful empty state, order changes persist, reset restores the four-book
starting state, and Markdown export contains the sample highlights. A sentinel
under `rsl:library-state:v1` remained exact throughout demo work. **Start for
real** deleted `demo:rsl:library-state:v1` and preserved the real sentinel.

## Declared claims

Every command in `.factory/claims.json` ran independently from fresh clone
`/tmp/rsl-verify9-clean.q1NeWy` at documentation SHA `3d2f474`. All passed.

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

The inventory check found 18 claims and 18 unique test markers. A manual review
of the live pages, desktop copy, README, privacy policy, terms, demo guide, and
release copy found no public claim missing from the inventory.

## Normal, invalid, boundary, and recovery paths

- Normal: opened the sample, searched `Zoë`, inspected the ordered filenames,
  changed and reloaded collection order, and exported `reader-highlights.md`.
- Invalid: an empty collection name invoked native required-field feedback; a
  collection with no selected books said what to select; an invalid WebDAV URL
  was rejected and its password cleared.
- Boundary: a 1,024-character search returned “No books match this filter”; a
  collection name containing `/`, `:`, and `?` became a device-safe name.
- Recovery: malformed JSON and Markdown without quotes gave specific next
  steps; a valid Markdown import then succeeded. Demo USB and WebDAV attempts
  explained that real transfers require leaving the browser demo.
- Native fixtures covered encrypted EPUB/protected PDF exclusion, Unicode PDF
  metadata, unsafe paths, an interrupted USB staging copy, repeat-copy
  idempotence, and WebDAV status/authentication/upload errors.

No browser console or page errors occurred.

## Accessibility, responsive behavior, and routes

- Home, demo, privacy, terms, and the designed missing-page route each have a
  route title, one `h1`, one `main`, focused route heading, polite announcement,
  shared navigation, and legal footer.
- A deliberate unknown route returned HTTP 404 with the title **Page not found
  — Reader Sideload Library**, a styled page, and **Return to the home page**.
- Axe found no serious or critical issue in the live routes, demo state, or
  dark/reduced-motion treatment. The factory URL verifier found no missing alt
  text, unlabelled button, or console error.
- Keyboard Home/End moved between task tabs. The collection dialog focused its
  name field and closed with Escape. Focus indicators remained visible.
- The phone layouts had no page overflow. The demo wordmark measured 44 px.
  At 200% root text size, all five routes retained their headings and main
  content without page overflow; navigation and task strips remained
  horizontally scrollable where needed.
- Reduced motion set transitions to `0.00001s` and smooth scrolling to `auto`.
- The live sample reopened offline from the exact advertised URL with four
  books, its banner, and only the current `rsl-shell-v8` cache.

Twelve unique live links were checked. All navigable links succeeded. The
intentional missing route returned the expected 404; `mailto:` links were
classified as such, not treated as HTTP failures.

## Privacy, network, and product scope

The live browser observed only the product origin and the disclosed GitHub
releases API. The demo itself made no third-party request, and no cookie was
set. Demo WebDAV made no server request. No analytics, advertising, CDN font,
or third-party script appeared.

This is a static site plus a local-first desktop app. It has no product backend,
tenant store, sign-in, hosted health endpoint, or client-facing rate limit, so
tenant isolation, restart persistence, health, and 429/`Retry-After` checks are
not applicable. Native WebDAV behavior is covered by a local deterministic
fixture. No updater is promised or configured. The researched paid model has
an approved, explicit free-release deviation; no checkout or license behavior
is claimed. The brief has no useful missing AI step: scanning, transfer, order,
and highlight portability are complete without sending library data to a model.

## Build and release evidence

- `npm ci`: PASS; 68 packages, zero audit vulnerabilities.
- `npm test`: PASS; 18/18 claim mappings, 6/6 unit tests, 10/10 Rust tests,
  and 70/70 Playwright tests across desktop and mobile Chromium.
- `npm run check`, `npm run build`, Rust formatting, and
  `npm audit --audit-level=high`: PASS.
- The first all-target Clippy attempt correctly reported missing host GTK/WebKit
  libraries. After installing the README-listed Tauri prerequisites, the same
  command passed with warnings denied. This was a clean-host prerequisite, not
  a product defect.
- `CI=true npm run tauri build`: PASS; produced DEB, RPM, and AppImage bundles.
- The release API reports `v0.1.8` with Intel and Apple-silicon DMGs, Windows
  MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- A fresh published DEB download matched `SHA256SUMS`. Its package metadata is
  `reader-sideload-library 0.1.8 amd64`; all linked libraries resolved.
- The extracted release binary stayed open for 10 seconds under Xvfb. A second
  run rendered the first-run UI, scrolled to **Load sample project**, activated
  it, and rendered the four-book isolated sample. The only screenshot-run
  stderr was the expected software-X-server DRI3 acceleration warning.

Fresh mobile Lighthouse: performance 99, accessibility 100, best practices
100, SEO 100; FCP 1.10 s, LCP 1.40 s, CLS 0.077, TBT 0 ms, total transfer
302,502 bytes. Initial site JavaScript is 4.26 KB raw, CSS is 15.05 KB raw,
and WOFF2 fonts total 88.27 KB.

## Earlier finding disposition

Every earlier review and verification finding was rechecked:

| Earlier finding | Current disposition and proof |
| --- | --- |
| Initial: claims inventory absent | Resolved — 18 entries, 18 unique markers, every command passed. |
| Initial: no one-click sample and failed first read | Resolved — fresh desktop/phone first reads and one-click live entry passed. |
| Initial: broken paid checkout | Resolved — approved free-release model is explicit; no checkout is offered; `core-free` passed. |
| Initial: PDF metadata corruption | Resolved — `pdf-metadata` and nested-scan native claims passed. |
| Initial: security/cache headers differed | Resolved — current HSTS, CSP, nosniff, referrer, permissions, immutable assets, and no-cache service worker were observed. |
| Initial: no real 404 | Resolved — styled unknown route returned HTTP 404 with a home action. |
| Initial: short touch targets | Resolved — mobile controls and the 44 px demo wordmark regression passed. |
| Initial: incomplete metadata | Resolved — all route titles, descriptions, canonical/Open Graph/Twitter fields passed. |
| Initial: conflicting entitlement copy | Resolved — free v0.1 wording is consistent across site, terms, README, and test. |
| Initial: native build sensitive to `CI=1` | Resolved — `CI=true npm run tauri build` produced all Linux bundles. |
| Verification 2: unlisted public claims | Resolved — one-to-one inventory and manual public-copy audit passed. |
| Verification 2: WebDAV not end to end | Resolved — credential UI and native PROPFIND/MKCOL/authenticated PUT fixtures passed. |
| Review 1 F-1-1 through F-1-5 | Resolved — available demo action, complete reset, shared route chrome, route focus/announcement, and exact claim coverage all passed live/current tests. |
| Review 2 F-2-1 | Resolved — exact `/demo/?demo=1` first reload works offline from cache `rsl-shell-v8`. |
| Review 2 F-2-2 | Resolved — all required first-screen items fit 1366×768, 1536×864, 1440×900, and 390×844. |
| Review 2 F-2-3 through F-2-7 | Resolved — install-copy labels, “highlights” terminology, selected-by-default wording, “background network requests,” and concrete audience copy remain corrected. |
| Review 3 F-3-1 through F-3-3 | Resolved — route Twitter metadata, explicit external-source label, and direct task labels passed. |
| Review 4 F-4-1 | Resolved — workflow label is **Choose USB or WebDAV** and is regression-tested. |
| Verification 4: desktop first screen omitted audience/action | Resolved — fresh 1366×768 regression and live checks pass. |
| Verification 8 V8-1 | Resolved — at 1536×864 the last fact ends at 643.55 px; at 1440×900 it ends at 661.55 px. |
| Verification 8 V8-2 | Resolved — four complete 1280×800 first-party walkthrough frames and captions load. |
| Verification 8 V8-3 | Resolved — the phone demo wordmark is 44 px high. |
| Verification 8 V8-4 | Resolved — README, Terms, handoff, and `core-free` record the approved free-model deviation. |

## Finding count

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Untested claims: 0

## Evidence

Evidence is under `.factory/evidence/verification-9/`:

- `claim-commands.log` — all 18 declared commands and exit status 0.
- `quality-gates.log` — full test/build/static/native gate output, including
  the prerequisite-only first Clippy failure and successful rerun.
- `live/findings.json` and `manual-live.json` — live assertions.
- `fresh-device-first-read.json`, `text-resize.json`, and `link-check.json`.
- `live/verify-url/verify.json` and responsive screenshots.
- `lighthouse.json` — complete fresh Lighthouse result.
- `release/` — public release metadata, checksums, linkage, stderr, and installed-app screenshots.

