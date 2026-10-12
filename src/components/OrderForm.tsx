import { useMemo, useState } from "react";

const CONTACT_EMAIL = "flankero4697@gmail.com";

const issueTypes = [
  "Feedback about the tool",
  "Mismatched product price",
  "Mismatched product availability",
  "Mismatched domains",
  "Different product landing page",
  "Pending website check",
  "Product / Offer structured data",
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
      `Merchant Preflight feedback — ${issueType}`,
    );

    const body = encodeURIComponent(`Hi,

I have feedback or a question about Merchant Preflight.

Store URL:
${storeUrl || "[not provided]"}

My email:
${clientEmail || "[not provided]"}

Topic:
${issueType}

Target country:
${targetCountry || "[not provided]"}

Target currency:
${currency || "[not provided]"}

Message:
${message || "[not provided]"}

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
  };

  return (
    <div className="order-form-card">
      <div className="section-heading order-heading">
        <div>
          <div className="eyebrow">Optional contact</div>
          <h2>Contact the developer</h2>
        </div>

        <p>
          Share feedback or report a problem with this tool. Extra product
          context is optional. This opens a draft, not a support request
          submitted to a service.
        </p>
      </div>

      <div className="order-grid">
        <div className="order-copy">
          <h3>Before you write</h3>

          <ul className="step-list">
            <li>Describe what you expected and what happened.</li>
            <li>For a reproducible example, use fictional or redacted data.</li>
            <li>
              Only add a store URL or product context if it helps explain the
              question.
            </li>
          </ul>

          <div className="notice-box">
            <strong>Important</strong>
            <p>
              Use redacted examples. Do not send passwords, recovery codes or
              account access. This is not Google support or a promised
              consulting service.
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
            Store URL (optional)
          </label>
          <input
            id="store-url"
            maxLength={2048}
            type="url"
            pattern="https?://.+"
            value={storeUrl}
            onChange={(event) => setStoreUrl(event.target.value)}
            placeholder="https://example.com"
            title="Enter a store URL starting with https:// or http://"
          />

          <label className="field-label" htmlFor="client-email">
            Your email (optional)
          </label>
          <input
            id="client-email"
            maxLength={254}
            type="email"
            value={clientEmail}
            onChange={(event) => setClientEmail(event.target.value)}
            placeholder="you@example.com"
            title="Your email"
          />

          <div className="form-row">
            <div>
              <label className="field-label" htmlFor="issue-type">
                Topic
              </label>
              <select
                id="issue-type"
                value={issueType}
                onChange={(event) => setIssueType(event.target.value)}
                title="Topic"
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
                Target country (optional)
              </label>
              <input
                maxLength={80}
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
            Target currency (optional)
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
            Message
          </label>
          <textarea
            required
            maxLength={2000}
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            placeholder="Describe your feedback, question or a problem with the tool..."
            title="Message"
          />

          <button className="btn primary full" type="submit">
            Open email draft
          </button>

          <div className="email-fallback">
            <p>If your email app does not open, you can use this address:</p>

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

            <span className="copy-status" role="status">
              {copyStatus}
            </span>
          </div>

          <p className="form-note">
            Your email app controls sending. Checker inputs are not included
            automatically, and a response is not guaranteed.
          </p>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;
