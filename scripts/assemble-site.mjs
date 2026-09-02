import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

await mkdir("dist/site/demo", { recursive: true });
await cp("dist/app", "dist/site/demo", { recursive: true, force: true });

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }));
  return files.flat();
}

const cacheableExtensions = /\.(?:avif|css|ico|jpe?g|js|png|svg|webp|woff2)$/i;
const buildAssets = (await filesUnder("dist/site"))
  .filter((path) => cacheableExtensions.test(path))
  .map((path) => `/${relative("dist/site", path).split(sep).join("/")}`)
  .filter((path) => path !== "/sw.js")
  .sort();

const serviceWorkerPath = "dist/site/sw.js";
const serviceWorker = await readFile(serviceWorkerPath, "utf8");
const marker = '["__RSL_BUILD_ASSETS__"]';
if (!serviceWorker.includes(marker)) throw new Error("Service worker build-asset marker is missing");
await writeFile(serviceWorkerPath, serviceWorker.replace(marker, JSON.stringify(buildAssets)));
