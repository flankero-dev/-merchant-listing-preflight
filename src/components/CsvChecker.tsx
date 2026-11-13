import { useRef, useState, type ChangeEvent } from "react";
import {
  analyzeCsvText,
  type CsvAnalysis,
  type CsvResult,
} from "../lib/csvAnalysis";
import { demoCsv } from "./checkerSamples";

const fieldLabels: Record<keyof CsvAnalysis["detectedColumns"], string> = {
  issue: "Issue",
  title: "Product title",
  link: "Product URL",
  id: "Product ID",
  price: "Price",
  availability: "Availability",
  status: "Status",
};

export default function CsvChecker() {
  const [result, setResult] = useState<CsvResult | null>(null);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const readId = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(0);
  const [statusPage, setStatusPage] = useState(0);
  const pageSize = 50;
  function clearResults() {
    ++readId.current;
    setReading(false);
    setResult(null);
    setError("");
    setPage(0);
    setStatusPage(0);
    fileRef.current?.focus();
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setPage(0);
    setStatusPage(0);
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
      }
    }
  }

  return (
    <>
      <p className="pw-sr-only" role="status">
        {reading
          ? "Reading file…"
          : error || result?.status === "error"
            ? "CSV analysis was not performed. Correct the file and try again."
            : result?.status === "success"
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
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={upload}
          />
        </label>
        <div className="pw-actions">
          <button
            className="pw-primary"
            onClick={() => {
              ++readId.current;
              setPage(0);
              setStatusPage(0);
              setReading(false);
              setError("");
              setResult(analyzeCsvText(demoCsv, "sample-products.csv"));
            }}
          >
            Load sample CSV
          </button>
          <span>UTF-8, comma-separated · 2 MB maximum · 10,000 rows</span>
        </div>
        {reading && <p>Reading file…</p>}
        {error && (
          <p className="pw-warning" role="alert">
            {error}
          </p>
        )}
      </div>
      {result?.status === "error" && (
        <section className="pw-results" aria-label="CSV parsing error">
          <div className="pw-result-heading">
            <div>
              <p className="pw-kicker">CSV COULD NOT BE READ</p>
              <h2>{result.fileName}</h2>
            </div>
            <button onClick={clearResults}>Clear results</button>
          </div>
          <div className="pw-warning" role="alert">
            <p>{result.error}</p>
            <p>
              No analysis results were produced. Choose the corrected CSV file
              to try again.
            </p>
          </div>
        </section>
      )}
      {result?.status === "success" ? (
        <section className="pw-results" aria-label="CSV analysis results">
          <div className="pw-result-heading">
            <div>
              <p className="pw-kicker">ANALYSIS</p>
              <h2>{result.fileName}</h2>
            </div>
            <button onClick={clearResults}>Clear results</button>
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
          <p className="pw-note pw-row-summary">
            Rows with issue text: {result.rowClassification.withIssue} · Blank
            Issue: {result.rowClassification.withoutIssue} · Status only:{" "}
            {result.rowClassification.statusOnly} · Unclassified:{" "}
            {result.rowClassification.unclassified}
          </p>
          <h3>Detected columns</h3>
          <p className="pw-note">Detected field → CSV column</p>
          <dl className="pw-columns pw-detected">
            {Object.entries(result.detectedColumns).map(([label, value]) => (
              <div key={label}>
                <dt>{fieldLabels[label as keyof typeof fieldLabels]}</dt>
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
                  {result.issueGroups
                    .slice(page * pageSize, (page + 1) * pageSize)
                    .map((group) => (
                      <tr key={group.issue}>
                        <td>
                          {group.issue}
                          <details>
                            <summary>Product examples</summary>
                            <ul>
                              {group.sample.map((row, index) => (
                                <li key={index}>
                                  {result.detectedColumns.id && (
                                    <span>
                                      ID: {row[result.detectedColumns.id]}{" "}
                                      ·{" "}
                                    </span>
                                  )}
                                  {result.detectedColumns.title && (
                                    <span>
                                      {row[result.detectedColumns.title]} ·{" "}
                                    </span>
                                  )}
                                  {result.detectedColumns.link ? (
                                    <code>
                                      {row[result.detectedColumns.link]}
                                    </code>
                                  ) : (
                                    "No URL column supplied"
                                  )}
                                </li>
                              ))}
                            </ul>
                          </details>
                        </td>
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
              {result.rowsCount === 0
                ? "No product rows were supplied. Choose an export that includes product rows."
                : "No nonempty Issue values were supplied. This is not an all-clear for the store; compare the original export and the row counts above."}
            </p>
          )}
          {result.issueGroups.length > pageSize && (
            <div className="pw-actions" aria-label="Issue group pages">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous groups
              </button>
              <span>
                Page {page + 1} of{" "}
                {Math.ceil(result.issueGroups.length / pageSize)} ·{" "}
                {result.issueGroups.length} total groups
              </span>
              <button
                disabled={(page + 1) * pageSize >= result.issueGroups.length}
                onClick={() => setPage((p) => p + 1)}
              >
                Next groups
              </button>
            </div>
          )}
          {result.statusGroups.length > 0 && (
            <>
              <h3>Status groups</h3>
              <p className="pw-note">
                Supplied status values are not issue diagnoses.
              </p>
              <dl className="pw-columns">
                {result.statusGroups
                  .slice(statusPage * pageSize, (statusPage + 1) * pageSize)
                  .map(({ status, count }) => (
                    <div key={status}>
                      <dt>{status}</dt>
                      <dd>{count} row(s)</dd>
                    </div>
                  ))}
              </dl>
            </>
          )}
          {result.statusGroups.length > pageSize && (
            <div className="pw-actions" aria-label="Status group pages">
              <button
                disabled={statusPage === 0}
                onClick={() => setStatusPage((p) => p - 1)}
              >
                Previous statuses
              </button>
              <span>
                Page {statusPage + 1} of{" "}
                {Math.ceil(result.statusGroups.length / pageSize)} ·{" "}
                {result.statusGroups.length} total statuses
              </span>
              <button
                disabled={
                  (statusPage + 1) * pageSize >= result.statusGroups.length
                }
                onClick={() => setStatusPage((p) => p + 1)}
              >
                Next statuses
              </button>
            </div>
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
            Only nonempty Issue values form issue groups. Groups preserve exact
            case and internal wording after trimming outer whitespace. Blank
            Issue values remain separate; when Issue is absent, status values
            are reported without inferring a diagnosis. Suggested priority is a
            wording heuristic; Unrated means no supported rule matched. Verify
            the issue before taking action.
          </p>
        </section>
      ) : result?.status === "error" ? null : (
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
