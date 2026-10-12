import { Link, NavLink } from "react-router-dom";

export default function SiteHeader() {
  return (
    <header className="pw-header">
      <Link className="pw-brand" to="/">
        <img src="/favicon.svg" width="24" height="24" alt="" />
        <span>
          Merchant <strong>Preflight</strong>
        </span>
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
