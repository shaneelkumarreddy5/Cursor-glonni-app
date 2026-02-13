import { useState, type FormEvent } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { AdminProvider, useAdmin } from "./AdminContext";
import { AdminLayout } from "./AdminLayout";

type AdminMetric = {
  label: string;
  value: number;
};

const ADMIN_DASHBOARD_METRICS: AdminMetric[] = [
  { label: "Total Users", value: 12450 },
  { label: "Total Vendors", value: 382 },
  { label: "Total Orders", value: 28871 },
  { label: "Pending Approvals", value: 34 },
  { label: "Active Ads", value: 119 },
];

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
};

function AdminSectionHeader({ title, description }: AdminPlaceholderPageProps) {
  return (
    <header className="admin-page-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return (
    <section className="admin-placeholder-card">
      <AdminSectionHeader title={title} description={description} />
      <p>Placeholder page for the Admin MVP foundation (frontend mock state only).</p>
    </section>
  );
}

export function AdminProviderRoute() {
  return (
    <AdminProvider>
      <Outlet />
    </AdminProvider>
  );
}

export function AdminProtectedLayoutRoute() {
  const { isLoggedIn } = useAdmin();

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.admin} replace />;
  }

  return <AdminLayout />;
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { isLoggedIn, loginAdmin } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (isLoggedIn) {
    return <Navigate to={ROUTES.adminDashboard} replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = loginAdmin(email, password);
    setFeedbackMessage(result.message);

    if (result.ok) {
      navigate(ROUTES.adminDashboard, { replace: true });
    }
  }

  return (
    <div className="admin-auth-shell">
      <section className="admin-auth-card">
        <h1>Admin Login (Mock)</h1>
        <p>Sign in to access admin controls for vendors, orders, ads, support, and settings.</p>

        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <label className="field">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@glonni.in"
            />
          </label>

          <label className="field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
          </label>

          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>

        {feedbackMessage ? <p className="admin-auth-feedback">{feedbackMessage}</p> : null}
      </section>
    </div>
  );
}

export function AdminDashboardPage() {
  return (
    <div className="stack">
      <AdminSectionHeader
        title="Dashboard"
        description="Overview metrics for marketplace operations (mock frontend data)."
      />

      <section className="admin-overview-grid">
        {ADMIN_DASHBOARD_METRICS.map((metric) => (
          <article key={metric.label} className="admin-overview-card">
            <h3>{metric.label}</h3>
            <p>{metric.value.toLocaleString("en-IN")}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export function AdminVendorsPage() {
  return (
    <AdminPlaceholderPage
      title="Vendors"
      description="Vendor lifecycle, approval queue, and compliance actions."
    />
  );
}

export function AdminProductsPage() {
  return (
    <AdminPlaceholderPage
      title="Products"
      description="Catalog moderation, visibility controls, and product governance."
    />
  );
}

export function AdminOrdersPage() {
  return (
    <AdminPlaceholderPage
      title="Orders"
      description="Order monitoring, escalations, and fulfillment oversight."
    />
  );
}

export function AdminReturnsRtoPage() {
  return (
    <AdminPlaceholderPage
      title="Returns / RTO"
      description="Track return flow, return-to-origin cases, and issue trends."
    />
  );
}

export function AdminAdsPage() {
  return (
    <AdminPlaceholderPage
      title="Ads"
      description="Sponsored placements review and campaign-level controls."
    />
  );
}

export function AdminSupportPage() {
  return (
    <AdminPlaceholderPage
      title="Support"
      description="Support queue health, escalations, and resolution workflows."
    />
  );
}

export function AdminSettingsPage() {
  return (
    <AdminPlaceholderPage
      title="Settings"
      description="Admin account preferences, platform flags, and policy switches."
    />
  );
}
