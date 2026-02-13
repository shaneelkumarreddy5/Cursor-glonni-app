import { PageIntro } from "../../components/ui/PageIntro";
import { useCommerce } from "../../state/CommerceContext";
import { formatInr } from "../../utils/currency";

const faqItems = [
  "How is cashback calculated on Glonni?",
  "When will cashback be credited to wallet?",
  "How do I request a return or replacement?",
];

function formatOrderDate(orderDateIso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(orderDateIso));
}

export function SettingsOverviewPage() {
  const { orders, pendingCashbackTotalInr, cartItemsCount } = useCommerce();
  const activeOrders = orders.filter((order) => order.status !== "Delivered").length;

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Settings Overview"
        description="Manage your orders, wallet, support, and profile from one place."
      />

      <section className="card settings-kpi-grid">
        <article>
          <h3>Orders in progress</h3>
          <p>{activeOrders} active orders</p>
        </article>
        <article>
          <h3>Pending cashback</h3>
          <p>{formatInr(pendingCashbackTotalInr)}</p>
        </article>
        <article>
          <h3>Total orders</h3>
          <p>{orders.length} orders</p>
        </article>
        <article>
          <h3>Cart items</h3>
          <p>{cartItemsCount} items</p>
        </article>
      </section>
    </div>
  );
}

export function OrdersSettingsPage() {
  const { orders } = useCommerce();

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Orders"
        description="All placed orders from the mock checkout flow appear here."
      />

      <section className="card settings-list">
        {orders.length > 0 ? (
          orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <article key={order.id} className="settings-list-row">
                <div>
                  <h3>{order.id}</h3>
                  <p>
                    Date: {formatOrderDate(order.placedAtIso)} • Status: {order.status}
                  </p>
                  <p>
                    Items: {itemCount} • Payment: {order.paymentMethodTitle}
                  </p>
                  <p>
                    Cashback: {formatInr(order.cashbackPendingInr)} ({order.cashbackStatus})
                  </p>
                </div>
                <strong>{formatInr(order.payableAmountInr)}</strong>
              </article>
            );
          })
        ) : (
          <article className="settings-list-row">
            <div>
              <h3>No orders yet</h3>
              <p>Place an order from checkout to see it listed here.</p>
            </div>
            <strong>-</strong>
          </article>
        )}
      </section>
    </div>
  );
}

export function WalletSettingsPage() {
  const { orders, pendingCashbackTotalInr } = useCommerce();
  const pendingCashbackOrders = orders.filter(
    (order) => order.cashbackStatus === "Pending",
  );

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Wallet"
        description="Cashback is tracked as pending and linked to corresponding orders."
      />

      <section className="card settings-kpi-grid">
        <article>
          <h3>Available balance</h3>
          <p>{formatInr(0)}</p>
        </article>
        <article>
          <h3>Pending cashback</h3>
          <p>{formatInr(pendingCashbackTotalInr)}</p>
        </article>
        <article>
          <h3>Pending entries</h3>
          <p>{pendingCashbackOrders.length}</p>
        </article>
      </section>

      <section className="card settings-list">
        {pendingCashbackOrders.length > 0 ? (
          pendingCashbackOrders.map((order) => (
            <article key={order.id} className="settings-list-row">
              <div>
                <h3>Cashback for {order.id}</h3>
                <p>Placed on: {formatOrderDate(order.placedAtIso)}</p>
                <p>Status: {order.cashbackStatus}</p>
              </div>
              <strong className="settings-credit">
                +{formatInr(order.cashbackPendingInr)}
              </strong>
            </article>
          ))
        ) : (
          <article className="settings-list-row">
            <div>
              <h3>No pending cashback</h3>
              <p>Pending cashback entries will appear after placing new orders.</p>
            </div>
            <strong>{formatInr(0)}</strong>
          </article>
        )}
      </section>
    </div>
  );
}

export function SupportSettingsPage() {
  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Support"
        description="Get help with orders, cashback, and account actions."
      />

      <section className="card">
        <header className="section-header">
          <h2>Frequently asked questions</h2>
        </header>
        <div className="chip-row">
          {faqItems.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="card settings-list">
        <article className="settings-list-row">
          <div>
            <h3>Ticket #SP-4821</h3>
            <p>Issue: Cashback pending for delivered order.</p>
          </div>
          <strong>In progress</strong>
        </article>
        <article className="settings-list-row">
          <div>
            <h3>Priority support hours</h3>
            <p>Daily 8 AM to 11 PM IST</p>
          </div>
          <strong>Available</strong>
        </article>
      </section>
    </div>
  );
}

export function ProfileSettingsPage() {
  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Profile"
        description="Manage profile details and shopping preferences."
      />

      <section className="card settings-profile-grid">
        <article>
          <h3>Personal details</h3>
          <p>Name: Rohit Sharma</p>
          <p>Email: rohit.sharma@example.com</p>
          <p>Phone: +91 98765 43210</p>
        </article>
        <article>
          <h3>Preferences</h3>
          <p>Language: English</p>
          <p>Currency: INR (₹)</p>
          <p>Preferred category: Electronics</p>
        </article>
      </section>
    </div>
  );
}

export function AddressesSettingsPage() {
  const { addresses, selectedAddressId } = useCommerce();

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Addresses"
        description="Manage your saved delivery addresses."
      />
      <section className="card settings-list">
        {addresses.map((address) => (
          <article key={address.id} className="settings-list-row">
            <div>
              <h3>{address.label}</h3>
              <p>
                {address.fullName} · {address.phoneNumber}
              </p>
              <p>
                {address.line1}, {address.line2}, {address.cityStatePincode}
              </p>
            </div>
            <strong>{selectedAddressId === address.id ? "Selected" : "Saved"}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}

export function NotificationsSettingsPage() {
  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Notifications"
        description="Control order and offer communication settings."
      />
      <section className="card settings-list">
        <article className="settings-list-row">
          <div>
            <h3>Order updates</h3>
            <p>SMS and push notifications for each order status change.</p>
          </div>
          <strong>Enabled</strong>
        </article>
        <article className="settings-list-row">
          <div>
            <h3>Cashback updates</h3>
            <p>Alerts when cashback stays pending or gets updated.</p>
          </div>
          <strong>Enabled</strong>
        </article>
        <article className="settings-list-row">
          <div>
            <h3>Promotional offers</h3>
            <p>Weekly top deals and bank offer notifications.</p>
          </div>
          <strong>Weekly</strong>
        </article>
      </section>
    </div>
  );
}
