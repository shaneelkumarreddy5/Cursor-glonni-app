import { type ReactNode } from "react";

type BannerSlide = {
  title: string;
  subtitle: string;
  cta: string;
  artLabel: string;
};

type CategoryCard = {
  name: string;
  itemCount: string;
  artLabel: string;
};

type Product = {
  name: string;
  price: string;
  originalPrice?: string;
  badge?: string;
};

type Brand = {
  name: string;
  caption: string;
};

type Offer = {
  bank: string;
  title: string;
  detail: string;
  code: string;
};

const bannerSlides: BannerSlide[] = [
  {
    title: "Spring Drop 2026",
    subtitle: "Refresh your wardrobe with lightweight staples and fresh colors.",
    cta: "Shop the drop",
    artLabel: "Hero image placeholder",
  },
  {
    title: "Weekend Sneaker Flash",
    subtitle: "Limited-time curated pairs with bold comfort-forward silhouettes.",
    cta: "Browse sneakers",
    artLabel: "Campaign placeholder",
  },
  {
    title: "Home Tech Edit",
    subtitle: "Minimal accessories and gadgets to upgrade your setup.",
    cta: "Explore tech",
    artLabel: "Lifestyle placeholder",
  },
];

const categories: CategoryCard[] = [
  { name: "Sneakers", itemCount: "420 items", artLabel: "Sneaker image" },
  { name: "Streetwear", itemCount: "286 items", artLabel: "Streetwear image" },
  { name: "Accessories", itemCount: "164 items", artLabel: "Accessory image" },
  { name: "Tech", itemCount: "91 items", artLabel: "Tech image" },
  { name: "Fitness", itemCount: "118 items", artLabel: "Fitness image" },
  { name: "Beauty", itemCount: "205 items", artLabel: "Beauty image" },
];

const storefrontProducts: Product[] = [
  { name: "Aero Knit Runner", price: "$129", originalPrice: "$159", badge: "Best seller" },
  { name: "Metro Cargo Jacket", price: "$149", originalPrice: "$189", badge: "Limited" },
  { name: "WaveLite Headphones", price: "$89", originalPrice: "$119", badge: "Just in" },
  { name: "Glow Bottle 900ml", price: "$29", originalPrice: "$39", badge: "Popular" },
  { name: "Graphite Duffel", price: "$65", originalPrice: "$92", badge: "Top rated" },
  { name: "Neon Street Tee", price: "$39", originalPrice: "$52", badge: "Fresh pick" },
  { name: "Pulse Smart Band", price: "$79", originalPrice: "$99", badge: "Trending" },
  { name: "Urban Slide Sandals", price: "$44", originalPrice: "$61", badge: "Hot" },
  { name: "Core Zip Hoodie", price: "$72", originalPrice: "$95", badge: "Daily essential" },
  { name: "Trail Mix Socks", price: "$16", originalPrice: "$24", badge: "Bundle deal" },
  { name: "Breeze Linen Shirt", price: "$58", originalPrice: "$79", badge: "Seasonal" },
  { name: "Echo Wireless Charger", price: "$31", originalPrice: "$45", badge: "Fast moving" },
];

const brands: Brand[] = [
  { name: "Nova", caption: "Athleisure essentials" },
  { name: "Orbit", caption: "Lifestyle tech" },
  { name: "Mellow", caption: "Comfort-first basics" },
  { name: "Kite", caption: "Outdoor-inspired gear" },
  { name: "Aster", caption: "Modern daily wear" },
  { name: "Halo", caption: "Functional accessories" },
];

const offers: Offer[] = [
  {
    bank: "Axis Bank",
    title: "10% instant discount",
    detail: "On orders above $120 with eligible cards.",
    code: "AXIS10",
  },
  {
    bank: "HDFC Bank",
    title: "No-cost EMI for 3 months",
    detail: "Available on selected products and bundles.",
    code: "EMI3",
  },
  {
    bank: "ICICI Bank",
    title: "5% cashback",
    detail: "Cashback credited within 7 business days.",
    code: "CASH5",
  },
];

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

