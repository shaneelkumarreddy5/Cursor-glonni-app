import { Link } from "react-router-dom";
import { ROUTES } from "../../routes/paths";
import { type CatalogProduct } from "../../data/mockCatalog";
import { formatInr } from "../../utils/currency";

type HomeProductRailProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  products: CatalogProduct[];
  onAddToCart?: (productId: string) => void;
};

function StarIcon({ variant }: { variant: "filled" | "empty" }) {
  const className = variant === "filled" ? "home-rating-star is-filled" : "home-rating-star";
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d="m12 2.5 2.93 5.93 6.55.95-4.74 4.62 1.12 6.53L12 17.45l-5.86 3.08 1.12-6.53-4.74-4.62 6.55-.95L12 2.5Z" />
    </svg>
  );
}

function RatingRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  const stars = Array.from({ length: 5 }, (_, index) => (index < rounded ? "filled" : "empty"));
  return (
    <div className="home-rating-row" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <span className="home-rating-stars" aria-hidden="true">
        {stars.map((variant, index) => (
          <StarIcon key={`${variant}-${index}`} variant={variant as "filled" | "empty"} />
        ))}
      </span>
      <span className="home-rating-text">{rating.toFixed(1)}</span>
    </div>
  );
}

export function HomeProductRail({
  title,
  subtitle,
  badge,
  products,
  onAddToCart,
}: HomeProductRailProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="home-section-card">
      <header className="home-section-header-row">
        <div className="home-section-header-copy">
          <h2>{title}</h2>
          {subtitle ? <p className="home-section-subtitle">{subtitle}</p> : null}
        </div>
        {badge ? <span className="home-section-pill">{badge}</span> : null}
      </header>

      <div className="home-rail-track" role="list" aria-label={title}>
        {products.map((product) => (
          <article key={product.id} className="home-rail-card" role="listitem">
            <Link to={ROUTES.productDetail(product.id)} className="home-rail-media">
              <img src={product.imageUrl} alt={product.name} loading="lazy" />
            </Link>
            <div className="home-rail-copy">
              <h3 className="home-rail-title">
                <Link to={ROUTES.productDetail(product.id)}>{product.name}</Link>
              </h3>
              <RatingRow rating={product.rating} />
              <p className="home-rail-price">
                <strong>{formatInr(product.priceInr)}</strong>
                {product.mrpInr > product.priceInr ? <span>{formatInr(product.mrpInr)}</span> : null}
              </p>
              {product.cashbackInr > 0 ? (
                <p className="home-cashback-badge">Cashback {formatInr(product.cashbackInr)}</p>
              ) : null}
              {onAddToCart ? (
                <button
                  type="button"
                  className="btn btn-primary btn-block home-rail-cta"
                  onClick={() => onAddToCart(product.id)}
                >
                  Add to Cart
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

