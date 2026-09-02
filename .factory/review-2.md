# Review 2 — Reader Sideload Library

**Verdict: FAIL**

Review date: 2 September 2026  
Scope: live site at <https://reader-sideload-library.sociobot.in>, repository commit `0135230c66b9806bf5c09ee8aff0c135193899fd`, and a fresh clone at the same commit.

There are seven findings: one blocking and six minor. The declared commands pass, but the live URL advertised for the offline claim does not survive its first offline reload. A zero-finding result is therefore not available.

## Cold first visit

The site was opened cold at 390×844 and 1366×768 before scrolling.

- **What it does:** Organizes a DRM-free EPUB/PDF library and copies it to an e-ink reader.
- **Who it is for:** E-ink reader owners who keep their own book files, collections, and highlights.
- **What to click first:** **Try it with sample data**, which says it opens a sample catalogue.

All three answers are present before scrolling, so the explicit first-read blocking condition does not apply. The sample action is fully visible at both sizes. The three required privacy/offline/price facts are not visible in either first viewport; see F-2-2.

## Findings

### F-2-1 — BLOCKING — the advertised demo URL does not reopen the demo on its first offline reload

**Exact claim and locations:** Landing proof strip and README: **“Catalogue, collection, and Markdown tools reopen offline after the first sample visit.”** The hero and README advertise `https://reader-sideload-library.sociobot.in/demo/?demo=1`.

**Observed result:** In a fresh Chromium context, open that exact URL online, wait for `navigator.serviceWorker.ready` and cache `rsl-shell-v5`, set the context offline, then reload. The URL remains `/demo/?demo=1`, but the service worker serves the cached landing page: title **“Reader Sideload Library — organize e-ink libraries”**, h1 **“Organize and sideload your e-ink library.”**, no demo banner, and no `#book-count`.

**Why this fails:** `sw.js` caches `/demo/`, not `/demo/?demo=1`. Its exact-match lookup misses the query URL and its network-failure fallback always returns `/`. The `offline-demo` test passes only because it uses `/demo/` without the advertised query and performs an extra online reload before going offline. The public claim is false on the promoted first-visit path and the listed test does not exercise that path.

**Concrete fix:** For same-origin navigation requests, match/cache by pathname or route `/demo/?demo=1` to the cached `/demo/` shell; use a route-appropriate fallback instead of unconditional `/`. Change `@claim:offline-demo` to open the exact advertised URL in a fresh context, await service-worker installation, go offline without an intermediate online reload, reload, and assert the demo banner plus four-book catalogue.

### F-2-2 — MINOR — the three required first-screen facts are below the fold

**Location:** Landing `.proof-strip` containing **“No account or passive app traffic”**, the offline statement, and **“USB and WebDAV tools are free.”**

**Observed result:** At 1366×768 the strip starts at y=768, so none of it is visible. At 390×844 it starts at y=1155.98 after the full hero image. The current viewport test checks only the lede and sample action, despite its name mentioning three facts.

**Why this matters:** The supplied plain-words and site-structure rules require privacy, offline, and price facts in the first screen. A visitor has to scroll past the hero image to see them.

**Concrete fix:** Put a compact three-line fact list in the hero copy directly after the sample action and before the download controls. Extend both viewport tests to require every fact’s full bounding box inside the viewport.

### F-2-3 — MINOR — the install copy buttons do not name their result

**Exact text/location:** Two landing buttons in the macOS/Linux and Windows PowerShell command blocks: **“Copy”**.

**Why this matters:** The label does not say what will be copied when controls are reached out of context. It fails the result-naming action rule.

**Concrete fix:** Rename both buttons **“Copy install command”**. Use **“Install command copied”** for success and **“Select install command”** for the clipboard fallback.

### F-2-4 — MINOR — the same reader annotations are called both “notes” and “highlights”

