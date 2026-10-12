import { Link } from "react-router-dom";

function GoogleMerchantCenterReviewChecklistPage() {

  return (
    <div className="page">
      <header className="header">
        <Link className="logo" to="/">
          <span className="logo-mark">ML</span>
          <span>
            Merchant Listing
            <strong>Preflight</strong>
          </span>
        </Link>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/merchant-center-issues">Issues</Link>
          <Link to="/affected-products-csv-checker">CSV checker</Link>
          <Link to="/guides">Guides</Link>
          <Link to="/sample-report">Sample report</Link>
        </nav>

        <Link className="header-cta" to="/#order">
          Request report
        </Link>
      </header>

      <main className="content-page">
        <section className="content-hero">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Review checklist</span>
          </div>

          <p className="eyebrow">Merchant Center review readiness</p>

          <h1>
            Google Merchant Center review checklist before requesting another
            review
          </h1>

          <p>
            Before requesting another Merchant Center review, check that your
            feed data, product landing pages, Product / Offer structured data,
            redirects and trust pages are consistent. Repeated reviews without
            fixing the real mismatch can lead to another rejection cycle.
          </p>

          <div className="hero-actions">
            <Link className="btn primary" to="/#checker">
              Run free preflight
            </Link>

            <Link className="btn secondary" to="/#order">
              Request diagnostic report
            </Link>
          </div>
        </section>

        <section className="article-section">
          <h2>When to request another Merchant Center review</h2>

          <p>
            A review should be requested only after the affected issue has been
            fixed across all important signals. For product-level issues, that
            usually means the feed, visible landing page, structured data and
            final URL behavior all show the same product information.
          </p>

          <p>
            If you request review too early, Merchant Center may check the same
            product again, find the same conflict and keep the product
            disapproved or limited.
          </p>
        </section>

        <section className="article-section">
          <h2>Pre-review checklist</h2>

          <div className="checklist-panel">
            <div>
              <h3>Feed data</h3>
              <p>
                Product ID, title, link, price, sale price, availability, target
                country and currency should match the real product page
                experience.
              </p>
            </div>

            <div>
              <h3>Landing page</h3>
              <p>
                The final product URL should show the same product, price,
                availability, image and variant that was submitted in the feed.
              </p>
            </div>

            <div>
              <h3>Structured data</h3>
              <p>
                Product / Offer JSON-LD should not expose stale or conflicting
                price, currency, availability or URL values.
              </p>
            </div>

            <div>
              <h3>Website trust</h3>
              <p>
                Contact, shipping, return, privacy and terms pages should be
                accessible, consistent and visible to users.
              </p>
            </div>
          </div>
        </section>

        <section className="article-section">
          <h2>Product-level checks</h2>

          <ol className="step-list numbered">
            <li>
              Open several affected product URLs from the affected-products CSV.
            </li>
            <li>
              Confirm the final URL does not redirect to another product or
              domain.
            </li>
            <li>Compare feed price with visible landing page price.</li>
            <li>Compare feed availability with visible stock status.</li>
            <li>Check whether variants change price or availability.</li>
            <li>Inspect Product / Offer structured data for stale values.</li>
            <li>Clear cache and recheck the public product page.</li>
          </ol>
        </section>

        <section className="article-section">
          <h2>Account and website checks</h2>

          <ol className="step-list numbered">
            <li>
              Confirm the website is verified and claimed in Merchant Center.
            </li>
            <li>Confirm product URLs use the correct verified domain.</li>
            <li>Check robots.txt and noindex tags on important pages.</li>
            <li>Open Contact, Shipping, Returns, Privacy and Terms pages.</li>
            <li>Test add-to-cart and checkout access as a normal visitor.</li>
            <li>
              Check whether regional redirects change product content
              unexpectedly.
            </li>
            <li>
              Review issue screenshots and affected-products CSV before
              submitting.
            </li>
          </ol>
        </section>

        <section className="article-section">
          <h2>Common mistakes before review</h2>

          <div className="issue-hub-grid">
            <Link
              className="issue-hub-card"
              to="/guides/how-to-fix-mismatched-product-price"
            >
              <span>Price mismatch</span>
              <h2>Requesting review before price signals match</h2>
              <p>
                Feed price, visible page price, sale price and Offer structured
                data should be consistent before review.
              </p>
              <strong>Open guide →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/guides/how-to-fix-mismatched-product-availability"
            >
              <span>Availability mismatch</span>
              <h2>Reviewing before stock status is synced</h2>
              <p>
                Feed availability, visible stock text, variant stock and JSON-LD
                availability should not conflict.
              </p>
              <strong>Open guide →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/guides/how-to-fix-mismatched-domains"
            >
              <span>Domain mismatch</span>
              <h2>Submitting products with inconsistent URLs</h2>
              <p>
                Feed link, final landing page, canonical URL and verified
                website domain should align.
              </p>
              <strong>Open guide →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/guides/product-offer-structured-data-checklist"
            >
              <span>Structured data</span>
              <h2>Leaving stale Product / Offer markup on the page</h2>
              <p>
                Product and Offer schema should support the same product
                information users see on the page.
              </p>
              <strong>Open guide →</strong>
            </Link>
          </div>
        </section>

        <section className="article-section">
          <h2>What to prepare before requesting review</h2>

          <p>
            Before requesting review, prepare a small evidence set for yourself.
            This helps avoid guessing and makes it easier to understand whether
            the problem was actually fixed.
          </p>

          <ul className="step-list">
            <li>Affected-products CSV.</li>
            <li>3–5 affected product URLs.</li>
            <li>Screenshot of the Merchant Center issue title.</li>
            <li>Notes about feed fields changed.</li>
            <li>Notes about page, schema, redirect or cache fixes.</li>
            <li>Target country and currency.</li>
          </ul>
        </section>

        <section className="article-cta">
          <div>
            <p className="eyebrow">Need review preparation?</p>

            <h2>Get a diagnostic report before requesting another review.</h2>

            <p>
              Send the affected-products CSV and several affected URLs. The
              report gives likely root cause, evidence notes, priority fix order
              and review preparation checklist.
            </p>
          </div>

          <Link className="btn primary" to="/#order">
            Request diagnostic report
          </Link>
        </section>
      </main>

      <footer className="footer">
        <span>Merchant Listing Preflight</span>

        <span className="footer-links">
          <span>Independent product-data utility.</span>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </span>
      </footer>
    </div>
  );
}

export default GoogleMerchantCenterReviewChecklistPage;
