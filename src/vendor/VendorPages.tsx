import { useMemo, useState, type FormEvent } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { formatInr } from "../utils/currency";
import { VendorLayout } from "./VendorLayout";
import { VendorProvider, type VendorStatus, useVendor } from "./VendorContext";

function VendorSectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="vendor-section-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

export function VendorProviderRoute() {
  return (
    <VendorProvider>
      <Outlet />
    </VendorProvider>
  );
}

export function VendorLandingRedirect() {
  const { isLoggedIn } = useVendor();

  return (
    <Navigate
      to={isLoggedIn ? ROUTES.vendorDashboard : ROUTES.vendorLogin}
      replace
    />
  );
}

export function VendorProtectedLayoutRoute() {
  const { isLoggedIn } = useVendor();

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.vendorLogin} replace />;
  }

  return <VendorLayout />;
}

export function VendorLoginPage() {
  const navigate = useNavigate();
  const { isLoggedIn, loginVendor } = useVendor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (isLoggedIn) {
    return <Navigate to={ROUTES.vendorDashboard} replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = loginVendor(email, password);
    setFeedbackMessage(result.message);

    if (result.ok) {
      navigate(ROUTES.vendorDashboard, { replace: true });
    }
  }

  return (
    <div className="vendor-auth-shell">
      <section className="vendor-auth-card">
        <p className="vendor-kicker">Glonni Vendor</p>
        <h1>Vendor Login (Mock)</h1>
        <p>Sign in to access dashboard, products, orders, wallet, ads, and support.</p>

        <form className="vendor-auth-form" onSubmit={handleSubmit}>
          <label className="field">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vendor@glonni.in"
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

        {feedbackMessage ? <p className="vendor-auth-feedback">{feedbackMessage}</p> : null}
      </section>
    </div>
  );
}

export function VendorDashboardPage() {
  const { summaryMetrics } = useVendor();

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Dashboard"
        description="A quick view of order, product, and settlement performance."
      />

      <section className="vendor-summary-grid">
        <article className="vendor-summary-card">
          <h3>Total Orders</h3>
          <p>{summaryMetrics.totalOrders}</p>
        </article>
        <article className="vendor-summary-card">
          <h3>Pending Orders</h3>
          <p>{summaryMetrics.pendingOrders}</p>
        </article>
        <article className="vendor-summary-card">
          <h3>Active Products</h3>
          <p>{summaryMetrics.activeProducts}</p>
        </article>
        <article className="vendor-summary-card">
          <h3>Pending Settlement</h3>
          <p>{formatInr(summaryMetrics.pendingSettlementInr)}</p>
        </article>
      </section>
    </div>
  );
}

export function VendorProductsPage() {
  const { canPublishProducts, vendorStatus } = useVendor();

  const publishDisabledHint = useMemo(() => {
    if (canPublishProducts) {
      return "";
    }

    if (vendorStatus === "Rejected") {
      return "Publishing disabled: vendor profile is rejected.";
    }

    return "Publishing disabled: vendor profile is under scrutiny.";
  }, [canPublishProducts, vendorStatus]);

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Products"
        description="Manage product catalog and publishing controls."
      />

      <section className="vendor-placeholder-card">
        <p>Product management module will be added in upcoming steps.</p>
        <div className="inline-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canPublishProducts}
            title={publishDisabledHint}
          >
            Publish Product
          </button>
        </div>
        {!canPublishProducts ? <p>{publishDisabledHint}</p> : null}
      </section>
    </div>
  );
}

function VendorPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="stack vendor-page">
      <VendorSectionHeader title={title} description={description} />
      <section className="vendor-placeholder-card">
        <p>{title} page placeholder is ready for upcoming implementation.</p>
      </section>
    </div>
  );
}

export function VendorOrdersPage() {
  return (
    <VendorPlaceholderPage
      title="Orders"
      description="Track order lifecycle and fulfillment operations."
    />
  );
}

export function VendorWalletPage() {
  return (
    <VendorPlaceholderPage
      title="Wallet"
      description="Review settlements and payout history in INR."
    />
  );
}

export function VendorAdsPage() {
  return (
    <VendorPlaceholderPage
      title="Ads"
      description="Create and monitor ads across product placements."
    />
  );
}

export function VendorSupportPage() {
  return (
    <VendorPlaceholderPage
      title="Support"
      description="Manage support tickets and escalations."
    />
  );
}

export function VendorSettingsPage() {
  const { vendorStatus, setVendorStatus } = useVendor();

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Settings"
        description="Vendor profile and status controls (mock)."
      />
      <section className="vendor-placeholder-card">
        <label className="field">
          Vendor status (mock)
          <select
            value={vendorStatus}
            onChange={(event) => setVendorStatus(event.target.value as VendorStatus)}
            className="order-select"
          >
            <option value="Under Scrutiny">Under Scrutiny</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
        <p>
          Use this control to test status handling. Product publishing stays enabled only when
          status is Approved.
        </p>
      </section>
    </div>
  );
}
