type CheckStatus = "pass" | "warn" | "fail";

type RuleResult = {
  label: string;
  status: CheckStatus;
  detail: string;
};

export type SchemaAnalysis = {
  blocks: number;
  parsedBlocks: number;
  failedBlocks: number;
  coverage: "complete" | "partial" | "unavailable";
  productChecksPerformed: boolean;
  productFound: boolean;
  offerFound: boolean;
  checks: RuleResult[];
  errors: string[];
};

type JsonMap = Record<string, unknown>;

function isRecord(value: unknown): value is JsonMap {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function typeIncludes(node: JsonMap | undefined, expected: string): boolean {
  if (!node) return false;
  const values = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
  return values.some(
    (value) =>
      typeof value === "string" &&
      (value === expected ||
        value === `https://schema.org/${expected}` ||
        value === `http://schema.org/${expected}`),
  );
}

function collectNodes(value: unknown): JsonMap[] {
  const nodes: JsonMap[] = [];

  function walk(input: unknown) {
    if (Array.isArray(input)) {
      input.forEach(walk);
      return;
    }

    if (!isRecord(input)) {
      return;
    }

    nodes.push(input);

    Object.values(input).forEach((child) => {
      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (isRecord(child)) {
        walk(child);
      }
    });
  }

  walk(value);
  return nodes;
}

function firstObject(value: unknown): JsonMap | undefined {
  if (Array.isArray(value)) {
    return value.find(isRecord);
  }

  if (isRecord(value)) {
    return value;
  }

  return undefined;
}

function safeString(value: unknown): string {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "";
}

// Read complete attribute tokens so data-type and text inside other values
// cannot be mistaken for the actual type/rel/href attributes.
function readAttributes(source: string): Map<string, string> {
  const attributes = new Map<string, string>();
  for (const match of source.matchAll(
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
  )) {
    const name = match[1].toLowerCase();
    if (!attributes.has(name))
      attributes.set(name, match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

// Consume whole tags, including quoted attributes, before looking for scripts.
// Raw-text and inert containers must not turn HTML-looking strings into data.
function inspectHtml(input: string): {
  blocks: string[];
  links: Map<string, string>[];
} {
  const blocks: string[] = [];
  const links: Map<string, string>[] = [];
  const tags = /<\/?([a-z][a-z\d:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  let templateDepth = 0;
  let cursor = 0;
  while (cursor < input.length) {
    const start = input.indexOf("<", cursor);
    if (start === -1) break;
    if (input.startsWith("<!--", start)) {
      const end = input.indexOf("-->", start + 4);
      if (end === -1) break;
      cursor = end + 3;
      continue;
    }
    tags.lastIndex = start;
    const match = tags.exec(input);
    if (!match || match.index !== start) {
      // An unfinished ordinary tag cannot prove that later attribute text
      // contains an active script. Declarations and literal '<' are skipped.
      if (/^<\/?[a-z]/i.test(input.slice(start, start + 3))) break;
      cursor = start + 1;
      continue;
    }
    cursor = tags.lastIndex;
    const name = match[1].toLowerCase();
    const closing = match[0].startsWith("</");
    if (name === "template") {
      templateDepth = Math.max(0, templateDepth + (closing ? -1 : 1));
      continue;
    }
    if (closing) continue;
    if (name === "plaintext") break;
    if (
      [
        "script",
        "style",
        "textarea",
        "title",
        "xmp",
        "iframe",
        "noembed",
        "noframes",
        "noscript",
      ].includes(name)
    ) {
      const close = new RegExp(`</${name}\\s*>`, "gi");
      close.lastIndex = cursor;
      const ending = close.exec(input);
      const bodyEnd = ending?.index ?? input.length;
      const attributes = readAttributes(match[2]);
      if (
        name === "script" &&
        templateDepth === 0 &&
        attributes.get("type")?.trim().toLowerCase() === "application/ld+json"
      ) {
        blocks.push(input.slice(cursor, bodyEnd).trim());
      }
      cursor = ending ? close.lastIndex : input.length;
      continue;
    }
    if (name === "link" && templateDepth === 0)
      links.push(readAttributes(match[2]));
  }
  return { blocks, links };
}

function canonicalCheck(href: string | undefined): RuleResult {
  if (!href)
    return {
      label: "Canonical URL",
      status: "warn",
      detail: "No canonical link found in pasted HTML.",
    };
  try {
    const url = new URL(href);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname)
      throw new Error("Invalid protocol");
    return {
      label: "Canonical URL",
      status: "pass",
      detail: `HTTP(S) canonical URL detected: ${href}. Destination has not been fetched.`,
    };
  } catch {
    const relative = !/^[a-z][a-z\d+.-]*:/i.test(href) && !/\s/.test(href);
    return {
      label: "Canonical URL",
      status: relative ? "warn" : "fail",
      detail: relative
        ? "Relative canonical URL detected. A page URL is needed to resolve it."
        : "Canonical must be a valid HTTP(S) URL.",
    };
  }
}

function optionalPolicy(label: string, value: unknown): RuleResult {
  const objects = Array.isArray(value) ? value : [value];
  const present = objects.some(
    (item) => isRecord(item) && Object.keys(item).length > 0,
  );
  return {
    label,
    status: "warn",
    detail: present
      ? `${label} object detected. Its fields and eligibility have not been validated.`
      : `${label}: missing, empty or not an object. Review the applicable requirements.`,
  };
}

export function analyzeSchemaInput(input: string): SchemaAnalysis {
  const trimmed = input.trim();
  const isJson = trimmed.startsWith("{") || trimmed.startsWith("[");
  const metadata = isJson
    ? { blocks: [trimmed], links: [] }
    : inspectHtml(input);
  const blocks = metadata.blocks;
  const errors: string[] = [];
  const parsed: unknown[] = [];

  blocks.forEach((block, index) => {
    try {
      parsed.push(JSON.parse(block));
    } catch {
      errors.push(`JSON-LD block #${index + 1} could not be parsed.`);
    }
  });

  const nodes = parsed.flatMap(collectNodes);
  const product = nodes.find((node) => typeIncludes(node, "Product"));
  const productOffers = Array.isArray(product?.offers)
    ? product.offers
    : [product?.offers];
  const offer = productOffers.find(
    (value): value is JsonMap =>
      isRecord(value) && typeIncludes(value, "Offer"),
  );

  const priceSpecification = firstObject(offer?.priceSpecification);
  const price =
    safeString(offer?.price) || safeString(priceSpecification?.price);
  const currency =
    safeString(offer?.priceCurrency) ||
    safeString(priceSpecification?.priceCurrency);
  const availability = safeString(offer?.availability);
  const validPrice =
    /^\d+(?:\.\d+)?$/.test(price) && Number.isFinite(Number(price));
  const validCurrency = Intl.supportedValuesOf("currency").includes(currency);
  const availabilityName = availability.replace(
    /^https?:\/\/schema\.org\//,
    "",
  );
  const validAvailability = [
    "BackOrder",
    "Discontinued",
    "InStock",
    "InStoreOnly",
    "LimitedAvailability",
    "MadeToOrder",
    "OnlineOnly",
    "OutOfStock",
    "PreOrder",
    "PreSale",
    "Reserved",
    "SoldOut",
  ].includes(availabilityName);

  const links = metadata.links;
  const hasRel = (attributes: Map<string, string>, rel: string) =>
    (attributes.get("rel") ?? "").toLowerCase().split(/\s+/).includes(rel);
  const canonicalHref = links
    .find((attributes) => hasRel(attributes, "canonical"))
    ?.get("href")
    ?.trim();
  const hasHreflang = links.some(
    (attributes) =>
      hasRel(attributes, "alternate") &&
      Boolean(attributes.get("hreflang")?.trim()) &&
      Boolean(attributes.get("href")?.trim()),
  );

  const shippingDetails = offer?.shippingDetails ?? product?.shippingDetails;
  const returnPolicy =
    offer?.hasMerchantReturnPolicy ?? product?.hasMerchantReturnPolicy;

  const checks: RuleResult[] = [
    {
      label: "Product type",
      status: product ? "pass" : "fail",
      detail: product
        ? `Product type detected. Name: ${safeString(product.name) || "not provided"}. Other Product fields have not been validated.`
        : "No Product object found in JSON-LD.",
    },
    {
      label: "Nested Offer type",
      status: offer ? "pass" : "fail",
      detail: offer
        ? "Typed Offer detected directly inside Product.offers. The first matching Offer is inspected."
        : "No typed Offer found directly inside the first parsed Product.offers. Merchant listings usually need offer data.",
    },
    {
      label: "Price",
      status: validPrice ? "pass" : "fail",
      detail: price
        ? validPrice
          ? `Price detected: ${price}`
          : `Invalid non-negative decimal price: ${price}`
        : "No price detected inside Offer.",
    },
    {
      label: "Currency",
      status: validCurrency ? "pass" : "fail",
      detail: currency
        ? validCurrency
          ? `Currency code recognized: ${currency}`
          : `Unrecognized currency code: ${currency}`
        : "No priceCurrency detected inside Offer.",
    },
    {
      label: "Availability",
      status: validAvailability ? "pass" : availability ? "fail" : "warn",
      detail: availability
        ? validAvailability
          ? `Availability detected: ${availability}`
          : `Unrecognized availability value: ${availability}`
        : "No availability detected inside Offer.",
    },
    canonicalCheck(canonicalHref),
    {
      label: "Hreflang",
      status: "warn",
      detail: hasHreflang
        ? "Hreflang markup detected. Language tags and destination URLs have not been validated."
        : "No hreflang detected. It may be unnecessary for a one-language store.",
    },
    optionalPolicy("Shipping details", shippingDetails),
    optionalPolicy("Return policy", returnPolicy),
  ];

  const failedBlocks = blocks.length - parsed.length;
  // A Product found in a readable block can be checked. Without one, unreadable
  // blocks prevent any conclusion about missing Product/Offer data in the input.
  const productChecksPerformed =
    parsed.length > 0 && (failedBlocks === 0 || Boolean(product));
  const availableChecks = productChecksPerformed
    ? checks
    : isJson
      ? []
      : checks.filter((check) =>
          ["Canonical URL", "Hreflang"].includes(check.label),
        );

  if (blocks.length === 0) {
    errors.push("No JSON-LD script block or raw JSON object was found.");
  }

  return {
    blocks: blocks.length,
    parsedBlocks: parsed.length,
    failedBlocks,
    coverage:
      parsed.length === 0
        ? "unavailable"
        : failedBlocks > 0
          ? "partial"
          : "complete",
    productChecksPerformed,
    productFound: Boolean(product),
    offerFound: Boolean(offer),
    checks: availableChecks,
    errors,
  };
}
