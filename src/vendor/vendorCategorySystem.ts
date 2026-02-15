import { useSyncExternalStore } from "react";

export type VendorMainCategoryName =
  | "Mobiles & Related"
  | "Computers & Laptops"
  | "Footwear"
  | "Pet Food"
  | "Digital Products";

export type VendorCategoryType = "Physical" | "Digital";
export type CategoryRuleSource = "Main" | "Sub" | "Sub-Sub" | "Digital Override";

export type VendorCategoryRules = {
  cashbackPercentage: number;
  codEligible: boolean;
  returnEligible: boolean;
  shippingRequired: boolean;
  isPhysical: boolean;
};

type VendorCategoryAvailability = {
  isEnabled: boolean;
  disabledReason: string | null;
};

export type VendorSubSubCategory = VendorCategoryAvailability & {
  code: string;
  name: string;
  rules: VendorCategoryRules;
};

export type VendorSubCategory = VendorCategoryAvailability & {
  code: string;
  name: string;
  children: VendorSubSubCategory[];
};

export type VendorMainCategory = VendorCategoryAvailability & {
  code: string;
  name: VendorMainCategoryName;
  children: VendorSubCategory[];
};

export type ResolvedVendorCategorySelection = {
  mainCategoryCode: string;
  subCategoryCode: string;
  subSubCategoryCode: string;
  mainCategoryName: VendorMainCategoryName;
  subCategoryName: string;
  subSubCategoryName: string;
  categoryCode: string;
  categoryPathLabel: string;
  rules: VendorCategoryRules;
  isEnabled: boolean;
  disabledReason: string | null;
};

export type VendorCategoryRuleConfig = {
  cashbackPercentage: number | null;
  codEligible: boolean | null;
  returnEligible: boolean | null;
  categoryType: VendorCategoryType | null;
};

type AdminSubSubCategory = VendorCategoryAvailability & {
  code: string;
  name: string;
  ruleConfig: VendorCategoryRuleConfig;
};

type AdminSubCategory = VendorCategoryAvailability & {
  code: string;
  name: string;
  ruleConfig: VendorCategoryRuleConfig;
  children: AdminSubSubCategory[];
};

type AdminMainCategory = VendorCategoryAvailability & {
  code: string;
  name: VendorMainCategoryName;
  ruleConfig: VendorCategoryRuleConfig;
  children: AdminSubCategory[];
};

type RuleResolution<T> = {
  value: T;
  source: CategoryRuleSource;
};

type EffectiveRuleResolution = {
  cashbackPercentage: RuleResolution<number>;
  codEligible: RuleResolution<boolean>;
  returnEligible: RuleResolution<boolean>;
  categoryType: RuleResolution<VendorCategoryType>;
  shippingRequired: RuleResolution<boolean>;
  isPhysical: RuleResolution<boolean>;
};

export type CategoryManagementMutationResult = {
  ok: boolean;
  message: string;
};

export type CategoryTreeLevel = "main" | "sub" | "subSub";

export type CategoryManagementAuditEntry = {
  id: string;
  adminName: string;
  createdAtIso: string;
  reason: string;
  actionType: "Category Status Updated" | "Category Rules Updated";
  level: "Main" | "Sub" | "Sub-Sub";
  categoryCode: string;
  categoryPath: string;
  changeSummary: string;
};

export type CategoryManagementSubSubCategoryNode = VendorCategoryAvailability & {
  code: string;
  fullCode: string;
  name: string;
  categoryPath: string;
  ruleConfig: VendorCategoryRuleConfig;
  effectiveRules: VendorCategoryRules & { categoryType: VendorCategoryType };
  effectiveRuleSources: Record<keyof EffectiveRuleResolution, CategoryRuleSource>;
};

export type CategoryManagementSubCategoryNode = VendorCategoryAvailability & {
  code: string;
  fullCode: string;
  name: string;
  categoryPath: string;
  ruleConfig: VendorCategoryRuleConfig;
  effectiveRules: VendorCategoryRules & { categoryType: VendorCategoryType };
  effectiveRuleSources: Record<keyof EffectiveRuleResolution, CategoryRuleSource>;
  children: CategoryManagementSubSubCategoryNode[];
};