function ProductCard({ product, spotlightLabel }: { product: Product; spotlightLabel?: string }) {
  return (
    <article className="home-product-card">
      <div className="home-image-placeholder">{product.name} image</div>
      <div className="home-product-copy">
        <div className="home-badge-row">
          {spotlightLabel ? <span className="home-pill home-pill-sponsored">{spotlightLabel}</span> : null}
          {product.badge ? <span className="home-pill">{product.badge}</span> : null}
        </div>
        <h3>{product.name}</h3>
        <div className="home-price-row">
          <strong>{product.price}</strong>
          {product.originalPrice ? <span>{product.originalPrice}</span> : null}
        </div>
      </div>
    </article>
  );
}

function ProductGrid({
  products,
  spotlightLabel,
}: {
  products: Product[];
  spotlightLabel?: string;
}) {
  return (
    <div className="home-product-grid">
      {products.map((product) => (
        <ProductCard key={product.name} product={product} spotlightLabel={spotlightLabel} />
      ))}
    </div>
  );
}

export function HomePage() {
  const sponsoredProducts = storefrontProducts.slice(0, 4);
  const forYouProducts = storefrontProducts.slice(4, 8);
  const trendingProducts = storefrontProducts.slice(2, 6);
  const topDealProducts = storefrontProducts.slice(6, 10);
  const newArrivalProducts = storefrontProducts.slice(8, 12);
  const searchBasedProducts = storefrontProducts.slice(1, 5);

  return (
    <div className="home-landing stack">
      <section className="card home-banner">
        <header className="home-banner-header">
          <span className="badge home-badge">Top banner / carousel</span>
          <h1>Glonni - Discover your next favorite finds</h1>
          <p>Yellow-white storefront concept with modern, responsive placeholders.</p>
        </header>
        <div className="home-carousel-track" role="region" aria-label="Top banner carousel placeholder">
          {bannerSlides.map((slide) => (
            <article key={slide.title} className="home-carousel-slide">
              <div>
                <h2>{slide.title}</h2>
                <p>{slide.subtitle}</p>
                <button type="button" className="btn btn-primary home-cta">
                  {slide.cta}
                </button>
              </div>
              <div className="home-image-placeholder home-slide-art">{slide.artLabel}</div>
            </article>
          ))}
        </div>
      </section>

      <HomeSection
        title="Categories"
        subtitle="Horizontal scroll cards for quick category navigation."
      >
        <div className="home-horizontal-scroll" role="list" aria-label="Categories">
          {categories.map((category) => (
            <article key={category.name} className="home-category-card" role="listitem">
              <div className="home-image-placeholder home-category-art">{category.artLabel}</div>
              <h3>{category.name}</h3>
              <p>{category.itemCount}</p>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Sponsored products"
        subtitle="First 4 items, clearly labeled as sponsored content."
      >
        <ProductGrid products={sponsoredProducts} spotlightLabel="Sponsored" />
      </HomeSection>

      <HomeSection
        title="Top brands for the category"
        subtitle="Popular brands in this shopping lane."
      >
        <div className="home-brand-grid">
          {brands.map((brand) => (
            <article key={brand.name} className="home-brand-card">
              <span className="home-brand-logo">{brand.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <h3>{brand.name}</h3>
                <p>{brand.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Bank / payment offers section"
        subtitle="Offers are placeholders without payment integration."
      >
        <div className="home-offer-grid">
          {offers.map((offer) => (
            <article key={offer.bank} className="home-offer-card">
              <span className="home-offer-bank">{offer.bank}</span>
              <h3>{offer.title}</h3>
              <p>{offer.detail}</p>
              <span className="home-offer-code">Code: {offer.code}</span>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="For You"
        subtitle="Personalized placeholder recommendations for signed-out users."
      >
        <article className="home-personalized">
          <h3>Personalized module placeholder</h3>
          <p>
            Once user signals are available, this area can render recommendation rails by
            affinity, recency, and session intent.
          </p>
        </article>
        <ProductGrid products={forYouProducts} />
      </HomeSection>

      <HomeSection title="Trending products" subtitle="What shoppers are viewing right now.">
        <ProductGrid products={trendingProducts} />
      </HomeSection>

      <HomeSection title="Top deals" subtitle="Highlighted discount opportunities.">
        <ProductGrid products={topDealProducts} />
      </HomeSection>

      <HomeSection title="New arrivals" subtitle="Fresh additions to the catalog.">
        <ProductGrid products={newArrivalProducts} />
      </HomeSection>

      <HomeSection
        title="Based on your search"
        subtitle="Placeholder rail generated from recent query intent."
      >
        <ProductGrid products={searchBasedProducts} />
      </HomeSection>
    </div>
  );
}
