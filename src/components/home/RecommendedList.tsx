import { Link } from "react-router-dom";
import { FilterIcon } from "../ui/FilterIcon";
import { ROUTES } from "../../routes/paths";
import { formatInr } from "../../utils/currency";
import { type HomeProduct } from "./types";

type RecommendedListProps = {
  products: HomeProduct[];
  onAddToCart: (productId: string) => void;
  onBuyNow: (productId: string) => void;
};

export function RecommendedList({
  products,
  onAddToCart,
  onBuyNow,
}: RecommendedListProps) {
  return (
    <section className="home-section-card">
      <header className="home-section-header-row">
        <h2>Recommended For You</h2>
        <button type="button" className="app-filter-button" aria-label="Recommended filters">
          <FilterIcon />
        </button>
      </header>

      <div className="home-recommended-list">
        {products.map((product) => (
          <article key={product.id} className="home-recommended-item">
            <Link to={ROUTES.productDetail(product.id)} className="home-recommended-media">
              <img src={product.imageUrl} alt={product.name} loading="lazy" />
            </Link>
            <div className="home-recommended-copy">
              <p className="home-product-brand">{product.brand}</p>
              <h3>
                <Link to={ROUTES.productDetail(product.id)}>{product.name}</Link>
              </h3>
              <p className="home-price-line">
                <strong>{formatInr(product.priceInr)}</strong>
                {product.mrpInr > product.priceInr ? (
                  <span>{formatInr(product.mrpInr)}</span>
                ) : null}
              </p>
              <p className="home-cashback-badge">Earn {formatInr(product.cashbackInr)}</p>
              <div className="home-mini-actions">
                <button type="button" className="btn btn-secondary" onClick={() => onAddToCart(product.id)}>
                  Add
                </button>
                <button type="button" className="btn btn-primary" onClick={() => onBuyNow(product.id)}>
                  Buy
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
