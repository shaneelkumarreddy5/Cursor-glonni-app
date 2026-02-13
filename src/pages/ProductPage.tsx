import { useState } from "react";
import { PageIntro } from "../components/ui/PageIntro";
import { bankOffers, catalogProducts } from "../data/mockCatalog";
import { formatInr } from "../utils/currency";

type VendorOption = {
  id: string;
  name: string;
  priceInr: number;
  cashbackInr: number;
  deliveryEstimate: string;
  vendorOffer: string;
  couponCode?: string;
  freebie?: string;
};

const vendorOptions: VendorOption[] = [
  {
    id: "v-1",
    name: "Nova Retail Hub",
    priceInr: 71999,
    cashbackInr: 1300,
    deliveryEstimate: "Delivery by Monday, 16 Feb",
    vendorOffer: "Extra ₹1,000 off on prepaid orders above ₹70,000.",
    couponCode: "NOVA1000",
    freebie: "Free Type-C cable",
  },
  {
    id: "v-2",
    name: "City Electronics Store",
    priceInr: 72499,
    cashbackInr: 1300,
    deliveryEstimate: "Delivery by Tuesday, 17 Feb",
    vendorOffer: "Free screen guard and setup assistance.",
    freebie: "Premium screen guard",
  },
  {
    id: "v-3",
    name: "Glonni Verified Seller",
    priceInr: 72999,
    cashbackInr: 1450,
    deliveryEstimate: "Delivery by Monday, 16 Feb",
    vendorOffer: "Bundle offer with 25W adapter at ₹499.",
    couponCode: "BUNDLE499",
  },
];

export function ProductPage() {
  const featuredProduct = catalogProducts[0];
  const [selectedVendorId, setSelectedVendorId] = useState(vendorOptions[0].id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const selectedVendor =
    vendorOptions.find((vendor) => vendor.id === selectedVendorId) ?? vendorOptions[0];
  const galleryImages = [
    featuredProduct.imageUrl,
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
  ];

  return (
    <div className="stack pdp-page">
      <PageIntro
        badge="Product details"
        title={featuredProduct.name}
        description="Compare verified sellers, review offers, and choose the best final value before checkout."
      />

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
            <strong>{formatInr(selectedVendor.priceInr)}</strong>
            <span className="pdp-mrp">{formatInr(featuredProduct.mrpInr)}</span>
          </div>
          <p className="pdp-cashback-line">
            Cashback: <strong>{formatInr(selectedVendor.cashbackInr)}</strong> (credited by Glonni
            after successful delivery)
          </p>
          <p className="pdp-delivery-line">{selectedVendor.deliveryEstimate}</p>

          <div className="inline-actions">
            <button type="button" className="btn btn-primary">
              Buy now
            </button>
            <button type="button" className="btn btn-secondary">
              Add to cart
            </button>
          </div>

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
                  onChange={() => setSelectedVendorId(vendor.id)}
                />
                <div>
                  <h3>{vendor.name}</h3>
                  <p>{formatInr(vendor.priceInr)}</p>
                  <p>{vendor.vendorOffer}</p>
                  {vendor.couponCode ? <p>Coupon: {vendor.couponCode}</p> : null}
                  {vendor.freebie ? <p>Freebie: {vendor.freebie}</p> : null}
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
