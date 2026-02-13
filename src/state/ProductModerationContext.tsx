import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ACTIVE_VENDOR_ID } from "./VendorLifecycleContext";

export type ProductModerationStatus = "Under Review" | "Live" | "Rejected";
export type ProductPricingFlag = "OK" | "Violation" | "Exception Requested";
export type PriceExceptionStatus = "None" | "Requested" | "Approved" | "Rejected";
export type PriceExceptionJustification =
  | "Low stock"
  | "High demand"
  | "Logistics"
  | "Exclusivity";

export type ProductPricingBenchmarks = {
  amazonPriceInr: number;
  flipkartPriceInr: number;
  msrpInr: number;
};

export type ProductExceptionRequest = {
  status: PriceExceptionStatus;
  justification: string | null;
  requestedAtIso: string | null;
  adminReason: string | null;
  decidedAtIso: string | null;
};

export type ProductModerationRecord = {
  id: string;
  productName: string;
  brand: string;
  category: string;
  vendorId: string;
  vendorName: string;
  listedPriceInr: number;
  status: ProductModerationStatus;
  statusReason: string | null;
  submittedAtIso: string;
  updatedAtIso: string;
  description: string;
  keySpecifications: string[];
  benchmarks: ProductPricingBenchmarks;
  exceptionRequest: ProductExceptionRequest;
};

export type ProductPricingRuleResult = {
  isViolation: boolean;
  highestAllowedPriceInr: number;
  violationMessages: string[];
};

export type ProductAdminAuditActionType =
  | "Approval"
  | "Rejection"
  | "Exception Approval"
  | "Exception Rejection";

export type ProductAdminAuditEntry = {
  id: string;
  productId: string;
  actionType: ProductAdminAuditActionType;
  reason: string;
  createdAtIso: string;
};

type ProductMutationResult = {
  ok: boolean;
  message: string;
};

type ProductModerationContextValue = {
  products: ProductModerationRecord[];
  productAuditLog: ProductAdminAuditEntry[];
  getProductById: (productId: string) => ProductModerationRecord | undefined;
  getProductsByVendor: (vendorId: string) => ProductModerationRecord[];
  getProductPricingRuleResult: (productId: string) => ProductPricingRuleResult;
  getProductPricingFlag: (productId: string) => ProductPricingFlag;
  getProductAuditLog: (productId: string) => ProductAdminAuditEntry[];
  approveProduct: (productId: string) => ProductMutationResult;
  rejectProduct: (productId: string, reason: string) => ProductMutationResult;
  requestPriceException: (
    productId: string,
    justification: PriceExceptionJustification,
  ) => ProductMutationResult;
  approvePriceException: (
    productId: string,
    reason: string,
  ) => ProductMutationResult;
  rejectPriceException: (
    productId: string,
    reason: string,
  ) => ProductMutationResult;
};

