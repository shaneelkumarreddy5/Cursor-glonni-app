import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageIntro } from "../components/ui/PageIntro";
import {
  getVendorOptionsForProduct,
  type ProductVendorExtraOffer,
} from "../data/mockCommerce";
import { bankOffers, catalogProducts } from "../data/mockCatalog";
import { ROUTES } from "../routes/paths";
import { useCommerce } from "../state/CommerceContext";
import { formatInr } from "../utils/currency";

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
              onClick={() => {
                addCurrentConfigurationToCart();
                navigate(ROUTES.checkout);
              }}
            >
              Buy now
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addCurrentConfigurationToCart}
            >
              Add to cart
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
    </div>
  );
}
