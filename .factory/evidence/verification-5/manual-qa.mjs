import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const live = "https://reader-sideload-library.sociobot.in";
const localApp = "http://127.0.0.1:4174";
const results = { checkedAt: new Date().toISOString(), live, failures: [] };
const check = (condition, message) => {
  if (!condition) results.failures.push(message);
};
const axeSerious = async (page) => (await new AxeBuilder({ page }).analyze()).violations
  .filter((item) => ["serious", "critical"].includes(item.impact ?? ""))
  .map((item) => item.id);
const watchErrors = (page) => {
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
};

const browser = await chromium.launch({ headless: true });
try {
  const firstContext = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const firstPage = await firstContext.newPage();
  const firstErrors = watchErrors(firstPage);
  const firstResponse = await firstPage.goto(live, { waitUntil: "networkidle" });
  const firstRead = await firstPage.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      return box ? { top: box.top, bottom: box.bottom, left: box.left, right: box.right } : null;
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      h1: document.querySelector("h1")?.textContent?.trim(),
      audience: document.querySelector(".hero-lede")?.textContent?.trim(),
      action: document.querySelector(".hero-actions .button")?.textContent?.trim(),
      actionHelp: document.querySelector(".hero-actions > span")?.textContent?.trim(),
      h1Rect: rect("h1"), audienceRect: rect(".hero-lede"), actionRect: rect(".hero-actions .button"),
      h1Count: document.querySelectorAll("h1").length,
      mainCount: document.querySelectorAll("main").length,
      imagesMissingAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length
    };
  });
  check(firstRead.audienceRect?.bottom <= 768, "1366x768 audience is below the fold");
  check(firstRead.actionRect?.bottom <= 768, "1366x768 sample action is below the fold");
  check(firstRead.action === "Try it with sample data", "first action is not the required sample action");
  check(firstRead.h1Count === 1 && firstRead.mainCount === 1 && firstRead.imagesMissingAlt === 0, "landing semantics failed");
  const firstAxe = await axeSerious(firstPage);
  const skip = firstPage.locator(".skip-link");
  await skip.focus();
  const focus = await skip.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outline: style.outline, top: element.getBoundingClientRect().top };
  });
  check(focus.outline !== "none" && focus.top >= 0, "skip link focus is not visibly exposed");
  results.firstRead = { ...firstRead, status: firstResponse?.status(), headers: await firstResponse?.allHeaders(), axeSerious: firstAxe, errors: firstErrors, focus };
  check(firstErrors.length === 0 && firstAxe.length === 0, "landing has console/page or serious axe errors");
  await firstPage.screenshot({ path: ".factory/evidence/verification-5/live/first-read-1366x768.png" });
  await firstContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobilePage = await mobileContext.newPage();
  const mobileErrors = watchErrors(mobilePage);
  await mobilePage.goto(live, { waitUntil: "networkidle" });
  const mobile = await mobilePage.evaluate(() => {
    const audience = document.querySelector(".hero-lede")?.getBoundingClientRect();
    const action = document.querySelector(".hero-actions .button")?.getBoundingClientRect();
    const undersized = [...document.querySelectorAll("a,button,input,select")].filter((element) => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44);
    }).map((element) => ({ label: element.getAttribute("aria-label") || element.textContent?.trim() || element.id, width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }));
    return { audienceBottom: audience?.bottom, actionBottom: action?.bottom, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, undersized };
  });
  check(mobile.audienceBottom <= 844 && mobile.actionBottom <= 844, "390x844 first read does not fit");
  check(mobile.scrollWidth === mobile.clientWidth, "390px landing overflows horizontally");
  check(mobile.undersized.length === 0, `undersized mobile controls: ${JSON.stringify(mobile.undersized)}`);
  results.mobile = { ...mobile, axeSerious: await axeSerious(mobilePage), errors: mobileErrors };
  check(results.mobile.axeSerious.length === 0 && mobileErrors.length === 0, "mobile landing has console/page or serious axe errors");
  await mobilePage.screenshot({ path: ".factory/evidence/verification-5/live/first-read-mobile-390x844.png" });
  await mobileContext.close();

  const reducedContext = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  const reducedErrors = watchErrors(reducedPage);
  await reducedPage.goto(live, { waitUntil: "networkidle" });
  const reduced = await reducedPage.evaluate(() => {
    const button = document.querySelector(".button");
    const style = button ? getComputedStyle(button) : null;
    return { matches: matchMedia("(prefers-reduced-motion: reduce)").matches, transitionDuration: style?.transitionDuration, animationDuration: style?.animationDuration, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior };
  });
  check(reduced.matches && Number.parseFloat(reduced.transitionDuration) <= 0.00001, "reduced-motion transition remains active");
  results.reducedDark = { ...reduced, axeSerious: await axeSerious(reducedPage), errors: reducedErrors };
  check(results.reducedDark.axeSerious.length === 0 && reducedErrors.length === 0, "dark/reduced page has console/page or serious axe errors");
  await reducedContext.close();

  const demoContext = await browser.newContext({ viewport: { width: 1366, height: 900 }, acceptDownloads: true });
  await demoContext.addInitScript(() => localStorage.setItem("rsl:library-state:v1", '{"sentinel":"real-library"}'));
  const demoPage = await demoContext.newPage();
  const demoErrors = watchErrors(demoPage);
  const demoRequests = [];
  demoPage.on("request", (request) => demoRequests.push(request.url()));
  await demoPage.goto(`${live}/demo/?demo=1`, { waitUntil: "networkidle" });
  check(await demoPage.locator("#book-count").textContent() === "4", "demo did not seed four books");
  check(await demoPage.locator("#demo-banner").isVisible(), "demo banner is not persistent");
  await demoPage.locator("#search").fill("Zoë");
  const unicodeRows = await demoPage.locator("#catalogue-body tr").count();
  await demoPage.locator("#search").fill("x".repeat(1024));
  const boundaryText = await demoPage.locator("#catalogue-body").textContent();
  await demoPage.locator("#search").fill("");
  await demoPage.locator("#format-filter").selectOption("issues");
  const issueRows = await demoPage.locator("#catalogue-body tr").count();
  await demoPage.locator("#format-filter").selectOption("all");

  const catalogueTab = demoPage.getByRole("tab", { name: /Catalogue/ });
  await catalogueTab.focus();
  await catalogueTab.press("End");
  const endTab = await demoPage.evaluate(() => document.activeElement?.id);
  await demoPage.keyboard.press("Home");
  const homeTab = await demoPage.evaluate(() => document.activeElement?.id);

  await demoPage.getByRole("tab", { name: /Collections/ }).click();
  const originalPaths = await demoPage.locator(".device-path").allTextContents();
  await demoPage.getByRole("button", { name: "Move The Moss Archive down" }).click();
  const movedPaths = await demoPage.locator(".device-path").allTextContents();
  await demoPage.reload();
  const persistedPaths = await demoPage.locator(".device-path").allTextContents();
  await demoPage.getByRole("button", { name: "Reset demo" }).click();
  await demoPage.getByRole("tab", { name: /Collections/ }).click();
  const resetPaths = await demoPage.locator(".device-path").allTextContents();

  await demoPage.getByRole("button", { name: "Create collection" }).click();
  await demoPage.locator("#save-collection").click();
  const requiredMessage = await demoPage.locator("#collection-name").evaluate((input) => input.validationMessage);
  await demoPage.locator("#collection-name").fill("A/B:C?");
  await demoPage.locator("#save-collection").click();
  const noBookFeedback = await demoPage.locator("#toast-region").textContent();
  await demoPage.locator("#collection-books input").first().check();
  await demoPage.locator("#save-collection").click();
  const safeCollection = await demoPage.locator(".collection h3").last().textContent();

  await demoPage.getByRole("tab", { name: /Transfer & notes/ }).click();
  await demoPage.getByRole("button", { name: "Choose reader and sync" }).click();
  const usbFeedback = await demoPage.locator("#toast-region").textContent();
  await demoPage.locator("#webdav-url").fill("not-a-url");
  await demoPage.locator("#webdav-password").fill("secret");
  await demoPage.getByRole("button", { name: "Check connection" }).click();
  const invalidUrlMessage = await demoPage.locator("#webdav-url").evaluate((input) => input.validationMessage);
  const invalidPasswordCleared = await demoPage.locator("#webdav-password").inputValue();
  await demoPage.locator("#webdav-url").fill("https://cloud.example/books");
  await demoPage.locator("#webdav-user").fill("reader");
  await demoPage.locator("#webdav-password").fill("secret");
  await demoPage.getByRole("button", { name: "Check connection" }).click();
  const webdavStatus = await demoPage.locator("#webdav-status").textContent();
  const validPasswordCleared = await demoPage.locator("#webdav-password").inputValue();

  const downloadPromise = demoPage.waitForEvent("download");
  await demoPage.getByRole("button", { name: "Export Markdown" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  const markdown = downloadPath ? await readFile(downloadPath, "utf8") : "";

  await demoPage.locator("#browser-highlight").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{") });
  const badJsonFeedback = await demoPage.locator("#toast-region").textContent();
  await demoPage.locator("#browser-highlight").setInputFiles({ name: "empty.md", mimeType: "text/markdown", buffer: Buffer.from("nothing quoted") });
  const emptyHighlightFeedback = await demoPage.locator("#toast-region").textContent();
  await demoPage.locator("#browser-highlight").setInputFiles({ name: "valid.md", mimeType: "text/markdown", buffer: Buffer.from("# Test Book\n\n> A recovered highlight.\n\nRecovery note") });
  const highlightCount = await demoPage.locator(".highlight").count();

  const demoAxe = await axeSerious(demoPage);
  const demoOrigins = [...new Set(demoRequests.map((url) => new URL(url).origin))];
  check(unicodeRows === 1 && boundaryText.includes("No books match"), "search normal/boundary behavior failed");
  check(issueRows === 2, "issues filter did not return two books");
  check(endTab === "tab-transfer" && homeTab === "tab-catalogue", "tab keyboard Home/End behavior failed");
  check(originalPaths[0]?.startsWith("001") && movedPaths[0]?.includes("Field Notes") && JSON.stringify(movedPaths) === JSON.stringify(persistedPaths) && JSON.stringify(originalPaths) === JSON.stringify(resetPaths), "collection order persistence/reset failed");
  check(Boolean(requiredMessage) && noBookFeedback.includes("Choose at least one book") && safeCollection === "A-B-C-", "collection invalid-input recovery/safe naming failed");
  check(usbFeedback.includes("installed desktop app"), "USB web-demo recovery guidance is missing");
  check(Boolean(invalidUrlMessage) && invalidPasswordCleared === "" && webdavStatus.includes("does not contact servers") && validPasswordCleared === "", "WebDAV validation/isolation/password clearing failed");
  check(markdown.includes("# Reader highlights") && markdown.includes("A private library should remain legible"), "Markdown export contents failed");
  check(badJsonFeedback.includes("could not be read") && emptyHighlightFeedback.includes("No quoted highlights") && highlightCount === 3, "highlight invalid-input recovery failed");
  check(demoOrigins.every((origin) => origin === live), `demo made outside requests: ${demoOrigins.join(", ")}`);
  check((await demoContext.cookies()).length === 0, "demo set cookies");
  check(demoErrors.length === 0 && demoAxe.length === 0, "demo has console/page or serious axe errors");
  await demoPage.getByRole("link", { name: "Start for real" }).click();
  await demoPage.waitForURL(`${live}/`);
  const isolation = await demoPage.evaluate(() => ({ real: localStorage.getItem("rsl:library-state:v1"), demo: localStorage.getItem("demo:rsl:library-state:v1") }));
  check(isolation.real === '{"sentinel":"real-library"}' && isolation.demo === null, "Start for real crossed storage namespaces");
  results.demo = { unicodeRows, boundaryText, issueRows, endTab, homeTab, originalPaths, movedPaths, persistedPaths, resetPaths, requiredMessage, noBookFeedback, safeCollection, usbFeedback, invalidUrlMessage, invalidPasswordCleared, webdavStatus, validPasswordCleared, downloadFilename: download.suggestedFilename(), markdownLength: markdown.length, badJsonFeedback, emptyHighlightFeedback, highlightCount, origins: demoOrigins, cookies: await demoContext.cookies(), axeSerious: demoAxe, errors: demoErrors, isolation };
  await demoContext.close();

  const offlineContext = await browser.newContext();
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(`${live}/demo/?demo=1`);
  const registration = await offlinePage.evaluate(async () => {
    const current = await navigator.serviceWorker.ready;
    await current.update();
    return { active: current.active?.scriptURL, caches: await caches.keys() };
  });
  await offlinePage.reload();
  await offlineContext.setOffline(true);
  await offlinePage.reload({ waitUntil: "domcontentloaded" });
  const offline = { ...registration, bookCount: await offlinePage.locator("#book-count").textContent(), banner: await offlinePage.locator("#demo-banner").isVisible() };
  check(offline.bookCount === "4" && offline.banner && offline.caches.length === 1 && offline.caches[0] === "rsl-shell-v5", "service-worker update/offline reload failed");
  results.offline = offline;
  await offlineContext.close();

  const appContext = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const appPage = await appContext.newPage();
  const appErrors = watchErrors(appPage);
  const appRequests = [];
  appPage.on("request", (request) => appRequests.push(request.url()));
  await appPage.goto(localApp, { waitUntil: "networkidle" });
  const fiftyDir = await mkdtemp(join(tmpdir(), "rsl-50-"));
  await Promise.all(Array.from({ length: 50 }, (_, index) => writeFile(join(fiftyDir, `Book ${String(index + 1).padStart(2, "0")}.epub`), `epub-${index + 1}`)));
  await appPage.locator("#browser-folder").setInputFiles(fiftyDir);
  const indexed = await appPage.locator("#book-count").textContent();
  await appPage.getByRole("tab", { name: /Collections/ }).click();
  await appPage.getByRole("button", { name: "Create collection" }).click();
  await appPage.locator("#collection-name").fill("Fifty Book Queue");
  await appPage.locator("#collection-books input").evaluateAll((inputs) => inputs.forEach((input) => { input.checked = true; }));
  await appPage.locator("#save-collection").click();
  const plannedPaths = await appPage.locator(".device-path").allTextContents();
  const stored = await appPage.evaluate(() => JSON.parse(localStorage.getItem("rsl:library-state:v1") ?? "{}"));
  await appPage.getByRole("tab", { name: /Catalogue/ }).click();
  const unsupportedDir = await mkdtemp(join(tmpdir(), "rsl-unsupported-"));
  await writeFile(join(unsupportedDir, "ignore.txt"), "ignore");
  await appPage.locator("#browser-folder").setInputFiles(unsupportedDir);
  const unsupportedCount = await appPage.locator("#book-count").textContent();
  const recoveredDir = await mkdtemp(join(tmpdir(), "rsl-recovered-"));
  await writeFile(join(recoveredDir, "Recovered.epub"), "ok");
  await appPage.locator("#browser-folder").setInputFiles(recoveredDir);
  const recoveredCount = await appPage.locator("#book-count").textContent();
  await appPage.getByRole("tab", { name: /Transfer & notes/ }).click();
  await appPage.locator("#browser-highlight").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{") });
  const appBadJson = await appPage.locator("#toast-region").textContent();
  await appPage.locator("#browser-highlight").setInputFiles({ name: "valid.md", mimeType: "text/markdown", buffer: Buffer.from("> Restored note") });
  const appHighlightCount = await appPage.locator(".highlight").count();
  const appAxe = await axeSerious(appPage);
  check(indexed === "50" && plannedPaths.length === 50 && new Set(plannedPaths).size === 50 && stored.books.length === 50, "50-book catalogue/plan failed");
  check(unsupportedCount === "0" && recoveredCount === "1", "unsupported-file recovery failed");
  check(appBadJson.includes("could not be read") && appHighlightCount === 1, "real app-preview highlight recovery failed");
  check(appRequests.every((url) => new URL(url).origin === localApp), "app preview made a passive external request");
  check(appErrors.length === 0 && appAxe.length === 0, "app preview has console/page or serious axe errors");
  results.appPreview = { indexed, plannedCount: plannedPaths.length, uniquePlans: new Set(plannedPaths).size, firstPlan: plannedPaths[0], lastPlan: plannedPaths.at(-1), storedBooks: stored.books.length, unsupportedCount, recoveredCount, appBadJson, appHighlightCount, origins: [...new Set(appRequests.map((url) => new URL(url).origin))], axeSerious: appAxe, errors: appErrors };
  await Promise.all([fiftyDir, unsupportedDir, recoveredDir].map((path) => rm(path, { recursive: true, force: true })));
  await appContext.close();
} finally {
  await browser.close();
}

await writeFile(".factory/evidence/verification-5/manual-results.json", `${JSON.stringify(results, null, 2)}\n`);
if (results.failures.length) {
  console.error(results.failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Manual QA automation passed");
}
