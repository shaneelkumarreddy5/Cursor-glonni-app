import { Link, useNavigate } from "react-router-dom";
import { type ReactNode } from "react";
import {
  bankOffers,
  catalogProducts,
  homeCategoryTiles,
  topBrandHighlights,
  type CatalogCategory,
  type CatalogProduct,
  type HomeCategoryTile,
} from "../data/mockCatalog";
import { getVendorOptionsForProduct } from "../data/mockCommerce";
import { ROUTES } from "../routes/paths";
import { useAdMonetization } from "../state/AdMonetizationContext";
import { useCommerce } from "../state/CommerceContext";
import { formatInr } from "../utils/currency";

type HeroSlide = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

const heroSlides: HeroSlide[] = [
  {
    title: "Smartphone Upgrade Days",
    subtitle: "Flagship and mid-range picks with exchange bonus and instant offers.",
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3f8ec8d146f8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Work and Study Essentials",
    subtitle: "Laptops, earbuds, and accessories curated for daily productivity.",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Weekend Fashion and Lifestyle",
    subtitle: "Shoes and style picks with free shipping and easy returns.",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
  },
];

const CATEGORY_ROUTE_MAP: Record<HomeCategoryTile["name"], CatalogCategory> = {
  Electronics: "Mobiles",
  Fashion: "Footwear",
  Beauty: "Accessories",
  Home: "Laptops",
  Grocery: "Accessories",
};

function getCategoryRoute(categoryName: HomeCategoryTile["name"]) {
  const mappedCategory = CATEGORY_ROUTE_MAP[categoryName];
  return `${ROUTES.category}?category=${encodeURIComponent(mappedCategory)}`;
}

function CategoryIcon({
  icon,
}: {
  icon: "electronics" | "fashion" | "beauty" | "home" | "grocery";
}) {
  if (icon === "electronics") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 20h8" />
      </svg>
    );
  }

  if (icon === "fashion") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4c0 2 1.8 3 4 3s4-1 4-3l4 3-2 13H6L4 7l4-3Z" />
      </svg>
    );
  }

  if (icon === "beauty") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 4h6v3H9z" />
        <path d="M8 7h8l-1 13H9L8 7Z" />
      </svg>
    );
  }

  if (icon === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 11 9-7 9 7" />
        <path d="M6 10v10h12V10" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14" />
      <path d="M7 7v12h10V7" />
      <path d="M9 11h6" />
      <path d="M9 14h6" />
    </svg>
  );
}

function HomeSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="card home-section">
      <header className="home-section-header">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

