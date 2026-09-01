import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const claims = JSON.parse(await readFile(".factory/claims.json", "utf8"));
const ids = claims.map((claim) => claim.id);
if (new Set(ids).size !== ids.length) throw new Error("Claim IDs must be unique");

async function filesUnder(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? filesUnder(join(path, entry.name))
    : [join(path, entry.name)]))).flat();
}

const sourceFiles = [...await filesUnder("tests"), "src-tauri/src/lib.rs"];
const markers = new Map();
for (const file of sourceFiles) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/@claim:([a-z0-9-]+)/g)) {
    const locations = markers.get(match[1]) || [];
    locations.push(file);
    markers.set(match[1], locations);
  }
}

for (const id of ids) {
  const locations = markers.get(id) || [];
  if (locations.length !== 1) throw new Error(`@claim:${id} must appear exactly once; found ${locations.length}`);
}
for (const id of markers.keys()) {
  if (!ids.includes(id)) throw new Error(`Test marker @claim:${id} is missing from .factory/claims.json`);
}
for (const claim of claims) {
  if (!claim.claim || !claim.where || !claim.test || !claim.sandbox) throw new Error(`Claim ${claim.id} is incomplete`);
}

console.log(`Claim inventory is one-to-one: ${claims.length} claims, ${markers.size} unique test markers.`);
