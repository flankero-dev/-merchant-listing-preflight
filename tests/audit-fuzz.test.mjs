import test from "node:test";
import assert from "node:assert/strict";
import { analyzeCsvText } from "../src/lib/csvAnalysis.ts";
import { analyzeSchemaInput } from "../src/lib/schemaAnalysis.ts";
let seed = 0x20261018;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
};
function minimize(value, fails) {
  let result = value;
  for (
    let n = 0, step = Math.floor(result.length / 2);
    step > 0 && n < 64;
    step = Math.floor(step / 2)
  ) {
    for (let i = 0; i < result.length && n < 64; i += step, n++) {
      const c = result.slice(0, i) + result.slice(i + step);
      if (fails(c)) result = c;
    }
  }
  return result;
}
const quote = (v) => '"' + v.replaceAll('"', '""') + '"';
test(
  "M12/M22 seeded CSV roundtrip, malformed markup and prototype keys (400 bounded cases)",
  { timeout: 8000 },
  () => {
    const start = performance.now();
    for (let i = 0; i < 400; i++) {
      const value = Array.from(
        { length: 1 + (random() % 60) },
        () => ["A", "界", "😀", '"', ",", "\n", " ", "<", "&"][random() % 9],
      ).join("");
      const csv =
        "ID,Title,Issue,__proto__,constructor\n1," +
        quote(value) +
        ",Warning,safe,safe";
      const result = analyzeCsvText(csv);
      const fails = (v) => {
        const r = analyzeCsvText(v);
        return (
          r.status !== "success" || r.issueGroups[0]?.sample[0].Title !== value
        );
      };
      if (fails(csv))
        assert.fail("seed 0x20261018 minimal: " + minimize(csv, fails));
      assert.equal(result.issueGroups[0].sample[0].__proto__, "safe");
      assert.equal(Object.prototype.safe, undefined);
      const r = analyzeSchemaInput(
        "<".repeat(random() % 1200) +
          '<script type="application/ld+json">' +
          JSON.stringify({
            "@context": { fake: { "@type": "Product" } },
            "@type": "Product",
            name: value,
            offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
          }) +
          "</script>",
      );
      assert.equal(r.productFound, true);
      assert.equal(r.failedBlocks, 0);
      assert.equal(analyzeSchemaInput("{" + value).coverage, "unavailable");
    }
    assert.ok(performance.now() - start < 7000);
  },
);
test("M01/M04/M16 pairwise unknown issue header, status, URL order, context and price conflict", () => {
  for (const header of ["Issues count", "Issue status", "Diagnostic issue"])
    for (const swap of [true, false]) {
      const cols = [header, "Status", "Image link", "Landing URL"];
      const vals = [
        "2",
        "Pending",
        "https://example.invalid/image",
        "https://example.invalid/product",
      ];
      if (swap) {
        cols.reverse();
        vals.reverse();
      }
      const r = analyzeCsvText(cols.join(",") + "\n" + vals.join(","));
      assert.equal(r.status, "success");
      assert.equal(r.detectedColumns.link, "Landing URL");
      assert.equal(
        Boolean(r.detectedColumns.issue),
        header === "Diagnostic issue",
      );
    }
  for (const contextFirst of [true, false]) {
    const product = {
      "@type": "Product",
      offers: [
        {
          "@type": "Offer",
          price: 80,
          priceSpecification: { price: 10, priceCurrency: "EUR" },
        },
        { "@type": "Offer", price: 5, priceCurrency: "USD" },
      ],
    };
    const context = { "@context": { fake: { "@type": "Product" } } };
    const r = analyzeSchemaInput(
      JSON.stringify(
        contextFirst ? { ...context, ...product } : { ...product, ...context },
      ),
    );
    assert.ok(
      r.checks.some((c) => c.label === "Price sources" && c.status === "warn"),
    );
    assert.match(r.checks.find((c) => c.label === "Price").detail, /80/);
  }
});
