import { Link } from "react-router-dom";
import { guidePages } from "../guideData";

function MerchantCenterIssuesPage() {
  return (
    <div className="page">
      <main className="content-page" id="content" tabIndex={-1}>
        <section className="content-hero">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Merchant Center issues</span>
          </div>

          <p className="eyebrow">Merchant Center issue checklist</p>

          <h1>
            Google Merchant Center issues that can block product visibility
          </h1>

          <p>
            Merchant Center issues usually happen when product feed data,
            landing page content, structured data, canonical URLs or
            account-level trust signals do not match what Google expects. This
            checklist helps you identify the likely issue family before
            requesting another review.
          </p>

          <div className="hero-actions">
            <Link className="btn primary" to="/#checker">
              Run free preflight
            </Link>

            <Link className="btn secondary" to="/guides">
              View issue guides
            </Link>
          </div>
        </section>

        <section className="article-section">
          <h2>Common Merchant Center issue families</h2>

          <p>
            Many Merchant Center problems are not caused by one single field. A
            product can be affected because the feed says one thing, the landing
            page displays another thing, and the Product / Offer structured data
            exposes a third value. The safest approach is to check the feed,
            landing page, structured data and crawlable signals together.
          </p>

          <div className="issue-hub-grid">
            {guidePages.map((guide) => (
              <Link
                className="issue-hub-card"
                to={`/guides/${guide.slug}`}
                key={guide.slug}
              >
                <span>{guide.issueName}</span>
                <h2>{guide.title}</h2>
                <p>{guide.metaDescription}</p>
                <strong>Open checklist →</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="article-section">
          <h2>What to check before requesting another review</h2>

          <div className="checklist-panel">
            <div>
              <h3>Feed data</h3>
              <p>
                Check product ID, title, price, sale price, availability, link,
                image link, target country and currency. Make sure the
                affected-products CSV matches what your website actually
                displays.
              </p>
            </div>

            <div>
              <h3>Landing page</h3>
              <p>
                Confirm that the product page is accessible, crawlable,
                consistent and not showing different content by device, region,
                redirect, variant or cached state.
              </p>
            </div>

            <div>
              <h3>Structured data</h3>
              <p>
                Review Product and Offer JSON-LD for price, currency,
                availability, canonical URL, shipping details and return policy
                readiness.
              </p>
            </div>

            <div>
              <h3>Trust and review readiness</h3>
              <p>
                Confirm that policy pages, contact details, shipping
                information, return policy and checkout experience are
                consistent before sending products back for review.
              </p>
            </div>
          </div>
        </section>

        <section className="article-section">
          <h2>When to collect more evidence</h2>

          <p>
            Collect more evidence when the same issue affects multiple products,
            when Merchant Center keeps rejecting products after fixes, or when
            you are not sure whether the source of the problem is the feed, the
            landing page, structured data, redirects or account-level readiness.
          </p>

          <p>
            Merchant Listing Preflight does not require your Google account
            login. You can send the affected-products CSV, several affected
            product URLs, a screenshot of the issue title, target country and
            target currency.
          </p>
        </section>

        <section className="article-cta">
          <div>
            <p className="eyebrow">Need a clear fix order?</p>

            <h2>Record the evidence before making changes.</h2>

            <p>
              Keep observed values separate from likely causes. Use the
              worksheet to track which source changed and how you verified it.
            </p>
          </div>

          <Link className="btn primary" to="/merchant-center-diagnostic-report">
            Open evidence worksheet
          </Link>
        </section>
      </main>
    </div>
  );
}

export default MerchantCenterIssuesPage;
