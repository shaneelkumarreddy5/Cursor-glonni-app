import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../routes/paths";
import {
  type AdStatus,
  type AdType,
  useAdMonetization,
} from "../state/AdMonetizationContext";
import {
  type AdminFaultAssignee,
  type AdminOrderStatus,
  type AdminPaymentType,
  type AdminRtoAdjustmentStatus,
  type AdminReturnStatus,
  useOrderOperations,
} from "../state/OrderOperationsContext";
import {
  type PriceExceptionStatus,
  type ProductModerationStatus,
  type ProductPricingFlag,
  useProductModeration,
} from "../state/ProductModerationContext";
import {
  type VendorActionType,
  type VendorLifecycleRecord,
  useVendorLifecycle,
} from "../state/VendorLifecycleContext";
import { formatInr } from "../utils/currency";
import { AdminProvider, useAdmin } from "./AdminContext";
import { AdminLayout } from "./AdminLayout";

const STATIC_USERS_COUNT = 12450;
const STATIC_ORDERS_COUNT = 28871;

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

function getAdminVendorStatusClass(status: VendorLifecycleRecord["status"]) {
  if (status === "Approved") {
    return "admin-status-badge admin-status-approved";
  }
  if (status === "Rejected") {
    return "admin-status-badge admin-status-rejected";
  }
  if (status === "Suspended") {
    return "admin-status-badge admin-status-suspended";
  }
  return "admin-status-badge admin-status-scrutiny";
}

function getAdminProductStatusClass(status: ProductModerationStatus) {
  if (status === "Live") {
    return "admin-status-badge admin-status-approved";
  }
  if (status === "Rejected") {
    return "admin-status-badge admin-status-rejected";
  }
  return "admin-status-badge admin-status-scrutiny";
}

function getProductPricingFlagClass(flag: ProductPricingFlag) {
  if (flag === "OK") {
    return "admin-status-badge admin-status-approved";
  }
  if (flag === "Exception Requested") {
    return "admin-status-badge admin-status-suspended";
  }
  return "admin-status-badge admin-status-rejected";
}

function getExceptionStatusLabel(status: PriceExceptionStatus) {
  if (status === "None") {
    return "Not requested";
  }
  return status;
}

function getAdminOrderStatusClass(status: AdminOrderStatus) {
  if (status === "Delivered") {
    return "admin-status-badge admin-status-approved";
  }
  if (status === "Cancelled" || status === "Return Requested") {
    return "admin-status-badge admin-status-rejected";
  }
  return "admin-status-badge admin-status-scrutiny";
}

function getPaymentTypeClass(paymentType: AdminPaymentType) {
  if (paymentType === "COD") {
    return "admin-status-badge admin-status-suspended";
  }
  return "admin-status-badge admin-status-approved";
}

function getReturnStatusClass(status: AdminReturnStatus) {
  if (status === "Closed") {
    return "admin-status-badge admin-status-approved";
  }
  if (status === "Received") {
    return "admin-status-badge admin-status-suspended";
  }
  return "admin-status-badge admin-status-scrutiny";
}

function getRtoStatusClass(status: AdminRtoAdjustmentStatus) {
  if (status === "Charge Confirmed") {
    return "admin-status-badge admin-status-rejected";
  }
  if (status === "Charge Reversed") {
    return "admin-status-badge admin-status-approved";
  }
  return "admin-status-badge admin-status-scrutiny";
}

function getAdminAdStatusClass(status: AdStatus) {
  if (status === "Active") {
    return "admin-status-badge admin-status-approved";
  }
  if (status === "Paused") {
    return "admin-status-badge admin-status-suspended";
  }
  if (status === "Expired") {
    return "admin-status-badge admin-status-rejected";
  }
  return "admin-status-badge admin-status-scrutiny";
}

