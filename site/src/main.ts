import "@fontsource/archivo-black/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-sans/latin-700.css";
import "./style.css";

const REPO = "https://github.com/B-Divyesh/sf-reader-sideload-library";
const MANIFEST = `${REPO}/releases/latest/download/latest.json`;

interface ReleaseAsset { url: string; sha256?: string; label?: string }
interface ReleaseManifest { version: string; platforms: Record<string, ReleaseAsset>; }

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
    const response = await fetch(MANIFEST, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("release manifest unavailable");
    const release = await response.json() as ReleaseManifest;
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
  try { await navigator.clipboard.writeText(button.dataset.copy!); button.textContent = "Copied"; window.setTimeout(() => { button.textContent = "Copy"; }, 1800); }
  catch { button.textContent = "Select command"; }
}));

if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("/sw.js").catch(() => undefined);
void loadRelease();
