import { Link } from "react-router-dom";
import { guidePages } from "../guideData";

function GuidesIndexPage() {

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
          <Link to="/sample-report">Sample report</Link>
          <Link to="/guides">Guides</Link>
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
            <span>Guides</span>
          </div>

          <p className="eyebrow">Merchant Center guides</p>

          <h1>Google Merchant Center issue guides</h1>

          <p>
            Practical diagnostic guides for common Merchant Center and merchant
            listing issues. Each guide explains symptoms, likely causes, quick
            checks and recommended fix order before requesting another review.
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

        <section className="guides-index-grid">
          {guidePages.map((guide) => (
            <Link
              className="guide-index-card"
              to={`/guides/${guide.slug}`}
              key={guide.slug}
            >
              <span>{guide.issueName}</span>

              <h2>{guide.title}</h2>

              <p>{guide.metaDescription}</p>

              <strong>Read guide →</strong>
            </Link>
          ))}
        </section>

        <section className="article-cta">
          <div>
            <p className="eyebrow">Need a report?</p>

            <h2>Get a clear diagnosis before requesting another review.</h2>

            <p>
              If your issue affects real products, upload the CSV, send affected
              URLs and request a fixed-scope diagnostic report.
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

export default GuidesIndexPage;
