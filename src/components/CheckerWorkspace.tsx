import { useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import OrderForm from "./OrderForm";
import CsvChecker from "./CsvChecker";
import SchemaChecker from "./SchemaChecker";
import "./CheckerWorkspace.css";

export default function CheckerWorkspace() {
  const [mode, setMode] = useState<"csv" | "schema">("csv");
  const contactRef = useRef<HTMLDetailsElement>(null);
  const { hash } = useLocation();
  useLayoutEffect(() => {
    if (hash === "#order" && contactRef.current) {
      contactRef.current.open = true;
      contactRef.current.scrollIntoView();
    }
  }, [hash]);
  return (
    <div className="preflight-workspace">
      <a className="pw-skip" href="#checker">
        Skip to checker
      </a>
      <header className="pw-header">
        <a className="pw-brand" href="/">
          Merchant <strong>Preflight</strong>
        </a>
        <nav aria-label="Main navigation">
          <a href="/merchant-center-issues">Issue reference</a>
          <a href="/guides">Guides</a>
          <a href="https://github.com/flankero-dev/-merchant-listing-preflight">
            Source code ↗
          </a>
        </nav>
      </header>
      <main>
        <div className="pw-intro">
          <p className="pw-kicker">PRODUCT DATA UTILITIES</p>
          <h1>Find recurring issues in a product export.</h1>
          <p>
            Group reported problems from a CSV export, or inspect price,
            currency and availability in Product / Offer JSON-LD.
          </p>
          <span className="pw-local">Processed locally in your browser</span>
        </div>
        <section
          id="checker"
          className="pw-checker"
          aria-label="Product data checker"
        >
          <div className="pw-switch" role="group" aria-label="Input format">
            <button
              aria-pressed={mode === "csv"}
              onClick={() => setMode("csv")}
            >
              CSV export
            </button>
            <button
              aria-pressed={mode === "schema"}
              onClick={() => setMode("schema")}
            >
              JSON-LD / HTML
            </button>
          </div>
          <div hidden={mode !== "csv"}>
            <CsvChecker />
          </div>
          <div hidden={mode !== "schema"}>
            <SchemaChecker />
          </div>
        </section>
        <section className="pw-boundaries">
          <h2>What this tool can tell you</h2>
          <div>
            <article>
              <h3>Recorded issues, grouped</h3>
              <p>
                The CSV checker classifies supplied issue text and identifies
                common columns. It does not independently confirm price, stock
                or policy violations.
              </p>
            </article>
            <article>
              <h3>Basic markup checks</h3>
              <p>
                The markup checker inspects types and basic values. It cannot
                confirm what Google sees on a live page or whether a listing
                will be approved.
              </p>
            </article>
          </div>
        </section>
        <section
          id="order"
          className="pw-contact"
          aria-label="Optional manual review"
        >
          <details ref={contactRef}>
            <summary>Contact about a manual review</summary>
            <OrderForm />
          </details>
        </section>
      </main>
      <footer className="pw-footer">
        <span>Independent React / TypeScript project</span>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>
    </div>
  );
}
