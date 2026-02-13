import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type VendorStatus = "Under Scrutiny" | "Approved" | "Rejected";

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

type VendorContextValue = {
  isLoggedIn: boolean;
  vendorName: string;
  vendorStatus: VendorStatus;
  canPublishProducts: boolean;
  summaryMetrics: VendorSummaryMetrics;
  loginVendor: (email: string, password: string) => VendorLoginResult;
  logoutVendor: () => void;
  setVendorStatus: (status: VendorStatus) => void;
};

const MOCK_VENDOR_NAME = "Astra Retail LLP";
const MOCK_VENDOR_SUMMARY_METRICS: VendorSummaryMetrics = {
  totalOrders: 284,
  pendingOrders: 19,
  activeProducts: 47,
  pendingSettlementInr: 125430,
};

const VendorContext = createContext<VendorContextValue | null>(null);

export function VendorProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<VendorStatus>("Under Scrutiny");

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

  const value = useMemo<VendorContextValue>(
    () => ({
      isLoggedIn,
      vendorName: MOCK_VENDOR_NAME,
      vendorStatus,
      canPublishProducts: vendorStatus === "Approved",
      summaryMetrics: MOCK_VENDOR_SUMMARY_METRICS,
      loginVendor,
      logoutVendor,
      setVendorStatus,
    }),
    [isLoggedIn, vendorStatus],
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
