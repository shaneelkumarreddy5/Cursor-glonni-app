import { Link } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
import { catalogProducts } from "../data/mockCatalog";
import { ROUTES } from "../routes/paths";
import { formatInr } from "../utils/currency";

const checkoutItems = [
  { product: catalogProducts[0], quantity: 1 },
  { product: catalogProducts[4], quantity: 2 },
  { product: catalogProducts[8], quantity: 1 },
];

export function CheckoutPage() {
  const itemTotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.priceInr * item.quantity,
    0,
  );
  const mrpTotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.mrpInr * item.quantity,
    0,
  );
  const discountTotal = mrpTotal - itemTotal;
  const cashbackTotal = checkoutItems.reduce(
    (sum, item) => sum + item.product.cashbackInr * item.quantity,
    0,
  );
  const deliveryFee = 0;
  const finalPayable = itemTotal + deliveryFee;

  return (
    <div className="stack checkout-page">
      <PageIntro
        badge="Checkout"
        title="Checkout"
        description="Confirm delivery, payment method, and order totals before placing your order."
      />

      <section className="two-column">
        <div className="stack-sm">
          <article className="card checkout-card">
            <header className="section-header">
              <h2>Delivery Address</h2>
            </header>
            <div className="checkout-option">
              <strong>Rohit Sharma</strong>
              <p>
                Flat 903, Palm Residency, HSR Layout, Bengaluru, Karnataka 560102
                <br />
                Phone: +91 98765 43210
              </p>
              <span className="muted-tag">Default address</span>
            </div>
          </article>

          <article className="card checkout-card">
            <header className="section-header">
              <h2>Delivery Method</h2>
            </header>
            <div className="checkout-option-list">
              <label className="checkout-option">
                <input type="radio" name="delivery" defaultChecked />
                <div>
                  <strong>Standard Delivery</strong>
                  <p>Delivery by Monday, 16 Feb • Free</p>
                </div>
              </label>
              <label className="checkout-option">
                <input type="radio" name="delivery" />
                <div>
                  <strong>Express Delivery</strong>
                  <p>Delivery by Sunday, 15 Feb • {formatInr(199)}</p>
                </div>
              </label>
            </div>
          </article>

          <article className="card checkout-card">
            <header className="section-header">
              <h2>Payment Method (Mock)</h2>
            </header>
            <div className="checkout-option-list">
              <label className="checkout-option">
                <input type="radio" name="payment" defaultChecked />
                <div>
                  <strong>UPI</strong>
                  <p>Pay instantly via UPI apps</p>
                </div>
              </label>
              <label className="checkout-option">
                <input type="radio" name="payment" />
                <div>
                  <strong>Credit / Debit Card</strong>
                  <p>Saved cards and EMI options</p>
                </div>
              </label>
              <label className="checkout-option">
                <input type="radio" name="payment" />
                <div>
                  <strong>Cash on Delivery</strong>
                  <p>Available on selected pincodes</p>
                </div>
              </label>
            </div>
          </article>
        </div>

        <article className="card checkout-summary-card">
          <header className="section-header">
            <h2>Price Breakdown</h2>
          </header>

          <div className="checkout-line-items">
            {checkoutItems.map(({ product, quantity }) => (
              <div key={product.id} className="checkout-line-item">
                <span>
                  {product.name} x{quantity}
                </span>
                <strong>{formatInr(product.priceInr * quantity)}</strong>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div>
              <span>Item total</span>
              <strong>{formatInr(mrpTotal)}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>-{formatInr(discountTotal)}</strong>
            </div>
            <div>
              <span>Cashback (post delivery)</span>
              <strong>{formatInr(cashbackTotal)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{deliveryFee === 0 ? "Free" : formatInr(deliveryFee)}</strong>
            </div>
          </div>

          <div className="checkout-final-row">
            <span>Final payable</span>
            <strong>{formatInr(finalPayable)}</strong>
          </div>

          <Link to={ROUTES.orderSuccess} className="btn btn-primary btn-block">
            Place Order
          </Link>
        </article>
      </section>
    </div>
  );
}
