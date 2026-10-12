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
  // Reference navigation must preserve the loaded analysis without a reload.
  let documentRequests = 0;
  page.on("request", request => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentRequests++;
  });
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.getByRole("link", { name: "Guides", exact: true }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/guides");
  await nav.locator('a[href="/guides"][aria-current="page"]').waitFor();
  assert.equal(await nav.getByRole("link", { name: "Guides", exact: true }).getAttribute("aria-current"), "page");
  await page.waitForFunction(() => document.activeElement?.matches("main h1"));
  assert.equal(await page.getByRole("heading", { level: 1 }).evaluate(el => el === document.activeElement), true, await page.evaluate(() => ({url: location.pathname, focus: document.activeElement?.outerHTML.slice(0,200)})));
  assert.equal(await page.getByRole("region", { name: "CSV analysis results" }).count(), 0);
  await nav.getByRole("link", { name: "Checker", exact: true }).click();
  await page.waitForURL("http://127.0.0.1:4175/");
  assert.match(await csv.innerText(), /sample-products.csv/);
  assert.equal(documentRequests, 0, "internal navigation must not reload the document");
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
  await nav.getByRole("link", { name: "Guides", exact: true }).click();
  await page.waitForURL("**/guides");
  await nav.getByRole("link", { name: "Checker", exact: true }).click();
  await markup.waitFor({ state: "visible" });
  assert.equal(await markup.locator(".pw-status.pass").count(), 5);
  assert.equal(await page.getByRole("button", { name: "JSON-LD / HTML", exact: true }).getAttribute("aria-pressed"), "true");
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
  await page.getByRole("heading", { level: 1, name: "Compare product prices" }).waitFor();
  await page.waitForFunction(() => window.scrollY === 0);
  // The header CTA is hidden on mobile; use the visible action in the guide hero.
  await page.locator(".content-hero").getByRole("link", { name: "Ask about an issue", exact: true }).click();
  await page.locator("#order details[open]").waitFor();
  assert.equal(await page.getByLabel("Store URL", { exact: true }).isVisible(), true);
  await page.reload();
  await page.locator("#order details[open]").waitFor();
  await page.getByRole("button", { name: "Open email draft", exact: true }).click();
  assert.equal(await page.getByLabel("Store URL", { exact: true }).evaluate(el => el.validity.valueMissing), true);
  assert.match(page.url(), /#order$/);
  await page.goto("http://127.0.0.1:4175/");
  assert.equal(await page.locator("#order details").evaluate(el => el.open), false);

  // The shared menu returns from the sample report to the checker.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:4175/sample-report");
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Checker", exact: true }).click();
  await page.waitForURL(/\/(?:#checker)?$/);
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
    assert.equal(await page.locator("h1:visible").count(), 1, path);
    assert.doesNotMatch(
      await page.locator("h1:visible").innerText(),
      /not found/i,
      path,
    );
  }
  await page.goto("http://127.0.0.1:4175/missing-page");
  assert.match(await page.locator("h1:visible").innerText(), /not found|404/i);
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
  await page.goto("http://127.0.0.1:4175/sample-report");
  assert.match(await page.locator(".content-hero").innerText(), /fictional/i);
  for (const path of ["/", "/sample-report", "/guides/how-to-fix-mismatched-product-price", "/guides/unknown-guide"]) {
    await page.goto(`http://127.0.0.1:4175${path}`);
    await page.waitForFunction(() => document.title === document.querySelector('meta[property="og:title"]')?.content);
    assert.equal(await page.locator('meta[name="description"]').count(), 1);
    assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
  }
  await page.goto("http://127.0.0.1:4175/guides/how-to-fix-mismatched-product-price");
  assert.equal(await page.getByRole("heading", { name: "Official reference", exact: true }).count(), 1);
  assert.equal(await page.locator(".guide-reference a").getAttribute("href"), "https://support.google.com/merchants/answer/12159029?hl=en");
  const reviewPaths = ["/", "/guides", "/sample-report", "/merchant-center-issues", "/privacy", "/terms",
    "/affected-products-csv-checker", "/google-merchant-center-review-checklist", "/merchant-center-diagnostic-report", "/missing-page",
    "/guides/how-to-fix-mismatched-product-price", "/guides/how-to-fix-mismatched-product-availability",
    "/guides/how-to-fix-mismatched-domains", "/guides/different-product-landing-page-checklist",
    "/guides/pending-website-check-readiness", "/guides/product-offer-structured-data-checklist"];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of reviewPaths) {
      await page.goto(`http://127.0.0.1:4175${path}`);
      await page.locator("h1:visible").waitFor();
      assert.equal(await page.locator("h1:visible").count(), 1);
      assert.equal(await page.locator("#content").count(), 1, "one active skip-link destination");
      const skip = page.getByRole("link", { name: "Skip to content", exact: true });
      await skip.focus();
      await page.keyboard.press("Enter");
      await page.waitForFunction(() => document.activeElement?.id === "content");
      assert.equal(await page.getByRole("banner").count(), 1);
      assert.equal(await page.getByRole("contentinfo").count(), 1);
      const menu = page.getByRole("navigation", { name: "Main navigation" });
      for (const name of ["Checker", "Issue reference", "Guides", "Sample report"]) {
        assert.equal(await menu.getByRole("link", { name, exact: true }).isVisible(), true, `${path} at ${width}: ${name}`);
      }
      assert.equal(await page.getByRole("link", { name: /Source code/ }).count(), 0);
      assert.equal(await page.locator("main *").evaluateAll(elements => elements.every(element => {
        if (!element.getClientRects().length || element.closest(".pw-sr-only,.pw-skip")) return true;
        const rect = element.getBoundingClientRect();
        return rect.left >= -1 && rect.right <= innerWidth + 1;
      })), true, `${path} at ${width}: visible content stays within viewport`);
    }
  }
  // Exercise every main-menu destination with real clicks at mobile and desktop.
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [name, path] of [["Guides", "/guides"], ["Sample report", "/sample-report"], ["Issue reference", "/merchant-center-issues"], ["Checker", "/"]]) {
      await nav.getByRole("link", { name, exact: true }).click();
      await page.waitForURL(`http://127.0.0.1:4175${path}`);
      await nav.locator(`a[href="${path}"][aria-current="page"]`).waitFor();
      assert.equal(await nav.getByRole("link", { name, exact: true }).getAttribute("aria-current"), "page");
      await page.waitForFunction(() => document.activeElement?.matches("main h1"));
      assert.equal(await page.getByRole("heading", { level: 1 }).evaluate(el => el === document.activeElement), true, await page.evaluate(() => ({url: location.pathname, focus: document.activeElement?.outerHTML.slice(0,200)})));
    }
  }
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await nav.getByRole("link", { name: "Guides", exact: true }).click();
    await page.getByRole("heading", { level: 1, name: "Google Merchant Center issue guides" }).waitFor();
    await page.screenshot({ path: `docs/guides-${width}.png`, fullPage: true });
    for (const path of reviewPaths.filter(path => path.startsWith("/guides/"))) {
      await page.locator(`.guides-index-grid a[href="${path}"]`).click();
      await page.waitForURL(`http://127.0.0.1:4175${path}`);
      await page.getByRole("heading", { name: "Official reference", exact: true }).waitFor();
      await nav.getByRole("link", { name: "Guides", exact: true }).click();
      await page.getByRole("heading", { level: 1, name: "Google Merchant Center issue guides" }).waitFor();
    }
    for (const name of ["Privacy", "Terms"]) {
      await page.getByRole("contentinfo").getByRole("link", { name, exact: true }).click();
      await page.waitForURL(`**/${name.toLowerCase()}`);
      await page.getByRole("heading", { level: 1 }).waitFor();
    }
  }
  await page.goto("http://127.0.0.1:4175/#order");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Email copied." }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "flankero4697@gmail.com");
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error("denied"); }; });
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Copy manually:" }).waitFor();
  assert.equal(await page.getByLabel("Issue details", { exact: true }).getAttribute("maxlength"), "2000");
  await page.screenshot({ path: "docs/contact-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/privacy", "/terms", "/merchant-center-diagnostic-report"]) {
    await page.goto(`http://127.0.0.1:4175${path}`);
    assert.doesNotMatch(await page.locator("main:visible").innerText(), /Express Report|Store Audit|Pre-Appeal|\$29|\$79|\$149/);
    await page.screenshot({ path: `docs/reference${path.replaceAll("/", "-")}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  console.log(
    "Browser smoke passed: sample and uploaded CSV, repeated upload, malformed and oversized input, markup validation, mode persistence, keyboard activation, mobile overflow, existing routes and 404, shared menus, all six guide links, footer links, route focus and retained analysis; no runtime errors.",
  );
} finally {
  await browser?.close();
  server.kill();
}
