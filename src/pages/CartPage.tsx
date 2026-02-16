import { Link, useNavigate } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
import { ROUTES } from "../routes/paths";
import { useCommerce } from "../state/CommerceContext";
import { formatInr } from "../utils/currency";

export function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    savedForLaterItems,
    cartItemsCount,
    cartSubtotalInr,
    cartCashbackTotalInr,
    updateCartItemQuantity,
    removeCartItem,
    saveCartItemForLater,
    moveSavedItemToCart,
    removeSavedItem,
  } = useCommerce();
  const mrpTotal = cartItems.reduce(
    (sum, item) => sum + item.unitMrpInr * item.quantity,
    0,
  );
  const discountTotal = Math.max(0, mrpTotal - cartSubtotalInr);
  const deliveryFee = cartItems.length > 0 && cartSubtotalInr < 15000 ? 99 : 0;
  const payableAmount = cartSubtotalInr + deliveryFee;
  const isCartEmpty = cartItems.length === 0;
  const isSavedSectionEmpty = savedForLaterItems.length === 0;

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
            <button
              type="button"
              className="btn btn-primary"
              disabled={isCartEmpty}
              onClick={() => navigate(ROUTES.checkout)}
            >
              Checkout now
            </button>
          </div>
        }
      />

      <section className="two-column">
        <article className="card">
          <header className="section-header">
            <h2>Line items ({cartItemsCount})</h2>
          </header>
          {isCartEmpty ? (
            <div className="stack-sm empty-state-wrap">
              <p className="empty-state">Your cart is empty. Add products from category or product pages.</p>
              <Link to={ROUTES.category} className="btn btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="stack-sm">
              {cartItems.map((item) => (
                <article key={item.id} className="cart-item">
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="cart-item-image"
                  />
                  <div className="cart-item-copy">
                    <h3>{item.productName}</h3>
                    <p>{item.keySpecs.slice(0, 2).join(" • ")}</p>
                    <p>Seller: {item.vendorName}</p>
                    {item.selectedExtraOfferTitle ? (
                      <p>Offer: {item.selectedExtraOfferTitle}</p>
                    ) : null}
                    <p className="cart-item-cashback">
                      Cashback: {formatInr(item.unitCashbackInr * item.quantity)}
                    </p>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantity - 1)
                        }
                        aria-label={`Reduce quantity for ${item.productName}`}
                      >
                        -
                      </button>
                      <span className="muted-tag">Qty {item.quantity}</span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          updateCartItemQuantity(item.id, item.quantity + 1)
                        }
                        aria-label={`Increase quantity for ${item.productName}`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => saveCartItemForLater(item.id)}
                      >
                        Save for later
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => removeCartItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-price">
                    <strong>{formatInr(item.unitPriceInr * item.quantity)}</strong>
                    <span>{formatInr(item.unitMrpInr * item.quantity)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          <section className="stack-sm cart-saved-section">
            <header className="section-header">
              <h2>Saved for later ({savedForLaterItems.length})</h2>
            </header>
            {isSavedSectionEmpty ? (
              <p className="wallet-empty-note empty-state">
                Saved products will appear here for quick checkout later.
              </p>
            ) : (
              savedForLaterItems.map((item) => (
                <article key={item.id} className="cart-item cart-item-saved">
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="cart-item-image"
                  />
                  <div className="cart-item-copy">
                    <h3>{item.productName}</h3>
                    <p>{item.keySpecs.slice(0, 2).join(" • ")}</p>
                    <p>Seller: {item.vendorName}</p>
                    <p className="cart-item-cashback">
                      Cashback: {formatInr(item.unitCashbackInr * item.quantity)}
                    </p>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => moveSavedItemToCart(item.id)}
                      >
                        Move to cart
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => removeSavedItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-price">
                    <strong>{formatInr(item.unitPriceInr * item.quantity)}</strong>
                    <span>{formatInr(item.unitMrpInr * item.quantity)}</span>
                  </div>
                </article>
              ))
            )}
          </section>
        </article>

        <article className="card cart-summary">
          <header className="section-header">
            <h2>Order Summary</h2>
          </header>

          <div className="chip-row">
            <span className="chip">You save {formatInr(discountTotal)}</span>
            <span className="chip">
              Estimated cashback {formatInr(cartCashbackTotalInr)}
            </span>
          </div>

          <div className="cart-summary-list">
            <div>
              <span>Item total</span>
              <strong>{formatInr(cartSubtotalInr)}</strong>
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
              <strong>{formatInr(cartCashbackTotalInr)}</strong>
            </div>
          </div>

          <div className="cart-payable-row">
            <span>Final payable</span>
            <strong>{formatInr(payableAmount)}</strong>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={isCartEmpty}
            onClick={() => navigate(ROUTES.checkout)}
          >
            Continue to Checkout
          </button>
        </article>
      </section>
    </div>
  );
}
