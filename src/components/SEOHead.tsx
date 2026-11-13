import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL, SITE_NAME, isKnownPath, getSeoData } from "../seo";

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

    upsertMetaByProperty("og:image", `${SITE_URL}/social-card.png`);
    upsertMetaByProperty(
      "og:image:alt",
      "Merchant Listing Preflight: local CSV and Product / Offer checks",
    );
    upsertMetaByName("twitter:image", `${SITE_URL}/social-card.png`);
    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", seo.title);
    upsertMetaByName("twitter:description", seo.description);
  }, [location.pathname]);

  return null;
}

export default SEOHead;
