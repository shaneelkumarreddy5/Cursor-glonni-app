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
        badge="Cart"
        title="Your Cart"
        description="Review selected products, compare savings, and continue to secure checkout."
      />

      <section className="two-column">
        <article className="card">
          <header className="section-header">
            <h2>Line Items</h2>
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
