type CheckStatus = "pass" | "warn" | "fail";

type RuleResult = {
  label: string;
  status: CheckStatus;
  detail: string;
};

export type SchemaAnalysis = {
  blocks: number;
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

function extractJsonLdBlocks(input: string): string[] {
  const htmlBlocks = Array.from(
    input.matchAll(
      /<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi,
    ),
  )
    .filter(
      (match) =>
        readAttributes(match[1]).get("type")?.toLowerCase() ===
        "application/ld+json",
    )
    .map((match) => match[2].trim());
  if (htmlBlocks.length > 0) return htmlBlocks;
  const trimmed = input.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[") ? [trimmed] : [];
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
      : `${label} is missing, empty or not an object. Review the applicable requirements.`,
  };
}

export function analyzeSchemaInput(input: string): SchemaAnalysis {
  const trimmed = input.trim();
  const isJson = trimmed.startsWith("{") || trimmed.startsWith("[");
  const html = isJson
    ? ""
    : input.replace(
        /<!--[\s\S]*?-->|<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>[\s\S]*?<\/script\s*>/gi,
        (match) => (match.startsWith("<!--") ? "" : match),
      );
  const blocks = isJson ? [trimmed] : extractJsonLdBlocks(html);
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

  const metadataHtml = html.replace(
    /<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>[\s\S]*?<\/script\s*>/gi,
    "",
  );
  const links = Array.from(
    metadataHtml.matchAll(/<link\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi),
  ).map((match) => readAttributes(match[1]));
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
      label: "Product structured data",
      status: product ? "pass" : "fail",
      detail: product
        ? `Product found: ${safeString(product.name) || "name not provided"}`
        : "No Product object found in JSON-LD.",
    },
    {
      label: "Offer object",
      status: offer ? "pass" : "fail",
      detail: offer
        ? "Offer object found."
        : "No Offer object found. Merchant listings usually need offer data.",
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

  if (blocks.length === 0) {
    errors.push("No JSON-LD script block or raw JSON object was found.");
  }

  return {
    blocks: blocks.length,
    productFound: Boolean(product),
    offerFound: Boolean(offer),
    checks,
    errors,
  };
}
