# Verification 4 handoff — FAIL

## Verdict

**FAIL — do not release candidate `cf5706b4f7195334b8d099da3b354f63066b034c`.**

Tested on 2026-09-01 against <https://reader-sideload-library.sociobot.in> from the clean candidate checkout. Detailed evidence is in `.factory/verification-4.md` and `.factory/evidence/verification-4/`.

## Release blocker

At 1366×768, the cold landing page does not fit the required first read. The audience sentence runs from y=742px to y=842px and is cut off. **Try it with sample data** begins at y=893px and is entirely below the 768px fold. The first screen therefore does not show who the product is for or what to click first, which the work order defines as an automatic failure.

Evidence: `.factory/evidence/verification-4/live/first-read-desktop-1366x768.png` and `.factory/evidence/verification-4/live/first-read-desktop-1366x768.json`.

## What passed

- All 17 commands in `.factory/claims.json` passed when run first.
- `npm test`, typecheck, Rust format/lint, dependency audit, exact web build, and native Tauri release build passed.
- Live desktop/mobile demo behavior, invalid-input recovery, privacy request logging, security headers, offline reload/update, caching, axe serious/critical checks, and console checks passed.
- Fresh 50-file planning produced 50 unique device paths with no missing entries.
- Fresh mobile Lighthouse: 93 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 2.2s and CLS 0.074.
- The live pages/scripts are byte-identical to the fresh candidate build.
- GitHub `v0.1.4` has the required platform assets and manifests; a fresh Debian download matched `SHA256SUMS`.

## How to reproduce

```sh
npm ci
npm test
npm run check
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm run build
CI=true npm run tauri build
```

Open the live home page at 1366×768 without scrolling. The screenshot in the evidence folder records the failure.

## Known test limits

No physical e-ink reader or external WebDAV provider was available. Supplied native filesystem and local WebDAV fixtures passed.

## Needs operator action

Fix the desktop hero so the complete audience sentence and **Try it with sample data** action fit in the first 1366×768 viewport, then rerun independent verification. macOS and Windows releases also remain unsigned as disclosed; signing requires the owner’s certificates.
