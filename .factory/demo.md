# Sample demo

## Open it

- Hosted URL: `https://reader-sideload-library.sociobot.in/demo/?demo=1` (the root shortcut `/?demo=1` redirects here)
- Local URL: run `npm run build:site && npx vite preview --config vite.site.config.ts`, then open `http://localhost:4173/demo/`.
- Installed app: choose **Load sample project** on the empty catalogue screen.

The first demo screen is the working catalogue with four opinionated sample records: two EPUBs, one valid Unicode-metadata PDF, and one excluded protected PDF. It also includes the ordered **Autumn Queue** collection and two portable highlights.

## Isolation and reset

Demo state uses only `localStorage` key `demo:rsl:library-state:v1`. Real catalogue state uses `rsl:library-state:v1`; demo code never reads or writes that key. Demo mode does not open file or directory pickers or run USB/WebDAV transfers.

Use **Reset demo** in the persistent banner to restore the bundled sample, clear filters, and return to Catalogue. Use **Start for real** to delete the demo key and leave the demo. Opening `/demo/` from a fresh browser seeds the same sample automatically.

After the first online visit, the service worker keeps the demo shell and its built assets. The exact advertised `/demo/?demo=1` URL reopens the four-book sample on its first offline reload; no extra online refresh is required.

## What to verify

- Choose **Search the sample catalogue**, then search for `Zoë` to find the Unicode PDF metadata regression sample.
- Open **Collections** to inspect numbered device filenames.
- Open **Transfer & highlights** and choose **Export Markdown**.
- Follow the commands in `.factory/claims.json` from a fresh browser context.
