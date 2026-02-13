import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { formatInr } from "../utils/currency";

export type VendorStatus = "Under Scrutiny" | "Approved" | "Rejected";
export type VendorProductStatus = "Draft" | "Under Review" | "Live" | "Rejected";
export type VendorProductExtraOfferType = "Freebie" | "Discount" | "Coupon";

type VendorSummaryMetrics = {
  totalOrders: number;
  pendingOrders: number;
  activeProducts: number;
  pendingSettlementInr: number;
};

type VendorLoginResult = {
  ok: boolean;
  message: string;
};

type VendorOnboardingResult = {
  ok: boolean;
  message: string;
};

type VendorProductMutationResult = {
  ok: boolean;
  message: string;
};

export type VendorOnboardingData = {
  businessName: string;
  ownerName: string;
  phone: string;
  gstNumber: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankName: string;
  businessAddress: string;
  documents: string[];
};

export type VendorProductSpecification = {
  key: string;
  value: string;
};

export type VendorProductExtraOffer = {
  type: VendorProductExtraOfferType;
  value: string;
};

export type VendorProductPayload = {
  category: "Mobiles" | "Laptops" | "Accessories" | "Footwear";
  brand: string;
  productName: string;
  images: string[];
  priceInr: number;
  stockQuantity: number;
  specifications: VendorProductSpecification[];
  extraOffers: VendorProductExtraOffer[];
};

export type VendorProduct = VendorProductPayload & {
  id: string;
  status: VendorProductStatus;
  rejectionReason: string | null;
  updatedAtIso: string;
};

type VendorContextValue = {
  isLoggedIn: boolean;
  vendorName: string;
  vendorStatus: VendorStatus;
  canPublishProducts: boolean;
  onboardingData: VendorOnboardingData | null;
  hasCompletedOnboarding: boolean;
  summaryMetrics: VendorSummaryMetrics;
  vendorProducts: VendorProduct[];
  loginVendor: (email: string, password: string) => VendorLoginResult;
  submitOnboarding: (
    payload: VendorOnboardingData,
  ) => VendorOnboardingResult;
  addVendorProduct: (
    payload: VendorProductPayload,
  ) => VendorProductMutationResult;
  updateVendorProduct: (
    productId: string,
    payload: VendorProductPayload,
  ) => VendorProductMutationResult;
  approveVendorProduct: (productId: string) => VendorProductMutationResult;
  rejectVendorProduct: (
    productId: string,
    reason: string,
  ) => VendorProductMutationResult;
  approveVendor: () => void;
  logoutVendor: () => void;
  setVendorStatus: (status: VendorStatus) => void;
};

const MOCK_VENDOR_NAME = "Astra Retail LLP";
const MOCK_VENDOR_SUMMARY_BASE = {
  totalOrders: 284,
  pendingOrders: 19,
  pendingSettlementInr: 125430,
};

const CATEGORY_PRICE_BENCHMARKS: Record<
  VendorProductPayload["category"],
  { min: number; max: number }
> = {
  Mobiles: { min: 3000, max: 180000 },
  Laptops: { min: 15000, max: 300000 },
  Accessories: { min: 100, max: 50000 },
  Footwear: { min: 300, max: 30000 },
};

function createVendorProductId() {
  return `VPRD-${Math.floor(100000 + Math.random() * 900000)}`;
}

function normalizeSpecifications(specifications: VendorProductSpecification[]) {
  return specifications
    .map((specification) => ({
      key: specification.key.trim(),
      value: specification.value.trim(),
    }))
    .filter((specification) => specification.key && specification.value);
}

function normalizeExtraOffers(extraOffers: VendorProductExtraOffer[]) {
  return extraOffers
    .map((extraOffer) => ({
      type: extraOffer.type,
      value: extraOffer.value.trim(),
    }))
    .filter((extraOffer) => extraOffer.value);
}

