# Polish round 2 — Reader Sideload Library

Date: 2 September 2026  
Source review: `.factory/review-2.md`  
Cumulative sources checked: `.factory/review-1.md`, `.factory/polish-1.md`, and every earlier verification record

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the demo-only **Search the sample catalogue** primary action. It opens Catalogue and focuses Search; the real folder picker remains outside demo mode. | Playwright `demo primary action starts an available sample task`; live `/demo/?demo=1`; `.factory/evidence/polish-2/live/demo-desktop.png`. |
| F-1-2 | Retained the complete reset: bundled state, blank Search, All formats, Catalogue, four rows, and Catalogue-heading focus. | Claim `@claim:demo-isolated`; live reset assertions in `.factory/evidence/polish-2/live/findings.json`. |
| F-1-3 | Retained shared wordmark, Home/Demo/Privacy/Terms navigation, legal footer, factory credit, and version on demo, legal, and 404 routes. | Playwright `demo and content routes share navigation and legal links`; live route checks in `findings.json`. |
| F-1-4 | Retained one focusable h1 and polite route announcement on every route. | Five Playwright structure/axe tests per browser project; live `findings.json` records focused h1 and announcement for all routes. |
| F-1-5 | Kept the exact offline, release-metadata, and unsigned-installer claim wording and strengthened the advertised-path offline sandbox. The 17-entry inventory remains one-to-one. | `npm run test:claim-inventory`; all 17 `.factory/claims.json` commands passed individually from clean clone; `@claim:offline-demo`, `@claim:release-manifest`, and `@claim:unsigned-installers`. |
| F-2-1 | Replaced the exact-match service worker with route-aware `rsl-shell-v6`. The build injects every hashed site/demo asset into the precache. `/demo/?demo=1` falls back to the cached demo route, not `/`. The claim test now opens the exact advertised URL once, waits for installation, goes offline without an online reload, and asserts the demo title, banner, and four books. | Claim `@claim:offline-demo reloads the sample catalogue offline`; clean-clone isolated claim pass and 56/56 suite pass; live offline result in `findings.json`. |
| F-2-2 | Moved the privacy, offline, and price facts into a ruled list inside the hero ledger, directly after the sample action. | Playwright `landing first read fits the desktop 1366x768 viewport` and mobile 390x844 counterpart assert all five required elements are fully inside each viewport; screenshots `home-1366x768.png` and `home-390x844.png` under local and live evidence. |
| F-2-3 | Renamed both controls to **Copy install command**, success to **Install command copied**, and fallback to **Select install command**. | Playwright `download action and copy controls work without release metadata`; `.factory/copy-audit.md`; live home check. |
| F-2-4 | Standardized reader annotations as **highlights** across landing, app tabs/headings, README, claim locations, tests, and demo docs. KOReader inputs are called sidecars. | Playwright app navigation, `@claim:markdown-export`, `@claim:core-free`, `@claim:webdav-credentials`; live demo shows **Transfer & highlights**; demo screenshots. |
| F-2-5 | Replaced the inaccurate README “opt-in inclusion” statement with “warnings and per-book inclusion controls,” matching eligible books being selected by default. | README source inspection; clean-clone `@claim:local-catalogue`; correction recorded in `.factory/copy-audit.md`. |
| F-2-6 | Replaced “passive traffic/requests” with **background network requests** on the landing page, privacy page, README, claims inventory, and test name. | Claims `@claim:local-catalogue` and `@claim:privacy-requests`; clean-clone claim passes; live request log in `findings.json`. |
| F-2-7 | Replaced the subjective “focused alternative” sentence with the concrete need: folder order and highlight export without a full library manager. | README source inspection and `.factory/copy-audit.md`; no banned-word or over-22-word flags remain. |

## Additional release work

- Bumped the product to `0.1.6` so the complete desktop terminology repair ships in installers.
- Published the `v0.1.6` tag through the existing macOS Intel/Apple silicon, Windows, and Linux workflow.
- Serialized the browser acceptance suite after reproducing the previously documented parallel Chromium exit; the exact clean-clone rerun passed 56/56.
- Updated `.factory/catalog-description.txt` to an 88-character verb-first sentence.
- Preserved the concrete, paper, graphite, and moss visual system; no generic template or new third-party asset was introduced.

## Verification summary

- Clean clone: all 17 claim commands passed individually.
- Clean clone: `npm test` passed 17 claim mappings, 6 Vitest tests, 10 Rust tests, and 56 Playwright tests.
- Clean clone: TypeScript check, Rust format, Clippy with warnings denied, `npm audit --audit-level=high`, static build, and native Tauri build passed.
- Native clean build produced AppImage, DEB, and RPM bundles for 0.1.6.
- Local Lighthouse mobile: performance 98, accessibility 100, best practices 100, SEO 100; LCP 2.0 s, CLS 0.073, TBT 0 ms, 177 KiB.
- Static deployment home and service worker are byte-identical to `dist/site`; live routes return 200 and a missing route returns 404.
- `/opt/fleet/lib/verify-url.sh` reports no console errors and clean title/lang/main/alt checks.
- Cold live acceptance passed every route, demo, reset, isolation, axe, first-screen, release, and exact-path offline assertion with zero failures (`live/findings.json`).
- Live mobile Lighthouse: performance 96, accessibility 100, best practices 100, SEO 100; LCP 2.3 s, CLS 0.073, TBT 60 ms, 178 KiB.
- GitHub Actions run `33579845575` passed all six jobs. Release `v0.1.6` contains both macOS DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`; the downloaded DEB matched its published SHA-256.

Evidence root: `.factory/evidence/polish-2/`.
