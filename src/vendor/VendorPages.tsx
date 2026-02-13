import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import { formatInr } from "../utils/currency";
import { VendorLayout } from "./VendorLayout";
import {
  VendorProvider,
  type VendorAdPayload,
  type VendorBankDetailsInput,
  type VendorAdType,
  type VendorAdStatus,
  type VendorNotificationPreferences,
  type VendorOnboardingData,
  type VendorOrder,
  type VendorOrderStatus,
  type VendorReturnCaseStatus,
  type VendorRtoResolutionStatus,
  type VendorWalletEntryStatus,
  type VendorProduct,
  type VendorProductExtraOffer,
  type VendorProductExtraOfferType,
  type VendorProductPayload,
  type VendorProductSpecification,
  type VendorProductStatus,
  type VendorSupportTicketCategory,
  type VendorSupportTicketPayload,
  type VendorSupportTicketStatus,
  useVendor,
} from "./VendorContext";

type VendorProductFormState = {
  category: VendorProductPayload["category"];
  brand: string;
  productName: string;
  images: string[];
  priceInput: string;
  stockInput: string;
  specifications: VendorProductSpecification[];
  extraOffers: VendorProductExtraOffer[];
};

const PRODUCT_CATEGORIES: VendorProductPayload["category"][] = [
  "Mobiles",
  "Laptops",
  "Accessories",
  "Footwear",
];

const EXTRA_OFFER_TYPES: VendorProductExtraOfferType[] = [
  "Freebie",
  "Discount",
  "Coupon",
];

const VENDOR_AD_TYPES: VendorAdType[] = [
  "Sponsored Product",
  "Sponsored Category",
];

const VENDOR_AD_DAILY_RATES_INR: Record<VendorAdType, number> = {
  "Sponsored Product": 120,
  "Sponsored Category": 240,
};

const SUPPORT_TICKET_CATEGORIES: VendorSupportTicketCategory[] = [
  "Orders",
  "Settlements",
  "Returns & RTO",
  "Ads & Visibility",
  "Compliance",
];

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

function createEmptyProductFormState(): VendorProductFormState {
  return {
    category: "Mobiles",
    brand: "",
    productName: "",
    images: [],
    priceInput: "",
    stockInput: "",
    specifications: [{ key: "", value: "" }],
    extraOffers: [{ type: "Freebie", value: "" }],
  };
}

function createProductFormStateFromProduct(product: VendorProduct): VendorProductFormState {
  return {
    category: product.category,
    brand: product.brand,
    productName: product.productName,
    images: product.images,
    priceInput: String(product.priceInr),
    stockInput: String(product.stockQuantity),
    specifications:
      product.specifications.length > 0
        ? product.specifications
        : [{ key: "", value: "" }],
    extraOffers:
      product.extraOffers.length > 0
        ? product.extraOffers
        : [{ type: "Freebie", value: "" }],
  };
}

function buildPayloadFromFormState(
  formState: VendorProductFormState,
): VendorProductPayload {
  return {
    category: formState.category,
    brand: formState.brand,
    productName: formState.productName,
    images: formState.images,
    priceInr: Number(formState.priceInput),
    stockQuantity: Number(formState.stockInput),
    specifications: formState.specifications,
    extraOffers: formState.extraOffers,
  };
}

function getProductStatusClass(status: VendorProductStatus) {
  if (status === "Draft") {
    return "vendor-product-status vendor-product-status-draft";
  }
  if (status === "Under Review") {
    return "vendor-product-status vendor-product-status-review";
  }
  if (status === "Live") {
    return "vendor-product-status vendor-product-status-live";
  }
  return "vendor-product-status vendor-product-status-rejected";
}

function getOrderStatusClass(status: VendorOrderStatus) {
  if (status === "New") {
    return "vendor-order-status-badge vendor-order-status-new";
  }
  if (status === "Packed") {
    return "vendor-order-status-badge vendor-order-status-packed";
  }
  if (status === "Shipped") {
    return "vendor-order-status-badge vendor-order-status-shipped";
  }
  return "vendor-order-status-badge vendor-order-status-delivered";
}

function getWalletStatusClass(status: VendorWalletEntryStatus) {
  if (status === "Pending") {
    return "vendor-wallet-status-badge vendor-wallet-status-pending";
  }
  if (status === "Available") {
    return "vendor-wallet-status-badge vendor-wallet-status-available";
  }
  return "vendor-wallet-status-badge vendor-wallet-status-adjusted";
}

function getNextVendorOrderStatus(
  status: VendorOrderStatus,
): VendorOrderStatus | null {
  if (status === "New") {
    return "Packed";
  }
  if (status === "Packed") {
    return "Shipped";
  }
  if (status === "Shipped") {
    return "Delivered";
  }
  return null;
}

function getOrderTimelineStepClass(currentStatus: VendorOrderStatus, step: VendorOrderStatus) {
  const orderSequence: VendorOrderStatus[] = ["New", "Packed", "Shipped", "Delivered"];
  const currentIndex = orderSequence.indexOf(currentStatus);
  const stepIndex = orderSequence.indexOf(step);

  if (stepIndex < currentIndex) {
    return "vendor-order-timeline-step is-complete";
  }
  if (stepIndex === currentIndex) {
    return "vendor-order-timeline-step is-current";
  }
  return "vendor-order-timeline-step";
}

function getReturnCaseStatusClass(status: VendorReturnCaseStatus) {
  if (status === "Return Requested") {
    return "vendor-return-status-badge vendor-return-status-requested";
  }
  if (status === "Pickup Pending") {
    return "vendor-return-status-badge vendor-return-status-pending";
  }
  if (status === "Received at Hub") {
    return "vendor-return-status-badge vendor-return-status-hub";
  }
  return "vendor-return-status-badge vendor-return-status-adjusted";
}

