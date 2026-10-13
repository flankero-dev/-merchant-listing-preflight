import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="pw-footer">
      <span>Merchant Preflight · Product-data utilities</span>
      <div>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <a
          href="https://github.com/flankero-dev/-merchant-listing-preflight"
          target="_blank"
          rel="noopener noreferrer"
          title="Opens in a new tab"
        >
          View on GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  );
}
