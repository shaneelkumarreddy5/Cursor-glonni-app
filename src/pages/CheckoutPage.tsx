import { Link } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
import { bankOffers, catalogProducts } from "../data/mockCatalog";
import { ROUTES } from "../routes/paths";
import { formatInr } from "../utils/currency";

const checkoutItems = [
  { product: catalogProducts[0], quantity: 1 },
  { product: catalogProducts[4], quantity: 2 },
  { product: catalogProducts[8], quantity: 1 },
];

function PaymentIcon({ method }: { method: "upi" | "card" | "netbanking" | "cod" }) {
  if (method === "upi") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 18 10 6l4 6 6-6" />
      </svg>
    );
  }

  if (method === "card") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    );
  }

  if (method === "netbanking") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10h18" />
        <path d="m12 4 9 6H3l9-6Z" />
        <path d="M6 10v7M10 10v7M14 10v7M18 10v7" />
        <path d="M3 17h18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 8h10v8H7z" />
      <path d="M10 8V6h4v2" />
    </svg>
  );
}

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
        badge="Secure checkout"
        title="Complete your order"
        description="Choose delivery and payment method, then confirm your final amount."
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.cart} className="btn btn-secondary">
              Back to cart
            </Link>
          </div>
        }
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
              <h2>Payment method</h2>
            </header>
            <div className="checkout-option-list">
              <label className="checkout-option">
                <input type="radio" name="payment" defaultChecked />
                <div>
                  <span className="checkout-payment-label">
                    <PaymentIcon method="upi" />
                    UPI
                  </span>
                  <p>Pay instantly via UPI apps</p>
                </div>
              </label>
              <label className="checkout-option">
                <input type="radio" name="payment" />
                <div>
                  <span className="checkout-payment-label">
                    <PaymentIcon method="card" />
                    Credit / Debit Card
                  </span>
                  <p>Saved cards and EMI options</p>
                </div>
              </label>
              <label className="checkout-option">
                <input type="radio" name="payment" />
                <div>
                  <span className="checkout-payment-label">
                    <PaymentIcon method="netbanking" />
                    Net Banking
                  </span>
                  <p>Supported by major Indian banks</p>
                </div>
              </label>
              <label className="checkout-option">
                <input type="radio" name="payment" />
                <div>
                  <span className="checkout-payment-label">
                    <PaymentIcon method="cod" />
                    Cash on Delivery
                  </span>
                  <p>Available on selected pincodes</p>
                </div>
              </label>
            </div>

            <div className="checkout-bank-logo-row" aria-label="Supported bank cards">
              {bankOffers.map((offer) => (
                <img key={offer.bankName} src={offer.logoUrl} alt={`${offer.bankName} logo`} />
              ))}
            </div>

            <div className="checkout-cashback-note">
              Cashback will be credited after successful delivery confirmation.
            </div>

            <div className="chip-row" aria-label="Checkout trust signals">
              <span className="chip">256-bit encrypted payment</span>
              <span className="chip">Easy returns policy</span>
            </div>
          </article>

          <article className="card checkout-card">
            <header className="section-header">
              <h2>Bank Offers</h2>
            </header>
            <div className="checkout-bank-offers">
              {bankOffers.map((offer) => (
                <article key={offer.bankName} className="checkout-bank-offer-card">
                  <img src={offer.logoUrl} alt={`${offer.bankName} logo`} />
                  <p>{offer.offerText}</p>
                </article>
              ))}
            </div>
          </article>
        </div>

        <article className="card checkout-summary-card">
          <header className="section-header">
            <h2>Order total</h2>
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
