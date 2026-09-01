# Polish round 1 — Reader Sideload Library

Date: 1 September 2026  
Source review: `.factory/review-1.md`

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo mode replaces the workbench folder picker with **Search the sample catalogue**. It opens Catalogue, focuses Search, and explains the available sample task. The file picker remains available only outside demo mode. | Playwright: `demo primary action starts an available sample task`; local screenshots: `.factory/evidence/polish-1/local/demo-desktop.png` and `demo-mobile.png`; live screenshots: `.factory/evidence/polish-1/live/demo-desktop.png` and `demo-mobile.png`. |
| F-1-2 | **Reset demo** now restores the bundled state, clears Search, restores the All formats filter, returns to Catalogue, renders four rows, and focuses the Catalogue heading. | Playwright claim `@claim:demo-isolated sample work never changes real library storage`; live assertions in `.factory/evidence/polish-1/live/findings.json` show empty search, `all` filter, active Catalogue tab, four rows, heading focus, and an unchanged real-data sentinel. |
| F-1-3 | Demo and 404 now use the standard wordmark, Home/Demo/Privacy/Terms navigation, one-line product footer, legal links, build version, and **Built by Param Factory** credit. Privacy and Terms use the same small-route navigation. | Playwright: `demo and content routes share navigation and legal links`; axe CLI reports zero violations on all five live routes; the missing-route check records HTTP 404 in `.factory/evidence/polish-1/live/findings.json`. |
| F-1-4 | Every route h1 is programmatically focusable and receives focus on direct load. A polite live region announces the route title and h1. Demo reset moves focus to Catalogue. | Playwright structure loop checks all five routes; `.factory/evidence/polish-1/live/findings.json` records one h1/main, focused h1, and a non-empty announcement for every cold live route. |
| F-1-5 | Offline wording now matches the exact demo claim. The README describes sample actions directly and distinguishes the landing GitHub metadata path from installer `latest.json` use. Release publication checks were expanded. A new `unsigned-installers` claim verifies that Tauri and the workflow contain no signing identities and that the public notice is present. All flagged README wording was rewritten in plain language. | `.factory/claims.json` has 17 one-to-one claim markers; `npm run test:claim-inventory`; `npm run test:release`; `@claim:offline-demo`; `.factory/copy-audit.md`. |

## Additional acceptance work

- Added direct `/demo/?demo=1` and root `/?demo=1` entry paths. The root shortcut avoids the landing release request before entering the isolated sample.
- Added mobile demo navigation and overflow coverage.
- Raised sample Ready-label contrast and corrected landmark structure. Axe CLI reports zero violations on all product routes.
- Bumped the desktop and release version to 0.1.4 and refreshed the service-worker cache name.
- Updated `.factory/catalog-description.txt` with an 85-character, verb-first sentence.

## Local evidence

- `npm test`: 17 claim mappings, 6 Vitest tests, 10 Rust tests, and 52 Playwright checks passed.
- `npm run check`, Rust formatting, clippy with warnings denied, and `npm audit --audit-level=high`: passed.
- `npm run build`: passed; `dist/` and `dist/site/` produced.
- Axe CLI 4.10.3: zero violations on home, demo, privacy, terms, and 404.
- Lighthouse mobile: performance 97, accessibility 100, best practices 100, SEO 100; LCP 2.107 s, CLS 0.075, TBT 0 ms.
- Local screenshots: `.factory/evidence/polish-1/local/demo-desktop.png`, `.factory/evidence/polish-1/local/demo-mobile.png`.

## Live evidence

- Deployed source: `eaa8ae26fcd286db7629c67a0fdccd147ec74093`.
- Live site: `https://reader-sideload-library.sociobot.in` returned 200 after deployment; `/route-that-does-not-exist` returned the designed page with HTTP 404.
- Release: `https://github.com/B-Divyesh/sf-reader-sideload-library/releases/tag/v0.1.4`; Actions run `33563007958` passed quality, macOS arm64, macOS x64, Windows x64, Linux x64, and publish jobs.
- Release contents: DMG for both macOS architectures, MSI and EXE for Windows, AppImage/DEB/RPM for Linux, `SHA256SUMS`, and `latest.json`. A cold download of `Reader.Sideload.Library_0.1.4_x64_en-US.msi` passed `sha256sum --check`.
- `node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in .factory/evidence/polish-1/live`: passed route, title, focus, announcement, 404, console, isolation, reset, mobile, privacy, release-link, and offline assertions.
- `/opt/fleet/lib/verify-url.sh`: passed with no browser errors; evidence: `.factory/evidence/polish-1/live/verify-url/verify.json`.
- Axe CLI 4.10.3: zero violations on home, demo, privacy, terms, and the live 404.
- Live Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.810 s, CLS 0.057, TBT 8 ms, total transfer 181,949 bytes. Evidence: `.factory/evidence/polish-1/live/lighthouse-summary.json`.
