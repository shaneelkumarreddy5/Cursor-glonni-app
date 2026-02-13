import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ACTIVE_VENDOR_ID } from "./VendorLifecycleContext";

export type AdminOrderStatus =
  | "Ordered"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Return Requested";

export type AdminPaymentType = "Online" | "COD";
export type AdminUserAction = "None" | "Cancel Requested" | "Return Requested" | "No Return";
export type AdminVendorAction = "None" | "Packed" | "Shipped";

export type AdminDisputeSource = "User" | "Vendor" | "Courier";
export type AdminFaultAssignee = "User" | "Vendor" | "Courier" | "Platform";
export type AdminDisputeStatus = "Open" | "Resolved";

export type AdminReturnStatus = "Requested" | "Picked" | "Received" | "Closed";
export type AdminRtoAdjustmentStatus =
  | "Pending Confirmation"
  | "Charge Confirmed"
  | "Charge Reversed";

export type AdminOrderTimeline = {
  orderedAtIso: string;
  packedAtIso: string | null;
  shippedAtIso: string | null;
  deliveredAtIso: string | null;
};

export type AdminFinancialImpact = {
  vendorWalletAdjustmentInr: number;
  vendorWalletStatus: string;
  userRefundStatus: string;
  userCashbackStatus: string;
  adminReason: string | null;
  updatedAtIso: string;
};

export type AdminOrderDispute = {
  isFlagged: boolean;
  source: AdminDisputeSource;
  status: AdminDisputeStatus;
  assignedFault: AdminFaultAssignee | null;
  adminReason: string | null;
  updatedAtIso: string;
};

export type AdminOrderRecord = {
  id: string;
  userName: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  amountInr: number;
  paymentType: AdminPaymentType;
  status: AdminOrderStatus;
  timeline: AdminOrderTimeline;
  userAction: AdminUserAction;
  vendorAction: AdminVendorAction;
  deliveryPartnerStatus: string;
  userOrderId: string | null;
  vendorOrderId: string | null;
  financialImpact: AdminFinancialImpact;
  dispute: AdminOrderDispute | null;
  updatedAtIso: string;
};

export type AdminReturnCaseRecord = {
  id: string;
  orderId: string;
  returnReason: string;
  status: AdminReturnStatus;
  adminReason: string | null;
  updatedAtIso: string;
};

export type AdminRtoCaseRecord = {
  id: string;
  orderId: string;
  courierIssueReason: string;
  rtoChargeInr: number;
  adjustmentStatus: AdminRtoAdjustmentStatus;
  adminReason: string | null;
  updatedAtIso: string;
};

export type AdminOpsAuditActionType =
  | "Return Approved"
  | "Return Closed"
  | "RTO Charge Confirmed"
  | "RTO Charge Reversed"
  | "Dispute Fault Assigned";

export type AdminOpsAuditLogEntry = {
  id: string;
  orderId: string;
  actionType: AdminOpsAuditActionType;
  reason: string;
  createdAtIso: string;
};

export type UserOrderResolutionView = {
  orderId: string;
  reason: string | null;
  userRefundStatus: string;
  userCashbackStatus: string;
  updatedAtIso: string;
};

export type VendorOrderResolutionView = {
  orderId: string;
  productName: string;
  vendorWalletAdjustmentInr: number;
  vendorWalletStatus: string;
  userRefundStatus: string;
  userCashbackStatus: string;
  reason: string | null;
  updatedAtIso: string;
};

type OrderOpsMutationResult = {
  ok: boolean;
  message: string;
};

type OrderOperationsContextValue = {
  orders: AdminOrderRecord[];
  returnCases: AdminReturnCaseRecord[];
  rtoCases: AdminRtoCaseRecord[];
  auditLog: AdminOpsAuditLogEntry[];
  getOrderById: (orderId: string) => AdminOrderRecord | undefined;
  getOrderAuditLog: (orderId: string) => AdminOpsAuditLogEntry[];
  getUserOrderResolutionByOrderId: (
    userOrderId: string,
  ) => UserOrderResolutionView | undefined;
  getVendorOrderResolutionFeed: (vendorId: string) => VendorOrderResolutionView[];
  approveReturnResolution: (returnCaseId: string) => OrderOpsMutationResult;
  closeReturnWithReason: (
    returnCaseId: string,
    reason: string,
  ) => OrderOpsMutationResult;
  confirmRtoCharge: (rtoCaseId: string, reason: string) => OrderOpsMutationResult;
  reverseRtoCharge: (rtoCaseId: string, reason: string) => OrderOpsMutationResult;
  assignDisputeFault: (
    orderId: string,
    fault: AdminFaultAssignee,
    reason: string,
  ) => OrderOpsMutationResult;
};

