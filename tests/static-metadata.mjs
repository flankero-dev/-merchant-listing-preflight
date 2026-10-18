import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { knownPaths, getSeoData, SITE_URL } from "../src/seo.ts";
assert.equal(knownPaths.length, 13);
for (const path of knownPaths) {
  const html = await readFile(
    path === "/" ? "dist/index.html" : `dist${path}.html`,
    "utf8",
  );
  assert.ok(html.includes(getSeoData(path).title));
  assert.ok(html.includes(`href="${SITE_URL}${path}"`));
  assert.ok(html.includes('property="og:image"'));
  assert.equal((html.match(/<title>/g) || []).length, 1);
  assert.ok(html.includes("index, follow"));
}
assert.ok(
  (await readFile("dist/404.html", "utf8")).includes("noindex, follow"),
);
const redirects = await readFile("dist/_redirects", "utf8");
assert.ok(!redirects.includes("/*"));
assert.equal(redirects.trim().split("\n").length, 4);
const sitemap = await readFile("dist/sitemap.xml", "utf8");
for (const path of knownPaths) assert.ok(sitemap.includes(SITE_URL + path));
console.log(
  "M20 raw HTML metadata passed: 13 routes, social image, sitemap, four legacy redirects, noindex 404",
);
