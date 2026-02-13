import { Link, useParams } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
import { ROUTES } from "../routes/paths";
import { useCommerce } from "../state/CommerceContext";
import { formatInr } from "../utils/currency";

function formatOrderDate(orderDateIso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(orderDateIso));
}

export function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById, lastPlacedOrderId } = useCommerce();
  const resolvedOrderId = orderId ?? lastPlacedOrderId;
  const placedOrder = resolvedOrderId ? getOrderById(resolvedOrderId) : undefined;

  if (!placedOrder) {
    return (
      <div className="stack order-success-page">
        <PageIntro
          badge="Order status"
          title="No recent order found"
          description="Place an order from checkout to see confirmation and cashback details."
        />
        <section className="card order-success-card">
          <div className="inline-actions">
            <Link to={ROUTES.cart} className="btn btn-secondary">
              Go to Cart
            </Link>
            <Link to={ROUTES.home} className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const itemCount = placedOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="stack order-success-page">
      <PageIntro
        badge="Order confirmed"
        title="Thanks! Your order has been placed"
        description="Your mock order is saved in Orders and cashback is marked as pending."
      />

      <section className="card order-success-card">
        <div className="order-success-status">Payment received</div>
        <h2>Order ID: {placedOrder.id}</h2>
        <p>Placed on: {formatOrderDate(placedOrder.placedAtIso)}</p>
        <p>Payment method: {placedOrder.paymentMethodTitle}</p>
        <p>Items: {itemCount}</p>
        <p>Final payable: {formatInr(placedOrder.payableAmountInr)}</p>
        <p className="order-success-cashback">
          {formatInr(placedOrder.cashbackPendingInr)} cashback is pending and linked to
          this order.
        </p>

        <div className="chip-row">
          <span className="chip">Invoice will be available in Orders</span>
          <span className="chip">Live tracking enabled</span>
        </div>

        <div className="inline-actions">
          <Link to={ROUTES.settingsOrders} className="btn btn-secondary">
            Track Order
          </Link>
          <Link to={ROUTES.home} className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
