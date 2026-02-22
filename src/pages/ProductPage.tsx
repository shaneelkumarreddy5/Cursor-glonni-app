import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getVendorOptionsForProduct,
  type ProductVendorExtraOffer,
} from "../data/mockCommerce";
import { bankOffers, catalogProducts, type CatalogProduct } from "../data/mockCatalog";
import { ROUTES } from "../routes/paths";
import { useCommerce } from "../state/CommerceContext";
import { formatInr } from "../utils/currency";

type DetailSectionSpec = {
  label: string;
  value: string;
};

type ProductNarrative = {
  fullDescription: string;
  highlights: string[];
  specifications: DetailSectionSpec[];
};

type SellerTrustInfo = {
  rating: number;
  shippingPolicy: string;
  returnPolicy: string;
};

const RETURN_WINDOW_DAYS = 7;
const COD_LIMIT_INR = 5000;

type OfferRow = {
  kind: "bank" | "brand" | "coupon" | "combo";
  title: string;
  description: string;
  logoType: "image" | "icon";
  logoUrl?: string;
  logoAlt?: string;
};

function CouponIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M20 12a2 2 0 0 0 0-4V6a2 2 0 0 0-2-2h-2a2 2 0 0 1-4 0H6a2 2 0 0 0-2 2v2a2 2 0 0 1 0 4v2a2 2 0 0 0 2 2h2a2 2 0 0 1 4 0h6a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9h.01M15 15h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 9 9 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalizeOfferText(text: string) {
  return text.replace(/^best offer:\s*/i, "").trim();
}

function getProductNarrative(product: CatalogProduct): ProductNarrative {
  if (product.category === "Mobiles") {
    return {
      fullDescription: `${product.name} is built for everyday speed, reliable battery backup, and a smooth app experience. It combines practical performance with a clean design and is ideal for work, video calls, social media, and casual gaming.`,
      highlights: [
        "Optimized for Indian network bands and dual-SIM usage",
        "Fast charging support with all-day battery profile",
        "High-refresh display tuned for smooth scrolling",
        "Glonni verified warranty and invoice support",
      ],
      specifications: [
        { label: "RAM", value: "8 GB" },
        { label: "Storage", value: "128 GB" },
        { label: "Battery", value: "5000 mAh" },
        { label: "Camera", value: "50 MP + 8 MP dual rear camera" },
        { label: "OS", value: "Android 15" },
        { label: "Warranty", value: "1 Year manufacturer warranty" },
      ],
    };
  }

  if (product.category === "Laptops") {
    return {
      fullDescription: `${product.name} is designed for hybrid professionals and students who need dependable multitasking. It balances performance, display clarity, and portability for long productivity sessions.`,
      highlights: [
        "High performance processor for office and creator workflows",
        "Backlit keyboard and anti-glare display for extended use",
        "Wi-Fi 6 and modern I/O ports for daily convenience",
        "Comes with GST invoice and standard brand warranty",
      ],
      specifications: [
        { label: "RAM", value: "16 GB DDR5" },
        { label: "Storage", value: "512 GB NVMe SSD" },
        { label: "Battery", value: "Up to 10 hours (mixed usage)" },
        { label: "Camera", value: "1080p HD webcam" },
        { label: "OS", value: "Windows 11 Home" },
        { label: "Warranty", value: "1 Year onsite support" },
      ],
    };
  }

  if (product.category === "Accessories") {
    return {
      fullDescription: `${product.name} focuses on daily durability and consistent output. It is built to fit common consumer use-cases and works seamlessly with most supported devices.`,
      highlights: [
        "Durable build quality suitable for regular use",
        "Compact profile with travel-friendly form factor",
        "Quality checks performed by verified sellers",
        "Easy replacement support under eligible conditions",
      ],
      specifications: [
        { label: "Compatibility", value: "Android, iOS, Windows (as applicable)" },
        { label: "Build", value: "Premium polycarbonate / alloy mix" },
        { label: "Battery", value: "Not applicable / product dependent" },
        { label: "Connectivity", value: "Bluetooth 5.3 / Wired (model dependent)" },
        { label: "In-box", value: "Main unit, cable, quick guide" },
        { label: "Warranty", value: "6 months manufacturer warranty" },
      ],
    };
  }

  return {
    fullDescription: `${product.name} offers reliable comfort and everyday utility for urban usage. It is curated for value-conscious buyers and follows platform quality checks before dispatch.`,
    highlights: [
      "Comfort-oriented material and long-wear fit",
      "Durable outsole for daily movement",
      "Easy size exchange on eligible orders",
      "Verified billing and customer support coverage",
    ],
    specifications: [
      { label: "Upper Material", value: "Breathable engineered mesh" },
      { label: "Sole Material", value: "Rubber compound outsole" },
      { label: "Closure", value: "Lace-up" },
      { label: "Use Case", value: "Daily commute and light training" },
      { label: "Water Resistance", value: "Splash resistant" },
      { label: "Warranty", value: "3 months against manufacturing defects" },
    ],
  };
}

