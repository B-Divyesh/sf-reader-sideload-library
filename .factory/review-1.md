# Review 1 — Reader Sideload Library

**Verdict: FAIL**

Review date: 2026-09-01  
Scope: live site at <https://reader-sideload-library.sociobot.in>, commit `6e351717ed9531d9ac82cfe3f85b64d9e49e356e`, and a fresh local clone.

There are 5 findings: 1 blocking and 4 minor. Every declared claim test passed, but the demo has a blocking first-use inconsistency and the remaining findings prevent a zero-finding result.

## Cold first visit

At 390 px and desktop, before scrolling, the page communicates:

- **What it does:** Organizes DRM-free EPUB/PDF libraries and copies selected books to an e-ink reader.
- **Who it is for:** E-ink reader owners who keep their own EPUB and PDF files.
- **What to click first:** **Try it with sample data**, which says it opens a ready sample catalogue.

This passes the first-screen clarity check. The mobile screen had no horizontal overflow (`390/390` CSS pixels), and neither context recorded console or page errors.

## Findings

### F-1-1 — BLOCKING — the demo foregrounds an action that demo mode refuses

**Location:** `/demo/`, 390 px and desktop; `desktop/index.html` and `desktop/src/main.ts`.

**Observed text:** The first large moss action in the sample screen says **“Choose library folder.”** The same screen’s banner says **“Demo — sample data, nothing is saved to your library.”** Clicking the action shows **“Demo mode does not read your files. Choose Start for real first.”**

**Why this needs attention:** The demo does load realistic sample data, but its most prominent working-area action invites a first-time visitor to perform an action that the demo rejects. The visitor has to infer that search, collection order, and Markdown export are the usable sample tasks. This does not provide a clear one-click trial path after arrival.

**Check performed:** A fresh mobile context opened `/demo/`, showed four sample books, then selected the visible folder action. The reported message confirmed that the action cannot run in demo mode. The same result follows directly from `chooseLibrary()` when `isDemo` is true.

**Concrete fix:** In demo mode, replace or disable that action with a result-naming sample action such as **“Search the sample catalogue”** and put focus on the search field, or label the action **“Start for real to choose a folder”** and link it to `/`. Keep the normal action only outside demo mode. Add an end-to-end test that the prominent demo action completes an available sample task rather than showing a rejection message.

### F-1-2 — MINOR — Reset demo does not restore the visible catalogue state

**Location:** `/demo/`; README, “Try the sample”: **“Use Reset demo to restore it.”**

**Observed result:** After searching for `Zoë`, the table contained one row. Selecting **Reset demo** restored the four-book state in storage and the header count, but the search field remained `Zoë`, so the table still displayed one row.

**Why this needs attention:** “Reset demo” normally means return to the initial visible sample state. A visitor can select Reset and still see a filtered result, which makes it difficult to confirm that the sample was reset.

**Concrete fix:** Clear `#search`, restore `#format-filter` to `all`, reset the active panel, then render and move focus to the catalogue heading or search label. Add a test that filters the sample, selects Reset demo, and confirms an empty search plus four visible rows.

### F-1-3 — MINOR — route chrome is not consistent on demo and 404

**Location:** `/demo/` and the live missing-page route `/does-not-exist`.

**Observed result:** `/demo/` has only a skip link and **Start for real**. It omits the wordmark link, Demo/Privacy navigation, and the legal footer. The 404 page has a wordmark but no navigation links in its header and omits the Demo link in its footer.

**Why this needs attention:** A person entering either route directly cannot reach Privacy from the header, and the product’s shared navigation pattern is interrupted. The site structure check requires a consistent header and footer on every route.

**Concrete fix:** Render the standard wordmark and small navigation on `/demo/` and `/404.html`; retain the demo banner above it. Include Demo, Privacy, Terms, the product one-line description, and **Built by Param Factory** in every footer. Add route checks for the shared links.

### F-1-4 — MINOR — direct route changes leave focus on the document body

