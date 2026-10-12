import { useRef, useState, type ChangeEvent } from "react";
import { analyzeCsvText, type CsvAnalysis } from "../lib/csvAnalysis";
import { demoCsv } from "./checkerSamples";

export default function CsvChecker() {
  const [result, setResult] = useState<CsvAnalysis | null>(null);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const readId = useRef(0);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const id = ++readId.current;
    setError("");
    setResult(null);
    setReading(true);
    try {
      if (file.size > 2_000_000)
        throw new Error("Choose a CSV file no larger than 2 MB.");
      const text = await file.text();
      if (id === readId.current) setResult(analyzeCsvText(text, file.name));
    } catch (reason) {
      if (id === readId.current)
        setError(
          reason instanceof Error
            ? reason.message
            : "The file could not be read.",
        );
    } finally {
      if (id === readId.current) {
        setReading(false);
        input.value = "";
      }
    }
  }

  return (
    <>
      <p className="pw-sr-only" role="status">
        {reading
          ? "Reading file…"
          : result
            ? `${result.rowsCount} product rows analyzed in ${result.issueGroups.length} issue groups.`
            : ""}
      </p>
      <div className="pw-input-panel">
        <div>
          <h2>Inspect a product export</h2>
          <p>
            Group the issues already recorded in your CSV. This does not visit
            product URLs.
          </p>
        </div>
        <label className="pw-file">
          Affected-products CSV
          <input type="file" accept=".csv,text/csv" onChange={upload} />
        </label>
        <div className="pw-actions">
          <button
            onClick={() => {
              ++readId.current;
              setReading(false);
              setError("");
              setResult(analyzeCsvText(demoCsv, "sample-products.csv"));
            }}
          >
            Load sample CSV
          </button>
          <span>Comma-separated · 2 MB maximum · 10,000 rows</span>
        </div>
        {reading && <p>Reading file…</p>}
        {error && (
          <p className="pw-warning" role="alert">
            {error}
          </p>
        )}
      </div>
      {result ? (
        <section className="pw-results" aria-label="CSV analysis results">
          <div className="pw-result-heading">
            <div>
              <p className="pw-kicker">ANALYSIS</p>
              <h2>{result.fileName}</h2>
            </div>
            <button onClick={() => setResult(null)}>Clear results</button>
          </div>
          <div className="pw-stats">
            <div>
              <strong>{result.rowsCount}</strong>
              <span>Product rows</span>
            </div>
            <div>
              <strong>{result.issueGroups.length}</strong>
              <span>Issue groups</span>
            </div>
            <div>
              <strong>{result.headers.length}</strong>
              <span>Columns</span>
            </div>
          </div>
          {result.warnings.length > 0 && (
            <div className="pw-warning" role="alert">
              {result.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}
          <h3>Detected columns</h3>
          <dl className="pw-columns">
            {Object.entries(result.detectedColumns).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "Not found"}</dd>
              </div>
            ))}
          </dl>
          <h3>Issue groups</h3>
          {result.issueGroups.length ? (
            <div
              className="pw-table-wrap"
              role="region"
              aria-label="Issue groups table"
              tabIndex={0}
            >
              <table>
                <caption className="pw-sr-only">
                  Issues recorded in the supplied export
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Issue</th>
                    <th scope="col">Rows</th>
                    <th scope="col">Suggested priority</th>
                  </tr>
                </thead>
                <tbody>
                  {result.issueGroups.map((group) => (
                    <tr key={group.issue}>
                      <td>{group.issue}</td>
                      <td>{group.count}</td>
                      <td>
                        <span
                          className={`pw-priority ${group.priority.toLowerCase()}`}
                        >
                          {group.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
              No issue groups could be derived. Check the warnings and detected
              columns; this is not an all-clear for the store.
            </p>
          )}
          {result.topUrls.length > 0 && (
            <>
              <h3>Sample URLs from the export</h3>
              <ul className="pw-urls">
                {result.topUrls.map((url) => (
                  <li key={url}>
                    <code>{url}</code>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="pw-note">
            Each row is grouped by its supplied issue text. Suggested priority
            is a wording heuristic; Unrated means no supported rule matched.
            Verify the issue before taking action.
          </p>
        </section>
      ) : (
        <div className="pw-empty">
          <h3>Your analysis will appear here</h3>
          <p>
            Use the sample to see the output, or choose an export from your
            computer. Files stay in this browser.
          </p>
        </div>
      )}
    </>
  );
}