**Exact text/location:** Landing workflow: **“Copy books and export notes”** and **“Import reader notes and export them as Markdown.”** Elsewhere the landing page, README, claim inventory, and app call these records **“highlights.”**

**Why this matters:** A first-time visitor cannot tell whether notes and highlights are different data. The supplied terminology rule requires one word for one concept.

**Concrete fix:** Use **“Copy books and export highlights”** and **“Import highlights and export them as Markdown.”** Rename **“Transfer & notes”** to **“Transfer & highlights”** unless that panel gains a distinct notes concept.

### F-2-5 — MINOR — the README says inclusion is opt-in, but eligible scans start selected

**Exact text/location:** README, “What works in v0.1”: **“Searchable catalogue saved on this computer, with clear warnings and opt-in inclusion.”**

**Observed code:** `desktop/src/main.ts` maps scanned books to `selected: book.eligible`; eligible sample books are also initially selected. The user can opt out before transfer, but does not opt in.

**Why this matters:** This is an unlisted behavioral claim and describes the default in the opposite direction. A user deciding whether a scan prepares books for transfer could rely on it.

**Concrete fix:** Replace it with **“Searchable catalogue saved on this computer, with warnings and per-book inclusion controls.”** If opt-in is intended, default every scanned book to unselected and add a dedicated claim test.

### F-2-6 — MINOR — “passive app traffic” is technical and ambiguous

**Exact text/locations:** Landing fact: **“No account or passive app traffic.”** README: **“The app makes no passive network requests.”**

**Why this matters:** “Passive traffic” is network terminology, not a concrete user outcome. It makes the otherwise useful privacy fact harder to understand on a 30-second visit.

**Concrete fix:** Use **“No account or background network requests”** on the landing page and **“The app makes no background network requests.”** in the README.

### F-2-7 — MINOR — “focused alternative” does not identify the useful difference

**Exact text/location:** README, “Who it is for”: **“It suits people who need a focused alternative to a full library manager.”**

**Why this matters:** “Focused” is a subjective marketing adjective. The sentence does not tell a reader what is omitted or retained.

**Concrete fix:** Replace it with **“It is for people who want folder order and highlight export without a full library manager.”**

## Demo, sandbox, and privacy

- The landing action reaches `/demo/?demo=1` in one click.
- The first demo screen already shows four credible books, metadata, two issues, one ordered collection, and two highlights.
- The persistent banner says **“Demo — sample data, nothing is saved to your library.”** It includes **Reset demo** and **Start for real**.
- Searching for `Zoë` reduces the view to one book. **Reset demo** clears the search and restores four rows, the `all` filter, and Catalogue.
- A seeded `rsl:library-state:v1` sentinel remained byte-for-byte unchanged while only `demo:rsl:library-state:v1` changed.
- The direct demo flow made only same-origin requests and set no real-library state. The landing page separately made the disclosed GitHub releases API request.
- The offline defect is isolated in F-2-1.

## Claims check

Every command in `.factory/claims.json` was run from a fresh clone after `npm ci`. Duplicate `npm run test:release` entries were each executed. All declared commands exited 0.

