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

          <p className="eyebrow">Reference</p>

          <h1>Issue guides</h1>

          <p>
            Choose the issue reported in your export. Each guide links to the
            relevant Google documentation.
          </p>
        </section>

        <section className="guides-index-grid">
          {guidePages.map((guide) => (
            <Link
              className="guide-index-card"
              to={`/guides/${guide.slug}`}
              key={guide.slug}
            >
              <h2>{guide.issueName}</h2>

              <p>{guide.title}</p>

              <span>Read guide →</span>
            </Link>
          ))}
        </section>

        <p className="reference-links">
          <Link to="/sample-report">View a price example</Link> ·{" "}
          <Link to="/merchant-center-diagnostic-report">
            Evidence checklist
          </Link>
        </p>
      </main>
    </div>
  );
}

export default GuidesIndexPage;