**Location:** live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/does-not-exist`.

**Observed result:** In a fresh browser context, after each direct route load `document.activeElement` was `BODY`, rather than the new page’s `<h1>`. No route announcement is present.

**Why this needs attention:** Keyboard and screen-reader users do not receive the required route change target. This is especially noticeable after selecting a landing-page link, because a static navigation reload puts the visitor before the new content.

**Concrete fix:** Give each route `<h1 tabindex="-1">`, then focus it on load with a small route script; add an `aria-live="polite"` route label. Add a browser test that follows each internal route and confirms the new h1 receives focus.

### F-1-5 — MINOR — claim-like statements are not precisely covered by claims.json

**Location and exact text:**

1. Landing proof strip: **“Catalogue tools work offline”**.
2. Landing install section: **“unsigned preview builds.”**
3. README, “Try the sample”: **“Search, reorder, and Markdown export use the same interface as a real library.”**
4. README, Install: **“Release builds are currently unsigned.”**
5. README, Releases: **“GitHub Actions builds unsigned macOS ARM64/Intel, Windows x64, and Linux x64 bundles, then publishes all artifacts plus `SHA256SUMS` and `latest.json`.”**
6. README, Releases: **“The landing page and one-line installers resolve assets from that manifest.”**

**Why this needs attention:** The `offline-demo` claim only proves that catalogue, collection, and Markdown tools reopen **after the first demo visit**. It does not cover the broader landing wording. There is no exact claim for the unsigned-build state, the shared real/demo interface, or the release workflow. The release-loader code checks that `latest.json` exists but creates links from GitHub release metadata, rather than resolving them from the `latest.json` contents. These statements therefore lack an exact observable test, and the final statement does not match the checked code path.

**Concrete fix:** Change the first statement to **“Catalogue, collection, and Markdown tools reopen offline after the first sample visit.”** Add observable tests for signing state, the shared real/demo interface, and release publication, or remove those statements. Replace the final README sentence with wording that describes the actual GitHub release-metadata path, or make the loader and an accompanying claim use `latest.json` as stated.

## Demo, storage, and privacy checks

- The landing sample action reaches `/demo/` in one click.
- The first demo screen already shows four realistic books, an ordered collection, highlights, a missing-cover warning, and a protected-file exclusion.
- The persistent banner is present: **“Demo — sample data, nothing is saved to your library.”**
- Demo state uses `demo:rsl:library-state:v1`; a real `rsl:library-state:v1` sentinel remained unchanged in the isolation test.
- The direct demo request log contained only the product origin. The landing request log contained the product origin plus the disclosed `api.github.com` release request; no cookies were set.
- The storage reset behavior is covered by F-1-2. The prominent unavailable action is covered by F-1-1.

## Claims check

`.factory/claims.json` contains 16 entries. Each listed command was run from a new local clone after `npm ci` and passed.

| Claim id | Result | Evidence |
| --- | --- | --- |
| `demo-isolated` | Pass | Separate demo storage retained the real-state sentinel. |
| `local-catalogue` | Pass | Local storage update and same-origin request check passed. |
| `privacy-requests` | Pass | Product-origin plus mocked disclosed GitHub release request only; cookie jar empty. |
| `core-free` | Pass | Core demo controls enabled without checkout. |
| `offline-demo` | Pass | Fresh service-worker context reloaded the sample while offline. |
| `nested-library-scan` | Pass | Native temporary-library test passed. |
| `source-preserved` | Pass | Native byte-preservation test passed. |
| `pdf-metadata` | Pass | Native Unicode metadata test passed. |
| `ordered-collections` | Pass | Sample search and numbered filenames passed. |
| `verified-usb-copy` | Pass | Native repeat-copy test passed. |
| `usb-partial-copy` | Pass | Native staging-copy preservation test passed. |
| `webdav-credentials` | Pass | Browser credential-clearing and storage test passed. |
| `webdav-transfer` | Pass | Native local WebDAV fixture test passed. |
| `highlight-import-formats` | Pass | Native import fixture test passed. |
| `markdown-export` | Pass | Demo download content test passed. |
| `release-manifest` | Pass | Release manifest fixture test passed. |

`npm test` also passed (16 claim mappings, 5 unit tests, 10 native tests, and 44 browser checks). `npm run build` passed and produced `dist/` and `dist/site/`.

## Earlier-review history check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. The prior handoff recorded eight former claim-inventory gaps and an unavailable paid WebDAV route. Each was checked again in live copy, code, and the applicable fresh-clone claim test:

| Earlier point | Current check | Result |
| --- | --- | --- |
| Local storage and passive-request wording | `local-catalogue`, `privacy-requests` | Confirmed fixed |
| No product account / WebDAV availability | `core-free`, live demo controls | Confirmed fixed |
| WebDAV credential clearing and recovery guidance | `webdav-credentials`, live Transfer panel code | Confirmed fixed |
| USB-copy completion and partial-copy handling | `verified-usb-copy`, `usb-partial-copy` | Confirmed fixed |
| Recursive scan and protected-file handling | `nested-library-scan` | Confirmed fixed |
| WebDAV HTTPS, destination check, and selected-byte transfer | `webdav-transfer` | Confirmed fixed |
| Highlight import formats and Markdown export | `highlight-import-formats`, `markdown-export` | Confirmed fixed |
| No analytics, telemetry, or third-party runtime assets | request-log check and `privacy-requests` | Confirmed fixed |

## Structure and accessibility checks

- `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200; the missing route returned the designed 404 with HTTP 404.
- The live home, demo, privacy, terms, and 404 pages each have one h1, a main landmark, a title, language, meta description, canonical URL, favicon, touch icon, and expected social card metadata.
- Home title pattern is correct: `Reader Sideload Library — organize e-ink libraries`. Legal and demo titles are route-specific.
- The demo h1 is the product name, **“Reader Sideload Library,”** rather than a plain-language task headline. This is included in the route consistency correction in F-1-3.
- All product routes, GitHub source/release links, and the three displayed installer links returned their expected 200 response after redirects. The missing-page URL correctly returned 404.
- Local browser accessibility checks passed with no serious or critical axe findings. Keyboard task tabs, 44 px visible controls, dark mode, reduced motion, 390 px layout, and no console errors passed in the shipped suite.
- The live visual surface is distinct from a generic SaaS template: the concrete/paper/moss system, archival rules, generated transfer still life, and square-offset controls match `.factory/design.md`.
- The product already includes the valuable implied import/export and sync work: book scanning, USB/WebDAV transfer, highlight import, and Markdown export. The brief does not imply an additional AI step, so no AI feature is required.

