import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "desktop",
  clearScreen: false,
  build: {
    outDir: "../dist/app",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: true,
    rollupOptions: { input: resolve(import.meta.dirname, "desktop/index.html") }
  },
  server: { port: 1420, strictPort: true }
});
