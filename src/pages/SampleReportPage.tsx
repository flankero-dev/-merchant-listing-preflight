import { Link } from "react-router-dom";

function SampleReportPage() {
  return (
    <div className="page">
      <main className="content-page" id="content" tabIndex={-1}>
        <section className="content-hero">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Sample report</span>
          </div>

          <p className="eyebrow">Fictional worked example</p>
          <h1>A worked price-mismatch investigation</h1>
          <p>
            This fictional example uses the same five-row export and Blue
            Running Shoes markup as the checker samples. The page observations
            below are invented for this example; the checker does not fetch them
            or generate this report.
          </p>
        </section>

        <section className="sample-report-full">
          <article className="article-card">
            <h2>1. Executive summary</h2>
            <p>
              In the sample CSV, two of five product rows have a price issue.
              The investigation starts by comparing feed price, visible landing
              page price and Product / Offer structured data.
            </p>
          </article>

          <article className="article-card">
            <h2>2. Detected issue family</h2>
            <p>
              Recorded issue: <strong>Mismatched product price</strong>. The
              export groups SKU-1001 and SKU-1004 under that label. It does not
              prove a cause or establish that both items share one.
            </p>
          </article>

          <article className="article-card">
            <h2>3. Affected products</h2>
            <ul className="step-list">
              <li>SKU-1001 — Blue Running Shoes</li>
              <li>SKU-1004 — Winter Jacket</li>
            </ul>
          </article>

          <article className="article-card">
            <h2>4. Observation and hypotheses</h2>
            <p>
              For SKU-1001, the feed and JSON-LD agree at 79.99 USD; the
              fictional visible page shows 69.99 USD. That difference is the
              observation. An intended sale not yet reflected in the feed and
              markup, or an incorrect page price, are competing hypotheses.
              Neither is established by these values.
            </p>
          </article>

          <article className="article-card">
            <h2>5. Evidence for SKU-1001 — Blue Running Shoes</h2>
            <p>
              Same variant and currency; the visible-page value is illustrative.
            </p>
            <ul className="step-list">
              <li>Feed price: 79.99 USD</li>
              <li>Visible page price: 69.99 USD</li>
              <li>JSON-LD Offer price: 79.99 USD</li>
              <li>
                SKU-1004 feed price: 129.00 USD; page and markup not examined.
              </li>
              <li>
                Sale schedule and authoritative store price: not yet examined.
              </li>
            </ul>
          </article>

          <article className="article-card">
            <h2>6. Decide what needs correction</h2>
            <ul className="step-list numbered">
              <li>
                Confirm the intended active selling price in store records,
                including any sale dates.
              </li>
              <li>
                If 69.99 USD is the intended active price, correct the submitted
                active price and Offer markup accordingly.
              </li>
              <li>
                If 79.99 USD is correct, fix the erroneous visible-page price
                instead.
              </li>
              <li>
                Check SKU-1004 separately; do not apply SKU-1001’s hypothetical
                correction to it.
              </li>
              <li>
                Collect the same evidence again after changes, including initial
                HTML and update times.
              </li>
            </ul>
          </article>

          <article className="article-card">
            <h2>7. Review preparation</h2>
            <p>
              After verifying a correction, check the product’s current status
              and follow the official price-mismatch guidance for a website
              check or review. A matching local sample does not confirm
              reapproval.
            </p>
            <a href="https://support.google.com/merchants/answer/12159029?hl=en">
              Google: mismatched product price ↗
            </a>
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
            <p className="eyebrow">Try the checker</p>
            <h2>Start with the source data.</h2>
            <p>
              Load the sample export or inspect your own data. The checker
              groups supplied issues; live-page comparisons remain a manual
              step.
            </p>
          </div>

          <Link className="btn primary" to="/#checker">
            Open checker
          </Link>
        </section>
      </main>
    </div>
  );
}

export default SampleReportPage;
