import { Link, useNavigate } from "react-router-dom";
import { catalogProducts, type CatalogCategory, type CatalogProduct } from "../data/mockCatalog";
import { getVendorOptionsForProduct } from "../data/mockCommerce";
import { ROUTES } from "../routes/paths";
import { useAdMonetization } from "../state/AdMonetizationContext";
import { useCommerce } from "../state/CommerceContext";
import { formatInr } from "../utils/currency";

type LandingCategoryTile = {
  title: string;
  category: CatalogCategory;
  imageProductId: string;
};

const HERO_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80";

const LANDING_CATEGORIES: LandingCategoryTile[] = [
  {
    title: "Mobiles",
    category: "Mobiles",
    imageProductId: "sp-1",
  },
  {
    title: "Audio",
    category: "Accessories",
    imageProductId: "og-6",
  },
  {
    title: "Laptops",
    category: "Laptops",
    imageProductId: "og-4",
  },
  {
    title: "Wearables",
    category: "Accessories",
    imageProductId: "og-7",
  },
  {
    title: "Home Tech",
    category: "Laptops",
    imageProductId: "og-5",
  },
  {
    title: "Lifestyle",
    category: "Footwear",
    imageProductId: "og-8",
  },
];

const LANDING_PROMISES = [
  {
    title: "100% Original",
    description: "Sourced directly from brands",
  },
  {
    title: "Easy Returns",
    description: "7-day hassle-free policy",
  },
  {
    title: "Secure UPI / COD",
    description: "Safe and transparent payments",
  },
] as const;

function getCategoryRoute(category: CatalogCategory) {
  return `${ROUTES.category}?category=${encodeURIComponent(category)}`;
}

function getProductImage(productId: string) {
  return catalogProducts.find((product) => product.id === productId)?.imageUrl ?? HERO_FALLBACK_IMAGE;
}

function formatEstimatedReviewCount(product: CatalogProduct) {
  const estimate = Math.round(product.rating * 250 + product.priceInr / 90);
  if (estimate >= 1000) {
    return `${(estimate / 1000).toFixed(1)}k`;
  }
  return `${estimate}`;
}

function getDiscountPercent(product: CatalogProduct) {
  if (product.mrpInr <= product.priceInr) {
    return 0;
  }
  return Math.round(((product.mrpInr - product.priceInr) / product.mrpInr) * 100);
}

