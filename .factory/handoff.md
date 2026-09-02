# Reader Sideload Library — polish round 4 handoff

## Outcome

All 16 cumulative adversarial-review findings are resolved. The final repair
replaces the decorative workflow label **You choose** with **Choose USB or
WebDAV**, adds a browser regression test, and adds the label group to the copy
audit. No unresolved finding or known product gap remains.

Repair commits:

- `3163e06e98645199172056fdcb99b273becf6bb4` — concrete workflow wording.
- `50396b1ba463d358521e60eecd0864fa7a13125f` — stable full-Chromium browser runner for sequential accessibility/offline verification.

The catalog description is current and compliant:
`Organize DRM-free books, set reader order, and sideload by USB or WebDAV.`

## Run and verify

```bash
npm ci
npm test
npm run build
npm run check
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

The one-click isolated sample is `https://reader-sideload-library.sociobot.in/demo/?demo=1`.
It uses `demo:rsl:library-state:v1`; the persistent banner exposes **Reset demo** and **Start for real**.

Final clean-clone evidence was run in `/tmp/rsl-final-clean-rfqdIC` at
`50396b1ba463d358521e60eecd0864fa7a13125f`:

- `npm ci` passed with zero audit findings.
- Every one of the 17 commands declared in `.factory/claims.json` passed.
- `npm test` passed: 17 claim-inventory checks, 6 unit tests, 10 Rust tests,
  and 64 Playwright browser/accessibility/privacy/offline checks.
- `npm run build` passed and produced `dist/` and `dist/site/`.
- TypeScript check, Rust formatting, all-target clippy with warnings denied,
  and `npm audit --audit-level=high` passed.
- `CI=true npm run tauri build` produced Linux `.deb`, `.AppImage`, and `.rpm`
  bundles. The repository release tests verify the macOS Intel/Apple silicon,
  Windows, and Linux workflow matrix plus SHA-256 metadata.

## Deployment and live evidence

Static site deployment `276698b3-38d2-4402-8e56-8a16d7feb08b` completed for
`https://reader-sideload-library.sociobot.in/` from the repaired site build.

After deployment, the live site was opened cold and checked with:

```bash
node scripts/verify-live.mjs https://reader-sideload-library.sociobot.in .factory/evidence/polish-4/live
/opt/fleet/lib/verify-url.sh https://reader-sideload-library.sociobot.in .factory/evidence/polish-4/live/verify-url
```

Both passed. The live suite covers home, demo, privacy, terms, and a true 404;
route titles and social metadata; focus/announcements; legal and external
links; reset isolation; the exact offline demo URL; desktop and 390 px first
screens; the concrete workflow labels; console errors; and axe serious/critical
findings. Screenshots and machine-readable results are committed in
`.factory/evidence/polish-4/live/`.

Lighthouse mobile evidence is `lighthouse.json` in the same directory:
performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.2 s,
LCP 1.5 s, CLS 0.073, TBT 20 ms, total transfer 178 KiB. Chrome exited after
the completed audit while collecting its final screenshot, but the JSON holds
complete category results and the independent live Playwright checks were
clean.

See `.factory/polish-4.md` for the complete finding ID → repair → evidence map.

## Known gaps / next steps

None. The desktop release remains intentionally unsigned, as disclosed and
covered by the `unsigned-installers` claim.
