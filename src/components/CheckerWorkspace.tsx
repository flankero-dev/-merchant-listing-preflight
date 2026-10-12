import { useState } from "react";
import { useLocation } from "react-router-dom";
import DeveloperContact from "./DeveloperContact";
import { Link } from "react-router-dom";
import CsvChecker from "./CsvChecker";
import SchemaChecker from "./SchemaChecker";
import "./CheckerWorkspace.css";

export default function CheckerWorkspace() {
  const [mode, setMode] = useState<"csv" | "schema">("csv");
  const { pathname } = useLocation();
  return (
    <div className="preflight-workspace">
      <main id={pathname === "/" ? "content" : undefined} tabIndex={-1}>
        <div className="pw-intro">
          <p className="pw-kicker">PRODUCT DATA UTILITIES</p>
          <h1>Inspect product data.</h1>
          <p>Group recorded CSV issues or check Product / Offer JSON-LD.</p>
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
        <p className="pw-help">
          <Link to="/sample-report">View price example</Link> ·{" "}
          <Link to="/affected-products-csv-checker">CSV help</Link>
        </p>
        <DeveloperContact />
      </main>
    </div>
  );
}
