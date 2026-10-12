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
            Start with the exact issue reported in Merchant Center. The
            references below cover selected product-data issues and markup
            checks; they are not a diagnosis of your store or account.
          </p>

          <div className="hero-actions">
            <Link className="btn primary" to="/#checker">
              Open checker
            </Link>

            <Link className="btn secondary" to="/guides">
              View issue guides
            </Link>
          </div>
        </section>

        <section className="article-section">
          <h2>Common Merchant Center issue families</h2>

          <p>
            For price and stock differences, compare the feed, page and markup
            for the same item. For pending checks or URL issues, use the
            relevant guide instead of assuming a data mismatch.
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
                image link, target country and currency. Cross-reference the
                exported issue with submitted product data and the intended
                product page.
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
                Compare Product and Offer JSON-LD with page values. Check HTML
                canonical links separately; they are not JSON-LD properties.
              </p>
            </div>

            <div>
              <h3>Separate account or policy issues</h3>
              <p>
                Use the exact account or policy notice and its official
                guidance. Missing policies or ownership verification should not
                be inferred from a pending product-page crawl.
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
            The checker reads supplied data locally without a Google login. It
            does not visit URLs or send your export. Collect page evidence
            separately in your own notes.
          </p>
        </section>

        <section className="article-cta">
          <div>
            <p className="eyebrow">Evidence checklist</p>

            <h2>Record the evidence before making changes.</h2>

            <p>
              Keep observed values separate from likely causes. Use the
              checklist to plan which source changed and how you verified it.
            </p>
          </div>

          <Link className="btn primary" to="/merchant-center-diagnostic-report">
            Read evidence checklist
          </Link>
        </section>
      </main>
    </div>
  );
}

export default MerchantCenterIssuesPage;
