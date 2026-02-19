import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/paths";
import { SearchBar } from "./SearchBar";

type HeaderProps = {
  cartCountLabel: string;
  locationLabel?: string;
  userInitials?: string;
};

export function Header({
  cartCountLabel,
  locationLabel = "Mumbai",
  userInitials = "RS",
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="app-brand-block">
        <Link to={ROUTES.home} className="app-logo" aria-label="Go to Glonni home">
          <span className="app-logo-mark" aria-hidden="true">
            G
          </span>
          <span className="app-logo-text">Glonni</span>
        </Link>
        <button type="button" className="app-location-under-logo" title={locationLabel}>
          {locationLabel}
        </button>
      </div>

      <SearchBar
        placeholder="Search products, brands..."
        onSubmit={(event) => event.preventDefault()}
      />

      <div className="app-header-actions">
        <Link to={ROUTES.cart} className="app-cart-button" aria-label="Open cart">
          <span aria-hidden="true">🛒</span>
          <strong>{cartCountLabel}</strong>
        </Link>

        <Link to={ROUTES.settings} className="app-user-avatar" aria-label="Open my account">
          <span aria-hidden="true">{userInitials}</span>
        </Link>
      </div>
    </header>
  );
}