function LandingDealCard({
  product,
  sponsored,
  onAddToCart,
  onBuyNow,
}: {
  product: CatalogProduct;
  sponsored: boolean;
  onAddToCart: (product: CatalogProduct) => void;
  onBuyNow: (product: CatalogProduct) => void;
}) {
  const productRoute = ROUTES.productDetail(product.id);
  const discount = getDiscountPercent(product);
  const reviewCount = formatEstimatedReviewCount(product);

  return (
    <article className="landing-deal-card">
      <Link to={productRoute} className="landing-deal-media-link" aria-label={`View details for ${product.name}`}>
        {sponsored ? (
          <span className="landing-deal-tag">Bestseller</span>
        ) : discount > 0 ? (
          <span className="landing-deal-tag">{discount}% OFF</span>
        ) : null}
        <img
          src={product.imageUrl}
          alt={`${product.name} product image`}
          className="landing-deal-image"
          loading="lazy"
        />
      </Link>

      <div className="landing-deal-copy">
        <p className="landing-deal-rating">
          <span aria-hidden="true">★</span>
          <strong>{product.rating.toFixed(1)}</strong>
          <span>({reviewCount})</span>
        </p>

        <h3>
          <Link to={productRoute}>{product.name}</Link>
        </h3>

        <div className="landing-deal-price-row">
          <strong>{formatInr(product.priceInr)}</strong>
          <span>{formatInr(product.mrpInr)}</span>
        </div>

        <div className="landing-deal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => onAddToCart(product)}>
            Add to Cart
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onBuyNow(product)}>
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCommerce();
  const { getCatalogSponsoredFlag } = useAdMonetization();

  const catalogProductsWithVisibility = catalogProducts.map((product) => ({
    ...product,
    sponsored: getCatalogSponsoredFlag(product.id, product.sponsored),
  }));
  const sponsoredProducts = catalogProductsWithVisibility.filter((product) => product.sponsored);
  const organicProducts = catalogProductsWithVisibility.filter((product) => !product.sponsored);
  const heroProduct =
    catalogProductsWithVisibility.find((product) => product.category === "Accessories") ??
    catalogProductsWithVisibility[0];
  const trustedDeals = [...sponsoredProducts, ...organicProducts].slice(0, 4);

  function addDefaultConfigurationToCart(product: CatalogProduct) {
    const vendorOptions = getVendorOptionsForProduct(product);
    const defaultVendor = vendorOptions[0];
    if (!defaultVendor) {
      return;
    }

    addToCart({
      product,
      vendor: defaultVendor,
      selectedExtraOffer: null,
      unitPriceInr: defaultVendor.priceInr,
      unitCashbackInr: defaultVendor.cashbackInr,
    });
  }

  function handleBuyNow(product: CatalogProduct) {
    addDefaultConfigurationToCart(product);
    navigate(ROUTES.checkout);
  }

  return (
    <div className="landing-page stack">
      <section className="landing-hero card">
        <div className="landing-hero-copy">
          <span className="landing-kicker">New arrivals</span>
          <h1>
            Namaste, Arjun.
            <span> Smart tech </span>
            for your smart home.
          </h1>
          <p>
            Find the best deals on trusted brands delivered directly to your doorstep with secure
            checkout and cashback-first pricing.
          </p>
          <div className="landing-hero-actions">
            <Link to={getCategoryRoute("Mobiles")} className="btn btn-primary">
              View Offers
            </Link>
            <Link to={ROUTES.category} className="btn btn-secondary">
              Shop by Category
            </Link>
          </div>
        </div>

        <div className="landing-hero-media">
          <img
            src={heroProduct?.imageUrl ?? HERO_FALLBACK_IMAGE}
            alt="Featured smart tech product"
            className="landing-hero-image"
          />
          <div className="landing-score-chip">
            <span className="landing-score-icon" aria-hidden="true">
              ✓
            </span>
            <div>
              <p>Seller Score</p>
              <strong>4.9 / 5 Excellent</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-trust-strip" aria-label="Store guarantees">
        {LANDING_PROMISES.map((promise) => (
          <article key={promise.title} className="landing-trust-card">
            <span className="landing-trust-icon" aria-hidden="true">
              ✓
            </span>
            <div>
              <h2>{promise.title}</h2>
              <p>{promise.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="landing-category-section card">
        <header className="landing-section-header">
          <h2>Shop by Category</h2>
          <Link to={ROUTES.category}>View All</Link>
        </header>

        <div className="landing-category-row" role="list" aria-label="Primary categories">
          {LANDING_CATEGORIES.map((category) => (
            <Link
              key={category.title}
              to={getCategoryRoute(category.category)}
              className="landing-category-tile"
              role="listitem"
            >
              <span className="landing-category-image-wrap">
                <img
                  src={getProductImage(category.imageProductId)}
                  alt={`${category.title} category preview`}
                  loading="lazy"
                />
              </span>
              <span>{category.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-deals-section card">
        <header className="landing-section-header">
          <h2>Trusted Hero Deals</h2>
        </header>

        {trustedDeals.length > 0 ? (
          <div className="landing-deals-grid">
            {trustedDeals.map((product) => (
              <LandingDealCard
                key={product.id}
                product={product}
                sponsored={product.sponsored}
                onAddToCart={addDefaultConfigurationToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">No deals are available right now.</p>
        )}
      </section>
    </div>
  );
}
