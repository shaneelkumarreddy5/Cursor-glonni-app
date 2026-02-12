import { PageIntro } from "../../components/ui/PageIntro";
import { formatInr } from "../../utils/currency";

type MockOrder = {
  id: string;
  date: string;
  status: string;
  totalInr: number;
  cashbackInr: number;
};

type WalletEntry = {
  id: string;
  title: string;
  date: string;
  amountInr: number;
  kind: "credit" | "debit";
};

const recentOrders: MockOrder[] = [
  {
    id: "GLN2602129481",
    date: "12 Feb 2026",
    status: "Packed",
    totalInr: 33396,
    cashbackInr: 1660,
  },
  {
    id: "GLN2602106403",
    date: "10 Feb 2026",
    status: "Delivered",
    totalInr: 45999,
    cashbackInr: 1800,
  },
  {
    id: "GLN2602072217",
    date: "7 Feb 2026",
    status: "Delivered",
    totalInr: 2999,
    cashbackInr: 180,
  },
];

const walletEntries: WalletEntry[] = [
  {
    id: "w-1",
    title: "Cashback credited for order GLN2602106403",
    date: "11 Feb 2026",
    amountInr: 1800,
    kind: "credit",
  },
  {
    id: "w-2",
    title: "Reward wallet adjustment",
    date: "9 Feb 2026",
    amountInr: 300,
    kind: "credit",
  },
  {
    id: "w-3",
    title: "Wallet used in order GLN2602051472",
    date: "5 Feb 2026",
    amountInr: 500,
    kind: "debit",
  },
];

const faqItems = [
  "How is cashback calculated on Glonni?",
  "When will cashback be credited to wallet?",
  "How do I request a return or replacement?",
];

export function SettingsOverviewPage() {
  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Settings Overview"
        description="Manage your orders, wallet, support tickets, and profile preferences from one place."
      />

      <section className="card settings-kpi-grid">
        <article>
          <h3>Orders in progress</h3>
          <p>2 active orders</p>
        </article>
        <article>
          <h3>Wallet balance</h3>
          <p>{formatInr(3420)}</p>
        </article>
        <article>
          <h3>Pending cashback</h3>
          <p>{formatInr(1660)}</p>
        </article>
        <article>
          <h3>Support tickets</h3>
          <p>1 open ticket</p>
        </article>
      </section>
    </div>
  );
}

export function OrdersSettingsPage() {
  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Orders"
        description="Track all your purchases and cashback status updates."
      />

      <section className="card settings-list">
        {recentOrders.map((order) => (
          <article key={order.id} className="settings-list-row">
            <div>
              <h3>{order.id}</h3>
              <p>
                Date: {order.date} • Status: {order.status}
              </p>
              <p>Cashback: {formatInr(order.cashbackInr)} (post delivery credit)</p>
            </div>
            <strong>{formatInr(order.totalInr)}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}

export function WalletSettingsPage() {
  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Wallet"
        description="View available balance, cashback earnings, and wallet activity."
      />

      <section className="card settings-kpi-grid">
        <article>
          <h3>Available balance</h3>
          <p>{formatInr(3420)}</p>
        </article>
        <article>
          <h3>Pending cashback</h3>
          <p>{formatInr(1660)}</p>
        </article>
        <article>
          <h3>Total earned this month</h3>
          <p>{formatInr(2280)}</p>
        </article>
      </section>

      <section className="card settings-list">
        {walletEntries.map((entry) => (
          <article key={entry.id} className="settings-list-row">
            <div>
              <h3>{entry.title}</h3>
              <p>{entry.date}</p>
            </div>
            <strong className={entry.kind === "credit" ? "settings-credit" : "settings-debit"}>
              {entry.kind === "credit" ? "+" : "-"}
              {formatInr(entry.amountInr)}
            </strong>
          </article>
        ))}
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
            <p>Issue: Cashback not reflected for delivered order</p>
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
  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Addresses"
        description="Manage saved delivery addresses."
      />
      <section className="card settings-list">
        <article className="settings-list-row">
          <div>
            <h3>Home</h3>
            <p>Flat 903, Palm Residency, HSR Layout, Bengaluru, Karnataka 560102</p>
          </div>
          <strong>Default</strong>
        </article>
        <article className="settings-list-row">
          <div>
            <h3>Office</h3>
            <p>Bagmane Tech Park, CV Raman Nagar, Bengaluru, Karnataka 560093</p>
          </div>
          <strong>Saved</strong>
        </article>
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
            <p>SMS and push notifications for every order status change.</p>
          </div>
          <strong>Enabled</strong>
        </article>
        <article className="settings-list-row">
          <div>
            <h3>Cashback updates</h3>
            <p>Alerts when cashback is approved and credited.</p>
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
