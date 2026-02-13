import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ACTIVE_VENDOR_ID,
  type VendorLifecycleStatus,
  useVendorLifecycle,
} from "../state/VendorLifecycleContext";
import {
  type AdPricingSlab,
  useAdMonetization,
} from "../state/AdMonetizationContext";
import { formatInr } from "../utils/currency";

export type VendorStatus = VendorLifecycleStatus;
export type VendorProductStatus = "Draft" | "Under Review" | "Live" | "Rejected";
export type VendorProductExtraOfferType = "Freebie" | "Discount" | "Coupon";
export type VendorOrderStatus = "New" | "Packed" | "Shipped" | "Delivered";
export type VendorOrderVisibilityState = "None" | "Cancelled" | "Return Requested";
export type VendorReturnCaseStatus =
  | "Return Requested"
  | "Pickup Pending"
  | "Received at Hub"
  | "Refund Adjusted";
export type VendorRtoResolutionStatus =
  | "Charge Applied"
  | "Under Review"
  | "Reversed";

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

type VendorOrderMutationResult = {
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

export type VendorOrder = {
  id: string;
  productName: string;
  quantity: number;
  amountInr: number;
  customerAddressMasked: string;
  paymentMethod: "COD" | "Online";
  status: VendorOrderStatus;
  visibilityState: VendorOrderVisibilityState;
  returnWindowClosed: boolean;
  noReturnSelected: boolean;
  updatedAtIso: string;
};

export type VendorReturnCase = {
  id: string;
  orderId: string;
  productName: string;
  reason: string;
  status: VendorReturnCaseStatus;
  updatedAtIso: string;
};

export type VendorRtoCase = {
  id: string;
  orderId: string;
  productName: string;
  courierIssue: string;
  rtoChargeInr: number;
  resolutionStatus: VendorRtoResolutionStatus;
  updatedAtIso: string;
};

export type VendorAdType = "Sponsored Product" | "Sponsored Category";
export type VendorAdStatus = "Pending" | "Active" | "Paused" | "Expired";

export type VendorAdPricingSlab = {
  adType: VendorAdType;
  dailyPriceInr: number;
  minimumDurationDays: number;
  updatedAtIso: string;
};

export type VendorAd = {
  id: string;
  type: VendorAdType;
  productId: string | null;
  productName: string | null;
  category: VendorProductPayload["category"] | null;
  durationDays: number;
  budgetInr: number;
  fixedPriceInr: number;
  perDayRateInr: number;
  startedAtIso: string | null;
  endDateIso: string | null;
  status: VendorAdStatus;
  latestAdminActionLabel: string | null;
  latestAdminReason: string | null;
  latestAdminActionAtIso: string | null;
};

export type VendorAdPayload = {
  type: VendorAdType;
  productId: string | null;
  category: VendorProductPayload["category"] | null;
  durationDays: number;
  budgetInr: number;
};

export type VendorBankDetails = {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  updatedAtIso: string;
};

export type VendorBankDetailsInput = Omit<VendorBankDetails, "updatedAtIso">;
export type VendorBankDetailsReviewStatus = "Verified" | "Under Review";

export type VendorNotificationPreferences = {
  orderUpdates: boolean;
  settlementUpdates: boolean;
  adsUpdates: boolean;
  policyUpdates: boolean;
};

export type VendorSupportTicketCategory =
  | "Orders"
  | "Payments"
  | "Returns"
  | "Ads"
  | "Account";
export type VendorSupportTicketStatus =
  | "Open"
  | "In Review"
  | "Resolved"
  | "Closed";

export type VendorSupportMessageSender = "Vendor" | "Admin";

export type VendorSupportMessage = {
  id: string;
  sender: VendorSupportMessageSender;
  message: string;
  createdAtIso: string;
  isReadByVendor: boolean;
};

export type VendorSupportTicket = {
  id: string;
  category: VendorSupportTicketCategory;
  subject: string;
  description: string;
  orderId: string | null;
  status: VendorSupportTicketStatus;
  thread: VendorSupportMessage[];
  createdAtIso: string;
  updatedAtIso: string;
};

export type VendorSupportTicketPayload = {
  category: VendorSupportTicketCategory;
  subject: string;
  description: string;
  orderId: string | null;
};

export type VendorWalletEntryStatus = "Pending" | "Available" | "Adjusted";

export type VendorWalletEntry = {
  id: string;
  orderId: string;
  productName: string;
  amountInr: number;
  status: VendorWalletEntryStatus;
  note: string;
  updatedAtIso: string;
};

type VendorWalletAdjustment = {
  id: string;
  orderId: string;
  productName: string;
  amountInr: number;
  reason: "Cancelled" | "Return Requested" | "RTO";
  linkedReturnCaseId: string | null;
  linkedRtoCaseId: string | null;
  createdAtIso: string;
  reversalDueAtIso: string;
  reversalCreated: boolean;
  reversalCreatedAtIso: string | null;
};

type VendorWalletSummary = {
  pendingInr: number;
  availableInr: number;
  adjustmentsInr: number;
};

type VendorAdMutationResult = {
  ok: boolean;
  message: string;
};

type VendorSettingsMutationResult = {
  ok: boolean;
  message: string;
};

type VendorSupportTicketMutationResult = {
  ok: boolean;
  message: string;
};

type VendorContextValue = {
  isLoggedIn: boolean;
  vendorName: string;
  vendorStatus: VendorStatus;
  vendorStatusReason: string | null;
  canPublishProducts: boolean;
  onboardingData: VendorOnboardingData | null;
  hasCompletedOnboarding: boolean;
  summaryMetrics: VendorSummaryMetrics;
  vendorProducts: VendorProduct[];
  vendorOrders: VendorOrder[];
  vendorReturnCases: VendorReturnCase[];
  vendorRtoCases: VendorRtoCase[];
  vendorAds: VendorAd[];
  adPricingSlabs: VendorAdPricingSlab[];
  bankDetails: VendorBankDetails;
  bankDetailsReviewStatus: VendorBankDetailsReviewStatus;
  notificationPreferences: VendorNotificationPreferences;
  complianceAccepted: boolean;
  supportTickets: VendorSupportTicket[];
  walletEntries: VendorWalletEntry[];
  walletSummary: VendorWalletSummary;
  lastSettledAmountInr: number;
  nextSettlementDateIso: string;
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
  updateVendorOrderStatus: (
    orderId: string,
    nextStatus: VendorOrderStatus,
  ) => VendorOrderMutationResult;
  createVendorAd: (payload: VendorAdPayload) => VendorAdMutationResult;
  updateBankDetails: (
    payload: VendorBankDetailsInput,
  ) => VendorSettingsMutationResult;
  setVendorNotificationPreference: (
    key: keyof VendorNotificationPreferences,
    value: boolean,
  ) => void;
  setComplianceAccepted: (value: boolean) => void;
  createSupportTicket: (
    payload: VendorSupportTicketPayload,
  ) => VendorSupportTicketMutationResult;
  addVendorSupportMessage: (
    ticketId: string,
    message: string,
  ) => VendorSupportTicketMutationResult;
  addMockAdminSupportReply: (ticketId: string) => VendorSupportTicketMutationResult;
  updateSupportTicketStatus: (
    ticketId: string,
    status: VendorSupportTicketStatus,
  ) => VendorSupportTicketMutationResult;
  markSupportTicketRepliesRead: (ticketId: string) => void;
  getVendorAdStatus: (ad: VendorAd) => VendorAdStatus;
  getVendorAdAmountSpent: (ad: VendorAd) => number;
  getVendorAdRemainingDays: (ad: VendorAd) => number;
  getVendorProductVisibilityPriority: (
    productId: string,
    category: VendorProductPayload["category"],
  ) => number;
  approveVendor: () => void;
  logoutVendor: () => void;
  setVendorStatus: (status: VendorStatus) => void;
};

const MOCK_VENDOR_NAME = "Astra Retail LLP";
const MOCK_VENDOR_PENDING_SETTLEMENT_INR = 125430;
const MOCK_LAST_SETTLED_AMOUNT_INR = 38640;
const MOCK_NEXT_SETTLEMENT_DATE_ISO = new Date(
  Date.now() + 2 * 24 * 60 * 60 * 1000,
).toISOString();

const CATEGORY_PRICE_BENCHMARKS: Record<
  VendorProductPayload["category"],
  { min: number; max: number }
> = {
  Mobiles: { min: 3000, max: 180000 },
  Laptops: { min: 15000, max: 300000 },
  Accessories: { min: 100, max: 50000 },
  Footwear: { min: 300, max: 30000 },
};

const ORDER_STATUS_SEQUENCE: VendorOrderStatus[] = [
  "New",
  "Packed",
  "Shipped",
  "Delivered",
];

function createVendorProductId() {
  return `VPRD-${Math.floor(100000 + Math.random() * 900000)}`;
}

function createVendorSupportTicketId() {
  return `VTK-${Math.floor(100000 + Math.random() * 900000)}`;
}

function createVendorSupportMessageId() {
  return `VMSG-${Math.floor(100000 + Math.random() * 900000)}`;
}

function getVendorAdStatus(ad: VendorAd, now = new Date()): VendorAdStatus {
  if (ad.status === "Expired") {
    return "Expired";
  }
  if (!ad.endDateIso) {
    return ad.status;
  }
  return now.getTime() >= new Date(ad.endDateIso).getTime() ? "Expired" : ad.status;
}

function getVendorAdRemainingDays(ad: VendorAd, now = new Date()) {
  const adStatus = getVendorAdStatus(ad, now);
  if (adStatus === "Pending") {
    return ad.durationDays;
  }
  if (!ad.endDateIso) {
    return ad.durationDays;
  }
  const remainingMs = new Date(ad.endDateIso).getTime() - now.getTime();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

function getVendorAdAmountSpent(ad: VendorAd, now = new Date()) {
  const adStatus = getVendorAdStatus(ad, now);
  if (adStatus === "Pending" || !ad.startedAtIso) {
    return 0;
  }
  const startedMs = new Date(ad.startedAtIso).getTime();
  const billingEndMs = ad.endDateIso
    ? Math.min(now.getTime(), new Date(ad.endDateIso).getTime())
    : now.getTime();
  const elapsedMs = Math.max(0, billingEndMs - startedMs);
  const elapsedDays = Math.ceil(elapsedMs / (24 * 60 * 60 * 1000));
  const billableDays = Math.min(ad.durationDays, elapsedDays);
  return Math.min(ad.fixedPriceInr, billableDays * ad.perDayRateInr);
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

function createSeedVendorOrders(): VendorOrder[] {
  const now = new Date();
  return [
    {
      id: "VORD-500101",
      productName: "Galaxy A56 5G",
      quantity: 1,
      amountInr: 26999,
      customerAddressMasked: "HSR Layout, Bengaluru - ******",
      paymentMethod: "Online",
      status: "New",
      visibilityState: "None",
      returnWindowClosed: false,
      noReturnSelected: false,
      updatedAtIso: now.toISOString(),
    },
    {
      id: "VORD-500227",
      productName: "Adidas Runstep Pro",
      quantity: 2,
      amountInr: 8598,
      customerAddressMasked: "Kharadi, Pune - ******",
      paymentMethod: "COD",
      status: "Packed",
      visibilityState: "None",
      returnWindowClosed: false,
      noReturnSelected: false,
      updatedAtIso: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "VORD-500392",
      productName: "Buds Lite ANC",
      quantity: 1,
      amountInr: 2999,
      customerAddressMasked: "Indiranagar, Bengaluru - ******",
      paymentMethod: "COD",
      status: "Shipped",
      visibilityState: "Return Requested",
      returnWindowClosed: false,
      noReturnSelected: false,
      updatedAtIso: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "VORD-500430",
      productName: "AstraBook Air 14",
      quantity: 1,
      amountInr: 68999,
      customerAddressMasked: "Velachery, Chennai - ******",
      paymentMethod: "Online",
      status: "Delivered",
      visibilityState: "Cancelled",
      returnWindowClosed: true,
      noReturnSelected: false,
      updatedAtIso: new Date(now.getTime() - 28 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "VORD-500511",
      productName: "Adidas Runstep Pro",
      quantity: 1,
      amountInr: 4299,
      customerAddressMasked: "Whitefield, Bengaluru - ******",
      paymentMethod: "Online",
      status: "Delivered",
      visibilityState: "None",
      returnWindowClosed: true,
      noReturnSelected: false,
      updatedAtIso: new Date(now.getTime() - 52 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "VORD-500612",
      productName: "Buds Lite ANC",
      quantity: 2,
      amountInr: 5998,
      customerAddressMasked: "Powai, Mumbai - ******",
      paymentMethod: "COD",
      status: "Delivered",
      visibilityState: "None",
      returnWindowClosed: false,
      noReturnSelected: true,
      updatedAtIso: new Date(now.getTime() - 34 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function createSeedVendorReturnCases(orders: VendorOrder[]): VendorReturnCase[] {
  return orders
    .filter((order) => order.visibilityState === "Return Requested")
    .map((order) => ({
      id: `VRET-${order.id}`,
      orderId: order.id,
      productName: order.productName,
      reason: "Damaged item received",
      status: "Pickup Pending",
      updatedAtIso: order.updatedAtIso,
    }));
}

function createSeedVendorRtoCases(): VendorRtoCase[] {
  const now = Date.now();
  return [
    {
      id: "VRTO-900221",
      orderId: "VORD-500227",
      productName: "Adidas Runstep Pro",
      courierIssue: "Customer not reachable in three delivery attempts.",
      rtoChargeInr: 145,
      resolutionStatus: "Charge Applied",
      updatedAtIso: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "VRTO-900338",
      orderId: "VORD-500101",
      productName: "Galaxy A56 5G",
      courierIssue: "Courier reported address mismatch during handoff.",
      rtoChargeInr: 180,
      resolutionStatus: "Under Review",
      updatedAtIso: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function createSeedVendorBankDetails(): VendorBankDetails {
  return {
    accountHolderName: "Astra Retail LLP",
    accountNumber: "001234567890",
    ifscCode: "HDFC0000456",
    bankName: "HDFC Bank",
    updatedAtIso: new Date().toISOString(),
  };
}

function createSeedVendorNotificationPreferences(): VendorNotificationPreferences {
  return {
    orderUpdates: true,
    settlementUpdates: true,
    adsUpdates: true,
    policyUpdates: false,
  };
}

function createSeedVendorSupportTickets(): VendorSupportTicket[] {
  const now = Date.now();
  return [
    {
      id: "VTK-730114",
      category: "Orders",
      subject: "Delay noticed for packed order",
      description:
        "Courier pickup is delayed for one packed order. Please confirm if SLA is impacted.",
      orderId: "VORD-500227",
      status: "In Review",
      thread: [
        {
          id: "VMSG-900101",
          sender: "Vendor",
          message:
            "Courier pickup is delayed for one packed order. Please confirm if SLA is impacted.",
          createdAtIso: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
          isReadByVendor: true,
        },
        {
          id: "VMSG-900102",
          sender: "Admin",
          message:
            "We have escalated this with the courier partner. We will share the next update in 24 hours.",
          createdAtIso: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
          isReadByVendor: false,
        },
      ],
      createdAtIso: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      updatedAtIso: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "VTK-730251",
      category: "Payments",
      subject: "Need clarification on settlement adjustment",
      description:
        "One adjustment line item appears against an RTO case. Sharing here for reconciliation.",
      orderId: "VORD-500101",
      status: "Open",
      thread: [
        {
          id: "VMSG-900211",
          sender: "Vendor",
          message:
            "One adjustment line item appears against an RTO case. Sharing here for reconciliation.",
          createdAtIso: new Date(now - 30 * 60 * 60 * 1000).toISOString(),
          isReadByVendor: true,
        },
      ],
      createdAtIso: new Date(now - 30 * 60 * 60 * 1000).toISOString(),
      updatedAtIso: new Date(now - 30 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "VTK-730399",
      category: "Account",
      subject: "Need help with business profile correction",
      description:
        "Please confirm the workflow to update legal business spelling on account records.",
      orderId: null,
      status: "Resolved",
      thread: [
        {
          id: "VMSG-900301",
          sender: "Vendor",
          message:
            "Please confirm the workflow to update legal business spelling on account records.",
          createdAtIso: new Date(now - 72 * 60 * 60 * 1000).toISOString(),
          isReadByVendor: true,
        },
        {
          id: "VMSG-900302",
          sender: "Admin",
          message:
            "Submit the corrected business proof in onboarding documents and we will validate it within two working days.",
          createdAtIso: new Date(now - 70 * 60 * 60 * 1000).toISOString(),
          isReadByVendor: true,
        },
      ],
      createdAtIso: new Date(now - 72 * 60 * 60 * 1000).toISOString(),
      updatedAtIso: new Date(now - 70 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function createSeedWalletAdjustments(
  orders: VendorOrder[],
  returnCases: VendorReturnCase[],
  rtoCases: VendorRtoCase[],
): VendorWalletAdjustment[] {
  const now = Date.now();
  const orderPolicyAdjustments = orders
    .filter((order) => order.visibilityState !== "None")
    .map((order) => {
      const isReturnRequested = order.visibilityState === "Return Requested";
      const reversalDueAtMs = isReturnRequested ? now - 30_000 : now + 120_000;
      const linkedReturnCase = returnCases.find((returnCase) => returnCase.orderId === order.id);
      const adjustmentReason: VendorWalletAdjustment["reason"] =
        order.visibilityState === "Cancelled" ? "Cancelled" : "Return Requested";

      return {
        id: `WADJ-${order.id}`,
        orderId: order.id,
        productName: order.productName,
        amountInr: order.amountInr,
        reason: adjustmentReason,
        linkedReturnCaseId: linkedReturnCase?.id ?? null,
        linkedRtoCaseId: null,
        createdAtIso: new Date(now).toISOString(),
        reversalDueAtIso: new Date(reversalDueAtMs).toISOString(),
        reversalCreated: false,
        reversalCreatedAtIso: null,
      };
    });

  const rtoAdjustments = rtoCases.map((rtoCase) => ({
    id: `WADJ-${rtoCase.id}`,
    orderId: rtoCase.orderId,
    productName: rtoCase.productName,
    amountInr: rtoCase.rtoChargeInr,
    reason: "RTO" as const,
    linkedReturnCaseId: null,
    linkedRtoCaseId: rtoCase.id,
    createdAtIso: rtoCase.updatedAtIso,
    reversalDueAtIso: new Date(now + 60_000).toISOString(),
    reversalCreated: false,
    reversalCreatedAtIso: null,
  }));

  return [...orderPolicyAdjustments, ...rtoAdjustments];
}

function applyWalletAdjustmentTransitions(
  currentAdjustments: VendorWalletAdjustment[],
  now = new Date(),
) {
  let hasChanges = false;
  const nextAdjustments = currentAdjustments.map((adjustment) => {
    if (adjustment.reversalCreated) {
      return adjustment;
    }

    if (now.getTime() >= new Date(adjustment.reversalDueAtIso).getTime()) {
      hasChanges = true;
      return {
        ...adjustment,
        reversalCreated: true,
        reversalCreatedAtIso: now.toISOString(),
      };
    }

    return adjustment;
  });

  return hasChanges ? nextAdjustments : currentAdjustments;
}

function isOrderSettlementAvailable(order: VendorOrder) {
  return (
    order.status === "Delivered" &&
    order.visibilityState === "None" &&
    (order.returnWindowClosed || order.noReturnSelected)
  );
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

const SEEDED_VENDOR_PRODUCTS = createSeedVendorProducts();
const SEEDED_VENDOR_ORDERS = createSeedVendorOrders();
const SEEDED_VENDOR_RETURN_CASES = createSeedVendorReturnCases(SEEDED_VENDOR_ORDERS);
const SEEDED_VENDOR_RTO_CASES = createSeedVendorRtoCases();
const SEEDED_VENDOR_BANK_DETAILS = createSeedVendorBankDetails();
const SEEDED_VENDOR_NOTIFICATION_PREFERENCES =
  createSeedVendorNotificationPreferences();
const SEEDED_VENDOR_SUPPORT_TICKETS = createSeedVendorSupportTickets();
const SEEDED_WALLET_ADJUSTMENTS = createSeedWalletAdjustments(
  SEEDED_VENDOR_ORDERS,
  SEEDED_VENDOR_RETURN_CASES,
  SEEDED_VENDOR_RTO_CASES,
);

const VendorContext = createContext<VendorContextValue | null>(null);

export function VendorProvider({ children }: { children: ReactNode }) {
  const { getVendorById, syncVendorStatus } = useVendorLifecycle();
  const { getAdsForVendor, pricingSlabs, createVendorAdRequest } = useAdMonetization();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingData, setOnboardingData] = useState<VendorOnboardingData | null>(
    null,
  );
  const [vendorProducts, setVendorProducts] =
    useState<VendorProduct[]>(SEEDED_VENDOR_PRODUCTS);
  const [bankDetails, setBankDetails] = useState<VendorBankDetails>(
    SEEDED_VENDOR_BANK_DETAILS,
  );
  const [bankDetailsReviewStatus, setBankDetailsReviewStatus] =
    useState<VendorBankDetailsReviewStatus>("Verified");
  const [notificationPreferences, setNotificationPreferences] =
    useState<VendorNotificationPreferences>(SEEDED_VENDOR_NOTIFICATION_PREFERENCES);
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  const [supportTickets, setSupportTickets] = useState<VendorSupportTicket[]>(
    SEEDED_VENDOR_SUPPORT_TICKETS,
  );
  const [vendorOrders, setVendorOrders] =
    useState<VendorOrder[]>(SEEDED_VENDOR_ORDERS);
  const [vendorReturnCases, setVendorReturnCases] =
    useState<VendorReturnCase[]>(SEEDED_VENDOR_RETURN_CASES);
  const [vendorRtoCases, setVendorRtoCases] =
    useState<VendorRtoCase[]>(SEEDED_VENDOR_RTO_CASES);
  const [walletAdjustments, setWalletAdjustments] = useState<VendorWalletAdjustment[]>(
    SEEDED_WALLET_ADJUSTMENTS,
  );
  const activeVendorProfile = getVendorById(ACTIVE_VENDOR_ID);
  const vendorName = activeVendorProfile?.vendorName ?? MOCK_VENDOR_NAME;
  const vendorStatus = activeVendorProfile?.status ?? "Under Scrutiny";
  const vendorStatusReason = activeVendorProfile?.statusReason ?? null;
  const vendorAds = useMemo<VendorAd[]>(
    () =>
      getAdsForVendor(ACTIVE_VENDOR_ID).map((ad) => ({
        id: ad.id,
        type: ad.type,
        productId: ad.productId,
        productName: ad.productName,
        category: ad.category,
        durationDays: ad.durationDays,
        budgetInr: ad.budgetInr,
        fixedPriceInr: ad.amountPaidInr,
        perDayRateInr: ad.dailyPriceInr,
        startedAtIso: ad.startDateIso,
        endDateIso: ad.endDateIso,
        status: ad.status,
        latestAdminActionLabel: ad.latestAdminActionLabel,
        latestAdminReason: ad.latestAdminReason,
        latestAdminActionAtIso: ad.latestAdminActionAtIso,
      })),
    [getAdsForVendor],
  );
  const adPricingSlabs = useMemo<VendorAdPricingSlab[]>(
    () =>
      pricingSlabs.map((slab: AdPricingSlab) => ({
        adType: slab.adType,
        dailyPriceInr: slab.dailyPriceInr,
        minimumDurationDays: slab.minimumDurationDays,
        updatedAtIso: slab.updatedAtIso,
      })),
    [pricingSlabs],
  );

  useEffect(() => {
    const refreshWalletAdjustments = () => {
      const now = new Date();
      setWalletAdjustments((currentAdjustments) => {
        const nextAdjustments = applyWalletAdjustmentTransitions(
          currentAdjustments,
          now,
        );
        if (nextAdjustments === currentAdjustments) {
          return currentAdjustments;
        }

        const previouslyCreatedById = new Set(
          currentAdjustments
            .filter((adjustment) => adjustment.reversalCreated)
            .map((adjustment) => adjustment.id),
        );
        const newlyReversedAdjustments = nextAdjustments.filter(
          (adjustment) =>
            adjustment.reversalCreated &&
            !previouslyCreatedById.has(adjustment.id),
        );

        if (newlyReversedAdjustments.length > 0) {
          const reversedReturnCaseIds = newlyReversedAdjustments
            .map((adjustment) => adjustment.linkedReturnCaseId)
            .filter((linkedReturnCaseId): linkedReturnCaseId is string =>
              Boolean(linkedReturnCaseId),
            );
          const reversedRtoCaseIds = newlyReversedAdjustments
            .map((adjustment) => adjustment.linkedRtoCaseId)
            .filter((linkedRtoCaseId): linkedRtoCaseId is string =>
              Boolean(linkedRtoCaseId),
            );

          if (reversedReturnCaseIds.length > 0) {
            setVendorReturnCases((currentCases) =>
              currentCases.map((returnCase) =>
                reversedReturnCaseIds.includes(returnCase.id)
                  ? {
                      ...returnCase,
                      status: "Refund Adjusted",
                      updatedAtIso: now.toISOString(),
                    }
                  : returnCase,
              ),
            );
          }

          if (reversedRtoCaseIds.length > 0) {
            setVendorRtoCases((currentCases) =>
              currentCases.map((rtoCase) =>
                reversedRtoCaseIds.includes(rtoCase.id)
                  ? {
                      ...rtoCase,
                      resolutionStatus: "Reversed",
                      updatedAtIso: now.toISOString(),
                    }
                  : rtoCase,
              ),
            );
          }
        }

        return nextAdjustments;
      });
    };

    refreshWalletAdjustments();
    const refreshHandle = window.setInterval(refreshWalletAdjustments, 30_000);

    return () => window.clearInterval(refreshHandle);
  }, []);

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

  function syncCurrentVendorStatus(status: VendorStatus, reason: string | null) {
    syncVendorStatus(ACTIVE_VENDOR_ID, status, reason);
  }

  function setVendorStatus(status: VendorStatus) {
    syncCurrentVendorStatus(status, null);
  }

  function getSellingRestrictionMessage(status: VendorStatus) {
    if (status === "Suspended") {
      return "Selling actions are blocked while your account is suspended by admin.";
    }
    if (status === "Rejected") {
      return "Selling actions are disabled while your account is rejected.";
    }
    return "Vendor must be Approved before performing selling actions.";
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
    syncCurrentVendorStatus(
      "Under Scrutiny",
      "Onboarding submitted and waiting for admin review.",
    );
    setBankDetails({
      accountHolderName: payload.bankAccountHolderName.trim(),
      accountNumber: payload.bankAccountNumber.trim(),
      ifscCode: payload.bankIfscCode.trim().toUpperCase(),
      bankName: payload.bankName.trim(),
      updatedAtIso: new Date().toISOString(),
    });
    setBankDetailsReviewStatus("Under Review");

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
        message: getSellingRestrictionMessage(vendorStatus),
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
    if (vendorStatus !== "Approved") {
      return {
        ok: false,
        message: getSellingRestrictionMessage(vendorStatus),
      };
    }

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
    if (vendorStatus !== "Approved") {
      return {
        ok: false,
        message: getSellingRestrictionMessage(vendorStatus),
      };
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
    if (vendorStatus !== "Approved") {
      return {
        ok: false,
        message: getSellingRestrictionMessage(vendorStatus),
      };
    }

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

  function updateVendorOrderStatus(
    orderId: string,
    nextStatus: VendorOrderStatus,
  ): VendorOrderMutationResult {
    if (vendorStatus !== "Approved") {
      return {
        ok: false,
        message: getSellingRestrictionMessage(vendorStatus),
      };
    }

    const targetOrder = vendorOrders.find((order) => order.id === orderId);
    if (!targetOrder) {
      return { ok: false, message: "Order not found." };
    }

    if (targetOrder.visibilityState !== "None") {
      return {
        ok: false,
        message: `Status update blocked: order is ${targetOrder.visibilityState}.`,
      };
    }

    const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(targetOrder.status);
    const nextIndex = ORDER_STATUS_SEQUENCE.indexOf(nextStatus);
    if (currentIndex === -1 || nextIndex === -1) {
      return { ok: false, message: "Invalid status update request." };
    }

    if (nextIndex !== currentIndex + 1) {
      return {
        ok: false,
        message: "Order status can only be updated sequentially.",
      };
    }

    const nowIso = new Date().toISOString();
    setVendorOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: nextStatus,
              updatedAtIso: nowIso,
            }
          : order,
      ),
    );

    return { ok: true, message: `Order moved to ${nextStatus}.` };
  }

  function createVendorAd(payload: VendorAdPayload): VendorAdMutationResult {
    if (vendorStatus !== "Approved") {
      return {
        ok: false,
        message: getSellingRestrictionMessage(vendorStatus),
      };
    }

    if (payload.durationDays <= 0) {
      return { ok: false, message: "Duration must be at least 1 day." };
    }

    if (payload.budgetInr <= 0) {
      return { ok: false, message: "Budget must be greater than ₹0." };
    }

    if (payload.type === "Sponsored Product" && !payload.productId) {
      return { ok: false, message: "Select a product for Sponsored Product ad." };
    }

    if (payload.type === "Sponsored Category" && !payload.category) {
      return { ok: false, message: "Select a category for Sponsored Category ad." };
    }

    const selectedProduct =
      payload.productId !== null
        ? vendorProducts.find((product) => product.id === payload.productId) ?? null
        : null;
    if (payload.type === "Sponsored Product" && payload.productId && !selectedProduct) {
      return {
        ok: false,
        message: "Selected product is not available for ad creation.",
      };
    }

    return createVendorAdRequest({
      vendorId: ACTIVE_VENDOR_ID,
      vendorName,
      type: payload.type,
      productId: payload.type === "Sponsored Product" ? payload.productId : null,
      productName:
        payload.type === "Sponsored Product" ? selectedProduct?.productName ?? null : null,
      category:
        payload.type === "Sponsored Product"
          ? selectedProduct?.category ?? payload.category
          : payload.category,
      durationDays: payload.durationDays,
      budgetInr: payload.budgetInr,
    });
  }

  function updateBankDetails(
    payload: VendorBankDetailsInput,
  ): VendorSettingsMutationResult {
    if (
      !payload.accountHolderName.trim() ||
      !payload.accountNumber.trim() ||
      !payload.ifscCode.trim() ||
      !payload.bankName.trim()
    ) {
      return { ok: false, message: "Complete all bank detail fields to continue." };
    }

    const nowIso = new Date().toISOString();
    setBankDetails({
      accountHolderName: payload.accountHolderName.trim(),
      accountNumber: payload.accountNumber.trim(),
      ifscCode: payload.ifscCode.trim().toUpperCase(),
      bankName: payload.bankName.trim(),
      updatedAtIso: nowIso,
    });
    setBankDetailsReviewStatus("Under Review");

    return {
      ok: true,
      message: "Bank details updated and sent for review.",
    };
  }

  function setVendorNotificationPreference(
    key: keyof VendorNotificationPreferences,
    value: boolean,
  ) {
    setNotificationPreferences((currentPreferences) => ({
      ...currentPreferences,
      [key]: value,
    }));
  }

  function updateComplianceAccepted(value: boolean) {
    setComplianceAccepted(value);
  }

  function createSupportTicket(
    payload: VendorSupportTicketPayload,
  ): VendorSupportTicketMutationResult {
    if (!payload.subject.trim()) {
      return { ok: false, message: "Ticket subject is required." };
    }
    if (!payload.description.trim()) {
      return { ok: false, message: "Ticket description is required." };
    }

    const nowIso = new Date().toISOString();
    const nextTicket: VendorSupportTicket = {
      id: createVendorSupportTicketId(),
      category: payload.category,
      subject: payload.subject.trim(),
      description: payload.description.trim(),
      orderId: payload.orderId?.trim() ? payload.orderId.trim() : null,
      status: "Open",
      thread: [
        {
          id: createVendorSupportMessageId(),
          sender: "Vendor",
          message: payload.description.trim(),
          createdAtIso: nowIso,
          isReadByVendor: true,
        },
      ],
      createdAtIso: nowIso,
      updatedAtIso: nowIso,
    };
    setSupportTickets((currentTickets) => [nextTicket, ...currentTickets]);

    return { ok: true, message: "Support ticket created successfully." };
  }

  function addVendorSupportMessage(
    ticketId: string,
    message: string,
  ): VendorSupportTicketMutationResult {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return { ok: false, message: "Enter a message before sending." };
    }

    const ticketExists = supportTickets.some((ticket) => ticket.id === ticketId);
    if (!ticketExists) {
      return { ok: false, message: "Support ticket not found." };
    }

    const nowIso = new Date().toISOString();
    setSupportTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        return {
          ...ticket,
          status: ticket.status === "Closed" ? "In Review" : ticket.status,
          thread: [
            ...ticket.thread,
            {
              id: createVendorSupportMessageId(),
              sender: "Vendor",
              message: trimmedMessage,
              createdAtIso: nowIso,
              isReadByVendor: true,
            },
          ],
          updatedAtIso: nowIso,
        };
      }),
    );

    return { ok: true, message: "Message added to the support thread." };
  }

  function addMockAdminSupportReply(ticketId: string): VendorSupportTicketMutationResult {
    const ticketExists = supportTickets.some((ticket) => ticket.id === ticketId);
    if (!ticketExists) {
      return { ok: false, message: "Support ticket not found." };
    }

    const nowIso = new Date().toISOString();
    setSupportTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        return {
          ...ticket,
          status: ticket.status === "Open" ? "In Review" : ticket.status,
          thread: [
            ...ticket.thread,
            {
              id: createVendorSupportMessageId(),
              sender: "Admin",
              message:
                "Admin reply (mock): We have received your query and are verifying the details.",
              createdAtIso: nowIso,
              isReadByVendor: false,
            },
          ],
          updatedAtIso: nowIso,
        };
      }),
    );

    return { ok: true, message: "Mock admin reply added." };
  }

  function updateSupportTicketStatus(
    ticketId: string,
    status: VendorSupportTicketStatus,
  ): VendorSupportTicketMutationResult {
    const ticketExists = supportTickets.some((ticket) => ticket.id === ticketId);
    if (!ticketExists) {
      return { ok: false, message: "Support ticket not found." };
    }

    const nowIso = new Date().toISOString();
    setSupportTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        return {
          ...ticket,
          status,
          updatedAtIso: nowIso,
        };
      }),
    );

    return { ok: true, message: `Ticket status moved to ${status} (mock admin action).` };
  }

  function markSupportTicketRepliesRead(ticketId: string) {
    setSupportTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        const hasUnreadAdminReply = ticket.thread.some(
          (threadMessage) =>
            threadMessage.sender === "Admin" && !threadMessage.isReadByVendor,
        );
        if (!hasUnreadAdminReply) {
          return ticket;
        }

        return {
          ...ticket,
          thread: ticket.thread.map((threadMessage) =>
            threadMessage.sender === "Admin"
              ? { ...threadMessage, isReadByVendor: true }
              : threadMessage,
          ),
        };
      }),
    );
  }

  function getVendorProductVisibilityPriority(
    productId: string,
    category: VendorProductPayload["category"],
  ) {
    const now = new Date();
    const hasActiveProductAd = vendorAds.some(
      (ad) =>
        ad.type === "Sponsored Product" &&
        ad.productId === productId &&
        getVendorAdStatus(ad, now) === "Active",
    );
    if (hasActiveProductAd) {
      return 2;
    }

    const hasActiveCategoryAd = vendorAds.some(
      (ad) =>
        ad.type === "Sponsored Category" &&
        ad.category === category &&
        getVendorAdStatus(ad, now) === "Active",
    );
    if (hasActiveCategoryAd) {
      return 1;
    }

    return 0;
  }

  function approveVendor() {
    setVendorStatus("Approved");
  }

  const summaryMetrics = useMemo<VendorSummaryMetrics>(() => {
    const activeProducts = vendorProducts.filter(
      (product) => product.status === "Live",
    ).length;
    const totalOrders = vendorOrders.length;
    const pendingOrders = vendorOrders.filter(
      (order) => order.status !== "Delivered" && order.visibilityState === "None",
    ).length;

    return {
      totalOrders,
      pendingOrders,
      activeProducts,
      pendingSettlementInr: MOCK_VENDOR_PENDING_SETTLEMENT_INR,
    };
  }, [vendorOrders, vendorProducts]);

  const walletEntries = useMemo<VendorWalletEntry[]>(() => {
    const orderEntries: VendorWalletEntry[] = vendorOrders
      .filter((order) => order.visibilityState === "None")
      .map((order): VendorWalletEntry => ({
        id: `WENTRY-${order.id}`,
        orderId: order.id,
        productName: order.productName,
        amountInr: order.amountInr,
        status: isOrderSettlementAvailable(order) ? "Available" : "Pending",
        note: isOrderSettlementAvailable(order)
          ? order.noReturnSelected
            ? "Available after customer selected No Return."
            : "Available after delivery and return window closure."
          : "Pending until delivery and return policy completion.",
        updatedAtIso: order.updatedAtIso,
      }));

    const adjustmentEntries = walletAdjustments.flatMap((adjustment) => {
      const deductionEntry: VendorWalletEntry = {
        id: `${adjustment.id}-deduct`,
        orderId: adjustment.orderId,
        productName: adjustment.productName,
        amountInr: -Math.abs(adjustment.amountInr),
        status: "Adjusted",
        note:
          adjustment.reason === "Cancelled"
            ? "Temporary deduction for cancelled order."
            : adjustment.reason === "Return Requested"
              ? "Temporary deduction for return requested order."
              : "Temporary RTO deduction applied.",
        updatedAtIso: adjustment.createdAtIso,
      };

      if (!adjustment.reversalCreated) {
        return [deductionEntry];
      }

      const reversalEntry: VendorWalletEntry = {
        id: `${adjustment.id}-reverse`,
        orderId: adjustment.orderId,
        productName: adjustment.productName,
        amountInr: Math.abs(adjustment.amountInr),
        status: "Adjusted",
        note: "Auto-adjust reversal credited (mock).",
        updatedAtIso: adjustment.reversalCreatedAtIso ?? adjustment.createdAtIso,
      };

      return [deductionEntry, reversalEntry];
    });

    return [...orderEntries, ...adjustmentEntries].sort(
      (first, second) =>
        new Date(second.updatedAtIso).getTime() -
        new Date(first.updatedAtIso).getTime(),
    );
  }, [vendorOrders, walletAdjustments]);

  const walletSummary = useMemo<VendorWalletSummary>(() => {
    return walletEntries.reduce(
      (summary, walletEntry) => {
        if (walletEntry.status === "Pending") {
          return {
            ...summary,
            pendingInr: summary.pendingInr + walletEntry.amountInr,
          };
        }

        if (walletEntry.status === "Available") {
          return {
            ...summary,
            availableInr: summary.availableInr + walletEntry.amountInr,
          };
        }

        return {
          ...summary,
          adjustmentsInr: summary.adjustmentsInr + walletEntry.amountInr,
        };
      },
      { pendingInr: 0, availableInr: 0, adjustmentsInr: 0 },
    );
  }, [walletEntries]);

  const value = useMemo<VendorContextValue>(
    () => ({
      isLoggedIn,
      vendorName,
      vendorStatus,
      vendorStatusReason,
      canPublishProducts: vendorStatus === "Approved",
      onboardingData,
      hasCompletedOnboarding: onboardingData !== null,
      summaryMetrics,
      vendorProducts,
      vendorOrders,
      vendorReturnCases,
      vendorRtoCases,
      vendorAds,
      adPricingSlabs,
      bankDetails,
      bankDetailsReviewStatus,
      notificationPreferences,
      complianceAccepted,
      supportTickets,
      walletEntries,
      walletSummary,
      lastSettledAmountInr: MOCK_LAST_SETTLED_AMOUNT_INR,
      nextSettlementDateIso: MOCK_NEXT_SETTLEMENT_DATE_ISO,
      loginVendor,
      submitOnboarding,
      addVendorProduct,
      updateVendorProduct,
      approveVendorProduct,
      rejectVendorProduct,
      updateVendorOrderStatus,
      createVendorAd,
      updateBankDetails,
      setVendorNotificationPreference,
      setComplianceAccepted: updateComplianceAccepted,
      createSupportTicket,
      addVendorSupportMessage,
      addMockAdminSupportReply,
      updateSupportTicketStatus,
      markSupportTicketRepliesRead,
      getVendorAdStatus,
      getVendorAdAmountSpent,
      getVendorAdRemainingDays,
      getVendorProductVisibilityPriority,
      approveVendor,
      logoutVendor,
      setVendorStatus,
    }),
    [
      isLoggedIn,
      bankDetails,
      bankDetailsReviewStatus,
      complianceAccepted,
      notificationPreferences,
      onboardingData,
      summaryMetrics,
      supportTickets,
      walletEntries,
      walletSummary,
      vendorAds,
      adPricingSlabs,
      vendorOrders,
      vendorReturnCases,
      vendorRtoCases,
      vendorProducts,
      vendorName,
      vendorStatus,
      vendorStatusReason,
    ],
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
