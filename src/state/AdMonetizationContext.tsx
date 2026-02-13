import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { catalogProducts, type CatalogCategory } from "../data/mockCatalog";
import { formatInr } from "../utils/currency";

export type AdType = "Sponsored Product" | "Sponsored Category";
export type AdStatus = "Pending" | "Active" | "Paused" | "Expired";
export type AdAuditActionType =
  | "Ad Approved"
  | "Ad Paused"
  | "Ad Resumed"
  | "Ad Stopped"
  | "Pricing Changed"
  | "Visibility Overridden";

type AdMutationResult = {
  ok: boolean;
  message: string;
};

export type AdPricingSlab = {
  adType: AdType;
  dailyPriceInr: number;
  minimumDurationDays: number;
  updatedAtIso: string;
};

type InternalAdRecord = {
  id: string;
  vendorId: string;
  vendorName: string;
  type: AdType;
  productId: string | null;
  productName: string | null;
  category: CatalogCategory | null;
  durationDays: number;
  budgetInr: number;
  amountPaidInr: number;
  dailyPriceInr: number;
  requestedAtIso: string;
  startDateIso: string | null;
  endDateIso: string | null;
  status: AdStatus;
  latestAdminActionLabel: string | null;
  latestAdminReason: string | null;
  latestAdminActionAtIso: string | null;
};

export type PlatformAdRecord = InternalAdRecord;

export type AdAuditLogEntry = {
  id: string;
  actionType: AdAuditActionType;
  adId: string | null;
  vendorId: string | null;
  vendorName: string | null;
  reason: string;
  metadata: string | null;
  createdAtIso: string;
};

type CatalogVisibilityOverride = {
  productId: string;
  isSponsored: boolean;
  reason: string;
  updatedAtIso: string;
};

export type CatalogVisibilityRow = {
  productId: string;
  productName: string;
  category: CatalogCategory;
  defaultSponsored: boolean;
  effectiveSponsored: boolean;
  overrideReason: string | null;
  updatedAtIso: string | null;
};

export type RevenueSummary = {
  totalAdRevenueInr: number;
  activeAdRevenueInr: number;
  completedAdRevenueInr: number;
};

type VendorAdRequestPayload = {
  vendorId: string;
  vendorName: string;
  type: AdType;
  productId: string | null;
  productName: string | null;
  category: CatalogCategory | null;
  durationDays: number;
  budgetInr: number;
};

