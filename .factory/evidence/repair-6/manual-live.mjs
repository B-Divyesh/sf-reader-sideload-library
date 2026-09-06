import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { readFile, writeFile } from "node:fs/promises";

const base = "https://reader-sideload-library.sociobot.in";
const output = "/work/repo/.factory/evidence/repair-6/manual-live.json";
const failures = [];
const result = { checkedAt: new Date().toISOString(), base, failures };
const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const seriousAxe = async (page) =>
  (await new AxeBuilder({ page }).analyze()).violations
    .filter((item) => ["serious", "critical"].includes(item.impact ?? ""))
    .map((item) => item.id);

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  await context.addInitScript(() =>
    localStorage.setItem("rsl:library-state:v1", '{"sentinel":"real-library"}'),
  );
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("request", (request) => requests.push(request.url()));

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const firstRead = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim(),
    audience: document.querySelector(".hero-lede")?.textContent?.trim(),
    action: document.querySelector(".hero-actions .button-primary")?.textContent?.trim(),
    actionHelp: document.querySelector(".hero-actions > span")?.textContent?.trim(),
    facts: [...document.querySelectorAll(".hero-facts li")].map((item) => item.textContent?.trim()),
  }));
  check(firstRead.h1 === "Organize and sideload your e-ink library.", "job headline changed");
  check(firstRead.audience?.startsWith("For e-ink reader owners"), "audience is unclear");
  check(firstRead.action === "Try it with sample data", "first action changed");
  check(firstRead.actionHelp === "Open a ready sample catalogue.", "first-action outcome is missing");
  check(firstRead.facts.length === 3, "first screen does not contain three facts");

  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await page.waitForURL(`${base}/demo/?demo=1`);
  check(await page.locator("#demo-banner").isVisible(), "persistent demo label is absent");
  check((await page.locator("#book-count").textContent()) === "4", "sample does not start with four books");

  await page.getByRole("button", { name: "Search the sample catalogue" }).click();
  check(await page.locator("#search").evaluate((node) => node === document.activeElement), "sample action does not focus search");
  await page.locator("#search").fill("Zoë");
  const unicodeRows = await page.locator("#catalogue-body tr").count();
  await page.locator("#search").fill("x".repeat(1024));
  const boundaryText = await page.locator("#catalogue-body").textContent();
  await page.getByRole("button", { name: "Reset demo" }).click();
  const reset = await page.evaluate(() => ({
    query: document.querySelector("#search")?.value,
    format: document.querySelector("#format-filter")?.value,
    rows: document.querySelectorAll("#catalogue-body tr").length,
    activeTab: document.querySelector('[role="tab"][aria-selected="true"]')?.id,
    focus: document.activeElement?.id,
    real: localStorage.getItem("rsl:library-state:v1"),
    demo: Boolean(localStorage.getItem("demo:rsl:library-state:v1")),
  }));
  check(unicodeRows === 1, "Unicode metadata search did not find one book");
  check(boundaryText?.includes("No books match this filter"), "boundary search has no empty state");
  check(reset.query === "" && reset.format === "all" && reset.rows === 4, "Reset demo did not restore the sample");
  check(reset.activeTab === "tab-catalogue" && reset.focus === "catalogue-heading", "Reset demo did not restore navigation/focus");
  check(reset.real === '{"sentinel":"real-library"}' && reset.demo, "demo crossed storage namespaces");

  const catalogueTab = page.getByRole("tab", { name: /Catalogue/ });
  await catalogueTab.focus();
  await page.keyboard.press("End");
  const keyboardEnd = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press("Home");
  const keyboardHome = await page.evaluate(() => document.activeElement?.id);
  check(keyboardEnd === "tab-transfer" && keyboardHome === "tab-catalogue", "tab Home/End keyboard behavior failed");

  await page.getByRole("tab", { name: /Collections/ }).click();
  const originalPaths = await page.locator(".device-path").allTextContents();
  await page.getByRole("button", { name: "Move The Moss Archive down" }).click();
  const movedPaths = await page.locator(".device-path").allTextContents();
  await page.reload({ waitUntil: "networkidle" });
  const persistedPaths = await page.locator(".device-path").allTextContents();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByRole("tab", { name: /Collections/ }).click();
  const restoredPaths = await page.locator(".device-path").allTextContents();
  check(originalPaths[0]?.startsWith("001"), "initial collection path is not numbered");
  check(movedPaths[0]?.includes("Field Notes") && JSON.stringify(movedPaths) === JSON.stringify(persistedPaths), "collection order did not persist");
  check(JSON.stringify(originalPaths) === JSON.stringify(restoredPaths), "Reset demo did not restore collection order");

  await page.getByRole("button", { name: "Create collection" }).click();
  check(await page.locator("#collection-name").evaluate((node) => node === document.activeElement), "dialog did not focus its field");
  await page.locator("#save-collection").click();
  const requiredMessage = await page.locator("#collection-name").evaluate((node) => node.validationMessage);
  await page.keyboard.press("Escape");
  check(Boolean(requiredMessage), "empty collection name was accepted");
  check(!(await page.locator("#collection-dialog").isVisible()), "Escape did not close the collection dialog");

  await page.getByRole("button", { name: "Create collection" }).click();
  await page.locator("#collection-name").fill("Boundary / Queue: ?");
  await page.locator("#save-collection").click();
  const noBooks = await page.locator("#toast-region").textContent();
  await page.locator("#collection-books input").first().check();
  await page.locator("#save-collection").click();
  const safeName = await page.locator(".collection h3").last().textContent();
  check(noBooks?.includes("Choose at least one book"), "collection error lacks recovery guidance");
  check(safeName === "Boundary - Queue- -", `unsafe collection name was not sanitized: ${safeName}`);

  await page.getByRole("tab", { name: /Transfer & highlights/ }).click();
  await page.getByRole("button", { name: "Choose reader and sync" }).click();
  const usbRecovery = await page.locator("#toast-region").textContent();
  await page.locator("#webdav-url").fill("not-a-url");
  await page.locator("#webdav-password").fill("not-recorded");
  await page.getByRole("button", { name: "Check connection" }).click();
  const invalidUrl = await page.locator("#webdav-url").evaluate((node) => node.validationMessage);
  const invalidPassword = await page.locator("#webdav-password").inputValue();
  await page.locator("#webdav-url").fill("https://cloud.example/books");
  await page.locator("#webdav-user").fill("reader");
  await page.locator("#webdav-password").fill("not-recorded");
  await page.getByRole("button", { name: "Check connection" }).click();
  const demoWebdav = await page.locator("#webdav-status").textContent();
  const validPassword = await page.locator("#webdav-password").inputValue();
  check(usbRecovery?.includes("installed desktop app"), "demo USB action lacks recovery guidance");
  check(Boolean(invalidUrl) && invalidPassword === "", "invalid WebDAV path did not reject and clear password");
  check(demoWebdav?.includes("does not contact servers") && validPassword === "", "demo WebDAV path contacted or retained data");

  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Markdown" }).click();
  const download = await downloadEvent;
  const downloadPath = await download.path();
  const markdown = downloadPath ? await readFile(downloadPath, "utf8") : "";
  check(download.suggestedFilename() === "reader-highlights.md", "Markdown filename changed");
  check(markdown.includes("# Reader highlights") && markdown.includes("A private library should remain legible"), "Markdown output is incomplete");

  await page.locator("#browser-highlight").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{") });
  const badJson = await page.locator("#toast-region").textContent();
  await page.locator("#browser-highlight").setInputFiles({ name: "empty.md", mimeType: "text/markdown", buffer: Buffer.from("nothing quoted") });
  const emptyMarkdown = await page.locator("#toast-region").textContent();
  await page.locator("#browser-highlight").setInputFiles({ name: "valid.md", mimeType: "text/markdown", buffer: Buffer.from("# Recovery\n\n> A recovered highlight.\n\nRecovered note") });
  const recoveredHighlights = await page.locator(".highlight").count();
  check(badJson?.includes("could not be read"), "malformed JSON error is unclear");
  check(emptyMarkdown?.includes("No quoted highlights"), "empty Markdown error is unclear");
  check(recoveredHighlights === 3, "valid highlight import did not recover");

  const axe = await seriousAxe(page);
  check(axe.length === 0, `serious/critical axe findings: ${axe.join(", ")}`);
  const demoOrigins = [...new Set(requests.filter((url) => url.includes("/demo/")).map((url) => new URL(url).origin))];
  check(demoOrigins.every((origin) => origin === base), `demo made outside requests: ${demoOrigins.join(", ")}`);
  check((await context.cookies()).length === 0, "site set cookies");

  await page.getByRole("link", { name: "Start for real" }).click();
  await page.waitForURL(`${base}/`);
  const afterExit = await page.evaluate(() => ({
    real: localStorage.getItem("rsl:library-state:v1"),
    demo: localStorage.getItem("demo:rsl:library-state:v1"),
  }));
  check(afterExit.real === '{"sentinel":"real-library"}' && afterExit.demo === null, "Start for real changed real data or retained demo data");
  check(errors.length === 0, `console/page errors: ${errors.join(" | ")}`);

  Object.assign(result, {
    firstRead,
    unicodeRows,
    boundaryText,
    reset,
    keyboard: { end: keyboardEnd, home: keyboardHome },
    collection: { originalPaths, movedPaths, persistedPaths, restoredPaths, requiredMessage, noBooks, safeName },
    transfer: { usbRecovery, invalidUrl, invalidPassword, demoWebdav, validPassword },
    highlight: { filename: download.suggestedFilename(), bytes: markdown.length, badJson, emptyMarkdown, recoveredHighlights },
    network: { origins: [...new Set(requests.map((url) => new URL(url).origin))], cookies: await context.cookies() },
    axe,
    errors,
    afterExit,
  });
  await context.close();

  const reducedContext = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(`${base}/`, { waitUntil: "networkidle" });
  const reduced = await reducedPage.evaluate(() => {
    const style = getComputedStyle(document.querySelector(".button"));
    return {
      matches: matchMedia("(prefers-reduced-motion: reduce)").matches,
      transitionDuration: style.transitionDuration,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });
  const reducedAxe = await seriousAxe(reducedPage);
  check(reduced.matches && Number.parseFloat(reduced.transitionDuration) <= 0.001 && reduced.scrollBehavior === "auto", "reduced motion is not respected");
  check(reducedAxe.length === 0, `dark/reduced axe findings: ${reducedAxe.join(", ")}`);
  result.reduced = { ...reduced, axe: reducedAxe };
  await reducedContext.close();

  const offlineContext = await browser.newContext();
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(`${base}/demo/?demo=1`);
  await offlinePage.evaluate(() => navigator.serviceWorker.ready);
  const cacheBefore = await offlinePage.evaluate(() => caches.keys());
  await offlineContext.setOffline(true);
  await offlinePage.reload({ waitUntil: "domcontentloaded" });
  const offline = {
    cacheBefore,
    title: await offlinePage.title(),
    books: await offlinePage.locator("#book-count").textContent(),
    banner: await offlinePage.locator("#demo-banner").isVisible(),
  };
  check(cacheBefore.length === 1 && cacheBefore[0] === "rsl-shell-v8", `unexpected service-worker cache: ${cacheBefore}`);
  check(offline.title === "Demo — Reader Sideload Library" && offline.books === "4" && offline.banner, "offline demo recovery failed");
  result.offline = offline;
  await offlineContext.close();
} finally {
  await browser.close();
}

await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Manual live verification passed");
}
