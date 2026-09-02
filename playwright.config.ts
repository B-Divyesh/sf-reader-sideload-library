import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    // The full Chromium binary is more stable than headless_shell for the
    // sequential desktop/mobile accessibility and offline checks in CI.
    launchOptions: { channel: "chromium", args: ["--disable-gpu"] }
  },
  webServer: [
    { command: "npm run build:site && npx vite preview --config vite.site.config.ts --host 127.0.0.1 --port 4173", port: 4173, reuseExistingServer: true },
    { command: "npm run build:app && npx vite preview --config vite.app.config.ts --host 127.0.0.1 --port 4174", port: 4174, reuseExistingServer: true }
  ],
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 5"] } }
  ]
});
