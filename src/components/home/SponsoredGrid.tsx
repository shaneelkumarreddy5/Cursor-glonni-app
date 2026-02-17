import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/paths";
import { formatInr } from "../../utils/currency";
import { type HomeProduct } from "./types";

type SponsoredGridProps = {
  products: HomeProduct[];
  onAddToCart: (productId: string) => void;
  onBuyNow: (productId: string) => void;
};

export function SponsoredGrid({
  products,
  onAddToCart,
  onBuyNow,
}: SponsoredGridProps) {
  return (
    <section className="home-section-card">
      <header className="home-section-header-row">
        <h2>Sponsored Deals</h2>
        <span className="home-section-pill">Sponsored</span>
      </header>
      <div className="home-sponsored-grid">
        {products.map((product) => (
          <article key={product.id} className="home-product-tile">
            <Link to={ROUTES.productDetail(product.id)} className="home-product-media">
              <span className="home-sponsored-tag">Sponsored</span>
              <img src={product.imageUrl} alt={product.name} loading="lazy" />
            </Link>
            <div className="home-product-copy">
              <h3>
                <Link to={ROUTES.productDetail(product.id)}>{product.name}</Link>
              </h3>
              <p className="home-price-line">
                <strong>{formatInr(product.priceInr)}</strong>
                {product.mrpInr > product.priceInr ? (
                  <span>{formatInr(product.mrpInr)}</span>
                ) : null}
              </p>
              <p className="home-cashback-badge">
                Cashback {formatInr(product.cashbackInr)}
              </p>
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
