import { copyFile, mkdir } from "node:fs/promises";
import { basename, join } from "node:path";

const [pathsArgument, destinationArgument] = process.argv.slice(2);
const serializedPaths = pathsArgument || process.env.ARTIFACT_PATHS || "[]";
const destination = destinationArgument || process.env.STAGE_DESTINATION || "release-stage";
const artifactPaths = JSON.parse(serializedPaths);

if (!Array.isArray(artifactPaths) || artifactPaths.length === 0) {
  throw new Error("Tauri did not report any bundle artifacts");
}

await mkdir(destination, { recursive: true });
for (const source of artifactPaths) {
  await copyFile(source, join(destination, basename(source)));
}

console.log(`Staged ${artifactPaths.length} release artifact(s)`);