function createSeedVendorProducts(): VendorProduct[] {
  const nowIso = new Date().toISOString();
  return [
    {
      id: "VPRD-100221",
      category: "Accessories",
      brand: "OnePlus",
      productName: "Buds Lite ANC",
      images: ["buds-lite-front.png", "buds-lite-case.png"],
      priceInr: 2999,
      stockQuantity: 120,
      specifications: [
        { key: "Playback", value: "38 Hours" },
        { key: "Bluetooth", value: "5.3" },
      ],
      extraOffers: [{ type: "Coupon", value: "Apply BUDS150 at checkout" }],
      status: "Draft",
      rejectionReason: null,
      updatedAtIso: nowIso,
    },
    {
      id: "VPRD-100482",
      category: "Mobiles",
      brand: "Samsung",
      productName: "Galaxy A56 5G",
      images: ["a56-front.png", "a56-back.png"],
      priceInr: 26999,
      stockQuantity: 42,
      specifications: [
        { key: "RAM", value: "8 GB" },
        { key: "Storage", value: "128 GB" },
      ],
      extraOffers: [{ type: "Freebie", value: "Include protective case" }],
      status: "Under Review",
      rejectionReason: null,
      updatedAtIso: nowIso,
    },
    {
      id: "VPRD-100915",
      category: "Footwear",
      brand: "Adidas",
      productName: "Adidas Runstep Pro",
      images: ["runstep-top.png", "runstep-side.png"],
      priceInr: 4299,
      stockQuantity: 210,
      specifications: [
        { key: "Upper", value: "Engineered mesh" },
        { key: "Use Case", value: "Daily running" },
      ],
      extraOffers: [{ type: "Discount", value: "₹300 off launch offer" }],
      status: "Live",
      rejectionReason: null,
      updatedAtIso: nowIso,
    },
    {
      id: "VPRD-101071",
      category: "Laptops",
      brand: "Astra Compute",
      productName: "AstraBook Air 14",
      images: ["astrabook-open.png"],
      priceInr: 12999,
      stockQuantity: 15,
      specifications: [
        { key: "RAM", value: "16 GB" },
        { key: "Storage", value: "512 GB SSD" },
      ],
      extraOffers: [{ type: "Freebie", value: "Laptop sleeve included" }],
      status: "Rejected",
      rejectionReason: "Benchmark mismatch: listed price is too low for category.",
      updatedAtIso: nowIso,
    },
  ];
}

function getBenchmarkValidationError(payload: VendorProductPayload) {
  const benchmark = CATEGORY_PRICE_BENCHMARKS[payload.category];
  if (!benchmark) {
    return null;
  }

  if (payload.priceInr < benchmark.min || payload.priceInr > benchmark.max) {
    return `Price benchmark check failed for ${payload.category}. Allowed range is ${formatInr(
      benchmark.min,
    )} to ${formatInr(benchmark.max)}.`;
  }

  return null;
}

function getPayloadValidationError(payload: VendorProductPayload) {
  if (!payload.productName.trim()) {
    return "Product name is required.";
  }

  if (!payload.brand.trim()) {
    return "Brand is required.";
  }

  if (payload.images.length === 0) {
    return "Add at least one product image (mock).";
  }

  if (payload.priceInr <= 0) {
    return "Price must be greater than ₹0.";
  }

  if (payload.stockQuantity < 0) {
    return "Stock quantity cannot be negative.";
  }

  const normalizedSpecifications = normalizeSpecifications(payload.specifications);
  if (normalizedSpecifications.length === 0) {
    return "Add at least one valid specification key-value pair.";
  }

  return getBenchmarkValidationError(payload);
}

const VendorContext = createContext<VendorContextValue | null>(null);

