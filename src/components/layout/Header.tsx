import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/paths";

type HeaderProps = {
  cartCountLabel: string;
  locationLabel?: string;
};

export function Header({
  cartCountLabel,
  locationLabel = "Mumbai 400001",
}: HeaderProps) {
  return (
    <header className="app-header">
      <Link to={ROUTES.home} className="app-logo" aria-label="Go to Glonni home">
        <span className="app-logo-mark" aria-hidden="true">
          G
        </span>
        <span className="app-logo-text">Glonni</span>
      </Link>

      <button type="button" className="app-location-selector">
        <span aria-hidden="true">📍</span>
        <span>{locationLabel}</span>
      </button>

      <Link to={ROUTES.cart} className="app-cart-button" aria-label="Open cart">
        <span aria-hidden="true">🛒</span>
        <strong>{cartCountLabel}</strong>
      </Link>
    </header>
  );
}
