import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { useCommerce } from "../state/CommerceContext";

function mobileNavClassName(isActive: boolean) {
  return isActive ? "mobile-nav-link active" : "mobile-nav-link";
}

export function MainLayout() {
  const { cartItemsCount } = useCommerce();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldShowBackControl = location.pathname !== ROUTES.home;
  const cartCountLabel = cartItemsCount > 99 ? "99+" : `${cartItemsCount}`;

  function handleBackNavigation() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(ROUTES.home);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-main topbar-container">
          <NavLink to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              G
            </span>
            <span className="brand-text">glonni</span>
          </NavLink>

          <form
            className="global-search"
            role="search"
            onSubmit={(event) => event.preventDefault()}
            aria-label="Search products"
          >
            <input type="search" placeholder="Search for mobiles, earbuds, trusted brands..." />
          </form>

          <div className="topbar-actions">
            <button type="button" className="topbar-locale-btn">
              EN/HI
            </button>

            <NavLink to={ROUTES.vendor} className="topbar-action-link topbar-desktop-link">
              Seller
            </NavLink>
            <NavLink to={ROUTES.admin} className="topbar-action-link topbar-desktop-link">
              Admin
            </NavLink>

            <NavLink to={ROUTES.settings} className="topbar-profile-link">
              <span className="topbar-profile-avatar" aria-hidden="true">
                A
              </span>
              <span className="topbar-profile-copy">
                <small>Namaste,</small>
                <strong>Arjun</strong>
              </span>
            </NavLink>

            <NavLink to={ROUTES.cart} className="topbar-cart-link" aria-label="Open cart">
              <span>Cart</span>
              <strong>{cartCountLabel}</strong>
            </NavLink>
          </div>
        </div>
      </header>

      <main className="page-content">
        {shouldShowBackControl ? (
          <div className="page-nav-row">
            <button type="button" className="page-back-link" onClick={handleBackNavigation}>
              <span aria-hidden="true">←</span>
              <span>Back</span>
            </button>
          </div>
        ) : null}
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
            <p className="footer-brand">glonni</p>
            <p className="footer-copy">© 2023 glonni. Your trusted shopping partner in India.</p>
          </div>
          <div className="footer-links">
            <NavLink to={ROUTES.vendor}>Seller Hub</NavLink>
            <NavLink to={ROUTES.admin}>Admin</NavLink>
            <NavLink to={ROUTES.settingsSupport}>Help Center</NavLink>
            <NavLink to={ROUTES.settingsOrders}>Track Order</NavLink>
            <NavLink to={ROUTES.settings}>Account Settings</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
