import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const baseUrl = process.argv[2] ?? "https://reader-sideload-library.sociobot.in";
const evidenceDir = process.argv[3] ?? ".factory/evidence/polish-2/live";
const { version } = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const failures = [];
const results = { baseUrl, checkedAt: new Date().toISOString(), routes: [], demo: {}, offline: {} };
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const route of ["/", "/demo/?demo=1", "/privacy/", "/terms/", "/route-that-does-not-exist"]) {
    const consoleErrors = [];
    const onConsole = (message) => {
      const expectedMissingRouteError = route.includes("route-that") && message.text().includes("status of 404");
      if (message.type() === "error" && !expectedMissingRouteError) consoleErrors.push(message.text());
    };
    const onPageError = (error) => consoleErrors.push(error.message);
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    const axe = await new AxeBuilder({ page }).analyze();
    const serious = axe.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
    const state = await page.evaluate(() => ({
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      mainCount: document.querySelectorAll("main").length,
      activeTag: document.activeElement?.tagName,
      activeText: document.activeElement?.textContent?.trim(),
      announcement: document.querySelector("#route-status")?.textContent?.trim(),
      headerLinks: [...document.querySelectorAll("header a")].map((link) => link.textContent?.trim()),
      footerLinks: [...document.querySelectorAll("footer a")].map((link) => link.textContent?.trim()),
      builtBy: document.querySelector("footer")?.textContent?.includes("Built by Param Factory"),
      description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
      openGraph: {
        title: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
        description: document.querySelector('meta[property="og:description"]')?.getAttribute("content"),
        image: document.querySelector('meta[property="og:image"]')?.getAttribute("content")
      },
      twitter: {
        card: document.querySelector('meta[name="twitter:card"]')?.getAttribute("content"),
        title: document.querySelector('meta[name="twitter:title"]')?.getAttribute("content"),
        description: document.querySelector('meta[name="twitter:description"]')?.getAttribute("content"),
        image: document.querySelector('meta[name="twitter:image"]')?.getAttribute("content")
      },
      releaseStatus: document.querySelector("#release-status")?.textContent?.trim(),
      downloadHref: document.querySelector("#primary-download")?.href
    }));
    const expectedStatus = route.includes("route-that") ? 404 : 200;
    check(response?.status() === expectedStatus, `${route}: expected HTTP ${expectedStatus}, got ${response?.status()}`);
    check(state.h1Count === 1, `${route}: expected one h1`);
    check(state.mainCount === 1, `${route}: expected one main`);
    check(state.activeTag === "H1", `${route}: route h1 did not receive focus`);
    check(Boolean(state.announcement), `${route}: route change was not announced`);
    check(serious.length === 0, `${route}: serious axe findings: ${serious.map((item) => item.id).join(", ")}`);
    check(consoleErrors.length === 0, `${route}: console errors: ${consoleErrors.join(" | ")}`);
    check(["Demo", "Privacy", "Terms"].every((label) => state.footerLinks.includes(label)), `${route}: shared footer links missing`);
    check(state.openGraph.title === state.title, `${route}: Open Graph title does not match the route title`);
    check(Boolean(state.description), `${route}: route description is missing`);
    check(Boolean(state.openGraph.description), `${route}: Open Graph description is missing`);
    check(state.openGraph.image?.endsWith("/assets/social-card.jpg"), `${route}: Open Graph image is missing`);
    check(state.twitter.card === "summary_large_image", `${route}: Twitter card type is missing`);
    check(state.twitter.title === state.title, `${route}: Twitter title does not match the route title`);
    check(state.twitter.description === state.openGraph.description, `${route}: Twitter description does not match the Open Graph description`);
    check(state.twitter.image === state.openGraph.image, `${route}: Twitter image does not match the Open Graph image`);
    if (route === "/") {
      check(state.releaseStatus?.includes(`Release ${version} found`), `home did not resolve release ${version}: ${state.releaseStatus}`);
      check(state.downloadHref?.includes(`/releases/download/v${version}/`), `home download is not a v${version} asset: ${state.downloadHref}`);
      check(state.footerLinks.includes("Source on GitHub (external)"), "home source link does not name GitHub as an external destination");
    }
    results.routes.push({ route, status: response?.status(), ...state, seriousAxe: serious.length, consoleErrors });
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }

  const thirdParty = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== new URL(baseUrl).origin) thirdParty.push(request.url());
  });
  await page.addInitScript(() => localStorage.setItem("rsl:library-state:v1", '{"sentinel":"real-library"}'));
  await page.goto(`${baseUrl}/?demo=1`, { waitUntil: "networkidle" });
  check(page.url().endsWith("/demo/?demo=1"), `/?demo=1 did not enter the demo: ${page.url()}`);
  check(thirdParty.length === 0, `demo shortcut made third-party requests: ${thirdParty.join(", ")}`);
  const primary = page.getByRole("button", { name: "Search the sample catalogue" });
  check(await primary.isVisible(), "sample primary action is not visible");
  await primary.click();
  check(await page.locator("#search").evaluate((element) => element === document.activeElement), "sample primary action did not focus search");
  await page.locator("#search").fill("Zoë");
  await page.locator("#format-filter").selectOption("PDF");
  await page.getByRole("tab", { name: /Collections/ }).click();
  check(await page.getByText("Ordered device folders", { exact: true }).isVisible(), "Collections panel does not use its direct task label");
  await page.getByRole("tab", { name: /Transfer & highlights/ }).click();
  check(await page.getByText("USB, WebDAV, and Markdown export", { exact: true }).isVisible(), "Transfer panel does not use its direct task label");
  await page.getByRole("tab", { name: /Collections/ }).click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  const reset = await page.evaluate(() => ({
    search: document.querySelector("#search")?.value,
    filter: document.querySelector("#format-filter")?.value,
    rows: document.querySelectorAll("#catalogue-body tr").length,
    catalogueActive: document.querySelector("#tab-catalogue")?.getAttribute("aria-selected"),
    focus: document.activeElement?.id,
    real: localStorage.getItem("rsl:library-state:v1"),
    demo: localStorage.getItem("demo:rsl:library-state:v1")
  }));
  check(reset.search === "", "Reset demo did not clear search");
  check(reset.filter === "all", "Reset demo did not clear the format filter");
  check(reset.rows === 4, `Reset demo restored ${reset.rows} rows instead of 4`);
  check(reset.catalogueActive === "true", "Reset demo did not restore Catalogue");
  check(reset.focus === "catalogue-heading", "Reset demo did not place focus on the catalogue heading");
  check(reset.real === '{"sentinel":"real-library"}', "demo changed the real storage namespace");
  check(Boolean(reset.demo), "demo storage namespace was not seeded");
  results.demo = {
    url: page.url(),
    thirdParty,
    reset: { ...reset, demo: undefined, demoSeeded: Boolean(reset.demo) }
  };
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${evidenceDir}/demo-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const firstScreen = await page.locator(".hero-facts li, .hero-lede, .hero-actions .button-primary").evaluateAll((elements) => elements.map((element) => {
    const bounds = element.getBoundingClientRect();
    return { text: element.textContent?.trim(), top: bounds.top, bottom: bounds.bottom };
  }));
  check(firstScreen.length === 5, `home first screen exposed ${firstScreen.length} required items instead of 5`);
  check(firstScreen.every((item) => item.top >= 0 && item.bottom <= 768), `home first-screen content falls below 768px: ${JSON.stringify(firstScreen)}`);
  results.firstScreen = firstScreen;
  await page.screenshot({ path: `${evidenceDir}/home-1366x768.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const mobileFirstScreen = await page.locator(".hero-facts li, .hero-lede, .hero-actions .button-primary").evaluateAll((elements) => elements.map((element) => {
    const bounds = element.getBoundingClientRect();
    return { text: element.textContent?.trim(), top: bounds.top, bottom: bounds.bottom };
  }));
  check(mobileFirstScreen.length === 5, `mobile home first screen exposed ${mobileFirstScreen.length} required items instead of 5`);
  check(mobileFirstScreen.every((item) => item.top >= 0 && item.bottom <= 844), `mobile first-screen content falls below 844px: ${JSON.stringify(mobileFirstScreen)}`);
  results.mobileFirstScreen = mobileFirstScreen;
  await page.screenshot({ path: `${evidenceDir}/home-390x844.png` });

  await page.goto(`${baseUrl}/demo/?demo=1`, { waitUntil: "networkidle" });
  const mobile = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    privacyVisible: Boolean(document.querySelector('header a[href="/privacy/"]')?.getClientRects().length)
  }));
  check(mobile.scrollWidth <= mobile.clientWidth, `mobile demo overflows: ${mobile.scrollWidth} > ${mobile.clientWidth}`);
  check(mobile.privacyVisible, "mobile demo hides the Privacy navigation link");
  results.demo.mobile = mobile;
  await page.screenshot({ path: `${evidenceDir}/demo-mobile.png`, fullPage: true });
  await context.close();

  const offlineContext = await browser.newContext();
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(`${baseUrl}/demo/?demo=1`);
  await offlinePage.evaluate(() => navigator.serviceWorker.ready);
  await offlineContext.setOffline(true);
  await offlinePage.reload({ waitUntil: "domcontentloaded" });
  const offlineBookCount = await offlinePage.locator("#book-count").textContent();
  const offlineBanner = await offlinePage.locator("#demo-banner").isVisible();
  const offlineTitle = await offlinePage.title();
  check(offlineBookCount === "4", `offline demo showed ${offlineBookCount} books instead of 4`);
  check(offlineBanner, "offline advertised demo URL did not show the demo banner");
  check(offlineTitle === "Demo — Reader Sideload Library", `offline advertised demo URL showed the wrong title: ${offlineTitle}`);
  results.offline = { url: offlinePage.url(), title: offlineTitle, bannerVisible: offlineBanner, bookCount: offlineBookCount };
  await offlineContext.close();
} finally {
  await browser.close();
}

results.failures = failures;
await writeFile(`${evidenceDir}/findings.json`, `${JSON.stringify(results, null, 2)}\n`);
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Live verification passed for ${baseUrl}`);
}