export type CategoryManagementMainCategoryNode = VendorCategoryAvailability & {
  code: string;
  fullCode: string;
  name: VendorMainCategoryName;
  categoryPath: string;
  ruleConfig: VendorCategoryRuleConfig;
  effectiveRules: VendorCategoryRules & { categoryType: VendorCategoryType };
  effectiveRuleSources: Record<keyof EffectiveRuleResolution, CategoryRuleSource>;
  children: CategoryManagementSubCategoryNode[];
};

export type CategoryManagementSnapshot = {
  categories: CategoryManagementMainCategoryNode[];
  auditLog: CategoryManagementAuditEntry[];
};

type CategoryTarget = {
  mainCategoryCode: string;
  subCategoryCode?: string;
  subSubCategoryCode?: string;
};

type CategoryPointer = {
  main: AdminMainCategory;
  sub: AdminSubCategory | null;
  subSub: AdminSubSubCategory | null;
};

const DEFAULT_RULE_CONFIG: VendorCategoryRuleConfig = {
  cashbackPercentage: null,
  codEligible: null,
  returnEligible: null,
  categoryType: null,
};

const INITIAL_ADMIN_CATEGORIES: AdminMainCategory[] = [
  {
    code: "GL-MOB",
    name: "Mobiles & Related",
    isEnabled: true,
    disabledReason: null,
    ruleConfig: {
      cashbackPercentage: 5,
      codEligible: true,
      returnEligible: true,
      categoryType: "Physical",
    },
    children: [
      {
        code: "SM",
        name: "Smartphones",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 4 },
        children: [
          {
            code: "AN",
            name: "Android Smartphones",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 5 },
          },
          {
            code: "IP",
            name: "iOS Smartphones",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 4 },
          },
        ],
      },
      {
        code: "ACC",
        name: "Accessories",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 7 },
        children: [
          {
            code: "CH",
            name: "Chargers",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 8 },
          },
          {
            code: "EB",
            name: "Earbuds",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 7 },
          },
        ],
      },
    ],
  },
  {
    code: "GL-CMP",
    name: "Computers & Laptops",
    isEnabled: true,
    disabledReason: null,
    ruleConfig: {
      cashbackPercentage: 3,
      codEligible: true,
      returnEligible: true,
      categoryType: "Physical",
    },
    children: [
      {
        code: "LAP",
        name: "Laptops",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 3 },
        children: [
          {
            code: "TL",
            name: "Thin & Light",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 3 },
          },
          {
            code: "GM",
            name: "Gaming Laptops",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: {
              ...DEFAULT_RULE_CONFIG,
              cashbackPercentage: 2,
              codEligible: false,
            },
          },
        ],
      },
      {
        code: "PAC",
        name: "PC Accessories",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 6 },
        children: [
          {
            code: "KB",
            name: "Keyboards",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 6 },
          },
          {
            code: "MS",
            name: "Mouse",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 6 },
          },
        ],
      },
    ],
  },
  {
    code: "GL-FTW",
    name: "Footwear",
    isEnabled: true,
    disabledReason: null,
    ruleConfig: {
      cashbackPercentage: 8,
      codEligible: true,
      returnEligible: true,
      categoryType: "Physical",
    },
    children: [
      {
        code: "SPS",
        name: "Sports Shoes",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 9 },
        children: [
          {
            code: "RUN",
            name: "Running Shoes",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 9 },
          },
          {
            code: "TRN",
            name: "Training Shoes",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 9 },
          },
        ],
      },
      {
        code: "CSL",
        name: "Casual Footwear",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 8 },
        children: [
          {
            code: "SNK",
            name: "Sneakers",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 8 },
          },
          {
            code: "SND",
            name: "Sandals",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 8 },
          },
        ],
      },
    ],
  },
  {
    code: "GL-PET",
    name: "Pet Food",
    isEnabled: true,
    disabledReason: null,
    ruleConfig: {
      cashbackPercentage: 10,
      codEligible: true,
      returnEligible: true,
      categoryType: "Physical",
    },
    children: [
      {
        code: "DOG",
        name: "Dog Food",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 10 },
        children: [
          {
            code: "DRY",
            name: "Dry Food",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 10 },
          },
          {
            code: "WET",
            name: "Wet Food",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 10 },
          },
        ],
      },
      {
        code: "CAT",
        name: "Cat Food",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 10 },
        children: [
          {
            code: "DRY",
            name: "Dry Food",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 10 },
          },
          {
            code: "TRT",
            name: "Treats",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 11 },
          },
        ],
      },
    ],
  },
  {
    code: "GL-DIG",
    name: "Digital Products",
    isEnabled: true,
    disabledReason: null,
    ruleConfig: {
      cashbackPercentage: 2,
      codEligible: false,
      returnEligible: false,
      categoryType: "Digital",
    },
    children: [
      {
        code: "SFT",
        name: "Software",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 2 },
        children: [
          {
            code: "ANT",
            name: "Antivirus Subscriptions",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 2 },
          },
          {
            code: "PRD",
            name: "Productivity Suites",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 2 },
          },
        ],
      },
      {
        code: "GFT",
        name: "Gift Cards & Vouchers",
        isEnabled: true,
        disabledReason: null,
        ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 1 },
        children: [
          {
            code: "GAM",
            name: "Gaming Gift Cards",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 1 },
          },
          {
            code: "OTT",
            name: "OTT Subscriptions",
            isEnabled: true,
            disabledReason: null,
            ruleConfig: { ...DEFAULT_RULE_CONFIG, cashbackPercentage: 1 },
          },
        ],
      },
    ],
  },
];

