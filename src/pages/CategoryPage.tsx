import { catalogProducts, type CatalogCategory } from "../data/mockCatalog";
import { formatInr } from "../utils/currency";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m12 2.5 2.93 5.93 6.55.95-4.74 4.62 1.12 6.53L12 17.45l-5.86 3.08 1.12-6.53-4.74-4.62 6.55-.95L12 2.5Z" />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20.2s-6.6-4.18-9.07-8.4A5.44 5.44 0 0 1 4.96 4.4a5.55 5.55 0 0 1 7.04 1.6 5.55 5.55 0 0 1 7.04-1.6 5.44 5.44 0 0 1 2.03 7.4C18.6 16.02 12 20.2 12 20.2Z" />
    </svg>
  );
}

export function CategoryPage() {
  const sponsoredProducts = catalogProducts.filter((product) => product.sponsored).slice(0, 4);
  const organicProducts = catalogProducts
    .filter((product) => !product.sponsored)
    .sort((first, second) => first.priceInr - second.priceInr);
  const categoryFilters: CatalogCategory[] = ["Mobiles", "Laptops", "Accessories", "Footwear"];
  const brandFilters = Array.from(
    new Map(catalogProducts.map((product) => [product.brand, product.brandLogoUrl])).entries(),
  );
  const priceFilters = ["Under ₹10,000", "₹10,000 - ₹30,000", "₹30,000 - ₹60,000", "Above ₹60,000"];
  const deliveryFilters = ["Same day", "Next day", "2-4 days"];
  const ratingFilters = ["4.5 and above", "4.0 and above", "3.5 and above"];

  const productsToRender = [...sponsoredProducts, ...organicProducts];

  return (
    <div className="plp-page stack">
      <section className="card plp-intro">
        <span className="badge plp-badge">Category listing</span>
        <h1>Discover curated products with clear pricing and offer visibility</h1>
        <p>
          Filter by category, brand, rating, and delivery preferences. Sponsored placements are
          clearly labeled for transparent browsing.
        </p>
        <div className="plp-toolbar">
          <div className="plp-filter-row" role="list" aria-label="Category filters">
            {categoryFilters.map((category) => (
              <button key={category} type="button" className="plp-filter-chip" role="listitem">
                {category}
              </button>
            ))}
          </div>
          <span className="plp-sort-pill">Sort by: Best price first</span>
        </div>
        <div className="plp-brand-filter-row" role="list" aria-label="Brand filters">
          {brandFilters.map(([brandName, logoUrl]) => (
            <button key={brandName} type="button" className="plp-brand-filter-chip" role="listitem">
              <img src={logoUrl} alt={`${brandName} logo`} />
              <span>{brandName}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="plp-layout">
        <aside className="card plp-filter-panel">
          <section className="plp-filter-group">
            <h3>Price range</h3>
            {priceFilters.map((item) => (
              <label key={item} className="plp-filter-option">
                <span>{item}</span>
                <input type="checkbox" />
              </label>
            ))}
          </section>

          <section className="plp-filter-group">
            <h3>Delivery speed</h3>
            {deliveryFilters.map((item) => (
              <label key={item} className="plp-filter-option">
                <span>{item}</span>
                <input type="checkbox" />
              </label>
            ))}
          </section>

          <section className="plp-filter-group">
            <h3>Customer rating</h3>
            {ratingFilters.map((item) => (
              <label key={item} className="plp-filter-option">
                <span>{item}</span>
                <input type="checkbox" />
              </label>
            ))}
          </section>

          <button type="button" className="btn btn-secondary btn-block">
            Clear all filters
          </button>
        </aside>

        <div className="stack-sm">
          <section className="card plp-summary">
            <p>
              Showing {productsToRender.length} products: {sponsoredProducts.length} sponsored +{" "}
              {organicProducts.length} organic.
            </p>
          </section>

          <section className="plp-grid" aria-label="Product listing grid">
            {productsToRender.map((product, index) => (
              <article key={product.id} className="plp-product-card">
                <div className="plp-image-wrap">
                  {product.sponsored ? <span className="plp-sponsored-pill">Sponsored</span> : null}
                  <button
                    type="button"
                    className="plp-wishlist-button"
                    aria-label={`Save ${product.name} to wishlist`}
                  >
                    <WishlistIcon />
                  </button>
                  <img
                    src={product.imageUrl}
                    alt={`${product.name} ${product.category} product image`}
                    className="plp-product-image"
                    loading="lazy"
                  />
                </div>

                <div className="plp-product-copy">
                  <span className="plp-category-pill">{product.category}</span>
                  <div className="plp-brand-row">
                    <img src={product.brandLogoUrl} alt={`${product.brand} logo`} className="plp-brand-logo" />
                    <span>{product.brand}</span>
                  </div>
                  <h2>{product.name}</h2>
                  <p className="plp-spec-line">{product.keySpecs.slice(0, 3).join(" • ")}</p>

                  <div className="plp-price-block">
                    <div className="plp-price-headline">
                      <strong>{formatInr(product.priceInr)}</strong>
                      <span>{formatInr(product.mrpInr)}</span>
                    </div>
                    <span className="plp-cashback-badge">{formatInr(product.cashbackInr)} Cashback</span>
                  </div>

                  {product.bestOfferLine ? <p className="plp-offer-line">{product.bestOfferLine}</p> : null}

                  <div className="plp-rating-row">
                    <span className="plp-rating-pill">
                      <StarIcon />
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="plp-rank-label">
                      {index < sponsoredProducts.length
                        ? `Sponsored slot ${index + 1}`
                        : `Organic rank ${index - sponsoredProducts.length + 1}`}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
