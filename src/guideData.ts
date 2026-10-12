export type GuidePageData = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  issueName: string;
  intro: string;
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
    metaTitle: "Compare product prices — Merchant Preflight",
    metaDescription:
      "Compare active feed, page and markup prices for the same variant; verify the correct source before changing values.",
    issueName: "Mismatched product price",
    intro:
      "Google found a difference between submitted pricing and the landing page or its markup. Compare the same variant, currency and observation time before deciding which value needs correction.",
    causes: [
      "Website and product-data updates may occur at different times.",
      "Sale dates, time zones or cached markup may expose an older price.",
      "Initial HTML and the page after JavaScript runs may show different prices.",
    ],
    quickChecks: [
      "Record the issue timestamp and current product status.",
      "Compare the active regular or sale price for the same variant and country.",
      "Inspect initial HTML and Offer markup, not only the rendered page.",
      "Confirm sale dates, currency and minimum purchase quantity where applicable.",
    ],
    fixSteps: [
      "Verify the intended active selling price against the store source data.",
      "Correct the inconsistent feed, page or markup value; do not blindly copy an unverified price.",
      "Coordinate future website and product-data updates.",
      "Recheck the same item and follow the official website-check or review instructions if needed.",
    ],
    reference: {
      title: "Google: mismatched product price",
      href: "https://support.google.com/merchants/answer/12159029?hl=en",
    },
  },
  {
    slug: "how-to-fix-mismatched-product-availability",
    title: "Compare product availability",
    metaTitle: "Compare product availability — Merchant Preflight",
    metaDescription:
      "Compare feed and page availability for the same variant, including the issue timestamp and inventory update timing.",
    issueName: "Mismatched product availability",
    intro:
      "The submitted availability differed from the landing page when Google checked it. A current match does not explain an earlier mismatch; retain the issue timestamp.",
    causes: [
      "Inventory and feed updates may be out of sync.",
      "Variant selection or cached pages may expose a different stock state.",
    ],
    quickChecks: [
      "Compare the same variant at the reported timestamp and now.",
      "Check submitted availability, visible stock text and purchase controls.",
      "Inspect Offer markup and inventory update timing.",
    ],
    fixSteps: [
      "Confirm the actual inventory and purchase state.",
      "Correct the inconsistent feed, page or markup signal.",
      "Coordinate inventory and product-data updates, then verify the same items.",
      "Follow the official recheck instructions; do not mark a product out of stock simply to pause listings.",
    ],
    reference: {
      title: "Google: mismatched product availability",
      href: "https://support.google.com/merchants/answer/12470049?hl=en",
    },
  },
  {
    slug: "how-to-fix-mismatched-domains",
    title: "Check product URL domains",
    metaTitle: "Check product URL domains — Merchant Preflight",
    metaDescription:
      "Compare submitted product-link domains with the registered Merchant Center website; distinguish product links from image hosts.",
    issueName: "Mismatched domains",
    intro:
      "The submitted product-link domain does not match the store domain registered in Merchant Center, or the store URL has not been registered. Start with those two values.",
    causes: [
      "Product links may still use an old store domain.",
      "The account website may be missing, unverified or unclaimed.",
    ],
    quickChecks: [
      "Compare the submitted link domain with the account website URL.",
      "Check verification and claim status in Merchant Center.",
      "Follow redirects to confirm the intended product is accessible. A redirect alone does not prove this issue.",
    ],
    fixSteps: [
      "Confirm which store URL should be registered.",
      "Complete verification and claiming where required.",
      "Correct product links that use the wrong domain and submit the updated data.",
      "Recheck Needs attention after processing. Image hosts can differ; do not rewrite image URLs solely because their domain is different.",
    ],
    reference: {
      title: "Google: mismatched domains",
      href: "https://support.google.com/merchants/answer/12158934?hl=en",
    },
  },
  {
    slug: "different-product-landing-page-checklist",
    title: "Check product landing pages",
    metaTitle: "Check product landing pages — Merchant Preflight",
    metaDescription:
      "Check that product and mobile links show the advertised product and its purchase details, rather than another item.",
    issueName: "Different product landing page",
    intro:
      "The submitted link or mobile link does not present the specific advertised product. Check product identity and purchase details rather than assuming a canonical tag is the cause.",
    causes: [
      "The submitted URL may be incorrect.",
      "An unavailable product may redirect to a similar item.",
      "Variant or regional navigation may change the product shown.",
    ],
    quickChecks: [
      "Open the submitted link and mobile link, including redirects.",
      "Compare product identity and variant, price, currency and availability.",
      "Check the image, description and buy button. Wording and images need not be identical, but must refer to the same product.",
    ],
    fixSteps: [
      "Identify the correct purchasable product page.",
      "Correct wrong product links or page details.",
      "Remove redirects that replace the advertised product with another item.",
      "Verify desktop and mobile results, then follow the issue-specific official review instructions.",
    ],
    reference: {
      title: "Google: different product landing page",
      href: "https://support.google.com/merchants/answer/13640287?hl=en",
    },
  },
  {
    slug: "pending-website-check-readiness",
    title: "Understand a pending website check",
    metaTitle: "Understand a pending website check — Merchant Preflight",
    metaDescription:
      "Understand landing-page crawl verification, check affected product links and distinguish pending status from separate account issues.",
    issueName: "Pending website check",
    intro:
      "Google has not yet crawled one or more product landing pages to verify certain product data. This status alone does not establish a problem with store policies, website ownership or account trust.",
    causes: [
      "The relevant product pages have not yet been checked.",
      "Page access or crawl capacity may delay verification; confirm any access problem separately.",
    ],
    quickChecks: [
      "Identify the affected products in Needs attention.",
      "Compare exported links with the submitted product data.",
      "Confirm that each URL reaches an accessible, correct product page.",
      "Investigate crawl barriers if observed; do not infer them from the pending status alone.",
    ],
    fixSteps: [
      "Correct an incorrect URL or confirmed page-access problem.",
      "Submit corrected product data if a change was necessary.",
      "Allow time for crawling and processing, then check Needs attention again.",
      "Treat any separate policy, verification or account issue under its own official guidance.",
    ],
    reference: {
      title: "Google: pending website check",
      href: "https://support.google.com/merchants/answer/14987567?hl=en",
    },
  },
  {
    slug: "product-offer-structured-data-checklist",
    title: "Inspect Product and Offer markup",
    metaTitle: "Inspect Product and Offer markup — Merchant Preflight",
    metaDescription:
      "Inspect supplied Product and Offer values, then use Google documentation and testing tools for broader requirements.",
    issueName: "Product / Offer structured data",
    intro:
      "This checker inspects a limited set of supplied JSON-LD values. Google merchant-listing requirements cover additional properties and policies; passing these local checks is not an eligibility result.",
    causes: [
      "A template or plugin may generate stale or incomplete data.",
      "A valid structure may use features this checker does not resolve.",
    ],
    quickChecks: [
      "Compare markup with the same product and active offer.",
      "Use the official property requirements and Rich Results Test for broader validation.",
      "Inspect shipping and return information in the relevant offer or business-level markup.",
    ],
    fixSteps: [
      "Correct confirmed differences at their source.",
      "Provide the applicable required properties using Google’s documented structure.",
      "Keep markup synchronized with page data and retest after deployment.",
    ],
    reference: {
      title: "Google: product / offer structured data",
      href: "https://developers.google.com/search/docs/appearance/structured-data/merchant-listing?hl=en",
    },
  },
];
export function getGuideBySlug(slug: string | undefined) {
  return guidePages.find((guide) => guide.slug === slug);
}
