# Review 4 — Reader Sideload Library

**Verdict: FAIL**

Review date: 2026-09-02  
Scope: live site at <https://reader-sideload-library.sociobot.in/>, repository commit `d41731880aa6993d200d90fb6026807424e1ea88`, and a new local clone of that commit.

There is one minor finding. A PASS requires no findings of any severity.

## Cold first visit

I opened a fresh browser context at 390×844 and 1366×768 before scrolling. Both first screens answered all three first-read questions:

- **What it does:** organizes DRM-free EPUB/PDF files, makes ordered reader collections, copies books by USB, and exports highlights as Markdown.
- **Who it is for:** e-ink reader owners who keep EPUB and PDF files.
- **What to click first:** **Try it with sample data**; its adjacent text says **“Open a ready sample catalogue.”**

The exact first-screen headline is **“Organize and sideload your e-ink library.”** The audience sentence is **“For e-ink reader owners who keep EPUB and PDF files, collections and highlights stay under your control.”** The three facts are visible before the bottom of both test viewports. The mobile document width was `390px` for a `390px` viewport; neither page recorded a JavaScript or CSP console error. This check passes.

## Findings

### F-4-1 — MINOR — a workflow label is a vague slogan rather than useful text

**Location:** landing page, **How it works** step 03; `site/index.html`.

**Exact text:** **“You choose”** (2 words), shown beside **“Copy books and export highlights.”**

**Why this fails the copy check:** The label does not identify an action, result, or product fact. It could be placed unchanged on an unrelated product page and asks a first-time visitor to infer its meaning from surrounding copy. The plain-words rule excludes decorative labels and headings that do not carry usable information.

**Concrete fix:** Delete the label, because the step title and body already name the work. If a status label is retained, change it to **“Choose transfer destination”** and make the step explain that destination choice.

## Demo, sandbox, and privacy checks

- The landing action opens `/demo/?demo=1` in one click. The first screen is a working four-book catalogue, not a marketing mock-up: it shows titles, authors, EPUB/PDF formats, a missing-cover warning, an excluded protected PDF, the **Autumn Queue** collection, and two highlights.
- The persistent banner says **“Demo — sample data, nothing is saved to your library”** and includes **Reset demo** and **Start for real**.
- **Search the sample catalogue** focused the real `#search` field. Searching `Zoë` reduced the visible table to one record. **Reset demo** restored an empty search, `all` format filter, the Catalogue tab, four rows, focus on `#catalogue-heading`, and the bundled sample.
- With a pre-seeded `rsl:library-state:v1` real-state sentinel, the demo changed only `demo:rsl:library-state:v1`; the sentinel remained byte-for-byte unchanged.
- The fresh demo request log contained only the product origin and self-hosted assets. The claim test’s landing flow permits only the disclosed GitHub Releases API request; the cookie jar remained empty.
- The clean-checkout `@claim:offline-demo` test passed. It opens the exact advertised query-string URL once, turns the context offline, reloads it, and observes the banner and four sample books.

The demo is isolated and tryable. No demo finding is recorded.

## Claims check

`.factory/claims.json` has 17 entries and the repository’s inventory check confirmed 17 unique `@claim:` markers. I ran every listed `test` command from a fresh clone after `npm ci`; all passed. The repeated `npm run test:release` command was run for both claims that list it.

| Claim id | Result |
| --- | --- |
| `demo-isolated` | PASS |
| `local-catalogue` | PASS |
| `privacy-requests` | PASS |
| `core-free` | PASS |
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

I cross-checked the live landing page and README against that inventory. The observable capability, privacy, signing, release, and offline statements have corresponding entries; no additional unlisted claim was found.

## Earlier finding verification

I read every earlier review, polish report, and handoff. The following checks were made on the current live product and source, rather than relying on the prior “fixed” labels.

