# Polish round 1 handoff — Reader Sideload Library

## What changed

Resolved every finding in `.factory/review-1.md`. The isolated sample now begins with a working search action, reset restores the whole visible catalogue state, all routes share navigation and legal footer links, and every route focuses and announces its h1. Claim wording and tests now match the exact observable behavior.

Version 0.1.4 retains the concrete, paper, graphite, and moss visual system. No new external runtime service, analytics, payment path, or AI feature was added.

## Verification

- `npm test`
- every distinct command in `.factory/claims.json`, run separately from a fresh clone
- `npm run check`
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
- `npm audit --audit-level=high`
- `npm run build`
- axe CLI on `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html`
- local Lighthouse mobile: performance 97, accessibility 100, best practices 100, SEO 100; LCP 2.107 s, CLS 0.075, TBT 0 ms
- live Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.810 s, CLS 0.057, TBT 8 ms

Detailed finding evidence is in `.factory/polish-1.md`.

## Deployment and release

- Product source commit: `eaa8ae26fcd286db7629c67a0fdccd147ec74093`.
- Production: `https://reader-sideload-library.sociobot.in` (Azure Static Web Apps deployment succeeded on 1 September 2026).
- Demo: `https://reader-sideload-library.sociobot.in/demo/?demo=1`.
- Desktop release: `https://github.com/B-Divyesh/sf-reader-sideload-library/releases/tag/v0.1.4`.
- GitHub Actions run `33563007958` passed its quality, four-platform build, and publish jobs.
- The release contains both macOS DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- A newly downloaded Windows MSI matched its `SHA256SUMS` entry.
- `node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in .factory/evidence/polish-1/live` passed from a cold context after release publication. It checks release resolution, every route, real 404 handling, route focus and announcements, console output, demo isolation/reset, mobile width, request privacy, and offline reload.

## Known gaps

None in the reviewed scope. Physical e-ink hardware and an external WebDAV provider are not available in this container; the existing native filesystem and local WebDAV fixtures cover those paths.

## Needs operator action

macOS and Windows packages remain unsigned. Signing requires the owner’s `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets; the product discloses this before download.
