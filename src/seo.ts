import { getGuideBySlug, guidePages } from "./guideData.ts";

const SITE_URL = "https://merchant-listing-preflight.pages.dev";
const SITE_NAME = "Merchant Listing Preflight";

type SeoData = {
  title: string;
  description: string;
};

const seoByPath: Record<string, SeoData> = {
  "/": {
    title: "Merchant Listing Preflight — Product-data Checker",
    description:
      "Inspect product CSV exports and Product / Offer JSON-LD locally. Group recorded issues and review basic markup checks without connecting an account.",
  },
  "/affected-products-csv-checker": {
    title: "Affected Products CSV Checker — Google Merchant Center Preflight",
    description:
      "Input and result guide for the local CSV checker: supported columns, recorded issue groups, warnings and file limits.",
  },
  "/merchant-center-diagnostic-report": {
    title: "Product-data Evidence Checklist — Merchant Preflight",
    description:
      "Instructions for collecting product-data evidence in your own notes: source values, hypotheses, changes and verification.",
  },
  "/guides": {
    title: "Issue guides — Merchant Preflight",
    description:
      "Guides for Google Merchant Center issues including mismatched product price, availability, domains, landing pages and Product / Offer structured data.",
  },
  "/sample-report": {
    title: "Price mismatch example — Merchant Preflight",
    description:
      "Compare sample CSV and JSON-LD prices with an illustrative product-page value, then identify the source that needs correction.",
  },
  "/terms": {
    title: "Usage and Limits — Merchant Preflight",
    description:
      "Supported inputs, local analysis boundaries, fictional examples and optional email contact.",
  },
  "/privacy": {
    title: "Privacy and Data — Merchant Preflight",
    description:
      "How checker inputs are processed locally and email contact is handled.",
  },
};

function isKnownPath(pathname: string): boolean {
  if (seoByPath[pathname]) {
    return true;
  }

  if (pathname.startsWith("/guides/")) {
    const slug = pathname.replace("/guides/", "");
    return Boolean(getGuideBySlug(slug));
  }

  return false;
}

function getSeoData(pathname: string): SeoData {
  if (pathname.startsWith("/guides/")) {
    const slug = pathname.replace("/guides/", "");
    const guide = getGuideBySlug(slug);

    if (guide) {
      return {
        title: guide.metaTitle,
        description: guide.metaDescription,
      };
    }
  }

  return (
    seoByPath[pathname] ?? {
      title: "Page not found — Merchant Listing Preflight",
      description:
        "This page is unavailable. Open the product-data checker or choose a guide from the index.",
    }
  );
}

export const knownPaths = [
  ...Object.keys(seoByPath),
  ...guidePages.map((guide) => `/guides/${guide.slug}`),
];
export { SITE_URL, SITE_NAME, isKnownPath, getSeoData };
