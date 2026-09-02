# Review 3 — Reader Sideload Library

**Verdict: FAIL**

Review date: 2 September 2026  
Scope: live site at <https://reader-sideload-library.sociobot.in>, clean checkout `31e7037c8c887e0dcf95f345ef3f3f2824748ba1`, and the shipped source.

There are three minor findings and no blocking findings. The first read, demo, storage boundary, declared claims, routes, links, build, and accessibility checks pass. The required verdict is still FAIL because PASS requires zero findings.

## Cold first visit

I opened the live home page in fresh Chromium contexts at 390×844 and 1440×900 before scrolling.

- **What it does:** A desktop app that organizes DRM-free EPUB/PDF files and sideloads them to an e-ink reader.
- **Who it is for:** E-ink reader owners who keep their own book files, collections, and highlights.
- **What to click first:** **Try it with sample data**, which says it opens a ready sample catalogue.

All three answers are explicit on both first screens. The sample action and the privacy, offline, and price facts are visible without scrolling, so the first-read blocking condition does not apply.

## Findings

### F-3-1 — MINOR — non-home routes do not ship complete Twitter card metadata

**Location and exact markup:** `/demo/`, `/privacy/`, `/terms/`, and `/404.html` include only `<meta name="twitter:card" content="summary_large_image">`. They omit route-specific `twitter:title`, `twitter:description`, and `twitter:image` tags. The home page includes all four tags.

**Why this matters:** The supplied site-structure contract requires a title, description, and product image for both Open Graph and Twitter cards on every route. These pages currently rely on a crawler falling back from Twitter fields to Open Graph fields, so shared deep links do not carry the complete declared metadata contract.

**Concrete fix:** Add route-specific `twitter:title` and `twitter:description` tags plus `twitter:image=https://reader-sideload-library.sociobot.in/assets/social-card.jpg` to all four documents. Extend the metadata test to inspect every route, not only `/`.

### F-3-2 — MINOR — the external source link does not say that it leaves the site

**Location and exact text:** Landing footer: **“Source”**, linked to `https://github.com/B-Divyesh/sf-reader-sideload-library`.

**Why this matters:** The site-structure contract says external links must identify themselves. “Source” does not tell a keyboard or screen-reader user that the destination is GitHub and outside the product site.

**Concrete fix:** Rename it **“Source on GitHub (external)”**, or keep the visible label and add an accessible external-destination suffix. Add a route test that every non-download cross-origin link names its external destination.

### F-3-3 — MINOR — three app labels use mood or metaphor instead of naming the section

**Location and exact text:** First-run desktop app: **“Local field tool”**; Collections panel: **“Order survives the cable”**; Transfer panel: **“A deliberate handoff.”** The latter two remain present in demo mode when their tabs are opened.

**Why this matters:** These labels do not tell a first-time visitor what the adjacent section contains. “Order survives the cable” is also narrower than the panel because the product supports WebDAV. The supplied plain-words rule excludes mood lines and metaphors that carry no usable information.

**Concrete fix:** Use direct labels such as **“Desktop app for DRM-free books”**, **“Ordered device folders”**, and **“USB, WebDAV, and Markdown export.”** Add these app strings to the copy audit so future checks cover the working interface as well as the landing page.

## Demo, sandbox, and privacy

- The landing action reaches `/demo/?demo=1` in one click.
- The first demo screen already shows a four-book catalogue with realistic titles, authors, formats, series data, readiness states, and two issues.
- The persistent banner says **“Demo — sample data, nothing is saved to your library”** and includes **Reset demo** and **Start for real**.
- **Search the sample catalogue** focuses the working search field and filters the visible sample.
- After search, format filtering, and a tab change, **Reset demo** restored blank search, `all` formats, Catalogue, four rows, and focus on the Catalogue heading.
- A seeded `rsl:library-state:v1` sentinel remained byte-for-byte unchanged; demo state used `demo:rsl:library-state:v1`.
- A fresh direct `/demo/?demo=1` request log contained no cross-origin requests. The landing page made only its disclosed GitHub releases API request and set no cookies.
- After one online visit, a fresh context reloaded the exact advertised demo URL offline with the demo title, banner, and four books.

No demo defect is blocking this round.

## Claims check

`.factory/claims.json` has 17 claims and 17 unique test markers. Every listed command was run from the clean checkout after `npm ci`; the duplicate `npm run test:release` command was run for both listed claims. All exited 0.

