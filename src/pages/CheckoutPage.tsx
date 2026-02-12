import { PageIntro } from "../components/ui/PageIntro";

export function CheckoutPage() {
  return (
    <div className="stack">
      <PageIntro
        badge="Checkout"
        title="Checkout Flow"
        description="UI-only checkout scaffold with placeholders for shipping, billing, and order review steps."
      />
      <section className="two-column">
        <article className="card">
          <header className="section-header">
            <h2>Shipping & Billing</h2>
          </header>
          <div className="field-grid">
            {[
              "Full Name",
              "Email Address",
              "Phone",
              "Street Address",
              "City",
              "State/Region",
              "Zip Code",
              "Country",
            ].map((field) => (
              <label key={field} className="field">
                <span>{field}</span>
                <input placeholder={`${field} placeholder`} disabled />
              </label>
            ))}
          </div>
        </article>

        <article className="card">
          <header className="section-header">
            <h2>Order Review</h2>
          </header>
          <ul className="bullet-list">
            <li>Items and totals summary placeholder</li>
            <li>Shipping method selector placeholder</li>
            <li>Payment section intentionally omitted</li>
          </ul>
          <button type="button" className="btn btn-primary btn-block">
            Place Order (Disabled Placeholder)
          </button>
        </article>
      </section>
    </div>
  );
}
