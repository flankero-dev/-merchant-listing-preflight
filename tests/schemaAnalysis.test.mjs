import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSchemaInput } from "../src/lib/schemaAnalysis.ts";

const product = (overrides = {}) => ({
  "@type": "Product",
  name: "Example",
  offers: {
    "@type": "Offer",
    price: "79.99",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    ...overrides,
  },
});
const analyze = (value) => analyzeSchemaInput(JSON.stringify(value));
const status = (result, label) =>
  result.checks.find((check) => check.label === label).status;

test("HTML attributes accept whitespace around equals and either attribute order", () => {
  const result =
    analyzeSchemaInput(`<link href = 'https://example.com/product' rel = 'canonical'>
    <link hreflang = 'en' href = 'https://example.com/product' rel = 'alternate'>
    <script\n type = 'application/ld+json'>${JSON.stringify(product())}</script >`);
  assert.equal(result.blocks, 1);
  assert.equal(result.productFound, true);
  assert.equal(result.offerFound, true);
  for (const label of ["Price", "Currency", "Availability", "Canonical URL"])
    assert.equal(status(result, label), "pass");
});

test("data-type and noncanonical rel do not masquerade as HTML metadata", () => {
  const result =
    analyzeSchemaInput(`<link rel='noncanonical' href='https://example.com'>
    <script data-type='application/ld+json'>${JSON.stringify(product())}</script>`);
  assert.equal(result.blocks, 0);
  assert.equal(status(result, "Canonical URL"), "warn");
});

test("recognizes typed product offers and valid basic values", () => {
  const result = analyze(product());
  for (const label of [
    "Product type",
    "Nested Offer type",
    "Price",
    "Currency",
    "Availability",
  ])
    assert.equal(status(result, label), "pass");
});
test("does not mistake a substring for a Product type", () => {
  const result = analyze({ ...product(), "@type": "NotAProduct" });
  assert.equal(result.productFound, false);
  assert.equal(result.offerFound, false);
});
test("supports full schema type URLs and type arrays", () => {
  const result = analyze({
    ...product({ "@type": "http://schema.org/Offer" }),
    "@type": ["Thing", "https://schema.org/Product"],
  });
  assert.equal(result.productFound, true);
  assert.equal(result.offerFound, true);
});
test("requires an Offer type rather than an arbitrary offers object", () => {
  for (const type of ["NotAnOffer", undefined])
    assert.equal(analyze(product({ "@type": type })).offerFound, false);
});
test("does not attach an unrelated graph offer to a product", () => {
  const result = analyze({
    "@graph": [{ "@type": "Product", name: "No offers" }, product().offers],
  });
  assert.equal(result.productFound, true);
  assert.equal(result.offerFound, false);
});
test("finds a typed offer among multiple product offers", () => {
  const result = analyze({
    "@graph": [
      { ...product(), offers: [{ "@type": "Other" }, product().offers] },
    ],
  });
  assert.equal(result.offerFound, true);
});
test("rejects invalid prices while allowing zero and decimal amounts", () => {
  for (const price of ["abc", "-1", "Infinity", true, {}, "1,99"])
    assert.equal(
      status(analyze(product({ price })), "Price"),
      "fail",
      String(price),
    );
  for (const price of [0, "0", "1.99", 79.99])
    assert.equal(
      status(analyze(product({ price })), "Price"),
      "pass",
      String(price),
    );
});
test("rejects unknown currency and arbitrary availability values", () => {
  const result = analyze(
    product({ priceCurrency: "XYZ", availability: "nonsense" }),
  );
  assert.equal(status(result, "Currency"), "fail");
  assert.equal(status(result, "Availability"), "fail");
  assert.equal(
    status(analyze(product({ availability: undefined })), "Availability"),
    "warn",
  );
});
test("handles malformed JSON and retains HTML metadata checks", () => {
  assert.equal(analyzeSchemaInput("{broken").errors.length, 1);
  const result = analyzeSchemaInput(
    `<script type="application/ld+json">${JSON.stringify(product())}</script><link rel="canonical" href="https://example.com/product" />`,
  );
  assert.equal(status(result, "Canonical URL"), "pass");
});

