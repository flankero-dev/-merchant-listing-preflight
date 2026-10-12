import { Link } from "react-router-dom";

function TermsPage() {

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
            <span>Terms</span>
          </div>

          <p className="eyebrow">Service disclaimer</p>

          <h1>Terms and Disclaimer</h1>

          <p>
            Merchant Listing Preflight provides diagnostic reports and
            preparation checklists for Google Merchant Center and merchant
            listing issues. The service is designed to help identify likely
            technical, feed, landing page and structured data problems before a
            merchant requests another review.
          </p>
        </section>

        <section className="sample-report-full">
          <article className="article-card">
            <h2>1. Diagnostic service only</h2>
            <p>
              Merchant Listing Preflight is a diagnostic and preparation
              service. Reports may include likely causes, affected product
              examples, evidence notes, priority fixes and review preparation
              steps.
            </p>
            <p>
              The service does not directly change your Google Merchant Center
              account, product feed, website, store theme, policies or
              advertising settings.
            </p>
          </article>

          <article className="article-card">
            <h2>2. No Google approval guarantee</h2>
            <p>
              Merchant Listing Preflight does not guarantee product approval,
              account reinstatement, suspension removal, policy reversal,
              ranking improvement, traffic increase, sales increase or any other
              outcome inside Google Merchant Center, Google Search or Google
              Ads.
            </p>
            <p>
              Final decisions about product visibility, policy enforcement,
              account status and review outcomes are made by Google.
            </p>
          </article>

          <article className="article-card">
            <h2>3. No affiliation with Google</h2>
            <p>
              Merchant Listing Preflight is an independent diagnostic service.
              It is not affiliated with, endorsed by, sponsored by or officially
              connected to Google, Google Merchant Center, Google Ads or Google
              Search Console.
            </p>
            <p>
              Product names, platform names and issue names are used only to
              describe the diagnostic context.
            </p>
          </article>

          <article className="article-card">
            <h2>4. Client responsibility</h2>
            <p>
              The client is responsible for reviewing the report, deciding
              whether to implement suggested fixes and making any changes to
              their website, product feed, structured data, policies, business
              information or Merchant Center account.
            </p>
            <p>
              The client is also responsible for ensuring that their store,
              products, landing pages and business practices comply with
              applicable laws, platform rules and Google policies.
            </p>
          </article>

          <article className="article-card">
            <h2>5. Information required for reports</h2>
            <p>
              To prepare a useful diagnostic report, the client may need to
              provide an affected-products CSV, affected product URLs, target
              country, target currency, screenshots of issue titles and relevant
              context about prices, availability, redirects, variants, shipping
              or return policies.
            </p>
            <p>
              Google account login credentials are not required and should not
              be sent.
            </p>
          </article>

          <article className="article-card">
            <h2>6. No legal, tax or policy representation</h2>
            <p>
              Reports are provided for technical and operational diagnostic
              purposes only. They are not legal advice, tax advice, financial
              advice or official policy representation.
            </p>
            <p>
              For legal, regulatory or formal policy disputes, consult a
              qualified professional.
            </p>
          </article>

          <article className="article-card">
            <h2>7. Report limitations</h2>
            <p>
              A diagnostic report is based on the information available at the
              time of review. Product data, website content, structured data,
              prices, availability and platform policies may change after the
              report is delivered.
            </p>
            <p>
              Because of this, findings should be treated as preparation
              guidance, not as a permanent guarantee.
            </p>
          </article>

          <article className="article-card">
            <h2>8. Contact</h2>
            <p>
              For questions about a diagnostic request, use the request form on
              the homepage or contact the service by email.
            </p>

            <Link className="btn primary" to="/#order">
              Request diagnostic report
            </Link>
          </article>
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

export default TermsPage;
