# Independent product verification 6 — PASS

## Verdict

**PASS — accept candidate `54e5c4590db68096d4a1d583be988e3bc30a6781`.**

Verified on 2 September 2026 from a clean checkout against <https://reader-sideload-library.sociobot.in>. No product code was modified during this verification.

## Cold first read and sample sandbox

At a cold live desktop load, the first screen plainly answers all required questions:

- **What it does:** “Organize and sideload your e-ink library.”
- **For whom:** “For e-ink reader owners who keep EPUB and PDF files…”
- **What to do first:** **Try it with sample data**, with “Open a ready sample catalogue.” beside it.

The primary action is one click and opens the four-book working sample. The demo has a persistent **Demo — sample data, nothing is saved** banner with **Reset demo** and **Start for real**. At 1366×768 the audience, action, and all three plain facts end at y=600.1; at 390×844 they end at y=700.0, so all remain on the first screen.

The live demo starts from `/?demo=1`, redirects to `/demo/?demo=1`, searches its Unicode `Zoë` PDF sample, resets to four records, and preserves a sentinel real-storage key. Its storage namespace is `demo:rsl:library-state:v1`; it does not replace `rsl:library-state:v1`.

## Claims gate

`.factory/claims.json` exists with 17 entries. Before wider QA, every listed command was executed separately after `npm ci` from this clean checkout. (The initial direct command could not start because clean checkouts do not contain `node_modules`; the locked install succeeded with zero npm audit vulnerabilities.) All claims passed:

| Claims | Result |
| --- | --- |
| `demo-isolated`, `local-catalogue`, `privacy-requests`, `core-free`, `offline-demo` | pass |
| `nested-library-scan`, `source-preserved`, `pdf-metadata` | pass |
| `ordered-collections`, `verified-usb-copy`, `usb-partial-copy` | pass |
| `webdav-credentials`, `webdav-transfer` | pass |
| `highlight-import-formats`, `markdown-export` | pass |
| `release-manifest`, `unsigned-installers` | pass |

The inventory check also passed with 17 claims and 17 unique test markers.

## Local quality gates

- `npm ci`: pass; 68 packages, zero audit vulnerabilities.
- `npm test`: pass — claim inventory, 6 Vitest tests, 10 Rust-core tests, and 56 Playwright tests across desktop and mobile Chromium.
- `npm run check`: pass.
- `npm run build`: pass; creates `dist/`, `dist/site/`, and `dist/app/`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: pass.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: pass.
- `CI=true npm run tauri build`: pass after installing the README/CI-listed Linux GTK/WebKit prerequisites; creates the v0.1.6 DEB, RPM, and AppImage.

The exact production build has 7.85 KB gzip initial app JavaScript and 1.51 KB gzip landing-page JavaScript. App CSS is 3.79 KB gzip and site CSS is 3.84 KB gzip.

## Independent end-to-end checks

Using the locally built desktop-web preview, I independently confirmed:

- `Zoë` returns one Unicode PDF; a 1,024-character no-match query gives “No books match this filter,” and clearing it restores four records.
- Creating `A/B:C?` produces a safe collection name `A-B-C-`.
- Invalid WebDAV input reports the browser validation message “Please enter a URL.” A valid demo check does not contact a server, gives the explicit demo recovery message, and clears the password.
- Markdown export downloads `reader-highlights.md`.
- The preview’s request log contains only its own origin and its demo state is separate from real state.

The complete Rust suite additionally covers recursive scan/metadata protection, source-byte preservation, PDF metadata encodings, device-safe paths, idempotent USB copy, partial-copy preservation, WebDAV authentication/error paths, and documented highlight formats. No physical reader or external WebDAV account was in scope; those paths are covered with local filesystem and HTTP fixtures.

## Live deployment, privacy, accessibility, and caching

- The live root document SHA-256 is identical to this candidate build: `840b83649c529b022ab3172b28c0870586070742b78b7fcf6ddc20e48084d775`.
- All 44 web-served files in `dist/site/` are byte-identical to the live files. `staticwebapp.config.json` is a deployment control file and correctly returns 404 rather than being public.
- The deployed home resolves v0.1.6’s real Linux AppImage URL. GitHub latest contains both macOS DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- A fresh v0.1.6 DEB download has SHA-256 `530f5c7fda5bdebcb888930a03562536b0e499f491d429fb11bde76545ac24e5`, matching `SHA256SUMS`. Its metadata is `reader-sideload-library` 0.1.6, amd64, depending on `libwebkit2gtk-4.1-0, libgtk-3-0`; extracted binary dependencies contain no `not found` entries.
- `/`, `/demo/`, `/privacy/`, `/terms/`, and the true missing route have correct status/title, exactly one `<h1>` and `<main>`, route focus/announcement, zero console/page errors, and zero serious/critical axe findings.
- `/opt/fleet/lib/verify-url.sh` passes on the live URL: title, `lang=en`, main landmark, alt text, button names, and console checks are clean.
- Keyboard skip-link/tab behavior, arrow-key tabs, 390px no-overflow behavior, visible focus, dark mode, and reduced motion are covered in the passing browser suite. The live demo has no horizontal overflow at 390px.
- Live demo offline reload retains the four-book sample and its demo banner after the first visit.
- Outgoing browser requests during demo stay same-origin except the disclosed GitHub public releases metadata API. There are no cookies, analytics, ads, third-party fonts, or third-party runtime scripts.
- Response headers include CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, Referrer-Policy, and Permissions-Policy. HTML is `max-age=30`; hashed assets are one-year immutable; `sw.js` is `no-cache`.

This is a static landing/demo and local desktop app. It has no product server endpoint or sign-in, so 429/`Retry-After` allowance and Entra External ID checks are not applicable.

## Performance

Fresh mobile Lighthouse: **98 performance, 100 accessibility, 100 best practices, 100 SEO**. FCP 1.1 s, LCP 1.5 s, CLS 0.073, TBT 100 ms, and total transfer 178 KiB.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Evidence

- `.factory/evidence/verification-6/live/findings.json`
- `.factory/evidence/verification-6/live/verify-url/verify.json`
- `.factory/evidence/verification-6/live/lighthouse.json`
- `.factory/evidence/verification-6/deployment-match.txt`
