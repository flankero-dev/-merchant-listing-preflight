import { Link, useParams } from "react-router-dom";
import { getGuideBySlug } from "../guideData";

export default function GuidePage() {
  const { slug } = useParams();
  const guide = getGuideBySlug(slug);
  if (!guide)
    return (
      <main className="content-page compact-page" id="content" tabIndex={-1}>
        <h1>Guide not found</h1>
        <Link to="/guides">Back to guides</Link>
      </main>
    );
  return (
    <main className="content-page compact-page" id="content" tabIndex={-1}>
      <div className="breadcrumbs">
        <Link to="/guides">Guides</Link>
        <span>/</span>
        <span>{guide.issueName}</span>
      </div>
      <h1>{guide.title}</h1>
      <p>{guide.intro}</p>
      <section>
        <h2>Check</h2>
        <ol className="step-list numbered">
          {guide.quickChecks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
      <section>
        <h2>Correct and recheck</h2>
        <ol className="step-list numbered">
          {guide.fixSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
      <details className="guide-causes">
        <summary>Possible causes</summary>
        <ul className="step-list">
          {guide.causes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
      <section aria-labelledby="reference-heading">
        <h2 id="reference-heading">Official reference</h2>
        <a
          href={guide.reference.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {guide.reference.title} ↗{" "}
          <span className="pw-sr-only">(opens in a new tab)</span>
        </a>
      </section>
      <p className="reference-links">
        <Link to="/guides">Back to guides</Link>
        {guide.slug === "how-to-fix-mismatched-product-price" && (
          <>
            {" "}
            · <Link to="/sample-report">View price example</Link>
          </>
        )}
      </p>
    </main>
  );
}