## Copy audit

Counts treat hyphenated terms, version strings, and URLs as one word. **Flag** is blank when the line is within 22 words, uses plain terms, names its section/action, and has no copy issue.

### Landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Desktop app for DRM-free books | 5 | — |
| Organize and sideload your e-ink library. | 6 | — |
| For e-ink reader owners who keep EPUB and PDF files, collections and highlights stay under your control. | 17 | — |
| Try it with sample data | 5 | — |
| Open a ready sample catalogue. | 5 | — |
| Download for your computer | 4 | — |
| Detecting your platform… | 3 | — |
| See other platforms and install methods | 6 | — |
| Choose the files and destination for each transfer. | 8 | — |
| No account or passive app traffic | 6 | — |
| Catalogue tools work offline | 4 | F-1-5: broader than its claim test. |
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
| Copy books and export notes | 5 | — |
| Copy selected books by USB. | 5 | — |
| Import reader notes and export them as Markdown. | 8 | — |
| Live catalogue preview | 3 | — |
| Find metadata problems before copying. | 5 | — |
| Search titles, authors, and series. | 6 | — |
| Missing covers and protected files stay visible before transfer. | 8 | — |
| Open the sample catalogue | 4 | — |
| Scope and privacy | 3 | — |
| See where your library data goes. | 7 | — |
| Your catalogue stays on this computer | 6 | — |
| No product account or cloud catalogue | 6 | — |
| No analytics, advertising, or passive app requests | 7 | — |
| WebDAV details are never written to app storage | 8 | — |
| Transfers happen only when you start them | 7 | — |
| USB copies go to the folder you choose | 8 | — |
| WebDAV sends selected books to your server | 7 | — |
| The app clears the password after each attempt | 8 | — |
| WebDAV is included. | 3 | — |
| Check the connection first to get specific help for address, sign-in, permission, and storage errors. | 15 | — |
| Install the desktop app | 4 | — |
| Download it for your computer. | 5 | — |
| Version 0.1.3 · unsigned preview builds. | 5 | F-1-5: unsigned status has no claim. |
| Each release includes SHA-256 checksums. | 5 | — |
| Apple silicon and Intel disk images. | 6 | — |
| Unsigned: right-click the app, then choose Open. | 7 | — |
| Windows may show an unsigned publisher warning. | 7 | — |
| Make executable, then run. | 4 | — |
| A .deb is in the release. | 6 | — |
| Checking the latest verified release… | 5 | — |
| Release downloads open on GitHub. | 5 | — |
| The release manifest could not be reached. | 7 | — |
| GitHub’s latest-release page remains available. | 5 | — |
| Release 0.1.3 found. | 3 | — |
| SHA-256 checksums are published beside every installer. | 7 | — |
| Organize DRM-free books for an e-ink reader. | 7 | — |
| Hero imagery generated for this product with the factory image model. | 11 | — |

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Reader Sideload Library is a desktop utility for e-ink reader owners with DRM-free EPUB and PDF files. | 15 | — |
| It checks metadata, creates ordered device folders, copies books by USB, and exports highlights as Markdown. | 14 | — |
| It is for people who own their book files and use e-ink readers, especially when Calibre is more library manager than they need or when annotations would otherwise remain tied to one reader. | 31 | Over 22 words. Rewrite: “It is for people who own book files and use e-ink readers. It suits people who need less than Calibre.” |
| It is not an ebook store, DRM-removal tool, reader, or firmware project. | 13 | — |
| Recursive EPUB/PDF scan with embedded title, author, series, cover, encryption, and file validation | 11 | — |
| Searchable, locally persisted catalogue with clear warnings and opt-in inclusion | 9 | Jargon: replace “locally persisted” with “saved on this computer.” |
| Ordered collections rendered as safe numbered folders/files | 7 | Jargon/slash: “Ordered collections become safe numbered folders and files.” |
| USB sync preserves source bytes, verifies copied bytes, and skips an unchanged repeat copy | 12 | — |
| Free WebDAV sync with HTTPS enforcement, a connection check, and specific recovery guidance | 12 | Jargon: “WebDAV sync checks HTTPS, tests the connection, and explains what to fix.” |
| Markdown, plain-text, JSON, KOReader-sidecar, and embedded PDF annotation import; plain Markdown export | 11 | Fragment. Rewrite: “Import Markdown, text, JSON, KOReader notes, and PDF annotations. Export plain Markdown.” |
| Catalogue, collection, and Markdown tools reopen offline after the first demo visit | 10 | — |
| Open `/demo/` or choose **Load sample project** on the app’s first screen. | 11 | — |
| The sample includes four books, one ordered collection, and two highlights. | 10 | — |
| Search, reorder, and Markdown export use the same interface as a real library. | 11 | F-1-5: test this claim or replace with a direct description. |
| Demo changes use `demo:rsl:library-state:v1`. | 3 | — |
| They never read or replace the real `rsl:library-state:v1` catalogue. | 8 | — |
| The sample demo sends no catalogue or interaction data to another origin. | 11 | — |
| Use **Reset demo** to restore it, or **Start for real** to discard it. | 11 | F-1-2: Reset does not restore the full visible state. |
| Install the desktop app and scan your book folder. | 9 | — |
| Open **Transfer & notes**. | 4 | — |
| Copy the HTTPS WebDAV folder address from your storage provider. | 10 | — |
| Enter the provider username and an app password when the provider offers one. | 13 | — |
| Choose **Check connection**. | 3 | — |
| The app distinguishes address, sign-in, permission, and storage errors. | 9 | — |
| Choose **Sync with WebDAV** after the check succeeds. | 7 | — |
| The app never writes the WebDAV address, username, or password to app storage. | 13 | — |
| It clears the password after each check or sync attempt. | 10 | — |
| If a transfer stops, fix the reported cause and sync again. | 11 | — |
| Download the detected platform installer from the product site or the latest GitHub release. | 13 | — |
| Release builds are currently unsigned. | 5 | F-1-5: no claim test. |
| On macOS, right-click the app and choose **Open** the first time. | 12 | — |
| Windows may show an unknown-publisher prompt. | 6 | — |
| Verify any download against `SHA256SUMS` in the release. | 7 | — |
| Requirements: Node.js 22+ and Rust stable. | 6 | — |
| Native desktop development also needs the Tauri 2 system prerequisites. | 10 | — |
| On Ubuntu that includes `file`, `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf`. | 6 | — |
| `npm run build:site` is the factory deploy command. | 7 | — |
| Its deploy root is exactly `dist/site`, with `index.html` at that root. | 10 | — |
| `npm run build` also copies the landing entry to `dist/index.html` for the repository-wide quality contract. | 15 | Jargon: “repository-wide quality contract” is unexplained. Rewrite: “`npm run build` also copies the landing page to `dist/index.html`.” |
| `npm test` keeps Rust core tests independent from Tauri's platform GUI libraries. | 11 | — |
| Native app and installer builds still enable the default `desktop` feature and require the platform prerequisites above. | 15 | Jargon: replace “default `desktop` feature” with the required build command and prerequisites. |
| The frontend is Vite + vanilla TypeScript. | 6 | — |
| The Tauri Rust core owns filesystem scanning, verified copying, PDF annotation parsing, and WebDAV requests. | 14 | Jargon: “owns” is vague. Rewrite: “The Tauri Rust code scans files, copies books, reads PDF annotations, and sends WebDAV requests.” |
| Catalogue data stays in local browser/WebView storage. | 6 | — |
| The app makes no passive network requests. | 7 | — |
| The website and demo use no analytics, advertising, CDN font, third-party runtime script, or cookies. | 13 | — |
| The production landing page contacts GitHub's public releases API to resolve current installer links. | 13 | — |
| Source book files are read for metadata and are not rewritten. | 10 | — |
| Protected media is excluded rather than decrypted. | 7 | — |
| PDF titles and authors stored as UTF-16 or PDFDocEncoding are decoded without replacement characters. | 13 | Jargon: define PDFDocEncoding or move this technical detail to developer documentation. |
| Imported highlights export as plain Markdown. | 6 | — |
| Tagging `v*` runs `.github/workflows/release.yml`. | 5 | — |
| GitHub Actions builds unsigned macOS ARM64/Intel, Windows x64, and Linux x64 bundles, then publishes all artifacts plus `SHA256SUMS` and `latest.json`. | 20 | Unlisted operational claim; add a release test or simplify. |
| The landing page and one-line installers resolve assets from that manifest. | 10 | F-1-5: does not match the release-loader code path. |
| MIT. | 1 | — |
| Self-hosted typefaces have their own SIL Open Font License; see `THIRD_PARTY_NOTICES.md`. | 10 | — |

### Terminology check

| Concept | Preferred term | Notes |
| --- | --- | --- |
| Local book index | catalogue | Consistent. |
| Ordered reader group | collection | Consistent. |
| Moving books | copy or sideload | Both are acceptable but use “copy” for the concrete transfer control. |
| Reader annotations | highlights | “Notes” appears as a tab label and may mean highlights; label it “Highlights and transfer” if precision is needed. |
| Tryable sample | sample demo | Consistent. |
| Network folder service | WebDAV | Consistent. |

## What would make this perfect

Make every primary demo control usable with the sample, make Reset restore the visible starting state, standardize every route’s navigation and focus behavior, and give each visitor-facing statement an exact claim test or plain operational wording. Then rerun the complete fresh-clone claim set and route checks with zero findings.