const SEEDED_PRODUCTS: ProductModerationRecord[] = [
  {
    id: "VPRD-100482",
    productName: "Galaxy A56 5G",
    brand: "Samsung",
    category: "Mobiles",
    vendorId: ACTIVE_VENDOR_ID,
    vendorName: "Astra Retail LLP",
    listedPriceInr: 26999,
    status: "Under Review",
    statusReason: null,
    submittedAtIso: "2026-02-11T10:20:00.000Z",
    updatedAtIso: "2026-02-11T10:20:00.000Z",
    description:
      "Mid-premium 5G smartphone with AMOLED display and all-day battery backup.",
    keySpecifications: ["8 GB RAM", "128 GB Storage", "5000 mAh Battery", "50 MP Camera"],
    benchmarks: {
      amazonPriceInr: 25999,
      flipkartPriceInr: 26499,
      msrpInr: 27999,
    },
    exceptionRequest: {
      status: "Requested",
      justification: "High demand",
      requestedAtIso: "2026-02-12T09:10:00.000Z",
      adminReason: null,
      decidedAtIso: null,
    },
  },
  {
    id: "VPRD-100221",
    productName: "Buds Lite ANC",
    brand: "OnePlus",
    category: "Accessories",
    vendorId: ACTIVE_VENDOR_ID,
    vendorName: "Astra Retail LLP",
    listedPriceInr: 2799,
    status: "Live",
    statusReason: null,
    submittedAtIso: "2026-02-08T07:30:00.000Z",
    updatedAtIso: "2026-02-10T07:45:00.000Z",
    description: "Wireless earbuds with ANC support and fast pairing.",
    keySpecifications: ["Bluetooth 5.3", "38 Hours Playback", "Dual Mic ENC"],
    benchmarks: {
      amazonPriceInr: 2999,
      flipkartPriceInr: 2899,
      msrpInr: 3299,
    },
    exceptionRequest: {
      status: "None",
      justification: null,
      requestedAtIso: null,
      adminReason: null,
      decidedAtIso: null,
    },
  },
  {
    id: "VPRD-220118",
    productName: "NovaBook 14",
    brand: "Nova",
    category: "Laptops",
    vendorId: "VND-1002",
    vendorName: "Nova Digital Hub",
    listedPriceInr: 64999,
    status: "Under Review",
    statusReason: null,
    submittedAtIso: "2026-02-09T11:00:00.000Z",
    updatedAtIso: "2026-02-09T11:00:00.000Z",
    description: "Thin-and-light laptop tuned for productivity and travel use.",
    keySpecifications: ["16 GB RAM", "512 GB SSD", "Intel Core i5", "14-inch Display"],
    benchmarks: {
      amazonPriceInr: 63999,
      flipkartPriceInr: 62999,
      msrpInr: 67999,
    },
    exceptionRequest: {
      status: "None",
      justification: null,
      requestedAtIso: null,
      adminReason: null,
      decidedAtIso: null,
    },
  },
  {
    id: "VPRD-120930",
    productName: "Astra Camera Drone Mini",
    brand: "Astra",
    category: "Accessories",
    vendorId: ACTIVE_VENDOR_ID,
    vendorName: "Astra Retail LLP",
    listedPriceInr: 45999,
    status: "Live",
    statusReason: "Live after approved price exception.",
    submittedAtIso: "2026-02-03T06:10:00.000Z",
    updatedAtIso: "2026-02-05T08:30:00.000Z",
    description:
      "Compact camera drone with 4K stabilization for travel creators.",
    keySpecifications: ["4K Video", "3-Axis Gimbal", "28 Min Flight Time"],
    benchmarks: {
      amazonPriceInr: 42999,
      flipkartPriceInr: 41999,
      msrpInr: 46999,
    },
    exceptionRequest: {
      status: "Approved",
      justification: "Exclusivity",
      requestedAtIso: "2026-02-04T10:00:00.000Z",
      adminReason: "Exclusive launch inventory with bundled accessories verified.",
      decidedAtIso: "2026-02-05T08:00:00.000Z",
    },
  },
];

const SEEDED_PRODUCT_AUDIT_LOG: ProductAdminAuditEntry[] = [
  {
    id: "PLOG-101",
    productId: "VPRD-120930",
    actionType: "Exception Approval",
    reason: "Exclusive launch inventory with bundled accessories verified.",
    createdAtIso: "2026-02-05T08:00:00.000Z",
  },
  {
    id: "PLOG-102",
    productId: "VPRD-120930",
    actionType: "Approval",
    reason: "Product approved after exception review.",
    createdAtIso: "2026-02-05T08:30:00.000Z",
  },
];

const ProductModerationContext = createContext<ProductModerationContextValue | null>(
  null,
);

function createAuditLogId() {
  return `PLOG-${Math.floor(100000 + Math.random() * 900000)}`;
}