const LEGACY_CATEGORY_TO_CATEGORY_CODE: Record<string, string> = {
  Mobiles: "GL-MOB-SM-AN",
  Accessories: "GL-MOB-ACC-CH",
  Laptops: "GL-CMP-LAP-TL",
  Footwear: "GL-FTW-SPS-RUN",
};

export const DEFAULT_VENDOR_CATEGORY_CODE = "GL-MOB-SM-AN";
export const VENDOR_MAIN_CATEGORIES: VendorMainCategory[] = [];

let adminCategoryTree: AdminMainCategory[] = cloneAdminCategoryTree(
  INITIAL_ADMIN_CATEGORIES,
);
let categoryAuditLog: CategoryManagementAuditEntry[] = [];

const categoryManagementSubscribers = new Set<() => void>();

function cloneAdminCategoryTree(tree: AdminMainCategory[]) {
  return tree.map((mainCategory) => ({
    ...mainCategory,
    ruleConfig: { ...mainCategory.ruleConfig },
    children: mainCategory.children.map((subCategory) => ({
      ...subCategory,
      ruleConfig: { ...subCategory.ruleConfig },
      children: subCategory.children.map((subSubCategory) => ({
        ...subSubCategory,
        ruleConfig: { ...subSubCategory.ruleConfig },
      })),
    })),
  }));
}

function replaceArrayContents<T>(target: T[], source: T[]) {
  target.splice(0, target.length, ...source);
}

function subscribeCategoryManagement(listener: () => void) {
  categoryManagementSubscribers.add(listener);
  return () => {
    categoryManagementSubscribers.delete(listener);
  };
}

function notifyCategoryManagementSubscribers() {
  categoryManagementSubscribers.forEach((listener) => listener());
}

function createCategoryAuditId() {
  return `CATLOG-${Math.floor(100000 + Math.random() * 900000)}`;
}

function resolveRuleField<T>(
  candidates: Array<{ source: CategoryRuleSource; value: T | null }>,
  fallback: T,
): RuleResolution<T> {
  for (const candidate of candidates) {
    if (candidate.value !== null) {
      return { value: candidate.value, source: candidate.source };
    }
  }
  const fallbackSource =
    candidates.length > 0 ? candidates[candidates.length - 1].source : "Main";
  return { value: fallback, source: fallbackSource };
}

