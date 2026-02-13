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
  type VendorOnboardingData,
  type VendorProduct,
  type VendorProductExtraOffer,
  type VendorProductExtraOfferType,
  type VendorProductPayload,
  type VendorProductSpecification,
  type VendorProductStatus,
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

export function VendorProductsPage() {
  const {
    canPublishProducts,
    vendorProducts,
    addVendorProduct,
    updateVendorProduct,
    approveVendorProduct,
    rejectVendorProduct,
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
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      ),
    [vendorProducts],
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
