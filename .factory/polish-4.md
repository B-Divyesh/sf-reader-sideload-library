# Polish round 4 — Reader Sideload Library

## Outcome

All 16 cumulative findings are resolved. This round replaces the last decorative
workflow label with a concrete transfer choice and adds a regression test for it.

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The demo offers **Search the sample catalogue**, opens Catalogue, and focuses its search field. The unavailable native folder picker is not offered in the browser demo. | Playwright `demo primary action starts an available sample task`; [live demo](https://reader-sideload-library.sociobot.in/demo/?demo=1); `.factory/evidence/polish-4/live/demo-desktop.png`. |
| F-1-2 | **Reset demo** restores the four-book sample, blank search, All formats filter, Catalogue section, and Catalogue-heading focus. Demo storage remains `demo:rsl:library-state:v1`; real storage is untouched. | Claim `@claim:demo-isolated`; reset record in `.factory/evidence/polish-4/live/findings.json`; [live demo](https://reader-sideload-library.sociobot.in/demo/?demo=1). |
| F-1-3 | Demo, legal, and 404 pages share the wordmark, navigation, legal footer, build version, and Param Factory credit. | Playwright `demo and content routes share navigation and legal links`; five route records in `.factory/evidence/polish-4/live/findings.json`; [live 404](https://reader-sideload-library.sociobot.in/route-that-does-not-exist). |
| F-1-4 | Every route has one focusable h1 and a polite route announcement; demo reset returns focus to the Catalogue heading. | Route accessibility tests and live h1/focus/announcement records in `.factory/evidence/polish-4/live/findings.json`. |
| F-1-5 | Observable offline, privacy, release, signing, and file-handling promises remain in the 17-item, one-test-per-claim inventory. | `npm run test:claim-inventory`; every command in `.factory/claims.json` passed from a clean clone; `.factory/claims.json`. |
| F-2-1 | The route-aware service worker caches the exact advertised `/demo/?demo=1` shell and restores the banner and four sample books without a second online reload. | Claim `@claim:offline-demo`; live offline record in `.factory/evidence/polish-4/live/findings.json`; [live demo](https://reader-sideload-library.sociobot.in/demo/?demo=1). |
| F-2-2 | Privacy, offline, and free-tool facts remain directly beside the first-screen sample action. | Playwright desktop and mobile `landing first read fits` tests; `.factory/evidence/polish-4/live/home-1366x768.png`; `.factory/evidence/polish-4/live/home-390x844.png`. |
| F-2-3 | Install controls name their result: **Copy install command**, **Install command copied**, and **Select install command**. | Playwright `download action and copy controls work without release metadata`; `.factory/copy-audit.md`; [live home](https://reader-sideload-library.sociobot.in/). |
| F-2-4 | **Highlights** is the single term for reader annotations across site, app, README, claims, and demo docs; KOReader inputs are sidecars. | Claims `@claim:highlight-import-formats` and `@claim:markdown-export`; `.factory/evidence/polish-4/live/demo-transfer.png`; [live demo](https://reader-sideload-library.sociobot.in/demo/?demo=1). |
| F-2-5 | README accurately says eligible books are selected by default and users have warnings plus per-book inclusion controls. | Claim `@claim:local-catalogue`; README and `.factory/copy-audit.md`; clean-clone claim pass. |
| F-2-6 | Visible copy uses **background network requests**, with the request boundary described precisely. | Claims `@claim:local-catalogue` and `@claim:privacy-requests`; live request log in `.factory/evidence/polish-4/live/findings.json`; [live privacy](https://reader-sideload-library.sociobot.in/privacy/). |
| F-2-7 | README names the concrete need: folder order and highlight export without a full library manager. | README and `.factory/copy-audit.md`; copy audit has no banned term or over-22-word flag. |
| F-3-1 | Home, demo, Privacy, Terms, and 404 ship route-specific Twitter title, description, and image fields. | Playwright `every route ships complete route-specific social metadata`; live route metadata in `.factory/evidence/polish-4/live/findings.json`. |
| F-3-2 | The external repository link says **Source on GitHub (external)**. | Playwright `non-download external links name their destination`; live home footer record in `.factory/evidence/polish-4/live/findings.json`. |
| F-3-3 | App labels name the work: **Desktop app for DRM-free books**, **Ordered device folders**, and **USB, WebDAV, and Markdown export**. | Playwright `working sections use direct task labels`; `.factory/evidence/polish-4/live/demo-collections.png`; `.factory/evidence/polish-4/live/demo-transfer.png`. |
| F-4-1 | Replaced **You choose** with **Choose USB or WebDAV**. Its companion text names the two transfer methods and Markdown highlight export. The copy audit now checks this label group. | New Playwright `workflow labels name a concrete action or result`; `.factory/copy-audit.md`; live workflow labels in `.factory/evidence/polish-4/live/findings.json`; `.factory/evidence/polish-4/live/home-1366x768.png`; [live home](https://reader-sideload-library.sociobot.in/). |

## Verification summary

- Final clean clone: `/tmp/rsl-final-clean-rfqdIC` from commit `50396b1ba463d358521e60eecd0864fa7a13125f`.
- Ran `npm ci`, then each of the 17 commands declared in `.factory/claims.json`, `npm test` (17-claim inventory, 6 unit tests, 10 Rust tests, and 64 Playwright tests), `npm run build`, `npm run check`, `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`, `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`, and `npm audit --audit-level=high`. All passed.
- Built the production Tauri bundle with `CI=true npm run tauri build`: Linux `.deb`, `.AppImage`, and `.rpm` artifacts were created. Release workflow coverage verifies the macOS Intel/Apple silicon, Windows, and Linux publishing matrix and checksums.
- Deployed `dist/site` with deployment `276698b3-38d2-4402-8e56-8a16d7feb08b` to [reader-sideload-library.sociobot.in](https://reader-sideload-library.sociobot.in/).
- Opened the deployed site cold and ran `node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in .factory/evidence/polish-4/live`; every route, link, metadata field, demo/reset boundary, offline reload, first-screen geometry, console check, and axe check passed. `verify-url.sh` also passed with zero console errors and no missing alt text.
- Lighthouse mobile evidence is `.factory/evidence/polish-4/live/lighthouse.json`: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.2 s, LCP 1.5 s, CLS 0.073, TBT 20 ms, total transfer 178 KiB. Chrome exited after the completed audit while attempting its final screenshot; the recorded category results are complete, and independent Playwright/live checks remained clean.

## Catalog description

`.factory/catalog-description.txt` remains valid: it starts with **Organize**, is one sentence, and is under 120 characters.

## Remaining work

None.