| Claim id | Declared command | Result | Evidence |
| --- | --- | --- | --- |
| `demo-isolated` | Playwright grep | PASS | Demo key changed; real sentinel did not. |
| `local-catalogue` | Playwright grep | PASS | Local state and same-origin app requests asserted. |
| `privacy-requests` | Playwright grep | PASS | Only the disclosed GitHub API third party; no cookies. |
| `core-free` | Playwright grep | PASS | Core controls enabled without checkout. |
| `offline-demo` | Playwright grep | **Declared command PASS; live claim FAIL** | Test uses `/demo/` plus an extra online reload; exact advertised `/demo/?demo=1` falls back to home offline. See F-2-1. |
| `nested-library-scan` | Rust filtered test | PASS | Metadata/protection fixture passed. |
| `source-preserved` | Rust filtered test | PASS | Source bytes remained exact. |
| `pdf-metadata` | Rust filtered test | PASS | UTF-16/PDFDocEncoding fixture passed. |
| `ordered-collections` | Playwright grep | PASS | Search and ordered safe paths passed. |
| `verified-usb-copy` | Rust filtered test | PASS | Exact copy and unchanged repeat passed. |
| `usb-partial-copy` | Rust filtered test | PASS | Existing verified destination survived. |
| `webdav-credentials` | Playwright grep | PASS | Credentials cleared and were not stored. |
| `webdav-transfer` | Rust filtered test | PASS | HTTPS rule, fixture requests, paths, and bytes passed. |
| `highlight-import-formats` | Rust filtered test | PASS | All listed fixtures imported. |
| `markdown-export` | Playwright grep | PASS | Downloaded Markdown content passed. |
| `release-manifest` | Vitest release suite | PASS | Platform artifacts, hashes, workflow, and loaders passed. |
| `unsigned-installers` | Vitest release suite | PASS | Signing identities absent and disclosure present. |

No other landing or README capability statement lacks a matching claim entry after accounting for combined claims. F-2-5 is the one unsupported and inaccurate default-behavior statement.

## Earlier finding verification

Every finding in `.factory/review-1.md` and every asserted repair in `.factory/polish-1.md` was checked on the live site and in source.

| Earlier id | Live and source check | Result |
| --- | --- | --- |
| `F-1-1` | Demo primary action is **Search the sample catalogue**, opens Catalogue, and focuses Search. | Fixed |
| `F-1-2` | Filtered `Zoë` view resets to blank search, all formats, Catalogue, and four rows. | Fixed |
| `F-1-3` | Demo and 404 have wordmark, Home/Demo/Privacy/Terms navigation, legal footer, version, and factory credit. | Fixed |
| `F-1-4` | Home, demo, privacy, terms, and 404 focus the h1 and populate the polite route announcement. | Fixed |
| `F-1-5` | Offline wording is narrowed, release/signing claims have entries, and release-loader wording matches the code. | Fixed as originally scoped; F-2-1 is a new exact-URL test gap. |

The earlier handoff’s feature checks were also rerun through all 17 claim commands. No earlier finding is being carried forward under its old id.

## Structure, links, accessibility, and identity

- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200. A missing route returns the designed 404 with HTTP 404 and a route home.
- Every checked page has `lang="en"`, one h1, one main, a route-specific title, description, canonical, OG image, favicon, and touch icon.
- Titles follow the required pattern and remain under 60 characters.
- Header/footer links are consistent on demo, privacy, terms, and 404. Home includes its appropriate section navigation.
- Deep links load directly. Browser back restores the prior location and route loads focus/announce the new h1.
- All internal links, GitHub source/release links, current platform downloads, social image, icons, installers, robots, and sitemap returned 200 after redirects. Mail links were excluded as allowed.
- Security headers include CSP, `frame-ancestors 'none'`, `X-Content-Type-Options`, and `Referrer-Policy`; no CSP or page console errors appeared on successful routes.
- `npx @axe-core/cli` with matching Chrome/ChromeDriver reported zero violations on home, demo, privacy, terms, and the designed 404. `/opt/fleet/lib/verify-url.sh` reported title/lang/main/alt/console checks clean.
- The mobile pages have no horizontal overflow; keyboard focus is visible, targets meet the 44 px suite threshold, and reduced motion is covered.
- The concrete, paper, graphite, and moss archive-table treatment, original reader still life, ruled cards, and offset controls are recognizably product-specific and match `.factory/design.md`; this is not a generic SaaS surface.

## Copy audit