function evaluatePricingRule(
  product: ProductModerationRecord,
): ProductPricingRuleResult {
  const violationMessages: string[] = [];

  if (product.listedPriceInr > product.benchmarks.amazonPriceInr) {
    violationMessages.push(
      `Listed price exceeds Amazon benchmark (${product.benchmarks.amazonPriceInr}).`,
    );
  }
  if (product.listedPriceInr > product.benchmarks.flipkartPriceInr) {
    violationMessages.push(
      `Listed price exceeds Flipkart benchmark (${product.benchmarks.flipkartPriceInr}).`,
    );
  }
  if (product.listedPriceInr > product.benchmarks.msrpInr) {
    violationMessages.push(`Listed price exceeds MSRP (${product.benchmarks.msrpInr}).`);
  }

  return {
    isViolation: violationMessages.length > 0,
    highestAllowedPriceInr: Math.min(
      product.benchmarks.amazonPriceInr,
      product.benchmarks.flipkartPriceInr,
      product.benchmarks.msrpInr,
    ),
    violationMessages,
  };
}

function getPricingFlagForProduct(product: ProductModerationRecord): ProductPricingFlag {
  if (product.exceptionRequest.status === "Requested") {
    return "Exception Requested";
  }

  const pricingRuleResult = evaluatePricingRule(product);
  if (pricingRuleResult.isViolation && product.exceptionRequest.status !== "Approved") {
    return "Violation";
  }

  return "OK";
}

