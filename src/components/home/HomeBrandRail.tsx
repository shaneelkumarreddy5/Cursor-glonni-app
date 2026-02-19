type BrandRailItem = {
  name: string;
  logoUrl: string;
};

type HomeBrandRailProps = {
  title: string;
  brands: BrandRailItem[];
};

export function HomeBrandRail({ title, brands }: HomeBrandRailProps) {
  if (brands.length === 0) {
    return null;
  }

  return (
    <section className="home-section-card">
      <header className="home-section-header-row">
        <h2>{title}</h2>
      </header>
      <div className="home-brand-rail" role="list" aria-label={title}>
        {brands.map((brand) => (
          <article key={brand.name} className="home-brand-tile" role="listitem" aria-label={brand.name}>
            <img src={brand.logoUrl} alt={`${brand.name} logo`} loading="lazy" />
          </article>
        ))}
      </div>
    </section>
  );
}

