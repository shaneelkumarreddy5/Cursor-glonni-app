type PlaceholderCardsProps = {
  title: string;
  items: string[];
};

export function PlaceholderCards({ title, items }: PlaceholderCardsProps) {
  return (
    <section className="card">
      <header className="section-header">
        <h2>{title}</h2>
      </header>
      <div className="card-grid">
        {items.map((item) => (
          <article key={item} className="placeholder-card">
            <div className="placeholder-visual" />
            <h3>{item}</h3>
            <p>Placeholder content for future API and business logic integration.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
