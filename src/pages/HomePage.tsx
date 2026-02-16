import { Link, useNavigate } from "react-router-dom";
import { catalogProducts, type CatalogCategory, type CatalogProduct } from "../data/mockCatalog";
import { getVendorOptionsForProduct } from "../data/mockCommerce";
import { ROUTES } from "../routes/paths";
import { useAdMonetization } from "../state/AdMonetizationContext";
import { useCommerce } from "../state/CommerceContext";
import { formatInr } from "../utils/currency";
import "../styles/homepage-glonni.css";

type HeroSlide = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTo: string;
  imageUrl: string;
};

type HomeCategoryTile = {
  title: string;
  category: CatalogCategory;
  imageProductId: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    title: "Shop and Earn Real Money",
    subtitle: "Get up to 20% instant cashback on top global brands.",
    ctaLabel: "Shop Now",
    ctaTo: `${ROUTES.category}?category=Mobiles`,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDC7N4t2J3BHQ9sbbDuinU4yYreLsYs5Y11TgF9RgjU7jLRNvELugFCfXKQrBHWMSEyIFvIYb9pDYD3ieganbZNO5vGJJi33tJt8QPbf_qFsgMMrJwmbMlpLAkBxW78aaAWy2V-Y4RgPJSch5oq-_B17r6SUrtocW4p1doOnFkBwOdjbsagv1Kn__RwpsaLyMloOdZlpIl4xnI4y3c2n4p9Zn8rOT41410604ul8kLUyGd-b6tLPs0xCOtJM2GiHf8JOP09qD_GxCc",
  },
  {
    title: "Tech Deals",
    subtitle: "Latest gadgets at lowest prices with trusted delivery.",
    ctaLabel: "Explore",
    ctaTo: `${ROUTES.category}?category=Accessories`,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB6H0jQc6K2ZfxVvMsUbpXAZXWwitGsUcsopJIvXg2kl8YVUYOpmLtwC35nWDT0fqDaktzOYmpMrwNq0pkSjzn10gmDaH8C8REl_gGvtO1FhOUF_22ztaiz2fMza3xERqgVhgWrklTwhNNoiPwshW3SkXc0crI2WGI8-PBuCgp3OsoEBqGrR7EnvlF8-RcMzZ069KlmrQ3_uI6ItoKrHDqrsHbLcQVfZruN5-HGQyXLgeFb9f28r6TlN8e-ONi7XYkSwkdR0LsSKOk",
  },
];

const HOME_CATEGORIES: HomeCategoryTile[] = [
  { title: "Electronics", category: "Mobiles", imageProductId: "sp-1" },
  { title: "Fashion", category: "Footwear", imageProductId: "og-8" },
  { title: "Home", category: "Laptops", imageProductId: "og-4" },
  { title: "Beauty", category: "Accessories", imageProductId: "og-6" },
  { title: "Grocery", category: "Accessories", imageProductId: "og-7" },
];

const TRUST_ITEMS = [
  "Secure Payments",
  "Easy Returns",
  "Cashback Guarantee",
] as const;

const RECENTLY_VIEWED_IDS = ["og-7", "og-8"] as const;

const BRAND_NAMES = ["Samsung", "Nike", "Apple", "Adidas"] as const;

const HOME_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80";

function getCategoryRoute(category: CatalogCategory) {
  return `${ROUTES.category}?category=${encodeURIComponent(category)}`;
}

