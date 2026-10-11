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
    title: "Merchant Listing Preflight — Google Merchant Center Issue Checker",
    description:
      "Inspect product CSV exports and Product / Offer JSON-LD locally. Group recorded issues and review basic markup checks without connecting an account.",
  },
  "/merchant-center-issues": {
    title:
      "Google Merchant Center Issues Checklist — Merchant Listing Preflight",
    description:
      "Checklist for common Google Merchant Center issues including mismatched product price, availability, domains, landing pages and Product / Offer structured data.",
  },
  "/affected-products-csv-checker": {
    title: "Affected Products CSV Checker — Google Merchant Center Preflight",
    description:
      "Free preflight checklist for Google Merchant Center affected-products CSV exports. Group issues, detect columns and prepare product disapproval diagnosis.",
  },
  "/google-merchant-center-review-checklist": {
    title:
      "Google Merchant Center Review Checklist — Merchant Listing Preflight",
    description:
      "Checklist before requesting another Google Merchant Center review: feed data, landing pages, structured data, policy pages, redirects and product issue readiness.",
  },
  "/merchant-center-diagnostic-report": {
    title:
      "Google Merchant Center Diagnostic Report — Merchant Listing Preflight",
    description:
      "Fixed-scope Google Merchant Center diagnostic reports for product disapprovals, mismatched price, availability, domains, landing pages and structured data issues.",
  },
  "/guides": {
    title: "Merchant Center Issue Guides — Merchant Listing Preflight",
    description:
      "Guides for Google Merchant Center issues including mismatched product price, availability, domains, landing pages and Product / Offer structured data.",
  },
  "/sample-report": {
    title:
      "Sample Merchant Center Diagnostic Report — Merchant Listing Preflight",
    description:
      "View a sample Merchant Listing diagnostic report with issue summary, evidence notes, likely root cause, priority fixes and review preparation.",
  },
  "/terms": {
    title: "Terms of Service — Merchant Listing Preflight",
    description:
      "Terms for Merchant Listing Preflight diagnostic reports and Google Merchant Center issue preparation service.",
  },
  "/privacy": {
    title: "Privacy Policy — Merchant Listing Preflight",
    description:
      "Privacy policy for Merchant Listing Preflight diagnostic report requests and information handling.",
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
      title: "Merchant Listing Preflight",
      description:
        "Google Merchant Center issue checker and diagnostic report service.",
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