function resolveEffectiveRules(
  mainCategory: AdminMainCategory,
  subCategory: AdminSubCategory | null,
  subSubCategory: AdminSubSubCategory | null,
): EffectiveRuleResolution {
  const cashback = resolveRuleField<number>(
    [
      { source: "Sub-Sub", value: subSubCategory?.ruleConfig.cashbackPercentage ?? null },
      { source: "Sub", value: subCategory?.ruleConfig.cashbackPercentage ?? null },
      { source: "Main", value: mainCategory.ruleConfig.cashbackPercentage },
    ],
    0,
  );

  const cod = resolveRuleField<boolean>(
    [
      { source: "Sub-Sub", value: subSubCategory?.ruleConfig.codEligible ?? null },
      { source: "Sub", value: subCategory?.ruleConfig.codEligible ?? null },
      { source: "Main", value: mainCategory.ruleConfig.codEligible },
    ],
    true,
  );

  const returns = resolveRuleField<boolean>(
    [
      { source: "Sub-Sub", value: subSubCategory?.ruleConfig.returnEligible ?? null },
      { source: "Sub", value: subCategory?.ruleConfig.returnEligible ?? null },
      { source: "Main", value: mainCategory.ruleConfig.returnEligible },
    ],
    true,
  );

  const categoryType = resolveRuleField<VendorCategoryType>(
    [
      { source: "Sub-Sub", value: subSubCategory?.ruleConfig.categoryType ?? null },
      { source: "Sub", value: subCategory?.ruleConfig.categoryType ?? null },
      { source: "Main", value: mainCategory.ruleConfig.categoryType },
    ],
    "Physical",
  );

  const shouldForceDigital =
    mainCategory.code === "GL-DIG" || categoryType.value === "Digital";

  if (shouldForceDigital) {
    return {
      cashbackPercentage: cashback,
      codEligible: { value: false, source: "Digital Override" },
      returnEligible: { value: false, source: "Digital Override" },
      categoryType: { value: "Digital", source: "Digital Override" },
      shippingRequired: { value: false, source: "Digital Override" },
      isPhysical: { value: false, source: "Digital Override" },
    };
  }

  return {
    cashbackPercentage: cashback,
    codEligible: cod,
    returnEligible: returns,
    categoryType: {
      value: "Physical",
      source: categoryType.source,
    },
    shippingRequired: { value: true, source: categoryType.source },
    isPhysical: { value: true, source: categoryType.source },
  };
}

function formatRuleResolutionAsRules(resolution: EffectiveRuleResolution): VendorCategoryRules {
  return {
    cashbackPercentage: resolution.cashbackPercentage.value,
    codEligible: resolution.codEligible.value,
    returnEligible: resolution.returnEligible.value,
    shippingRequired: resolution.shippingRequired.value,
    isPhysical: resolution.isPhysical.value,
  };
}

function toVendorMainCategories(tree: AdminMainCategory[]) {
  return tree
    .filter((mainCategory) => mainCategory.isEnabled)
    .map((mainCategory) => ({
      code: mainCategory.code,
      name: mainCategory.name,
      isEnabled: mainCategory.isEnabled,
      disabledReason: mainCategory.disabledReason,
      children: mainCategory.children
        .filter((subCategory) => subCategory.isEnabled)
        .map((subCategory) => ({
          code: subCategory.code,
          name: subCategory.name,
          isEnabled: subCategory.isEnabled,
          disabledReason: subCategory.disabledReason,
          children: subCategory.children
            .filter((subSubCategory) => subSubCategory.isEnabled)
            .map((subSubCategory) => ({
              code: subSubCategory.code,
              name: subSubCategory.name,
              isEnabled: subSubCategory.isEnabled,
              disabledReason: subSubCategory.disabledReason,
              rules: formatRuleResolutionAsRules(
                resolveEffectiveRules(mainCategory, subCategory, subSubCategory),
              ),
            })),
        })),
    }));
}