| Claim id | Result | Evidence checked |
| --- | --- | --- |
| `demo-isolated` | PASS | Real-state sentinel unchanged; demo key changed; Reset restored the visible initial state. |
| `local-catalogue` | PASS | Added EPUB, collection, and highlights stayed in app storage; requests stayed same-origin. |
| `privacy-requests` | PASS | Only the disclosed GitHub API request occurred outside product origins; cookie jar stayed empty. |
| `core-free` | PASS | Catalogue, collections, highlights, and WebDAV controls worked without a license or checkout. |
| `offline-demo` | PASS | Exact `/demo/?demo=1` first-visit path reopened offline with four books. |
| `nested-library-scan` | PASS | Native nested EPUB/PDF metadata and protection fixture passed. |
| `source-preserved` | PASS | Native source-byte comparison passed. |
| `pdf-metadata` | PASS | Native UTF-16/PDFDocEncoding values matched exactly. |
| `ordered-collections` | PASS | Unicode search and three ordered device-safe paths passed. |
| `verified-usb-copy` | PASS | Native byte verification and unchanged-repeat skip passed. |
| `usb-partial-copy` | PASS | Existing verified destination survived the injected partial copy. |
| `webdav-credentials` | PASS | Credentials were cleared, not stored, and recovery guidance appeared. |
| `webdav-transfer` | PASS | HTTPS rule, destination check, authentication, folders, paths, and exact bytes passed. |
| `highlight-import-formats` | PASS | Markdown, text, JSON, KOReader, and annotated-PDF fixtures passed. |
| `markdown-export` | PASS | Downloaded Markdown contained the expected heading and sample quote. |
| `release-manifest` | PASS | Required platforms, hashes, publication action, and metadata consumers passed. |
| `unsigned-installers` | PASS | Signing identities were absent and public disclosure was present. |

I matched capability and privacy statements on the live landing page and README to these entries. No unlisted claim or untested quantitative claim was found.

## Earlier finding verification

Every finding in `.factory/review-1.md` and `.factory/review-2.md`, both polish reports, and the prior handoff were read. Each earlier finding was checked in the current live site and source rather than accepted from its status label.

| Earlier id | Current live/source check | Result |
| --- | --- | --- |
| `F-1-1` | Demo replaces the unavailable folder picker with **Search the sample catalogue**, which focuses Search and performs a real sample task. | Confirmed fixed |
| `F-1-2` | Reset clears search/filter, selects Catalogue, restores four rows, focuses its heading, and preserves real state. | Confirmed fixed |
| `F-1-3` | Demo and 404 now have wordmark, Home/Demo/Privacy/Terms navigation, legal footer, version, and factory credit. | Confirmed fixed |
| `F-1-4` | Home, demo, privacy, terms, and 404 focus and announce their h1 on load; browser back returns focus to the home h1. | Confirmed fixed |
| `F-1-5` | Offline, release, signing, and request wording has matching claim coverage and matches the implemented paths. | Confirmed fixed |
| `F-2-1` | The exact advertised query-string demo path reopens offline after its first visit. | Confirmed fixed |
| `F-2-2` | Audience, sample action, and all three facts fit within 1366×768 and 390×844. | Confirmed fixed |
| `F-2-3` | Both controls say **Copy install command**; success and fallback states name the result. | Confirmed fixed |
| `F-2-4` | Landing, app, README, claims, and docs consistently use **highlights**; KOReader inputs are **sidecars**. | Confirmed fixed |
| `F-2-5` | README now says **per-book inclusion controls**, matching selected eligible books and opt-out controls. | Confirmed fixed |
| `F-2-6` | **Background network requests** replaces “passive traffic/requests” in visible copy and claims. | Confirmed fixed |
| `F-2-7` | README now names folder order and highlight export instead of calling the product a “focused alternative.” | Confirmed fixed |

No earlier finding regressed, so none is repeated under its old id.

## Structure, links, accessibility, and visual identity

- `/`, `/demo/?demo=1`, `/privacy/`, and `/terms/` returned 200. An unknown route returned the designed 404 with HTTP 404 and a home action.
- Every checked route has `lang="en"`, one h1, one main, a route-specific title, description, canonical, Open Graph image, favicon, 180×180 touch icon, focused h1, and a polite route announcement.
- The 1200×630 social card is real product artwork. F-3-1 records the missing route-level Twitter fields.
- Browser back restored the home URL, scroll position, h1 focus, and route announcement.
- The link crawl found no dead link: internal pages returned 200, the source repository returned 200, and current installer targets returned expected GitHub download redirects. F-3-2 records the missing external label.
- Live response headers include CSP with `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy`, Permissions Policy, and HSTS. No console or CSP error was recorded.
- Playwright axe-core reported zero violations on home, demo, privacy, terms, and the live 404. The factory URL verifier passed title, language, main, alt text, button labels, and console checks. The standalone axe CLI could not start because its downloaded ChromeDriver 152 did not match the preinstalled Chromium 145; the repository's Playwright axe integration ran the same axe-core 4.10.3 checks successfully.
- The desktop and mobile layouts do not overflow at 390 px; keyboard tab navigation, 44 px controls, dark mode, and reduced motion pass the suite.
- The concrete, paper, graphite, and moss archive-table system is distinctive and matches `.factory/design.md`. The original generated still life has recorded provenance. This is not a generic SaaS template.
- `robots.txt` and `sitemap.xml` are present and list all indexable routes.

