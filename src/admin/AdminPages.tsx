import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../routes/paths";
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
const STATIC_ACTIVE_ADS_COUNT = 119;

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

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
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
  const { vendors } = useVendorLifecycle();
  const pendingApprovals = vendors.filter(
    (vendor) => vendor.status === "Under Scrutiny",
  ).length;
  const totalVendors = vendors.length;
  const adminMetrics = [
    { label: "Total Users", value: STATIC_USERS_COUNT },
    { label: "Total Vendors", value: totalVendors },
    { label: "Total Orders", value: STATIC_ORDERS_COUNT },
    { label: "Pending Approvals", value: pendingApprovals },
    { label: "Active Ads", value: STATIC_ACTIVE_ADS_COUNT },
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
            <p>{metric.value.toLocaleString("en-IN")}</p>
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
