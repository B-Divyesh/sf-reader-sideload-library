# Reader Sideload Library — build handoff

## Shipped in v0.1.0

- Tauri 2 desktop app with a Vite/TypeScript interface and Rust filesystem core.
- Read-only recursive EPUB/PDF scan, metadata and cover checks, protected-file exclusion, duplicate-safe naming, local search, and catalogue persistence.
- Ordered device-safe collections plus verified USB sync using temporary files, SHA-256 checks, atomic rename, unchanged-file skipping, and a per-device manifest.
- Opt-in WebDAV transfer with HTTPS enforcement, session-only credentials, progress/error recovery, and a one-time Sociobot Field edition unlock. USB and all import/export remain free.
- Markdown, JSON, KOReader-style sidecar, and embedded PDF annotation import with plain Markdown export.
- Responsive landing, app, privacy, and terms screens; OS-aware downloads; checksum-verifying shell and PowerShell installers; offline site shell.
- Original generated hero artwork, self-hosted fonts, light/dark treatments, keyboard operation, reduced-motion handling, and explicit empty/loading/error/offline states.
- Tag-driven GitHub Actions builds for macOS ARM64/Intel, Windows x64, and Linux x64, followed by a release containing installers, `SHA256SUMS`, and `latest.json`.

## Verification

Run from a clean checkout with Node.js 22+, Rust stable, and the Tauri platform prerequisites:

```sh
npm ci
npx playwright install --with-deps chromium
npm test
npm run build
```

Verified on 2026-08-28:

- `npm test`: 3/3 TypeScript tests, 3/3 Rust tests, and 18/18 Playwright checks passed.
- Playwright covers app/site semantics, keyboard tabs, 390px layouts, light/dark themes, release failure fallback, and axe serious/critical violations.
- `npm run build`: passed; static deploy output is `dist/site/index.html`.
- `cargo fmt --check`: passed.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Native Linux packaging: `.deb` and `.AppImage` both produced successfully.
- Release manifest dry run: all four required platform keys found and every generated SHA-256 entry verified.

Lighthouse mobile for the production landing build: performance 98, accessibility 100, best practices 100, SEO 100; LCP 2.1 s, CLS 0.033, TBT 0 ms, total transfer 177 KiB, and zero console errors. Initial app JavaScript is 18.02 KB raw; site JavaScript is 2.65 KB raw; CSS is 11.4 KB; loaded WOFF2 fonts total about 88 KB; the mobile hero is 80 KB.

## Known gaps

- Hardware behavior still merits a compatibility pass across representative Kobo, PocketBook, reMarkable, and generic USB-mass-storage readers; the core copy path is filesystem-generic and covered by an idempotent verified-sync test.
- WebDAV has deterministic error handling but should be smoke-tested against each operator-supported service before naming those services publicly.
- PDF highlight extraction reads embedded text annotations; ink-only or vendor-private annotations cannot be converted without OCR/vendor-specific adapters.
- The current installers are intentionally unsigned, so macOS and Windows display platform trust warnings.

## Needs operator action

- Register the paid product slug `reader-sideload-library` in the Sociobot billing engine and confirm the production return URL. No provider product ID is hardcoded.
- For trusted signed releases, wire the owner credentials into the workflow. The signing secrets are `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`. The current unsigned workflow expects no signing secrets.
- Complete hardware/WebDAV smoke tests and code-signing/notarization before promoting beyond the unsigned v0.1 pilot.
