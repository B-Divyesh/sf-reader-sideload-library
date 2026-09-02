# Polish round 3 — Reader Sideload Library

Date: 2 September 2026  
Source review: `.factory/review-3.md`  
Cumulative sources checked: `.factory/review-1.md`, `.factory/polish-1.md`, `.factory/review-2.md`, `.factory/polish-2.md`, and `.factory/review-3.md`

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the demo-only **Search the sample catalogue** action. It opens Catalogue and focuses Search; the unavailable native folder picker is never offered in the browser demo. | Playwright `demo primary action starts an available sample task`; [live demo](https://reader-sideload-library.sociobot.in/demo/?demo=1); `.factory/evidence/polish-3/live/demo-desktop.png`. |
| F-1-2 | Kept the complete demo reset: bundled state, empty Search, All formats, Catalogue, four rows, and focus on the Catalogue heading. Demo state stays under `demo:rsl:library-state:v1`; real state is neither read nor written. | Claim `@claim:demo-isolated`; reset and storage assertions in `.factory/evidence/polish-3/live/findings.json`. |
| F-1-3 | Kept the shared wordmark, Home/Demo/Privacy/Terms navigation, legal footer, factory credit, and version on demo, legal, and 404 routes. | Playwright `demo and content routes share navigation and legal links`; five live route records in `.factory/evidence/polish-3/live/findings.json`. |
| F-1-4 | Kept one programmatically focusable h1 and a polite route announcement on every route. | Desktop and mobile structure/axe tests for all five routes; live `.factory/evidence/polish-3/live/findings.json` records h1 focus and announcement text. |
| F-1-5 | Kept all observable promises in the 17-entry one-to-one claims inventory, including offline behavior, release metadata, unsigned installers, privacy, and native file handling. | `npm run test:claim-inventory`; all 17 claim commands passed individually from a clean clone; full unit, Rust, and browser suites passed. |
| F-2-1 | Kept the versioned, route-aware service worker and bumped its cache to `rsl-shell-v7`. The exact advertised `/demo/?demo=1` URL caches its app shell and restores the four-book demo without a second online reload. | Claim `@claim:offline-demo`; clean-clone claim pass; final live offline record in `.factory/evidence/polish-3/live/findings.json`. |
| F-2-2 | Kept privacy, offline, and price as three ruled facts directly beside the first-screen sample action. | Playwright desktop 1366×768 and mobile 390×844 first-read tests; `.factory/evidence/polish-3/live/home-1366x768.png` and `.factory/evidence/polish-3/live/home-390x844.png`. |
| F-2-3 | Kept **Copy install command**, **Install command copied**, and **Select install command** as the copy control's action and feedback text. | Playwright `download action and copy controls work without release metadata`; `.factory/copy-audit.md`; live home check. |
| F-2-4 | Kept **highlights** as the single term for reader annotations across the site, app, README, demo documentation, claims, and tests; KOReader inputs are called sidecars. | Claims `@claim:highlight-import-formats` and `@claim:markdown-export`; app browser tests; `.factory/evidence/polish-3/live/demo-transfer.png`. |
| F-2-5 | Kept the accurate README explanation: eligible books are selected by default and users get warnings plus per-book inclusion controls. | README source inspection; claim `@claim:local-catalogue`; `.factory/copy-audit.md`. |
| F-2-6 | Kept **background network requests** as the single plain description of network behavior on the landing page, privacy page, README, claims inventory, and tests. | Claims `@claim:local-catalogue` and `@claim:privacy-requests`; live third-party request log in `.factory/evidence/polish-3/live/findings.json`. |
| F-2-7 | Kept the concrete README audience statement: people who need folder order and highlight export without a full library manager. | README source inspection and `.factory/copy-audit.md`; no sentence exceeds 22 words and no banned marketing term remains. |
| F-3-1 | Added explicit route-specific `twitter:title`, `twitter:description`, and absolute `twitter:image` metadata to demo, privacy, terms, and 404 pages. The home route is covered by the same regression. | Playwright `every route ships complete route-specific social metadata`; final live metadata for all five routes in `.factory/evidence/polish-3/live/findings.json`. |
| F-3-2 | Renamed the footer link to **Source on GitHub (external)** so its destination and external behavior are clear. | Playwright `non-download external links name their destination`; final live external-link record in `.factory/evidence/polish-3/live/findings.json`. |
| F-3-3 | Replaced the three vague labels with **Desktop app for DRM-free books**, **Ordered device folders**, and **USB, WebDAV, and Markdown export**. | Playwright `working sections use direct task labels`; final live labels in `.factory/evidence/polish-3/live/findings.json`; `.factory/evidence/polish-3/live/demo-collections.png` and `.factory/evidence/polish-3/live/demo-transfer.png`. |

## Additional release work

- Bumped the product and service-worker cache to `0.1.7` so the repaired desktop copy ships in new installers and stale shells cannot mask the route fixes.
- Updated the catalog line to the 73-character verb-first sentence: “Organize DRM-free books, set reader order, and sideload by USB or WebDAV.”
- Added route-metadata, external-link-label, and task-label regressions on desktop and mobile browser projects.
- Extended cold live verification to inspect route metadata, external-link wording, task labels, demo storage isolation, reset state, exact-path offline reload, keyboard focus, axe results, console messages, and responsive screenshots.
- Preserved the product's concrete paper, graphite, ink, and moss visual identity. No third-party design asset or generic template was introduced.

## Evidence index

- Final live assertion record: `.factory/evidence/polish-3/live/findings.json`
- Final URL baseline: `.factory/evidence/polish-3/live/verify-url/verify.json`
- Lighthouse report: `.factory/evidence/polish-3/live/lighthouse.json`
- Screenshots: `.factory/evidence/polish-3/live/home-1366x768.png`, `home-390x844.png`, `demo-desktop.png`, `demo-mobile.png`, `demo-collections.png`, and `demo-transfer.png`
- Live routes: [home](https://reader-sideload-library.sociobot.in/), [isolated demo](https://reader-sideload-library.sociobot.in/demo/?demo=1), [privacy](https://reader-sideload-library.sociobot.in/privacy/), [terms](https://reader-sideload-library.sociobot.in/terms/), and [404](https://reader-sideload-library.sociobot.in/this-route-does-not-exist)
