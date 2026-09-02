import { afterEach, expect, test } from "vitest";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

let directory = "";
afterEach(async () => { if (directory) await rm(directory, { recursive: true, force: true }); });

test("@claim:release-manifest release metadata names every installer and its SHA-256", async () => {
  directory = await mkdtemp(resolve(tmpdir(), "rsl-release-"));
  const assets = resolve(directory, "assets");
  await mkdir(assets);
  const fixtures = [
    "Reader.Sideload.Library_0.1.8_aarch64.dmg",
    "Reader.Sideload.Library_0.1.8_x64.dmg",
    "Reader.Sideload.Library_0.1.8_x64.msi",
    "Reader.Sideload.Library_0.1.8_x64-setup.exe",
    "Reader.Sideload.Library_0.1.8_amd64.AppImage",
    "Reader.Sideload.Library_0.1.8_amd64.deb",
    "Reader.Sideload.Library-0.1.8-1.x86_64.rpm"
  ];
  for (const name of fixtures) await writeFile(resolve(assets, name), `fixture:${name}`);
  const result = spawnSync(process.execPath, [resolve("scripts/release-manifest.mjs"), "v0.1.8", assets], {
    cwd: directory,
    env: { ...process.env, GITHUB_REPOSITORY: "B-Divyesh/sf-reader-sideload-library" },
    encoding: "utf8"
  });
  expect(result.status, result.stderr).toBe(0);
  const manifest = JSON.parse(await readFile(resolve(directory, "latest.json"), "utf8"));
  expect(manifest.version).toBe("0.1.8");
  expect(Object.keys(manifest.platforms).sort()).toEqual(["linux_x64", "macos_arm64", "macos_x64", "windows_x64"]);
  const sums = await readFile(resolve(directory, "SHA256SUMS"), "utf8");
  for (const name of fixtures) {
    const expected = createHash("sha256").update(`fixture:${name}`).digest("hex");
    expect(sums).toContain(`${expected}  ${name}`);
  }
  const workflow = await readFile(resolve(".github/workflows/release.yml"), "utf8");
  const siteLoader = await readFile(resolve("site/src/main.ts"), "utf8");
  const shellInstaller = await readFile(resolve("site/public/install.sh"), "utf8");
  const powershellInstaller = await readFile(resolve("site/public/install.ps1"), "utf8");
  expect(workflow).toContain("macos-latest");
  expect(workflow).toContain("windows-latest");
  expect(workflow).toContain("ubuntu-latest");
  expect(workflow).toContain("softprops/action-gh-release@v2");
  expect(siteLoader).toContain("api.github.com/repos/B-Divyesh/sf-reader-sideload-library/releases/latest");
  expect(shellInstaller).toContain("releases/latest/download/latest.json");
  expect(powershellInstaller).toContain("releases/latest/download/latest.json");
});

test("@claim:unsigned-installers release configuration builds without code-signing identities", async () => {
  const config = JSON.parse(await readFile(resolve("src-tauri/tauri.conf.json"), "utf8"));
  const workflow = await readFile(resolve(".github/workflows/release.yml"), "utf8");
  const landing = await readFile(resolve("site/index.html"), "utf8");
  expect(config.bundle.macOS.signingIdentity).toBeNull();
  expect(config.bundle.windows.certificateThumbprint).toBeNull();
  expect(workflow).not.toMatch(/APPLE_CERTIFICATE|WINDOWS_CERT_PFX|TAURI_SIGNING_PRIVATE_KEY/);
  expect(landing).toContain("Installers are not code-signed.");
});
