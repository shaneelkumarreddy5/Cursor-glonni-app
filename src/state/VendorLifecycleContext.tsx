import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type VendorLifecycleStatus =
  | "Under Scrutiny"
  | "Approved"
  | "Rejected"
  | "Suspended";

export type VendorActionType = "Approved" | "Rejected" | "Suspended";

export type VendorBusinessDetails = {
  ownerName: string;
  legalEntityName: string;
  gstNumber: string;
  phone: string;
  email: string;
  address: string;
};

export type VendorDocument = {
  id: string;
  title: string;
  fileName: string;
  submittedAtIso: string;
};

export type VendorBankSnapshot = {
  accountHolderName: string;
  accountNumberMasked: string;
  ifscCode: string;
  bankName: string;
};

export type VendorLifecycleRecord = {
  id: string;
  vendorName: string;
  businessType: string;
  joinedAtIso: string;
  status: VendorLifecycleStatus;
  statusReason: string | null;
  statusUpdatedAtIso: string;
  businessDetails: VendorBusinessDetails;
  submittedDocuments: VendorDocument[];
  bankDetails: VendorBankSnapshot;
};

export type VendorAuditLogEntry = {
  id: string;
  vendorId: string;
  actionType: VendorActionType;
  reason: string;
  createdAtIso: string;
};

type VendorLifecycleMutationResult = {
  ok: boolean;
  message: string;
};

type VendorLifecycleContextValue = {
  activeVendorId: string;
  vendors: VendorLifecycleRecord[];
  auditLog: VendorAuditLogEntry[];
  getVendorById: (vendorId: string) => VendorLifecycleRecord | undefined;
  getVendorAuditLog: (vendorId: string) => VendorAuditLogEntry[];
  approveVendor: (
    vendorId: string,
    reason: string,
  ) => VendorLifecycleMutationResult;
  rejectVendor: (
    vendorId: string,
    reason: string,
  ) => VendorLifecycleMutationResult;
  suspendVendor: (
    vendorId: string,
    reason: string,
  ) => VendorLifecycleMutationResult;
  syncVendorStatus: (
    vendorId: string,
    status: VendorLifecycleStatus,
    reason: string | null,
  ) => void;
};

export const ACTIVE_VENDOR_ID = "VND-1001";

const SEEDED_VENDORS: VendorLifecycleRecord[] = [
  {
    id: ACTIVE_VENDOR_ID,
    vendorName: "Astra Retail LLP",
    businessType: "Electronics Retailer",
    joinedAtIso: "2025-06-12T10:30:00.000Z",
    status: "Under Scrutiny",
    statusReason: "Profile submitted and waiting for admin review.",
    statusUpdatedAtIso: "2026-02-10T09:00:00.000Z",
    businessDetails: {
      ownerName: "Rohit Mehta",
      legalEntityName: "Astra Retail LLP",
      gstNumber: "27ABCDE1234F1Z5",
      phone: "+91 98765 43110",
      email: "compliance@astraretail.in",
      address: "Andheri East, Mumbai, Maharashtra - 400059",
    },
    submittedDocuments: [
      {
        id: "DOC-ASTRA-1",
        title: "Business Registration Certificate",
        fileName: "astra-registration.pdf",
        submittedAtIso: "2026-02-10T08:30:00.000Z",
      },
      {
        id: "DOC-ASTRA-2",
        title: "GST Certificate",
        fileName: "astra-gst-certificate.pdf",
        submittedAtIso: "2026-02-10T08:31:00.000Z",
      },
      {
        id: "DOC-ASTRA-3",
        title: "Cancelled Cheque",
        fileName: "astra-cancelled-cheque.jpg",
        submittedAtIso: "2026-02-10T08:32:00.000Z",
      },
    ],
    bankDetails: {
      accountHolderName: "Astra Retail LLP",
      accountNumberMasked: "XXXXXX245901",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
    },
  },
  {
    id: "VND-1002",
    vendorName: "Nova Digital Hub",
    businessType: "Mobile & Accessories",
    joinedAtIso: "2025-04-18T12:45:00.000Z",
    status: "Approved",
    statusReason: "All onboarding and bank verification checks passed.",
    statusUpdatedAtIso: "2026-01-25T11:15:00.000Z",
    businessDetails: {
      ownerName: "Ananya Jain",
      legalEntityName: "Nova Digital Hub Pvt Ltd",
      gstNumber: "29AACCN1100Q1ZX",
      phone: "+91 99881 22440",
      email: "ops@novadigitalhub.in",
      address: "Indiranagar, Bengaluru, Karnataka - 560038",
    },
    submittedDocuments: [
      {
        id: "DOC-NOVA-1",
        title: "Business Registration Certificate",
        fileName: "nova-registration.pdf",
        submittedAtIso: "2026-01-20T07:20:00.000Z",
      },
      {
        id: "DOC-NOVA-2",
        title: "GST Certificate",
        fileName: "nova-gst-certificate.pdf",
        submittedAtIso: "2026-01-20T07:22:00.000Z",
      },
    ],
    bankDetails: {
      accountHolderName: "Nova Digital Hub Pvt Ltd",
      accountNumberMasked: "XXXXXX419834",
      ifscCode: "ICIC0004421",
      bankName: "ICICI Bank",
    },
  },
  {
    id: "VND-1003",
    vendorName: "Swift Commerce India",
    businessType: "Multi-category Distributor",
    joinedAtIso: "2025-08-03T09:10:00.000Z",
    status: "Rejected",
    statusReason: "KYC mismatch between legal entity name and GST records.",
    statusUpdatedAtIso: "2026-02-02T10:05:00.000Z",
    businessDetails: {
      ownerName: "Karan Sethi",
      legalEntityName: "Swift Commerce India",
      gstNumber: "07AAPCS2200P1Z8",
      phone: "+91 98100 44562",
      email: "risk@swiftcommerce.in",
      address: "Dwarka Sector 12, New Delhi - 110078",
    },
    submittedDocuments: [
      {
        id: "DOC-SWIFT-1",
        title: "Business Registration Certificate",
        fileName: "swift-registration.pdf",
        submittedAtIso: "2026-01-31T06:42:00.000Z",
      },
      {
        id: "DOC-SWIFT-2",
        title: "GST Certificate",
        fileName: "swift-gst-certificate.pdf",
        submittedAtIso: "2026-01-31T06:43:00.000Z",
      },
    ],
    bankDetails: {
      accountHolderName: "Swift Commerce India",
      accountNumberMasked: "XXXXXX803145",
      ifscCode: "SBIN0012067",
      bankName: "State Bank of India",
    },
  },
];

