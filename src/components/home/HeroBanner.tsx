import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export type HeroDeal = {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTo: string;
  imageUrl: string;
};

type HeroBannerProps = {
  deals: HeroDeal[];
};

const AUTO_ADVANCE_INTERVAL_MS = 3400;

function getActiveSlideIndex(currentSlide: number, totalDeals: number) {
  if (totalDeals === 0) {
    return 0;
  }
  if (currentSlide === 0) {
    return totalDeals - 1;
  }
  if (currentSlide === totalDeals + 1) {
    return 0;
  }
  return currentSlide - 1;
}

function buildLoopedDeals(deals: HeroDeal[]) {
  if (deals.length === 0) {
    return [];
  }
  const firstDeal = deals[0];
  const lastDeal = deals[deals.length - 1];
  return [lastDeal, ...deals, firstDeal];
}

export function HeroBanner({ deals }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(deals.length > 0 ? 1 : 0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  const loopedDeals = useMemo(() => buildLoopedDeals(deals), [deals]);
  const activeSlideIndex = getActiveSlideIndex(currentSlide, deals.length);

  useEffect(() => {
    setCurrentSlide(deals.length > 0 ? 1 : 0);
    setIsTransitionEnabled(true);
  }, [deals.length]);

  useEffect(() => {
    if (deals.length <= 1) {
      return;
    }

    const intervalHandle = window.setInterval(() => {
      setIsTransitionEnabled(true);
      setCurrentSlide((previousSlide) => previousSlide - 1);
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => window.clearInterval(intervalHandle);
  }, [deals.length]);

  useEffect(() => {
    if (isTransitionEnabled) {
      return;
    }
    const frameHandle = window.requestAnimationFrame(() => {
      setIsTransitionEnabled(true);
    });
    return () => window.cancelAnimationFrame(frameHandle);
  }, [isTransitionEnabled]);

  function handleTrackTransitionEnd() {
    if (deals.length === 0) {
      return;
    }
    if (currentSlide === 0) {
      setIsTransitionEnabled(false);
      setCurrentSlide(deals.length);
      return;
    }
    if (currentSlide === deals.length + 1) {
      setIsTransitionEnabled(false);
      setCurrentSlide(1);
    }
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="home-hero-banner" aria-label="Featured deals carousel">
      <div
        className="home-hero-track"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
          transition: isTransitionEnabled ? "transform 500ms ease" : "none",
        }}
        onTransitionEnd={handleTrackTransitionEnd}
      >
        {loopedDeals.map((deal, slideIndex) => (
          <article key={`${deal.id}-${slideIndex}`} className="home-hero-slide">
            <div
              className="home-hero-slide-surface"
              style={{
                backgroundImage:
                  "linear-gradient(112deg, rgba(17, 17, 17, 0.78) 10%, rgba(17, 17, 17, 0.24) 70%), " +
                  `url(${deal.imageUrl})`,
              }}
            >
              <div className="home-hero-overlay">
                <p className="home-hero-kicker">{deal.kicker}</p>
                <h1>{deal.title}</h1>
                <p className="home-hero-subtitle">{deal.subtitle}</p>
                <Link to={deal.ctaTo} className="btn btn-primary">
                  {deal.ctaLabel}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="home-hero-dots" aria-label="Featured deal selector">
        {deals.map((deal, dealIndex) => (
          <button
            type="button"
            key={deal.id}
            className={`home-hero-dot ${activeSlideIndex === dealIndex ? "is-active" : ""}`}
            aria-label={`Show ${deal.title}`}
            aria-pressed={activeSlideIndex === dealIndex}
            onClick={() => {
              setIsTransitionEnabled(true);
              setCurrentSlide(dealIndex + 1);
            }}
          />
        ))}
      </div>
    </section>
  );
}
