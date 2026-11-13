import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const URL_TO_TEST = "https://merchant-listing-preflight.pages.dev/";
const HOST = new URL(URL_TO_TEST).hostname;
const OUT = "artifacts/merchant-production-postrelease-20261113";
const csv = [
  "Issues count,Status,Main image link,Landing URL",
  "0,Disapproved,https://img.test/a,https://shop.test/p"
].join("\n");
const falseContextProduct = JSON.stringify({
  "@context": {
    priceTag: {
      "@id": "https://example.com/p",
      "@type": "https://schema.org/Product"
    }
  },
  "@type": "Thing"
});
const trueProduct = JSON.stringify({
  "@context": { priceTag: { "@type": "https://schema.org/Product" } },
  "@graph": [{
    "@type": "Product",
    name: "Synthetic product",
    offers: { "@type": "Offer", price: "20", priceCurrency: "USD" }
  }]
});
const normalize = (s) => String(s).replace(/\s+/g, " ").trim();
const report = {
  preview: URL_TO_TEST,
  purpose: "Isolated read-only Chrome mobile emulation acceptance test; no production writes",
  viewport: { width: 390, height: 844 },
  publishedCommit: "c02f252cd998c4b58f9c587576575f103612f458",
  productionHttp: { status: "NOT_RUN" },
  startedAt: new Date().toISOString(),
  M01: { status: "NOT_RUN" },
  M04: { status: "NOT_RUN" },
  mobile: { status: "NOT_RUN" },
  pageErrors: [],
  consoleErrors: [],
  failedRequests: [],
  note: "Playwright setInputFiles bypasses the OS file picker; touch is Chromium emulation, not physical-device certification."
};
await mkdir(OUT, { recursive: true });
let browser;
let page;
async function caseCheck(key, test) {
  try {
    const evidence = await test();
    report[key] = { status: "PASS", ...evidence };
    console.log(key + ": PASS");
  } catch (error) {
    report[key] = { status: "FAIL", error: String(error) };
    console.error(key + ": FAIL", String(error));
    if (page) {
      try { await page.screenshot({ path: OUT + "/" + key + "-failure.png", fullPage: true }); }
      catch {}
    }
  }
}
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    locale: "en-US",
    acceptDownloads: false,
    permissions: [],
    serviceWorkers: "block"
  });
  await context.route("**/*", async (route) => {
    const method = route.request().method();
    if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS")
      await route.abort("blockedbyclient");
    else await route.continue();
  });
  page = await context.newPage();
  page.on("pageerror", (error) => report.pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") report.consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (report.failedRequests.length < 20)
      report.failedRequests.push({ method: request.method(), url: request.url(), reason: request.failure()?.errorText });
  });
  const response = await page.goto(URL_TO_TEST, {
    waitUntil: "domcontentloaded",
    timeout: 45000
  });
  assert.equal(response?.status(), 200, "Exact preview must return HTTP 200");
  assert.equal(new URL(page.url()).hostname, HOST, "Unexpected host redirect");
  await page.getByRole("button", { name: "CSV export", exact: true }).waitFor();

  await caseCheck("productionHttp", async () => {
    const request = context.request;
    const req = async (path, expectStatus = 200) => {
      const response = await request.get(new URL(path, URL_TO_TEST).href, {
        timeout: 25000,
        failOnStatusCode: false
      });
      const body = await response.body();
      assert.equal(response.status(), expectStatus, path + " unexpected HTTP status");
      return { response, body, html: body.toString("utf8") };
    };

    const index = await req("/");
    assert.match(index.response.headers()["content-type"] ?? "", /text\/html/i);
    assert.match(index.html, /<meta property="og:image" content="https:\/\/merchant-listing-preflight\.pages\.dev\/social-card\.png">/i);

    const guides = await req("/guides");
    assert.match(guides.html, /<link rel="canonical" href="https:\/\/merchant-listing-preflight\.pages\.dev\/guides">/i);

    const articlePath = "/guides/how-to-fix-mismatched-product-price";
    const article = await req(articlePath);
    assert.match(article.html, /how-to-fix-mismatched-product-price/i);

    const notFound = await req("/release-audit-missing-" + Date.now(), 404);
    assert.match(notFound.html, /noindex/i);

    const image = await req("/social-card.png");
    const mime = image.response.headers()["content-type"] ?? "";
    assert.match(mime, /image\/png/i, "Social image is not served as PNG");
    assert.equal(image.body.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", "PNG signature mismatch");
    const width = image.body.readUInt32BE(16);
    const height = image.body.readUInt32BE(20);
    assert.equal(width, 1200);
    assert.equal(height, 630);

    const redirect = await request.get(new URL("/merchant-center-issues", URL_TO_TEST).href,{
      timeout: 25000, failOnStatusCode:false, maxRedirects:0
    });
    assert.ok([301,302,307,308].includes(redirect.status()), "Legacy guide redirect not issued");
    assert.match(redirect.headers()["location"] ?? "", /\/guides\/?$/);

    return {
      homepage:200, guides:200, article:200, missing:404,
      socialImage:{status:200,mime,width,height,bytes:image.body.length},
      legacyRedirect:{status:redirect.status(),location:redirect.headers()["location"]},
      expectedMainCommit:"c02f252cd998c4b58f9c587576575f103612f458"
    };
  });

  await caseCheck("M01", async () => {
    await page.getByRole("button", { name: "CSV export", exact: true }).tap();
    const input = page.locator('input[type="file"][accept*="csv"]');
    await input.setInputFiles({
      name: "merchant-m01-test.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv, "utf8")
    });
    const result = page.getByRole("region", { name: "CSV analysis results" });
    await result.waitFor({ state: "visible", timeout: 12000 });
    const stats = normalize(await result.locator(".pw-stats").innerText());
    const summary = normalize(await result.locator(".pw-row-summary").innerText());
    const detected = normalize(await result.locator(".pw-detected").innerText());
    const checks = {
      productRows: /\b1 Product rows\b/i.test(stats),
      issueGroups: /\b0 Issue groups\b/i.test(stats),
      issueText: /Rows with issue text:\s*0\b/i.test(summary),
      statusOnly: /Status only:\s*1\b/i.test(summary),
      issueColumn: /\bIssue\s+Not found\b/i.test(detected),
      productUrl: /Product URL\s+Landing URL\b/i.test(detected)
    };
    await page.screenshot({ path: OUT + "/M01-csv-390.png", fullPage: true });
    assert.ok(Object.values(checks).every(Boolean), JSON.stringify({checks,stats,summary,detected}));
    return { checks, stats, summary, detected, screenshot: "M01-csv-390.png", filePicker: "NOT_TESTED_NATIVE" };
  });

  await caseCheck("M04", async () => {
    await page.getByRole("button", { name: "JSON-LD / HTML", exact: true }).tap();
    const textarea = page.getByLabel("Product JSON-LD or HTML");
    await textarea.tap();
    await textarea.fill(falseContextProduct);
    await page.getByRole("button", { name: "Analyze markup", exact: true }).tap();
    const result = page.getByRole("region", { name: "Markup analysis results" });
    await result.waitFor({ state: "visible", timeout: 12000 });
    const negative = normalize(await result.innerText());
    await page.screenshot({ path: OUT + "/M04-negative-390.png", fullPage: true });
    assert.match(negative, /No Product object found in JSON-LD\./i);

    await textarea.fill(trueProduct);
    await page.getByRole("button", { name: "Analyze markup", exact: true }).tap();
    const positive = normalize(await result.innerText());
    await page.screenshot({ path: OUT + "/M04-positive-control-390.png", fullPage: true });
    assert.match(positive, /Product type detected/i);
    assert.match(positive, /Typed Offer detected/i);
    return {
      negativeContextOnly: "No Product object found in JSON-LD.",
      positiveControl: "Product and Offer found",
      screenshots: ["M04-negative-390.png","M04-positive-control-390.png"]
    };
  });

  await caseCheck("mobile", async () => {
    const measurements = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      coarsePointer: matchMedia("(pointer: coarse)").matches,
      maxTouchPoints: navigator.maxTouchPoints
    }));
    assert.equal(measurements.innerWidth, 390, "Not a 390px viewport");
    assert.equal(measurements.innerHeight, 844, "Not an 844px viewport");
    assert.ok(measurements.coarsePointer && measurements.maxTouchPoints > 0, "Touch emulation not active");
    assert.ok(measurements.scrollWidth <= 392, "Horizontal overflow at mobile width");
    assert.deepEqual(report.pageErrors, [], "Uncaught JavaScript errors");
    return measurements;
  });
  await context.close();
} catch (error) {
  report.environmentError = String(error);
  console.error("ENVIRONMENT FAILURE:", String(error));
} finally {
  if (browser) await browser.close().catch(() => {});
  report.completedAt = new Date().toISOString();
  const passed = report.M01.status === "PASS" &&
    report.M04.status === "PASS" && report.mobile.status === "PASS" && report.productionHttp.status === "PASS" &&
    !report.environmentError;
  report.overall = passed ? "PASS_PRODUCTION_POSTRELEASE" : "NOT_CONFIRMED";
  await writeFile(OUT + "/report.json", JSON.stringify(report, null, 2) + "\n");
  console.log("FINAL:", report.overall);
  if (!passed) process.exitCode = 1;
}