Counts use visible words; hyphenated compounds, paths, URLs, and version strings count as one. Code blocks are commands, not sentences. Headings, fragments, facts, and action labels are included because the supplied rules apply to them. No sentence exceeds 22 words and no banned word appears.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Desktop app for DRM-free books | 5 | — |
| Organize and sideload your e-ink library. | 6 | — |
| For e-ink reader owners who keep EPUB and PDF files, collections and highlights stay under your control. | 17 | — |
| Try it with sample data | 5 | — |
| Open a ready sample catalogue. | 5 | — |
| Download for your computer | 4 | — |
| Download for Linux 64-bit | 4 | — |
| Detecting your platform… | 3 | — |
| Version 0.1.4 · Reader.Sideload.Library_0.1.4_amd64.AppImage | 3 | — |
| View downloads for Linux 64-bit | 5 | — |
| Release links resolve on the deployed site | 7 | — |
| Local preview: GitHub’s latest-release page remains available. | 7 | — |
| See other platforms and install methods | 6 | — |
| Choose the files and destination for each transfer. | 8 | — |
| No account or passive app traffic | 6 | F-2-6: jargon; rewrite above. |
| Catalogue, collection, and Markdown tools reopen offline after the first sample visit | 12 | F-2-1: live advertised path fails. |
| USB and WebDAV tools are free | 6 | — |
| How it works | 3 | — |
| Move your library in three steps. | 6 | — |
| Review what the app finds before any book is copied. | 10 | — |
| Scan your book folder | 4 | — |
| Choose DRM-free EPUB and PDF files. | 6 | — |
| Review titles, authors, covers, and protected-file warnings. | 7 | — |
| Set the reading order | 4 | — |
| Arrange collections. | 2 | — |
| Numbered folders and filenames preserve that order in the transfer plan. | 10 | — |
| Copy books and export notes | 5 | F-2-4: use “highlights.” |
| Copy selected books by USB. | 5 | — |
| Import reader notes and export them as Markdown. | 8 | F-2-4: use “highlights.” |
| Live catalogue preview | 3 | — |
| Find metadata problems before copying. | 5 | — |
| Search titles, authors, and series. | 6 | — |
| Missing covers and protected files stay visible before transfer. | 8 | — |
| EPUB and PDF files | 4 | — |
| Ordered collections | 2 | — |
| Portable Markdown notes | 3 | F-2-4: use “highlights.” |
| Open the sample catalogue | 4 | — |
| Scope and privacy | 3 | — |
| See where your library data goes. | 7 | — |
| Your catalogue stays on this computer | 6 | — |
| No product account or cloud catalogue | 6 | — |
| No analytics, advertising, or passive app requests | 7 | F-2-6: use “background network requests.” |
| WebDAV details are never written to app storage | 8 | — |
| Transfers happen only when you start them | 7 | — |
| USB copies go to the folder you choose | 8 | — |
| WebDAV sends selected books to your server | 7 | — |
| The app clears the password after each attempt | 8 | — |
| WebDAV is included. | 3 | — |
| Check the connection first to get specific help for address, sign-in, permission, and storage errors. | 15 | — |
| Install the desktop app | 4 | — |
| Download it for your computer. | 5 | — |
| Version 0.1.4. | 2 | — |
| Installers are not code-signed. | 5 | — |
| Each release includes SHA-256 checksums. | 5 | — |
| macOS | 1 | — |
| Apple silicon and Intel disk images. | 6 | — |
| Download .dmg | 2 | — |
| Unsigned: right-click the app, then choose Open. | 7 | — |
| Windows | 1 | — |
| 64-bit MSI installer. | 3 | — |
| Download .msi | 2 | — |
| Windows may show an unsigned publisher warning. | 7 | — |
| Linux | 1 | — |
| AppImage and Debian package. | 4 | — |
| Download AppImage | 2 | — |
| Make executable, then run. | 4 | — |
| A `.deb` is in the release. | 6 | — |
| Copy | 1 | F-2-3: does not name the copied result. |
| Copy | 1 | F-2-3: does not name the copied result. |
| Copied | 1 | F-2-3: success state does not name the copied result. |
| Select command | 2 | F-2-3: fallback does not name the command’s purpose. |
| Checking the latest verified release… | 5 | — |
| Release downloads open on GitHub. | 5 | — |
| The release manifest could not be reached. | 7 | — |
| GitHub’s latest-release page remains available. | 5 | — |
| Release 0.1.4 found. | 3 | — |
| SHA-256 checksums are published beside every installer. | 7 | — |
| Organize DRM-free books for an e-ink reader. | 7 | — |
| Built by Param Factory | 4 | — |
| Hero imagery generated for this product with the factory image model. | 11 | — |

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Reader Sideload Library | 3 | — |
| Reader Sideload Library is a desktop utility for e-ink reader owners with DRM-free EPUB and PDF files. | 17 | — |
| It checks metadata, creates ordered device folders, copies books by USB, and exports highlights as Markdown. | 16 | — |
| Live site: `https://reader-sideload-library.sociobot.in` | 3 | — |
| One-click sample: `https://reader-sideload-library.sociobot.in/demo/?demo=1` | 3 | — |
| Who it is for | 4 | — |
| It is for people who own book files and use e-ink readers. | 12 | — |
| It suits people who need a focused alternative to a full library manager. | 13 | F-2-7: subjective and vague. |
| It is not an ebook store, DRM-removal tool, reader, or firmware project. | 12 | — |
| What works in v0.1 | 4 | — |
| Recursive EPUB/PDF scan with embedded title, author, series, cover, encryption, and file validation | 13 | — |
| Searchable catalogue saved on this computer, with clear warnings and opt-in inclusion | 12 | F-2-5: inaccurate default and unlisted claim. |
| Ordered collections become safe numbered folders and files | 8 | — |
| USB sync preserves source bytes, verifies copied bytes, and skips an unchanged repeat copy | 14 | — |
| WebDAV sync checks HTTPS, tests the connection, and explains what to fix | 12 | — |
| Import Markdown, text, JSON, KOReader notes, and PDF annotations. | 9 | — |
| Export plain Markdown. | 3 | — |
| Catalogue, collection, and Markdown tools reopen offline after the first demo visit | 12 | F-2-1: live advertised path fails. |
| Try the sample | 3 | — |
| Open `/demo/?demo=1` or choose Load sample project on the app’s first screen. | 12 | — |
| The sample includes four books, one ordered collection, and two highlights. | 11 | — |
| Search the books, reorder the collection, and export the two highlights as Markdown. | 13 | — |
| Demo changes use `demo:rsl:library-state:v1`. | 4 | — |
| They never read or replace the real `rsl:library-state:v1` catalogue. | 9 | — |
| The sample demo sends no catalogue or interaction data to another origin. | 12 | — |
| Use Reset demo to restore it, or Start for real to discard it. | 13 | — |
| Set up WebDAV | 3 | — |
| Install the desktop app and scan your book folder. | 9 | — |
| Open Transfer & notes. | 4 | F-2-4: use “highlights” for this concept. |
| Copy the HTTPS WebDAV folder address from your storage provider. | 10 | — |
| Enter the provider username and an app password when the provider offers one. | 13 | — |
| Choose Check connection. | 3 | — |
| The app distinguishes address, sign-in, permission, and storage errors. | 9 | — |
| Choose Sync with WebDAV after the check succeeds. | 8 | — |
| The app never writes the WebDAV address, username, or password to app storage. | 13 | — |
| It clears the password after each check or sync attempt. | 10 | — |
| If a transfer stops, fix the reported cause and sync again. | 11 | — |
| Install | 1 | — |
| Download the detected platform installer from the product site or the latest GitHub release. | 14 | — |
| macOS and Linux | 3 | — |
| Windows PowerShell | 2 | — |
| Installers are not code-signed. | 5 | — |
| On macOS, right-click the app and choose Open the first time. | 11 | — |
| Windows may show an unknown-publisher prompt. | 6 | — |
| Verify any download against `SHA256SUMS` in the release. | 8 | — |
| Develop | 1 | — |
| Requirements: Node.js 22+ and Rust stable. | 6 | — |
| Native desktop development also needs the Tauri 2 system prerequisites. | 10 | — |
| On Ubuntu that includes `file`, `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf`. | 10 | — |
| `npm run build:site` is the factory deploy command. | 8 | — |
| Its deploy root is exactly `dist/site`, with `index.html` at that root. | 11 | — |
| `npm run build` also copies the landing page to `dist/index.html`. | 10 | — |
| `npm test` runs Rust core tests without the platform GUI libraries. | 11 | — |
| Run `CI=true npm run tauri build` with the platform prerequisites to build installers. | 13 | — |
| Architecture and privacy | 3 | — |
| The frontend is Vite + vanilla TypeScript. | 6 | — |
| The Tauri Rust code scans files, copies books, reads PDF annotations, and sends WebDAV requests. | 15 | — |
| Catalogue data stays in local browser/WebView storage. | 7 | — |
| The app makes no passive network requests. | 7 | F-2-6: jargon; rewrite above. |
| The website and demo use no analytics, advertising, CDN font, third-party runtime script, or cookies. | 15 | — |
| The production landing page contacts GitHub's public releases API to resolve current installer links. | 14 | — |
| See the site’s privacy policy and terms. | 7 | — |
| Source book files are read for metadata and are not rewritten. | 11 | — |
| Protected media is excluded rather than decrypted. | 7 | — |
| The app keeps PDF titles and authors readable across common encodings. | 11 | — |
| Imported highlights export as plain Markdown. | 6 | — |
| Releases | 1 | — |
| Tagging `v*` runs `.github/workflows/release.yml`. | 4 | — |
| It builds installers for macOS Intel and Apple silicon, Windows x64, and Linux x64. | 14 | — |
| The release includes `SHA256SUMS` and `latest.json`. | 6 | — |
| The landing page reads GitHub release metadata. | 7 | — |
| The one-line installers read `latest.json` and verify the selected file before installation. | 12 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |
| Self-hosted typefaces have their own SIL Open Font License; see `THIRD_PARTY_NOTICES.md`. | 11 | — |

