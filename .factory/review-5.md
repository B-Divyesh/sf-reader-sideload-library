# Review 5 — Organize and sideload an e-ink library

## Verdict

**FAIL — 2 findings, both low severity, and 0 untested claims.**

Do not accept implementation `d13b19677dfa9b01d626a7c65905783c047d5d88`
as a zero-finding release. The reviewed documentation base is
`cf8da6390c93896074ecf5b27ab5a6440bdd918a`. The commits after the
implementation contain verification evidence, handoff text, and the live
verification helper; no product or release source differs. The fresh build and
live home page have the same SHA-256:
`390647649434c366daa82cfc9d824966c4353e3d0055c09f32d1d3bb4fc9f45f`.

Review ran on 6 September 2026 against
<https://reader-sideload-library.sociobot.in> and a clean clone at
`cf8da6390c93896074ecf5b27ab5a6440bdd918a`.

## First screen

Fresh 1536×864 desktop and 390×844 phone browsers showed all required content
before scrolling:

- Job: **Organize and sideload your e-ink library.**
- Audience: e-ink reader owners who keep EPUB and PDF files.
- First action: **Try it with sample data**, with “Open a ready sample catalogue.”
- Three facts about accounts/network requests, offline use, and free USB/WebDAV tools.

The desktop facts ended at 643.55 px. The phone facts ended at 699.98 px. The
phone had no horizontal page overflow.

## Findings

### R5-1 — Low — the 404 heading uses a product metaphor

The deliberate missing route correctly returns HTTP 404, has the title **Page
not found — Reader Sideload Library**, includes one `h1` and one `main`, and
offers **Return to the home page**. Its visible `h1` is **This page is not in
the catalogue.** That treats a web page as a catalogue item instead of naming
the error directly. It conflicts with the attached plain-words rule that bans
metaphor and mood headings.

Evidence: fresh live `/review-5-missing`; `/work/.evidence/review-5/live/404.png`;
`site/404.html:29`.

Required correction: use a direct heading such as **Page not found.** Keep the
existing cause and return action.

### R5-2 — Low — desktop file details run together

In the live demo and installed desktop artifact, every desktop-width catalogue
row joins file type and cover/page status without a space or line break. The
rendered values are **EPUBCover found**, **PDFEmbedded pages**, and **EPUBNo
cover found**. These are core scan results, so the joined text reduces clarity
and creates an unhelpful accessible text value.

The markup places adjacent `strong` and `small` elements in the File cell with
no whitespace. The desktop CSS makes only the first cell’s `strong` a block;
both File elements remain inline.

Evidence: fresh live demo query returned the joined `innerText` values;
`/work/.evidence/review-5/live/demo-desktop.png` and
`/work/.evidence/review-5/release/installed-sample.png`;
`desktop/src/main.ts:158`; `desktop/src/style.css:67`.

Required correction: put file type and file detail on separate lines, or add an
explicit separator, and test the rendered/accessibility text at desktop width.

## Sample and main paths

The one-click sample otherwise passes:

- The persistent banner says **Demo — sample data, nothing is saved to your library**.
- It loads four books, two issues, the ordered **Autumn Queue** collection, and two highlights.
- Unicode search for `Zoë` returns the PDF. A 1,024-character query shows the useful no-match state.
- Collection reorder changes the numbered paths and survives reload.
- **Reset demo** restores four books, the blank search, All formats, Catalogue, original order, and heading focus.
- Markdown export downloads `reader-highlights.md` with both sample highlights.
- Invalid JSON and quote-free Markdown give specific recovery text; a valid Markdown import then succeeds.
- Empty collection names use native required-field feedback. A collection with no selected book gives a concrete next step.
- An unsafe name becomes `Boundary - Queue- -`.
- Demo USB and WebDAV actions explain the sandbox boundary. WebDAV clears the password after invalid and valid attempts.
- A sentinel at `rsl:library-state:v1` stayed exact through search, reorder, reset, and exit. **Start for real** removed only `demo:rsl:library-state:v1`.

Native fixtures cover recursive scanning, protected-file exclusion, Unicode PDF
metadata, exact-byte and repeated USB copies, interrupted staging recovery,
WebDAV HTTPS/authentication/folder/upload errors, and every documented
highlight import format.

## Declared claims

Every command in `.factory/claims.json` ran independently from the clean clone.

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

The inventory reports 18 claims and 18 unique test markers. The live landing,
demo, installed app, privacy page, terms, README, demo guide, and release copy
were checked for additional promises. No missing, false, incomplete, or
untested public claim was found. Untested claim count: **0**.

## Accessibility, privacy, offline use, and routes

- Fresh axe checks found no serious or critical issue on home, demo, privacy, terms, 404, or dark/reduced-motion views.
- The URL verifier found the title, `lang=en`, one `h1`, one `main`, complete alternatives, labelled buttons, and no console error.
- Route headings receive focus and are announced. The skip link can be focused, has a visible 3 px outline, and reaches `#main`.
- Keyboard Home/End moves across task tabs. The collection dialog focuses its field and closes with Escape.
- At 200% root text, all five routes retain their heading and main content without horizontal page overflow.
- Reduced motion sets transitions to `0.00001s` and smooth scrolling to `auto`.
- The exact `/demo/?demo=1` URL reopens offline with the banner and four books. Only `rsl-shell-v8` is present.
- The live flow used only the product origin and the disclosed GitHub releases API. The demo made no third-party request, and no cookie was set.
- All crawled HTTP links returned success. The two email links were classified as email actions. The deliberate missing route was correctly treated as an expected 404.
- Live headers include HSTS, CSP, `nosniff`, strict-origin referrer policy, camera/microphone/geolocation denial, immutable hashed assets, and a no-cache service worker.

