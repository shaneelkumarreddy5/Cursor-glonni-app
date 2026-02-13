import { NavLink, Outlet } from "react-router-dom";
import { PRIMARY_NAV_ITEMS, ROUTES } from "../routes/paths";
import { useCommerce } from "../state/CommerceContext";

function navClassName(isActive: boolean) {
  return isActive ? "nav-link active" : "nav-link";
}

function mobileNavClassName(isActive: boolean) {
  return isActive ? "mobile-nav-link active" : "mobile-nav-link";
}

export function MainLayout() {
  const { cartItemsCount } = useCommerce();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-meta">
          <p>Free delivery over ₹15,000 · Secure checkout · Cashback-first shopping</p>
        </div>

        <div className="topbar-main topbar-container">
          <NavLink to="/" className="brand">
            <span className="brand-mark">G</span>
            <span className="brand-text">Glonni</span>
          </NavLink>

          <form
            className="global-search"
            role="search"
            onSubmit={(event) => event.preventDefault()}
            aria-label="Search products"
          >
            <input type="search" placeholder="Search for phones, laptops, accessories..." />
            <button type="submit">Search</button>
          </form>

          <div className="topbar-actions">
            <NavLink to={ROUTES.vendor} className="topbar-action-link">
              Vendor
            </NavLink>
            <NavLink to={ROUTES.settingsOrders} className="topbar-action-link">
              Orders
            </NavLink>
            <NavLink to={ROUTES.cart} className="topbar-action-link">
              Cart{cartItemsCount > 0 ? ` (${cartItemsCount})` : ""}
            </NavLink>
            <NavLink to={ROUTES.settings} className="topbar-action-link">
              Account
            </NavLink>
          </div>
        </div>

        <div className="topbar-nav-wrap">
          <nav aria-label="Main navigation" className="primary-nav topbar-container">
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

      <nav aria-label="Mobile bottom navigation" className="mobile-bottom-nav">
        <NavLink to={ROUTES.home} className={({ isActive }) => mobileNavClassName(isActive)}>
          Home
        </NavLink>
        <NavLink to={ROUTES.category} className={({ isActive }) => mobileNavClassName(isActive)}>
          Search
        </NavLink>
        <NavLink
          to={ROUTES.settingsOrders}
          className={({ isActive }) => mobileNavClassName(isActive)}
        >
          Orders
        </NavLink>
        <NavLink
          to={ROUTES.settingsWallet}
          className={({ isActive }) => mobileNavClassName(isActive)}
        >
          Wallet
        </NavLink>
        <NavLink
          to={ROUTES.settingsProfile}
          className={({ isActive }) => mobileNavClassName(isActive)}
        >
          Profile
        </NavLink>
      </nav>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <p className="footer-brand">Glonni</p>
            <p className="footer-copy">A modern minimal storefront focused on fast discovery.</p>
          </div>
          <div className="footer-links">
            <NavLink to={ROUTES.settingsSupport}>Help Center</NavLink>
            <NavLink to={ROUTES.settingsOrders}>Track Order</NavLink>
            <NavLink to={ROUTES.settings}>Account Settings</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
