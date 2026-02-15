export type VendorMainCategoryName =
  | "Mobiles & Related"
  | "Computers & Laptops"
  | "Footwear"
  | "Pet Food"
  | "Digital Products";

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

export const VENDOR_MAIN_CATEGORIES: VendorMainCategory[] = [
  {
    code: "GL-MOB",
    name: "Mobiles & Related",
    isEnabled: true,
    disabledReason: null,
    children: [
      {
        code: "SM",
        name: "Smartphones",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "AN",
            name: "Android Smartphones",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 5,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
          {
            code: "IP",
            name: "iOS Smartphones",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 4,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
        ],
      },
      {
        code: "ACC",
        name: "Accessories",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "CH",
            name: "Chargers",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 8,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
          {
            code: "EB",
            name: "Earbuds",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 7,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
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
    children: [
      {
        code: "LAP",
        name: "Laptops",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "TL",
            name: "Thin & Light",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 3,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
          {
            code: "GM",
            name: "Gaming Laptops",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 2,
              codEligible: false,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
        ],
      },
      {
        code: "PAC",
        name: "PC Accessories",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "KB",
            name: "Keyboards",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 6,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
          {
            code: "MS",
            name: "Mouse",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 6,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
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
    children: [
      {
        code: "SPS",
        name: "Sports Shoes",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "RUN",
            name: "Running Shoes",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 9,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
          {
            code: "TRN",
            name: "Training Shoes",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 9,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
        ],
      },
      {
        code: "CSL",
        name: "Casual Footwear",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "SNK",
            name: "Sneakers",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 8,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
          {
            code: "SND",
            name: "Sandals",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 8,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
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
    children: [
      {
        code: "DOG",
        name: "Dog Food",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "DRY",
            name: "Dry Food",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 10,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
          {
            code: "WET",
            name: "Wet Food",
            isEnabled: false,
            disabledReason:
              "This category is currently disabled by Admin for policy review.",
            rules: {
              cashbackPercentage: 10,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
        ],
      },
      {
        code: "CAT",
        name: "Cat Food",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "DRY",
            name: "Dry Food",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 10,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
          },
          {
            code: "TRT",
            name: "Treats",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 11,
              codEligible: true,
              returnEligible: true,
              shippingRequired: true,
              isPhysical: true,
            },
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
    children: [
      {
        code: "SFT",
        name: "Software",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "ANT",
            name: "Antivirus Subscriptions",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 2,
              codEligible: false,
              returnEligible: false,
              shippingRequired: false,
              isPhysical: false,
            },
          },
          {
            code: "PRD",
            name: "Productivity Suites",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 2,
              codEligible: false,
              returnEligible: false,
              shippingRequired: false,
              isPhysical: false,
            },
          },
        ],
      },
      {
        code: "GFT",
        name: "Gift Cards & Vouchers",
        isEnabled: true,
        disabledReason: null,
        children: [
          {
            code: "GAM",
            name: "Gaming Gift Cards",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 1,
              codEligible: false,
              returnEligible: false,
              shippingRequired: false,
              isPhysical: false,
            },
          },
          {
            code: "OTT",
            name: "OTT Subscriptions",
            isEnabled: true,
            disabledReason: null,
            rules: {
              cashbackPercentage: 1,
              codEligible: false,
              returnEligible: false,
              shippingRequired: false,
              isPhysical: false,
            },
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
  const mainCategory = VENDOR_MAIN_CATEGORIES.find(
    (currentMainCategory) => currentMainCategory.code === mainCategoryCode,
  );
  if (!mainCategory) {
    return null;
  }

  const subCategory = mainCategory.children.find(
    (currentSubCategory) => currentSubCategory.code === subCategoryCode,
  );
  if (!subCategory) {
    return null;
  }

  const subSubCategory = subCategory.children.find(
    (currentSubSubCategory) => currentSubSubCategory.code === subSubCategoryCode,
  );
  if (!subSubCategory) {
    return null;
  }

  const categoryCode = `${mainCategory.code}-${subCategory.code}-${subSubCategory.code}`;
  const categoryPathLabel = `${mainCategory.name} > ${subCategory.name} > ${subSubCategory.name}`;
  const isEnabled =
    mainCategory.isEnabled && subCategory.isEnabled && subSubCategory.isEnabled;
  const disabledReason =
    subSubCategory.disabledReason ??
    subCategory.disabledReason ??
    mainCategory.disabledReason;

  return {
    mainCategoryCode: mainCategory.code,
    subCategoryCode: subCategory.code,
    subSubCategoryCode: subSubCategory.code,
    mainCategoryName: mainCategory.name,
    subCategoryName: subCategory.name,
    subSubCategoryName: subSubCategory.name,
    categoryCode,
    categoryPathLabel,
    rules: subSubCategory.rules,
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
