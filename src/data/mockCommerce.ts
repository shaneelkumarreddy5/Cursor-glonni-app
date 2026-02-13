import { type CatalogProduct } from "./mockCatalog";

export type PaymentMethodId = "upi" | "card" | "netbanking" | "cod";

export type MockAddress = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string;
  cityStatePincode: string;
  phoneNumber: string;
};

export type ProductVendorExtraOffer = {
  id: string;
  title: string;
  description: string;
  priceAdjustmentInr: number;
  cashbackAdjustmentInr: number;
};

export type ProductVendorOption = {
  id: string;
  vendorCode: string;
  name: string;
  priceInr: number;
  cashbackInr: number;
  deliveryEstimate: string;
  vendorOffer: string;
  extraOffers: ProductVendorExtraOffer[];
};

type PaymentMethodOption = {
  id: PaymentMethodId;
  title: string;
  description: string;
};

type VendorBlueprint = {
  vendorCode: string;
  name: string;
  priceAdjustmentInr: number;
  cashbackAdjustmentInr: number;
  deliveryEstimate: string;
  vendorOffer: string;
  extraOffers: ProductVendorExtraOffer[];
};

const VENDOR_BLUEPRINTS: VendorBlueprint[] = [
  {
    vendorCode: "verified",
    name: "Glonni Verified Seller",
    priceAdjustmentInr: 0,
    cashbackAdjustmentInr: 120,
    deliveryEstimate: "Delivery by Monday, 16 Feb",
    vendorOffer: "Priority dispatch and verified invoice support.",
    extraOffers: [
      {
        id: "extra-prepaid",
        title: "Prepaid Advantage",
        description: "Get additional discount on prepaid checkout.",
        priceAdjustmentInr: -350,
        cashbackAdjustmentInr: 80,
      },
      {
        id: "extra-protect",
        title: "Screen Protection Bundle",
        description: "Add premium screen guard with cashback boost.",
        priceAdjustmentInr: 199,
        cashbackAdjustmentInr: 180,
      },
    ],
  },
  {
    vendorCode: "nova",
    name: "Nova Retail Hub",
    priceAdjustmentInr: 420,
    cashbackAdjustmentInr: 0,
    deliveryEstimate: "Delivery by Tuesday, 17 Feb",
    vendorOffer: "Festive coupon support on select categories.",
    extraOffers: [
      {
        id: "extra-coupon",
        title: "Vendor Coupon NOVA150",
        description: "Apply vendor coupon for direct cart discount.",
        priceAdjustmentInr: -150,
        cashbackAdjustmentInr: 0,
      },
    ],
  },
  {
    vendorCode: "city",
    name: "City Electronics Store",
    priceAdjustmentInr: 760,
    cashbackAdjustmentInr: 140,
    deliveryEstimate: "Delivery by Wednesday, 18 Feb",
    vendorOffer: "Store setup assistance included with purchase.",
    extraOffers: [],
  },
];

export const mockAddresses: MockAddress[] = [
  {
    id: "addr-home",
    label: "Home",
    fullName: "Rohit Sharma",
    line1: "Flat 903, Palm Residency",
    line2: "HSR Layout",
    cityStatePincode: "Bengaluru, Karnataka 560102",
    phoneNumber: "+91 98765 43210",
  },
  {
    id: "addr-office",
    label: "Office",
    fullName: "Rohit Sharma",
    line1: "Tower B, Bagmane Tech Park",
    line2: "CV Raman Nagar",
    cityStatePincode: "Bengaluru, Karnataka 560093",
    phoneNumber: "+91 99887 66554",
  },
  {
    id: "addr-family",
    label: "Family",
    fullName: "Rohit Sharma",
    line1: "21 MG Road",
    line2: "Camp Area",
    cityStatePincode: "Pune, Maharashtra 411001",
    phoneNumber: "+91 91234 54321",
  },
];

export const paymentMethodOptions: PaymentMethodOption[] = [
  {
    id: "upi",
    title: "UPI",
    description: "Pay instantly via UPI apps",
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Saved cards and EMI options",
  },
  {
    id: "netbanking",
    title: "Net Banking",
    description: "Supported by major Indian banks",
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Available on selected pincodes",
  },
];

export function getVendorOptionsForProduct(product: CatalogProduct): ProductVendorOption[] {
  return VENDOR_BLUEPRINTS.map((vendor) => {
    const computedPrice = Math.max(99, product.priceInr + vendor.priceAdjustmentInr);
    const computedCashback = Math.max(0, product.cashbackInr + vendor.cashbackAdjustmentInr);

    return {
      id: `${product.id}-${vendor.vendorCode}`,
      vendorCode: vendor.vendorCode,
      name: vendor.name,
      priceInr: computedPrice,
      cashbackInr: computedCashback,
      deliveryEstimate: vendor.deliveryEstimate,
      vendorOffer: vendor.vendorOffer,
      extraOffers: vendor.extraOffers,
    };
  }).sort((first, second) => first.priceInr - second.priceInr);
}
