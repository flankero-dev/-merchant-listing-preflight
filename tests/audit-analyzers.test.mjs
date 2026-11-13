import test from "node:test";
import assert from "node:assert/strict";
import { analyzeCsvText } from "../src/lib/csvAnalysis.ts";
import { analyzeSchemaInput } from "../src/lib/schemaAnalysis.ts";
const product = {
  "@type": "Product",
  name: "Synthetic",
  offers: {
    "@type": "Offer",
    price: "80",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};
const script = (body) => `<script type="application/ld+json">${body}</script>`;
test("M01 quantity and image labels do not hijack issue or product URL", () => {
  for (const csv of [
    "Issues count,Status,Main image link,Landing URL\n0,Disapproved,https://img.test/a,https://shop.test/p",
    "Landing URL,Main image link,Status,Issues count\nhttps://shop.test/p,https://img.test/a,Disapproved,0",
  ]) {
    const r = analyzeCsvText(csv);
    assert.equal(r.status, "success");
    assert.equal(r.detectedColumns.issue, undefined);
    assert.equal(r.detectedColumns.link, "Landing URL");
    assert.equal(r.rowClassification.statusOnly, 1);
    assert.deepEqual(r.topUrls, ["https://shop.test/p"]);
  }
});
test("M02 duplicate-last and 50000 unique headers remain bounded", () => {
  const cols = Array.from({ length: 50000 }, (_, i) => `column${i}`);
  const start = performance.now();
  assert.equal(
    analyzeCsvText(cols.join(",") + "\n" + cols.map(() => 1).join(",")).status,
    "success",
  );
  assert.ok(performance.now() - start < 1200);
  assert.equal(analyzeCsvText([...cols, cols[0]].join(",")).status, "error");
});
test("M04 context definitions are not Product instances; key order irrelevant", () => {
  const context = {
    priceTag: {
      "@id": "https://example.com/p",
      "@type": "https://schema.org/Product",
    },
  };
  assert.equal(
    analyzeSchemaInput(
      JSON.stringify({ "@context": context, "@type": "Thing" }),
    ).productFound,
    false,
  );
  for (const v of [
    { "@context": context, "@graph": [product] },
    { "@graph": [product], "@context": context },
  ])
    assert.equal(analyzeSchemaInput(JSON.stringify(v)).offerFound, true);
});
test("M03 malformed less-than runs have bounded token search", () => {
  const start = performance.now();
  for (const size of [4000, 8000, 16000, 32000, 64000, 100000, 1900000]) {
    const r = analyzeSchemaInput(
      "<".repeat(size) + script(JSON.stringify(product)),
    );
    assert.equal(r.offerFound, true);
  }
  assert.ok(performance.now() - start < 4000);
});
test("M05 entity-encoded attributes match browser interpretation", () => {
  const r = analyzeSchemaInput(
    `<link rel="canon&#105;cal" href="https://example.com/?a=1&amp;b=2"><script type="application/ld&#43;json">${JSON.stringify(product)}</script>`,
  );
  assert.equal(r.offerFound, true);
  assert.match(
    r.checks.find((c) => c.label === "Canonical URL").detail,
    /a=1&b=2/,
  );
});
test("M06 deeply nested valid JSON is traversed without recursion overflow", () => {
  const r = analyzeSchemaInput(
    "[".repeat(12000) + JSON.stringify(product) + "]".repeat(12000),
  );
  assert.equal(r.offerFound, true);
});
test("M07 malformed blocks have bounded examples and accurate totals", () => {
  const r = analyzeSchemaInput(script("{broken").repeat(20000));
  assert.equal(r.failedBlocks, 20000);
  assert.equal(r.coverage, "unavailable");
  assert.ok(r.errors.length <= 10);
});
test("M11 replacement glyph suggests UTF8 re-export without claiming other encoding support", () => {
  const r = analyzeCsvText("ID,Issue\n1,\ufffd");
  assert.equal(r.status, "success");
  assert.ok(r.warnings.some((x) => /UTF-8/.test(x)));
});
test("M12 empty header is not silently replaced by first product row", () =>
  assert.equal(analyzeCsvText(",\n1,problem").status, "error"));
test("M12 whitespace before quoted field is preserved", () => {
  const r = analyzeCsvText('ID,Issue,Title\n1,warning,  "A"');
  assert.equal(r.issueGroups[0].sample[0].Title, "  A");
});
test("M16 mixed price sources are identified without false Google verdict", () => {
  const p = structuredClone(product);
  delete p.offers.priceCurrency;
  p.offers.priceSpecification = { price: "10", priceCurrency: "EUR" };
  const r = analyzeSchemaInput(JSON.stringify(p));
  assert.ok(
    r.checks.some(
      (x) =>
        x.status === "warn" &&
        /consisten|differ|conflict|sources/i.test(x.detail),
    ),
  );
});
test("M18 MIME parameters, inert contexts and literal markup stay bounded", () => {
  const html = `<template>${script(JSON.stringify(product))}</template><script type="application/ld+json;profile=x">${JSON.stringify(product)}</script>`;
  assert.equal(analyzeSchemaInput(html).blocks, 1);
});

test("N02 unknown HTML entity names never resolve through Object.prototype", () => {
  const r = analyzeSchemaInput(
    '<link rel="canonical" href="https://example.com/?x=&constructor;">',
  );
  assert.match(
    r.checks.find((c) => c.label === "Canonical URL").detail,
    /&constructor;/,
  );
  assert.doesNotMatch(
    r.checks.find((c) => c.label === "Canonical URL").detail,
    /function Object/,
  );
});
