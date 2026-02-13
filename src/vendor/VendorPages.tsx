import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { formatInr } from "../utils/currency";
import { VendorLayout } from "./VendorLayout";
import {
  VendorProvider,
  type VendorOnboardingData,
  useVendor,
} from "./VendorContext";

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
  const { isLoggedIn, hasCompletedOnboarding } = useVendor();

  return (
    <Navigate
      to={
        !isLoggedIn
          ? ROUTES.vendorLogin
          : hasCompletedOnboarding
            ? ROUTES.vendorDashboard
            : ROUTES.vendorOnboarding
      }
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
  const { isLoggedIn, loginVendor, hasCompletedOnboarding } = useVendor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (isLoggedIn) {
    return (
      <Navigate
        to={hasCompletedOnboarding ? ROUTES.vendorDashboard : ROUTES.vendorOnboarding}
        replace
      />
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = loginVendor(email, password);
    setFeedbackMessage(result.message);

    if (result.ok) {
      navigate(
        hasCompletedOnboarding ? ROUTES.vendorDashboard : ROUTES.vendorOnboarding,
        { replace: true },
      );
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

export function VendorOnboardingPage() {
  const navigate = useNavigate();
  const { onboardingData, submitOnboarding, vendorStatus } = useVendor();

  const [formState, setFormState] = useState<VendorOnboardingData>({
    businessName: onboardingData?.businessName ?? "",
    ownerName: onboardingData?.ownerName ?? "",
    phone: onboardingData?.phone ?? "",
    gstNumber: onboardingData?.gstNumber ?? "",
    bankAccountHolderName: onboardingData?.bankAccountHolderName ?? "",
    bankAccountNumber: onboardingData?.bankAccountNumber ?? "",
    bankIfscCode: onboardingData?.bankIfscCode ?? "",
    bankName: onboardingData?.bankName ?? "",
    businessAddress: onboardingData?.businessAddress ?? "",
    documents: onboardingData?.documents ?? [],
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  function updateFormField<Key extends keyof VendorOnboardingData>(
    key: Key,
    value: VendorOnboardingData[Key],
  ) {
    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    updateFormField(
      "documents",
      selectedFiles.map((file) => file.name),
    );
  }

  function handleOnboardingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = submitOnboarding(formState);
    setFeedbackMessage(result.message);

    if (result.ok) {
      navigate(ROUTES.vendorDashboard, { replace: true });
    }
  }

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Vendor Onboarding"
        description="Submit business and bank details for compliance review."
      />

      <section className="vendor-placeholder-card">
        <p>
          Current status: <strong>{vendorStatus}</strong>
        </p>
        <form className="vendor-onboarding-form" onSubmit={handleOnboardingSubmit}>
          <div className="vendor-onboarding-grid">
            <label className="field">
              Business Name
              <input
                type="text"
                value={formState.businessName}
                onChange={(event) =>
                  updateFormField("businessName", event.target.value)
                }
                placeholder="Astra Retail LLP"
              />
            </label>

            <label className="field">
              Owner Name
              <input
                type="text"
                value={formState.ownerName}
                onChange={(event) =>
                  updateFormField("ownerName", event.target.value)
                }
                placeholder="Rohit Mehta"
              />
            </label>

            <label className="field">
              Phone
              <input
                type="tel"
                value={formState.phone}
                onChange={(event) => updateFormField("phone", event.target.value)}
                placeholder="+91 98XXXXXX10"
              />
            </label>

            <label className="field">
              GST Number (optional)
              <input
                type="text"
                value={formState.gstNumber}
                onChange={(event) =>
                  updateFormField("gstNumber", event.target.value)
                }
                placeholder="27ABCDE1234F1Z5"
              />
            </label>

            <label className="field">
              Bank Account Holder
              <input
                type="text"
                value={formState.bankAccountHolderName}
                onChange={(event) =>
                  updateFormField("bankAccountHolderName", event.target.value)
                }
                placeholder="Astra Retail LLP"
              />
            </label>

            <label className="field">
              Bank Account Number
              <input
                type="text"
                value={formState.bankAccountNumber}
                onChange={(event) =>
                  updateFormField("bankAccountNumber", event.target.value)
                }
                placeholder="XXXXXX245901"
              />
            </label>

            <label className="field">
              IFSC Code
              <input
                type="text"
                value={formState.bankIfscCode}
                onChange={(event) =>
                  updateFormField("bankIfscCode", event.target.value)
                }
                placeholder="HDFC0001234"
              />
            </label>

            <label className="field">
              Bank Name
              <input
                type="text"
                value={formState.bankName}
                onChange={(event) => updateFormField("bankName", event.target.value)}
                placeholder="HDFC Bank"
              />
            </label>
          </div>

          <label className="field">
            Business Address
            <textarea
              value={formState.businessAddress}
              onChange={(event) =>
                updateFormField("businessAddress", event.target.value)
              }
              className="order-textarea"
              rows={4}
              placeholder="Complete business address with city and pincode"
            />
          </label>

          <label className="field">
            Upload Documents (mock UI)
            <input type="file" multiple onChange={handleFileSelection} />
          </label>
          {formState.documents.length > 0 ? (
            <ul className="vendor-document-list">
              {formState.documents.map((documentName) => (
                <li key={documentName}>{documentName}</li>
              ))}
            </ul>
          ) : (
            <p>No documents selected yet.</p>
          )}

          <div className="inline-actions">
            <button type="submit" className="btn btn-primary">
              Submit Onboarding
            </button>
            <Link to={ROUTES.vendorDashboard} className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
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
  const { canPublishProducts, vendorStatus, hasCompletedOnboarding } = useVendor();

  const publishDisabledHint = useMemo(() => {
    if (canPublishProducts) {
      return "";
    }

    if (!hasCompletedOnboarding) {
      return "Add Product is disabled until onboarding is submitted.";
    }

    if (vendorStatus === "Rejected") {
      return "Add Product is disabled because vendor profile is rejected.";
    }

    return "Add Product is disabled while profile is under scrutiny.";
  }, [canPublishProducts, hasCompletedOnboarding, vendorStatus]);

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
            Add Product
          </button>
          {!hasCompletedOnboarding ? (
            <Link to={ROUTES.vendorOnboarding} className="btn btn-secondary">
              Complete Onboarding
            </Link>
          ) : null}
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
  const {
    vendorStatus,
    approveVendor,
    hasCompletedOnboarding,
    onboardingData,
  } = useVendor();

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Settings"
        description="Vendor profile and approval controls (mock)."
      />
      <section className="vendor-placeholder-card">
        <p>
          Current vendor status: <strong>{vendorStatus}</strong>
        </p>
        <div className="inline-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={approveVendor}
            disabled={vendorStatus === "Approved" || !hasCompletedOnboarding}
            title={
              !hasCompletedOnboarding
                ? "Complete onboarding before approval."
                : "Approve vendor profile"
            }
          >
            Approve Vendor
          </button>
          <Link to={ROUTES.vendorOnboarding} className="btn btn-secondary">
            Open Onboarding Form
          </Link>
        </div>

        {hasCompletedOnboarding && onboardingData ? (
          <div className="vendor-onboarding-preview">
            <p>
              Onboarding submitted for <strong>{onboardingData.businessName}</strong>.
            </p>
            <p>Owner: {onboardingData.ownerName}</p>
            <p>Phone: {onboardingData.phone}</p>
            <p>
              Pending settlement reference: {formatInr(125430)}
            </p>
          </div>
        ) : (
          <p>Onboarding has not been submitted yet.</p>
        )}
      </section>
    </div>
  );
}
