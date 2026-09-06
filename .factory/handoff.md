# Reader Sideload Library — repair 6 handoff

## Result

**PASS — the two review-5 findings are repaired.**

- Implementation SHA: `9fc7213ef5e3231c73a0da7bfb23ea65bcaccf78`
- Release: `v0.1.9`
- Release workflow: [run 34009394937](https://github.com/B-Divyesh/sf-reader-sideload-library/actions/runs/34009394937)
- Live origin: `https://reader-sideload-library.sociobot.in`

The job is to organize DRM-free EPUB/PDF libraries, preserve reading order, and
sideload them to an e-ink reader. It is for e-ink reader owners with local
book files. The first action is **Try it with sample data**, which opens a
ready sample catalogue.

## Repairs

1. The real 404 document now uses the direct heading **Page not found.** and
   retains an accessible home action. Its focused browser regression asserts
   the rendered heading and recovery link, not a source-string match.
2. Desktop catalogue File cells now include semantic whitespace and stack the
   file type over the cover/detail text. The regression opens the actual sample
   at a desktop viewport, asserts whitespace in rendered text, and verifies
   that the detail is below the format. The published DEB screen shows `EPUB`
   over `Cover found`, and `PDF` over `Embedded pages`.

## Verification

- From the documented clean setup, `npm ci` passed; every one of the 18
  declared claim commands was run individually and passed. `npm test` passed
  with 74 tests.
- `npm run check`, `npm run build`, `cargo fmt --check`, all-target
  `cargo clippy -- -D warnings`, `npm audit --audit-level=high`, and
  `CI=true npm run tauri build` all passed. The README-listed GTK/WebKit
  prerequisites were installed before the native checks.
- The native build produced DEB, RPM, and AppImage bundles. The public
  `v0.1.9` release includes Apple-silicon and Intel DMGs, Windows MSI/EXE,
  Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- A newly downloaded public DEB matched `SHA256SUMS`, reported
  `reader-sideload-library 0.1.9 amd64`, resolved its dynamic libraries, and
  ran in a clean XDG consumer profile under Xvfb. Its bundled sample loaded
  four books and two issues. The only stderr was the expected Xvfb DRI3
  acceleration warning.
- Static deployment completed with existing durable Static Web App settings
  preserved (deployment `57424555-0eeb-4c53-b2ec-dd22a7144975`).
- Fresh desktop and phone browser checks passed. The first screen exposes the
  job, audience, sample action, and its outcome before scrolling. One click
  loads the realistic four-book sandbox, shows the persistent sample label,
  resets filters and order, and leaves the real storage sentinel unchanged.
- Live `verify-live.mjs` covered home, demo, privacy, terms, and an expected
  HTTP 404. All routes had one title, h1, and main; zero console errors; and
  zero serious/critical axe findings. `verify-url.sh` also passed.
- Current manual live checks passed normal, invalid, boundary, recovery,
  keyboard Home/End, focus, dark/reduced-motion, privacy/no-cookie, offline,
  sample exit, highlight export/import, USB guidance, and WebDAV demo
  credential-clearing paths.
- Fresh mobile Lighthouse: performance 98, accessibility 100, best practices
  100, SEO 100; LCP 1.66 s, CLS 0.077, and TBT 0 ms.

## Earlier finding disposition

All findings in the complete review and verification history remain resolved:

| Finding group | Current proof |
| --- | --- |
| Claims, sample sandbox, privacy, free-release copy | 18 individually passing claims; current live isolation/reset, request, cookie, offline, and exit checks passed. |
| Library scan, PDF metadata, source preservation, USB, WebDAV, highlights | Rust/native claims passed in the full suite; live demo exercised user-facing recovery paths. |
| First-read, responsive layout, keyboard, focus, motion, metadata, legal routes, 404 | Fresh desktop/phone checks, live route/Axe checks, `verify-url.sh`, and the 404 regression passed. |
| Release/installers and native builds | CI release matrix succeeded; public manifest/checksum and clean consumer DEB exercise passed. |
| Review-5 low findings | Direct 404 heading and separate desktop file details are covered by new outcome regressions and live/public-artifact checks. |

## Evidence

- Live and accessibility evidence: `.factory/evidence/repair-6/live/`
- Full manual live-path evidence: `.factory/evidence/repair-6/manual-live.json`
- Public release and clean-consumer evidence: `.factory/evidence/repair-6/release/`
- Required catalogue description: `.factory/catalog-description.txt`, copied
  unchanged to `/work/.evidence/catalog-description.txt`.

## Known limits

No physical e-ink reader or third-party WebDAV provider was available. Native
filesystem and local HTTP fixtures cover the promised transfer behaviour. The
macOS and Windows installers are intentionally unsigned and disclose that
status. Version 0.1 remains an explicitly free release; no billing offer is
advertised or registered.
