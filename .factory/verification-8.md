# Independent product verification 8 — FAIL

## Verdict

**FAIL — do not accept candidate `f3d6c672777fcc51ec90dd4048b6e97c5190adda`.**

Verified on 2 September 2026 from the clean checkout and against
<https://reader-sideload-library.sociobot.in/>. The catalogue, collection,
transfer-core, highlight, privacy, offline, release, and accessibility test
suites pass. The release is blocked by three acceptance-contract defects in
the shipped responsive landing/demo experience, plus one undocumented product
strategy deviation from the researched brief.

No product source was changed during this verification.

## Mandatory first checks

`.factory/claims.json` exists with 17 entries. After `npm ci`, every `test`
command was run independently and exactly as declared. All passed:

| Claim | Result and observed evidence |
| --- | --- |
| `demo-isolated` | PASS — the real-library sentinel survived search/reset and only `demo:rsl:library-state:v1` changed. |
| `local-catalogue` | PASS — EPUB import, collection creation, and highlight import persisted locally with same-origin requests only. |
| `privacy-requests` | PASS — the mocked production-origin flow allowed only the declared GitHub release lookup and set no cookies. |
| `core-free` | PASS — catalogue, collections, highlights, and WebDAV controls were available without a license or checkout. |
| `offline-demo` | PASS — the four-book demo reloaded offline after service-worker installation. |
| `nested-library-scan` | PASS — native nested EPUB/PDF scan read metadata, ignored unrelated files, and excluded protected media. |
| `source-preserved` | PASS — native scan preserved source bytes exactly. |
| `pdf-metadata` | PASS — native scan preserved Unicode PDF title and author metadata. |
| `ordered-collections` | PASS — Unicode search and the three ordered device-safe filenames matched. |
| `verified-usb-copy` | PASS — source bytes matched, verification succeeded, and the repeat copy skipped unchanged content. |
| `usb-partial-copy` | PASS — injected partial staging did not replace the existing verified destination. |
| `webdav-credentials` | PASS — failure/success/upload paths cleared the password and did not persist endpoint credentials. |
| `webdav-transfer` | PASS — HTTPS enforcement, PROPFIND/MKCOL/authenticated PUT, exact bytes, and recovery messages passed. |
| `highlight-import-formats` | PASS — Markdown, text, JSON, KOReader sidecar, and annotated PDF fixtures imported. |
| `markdown-export` | PASS — the download was `reader-highlights.md` and contained the expected sample quote. |
| `release-manifest` | PASS — release workflow, required platform entries, checksums, and metadata sources passed. |
| `unsigned-installers` | PASS — signing identities are absent and the public disclosure is present. |

Cold first read passed the work order's immediate stop condition. The live page
states the job, “Organize and sideload your e-ink library,” names e-ink owners
with EPUB/PDF files, and labels the first action “Try it with sample data,” with
“Open a ready sample catalogue” beside it. That one click opens the working
four-book demo at `/demo/?demo=1`.

The broader required first-screen layout still fails at common desktop sizes;
see finding V8-1.

## Clean-checkout gates

- `npm ci`: PASS — 68 packages installed; zero audit vulnerabilities.
- `npm test`: PASS — claim inventory 17/17, Vitest 6/6, native Rust 10/10,
  Playwright 64/64 across desktop and mobile Chromium.
- `npm run check`: PASS.
- `npm run build`: PASS — created `dist/` and `dist/site/`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`:
  PASS after installing the README-listed GTK/WebKit development packages in
  the disposable verifier container.
- `npm audit --audit-level=high`: PASS — zero vulnerabilities.
- `CI=true npm run tauri build`: PASS — produced Linux `.deb`, `.rpm`, and
  `.AppImage` bundles. The native binary stayed running through a 10-second
  Xvfb smoke probe with no stderr output.

## End-to-end behavior

Fresh live demo checks covered normal, boundary, invalid, and recovery paths:

- Searching for an absent title showed “No books match this filter”; clearing
  the query restored all four records.
- Moving the Unicode PDF upward changed the numbered transfer plan.
- Creating a collection with no selected books produced “Choose at least one
  book”; selecting a book then created a sanitized `Boundary - Queue---`
  collection.
- Demo WebDAV refused network use, explained how to leave the demo, and cleared
  the entered password.
- Markdown export downloaded `reader-highlights.md`.
- In the fresh real-app web preview, collection creation without books returned
  to Catalogue with a recovery message; an EPUB fixture then imported; malformed
  JSON showed a useful error; a valid Markdown fixture recovered successfully.
- Native fixtures covered encrypted EPUB/protected PDF exclusion, metadata
  decoding, unsafe path rejection, interrupted USB staging, repeat-copy
  idempotence, and WebDAV transport/error boundaries.

There were no console or page errors in these flows.

## Live deployment, privacy, and release evidence

- Fresh live verification passed `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`,
  and a real 404: one `h1`, one `main`, route focus and announcement, and zero
  serious/critical axe findings. See
  `.factory/evidence/verification-8/live/findings.json`.
- The request log across landing, demo search, Collections, and Transfer showed
  17 requests from only two origins: the product origin and the single disclosed
  `GET https://api.github.com/repos/B-Divyesh/sf-reader-sideload-library/releases/latest`.
  There were no failed requests, console errors, or cookies.
