import { Link } from "react-router-dom";

export type HomeCategoryTile = {
  title: string;
  to: string;
  imageUrl: string;
};

type HomeCategoryTilesProps = {
  tiles: HomeCategoryTile[];
};

export function HomeCategoryTiles({ tiles }: HomeCategoryTilesProps) {
  return (
    <section className="home-section-card">
      <header className="home-section-header-row">
        <h2>Categories</h2>
      </header>
      <div className="home-category-tiles" aria-label="Top categories">
        {tiles.map((tile) => (
          <Link key={tile.title} to={tile.to} className="home-category-tile">
            <span className="home-category-tile-media">
              <img src={tile.imageUrl} alt={tile.title} loading="lazy" />
            </span>
            <span className="home-category-tile-title">{tile.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

