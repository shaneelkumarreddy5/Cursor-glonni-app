import { PageIntro } from "../components/ui/PageIntro";

export function CartPage() {
  return (
    <div className="stack">
      <PageIntro
        badge="Cart"
        title="Your Cart"
        description="Cart page placeholder with responsive line items, totals, and upsell module sections."
      />
      <section className="two-column">
        <article className="card">
          <header className="section-header">
            <h2>Line Items</h2>
          </header>
          <div className="stack-sm">
            {["Minimal Runner x1", "Street Pivot x2", "Performance Socks x3"].map(
              (item) => (
                <div key={item} className="list-row">
                  <div>
                    <h3>{item}</h3>
                    <p>Quantity and variant controls placeholder.</p>
                  </div>
                  <span className="muted-tag">$ --</span>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="card">
          <header className="section-header">
            <h2>Order Summary</h2>
          </header>
          <ul className="bullet-list">
            <li>Subtotal placeholder</li>
            <li>Shipping placeholder</li>
            <li>Tax placeholder</li>
            <li>Coupon placeholder</li>
          </ul>
          <button type="button" className="btn btn-primary btn-block">
            Continue to Checkout
          </button>
        </article>
      </section>
    </div>
  );
}
