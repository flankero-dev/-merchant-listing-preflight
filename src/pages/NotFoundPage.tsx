import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="page">

      <main className="content-page" id="content" tabIndex={-1}>
        <section className="content-hero">
          <p className="eyebrow">404</p>

          <h1>Page not found</h1>

          <p>
            This page does not exist. Use the free preflight checker, open the
            Merchant Center issue hub or browse the issue guides.
          </p>

          <div className="hero-actions">
            <Link className="btn primary" to="/#checker">
              Run free preflight
            </Link>

            <Link className="btn secondary" to="/guides">
              View guides
            </Link>
          </div>
        </section>

        <section className="article-section">
          <h2>Useful pages</h2>

          <div className="issue-hub-grid">
            <Link className="issue-hub-card" to="/merchant-center-issues">
              <span>Issue hub</span>
              <h2>Merchant Center issue checklist</h2>
              <p>
                Start here if you are not sure which Merchant Center issue is
                blocking your products.
              </p>
              <strong>Open page →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/affected-products-csv-checker"
            >
              <span>CSV checker</span>
              <h2>Affected-products CSV checker</h2>
              <p>
                Use your Merchant Center CSV to group affected products and
                detect issue patterns.
              </p>
              <strong>Open page →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/merchant-center-diagnostic-report"
            >
              <span>Evidence worksheet</span>
              <h2>Evidence worksheet</h2>
              <p>
                Record source values, hypotheses and the steps used to verify a change.
              </p>
              <strong>Open page →</strong>
            </Link>

            <Link className="issue-hub-card" to="/guides">
              <span>Guides</span>
              <h2>Merchant Center issue guides</h2>
              <p>
                Read guides for price mismatch, availability mismatch, domains,
                landing pages and structured data.
              </p>
              <strong>Open guides →</strong>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default NotFoundPage;
