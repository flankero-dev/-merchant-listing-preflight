import { Link } from "react-router-dom";

export default function SampleReportPage() {
  return (
    <main className="content-page compact-page" id="content" tabIndex={-1}>
      <div className="breadcrumbs">
        <Link to="/">Checker</Link>
        <span>/</span>
        <span>Price example</span>
      </div>
      <h1>Example: investigating a price mismatch</h1>
      <p>
        This fictional example uses SKU-1001, Blue Running Shoes, from the
        checker samples. The page price is illustrative; the checker does not
        fetch product pages.
      </p>
      <section aria-labelledby="example-data">
        <h2 id="example-data">Example data</h2>
        <table className="example-table">
          <caption>Prices for the same product variant, in USD</caption>
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">CSV export</th>
              <td>79.99 USD</td>
            </tr>
            <tr>
              <th scope="row">Product page (fictional)</th>
              <td>69.99 USD</td>
            </tr>
            <tr>
              <th scope="row">JSON-LD Offer</th>
              <td>79.99 USD</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2>What this shows</h2>
        <p>
          The visible price differs from the CSV and markup. These values do not
          establish which source is wrong.
        </p>
      </section>
      <section>
        <h2>What to check next</h2>
        <ol className="step-list numbered">
          <li>
            Confirm the intended selling price, including any active sale.
          </li>
          <li>Correct any source that differs from the confirmed price.</li>
          <li>Compare the same variant again after the update.</li>
        </ol>
      </section>
      <Link className="btn primary" to="/#checker">
        Open checker
      </Link>
    </main>
  );
}