function HomeProductCard({
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

  return (
    <article className="home-product-card">
      <Link to={productRoute} aria-label={`View details for ${product.name}`}>
        <div className="home-media-wrap">
          {sponsored ? <span className="home-pill home-pill-sponsored">Sponsored</span> : null}
          <img
            src={product.brandLogoUrl}
            alt={`${product.brand} logo`}
            className="home-product-brand-logo"
            loading="lazy"
          />
          <img
            src={product.imageUrl}
            alt={`${product.name} ${product.category} product image`}
            className="home-media"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="home-product-copy">
        <div className="home-badge-row">
          <span className="home-pill">{product.category}</span>
          <span className="home-pill">Rating {product.rating.toFixed(1)}</span>
        </div>
        <h3>
          <Link to={productRoute}>{product.name}</Link>
        </h3>
        <p className="home-spec-line">{product.keySpecs.slice(0, 2).join(" • ")}</p>
        <div className="home-price-row">
          <strong>{formatInr(product.priceInr)}</strong>
          <span>{formatInr(product.mrpInr)}</span>
        </div>
        <span className="home-cashback-badge">{formatInr(product.cashbackInr)} Cashback</span>
        <div className="inline-actions">
          <button type="button" className="btn btn-primary" onClick={() => onAddToCart(product)}>
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
  const sponsoredProducts = catalogProductsWithVisibility
    .filter((product) => product.sponsored)
    .slice(0, 4);
  const organicProducts = catalogProductsWithVisibility.filter(
    (product) => !product.sponsored,
  );
  const regularProducts = organicProducts.slice(0, 8);
  const recommendedProducts = organicProducts
    .slice()
    .sort((first, second) => second.rating - first.rating)
    .slice(0, 4);

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
    <div className="home-landing stack">
      <section className="card home-banner">
        <header className="home-banner-header">
          <span className="badge home-badge">New season launch</span>
          <h1>Modern shopping, minimal interface, faster checkout</h1>
          <p>
            Discover curated products from trusted Indian sellers across mobiles, laptops,
            accessories, and lifestyle categories.
          </p>
          <div className="chip-row" aria-label="Store highlights">
            <span className="chip">Free delivery above ₹15,000</span>
            <span className="chip">Secure payment methods</span>
            <span className="chip">Real-time order tracking</span>
          </div>
          <div className="inline-actions">
            <Link to={ROUTES.category} className="btn btn-primary home-cta">
              Start Shopping
            </Link>
            <Link to={ROUTES.product} className="btn btn-secondary home-cta-secondary">
              View Details
            </Link>
          </div>
        </header>
        <div className="home-carousel-track" role="region" aria-label="Glonni campaigns">
          {heroSlides.map((slide) => (
            <article key={slide.title} className="home-carousel-slide">
              <div>
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
              </div>
              <img src={slide.imageUrl} alt={slide.title} className="home-slide-art-image" loading="lazy" />
            </article>
          ))}
        </div>
      </section>

      <HomeSection title="Shop by category" subtitle="Jump into focused shopping lanes in one click.">
        <div className="home-category-grid" role="list" aria-label="Category cards">
          {homeCategoryTiles.map((category) => (
            <Link
              key={category.name}
              to={getCategoryRoute(category.name)}
              className="home-category-card"
              role="listitem"
            >
              <span className="home-category-icon-wrap" aria-hidden="true">
                <CategoryIcon icon={category.icon} />
              </span>
              <h3>{category.name}</h3>
              <p>{category.itemCount}</p>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Sponsored products"
        subtitle="Paid placements are clearly marked for transparent discovery."
      >
        {sponsoredProducts.length > 0 ? (
          <div className="home-product-grid">
            {sponsoredProducts.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                sponsored={true}
                onAddToCart={addDefaultConfigurationToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">
            No sponsored products are active right now. Check regular products below.
          </p>
        )}
      </HomeSection>

      <HomeSection
        title="Regular products"
        subtitle="Browse the everyday catalog with clear pricing and cashback visibility."
      >
        {regularProducts.length > 0 ? (
          <div className="home-product-grid">
            {regularProducts.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                sponsored={false}
                onAddToCart={addDefaultConfigurationToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">Regular products are currently unavailable.</p>
        )}
      </HomeSection>

      <section className="card home-bank-strip">
        <header className="home-section-header">
          <h2>Bank Offers</h2>
          <p>Instant discounts and cashback from partner banks.</p>
        </header>
        <div className="home-bank-offer-row" role="list" aria-label="Bank offers">
          {bankOffers.map((offer) => (
            <article key={offer.bankName} className="home-bank-offer-card" role="listitem">
              <img src={offer.logoUrl} alt={`${offer.bankName} logo`} className="home-bank-logo" />
              <p>{offer.offerText}</p>
            </article>
          ))}
        </div>
      </section>

      <HomeSection
        title="Top brands"
        subtitle="Most trusted electronics and lifestyle brands this week."
      >
        <div className="home-brand-grid">
          {topBrandHighlights.map((brand) => (
            <article key={brand.name} className="home-brand-card">
              <img src={brand.logoUrl} alt={`${brand.name} logo`} className="home-brand-logo-img" />
              <div>
                <h3>{brand.name}</h3>
                <p>{brand.focus}</p>
              </div>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection title="Recommended for you" subtitle="Personalized picks based on current trends.">
        {recommendedProducts.length > 0 ? (
          <div className="home-product-grid">
            {recommendedProducts.map((product) => (
              <HomeProductCard
                key={product.id}
                product={product}
                sponsored={false}
                onAddToCart={addDefaultConfigurationToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">No recommendations are available right now.</p>
        )}
      </HomeSection>
    </div>
  );
}
