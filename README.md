# Merchant Listing Preflight

[Live application](https://merchant-listing-preflight.pages.dev/)

An independent React and TypeScript project for inspecting Merchant Center-style CSV exports and product JSON-LD. It provides a local first pass before manual investigation. This is a personal product, not a commissioned client case study.

## Try the main flows

1. Open the live application; the CSV checker is immediately available.
2. Load the included demo to inspect grouped issues, priorities and sample product URLs.
3. Upload your own export. Data is processed in the browser.
4. Switch to JSON-LD / HTML and paste markup, or load the included sample. Switching formats preserves both inputs and results.
5. Review the findings and investigate the source data manually.

The application does not fetch or crawl the submitted product URLs. A detected field is not proof that the field is accurate, or that Google will approve a listing.

## Implementation

- React 19 and TypeScript, built with Vite.
- React Router for guides, reports, legal pages and the not-found route.
- CSV parsing and issue classification in `src/lib/csvAnalysis.ts`, separated from rendering.
- Reusable form, FAQ and metadata components in `src/components`.
- Responsive CSS and local demo data.

## CSV input handling

The analyzer supports comma-delimited CSV, quoted commas, escaped quotes, multiline fields, CRLF line endings and a UTF-8 BOM. Exact known column aliases take precedence over longer labels. Short aliases match whole phrases, so `Grid` is not treated as an `ID` field.

Repeated column names (including generated blank-header collisions), malformed quoted fields and rows with missing or extra cells produce a warning instead of a misleading analysis. Input is capped at 2 million characters and 10,000 product rows. This is not a general-purpose CSV library: semicolon- and tab-delimited exports are not currently supported.

## Run and verify

Use Node.js 24 or later. The tests use Node's built-in runner and native TypeScript support.

```bash
npm ci
npm run dev
```

```bash
npm test
npm run lint
npm run build
npm run preview
# Browser checks against the built application:
npx playwright install chromium
npm run test:browser
```

The regression suite covers quoted data, line endings, BOM headers, column selection, duplicate headers, empty issue values and malformed input. CI runs tests, lint, the production build and a Chromium browser smoke suite.

## Privacy and boundaries

CSV files and pasted markup are analyzed client-side. There is no Merchant Center account connection, backend diagnostic service or automated account repair. The optional contact form validates the URL and email before opening a draft in the user’s email app; it does not send a request or contact a backend.

Issue priorities are heuristic. The structured-data checker inspects supplied markup; it does not establish Google policy compliance or verify live prices and stock. No approval or reinstatement guarantee is made.

## Engineering notes

CSV and structured-data analysis are isolated in `src/lib` and covered by regression tests. JSON-LD checks require exact Product/Offer types, a directly nested typed Offer, a non-negative decimal price, a currency recognized by the runtime and a known availability value. These checks do not establish Google eligibility or verify live store data.

The structured-data checker currently inspects the first Product and its directly nested Offer. It does not resolve JSON-LD `@id` references, expand custom contexts, validate AggregateOffer or compare multiple product variants. HTML metadata checks are heuristic. Browser checks cover uploads (including malformed and oversized files), markup errors, sample loading, format switching, keyboard button activation, mobile overflow and existing deep links. Full keyboard-navigation and screen-reader audits remain outstanding.



## Interface structure

The homepage is a tool workspace rather than a service landing page. `CheckerWorkspace` composes separate CSV and markup panels; sample inputs live in `checkerSamples.ts`. Previous reference and service pages retain their URLs. The optional manual-review form is collapsed below the tool and only opens an email draft.
