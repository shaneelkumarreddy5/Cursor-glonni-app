import { Link } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
import { ROUTES } from "../routes/paths";

export function OrderSuccessPage() {
  return (
    <div className="stack order-success-page">
      <PageIntro
        badge="Order confirmed"
        title="Thanks! Your order has been placed"
        description="A confirmation has been sent to your registered email and mobile number."
      />

      <section className="card order-success-card">
        <div className="order-success-status">Payment received</div>
        <h2>Order ID: GLN2602129481</h2>
        <p>Expected delivery date: Monday, 16 Feb 2026</p>
        <p className="order-success-cashback">
          ₹1,660 Cashback will be credited after delivery
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
