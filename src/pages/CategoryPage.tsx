import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { catalogProducts, type CatalogCategory } from "../data/mockCatalog";
import { ROUTES } from "../routes/paths";
import { useAdMonetization } from "../state/AdMonetizationContext";
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

type SortOption = "price-low-high" | "price-high-low" | "popularity";

type PriceFilter = {
  id: string;
  label: string;
  min: number;
  max: number | null;
};

const PRICE_FILTERS: PriceFilter[] = [
  { id: "under-10000", label: "Under ₹10,000", min: 0, max: 10000 },
  { id: "10000-30000", label: "₹10,000 - ₹30,000", min: 10000, max: 30000 },
  { id: "30000-60000", label: "₹30,000 - ₹60,000", min: 30000, max: 60000 },
  { id: "above-60000", label: "Above ₹60,000", min: 60000, max: null },
];

function isWithinAnySelectedPriceRange(priceInr: number, selectedPriceRangeIds: string[]) {
  if (selectedPriceRangeIds.length === 0) {
    return true;
  }

  return selectedPriceRangeIds.some((selectedId) => {
    const matchingRange = PRICE_FILTERS.find((range) => range.id === selectedId);
    if (!matchingRange) {
      return false;
    }

    const isAtLeastMin = priceInr >= matchingRange.min;
    const isWithinMax =
      matchingRange.max === null ? true : priceInr <= matchingRange.max;
    return isAtLeastMin && isWithinMax;
  });
}

