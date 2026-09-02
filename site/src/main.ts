import "@fontsource/archivo-black/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-700.css";
import "./style.css";

const REPO = "https://github.com/B-Divyesh/sf-reader-sideload-library";
const RELEASE_API = "https://api.github.com/repos/B-Divyesh/sf-reader-sideload-library/releases/latest";
const isDemoShortcut = location.pathname === "/" && new URLSearchParams(location.search).get("demo") === "1";

interface ReleaseAsset { url: string; sha256?: string; label?: string }
interface ReleaseManifest { version: string; platforms: Record<string, ReleaseAsset>; }
interface GitHubAsset { name: string; browser_download_url: string; digest?: string }

function currentPlatform() {
  const navigatorWithHints = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = (navigatorWithHints.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase();
  const arm = /arm|aarch64/.test(platform);
  if (/mac/.test(platform)) return arm ? "macos_arm64" : "macos_x64";
  if (/win/.test(platform)) return "windows_x64";
  if (/linux|x11/.test(platform)) return arm ? "linux_arm64" : "linux_x64";
  return "linux_x64";
}

function platformLabel(key: string) {
  if (key.startsWith("macos")) return `macOS ${key.endsWith("arm64") ? "Apple silicon" : "Intel"}`;
  if (key.startsWith("windows")) return "Windows 64-bit";
  return `Linux ${key.endsWith("arm64") ? "ARM64" : "64-bit"}`;
}

async function loadRelease() {
  const primary = document.querySelector<HTMLAnchorElement>("#primary-download")!;
  const detail = document.querySelector("#download-detail")!;
  const status = document.querySelector("#release-status")!;
  const key = currentPlatform();
  try {
    const releaseResponse = await fetch(RELEASE_API, { headers: { Accept: "application/vnd.github+json" } });
    if (!releaseResponse.ok) throw new Error("latest release unavailable");
    const metadata = await releaseResponse.json() as { tag_name?: string; assets?: GitHubAsset[] };
    const assets = metadata.assets || [];
    if (!assets.some((asset) => asset.name === "latest.json")) throw new Error("release manifest unavailable");
    const choose = (pattern: RegExp) => assets.find((asset) => pattern.test(asset.name));
    const toRecord = (asset?: GitHubAsset): ReleaseAsset | undefined => asset ? {
      url: asset.browser_download_url,
      label: asset.name,
      sha256: asset.digest?.replace(/^sha256:/, "")
    } : undefined;
    const platforms = {
      macos_arm64: toRecord(choose(/aarch64.*\.dmg$/i)),
      macos_x64: toRecord(choose(/x64.*\.dmg$/i)),
      windows_x64: toRecord(choose(/x64.*\.msi$/i)),
      linux_x64: toRecord(choose(/amd64.*\.AppImage$/i))
    };
    const release: ReleaseManifest = {
      version: (metadata.tag_name || "v0.1.6").replace(/^v/, ""),
      platforms: Object.fromEntries(Object.entries(platforms).filter((entry): entry is [string, ReleaseAsset] => Boolean(entry[1])))
    };
    const asset = release.platforms[key] || release.platforms.linux_x64;
    if (!asset?.url) throw new Error("platform asset unavailable");
    primary.href = asset.url; primary.textContent = `Download for ${platformLabel(key)}`;
    detail.textContent = `Version ${release.version} · ${asset.label || "verified release"}`;
    document.querySelectorAll("[data-version]").forEach((node) => { node.textContent = release.version; });
    document.querySelectorAll<HTMLAnchorElement>("[data-platform]").forEach((link) => { const match = release.platforms[link.dataset.platform!]; if (match?.url) link.href = match.url; });
    status.textContent = `Release ${release.version} found. SHA-256 checksums are published beside every installer.`;
  } catch {
    primary.textContent = `View downloads for ${platformLabel(key)}`;
    detail.textContent = "Release downloads open on GitHub";
    status.textContent = "The release manifest could not be reached. GitHub’s latest-release page remains available.";
  }
}

document.querySelectorAll<HTMLButtonElement>(".copy-command").forEach((button) => button.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(button.dataset.copy!); button.textContent = "Install command copied"; window.setTimeout(() => { button.textContent = "Copy install command"; }, 1800); }
  catch { button.textContent = "Select install command"; }
}));

if ("serviceWorker" in navigator && (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
if (isDemoShortcut) {
  location.replace("/demo/?demo=1");
} else if (location.hostname === "reader-sideload-library.sociobot.in") {
  void loadRelease();
} else {
  const key = currentPlatform();
  document.querySelector<HTMLAnchorElement>("#primary-download")!.textContent = `View downloads for ${platformLabel(key)}`;
  document.querySelector("#download-detail")!.textContent = "Release links resolve on the deployed site";
  document.querySelector("#release-status")!.textContent = "Local preview: GitHub’s latest-release page remains available.";
}

window.requestAnimationFrame(() => {
  const title = document.querySelector<HTMLElement>("h1");
  const status = document.querySelector<HTMLElement>("#route-status");
  title?.focus({ preventScroll: true });
  if (status && title) status.textContent = `${document.title}. ${title.textContent || ""}`;
});