| Earlier id | Current verification | Result |
| --- | --- | --- |
| `F-1-1` | Demo offers **Search the sample catalogue**, which focuses Search and completes a usable sample task; it does not offer the unavailable folder picker. | Fixed |
| `F-1-2` | Reset clears search/filter, selects Catalogue, restores four rows, focuses the heading, and preserves real state. | Fixed |
| `F-1-3` | Demo and 404 have a wordmark, Home/Demo/Privacy/Terms navigation, legal footer, version, and factory credit. | Fixed |
| `F-1-4` | Home, demo, Privacy, Terms, and 404 focus and announce their h1 after load. | Fixed |
| `F-1-5` | Privacy, offline, signing, release, and request wording is matched to the 17-item claim inventory and current implementation. | Fixed |
| `F-2-1` | The advertised `/demo/?demo=1` URL passes first-visit offline reload. | Fixed |
| `F-2-2` | The audience, sample action, and three facts fit both 1366×768 and 390×844 first screens. | Fixed |
| `F-2-3` | The copy controls use **Copy install command** and result states name the copied/selected install command. | Fixed |
| `F-2-4` | Site, app, README, claims, and docs consistently call reader annotations **highlights**; KOReader inputs are **sidecars**. | Fixed |
| `F-2-5` | README says **per-book inclusion controls**, matching selected eligible books and opt-out controls. | Fixed |
| `F-2-6` | Current visible wording uses **background network requests**, not “passive traffic.” | Fixed |
| `F-2-7` | README names folder order and highlight export, not a subjective “focused alternative.” | Fixed |
| `F-3-1` | Home, demo, Privacy, Terms, and 404 all have route-specific Twitter title, description, and image fields. | Fixed |
| `F-3-2` | The footer link says **Source on GitHub (external)**. | Fixed |
| `F-3-3` | App labels are **Desktop app for DRM-free books**, **Ordered device folders**, and **USB, WebDAV, and Markdown export**. | Fixed |

No earlier finding regressed. `F-4-1` is a newly found landing-page label omitted from the earlier app-label correction.

## Structure, routing, links, accessibility, and identity

- `/`, `/demo/?demo=1`, `/privacy/`, and `/terms/` returned HTTP 200. `/does-not-exist` returned the styled 404 with HTTP 404 and **Return to the home page**. The browser’s expected network console entry for the deliberately requested 404 was not treated as an application error; no route had a JavaScript or CSP error.
- Each checked route has `lang="en"`, exactly one `<h1>`, one `<main>`, a plain route-specific title, meta description, canonical URL, Open Graph image, favicon, Apple touch icon, polite route announcement, and focused h1.
- The title pattern is correct: home is **“Reader Sideload Library — organize e-ink libraries”**; the other routes use **“Demo/Privacy/Terms/Page not found — Reader Sideload Library.”**
- A live crawl confirmed current internal pages, GitHub source, and installer links return their expected responses. `robots.txt` and `sitemap.xml` are present. The deployment sends CSP including a response-header `frame-ancestors 'none'`, `X-Content-Type-Options`, and `Referrer-Policy`.
- Full clean-clone `npm test` passed: 17-claim inventory, 6 unit tests, 10 Rust tests, and 62 Playwright tests. `npm run build` passed and produced `dist/` and `dist/site/`; landing JavaScript is 1.51 kB gzip.
- The repository’s Playwright axe checks pass. The live mobile page had no horizontal overflow. Its concrete/paper/graphite/moss surface, structural rules, square-offset controls, and original e-ink transfer still life match `.factory/design.md` and are not a generic SaaS template.

## Copy audit

