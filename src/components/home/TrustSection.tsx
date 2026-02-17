const TRUST_ITEMS = [
  "Secure Payments",
  "Easy Returns",
  "Cashback Guarantee",
] as const;

export function TrustSection() {
  return (
    <section className="home-section-card home-trust-section" aria-label="Trust signals">
      {TRUST_ITEMS.map((item) => (
        <article key={item} className="home-trust-card">
          <strong>{item}</strong>
        </article>
      ))}
    </section>
  );
}
