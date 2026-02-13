import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
import { bankOffers } from "../data/mockCatalog";
import { ROUTES } from "../routes/paths";
import { useCommerce } from "../state/CommerceContext";
import { formatInr } from "../utils/currency";

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
  const navigate = useNavigate();
  const {
    cartItems,
    cartSubtotalInr,
    cartCashbackTotalInr,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    paymentMethods,
    selectedPaymentMethodId,
    setSelectedPaymentMethodId,
    placeOrder,
    userCodEligibilityFlag,
    codOrderLimitInr,
  } = useCommerce();
  const [deliveryMode, setDeliveryMode] = useState<"standard" | "express">("standard");
  const deliveryFee = deliveryMode === "express" ? 199 : 0;
  const finalPayable = cartSubtotalInr + deliveryFee;
  const isCartEmpty = cartItems.length === 0;
  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ?? addresses[0];
  const isRemoteAreaAddress = selectedAddress.id === "addr-family";
  const codUnavailableReason = useMemo(() => {
    const reasons: string[] = [];

    if (!userCodEligibilityFlag) {
      reasons.push("COD is unavailable for this account.");
    }

    if (finalPayable > codOrderLimitInr) {
      reasons.push(`COD is available only for orders up to ${formatInr(codOrderLimitInr)}.`);
    }

    return reasons.join(" ");
  }, [codOrderLimitInr, finalPayable, userCodEligibilityFlag]);
  const isCodAvailable = codUnavailableReason.length === 0;
  const deliveryPromiseNote = useMemo(() => {
    const notes: string[] = [];

    if (selectedPaymentMethodId === "cod") {
      notes.push("COD orders may need doorstep verification at delivery.");
    }

    if (isRemoteAreaAddress) {
      notes.push("Remote-area delivery can take an additional 1-2 days (mock).");
    }

    return notes.join(" ");
  }, [isRemoteAreaAddress, selectedPaymentMethodId]);

  useEffect(() => {
    if (selectedPaymentMethodId === "cod" && !isCodAvailable) {
      setSelectedPaymentMethodId("upi");
    }
  }, [isCodAvailable, selectedPaymentMethodId, setSelectedPaymentMethodId]);

  function handlePlaceOrder() {
    const createdOrder = placeOrder({ deliveryFeeInr: deliveryFee });
    if (createdOrder) {
      navigate(ROUTES.orderSuccessDetail(createdOrder.id));
    }
  }

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
            <div className="checkout-option-list">
              {addresses.map((address) => (
                <label key={address.id} className="checkout-option">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <div>
                    <strong>{address.label}</strong>
                    <p>
                      {address.fullName}
                      <br />
                      {address.line1}, {address.line2}, {address.cityStatePincode}
                      <br />
                      Phone: {address.phoneNumber}
                    </p>
                  </div>
                  {selectedAddressId === address.id ? (
                    <span className="muted-tag">Selected</span>
                  ) : null}
                </label>
              ))}
            </div>
          </article>

          <article className="card checkout-card">
            <header className="section-header">
              <h2>Delivery Method</h2>
            </header>
            <div className="checkout-option-list">
              <label className="checkout-option">
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMode === "standard"}
                  onChange={() => setDeliveryMode("standard")}
                />
                <div>
                  <strong>Standard Delivery</strong>
                  <p>Delivery by Monday, 16 Feb • Free</p>
                </div>
              </label>
              <label className="checkout-option">
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryMode === "express"}
                  onChange={() => setDeliveryMode("express")}
                />
                <div>
                  <strong>Express Delivery</strong>
                  <p>Delivery by Sunday, 15 Feb • {formatInr(199)}</p>
                </div>
              </label>
            </div>
            <div className="checkout-delivery-promise">
              <p>
                <strong>Delivery promise:</strong> Delivered by 3-5 days
              </p>
              {deliveryPromiseNote ? <p>{deliveryPromiseNote}</p> : null}
            </div>
          </article>

          <article className="card checkout-card">
            <header className="section-header">
              <h2>Payment method</h2>
            </header>
            <div className="checkout-option-list">
              {paymentMethods.map((method) => {
                const isCodOption = method.id === "cod";
                const isDisabled = isCodOption && !isCodAvailable;

                return (
                  <label key={method.id} className="checkout-option">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentMethodId === method.id}
                      onChange={() => setSelectedPaymentMethodId(method.id)}
                      disabled={isDisabled}
                    />
                    <div>
                      <span className="checkout-payment-label">
                        <PaymentIcon method={method.id} />
                        {method.title}
                      </span>
                      <p>{method.description}</p>
                      {isDisabled ? (
                        <p className="checkout-helper-note">{codUnavailableReason}</p>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="checkout-bank-logo-row" aria-label="Supported bank cards">
              {bankOffers.map((offer) => (
                <img key={offer.bankName} src={offer.logoUrl} alt={`${offer.bankName} logo`} />
              ))}
            </div>

            <div className="checkout-cashback-note">
              {selectedPaymentMethodId === "cod"
                ? "Cashback will be credited only after successful delivery."
                : "Cashback will be credited after successful delivery confirmation."}
            </div>
            {selectedPaymentMethodId === "cod" ? (
              <p className="checkout-helper-note">
                Cashback is pending until delivery completion.
              </p>
            ) : null}

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

          {isCartEmpty ? (
            <p>Your cart is empty. Add products before checkout.</p>
          ) : (
            <div className="checkout-line-items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-line-item">
                  <span>
                    {item.productName} x{item.quantity}
                  </span>
                  <strong>{formatInr(item.unitPriceInr * item.quantity)}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="checkout-totals">
            <div>
              <span>Item total</span>
              <strong>{formatInr(cartSubtotalInr)}</strong>
            </div>
            <div>
              <span>Cashback (post delivery)</span>
              <strong>{formatInr(cartCashbackTotalInr)}</strong>
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

          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={isCartEmpty}
            onClick={handlePlaceOrder}
          >
            Place Order
          </button>
        </article>
      </section>
    </div>
  );
}