export function CategoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSort, setSelectedSort] = useState<SortOption>("popularity");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [cashbackOnly, setCashbackOnly] = useState(false);
  const { getCatalogSponsoredFlag } = useAdMonetization();
  const categoryFilters: Array<CatalogCategory | "All"> = [
    "All",
    "Mobiles",
    "Laptops",
    "Accessories",
    "Footwear",
  ];
  const requestedCategory = searchParams.get("category");
  const selectedCategory: CatalogCategory | "All" = categoryFilters.includes(
    requestedCategory as CatalogCategory | "All",
  )
    ? (requestedCategory as CatalogCategory | "All")
    : "All";

  const categoryScopedProducts =
    selectedCategory === "All"
      ? catalogProducts
      : catalogProducts.filter((product) => product.category === selectedCategory);

  const categoryScopedProductsWithVisibility = useMemo(
    () =>
      categoryScopedProducts.map((product) => ({
        ...product,
        sponsored: getCatalogSponsoredFlag(product.id, product.sponsored),
      })),
    [categoryScopedProducts, getCatalogSponsoredFlag],
  );

  const brandFilters = Array.from(
    new Map(
      categoryScopedProductsWithVisibility.map((product) => [product.brand, product.brandLogoUrl]),
    ).entries(),
  );

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = categoryScopedProductsWithVisibility.filter((product) => {
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesPrice = isWithinAnySelectedPriceRange(
        product.priceInr,
        selectedPriceRanges,
      );
      const matchesCashback = cashbackOnly ? product.cashbackInr > 0 : true;
      return matchesBrand && matchesPrice && matchesCashback;
    });

    const sponsoredProducts = filtered.filter((product) => product.sponsored);
    const organicProducts = filtered.filter((product) => !product.sponsored);
    const sortProducts = (
      productsToSort: typeof filtered,
    ) => {
      const nextProducts = [...productsToSort];
      if (selectedSort === "price-low-high") {
        return nextProducts.sort((first, second) => first.priceInr - second.priceInr);
      }
      if (selectedSort === "price-high-low") {
        return nextProducts.sort((first, second) => second.priceInr - first.priceInr);
      }
      return nextProducts.sort((first, second) => {
        if (second.rating !== first.rating) {
          return second.rating - first.rating;
        }
        return first.priceInr - second.priceInr;
      });
    };

    return [...sortProducts(sponsoredProducts), ...sortProducts(organicProducts)];
  }, [
    cashbackOnly,
    categoryScopedProductsWithVisibility,
    selectedBrands,
    selectedPriceRanges,
    selectedSort,
  ]);

  const sponsoredVisibleCount = filteredAndSortedProducts.filter(
    (product) => product.sponsored,
  ).length;
  const organicVisibleCount = filteredAndSortedProducts.length - sponsoredVisibleCount;

  function updateCategorySelection(nextCategory: CatalogCategory | "All") {
    const nextParams = new URLSearchParams(searchParams);
    if (nextCategory === "All") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", nextCategory);
    }
    setSearchParams(nextParams);
  }

  function toggleBrand(brandName: string) {
    setSelectedBrands((currentBrands) =>
      currentBrands.includes(brandName)
        ? currentBrands.filter((brand) => brand !== brandName)
        : [...currentBrands, brandName],
    );
  }

  function togglePriceRange(priceRangeId: string) {
    setSelectedPriceRanges((currentRanges) =>
      currentRanges.includes(priceRangeId)
        ? currentRanges.filter((range) => range !== priceRangeId)
        : [...currentRanges, priceRangeId],
    );
  }

  function clearAllFilters() {
    setSelectedSort("popularity");
    setSelectedBrands([]);
    setSelectedPriceRanges([]);
    setCashbackOnly(false);
  }

  return (
    <div className="plp-page stack">
      <section className="card plp-intro">
        <span className="badge plp-badge">Category listing</span>
        <h1>Discover curated products with clear pricing and offer visibility</h1>
        <p>
          Filter by category, brand, price, cashback, and sorting preference for transparent
          browsing.
        </p>
        <div className="plp-toolbar">
          <div className="plp-filter-row" role="list" aria-label="Category filters">
            {categoryFilters.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "plp-filter-chip is-selected"
                    : "plp-filter-chip"
                }
                role="listitem"
                onClick={() => updateCategorySelection(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="plp-sort-control">
            Sort by
            <select
              value={selectedSort}
              onChange={(event) => setSelectedSort(event.target.value as SortOption)}
            >
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
          </label>
        </div>
        <div className="plp-brand-filter-row" role="list" aria-label="Brand filters">
          {brandFilters.map(([brandName, logoUrl]) => (
            <button
              key={brandName}
              type="button"
              className={
                selectedBrands.includes(brandName)
                  ? "plp-brand-filter-chip is-selected"
                  : "plp-brand-filter-chip"
              }
              role="listitem"
              onClick={() => toggleBrand(brandName)}
            >
              <img src={logoUrl} alt={`${brandName} logo`} />
              <span>{brandName}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="plp-layout">
        <aside className="card plp-filter-panel">
          <section className="plp-filter-group">
            <h3>Brand</h3>
            {brandFilters.map(([brandName]) => (
              <label key={brandName} className="plp-filter-option">
                <span>{brandName}</span>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brandName)}
                  onChange={() => toggleBrand(brandName)}
                />
              </label>
            ))}
          </section>

          <section className="plp-filter-group">
            <h3>Price range</h3>
            {PRICE_FILTERS.map((priceRange) => (
              <label key={priceRange.id} className="plp-filter-option">
                <span>{priceRange.label}</span>
                <input
                  type="checkbox"
                  checked={selectedPriceRanges.includes(priceRange.id)}
                  onChange={() => togglePriceRange(priceRange.id)}
                />
              </label>
            ))}
          </section>

          <section className="plp-filter-group">
            <h3>Cashback</h3>
            <label className="plp-filter-option">
              <span>Cashback available only</span>
              <input
                type="checkbox"
                checked={cashbackOnly}
                onChange={(event) => setCashbackOnly(event.target.checked)}
              />
            </label>
          </section>

          <button type="button" className="btn btn-secondary btn-block" onClick={clearAllFilters}>
            Clear all filters
          </button>
        </aside>

        <div className="stack-sm">
          <section className="card plp-summary">
            <p>
              Showing {filteredAndSortedProducts.length} products: {sponsoredVisibleCount} sponsored
              {" + "}
              {organicVisibleCount} organic.
            </p>
          </section>

          {filteredAndSortedProducts.length > 0 ? (
            <section className="plp-grid" aria-label="Product listing grid">
              {filteredAndSortedProducts.map((product, index) => {
                const productRoute = ROUTES.productDetail(product.id);

                return (
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
                      <Link to={productRoute}>
                        <img
                          src={product.imageUrl}
                          alt={`${product.name} ${product.category} product image`}
                          className="plp-product-image"
                          loading="lazy"
                        />
                      </Link>
                    </div>

                    <div className="plp-product-copy">
                      <span className="plp-category-pill">{product.category}</span>
                      <div className="plp-brand-row">
                        <img
                          src={product.brandLogoUrl}
                          alt={`${product.brand} logo`}
                          className="plp-brand-logo"
                        />
                        <span>{product.brand}</span>
                      </div>
                      <h2>
                        <Link to={productRoute}>{product.name}</Link>
                      </h2>
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
                          {selectedSort === "popularity" ? `Popularity rank ${index + 1}` : "Sorted result"}
                        </span>
                      </div>

                      <div className="inline-actions">
                        <Link to={productRoute} className="btn btn-secondary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <section className="card">
              <p className="empty-state">
                No products found for the selected filters. Try clearing one or more filters.
              </p>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