test("unquoted and uppercase HTML attributes are recognized", () => {
  const result =
    analyzeSchemaInput(`<LINK HREF=https://example.com/product REL=canonical>
    <link href=https://example.com/en hreflang=en rel=alternate>
    <script TYPE=application/ld+json>${JSON.stringify(product())}</script>`);
  assert.equal(result.productFound, true);
  assert.equal(status(result, "Canonical URL"), "pass");
  assert.equal(status(result, "Hreflang"), "warn");
});
test("metadata must be real attributes on the relevant elements", () => {
  const result = analyzeSchemaInput(`<div hreflang='en'>Text</div>
    <link rel=canonical data-href='https://example.com'>
    <script data-note=' type=application/ld+json'>${JSON.stringify(product())}</script>`);
  assert.equal(result.blocks, 0);
  assert.equal(status(result, "Canonical URL"), "warn");
  assert.equal(status(result, "Hreflang"), "warn");
});
test("quoted greater-than signs do not truncate script attributes", () => {
  const result = analyzeSchemaInput(
    `<script data-note='a > b' type=application/ld+json>${JSON.stringify(product())}</script>`,
  );
  assert.equal(result.productFound, true);
});

test("commented markup is not active product data or metadata", () => {
  const result = analyzeSchemaInput(
    `<!-- <script type=application/ld+json>${JSON.stringify(product())}</script><link rel=canonical href=https://example.com> -->`,
  );
  assert.equal(result.productFound, false);
  assert.equal(status(result, "Canonical URL"), "warn");
});
test("HTML-like text in raw JSON is not treated as an HTML document", () => {
  const result = analyze({
    ...product(),
    name: "<link rel=canonical href=https://example.com>",
  });
  assert.equal(result.productFound, true);
  assert.equal(status(result, "Canonical URL"), "warn");
});

test("comment-like text inside JSON-LD strings is preserved", () => {
  const result = analyzeSchemaInput(
    `<script type=application/ld+json>${JSON.stringify({ ...product(), name: "A<!--literal-->B" })}</script>`,
  );
  assert.match(result.checks[0].detail, /A<!--literal-->B/);
});

test("canonical distinguishes absolute HTTP URLs, relative references and invalid schemes", () => {
  for (const href of [
    "javascript:alert(1)",
    "ftp://example.com",
    "https://",
    "bad url",
  ])
    assert.equal(
      status(
        analyzeSchemaInput(`<link rel="canonical" href="${href}">`),
        "Canonical URL",
      ),
      "fail",
    );
  for (const href of ["/products/cup", "../cup"])
    assert.equal(
      status(
        analyzeSchemaInput(`<link rel="canonical" href="${href}">`),
        "Canonical URL",
      ),
      "warn",
    );
  assert.match(
    analyzeSchemaInput(
      '<link rel="canonical" href="https://example.com/cup">',
    ).checks.find((c) => c.label === "Canonical URL").detail,
    /not been fetched/,
  );
});
test("optional policy presence cannot imply validated shipping or returns", () => {
  for (const value of [
    {},
    true,
    "present",
    [],
    { "@type": "OfferShippingDetails" },
    [{ shippingRate: 0 }],
  ]) {
    const result = analyze(
      product({ shippingDetails: value, hasMerchantReturnPolicy: value }),
    );
    assert.equal(status(result, "Shipping details"), "warn");
    assert.equal(status(result, "Return policy"), "warn");
  }
});

test("attribute strings and inert HTML containers do not create active JSON-LD or metadata", () => {
  const markup = `<script type="application/ld+json">${JSON.stringify(product())}</script><link rel=canonical href=https://example.com>`;
  for (const input of [
    `<div title='${markup}'></div>`,
    ...["textarea", "template", "style", "title", "noscript"].map(
      (tag) => `<${tag}>${markup}</${tag}>`,
    ),
  ]) {
    const result = analyzeSchemaInput(input);
    assert.equal(result.blocks, 0);
    assert.equal(result.productFound, false);
    assert.equal(status(result, "Canonical URL"), "warn");
  }
});
test("real data after an inert block remains discoverable", () => {
  const raw = JSON.stringify(product());
  const result = analyzeSchemaInput(
    `<template><textarea><script type=application/ld+json>${raw}</script></textarea></template><script type=application/ld+json>${raw}</script><link rel=canonical href=https://example.com>`,
  );
  assert.equal(result.blocks, 1);
  assert.equal(result.productFound, true);
  assert.equal(status(result, "Canonical URL"), "pass");
});
test("ordinary script strings cannot contribute metadata and unclosed data scripts are inspected", () => {
  const raw = JSON.stringify(product());
  const result = analyzeSchemaInput(
    `<script>const example='<link rel=canonical href=https://example.com>';</script><script type=application/ld+json>${raw}`,
  );
  assert.equal(result.blocks, 1);
  assert.equal(result.productFound, true);
  assert.equal(status(result, "Canonical URL"), "warn");
});

test("unfinished comments and attributes cannot create phantom markup", () => {
  const markup = `<script type=application/ld+json>${JSON.stringify(product())}</script>`;
  for (const input of [
    `<!--${markup}`,
    `<div title='${markup}`,
    "<!--".repeat(100000) + markup,
  ]) {
    assert.equal(analyzeSchemaInput(input).productFound, false);
  }
});