## Copy audit

Counts use whitespace-separated visible words; hyphenated compounds, paths, URLs, and version strings count as one. Repeated navigation labels are consolidated. Code blocks are commands rather than sentences. Headings, facts, and action labels are included because the supplied rules apply to them.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Reader Sideload Library — organize e-ink libraries | 6 | — |
| Organize DRM-free EPUB and PDF files, make ordered e-ink reader collections, copy by USB, and export highlights as Markdown. | 19 | — |
| Desktop app for DRM-free books | 5 | — |
| Organize and sideload your e-ink library. | 6 | — |
| For e-ink reader owners who keep EPUB and PDF files, collections and highlights stay under your control. | 17 | — |
| Try it with sample data | 5 | — |
| Open a ready sample catalogue. | 5 | — |
| No account or background network requests | 6 | — |
| Catalogue, collection, and Markdown tools reopen offline after the first sample visit | 12 | — |
| USB and WebDAV tools are free | 6 | — |
| Download for your computer | 4 | — |
| Download for Linux 64-bit | 4 | — |
| Detecting your platform… | 3 | — |
| Version 0.1.6 · Reader.Sideload.Library_0.1.6_amd64.AppImage | 3 | — |
| View downloads for Linux 64-bit | 5 | — |
| Release downloads open on GitHub | 5 | — |
| See other platforms and install methods | 6 | — |
| Choose the files and destination for each transfer. | 8 | — |
| How it works | 3 | — |
| Move your library in three steps. | 6 | — |
| Review what the app finds before any book is copied. | 10 | — |
| Scan your book folder | 4 | — |
| Choose DRM-free EPUB and PDF files. | 6 | — |
| Review titles, authors, covers, and protected-file warnings. | 7 | — |
| Review first | 2 | — |
| Set the reading order | 4 | — |
| Arrange collections. | 2 | — |
| Numbered folders and filenames preserve that order in the transfer plan. | 10 | — |
| Preview names | 2 | — |
| Copy books and export highlights | 5 | — |
| Copy selected books by USB. | 5 | — |
| Import highlights and export them as Markdown. | 7 | — |
| You choose | 2 | — |
| Live catalogue preview | 3 | — |
| Find metadata problems before copying. | 5 | — |
| Search titles, authors, and series. | 6 | — |
| Missing covers and protected files stay visible before transfer. | 8 | — |
| EPUB and PDF files | 4 | — |
| Ordered collections | 2 | — |
| Portable Markdown highlights | 3 | — |
| Open the sample catalogue | 4 | — |
| Scope and privacy | 3 | — |
| See where your library data goes. | 7 | — |
| Your catalogue stays on this computer | 6 | — |
| No product account or cloud catalogue | 6 | — |
| No analytics, advertising, or background network requests | 7 | — |
| WebDAV details are never written to app storage | 8 | — |
| Transfers happen only when you start them | 7 | — |
| USB copies go to the folder you choose | 8 | — |
| WebDAV sends selected books to your server | 7 | — |
| The app clears the password after each attempt | 8 | — |
| WebDAV is included. | 3 | — |
| Check the connection first to get specific help for address, sign-in, permission, and storage errors. | 15 | — |
| Install the desktop app | 4 | — |
| Download it for your computer. | 5 | — |
| Version 0.1.6. | 2 | — |
| Installers are not code-signed. | 4 | — |
| Each release includes SHA-256 checksums. | 5 | — |
| Apple silicon and Intel disk images. | 6 | — |
| Download .dmg | 2 | — |
| Unsigned: right-click the app, then choose Open. | 7 | — |
| 64-bit MSI installer. | 3 | — |
| Download .msi | 2 | — |
| Windows may show an unsigned publisher warning. | 7 | — |
| AppImage and Debian package. | 4 | — |
| Download AppImage | 2 | — |
| Make executable, then run. | 4 | — |
| A .deb is in the release. | 6 | — |
| Copy install command | 3 | — |
| Install command copied | 3 | — |
| Select install command | 3 | — |
| Checking the latest verified release… | 5 | — |
| The release manifest could not be reached. | 7 | — |
| GitHub’s latest-release page remains available. | 5 | — |
| Release 0.1.6 found. | 3 | — |
| SHA-256 checksums are published beside every installer. | 7 | — |
| Organize DRM-free books for an e-ink reader. | 7 | — |
| Built by Param Factory | 4 | — |
| Hero imagery generated for this product with the factory image model. | 11 | — |
| Source | 1 | F-3-2: external destination is not named. Rewrite: **Source on GitHub (external)**. |

