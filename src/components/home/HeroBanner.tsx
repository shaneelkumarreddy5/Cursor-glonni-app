import { Link } from "react-router-dom";

type HeroBannerProps = {
  ctaTo: string;
  imageUrl: string;
};

export function HeroBanner({ ctaTo, imageUrl }: HeroBannerProps) {
  return (
    <section className="home-hero-banner">
      <img src={imageUrl} alt="Shop and earn cashback banner" loading="lazy" />
      <div className="home-hero-overlay">
        <p className="home-hero-kicker">Limited Time</p>
        <h1>Shop &amp; Earn Cashback</h1>
        <Link to={ctaTo} className="btn btn-primary">
          Shop Now
        </Link>
      </div>
    </section>
  );
}