function createAuditLogId() {
  return `OLOG-${Math.floor(100000 + Math.random() * 900000)}`;
}

function createDefaultFinancialImpact(updatedAtIso: string): AdminFinancialImpact {
  return {
    vendorWalletAdjustmentInr: 0,
    vendorWalletStatus: "No adjustment",
    userRefundStatus: "No change",
    userCashbackStatus: "No change",
    adminReason: null,
    updatedAtIso,
  };
}

const nowMs = Date.now();
const orderedAtIso = new Date(nowMs - 96 * 60 * 60 * 1000).toISOString();
const packedAtIso = new Date(nowMs - 84 * 60 * 60 * 1000).toISOString();
const shippedAtIso = new Date(nowMs - 72 * 60 * 60 * 1000).toISOString();
const deliveredAtIso = new Date(nowMs - 48 * 60 * 60 * 1000).toISOString();

const SEEDED_ORDERS: AdminOrderRecord[] = [
  {
    id: "GLN2602129481",
    userName: "Rohit Sharma",
    vendorId: "VND-1002",
    vendorName: "Nova Retail Hub",
    productName: "NovaBook 14",
    amountInr: 68999,
    paymentType: "Online",
    status: "Ordered",
    timeline: {
      orderedAtIso,
      packedAtIso: null,
      shippedAtIso: null,
      deliveredAtIso: null,
    },
    userAction: "None",
    vendorAction: "None",
    deliveryPartnerStatus: "Awaiting pickup assignment",
    userOrderId: "GLN2602129481",
    vendorOrderId: null,
    financialImpact: createDefaultFinancialImpact(orderedAtIso),
    dispute: null,
    updatedAtIso: orderedAtIso,
  },
  {
    id: "GLN2602116403",
    userName: "Ananya Singh",
    vendorId: ACTIVE_VENDOR_ID,
    vendorName: "Astra Retail LLP",
    productName: "Galaxy A56 5G",
    amountInr: 26999,
    paymentType: "Online",
    status: "Shipped",
    timeline: {
      orderedAtIso: new Date(nowMs - 90 * 60 * 60 * 1000).toISOString(),
      packedAtIso: new Date(nowMs - 88 * 60 * 60 * 1000).toISOString(),
      shippedAtIso: new Date(nowMs - 80 * 60 * 60 * 1000).toISOString(),
      deliveredAtIso: null,
    },
    userAction: "None",
    vendorAction: "Shipped",
    deliveryPartnerStatus: "In transit to destination city hub",
    userOrderId: "GLN2602116403",
    vendorOrderId: null,
    financialImpact: createDefaultFinancialImpact(new Date(nowMs - 80 * 60 * 60 * 1000).toISOString()),
    dispute: {
      isFlagged: true,
      source: "Courier",
      status: "Open",
      assignedFault: null,
      adminReason: null,
      updatedAtIso: new Date(nowMs - 76 * 60 * 60 * 1000).toISOString(),
    },
    updatedAtIso: new Date(nowMs - 76 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "GLN2602102217",
    userName: "Karan Mehra",
    vendorId: ACTIVE_VENDOR_ID,
    vendorName: "Astra Retail LLP",
    productName: "Buds Lite ANC",
    amountInr: 2999,
    paymentType: "COD",
    status: "Return Requested",
    timeline: {
      orderedAtIso: new Date(nowMs - 110 * 60 * 60 * 1000).toISOString(),
      packedAtIso: new Date(nowMs - 108 * 60 * 60 * 1000).toISOString(),
      shippedAtIso: new Date(nowMs - 104 * 60 * 60 * 1000).toISOString(),
      deliveredAtIso: deliveredAtIso,
    },
    userAction: "Return Requested",
    vendorAction: "Shipped",
    deliveryPartnerStatus: "Return pickup requested by user",
    userOrderId: "GLN2602102217",
    vendorOrderId: null,
    financialImpact: {
      vendorWalletAdjustmentInr: -2999,
      vendorWalletStatus: "Return under review",
      userRefundStatus: "Refund Initiated",
      userCashbackStatus: "On Hold",
      adminReason: "Return request is under admin verification.",
      updatedAtIso: new Date(nowMs - 20 * 60 * 60 * 1000).toISOString(),
    },
    dispute: {
      isFlagged: true,
      source: "User",
      status: "Open",
      assignedFault: null,
      adminReason: null,
      updatedAtIso: new Date(nowMs - 18 * 60 * 60 * 1000).toISOString(),
    },
    updatedAtIso: new Date(nowMs - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "VORD-500392",
    userName: "Priya Nair",
    vendorId: ACTIVE_VENDOR_ID,
    vendorName: "Astra Retail LLP",
    productName: "Buds Lite ANC",
    amountInr: 2999,
    paymentType: "COD",
    status: "Return Requested",
    timeline: {
      orderedAtIso: new Date(nowMs - 58 * 60 * 60 * 1000).toISOString(),
      packedAtIso: new Date(nowMs - 56 * 60 * 60 * 1000).toISOString(),
      shippedAtIso: new Date(nowMs - 52 * 60 * 60 * 1000).toISOString(),
      deliveredAtIso: new Date(nowMs - 36 * 60 * 60 * 1000).toISOString(),
    },
    userAction: "Return Requested",
    vendorAction: "Shipped",
    deliveryPartnerStatus: "Reverse pickup pending with courier partner",
    userOrderId: null,
    vendorOrderId: "VORD-500392",
    financialImpact: {
      vendorWalletAdjustmentInr: -2999,
      vendorWalletStatus: "Temporary return deduction",
      userRefundStatus: "Refund Initiated",
      userCashbackStatus: "On Hold",
      adminReason: "Return case created and awaiting closure decision.",
      updatedAtIso: new Date(nowMs - 30 * 60 * 60 * 1000).toISOString(),
    },
    dispute: null,
    updatedAtIso: new Date(nowMs - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "VORD-500227",
    userName: "Arjun Kapoor",
    vendorId: ACTIVE_VENDOR_ID,
    vendorName: "Astra Retail LLP",
    productName: "Adidas Runstep Pro",
    amountInr: 8598,
    paymentType: "COD",
    status: "Cancelled",
    timeline: {
      orderedAtIso: new Date(nowMs - 70 * 60 * 60 * 1000).toISOString(),
      packedAtIso: new Date(nowMs - 66 * 60 * 60 * 1000).toISOString(),
      shippedAtIso: new Date(nowMs - 62 * 60 * 60 * 1000).toISOString(),
      deliveredAtIso: null,
    },
    userAction: "Cancel Requested",
    vendorAction: "Shipped",
    deliveryPartnerStatus: "RTO initiated due to repeated delivery failure",
    userOrderId: null,
    vendorOrderId: "VORD-500227",
    financialImpact: createDefaultFinancialImpact(new Date(nowMs - 60 * 60 * 60 * 1000).toISOString()),
    dispute: {
      isFlagged: true,
      source: "Courier",
      status: "Open",
      assignedFault: null,
      adminReason: null,
      updatedAtIso: new Date(nowMs - 58 * 60 * 60 * 1000).toISOString(),
    },
    updatedAtIso: new Date(nowMs - 58 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "VORD-500101",
    userName: "Megha Iyer",
    vendorId: ACTIVE_VENDOR_ID,
    vendorName: "Astra Retail LLP",
    productName: "Galaxy A56 5G",
    amountInr: 26999,
    paymentType: "Online",
    status: "Cancelled",
    timeline: {
      orderedAtIso: new Date(nowMs - 124 * 60 * 60 * 1000).toISOString(),
      packedAtIso: new Date(nowMs - 122 * 60 * 60 * 1000).toISOString(),
      shippedAtIso: new Date(nowMs - 118 * 60 * 60 * 1000).toISOString(),
      deliveredAtIso: null,
    },
    userAction: "None",
    vendorAction: "Shipped",
    deliveryPartnerStatus: "RTO charge already confirmed",
    userOrderId: null,
    vendorOrderId: "VORD-500101",
    financialImpact: {
      vendorWalletAdjustmentInr: -180,
      vendorWalletStatus: "RTO charge debited",
      userRefundStatus: "Refund Initiated",
      userCashbackStatus: "Cancelled",
      adminReason: "RTO charge confirmed after courier escalation review.",
      updatedAtIso: new Date(nowMs - 102 * 60 * 60 * 1000).toISOString(),
    },
    dispute: null,
    updatedAtIso: new Date(nowMs - 102 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "VORD-500430",
    userName: "Nitin Verma",
    vendorId: "VND-1003",
    vendorName: "Swift Commerce India",
    productName: "AstraBook Air 14",
    amountInr: 68999,
    paymentType: "Online",
    status: "Delivered",
    timeline: {
      orderedAtIso: new Date(nowMs - 140 * 60 * 60 * 1000).toISOString(),
      packedAtIso: new Date(nowMs - 136 * 60 * 60 * 1000).toISOString(),
      shippedAtIso: new Date(nowMs - 132 * 60 * 60 * 1000).toISOString(),
      deliveredAtIso: new Date(nowMs - 120 * 60 * 60 * 1000).toISOString(),
    },
    userAction: "No Return",
    vendorAction: "Shipped",
    deliveryPartnerStatus: "Delivered and acknowledged by customer",
    userOrderId: null,
    vendorOrderId: "VORD-500430",
    financialImpact: createDefaultFinancialImpact(new Date(nowMs - 120 * 60 * 60 * 1000).toISOString()),
    dispute: {
      isFlagged: true,
      source: "Vendor",
      status: "Open",
      assignedFault: null,
      adminReason: null,
      updatedAtIso: new Date(nowMs - 24 * 60 * 60 * 1000).toISOString(),
    },
    updatedAtIso: new Date(nowMs - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEEDED_RETURNS: AdminReturnCaseRecord[] = [
  {
    id: "RET-1001",
    orderId: "GLN2602102217",
    returnReason: "Damaged item received",
    status: "Requested",
    adminReason: null,
    updatedAtIso: new Date(nowMs - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "RET-1002",
    orderId: "VORD-500392",
    returnReason: "Wrong item delivered",
    status: "Picked",
    adminReason: null,
    updatedAtIso: new Date(nowMs - 12 * 60 * 60 * 1000).toISOString(),
  },
];

const SEEDED_RTOS: AdminRtoCaseRecord[] = [
  {
    id: "RTO-1001",
    orderId: "VORD-500227",
    courierIssueReason: "Customer not reachable in three delivery attempts.",
    rtoChargeInr: 145,
    adjustmentStatus: "Pending Confirmation",
    adminReason: null,
    updatedAtIso: new Date(nowMs - 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "RTO-1002",
    orderId: "VORD-500101",
    courierIssueReason: "Address mismatch reported by courier partner.",
    rtoChargeInr: 180,
    adjustmentStatus: "Charge Confirmed",
    adminReason: "Charge confirmed after failed redelivery and SLA evidence review.",
    updatedAtIso: new Date(nowMs - 102 * 60 * 60 * 1000).toISOString(),
  },
];

const SEEDED_AUDIT_LOG: AdminOpsAuditLogEntry[] = [
  {
    id: "OLOG-1001",
    orderId: "VORD-500101",
    actionType: "RTO Charge Confirmed",
    reason: "Charge confirmed after failed redelivery and SLA evidence review.",
    createdAtIso: new Date(nowMs - 102 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "OLOG-1002",
    orderId: "GLN2602102217",
    actionType: "Return Approved",
    reason: "Initial review started. Final closure is pending in returns queue.",
    createdAtIso: new Date(nowMs - 18 * 60 * 60 * 1000).toISOString(),
  },
];

const OrderOperationsContext = createContext<OrderOperationsContextValue | null>(null);

function getDisputeImpactByFault(amountInr: number, fault: AdminFaultAssignee) {
  if (fault === "User") {
    return {
      vendorWalletAdjustmentInr: 0,
      vendorWalletStatus: "No vendor debit. User at fault.",
      userRefundStatus: "Refund Rejected",
      userCashbackStatus: "Cancelled",
    };
  }

  if (fault === "Vendor") {
    return {
      vendorWalletAdjustmentInr: -Math.round(amountInr * 0.15),
      vendorWalletStatus: "Vendor penalty debited",
      userRefundStatus: "Refund Approved",
      userCashbackStatus: "Confirmed",
    };
  }

  if (fault === "Courier") {
    return {
      vendorWalletAdjustmentInr: Math.round(amountInr * 0.08),
      vendorWalletStatus: "Vendor compensated for courier fault",
      userRefundStatus: "Refund Approved",
      userCashbackStatus: "Confirmed",
    };
  }

  return {
    vendorWalletAdjustmentInr: 0,
    vendorWalletStatus: "Platform absorbed impact",
    userRefundStatus: "Refund Approved",
    userCashbackStatus: "Confirmed",
  };
}

export function OrderOperationsProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<AdminOrderRecord[]>(SEEDED_ORDERS);
  const [returnCases, setReturnCases] =
    useState<AdminReturnCaseRecord[]>(SEEDED_RETURNS);
  const [rtoCases, setRtoCases] = useState<AdminRtoCaseRecord[]>(SEEDED_RTOS);
  const [auditLog, setAuditLog] = useState<AdminOpsAuditLogEntry[]>(SEEDED_AUDIT_LOG);

  function addAuditLog(orderId: string, actionType: AdminOpsAuditActionType, reason: string) {
    const nowIso = new Date().toISOString();
    setAuditLog((currentLog) => [
      {
        id: createAuditLogId(),
        orderId,
        actionType,
        reason,
        createdAtIso: nowIso,
      },
      ...currentLog,
    ]);
  }

  function getOrderById(orderId: string) {
    return orders.find((order) => order.id === orderId);
  }

  function getOrderAuditLog(orderId: string) {
    return auditLog
      .filter((entry) => entry.orderId === orderId)
      .sort(
        (first, second) =>
          new Date(second.createdAtIso).getTime() -
          new Date(first.createdAtIso).getTime(),
      );
  }

  function getUserOrderResolutionByOrderId(userOrderId: string) {
    const order = orders.find((orderItem) => orderItem.userOrderId === userOrderId);
    if (!order) {
      return undefined;
    }

    const hasResolution =
      Boolean(order.financialImpact.adminReason) ||
      order.financialImpact.userRefundStatus !== "No change" ||
      order.financialImpact.userCashbackStatus !== "No change";
    if (!hasResolution) {
      return undefined;
    }

    return {
      orderId: order.id,
      reason: order.financialImpact.adminReason,
      userRefundStatus: order.financialImpact.userRefundStatus,
      userCashbackStatus: order.financialImpact.userCashbackStatus,
      updatedAtIso: order.financialImpact.updatedAtIso,
    };
  }

  function getVendorOrderResolutionFeed(vendorId: string) {
    return orders
      .filter((order) => order.vendorId === vendorId)
      .filter(
        (order) =>
          Boolean(order.financialImpact.adminReason) ||
          order.financialImpact.vendorWalletAdjustmentInr !== 0 ||
          order.dispute?.status === "Resolved",
      )
      .map((order): VendorOrderResolutionView => ({
        orderId: order.id,
        productName: order.productName,
        vendorWalletAdjustmentInr: order.financialImpact.vendorWalletAdjustmentInr,
        vendorWalletStatus: order.financialImpact.vendorWalletStatus,
        userRefundStatus: order.financialImpact.userRefundStatus,
        userCashbackStatus: order.financialImpact.userCashbackStatus,
        reason: order.financialImpact.adminReason,
        updatedAtIso: order.financialImpact.updatedAtIso,
      }))
      .sort(
        (first, second) =>
          new Date(second.updatedAtIso).getTime() -
          new Date(first.updatedAtIso).getTime(),
      );
  }

  function approveReturnResolution(returnCaseId: string): OrderOpsMutationResult {
    const targetReturnCase = returnCases.find((returnCase) => returnCase.id === returnCaseId);
    if (!targetReturnCase) {
      return { ok: false, message: "Return case not found." };
    }
    if (targetReturnCase.status === "Closed") {
      return { ok: false, message: "Return case is already closed." };
    }

    const linkedOrder = orders.find((order) => order.id === targetReturnCase.orderId);
    if (!linkedOrder) {
      return { ok: false, message: "Linked order not found for this return case." };
    }

    const nowIso = new Date().toISOString();
    const defaultReason = "Return approved after admin resolution check.";

    setReturnCases((currentCases) =>
      currentCases.map((returnCase) =>
        returnCase.id === returnCaseId
          ? {
              ...returnCase,
              status: "Closed",
              adminReason: defaultReason,
              updatedAtIso: nowIso,
            }
          : returnCase,
      ),
    );

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === targetReturnCase.orderId
          ? {
              ...order,
              status: "Cancelled",
              userAction: "Return Requested",
              deliveryPartnerStatus: "Return received and refund approved",
              financialImpact: {
                vendorWalletAdjustmentInr: -Math.abs(order.amountInr),
                vendorWalletStatus: "Return deduction applied",
                userRefundStatus: "Refund Approved",
                userCashbackStatus: "Cancelled",
                adminReason: defaultReason,
                updatedAtIso: nowIso,
              },
              updatedAtIso: nowIso,
            }
          : order,
      ),
    );

    addAuditLog(targetReturnCase.orderId, "Return Approved", defaultReason);
    return { ok: true, message: "Return approved and closed with refund impact." };
  }

  function closeReturnWithReason(
    returnCaseId: string,
    reason: string,
  ): OrderOpsMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required to close return." };
    }

    const targetReturnCase = returnCases.find((returnCase) => returnCase.id === returnCaseId);
    if (!targetReturnCase) {
      return { ok: false, message: "Return case not found." };
    }

    const linkedOrder = orders.find((order) => order.id === targetReturnCase.orderId);
    if (!linkedOrder) {
      return { ok: false, message: "Linked order not found for this return case." };
    }

    const nowIso = new Date().toISOString();
    setReturnCases((currentCases) =>
      currentCases.map((returnCase) =>
        returnCase.id === returnCaseId
          ? {
              ...returnCase,
              status: "Closed",
              adminReason: trimmedReason,
              updatedAtIso: nowIso,
            }
          : returnCase,
      ),
    );

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === targetReturnCase.orderId
          ? {
              ...order,
              status: "Delivered",
              userAction: "No Return",
              deliveryPartnerStatus: "Return request closed by admin",
              financialImpact: {
                vendorWalletAdjustmentInr: 0,
                vendorWalletStatus: "No deduction after closure",
                userRefundStatus: "Refund Rejected",
                userCashbackStatus: "Confirmed",
                adminReason: trimmedReason,
                updatedAtIso: nowIso,
              },
              updatedAtIso: nowIso,
            }
          : order,
      ),
    );

    addAuditLog(targetReturnCase.orderId, "Return Closed", trimmedReason);
    return { ok: true, message: "Return closed with admin reason and financial update." };
  }

  function confirmRtoCharge(rtoCaseId: string, reason: string): OrderOpsMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required to confirm RTO charge." };
    }

    const targetRtoCase = rtoCases.find((rtoCase) => rtoCase.id === rtoCaseId);
    if (!targetRtoCase) {
      return { ok: false, message: "RTO case not found." };
    }

    const nowIso = new Date().toISOString();
    setRtoCases((currentCases) =>
      currentCases.map((rtoCase) =>
        rtoCase.id === rtoCaseId
          ? {
              ...rtoCase,
              adjustmentStatus: "Charge Confirmed",
              adminReason: trimmedReason,
              updatedAtIso: nowIso,
            }
          : rtoCase,
      ),
    );

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === targetRtoCase.orderId
          ? {
              ...order,
              financialImpact: {
                ...order.financialImpact,
                vendorWalletAdjustmentInr: -Math.abs(targetRtoCase.rtoChargeInr),
                vendorWalletStatus: "RTO charge debited",
                adminReason: trimmedReason,
                updatedAtIso: nowIso,
              },
              updatedAtIso: nowIso,
            }
          : order,
      ),
    );

    addAuditLog(targetRtoCase.orderId, "RTO Charge Confirmed", trimmedReason);
    return { ok: true, message: "RTO charge confirmed with vendor wallet impact." };
  }

  function reverseRtoCharge(rtoCaseId: string, reason: string): OrderOpsMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required to reverse RTO charge." };
    }

    const targetRtoCase = rtoCases.find((rtoCase) => rtoCase.id === rtoCaseId);
    if (!targetRtoCase) {
      return { ok: false, message: "RTO case not found." };
    }

    const nowIso = new Date().toISOString();
    setRtoCases((currentCases) =>
      currentCases.map((rtoCase) =>
        rtoCase.id === rtoCaseId
          ? {
              ...rtoCase,
              adjustmentStatus: "Charge Reversed",
              adminReason: trimmedReason,
              updatedAtIso: nowIso,
            }
          : rtoCase,
      ),
    );

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === targetRtoCase.orderId
          ? {
              ...order,
              financialImpact: {
                ...order.financialImpact,
                vendorWalletAdjustmentInr: Math.abs(targetRtoCase.rtoChargeInr),
                vendorWalletStatus: "RTO charge reversed",
                adminReason: trimmedReason,
                updatedAtIso: nowIso,
              },
              updatedAtIso: nowIso,
            }
          : order,
      ),
    );

    addAuditLog(targetRtoCase.orderId, "RTO Charge Reversed", trimmedReason);
    return { ok: true, message: "RTO charge reversed. Vendor protection applied." };
  }

  function assignDisputeFault(
    orderId: string,
    fault: AdminFaultAssignee,
    reason: string,
  ): OrderOpsMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required to assign dispute fault." };
    }

    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) {
      return { ok: false, message: "Order not found." };
    }
    if (!targetOrder.dispute || !targetOrder.dispute.isFlagged) {
      return { ok: false, message: "No flagged dispute for this order." };
    }

    const nowIso = new Date().toISOString();
    const disputeImpact = getDisputeImpactByFault(targetOrder.amountInr, fault);

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              dispute: order.dispute
                ? {
                    ...order.dispute,
                    status: "Resolved",
                    assignedFault: fault,
                    adminReason: trimmedReason,
                    updatedAtIso: nowIso,
                  }
                : order.dispute,
              financialImpact: {
                ...order.financialImpact,
                vendorWalletAdjustmentInr: disputeImpact.vendorWalletAdjustmentInr,
                vendorWalletStatus: disputeImpact.vendorWalletStatus,
                userRefundStatus: disputeImpact.userRefundStatus,
                userCashbackStatus: disputeImpact.userCashbackStatus,
                adminReason: trimmedReason,
                updatedAtIso: nowIso,
              },
              updatedAtIso: nowIso,
            }
          : order,
      ),
    );

    addAuditLog(orderId, "Dispute Fault Assigned", trimmedReason);
    return { ok: true, message: `Dispute resolved with fault assigned to ${fault}.` };
  }

  const value = useMemo<OrderOperationsContextValue>(
    () => ({
      orders,
      returnCases,
      rtoCases,
      auditLog,
      getOrderById,
      getOrderAuditLog,
      getUserOrderResolutionByOrderId,
      getVendorOrderResolutionFeed,
      approveReturnResolution,
      closeReturnWithReason,
      confirmRtoCharge,
      reverseRtoCharge,
      assignDisputeFault,
    }),
    [orders, returnCases, rtoCases, auditLog],
  );

  return (
    <OrderOperationsContext.Provider value={value}>
      {children}
    </OrderOperationsContext.Provider>
  );
}

export function useOrderOperations() {
  const context = useContext(OrderOperationsContext);
  if (!context) {
    throw new Error(
      "useOrderOperations must be used within OrderOperationsProvider.",
    );
  }
  return context;
}
