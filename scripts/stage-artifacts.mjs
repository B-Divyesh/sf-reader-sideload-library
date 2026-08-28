import { copyFile, mkdir } from "node:fs/promises";
import { basename, join } from "node:path";

const [serializedPaths = "[]", destination = "release-stage"] = process.argv.slice(2);
const artifactPaths = JSON.parse(serializedPaths);

if (!Array.isArray(artifactPaths) || artifactPaths.length === 0) {
  throw new Error("Tauri did not report any bundle artifacts");
}

await mkdir(destination, { recursive: true });
for (const source of artifactPaths) {
  await copyFile(source, join(destination, basename(source)));
}

console.log(`Staged ${artifactPaths.length} release artifact(s)`);
