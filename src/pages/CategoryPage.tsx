type ProductCategory = "Mobiles" | "Laptops" | "Footwear";

type MockProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  priceInr: number;
  cashbackInr: number;
  rating: number;
  isSponsored: boolean;
  bestOfferLine?: string;
  imageUrl: string;
};

const mockProducts: MockProduct[] = [
  {
    id: "sp-1",
    name: "Glonni Spark X7 5G",
    category: "Mobiles",
    priceInr: 27999,
    cashbackInr: 1300,
    rating: 4.6,
    isSponsored: true,
    bestOfferLine: "Best offer: Instant ₹2,000 bank discount on select cards.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sp-2",
    name: "PixelEdge Pro 128GB",
    category: "Mobiles",
    priceInr: 32999,
    cashbackInr: 1600,
    rating: 4.7,
    isSponsored: true,
    bestOfferLine: "Best offer: Exchange bonus up to ₹4,500.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sp-3",
    name: "AeroBook Slim 14",
    category: "Laptops",
    priceInr: 58999,
    cashbackInr: 2500,
    rating: 4.5,
    isSponsored: true,
    bestOfferLine: "Best offer: No-cost EMI plus ₹3,000 instant discount.",
    imageUrl: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sp-4",
    name: "SprintFlex Runner Elite",
    category: "Footwear",
    priceInr: 4299,
    cashbackInr: 260,
    rating: 4.4,
    isSponsored: true,
    bestOfferLine: "Best offer: Buy two running essentials and save ₹700.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-1",
    name: "UrbanStep Knit Slip-On",
    category: "Footwear",
    priceInr: 1899,
    cashbackInr: 120,
    rating: 4.2,
    isSponsored: false,
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-2",
    name: "TrailEdge Trekking Shoe",
    category: "Footwear",
    priceInr: 2499,
    cashbackInr: 150,
    rating: 4.3,
    isSponsored: false,
    bestOfferLine: "Best offer: Flat ₹300 off with coupon STEP300.",
    imageUrl: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-3",
    name: "MotoNova G15 5G",
    category: "Mobiles",
    priceInr: 11999,
    cashbackInr: 500,
    rating: 4.3,
    isSponsored: false,
    bestOfferLine: "Best offer: Extra ₹1,000 off on prepaid orders.",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-4",
    name: "Redmi Pulse Note 12",
    category: "Mobiles",
    priceInr: 13499,
    cashbackInr: 550,
    rating: 4.1,
    isSponsored: false,
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-5",
    name: "Vivo LiteCam 5G",
    category: "Mobiles",
    priceInr: 16999,
    cashbackInr: 700,
    rating: 4.4,
    isSponsored: false,
    bestOfferLine: "Best offer: Student deal worth ₹1,200.",
    imageUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-6",
    name: "ThinkCore Student 15",
    category: "Laptops",
    priceInr: 45999,
    cashbackInr: 1800,
    rating: 4.5,
    isSponsored: false,
    bestOfferLine: "Best offer: Cashback boost to ₹2,500 on UPI payment.",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-7",
    name: "SwiftBook Air 13",
    category: "Laptops",
    priceInr: 52999,
    cashbackInr: 2100,
    rating: 4.6,
    isSponsored: false,
    imageUrl: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-8",
    name: "CreatorPro Vision 16",
    category: "Laptops",
    priceInr: 79999,
    cashbackInr: 3200,
    rating: 4.7,
    isSponsored: false,
    bestOfferLine: "Best offer: Bundle savings worth ₹5,000 on accessories.",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
  },
];

const categoryFilters: ProductCategory[] = ["Mobiles", "Laptops", "Footwear"];

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatInr(value: number) {
  return inrFormatter.format(value);
}

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
  const sponsoredProducts = mockProducts.filter((product) => product.isSponsored).slice(0, 4);
  const organicProducts = mockProducts
    .filter((product) => !product.isSponsored)
    .sort((first, second) => first.priceInr - second.priceInr);

  const productsToRender = [...sponsoredProducts, ...organicProducts];

  return (
    <div className="plp-page stack">
      <section className="card plp-intro">
        <span className="badge plp-badge">PLP</span>
        <h1>Category Listing - Mobiles, Laptops, and Footwear</h1>
        <p>
          First 4 cards are sponsored placements. All remaining cards are organic products sorted
          by best price.
        </p>
        <div className="plp-toolbar">
          <div className="plp-filter-row" role="list" aria-label="Category filters">
            {categoryFilters.map((category) => (
              <button key={category} type="button" className="plp-filter-chip" role="listitem">
                {category}
              </button>
            ))}
          </div>
          <span className="plp-sort-pill">Sort: Best Price</span>
        </div>
      </section>

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
              {product.isSponsored ? <span className="plp-sponsored-pill">Sponsored</span> : null}
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
              <h2>{product.name}</h2>

              <div className="plp-price-block">
                <strong>{formatInr(product.priceInr)}</strong>
                <span>Cashback: {formatInr(product.cashbackInr)}</span>
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
                    : `Best price rank ${index - sponsoredProducts.length + 1}`}
                </span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
