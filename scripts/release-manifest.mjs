import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const [tag = "v0.1.1", directory = "release-assets"] = process.argv.slice(2);
const ownerRepo = process.env.GITHUB_REPOSITORY || "B-Divyesh/sf-reader-sideload-library";
async function walk(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(path, entry.name)) : [join(path, entry.name)]))).flat();
}
const files = (await walk(directory)).filter((file) => /\.(dmg|msi|exe|AppImage|deb)$/i.test(file));
const records = await Promise.all(files.map(async (file) => ({ file, name: basename(file), sha256: createHash("sha256").update(await readFile(file)).digest("hex") })));
await writeFile("SHA256SUMS", records.map((record) => `${record.sha256}  ${record.name}`).sort().join("\n") + "\n");
const choose = (test) => records.find((record) => test(record.name));
const picks = {
  macos_arm64: choose((name) => /aarch64.*\.dmg$/i.test(name)),
  macos_x64: choose((name) => /(x64|x86_64).*\.dmg$/i.test(name) || (/\.dmg$/i.test(name) && !/aarch64/i.test(name))),
  windows_x64: choose((name) => /\.msi$/i.test(name)),
  linux_x64: choose((name) => /amd64.*\.AppImage$/i.test(name) || (/\.AppImage$/i.test(name) && !/aarch64|arm64/i.test(name))),
  linux_arm64: choose((name) => /(aarch64|arm64).*\.AppImage$/i.test(name))
};
const platforms = Object.fromEntries(Object.entries(picks).filter(([, record]) => record).map(([key, record]) => [key, { url: `https://github.com/${ownerRepo}/releases/download/${tag}/${encodeURIComponent(record.name)}`, sha256: record.sha256, label: record.name }]));
const manifest = { version: tag.replace(/^v/, ""), platforms };
await writeFile("latest.json", JSON.stringify(manifest));
for (const required of ["macos_arm64", "macos_x64", "windows_x64", "linux_x64"]) if (!platforms[required]) throw new Error(`Missing release asset for ${required}`);