const SEEDED_AUDIT_LOG: VendorAuditLogEntry[] = [
  {
    id: "VLOG-1001",
    vendorId: "VND-1002",
    actionType: "Approved",
    reason: "Business documents and bank verification completed successfully.",
    createdAtIso: "2026-01-25T11:15:00.000Z",
  },
  {
    id: "VLOG-1002",
    vendorId: "VND-1003",
    actionType: "Rejected",
    reason: "Legal entity mismatch in submitted GST document.",
    createdAtIso: "2026-02-02T10:05:00.000Z",
  },
];

const VendorLifecycleContext = createContext<VendorLifecycleContextValue | null>(null);

function createAuditLogId() {
  return `VLOG-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function VendorLifecycleProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<VendorLifecycleRecord[]>(SEEDED_VENDORS);
  const [auditLog, setAuditLog] = useState<VendorAuditLogEntry[]>(SEEDED_AUDIT_LOG);

  function getVendorById(vendorId: string) {
    return vendors.find((vendor) => vendor.id === vendorId);
  }

  function getVendorAuditLog(vendorId: string) {
    return auditLog
      .filter((entry) => entry.vendorId === vendorId)
      .sort(
        (first, second) =>
          new Date(second.createdAtIso).getTime() -
          new Date(first.createdAtIso).getTime(),
      );
  }

  function syncVendorStatus(
    vendorId: string,
    status: VendorLifecycleStatus,
    reason: string | null,
  ) {
    const nowIso = new Date().toISOString();
    setVendors((currentVendors) =>
      currentVendors.map((vendor) =>
        vendor.id === vendorId
          ? {
              ...vendor,
              status,
              statusReason: reason ? reason.trim() : null,
              statusUpdatedAtIso: nowIso,
            }
          : vendor,
      ),
    );
  }

  function applyAdminAction(
    vendorId: string,
    actionType: VendorActionType,
    reason: string,
  ): VendorLifecycleMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required for this action." };
    }

    const vendorExists = vendors.some((vendor) => vendor.id === vendorId);
    if (!vendorExists) {
      return { ok: false, message: "Vendor not found." };
    }

    const nowIso = new Date().toISOString();
    setVendors((currentVendors) =>
      currentVendors.map((vendor) =>
        vendor.id === vendorId
          ? {
              ...vendor,
              status: actionType,
              statusReason: trimmedReason,
              statusUpdatedAtIso: nowIso,
            }
          : vendor,
      ),
    );
    setAuditLog((currentLog) => [
      {
        id: createAuditLogId(),
        vendorId,
        actionType,
        reason: trimmedReason,
        createdAtIso: nowIso,
      },
      ...currentLog,
    ]);

    return { ok: true, message: `Vendor moved to ${actionType}.` };
  }

  function approveVendor(vendorId: string, reason: string) {
    return applyAdminAction(vendorId, "Approved", reason);
  }

  function rejectVendor(vendorId: string, reason: string) {
    return applyAdminAction(vendorId, "Rejected", reason);
  }

  function suspendVendor(vendorId: string, reason: string) {
    return applyAdminAction(vendorId, "Suspended", reason);
  }

  const value = useMemo<VendorLifecycleContextValue>(
    () => ({
      activeVendorId: ACTIVE_VENDOR_ID,
      vendors,
      auditLog,
      getVendorById,
      getVendorAuditLog,
      approveVendor,
      rejectVendor,
      suspendVendor,
      syncVendorStatus,
    }),
    [auditLog, vendors],
  );

  return (
    <VendorLifecycleContext.Provider value={value}>
      {children}
    </VendorLifecycleContext.Provider>
  );
}

export function useVendorLifecycle() {
  const context = useContext(VendorLifecycleContext);
  if (!context) {
    throw new Error(
      "useVendorLifecycle must be used within VendorLifecycleProvider.",
    );
  }
  return context;
}