function toCategoryManagementSnapshot(): CategoryManagementSnapshot {
  return {
    categories: adminCategoryTree.map((mainCategory) => {
      const mainResolution = resolveEffectiveRules(mainCategory, null, null);
      return {
        code: mainCategory.code,
        fullCode: mainCategory.code,
        name: mainCategory.name,
        categoryPath: mainCategory.name,
        isEnabled: mainCategory.isEnabled,
        disabledReason: mainCategory.disabledReason,
        ruleConfig: { ...mainCategory.ruleConfig },
        effectiveRules: {
          ...formatRuleResolutionAsRules(mainResolution),
          categoryType: mainResolution.categoryType.value,
        },
        effectiveRuleSources: {
          cashbackPercentage: mainResolution.cashbackPercentage.source,
          codEligible: mainResolution.codEligible.source,
          returnEligible: mainResolution.returnEligible.source,
          categoryType: mainResolution.categoryType.source,
          shippingRequired: mainResolution.shippingRequired.source,
          isPhysical: mainResolution.isPhysical.source,
        },
        children: mainCategory.children.map((subCategory) => {
          const subResolution = resolveEffectiveRules(mainCategory, subCategory, null);
          return {
            code: subCategory.code,
            fullCode: `${mainCategory.code}-${subCategory.code}`,
            name: subCategory.name,
            categoryPath: `${mainCategory.name} > ${subCategory.name}`,
            isEnabled: subCategory.isEnabled,
            disabledReason: subCategory.disabledReason,
            ruleConfig: { ...subCategory.ruleConfig },
            effectiveRules: {
              ...formatRuleResolutionAsRules(subResolution),
              categoryType: subResolution.categoryType.value,
            },
            effectiveRuleSources: {
              cashbackPercentage: subResolution.cashbackPercentage.source,
              codEligible: subResolution.codEligible.source,
              returnEligible: subResolution.returnEligible.source,
              categoryType: subResolution.categoryType.source,
              shippingRequired: subResolution.shippingRequired.source,
              isPhysical: subResolution.isPhysical.source,
            },
            children: subCategory.children.map((subSubCategory) => {
              const subSubResolution = resolveEffectiveRules(
                mainCategory,
                subCategory,
                subSubCategory,
              );
              return {
                code: subSubCategory.code,
                fullCode: `${mainCategory.code}-${subCategory.code}-${subSubCategory.code}`,
                name: subSubCategory.name,
                categoryPath: `${mainCategory.name} > ${subCategory.name} > ${subSubCategory.name}`,
                isEnabled: subSubCategory.isEnabled,
                disabledReason: subSubCategory.disabledReason,
                ruleConfig: { ...subSubCategory.ruleConfig },
                effectiveRules: {
                  ...formatRuleResolutionAsRules(subSubResolution),
                  categoryType: subSubResolution.categoryType.value,
                },
                effectiveRuleSources: {
                  cashbackPercentage: subSubResolution.cashbackPercentage.source,
                  codEligible: subSubResolution.codEligible.source,
                  returnEligible: subSubResolution.returnEligible.source,
                  categoryType: subSubResolution.categoryType.source,
                  shippingRequired: subSubResolution.shippingRequired.source,
                  isPhysical: subSubResolution.isPhysical.source,
                },
              };
            }),
          };
        }),
      };
    }),
    auditLog: [...categoryAuditLog].sort(
      (first, second) =>
        new Date(second.createdAtIso).getTime() -
        new Date(first.createdAtIso).getTime(),
    ),
  };
}

function syncDerivedVendorCategoriesAndNotify() {
  replaceArrayContents(VENDOR_MAIN_CATEGORIES, toVendorMainCategories(adminCategoryTree));
  notifyCategoryManagementSubscribers();
}

function getCategoryPointer(target: CategoryTarget): CategoryPointer | null {
  const mainCategory = adminCategoryTree.find(
    (currentMain) => currentMain.code === target.mainCategoryCode,
  );
  if (!mainCategory) {
    return null;
  }
  if (!target.subCategoryCode) {
    return { main: mainCategory, sub: null, subSub: null };
  }
  const subCategory = mainCategory.children.find(
    (currentSub) => currentSub.code === target.subCategoryCode,
  );
  if (!subCategory) {
    return null;
  }
  if (!target.subSubCategoryCode) {
    return { main: mainCategory, sub: subCategory, subSub: null };
  }
  const subSubCategory = subCategory.children.find(
    (currentSubSub) => currentSubSub.code === target.subSubCategoryCode,
  );
  if (!subSubCategory) {
    return null;
  }
  return { main: mainCategory, sub: subCategory, subSub: subSubCategory };
}

function getCategoryLabelByPointer(pointer: CategoryPointer) {
  if (pointer.subSub) {
    return `${pointer.main.name} > ${pointer.sub?.name ?? ""} > ${pointer.subSub.name}`;
  }
  if (pointer.sub) {
    return `${pointer.main.name} > ${pointer.sub.name}`;
  }
  return pointer.main.name;
}

function getCategoryCodeByPointer(pointer: CategoryPointer) {
  if (pointer.subSub) {
    return `${pointer.main.code}-${pointer.sub?.code ?? ""}-${pointer.subSub.code}`;
  }
  if (pointer.sub) {
    return `${pointer.main.code}-${pointer.sub.code}`;
  }
  return pointer.main.code;
}

