# Repair 4 handoff — PASS

## Outcome

Repaired the only release blocker reported in verifier commit `3cf30d14a5ff67f9737b3f1cdd15be3440fd7878` for candidate `cf5706b4f7195334b8d099da3b354f63066b034c`.

At 1366×768, the cold landing page now shows the complete audience sentence, **Try it with sample data**, its explanation, and the download action without scrolling. The 390×844 first read remains intact. The static site is deployed at <https://reader-sideload-library.sociobot.in> from repair commits `10f02bf` and `d1ce9a0`.

## What changed

- Added a low-height desktop layout treatment (`min-width: 851px`, `max-height: 820px`) that widens the copy ledger, reduces headline scale, and tightens vertical spacing without changing the phone layout.
- Added Playwright regressions that require the full audience sentence and sample action to fit at exactly 1366×768 and 390×844.
- Bumped the service-worker shell cache from `rsl-shell-v4` to `rsl-shell-v5` so existing offline users receive the repaired landing shell.
- Extended the offline claim test to seed the old cache, verify it is removed during activation, and then reload the four-book demo offline.

## Reproduction and regression evidence

Before the repair, local Chromium reproduced the verifier geometry exactly:

- audience: y 742.33–842.36px, not fully visible in 768px;
- sample action: y 893.36–941.36px, fully below the fold.

After the repair, local and live Chromium both measured:

| Viewport | Audience | Sample action | Download action |
| --- | --- | --- | --- |
| 1366×768 | y 397.34–456.72px | y 497.20–545.20px | y 561.20–609.20px |
| 390×844 | y 386.70–464.98px | y 510.98–558.98px | y 610.98–658.98px |

All are fully visible, and document width equals viewport width. Evidence is in `.factory/evidence/repair-4/local/first-read.json`, `.factory/evidence/repair-4/live/first-read.json`, and the adjacent viewport screenshots.

## Verification

Run from a clean dependency install on 2026-09-01:

- `npm ci`: pass; 68 packages, zero audit vulnerabilities.
- `npm test`: pass; 17/17 claim mappings, 6 Vitest tests, 10 Rust tests, and 56 Playwright tests across desktop and mobile Chromium.
- `npm run check`: pass.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: pass.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: pass after installing the documented Tauri Linux prerequisites.
- `npm audit --audit-level=high`: pass; zero vulnerabilities.
- `npm run build`: pass; produces `dist/` and `dist/site/`.
- `CI=true npm run tauri build`: pass; produced AppImage, Debian, and RPM bundles.
- `/opt/fleet/lib/verify-url.sh https://reader-sideload-library.sociobot.in ...`: pass; HTTP 200, correct title/lang/main/image alternatives, labelled buttons, and no console errors.
- `node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in ...`: pass; routes, real 404, focus/announcements, axe, demo reset/isolation, mobile width, release resolution, and offline reload.

The final deployed `/` SHA-256 is `d865dda3fc737fca32a28e8bd1bb9b00f79f2abd202836b627a374634e25a145`; it is byte-identical to `dist/site/index.html`. The final live `sw.js` SHA-256 is `8db883474ed9dd78dd6796c62df14e2b780cf3e693786e4396a913a1dd7f7a8b`; it is byte-identical to the build. A fresh update test removed `rsl-shell-v4`, retained only `rsl-shell-v5`, then reloaded the four-book demo offline. See `.factory/evidence/repair-4/live/offline-update.json`.

Fresh mobile Lighthouse 13.4.1 results:

- performance 98;
- accessibility 100;
- best practices 100;
- SEO 100;
- FCP 1.36s, LCP 1.66s, CLS 0.074, TBT 0ms, transfer 182,137 bytes.

See `.factory/evidence/repair-4/live/lighthouse-summary.json` and `lighthouse.json`.

## Release and installer checks

GitHub release `v0.1.4` remains current because this repair changes only the static landing shell and tests. It includes Apple-silicon and Intel DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.

A fresh download of `Reader.Sideload.Library_0.1.4_amd64.deb` matched published SHA-256 `b7c674caf395e1cba34ea2c106fc882b131b4f2467bfd21bad135c99cb8785a9`. Package metadata is `reader-sideload-library`, version `0.1.4`, architecture `amd64`. The live detected-platform action resolves to the `v0.1.4` AppImage. Installers remain unsigned as disclosed.

## Deployment

- Class: static, unchanged.
- Build command: `npm run build:site`.
- Deploy root: `dist/site`.
- Scoped resource: `sf-reader-sideload-library` in resource group `sociobot`.
- Production custom domain: <https://reader-sideload-library.sociobot.in>.
- Unknown routes return the designed 404 with HTTP 404.
- HTML revalidates after 30 seconds, hashed assets are immutable, and `sw.js` is `no-cache`.
- CSP, HSTS, Referrer-Policy, Permissions-Policy, and `X-Content-Type-Options` are present. The only disclosed third-party browser request is GitHub's public release API.

## Known limits and operator action

No physical e-ink reader or external WebDAV provider was available. Native temporary-filesystem and local HTTP fixtures cover recursive scanning, byte-preserving USB copy/retry, WebDAV authentication/folder/upload/error recovery, and highlight formats.

macOS and Windows installers are intentionally unsigned. Signing later requires the owner's certificates; no signing secret is configured or required for this release.
