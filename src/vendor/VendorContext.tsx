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

type VendorOnboardingResult = {
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

type VendorContextValue = {
  isLoggedIn: boolean;
  vendorName: string;
  vendorStatus: VendorStatus;
  canPublishProducts: boolean;
  onboardingData: VendorOnboardingData | null;
  hasCompletedOnboarding: boolean;
  summaryMetrics: VendorSummaryMetrics;
  loginVendor: (email: string, password: string) => VendorLoginResult;
  submitOnboarding: (
    payload: VendorOnboardingData,
  ) => VendorOnboardingResult;
  approveVendor: () => void;
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
  const [onboardingData, setOnboardingData] = useState<VendorOnboardingData | null>(
    null,
  );

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

  function approveVendor() {
    setVendorStatus("Approved");
  }

  const value = useMemo<VendorContextValue>(
    () => ({
      isLoggedIn,
      vendorName: MOCK_VENDOR_NAME,
      vendorStatus,
      canPublishProducts: vendorStatus === "Approved",
      onboardingData,
      hasCompletedOnboarding: onboardingData !== null,
      summaryMetrics: MOCK_VENDOR_SUMMARY_METRICS,
      loginVendor,
      submitOnboarding,
      approveVendor,
      logoutVendor,
      setVendorStatus,
    }),
    [isLoggedIn, onboardingData, vendorStatus],
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
