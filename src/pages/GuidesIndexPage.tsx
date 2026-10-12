import { Link } from "react-router-dom";
import { guidePages } from "../guideData";

function GuidesIndexPage() {
  return (
    <div className="page">
      <main className="content-page" id="content" tabIndex={-1}>
        <section className="content-hero">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Guides</span>
          </div>

          <p className="eyebrow">Merchant Center guides</p>

          <h1>Google Merchant Center issue guides</h1>

          <p>
            Manual investigation guides for selected Merchant Center issues and
            Product / Offer markup. Compare observations, check possible causes
            and follow the issue-specific official documentation.
          </p>

          <div className="hero-actions">
            <Link className="btn primary" to="/#checker">
              Open checker
            </Link>

            <Link className="btn secondary" to="/#order">
              Contact the developer
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
            <p className="eyebrow">Keep your evidence together</p>

            <h2>Record what you observed.</h2>

            <p>
              Use the worked example to record source values, hypotheses and
              verification steps for the same product and variant.
            </p>
          </div>

          <Link className="btn primary" to="/sample-report">
            View worked example
          </Link>
        </section>
      </main>
    </div>
  );
}

export default GuidesIndexPage;
