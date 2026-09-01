# Polish round 1 handoff — Reader Sideload Library

## What changed

Resolved every finding in `.factory/review-1.md`. The isolated sample now begins with a working search action, reset restores the whole visible catalogue state, all routes share navigation and legal footer links, and every route focuses and announces its h1. Claim wording and tests now match the exact observable behavior.

Version 0.1.4 retains the concrete, paper, graphite, and moss visual system. No new external runtime service, analytics, payment path, or AI feature was added.

## Verification

- `npm test`
- `npm run check`
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
- `npm audit --audit-level=high`
- `npm run build`
- axe CLI on `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html`
- Lighthouse mobile: performance 97, accessibility 100, best practices 100, SEO 100; LCP 2.107 s, CLS 0.075, TBT 0 ms

Detailed finding evidence is in `.factory/polish-1.md`.

## Deployment and release

Pending commit, v0.1.4 release, production deployment, and cold live verification.

## Known gaps

None in the reviewed scope. Physical e-ink hardware and an external WebDAV provider are not available in this container; the existing native filesystem and local WebDAV fixtures cover those paths.

## Needs operator action

macOS and Windows packages remain unsigned. Signing requires the owner’s `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets; the product discloses this before download.
