import { Link } from "react-router-dom";
import { FilterIcon } from "../ui/FilterIcon";
import { ROUTES } from "../../routes/paths";
import { formatInr } from "../../utils/currency";
import { type HomeProduct } from "./types";

type TrendingNearYouProps = {
  products: HomeProduct[];
  locationLabel?: string;
};

export function TrendingNearYou({
  products,
  locationLabel = "Mumbai",
}: TrendingNearYouProps) {
  return (
    <section className="home-section-card">
      <header className="home-section-header-row">
        <h2>Trending Near You - {locationLabel}</h2>
        <button type="button" className="app-filter-button" aria-label="Trending filters">
          <FilterIcon />
        </button>
      </header>

      <div className="home-trending-grid">
        {products.map((product) => (
          <article key={product.id} className="home-trending-card">
            <Link to={ROUTES.productDetail(product.id)} className="home-trending-media">
              <img src={product.imageUrl} alt={product.name} loading="lazy" />
            </Link>
            <h3>
              <Link to={ROUTES.productDetail(product.id)}>{product.name}</Link>
            </h3>
            <p className="home-price-line">
              <strong>{formatInr(product.priceInr)}</strong>
              {product.mrpInr > product.priceInr ? <span>{formatInr(product.mrpInr)}</span> : null}
            </p>
            <p className="home-cashback-badge">Cashback {formatInr(product.cashbackInr)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