function appendCategoryAuditEntry(
  entry: Omit<CategoryManagementAuditEntry, "id" | "createdAtIso">,
) {
  const nowIso = new Date().toISOString();
  categoryAuditLog = [
    {
      id: createCategoryAuditId(),
      createdAtIso: nowIso,
      ...entry,
    },
    ...categoryAuditLog,
  ];
}

function normalizeReason(reason: string) {
  return reason.trim();
}

function resolveCategoryLevel(pointer: CategoryPointer): CategoryManagementAuditEntry["level"] {
  if (pointer.subSub) {
    return "Sub-Sub";
  }
  if (pointer.sub) {
    return "Sub";
  }
  return "Main";
}

function validateRuleConfig(ruleConfig: VendorCategoryRuleConfig) {
  if (
    ruleConfig.cashbackPercentage !== null &&
    (ruleConfig.cashbackPercentage < 0 || ruleConfig.cashbackPercentage > 100)
  ) {
    return "Cashback percentage must be between 0 and 100.";
  }
  return null;
}

function resolveRuleConfigTarget(pointer: CategoryPointer) {
  if (pointer.subSub) {
    return pointer.subSub;
  }
  if (pointer.sub) {
    return pointer.sub;
  }
  return pointer.main;
}

function isTargetEnabled(pointer: CategoryPointer) {
  if (pointer.subSub) {
    return pointer.main.isEnabled && Boolean(pointer.sub?.isEnabled) && pointer.subSub.isEnabled;
  }
  if (pointer.sub) {
    return pointer.main.isEnabled && pointer.sub.isEnabled;
  }
  return pointer.main.isEnabled;
}

export function getVendorCategoryManagementSnapshot() {
  return toCategoryManagementSnapshot();
}

export function useVendorCategoryManagementSnapshot() {
  return useSyncExternalStore(
    subscribeCategoryManagement,
    getVendorCategoryManagementSnapshot,
    getVendorCategoryManagementSnapshot,
  );
}

export function updateVendorCategoryEnabled(
  target: CategoryTarget & {
    isEnabled: boolean;
    reason: string;
    adminName: string;
  },
): CategoryManagementMutationResult {
  const trimmedReason = normalizeReason(target.reason);
  if (!trimmedReason) {
    return { ok: false, message: "Reason is required for category status changes." };
  }
  const pointer = getCategoryPointer(target);
  if (!pointer) {
    return { ok: false, message: "Category not found." };
  }

  const categoryNode = resolveRuleConfigTarget(pointer);
  categoryNode.isEnabled = target.isEnabled;
  categoryNode.disabledReason = target.isEnabled
    ? null
    : `Disabled by Admin: ${trimmedReason}`;

  appendCategoryAuditEntry({
    adminName: target.adminName.trim() || "Glonni Admin",
    reason: trimmedReason,
    actionType: "Category Status Updated",
    level: resolveCategoryLevel(pointer),
    categoryCode: getCategoryCodeByPointer(pointer),
    categoryPath: getCategoryLabelByPointer(pointer),
    changeSummary: target.isEnabled
      ? "Category enabled for vendor listing and submissions."
      : "Category disabled for vendor listing and submissions.",
  });
  syncDerivedVendorCategoriesAndNotify();

  return {
    ok: true,
    message: target.isEnabled
      ? "Category enabled successfully."
      : "Category disabled successfully.",
  };
}

export function updateVendorCategoryRuleConfig(
  target: CategoryTarget & {
    ruleConfig: VendorCategoryRuleConfig;
    reason: string;
    adminName: string;
  },
): CategoryManagementMutationResult {
  const trimmedReason = normalizeReason(target.reason);
  if (!trimmedReason) {
    return { ok: false, message: "Reason is required for rule updates." };
  }
  const validationError = validateRuleConfig(target.ruleConfig);
  if (validationError) {
    return { ok: false, message: validationError };
  }
  const pointer = getCategoryPointer(target);
  if (!pointer) {
    return { ok: false, message: "Category not found." };
  }
  const categoryNode = resolveRuleConfigTarget(pointer);

  categoryNode.ruleConfig = {
    cashbackPercentage: target.ruleConfig.cashbackPercentage,
    codEligible: target.ruleConfig.codEligible,
    returnEligible: target.ruleConfig.returnEligible,
    categoryType: target.ruleConfig.categoryType,
  };

  appendCategoryAuditEntry({
    adminName: target.adminName.trim() || "Glonni Admin",
    reason: trimmedReason,
    actionType: "Category Rules Updated",
    level: resolveCategoryLevel(pointer),
    categoryCode: getCategoryCodeByPointer(pointer),
    categoryPath: getCategoryLabelByPointer(pointer),
    changeSummary:
      "Updated cashback, COD, return, and category type rule configuration.",
  });
  syncDerivedVendorCategoriesAndNotify();

  return {
    ok: true,
    message: "Category rules updated successfully.",
  };
}

