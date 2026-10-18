import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, firefox, webkit } from "playwright";
const kind = process.env.AUDIT_BROWSER || "chromium";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4176",
    "--strictPort",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
await new Promise((r, j) => {
  const t = setTimeout(() => j(Error("server timeout")), 10000);
  server.stdout.on("data", (d) => {
    if (String(d).includes("4176")) {
      clearTimeout(t);
      r();
    }
  });
});
const browser = await { chromium, firefox, webkit }[kind].launch({
  headless: true,
  ...(kind === "chromium" && process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
const dir = `docs/audit/${process.env.AUDIT_STAGE || "after"}-${kind}`;
await mkdir(dir, { recursive: true });
const results = [];
async function scenario(id, fn, setup) {
  const c = await browser.newContext();
  const p = await c.newPage();
  p.setDefaultTimeout(5000);
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  try {
    if (setup) await setup(p);
    await p.goto("http://127.0.0.1:4176");
    await fn(p);
    assert.deepEqual(errors, []);
    results.push({ id, status: "pass" });
  } catch (e) {
    results.push({ id, status: "fail", error: String(e).slice(0, 2000) });
    await p.screenshot({ path: `${dir}/${id}-failure.png` }).catch(() => {});
  } finally {
    await c.close();
  }
}
try {
  await scenario("M05-browser-entity-oracle", async (p) => {
    const html =
      '<link rel="canon&#105;cal" href="https://example.invalid/?a=1&amp;b=2"><script type="application/ld&#43;json">{"@type":"Product","offers":{"@type":"Offer","price":0,"priceCurrency":"USD"}}</script>';
    const decoded = await p.evaluate((value) => {
      const doc = new DOMParser().parseFromString(value, "text/html");
      return {
        type: doc.querySelector("script").type,
        rel: doc.querySelector("link").rel,
        href: doc.querySelector("link").getAttribute("href"),
      };
    }, html);
    assert.deepEqual(decoded, {
      type: "application/ld+json",
      rel: "canonical",
      href: "https://example.invalid/?a=1&b=2",
    });
    await p
      .getByRole("button", { name: "JSON-LD / HTML", exact: true })
      .click();
    await p.getByLabel("Product JSON-LD or HTML").fill(html);
    await p
      .getByRole("button", { name: "Analyze markup", exact: true })
      .click();
    const result = await p
      .getByRole("region", { name: "Markup analysis results" })
      .innerText();
    assert.match(result, /https:\/\/example.invalid\/\?a=1&b=2/);
    assert.match(result, /1 JSON-LD block found/);
  });
  await scenario("M08-near-byte-limit", async (p) => {
    let csv =
      "ID,Issue,Title\n" +
      Array.from(
        { length: 10000 },
        (_, i) => `${i},Issue ${i},${"a".repeat(170)}`,
      ).join("\n");
    // Exact legal maximum in UTF-8; padding remains inside the final Title.
    csv += "x".repeat(2000000 - Buffer.byteLength(csv));
    assert.equal(Buffer.byteLength(csv), 2000000);
    const start = performance.now();
    await p
      .getByLabel("Affected-products CSV")
      .setInputFiles({
        name: "exact-2mb.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(csv),
      });
    await p.getByRole("region", { name: "CSV analysis results" }).waitFor();
    assert.equal(await p.locator("tbody tr").count(), 50);
    results.push({
      id: "M08-2mb-metric",
      bytes: Buffer.byteLength(csv),
      ms: performance.now() - start,
    });
    await p
      .getByLabel("Affected-products CSV")
      .setInputFiles({
        name: "over-2mb.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(csv + "x"),
      });
    await p.getByRole("alert").waitFor();
    assert.equal(
      await p.getByRole("region", { name: "CSV analysis results" }).count(),
      0,
    );
  });
  await scenario("M08-M09", async (p) => {
    const csv =
      "ID,Issue,Link\n" +
      Array.from(
        { length: 10000 },
        (_, i) => `${i},Issue ${i},https://example.com/${i}`,
      ).join("\n");
    const start = performance.now();
    await p.getByLabel("Affected-products CSV").setInputFiles({
      name: "stress.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv),
    });
    await p.getByRole("region", { name: "CSV analysis results" }).waitFor();
    const n = await p.locator("tbody tr").count();
    results.push({
      id: "M08-metric",
      ms: performance.now() - start,
      rendered: n,
      total: 10000,
    });
    assert.ok(n <= 50);
    await p.getByText("Product examples", { exact: true }).first().click();
    assert.match(
      await p.locator("tbody").innerText(),
      /https:\/\/example.com\/0/,
    );
    await p.getByRole("button", { name: "Next groups" }).click();
    assert.match(await p.locator("tbody").innerText(), /Issue 50/);
  });
  await scenario("N01-status-pagination", async (p) => {
    const csv =
      "ID,Status\n" +
      Array.from({ length: 10000 }, (_, i) => `${i},Status ${i}`).join("\n");
    await p.getByLabel("Affected-products CSV").setInputFiles({
      name: "statuses.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv),
    });
    await p
      .getByRole("heading", { name: "Status groups", exact: true })
      .waitFor();
    assert.equal(
      await p.locator(".pw-results dl").last().locator("dt").count(),
      50,
    );
    await p.getByRole("button", { name: "Next statuses" }).click();
    assert.match(
      await p.locator(".pw-results dl").last().innerText(),
      /Status 50/,
    );
  });
  await scenario("M07", async (p) => {
    await p
      .getByRole("button", { name: "JSON-LD / HTML", exact: true })
      .click();
    await p
      .getByLabel("Product JSON-LD or HTML")
      .fill(
        '<script type="application/ld+json">{broken</script>'.repeat(20000),
      );
    const start = performance.now();
    await p
      .getByRole("button", { name: "Analyze markup", exact: true })
      .click();
    await p.getByRole("region", { name: "Markup analysis results" }).waitFor();
    const n = await p.locator('[role="alert"] p').count();
    results.push({
      id: "M07-metric",
      ms: performance.now() - start,
      paragraphs: n,
    });
    assert.ok(n <= 11);
    assert.match(
      await p
        .getByRole("region", { name: "Markup analysis results" })
        .innerText(),
      /20000 could not be parsed/,
    );
  });
  await scenario(
    "M10",
    async (p) => {
      await p.getByLabel("Affected-products CSV").setInputFiles({
        name: "delayed.csv",
        mimeType: "text/csv",
        buffer: Buffer.from("ID,Issue\n1,slow"),
      });
      await p.getByRole("button", { name: "Load sample CSV" }).click();
      await p.waitForTimeout(300);
      assert.equal(
        await p.getByLabel("Affected-products CSV").inputValue(),
        "",
      );
      assert.match(
        await p
          .getByRole("region", { name: "CSV analysis results" })
          .innerText(),
        /sample-products.csv/,
      );
    },
    async (p) =>
      p.addInitScript(() => {
        const old = File.prototype.text;
        File.prototype.text = async function () {
          await new Promise((r) => setTimeout(r, 200));
          return old.call(this);
        };
      }),
  );
  await scenario("M13", async (p) => {
    await p.getByRole("button", { name: "Load sample CSV" }).click();
    await p.getByRole("button", { name: "Clear results" }).focus();
    await p.keyboard.press("Enter");
    assert.equal(
      await p
        .getByLabel("Affected-products CSV")
        .evaluate((e) => e === document.activeElement),
      true,
    );
  });
  await scenario("M19", async (p) => {
    await p.goto(
      "http://127.0.0.1:4176/guides/how-to-fix-mismatched-product-price",
    );
    const a = p.getByRole("link", { name: /Google: mismatched product price/ });
    assert.equal(await a.getAttribute("target"), "_blank");
    assert.match(await a.getAttribute("rel"), /noopener/);
  });
  await scenario("M22-responsive-inert", async (p) => {
    const traffic = [];
    p.on("request", (r) => {
      if (!r.url().startsWith("http://127.0.0.1:4176")) traffic.push(r.url());
    });
    await p
      .getByRole("button", { name: "JSON-LD / HTML", exact: true })
      .click();
    await p
      .getByLabel("Product JSON-LD or HTML")
      .fill(
        '<img src="https://example.invalid/NOFETCH" onerror="window.__executed=true"><script>window.__executed=true</script><script type="application/ld+json">{"@type":"Product","name":"<img onerror=alert(1)>"}</script>',
      );
    await p
      .getByRole("button", { name: "Analyze markup", exact: true })
      .click();
    assert.equal(await p.evaluate(() => window.__executed), undefined);
    assert.deepEqual(traffic, []);
    for (const width of [320, 360, 390, 639, 640, 768, 1024, 1440, 1920]) {
      await p.setViewportSize({ width, height: 900 });
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      await p.screenshot({ path: `${dir}/markup-${width}.png` });
    }
  });
} finally {
  await writeFile(
    `${dir}/results.json`,
    JSON.stringify(
      { browser: kind, version: browser.version(), results },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results));
  await browser.close();
  server.kill();
}
if (results.some((r) => r.status === "fail")) process.exitCode = 1;
