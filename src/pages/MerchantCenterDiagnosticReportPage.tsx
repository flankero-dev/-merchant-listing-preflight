import { Link } from "react-router-dom";

function MerchantCenterDiagnosticReportPage() {

  return (
    <div className="page">

      <main className="content-page">
        <section className="content-hero">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Diagnostic report</span>
          </div>

          <p className="eyebrow">Merchant Center diagnostic service</p>

          <h1>
            Google Merchant Center diagnostic report for product listing issues
          </h1>

          <p>
            Get a fixed-scope diagnostic report for Merchant Center product
            issues such as mismatched product price, mismatched availability,
            mismatched domains, different landing pages, pending website check
            and Product / Offer structured data conflicts.
          </p>

          <div className="hero-actions">
            <Link className="btn primary" to="/#order">
              Request diagnostic report
            </Link>

            <Link className="btn secondary" to="/sample-report">
              View sample report
            </Link>
          </div>
        </section>

        <section className="article-section">
          <h2>What the diagnostic report includes</h2>

          <div className="checklist-panel">
            <div>
              <h3>Issue summary</h3>
              <p>
                Clear explanation of the detected Merchant Center issue family
                and why it may be affecting product visibility.
              </p>
            </div>

            <div>
              <h3>Affected product examples</h3>
              <p>
                Review of selected affected product URLs from your CSV to
                identify repeated patterns and possible root causes.
              </p>
            </div>

            <div>
              <h3>Evidence notes</h3>
              <p>
                Feed, landing page, structured data, redirect, canonical, price
                and availability observations where relevant.
              </p>
            </div>

            <div>
              <h3>Priority fix order</h3>
              <p>
                A practical sequence of what to fix first before requesting
                another Merchant Center review.
              </p>
            </div>
          </div>
        </section>

        <section className="article-section">
          <h2>Supported issue types</h2>

          <div className="issue-hub-grid">
            <Link
              className="issue-hub-card"
              to="/guides/how-to-fix-mismatched-product-price"
            >
              <span>Mismatched product price</span>
              <h2>Feed price, page price and schema price conflicts</h2>
              <p>
                Useful when prices differ between feed, landing page, sale price
                logic, currency or Product / Offer structured data.
              </p>
              <strong>Open guide →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/guides/how-to-fix-mismatched-product-availability"
            >
              <span>Mismatched product availability</span>
              <h2>Stock status conflicts across feed, page and schema</h2>
              <p>
                Useful when feed availability, visible stock text, variants or
                JSON-LD availability do not match.
              </p>
              <strong>Open guide →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/guides/how-to-fix-mismatched-domains"
            >
              <span>Mismatched domains</span>
              <h2>Feed URL, final URL or verified domain mismatch</h2>
              <p>
                Useful when product URLs, redirects, canonical tags or Merchant
                Center website verification do not align.
              </p>
              <strong>Open guide →</strong>
            </Link>

            <Link
              className="issue-hub-card"
              to="/guides/product-offer-structured-data-checklist"
            >
              <span>Product / Offer structured data</span>
              <h2>Product schema and Offer markup conflicts</h2>
              <p>
                Useful when structured data exposes stale price, currency,
                availability, URL or policy information.
              </p>
              <strong>Open guide →</strong>
            </Link>
          </div>
        </section>

        <section className="article-section">
          <h2>Report options</h2>

          <div className="checklist-panel">
            <div>
              <h3>Express Report — $29</h3>
              <p>
                One issue family, up to 25 affected products. Best for a focused
                product disapproval problem with a clear issue title.
              </p>
            </div>

            <div>
              <h3>Store Audit — $79</h3>
              <p>
                Up to 3 issue families and up to 250 affected products. Best
                when several Merchant Center issues appear together.
              </p>
            </div>

            <div>
              <h3>Pre-Appeal Checklist — $149</h3>
              <p>
                Account-level review preparation for cases where website
                readiness, trust signals or repeated review failures need deeper
                checking.
              </p>
            </div>

            <div>
              <h3>No login required</h3>
              <p>
                You do not need to share Google account passwords, recovery
                codes, admin access or private login credentials.
              </p>
            </div>
          </div>
        </section>

        <section className="article-section">
          <h2>What you need to send</h2>

          <ul className="step-list">
            <li>Affected-products CSV from Google Merchant Center.</li>
            <li>3–5 affected product URLs.</li>
            <li>Screenshot of the Merchant Center issue title.</li>
            <li>Target country and target currency.</li>
            <li>
              Notes about recent feed, theme, price, stock, redirect or domain
              changes.
            </li>
          </ul>
        </section>

        <section className="article-section">
          <h2>What this service does not guarantee</h2>

          <p>
            This is a diagnostic and preparation service. It does not guarantee
            Google approval, product approval, account reinstatement, policy
            reversal, ranking improvement, traffic increase or sales increase.
          </p>

          <p>
            The goal is to identify likely root causes, reduce avoidable review
            mistakes and give you a clear fix order before you request another
            review.
          </p>
        </section>

        <section className="article-cta">
          <div>
            <p className="eyebrow">Ready to diagnose the issue?</p>

            <h2>Request a fixed-scope Merchant Center diagnostic report.</h2>

            <p>
              Send the affected-products CSV and several affected URLs. Payment
              is requested after the report scope is confirmed.
            </p>
          </div>

          <Link className="btn primary" to="/#order">
            Request diagnostic report
          </Link>
        </section>
      </main>
    </div>
  );
}

export default MerchantCenterDiagnosticReportPage;
