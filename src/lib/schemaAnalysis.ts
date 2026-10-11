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
  return values.some((value) => typeof value === "string" &&
    (value === expected || value === `https://schema.org/${expected}` || value === `http://schema.org/${expected}`));
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

function extractJsonLdBlocks(input: string): string[] {
  const htmlBlocks = Array.from(
    input.matchAll(
      /<script\b[^>]*\stype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi,
    ),
  ).map((match) => match[1].trim());

  if (htmlBlocks.length > 0) {
    return htmlBlocks;
  }

  const trimmed = input.trim();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return [trimmed];
  }

  return [];
}

export function analyzeSchemaInput(input: string): SchemaAnalysis {
  const blocks = extractJsonLdBlocks(input);
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
  const productOffers = Array.isArray(product?.offers) ? product.offers : [product?.offers];
  const offer = productOffers.find((value): value is JsonMap =>
    isRecord(value) && typeIncludes(value, "Offer")
  );

  const priceSpecification = firstObject(offer?.priceSpecification);
  const price =
    safeString(offer?.price) || safeString(priceSpecification?.price);
  const currency =
    safeString(offer?.priceCurrency) ||
    safeString(priceSpecification?.priceCurrency);
  const availability = safeString(offer?.availability);
  const validPrice = /^\d+(?:\.\d+)?$/.test(price) && Number.isFinite(Number(price));
  const validCurrency = Intl.supportedValuesOf("currency").includes(currency);
  const availabilityName = availability.replace(/^https?:\/\/schema\.org\//, "");
  const validAvailability = ["BackOrder", "Discontinued", "InStock", "InStoreOnly",
    "LimitedAvailability", "MadeToOrder", "OnlineOnly", "OutOfStock", "PreOrder",
    "PreSale", "Reserved", "SoldOut"].includes(availabilityName);

  const canonicalMatch = input.match(
    /<link\b[^>]*\srel\s*=\s*["']\s*(?:[^"']*\s)?canonical(?:\s[^"']*)?["'][^>]*>/i,
  );
  const canonicalHref = canonicalMatch?.[0].match(
    /\shref\s*=\s*["']([^"']+)["']/i,
  )?.[1];

  const hasHreflang =
    /<link[^>]+rel\s*=\s*["'][^"']*alternate[^"']*["'][^>]*hreflang\s*=\s*["'][^"']+["'][^>]*>/i.test(
      input,
    ) || /hreflang\s*=\s*["'][^"']+["']/i.test(input);

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
        ? validPrice ? `Price detected: ${price}` : `Invalid non-negative decimal price: ${price}`
        : "No price detected inside Offer.",
    },
    {
      label: "Currency",
      status: validCurrency ? "pass" : "fail",
      detail: currency
        ? validCurrency ? `Currency code recognized: ${currency}` : `Unrecognized currency code: ${currency}`
        : "No priceCurrency detected inside Offer.",
    },
    {
      label: "Availability",
      status: validAvailability ? "pass" : availability ? "fail" : "warn",
      detail: availability
        ? validAvailability ? `Availability detected: ${availability}` : `Unrecognized availability value: ${availability}`
        : "No availability detected inside Offer.",
    },
    {
      label: "Canonical URL",
      status: canonicalHref ? "pass" : "warn",
      detail: canonicalHref
        ? `Canonical found: ${canonicalHref}`
        : "No canonical link found in pasted HTML.",
    },
    {
      label: "Hreflang",
      status: hasHreflang ? "pass" : "warn",
      detail: hasHreflang
        ? "Hreflang markup found."
        : "No hreflang found. This is fine for one-language stores, but risky for multilingual stores.",
    },
    {
      label: "Shipping details",
      status: shippingDetails ? "pass" : "warn",
      detail: shippingDetails
        ? "Shipping details found in structured data."
        : "No shippingDetails found. Add later for stronger merchant listing readiness.",
    },
    {
      label: "Return policy",
      status: returnPolicy ? "pass" : "warn",
      detail: returnPolicy
        ? "Return policy found in structured data."
        : "No hasMerchantReturnPolicy found. Add later for stronger trust signals.",
    },
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


