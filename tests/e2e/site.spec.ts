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
    await expect(page.locator("h1")).toBeFocused();
    await expect(page.locator("#route-status")).not.toBeEmpty();
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("landing states the job, audience, sample action, and three facts", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("Organize and sideload your e-ink library.");
  await expect(page.locator(".hero-lede")).toContainText("e-ink reader owners");
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toHaveAttribute("href", "/demo/?demo=1");
  await expect(page.locator(".hero-facts > li")).toHaveText([
    "No account or background network requests",
    "Catalogue, collection, and Markdown tools reopen offline after the first sample visit",
    "USB and WebDAV tools are free"
  ]);
  await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
});

for (const viewport of [
  { name: "desktop", width: 1366, height: 768 },
  { name: "mobile", width: 390, height: 844 }
]) {
  test(`landing first read fits the ${viewport.name} ${viewport.width}x${viewport.height} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    for (const selector of [".hero-lede", ".hero-actions .button-primary", ".hero-facts li:nth-child(1)", ".hero-facts li:nth-child(2)", ".hero-facts li:nth-child(3)"]) {
      const bounds = await page.locator(selector).boundingBox();
      expect(bounds, `${selector} must have layout bounds`).not.toBeNull();
      expect(bounds!.y, `${selector} must start inside the viewport`).toBeGreaterThanOrEqual(0);
      expect(bounds!.y + bounds!.height, `${selector} must be fully visible without scrolling`).toBeLessThanOrEqual(viewport.height);
    }
  });
}

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
  await expect(page.locator(".copy-command").first()).toHaveText("Install command copied");
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
  await page.locator("#format-filter").selectOption("PDF");
  await page.getByRole("tab", { name: /Collections/ }).click();
  const storage = await page.evaluate(() => ({ real: localStorage.getItem("rsl:library-state:v1"), demo: localStorage.getItem("demo:rsl:library-state:v1") }));
  expect(storage.real).toBe('{"sentinel":"real-library"}');
  expect(storage.demo).toContain("Field Notes 03");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator("#book-count")).toHaveText("4");
  await expect(page.locator("#search")).toHaveValue("");
  await expect(page.locator("#format-filter")).toHaveValue("all");
  await expect(page.locator("#catalogue-body tr")).toHaveCount(4);
  await expect(page.locator("#tab-catalogue")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#catalogue-heading")).toBeFocused();
});

test("demo primary action starts an available sample task", async ({ page }) => {
  await page.goto("/demo/?demo=1");
  const action = page.getByRole("button", { name: "Search the sample catalogue" });
  await expect(action).toBeVisible();
  await action.click();
  await expect(page.locator("#search")).toBeFocused();
  await page.locator("#search").fill("Zoë");
  await expect(page.locator("#catalogue-body tr")).toHaveCount(1);
  await expect(page.locator(".toast.error")).toHaveCount(0);
});

test("root demo shortcut enters the isolated sample without a release request", async ({ page }) => {
  const thirdParty: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:4173") thirdParty.push(request.url());
  });
  await page.goto("/?demo=1");
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page.locator("#demo-banner")).toBeVisible();
  await expect(page.locator("#book-count")).toHaveText("4");
  expect(thirdParty).toEqual([]);
});

test("demo and content routes share navigation and legal links", async ({ page }) => {
  for (const path of ["/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(path);
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: /Reader Sideload Library home/ })).toBeVisible();
    await expect(header.getByRole("link", { name: "Demo", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Demo", exact: true })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Privacy", exact: true })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Terms", exact: true })).toBeVisible();
    await expect(footer).toContainText("Built by Param Factory");
  }
});

test("demo fits a 390px viewport with working navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/?demo=1");
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  await expect(page.locator("header").getByRole("link", { name: "Privacy" })).toBeVisible();
});

test("@claim:ordered-collections decoded metadata stays searchable and produces ordered safe filenames", async ({ page }) => {
  await page.goto("/demo/");
  const search = page.locator("#search");
  await search.fill("Concrete Gardens");
  await expect(page.locator("#catalogue-body tr")).toHaveCount(1);
  await search.fill("Zoë");
  await expect(page.locator("#catalogue-body")).toContainText("Field Notes 03 — 秋");
  await search.fill("Field Library");
  await expect(page.locator("#catalogue-body tr")).toHaveCount(2);
  await search.fill("");
  await page.getByRole("tab", { name: /Collections/ }).click();
  await expect(page.locator(".device-path")).toContainText(["001 - The Moss Archive.epub", "002 - Field Notes 03 — 秋.pdf", "003 - Concrete Gardens.epub"]);
  await expect(page.locator(".collection")).not.toContainText("�");
});

test("@claim:markdown-export exports sample highlights as Markdown", async ({ page }) => {
  await page.goto("/demo/");
  await page.getByRole("tab", { name: /Transfer & highlights/ }).click();
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

test("@claim:privacy-requests uses only the disclosed GitHub release request", async ({ page, context, request }) => {
  const requests: string[] = [];
  context.on("request", (observed) => requests.push(observed.url()));
  const productionOrigin = "https://reader-sideload-library.sociobot.in";
  const releaseApi = "https://api.github.com/repos/B-Divyesh/sf-reader-sideload-library/releases/latest";
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.href === releaseApi) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tag_name: "v0.1.6",
          assets: [
            { name: "latest.json", browser_download_url: "https://github.com/example/latest.json" },
            { name: "Reader.Sideload.Library_0.1.6_amd64.AppImage", browser_download_url: "https://github.com/example/app.AppImage" }
          ]
        })
      });
      return;
    }
    if (url.origin === productionOrigin) {
      const response = await request.fetch(`http://127.0.0.1:4173${url.pathname}${url.search}`);
      await route.fulfill({ response });
      return;
    }
    await route.continue();
  });
  await page.goto(`${productionOrigin}/`);
  await expect(page.locator("#release-status")).toContainText("Release 0.1.6 found");
  await page.goto(`${productionOrigin}/demo/`);
  await page.locator("#search").fill("Field");
  await page.getByRole("tab", { name: /Collections/ }).click();
  await expect(page.locator(".collection")).toContainText("Autumn Queue");
  await page.goto("http://127.0.0.1:4174/?demo=1");
  await expect(page.locator("#book-count")).toHaveText("4");
  const productOrigins = new Set([productionOrigin, "http://127.0.0.1:4174"]);
  expect(requests.filter((url) => !productOrigins.has(new URL(url).origin))).toEqual([releaseApi]);
  expect(await context.cookies()).toEqual([]);
});

test("@claim:core-free exposes core tools without a license or checkout", async ({ page }) => {
  await page.goto("/demo/");
  await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
  await expect(page.locator("#search")).toBeEnabled();
  await expect(page.getByRole("tab", { name: /Collections/ })).toBeEnabled();
  await page.getByRole("tab", { name: /Transfer & highlights/ }).click();
  await expect(page.getByRole("button", { name: "Sync with WebDAV" })).toBeEnabled();
  await expect(page.getByText("No license or account with us is needed.")).toBeVisible();
});

test("@claim:offline-demo reloads the sample catalogue offline", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/favicon.svg");
  await page.evaluate(async () => {
    const oldCache = await caches.open("rsl-shell-v5");
    await oldCache.put("/legacy-shell", new Response("old shell"));
  });
  await page.goto("http://127.0.0.1:4173/demo/?demo=1");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => caches.keys())).toEqual(["rsl-shell-v6"]);
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page).toHaveTitle("Demo — Reader Sideload Library");
  await expect(page.locator("#demo-banner")).toBeVisible();
  await expect(page.locator("#book-count")).toHaveText("4");
  await context.close();
});
