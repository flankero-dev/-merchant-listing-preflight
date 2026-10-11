import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSchemaInput } from "../src/lib/schemaAnalysis.ts";

const product = (overrides = {}) => ({
  "@type": "Product", name: "Example", offers: {
    "@type": "Offer", price: "79.99", priceCurrency: "USD",
    availability: "https://schema.org/InStock", ...overrides,
  },
});
const analyze = (value) => analyzeSchemaInput(JSON.stringify(value));
const status = (result, label) => result.checks.find((check) => check.label === label).status;

test("HTML attributes accept whitespace around equals and either attribute order", () => {
  const result = analyzeSchemaInput(`<link href = 'https://example.com/product' rel = 'canonical'>
    <link hreflang = 'en' href = 'https://example.com/product' rel = 'alternate'>
    <script\n type = 'application/ld+json'>${JSON.stringify(product())}</script >`);
  assert.equal(result.blocks, 1);
  assert.equal(result.productFound, true);
  assert.equal(result.offerFound, true);
  for (const label of ["Price", "Currency", "Availability", "Canonical URL", "Hreflang"])
    assert.equal(status(result, label), "pass");
});

test("data-type and noncanonical rel do not masquerade as HTML metadata", () => {
  const result = analyzeSchemaInput(`<link rel='noncanonical' href='https://example.com'>
    <script data-type='application/ld+json'>${JSON.stringify(product())}</script>`);
  assert.equal(result.blocks, 0);
  assert.equal(status(result, "Canonical URL"), "warn");
});

test("recognizes typed product offers and valid basic values", () => {
  const result = analyze(product());
  for (const label of ["Product structured data", "Offer object", "Price", "Currency", "Availability"])
    assert.equal(status(result, label), "pass");
});
test("does not mistake a substring for a Product type", () => {
  const result = analyze({ ...product(), "@type": "NotAProduct" });
  assert.equal(result.productFound, false);
  assert.equal(result.offerFound, false);
});
test("supports full schema type URLs and type arrays", () => {
  const result = analyze({ ...product({ "@type": "http://schema.org/Offer" }),
    "@type": ["Thing", "https://schema.org/Product"] });
  assert.equal(result.productFound, true);
  assert.equal(result.offerFound, true);
});
test("requires an Offer type rather than an arbitrary offers object", () => {
  for (const type of ["NotAnOffer", undefined])
    assert.equal(analyze(product({ "@type": type })).offerFound, false);
});
test("does not attach an unrelated graph offer to a product", () => {
  const result = analyze({ "@graph": [{ "@type": "Product", name: "No offers" }, product().offers] });
  assert.equal(result.productFound, true);
  assert.equal(result.offerFound, false);
});
test("finds a typed offer among multiple product offers", () => {
  const result = analyze({ "@graph": [{ ...product(), offers: [{ "@type": "Other" }, product().offers] }] });
  assert.equal(result.offerFound, true);
});
test("rejects invalid prices while allowing zero and decimal amounts", () => {
  for (const price of ["abc", "-1", "Infinity", true, {}, "1,99"])
    assert.equal(status(analyze(product({ price })), "Price"), "fail", String(price));
  for (const price of [0, "0", "1.99", 79.99])
    assert.equal(status(analyze(product({ price })), "Price"), "pass", String(price));
});
test("rejects unknown currency and arbitrary availability values", () => {
  const result = analyze(product({ priceCurrency: "XYZ", availability: "nonsense" }));
  assert.equal(status(result, "Currency"), "fail");
  assert.equal(status(result, "Availability"), "fail");
  assert.equal(status(analyze(product({ availability: undefined })), "Availability"), "warn");
});
test("handles malformed JSON and retains HTML metadata checks", () => {
  assert.equal(analyzeSchemaInput('{broken').errors.length, 1);
  const result = analyzeSchemaInput(`<script type="application/ld+json">${JSON.stringify(product())}</script><link rel="canonical" href="https://example.com/product" />`);
  assert.equal(status(result, "Canonical URL"), "pass");
});
