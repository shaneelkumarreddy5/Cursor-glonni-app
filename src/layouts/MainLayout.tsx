import { NavLink, Outlet } from "react-router-dom";
import { PRIMARY_NAV_ITEMS } from "../routes/paths";

function navClassName(isActive: boolean) {
  return isActive ? "nav-link active" : "nav-link";
}

export function MainLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark">G</span>
            <span className="brand-text">Glonni</span>
          </NavLink>
          <nav aria-label="Main navigation" className="primary-nav">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navClassName(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Glonni storefront scaffold - UI and routing placeholders only.</p>
      </footer>
    </div>
  );
}
