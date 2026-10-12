import { Link, useParams } from "react-router-dom";
import { getGuideBySlug, guidePages } from "../guideData";

function GuidePage() {
  const { slug } = useParams();
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return (
      <div className="page">

        <main className="content-page" id="content" tabIndex={-1}>
          <section className="content-hero">
            <p className="eyebrow">404</p>
            <h1>Guide not found</h1>
            <p>This guide is unavailable. Choose a topic from the guide index.</p>

            <Link className="btn primary" to="/guides">
              Browse guides
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const related = guidePages
    .filter((item) => item.slug !== guide.slug)
    .slice(0, 3);

  return (
    <div className="page">

      <main className="content-page" id="content" tabIndex={-1}>
        <section className="content-hero">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/guides">Guides</Link>
            <span>/</span>
            <span>{guide.issueName}</span>
          </div>

          <p className="eyebrow">{guide.issueName}</p>

          <h1>{guide.title}</h1>

          <p>{guide.intro}</p>

          <div className="hero-actions">
            <Link className="btn primary" to="/#checker">
              Run free preflight
            </Link>

            <Link className="btn secondary" to="/#order">
              Ask about an issue
            </Link>
          </div>
        </section>

        <section className="content-grid">
          <article className="article-card">
            <h2>Common symptoms</h2>

            <ul className="step-list">
              {guide.symptoms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="article-card">
            <h2>Likely causes</h2>

            <ul className="step-list">
              {guide.causes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="article-card">
            <h2>Quick preflight checks</h2>

            <ul className="step-list numbered">
              {guide.quickChecks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="article-card">
            <h2>Fix order</h2>

            <ul className="step-list numbered">
              {guide.fixSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="article-card guide-reference" aria-labelledby="reference-heading">
          <h2 id="reference-heading">Official reference</h2>
          <p>Use this checklist to collect evidence. Check Google's current requirements before changing product data or requesting a review.</p>
          <a href={guide.reference.href}>{guide.reference.title} ↗</a>
        </section>

        <section className="article-cta">
          <div>
            <p className="eyebrow">Evidence notes</p>

            <h2>Compare the source values.</h2>

            <p>
              Use the export to identify affected products, then compare the feed,
              page and markup for the same product and variant. Keep the evidence
              together before deciding what to change.
            </p>
          </div>

          <Link className="btn primary" to="/merchant-center-diagnostic-report">
            Open evidence worksheet
          </Link>
        </section>

        <section className="related-section">
          <h2>Related guides</h2>

          <div className="related-grid">
            {related.map((item) => (
              <Link
                className="guide-card"
                to={`/guides/${item.slug}`}
                key={item.slug}
              >
                <span>{item.issueName}</span>

                <h3>{item.title}</h3>

                <p>{item.metaDescription}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default GuidePage;
