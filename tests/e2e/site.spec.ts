import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

for (const path of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
  test(`${path} has accessible structure and no serious axe findings`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page).toHaveTitle(/Reader Sideload Library/);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("landing states the job, audience, sample action, and three facts", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Organize and sideload your e-ink library.");
  await expect(page.locator(".hero-lede")).toContainText("e-ink reader owners");
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toHaveAttribute("href", "/demo/");
  await expect(page.locator(".proof-strip > span")).toHaveCount(3);
  await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
});

test("required metadata and hosting policy are shipped", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://reader-sideload-library.sociobot.in/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /social-card\.jpg$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/apple-touch-icon.png");
  const config = await (await request.get("/staticwebapp.config.json")).json();
  expect(config.responseOverrides["404"].rewrite).toBe("/404.html");
  expect(config.globalHeaders["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  expect(config.routes[0].headers["Cache-Control"]).toContain("immutable");
});

test("download action and copy controls work without release metadata", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.locator("#primary-download")).toBeVisible();
  await expect(page.locator("#primary-download")).toHaveAttribute("href", /releases\/latest/);
  await page.locator(".copy-command").first().click();
  await expect(page.locator(".copy-command").first()).toHaveText("Copied");
});

test("landing fits 390px and visible controls meet the 44px height baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  const shortControls = await page.locator("button:visible, .button:visible, header a:visible, footer a:visible, .platforms a:visible, .quiet-link:visible").evaluateAll((elements) => elements.map((element) => ({ text: element.textContent?.trim(), height: element.getBoundingClientRect().height })).filter((item) => item.height < 44));
  expect(shortControls).toEqual([]);
});

test("dark and reduced-motion treatment remains accessible", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
  const duration = await page.locator(".button").first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
});

test("@claim:demo-isolated sample work never changes real library storage", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("rsl:library-state:v1", '{"sentinel":"real-library"}'));
  await page.goto("/demo/");
  await expect(page.locator("#demo-banner")).toBeVisible();
  await expect(page.locator("#book-count")).toHaveText("4");
  await page.locator("#search").fill("Zoë");
  await expect(page.locator("#catalogue-body tr")).toHaveCount(1);
  const storage = await page.evaluate(() => ({ real: localStorage.getItem("rsl:library-state:v1"), demo: localStorage.getItem("demo:rsl:library-state:v1") }));
  expect(storage.real).toBe('{"sentinel":"real-library"}');
  expect(storage.demo).toContain("Field Notes 03");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator("#book-count")).toHaveText("4");
});

test("decoded PDF metadata stays searchable and produces a clean device filename", async ({ page }) => {
  await page.goto("/demo/");
  await page.locator("#search").fill("Zoë");
  await expect(page.locator("#catalogue-body")).toContainText("Field Notes 03 — 秋");
  await page.getByRole("tab", { name: /Collections/ }).click();
  await expect(page.locator(".device-path")).toContainText(["001 - The Moss Archive.epub", "002 - Field Notes 03 — 秋.pdf", "003 - Concrete Gardens.epub"]);
  await expect(page.locator(".collection")).not.toContainText("�");
});

test("@claim:markdown-export exports sample highlights as Markdown", async ({ page }) => {
  await page.goto("/demo/");
  await page.getByRole("tab", { name: /Transfer & notes/ }).click();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Markdown" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("reader-highlights.md");
  const path = await download.path();
  expect(path).not.toBeNull();
  const markdown = await readFile(path!, "utf8");
  expect(markdown).toContain("# Reader highlights");
  expect(markdown).toContain("A private library should remain legible");
});

test("@claim:privacy-requests uses no analytics or advertising requests", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await page.goto("/demo/");
  await page.locator("#search").fill("Field");
  await page.getByRole("tab", { name: /Collections/ }).click();
  await expect(page.locator(".collection")).toContainText("Autumn Queue");
  const allowed = new Set(["http://127.0.0.1:4173", "https://api.github.com"]);
  expect(requests.filter((url) => !allowed.has(new URL(url).origin))).toEqual([]);
});

test("@claim:core-free exposes core tools without a license or checkout", async ({ page }) => {
  await page.goto("/demo/");
  await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
  await expect(page.locator("#search")).toBeEnabled();
  await expect(page.getByRole("tab", { name: /Collections/ })).toBeEnabled();
  await expect(page.getByRole("tab", { name: /Transfer & notes/ })).toBeEnabled();
});

test("@claim:offline-demo reloads the sample catalogue offline", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/demo/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.locator("#book-count")).toHaveText("4");
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#demo-banner")).toBeVisible();
  await expect(page.locator("#book-count")).toHaveText("4");
  await context.close();
});
