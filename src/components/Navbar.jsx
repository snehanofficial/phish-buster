import { NavLink } from "react-router-dom";

const SHIELD = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const LINKS = [
  { to: "/", label: "Analyze", icon: "🔍" },
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container container--wide">
        <div className="navbar__inner">
          <a href="/" className="navbar__logo" style={{ textDecoration: "none" }}>
            <span className="navbar__logo-icon">{SHIELD}</span>
            Phish<span style={{ color: "var(--accent)" }}>Buster</span>
          </a>
          <div className="navbar__links">
            {LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) => `navbar__link${isActive ? " active" : ""}`}
              >
                <span>{icon}</span> {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
