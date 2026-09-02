# Reader Sideload Library — polish round 3 handoff

## Outcome

Perfection-loop round 3 is complete. Every finding in reviews 1–3 is fixed, covered by a regression or claim test, and rechecked on the deployed product. The complete finding-to-change-to-evidence map is `.factory/polish-3.md`.

- Live product: https://reader-sideload-library.sociobot.in/
- Isolated sample: https://reader-sideload-library.sociobot.in/demo/?demo=1
- Release: https://github.com/B-Divyesh/sf-reader-sideload-library/releases/tag/v0.1.7
- Repair commit: `822083ae4de99738d3d33966e9793c43574ae5f5`
- Tagged release commit: `42c8acb13c54a938620e5de029d9b88769b3a87c`
- GitHub Actions run: `33588336352` — all six jobs passed
- Static deployment: `48f44d54-e053-45d1-b939-492ed6cbd467`

## Work completed

- Added explicit, route-specific Twitter title, description, image, and card metadata on home, demo, privacy, terms, and 404 routes.
- Renamed the footer destination to **Source on GitHub (external)**.
- Replaced three vague app labels with **Desktop app for DRM-free books**, **Ordered device folders**, and **USB, WebDAV, and Markdown export**.
- Added desktop and mobile regressions for complete social metadata, external-link labels, and direct task labels.
- Kept the one-click `?demo=1` path isolated under `demo:rsl:library-state:v1`, with a persistent banner, complete reset, and **Start for real** exit.
- Kept real route status, titles, canonical/Open Graph/Twitter metadata, focused h1, polite announcements, consistent navigation, legal links, and the styled 404.
- Bumped the app, release workflow, visible site version, and service-worker shell to `0.1.7`/`rsl-shell-v7`.
- Updated `.factory/catalog-description.txt` to: “Organize DRM-free books, set reader order, and sideload by USB or WebDAV.”
- Updated the copy audit and retained the product's concrete paper, graphite, ink, and moss visual system.

## Verification

### Clean clone at the tagged commit

Fresh clone commit: `42c8acb13c54a938620e5de029d9b88769b3a87c`.

- Every one of the 17 commands in `.factory/claims.json` passed independently.
- `npm test` passed the 17-entry claim inventory, 6 Vitest tests, 10 Rust tests, and 62 Playwright tests across desktop and 390 px mobile projects.
- `npm run build` passed and produced `dist/`, including `dist/site`.
- App JavaScript is 7.85 KB gzip; site JavaScript is 1.51 KB gzip; app/site CSS is 3.79/3.66 KB gzip.
- `cargo fmt --check` passed.
- `cargo clippy --all-targets -- -D warnings` passed.
- `npm audit --audit-level=high` reported zero vulnerabilities.
- A Linux Tauri bundle smoke build produced AppImage, DEB, and RPM packages during repair.

### Published desktop release

GitHub Actions run `33588336352` passed quality, macOS Intel, macOS Apple silicon, Windows, Linux, and publish jobs. Release `v0.1.7` contains:

- macOS Apple silicon and Intel DMGs
- Windows MSI and setup EXE
- Linux AppImage, DEB, and RPM
- `SHA256SUMS` and a valid four-platform `latest.json`

The published DEB was downloaded cold and matched `SHA256SUMS`:

```text
Reader.Sideload.Library_0.1.7_amd64.deb: OK
996354ea87ae1dc226de5d0ffeca0b304f903f3e72bc19cf6ca493c911544a94
```

### Final live audit

- `node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in .factory/evidence/polish-3/live` passed with zero failures.
- Home, demo, privacy, and terms returned 200; an unknown route returned the designed 404.
- All five routes had one h1, one main, route focus, a polite announcement, correct route metadata, zero console errors, and zero serious/critical axe findings.
- The home page resolved release `0.1.7` and its real AppImage URL.
- `/?demo=1` redirected to `/demo/?demo=1` without a third-party request. Reset restored four books and preserved the sentinel real-library value.
- The exact demo URL reloaded offline with the demo banner and four books in a fresh context.
- Desktop 1366×768 and mobile 390×844 first screens contained the audience, sample action, and all three facts. The mobile demo had no horizontal overflow.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 777 ms load, correct title/lang/main, no missing alt text, no unlabeled buttons, and no console errors.
- Final mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.73 s, CLS 0.042, TBT 0 ms, total transfer 182,207 bytes.

Evidence is under `.factory/evidence/polish-3/live/`, including `findings.json`, `verify-url/verify.json`, `lighthouse.json`, and six desktop/mobile screenshots.

## Run and verify

```sh
npm ci
npm test
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm audit --audit-level=high
node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in .factory/evidence/polish-3/live
```

Run every claim exactly as a verifier does by executing each `test` value in `.factory/claims.json` from a fresh clone.

## Known gaps

None within this work order. The macOS and Windows installers are intentionally unsigned and the site discloses this before download.

## Needs operator action

No action is required for the published unsigned release. Future notarized macOS and Authenticode Windows builds require owner certificates; use `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` only after adding the corresponding signing steps and certificate passwords to the release workflow.
