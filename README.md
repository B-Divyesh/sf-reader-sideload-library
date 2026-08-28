# Reader Sideload Library

Reader Sideload Library is a local-first desktop utility for owners of DRM-free EPUB and PDF libraries. It scans a folder without modifying the source, validates book metadata and cover presence, builds ordered folders that survive limited reader software, copies safely over USB or WebDAV, and keeps reading highlights portable as Markdown.

Live site: <https://reader-sideload-library.sociobot.in>

## Who it is for

It is for people who own their book files and use e-ink readers, especially when Calibre is more library manager than they need or when annotations would otherwise remain tied to one reader. It is not an ebook store, DRM-removal tool, reader, or firmware project.

## What works in v0.1

- Recursive read-only EPUB/PDF scan with embedded title, author, series, cover, encryption, and file validation
- Searchable, locally persisted catalogue with clear warnings and opt-in inclusion
- Ordered collections rendered as safe numbered folders/files
- USB sync through temporary files, SHA-256 verification, atomic rename, unchanged-file skipping, and a local manifest
- Opt-in WebDAV sync with HTTPS enforcement and credentials kept only for the active transfer
- Markdown, JSON, KOReader-sidecar, and embedded PDF annotation import; plain Markdown export
- One-time Field edition license restore/verification through the Sociobot billing API; only WebDAV is paid
- Responsive 390px app and landing site, light/dark treatments, keyboard tabs, reduced motion, and offline fallbacks

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

Release builds are currently unsigned. On macOS, right-click the app and choose **Open** the first time. Windows may show an unknown-publisher prompt. Verify any download against `SHA256SUMS` in the release.

## Develop

Requirements: Node.js 22+, Rust stable, and the [Tauri 2 system prerequisites](https://v2.tauri.app/start/prerequisites/). On Ubuntu that includes `file`, `libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, and `patchelf`.

```sh
npm ci
npm run dev            # desktop web UI at localhost:1420
npm run dev:site       # landing site
npm run tauri dev      # native desktop shell
npm test               # unit, Rust core, axe, desktop/mobile browser checks
npm run build          # reproducible web output in dist/ and dist/site/
npm run tauri build    # local native bundle when platform prerequisites exist
```

`npm run build:site` is the factory deploy command. Its deploy root is exactly `dist/site`, with `index.html` at that root. `npm run build` also copies the landing entry to `dist/index.html` for the repository-wide quality contract.

## Architecture and privacy

The frontend is Vite + vanilla TypeScript. The Tauri Rust core owns filesystem scanning, verified copying, PDF annotation parsing, and WebDAV requests. The catalogue and license verdict are local browser/WebView storage. No analytics, telemetry, CDN font, or third-party runtime script is used. See the site’s [privacy policy](https://reader-sideload-library.sociobot.in/privacy/) and [terms](https://reader-sideload-library.sociobot.in/terms/).

Original book files are never rewritten. Protected media is excluded rather than decrypted. WebDAV credentials are not persisted.

## Releases

Tagging `v*` runs `.github/workflows/release.yml`. GitHub Actions builds unsigned macOS ARM64/Intel, Windows x64, and Linux x64 bundles, then publishes all artifacts plus `SHA256SUMS` and `latest.json`. The landing page and one-line installers resolve assets from that manifest.

## License

MIT. See [LICENSE](LICENSE). Self-hosted typefaces have their own SIL Open Font License; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