function getReturnTimelineStepClass(
  currentStatus: VendorReturnCaseStatus,
  timelineStep: VendorReturnCaseStatus,
) {
  const returnSequence: VendorReturnCaseStatus[] = [
    "Return Requested",
    "Pickup Pending",
    "Received at Hub",
    "Refund Adjusted",
  ];
  const currentIndex = returnSequence.indexOf(currentStatus);
  const timelineIndex = returnSequence.indexOf(timelineStep);

  if (timelineIndex < currentIndex) {
    return "vendor-return-timeline-step is-complete";
  }
  if (timelineIndex === currentIndex) {
    return "vendor-return-timeline-step is-current";
  }
  return "vendor-return-timeline-step";
}

function getRtoResolutionClass(status: VendorRtoResolutionStatus) {
  if (status === "Charge Applied") {
    return "vendor-rto-status-badge vendor-rto-status-charge";
  }
  if (status === "Under Review") {
    return "vendor-rto-status-badge vendor-rto-status-review";
  }
  return "vendor-rto-status-badge vendor-rto-status-reversed";
}

function getSupportTicketStatusClass(status: VendorSupportTicketStatus) {
  if (status === "Open") {
    return "vendor-support-ticket-status vendor-support-ticket-open";
  }
  if (status === "In Progress") {
    return "vendor-support-ticket-status vendor-support-ticket-progress";
  }
  return "vendor-support-ticket-status vendor-support-ticket-resolved";
}