function getProductImage(productId: string) {
  return catalogProducts.find((product) => product.id === productId)?.imageUrl ?? HOME_FALLBACK_IMAGE;
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

function isProduct(value: CatalogProduct | undefined): value is CatalogProduct {
  return Boolean(value);
}

function SponsoredDealCard({
  product,
  onAddToCart,
  onBuyNow,
}: {
  product: CatalogProduct;
  onAddToCart: (product: CatalogProduct) => void;
  onBuyNow: (product: CatalogProduct) => void;
}) {
  const productRoute = ROUTES.productDetail(product.id);
  const reviewCount = formatEstimatedReviewCount(product);

  return (
    <article className="gh-sponsored-card">
      <Link to={productRoute} className="gh-sponsored-media-link">
        <span className="gh-sponsored-pill">Sponsored</span>
        <img src={product.imageUrl} alt={`${product.name} product image`} loading="lazy" />
      </Link>
      <div className="gh-sponsored-copy">
        <h3>
          <Link to={productRoute}>{product.name}</Link>
        </h3>
        <p className="gh-rating-row">
          <strong>{product.rating.toFixed(1)}</strong>
          <span>({reviewCount})</span>
        </p>
        <p className="gh-price-row">
          <strong>{formatInr(product.priceInr)}</strong>
          {product.mrpInr > product.priceInr ? <span>{formatInr(product.mrpInr)}</span> : null}
        </p>
        <p className="gh-cashback-pill">Cashback {formatInr(product.cashbackInr)}</p>
        <div className="gh-card-actions">
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

  const productsWithVisibility = catalogProducts.map((product) => ({
    ...product,
    sponsored: getCatalogSponsoredFlag(product.id, product.sponsored),
  }));

  const sponsoredProducts = productsWithVisibility.filter((product) => product.sponsored);
  const organicProducts = productsWithVisibility.filter((product) => !product.sponsored);

  const sponsoredDeals =
    sponsoredProducts.length >= 2 ? sponsoredProducts.slice(0, 2) : productsWithVisibility.slice(0, 2);

  const flashDeals = [...productsWithVisibility]
    .sort((first, second) => getDiscountPercent(second) - getDiscountPercent(first))
    .slice(0, 2);

  const trendingProducts = [...productsWithVisibility]
    .sort((first, second) => second.rating - first.rating)
    .slice(0, 2);

  const recommendedProducts = [...organicProducts, ...sponsoredProducts].slice(0, 2);

  const recentlyViewedProducts = RECENTLY_VIEWED_IDS.map((id) =>
    productsWithVisibility.find((product) => product.id === id),
  ).filter(isProduct);

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
    <div className="glonni-home">
      <section className="gh-inline-controls" aria-label="Delivery and search">
        <button type="button" className="gh-location-chip">
          Mumbai 400001
        </button>
        <form className="gh-inline-search" role="search" onSubmit={(event) => event.preventDefault()}>
          <input type="search" placeholder="Search products, brands..." />
        </form>
      </section>

      <section className="gh-hero">
        <div className="gh-hero-track">
          {HERO_SLIDES.map((slide) => (
            <article key={slide.title} className="gh-hero-slide">
              <img src={slide.imageUrl} alt={slide.title} loading="lazy" />
              <div className="gh-hero-overlay">
                <p className="gh-hero-kicker">Big Cashback Days</p>
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link to={slide.ctaTo} className="btn btn-primary">
                  {slide.ctaLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="gh-hero-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
      </section>

      <section className="gh-categories">
        <div className="gh-section-head">
          <h2>Categories</h2>
        </div>
        <div className="gh-category-rail">
          {HOME_CATEGORIES.map((category) => (
            <Link key={category.title} to={getCategoryRoute(category.category)} className="gh-category-card">
              <span className="gh-category-image">
                <img src={getProductImage(category.imageProductId)} alt={category.title} loading="lazy" />
              </span>
              <span>{category.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="gh-sponsored-deals">
        <header className="gh-section-head">
          <h2>Sponsored Deals</h2>
          <span>Promoted</span>
        </header>
        <div className="gh-sponsored-grid">
          {sponsoredDeals.map((product) => (
            <SponsoredDealCard
              key={product.id}
              product={product}
              onAddToCart={addDefaultConfigurationToCart}
              onBuyNow={handleBuyNow}
            />
          ))}
        </div>
      </section>

      <section className="gh-flash-deals">
        <header className="gh-flash-head">
          <h2>Flash Deals</h2>
          <p>02:45:10 left</p>
        </header>
        <div className="gh-flash-row">
          {flashDeals.map((product) => (
            <article key={product.id} className="gh-flash-card">
              <span className="gh-flash-discount">{getDiscountPercent(product)}% OFF</span>
              <Link to={ROUTES.productDetail(product.id)} className="gh-flash-media-link">
                <img src={product.imageUrl} alt={product.name} loading="lazy" />
              </Link>
              <p className="gh-flash-price">{formatInr(product.priceInr)}</p>
              <p className="gh-flash-mrp">{formatInr(product.mrpInr)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gh-trending">
        <header className="gh-section-head">
          <h2>Trending in Mumbai</h2>
        </header>
        <div className="gh-trending-row">
          {trendingProducts.map((product) => (
            <article key={product.id} className="gh-trending-card">
              <Link to={ROUTES.productDetail(product.id)} className="gh-trending-media-link">
                <img src={product.imageUrl} alt={product.name} loading="lazy" />
              </Link>
              <h3>{product.name}</h3>
              <p>{formatInr(product.priceInr)}</p>
              <span>Cashback {formatInr(product.cashbackInr)}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="gh-promo-banner">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW6zn0zyTXQhCv6fPOpTw24rlDCeQsQ9NfXnt204Sh-2KKr3hOR8Vq4XfzLAvZvypWCJff2tSsnrwil6FWAyl5X-BthWFlEGuPaaKZi2VG_H2--JNbRsy2mEVrEPrfemVVnpN_0alzof6UPcaNdVkeF8fKlL2NG8q5WG0r1MBGjASlFM6Cm3l748hc38olY2Wpfjb10tcfaGreYqm6yG7xMbqm31I93pmEMk2Avb-1uxu0Ugd7KBfxJMVsDGW6cxnWQJnel4J9agM"
          alt="IKEA Festival banner"
          loading="lazy"
        />
        <div className="gh-promo-overlay">
          <span>Sponsored</span>
          <h2>IKEA Festival</h2>
          <p>Revamp your home with flat 15% cashback on all furniture.</p>
          <Link to={ROUTES.category} className="btn btn-secondary">
            Shop Collection
          </Link>
        </div>
      </section>

      <section className="gh-recommended">
        <header className="gh-section-head">
          <h2>Recommended For You</h2>
        </header>
        <div className="gh-recommended-grid">
          {recommendedProducts.map((product) => (
            <article key={product.id} className="gh-recommended-card">
              <Link to={ROUTES.productDetail(product.id)} className="gh-recommended-media-link">
                <img src={product.imageUrl} alt={product.name} loading="lazy" />
              </Link>
              <p className="gh-brand-name">{product.brand}</p>
              <h3>{product.name}</h3>
              <p className="gh-price-row">
                <strong>{formatInr(product.priceInr)}</strong>
                {product.mrpInr > product.priceInr ? <span>{formatInr(product.mrpInr)}</span> : null}
              </p>
              <p className="gh-cashback-line">Earn {formatInr(product.cashbackInr)}</p>
              <div className="gh-card-actions">
                <button type="button" className="btn btn-secondary" onClick={() => addDefaultConfigurationToCart(product)}>
                  Add
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleBuyNow(product)}>
                  Buy
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="gh-recently-viewed">
        <header className="gh-section-head">
          <h2>Recently Viewed</h2>
        </header>
        <div className="gh-recently-row">
          {recentlyViewedProducts.map((product) => (
            <Link key={product.id} to={ROUTES.productDetail(product.id)} className="gh-recently-card">
              <img src={product.imageUrl} alt={product.name} loading="lazy" />
              <span>{product.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="gh-brands">
        <header className="gh-section-head">
          <h2>Shop by Brand</h2>
        </header>
        <div className="gh-brand-grid">
          {BRAND_NAMES.map((brand) => (
            <Link key={brand} to={ROUTES.category} className="gh-brand-chip">
              {brand}
            </Link>
          ))}
        </div>
      </section>

      <section className="gh-trust-strip" aria-label="Marketplace trust signals">
        {TRUST_ITEMS.map((item) => (
          <article key={item}>
            <h3>{item}</h3>
          </article>
        ))}
      </section>

      <section className="gh-vendor-cta">
        <div>
          <h2>Sell on Glonni</h2>
          <p>Grow with India&apos;s most rewarding shopping destination.</p>
        </div>
        <Link to={ROUTES.vendor} className="btn btn-primary">
          Become a Vendor
        </Link>
      </section>
    </div>
  );
}
