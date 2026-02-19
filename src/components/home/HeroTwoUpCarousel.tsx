import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export type HeroTwoUpItem = {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  priceLine?: string;
  ctaLabel: string;
  ctaTo: string;
  imageUrl: string;
};

export type HeroTwoUpSlide = {
  id: string;
  left: HeroTwoUpItem;
  right: HeroTwoUpItem;
};

type HeroTwoUpCarouselProps = {
  slides: HeroTwoUpSlide[];
  autoAdvanceIntervalMs?: number;
};

function buildLoopedSlides(slides: HeroTwoUpSlide[]) {
  if (slides.length === 0) {
    return [];
  }
  const firstSlide = slides[0];
  const lastSlide = slides[slides.length - 1];
  return [lastSlide, ...slides, firstSlide];
}

function getActiveIndex(currentSlide: number, totalSlides: number) {
  if (totalSlides === 0) {
    return 0;
  }
  if (currentSlide === 0) {
    return totalSlides - 1;
  }
  if (currentSlide === totalSlides + 1) {
    return 0;
  }
  return currentSlide - 1;
}

export function HeroTwoUpCarousel({
  slides,
  autoAdvanceIntervalMs = 4200,
}: HeroTwoUpCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(slides.length > 0 ? 1 : 0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const loopedSlides = useMemo(() => buildLoopedSlides(slides), [slides]);
  const activeIndex = getActiveIndex(currentSlide, slides.length);

  useEffect(() => {
    setCurrentSlide(slides.length > 0 ? 1 : 0);
    setIsTransitionEnabled(true);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const handle = window.setInterval(() => {
      setIsTransitionEnabled(true);
      setCurrentSlide((previous) => previous + 1);
    }, autoAdvanceIntervalMs);

    return () => window.clearInterval(handle);
  }, [autoAdvanceIntervalMs, slides.length]);

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
    if (slides.length === 0) {
      return;
    }
    if (currentSlide === 0) {
      setIsTransitionEnabled(false);
      setCurrentSlide(slides.length);
      return;
    }
    if (currentSlide === slides.length + 1) {
      setIsTransitionEnabled(false);
      setCurrentSlide(1);
    }
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="home-hero-two-up" aria-label="Featured product banners">
      <div
        className="home-hero-two-up-track"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
          transition: isTransitionEnabled ? "transform 520ms ease" : "none",
        }}
        onTransitionEnd={handleTrackTransitionEnd}
      >
        {loopedSlides.map((slide, slideIndex) => (
          <article key={`${slide.id}-${slideIndex}`} className="home-hero-two-up-slide">
            <div className="home-hero-two-up-grid">
              {[slide.left, slide.right].map((item) => (
                <Link
                  key={item.id}
                  to={item.ctaTo}
                  className="home-hero-two-up-card"
                  aria-label={item.title}
                >
                  <div className="home-hero-two-up-copy">
                    {item.badge ? <span className="home-hero-badge">{item.badge}</span> : null}
                    <h2>{item.title}</h2>
                    {item.subtitle ? <p className="home-hero-subtitle">{item.subtitle}</p> : null}
                    {item.priceLine ? <p className="home-hero-price">{item.priceLine}</p> : null}
                    <span className="btn btn-primary home-hero-cta">{item.ctaLabel}</span>
                  </div>
                  <div className="home-hero-two-up-media">
                    <img src={item.imageUrl} alt="" loading="lazy" />
                  </div>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="home-hero-two-up-dots" aria-label="Featured banner selector">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`home-hero-dot ${activeIndex === index ? "is-active" : ""}`}
            aria-label={`Show banner ${index + 1}`}
            aria-pressed={activeIndex === index}
            onClick={() => {
              setIsTransitionEnabled(true);
              setCurrentSlide(index + 1);
            }}
          />
        ))}
      </div>
    </section>
  );
}

