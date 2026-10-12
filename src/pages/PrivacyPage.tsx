import { Link } from "react-router-dom";

function PrivacyPage() {

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
            <span>Privacy</span>
          </div>

          <p className="eyebrow">Privacy policy</p>

          <h1>Privacy Policy</h1>

          <p>
            This page explains what information may be collected when you
            request a Merchant Listing diagnostic report and how that
            information is used.
          </p>
        </section>

        <section className="sample-report-full">
          <article className="article-card">
            <h2>1. Information you may provide</h2>
            <p>
              When you request a diagnostic report, you may provide your email
              address, store URL, issue type, target country, target currency,
              Merchant Center screenshots, affected-products CSV and affected
              product URLs.
            </p>
          </article>

          <article className="article-card">
            <h2>2. How the information is used</h2>
            <p>
              The information is used to review your request, confirm the report
              scope, prepare diagnostic notes and communicate with you about the
              report.
            </p>
          </article>

          <article className="article-card">
            <h2>3. Google account access</h2>
            <p>
              You should not send Google account passwords, recovery codes,
              private login credentials or admin access. The diagnostic process
              is designed to work without Google account login access.
            </p>
          </article>

          <article className="article-card">
            <h2>4. Email communication</h2>
            <p>
              The request form opens your email app with a prepared message. The
              information you send by email is handled through your email
              provider and the receiving email inbox.
            </p>
          </article>

          <article className="article-card">
            <h2>5. Files and attachments</h2>
            <p>
              If you attach CSV files, screenshots or product examples, they are
              used only for diagnostic report preparation and communication
              related to your request.
            </p>
          </article>

          <article className="article-card">
            <h2>6. Third-party services</h2>
            <p>
              The website is hosted on Cloudflare Pages. Search visibility may
              be monitored through Google Search Console. Email communication
              may be handled through standard email providers.
            </p>
          </article>

          <article className="article-card">
            <h2>7. Data retention</h2>
            <p>
              Request information may be retained as long as needed to
              communicate with you, prepare the diagnostic report, keep basic
              business records and improve the service.
            </p>
          </article>

          <article className="article-card">
            <h2>8. Contact</h2>
            <p>
              To request deletion of information related to your diagnostic
              request, contact the service by replying to the email conversation
              used for your request.
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

export default PrivacyPage;