- Headers include HSTS, `nosniff`, strict referrer policy, a restrictive
  permissions policy, and CSP with `frame-ancestors 'none'`; `connect-src` is
  limited to self and the disclosed GitHub API. Hashed assets are served with
  `public, max-age=31536000, immutable`; `/sw.js` is `no-cache`.
- Service-worker update behavior passed: a seeded `rsl-shell-v6` cache was
  removed, only `rsl-shell-v7` remained, and `/demo/?demo=1` reloaded offline
  with its banner and four books.
- Candidate/live identity is exact for the rebuilt landing output:
  `index.html` SHA-256 `5fd0194f90d36555c73a4e507a8330455504f1416f6cda874d7626ae339905d3`,
  `main-DMJ1WN20.js` `27f59446b95fa70b57b36968d4ca08b9ab6e0d82aeb6847dc818cdae1c2b4e50`,
  and `style-lqdXFND3.css` `bc39ec537f5460a788d46778e0e7c2b7391c233125780a9a7314b042a9d7f35c`.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 1132 ms load, `lang=en`,
  correct title, one `h1`, one `main`, no missing image alternatives, no
  unlabelled buttons, and no browser errors.
- The latest GitHub release is `v0.1.7` and has macOS Apple-silicon and Intel
  DMGs, Windows MSI/EXE, Linux AppImage/DEB/RPM, `latest.json`, and
  `SHA256SUMS`. A fresh Debian download matched checksum
  `996354ea87ae1dc226de5d0ffeca0b304f903f3e72bc19cf6ca493c911544a94`;
  package metadata is `reader-sideload-library 0.1.7 amd64`, and its extracted
  binary stayed running through a 10-second Xvfb smoke probe.
- The released desktop source is tag `v0.1.7` / commit
  `42c8acb13c54a938620e5de029d9b88769b3a87c`. No desktop or Rust source changed
  between that tag and the candidate; the candidate landing HTML is byte-for-byte
  the live deployment as shown above.

The product has no sign-in, product-hosted API, or paid-unlock endpoint.
Microsoft Entra and per-client 429/`Retry-After` checks are therefore not
applicable.

## Performance and accessibility

- Initial candidate site assets: 4,259 bytes JavaScript total, 13,851 bytes
  CSS, 88,276 bytes WOFF2 fonts, and 79,982-byte mobile hero. All are within
  budget.
- Fresh Lighthouse mobile results: performance 97, accessibility 100, best
  practices 100, SEO 100; FCP 1.4 s, LCP 1.8 s, CLS 0.042, TBT 150 ms, and
  178 KiB transferred. Lighthouse wrote the complete report before Chromium
  crashed while gathering only its final full-page screenshot
  (`TARGET_CRASHED`); independent Playwright runs had no browser error.
- Keyboard checks found no trap. ArrowRight and End select and focus the
  expected app tabs; the collection dialog focuses its name field and closes
  with Escape. Focus rings are visible, and reduced motion changes smooth
  scrolling to `auto` and transition duration to `0.00001s`.
- At 390 px the landing and demo have no horizontal page overflow, and axe
  reports no serious/critical issue in light or dark treatment.

## Defects by severity

### High — V8-1: required first-screen content falls below the fold at a common desktop viewport

At a fresh 1536×864 viewport, the primary sample button spans y=824.3–872.3,
so its lower edge is clipped, and all three required privacy/offline/price facts
start below the 864 px viewport (first fact y=899.3; last ends y=990.9). At
1440×900 the button fits but all three facts still begin at y=893 or later.
This violates the attached plain-words/site-structure requirement that the
primary action and three facts be present on the first screen. The existing
regression checks only 1366×768 (which activates a compact max-height rule) and
390×844, missing the 821–990 px height range. Evidence:
`.factory/evidence/verification-8/live/home-1536x864.png` and
`first-screen-1536x864.json`.

### Medium — V8-2: the required desktop screenshot walkthrough is absent

The landing page has one generated hero still life, a three-step text list, and
one hand-built catalogue preview. It has no captioned 3–5-frame screenshot
walkthrough of the desktop app, required by the attached installer contract.
The only landing `<img>` is the hero illustration.

### Medium — V8-3: the demo home target is shorter than the mobile touch baseline

At 390×844, the visible “Reader Sideload Library home” link measures
179×34 CSS px. Other visible demo navigation targets meet 44 px. This link
misses the contract’s 44×44 minimum touch target.

### Medium — V8-4: the researched one-time purchase model is not implemented or documented as a deviation

The brief specifies one-time monetization. The live product instead says USB
and WebDAV are free, contains no price or purchase/restore flow, and the handoff
claims no known product gap. A free release is usable and avoids a broken
checkout, but this is a material scope deviation that the factory contract says
must be explained.

Critical: none. Low: none.

## Required next steps

1. Make the desktop hero fit its action and all three facts across ordinary
   viewport sizes, and add a regression case such as 1536×864.
2. Add a captioned 3–5-frame walkthrough using real desktop-app screens.
3. Give the demo wordmark a 44 px minimum hit area.
4. Either implement the brief’s one-time offering through Sociobot billing or
   explicitly document an approved decision to ship free.
5. Re-run the complete claim suite, local gates, native build, live hashes,
   accessibility checks, and release verification.