function formatTimestamp(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
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

export function VendorAnalyticsPage() {
  const {
    vendorOrders,
    vendorReturnCases,
    vendorAds,
    getVendorAdStatus,
    getVendorAdAmountSpent,
  } = useVendor();

  const analytics = useMemo(() => {
    const totalSalesInr = vendorOrders
      .filter((order) => order.visibilityState !== "Cancelled")
      .reduce((sum, order) => sum + order.amountInr, 0);
    const ordersCount = vendorOrders.length;
    const returnsCount = vendorReturnCases.length;
    const activeAds = vendorAds.filter((ad) => getVendorAdStatus(ad) === "Active");
    const adSpendInr = vendorAds.reduce(
      (sum, ad) => sum + getVendorAdAmountSpent(ad),
      0,
    );

    return {
      totalSalesInr,
      ordersCount,
      returnsCount,
      activeAdsCount: activeAds.length,
      adSpendInr,
    };
  }, [getVendorAdAmountSpent, getVendorAdStatus, vendorAds, vendorOrders, vendorReturnCases]);

  const sortedAds = useMemo(
    () =>
      [...vendorAds].sort(
        (first, second) =>
          new Date(second.startedAtIso).getTime() -
          new Date(first.startedAtIso).getTime(),
      ),
    [vendorAds],
  );

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Analytics"
        description="View sales, order outcomes, and ad performance metrics from mock frontend data."
      />

      <section className="vendor-summary-grid">
        <article className="vendor-summary-card">
          <h3>Total Sales</h3>
          <p>{formatInr(analytics.totalSalesInr)}</p>
        </article>
        <article className="vendor-summary-card">
          <h3>Orders Count</h3>
          <p>{analytics.ordersCount}</p>
        </article>
        <article className="vendor-summary-card">
          <h3>Returns Count</h3>
          <p>{analytics.returnsCount}</p>
        </article>
        <article className="vendor-summary-card">
          <h3>Ads Performance (Mock)</h3>
          <p>{analytics.activeAdsCount} Active Ads</p>
          <span className="vendor-summary-subtext">
            Total spent: {formatInr(analytics.adSpendInr)}
          </span>
        </article>
      </section>

      <section className="vendor-placeholder-card">
        <header className="section-header">
          <h2>Ads Performance Breakdown</h2>
        </header>
        <div className="stack-sm">
          {sortedAds.map((ad) => (
            <article key={ad.id} className="vendor-analytics-row">
              <div>
                <h3>{ad.id}</h3>
                <p>
                  {ad.type === "Sponsored Product"
                    ? `Sponsored Product • ${ad.productName ?? "Unknown"}`
                    : `Sponsored Category • ${ad.category ?? "Unknown"}`}
                </p>
              </div>
              <div className="vendor-analytics-row-meta">
                <span className="vendor-summary-subtext">
                  {getVendorAdStatus(ad)} • Spent {formatInr(getVendorAdAmountSpent(ad))}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function VendorReportsPage() {
  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Reports"
        description="View-only report placeholders for exports and audits."
      />

      <section className="vendor-reports-grid">
        <article className="vendor-placeholder-card vendor-report-card">
          <header className="section-header">
            <h2>Orders Report</h2>
          </header>
          <p>Includes order IDs, statuses, payment methods, and delivery progression.</p>
          <button type="button" className="btn btn-secondary" disabled>
            View (Mock)
          </button>
        </article>

        <article className="vendor-placeholder-card vendor-report-card">
          <header className="section-header">
            <h2>Settlements Report</h2>
          </header>
          <p>Includes pending/available/adjusted entries and settlement summary references.</p>
          <button type="button" className="btn btn-secondary" disabled>
            View (Mock)
          </button>
        </article>

        <article className="vendor-placeholder-card vendor-report-card">
          <header className="section-header">
            <h2>Returns / RTO Report</h2>
          </header>
          <p>Includes return timelines, RTO deductions, and auto-adjust reversal events.</p>
          <button type="button" className="btn btn-secondary" disabled>
            View (Mock)
          </button>
        </article>
      </section>
    </div>
  );
}

export function VendorProductsPage() {
  const {
    canPublishProducts,
    vendorProducts,
    addVendorProduct,
    updateVendorProduct,
    approveVendorProduct,
    rejectVendorProduct,
    getVendorProductVisibilityPriority,
  } = useVendor();
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formState, setFormState] = useState<VendorProductFormState>(
    createEmptyProductFormState,
  );
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(null);
  const [rejectReasonByProductId, setRejectReasonByProductId] = useState<
    Record<string, string>
  >({});
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const sortedProducts = useMemo(
    () =>
      [...vendorProducts].sort(
        (first, second) =>
          getVendorProductVisibilityPriority(second.id, second.category) -
            getVendorProductVisibilityPriority(first.id, first.category) ||
          new Date(second.updatedAtIso).getTime() -
            new Date(first.updatedAtIso).getTime(),
      ),
    [getVendorProductVisibilityPriority, vendorProducts],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<VendorProductStatus, number> = {
      Draft: 0,
      "Under Review": 0,
      Live: 0,
      Rejected: 0,
    };

    sortedProducts.forEach((product) => {
      counts[product.status] += 1;
    });

    return counts;
  }, [sortedProducts]);

  function updateFormField<Key extends keyof VendorProductFormState>(
    key: Key,
    value: VendorProductFormState[Key],
  ) {
    setFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    updateFormField(
      "images",
      selectedFiles.map((file) => file.name),
    );
  }

  function updateSpecification(
    index: number,
    key: keyof VendorProductSpecification,
    value: string,
  ) {
    setFormState((currentState) => {
      const nextSpecifications = [...currentState.specifications];
      nextSpecifications[index] = {
        ...nextSpecifications[index],
        [key]: value,
      };
      return { ...currentState, specifications: nextSpecifications };
    });
  }

  function addSpecificationRow() {
    setFormState((currentState) => ({
      ...currentState,
      specifications: [...currentState.specifications, { key: "", value: "" }],
    }));
  }

  function removeSpecificationRow(index: number) {
    setFormState((currentState) => ({
      ...currentState,
      specifications:
        currentState.specifications.length === 1
          ? currentState.specifications
          : currentState.specifications.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateExtraOffer(
    index: number,
    key: keyof VendorProductExtraOffer,
    value: string,
  ) {
    setFormState((currentState) => {
      const nextExtraOffers = [...currentState.extraOffers];
      if (key === "type") {
        nextExtraOffers[index] = {
          ...nextExtraOffers[index],
          type: value as VendorProductExtraOfferType,
        };
      } else {
        nextExtraOffers[index] = {
          ...nextExtraOffers[index],
          value,
        };
      }

      return { ...currentState, extraOffers: nextExtraOffers };
    });
  }

  function addExtraOfferRow() {
    setFormState((currentState) => ({
      ...currentState,
      extraOffers: [...currentState.extraOffers, { type: "Freebie", value: "" }],
    }));
  }

  function removeExtraOfferRow(index: number) {
    setFormState((currentState) => ({
      ...currentState,
      extraOffers:
        currentState.extraOffers.length === 1
          ? currentState.extraOffers
          : currentState.extraOffers.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function resetProductForm() {
    setFormMode("add");
    setEditingProductId(null);
    setFormState(createEmptyProductFormState());
  }

  function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildPayloadFromFormState(formState);
    if (Number.isNaN(payload.priceInr) || Number.isNaN(payload.stockQuantity)) {
      setFeedbackMessage("Enter valid numeric values for price and stock.");
      return;
    }

    const result =
      formMode === "edit" && editingProductId
        ? updateVendorProduct(editingProductId, payload)
        : addVendorProduct(payload);

    setFeedbackMessage(result.message);
    if (result.ok) {
      resetProductForm();
    }
  }

  function startProductEdit(product: VendorProduct) {
    if (product.status === "Live") {
      return;
    }

    setFormMode("edit");
    setEditingProductId(product.id);
    setFormState(createProductFormStateFromProduct(product));
    setFeedbackMessage(null);
  }

  function handleApprove(productId: string) {
    const result = approveVendorProduct(productId);
    setFeedbackMessage(result.message);
  }

  function openRejectPanel(productId: string) {
    setRejectingProductId(productId);
    setFeedbackMessage(null);
  }

  function confirmReject(productId: string) {
    const reason = rejectReasonByProductId[productId] ?? "";
    const result = rejectVendorProduct(productId, reason);
    setFeedbackMessage(result.message);

    if (result.ok) {
      setRejectingProductId(null);
      setRejectReasonByProductId((currentReasons) => ({
        ...currentReasons,
        [productId]: "",
      }));
    }
  }

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Products"
        description="Add, edit, review, and approve/reject products with mock vendor/admin controls."
      />

      {feedbackMessage ? (
        <section className="vendor-placeholder-card">
          <p className="vendor-auth-feedback">{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="vendor-products-grid">
        <article className="vendor-placeholder-card">
          <header className="section-header">
            <h2>{formMode === "edit" ? "Edit Product" : "Add Product"}</h2>
          </header>
          {!canPublishProducts && formMode === "add" ? (
            <p>Add Product is available only when vendor status is Approved.</p>
          ) : null}
          <form className="vendor-onboarding-form" onSubmit={handleProductSubmit}>
            <div className="vendor-onboarding-grid">
              <label className="field">
                Category
                <select
                  value={formState.category}
                  onChange={(event) =>
                    updateFormField(
                      "category",
                      event.target.value as VendorProductPayload["category"],
                    )
                  }
                  className="order-select"
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                Brand
                <input
                  type="text"
                  value={formState.brand}
                  onChange={(event) => updateFormField("brand", event.target.value)}
                  placeholder="Samsung / Apple / OnePlus"
                />
              </label>

              <label className="field">
                Product Name
                <input
                  type="text"
                  value={formState.productName}
                  onChange={(event) =>
                    updateFormField("productName", event.target.value)
                  }
                  placeholder="Galaxy A56 5G"
                />
              </label>

              <label className="field">
                Price (₹)
                <input
                  type="number"
                  min={0}
                  value={formState.priceInput}
                  onChange={(event) => updateFormField("priceInput", event.target.value)}
                  placeholder="26999"
                />
              </label>

              <label className="field">
                Stock Quantity
                <input
                  type="number"
                  min={0}
                  value={formState.stockInput}
                  onChange={(event) => updateFormField("stockInput", event.target.value)}
                  placeholder="42"
                />
              </label>
            </div>

            <label className="field">
              Images (mock upload)
              <input type="file" multiple onChange={handleImageSelection} />
            </label>
            {formState.images.length > 0 ? (
              <ul className="vendor-document-list">
                {formState.images.map((imageName) => (
                  <li key={imageName}>{imageName}</li>
                ))}
              </ul>
            ) : (
              <p>No images selected yet.</p>
            )}

            <div className="vendor-subform-card">
              <header className="section-header">
                <h2>Specifications (Key-Value)</h2>
              </header>
              <div className="stack-sm">
                {formState.specifications.map((specification, index) => (
                  <div key={`spec-${index}`} className="vendor-inline-grid">
                    <input
                      type="text"
                      value={specification.key}
                      onChange={(event) =>
                        updateSpecification(index, "key", event.target.value)
                      }
                      placeholder="Key (RAM / Storage / Battery)"
                    />
                    <input
                      type="text"
                      value={specification.value}
                      onChange={(event) =>
                        updateSpecification(index, "value", event.target.value)
                      }
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removeSpecificationRow(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addSpecificationRow}
                >
                  Add Specification
                </button>
              </div>
            </div>

            <div className="vendor-subform-card">
              <header className="section-header">
                <h2>Vendor Extra Offers</h2>
              </header>
              <div className="stack-sm">
                {formState.extraOffers.map((extraOffer, index) => (
                  <div key={`offer-${index}`} className="vendor-inline-grid">
                    <select
                      value={extraOffer.type}
                      onChange={(event) =>
                        updateExtraOffer(index, "type", event.target.value)
                      }
                      className="order-select"
                    >
                      {EXTRA_OFFER_TYPES.map((offerType) => (
                        <option key={offerType} value={offerType}>
                          {offerType}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={extraOffer.value}
                      onChange={(event) =>
                        updateExtraOffer(index, "value", event.target.value)
                      }
                      placeholder="Offer details"
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => removeExtraOfferRow(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addExtraOfferRow}
                >
                  Add Extra Offer
                </button>
              </div>
            </div>

            <div className="inline-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formMode === "add" && !canPublishProducts}
              >
                {formMode === "edit" ? "Save Changes" : "Submit for Review"}
              </button>
              {formMode === "edit" ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetProductForm}
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="vendor-placeholder-card">
          <header className="section-header">
            <h2>Product List</h2>
          </header>

          <div className="vendor-status-chips">
            <span className="chip">Draft: {statusCounts.Draft}</span>
            <span className="chip">Under Review: {statusCounts["Under Review"]}</span>
            <span className="chip">Live: {statusCounts.Live}</span>
            <span className="chip">Rejected: {statusCounts.Rejected}</span>
          </div>

          <div className="stack-sm">
            {sortedProducts.map((product) => (
              <article key={product.id} className="vendor-product-row">
                <div className="vendor-product-copy">
                  <div className="vendor-product-heading">
                    <h3>{product.productName}</h3>
                    {getVendorProductVisibilityPriority(product.id, product.category) > 0 ? (
                      <span className="vendor-sponsored-tag">Sponsored</span>
                    ) : null}
                    <span className={getProductStatusClass(product.status)}>
                      {product.status}
                    </span>
                  </div>
                  <p>
                    {product.category} • {product.brand}
                  </p>
                  <p>
                    Price: {formatInr(product.priceInr)} • Stock: {product.stockQuantity}
                  </p>
                  <p>
                    Specs:{" "}
                    {product.specifications
                      .map((specification) => `${specification.key}: ${specification.value}`)
                      .join(" | ")}
                  </p>
                  <p>
                    Extra offers:{" "}
                    {product.extraOffers.length > 0
                      ? product.extraOffers
                          .map((extraOffer) => `${extraOffer.type} - ${extraOffer.value}`)
                          .join(" | ")
                      : "None"}
                  </p>
                  <p>Last updated: {formatTimestamp(product.updatedAtIso)}</p>
                  {product.status === "Rejected" && product.rejectionReason ? (
                    <p className="vendor-reject-reason">
                      Rejection reason: {product.rejectionReason}
                    </p>
                  ) : null}
                </div>

                <div className="vendor-product-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={product.status === "Live"}
                    title={product.status === "Live" ? "Live products cannot be edited." : "Edit product"}
                    onClick={() => startProductEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={product.status === "Live"}
                    onClick={() => handleApprove(product.id)}
                  >
                    Approve Product
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openRejectPanel(product.id)}
                  >
                    Reject Product
                  </button>
                </div>

                {rejectingProductId === product.id ? (
                  <div className="vendor-reject-panel">
                    <label className="field">
                      Rejection reason (required)
                      <textarea
                        className="order-textarea"
                        rows={3}
                        value={rejectReasonByProductId[product.id] ?? ""}
                        onChange={(event) =>
                          setRejectReasonByProductId((currentState) => ({
                            ...currentState,
                            [product.id]: event.target.value,
                          }))
                        }
                        placeholder="Reason for rejecting this product"
                      />
                    </label>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => confirmReject(product.id)}
                      >
                        Confirm Rejection
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setRejectingProductId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export function VendorOrdersPage() {
  const { vendorOrders, updateVendorOrderStatus } = useVendor();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const sortedOrders = useMemo(
    () =>
      [...vendorOrders].sort(
        (first, second) =>
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      ),
    [vendorOrders],
  );

  function handleSequentialUpdate(order: VendorOrder) {
    const nextStatus = getNextVendorOrderStatus(order.status);
    if (!nextStatus) {
      setFeedbackMessage("Order is already delivered.");
      return;
    }

    const result = updateVendorOrderStatus(order.id, nextStatus);
    setFeedbackMessage(result.message);
  }

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Orders"
        description="Vendor-facing order queue. Only your assigned orders are shown."
      />

      {feedbackMessage ? (
        <section className="vendor-placeholder-card">
          <p className="vendor-auth-feedback">{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="vendor-placeholder-card">
        <div className="stack-sm">
          {sortedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isStatusUpdateBlocked = order.visibilityState !== "None";
            const nextStatus = getNextVendorOrderStatus(order.status);

            return (
              <article key={order.id} className="vendor-order-row">
                <div className="vendor-order-heading">
                  <h3>{order.id}</h3>
                  <div className="vendor-order-badge-row">
                    <span className={getOrderStatusClass(order.status)}>{order.status}</span>
                    {order.paymentMethod === "COD" ? (
                      <span className="vendor-order-payment-badge">COD</span>
                    ) : (
                      <span className="vendor-order-payment-badge">Online</span>
                    )}
                    {order.visibilityState !== "None" ? (
                      <span className="vendor-order-visibility-badge">
                        {order.visibilityState}
                      </span>
                    ) : null}
                  </div>
                </div>

                <p>
                  {order.productName} • Qty {order.quantity} • {formatInr(order.amountInr)}
                </p>

                <div className="inline-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setExpandedOrderId(isExpanded ? null : order.id)
                    }
                  >
                    {isExpanded ? "Hide Details" : "View Details"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!nextStatus || isStatusUpdateBlocked}
                    onClick={() => handleSequentialUpdate(order)}
                    title={
                      isStatusUpdateBlocked
                        ? "Status updates are disabled for cancelled/return-requested orders."
                        : nextStatus
                          ? `Move to ${nextStatus}`
                          : "Order already delivered"
                    }
                  >
                    {nextStatus ? `Mark as ${nextStatus}` : "Delivered"}
                  </button>
                </div>

                {isExpanded ? (
                  <section className="vendor-order-details">
                    <p>
                      <strong>Order ID:</strong> {order.id}
                    </p>
                    <p>
                      <strong>Product:</strong> {order.productName}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {order.quantity}
                    </p>
                    <p>
                      <strong>Amount:</strong> {formatInr(order.amountInr)}
                    </p>
                    <p>
                      <strong>Customer Address:</strong> {order.customerAddressMasked}
                    </p>

                    <div className="vendor-order-timeline" aria-label={`Timeline for ${order.id}`}>
                      {(["New", "Packed", "Shipped", "Delivered"] as VendorOrderStatus[]).map(
                        (timelineStep) => (
                          <div
                            key={timelineStep}
                            className={getOrderTimelineStepClass(order.status, timelineStep)}
                          >
                            <span className="vendor-order-timeline-dot" aria-hidden="true" />
                            <span>{timelineStep}</span>
                          </div>
                        ),
                      )}
                    </div>

                    {order.paymentMethod === "COD" ? (
                      <p className="vendor-cod-disclaimer">
                        COD order: settlement is processed after successful delivery and policy
                        checks.
                      </p>
                    ) : null}

                    {order.visibilityState === "Cancelled" ? (
                      <p className="vendor-order-override-note">
                        This order is cancelled. Vendor status override is not allowed.
                      </p>
                    ) : null}
                    {order.visibilityState === "Return Requested" ? (
                      <p className="vendor-order-override-note">
                        Return requested by customer. Vendor status override is not allowed.
                      </p>
                    ) : null}
                  </section>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function VendorReturnsRtoPage() {
  const { vendorReturnCases, vendorRtoCases } = useVendor();
  const [activeTab, setActiveTab] = useState<"returns" | "rtos">("returns");

  const sortedReturnCases = useMemo(
    () =>
      [...vendorReturnCases].sort(
        (first, second) =>
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      ),
    [vendorReturnCases],
  );

  const sortedRtoCases = useMemo(
    () =>
      [...vendorRtoCases].sort(
        (first, second) =>
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      ),
    [vendorRtoCases],
  );

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Returns & RTO"
        description="Track return cases and RTO resolutions. User return rights cannot be overridden by vendor."
      />

      <section className="vendor-placeholder-card">
        <div className="vendor-tab-row">
          <button
            type="button"
            className={activeTab === "returns" ? "plp-filter-chip is-selected" : "plp-filter-chip"}
            onClick={() => setActiveTab("returns")}
          >
            Returns
          </button>
          <button
            type="button"
            className={activeTab === "rtos" ? "plp-filter-chip is-selected" : "plp-filter-chip"}
            onClick={() => setActiveTab("rtos")}
          >
            RTOs
          </button>
        </div>

        {activeTab === "returns" ? (
          <div className="stack-sm">
            {sortedReturnCases.length > 0 ? (
              sortedReturnCases.map((returnCase) => (
                <article key={returnCase.id} className="vendor-return-row">
                  <div className="vendor-return-heading">
                    <h3>{returnCase.orderId}</h3>
                    <span className={getReturnCaseStatusClass(returnCase.status)}>
                      {returnCase.status}
                    </span>
                  </div>
                  <p>
                    Product: {returnCase.productName}
                  </p>
                  <p>
                    Reason: {returnCase.reason}
                  </p>
                  <div className="vendor-return-timeline">
                    {(
                      [
                        "Return Requested",
                        "Pickup Pending",
                        "Received at Hub",
                        "Refund Adjusted",
                      ] as VendorReturnCaseStatus[]
                    ).map((timelineStep) => (
                      <div
                        key={timelineStep}
                        className={getReturnTimelineStepClass(returnCase.status, timelineStep)}
                      >
                        <span className="vendor-return-timeline-dot" aria-hidden="true" />
                        <span>{timelineStep}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <p>No return cases for this vendor right now.</p>
            )}
          </div>
        ) : (
          <div className="stack-sm">
            {sortedRtoCases.length > 0 ? (
              sortedRtoCases.map((rtoCase) => (
                <article key={rtoCase.id} className="vendor-rto-row">
                  <div className="vendor-rto-heading">
                    <h3>{rtoCase.orderId}</h3>
                    <span className={getRtoResolutionClass(rtoCase.resolutionStatus)}>
                      {rtoCase.resolutionStatus}
                    </span>
                  </div>
                  <p>
                    Product: {rtoCase.productName}
                  </p>
                  <p>
                    Courier issue: {rtoCase.courierIssue}
                  </p>
                  <p>
                    RTO charge: {formatInr(rtoCase.rtoChargeInr)}
                  </p>
                  <p>
                    Updated: {formatTimestamp(rtoCase.updatedAtIso)}
                  </p>
                  <div className="inline-actions">
                    <button type="button" className="btn btn-secondary">
                      Upload Evidence (Mock)
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p>No RTO cases for this vendor right now.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export function VendorWalletPage() {
  const {
    walletEntries,
    walletSummary,
    lastSettledAmountInr,
    nextSettlementDateIso,
  } = useVendor();

  const sortedWalletEntries = useMemo(
    () =>
      [...walletEntries].sort(
        (first, second) =>
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      ),
    [walletEntries],
  );

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Wallet & Settlements"
        description="Track pending, available, and adjusted settlement entries for your orders."
      />

      <section className="vendor-summary-grid">
        <article className="vendor-summary-card">
          <h3>Pending</h3>
          <p>{formatInr(walletSummary.pendingInr)}</p>
        </article>
        <article className="vendor-summary-card">
          <h3>Available</h3>
          <p>{formatInr(walletSummary.availableInr)}</p>
        </article>
        <article className="vendor-summary-card">
          <h3>Adjustments</h3>
          <p>{formatInr(walletSummary.adjustmentsInr)}</p>
        </article>
      </section>

      <section className="vendor-placeholder-card">
        <header className="section-header">
          <h2>Wallet Entries</h2>
        </header>
        <div className="stack-sm">
          {sortedWalletEntries.map((walletEntry) => (
            <article key={walletEntry.id} className="vendor-wallet-row">
              <div>
                <h3>{walletEntry.orderId}</h3>
                <p>{walletEntry.productName}</p>
                <p>{walletEntry.note}</p>
                <p>Updated: {formatTimestamp(walletEntry.updatedAtIso)}</p>
              </div>
              <div className="vendor-wallet-amount-col">
                <span className={getWalletStatusClass(walletEntry.status)}>
                  {walletEntry.status}
                </span>
                <strong>{formatInr(walletEntry.amountInr)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="vendor-placeholder-card">
        <header className="section-header">
          <h2>Settlement Info (Mock)</h2>
        </header>
        <p>
          Last settled amount: <strong>{formatInr(lastSettledAmountInr)}</strong>
        </p>
        <p>
          Next settlement date:{" "}
          <strong>{formatTimestamp(nextSettlementDateIso)}</strong>
        </p>
      </section>
    </div>
  );
}

export function VendorAdsPage() {
  const {
    vendorProducts,
    vendorAds,
    createVendorAd,
    getVendorAdStatus,
    getVendorAdAmountSpent,
    getVendorAdRemainingDays,
  } = useVendor();
  const [adType, setAdType] = useState<VendorAdType>("Sponsored Product");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<VendorProductPayload["category"]>("Mobiles");
  const [durationDaysInput, setDurationDaysInput] = useState("7");
  const [budgetInput, setBudgetInput] = useState("1500");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const adEligibleProducts = useMemo(
    () => vendorProducts.filter((product) => product.status !== "Rejected"),
    [vendorProducts],
  );
  const fixedPricePreviewInr =
    (Number.isNaN(Number(durationDaysInput)) ? 0 : Number(durationDaysInput)) *
    VENDOR_AD_DAILY_RATES_INR[adType];

  const sortedAds = useMemo(
    () =>
      [...vendorAds].sort(
        (first, second) =>
          new Date(second.startedAtIso).getTime() -
          new Date(first.startedAtIso).getTime(),
      ),
    [vendorAds],
  );

  function handleCreateAd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const durationDays = Number(durationDaysInput);
    const budgetInr = Number(budgetInput);

    if (Number.isNaN(durationDays) || Number.isNaN(budgetInr)) {
      setFeedbackMessage("Enter valid numeric values for duration and budget.");
      return;
    }

    const payload: VendorAdPayload = {
      type: adType,
      productId: adType === "Sponsored Product" ? selectedProductId || null : null,
      category: adType === "Sponsored Category" ? selectedCategory : null,
      durationDays,
      budgetInr,
    };
    const result = createVendorAd(payload);
    setFeedbackMessage(result.message);

    if (result.ok) {
      setAdType("Sponsored Product");
      setSelectedProductId("");
      setSelectedCategory("Mobiles");
      setDurationDaysInput("7");
      setBudgetInput("1500");
    }
  }

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Ads & Sponsored Products"
        description="Ads impact product/category visibility only. Pricing and cashback logic remain unchanged."
      />

      {feedbackMessage ? (
        <section className="vendor-placeholder-card">
          <p className="vendor-auth-feedback">{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="vendor-ads-grid">
        <article className="vendor-placeholder-card">
          <header className="section-header">
            <h2>Active Ads</h2>
          </header>
          <div className="stack-sm">
            {sortedAds.map((ad) => {
              const adStatus: VendorAdStatus = getVendorAdStatus(ad);
              const spentInr = getVendorAdAmountSpent(ad);
              const remainingDays = getVendorAdRemainingDays(ad);

              return (
                <article key={ad.id} className="vendor-ad-row">
                  <div className="vendor-ad-heading">
                    <h3>{ad.id}</h3>
                    <span
                      className={
                        adStatus === "Active"
                          ? "vendor-ad-status-badge vendor-ad-status-active"
                          : "vendor-ad-status-badge vendor-ad-status-expired"
                      }
                    >
                      {adStatus}
                    </span>
                  </div>
                  <p>
                    Type: {ad.type}
                    {ad.type === "Sponsored Product"
                      ? ` • Product: ${ad.productName ?? "Unknown"}`
                      : ` • Category: ${ad.category ?? "Unknown"}`}
                  </p>
                  <p>
                    Budget: {formatInr(ad.budgetInr)} • Fixed pricing: {formatInr(ad.fixedPriceInr)}
                  </p>
                  <p>
                    Amount spent: {formatInr(spentInr)} • Remaining days: {remainingDays}
                  </p>
                </article>
              );
            })}
          </div>
        </article>

        <article className="vendor-placeholder-card">
          <header className="section-header">
            <h2>Create New Ad</h2>
          </header>
          <form className="vendor-onboarding-form" onSubmit={handleCreateAd}>
            <label className="field">
              Ad Type
              <select
                value={adType}
                onChange={(event) => setAdType(event.target.value as VendorAdType)}
                className="order-select"
              >
                {VENDOR_AD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            {adType === "Sponsored Product" ? (
              <label className="field">
                Select Product
                <select
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  className="order-select"
                >
                  <option value="">Select product</option>
                  {adEligibleProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.productName} ({product.category})
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="field">
                Select Category
                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value as VendorProductPayload["category"])
                  }
                  className="order-select"
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="vendor-onboarding-grid">
              <label className="field">
                Duration (days)
                <input
                  type="number"
                  min={1}
                  value={durationDaysInput}
                  onChange={(event) => setDurationDaysInput(event.target.value)}
                />
              </label>

              <label className="field">
                Budget (₹)
                <input
                  type="number"
                  min={1}
                  value={budgetInput}
                  onChange={(event) => setBudgetInput(event.target.value)}
                />
              </label>
            </div>

            <div className="vendor-ad-pricing-box">
              <p>
                Fixed pricing: {formatInr(VENDOR_AD_DAILY_RATES_INR[adType])} per day
              </p>
              <p>Total fixed cost before confirmation: {formatInr(fixedPricePreviewInr)}</p>
            </div>

            <button type="submit" className="btn btn-primary">
              Confirm & Create Ad
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}

export function VendorSupportPage() {
  const { supportTickets, createSupportTicket } = useVendor();
  const [category, setCategory] = useState<VendorSupportTicketCategory>("Orders");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const categoryCounts = useMemo(
    () =>
      SUPPORT_TICKET_CATEGORIES.map((ticketCategory) => ({
        category: ticketCategory,
        count: supportTickets.filter((ticket) => ticket.category === ticketCategory).length,
      })),
    [supportTickets],
  );

  const sortedTickets = useMemo(
    () =>
      [...supportTickets].sort(
        (first, second) =>
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      ),
    [supportTickets],
  );

  function handleCreateTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: VendorSupportTicketPayload = {
      category,
      subject,
      message,
    };
    const result = createSupportTicket(payload);
    setFeedbackMessage(result.message);
    if (result.ok) {
      setCategory("Orders");
      setSubject("");
      setMessage("");
    }
  }

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Support"
        description="Raise support tickets by category and track existing ticket status."
      />

      {feedbackMessage ? (
        <section className="vendor-placeholder-card">
          <p className="vendor-auth-feedback">{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="vendor-placeholder-card">
        <header className="section-header">
          <h2>Ticket Categories</h2>
        </header>
        <div className="vendor-ticket-category-row">
          {categoryCounts.map((ticketCategory) => (
            <span key={ticketCategory.category} className="vendor-ticket-category-chip">
              {ticketCategory.category}: {ticketCategory.count}
            </span>
          ))}
        </div>
      </section>

      <section className="vendor-support-grid">
        <article className="vendor-placeholder-card">
          <header className="section-header">
            <h2>Ticket List</h2>
          </header>
          <div className="stack-sm">
            {sortedTickets.map((ticket) => (
              <article key={ticket.id} className="vendor-support-ticket-row">
                <div className="vendor-support-ticket-heading">
                  <h3>{ticket.id}</h3>
                  <span className={getSupportTicketStatusClass(ticket.status)}>
                    {ticket.status}
                  </span>
                </div>
                <p>
                  {ticket.category} • {ticket.subject}
                </p>
                <p>{ticket.message}</p>
                <p>Updated: {formatTimestamp(ticket.updatedAtIso)}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="vendor-placeholder-card">
          <header className="section-header">
            <h2>New Ticket (Mock)</h2>
          </header>
          <form className="vendor-onboarding-form" onSubmit={handleCreateTicket}>
            <label className="field">
              Category
              <select
                className="order-select"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as VendorSupportTicketCategory)
                }
              >
                {SUPPORT_TICKET_CATEGORIES.map((ticketCategory) => (
                  <option key={ticketCategory} value={ticketCategory}>
                    {ticketCategory}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Subject
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Brief ticket title"
              />
            </label>

            <label className="field">
              Description
              <textarea
                className="order-textarea"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe the issue in detail"
              />
            </label>

            <button type="submit" className="btn btn-primary">
              Raise Ticket
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}

export function VendorSettingsPage() {
  const {
    vendorStatus,
    approveVendor,
    hasCompletedOnboarding,
    onboardingData,
    bankDetails,
    bankDetailsReviewStatus,
    updateBankDetails,
    notificationPreferences,
    setVendorNotificationPreference,
    complianceAccepted,
    setComplianceAccepted,
  } = useVendor();
  const [bankFormState, setBankFormState] = useState<VendorBankDetailsInput>({
    accountHolderName: bankDetails.accountHolderName,
    accountNumber: bankDetails.accountNumber,
    ifscCode: bankDetails.ifscCode,
    bankName: bankDetails.bankName,
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const notificationRows: Array<{
    key: keyof VendorNotificationPreferences;
    label: string;
    hint: string;
  }> = [
    {
      key: "orderUpdates",
      label: "Order updates",
      hint: "Receive notifications for status changes and delivery milestones.",
    },
    {
      key: "settlementUpdates",
      label: "Settlement updates",
      hint: "Receive notifications for wallet credits and settlement cycles.",
    },
    {
      key: "adsUpdates",
      label: "Ads updates",
      hint: "Receive performance alerts for sponsored ads.",
    },
    {
      key: "policyUpdates",
      label: "Policy updates",
      hint: "Receive notifications when compliance or platform policies change.",
    },
  ];

  function updateBankField<Key extends keyof VendorBankDetailsInput>(
    key: Key,
    value: VendorBankDetailsInput[Key],
  ) {
    setBankFormState((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  }

  function handleBankDetailsSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = updateBankDetails(bankFormState);
    setFeedbackMessage(result.message);
  }

  return (
    <div className="stack vendor-page">
      <VendorSectionHeader
        title="Settings"
        description="Manage business profile, banking review status, notifications, and compliance."
      />

      {feedbackMessage ? (
        <section className="vendor-placeholder-card">
          <p className="vendor-auth-feedback">{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="vendor-placeholder-card">
        <header className="section-header">
          <h2>Account & Approval Controls</h2>
        </header>
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
      </section>

      <section className="vendor-placeholder-card">
        <header className="section-header">
          <h2>Business Info (Read-only)</h2>
        </header>
        {hasCompletedOnboarding && onboardingData ? (
          <div className="vendor-onboarding-preview">
            <p>
              Business name: <strong>{onboardingData.businessName}</strong>
            </p>
            <p>Owner: {onboardingData.ownerName}</p>
            <p>Phone: {onboardingData.phone}</p>
            <p>GST: {onboardingData.gstNumber || "Not provided"}</p>
            <p>Address: {onboardingData.businessAddress}</p>
          </div>
        ) : (
          <p>Onboarding business info is not available yet.</p>
        )}
      </section>

      <section className="vendor-settings-grid">
        <article className="vendor-placeholder-card">
          <header className="section-header">
            <h2>Bank Details</h2>
          </header>
          <p>
            Review status:{" "}
            <span
              className={
                bankDetailsReviewStatus === "Under Review"
                  ? "vendor-support-ticket-status vendor-support-ticket-progress"
                  : "vendor-support-ticket-status vendor-support-ticket-resolved"
              }
            >
              {bankDetailsReviewStatus}
            </span>
          </p>
          <form className="vendor-onboarding-form" onSubmit={handleBankDetailsSave}>
            <label className="field">
              Account Holder Name
              <input
                type="text"
                value={bankFormState.accountHolderName}
                onChange={(event) =>
                  updateBankField("accountHolderName", event.target.value)
                }
              />
            </label>

            <label className="field">
              Account Number
              <input
                type="text"
                value={bankFormState.accountNumber}
                onChange={(event) => updateBankField("accountNumber", event.target.value)}
              />
            </label>

            <label className="field">
              IFSC Code
              <input
                type="text"
                value={bankFormState.ifscCode}
                onChange={(event) => updateBankField("ifscCode", event.target.value)}
              />
            </label>

            <label className="field">
              Bank Name
              <input
                type="text"
                value={bankFormState.bankName}
                onChange={(event) => updateBankField("bankName", event.target.value)}
              />
            </label>

            <p>Last updated: {formatTimestamp(bankDetails.updatedAtIso)}</p>

            <button type="submit" className="btn btn-primary">
              Save Bank Details
            </button>
          </form>
        </article>

        <article className="vendor-placeholder-card">
          <header className="section-header">
            <h2>Notification Preferences</h2>
          </header>
          <div className="vendor-notification-grid">
            {notificationRows.map((row) => (
              <label key={row.key} className="vendor-toggle-row">
                <div>
                  <strong>{row.label}</strong>
                  <p>{row.hint}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPreferences[row.key]}
                  onChange={(event) =>
                    setVendorNotificationPreference(row.key, event.target.checked)
                  }
                />
              </label>
            ))}
          </div>
        </article>
      </section>

      <section className="vendor-placeholder-card">
        <header className="section-header">
          <h2>Compliance</h2>
        </header>

        <div className="vendor-compliance-grid">
          <article className="vendor-compliance-card">
            <h3>Platform Policies</h3>
            <ul>
              <li>Follow catalog quality and listing integrity standards.</li>
              <li>Honor customer return rights as per platform policy window.</li>
              <li>Keep support responses timely for escalated cases.</li>
            </ul>
          </article>
          <article className="vendor-compliance-card">
            <h3>Pricing Rules</h3>
            <ul>
              <li>Do not publish misleading MRP-to-sale price gaps.</li>
              <li>Ad sponsorship impacts visibility only, never cashback logic.</li>
              <li>Platform benchmark checks can move products to review/rejected.</li>
            </ul>
          </article>
        </div>

        <label className="vendor-compliance-toggle">
          <input
            type="checkbox"
            checked={complianceAccepted}
            onChange={(event) => setComplianceAccepted(event.target.checked)}
          />
          I accept and will follow the current platform compliance and pricing rules.
        </label>
      </section>
    </div>
  );
}
