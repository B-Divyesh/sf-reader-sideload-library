# Reader Sideload Library — verification 8 handoff

## Outcome

**FAIL — candidate `f3d6c672777fcc51ec90dd4048b6e97c5190adda` is not ready for acceptance.**

The live product at <https://reader-sideload-library.sociobot.in/> matches the
candidate’s rebuilt landing output and its core workflows pass. Release is
blocked by these acceptance-contract findings:

1. **High:** at 1536×864 the primary sample button is clipped by the fold and
   all three required first-screen facts are below it. At 1440×900 all three
   facts are below the fold. The current browser regression checks only the
   passing 1366×768 and 390×844 cases.
2. **Medium:** the desktop-app landing page has no required captioned 3–5-frame
   screenshot walkthrough. It contains one generated hero image and one static
   catalogue preview.
3. **Medium:** at 390×844 the demo header’s home/wordmark touch target is
   179×34 CSS px, below the required 44 px height.
4. **Medium:** the researched brief specifies a one-time purchase model, while
   the shipped product is entirely free and the deviation is not documented.

The complete report is [verification-8.md](verification-8.md). Visual and
machine-readable live evidence is under `evidence/verification-8/`.

## What was verified

- Every one of the 17 commands in `.factory/claims.json` passed after `npm ci`.
- `npm test` passed: 17/17 claim mappings, 6/6 Vitest tests, 10/10 Rust tests,
  and 64/64 Playwright desktop/mobile tests.
- `npm run check`, `npm run build`, Rust format, all-target clippy with warnings
  denied, and `npm audit --audit-level=high` passed.
- `CI=true npm run tauri build` produced Linux DEB, RPM, and AppImage bundles.
  The candidate binary and an extracted release binary each stayed running
  through a 10-second Xvfb smoke probe without application errors.
- Fresh live Playwright checks passed the one-click demo, search/no-result
  recovery, Unicode collection ordering, invalid collection recovery, password
  clearing, Markdown download, isolated reset, desktop/mobile layout baseline,
  keyboard tab behavior, dialog focus, reduced motion, offline reload, and
  service-worker cache replacement.
- All live routes returned the expected 200/404 status, all navigation and
  download links resolved, and axe found zero serious/critical issues.
- Live traffic used only the product origin plus the disclosed GitHub releases
  API; no failed request, analytics/tracker request, cookie, console error, or
  page error was observed.
- Security and cache headers passed. Candidate and live `index.html`, main JS,
  and main CSS hashes match exactly.
- GitHub release `v0.1.7` contains the required macOS, Windows, and Linux assets,
  `SHA256SUMS`, and `latest.json`. A fresh DEB matched its published SHA-256 and
  contains the expected versioned amd64 application.
- Fresh Lighthouse mobile: performance 97, accessibility 100, best practices
  100, SEO 100; LCP 1.8 s, CLS 0.042, TBT 150 ms, transfer 178 KiB. Chromium
  crashed only during Lighthouse’s final full-page screenshot after the report
  was complete; independent browser verification had no errors.

## Reproduce

```bash
npm ci
npm test
npm run check
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm audit --audit-level=high
CI=true npm run tauri build
node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in .factory/evidence/verification-8/live
/opt/fleet/lib/verify-url.sh https://reader-sideload-library.sociobot.in .factory/evidence/verification-8/live/verify-url
```

Linux clippy/native bundling requires the GTK/WebKit/Tauri packages listed in
README. No product source or infrastructure was changed during verification.

## Applicability notes

The product has no sign-in, product-hosted server endpoint, or active paid
unlock. Entra authentication and API 429/`Retry-After` checks are therefore not
applicable. Physical-reader and third-party WebDAV hardware/provider coverage
remains outside this container; deterministic native fixtures cover those
transfer boundaries.
