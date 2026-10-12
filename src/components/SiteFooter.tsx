import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="pw-footer">
      <span>Merchant Preflight · Product-data utilities</span>
      <div>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </div>
    </footer>
  );
}