export function isVendorCategorySelectionEnabled(
  mainCategoryCode: string,
  subCategoryCode: string,
  subSubCategoryCode: string,
) {
  const pointer = getCategoryPointer({
    mainCategoryCode,
    subCategoryCode,
    subSubCategoryCode,
  });
  if (!pointer || !pointer.sub || !pointer.subSub) {
    return false;
  }
  return isTargetEnabled(pointer);
}

export function getVendorSubCategories(mainCategoryCode: string) {
  return (
    VENDOR_MAIN_CATEGORIES.find((mainCategory) => mainCategory.code === mainCategoryCode)
      ?.children ?? []
  );
}

export function getVendorSubSubCategories(
  mainCategoryCode: string,
  subCategoryCode: string,
) {
  return (
    getVendorSubCategories(mainCategoryCode).find(
      (subCategory) => subCategory.code === subCategoryCode,
    )?.children ?? []
  );
}

export function resolveVendorCategorySelection(
  mainCategoryCode: string,
  subCategoryCode: string,
  subSubCategoryCode: string,
): ResolvedVendorCategorySelection | null {
  const pointer = getCategoryPointer({
    mainCategoryCode,
    subCategoryCode,
    subSubCategoryCode,
  });
  if (!pointer || !pointer.sub || !pointer.subSub) {
    return null;
  }

  const resolvedRules = formatRuleResolutionAsRules(
    resolveEffectiveRules(pointer.main, pointer.sub, pointer.subSub),
  );
  const categoryCode = `${pointer.main.code}-${pointer.sub.code}-${pointer.subSub.code}`;
  const categoryPathLabel = `${pointer.main.name} > ${pointer.sub.name} > ${pointer.subSub.name}`;
  const isEnabled = isTargetEnabled(pointer);
  const disabledReason =
    pointer.subSub.disabledReason ??
    pointer.sub.disabledReason ??
    pointer.main.disabledReason;

  return {
    mainCategoryCode: pointer.main.code,
    subCategoryCode: pointer.sub.code,
    subSubCategoryCode: pointer.subSub.code,
    mainCategoryName: pointer.main.name,
    subCategoryName: pointer.sub.name,
    subSubCategoryName: pointer.subSub.name,
    categoryCode,
    categoryPathLabel,
    rules: resolvedRules,
    isEnabled,
    disabledReason: isEnabled ? null : disabledReason ?? "Selected category is disabled.",
  };
}

export function resolveVendorCategorySelectionByCategoryCode(categoryCode: string) {
  const codeSegments = categoryCode.split("-");
  if (codeSegments.length < 4) {
    return null;
  }

  const mainCategoryCode = `${codeSegments[0]}-${codeSegments[1]}`;
  const subCategoryCode = codeSegments[2];
  const subSubCategoryCode = codeSegments[3];

  return resolveVendorCategorySelection(
    mainCategoryCode,
    subCategoryCode,
    subSubCategoryCode,
  );
}

export function resolveVendorCategorySelectionFromLegacyCategory(legacyCategory: string) {
  const mappedCategoryCode =
    LEGACY_CATEGORY_TO_CATEGORY_CODE[legacyCategory] ?? DEFAULT_VENDOR_CATEGORY_CODE;
  return resolveVendorCategorySelectionByCategoryCode(mappedCategoryCode);
}

export function getDefaultVendorCategorySelection() {
  return resolveVendorCategorySelectionByCategoryCode(DEFAULT_VENDOR_CATEGORY_CODE);
}

syncDerivedVendorCategoriesAndNotify();
