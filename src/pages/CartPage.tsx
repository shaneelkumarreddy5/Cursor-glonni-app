import { Link } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
import { catalogProducts } from "../data/mockCatalog";
import { ROUTES } from "../routes/paths";
import { formatInr } from "../utils/currency";

const cartItems = [
  { product: catalogProducts[0], quantity: 1, seller: "Nova Retail Hub" },
  { product: catalogProducts[4], quantity: 2, seller: "Stride Sports Store" },
  { product: catalogProducts[8], quantity: 1, seller: "Bolt Accessories" },
];

export function CartPage() {
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.product.priceInr * item.quantity,
    0,
  );
  const mrpTotal = cartItems.reduce((sum, item) => sum + item.product.mrpInr * item.quantity, 0);
  const discountTotal = mrpTotal - itemTotal;
  const deliveryFee = itemTotal > 15000 ? 0 : 99;
  const cashbackTotal = cartItems.reduce(
    (sum, item) => sum + item.product.cashbackInr * item.quantity,
    0,
  );
  const payableAmount = itemTotal + deliveryFee;

  return (
    <div className="stack cart-page">
      <PageIntro
        badge="Shopping bag"
        title="Review your bag before checkout"
        description="Check seller details, compare savings, and confirm final payable amount."
        actions={
          <div className="inline-actions">
            <Link to={ROUTES.category} className="btn btn-secondary">
              Continue shopping
            </Link>
            <Link to={ROUTES.checkout} className="btn btn-primary">
              Checkout now
            </Link>
          </div>
        }
      />

      <section className="two-column">
        <article className="card">
          <header className="section-header">
            <h2>Line items ({cartItems.length})</h2>
          </header>
          <div className="stack-sm">
            {cartItems.map(({ product, quantity, seller }) => (
              <article key={product.id} className="cart-item">
                <img src={product.imageUrl} alt={product.name} className="cart-item-image" />
                <div className="cart-item-copy">
                  <h3>{product.name}</h3>
                  <p>{product.keySpecs.slice(0, 2).join(" • ")}</p>
                  <p>Seller: {seller}</p>
                  <p>Qty: {quantity}</p>
                  <p className="cart-item-cashback">
                    Cashback: {formatInr(product.cashbackInr * quantity)}
                  </p>
                </div>
                <div className="cart-item-price">
                  <strong>{formatInr(product.priceInr * quantity)}</strong>
                  <span>{formatInr(product.mrpInr * quantity)}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="card cart-summary">
          <header className="section-header">
            <h2>Order Summary</h2>
          </header>

          <div className="chip-row">
            <span className="chip">You save {formatInr(discountTotal)}</span>
            <span className="chip">Estimated cashback {formatInr(cashbackTotal)}</span>
          </div>

          <div className="cart-summary-list">
            <div>
              <span>Item total</span>
              <strong>{formatInr(itemTotal)}</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>-{formatInr(discountTotal)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{deliveryFee === 0 ? "Free" : formatInr(deliveryFee)}</strong>
            </div>
            <div>
              <span>Cashback (after delivery)</span>
              <strong>{formatInr(cashbackTotal)}</strong>
            </div>
          </div>

          <div className="cart-payable-row">
            <span>Final payable</span>
            <strong>{formatInr(payableAmount)}</strong>
          </div>

          <Link to={ROUTES.checkout} className="btn btn-primary btn-block">
            Continue to Checkout
          </Link>
        </article>
      </section>
    </div>
  );
}
