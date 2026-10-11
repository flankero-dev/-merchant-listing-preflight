import { useEffect } from "react";
import { Link } from "react-router-dom";

function SampleReportPage() {
  useEffect(() => {
    document.title = "Sample Merchant Listing Diagnostic Report";

    let meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }

    meta.setAttribute(
      "content",
      "Sample Merchant Listing Diagnostic Report for Google Merchant Center issue diagnosis, fix order and review preparation.",
    );
  }, []);

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
          <Link to="/guides">Guides</Link>
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
            <span>Sample report</span>
          </div>

          <p className="eyebrow">Sample deliverable</p>
          <h1>Merchant Listing Diagnostic Report</h1>
          <p>
            This is the structure a client receives after ordering a paid
            diagnostic report. It does not promise Google approval. It explains
            what is broken, why it is likely happening and what to fix first.
          </p>
        </section>

        <section className="sample-report-full">
          <article className="article-card">
            <h2>1. Executive summary</h2>
            <p>
              25 affected product rows were reviewed. The main issue family is
              mismatched product price. The highest priority problem is
              inconsistency between feed price, visible landing page price and
              Product / Offer structured data.
            </p>
          </article>

          <article className="article-card">
            <h2>2. Detected issue family</h2>
            <p>
              Primary issue: <strong>Mismatched product price</strong>.
              Secondary risks: stale structured data, cached sale price and
              missing return policy markup.
            </p>
          </article>

          <article className="article-card">
            <h2>3. Affected products</h2>
            <ul className="step-list">
              <li>SKU-1001 — Blue Running Shoes</li>
              <li>SKU-1004 — Winter Jacket</li>
              <li>SKU-1012 — Trail Backpack</li>
            </ul>
          </article>

          <article className="article-card">
            <h2>4. Likely root cause</h2>
            <p>
              The feed sends one price while the product page and schema expose
              another price. This usually happens when sale price logic updates
              the website faster than the feed or when cache serves stale
              structured data.
            </p>
          </article>

          <article className="article-card">
            <h2>5. Evidence</h2>
            <ul className="step-list">
              <li>Feed price: 79.99 USD</li>
              <li>Visible page price: 69.99 USD</li>
              <li>JSON-LD Offer price: 79.99 USD</li>
              <li>Canonical URL points to the correct product URL</li>
            </ul>
          </article>

          <article className="article-card">
            <h2>6. Priority fixes</h2>
            <ul className="step-list numbered">
              <li>Update feed price and sale price fields.</li>
              <li>Make visible page price match the submitted feed.</li>
              <li>Update Product / Offer structured data.</li>
              <li>Clear store cache and CDN cache.</li>
              <li>Recheck 3–5 affected products before requesting review.</li>
            </ul>
          </article>

          <article className="article-card">
            <h2>7. Review preparation</h2>
            <p>
              Request review only after feed, page content and structured data
              are consistent. Keep screenshots and affected product examples
              ready.
            </p>
          </article>

          <article className="article-card">
            <h2>8. Prevention checklist</h2>
            <ul className="step-list">
              <li>Sync feed after price changes.</li>
              <li>Keep schema generated from the same product data source.</li>
              <li>Monitor affected-products CSV weekly.</li>
              <li>Test sale price changes before campaign launches.</li>
            </ul>
          </article>
        </section>

        <section className="article-cta">
          <div>
            <p className="eyebrow">Order report</p>
            <h2>Need this for your store?</h2>
            <p>
              Start with the free checker, then order Express Report if the
              issue looks serious.
            </p>
          </div>

          <Link className="btn primary" to="/#checker">
            Run free preflight
          </Link>
        </section>
      </main>

      <footer className="footer">
        <span>Merchant Listing Preflight</span>

        <span className="footer-links">
          <span>Diagnostic service. No Google approval guarantee.</span>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </span>
      </footer>
    </div>
  );
}

export default SampleReportPage;
