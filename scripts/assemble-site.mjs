import { cp, mkdir } from "node:fs/promises";

await mkdir("dist/site/demo", { recursive: true });
await cp("dist/app", "dist/site/demo", { recursive: true, force: true });
