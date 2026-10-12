import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4175",
    "--strictPort",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let browser;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Preview server did not start")),
      10000,
    );
    server.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Preview exited: ${code}`));
    });
    server.stdout.on("data", (data) => {
      if (String(data).includes("4175")) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:4175/");
  await page
    .getByRole("button", { name: "Load sample CSV", exact: true })
    .click();
  const csv = page.getByRole("region", { name: "CSV analysis results" });
  await csv.waitFor();
  assert.equal(await csv.locator("tbody tr").count(), 4);
  assert.match(await csv.innerText(), /sample-products.csv/);
  await mkdir("docs", { recursive: true });
  await page.screenshot({ path: "docs/checker-desktop.png", fullPage: true });

  await page
    .getByRole("button", { name: "JSON-LD / HTML", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Analyze markup", exact: true })
    .click();
  assert.match(await page.getByRole("alert").innerText(), /Paste JSON-LD/);
  await page
    .getByRole("button", { name: "Load sample markup", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Analyze markup", exact: true })
    .click();
  const markup = page.getByRole("region", { name: "Markup analysis results" });
  await markup.waitFor();
  assert.equal(await markup.locator(".pw-status.pass").count(), 5);
  await page.getByLabel("Product JSON-LD or HTML").fill("{broken");
  assert.equal(await markup.count(), 0);
  await page
    .getByRole("button", { name: "Analyze markup", exact: true })
    .click();
  assert.match(await page.getByRole("alert").innerText(), /JSON/i);
  await page.getByRole("button", { name: "Clear input", exact: true }).click();
  assert.equal(
    await page.getByLabel("Product JSON-LD or HTML").inputValue(),
    "",
  );

  await page.getByRole("button", { name: "CSV export", exact: true }).click();
  assert.match(await csv.innerText(), /sample-products.csv/);
  const file = page.getByLabel("Affected-products CSV", { exact: true });
  await file.setInputFiles({
    name: "quoted.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      'Item ID,Title,Issue,Link\n1,"Mug, blue",Mismatched product price,https://example.com/mug',
    ),
  });
  await page
    .getByRole("heading", { name: "quoted.csv", exact: true })
    .waitFor();
  assert.equal(await csv.locator("tbody tr").count(), 1);
  // Re-selecting the same file must still trigger analysis.
  await page
    .getByRole("button", { name: "Clear results", exact: true })
    .click();
  await file.setInputFiles({
    name: "quoted.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Item ID,Title,Issue\n1,Mug,Mismatched product price"),
  });
  await page
    .getByRole("heading", { name: "quoted.csv", exact: true })
    .waitFor();
  await file.setInputFiles({
    name: "malformed.csv",
    mimeType: "text/csv",
    buffer: Buffer.from('Item ID,Title,Issue\n1,"unterminated,issue'),
  });
  await page
    .getByRole("heading", { name: "malformed.csv", exact: true })
    .waitFor();
  assert.equal(await csv.locator("tbody tr").count(), 0);
  assert.match(await csv.getByRole("alert").innerText(), /quoted|quote/i);
  await file.setInputFiles({
    name: "large.csv",
    mimeType: "text/csv",
    buffer: Buffer.alloc(2_000_001, 65),
  });
  assert.match(await page.getByRole("alert").innerText(), /2 MB/);
  assert.equal(await csv.count(), 0);
  await page
    .getByRole("button", { name: "Load sample CSV", exact: true })
    .click();
  await csv.waitFor();

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: "docs/checker-mobile.png", fullPage: true });
  await page
    .getByRole("button", { name: "JSON-LD / HTML", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Load sample markup", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Analyze markup", exact: true })
    .click();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  await page.getByRole("button", { name: "CSV export", exact: true }).focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page
      .getByRole("button", { name: "CSV export", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );

  await page.getByRole("button", { name: "JSON-LD / HTML", exact: true }).click();
  await page.getByRole("textbox", { name: "Product JSON-LD or HTML", exact: true }).fill(
    '<script type = "application/ld+json">{"@type":"Product","name":"Whitespace test","offers":{"@type":"Offer","price":"10","priceCurrency":"USD"}}</script>'
  );
  await page.getByRole("button", { name: "Analyze markup", exact: true }).click();
  assert.match(await page.getByRole("region", { name: "Markup analysis results" }).innerText(), /Product found: Whitespace test/);

  // Following a guide from a scrolled index must show the new page's heading.
  await page.goto("http://127.0.0.1:4175/guides");
  const guideLink = page.locator('a[href="/guides/how-to-fix-mismatched-product-price"]');
  await guideLink.scrollIntoViewIfNeeded();
  await guideLink.click();
  await page.getByRole("heading", { level: 1, name: "How to fix Mismatched product price in Google Merchant Center" }).waitFor();
  await page.waitForFunction(() => window.scrollY === 0);
  // The header CTA is hidden on mobile; use the visible action in the guide hero.
  await page.locator(".content-hero").getByRole("link", { name: "Request diagnostic report", exact: true }).click();
  await page.locator("#order details[open]").waitFor();
  assert.equal(await page.getByLabel("Store URL", { exact: true }).isVisible(), true);
  await page.reload();
  await page.locator("#order details[open]").waitFor();
  await page.getByRole("button", { name: "Open email draft", exact: true }).click();
  assert.equal(await page.getByLabel("Store URL", { exact: true }).evaluate(el => el.validity.valueMissing), true);
  assert.match(page.url(), /#order$/);
  await page.goto("http://127.0.0.1:4175/");
  assert.equal(await page.locator("#order details").evaluate(el => el.open), false);

  // The sample-report header action is available at desktop widths.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:4175/sample-report");
  await page.getByRole("link", { name: "Run free check", exact: true }).click();
  await page.waitForURL("**/#checker");
  await page.getByRole("region", { name: "Product data checker" }).waitFor({ state: "visible" });
  assert.equal(await page.locator("#order details").evaluate(el => el.open), false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4175/sample-report");
  await page.getByRole("link", { name: "Run free preflight", exact: true }).click();
  await page.waitForURL("**/#checker");
  await page.getByRole("region", { name: "Product data checker" }).waitFor({ state: "visible" });
  assert.equal(await page.locator("#order details").evaluate(el => el.open), false);

  // Existing deep links remain usable after replacing the homepage.
  for (const path of [
    "/guides",
    "/merchant-center-issues",
    "/privacy",
    "/terms",
    "/sample-report",
    "/affected-products-csv-checker",
    "/merchant-center-diagnostic-report",
    "/google-merchant-center-review-checklist",
  ]) {
    await page.goto(`http://127.0.0.1:4175${path}`);
    assert.equal(await page.locator("h1").count(), 1, path);
    assert.doesNotMatch(
      await page.locator("h1").innerText(),
      /not found/i,
      path,
    );
  }
  await page.goto("http://127.0.0.1:4175/missing-page");
  assert.match(await page.locator("h1").innerText(), /not found|404/i);
  await page.goto("http://127.0.0.1:4175/");
  await page.getByLabel("Affected-products CSV", { exact: true }).setInputFiles({
    name: "repeated-urls.csv", mimeType: "text/csv", buffer: Buffer.from(
      "Issue,Link\nPending,https://example.com/a\nPending,https://example.com/a\nPending,https://example.com/b") });
  await page.getByRole("heading", { name: "repeated-urls.csv", exact: true }).waitFor();
  assert.equal(await page.locator(".pw-urls li").count(), 2);
  await page.getByRole("button", { name: "JSON-LD / HTML", exact: true }).click();
  await page.getByLabel("Product JSON-LD or HTML").fill(
    '<script TYPE=application/ld+json>{"@type":"Product","name":"' + "P".repeat(200) + '"}</script>');
  await page.getByRole("button", { name: "Analyze markup", exact: true }).click();
  assert.match(await page.getByRole("region", { name: "Markup analysis results" }).innerText(), /Product found:/);
  await page.setViewportSize({ width: 320, height: 700 });
  assert.equal(await page.locator(".pw-checks").evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
  await page.goto("http://127.0.0.1:4175/#order");
  await page.getByLabel("Store URL", { exact: true }).fill("ftp://example.com");
  assert.equal(await page.getByLabel("Store URL", { exact: true }).evaluate(el => el.validity.valid), false);
  await page.getByLabel("Store URL", { exact: true }).fill("https://example.com");
  assert.equal(await page.getByLabel("Store URL", { exact: true }).evaluate(el => el.validity.valid), true);
  await page.getByLabel("Target currency", { exact: true }).fill("123");
  assert.equal(await page.getByLabel("Target currency", { exact: true }).evaluate(el => el.validity.valid), false);
  for (const path of ["/privacy", "/terms", "/sample-report"]) {
    await page.goto(`http://127.0.0.1:4175${path}`);
    assert.equal(await page.locator(".article-card").evaluateAll(cards => cards.every(card => {
      const rect = card.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth && card.scrollWidth <= card.clientWidth + 1;
    })), true, `${path}: card contents must fit the mobile viewport`);
  }
  assert.deepEqual(errors, []);
  console.log(
    "Browser smoke passed: sample and uploaded CSV, repeated upload, malformed and oversized input, markup validation, mode persistence, keyboard activation, mobile overflow, existing routes and 404; no runtime errors.",
  );
} finally {
  await browser?.close();
  server.kill();
}