export function ProductModerationProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<ProductModerationRecord[]>(SEEDED_PRODUCTS);
  const [productAuditLog, setProductAuditLog] = useState<ProductAdminAuditEntry[]>(
    SEEDED_PRODUCT_AUDIT_LOG,
  );

  function getProductById(productId: string) {
    return products.find((product) => product.id === productId);
  }

  function getProductsByVendor(vendorId: string) {
    return products.filter((product) => product.vendorId === vendorId);
  }

  function getProductPricingRuleResult(productId: string): ProductPricingRuleResult {
    const targetProduct = getProductById(productId);
    if (!targetProduct) {
      return {
        isViolation: false,
        highestAllowedPriceInr: 0,
        violationMessages: ["Product not found."],
      };
    }
    return evaluatePricingRule(targetProduct);
  }

  function getProductPricingFlag(productId: string): ProductPricingFlag {
    const targetProduct = getProductById(productId);
    if (!targetProduct) {
      return "Violation";
    }
    return getPricingFlagForProduct(targetProduct);
  }

  function getProductAuditLog(productId: string) {
    return productAuditLog
      .filter((entry) => entry.productId === productId)
      .sort(
        (first, second) =>
          new Date(second.createdAtIso).getTime() -
          new Date(first.createdAtIso).getTime(),
      );
  }

  function addAuditLog(
    productId: string,
    actionType: ProductAdminAuditActionType,
    reason: string,
  ) {
    const nowIso = new Date().toISOString();
    setProductAuditLog((currentEntries) => [
      {
        id: createAuditLogId(),
        productId,
        actionType,
        reason,
        createdAtIso: nowIso,
      },
      ...currentEntries,
    ]);
  }

  function approveProduct(productId: string): ProductMutationResult {
    const targetProduct = getProductById(productId);
    if (!targetProduct) {
      return { ok: false, message: "Product not found." };
    }

    const pricingRuleResult = evaluatePricingRule(targetProduct);
    if (
      pricingRuleResult.isViolation &&
      targetProduct.exceptionRequest.status !== "Approved"
    ) {
      return {
        ok: false,
        message: `Approval blocked: ${pricingRuleResult.violationMessages.join(" ")}`,
      };
    }

    const nowIso = new Date().toISOString();
    const approvalReason =
      targetProduct.exceptionRequest.status === "Approved"
        ? "Product approved after price exception approval."
        : "Product approved after pricing and catalog review.";

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              status: "Live",
              statusReason: null,
              updatedAtIso: nowIso,
            }
          : product,
      ),
    );
    addAuditLog(productId, "Approval", approvalReason);

    return { ok: true, message: "Product moved to Live." };
  }

  function rejectProduct(productId: string, reason: string): ProductMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Rejection reason is required." };
    }

    const targetProduct = getProductById(productId);
    if (!targetProduct) {
      return { ok: false, message: "Product not found." };
    }

    const nowIso = new Date().toISOString();
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              status: "Rejected",
              statusReason: trimmedReason,
              updatedAtIso: nowIso,
            }
          : product,
      ),
    );
    addAuditLog(productId, "Rejection", trimmedReason);

    return { ok: true, message: "Product rejected with reason." };
  }

  function requestPriceException(
    productId: string,
    justification: PriceExceptionJustification,
  ): ProductMutationResult {
    const targetProduct = getProductById(productId);
    if (!targetProduct) {
      return { ok: false, message: "Product not found." };
    }

    if (targetProduct.exceptionRequest.status === "Requested") {
      return { ok: false, message: "Exception request is already pending review." };
    }

    const pricingRuleResult = evaluatePricingRule(targetProduct);
    if (!pricingRuleResult.isViolation) {
      return {
        ok: false,
        message: "Exception request is allowed only for pricing rule violations.",
      };
    }

    const nowIso = new Date().toISOString();
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              updatedAtIso: nowIso,
              exceptionRequest: {
                status: "Requested",
                justification,
                requestedAtIso: nowIso,
                adminReason: null,
                decidedAtIso: null,
              },
            }
          : product,
      ),
    );

    return { ok: true, message: "Price exception request submitted to admin." };
  }

  function approvePriceException(
    productId: string,
    reason: string,
  ): ProductMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required to approve an exception." };
    }

    const targetProduct = getProductById(productId);
    if (!targetProduct) {
      return { ok: false, message: "Product not found." };
    }
    if (targetProduct.exceptionRequest.status !== "Requested") {
      return { ok: false, message: "No pending exception request for this product." };
    }

    const nowIso = new Date().toISOString();
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              updatedAtIso: nowIso,
              exceptionRequest: {
                ...product.exceptionRequest,
                status: "Approved",
                adminReason: trimmedReason,
                decidedAtIso: nowIso,
              },
            }
          : product,
      ),
    );
    addAuditLog(productId, "Exception Approval", trimmedReason);

    return { ok: true, message: "Price exception approved." };
  }

  function rejectPriceException(
    productId: string,
    reason: string,
  ): ProductMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required to reject an exception." };
    }

    const targetProduct = getProductById(productId);
    if (!targetProduct) {
      return { ok: false, message: "Product not found." };
    }
    if (targetProduct.exceptionRequest.status !== "Requested") {
      return { ok: false, message: "No pending exception request for this product." };
    }

    const pricingRuleResult = evaluatePricingRule(targetProduct);
    const nowIso = new Date().toISOString();
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              status:
                pricingRuleResult.isViolation && product.status !== "Rejected"
                  ? "Under Review"
                  : product.status,
              statusReason:
                pricingRuleResult.isViolation && product.status !== "Rejected"
                  ? "Price exception rejected. Adjust pricing or await review."
                  : product.statusReason,
              updatedAtIso: nowIso,
              exceptionRequest: {
                ...product.exceptionRequest,
                status: "Rejected",
                adminReason: trimmedReason,
                decidedAtIso: nowIso,
              },
            }
          : product,
      ),
    );
    addAuditLog(productId, "Exception Rejection", trimmedReason);

    return { ok: true, message: "Price exception rejected and pricing rule enforced." };
  }

  const value = useMemo<ProductModerationContextValue>(
    () => ({
      products,
      productAuditLog,
      getProductById,
      getProductsByVendor,
      getProductPricingRuleResult,
      getProductPricingFlag,
      getProductAuditLog,
      approveProduct,
      rejectProduct,
      requestPriceException,
      approvePriceException,
      rejectPriceException,
    }),
    [products, productAuditLog],
  );

  return (
    <ProductModerationContext.Provider value={value}>
      {children}
    </ProductModerationContext.Provider>
  );
}

export function useProductModeration() {
  const context = useContext(ProductModerationContext);
  if (!context) {
    throw new Error(
      "useProductModeration must be used within ProductModerationProvider.",
    );
  }
  return context;
}
