import { Link } from "react-router-dom";
import { type ReactNode } from "react";
import {
  bankOfferStripItems,
  catalogProducts,
  homeCategoryTiles,
  topBrandHighlights,
  type CatalogProduct,
} from "../data/mockCatalog";
import { ROUTES } from "../routes/paths";
import { formatInr } from "../utils/currency";

type HeroSlide = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

const heroSlides: HeroSlide[] = [
  {
    title: "Premium Phones Week",
    subtitle: "Extra cashback on top-rated 5G mobiles and smart accessories.",
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3f8ec8d146f8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Laptop Upgrade Carnival",
    subtitle: "Student and creator laptops with flexible bank offers.",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
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

function HomeProductCard({ product, sponsored }: { product: CatalogProduct; sponsored: boolean }) {
  return (
    <article className="home-product-card">
      <div className="home-media-wrap">
        {sponsored ? <span className="home-pill home-pill-sponsored">Sponsored</span> : null}
        <img
          src={product.imageUrl}
          alt={`${product.name} ${product.category} product image`}
          className="home-media"
          loading="lazy"
        />
      </div>
      <div className="home-product-copy">
        <div className="home-badge-row">
          <span className="home-pill">{product.category}</span>
          <span className="home-pill">Rating {product.rating.toFixed(1)}</span>
        </div>
        <h3>{product.name}</h3>
        <p className="home-spec-line">{product.keySpecs.slice(0, 2).join(" • ")}</p>
        <div className="home-price-row">
          <strong>{formatInr(product.priceInr)}</strong>
          <span>{formatInr(product.mrpInr)}</span>
        </div>
        <p className="home-cashback-line">{formatInr(product.cashbackInr)} Cashback</p>
      </div>
    </article>
  );
}

export function HomePage() {
  const sponsoredProducts = catalogProducts.filter((product) => product.sponsored).slice(0, 4);
  const organicProducts = catalogProducts.filter((product) => !product.sponsored);
  const storefrontFeed = [...sponsoredProducts, ...organicProducts.slice(0, 6)];
  const recommendedProducts = organicProducts
    .slice()
    .sort((first, second) => second.rating - first.rating)
    .slice(0, 4);

  return (
    <div className="home-landing stack">
      <section className="card home-banner">
        <header className="home-banner-header">
          <span className="badge home-badge">Today only</span>
          <h1>Mega Cashback - Up to ₹500 Cashback Today</h1>
          <p>
            Discover curated deals from Indian sellers across mobiles, accessories, footwear, and
            laptops.
          </p>
          <div className="inline-actions">
            <Link to={ROUTES.category} className="btn btn-primary home-cta">
              Explore category deals
            </Link>
            <Link to={ROUTES.product} className="btn btn-secondary home-cta-secondary">
              View featured product
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

      <HomeSection title="Shop by category" subtitle="Quick access to high-intent shopping lanes.">
        <div className="home-horizontal-scroll" role="list" aria-label="Category cards">
          {homeCategoryTiles.map((category) => (
            <article key={category.name} className="home-category-card" role="listitem">
              <div className="home-category-media-wrap">
                <img
                  src={category.imageUrl}
                  alt={`${category.name} category`}
                  className="home-category-media"
                  loading="lazy"
                />
                <span className="home-category-icon">{category.iconText}</span>
              </div>
              <h3>{category.name}</h3>
              <p>{category.itemCount}</p>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        title="Sponsored products and best picks"
        subtitle="First 4 products are sponsored placements, followed by organic picks."
      >
        <div className="home-product-grid">
          {storefrontFeed.map((product, index) => (
            <HomeProductCard key={product.id} product={product} sponsored={index < 4} />
          ))}
        </div>
      </HomeSection>

      <section className="card home-bank-strip">
        <header className="home-section-header">
          <h2>Bank Offers</h2>
          <p>10% off with HDFC | Axis | ICICI - More offers</p>
        </header>
        <div className="home-offer-strip" role="list" aria-label="Bank offers">
          {bankOfferStripItems.map((offer) => (
            <span key={offer} className="home-offer-pill" role="listitem">
              {offer}
            </span>
          ))}
        </div>
      </section>

      <HomeSection
        title="Top Brands - Electronics"
        subtitle="Trusted brands currently leading this category."
      >
        <div className="home-brand-grid">
          {topBrandHighlights.map((brand) => (
            <article key={brand.name} className="home-brand-card">
              <span className="home-brand-logo">{brand.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <h3>{brand.name}</h3>
                <p>{brand.focus}</p>
              </div>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection title="For You" subtitle="Recommended products based on popular shopper journeys.">
        <div className="home-product-grid">
          {recommendedProducts.map((product) => (
            <HomeProductCard key={product.id} product={product} sponsored={false} />
          ))}
        </div>
      </HomeSection>
    </div>
  );
}