### Terminology check

| Concept | Current terms | Required single term |
| --- | --- | --- |
| Local book index | catalogue | catalogue |
| Ordered reader group | collection | collection |
| Transfer to a reader | copy / sideload | Use “sideload” for the product job and “copy” for a concrete control. |
| Imported reader annotations | highlights / notes | highlights (F-2-4) |
| Example workspace | sample / demo | “sample data” for content; “demo” for mode. |
| Network folder protocol | WebDAV | WebDAV |

## Missed leverage

The brief’s obvious high-value adjacent actions are already present: recursive import, ordered collection export, USB transfer, WebDAV sync, multi-format highlight import, and Markdown export. An AI step would add network/key complexity without improving the core deterministic job, so no missing AI feature is recorded. No provider keys or decorative AI feature are present.

## Quality gates

- `npm test`: PASS — 17 one-to-one claim mappings, 6 Vitest tests, 10 Rust tests, and 56 Playwright tests.
- `npm run build`: PASS — `dist/`, `dist/site/`, and the app bundle were produced; landing JS is 1.50 kB gzip and app JS is 7.85 kB gzip.
- Live axe CLI: PASS — zero violations on five routes.
- Live verify-url: PASS — title, language, h1, main, alt text, button labels, and console checks.
- Link crawl: PASS for all discovered HTTP links and published installer targets.

These green automated gates do not override F-2-1 because its test does not use the advertised query-string demo entry.

## What would make this perfect

Fix and directly test the first offline reload of `/demo/?demo=1`; move the three factual lines into both first viewports; replace the two generic **Copy** labels; standardize **highlights** terminology; and rewrite the inaccurate/vague README and privacy phrases. Then rerun the exact live offline sequence, all 17 claim commands, full tests, build, link crawl, and accessibility checks. A perfect result requires zero remaining findings.
