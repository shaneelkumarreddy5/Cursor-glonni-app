import { Link } from "react-router-dom";
import { FilterIcon } from "../ui/FilterIcon";
import { ROUTES } from "../../routes/paths";
import { formatInr } from "../../utils/currency";
import { type HomeProduct } from "./types";

type FlashDealsProps = {
  products: HomeProduct[];
  getDiscountLabel: (productId: string) => string;
};

export function FlashDeals({ products, getDiscountLabel }: FlashDealsProps) {
  return (
    <section className="home-flash-section">
      <header className="home-section-header-row home-section-header-inverse">
        <h2>Flash Deals</h2>
        <div className="home-inline-meta">
          <button type="button" className="app-filter-button" aria-label="Flash deal filters">
            <FilterIcon />
          </button>
          <span className="home-timer-chip">02:45:10</span>
        </div>
      </header>

      <article className="home-flash-highlight">
        <strong>UP TO 40% CASHBACK</strong>
        <p>Deal timer is visual only in this prototype.</p>
      </article>

      <div className="home-flash-scroll">
        {products.map((product) => (
          <article key={product.id} className="home-flash-tile">
            <span className="home-flash-discount">{getDiscountLabel(product.id)}</span>
            <Link to={ROUTES.productDetail(product.id)} className="home-flash-media">
              <img src={product.imageUrl} alt={product.name} loading="lazy" />
            </Link>
            <h3>
              <Link to={ROUTES.productDetail(product.id)}>{product.name}</Link>
            </h3>
            <p className="home-price-line">
              <strong>{formatInr(product.priceInr)}</strong>
              {product.mrpInr > product.priceInr ? <span>{formatInr(product.mrpInr)}</span> : null}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
