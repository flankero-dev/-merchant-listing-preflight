import { Link } from "react-router-dom";

function AffectedProductsCsvCheckerPage() {

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
          <Link to="/guides">Guides</Link>
          <Link to="/sample-report">Sample report</Link>
        </nav>

        <Link className="header-cta" to="/#checker">
          Run free check
        </Link>
      </header>

      <main className="content-page">
        <section className="content-hero">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Affected-products CSV checker</span>
          </div>

          <p className="eyebrow">Merchant Center CSV preflight</p>

          <h1>
            Affected-products CSV checker for Google Merchant Center issues
          </h1>

          <p>
            Use your Merchant Center affected-products CSV to group product
            issues, detect important columns and understand whether the problem
            is likely related to price, availability, domains, landing pages or
            structured data.
          </p>

          <div className="hero-actions">
            <Link className="btn primary" to="/#checker">
              Run free CSV preflight
            </Link>

            <Link className="btn secondary" to="/#order">
              Request diagnostic report
            </Link>
          </div>
        </section>

        <section className="article-section">
          <h2>What is an affected-products CSV?</h2>

          <p>
            An affected-products CSV is an export from Google Merchant Center
            that lists products affected by a specific issue or review state. It
            can include product IDs, titles, URLs, issue names, approval status,
            price, availability and other product data.
          </p>

          <p>
            This file is useful because it helps diagnose patterns. Instead of
            checking one product manually, you can group affected rows and see
            whether the same issue repeats across many products.
          </p>
        </section>

        <section className="article-section">
          <h2>Columns worth checking first</h2>

          <div className="checklist-panel">
            <div>
              <h3>Issue / status</h3>
              <p>
                Shows what Merchant Center detected. This helps group affected
                products by issue family.
              </p>
            </div>

            <div>
              <h3>Product ID</h3>
              <p>
                Helps connect the CSV row with the submitted feed item, variant
                or SKU.
              </p>
            </div>

            <div>
              <h3>Product URL</h3>
              <p>
                The landing page URL is needed to compare feed data with the
                visible product page.
              </p>
            </div>

            <div>
              <h3>Price and availability</h3>
              <p>
                These fields are important for mismatched product price and
                mismatched product availability diagnosis.
              </p>
            </div>
          </div>
        </section>

        <section className="article-section">
          <h2>Common issue groups found in CSV exports</h2>

          <div className="issue-hub-grid">
            <Link
              className="issue-hub-card"
              to="/guides/how-to-fix-mismatched-product-price"
            >
              <span>Mismatched product price</span>
              <h2>Feed price, page price and schema price do not match</h2>
              <p>
                Check feed price, sale price, visible page price, Product /
                Offer JSON-LD, currency and regional pricing.
              </p>
              <strong>Open guide →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/guides/how-to-fix-mismatched-product-availability"
            >
              <span>Mismatched product availability</span>
              <h2>Stock signals disagree across feed, page and schema</h2>
              <p>
                Check inventory sync, variant stock, visible availability,
                cached pages and Offer availability.
              </p>
              <strong>Open guide →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/guides/how-to-fix-mismatched-domains"
            >
              <span>Mismatched domains</span>
              <h2>Feed URL, redirects or verified domain do not align</h2>
              <p>
                Check feed links, final URLs, redirects, canonical tags and
                Merchant Center website verification.
              </p>
              <strong>Open guide →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/guides/different-product-landing-page-checklist"
            >
              <span>Different product landing page</span>
              <h2>The final page does not show the submitted product</h2>
              <p>
                Check product URLs, redirects, variants, canonical conflicts and
                regional landing page behavior.
              </p>
              <strong>Open guide →</strong>
            </Link>
          </div>
        </section>

        <section className="article-section">
          <h2>How to use the free CSV checker</h2>

          <ol className="step-list numbered">
            <li>Export affected products from Merchant Center.</li>
            <li>Open the free preflight checker on this site.</li>
            <li>Upload the CSV file in the CSV upload tab.</li>
            <li>
              Review detected columns, issue groups and sample product URLs.
            </li>
            <li>
              Open several affected URLs manually and compare feed data with the
              page.
            </li>
            <li>
              Request a diagnostic report if the same issue affects many
              products.
            </li>
          </ol>
        </section>

        <section className="article-section">
          <h2>When the CSV is not enough</h2>

          <p>
            The CSV can show which products are affected, but it usually does
            not prove the full root cause. Many Merchant Center issues require
            checking the feed, final landing page, structured data, redirects,
            canonical tags, cache and target country behavior together.
          </p>

          <p>
            A diagnostic report is useful when products keep getting rejected
            after fixes, when the same issue affects many rows, or when you are
            not sure whether the problem comes from the feed, the landing page,
            structured data or account-level readiness.
          </p>
        </section>

        <section className="article-cta">
          <div>
            <p className="eyebrow">Free checker + diagnostic report</p>

            <h2>Start with the CSV checker, then request a clear fix order.</h2>

            <p>
              Upload the affected-products CSV for a free preflight summary. For
              deeper diagnosis, send the CSV and 3–5 affected product URLs.
            </p>
          </div>

          <Link className="btn primary" to="/#checker">
            Run free CSV preflight
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

export default AffectedProductsCsvCheckerPage;
