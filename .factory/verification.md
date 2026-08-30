# Independent product verification — FAIL

## Verdict

**FAIL — do not release candidate `6c4da37a490f3b4a6c592518d780024c95abb965`.**

Verified on 2026-08-30 against:

- clean checkout: `6c4da37a490f3b4a6c592518d780024c95abb965`
- live URL: <https://reader-sideload-library.sociobot.in>
- published release: `v0.1.0`

The conventional tests and builds pass, the live site is the candidate build, and the core USB copy is verified and idempotent. The release still fails mandatory acceptance gates: the claims inventory is absent, there is no sample-data demo, the first screen is not plain enough, the paid checkout is a 404, and common PDF metadata can corrupt catalogue titles and device filenames.

## Release-blocking findings

### Critical — required claims inventory is absent

`.factory/claims.json` does not exist in the clean checkout. Therefore no listed claim test could be run before other QA. The acceptance contract says a missing file is release-blocking.

Claim-like copy is nevertheless widespread and unlisted. Examples include “Read-only source scan”, “Verified file copies”, “No telemetry”, “Original book files are never rewritten”, “WebDAV ... retries safely”, “Unlimited local catalogue scans”, and “offline fallbacks”. There is no exactly tagged `@claim:<id>` coverage for these statements. `.factory/copy-audit.md` is also absent.

### Critical — no one-click sample demo and failed first-read gate

Cold desktop and 390 px mobile loads show:

- headline: `Books in. Reading work out.`
- supporting line: `A quiet desktop tool for getting your own EPUBs, PDFs, collections, and highlights safely across the cable.`
- primary action: `Download for Linux 64-bit`

The first screen does not name owners of e-ink readers, and the metaphorical headline does not state the concrete job in plain words. There is no “Try it with sample data” or “Load sample project” action. `/demo` returns the ordinary landing page with status 200, not a sandbox. `.factory/demo.md`, a separate demo storage namespace, demo banner, reset action, and “Start for real” action are all absent.

### Critical — advertised paid checkout is broken

The live `$24` “Buy Field edition” link requests:

`GET https://api.sociobot.in/api/v1/products/reader-sideload-library/checkout`

Fresh result: HTTP 404 with `{"error":"enabled factory product","status":404}`. The paid WebDAV feature cannot be purchased. This was previously listed as operator work, but the production landing page actively advertises the purchase.

The verify endpoint itself is reachable. Its observed single-client allowance was 30 requests: attempts 1–30 returned 200 for an invalid token; attempt 31 returned 429 with `Retry-After: 4` and `x-ratelimit-after: 4`.

### High — normal PDF metadata corrupts catalogue and output filenames

A representative one-page PDF with a title stored in UTF-16 was scanned in the published Linux desktop app. The title appeared as `��Field-Notes-03`, with replacement characters instead of clean title text. The same corruption propagated to the device filename:

`01 - Autumn Queue/002 - ��-F-i-e-l-d---N-o-t-e-s---0-3--.pdf`

The implementation decodes PDF string bytes with UTF-8 replacement rather than PDFDocEncoding/UTF-16 handling. This breaks catalogue accuracy, search, deduplication expectations, and device-safe names for a common PDF representation.

## Other findings

### Medium — live security and cache headers do not match the repository policy