function getSellerTrustInfo(vendorCode: string): SellerTrustInfo {
  if (vendorCode === "verified") {
    return {
      rating: 4.7,
      shippingPolicy: "Priority dispatch within 24 hours for in-stock products.",
      returnPolicy: "Seller honors 7-day return/replacement as per platform eligibility.",
    };
  }

  if (vendorCode === "nova") {
    return {
      rating: 4.4,
      shippingPolicy: "Standard dispatch in 24-48 hours with tracking updates.",
      returnPolicy: "Return accepted for eligible products within return window.",
    };
  }

  return {
    rating: 4.2,
    shippingPolicy: "Dispatch in 48 hours with delivery handover updates.",
    returnPolicy: "Replacement subject to stock and return policy checks.",
  };
}

export function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCommerce();
  const requestedProduct = productId
    ? catalogProducts.find((product) => product.id === productId)
    : null;
  const featuredProduct = requestedProduct ?? catalogProducts[0];
  const vendorOptions = useMemo(
    () => getVendorOptionsForProduct(featuredProduct),
    [featuredProduct],
  );
  const [selectedVendorId, setSelectedVendorId] = useState(vendorOptions[0].id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedExtraOfferId, setSelectedExtraOfferId] = useState<string | null>(
    null,
  );
  const [addToCartMessage, setAddToCartMessage] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isOffersSheetOpen, setIsOffersSheetOpen] = useState(false);
  const [isSellersSheetOpen, setIsSellersSheetOpen] = useState(false);
  const [isExchangeSheetOpen, setIsExchangeSheetOpen] = useState(false);
  const [exchangeOldDeviceType, setExchangeOldDeviceType] = useState<"Mobile" | "Laptop">("Mobile");
  const [exchangeBrand, setExchangeBrand] = useState("");
  const [exchangeModel, setExchangeModel] = useState("");
  const [exchangeCondition, setExchangeCondition] = useState<"Good" | "Average" | "Not working">("Good");
  const [exchangePincode, setExchangePincode] = useState("");
  const [appliedExchangeInr, setAppliedExchangeInr] = useState<number | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);

  useEffect(() => {
    setSelectedVendorId(vendorOptions[0].id);
    setSelectedExtraOfferId(null);
    setSelectedImageIndex(0);
    setAddToCartMessage("");
  }, [vendorOptions]);

  useEffect(() => {
    setSelectedColor(featuredProduct.variants?.colors?.[0] ?? null);
    setSelectedStorage(featuredProduct.variants?.storages?.[0] ?? null);
    setSelectedSize(featuredProduct.variants?.sizes?.[0] ?? null);
    setIsOffersSheetOpen(false);
    setIsSellersSheetOpen(false);
    setIsExchangeSheetOpen(false);
    setAppliedExchangeInr(null);
    setIsDescriptionExpanded(false);
    setIsSpecsExpanded(false);
  }, [featuredProduct.id]);

  const selectedVendor =
    vendorOptions.find((vendor) => vendor.id === selectedVendorId) ?? vendorOptions[0];
  const selectedExtraOffer =
    selectedVendor.extraOffers.find((offer) => offer.id === selectedExtraOfferId) ??
    null;
  const productNarrative = useMemo(
    () => getProductNarrative(featuredProduct),
    [featuredProduct],
  );
  const sellerTrustInfo = useMemo(
    () => getSellerTrustInfo(selectedVendor.vendorCode),
    [selectedVendor.vendorCode],
  );
  const galleryImages = [
    featuredProduct.imageUrl,
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
  ];
  const finalPriceInr = Math.max(
    1,
    selectedVendor.priceInr + (selectedExtraOffer?.priceAdjustmentInr ?? 0),
  );
  const finalCashbackInr = Math.max(
    0,
    selectedVendor.cashbackInr + (selectedExtraOffer?.cashbackAdjustmentInr ?? 0),
  );
  const isCurrentConfigCodEligible = finalPriceInr <= COD_LIMIT_INR;
  const bestSeller = vendorOptions[0];
  const faqItems = useMemo(
    () => [
      {
        question: "Is this product returnable?",
        answer: `Yes, eligible orders can be returned or replaced within ${RETURN_WINDOW_DAYS} days from delivery, subject to seller and non-returnable conditions.`,
      },
      {
        question: "When will cashback be credited?",
        answer:
          "Cashback stays pending until delivery. It is confirmed after return window closure or immediately when No Return is confirmed.",
      },
      {
        question: "Is COD available?",
        answer: isCurrentConfigCodEligible
          ? "COD can be selected at checkout if account eligibility is active and order value is within the allowed limit."
          : `For this configuration, COD is usually unavailable because final payable exceeds ${formatInr(
              COD_LIMIT_INR,
            )}.`,
      },
    ],
    [isCurrentConfigCodEligible, finalPriceInr],
  );

  const selectedVariantSummary = useMemo(() => {
    const parts = [selectedColor, selectedStorage, selectedSize].filter(Boolean) as string[];
    return parts.length > 0 ? parts.join(" • ") : "Standard configuration";
  }, [selectedColor, selectedSize, selectedStorage]);

  const offerRows = useMemo<OfferRow[]>(() => {
    const rows: OfferRow[] = [];
    const topBank = bankOffers[0] ?? null;
    if (topBank) {
      rows.push({
        kind: "bank",
        title: "Bank offer",
        description: topBank.offerText,
        logoType: "image",
        logoUrl: topBank.logoUrl,
        logoAlt: topBank.bankName,
      });
    }

    const productOfferText = featuredProduct.bestOfferLine?.trim()
      ? normalizeOfferText(featuredProduct.bestOfferLine)
      : "";
    const lower = productOfferText.toLowerCase();

    const vendorCoupon =
      selectedVendor.extraOffers.find((offer) => offer.title.toLowerCase().includes("coupon")) ??
      null;
    const couponLine =
      lower.includes("coupon") || lower.includes("code")
        ? productOfferText
        : vendorCoupon
          ? `${vendorCoupon.title}: ${vendorCoupon.description}`
          : "";

    const comboOffer =
      selectedVendor.extraOffers.find((offer) => offer.title.toLowerCase().includes("bundle")) ??
      selectedVendor.extraOffers.find((offer) => offer.title.toLowerCase().includes("protection")) ??
      null;
    const comboLine = comboOffer ? `${comboOffer.title}: ${comboOffer.description}` : "";

    rows.push({
      kind: "brand",
      title: "Brand offer",
      description: productOfferText || `Extra savings on ${featuredProduct.brand} products.`,
      logoType: "image",
      logoUrl: featuredProduct.brandLogoUrl,
      logoAlt: featuredProduct.brand,
    });

    if (couponLine) {
      rows.push({
        kind: "coupon",
        title: "Coupon",
        description: couponLine,
        logoType: "icon",
      });
    }

    if (comboLine) {
      rows.push({
        kind: "combo",
        title: "Combo offer",
        description: comboLine,
        logoType: "icon",
      });
    }

    return rows.slice(0, 4);
  }, [featuredProduct, selectedVendor.extraOffers]);

  const exchangeEligible =
    featuredProduct.exchangeEligible === true &&
    (featuredProduct.category === "Mobiles" || featuredProduct.category === "Laptops");
  const exchangeMaxInr = featuredProduct.exchangeUptoInr ?? 0;
  const exchangeEstimateInr = useMemo(() => {
    if (!exchangeEligible) {
      return 0;
    }
    const factor =
      exchangeCondition === "Good" ? 1 : exchangeCondition === "Average" ? 0.7 : 0.3;
    return Math.max(0, Math.round(exchangeMaxInr * factor));
  }, [exchangeCondition, exchangeEligible, exchangeMaxInr]);

  useEffect(() => {
    if (!exchangeEligible) {
      return;
    }
    const wantsExchange = searchParams.get("exchange") === "1";
    if (wantsExchange) {
      setIsExchangeSheetOpen(true);
      setExchangeOldDeviceType(featuredProduct.category === "Laptops" ? "Laptop" : "Mobile");
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("exchange");
      setSearchParams(nextParams, { replace: true });
    }
  }, [exchangeEligible, featuredProduct.category, searchParams, setSearchParams]);

  function getOfferImpactLabel(extraOffer: ProductVendorExtraOffer) {
    const priceDelta =
      extraOffer.priceAdjustmentInr === 0
        ? "No price change"
        : extraOffer.priceAdjustmentInr < 0
          ? `${formatInr(Math.abs(extraOffer.priceAdjustmentInr))} off`
          : `${formatInr(extraOffer.priceAdjustmentInr)} add-on`;
    const cashbackDelta =
      extraOffer.cashbackAdjustmentInr === 0
        ? "No cashback change"
        : `Cashback +${formatInr(extraOffer.cashbackAdjustmentInr)}`;
    return `${priceDelta} · ${cashbackDelta}`;
  }

  function addCurrentConfigurationToCart() {
    addToCart({
      product: featuredProduct,
      vendor: selectedVendor,
      selectedExtraOffer,
      unitPriceInr: finalPriceInr,
      unitCashbackInr: finalCashbackInr,
    });
    setAddToCartMessage("Added to cart");
  }

  function handleBuyNow() {
    addCurrentConfigurationToCart();
    navigate(ROUTES.checkout);
  }

  return (
    <div className="stack pdp-page">
      {productId && !requestedProduct ? (
        <section className="card">
          <p>Requested product was not found. Showing a featured product instead.</p>
        </section>
      ) : null}

      <section className="product-layout pdp-layout">
        <article className="card pdp-gallery-card">
          <img
            src={galleryImages[selectedImageIndex]}
            alt={`${featuredProduct.name} gallery preview`}
            className="pdp-main-image"
          />
          <div className="thumb-row pdp-thumb-row">
            {galleryImages.map((imageUrl, index) => (
              <button
                key={imageUrl}
                type="button"
                className={index === selectedImageIndex ? "thumb pdp-thumb is-active" : "thumb pdp-thumb"}
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img src={imageUrl} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        </article>

        <div className="stack-sm pdp-right-col">
          <section className="card pdp-title-card">
            <div className="pdp-meta-row">
              <div className="pdp-brand-header">
                <img src={featuredProduct.brandLogoUrl} alt={`${featuredProduct.brand} logo`} />
                <span>{featuredProduct.brand}</span>
              </div>
              <span className="pdp-rating">Rating {featuredProduct.rating.toFixed(1)}</span>
            </div>
            <h2 className="pdp-title">{featuredProduct.name}</h2>
            <p className="pdp-specs">{featuredProduct.keySpecs.join(" • ")}</p>
          </section>

          <section className="card pdp-price-card">
            <div className="pdp-price-box">
              <strong>{formatInr(finalPriceInr)}</strong>
              <span className="pdp-mrp">{formatInr(featuredProduct.mrpInr)}</span>
            </div>
            <div className="pdp-price-meta">
              <span className="pdp-cashback-line">
                Cashback: <strong>{formatInr(finalCashbackInr)}</strong>
              </span>
              <span className="pdp-delivery-line">{selectedVendor.deliveryEstimate}</span>
            </div>
          </section>

          {(featuredProduct.variants?.colors?.length ||
            featuredProduct.variants?.storages?.length ||
            featuredProduct.variants?.sizes?.length) ? (
            <section className="card pdp-variants-card">
              <header className="section-header">
                <h2>Variations</h2>
              </header>

              {featuredProduct.variants?.colors?.length ? (
                <div className="pdp-variant-group">
                  <h3>Color</h3>
                  <div className="pdp-variant-options">
                    {featuredProduct.variants.colors.map((color) => (
                      <button
                        key={`${featuredProduct.id}:color:${color}`}
                        type="button"
                        className={
                          selectedColor === color ? "pdp-variant-pill is-selected" : "pdp-variant-pill"
                        }
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {featuredProduct.variants?.storages?.length ? (
                <div className="pdp-variant-group">
                  <h3>Storage</h3>
                  <div className="pdp-variant-options">
                    {featuredProduct.variants.storages.map((storage) => (
                      <button
                        key={`${featuredProduct.id}:storage:${storage}`}
                        type="button"
                        className={
                          selectedStorage === storage ? "pdp-variant-pill is-selected" : "pdp-variant-pill"
                        }
                        onClick={() => setSelectedStorage(storage)}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {featuredProduct.variants?.sizes?.length ? (
                <div className="pdp-variant-group">
                  <h3>Size</h3>
                  <div className="pdp-variant-options">
                    {featuredProduct.variants.sizes.map((size) => (
                      <button
                        key={`${featuredProduct.id}:size:${size}`}
                        type="button"
                        className={
                          selectedSize === size ? "pdp-variant-pill is-selected" : "pdp-variant-pill"
                        }
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="card pdp-offers-card" aria-label="Offers">
            <header className="pdp-offers-head" id="offers">
              <h2>Offers</h2>
              <button type="button" className="pdp-link-btn" onClick={() => setIsOffersSheetOpen(true)}>
                View all offers
              </button>
            </header>
            <div className="pdp-offers-list">
              {offerRows.map((offer) => (
                <div key={`${offer.kind}:${offer.title}`} className="pdp-offer-row">
                  <span className="pdp-offer-logo" aria-hidden="true">
                    {offer.logoType === "image" && offer.logoUrl ? (
                      <img src={offer.logoUrl} alt={offer.logoAlt ?? ""} />
                    ) : (
                      <span className="pdp-offer-icon">
                        <CouponIcon />
                      </span>
                    )}
                  </span>
                  <div className="pdp-offer-copy">
                    <strong>{offer.title}</strong>
                    <p>{offer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card pdp-buy-card" aria-label="Buy actions">
            <p className="pdp-selected-variant">Selected: {selectedVariantSummary}</p>
            {exchangeEligible ? (
              <div className="pdp-exchange-row" aria-label="Exchange">
                <div className="pdp-exchange-copy">
                  <strong>Exchange</strong>
                  <p>
                    {typeof featuredProduct.exchangeUptoInr === "number"
                      ? `Up to ${formatInr(featuredProduct.exchangeUptoInr)} on old device`
                      : "Exchange available for this product"}
                    {appliedExchangeInr ? ` · Applied -${formatInr(appliedExchangeInr)} (est.)` : ""}
                  </p>
                </div>
                <div className="pdp-exchange-actions">
                  {appliedExchangeInr ? (
                    <button type="button" className="btn btn-secondary" onClick={() => setAppliedExchangeInr(null)}>
                      Remove
                    </button>
                  ) : null}
                  <button type="button" className="btn btn-secondary" onClick={() => setIsExchangeSheetOpen(true)}>
                    {appliedExchangeInr ? "Edit" : "Check"}
                  </button>
                </div>
              </div>
            ) : null}
            <div className="pdp-buy-actions">
              <button type="button" className="btn btn-primary" onClick={addCurrentConfigurationToCart}>
                Add to Cart
              </button>
              <button type="button" className="btn btn-primary" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>
            {addToCartMessage ? <p className="pdp-delivery-line">{addToCartMessage}</p> : null}
            <div className="chip-row" aria-label="Shopping assurance">
              <span className="chip">7 day replacement</span>
              <span className="chip">Secure payment</span>
              <span className="chip">GST invoice available</span>
            </div>
          </section>

          <section className="card pdp-info-card" aria-label="Description, specifications and warranty">
            <header className="section-header">
              <h2>Description</h2>
            </header>
            <p className={isDescriptionExpanded ? "pdp-description is-expanded" : "pdp-description"}>
              {productNarrative.fullDescription}
            </p>
            <button type="button" className="pdp-link-btn" onClick={() => setIsDescriptionExpanded((v) => !v)}>
              {isDescriptionExpanded ? "Show less" : "Read more"}
            </button>

            <div className="pdp-divider" role="separator" />

            <header className="section-header">
              <h2>Specifications</h2>
            </header>
            <div
              className={isSpecsExpanded ? "pdp-spec-table is-expanded" : "pdp-spec-table"}
              role="table"
              aria-label="Product specifications"
            >
              {productNarrative.specifications
                .slice(0, isSpecsExpanded ? productNarrative.specifications.length : 6)
                .map((spec) => (
                  <div key={spec.label} className="pdp-spec-row" role="row">
                    <span>{spec.label}</span>
                    <strong>{spec.value}</strong>
                  </div>
                ))}
            </div>
            {productNarrative.specifications.length > 6 ? (
              <button type="button" className="pdp-link-btn" onClick={() => setIsSpecsExpanded((v) => !v)}>
                {isSpecsExpanded ? "Show less specs" : "See all specs"}
              </button>
            ) : null}

            <div className="pdp-divider" role="separator" />

            <header className="section-header">
              <h2>Warranty</h2>
            </header>
            <p className="pdp-warranty-line">
              {productNarrative.specifications.find((spec) => spec.label.toLowerCase() === "warranty")?.value ??
                "Warranty information available with invoice."}
            </p>
          </section>

          <section className="card pdp-delivery-card" aria-label="Delivery and returns">
            <header className="section-header">
              <h2>Delivery & Returns</h2>
            </header>
            <div className="stack-sm">
              <p className="pdp-delivery-line">
                <strong>Delivery:</strong> {selectedVendor.deliveryEstimate}
              </p>
              <p className="pdp-delivery-line">
                <strong>Return window:</strong> {RETURN_WINDOW_DAYS} days (eligible items)
              </p>
              <p className="pdp-delivery-line">
                <strong>COD:</strong> {isCurrentConfigCodEligible ? "Available" : "Usually not available for this price"}
              </p>
            </div>
          </section>

          <section className="card pdp-seller-card" aria-label="Seller">
            <header className="pdp-offers-head">
              <h2>Seller</h2>
              <button type="button" className="pdp-link-btn" onClick={() => setIsSellersSheetOpen(true)}>
                View all sellers
              </button>
            </header>
            <div className="pdp-seller-summary">
              <p>
                <strong>{selectedVendor.name}</strong> · {formatInr(selectedVendor.priceInr)} · Cashback {formatInr(selectedVendor.cashbackInr)}
              </p>
              <p className="pdp-delivery-line">{selectedVendor.vendorOffer}</p>
            </div>
            <p className="pdp-muted-line">
              Best price currently: <strong>{bestSeller.name}</strong> at {formatInr(bestSeller.priceInr)}
            </p>
          </section>
        </div>
      </section>

      <section className="two-column">
        <article className="card">
          <header className="section-header">
            <h2>FAQs</h2>
          </header>
          <div className="pdp-faq-list">
            {faqItems.map((faqItem) => (
              <details key={faqItem.question} className="pdp-faq-item">
                <summary>{faqItem.question}</summary>
                <p>{faqItem.answer}</p>
              </details>
            ))}
          </div>
        </article>

        <article className="card">
          <header className="section-header">
            <h2>Seller / Vendor information</h2>
          </header>
          <div className="stack-sm">
            <p>
              <strong>Seller:</strong> {selectedVendor.name}
            </p>
            <p>
              <strong>Seller rating:</strong> {sellerTrustInfo.rating.toFixed(1)} / 5
            </p>
            <p>
              <strong>Shipping policy:</strong> {sellerTrustInfo.shippingPolicy}
            </p>
            <p>
              <strong>Returns policy:</strong> {sellerTrustInfo.returnPolicy}
            </p>
          </div>
        </article>
      </section>

      {isOffersSheetOpen ? (
        <div className="plp-drawer-overlay" role="dialog" aria-modal="true" aria-label="All offers">
          <div className="plp-sheet">
            <div className="plp-drawer-head">
              <strong>All offers</strong>
              <button type="button" className="plp-icon-btn" onClick={() => setIsOffersSheetOpen(false)} aria-label="Close offers">
                ✕
              </button>
            </div>
            <div className="plp-drawer-body">
              <div className="stack-sm">
                {bankOffers.map((offer) => (
                  <article key={offer.bankName} className="pdp-bank-offer-card">
                    <img src={offer.logoUrl} alt={`${offer.bankName} logo`} />
                    <p>{offer.offerText}</p>
                  </article>
                ))}
                {featuredProduct.bestOfferLine ? (
                  <article className="pdp-bank-offer-card">
                    <img src={featuredProduct.brandLogoUrl} alt={`${featuredProduct.brand} logo`} />
                    <p>{normalizeOfferText(featuredProduct.bestOfferLine)}</p>
                  </article>
                ) : null}
                {selectedVendor.extraOffers.map((extra) => (
                  <article key={extra.id} className="pdp-bank-offer-card">
                    <span className="pdp-offer-sheet-icon" aria-hidden="true">
                      <CouponIcon />
                    </span>
                    <p>
                      <strong>{extra.title}:</strong> {extra.description} <span className="pdp-muted-inline">({getOfferImpactLabel(extra)})</span>
                    </p>
                  </article>
                ))}
              </div>
            </div>
            <div className="plp-drawer-foot">
              <button type="button" className="btn btn-primary btn-block" onClick={() => setIsOffersSheetOpen(false)}>
                Done
              </button>
            </div>
          </div>
          <button type="button" className="plp-drawer-scrim" onClick={() => setIsOffersSheetOpen(false)} aria-label="Close offers" />
        </div>
      ) : null}

      {isSellersSheetOpen ? (
        <div className="plp-drawer-overlay" role="dialog" aria-modal="true" aria-label="All sellers">
          <div className="plp-sheet">
            <div className="plp-drawer-head">
              <strong>All sellers</strong>
              <button type="button" className="plp-icon-btn" onClick={() => setIsSellersSheetOpen(false)} aria-label="Close sellers">
                ✕
              </button>
            </div>
            <div className="plp-drawer-body">
              <div className="stack-sm">
                <div className="pdp-vendor-list">
                  {vendorOptions.map((vendor) => (
                    <label
                      key={vendor.id}
                      className={selectedVendorId === vendor.id ? "pdp-vendor-option is-selected" : "pdp-vendor-option"}
                    >
                      <input
                        type="radio"
                        name="vendor"
                        checked={selectedVendorId === vendor.id}
                        onChange={() => {
                          setSelectedVendorId(vendor.id);
                          setSelectedExtraOfferId(null);
                        }}
                      />
                      <div>
                        <h3>{vendor.name}</h3>
                        <p>{formatInr(vendor.priceInr)} · Cashback {formatInr(vendor.cashbackInr)}</p>
                        <p>{vendor.deliveryEstimate}</p>
                        <p>{vendor.vendorOffer}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <section className="stack-sm">
                  <header className="section-header">
                    <h2>Extra vendor offers</h2>
                  </header>
                  <div className="pdp-vendor-list">
                    <label className={selectedExtraOfferId === null ? "pdp-vendor-option is-selected" : "pdp-vendor-option"}>
                      <input
                        type="radio"
                        name="extra-offer"
                        checked={selectedExtraOfferId === null}
                        onChange={() => setSelectedExtraOfferId(null)}
                      />
                      <div>
                        <h3>No extra offer</h3>
                        <p>Use base seller price and cashback.</p>
                      </div>
                    </label>
                    {selectedVendor.extraOffers.map((extraOffer) => (
                      <label
                        key={extraOffer.id}
                        className={selectedExtraOfferId === extraOffer.id ? "pdp-vendor-option is-selected" : "pdp-vendor-option"}
                      >
                        <input
                          type="radio"
                          name="extra-offer"
                          checked={selectedExtraOfferId === extraOffer.id}
                          onChange={() => setSelectedExtraOfferId(extraOffer.id)}
                        />
                        <div>
                          <h3>{extraOffer.title}</h3>
                          <p>{extraOffer.description}</p>
                          <p>{getOfferImpactLabel(extraOffer)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </div>
            <div className="plp-drawer-foot">
              <button type="button" className="btn btn-primary btn-block" onClick={() => setIsSellersSheetOpen(false)}>
                Done
              </button>
            </div>
          </div>
          <button type="button" className="plp-drawer-scrim" onClick={() => setIsSellersSheetOpen(false)} aria-label="Close sellers" />
        </div>
      ) : null}

      {isExchangeSheetOpen && exchangeEligible ? (
        <div className="plp-drawer-overlay" role="dialog" aria-modal="true" aria-label="Exchange">
          <div className="plp-sheet">
            <div className="plp-drawer-head">
              <strong>Exchange old device</strong>
              <button type="button" className="plp-icon-btn" onClick={() => setIsExchangeSheetOpen(false)} aria-label="Close exchange">
                ✕
              </button>
            </div>
            <div className="plp-drawer-body">
              <div className="pdp-exchange-form">
                <label className="pdp-exchange-field">
                  <span>Old device type</span>
                  <select value={exchangeOldDeviceType} onChange={(e) => setExchangeOldDeviceType(e.target.value as "Mobile" | "Laptop")}>
                    <option value="Mobile">Mobile</option>
                    <option value="Laptop">Laptop</option>
                  </select>
                </label>
                <label className="pdp-exchange-field">
                  <span>Brand</span>
                  <input value={exchangeBrand} onChange={(e) => setExchangeBrand(e.target.value)} placeholder="e.g. Samsung" />
                </label>
                <label className="pdp-exchange-field">
                  <span>Model</span>
                  <input value={exchangeModel} onChange={(e) => setExchangeModel(e.target.value)} placeholder="e.g. Galaxy S21" />
                </label>
                <label className="pdp-exchange-field">
                  <span>Condition</span>
                  <select value={exchangeCondition} onChange={(e) => setExchangeCondition(e.target.value as "Good" | "Average" | "Not working")}>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Not working">Not working</option>
                  </select>
                </label>
                <label className="pdp-exchange-field">
                  <span>Pincode</span>
                  <input value={exchangePincode} onChange={(e) => setExchangePincode(e.target.value)} inputMode="numeric" placeholder="6-digit pincode" />
                </label>

                <div className="pdp-exchange-estimate">
                  <strong>Estimated value:</strong> {formatInr(exchangeEstimateInr)}
                  <p className="pdp-muted-inline">Final value is confirmed at pickup.</p>
                </div>
              </div>
            </div>
            <div className="plp-drawer-foot">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  setAppliedExchangeInr(exchangeEstimateInr);
                  setIsExchangeSheetOpen(false);
                }}
              >
                Apply exchange
              </button>
            </div>
          </div>
          <button type="button" className="plp-drawer-scrim" onClick={() => setIsExchangeSheetOpen(false)} aria-label="Close exchange" />
        </div>
      ) : null}
    </div>
  );
}
