import { spawnSync } from "node:child_process";

const result = spawnSync(
  "cargo",
  [
    "tree",
    "--manifest-path",
    "src-tauri/Cargo.toml",
    "--no-default-features",
    "--edges",
    "normal",
    "--prefix",
    "none",
  ],
  { encoding: "utf8" },
);

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

const desktopOnly = /^(?:tauri|tauri-plugin-dialog|gtk|glib|webkit2gtk) v/m;
if (desktopOnly.test(result.stdout)) {
  process.stderr.write(
    "The no-default-features Rust test graph includes a desktop-only GUI dependency.\n",
  );
  process.exit(1);
}

process.stdout.write("Rust core test graph excludes Tauri and Linux GUI libraries.\n");