No landing sentence exceeds 22 words or contains a banned marketing word. Buttons use result-naming verbs. F-3-2 is the only landing-label flag.

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
| It is for people who want folder order and highlight export without a full library manager. | 16 | — |
| It is not an ebook store, DRM-removal tool, reader, or firmware project. | 12 | — |
| What works in v0.1 | 4 | — |
| Recursive EPUB/PDF scan with embedded title, author, series, cover, encryption, and file validation | 13 | — |
| Searchable catalogue saved on this computer, with warnings and per-book inclusion controls | 12 | — |
| Ordered collections become safe numbered folders and files | 8 | — |
| USB sync preserves source bytes, verifies copied bytes, and skips an unchanged repeat copy | 14 | — |
| WebDAV sync checks HTTPS, tests the connection, and explains what to fix | 12 | — |
| Import Markdown, text, JSON, KOReader sidecars, and PDF highlights. | 9 | — |
| Export plain Markdown. | 3 | — |
| Catalogue, collection, and Markdown tools reopen offline after the first sample visit | 12 | — |
| Try the sample | 3 | — |
| Open `/demo/?demo=1` or choose **Load sample project** on the app’s first screen. | 12 | — |
| The sample includes four books, one ordered collection, and two highlights. | 11 | — |
| Search the books, reorder the collection, and export the two highlights as Markdown. | 13 | — |
| Demo changes use `demo:rsl:library-state:v1`. | 4 | — |
| They never read or replace the real `rsl:library-state:v1` catalogue. | 9 | — |
| The sample demo sends no catalogue or interaction data to another origin. | 12 | — |
| Use **Reset demo** to restore it, or **Start for real** to discard it. | 13 | — |
| Set up WebDAV | 3 | — |
| Install the desktop app and scan your book folder. | 9 | — |
| Open **Transfer & highlights**. | 4 | — |
| Copy the HTTPS WebDAV folder address from your storage provider. | 10 | — |
| Enter the provider username and an app password when the provider offers one. | 13 | — |
| Choose **Check connection**. | 3 | — |
| The app distinguishes address, sign-in, permission, and storage errors. | 9 | — |
| Choose **Sync with WebDAV** after the check succeeds. | 8 | — |
| The app never writes the WebDAV address, username, or password to app storage. | 13 | — |
| It clears the password after each check or sync attempt. | 10 | — |
| If a transfer stops, fix the reported cause and sync again. | 11 | — |
| Install | 1 | — |
| Download the detected platform installer from the product site or the latest GitHub release. | 14 | — |
| macOS and Linux | 3 | — |
| Windows PowerShell | 2 | — |
| Installers are not code-signed. | 4 | — |
| On macOS, right-click the app and choose **Open** the first time. | 11 | — |
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
| The app makes no background network requests. | 7 | — |
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

No README sentence exceeds 22 words, uses a banned marketing adjective, or changes terminology. No README copy finding remains.

### Terminology

| Concept | Consistent term |
| --- | --- |
| Local book index | catalogue |
| Ordered reader group | collection |
| Transfer to a reader | sideload for the job; copy for a concrete operation |
| Reader annotations | highlights |
| KOReader import file | sidecar |
| Example content / isolated state | sample data / demo |
| Network folder protocol | WebDAV |

## Missed leverage

The brief's expected adjacent capabilities are present: recursive import, search, ordered collection planning, USB transfer, WebDAV sync, multi-format highlight import, and Markdown export. These are deterministic local-file tasks; an AI feature would add network and key handling without solving an implied missing job. No decorative AI or embedded provider key is present. No missed-leverage finding is recorded.

## Quality gates

- Every command in `.factory/claims.json`: PASS (17/17).
- `npm test`: PASS — 17 claim mappings, 6 Vitest tests, 10 Rust tests, and 56 Playwright tests.
- `npm run build`: PASS — produced `dist/`, `dist/site/`, and the desktop app bundle; landing JavaScript is 1.51 kB gzip.
- Live verification script: PASS, including exact-path offline reload, demo reset/isolation, first-screen bounds, route focus, console, and axe checks.
- Factory URL verifier: PASS with no browser errors.
- Playwright axe-core 4.10.3: zero violations on all five checked live routes.
- Live link crawl: PASS for all discovered internal, source, and current installer targets.

## What would make this perfect

Add complete Twitter title/description/image metadata to every non-home route, identify the GitHub source link as external, and replace the three app mood/metaphor labels with section names that describe the work. Then rerun the metadata, link-label, copy, and existing regression checks. A perfect result requires zero findings.
