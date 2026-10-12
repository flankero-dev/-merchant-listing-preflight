import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getGuideBySlug } from "../guideData";

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

function upsertMetaByName(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
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

function SEOHead() {
  const location = useLocation();

  useEffect(() => {
    const cleanPath =
      location.pathname === "/" ? "/" : location.pathname.replace(/\/$/, "");

    const canonicalUrl = `${SITE_URL}${cleanPath}`;
    const seo = getSeoData(cleanPath);

    document.title = seo.title;

    upsertMetaByName("description", seo.description);

    upsertMetaByName(
      "robots",
      isKnownPath(cleanPath) ? "index, follow" : "noindex, follow",
    );

    upsertLink("canonical", canonicalUrl);

    upsertMetaByProperty("og:type", "website");
    upsertMetaByProperty("og:site_name", SITE_NAME);
    upsertMetaByProperty("og:title", seo.title);
    upsertMetaByProperty("og:description", seo.description);
    upsertMetaByProperty("og:url", canonicalUrl);

    upsertMetaByName("twitter:card", "summary");
    upsertMetaByName("twitter:title", seo.title);
    upsertMetaByName("twitter:description", seo.description);
  }, [location.pathname]);

  return null;
}

export default SEOHead;