function getTimelineStepClass(isCompleted: boolean, isCurrent: boolean) {
  if (isCompleted) {
    return "admin-order-timeline-step is-complete";
  }
  if (isCurrent) {
    return "admin-order-timeline-step is-current";
  }
  return "admin-order-timeline-step";
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

function formatOptionalDate(isoDate: string | null) {
  return isoDate ? formatDate(isoDate) : "Not started";
}

function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
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

  function handleBackNavigation() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(ROUTES.home);
  }

  return (
    <div className="admin-auth-shell">
      <section className="admin-auth-card">
        <div className="auth-top-controls">
          <button
            type="button"
            className="auth-icon-btn"
            aria-label="Go back"
            onClick={handleBackNavigation}
          >
            ←
          </button>
          <button
            type="button"
            className="auth-icon-btn"
            aria-label="Close login"
            onClick={() => navigate(ROUTES.home)}
          >
            ✕
          </button>
        </div>
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
  const { vendors } = useVendorLifecycle();
  const { ads, revenueSummary } = useAdMonetization();
  const pendingApprovals = vendors.filter(
    (vendor) => vendor.status === "Under Scrutiny",
  ).length;
  const totalVendors = vendors.length;
  const activeAdsCount = ads.filter((ad) => ad.status === "Active").length;
  const adminMetrics: Array<{ label: string; value: string | number }> = [
    { label: "Total Users", value: STATIC_USERS_COUNT },
    { label: "Total Vendors", value: totalVendors },
    { label: "Total Orders", value: STATIC_ORDERS_COUNT },
    { label: "Pending Approvals", value: pendingApprovals },
    { label: "Active Ads", value: activeAdsCount },
    {
      label: "Total Ad Revenue",
      value: formatInr(revenueSummary.totalAdRevenueInr),
    },
    {
      label: "Active Ad Revenue",
      value: formatInr(revenueSummary.activeAdRevenueInr),
    },
    {
      label: "Completed Ad Revenue",
      value: formatInr(revenueSummary.completedAdRevenueInr),
    },
  ];

  return (
    <div className="stack">
      <AdminSectionHeader
        title="Dashboard"
        description="Overview metrics for marketplace operations (mock frontend data)."
      />

      <section className="admin-overview-grid">
        {adminMetrics.map((metric) => (
          <article key={metric.label} className="admin-overview-card">
            <h3>{metric.label}</h3>
            <p>
              {typeof metric.value === "number"
                ? metric.value.toLocaleString("en-IN")
                : metric.value}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

export function AdminVendorsPage() {
  const { vendors } = useVendorLifecycle();
  const sortedVendors = useMemo(
    () =>
      [...vendors].sort(
        (first, second) =>
          new Date(second.joinedAtIso).getTime() - new Date(first.joinedAtIso).getTime(),
      ),
    [vendors],
  );

  return (
    <div className="stack">
      <AdminSectionHeader
        title="Vendors"
        description="Review onboarding profiles and control vendor approval lifecycle."
      />

      <section className="admin-placeholder-card">
        <div className="admin-vendor-table-wrap">
          <div className="admin-vendor-table-head" role="presentation">
            <span>Vendor Name</span>
            <span>Business Type</span>
            <span>Status</span>
            <span>Joined Date</span>
          </div>

          <div className="admin-vendor-table-body">
            {sortedVendors.map((vendor) => (
              <Link
                key={vendor.id}
                to={ROUTES.adminVendorDetail(vendor.id)}
                className="admin-vendor-table-row"
              >
                <span className="admin-vendor-name-cell">{vendor.vendorName}</span>
                <span>{vendor.businessType}</span>
                <span className={getAdminVendorStatusClass(vendor.status)}>
                  {vendor.status}
                </span>
                <span>{formatDate(vendor.joinedAtIso)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

type AdminVendorActionButton = {
  label: string;
  actionType: VendorActionType;
  buttonClassName: string;
};

const ADMIN_VENDOR_ACTIONS: AdminVendorActionButton[] = [
  { label: "Approve Vendor", actionType: "Approved", buttonClassName: "btn btn-primary" },
  { label: "Reject Vendor", actionType: "Rejected", buttonClassName: "btn btn-secondary" },
  { label: "Suspend Vendor", actionType: "Suspended", buttonClassName: "btn btn-secondary" },
];

const DISPUTE_FAULT_OPTIONS: AdminFaultAssignee[] = [
  "User",
  "Vendor",
  "Courier",
  "Platform",
];

export function AdminVendorDetailPage() {
  const { vendorId } = useParams();
  const { getVendorById, getVendorAuditLog, approveVendor, rejectVendor, suspendVendor } =
    useVendorLifecycle();
  const vendor = vendorId ? getVendorById(vendorId) : undefined;
  const [reasonInput, setReasonInput] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!vendor) {
    return (
      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Vendor not found"
          description="The vendor record does not exist in current mock state."
        />
        <Link to={ROUTES.adminVendors} className="btn btn-secondary">
          Back to Vendors
        </Link>
      </section>
    );
  }

  const vendorAuditLog = getVendorAuditLog(vendor.id);
  const targetVendorId = vendor.id;

  function handleVendorAction(actionType: VendorActionType) {
    const actionMap: Record<VendorActionType, (id: string, reason: string) => { ok: boolean; message: string }> = {
      Approved: approveVendor,
      Rejected: rejectVendor,
      Suspended: suspendVendor,
    };
    const result = actionMap[actionType](targetVendorId, reasonInput);
    setFeedbackMessage(result.message);
    if (result.ok) {
      setReasonInput("");
    }
  }

  return (
    <div className="stack">
      <section className="admin-placeholder-card">
        <div className="admin-vendor-detail-topbar">
          <div>
            <AdminSectionHeader
              title={vendor.vendorName}
              description={`${vendor.businessType} • Joined ${formatDate(vendor.joinedAtIso)}`}
            />
          </div>
          <span className={getAdminVendorStatusClass(vendor.status)}>{vendor.status}</span>
        </div>
        <p className="admin-vendor-status-message">
          Current admin reason:{" "}
          <strong>
            {vendor.statusReason
              ? vendor.statusReason
              : "No admin reason recorded yet."}
          </strong>
        </p>
        <p className="admin-vendor-status-message">
          Last updated: <strong>{formatDateTime(vendor.statusUpdatedAtIso)}</strong>
        </p>
        <Link to={ROUTES.adminVendors} className="btn btn-secondary">
          Back to Vendors
        </Link>
      </section>

      <section className="admin-vendor-detail-grid">
        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Business Details"
            description="Read-only business profile as submitted by vendor."
          />
          <div className="admin-details-list">
            <p>
              <strong>Owner Name:</strong> {vendor.businessDetails.ownerName}
            </p>
            <p>
              <strong>Legal Entity:</strong> {vendor.businessDetails.legalEntityName}
            </p>
            <p>
              <strong>GST Number:</strong> {vendor.businessDetails.gstNumber}
            </p>
            <p>
              <strong>Phone:</strong> {vendor.businessDetails.phone}
            </p>
            <p>
              <strong>Email:</strong> {vendor.businessDetails.email}
            </p>
            <p>
              <strong>Address:</strong> {vendor.businessDetails.address}
            </p>
          </div>
        </article>

        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Submitted Documents"
            description="Mock placeholders for uploaded KYC/compliance files."
          />
          <div className="stack-sm">
            {vendor.submittedDocuments.map((document) => (
              <article key={document.id} className="admin-doc-row">
                <div>
                  <h3>{document.title}</h3>
                  <p>{document.fileName}</p>
                </div>
                <span>{formatDateTime(document.submittedAtIso)}</span>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-vendor-detail-grid">
        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Bank Details"
            description="Read-only banking details submitted by vendor."
          />
          <div className="admin-details-list">
            <p>
              <strong>Account Holder:</strong> {vendor.bankDetails.accountHolderName}
            </p>
            <p>
              <strong>Account Number:</strong> {vendor.bankDetails.accountNumberMasked}
            </p>
            <p>
              <strong>IFSC:</strong> {vendor.bankDetails.ifscCode}
            </p>
            <p>
              <strong>Bank Name:</strong> {vendor.bankDetails.bankName}
            </p>
          </div>
        </article>

        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Admin Actions"
            description="Reason is mandatory for approve, reject, and suspend actions."
          />
          <label className="field">
            Action reason (mandatory)
            <textarea
              className="order-textarea"
              rows={4}
              value={reasonInput}
              onChange={(event) => setReasonInput(event.target.value)}
              placeholder="Enter reason for vendor status change"
            />
          </label>

          <div className="inline-actions">
            {ADMIN_VENDOR_ACTIONS.map((action) => (
              <button
                key={action.actionType}
                type="button"
                className={action.buttonClassName}
                onClick={() => handleVendorAction(action.actionType)}
              >
                {action.label}
              </button>
            ))}
          </div>

          {feedbackMessage ? (
            <p className="admin-action-feedback">{feedbackMessage}</p>
          ) : null}
        </article>
      </section>

      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Audit Log (Admin Only)"
          description="History of vendor status control actions."
        />
        {vendorAuditLog.length > 0 ? (
          <div className="stack-sm">
            {vendorAuditLog.map((entry) => (
              <article key={entry.id} className="admin-audit-row">
                <div className="admin-audit-row-top">
                  <span className={getAdminVendorStatusClass(entry.actionType)}>
                    {entry.actionType}
                  </span>
                  <strong>{formatDateTime(entry.createdAtIso)}</strong>
                </div>
                <p>{entry.reason}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-vendor-status-message">
            No admin actions recorded for this vendor yet.
          </p>
        )}
      </section>
    </div>
  );
}

export function AdminProductsPage() {
  const { products, getProductPricingFlag } = useProductModeration();
  const sortedProducts = useMemo(
    () =>
      [...products].sort(
        (first, second) =>
          new Date(second.submittedAtIso).getTime() -
          new Date(first.submittedAtIso).getTime(),
      ),
    [products],
  );

  return (
    <div className="stack">
      <AdminSectionHeader
        title="Products"
        description="Review product submissions, enforce pricing rules, and decide exceptions."
      />

      <section className="admin-placeholder-card">
        <div className="admin-product-table-wrap">
          <div className="admin-product-table-head" role="presentation">
            <span>Product</span>
            <span>Brand</span>
            <span>Vendor</span>
            <span>Listed Price</span>
            <span>Status</span>
            <span>Pricing Flag</span>
          </div>

          <div className="admin-product-table-body">
            {sortedProducts.map((product) => {
              const pricingFlag = getProductPricingFlag(product.id);
              return (
                <Link
                  key={product.id}
                  to={ROUTES.adminProductDetail(product.id)}
                  className="admin-product-table-row"
                >
                  <span className="admin-product-name-cell">{product.productName}</span>
                  <span>{product.brand}</span>
                  <span>{product.vendorName}</span>
                  <span>{formatInr(product.listedPriceInr)}</span>
                  <span className={getAdminProductStatusClass(product.status)}>
                    {product.status}
                  </span>
                  <span className={getProductPricingFlagClass(pricingFlag)}>{pricingFlag}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export function AdminProductDetailPage() {
  const { productId } = useParams();
  const {
    getProductById,
    getProductPricingRuleResult,
    getProductPricingFlag,
    getProductAuditLog,
    approveProduct,
    rejectProduct,
    approvePriceException,
    rejectPriceException,
  } = useProductModeration();
  const { getVendorById } = useVendorLifecycle();
  const product = productId ? getProductById(productId) : undefined;
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [exceptionDecisionReasonInput, setExceptionDecisionReasonInput] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!product) {
    return (
      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Product not found"
          description="The product record is unavailable in current mock state."
        />
        <Link to={ROUTES.adminProducts} className="btn btn-secondary">
          Back to Products
        </Link>
      </section>
    );
  }

  const pricingRuleResult = getProductPricingRuleResult(product.id);
  const pricingFlag = getProductPricingFlag(product.id);
  const productAuditLog = getProductAuditLog(product.id);
  const vendorProfile = getVendorById(product.vendorId);
  const targetProductId = product.id;
  const isApprovalBlockedByRule =
    pricingRuleResult.isViolation && product.exceptionRequest.status !== "Approved";
  const hasPendingExceptionRequest = product.exceptionRequest.status === "Requested";

  function handleApproveProduct() {
    const result = approveProduct(targetProductId);
    setFeedbackMessage(result.message);
  }

  function handleRejectProduct() {
    const result = rejectProduct(targetProductId, rejectionReasonInput);
    setFeedbackMessage(result.message);
    if (result.ok) {
      setRejectionReasonInput("");
    }
  }

  function handleApproveException() {
    const result = approvePriceException(targetProductId, exceptionDecisionReasonInput);
    setFeedbackMessage(result.message);
    if (result.ok) {
      setExceptionDecisionReasonInput("");
    }
  }

  function handleRejectException() {
    const result = rejectPriceException(targetProductId, exceptionDecisionReasonInput);
    setFeedbackMessage(result.message);
    if (result.ok) {
      setExceptionDecisionReasonInput("");
    }
  }

  return (
    <div className="stack">
      <section className="admin-placeholder-card">
        <div className="admin-vendor-detail-topbar">
          <div>
            <AdminSectionHeader
              title={product.productName}
              description={`${product.brand} • Submitted ${formatDateTime(product.submittedAtIso)}`}
            />
          </div>
          <div className="admin-product-status-row">
            <span className={getAdminProductStatusClass(product.status)}>{product.status}</span>
            <span className={getProductPricingFlagClass(pricingFlag)}>{pricingFlag}</span>
          </div>
        </div>
        <p className="admin-vendor-status-message">
          Listed price: <strong>{formatInr(product.listedPriceInr)}</strong>
        </p>
        {product.statusReason ? (
          <p className="admin-vendor-status-message">
            Current status reason: <strong>{product.statusReason}</strong>
          </p>
        ) : null}
        <Link to={ROUTES.adminProducts} className="btn btn-secondary">
          Back to Products
        </Link>
      </section>

      <section className="admin-vendor-detail-grid">
        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Product Details"
            description="Full product details submitted for admin moderation."
          />
          <div className="admin-details-list">
            <p>
              <strong>Product ID:</strong> {product.id}
            </p>
            <p>
              <strong>Category:</strong> {product.category}
            </p>
            <p>
              <strong>Description:</strong> {product.description}
            </p>
            <p>
              <strong>Specifications:</strong> {product.keySpecifications.join(" • ")}
            </p>
            <p>
              <strong>Last updated:</strong> {formatDateTime(product.updatedAtIso)}
            </p>
          </div>
        </article>

        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Vendor Details"
            description="Seller details linked to this product submission."
          />
          <div className="admin-details-list">
            <p>
              <strong>Vendor Name:</strong> {product.vendorName}
            </p>
            <p>
              <strong>Business Type:</strong>{" "}
              {vendorProfile ? vendorProfile.businessType : "Not available"}
            </p>
            <p>
              <strong>Vendor Status:</strong>{" "}
              {vendorProfile ? vendorProfile.status : "Not available"}
            </p>
            <p>
              <strong>Vendor Email:</strong>{" "}
              {vendorProfile ? vendorProfile.businessDetails.email : "Not available"}
            </p>
          </div>
        </article>
      </section>

      <section className="admin-vendor-detail-grid">
        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Pricing Benchmarks"
            description="Mock benchmark prices used for platform pricing discipline."
          />
          <div className="admin-details-list">
            <p>
              <strong>Amazon:</strong> {formatInr(product.benchmarks.amazonPriceInr)}
            </p>
            <p>
              <strong>Flipkart:</strong> {formatInr(product.benchmarks.flipkartPriceInr)}
            </p>
            <p>
              <strong>MSRP:</strong> {formatInr(product.benchmarks.msrpInr)}
            </p>
            <p>
              <strong>Highest allowed by rule:</strong>{" "}
              {formatInr(pricingRuleResult.highestAllowedPriceInr)}
            </p>
          </div>
        </article>

        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Pricing Rule Result"
            description="Rule: listed price must not exceed Amazon/Flipkart/MSRP."
          />
          {pricingRuleResult.isViolation ? (
            <div className="admin-violation-box">
              <p>
                <strong>Violation detected:</strong>
              </p>
              <ul>
                {pricingRuleResult.violationMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="admin-vendor-status-message">
              Pricing is within benchmark limits. Product is eligible for approval.
            </p>
          )}
        </article>
      </section>

      <section className="admin-vendor-detail-grid">
        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Product Approval Actions"
            description="Approve to move Live or reject with mandatory reason."
          />
          <div className="inline-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApproveProduct}
              disabled={isApprovalBlockedByRule}
              title={
                isApprovalBlockedByRule
                  ? "Pricing violation detected. Approve exception first or adjust price."
                  : "Approve product"
              }
            >
              Approve Product
            </button>
          </div>
          <label className="field">
            Rejection reason (mandatory)
            <textarea
              className="order-textarea"
              rows={3}
              value={rejectionReasonInput}
              onChange={(event) => setRejectionReasonInput(event.target.value)}
              placeholder="Enter reason if rejecting this product"
            />
          </label>
          <button type="button" className="btn btn-secondary" onClick={handleRejectProduct}>
            Reject Product
          </button>
        </article>

        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Price Exception Flow"
            description="Approve or reject vendor exception request with mandatory reason."
          />
          <p className="admin-vendor-status-message">
            Exception status:{" "}
            <strong>{getExceptionStatusLabel(product.exceptionRequest.status)}</strong>
          </p>
          <p className="admin-vendor-status-message">
            Vendor justification:{" "}
            <strong>
              {product.exceptionRequest.justification
                ? product.exceptionRequest.justification
                : "No request submitted."}
            </strong>
          </p>
          {product.exceptionRequest.adminReason ? (
            <p className="admin-vendor-status-message">
              Latest admin exception reason:{" "}
              <strong>{product.exceptionRequest.adminReason}</strong>
            </p>
          ) : null}
          {!hasPendingExceptionRequest ? (
            <p className="admin-vendor-status-message">
              No pending request. Exception actions are enabled only when status is Requested.
            </p>
          ) : null}

          <label className="field">
            Exception decision reason (mandatory)
            <textarea
              className="order-textarea"
              rows={3}
              value={exceptionDecisionReasonInput}
              onChange={(event) => setExceptionDecisionReasonInput(event.target.value)}
              placeholder="Enter reason for exception decision"
            />
          </label>
          <div className="inline-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApproveException}
              disabled={!hasPendingExceptionRequest}
            >
              Approve Exception
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRejectException}
              disabled={!hasPendingExceptionRequest}
            >
              Reject Exception
            </button>
          </div>
        </article>
      </section>

      {feedbackMessage ? (
        <section className="admin-placeholder-card">
          <p className="admin-action-feedback">{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Product Audit Log (Admin Only)"
          description="Tracks approval, rejection, and exception actions."
        />
        {productAuditLog.length > 0 ? (
          <div className="stack-sm">
            {productAuditLog.map((entry) => (
              <article key={entry.id} className="admin-audit-row">
                <div className="admin-audit-row-top">
                  <span className="admin-status-badge">{entry.actionType}</span>
                  <strong>{formatDateTime(entry.createdAtIso)}</strong>
                </div>
                <p>{entry.reason}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-vendor-status-message">
            No admin product actions logged for this product yet.
          </p>
        )}
      </section>
    </div>
  );
}

export function AdminOrdersPage() {
  const { orders } = useOrderOperations();
  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (first, second) =>
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      ),
    [orders],
  );

  return (
    <div className="stack">
      <AdminSectionHeader
        title="Orders"
        description="Monitor all marketplace orders with payment status and fulfillment flow."
      />

      <section className="admin-placeholder-card">
        <div className="admin-orders-table-wrap">
          <div className="admin-orders-table-head" role="presentation">
            <span>Order ID</span>
            <span>User</span>
            <span>Vendor</span>
            <span>Product</span>
            <span>Amount</span>
            <span>Payment Type</span>
            <span>Current Status</span>
          </div>

          <div className="admin-orders-table-body">
            {sortedOrders.map((order) => (
              <Link
                key={order.id}
                to={ROUTES.adminOrderDetail(order.id)}
                className="admin-orders-table-row"
              >
                <span className="admin-product-name-cell">{order.id}</span>
                <span>{order.userName}</span>
                <span>{order.vendorName}</span>
                <span>{order.productName}</span>
                <span>{formatInr(order.amountInr)}</span>
                <span className={getPaymentTypeClass(order.paymentType)}>
                  {order.paymentType}
                </span>
                <div className="admin-product-status-row">
                  <span className={getAdminOrderStatusClass(order.status)}>{order.status}</span>
                  {order.dispute?.isFlagged ? (
                    <span className="admin-status-badge admin-status-suspended">Dispute</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const { getOrderById, getOrderAuditLog, assignDisputeFault } = useOrderOperations();
  const order = orderId ? getOrderById(orderId) : undefined;
  const [selectedFault, setSelectedFault] = useState<AdminFaultAssignee>("User");
  const [disputeReason, setDisputeReason] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!order) {
    return (
      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Order not found"
          description="The selected order does not exist in current admin mock state."
        />
        <Link to={ROUTES.adminOrders} className="btn btn-secondary">
          Back to Orders
        </Link>
      </section>
    );
  }

  const timelineSteps: Array<{ label: string; timestamp: string | null }> = [
    { label: "Ordered", timestamp: order.timeline.orderedAtIso },
    { label: "Packed", timestamp: order.timeline.packedAtIso },
    { label: "Shipped", timestamp: order.timeline.shippedAtIso },
    { label: "Delivered", timestamp: order.timeline.deliveredAtIso },
  ];
  const currentTimelineIndex = order.timeline.deliveredAtIso
    ? 3
    : order.timeline.shippedAtIso
      ? 2
      : order.timeline.packedAtIso
        ? 1
        : 0;
  const orderAuditLog = getOrderAuditLog(order.id);
  const targetOrderId = order.id;
  const vendorAdjustmentLabel =
    order.financialImpact.vendorWalletAdjustmentInr > 0
      ? `+${formatInr(order.financialImpact.vendorWalletAdjustmentInr)}`
      : formatInr(order.financialImpact.vendorWalletAdjustmentInr);

  function handleAssignFault() {
    const result = assignDisputeFault(targetOrderId, selectedFault, disputeReason);
    setFeedbackMessage(result.message);
    if (result.ok) {
      setDisputeReason("");
    }
  }

  return (
    <div className="stack">
      <section className="admin-placeholder-card">
        <div className="admin-vendor-detail-topbar">
          <div>
            <AdminSectionHeader
              title={order.id}
              description={`${order.productName} • ${order.userName} • ${order.vendorName}`}
            />
          </div>
          <div className="admin-product-status-row">
            <span className={getPaymentTypeClass(order.paymentType)}>{order.paymentType}</span>
            <span className={getAdminOrderStatusClass(order.status)}>{order.status}</span>
          </div>
        </div>
        <p className="admin-vendor-status-message">
          Order value: <strong>{formatInr(order.amountInr)}</strong>
        </p>
        <Link to={ROUTES.adminOrders} className="btn btn-secondary">
          Back to Orders
        </Link>
      </section>

      <section className="admin-vendor-detail-grid">
        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Order Timeline"
            description="Operational lifecycle from ordered to delivered."
          />
          <div className="admin-order-timeline">
            {timelineSteps.map((step, index) => (
              <div
                key={step.label}
                className={getTimelineStepClass(
                  index < currentTimelineIndex,
                  index === currentTimelineIndex,
                )}
              >
                <span className="admin-order-timeline-dot" aria-hidden="true" />
                <div>
                  <p>{step.label}</p>
                  <small>{step.timestamp ? formatDateTime(step.timestamp) : "Pending"}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Action Snapshot"
            description="User, vendor, and delivery partner activity status."
          />
          <div className="admin-details-list">
            <p>
              <strong>User action:</strong> {order.userAction}
            </p>
            <p>
              <strong>Vendor action:</strong> {order.vendorAction}
            </p>
            <p>
              <strong>Delivery partner status:</strong> {order.deliveryPartnerStatus}
            </p>
            <p>
              <strong>Last updated:</strong> {formatDateTime(order.updatedAtIso)}
            </p>
          </div>
        </article>
      </section>

      <section className="admin-vendor-detail-grid">
        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Dispute Resolution"
            description="Assign accountability and apply financial adjustment outcome."
          />
          {order.dispute?.isFlagged ? (
            <>
              <div className="admin-details-list">
                <p>
                  <strong>Dispute source:</strong> {order.dispute.source}
                </p>
                <p>
                  <strong>Status:</strong> {order.dispute.status}
                </p>
                <p>
                  <strong>Current assigned fault:</strong>{" "}
                  {order.dispute.assignedFault ?? "Unassigned"}
                </p>
                {order.dispute.adminReason ? (
                  <p>
                    <strong>Latest dispute reason:</strong> {order.dispute.adminReason}
                  </p>
                ) : null}
              </div>
              <div className="admin-dispute-controls">
                <label className="field">
                  Assign fault
                  <select
                    className="order-select"
                    value={selectedFault}
                    onChange={(event) =>
                      setSelectedFault(event.target.value as AdminFaultAssignee)
                    }
                  >
                    {DISPUTE_FAULT_OPTIONS.map((fault) => (
                      <option key={fault} value={fault}>
                        {fault}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Dispute resolution reason (mandatory)
                  <textarea
                    className="order-textarea"
                    rows={3}
                    value={disputeReason}
                    onChange={(event) => setDisputeReason(event.target.value)}
                    placeholder="Enter why this party is assigned fault"
                  />
                </label>
                <button type="button" className="btn btn-primary" onClick={handleAssignFault}>
                  Resolve Dispute
                </button>
              </div>
            </>
          ) : (
            <p className="admin-vendor-status-message">
              No dispute is flagged for this order.
            </p>
          )}
        </article>

        <article className="admin-placeholder-card">
          <AdminSectionHeader
            title="Financial Impact"
            description="Mock impact on vendor wallet and user refund/cashback."
          />
          <div className="admin-details-list">
            <p>
              <strong>Vendor wallet adjustment:</strong> {vendorAdjustmentLabel}
            </p>
            <p>
              <strong>Vendor wallet status:</strong> {order.financialImpact.vendorWalletStatus}
            </p>
            <p>
              <strong>User refund status:</strong> {order.financialImpact.userRefundStatus}
            </p>
            <p>
              <strong>User cashback status:</strong> {order.financialImpact.userCashbackStatus}
            </p>
            <p>
              <strong>Admin reason:</strong>{" "}
              {order.financialImpact.adminReason ?? "No admin reason recorded yet."}
            </p>
          </div>
        </article>
      </section>

      {feedbackMessage ? (
        <section className="admin-placeholder-card">
          <p className="admin-action-feedback">{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Audit Log (Admin Only)"
          description="Tracks returns, RTO, and dispute resolution actions."
        />
        {orderAuditLog.length > 0 ? (
          <div className="stack-sm">
            {orderAuditLog.map((entry) => (
              <article key={entry.id} className="admin-audit-row">
                <div className="admin-audit-row-top">
                  <span className="admin-status-badge">{entry.actionType}</span>
                  <strong>{formatDateTime(entry.createdAtIso)}</strong>
                </div>
                <p>{entry.reason}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-vendor-status-message">
            No admin operations actions are logged for this order yet.
          </p>
        )}
      </section>
    </div>
  );
}

export function AdminReturnsRtoPage() {
  const {
    returnCases,
    rtoCases,
    approveReturnResolution,
    closeReturnWithReason,
    confirmRtoCharge,
    reverseRtoCharge,
  } = useOrderOperations();
  const [returnReasonById, setReturnReasonById] = useState<Record<string, string>>({});
  const [rtoReasonById, setRtoReasonById] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const sortedReturns = useMemo(
    () =>
      [...returnCases].sort(
        (first, second) =>
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      ),
    [returnCases],
  );
  const sortedRtoCases = useMemo(
    () =>
      [...rtoCases].sort(
        (first, second) =>
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      ),
    [rtoCases],
  );

  function handleApproveReturn(returnCaseId: string) {
    const result = approveReturnResolution(returnCaseId);
    setFeedbackMessage(result.message);
  }

  function handleCloseReturn(returnCaseId: string) {
    const result = closeReturnWithReason(returnCaseId, returnReasonById[returnCaseId] ?? "");
    setFeedbackMessage(result.message);
    if (result.ok) {
      setReturnReasonById((currentReasons) => ({ ...currentReasons, [returnCaseId]: "" }));
    }
  }

  function handleConfirmRtoCharge(rtoCaseId: string) {
    const result = confirmRtoCharge(rtoCaseId, rtoReasonById[rtoCaseId] ?? "");
    setFeedbackMessage(result.message);
    if (result.ok) {
      setRtoReasonById((currentReasons) => ({ ...currentReasons, [rtoCaseId]: "" }));
    }
  }

  function handleReverseRtoCharge(rtoCaseId: string) {
    const result = reverseRtoCharge(rtoCaseId, rtoReasonById[rtoCaseId] ?? "");
    setFeedbackMessage(result.message);
    if (result.ok) {
      setRtoReasonById((currentReasons) => ({ ...currentReasons, [rtoCaseId]: "" }));
    }
  }

  return (
    <div className="stack">
      <AdminSectionHeader
        title="Returns / RTO"
        description="Resolve returns, process RTO adjustments, and document admin reasons."
      />

      {feedbackMessage ? (
        <section className="admin-placeholder-card">
          <p className="admin-action-feedback">{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Returns Management"
          description="Approve return resolutions or close return requests with reason."
        />
        <div className="stack-sm">
          {sortedReturns.map((returnCase) => (
            <article key={returnCase.id} className="admin-ops-row">
              <div className="admin-ops-row-head">
                <h3>{returnCase.orderId}</h3>
                <span className={getReturnStatusClass(returnCase.status)}>{returnCase.status}</span>
              </div>
              <p>
                <strong>Return reason:</strong> {returnCase.returnReason}
              </p>
              <p>
                <strong>Last admin reason:</strong>{" "}
                {returnCase.adminReason ?? "No reason recorded yet."}
              </p>
              <p>
                <strong>Updated:</strong> {formatDateTime(returnCase.updatedAtIso)}
              </p>
              <div className="inline-actions">
                <Link to={ROUTES.adminOrderDetail(returnCase.orderId)} className="btn btn-secondary">
                  Open Order
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleApproveReturn(returnCase.id)}
                >
                  Approve Return Resolution
                </button>
              </div>
              <label className="field">
                Close return reason (mandatory)
                <textarea
                  className="order-textarea"
                  rows={3}
                  value={returnReasonById[returnCase.id] ?? ""}
                  onChange={(event) =>
                    setReturnReasonById((currentReasons) => ({
                      ...currentReasons,
                      [returnCase.id]: event.target.value,
                    }))
                  }
                  placeholder="Enter reason for closing return request"
                />
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleCloseReturn(returnCase.id)}
              >
                Close Return
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="RTO Management"
          description="Confirm or reverse RTO charge with mandatory reason."
        />
        <div className="stack-sm">
          {sortedRtoCases.map((rtoCase) => (
            <article key={rtoCase.id} className="admin-ops-row">
              <div className="admin-ops-row-head">
                <h3>{rtoCase.orderId}</h3>
                <span className={getRtoStatusClass(rtoCase.adjustmentStatus)}>
                  {rtoCase.adjustmentStatus}
                </span>
              </div>
              <p>
                <strong>Courier issue:</strong> {rtoCase.courierIssueReason}
              </p>
              <p>
                <strong>RTO charge:</strong> {formatInr(rtoCase.rtoChargeInr)}
              </p>
              <p>
                <strong>Last admin reason:</strong>{" "}
                {rtoCase.adminReason ?? "No reason recorded yet."}
              </p>
              <p>
                <strong>Updated:</strong> {formatDateTime(rtoCase.updatedAtIso)}
              </p>
              <div className="inline-actions">
                <Link to={ROUTES.adminOrderDetail(rtoCase.orderId)} className="btn btn-secondary">
                  Open Order
                </Link>
              </div>
              <label className="field">
                RTO action reason (mandatory)
                <textarea
                  className="order-textarea"
                  rows={3}
                  value={rtoReasonById[rtoCase.id] ?? ""}
                  onChange={(event) =>
                    setRtoReasonById((currentReasons) => ({
                      ...currentReasons,
                      [rtoCase.id]: event.target.value,
                    }))
                  }
                  placeholder="Enter reason for RTO adjustment action"
                />
              </label>
              <div className="inline-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleConfirmRtoCharge(rtoCase.id)}
                >
                  Confirm RTO Charge
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleReverseRtoCharge(rtoCase.id)}
                >
                  Reverse RTO Charge
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AdminAdsPage() {
  const {
    ads,
    pricingSlabs,
    auditLog,
    catalogVisibilityRows,
    revenueSummary,
    approveAd,
    pauseAd,
    resumeAd,
    stopAd,
    updatePricingSlab,
    setCatalogSponsoredOverride,
  } = useAdMonetization();
  const [adReasonById, setAdReasonById] = useState<Record<string, string>>({});
  const [pricingReasonByType, setPricingReasonByType] = useState<Record<AdType, string>>({
    "Sponsored Product": "",
    "Sponsored Category": "",
  });
  const [pricingDraftByType, setPricingDraftByType] = useState<
    Record<
      AdType,
      {
        dailyPriceInput: string;
        minimumDurationInput: string;
      }
    >
  >({
    "Sponsored Product": { dailyPriceInput: "", minimumDurationInput: "" },
    "Sponsored Category": { dailyPriceInput: "", minimumDurationInput: "" },
  });
  const [visibilityReasonByProductId, setVisibilityReasonByProductId] = useState<
    Record<string, string>
  >({});
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setPricingDraftByType({
      "Sponsored Product": {
        dailyPriceInput: String(
          pricingSlabs.find((slab) => slab.adType === "Sponsored Product")?.dailyPriceInr ?? 0,
        ),
        minimumDurationInput: String(
          pricingSlabs.find((slab) => slab.adType === "Sponsored Product")
            ?.minimumDurationDays ?? 1,
        ),
      },
      "Sponsored Category": {
        dailyPriceInput: String(
          pricingSlabs.find((slab) => slab.adType === "Sponsored Category")?.dailyPriceInr ?? 0,
        ),
        minimumDurationInput: String(
          pricingSlabs.find((slab) => slab.adType === "Sponsored Category")
            ?.minimumDurationDays ?? 1,
        ),
      },
    });
  }, [pricingSlabs]);

  const sortedAds = useMemo(
    () =>
      [...ads].sort(
        (first, second) =>
          new Date(second.requestedAtIso).getTime() -
          new Date(first.requestedAtIso).getTime(),
      ),
    [ads],
  );

  function handleApprove(adId: string) {
    const result = approveAd(adId);
    setFeedbackMessage(result.message);
  }

  function handlePause(adId: string) {
    const result = pauseAd(adId, adReasonById[adId] ?? "");
    setFeedbackMessage(result.message);
    if (result.ok) {
      setAdReasonById((currentReasons) => ({ ...currentReasons, [adId]: "" }));
    }
  }

  function handleResume(adId: string) {
    const result = resumeAd(adId);
    setFeedbackMessage(result.message);
  }

  function handleStop(adId: string) {
    const result = stopAd(adId, adReasonById[adId] ?? "");
    setFeedbackMessage(result.message);
    if (result.ok) {
      setAdReasonById((currentReasons) => ({ ...currentReasons, [adId]: "" }));
    }
  }

  function updatePricingDraft(
    adType: AdType,
    field: "dailyPriceInput" | "minimumDurationInput",
    value: string,
  ) {
    setPricingDraftByType((currentDrafts) => ({
      ...currentDrafts,
      [adType]: {
        ...currentDrafts[adType],
        [field]: value,
      },
    }));
  }

  function handlePricingSave(adType: AdType) {
    const draft = pricingDraftByType[adType];
    const dailyPriceInr = Number(draft.dailyPriceInput);
    const minimumDurationDays = Number(draft.minimumDurationInput);
    const result = updatePricingSlab(
      adType,
      dailyPriceInr,
      minimumDurationDays,
      pricingReasonByType[adType] ?? "",
    );
    setFeedbackMessage(result.message);
    if (result.ok) {
      setPricingReasonByType((currentReasons) => ({ ...currentReasons, [adType]: "" }));
    }
  }

  function handleVisibilityOverride(productId: string, isSponsored: boolean) {
    const result = setCatalogSponsoredOverride(
      productId,
      isSponsored,
      visibilityReasonByProductId[productId] ?? "",
    );
    setFeedbackMessage(result.message);
    if (result.ok) {
      setVisibilityReasonByProductId((currentReasons) => ({
        ...currentReasons,
        [productId]: "",
      }));
    }
  }

  return (
    <div className="stack">
      <AdminSectionHeader
        title="Ads Control, Pricing & Revenue"
        description="Admin-only controls for ad approvals, pricing slabs, monetization visibility, and audit tracing."
      />

      {feedbackMessage ? (
        <section className="admin-placeholder-card">
          <p className="admin-action-feedback">{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="admin-overview-grid">
        <article className="admin-overview-card">
          <h3>Total Ad Revenue</h3>
          <p>{formatInr(revenueSummary.totalAdRevenueInr)}</p>
        </article>
        <article className="admin-overview-card">
          <h3>Active Ad Revenue</h3>
          <p>{formatInr(revenueSummary.activeAdRevenueInr)}</p>
        </article>
        <article className="admin-overview-card">
          <h3>Completed Ad Revenue</h3>
          <p>{formatInr(revenueSummary.completedAdRevenueInr)}</p>
        </article>
      </section>

      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Ads Control Dashboard"
          description="View all ad campaigns with approval, pause, resume, and stop controls."
        />
        <div className="admin-ads-table-wrap">
          <div className="admin-ads-table-head" role="presentation">
            <span>Vendor</span>
            <span>Ad Type</span>
            <span>Status</span>
            <span>Start Date</span>
            <span>End Date</span>
            <span>Amount Paid</span>
          </div>
          <div className="admin-ads-table-body">
            {sortedAds.map((ad) => (
              <article key={ad.id} className="admin-ads-table-row">
                <span className="admin-vendor-name-cell">{ad.vendorName}</span>
                <span>{ad.type}</span>
                <span className={getAdminAdStatusClass(ad.status)}>{ad.status}</span>
                <span>{formatOptionalDate(ad.startDateIso)}</span>
                <span>{formatOptionalDate(ad.endDateIso)}</span>
                <span>{formatInr(ad.amountPaidInr)}</span>

                <div className="admin-ads-row-controls">
                  <p className="admin-vendor-status-message">
                    Campaign ID: <strong>{ad.id}</strong>
                    {ad.type === "Sponsored Product"
                      ? ` • Product: ${ad.productName ?? "Unknown"}`
                      : ` • Category: ${ad.category ?? "Unknown"}`}
                  </p>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleApprove(ad.id)}
                      disabled={ad.status !== "Pending"}
                    >
                      Approve Ad
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handlePause(ad.id)}
                      disabled={ad.status !== "Active"}
                    >
                      Pause Ad
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleResume(ad.id)}
                      disabled={ad.status !== "Paused"}
                    >
                      Resume Ad
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleStop(ad.id)}
                      disabled={ad.status === "Expired"}
                    >
                      Stop Ad
                    </button>
                  </div>
                  <label className="field">
                    Pause/stop reason (required for pause and stop)
                    <textarea
                      className="order-textarea"
                      rows={2}
                      value={adReasonById[ad.id] ?? ""}
                      onChange={(event) =>
                        setAdReasonById((currentReasons) => ({
                          ...currentReasons,
                          [ad.id]: event.target.value,
                        }))
                      }
                      placeholder="Enter reason for pause/stop action"
                    />
                  </label>
                  {ad.latestAdminActionLabel ? (
                    <p className="admin-vendor-status-message">
                      Last admin action: <strong>{ad.latestAdminActionLabel}</strong>
                      {ad.latestAdminReason ? ` • ${ad.latestAdminReason}` : ""}
                      {ad.latestAdminActionAtIso
                        ? ` • ${formatDateTime(ad.latestAdminActionAtIso)}`
                        : ""}
                    </p>
                  ) : (
                    <p className="admin-vendor-status-message">
                      No admin action recorded yet for this ad.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Ad Pricing Slabs (Admin Controlled)"
          description="Set daily price and minimum duration. Vendors can view pricing but cannot edit it."
        />
        <div className="stack-sm">
          {pricingSlabs.map((slab) => (
            <article key={slab.adType} className="admin-pricing-row">
              <div className="admin-pricing-grid">
                <p>
                  <strong>{slab.adType}</strong>
                </p>
                <label className="field">
                  Daily price (₹)
                  <input
                    type="number"
                    min={1}
                    value={pricingDraftByType[slab.adType].dailyPriceInput}
                    onChange={(event) =>
                      updatePricingDraft(slab.adType, "dailyPriceInput", event.target.value)
                    }
                  />
                </label>
                <label className="field">
                  Minimum duration (days)
                  <input
                    type="number"
                    min={1}
                    value={pricingDraftByType[slab.adType].minimumDurationInput}
                    onChange={(event) =>
                      updatePricingDraft(
                        slab.adType,
                        "minimumDurationInput",
                        event.target.value,
                      )
                    }
                  />
                </label>
                <label className="field">
                  Pricing change reason (required)
                  <input
                    type="text"
                    value={pricingReasonByType[slab.adType] ?? ""}
                    onChange={(event) =>
                      setPricingReasonByType((currentReasons) => ({
                        ...currentReasons,
                        [slab.adType]: event.target.value,
                      }))
                    }
                    placeholder="Explain why this slab is changing"
                  />
                </label>
              </div>
              <div className="inline-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handlePricingSave(slab.adType)}
                >
                  Update Pricing Slab
                </button>
              </div>
              <p className="admin-vendor-status-message">
                Last updated: <strong>{formatDateTime(slab.updatedAtIso)}</strong>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Visibility Overrides (Admin Only)"
          description="Override storefront sponsorship labels and placement at product level."
        />
        <p className="admin-vendor-status-message">
          Sponsored products are prioritized before organic products and always labeled Sponsored
          in storefront listings.
        </p>
        <div className="stack-sm">
          {catalogVisibilityRows.map((row) => (
            <article key={row.productId} className="admin-visibility-row">
              <div className="admin-ops-row-head">
                <h3>{row.productName}</h3>
                <span className={getAdminAdStatusClass(row.effectiveSponsored ? "Active" : "Paused")}>
                  {row.effectiveSponsored ? "Sponsored" : "Organic"}
                </span>
              </div>
              <p>
                <strong>Category:</strong> {row.category}
              </p>
              <p>
                <strong>Default visibility:</strong>{" "}
                {row.defaultSponsored ? "Sponsored" : "Organic"}
              </p>
              <p>
                <strong>Latest override reason:</strong>{" "}
                {row.overrideReason ? row.overrideReason : "No override reason recorded."}
              </p>
              {row.updatedAtIso ? (
                <p>
                  <strong>Updated:</strong> {formatDateTime(row.updatedAtIso)}
                </p>
              ) : null}
              <label className="field">
                Override reason (required)
                <input
                  type="text"
                  value={visibilityReasonByProductId[row.productId] ?? ""}
                  onChange={(event) =>
                    setVisibilityReasonByProductId((currentReasons) => ({
                      ...currentReasons,
                      [row.productId]: event.target.value,
                    }))
                  }
                  placeholder="Enter reason for visibility override"
                />
              </label>
              <div className="inline-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleVisibilityOverride(row.productId, true)}
                >
                  Set Sponsored
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleVisibilityOverride(row.productId, false)}
                >
                  Set Organic
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-placeholder-card">
        <AdminSectionHeader
          title="Ads Audit Log (Admin Only)"
          description="Tracks ad approvals, pauses, stops, pricing changes, and visibility overrides."
        />
        {auditLog.length > 0 ? (
          <div className="stack-sm">
            {auditLog.map((entry) => (
              <article key={entry.id} className="admin-audit-row">
                <div className="admin-audit-row-top">
                  <span className="admin-status-badge">{entry.actionType}</span>
                  <strong>{formatDateTime(entry.createdAtIso)}</strong>
                </div>
                {entry.vendorName ? (
                  <p>
                    <strong>Vendor:</strong> {entry.vendorName}
                  </p>
                ) : null}
                {entry.adId ? (
                  <p>
                    <strong>Ad ID:</strong> {entry.adId}
                  </p>
                ) : null}
                <p>{entry.reason}</p>
                {entry.metadata ? <p>{entry.metadata}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-vendor-status-message">
            No ad-related admin actions are logged yet.
          </p>
        )}
      </section>
    </div>
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
