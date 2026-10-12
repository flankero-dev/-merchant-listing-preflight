# Engineering decisions

## Two utilities share a workspace, not a data model

CSV analysis and JSON-LD analysis solve different questions. CSV answers which issue text occurs in the supplied rows. Markup analysis checks the values in a supplied Product and Offer. Neither result establishes what is currently on a live store.

The workspace keeps both panels mounted and switches visibility. This preserves the current input and result when changing format, without a second copy of the state in a global store.

The workspace also stays mounted while reading reference pages. Internal navigation uses React Router, so returning from a guide restores the format, input and results. Hidden panels leave the accessibility tree. A full reload clears the analysis; uploaded content is never written to browser storage.

Implementation: [workspace](../src/components/CheckerWorkspace.tsx), [CSV panel](../src/components/CsvChecker.tsx), [markup panel](../src/components/SchemaChecker.tsx).

## A deliberately bounded CSV parser

The parser handles comma-separated fields with explicit plain, quoted and closed states. Escaped quotes and embedded newlines are part of the quoted state. Unexpected text after a quote, unclosed quotes and a row that differs from the header are errors rather than partially accepted output.

This project handles one export format with limits: 2 MB per uploaded file and 10,000 product rows. Supporting more delimiters and encodings would justify a broader parser contract or a maintained CSV library.

Column detection tries exact aliases before longer whole-phrase matches. This prevents a short alias such as ID from matching unrelated words. Headers are checked for duplicates before converting rows into objects.

Evidence: [analyzer](../src/lib/csvAnalysis.ts), [CSV tests](../tests/csvAnalysis.test.mjs).

## Data validation is narrower than semantic eligibility

The markup checker requires an actual Product type and a directly nested typed Offer. It does not attach an unrelated Offer found elsewhere in a graph. Price must be a finite non-negative decimal; currency and availability must be recognized.

HTML extraction reads attribute tokens in either order and with quoted or unquoted values. It skips comments, quoted attributes and inert template/text content, and does not interpret HTML-like strings in raw JSON as page metadata. The text is parsed without executing scripts.

This is a focused extractor, not a complete HTML or JSON-LD processor. `@id` resolution, context expansion, AggregateOffer and multiple variants remain outside the contract. The panel states those limits next to the results.

Evidence: [analyzer](../src/lib/schemaAnalysis.ts), [schema tests](../tests/schemaAnalysis.test.mjs).

## File reads can finish out of order

The CSV panel increments a read identifier when a file is chosen or the sample is loaded. An older file read only updates the result if its identifier is still current. Selecting the same file again is supported by clearing the file input after the read.

This keeps an old asynchronous operation from replacing the user's newer selection. The browser suite checks file re-selection and switching formats.

## Routes have one metadata owner

React Router keeps the existing guide and report URLs available. `SEOHead` is the single owner of document title, description, canonical and social metadata. Pages render content instead of repeating metadata effects.

Route scrolling handles new pages and explicit anchors. The legacy `#order` anchor still focuses the compact feedback section. Guide references point to Google's documentation; a worked report is explicitly identified as fictional.

One shared header and footer provide the same navigation on every route, including missing pages. The current section uses `aria-current`, menu links remain visible on small screens, and navigation moves keyboard focus to the new heading or anchor. Reference pages use the checker's colour palette and readable heading sizes.

## Mobile clipping needs a containment check

Checking the page's scroll width was insufficient when a parent hid overflowing content. Privacy and Terms cards could be clipped at 320 px without creating a horizontal scrollbar.

The single-column grid now uses `minmax(0, 1fr)`, cards can shrink and long words wrap. Browser regression checks card bounds and content width, as well as the overall viewport.

Evidence: [browser suite](../tests/browser-smoke.mjs).

## Keep reference content proportional

The main navigation contains Checker and Guides. The separate issue hub duplicated the guide index, so its old URL redirects to Guides. Review preparation duplicated evidence collection, so both URLs now lead to one short checklist. Cloudflare `_redirects` handles direct requests; React Router handles in-app navigation. Redirected aliases are excluded from the sitemap.

All six issue-specific guides retain their official links and substantive checks. Introductory symptoms, repeated calls to contact the developer and arbitrary related-guide cards were removed. Possible causes are optional reading. The price example is one comparison table with three next steps, rather than eight report sections.

Contact is an email link and clipboard button. Checker inputs are never attached or sent. The manual-copy fallback is announced persistently. The previous form fields and their unused CSS were removed.

## CSV row classification

Product rows counts every accepted row. Issue groups uses only nonempty values from an Issue column; blank Issue cells never create invented issue groups. If Issue is absent, Status groups preserves the supplied status information without treating Approved, Disapproved or other labels as diagnoses. Four mutually exclusive row counts account for the entire accepted export. When both columns exist, Issue takes precedence, including its blank cells.
