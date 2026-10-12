import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <main className="content-page compact-page" id="content" tabIndex={-1}>
      <h1>Page not found</h1>
      <p>Open the checker or choose an issue guide.</p>
      <div className="hero-actions">
        <Link className="btn primary" to="/#checker">
          Open checker
        </Link>
        <Link className="btn secondary" to="/guides">
          View guides
        </Link>
      </div>
    </main>
  );
}
