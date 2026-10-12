import { Link, NavLink } from "react-router-dom";

export default function SiteHeader() {
  return (
    <header className="pw-header">
      <Link className="pw-brand" to="/">
        Merchant <strong>Preflight</strong>
      </Link>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>
          Checker
        </NavLink>
        <NavLink to="/guides">Guides</NavLink>
      </nav>
    </header>
  );
}
