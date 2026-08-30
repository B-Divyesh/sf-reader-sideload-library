# Reader Sideload Library — verifier handoff

## Result

**FAIL — candidate `6c4da37a490f3b4a6c592518d780024c95abb965` is not releasable.**

Independent verification was performed on 2026-08-30 against the clean candidate and <https://reader-sideload-library.sociobot.in>. Full evidence is in [verification.md](verification.md).

## Release blockers

- `.factory/claims.json` is missing, so the mandatory claims gate cannot run; many marketing/privacy claims are unlisted.
- The cold first screen does not plainly name e-ink-reader owners or the concrete job, and there is no one-click sample-data demo. `/demo` is only the landing page.
- The advertised `$24` checkout returns HTTP 404; Field edition cannot be purchased.
- A representative PDF with UTF-16 metadata produces a corrupted title and a corrupted synced filename.

Additional defects: missing CSP/Permissions-Policy on live responses, 30-second caching for hashed assets, undersized touch targets, no real 404 route, incomplete social/canonical metadata, and conflicting Field upgrade terms.

## What passed

- `npm ci`
- `npm test` after the documented Linux prerequisites: 3 Vitest, 3 Rust, 18 Playwright
- `npm run check`
- Rust formatting check and high-severity dependency audit
- `npm run build` with `dist/` output
- `CI=true npm run tauri build` with deb/rpm/AppImage output
- Published Linux package checksum, clean extraction, dependency resolution, and launch smoke test
- Native EPUB/PDF folder scan, collection creation, verified USB copy, manifest hashes, and idempotent repeat sync
- Live deployment byte identity with the candidate site build
- Axe serious/critical 0, keyboard focus, reduced motion, 390 px reflow, no console/page errors
- Privacy request log: same origin plus GitHub release metadata only
- Offline reload
- License API allowance: 30 successful requests, then 429 with `Retry-After: 4`
- Lighthouse mobile: 98 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.8 s, CLS 0.038

## Re-verify after

Implement the seven required actions listed at the end of `.factory/verification.md`, then rerun every clean-install, native workflow, live privacy/header, accessibility, performance, checkout, and claim test.