export function VendorProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<VendorStatus>("Under Scrutiny");
  const [onboardingData, setOnboardingData] = useState<VendorOnboardingData | null>(
    null,
  );
  const [vendorProducts, setVendorProducts] =
    useState<VendorProduct[]>(createSeedVendorProducts);

  function loginVendor(email: string, password: string): VendorLoginResult {
    if (!email.trim() || !password.trim()) {
      return { ok: false, message: "Enter email and password to continue." };
    }

    setIsLoggedIn(true);
    return { ok: true, message: "Mock login successful." };
  }

  function logoutVendor() {
    setIsLoggedIn(false);
  }

  function submitOnboarding(payload: VendorOnboardingData): VendorOnboardingResult {
    if (
      !payload.businessName.trim() ||
      !payload.ownerName.trim() ||
      !payload.phone.trim() ||
      !payload.bankAccountHolderName.trim() ||
      !payload.bankAccountNumber.trim() ||
      !payload.bankIfscCode.trim() ||
      !payload.bankName.trim() ||
      !payload.businessAddress.trim()
    ) {
      return {
        ok: false,
        message: "Please complete all mandatory onboarding fields.",
      };
    }

    setOnboardingData(payload);
    setVendorStatus("Under Scrutiny");

    return {
      ok: true,
      message:
        "Onboarding submitted. Your profile is now under scrutiny for approval.",
    };
  }

  function addVendorProduct(payload: VendorProductPayload): VendorProductMutationResult {
    if (vendorStatus !== "Approved") {
      return {
        ok: false,
        message: "Vendor must be Approved before adding products.",
      };
    }

    const validationError = getPayloadValidationError(payload);
    if (validationError) {
      return { ok: false, message: validationError };
    }

    const nowIso = new Date().toISOString();
    const nextProduct: VendorProduct = {
      id: createVendorProductId(),
      category: payload.category,
      brand: payload.brand.trim(),
      productName: payload.productName.trim(),
      images: payload.images,
      priceInr: payload.priceInr,
      stockQuantity: payload.stockQuantity,
      specifications: normalizeSpecifications(payload.specifications),
      extraOffers: normalizeExtraOffers(payload.extraOffers),
      status: "Under Review",
      rejectionReason: null,
      updatedAtIso: nowIso,
    };

    setVendorProducts((currentProducts) => [nextProduct, ...currentProducts]);
    return { ok: true, message: "Product submitted and moved to Under Review." };
  }

  function updateVendorProduct(
    productId: string,
    payload: VendorProductPayload,
  ): VendorProductMutationResult {
    const targetProduct = vendorProducts.find((product) => product.id === productId);
    if (!targetProduct) {
      return { ok: false, message: "Product not found." };
    }

    if (targetProduct.status === "Live") {
      return { ok: false, message: "Live products cannot be edited." };
    }

    const validationError = getPayloadValidationError(payload);
    if (validationError) {
      return { ok: false, message: validationError };
    }

    const nowIso = new Date().toISOString();
    const updatedProduct: VendorProduct = {
      ...targetProduct,
      category: payload.category,
      brand: payload.brand.trim(),
      productName: payload.productName.trim(),
      images: payload.images,
      priceInr: payload.priceInr,
      stockQuantity: payload.stockQuantity,
      specifications: normalizeSpecifications(payload.specifications),
      extraOffers: normalizeExtraOffers(payload.extraOffers),
      updatedAtIso: nowIso,
    };

    setVendorProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId ? updatedProduct : product,
      ),
    );
    return { ok: true, message: "Product updated successfully." };
  }

  function approveVendorProduct(productId: string): VendorProductMutationResult {
    const targetProduct = vendorProducts.find((product) => product.id === productId);
    if (!targetProduct) {
      return { ok: false, message: "Product not found." };
    }

    const nowIso = new Date().toISOString();
    setVendorProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              status: "Live",
              rejectionReason: null,
              updatedAtIso: nowIso,
            }
          : product,
      ),
    );
    return { ok: true, message: "Product approved and moved to Live." };
  }

  function rejectVendorProduct(
    productId: string,
    reason: string,
  ): VendorProductMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Rejection reason is required." };
    }

    const targetProduct = vendorProducts.find((product) => product.id === productId);
    if (!targetProduct) {
      return { ok: false, message: "Product not found." };
    }

    const nowIso = new Date().toISOString();
    setVendorProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              status: "Rejected",
              rejectionReason: trimmedReason,
              updatedAtIso: nowIso,
            }
          : product,
      ),
    );
    return { ok: true, message: "Product rejected with reason." };
  }

  function approveVendor() {
    setVendorStatus("Approved");
  }

  const summaryMetrics = useMemo<VendorSummaryMetrics>(() => {
    const activeProducts = vendorProducts.filter(
      (product) => product.status === "Live",
    ).length;

    return {
      totalOrders: MOCK_VENDOR_SUMMARY_BASE.totalOrders,
      pendingOrders: MOCK_VENDOR_SUMMARY_BASE.pendingOrders,
      activeProducts,
      pendingSettlementInr: MOCK_VENDOR_SUMMARY_BASE.pendingSettlementInr,
    };
  }, [vendorProducts]);

  const value = useMemo<VendorContextValue>(
    () => ({
      isLoggedIn,
      vendorName: MOCK_VENDOR_NAME,
      vendorStatus,
      canPublishProducts: vendorStatus === "Approved",
      onboardingData,
      hasCompletedOnboarding: onboardingData !== null,
      summaryMetrics,
      vendorProducts,
      loginVendor,
      submitOnboarding,
      addVendorProduct,
      updateVendorProduct,
      approveVendorProduct,
      rejectVendorProduct,
      approveVendor,
      logoutVendor,
      setVendorStatus,
    }),
    [isLoggedIn, onboardingData, summaryMetrics, vendorProducts, vendorStatus],
  );

  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);

  if (!context) {
    throw new Error("useVendor must be used within VendorProvider.");
  }

  return context;
}
