import { useState } from "react";
import { analyzeSchemaInput, type SchemaAnalysis } from "../lib/schemaAnalysis";
import { demoSchema } from "./checkerSamples";

export default function SchemaChecker() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SchemaAnalysis | null>(null);
  const [error, setError] = useState("");
  function analyze() {
    if (!input.trim()) {
      setError("Paste JSON-LD or an HTML fragment first.");
      setResult(null);
      return;
    }
    if (input.length > 2_000_000) {
      setError("Input is limited to 2 million characters.");
      setResult(null);
      return;
    }
    setError("");
    try {
      setResult(analyzeSchemaInput(input));
    } catch {
      setResult(null);
      setError(
        "This markup could not be analyzed. Try a smaller Product / Offer block.",
      );
    }
  }
  return (
    <>
      <div className="pw-input-panel">
        <div>
          <h2>Inspect Product / Offer markup</h2>
          <p>
            Paste JSON-LD or HTML containing a JSON-LD script. Markup is
            inspected without executing it.
          </p>
        </div>
        <label className="pw-markup">
          Product JSON-LD or HTML
          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setResult(null);
              setError("");
            }}
            rows={11}
            spellCheck={false}
            placeholder={'{ "@type": "Product", ... }'}
          />
        </label>
        <div className="pw-actions">
          <button className="pw-primary" onClick={analyze}>
            Analyze markup
          </button>
          <button
            onClick={() => {
              setInput(demoSchema);
              setResult(null);
              setError("");
            }}
          >
            Load sample markup
          </button>
          <button
            disabled={!input}
            onClick={() => {
              setInput("");
              setResult(null);
              setError("");
            }}
          >
            Clear input
          </button>
        </div>
        {error && (
          <p className="pw-warning" role="alert">
            {error}
          </p>
        )}
      </div>
      {result && (
        <section className="pw-results" aria-label="Markup analysis results">
          <h2>Markup analysis</h2>
          <p>{result.blocks} JSON-LD block(s) inspected</p>
          {result.errors.length > 0 && (
            <div role="alert" className="pw-warning">
              {result.errors.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          )}
          <ul className="pw-checks">
            {result.checks.map((check) => (
              <li key={check.label}>
                <div>
                  <h3>{check.label}</h3>
                  <p>{check.detail}</p>
                </div>
                <span className={`pw-status ${check.status}`}>
                  {check.status}
                </span>
              </li>
            ))}
          </ul>
          <p className="pw-note">
            Checks cover the first Product and its directly nested Offer.
            Referenced offers, AggregateOffer and custom JSON-LD contexts are
            not resolved. Passing checks does not establish Google eligibility.
          </p>
        </section>
      )}
    </>
  );
}
