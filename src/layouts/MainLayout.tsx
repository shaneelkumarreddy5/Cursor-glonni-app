import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "../components/layout/BottomNav";
import { Header } from "../components/layout/Header";
import { ROUTES } from "../routes/paths";
import { useCommerce } from "../state/CommerceContext";

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
      <header className="topbar glonni-theme-topbar">
        <div className="topbar-container glonni-theme-topbar-inner">
          <Header cartCountLabel={cartCountLabel} />
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

      <BottomNav />

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
