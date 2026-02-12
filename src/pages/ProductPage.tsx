import { PageIntro } from "../components/ui/PageIntro";

export function ProductPage() {
  return (
    <div className="stack">
      <PageIntro
        badge="PDP"
        title="Product Details"
        description="Product detail page scaffold for imagery, variant selectors, specs, and recommendation blocks."
      />
      <section className="product-layout">
        <article className="card">
          <header className="section-header">
            <h2>Gallery Placeholder</h2>
          </header>
          <div className="product-visual" />
          <div className="thumb-row">
            {["Front", "Side", "Back", "Detail"].map((label) => (
              <button key={label} type="button" className="thumb">
                {label}
              </button>
            ))}
          </div>
        </article>

        <article className="card">
          <header className="section-header">
            <h2>Purchase Panel Placeholder</h2>
          </header>
          <ul className="bullet-list">
            <li>Title, price, and discount slot</li>
            <li>Variant selectors (size, color)</li>
            <li>Delivery estimate and stock indicators</li>
            <li>Primary and secondary CTA buttons</li>
          </ul>
          <div className="inline-actions">
            <button type="button" className="btn btn-primary">
              Add to Cart
            </button>
            <button type="button" className="btn btn-secondary">
              Buy Now
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
