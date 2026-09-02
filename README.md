# Reader Sideload Library

Reader Sideload Library is a desktop utility for e-ink reader owners with DRM-free EPUB and PDF files. It checks metadata, creates ordered device folders, copies books by USB, and exports highlights as Markdown.

Live site: <https://reader-sideload-library.sociobot.in>

One-click sample: <https://reader-sideload-library.sociobot.in/demo/?demo=1>

## Who it is for

It is for people who own book files and use e-ink readers. It is for people who want folder order and highlight export without a full library manager. It is not an ebook store, DRM-removal tool, reader, or firmware project.

## Product model

Version 0.1 ships as a free MIT-licensed release. Catalogue, collection, USB, WebDAV, and Markdown tools need no purchase or product account.

The researched brief proposed a one-time purchase. This release deliberately uses the controller-approved free-model deviation because no paid feature is withheld and no working checkout is registered. A later paid edition must add a real Sociobot checkout, license restore, and verification flow before any purchase offer appears.

## What works in v0.1

- Recursive EPUB/PDF scan with embedded title, author, series, cover, encryption, and file validation
- Searchable catalogue saved on this computer, with warnings and per-book inclusion controls
- Ordered collections become safe numbered folders and files
- USB sync preserves source bytes, verifies copied bytes, and skips an unchanged repeat copy
- WebDAV sync checks HTTPS, tests the connection, and explains what to fix
- Import Markdown, text, JSON, KOReader sidecars, and PDF highlights. Export plain Markdown.
- Catalogue, collection, and Markdown tools reopen offline after the first sample visit

## Try the sample

Open `/demo/?demo=1` or choose **Load sample project** on the app’s first screen. The sample includes four books, one ordered collection, and two highlights. Search the books, reorder the collection, and export the two highlights as Markdown.

Demo changes use `demo:rsl:library-state:v1`. They never read or replace the real `rsl:library-state:v1` catalogue. The sample demo sends no catalogue or interaction data to another origin. Use **Reset demo** to restore it, or **Start for real** to discard it.

## Set up WebDAV

1. Install the desktop app and scan your book folder.
2. Open **Transfer & highlights**. Copy the HTTPS WebDAV folder address from your storage provider.
3. Enter the provider username and an app password when the provider offers one.
4. Choose **Check connection**. The app distinguishes address, sign-in, permission, and storage errors.
5. Choose **Sync with WebDAV** after the check succeeds.

The app never writes the WebDAV address, username, or password to app storage. It clears the password after each check or sync attempt. If a transfer stops, fix the reported cause and sync again.

## Install

Download the detected platform installer from the [product site](https://reader-sideload-library.sociobot.in) or the [latest GitHub release](https://github.com/B-Divyesh/sf-reader-sideload-library/releases/latest).

macOS and Linux:

```sh
curl -fsSL https://reader-sideload-library.sociobot.in/install.sh | sh
```

Windows PowerShell:

```powershell
irm https://reader-sideload-library.sociobot.in/install.ps1 | iex
```

Installers are not code-signed. On macOS, right-click the app and choose **Open** the first time. Windows may show an unknown-publisher prompt. Verify any download against `SHA256SUMS` in the release.

## Develop

Requirements: Node.js 22+ and Rust stable. Native desktop development also needs the [Tauri 2 system prerequisites](https://v2.tauri.app/start/prerequisites/). On Ubuntu that includes `file`, `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf`.

```sh
npm ci
npm run dev            # desktop web UI at localhost:1420
npm run dev:site       # landing site
npm run tauri dev      # native desktop shell
npm test               # unit, Rust core, axe, desktop/mobile browser checks
npm run build          # reproducible web output in dist/ and dist/site/
CI=true npm run tauri build  # local native bundle when platform prerequisites exist
```

`npm run build:site` is the factory deploy command. Its deploy root is exactly `dist/site`, with `index.html` at that root. `npm run build` also copies the landing page to `dist/index.html`.

`npm test` runs Rust core tests without the platform GUI libraries. Run `CI=true npm run tauri build` with the platform prerequisites to build installers.

## Architecture and privacy

The frontend is Vite + vanilla TypeScript. The Tauri Rust code scans files, copies books, reads PDF annotations, and sends WebDAV requests. Catalogue data stays in local browser/WebView storage. The app makes no background network requests. The website and demo use no analytics, advertising, CDN font, third-party runtime script, or cookies. The production landing page contacts GitHub's public releases API to resolve current installer links. See the site’s [privacy policy](https://reader-sideload-library.sociobot.in/privacy/) and [terms](https://reader-sideload-library.sociobot.in/terms/).

Source book files are read for metadata and are not rewritten. Protected media is excluded rather than decrypted.

The app keeps PDF titles and authors readable across common encodings. Imported highlights export as plain Markdown.

## Releases

Tagging `v*` runs `.github/workflows/release.yml`. It builds installers for macOS Intel and Apple silicon, Windows x64, and Linux x64. The release includes `SHA256SUMS` and `latest.json`. The landing page reads GitHub release metadata. The one-line installers read `latest.json` and verify the selected file before installation.

## License

MIT. See [LICENSE](LICENSE). Self-hosted typefaces have their own SIL Open Font License; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