Counts use whitespace-separated visible words; hyphenated compounds, URLs, paths, and version strings count as one. Navigation repetitions are consolidated. Buttons, headings, facts, and runtime states are included. `F-4-1` is the only flag; no landing or README item exceeds 22 words or uses a banned marketing adjective.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Reader Sideload Library — organize e-ink libraries | 6 | — |
| Organize DRM-free EPUB and PDF files, make ordered e-ink reader collections, copy by USB, and export highlights as Markdown. | 19 | — |
| Desktop app for DRM-free books | 5 | — |
| Organize and sideload your e-ink library. | 6 | — |
| For e-ink reader owners who keep EPUB and PDF files, collections and highlights stay under your control. | 17 | — |
| Try it with sample data / Open a ready sample catalogue. | 5 / 5 | — |
| No account or background network requests | 6 | — |
| Catalogue, collection, and Markdown tools reopen offline after the first sample visit | 12 | — |
| USB and WebDAV tools are free | 6 | — |
| Download for Linux 64-bit / Version 0.1.7 · Reader.Sideload.Library_0.1.7_amd64.AppImage | 4 / 3 | — |
| See other platforms and install methods | 6 | — |
| Choose the files and destination for each transfer. | 8 | — |
| How it works / Move your library in three steps. / Review what the app finds before any book is copied. | 3 / 6 / 10 | — |
| Scan your book folder / Choose DRM-free EPUB and PDF files. / Review titles, authors, covers, and protected-file warnings. / Review first | 4 / 6 / 7 / 2 | — |
| Set the reading order / Arrange collections. / Numbered folders and filenames preserve that order in the transfer plan. / Preview names | 4 / 2 / 10 / 2 | — |
| Copy books and export highlights / Copy selected books by USB. / Import highlights and export them as Markdown. | 5 / 5 / 7 | — |
| You choose | 2 | **F-4-1** |
| Live catalogue preview / Find metadata problems before copying. | 3 / 5 | — |
| Search titles, authors, and series. / Missing covers and protected files stay visible before transfer. | 6 / 8 | — |
| EPUB and PDF files / Ordered collections / Portable Markdown highlights / Open the sample catalogue | 4 / 2 / 3 / 4 | — |
| Scope and privacy / See where your library data goes. | 3 / 7 | — |
| Your catalogue stays on this computer / No product account or cloud catalogue / No analytics, advertising, or background network requests / WebDAV details are never written to app storage | 6 / 6 / 7 / 8 | — |
| Transfers happen only when you start them / USB copies go to the folder you choose / WebDAV sends selected books to your server / The app clears the password after each attempt | 7 / 8 / 7 / 8 | — |
| WebDAV is included. / Check the connection first to get specific help for address, sign-in, permission, and storage errors. | 3 / 15 | — |
| Install the desktop app / Download it for your computer. / Version 0.1.7. / Installers are not code-signed. / Each release includes SHA-256 checksums. | 4 / 5 / 2 / 5 / 5 | — |
| Apple silicon and Intel disk images. / Download .dmg / Unsigned: right-click the app, then choose Open. | 6 / 2 / 7 | — |
| 64-bit MSI installer. / Download .msi / Windows may show an unsigned publisher warning. | 3 / 2 / 7 | — |
| AppImage and Debian package. / Download AppImage / Make executable, then run. / A .deb is in the release. | 4 / 2 / 4 / 6 | — |
| Copy install command / Install command copied / Select install command | 3 / 3 / 3 | — |
| Checking the latest verified release… / The release manifest could not be reached. / GitHub’s latest-release page remains available. / Release 0.1.7 found. / SHA-256 checksums are published beside every installer. | 5 / 7 / 5 / 3 / 7 | — |
| Organize DRM-free books for an e-ink reader. / Built by Param Factory / Hero imagery generated for this product with the factory image model. / Source on GitHub (external) | 7 / 4 / 11 / 4 | — |

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Reader Sideload Library | 3 | — |
| Reader Sideload Library is a desktop utility for e-ink reader owners with DRM-free EPUB and PDF files. | 17 | — |
| It checks metadata, creates ordered device folders, copies books by USB, and exports highlights as Markdown. | 16 | — |
| Live site: `https://reader-sideload-library.sociobot.in` / One-click sample: `https://reader-sideload-library.sociobot.in/demo/?demo=1` | 3 / 3 | — |
| Who it is for / It is for people who own book files and use e-ink readers. / It is for people who want folder order and highlight export without a full library manager. / It is not an ebook store, DRM-removal tool, reader, or firmware project. | 4 / 12 / 16 / 12 | — |
| What works in v0.1 | 4 | — |
| Recursive EPUB/PDF scan with embedded title, author, series, cover, encryption, and file validation | 13 | — |
| Searchable catalogue saved on this computer, with warnings and per-book inclusion controls | 12 | — |
| Ordered collections become safe numbered folders and files | 8 | — |
| USB sync preserves source bytes, verifies copied bytes, and skips an unchanged repeat copy | 14 | — |
| WebDAV sync checks HTTPS, tests the connection, and explains what to fix | 12 | — |
| Import Markdown, text, JSON, KOReader sidecars, and PDF highlights. / Export plain Markdown. | 9 / 3 | — |
| Catalogue, collection, and Markdown tools reopen offline after the first sample visit | 12 | — |
| Try the sample / Open `/demo/?demo=1` or choose **Load sample project** on the app’s first screen. / The sample includes four books, one ordered collection, and two highlights. / Search the books, reorder the collection, and export the two highlights as Markdown. | 3 / 12 / 11 / 13 | — |
| Demo changes use `demo:rsl:library-state:v1`. / They never read or replace the real `rsl:library-state:v1` catalogue. / The sample demo sends no catalogue or interaction data to another origin. / Use **Reset demo** to restore it, or **Start for real** to discard it. | 4 / 9 / 12 / 13 | — |
| Set up WebDAV / Install the desktop app and scan your book folder. / Open **Transfer & highlights**. | 3 / 9 / 4 | — |
| Copy the HTTPS WebDAV folder address from your storage provider. / Enter the provider username and an app password when the provider offers one. / Choose **Check connection**. | 10 / 13 / 3 | — |
| The app distinguishes address, sign-in, permission, and storage errors. / Choose **Sync with WebDAV** after the check succeeds. | 9 / 8 | — |
| The app never writes the WebDAV address, username, or password to app storage. / It clears the password after each check or sync attempt. / If a transfer stops, fix the reported cause and sync again. | 13 / 10 / 11 | — |
| Install / Download the detected platform installer from the product site or the latest GitHub release. / macOS and Linux / Windows PowerShell | 1 / 14 / 3 / 2 | — |
| Installers are not code-signed. / On macOS, right-click the app and choose **Open** the first time. / Windows may show an unknown-publisher prompt. / Verify any download against `SHA256SUMS` in the release. | 5 / 11 / 6 / 8 | — |
| Develop / Requirements: Node.js 22+ and Rust stable. / Native desktop development also needs the Tauri 2 system prerequisites. | 1 / 6 / 10 | — |
| On Ubuntu that includes `file`, `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf`. | 10 | — |
| `npm run build:site` is the factory deploy command. / Its deploy root is exactly `dist/site`, with `index.html` at that root. / `npm run build` also copies the landing page to `dist/index.html`. | 8 / 11 / 10 | — |
| `npm test` runs Rust core tests without the platform GUI libraries. / Run `CI=true npm run tauri build` with the platform prerequisites to build installers. | 11 / 13 | — |
| Architecture and privacy / The frontend is Vite + vanilla TypeScript. / The Tauri Rust code scans files, copies books, reads PDF annotations, and sends WebDAV requests. | 3 / 6 / 15 | — |
| Catalogue data stays in local browser/WebView storage. / The app makes no background network requests. | 7 / 7 | — |
| The website and demo use no analytics, advertising, CDN font, third-party runtime script, or cookies. / The production landing page contacts GitHub's public releases API to resolve current installer links. / See the site’s privacy policy and terms. | 15 / 14 / 7 | — |
| Source book files are read for metadata and are not rewritten. / Protected media is excluded rather than decrypted. / The app keeps PDF titles and authors readable across common encodings. / Imported highlights export as plain Markdown. | 11 / 7 / 11 / 6 | — |
| Releases / Tagging `v*` runs `.github/workflows/release.yml`. / It builds installers for macOS Intel and Apple silicon, Windows x64, and Linux x64. | 1 / 4 / 14 | — |
| The release includes `SHA256SUMS` and `latest.json`. / The landing page reads GitHub release metadata. / The one-line installers read `latest.json` and verify the selected file before installation. | 6 / 7 / 12 | — |
| License / MIT. / See LICENSE. / Self-hosted typefaces have their own SIL Open Font License; see `THIRD_PARTY_NOTICES.md`. | 1 / 1 / 2 / 11 | — |

### Terminology

| Concept | Term used |
| --- | --- |
| Local book index | catalogue |
| Ordered reader group | collection |
| Moving books to a reader | sideload for the job; copy for the operation |
| Reader annotations | highlights |
| KOReader import file | sidecar |
| Isolated sample | sample data / demo |
| Network folder protocol | WebDAV |

## Missed leverage

The brief’s obvious adjacent work is present: recursive import, catalogue search, ordered collection planning, USB transfer, WebDAV sync, multi-format highlight import, and Markdown export. These are deterministic local-file jobs. An AI feature would add optional key/network complexity without closing an implied gap, and no embedded provider key or decorative AI feature is present. No missed-leverage finding is recorded.

## What would make this perfect

Remove or replace **“You choose”** with a result-specific label, then add the landing workflow labels to the copy-audit regression so every visible label is reviewed. Re-run the copy audit, `npm test`, `npm run build`, the 17 claim commands, and the live mobile/desktop smoke check. A perfect result has zero findings.
