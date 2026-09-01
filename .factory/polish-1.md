# Polish round 1 — Reader Sideload Library

Date: 1 September 2026  
Source review: `.factory/review-1.md`

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo mode replaces the workbench folder picker with **Search the sample catalogue**. It opens Catalogue, focuses Search, and explains the available sample task. The file picker remains available only outside demo mode. | Playwright: `demo primary action starts an available sample task`; screenshots: `.factory/evidence/polish-1/local/demo-desktop.png` and `demo-mobile.png`; live check: `https://reader-sideload-library.sociobot.in/demo/?demo=1`. |
| F-1-2 | **Reset demo** now restores the bundled state, clears Search, restores the All formats filter, returns to Catalogue, renders four rows, and focuses the Catalogue heading. | Playwright claim `@claim:demo-isolated sample work never changes real library storage`; the test asserts the empty search, `all` filter, active Catalogue tab, four rows, and heading focus. |
| F-1-3 | Demo and 404 now use the standard wordmark, Home/Demo/Privacy/Terms navigation, one-line product footer, legal links, build version, and **Built by Param Factory** credit. Privacy and Terms use the same small-route navigation. | Playwright: `demo and content routes share navigation and legal links`; axe checks on all five routes; live route checks after deployment. |
| F-1-4 | Every route h1 is programmatically focusable and receives focus on direct load. A polite live region announces the route title and h1. Demo reset moves focus to Catalogue. | Playwright structure loop checks h1 focus and non-empty route status on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`; live cold-route check after deployment. |
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

To be completed after the release and production deployment.
