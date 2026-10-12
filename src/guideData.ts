export type GuidePageData = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  issueName: string;
  intro: string;
  symptoms: string[];
  causes: string[];
  quickChecks: string[];
  fixSteps: string[];
  reference: {
    title: string;
    href: string;
  };
};
export const guidePages: GuidePageData[] = [
  {
    slug: "how-to-fix-mismatched-product-price",
    title: "Compare product prices",
    metaTitle: "Fix Mismatched Product Price — Google Merchant Center",
    metaDescription:
      "Compare the same product and variant across the feed, visible price, sale settings and Offer markup.",
    issueName: "Mismatched product price",
    intro:
      "This issue usually means Google sees one product price in your feed and a different price on the landing page, structured data, sale price logic or regional version of the page.",
    symptoms: [
      "Products are disapproved or limited in Merchant Center.",
      "The feed price does not match the visible page price.",
      "Sale price, discounts or regional pricing changes faster than the feed.",
      "Structured data exposes a different Offer price.",
    ],
    causes: [
      "Feed price and website price are updated at different times.",
      "The page shows a sale price but the feed sends the regular price.",
      "Currency, tax or shipping logic changes visible price by country.",
      "Product / Offer JSON-LD contains stale price data.",
    ],
    quickChecks: [
      "Open 3 affected product URLs from the CSV.",
      "Compare feed price with visible landing page price.",
      "Inspect Product / Offer structured data.",
      "Check whether sale price is active and consistent.",
      "Check whether the page redirects to another country or currency.",
    ],
    fixSteps: [
      "Update feed price, sale price and sale price effective date.",
      "Make sure the visible product page shows the same price.",
      "Update Product / Offer JSON-LD price and priceCurrency.",
      "Clear page cache if your store uses caching.",
      "Wait for Merchant Center recrawl, then request review only after consistency is verified.",
    ],
    reference: {
      title: "Google Merchant Center: mismatched product price",
      href: "https://support.google.com/merchants/answer/12159029?hl=en",
    },
  },
  {
    slug: "how-to-fix-mismatched-product-availability",
    title: "Compare product availability",
    metaTitle: "Fix Mismatched Availability — Google Merchant Center",
    metaDescription:
      "Trace stock status through the feed, product page and Offer markup, including variants and backorders.",
    issueName: "Mismatched product availability",
    intro:
      "This issue appears when Google sees different availability signals between your product feed, landing page, stock text and structured data.",
    symptoms: [
      "Product is marked in stock in the feed but out of stock on the page.",
      "Product page says sold out while feed still sends in stock.",
      "Availability changes often but feed updates slowly.",
      "Structured data contains stale InStock or OutOfStock value.",
    ],
    causes: [
      "Inventory feed updates are delayed.",
      "Product variants have different stock states.",
      "The page text says unavailable but schema says InStock.",
      "Cached product pages show old stock status.",
    ],
    quickChecks: [
      "Compare feed availability with visible product page availability.",
      "Check variant-level availability.",
      "Inspect Product / Offer availability in JSON-LD.",
      "Check whether out-of-stock text is hidden behind variant selection.",
      "Check cache and CDN timing.",
    ],
    fixSteps: [
      "Sync product feed availability with store inventory.",
      "Update JSON-LD availability.",
      "Make stock text visible and consistent.",
      "Avoid sending in stock for unavailable variants.",
      "Resubmit affected products after consistency is verified.",
    ],
    reference: {
      title: "Google Merchant Center: mismatched product availability",
      href: "https://support.google.com/merchants/answer/12470049?hl=en",
    },
  },
  {
    slug: "how-to-fix-mismatched-domains",
    title: "Check product URL domains",
    metaTitle: "Fix Mismatched Domains — Google Merchant Center",
    metaDescription:
      "Follow product URLs and redirects, then compare their domains with the verified store domain.",
    issueName: "Mismatched domains",
    intro:
      "This issue usually means the domain in your feed, final product URL, landing page, redirect chain or verified Merchant Center website does not line up correctly.",
    symptoms: [
      "Merchant Center flags product URLs as domain mismatch.",
      "Product links redirect to a different domain.",
      "Canonical URL points to another domain.",
      "Store uses several domains or subdomains.",
    ],
    causes: [
      "Feed links use an old domain.",
      "Product URLs redirect from www to non-www or another store domain.",
      "Canonical tags point to a different domain.",
      "Merchant Center website verification does not match the final landing page.",
    ],
    quickChecks: [
      "Open affected product URL from the CSV.",
      "Check final URL after redirects.",
      "Compare final domain with verified Merchant Center website.",
      "Inspect canonical tag.",
      "Check whether checkout or product pages use another domain.",
    ],
    fixSteps: [
      "Update feed links to the final verified domain.",
      "Fix redirect chains.",
      "Make canonical URLs consistent.",
      "Verify the correct website in Merchant Center.",
      "Resubmit affected products after domain consistency is fixed.",
    ],
    reference: {
      title: "Google Merchant Center: mismatched domains",
      href: "https://support.google.com/merchants/answer/12158934?hl=en",
    },
  },
  {
    slug: "different-product-landing-page-checklist",
    title: "Check product landing pages",
    metaTitle: "Different Product Landing Page — Merchant Center Checklist",
    metaDescription:
      "Confirm that each feed link opens the intended product and variant rather than another page.",
    issueName: "Different product landing page",
    intro:
      "This issue can happen when the product URL in the feed does not reliably show the same product to Google and users.",
    symptoms: [
      "Product URL opens a category page instead of a product page.",
      "The page redirects to another product.",
      "The product is not available in the target country.",
      "The page content changes based on location, language or device.",
    ],
    causes: [
      "Wrong product URL in feed.",
      "Variant URL redirects to parent product.",
      "Regional redirects change the product page.",
      "Canonical points to a different product.",
    ],
    quickChecks: [
      "Open affected URL in incognito.",
      "Check final redirected URL.",
      "Check canonical URL.",
      "Check whether the title/image/price match the feed item.",
      "Check mobile version of the product page.",
    ],
    fixSteps: [
      "Send direct product URLs in the feed.",
      "Avoid redirecting product URLs to categories.",
      "Fix canonical conflicts.",
      "Make regional pages consistent.",
      "Recheck affected URLs before review.",
    ],
    reference: {
      title: "Google Merchant Center: different product landing page",
      href: "https://support.google.com/merchants/answer/13640287?hl=en",
    },
  },
  {
    slug: "pending-website-check-readiness",
    title: "Prepare for a website check",
    metaTitle: "Pending Website Check — Merchant Center Readiness",
    metaDescription:
      "Check product links, page access and store policies before investigating a pending website check.",
    issueName: "Pending website check",
    intro:
      "Pending website check means the store should be reviewed for basic trust, crawlability and merchant listing readiness before pushing more products.",
    symptoms: [
      "Merchant Center shows website check pending.",
      "Products are not fully eligible yet.",
      "Website verification or claim status is unclear.",
      "Trust pages are missing or weak.",
    ],
    causes: [
      "New store or newly connected Merchant Center account.",
      "Missing contact, shipping or return information.",
      "Robots, redirects or broken pages block crawling.",
      "Website verification is incomplete.",
    ],
    quickChecks: [
      "Check homepage, product page and checkout accessibility.",
      "Check Contact, Shipping, Returns and Privacy pages.",
      "Check robots.txt and noindex tags.",
      "Check website verification status.",
      "Check Product / Offer structured data.",
    ],
    fixSteps: [
      "Add clear business and contact information.",
      "Publish shipping and return policy pages.",
      "Fix crawl-blocking issues.",
      "Verify and claim the website.",
      "Wait for review after the site is consistent.",
    ],
    reference: {
      title: "Google Merchant Center: pending website check",
      href: "https://support.google.com/merchants/answer/14987567?hl=en",
    },
  },
  {
    slug: "product-offer-structured-data-checklist",
    title: "Inspect Product and Offer markup",
    metaTitle: "Product Offer Structured Data Checklist",
    metaDescription:
      "Inspect the Product and its Offer, then compare price, currency and stock with the visible product page.",
    issueName: "Product / Offer structured data",
    intro:
      "Product and Offer structured data helps expose price, currency, availability and merchant details in a machine-readable way.",
    symptoms: [
      "Rich result testing does not detect Product data.",
      "Offer price or currency is missing.",
      "Availability is missing or stale.",
      "Shipping or return policy markup is missing.",
    ],
    causes: [
      "No Product JSON-LD on product pages.",
      "Offer object is incomplete.",
      "Price and availability are not updated dynamically.",
      "Theme or plugin outputs stale schema.",
    ],
    quickChecks: [
      "Check Product @type.",
      "Check Offer object.",
      "Check price and priceCurrency.",
      "Check availability.",
      "Check canonical URL.",
    ],
    fixSteps: [
      "Add Product JSON-LD to product pages.",
      "Add Offer with price, priceCurrency and availability.",
      "Keep schema synchronized with visible page data.",
      "Add shipping and return policy markup when ready.",
      "Test again after deployment.",
    ],
    reference: {
      title: "Google Search Central: merchant listing structured data",
      href: "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=en",
    },
  },
];
export function getGuideBySlug(slug: string | undefined) {
  return guidePages.find((guide) => guide.slug === slug);
}
