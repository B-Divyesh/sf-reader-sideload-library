# Reader Sideload Library — polish round 2 handoff

## Outcome

All findings in `.factory/review-1.md` and `.factory/review-2.md` are resolved. The repaired static site is deployed at <https://reader-sideload-library.sociobot.in>, and desktop version `0.1.6` is published from tag `v0.1.6`. The finding-by-finding change and evidence map is in `.factory/polish-2.md`.

## What changed

- Made `/demo/?demo=1` a one-click, isolated sample catalogue with a persistent demo banner, complete reset, and a clear route back to real data.
- Rebuilt offline navigation around a generated, route-aware precache. The advertised demo URL now reopens the demo on its first offline reload.
- Put the job, audience, sample action, next-step text, and three required facts inside the first desktop and mobile viewport.
- Preserved the paper-ledger visual system while correcting mobile layout, route titles, metadata, h1 focus, announcements, shared navigation/footer, legal links, and the styled 404.
- Standardized **highlights**, clarified install-command labels and privacy language, and corrected the README's inclusion behavior and audience statement.
- Bumped the desktop app to `0.1.6` so the corrected terminology ships in every installer.
- Added a one-to-one 17-entry claims inventory and observable browser/native tests for every listed claim.

## Verification

From a clean clone of commit `51bb6eb`:

- Every command in `.factory/claims.json` passed individually.
- `npm test` passed: 17 claim mappings, 6 Vitest tests, 10 Rust tests, and 56 Playwright tests.
- `npm run check`, `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, and `npm audit --audit-level=high` passed.
- `npm run build` produced `dist/site` and the app bundle.
- `CI=true npm run tauri build` produced version 0.1.6 AppImage, DEB, and RPM bundles.
- Local mobile Lighthouse: performance 98, accessibility 100, best practices 100, SEO 100; LCP 2.0 s, CLS 0.073, TBT 0 ms, 177 KiB transferred.
- Live mobile Lighthouse: performance 96, accessibility 100, best practices 100, SEO 100; LCP 2.3 s, CLS 0.073, TBT 60 ms, 178 KiB transferred.
- The deployed home page and service worker were byte-identical to `dist/site`; home, demo, privacy, terms, robots, and sitemap returned 200, while an unknown route returned the designed 404.
- `/opt/fleet/lib/verify-url.sh` passed title, language, landmark, image, and console checks.
- Final live browser evidence covers cold desktop/mobile first screens, exact-path offline reload, demo reset/isolation, route focus/announcements, axe scans, privacy requests, release metadata, and installer links.
- GitHub Actions passed quality, macOS Intel, macOS Apple silicon, Windows, Linux, and publish jobs. The release includes all required bundles, `SHA256SUMS`, and `latest.json`; a downloaded DEB matched its published checksum.

Evidence: `.factory/evidence/polish-2/`

Release workflow: <https://github.com/B-Divyesh/sf-reader-sideload-library/actions/runs/33579845575>

Release: <https://github.com/B-Divyesh/sf-reader-sideload-library/releases/tag/v0.1.6>

## Run and verify

```sh
npm ci
npm test
npm run check
npm run build
npm run preview:site
```

Run the live acceptance audit with:

```sh
node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in .factory/evidence/polish-2/live
```

## Known gaps

None within the work order. The application is deliberately local-first and does not import DRM-protected books.

## Needs operator action

The published desktop installers are unsigned, and the site states this before download. Signing would require configuring workflow use of `APPLE_CERTIFICATE` for macOS and `WINDOWS_CERT_PFX` for Windows; no signing secrets were read or changed in this work order.
