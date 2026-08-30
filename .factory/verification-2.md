# Independent product verification 2 — FAIL

## Verdict

**FAIL — do not accept candidate `82950fa5c3cdcac7dd71a396170e176b92ac6407` until the unlisted public claims are either removed or covered by exactly one observable claim test each.**

Verified on 2026-08-30 against the clean checkout at that commit and the live deployment <https://reader-sideload-library.sociobot.in>. The published home, privacy, and terms documents are byte-identical to this candidate's production output.

## First read and demo gate — pass

A cold live load says: “Organize and sideload your e-ink library.” It identifies “e-ink reader owners” with DRM-free EPUB/PDF files, and the adjacent first action is **Try it with sample data** with the explanation “Open a ready sample catalogue.” The same screen shows three plain facts: no account/telemetry, offline catalogue tools, and free core tools.

The action opens `/demo/` in one click. Its persistent banner says “Demo — sample data, nothing is saved to your library,” offers Reset demo and Start for real, and loads four realistic books, a collection, and two highlights. Search for `Zoë` returned the Unicode PDF; Collections showed the clean numbered filename `002 - Field Notes 03 — 秋.pdf`; Markdown export downloaded `reader-highlights.md` containing both sample highlights.

## Release-blocking finding

### Critical — public claims have no claim-inventory entry/test

The required `.factory/claims.json` exists and all eight listed commands pass, but it does not cover every customer-reliance statement that is published. The claims contract requires an entry and a demo-observable test for every such statement; an unlisted claim fails review.

Examples not covered by any inventory item:

- Landing scope/privacy: “Your library stays local,” “No account or cloud catalogue,” and “No saved WebDAV password.” The `privacy-requests` claim only proves that the website/sample demo makes no analytics or advertising requests; it does not prove these native-library/WebDAV-storage guarantees.
- Desktop transfer UI: “incomplete copies never replace good files.” `verified-usb-copy` proves source bytes, copied bytes, and unchanged-repeat skipping, but not a disconnect/partial-copy recovery case.
- README: recursive embedded metadata/cover/encryption validation; “Opt-in WebDAV sync with HTTPS enforcement and credentials kept only for the active transfer”; Markdown/JSON/KOReader/PDF annotation imports; and “No analytics, telemetry, CDN font, or third-party runtime script.” These have no one-to-one entries/tests.

Remove unsupported wording or add one uniquely tagged, clean-state test per claim before accepting the candidate. `.factory/copy-audit.md`, required by the plain-words contract, is also absent.

### High — the WebDAV part of the stated workflow is not currently end-to-end available to a new user

The researched smallest useful product includes sideloading via USB/WebDAV. The app and landing page say WebDAV is available only to existing Field edition buyers and “New purchases are paused.” There is no current checkout/price path, test WebDAV endpoint, or independent end-to-end upload evidence. USB is well covered, but a new customer cannot obtain the Field entitlement or complete this advertised WebDAV path. Either restore a tested, documented one-time purchase flow and add a fixture-backed WebDAV transfer test, or clearly remove WebDAV from the current product scope.

## Passing evidence

### Required claims (run first from the clean candidate)

All eight commands in `.factory/claims.json` passed:

- `@claim:demo-isolated`, `@claim:markdown-export`, `@claim:privacy-requests`, `@claim:core-free`, and `@claim:offline-demo` each passed in Chromium against the product demo entry point.
- `claim_source_scan_preserves_file_bytes`, `claim_pdf_metadata_survives_scan`, and `claim_verified_usb_copy_is_idempotent` each passed through the isolated Rust core test path.

### Local quality gates

- `npm ci`: passed; 68 packages installed, zero audit vulnerabilities.
- `npm test`: passed: 4 Vitest tests, 6 Rust tests, and 40 Playwright tests (`test-results/.last-run.json` reports `passed`).
- `npm run check`, `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`, and `npm audit --audit-level=high`: passed.
- `npm run build`: passed and produced `dist/`, `dist/app/`, and `dist/site/`.
- Initial site JavaScript is 2.94 KB raw / 1.35 KB gzip; site CSS is 12.15 KB raw / 3.36 KB gzip; loaded WOFF2 fonts total 88.27 KB; the 1440px hero is 269,022 bytes and mobile hero is 79,982 bytes.

### Live deployment, privacy, accessibility, and resilience

- SHA-256 values match exactly: home `85b7b3cf82f701e77c10bd1c0ea354c9f26a4aafe3cefb10e78f9db70dc42c39`, privacy `4f3fcbf248cc326cde60bb0df6d7670951a911741411feb82b1443765e819cfd`, and terms `919db02d608a4d1f6a3b170e586cea373c8fa33ee9d3754b82ce8cd8e0198106`.
- Live `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; an unknown route returns the designed page with HTTP 404.
- Cold home requested only the site itself and the documented GitHub releases API. The fully exercised demo requested only the site origin. No console/page errors occurred on the home, demo, privacy, or terms pages.
- HTML sends CSP, Permissions-Policy, Referrer-Policy, HSTS, and `X-Content-Type-Options`; hashed JS/CSS/image assets use `Cache-Control: public, max-age=31536000, immutable`; `sw.js` uses `no-cache`.
- Axe found zero serious/critical violations on live home, demo, privacy, terms, 404, and 390px dark/reduced-motion home. All checked normal routes have one `h1`, one `main`, `lang=en`, titles, and image alt text. Keyboard Tab visibly exposes the 3px focus ring on the skip link in both themes. At 390px, scroll width equals client width.
- A fresh service-worker context reopened the four-book `/demo/` while offline after the initial online visit.
- Local browser fallback exercise at 390px confirmed the USB-installed-app recovery message, invalid JSON highlight recovery message, valid Markdown highlight import, required collection-name validation, safe collection-name sanitisation, and keyboard tab navigation. Native source-byte, UTF-16/PDFDocEncoding, and idempotent USB-copy behavior are covered by the passing Rust claims.

### Release and allowance checks

- GitHub latest release is `v0.1.2` and contains macOS arm64/x64 DMGs, Windows MSI/EXE, and Linux AppImage/DEB/RPM, plus `SHA256SUMS` and `latest.json`.
- A freshly downloaded Linux DEB has SHA-256 `92251b3eecbad4cf40a6aee302bd2995204ca2f708a29b09dbbd7485f5583528`, matching release metadata. Its package metadata is `reader-sideload-library` version `0.1.2`, architecture `amd64`.
- The product's existing license verification endpoint allowed 30 invalid-token requests from one client; request 31 returned HTTP 429 with `Retry-After: 4` and `x-ratelimit-after: 4`. No sign-in flow exists, so Entra validation is not applicable.

## Known non-blocking limits

- Native physical-reader and real WebDAV-server compatibility were not available in this container; the filesystem-level USB behavior is independently tested by the Rust claim and release asset structure/checksum was verified.
- Linux/macOS/Windows packages are unsigned, as disclosed by the product.
