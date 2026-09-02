# Reader Sideload Library — repair 5 handoff

## Outcome

Release `v0.1.8` repairs every blocker in independent verification 8 for candidate `f3d6c672777fcc51ec90dd4048b6e97c5190adda`. The source repair is commit `d13b19677dfa9b01d626a7c65905783c047d5d88`. It is published for all required platforms and deployed at `https://reader-sideload-library.sociobot.in`.

## Repairs

1. The compact desktop hero now applies through 1000px viewport height. The sample action and all three first-screen facts fit at 1366×768, 1536×864, 1440×900, and 390×844.
2. The landing page now has four captioned screenshots captured from the real desktop UI: first run, catalogue, collections, and transfer. The optimized WebP files are 24–33 KB each and load lazily.
3. The demo wordmark has a 44px minimum touch height. Its measured box at 390×844 is 179×44 CSS px.
4. The work order approves a truthful free-model deviation from the brief’s proposed one-time purchase. Version 0.1 keeps catalogue, collection, USB, WebDAV, and Markdown tools free. No paid feature, checkout, license storage, or billing request is presented. README and Terms state the model. The `core-free` claim checks the working controls, absent checkout, and documented deviation.
5. The product and service-worker cache are versioned `0.1.8` and `rsl-shell-v8` so updated app chrome and landing assets replace the prior release cleanly.

## Reproduction and regression evidence

Before the repair, `.factory/evidence/repair-5/reproduction/exact-failure.json` records:

- 1536×864: sample action bottom 872.3px; facts end at 990.9px.
- 1440×900: facts begin at 892.6px and end at 984.2px.
- 390×844 demo: wordmark height 34px.

After the repair, `.factory/evidence/repair-5/local/first-screen-regression.json` records:

- 1536×864: action ends at 541.9px; facts end at 643.5px.
- 1440×900: action ends at 559.9px; facts end at 661.5px.
- 390×844: action and facts end at 700px; demo wordmark height is 44px.

Playwright now tests both missed desktop sizes, all required first-screen nodes, all four walkthrough images and captions, and the mobile wordmark geometry. `.factory/claims.json` contains 18 one-to-one claim markers, including the walkthrough and free-release statements.

## Local verification

- `npm ci`: 68 packages installed; zero audit vulnerabilities.
- Every one of the 18 commands in `.factory/claims.json`: passed independently.
- `npm test`: passed — 18/18 claim mappings, 6/6 Vitest tests, 10/10 Rust tests, and 70/70 Playwright desktop/mobile tests.
- `npm run check`, `npm run build`, `cargo fmt -- --check`, all-target Clippy with warnings denied, and `npm audit --audit-level=high`: passed.
- Production output: site JavaScript 4.3 KB raw, CSS 15.1 KB raw, WOFF2 fonts 88.3 KB, and 80.0 KB mobile hero.
- `CI=true npm run tauri build`: produced Linux DEB, RPM, and AppImage bundles for 0.1.8.
- Extracted DEB consumer smoke: package `reader-sideload-library 0.1.8 amd64`; linked libraries resolved; app stayed running under Xvfb for 10 seconds with empty stderr.
- `/opt/fleet/lib/verify-url.sh` on the local production site: HTTP 200, 736ms load, correct title/lang/main, one h1, complete image alternatives, labelled buttons, and no browser errors.
- Lighthouse mobile: performance 98, accessibility 100, best practices 100, SEO 100; FCP 1.4s, LCP 2.2s, CLS 0.06, TBT 0ms, total transfer 295 KiB. Evidence: `.factory/evidence/repair-5/local/lighthouse.json`.
- Plain-words audit: 101 visible landing lines checked; no line exceeded 22 words and no banned wording was found. `.factory/copy-audit.md` lists the retained copy and terminology.

## Release and deployment

- GitHub Actions run [33601389340](https://github.com/B-Divyesh/sf-reader-sideload-library/actions/runs/33601389340) passed quality, Linux x64, Windows x64, macOS x64, macOS arm64, and publish jobs.
- GitHub Release [`v0.1.8`](https://github.com/B-Divyesh/sf-reader-sideload-library/releases/tag/v0.1.8) was published at `2026-09-02T07:10:54Z` with AppImage, DEB, RPM, MSI, EXE, x64 DMG, arm64 DMG, `latest.json`, and `SHA256SUMS`.
- A fresh release DEB download matched its published SHA-256 `70f211f86a583ac51bfb36e59f54d2ebfed5913361ba2f22df008da91a3e357c`; its package metadata reports `reader-sideload-library 0.1.8 amd64`. The live detected-platform button resolves to the real `v0.1.8` AppImage asset on Linux.
- Static deployment ID `943c5b01-e34c-43e9-bbf0-4d6ccb22c628` succeeded on the owned `sf-reader-sideload-library` Static Web App. The custom domain is ready and serves HTTPS 200. The deployed HTML SHA-256 exactly matches `dist/site/index.html`: `390647649434c366daa82cfc9d824966c4353e3d0055c09f32d1d3bb4fc9f45f`.
- Live verification passed `/`, `/demo`, `/privacy`, and `/terms`; a missing route returns 404. There were no console errors or serious/critical axe findings. The first-screen geometry passes at 1536x864 and 1440x900, all four walkthrough frames load at 1280x800, the 390px demo wordmark measures 44px, and the demo reloads offline with all four sample books.
- Live response policy includes HSTS, restrictive CSP, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial. Hashed assets use immutable one-year caching; `sw.js` is `no-cache` and serves `rsl-shell-v8`.
- Live Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; FCP 0.9s, LCP 1.2s, CLS 0.073, TBT 0ms, total transfer 295 KiB. Evidence is under `.factory/evidence/repair-5/live/`; release manifests and checksums are under `.factory/evidence/repair-5/release/`.

## Known limits

- Physical e-ink readers and third-party WebDAV providers are not available in this container. Native filesystem, interrupted-copy, HTTP fixture, credential-clearing, and recovery tests cover those boundaries deterministically.
- macOS and Windows installers are intentionally unsigned and disclose that status before download.

## Needs operator action

Add signing credentials in GitHub only if signed installers are desired. The workflow would need the owner’s Apple certificate/notarization and Windows Authenticode secrets; no signing secrets are present or required for this release.
