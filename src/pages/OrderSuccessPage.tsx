import { Link } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
import { ROUTES } from "../routes/paths";

export function OrderSuccessPage() {
  return (
    <div className="stack order-success-page">
      <PageIntro
        badge="Order placed"
        title="Order confirmed"
        description="Thank you for shopping with Glonni. Your order is successfully placed."
      />

      <section className="card order-success-card">
        <div className="order-success-status">Order placed successfully</div>
        <h2>Order ID: GLN2602129481</h2>
        <p>Expected delivery date: Monday, 16 Feb 2026</p>
        <p className="order-success-cashback">
          ₹1,660 Cashback will be credited after delivery
        </p>

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
