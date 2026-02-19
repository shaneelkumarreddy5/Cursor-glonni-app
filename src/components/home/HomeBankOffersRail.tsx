import { type BankOffer } from "../../data/mockCatalog";

type HomeBankOffersRailProps = {
  title: string;
  offers: BankOffer[];
};

export function HomeBankOffersRail({ title, offers }: HomeBankOffersRailProps) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="home-section-card">
      <header className="home-section-header-row">
        <h2>{title}</h2>
      </header>
      <div className="home-bank-rail" role="list" aria-label={title}>
        {offers.map((offer) => (
          <article key={offer.bankName} className="home-bank-tile" role="listitem">
            <img src={offer.logoUrl} alt={`${offer.bankName} logo`} loading="lazy" />
            <p>{offer.offerText}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