type AdMonetizationContextValue = {
  ads: PlatformAdRecord[];
  pricingSlabs: AdPricingSlab[];
  auditLog: AdAuditLogEntry[];
  catalogVisibilityRows: CatalogVisibilityRow[];
  revenueSummary: RevenueSummary;
  getAdsForVendor: (vendorId: string) => PlatformAdRecord[];
  getPricingSlabByType: (adType: AdType) => AdPricingSlab;
  getCatalogSponsoredFlag: (productId: string, fallback: boolean) => boolean;
  createVendorAdRequest: (payload: VendorAdRequestPayload) => AdMutationResult;
  approveAd: (adId: string) => AdMutationResult;
  pauseAd: (adId: string, reason: string) => AdMutationResult;
  resumeAd: (adId: string) => AdMutationResult;
  stopAd: (adId: string, reason: string) => AdMutationResult;
  updatePricingSlab: (
    adType: AdType,
    dailyPriceInr: number,
    minimumDurationDays: number,
    reason: string,
  ) => AdMutationResult;
  setCatalogSponsoredOverride: (
    productId: string,
    isSponsored: boolean,
    reason: string,
  ) => AdMutationResult;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const INITIAL_PRICING_SLABS: AdPricingSlab[] = [
  {
    adType: "Sponsored Product",
    dailyPriceInr: 120,
    minimumDurationDays: 3,
    updatedAtIso: "2026-02-01T10:30:00.000Z",
  },
  {
    adType: "Sponsored Category",
    dailyPriceInr: 240,
    minimumDurationDays: 5,
    updatedAtIso: "2026-02-01T10:30:00.000Z",
  },
];

const INITIAL_ADS: InternalAdRecord[] = [
  {
    id: "AD-700121",
    vendorId: "VND-1001",
    vendorName: "Astra Retail LLP",
    type: "Sponsored Product",
    productId: "VPRD-100915",
    productName: "Adidas Runstep Pro",
    category: "Footwear",
    durationDays: 7,
    budgetInr: 1000,
    amountPaidInr: 840,
    dailyPriceInr: 120,
    requestedAtIso: "2026-02-08T09:00:00.000Z",
    startDateIso: "2026-02-08T10:00:00.000Z",
    endDateIso: "2026-02-15T10:00:00.000Z",
    status: "Active",
    latestAdminActionLabel: "Approved",
    latestAdminReason: "Campaign meets sponsored policy checks.",
    latestAdminActionAtIso: "2026-02-08T10:00:00.000Z",
  },
  {
    id: "AD-700254",
    vendorId: "VND-1001",
    vendorName: "Astra Retail LLP",
    type: "Sponsored Category",
    productId: null,
    productName: null,
    category: "Mobiles",
    durationDays: 6,
    budgetInr: 1600,
    amountPaidInr: 1440,
    dailyPriceInr: 240,
    requestedAtIso: "2026-02-11T07:30:00.000Z",
    startDateIso: null,
    endDateIso: null,
    status: "Pending",
    latestAdminActionLabel: null,
    latestAdminReason: null,
    latestAdminActionAtIso: null,
  },
  {
    id: "AD-700337",
    vendorId: "VND-1002",
    vendorName: "Nova Digital Hub",
    type: "Sponsored Product",
    productId: "sp-2",
    productName: "Apple iPhone 15",
    category: "Mobiles",
    durationDays: 10,
    budgetInr: 1500,
    amountPaidInr: 1200,
    dailyPriceInr: 120,
    requestedAtIso: "2026-02-04T06:20:00.000Z",
    startDateIso: "2026-02-04T08:00:00.000Z",
    endDateIso: "2026-02-14T08:00:00.000Z",
    status: "Paused",
    latestAdminActionLabel: "Paused",
    latestAdminReason: "Quality review required for ad media assets.",
    latestAdminActionAtIso: "2026-02-10T11:20:00.000Z",
  },
  {
    id: "AD-700418",
    vendorId: "VND-1002",
    vendorName: "Nova Digital Hub",
    type: "Sponsored Category",
    productId: null,
    productName: null,
    category: "Accessories",
    durationDays: 5,
    budgetInr: 1400,
    amountPaidInr: 1200,
    dailyPriceInr: 240,
    requestedAtIso: "2026-01-25T09:40:00.000Z",
    startDateIso: "2026-01-25T10:30:00.000Z",
    endDateIso: "2026-01-30T10:30:00.000Z",
    status: "Expired",
    latestAdminActionLabel: "Stopped",
    latestAdminReason: "Campaign ended after scheduled completion.",
    latestAdminActionAtIso: "2026-01-30T10:30:00.000Z",
  },
];

const INITIAL_AUDIT_LOG: AdAuditLogEntry[] = [
  {
    id: "ADLOG-100221",
    actionType: "Ad Approved",
    adId: "AD-700121",
    vendorId: "VND-1001",
    vendorName: "Astra Retail LLP",
    reason: "Campaign meets sponsored policy checks.",
    metadata: "Sponsored Product",
    createdAtIso: "2026-02-08T10:00:00.000Z",
  },
  {
    id: "ADLOG-100222",
    actionType: "Ad Paused",
    adId: "AD-700337",
    vendorId: "VND-1002",
    vendorName: "Nova Digital Hub",
    reason: "Quality review required for ad media assets.",
    metadata: "Sponsored Product",
    createdAtIso: "2026-02-10T11:20:00.000Z",
  },
];

const AdMonetizationContext = createContext<AdMonetizationContextValue | null>(null);

function createAdId() {
  return `AD-${Math.floor(100000 + Math.random() * 900000)}`;
}

function createAuditLogId() {
  return `ADLOG-${Math.floor(100000 + Math.random() * 900000)}`;
}

function resolveAdStatus(ad: InternalAdRecord, now = new Date()) {
  if (ad.status === "Expired") {
    return "Expired";
  }
  if (!ad.endDateIso) {
    return ad.status;
  }
  const hasEnded = now.getTime() >= new Date(ad.endDateIso).getTime();
  return hasEnded ? "Expired" : ad.status;
}

function mapAdWithResolvedStatus(ad: InternalAdRecord, now = new Date()): PlatformAdRecord {
  const status = resolveAdStatus(ad, now);
  return {
    ...ad,
    status,
  };
}

export function AdMonetizationProvider({ children }: { children: ReactNode }) {
  const [ads, setAds] = useState<InternalAdRecord[]>(INITIAL_ADS);
  const [pricingSlabs, setPricingSlabs] = useState<AdPricingSlab[]>(INITIAL_PRICING_SLABS);
  const [auditLog, setAuditLog] = useState<AdAuditLogEntry[]>(INITIAL_AUDIT_LOG);
  const [visibilityOverrides, setVisibilityOverrides] = useState<
    Record<string, CatalogVisibilityOverride>
  >({});
  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    const handle = window.setInterval(() => {
      setClockTick((currentTick) => currentTick + 1);
    }, 30_000);
    return () => window.clearInterval(handle);
  }, []);

  const normalizedAds = useMemo(
    () =>
      ads
        .map((ad) => mapAdWithResolvedStatus(ad))
        .sort(
          (first, second) =>
            new Date(second.requestedAtIso).getTime() -
            new Date(first.requestedAtIso).getTime(),
        ),
    [ads, clockTick],
  );

  const revenueSummary = useMemo<RevenueSummary>(() => {
    return normalizedAds.reduce(
      (summary, ad) => {
        const nextSummary: RevenueSummary = {
          ...summary,
          totalAdRevenueInr: summary.totalAdRevenueInr + ad.amountPaidInr,
        };
        if (ad.status === "Active") {
          return {
            ...nextSummary,
            activeAdRevenueInr: nextSummary.activeAdRevenueInr + ad.amountPaidInr,
          };
        }
        if (ad.status === "Expired") {
          return {
            ...nextSummary,
            completedAdRevenueInr: nextSummary.completedAdRevenueInr + ad.amountPaidInr,
          };
        }
        return nextSummary;
      },
      {
        totalAdRevenueInr: 0,
        activeAdRevenueInr: 0,
        completedAdRevenueInr: 0,
      },
    );
  }, [normalizedAds]);

  const catalogVisibilityRows = useMemo<CatalogVisibilityRow[]>(
    () =>
      catalogProducts.map((product) => {
        const override = visibilityOverrides[product.id];
        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          defaultSponsored: product.sponsored,
          effectiveSponsored: override ? override.isSponsored : product.sponsored,
          overrideReason: override ? override.reason : null,
          updatedAtIso: override ? override.updatedAtIso : null,
        };
      }),
    [visibilityOverrides],
  );

  function getPricingSlabByType(adType: AdType) {
    return (
      pricingSlabs.find((slab) => slab.adType === adType) ?? {
        adType,
        dailyPriceInr: 0,
        minimumDurationDays: 1,
        updatedAtIso: new Date().toISOString(),
      }
    );
  }

  function getAdsForVendor(vendorId: string) {
    return normalizedAds.filter((ad) => ad.vendorId === vendorId);
  }

  function getCatalogSponsoredFlag(productId: string, fallback: boolean) {
    const override = visibilityOverrides[productId];
    return override ? override.isSponsored : fallback;
  }

  function appendAuditLog(entry: Omit<AdAuditLogEntry, "id" | "createdAtIso">) {
    const nowIso = new Date().toISOString();
    setAuditLog((currentEntries) => [
      {
        id: createAuditLogId(),
        createdAtIso: nowIso,
        ...entry,
      },
      ...currentEntries,
    ]);
  }

  function createVendorAdRequest(payload: VendorAdRequestPayload): AdMutationResult {
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

    const pricingSlab = getPricingSlabByType(payload.type);
    if (payload.durationDays < pricingSlab.minimumDurationDays) {
      return {
        ok: false,
        message: `Minimum duration for ${payload.type} is ${pricingSlab.minimumDurationDays} days.`,
      };
    }
    const amountPaidInr = pricingSlab.dailyPriceInr * payload.durationDays;
    if (payload.budgetInr < amountPaidInr) {
      return {
        ok: false,
        message: `Budget is lower than fixed pricing (${formatInr(amountPaidInr)}).`,
      };
    }

    const nowIso = new Date().toISOString();
    const nextAd: InternalAdRecord = {
      id: createAdId(),
      vendorId: payload.vendorId,
      vendorName: payload.vendorName,
      type: payload.type,
      productId: payload.type === "Sponsored Product" ? payload.productId : null,
      productName: payload.type === "Sponsored Product" ? payload.productName : null,
      category:
        payload.type === "Sponsored Product" ? payload.category : payload.category,
      durationDays: payload.durationDays,
      budgetInr: payload.budgetInr,
      amountPaidInr,
      dailyPriceInr: pricingSlab.dailyPriceInr,
      requestedAtIso: nowIso,
      startDateIso: null,
      endDateIso: null,
      status: "Pending",
      latestAdminActionLabel: null,
      latestAdminReason: null,
      latestAdminActionAtIso: null,
    };

    setAds((currentAds) => [nextAd, ...currentAds]);
    return {
      ok: true,
      message: `Ad submitted for admin approval. Fixed pricing: ${formatInr(amountPaidInr)}.`,
    };
  }

  function approveAd(adId: string): AdMutationResult {
    const targetAd = ads.find((ad) => ad.id === adId);
    if (!targetAd) {
      return { ok: false, message: "Ad not found." };
    }
    const resolvedStatus = resolveAdStatus(targetAd);
    if (resolvedStatus !== "Pending") {
      return {
        ok: false,
        message: "Only pending ads can be approved.",
      };
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const endIso = new Date(now.getTime() + targetAd.durationDays * DAY_IN_MS).toISOString();
    const actionReason = "Campaign approved and activated.";
    setAds((currentAds) =>
      currentAds.map((ad) =>
        ad.id === adId
          ? {
              ...ad,
              status: "Active",
              startDateIso: nowIso,
              endDateIso: endIso,
              latestAdminActionLabel: "Approved",
              latestAdminReason: actionReason,
              latestAdminActionAtIso: nowIso,
            }
          : ad,
      ),
    );
    appendAuditLog({
      actionType: "Ad Approved",
      adId: targetAd.id,
      vendorId: targetAd.vendorId,
      vendorName: targetAd.vendorName,
      reason: actionReason,
      metadata: targetAd.type,
    });
    return { ok: true, message: "Ad approved and moved to Active." };
  }

  function pauseAd(adId: string, reason: string): AdMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required to pause an ad." };
    }
    const targetAd = ads.find((ad) => ad.id === adId);
    if (!targetAd) {
      return { ok: false, message: "Ad not found." };
    }
    const resolvedStatus = resolveAdStatus(targetAd);
    if (resolvedStatus !== "Active") {
      return { ok: false, message: "Only active ads can be paused." };
    }

    const nowIso = new Date().toISOString();
    setAds((currentAds) =>
      currentAds.map((ad) =>
        ad.id === adId
          ? {
              ...ad,
              status: "Paused",
              latestAdminActionLabel: "Paused",
              latestAdminReason: trimmedReason,
              latestAdminActionAtIso: nowIso,
            }
          : ad,
      ),
    );
    appendAuditLog({
      actionType: "Ad Paused",
      adId: targetAd.id,
      vendorId: targetAd.vendorId,
      vendorName: targetAd.vendorName,
      reason: trimmedReason,
      metadata: targetAd.type,
    });
    return { ok: true, message: "Ad paused successfully." };
  }

  function resumeAd(adId: string): AdMutationResult {
    const targetAd = ads.find((ad) => ad.id === adId);
    if (!targetAd) {
      return { ok: false, message: "Ad not found." };
    }
    const resolvedStatus = resolveAdStatus(targetAd);
    if (resolvedStatus !== "Paused") {
      return { ok: false, message: "Only paused ads can be resumed." };
    }

    const nowIso = new Date().toISOString();
    const actionReason = "Campaign resumed by admin.";
    setAds((currentAds) =>
      currentAds.map((ad) =>
        ad.id === adId
          ? {
              ...ad,
              status: "Active",
              latestAdminActionLabel: "Resumed",
              latestAdminReason: actionReason,
              latestAdminActionAtIso: nowIso,
            }
          : ad,
      ),
    );
    appendAuditLog({
      actionType: "Ad Resumed",
      adId: targetAd.id,
      vendorId: targetAd.vendorId,
      vendorName: targetAd.vendorName,
      reason: actionReason,
      metadata: targetAd.type,
    });
    return { ok: true, message: "Ad resumed and moved to Active." };
  }

  function stopAd(adId: string, reason: string): AdMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required to stop an ad." };
    }
    const targetAd = ads.find((ad) => ad.id === adId);
    if (!targetAd) {
      return { ok: false, message: "Ad not found." };
    }
    const resolvedStatus = resolveAdStatus(targetAd);
    if (resolvedStatus === "Expired") {
      return { ok: false, message: "This ad is already expired." };
    }

    const nowIso = new Date().toISOString();
    setAds((currentAds) =>
      currentAds.map((ad) =>
        ad.id === adId
          ? {
              ...ad,
              status: "Expired",
              endDateIso: nowIso,
              latestAdminActionLabel: "Stopped",
              latestAdminReason: trimmedReason,
              latestAdminActionAtIso: nowIso,
            }
          : ad,
      ),
    );
    appendAuditLog({
      actionType: "Ad Stopped",
      adId: targetAd.id,
      vendorId: targetAd.vendorId,
      vendorName: targetAd.vendorName,
      reason: trimmedReason,
      metadata: targetAd.type,
    });
    return { ok: true, message: "Ad stopped and marked as Expired." };
  }

  function updatePricingSlab(
    adType: AdType,
    dailyPriceInr: number,
    minimumDurationDays: number,
    reason: string,
  ): AdMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required for pricing changes." };
    }
    if (dailyPriceInr <= 0) {
      return { ok: false, message: "Daily price must be greater than ₹0." };
    }
    if (minimumDurationDays <= 0) {
      return { ok: false, message: "Minimum duration must be at least 1 day." };
    }

    const nowIso = new Date().toISOString();
    setPricingSlabs((currentSlabs) =>
      currentSlabs.map((slab) =>
        slab.adType === adType
          ? { ...slab, dailyPriceInr, minimumDurationDays, updatedAtIso: nowIso }
          : slab,
      ),
    );
    appendAuditLog({
      actionType: "Pricing Changed",
      adId: null,
      vendorId: null,
      vendorName: null,
      reason: trimmedReason,
      metadata: `${adType} -> ${formatInr(dailyPriceInr)} / day, minimum ${minimumDurationDays} days`,
    });
    return { ok: true, message: `${adType} pricing slab updated.` };
  }

  function setCatalogSponsoredOverride(
    productId: string,
    isSponsored: boolean,
    reason: string,
  ): AdMutationResult {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      return { ok: false, message: "Reason is required for visibility override." };
    }
    const product = catalogProducts.find((catalogProduct) => catalogProduct.id === productId);
    if (!product) {
      return { ok: false, message: "Catalog product not found." };
    }
    const nowIso = new Date().toISOString();
    setVisibilityOverrides((currentOverrides) => ({
      ...currentOverrides,
      [productId]: {
        productId,
        isSponsored,
        reason: trimmedReason,
        updatedAtIso: nowIso,
      },
    }));
    appendAuditLog({
      actionType: "Visibility Overridden",
      adId: null,
      vendorId: null,
      vendorName: null,
      reason: trimmedReason,
      metadata: `${product.name}: ${isSponsored ? "Sponsored" : "Organic"}`,
    });
    return { ok: true, message: `Visibility override updated for ${product.name}.` };
  }

  const value = useMemo<AdMonetizationContextValue>(
    () => ({
      ads: normalizedAds,
      pricingSlabs,
      auditLog,
      catalogVisibilityRows,
      revenueSummary,
      getAdsForVendor,
      getPricingSlabByType,
      getCatalogSponsoredFlag,
      createVendorAdRequest,
      approveAd,
      pauseAd,
      resumeAd,
      stopAd,
      updatePricingSlab,
      setCatalogSponsoredOverride,
    }),
    [auditLog, catalogVisibilityRows, normalizedAds, pricingSlabs, revenueSummary],
  );

  return (
    <AdMonetizationContext.Provider value={value}>
      {children}
    </AdMonetizationContext.Provider>
  );
}

export function useAdMonetization() {
  const context = useContext(AdMonetizationContext);
  if (!context) {
    throw new Error("useAdMonetization must be used within AdMonetizationProvider.");
  }
  return context;
}
