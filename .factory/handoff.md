# Review 2 handoff — FAIL

## Outcome

Completed the adversarial first-read review against repository commit `0135230c66b9806bf5c09ee8aff0c135193899fd` and the live product on 2 September 2026. The result is **FAIL** with one blocking and six minor findings. Full detail, exact quotes, reproduction steps, copy counts, and fixes are in `.factory/review-2.md`.

## Blocking issue

The advertised `/demo/?demo=1` URL does not reopen the demo on its first offline reload. After service-worker installation in a fresh context, the offline reload receives the cached landing page because `sw.js` has no query-normalized demo match and falls back to `/`. The existing `offline-demo` test passes by using `/demo/` and an extra online reload, so it misses the public path.

## Verification performed

- Cold live review at 390×844, 1366×768, and 1440×900.
- Live demo search/reset and localStorage isolation with a real-state sentinel.
- Every command in `.factory/claims.json` from a fresh clone; all declared commands exited 0.
- `npm test`: passed 17 claim mappings, 6 unit tests, 10 Rust tests, and 56 browser tests.
- `npm run build`: passed and produced `dist/`.
- Live offline replay from the exact advertised demo URL: failed as documented.
- Live metadata, route focus, back navigation, headers, 404, mobile overflow, request log, and link crawl.
- `npx @axe-core/cli` on home, demo, privacy, terms, and 404: zero violations.
- `/opt/fleet/lib/verify-url.sh`: passed.
- Every earlier review and polish finding was checked live and in source; all five round-one findings remain fixed.

## Remaining work

Repair the blocking service-worker route handling and strengthen its claim test. The six minor findings cover first-viewport fact placement, generic command-copy labels, notes/highlights terminology, one inaccurate README default, and two unclear copy choices. No product code was modified during this review.

No infrastructure, DNS, billing, secrets, or out-of-scope resources were read or changed.
