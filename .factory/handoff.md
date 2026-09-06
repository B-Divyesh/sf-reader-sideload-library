# Reader Sideload Library — review 5 handoff

## Result

**FAIL — 2 low-severity findings and 0 untested claims.**

Reviewed implementation:
`d13b19677dfa9b01d626a7c65905783c047d5d88` (`v0.1.8`).
Reviewed documentation base:
`cf8da6390c93896074ecf5b27ab5a6440bdd918a`.

Product code was not changed. The review is `.factory/review-5.md`.

## Findings to fix

1. Replace the 404 `h1` **This page is not in the catalogue.** with direct, non-metaphorical error text such as **Page not found.**
2. Separate the desktop catalogue’s file type and detail. Current rendered text includes **EPUBCover found** and **PDFEmbedded pages**.

After repair, add focused regressions for the direct 404 heading and separated
desktop File-cell text, then rerun the full review gates.

## Verification completed

- Every one of the 18 claim commands passed independently from a clean clone.
- `npm test` passed: 18 claim mappings, 6 unit tests, 10 Rust tests, and 70 browser tests.
- TypeScript check, production build, Rust format, all-target Clippy with warnings denied, audit, and `CI=true npm run tauri build` passed.
- The documented GTK/WebKit prerequisites were installed before the successful Clippy and native-build runs.
- Fresh desktop and phone checks covered first read, demo isolation/reset/exit, realistic output, normal/invalid/boundary/recovery paths, keyboard, focus, 200% text, dark/reduced motion, privacy requests, offline reload, links, legal routes, and the expected HTTP 404.
- Fresh Lighthouse scored 99 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP was 1.21 s, CLS 0.073, and TBT 0 ms.
- The fresh site build and live home page matched at SHA-256 `390647649434c366daa82cfc9d824966c4353e3d0055c09f32d1d3bb4fc9f45f`.
- The published `v0.1.8` DEB matched `SHA256SUMS`, installed, opened in a clean XDG consumer profile, and loaded its bundled four-book sample.

## Evidence

- Repository report: `.factory/review-5.md`
- External evidence: `/work/.evidence/review-5/`
- Required report copy: `/work/.evidence/qa-report.md`
- Required result: `/work/.evidence/qa-result.json`

## Known external limits

No physical e-ink reader or third-party WebDAV provider was available. Native
filesystem and local HTTP fixtures cover the promised transfer behavior. The
macOS and Windows installers remain intentionally unsigned and disclose that
status.
