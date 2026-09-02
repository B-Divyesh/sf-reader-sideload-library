import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ baseURL: "http://127.0.0.1:4174" });

test("desktop shell is keyboard navigable and accessible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await page.locator("#tab-catalogue").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-collections")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#tab-transfer")).toHaveAttribute("aria-selected", "true");
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
});

test("desktop shell fits a 390px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
});

test("desktop dark treatment has no serious accessibility violations", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
});

test("first-run sample project opens the isolated working catalogue", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Load sample project" }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.locator("#demo-banner")).toBeVisible();
  await expect(page.locator("#book-count")).toHaveText("4");
  await expect(page.locator("#catalogue-body")).toContainText("Field Notes 03 — 秋");
});

test("@claim:local-catalogue catalogue changes stay in app storage without background requests", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await page.locator("#browser-folder").setInputFiles("tests/fixtures/library");
  await expect(page.locator("#catalogue-body")).toContainText("Owned Book");
  await page.getByRole("tab", { name: /Collections/ }).click();
  await page.getByRole("button", { name: "Create collection" }).click();
  await page.locator("#collection-name").fill("Device Queue");
  await page.locator("#collection-books input").check();
  await page.locator("#save-collection").click();
  await page.getByRole("tab", { name: /Transfer & highlights/ }).click();
  await page.locator("#browser-highlight").setInputFiles("tests/fixtures/highlights.md");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("rsl:library-state:v1") || "{}"));
  expect(stored.books[0].title).toBe("Owned Book");
  expect(stored.collections[0].name).toBe("Device Queue");
  expect(stored.highlights[0].quote).toBe("A portable note.");
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4174")).toBe(true);
});

test("@claim:webdav-credentials WebDAV setup is free, guided, and never persists credentials", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("rsl:library-state:v1", JSON.stringify({
      source: "/owned",
      books: [{ id: "book-1", path: "/owned/book.epub", title: "Owned Book", authors: ["A. Reader"], series: null, seriesIndex: null, format: "EPUB", sizeBytes: 10, modified: 0, coverStatus: "found", metadataStatus: "valid", warnings: [], eligible: true, selected: true }],
      collections: [{ id: "queue", name: "Queue", bookIds: ["book-1"] }],
      highlights: []
    }));
    Object.assign(window, {
      __rslInvocations: [],
      __TAURI_INTERNALS__: {
        invoke: async (command: string, args: Record<string, unknown>) => {
          const calls = (window as unknown as { __rslInvocations: Array<{ command: string; args: Record<string, unknown> }> }).__rslInvocations;
          calls.push({ command, args });
          if (command === "check_webdav" && calls.filter((call) => call.command === "check_webdav").length === 1) {
            throw "WebDAV sign-in failed with status 401. Check the username and create a new app password, then check the folder again.";
          }
          if (command === "check_webdav") return "Connection works. The WebDAV folder is ready for a transfer.";
          if (command === "sync_webdav") return { copied: 1, skipped: 0, total: 1 };
          throw new Error(`Unexpected command: ${command}`);
        }
      }
    });
  });
  await page.goto("/");
  await page.getByRole("tab", { name: /Transfer & highlights/ }).click();
  await expect(page.getByText("No license or account with us is needed.")).toBeVisible();
  await page.getByText("Set up a WebDAV folder").click();
  await expect(page.getByText("A normal sign-in page will not work.")).toBeVisible();
  await page.locator("#webdav-url").fill("https://dav.example.test/books");
  await page.locator("#webdav-user").fill("reader");
  await page.locator("#webdav-password").fill("not-stored-secret");
  await page.getByRole("button", { name: "Check connection" }).click();
  await expect(page.locator("#webdav-status")).toContainText("create a new app password");
  await expect(page.locator("#webdav-password")).toHaveValue("");
  await page.locator("#webdav-password").fill("not-stored-secret");
  await page.getByRole("button", { name: "Check connection" }).click();
  await expect(page.locator("#webdav-status")).toContainText("ready for a transfer");
  await expect(page.locator("#webdav-password")).toHaveValue("");
  await page.locator("#webdav-password").fill("not-stored-secret");
  await page.getByRole("button", { name: "Sync with WebDAV" }).click();
  await expect(page.locator("#webdav-status")).toContainText("1 of 1 files uploaded");
  await expect(page.locator("#webdav-password")).toHaveValue("");
  const result = await page.evaluate(() => ({
    storage: JSON.stringify(localStorage),
    calls: (window as unknown as { __rslInvocations: Array<{ command: string; args: Record<string, unknown> }> }).__rslInvocations
  }));
  expect(result.storage).not.toContain("dav.example.test");
  expect(result.storage).not.toContain("not-stored-secret");
  expect(result.calls.map((call) => call.command)).toEqual(["check_webdav", "check_webdav", "sync_webdav"]);
  expect(result.calls[2]?.args.password).toBe("not-stored-secret");
});