The product is a static site plus a local-first desktop app. It has no product
backend, tenant store, sign-in, hosted health endpoint, or client allowance, so
tenant isolation, server restart persistence, health, and 429/`Retry-After`
checks are not applicable. No updater is promised or configured. The approved
free v0.1 deviation is explicit and no checkout is offered. The brief does not
imply a useful missing AI step; the file, transfer, order, and highlight jobs
are present without sending library data to a model.

## Clean checkout and installed artifact

- `npm ci`: PASS; 68 packages; 0 vulnerabilities.
- All 18 declared claim commands: PASS independently.
- `npm test`: PASS; 18/18 claim mappings, 6/6 unit, 10/10 Rust, and 70/70 browser tests.
- `npm run check`, `npm run build`, Rust format, and `npm audit --audit-level=high`: PASS.
- Initial all-target Clippy reported the clean host’s missing GTK/WebKit libraries. After installing the exact README prerequisites, the unchanged checkout passed with warnings denied.
- `CI=true npm run tauri build`: PASS; DEB, RPM, and AppImage produced.
- Fresh Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; FCP 0.95 s, LCP 1.21 s, CLS 0.073, TBT 0 ms, transferred 302,466 bytes.
- Initial site JavaScript is 3.31 KB raw, CSS is 15.05 KB raw, loaded WOFF2 fonts total 88.27 KB, and the mobile hero is 79,982 bytes.

GitHub release `v0.1.8` contains both macOS architectures, Windows MSI/EXE,
Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`. A fresh published DEB
matched its listed SHA-256 and installed as `reader-sideload-library 0.1.8
amd64`. In a clean XDG consumer profile, the installed binary opened under
Xvfb, displayed the first-run state, and loaded the bundled four-book sample.
Its only stderr was the expected software-X-server DRI3 warning.

## Earlier finding disposition

Every earlier review and verification report was read. The current disposition
was proved from the live runtime, clean commands, source, or installed artifact.

| Earlier finding or recorded defect | Current disposition |
| --- | --- |
| Missing claims inventory and unlisted claims | Resolved: 18 entries, 18 unique markers, every command passed, and public copy audit found no uncovered promise. |
| No one-click sample; unclear first read | Resolved: desktop and phone show job, audience, action, outcome, and three facts before scrolling. |
| Broken paid checkout and conflicting entitlement copy | Resolved: the approved free v0.1 deviation is explicit; no checkout or license claim is present. |
| Unicode/PDF metadata corruption | Resolved: native Unicode/PDFDocEncoding claim passed and live `Zoë` search returned the correct PDF. |
| Missing security/cache policy | Resolved: required live headers, immutable assets, and no-cache service worker were observed. |
| No real 404 | Resolved functionally: the route returns 404 with recovery. New R5-1 concerns only its metaphorical heading. |
| Short touch targets | Resolved: mobile targets pass, including the 44 px demo wordmark. |
| Incomplete canonical/social metadata | Resolved: every route has route-specific title, description, canonical, Open Graph, and Twitter data. |
| `CI=1` native-build sensitivity | Resolved in documentation: the stated `CI=true npm run tauri build` command passed and produced all Linux bundles. |
| WebDAV unavailable end to end | Resolved: free UI, credential handling, and native PROPFIND/MKCOL/authenticated PUT/error fixtures passed. |
| Review 1 F-1-1 to F-1-5 | Resolved: available sample task, complete reset, shared chrome, route focus/announcement, and claim coverage passed. |
| Review 2 F-2-1 to F-2-7 | Resolved: exact-path offline reload, first-screen facts, install labels, highlights terminology, inclusion wording, network wording, and audience copy passed. |
| Review 3 F-3-1 to F-3-3 | Resolved: complete route social metadata, explicit external-source label, and direct task labels passed. |
| Review 4 F-4-1 | Resolved: **Choose USB or WebDAV** names the actual choice and remains tested. |
| Verification 4 desktop first-screen failure | Resolved at 1366×768, 1536×864, 1440×900, and 390×844. |
| Verification 8 V8-1 to V8-4 | Resolved: first-screen geometry, four-frame walkthrough, 44 px demo wordmark, and documented free-model deviation passed. |
| Earlier browser preview accepted malformed JSON as zero imports | Resolved: malformed JSON now gives a specific error and valid Markdown recovers. |

The physical-reader and third-party WebDAV compatibility limits remain honest
environment boundaries, not failed public claims. Deterministic native
filesystem and local HTTP fixtures cover the promised behavior.

## Counts

- Critical: 0
- High: 0
- Medium: 0
- Low: 2
- Total findings: 2
- Untested claims: 0

Evidence created for this review is under `/work/.evidence/review-5/`.
