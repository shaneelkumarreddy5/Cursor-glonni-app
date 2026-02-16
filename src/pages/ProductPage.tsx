import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
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

  useEffect(() => {
    setSelectedVendorId(vendorOptions[0].id);
    setSelectedExtraOfferId(null);
    setSelectedImageIndex(0);
    setAddToCartMessage("");
  }, [vendorOptions]);

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
      <PageIntro
        badge="Product details"
        title={featuredProduct.name}
        description="Compare verified sellers, review offers, and choose the best final value before checkout."
        actions={
          <div className="inline-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <Link to={ROUTES.category} className="btn btn-secondary">
              Explore more products
            </Link>
          </div>
        }
      />
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

        <article className="card pdp-buy-card">
          <div className="pdp-meta-row">
            <div className="pdp-brand-header">
              <img src={featuredProduct.brandLogoUrl} alt={`${featuredProduct.brand} logo`} />
              <span>{featuredProduct.brand}</span>
            </div>
            <span className="pdp-rating">Rating {featuredProduct.rating.toFixed(1)}</span>
          </div>
          <h2>{featuredProduct.name}</h2>
          <p className="pdp-specs">{featuredProduct.keySpecs.join(" • ")}</p>

          <div className="pdp-price-box">
            <strong>{formatInr(finalPriceInr)}</strong>
            <span className="pdp-mrp">{formatInr(featuredProduct.mrpInr)}</span>
          </div>
          <p className="pdp-cashback-line">
            Cashback: <strong>{formatInr(finalCashbackInr)}</strong> (credited by Glonni
            after successful delivery)
          </p>
          <p className="pdp-delivery-line">{selectedVendor.deliveryEstimate}</p>

          <section className="stack-sm">
            <header className="section-header">
              <h2>Extra vendor offers</h2>
            </header>
            <div className="pdp-vendor-list">
              <label
                className={
                  selectedExtraOfferId === null
                    ? "pdp-vendor-option is-selected"
                    : "pdp-vendor-option"
                }
              >
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
                  className={
                    selectedExtraOfferId === extraOffer.id
                      ? "pdp-vendor-option is-selected"
                      : "pdp-vendor-option"
                  }
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

          <div className="inline-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={addCurrentConfigurationToCart}
            >
              Add to Cart
            </button>
          </div>
          {addToCartMessage ? <p className="pdp-delivery-line">{addToCartMessage}</p> : null}

          <div className="chip-row" aria-label="Shopping assurance">
            <span className="chip">7 day replacement</span>
            <span className="chip">Secure payment</span>
            <span className="chip">GST invoice available</span>
          </div>
        </article>
      </section>

      <section className="two-column pdp-lower-grid">
        <article className="card">
          <header className="section-header">
            <h2>Seller comparison</h2>
          </header>
          <div className="pdp-vendor-list">
            {vendorOptions.map((vendor) => (
              <label
                key={vendor.id}
                className={
                  selectedVendorId === vendor.id ? "pdp-vendor-option is-selected" : "pdp-vendor-option"
                }
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
                  <p>{formatInr(vendor.priceInr)}</p>
                  <p>{vendor.vendorOffer}</p>
                  <p>Cashback: {formatInr(vendor.cashbackInr)}</p>
                </div>
              </label>
            ))}
          </div>
        </article>

        <article className="card">
          <header className="section-header">
            <h2>Bank and payment offers</h2>
          </header>
          <div className="pdp-bank-offer-list">
            {bankOffers.map((offer) => (
              <article key={offer.bankName} className="pdp-bank-offer-card">
                <img src={offer.logoUrl} alt={`${offer.bankName} logo`} />
                <p>{offer.offerText}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="pdp-detail-grid">
        <article className="card">
          <header className="section-header">
            <h2>Description</h2>
          </header>
          <div className="stack-sm">
            <p>{productNarrative.fullDescription}</p>
            <ul className="bullet-list pdp-highlight-list">
              {productNarrative.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </article>

        <article className="card">
          <header className="section-header">
            <h2>Specifications</h2>
          </header>
          <div className="pdp-spec-table" role="table" aria-label="Product specifications">
            {productNarrative.specifications.map((spec) => (
              <div key={spec.label} className="pdp-spec-row" role="row">
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <header className="section-header">
            <h2>Terms & Conditions</h2>
          </header>
          <div className="stack-sm">
            <p>
              <strong>Vendor terms:</strong> {selectedVendor.vendorOffer}
            </p>
            <p>
              <strong>Platform purchase terms:</strong> Final pricing, cashback, and return
              eligibility are determined at checkout using selected seller, offer, and payment
              mode.
            </p>
            <p>
              Cashback is promotional and linked to successful order completion as per Glonni
              policy.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="section-header">
            <h2>Returns & Replacement</h2>
          </header>
          <div className="stack-sm">
            <p>
              <strong>Return window:</strong> {RETURN_WINDOW_DAYS} days from delivery date.
            </p>
            <p>
              <strong>Replacement eligibility:</strong> Replacement is supported for wrong,
              damaged, or defective products subject to seller verification.
            </p>
            <p>
              <strong>Non-returnable conditions:</strong>
            </p>
            <ul className="bullet-list">
              <li>Physical damage due to misuse or unauthorized repair.</li>
              <li>Missing accessories, manuals, or original packaging.</li>
              <li>Serial number mismatch or tampered product seal.</li>
            </ul>
          </div>
        </article>
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

      <section className="pdp-mobile-action-bar" aria-label="Quick purchase actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={addCurrentConfigurationToCart}
        >
          Add to Cart
        </button>
        <button type="button" className="btn btn-primary" onClick={handleBuyNow}>
          Buy Now
        </button>
      </section>
    </div>
  );
}
