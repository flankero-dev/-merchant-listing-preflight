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
  assert.deepEqual(errors, []);
  console.log(
    "Browser smoke passed: sample and uploaded CSV, repeated upload, malformed and oversized input, markup validation, mode persistence, keyboard activation, mobile overflow, existing routes and 404; no runtime errors.",
  );
} finally {
  await browser?.close();
  server.kill();
}
