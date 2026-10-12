import { useMemo, useState } from "react";

const CONTACT_EMAIL = "flankero4697@gmail.com";

const issueTypes = [
  "Mismatched product price",
  "Mismatched product availability",
  "Mismatched domains",
  "Different product landing page",
  "Pending website check",
  "Product / Offer structured data",
  "Account-level review preparation",
  "Other Merchant Center issue",
];

function OrderForm() {
  const [storeUrl, setStoreUrl] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [issueType, setIssueType] = useState(issueTypes[0]);
  const [targetCountry, setTargetCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [message, setMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const mailtoLink = useMemo(() => {
    const subject = encodeURIComponent(
      `Merchant Listing Diagnostic Request — ${issueType}`,
    );

    const body = encodeURIComponent(`Hi,

I want to request a Merchant Listing diagnostic report.

Store URL:
${storeUrl || "[not provided]"}

My email:
${clientEmail || "[not provided]"}

Issue type:
${issueType}

Target country:
${targetCountry || "[not provided]"}

Target currency:
${currency || "[not provided]"}

Message / issue details:
${message || "[not provided]"}

I can provide:
- affected-products CSV
- 3–5 affected product URLs
- screenshot of the Merchant Center issue

Thanks.`);

    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }, [storeUrl, clientEmail, issueType, targetCountry, currency, message]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopyStatus("Email copied.");
    } catch {
      setCopyStatus(`Copy manually: ${CONTACT_EMAIL}`);
    }

    window.setTimeout(() => {
      setCopyStatus("");
    }, 2500);
  };

  return (
    <div className="order-form-card">
      <div className="section-heading order-heading">
        <div>
          <div className="eyebrow">Order diagnostic report</div>
          <h2>Request a clear Merchant Center diagnosis</h2>
        </div>

        <p>
          No Google login required. Send your store URL, issue type and
          affected-products CSV. You receive a clear report with likely root
          cause, fix order and review preparation.
        </p>
      </div>

      <div className="order-grid">
        <div className="order-copy">
          <h3>What to send after request</h3>

          <ul className="step-list">
            <li>Affected-products CSV from Merchant Center</li>
            <li>3–5 affected product URLs</li>
            <li>Screenshot of the issue title</li>
            <li>Target country and currency</li>
            <li>Short note about discounts, stock updates or redirects</li>
          </ul>

          <div className="notice-box">
            <strong>Important</strong>
            <p>
              This is a diagnostic and preparation service. It does not
              guarantee Google approval, account reinstatement or policy
              reversal.
            </p>
          </div>
        </div>

        <form
          className="order-form"
          onSubmit={(event) => {
            event.preventDefault();
            window.location.href = mailtoLink;
          }}
        >
          <label className="field-label" htmlFor="store-url">
            Store URL
          </label>
          <input
            id="store-url"
            required
            type="url"
            pattern="https?://.+"
            value={storeUrl}
            onChange={(event) => setStoreUrl(event.target.value)}
            placeholder="https://example.com"
            title="Enter a store URL starting with https:// or http://"
          />

          <label className="field-label" htmlFor="client-email">
            Your email
          </label>
          <input
            id="client-email"
            required
            type="email"
            value={clientEmail}
            onChange={(event) => setClientEmail(event.target.value)}
            placeholder="you@example.com"
            title="Your email"
          />

          <div className="form-row">
            <div>
              <label className="field-label" htmlFor="issue-type">
                Issue type
              </label>
              <select
                id="issue-type"
                value={issueType}
                onChange={(event) => setIssueType(event.target.value)}
                title="Issue type"
              >
                {issueTypes.map((issue) => (
                  <option value={issue} key={issue}>
                    {issue}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="target-country">
                Target country
              </label>
              <input
                id="target-country"
                type="text"
                value={targetCountry}
                onChange={(event) => setTargetCountry(event.target.value)}
                placeholder="United States"
                title="Target country"
              />
            </div>
          </div>

          <label className="field-label" htmlFor="currency">
            Target currency
          </label>
          <input
            id="currency"
            type="text"
            value={currency}
            onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            placeholder="USD"
            maxLength={3}
            pattern="[A-Z]{3}"
            title="Target currency"
          />

          <label className="field-label" htmlFor="message">
            Issue details
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            placeholder="Paste the Merchant Center issue title or describe what is happening..."
            title="Issue details"
          />

          <button className="btn primary full" type="submit">
            Open email draft
          </button>

          <div className="email-fallback">
            <p>
              If your email app does not open, send your request directly to:
            </p>

            <div className="email-copy-row">
              <code>{CONTACT_EMAIL}</code>

              <button
                className="copy-email-btn"
                type="button"
                onClick={handleCopyEmail}
              >
                Copy email
              </button>
            </div>

            {copyStatus && <span className="copy-status">{copyStatus}</span>}
          </div>

          <p className="form-note">
            This opens your email app with a prepared message. Attach the CSV
            manually after the email opens.
          </p>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;

