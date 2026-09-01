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
    "Reader.Sideload.Library_0.1.3_aarch64.dmg",
    "Reader.Sideload.Library_0.1.3_x64.dmg",
    "Reader.Sideload.Library_0.1.3_x64.msi",
    "Reader.Sideload.Library_0.1.3_x64-setup.exe",
    "Reader.Sideload.Library_0.1.3_amd64.AppImage",
    "Reader.Sideload.Library_0.1.3_amd64.deb",
    "Reader.Sideload.Library-0.1.3-1.x86_64.rpm"
  ];
  for (const name of fixtures) await writeFile(resolve(assets, name), `fixture:${name}`);
  const result = spawnSync(process.execPath, [resolve("scripts/release-manifest.mjs"), "v0.1.3", assets], {
    cwd: directory,
    env: { ...process.env, GITHUB_REPOSITORY: "B-Divyesh/sf-reader-sideload-library" },
    encoding: "utf8"
  });
  expect(result.status, result.stderr).toBe(0);
  const manifest = JSON.parse(await readFile(resolve(directory, "latest.json"), "utf8"));
  expect(manifest.version).toBe("0.1.3");
  expect(Object.keys(manifest.platforms).sort()).toEqual(["linux_x64", "macos_arm64", "macos_x64", "windows_x64"]);
  const sums = await readFile(resolve(directory, "SHA256SUMS"), "utf8");
  for (const name of fixtures) {
    const expected = createHash("sha256").update(`fixture:${name}`).digest("hex");
    expect(sums).toContain(`${expected}  ${name}`);
  }
});