Live HTML and assets include HSTS, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`. They do not include Content-Security-Policy or Permissions-Policy. The repository `_headers` file contains a Permissions-Policy but no CSP, and its rules are not reflected by the deployment.

Every checked hashed asset (`main-DG4J_Wj-.js`, `style-52Rc7vDe.css`, and the WebP hero) is served with `Cache-Control: public, must-revalidate, max-age=30`, not the intended one-year immutable policy.

### Medium — no real 404 route

`/definitely-missing` returns the landing page with HTTP 200 and the home-page title and h1. No `404.html` or route-specific recovery page exists.

### Medium — touch targets miss the 44 px baseline

Axe found no serious or critical issues, but direct geometry checks found multiple live controls below 44 px high: header navigation links are 20 px high, the “Other platforms” link is 18 px, footer/legal and platform links are 20 px, and both Copy buttons are 36 px. The mobile result contains the same undersized link/button targets.

### Medium — required page metadata is incomplete

The landing document has a title, description, language, theme color, and SVG favicon, but lacks a canonical link, Open Graph metadata, Twitter card metadata, an original 1200×630 social image, and a 180 px Apple touch icon.

### Medium — purchase entitlement copy conflicts

The landing page says “Future Field upgrades included”; `/terms/` limits the one-time purchase to “the current major version”. A buyer cannot tell which promise controls.

### Low — documented native build is sensitive to `CI=1`

`npm run tauri build` initially exited before compilation because Tauri interpreted the inherited `CI=1` as an invalid boolean. `CI=true npm run tauri build` passed and produced all Linux bundles. GitHub Actions uses the compatible boolean value, so this is an environment/documentation issue rather than a package blocker.

## Passing evidence

### Clean install, tests, checks, and builds

After installing the README-listed Linux Tauri prerequisites:

- `npm ci`: passed; 68 packages; zero audit vulnerabilities
- `npm test`: passed — 3 Vitest, 3 Rust, and 18 Playwright tests
- `npm run check`: passed
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed
- `npm audit --audit-level=high`: passed
- `npm run build`: passed; produced `dist/`, `dist/app/`, and `dist/site/`
- `CI=true npm run tauri build`: passed; produced `.deb`, `.rpm`, and `.AppImage`

The first `npm test` attempt stopped on missing system `glib-2.0`/WebKit packages. After installing the exact prerequisites documented in README, the unchanged candidate passed.

### Core desktop workflow

The published Linux `.deb` was extracted into a clean temporary consumer. Its executable resolved all libraries and stayed running until the smoke-test timeout.

Native UI exercise:

1. Selected a folder containing a valid EPUB, a PDF, and an ignored text file.
2. App indexed two books and ignored the text file.
3. EPUB title, author, series index, and cover status were recovered.
4. Created `Autumn Queue` with both books.
5. Synced to a selected filesystem folder.
6. App reported `2 copied · 0 unchanged`.
7. Both copied file SHA-256 values exactly matched their sources; the manifest contained the same hashes.
8. Repeated the sync; app reported `0 copied · 2 unchanged`.

Browser-shell recovery checks also passed for empty collection creation, empty export, search with no matches, collection filename sanitization, highlight Markdown import/export, empty license input, persisted state after reload, and 390 px reflow. One preview-only defect was observed: invalid JSON reports “Imported 0 highlights” instead of an error; the native Rust import path does return an error.

### Deployment identity and installers

The live `/`, `/privacy/`, and `/terms/` response bodies are byte-for-byte identical to `dist/site` from the candidate:

- `/`: `5cb1a40bb34ee39868efbb3138e2bcbb5b7a788bb9458b9493e36fb4aec360f2`
- `/privacy/`: `17bed535cbc4c7d26b1b9e9bb57c46c42abe15cb9c13969d3cf3f81affdd1f3a`
- `/terms/`: `a728e585b83504204dabac1501aa6d9927f2954889930374855397df2b21a86d`

The `v0.1.0` tag resolves to `f0dcd2266ce8c1955bebfb217445249ada293d7a`; the candidate adds only landing release-resolution logic and handoff documentation. Native app source is byte-identical between the tag and candidate.

The release contains macOS ARM64/Intel, Windows, Linux AppImage/deb/rpm, `latest.json`, and `SHA256SUMS`. The independently downloaded Linux `.deb` SHA-256 was `93d3980f205ba5b87ed70a7a2dc1b75ef984b4f73494bde4fd66cb800fe1cf95`, matching GitHub metadata and `SHA256SUMS`.

All live links resolved as expected except the paid checkout. Dynamic installer links returned the expected GitHub asset redirects.

### Accessibility, privacy, mobile, errors, and offline

- Axe serious/critical: 0 on live desktop and 390 px mobile; 0 in light/dark app checks
- one h1, `lang=en`, title, main landmark, skip link: present
- keyboard: skip link receives first focus with a visible 3 px outline; app tabs work with arrow keys; no trap observed
- reduced motion: media query matched and animation/transition durations reduced to effectively zero
- 390 px: no horizontal overflow; app body text is 16 px
- console/page errors: none on cold live desktop/mobile or the exercised app flow
- live outgoing requests: same-origin assets plus only the GitHub releases API; no analytics, ad, CDN font, or tracking request
- service worker: installed and active; offline reload returned the landing page with styling; shell cache present
- privacy implementation review: catalogue state and license verdict are local; WebDAV credentials are passed only to the active native command; original-file scan/copy paths are read-only
- authentication: not required, so Entra tenant validation is not applicable
- backend/concurrency/SQLite checks: not applicable; this is a local desktop app with no product backend

### Performance

Independent Lighthouse mobile run against production:

- performance 98
- accessibility 100
- best practices 100
- SEO 100
- LCP 1.8 s
- CLS 0.038
- TBT 130 ms
- total transfer 181,365 bytes

Built budgets pass: site JS is under 4 KB raw across initial chunks, app JS is 18.02 KB raw, CSS is about 11.4 KB, loaded fonts are about 88.5 KB, and the mobile hero is 79,982 bytes.

## Required before re-verification

1. Add `.factory/claims.json` and one observable demo-based test per claim; add the copy audit.
2. Ship the mandatory one-click sample library/demo with isolated state and documentation.
3. Rewrite the first screen to state the e-ink library job, audience, and first action plainly.
4. Register/enable the paid product or remove the purchase offer until checkout works.
5. Decode PDF metadata strings correctly and test UTF-16/PDFDocEncoding titles and authors through scan → search → sync filename.
6. Add the missing 404 route, metadata, security headers, immutable asset caching, and 44 px targets.
7. Reconcile the Field upgrade entitlement copy.
