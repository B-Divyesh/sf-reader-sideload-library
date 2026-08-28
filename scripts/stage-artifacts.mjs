import { copyFile, mkdir, stat } from "node:fs/promises";
import { basename, join } from "node:path";

const [pathsArgument, destinationArgument] = process.argv.slice(2);
const serializedPaths = pathsArgument || process.env.ARTIFACT_PATHS || "[]";
const destination = destinationArgument || process.env.STAGE_DESTINATION || "release-stage";
const artifactPaths = JSON.parse(serializedPaths);

if (!Array.isArray(artifactPaths) || artifactPaths.length === 0) {
  throw new Error("Tauri did not report any bundle artifacts");
}

await mkdir(destination, { recursive: true });
let staged = 0;
for (const source of artifactPaths) {
  if (!(await stat(source)).isFile()) continue;
  const releaseName = basename(source).replaceAll(" ", ".");
  await copyFile(source, join(destination, releaseName));
  staged += 1;
}

if (staged === 0) throw new Error("Tauri reported no regular-file bundle artifacts");
console.log(`Staged ${staged} release artifact(s)`);
