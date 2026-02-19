import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FilterIcon } from "../components/ui/FilterIcon";
import { bankOffers, catalogProducts, type CatalogCategory, type CatalogProduct } from "../data/mockCatalog";
import { ROUTES } from "../routes/paths";
import { useAdMonetization } from "../state/AdMonetizationContext";
import { formatInr } from "../utils/currency";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m12 2.5 2.93 5.93 6.55.95-4.74 4.62 1.12 6.53L12 17.45l-5.86 3.08 1.12-6.53-4.74-4.62 6.55-.95L12 2.5Z" />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20.2s-6.6-4.18-9.07-8.4A5.44 5.44 0 0 1 4.96 4.4a5.55 5.55 0 0 1 7.04 1.6 5.55 5.55 0 0 1 7.04-1.6 5.44 5.44 0 0 1 2.03 7.4C18.6 16.02 12 20.2 12 20.2Z" />
    </svg>
  );
}

type SortOption = "price-low-high" | "price-high-low" | "popularity";

type PriceFilter = {
  id: string;
  label: string;
  min: number;
  max: number | null;
};

const PRICE_FILTERS: PriceFilter[] = [
  { id: "under-10000", label: "Under ₹10,000", min: 0, max: 10000 },
  { id: "10000-30000", label: "₹10,000 - ₹30,000", min: 10000, max: 30000 },
  { id: "30000-60000", label: "₹30,000 - ₹60,000", min: 30000, max: 60000 },
  { id: "above-60000", label: "Above ₹60,000", min: 60000, max: null },
];

type FeedItem = {
  id: string;
  product: CatalogProduct & { sponsored: boolean };
  slotTag: "Sponsored" | "Related" | "Organic";
};

function isWithinAnySelectedPriceRange(priceInr: number, selectedPriceRangeIds: string[]) {
  if (selectedPriceRangeIds.length === 0) {
    return true;
  }

  return selectedPriceRangeIds.some((selectedId) => {
    const matchingRange = PRICE_FILTERS.find((range) => range.id === selectedId);
    if (!matchingRange) {
      return false;
    }

    const isAtLeastMin = priceInr >= matchingRange.min;
    const isWithinMax =
      matchingRange.max === null ? true : priceInr <= matchingRange.max;
    return isAtLeastMin && isWithinMax;
  });
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7 6h10M9 12h6M11 18h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CouponIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M20 12a2 2 0 0 0 0-4V6a2 2 0 0 0-2-2h-2a2 2 0 0 1-4 0H6a2 2 0 0 0-2 2v2a2 2 0 0 1 0 4v2a2 2 0 0 0 2 2h2a2 2 0 0 1 4 0h6a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9h.01M15 15h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 9 9 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ProductOfferKind = "bank" | "brand" | "coupon" | "combo";

type ProductOfferPresentation = {
  kind: ProductOfferKind;
  text: string;
  logoType: "image" | "icon";
  logoUrl?: string;
  logoAlt?: string;
};

function normalizeOfferText(text: string) {
  return text.replace(/^best offer:\s*/i, "").trim();
}

function resolveBestOfferPresentation(product: CatalogProduct, fallbackBank = bankOffers[0]): ProductOfferPresentation | null {
  const rawOffer = product.bestOfferLine?.trim();
  if (!rawOffer) {
    if (!fallbackBank) {
      return null;
    }
    return {
      kind: "bank",
      text: `Bank offer: ${fallbackBank.offerText}`,
      logoType: "image",
      logoUrl: fallbackBank.logoUrl,
      logoAlt: fallbackBank.bankName,
    };
  }

  const offer = normalizeOfferText(rawOffer);
  const offerLower = offer.toLowerCase();

  const matchedBank =
    bankOffers.find((bank) => offerLower.includes(bank.bankName.toLowerCase())) ??
    (offerLower.includes("bank") || offerLower.includes("card") || offerLower.includes("emi")
      ? (bankOffers[0] ?? null)
      : null);

  if (matchedBank) {
    return {
      kind: "bank",
      text: offer,
      logoType: "image",
      logoUrl: matchedBank.logoUrl,
      logoAlt: matchedBank.bankName,
    };
  }

  if (offerLower.includes("coupon") || offerLower.includes("code")) {
    return {
      kind: "coupon",
      text: offer,
      logoType: "icon",
    };
  }

  if (offerLower.includes("combo") || offerLower.includes("bundle") || offerLower.includes("buy")) {
    return {
      kind: "combo",
      text: offer,
      logoType: "icon",
    };
  }

  return {
    kind: "brand",
    text: offer,
    logoType: "image",
    logoUrl: product.brandLogoUrl,
    logoAlt: product.brand,
  };
}

export function CategoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSort, setSelectedSort] = useState<SortOption>("popularity");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [cashbackOnly, setCashbackOnly] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedStorages, setSelectedStorages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState(2);
  const [visibleFeedCount, setVisibleFeedCount] = useState(24);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { getCatalogSponsoredFlag } = useAdMonetization();
  const scrollYRef = useRef(0);
  const scrollDownAccumRef = useRef(0);
  const scrollUpAccumRef = useRef(0);
  const scrollTickingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const categoryFilters: Array<CatalogCategory | "All"> = [
    "All",
    "Mobiles",
    "Laptops",
    "Accessories",
    "Footwear",
  ];
  const requestedCategory = searchParams.get("category");
  const selectedCategory: CatalogCategory | "All" = categoryFilters.includes(
    requestedCategory as CatalogCategory | "All",
  )
    ? (requestedCategory as CatalogCategory | "All")
    : "All";

  const categoryScopedProducts =
    selectedCategory === "All"
      ? catalogProducts
      : catalogProducts.filter((product) => product.category === selectedCategory);

  const categoryScopedProductsWithVisibility = useMemo(
    () =>
      categoryScopedProducts.map((product) => ({
        ...product,
        sponsored: getCatalogSponsoredFlag(product.id, product.sponsored),
      })),
    [categoryScopedProducts, getCatalogSponsoredFlag],
  );

  const brandFilters = Array.from(
    new Map(
      categoryScopedProductsWithVisibility.map((product) => [product.brand, product.brandLogoUrl]),
    ).entries(),
  );

  const { organicSorted, sponsoredSorted } = useMemo(() => {
    const filtered = categoryScopedProductsWithVisibility.filter((product) => {
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesPrice = isWithinAnySelectedPriceRange(
        product.priceInr,
        selectedPriceRanges,
      );
      const matchesCashback = cashbackOnly ? product.cashbackInr > 0 : true;
      const matchesColors =
        selectedColors.length === 0
          ? true
          : (product.variants?.colors ?? []).some((color) => selectedColors.includes(color));
      const matchesStorages =
        selectedStorages.length === 0
          ? true
          : (product.variants?.storages ?? []).some((storage) =>
              selectedStorages.includes(storage),
            );
      const matchesSizes =
        selectedSizes.length === 0
          ? true
          : (product.variants?.sizes ?? []).some((size) => selectedSizes.includes(size));

      return (
        matchesBrand &&
        matchesPrice &&
        matchesCashback &&
        matchesColors &&
        matchesStorages &&
        matchesSizes
      );
    });

    const sponsoredProducts = filtered.filter((product) => product.sponsored);
    const organicProducts = filtered.filter((product) => !product.sponsored);
    const sortProducts = (
      productsToSort: typeof filtered,
    ) => {
      const nextProducts = [...productsToSort];
      if (selectedSort === "price-low-high") {
        return nextProducts.sort((first, second) => first.priceInr - second.priceInr);
      }
      if (selectedSort === "price-high-low") {
        return nextProducts.sort((first, second) => second.priceInr - first.priceInr);
      }
      return nextProducts.sort((first, second) => {
        if (second.rating !== first.rating) {
          return second.rating - first.rating;
        }
        return first.priceInr - second.priceInr;
      });
    };

    return {
      sponsoredSorted: sortProducts(sponsoredProducts),
      organicSorted: sortProducts(organicProducts),
    };
  }, [
    cashbackOnly,
    categoryScopedProductsWithVisibility,
    selectedBrands,
    selectedColors,
    selectedPriceRanges,
    selectedSizes,
    selectedSort,
    selectedStorages,
  ]);

  const totalVisibleCount = organicSorted.length + sponsoredSorted.length;

  function updateCategorySelection(nextCategory: CatalogCategory | "All") {
    const nextParams = new URLSearchParams(searchParams);
    if (nextCategory === "All") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", nextCategory);
    }
    setSearchParams(nextParams);
    setVisibleFeedCount(24);
  }

  function toggleBrand(brandName: string) {
    setSelectedBrands((currentBrands) =>
      currentBrands.includes(brandName)
        ? currentBrands.filter((brand) => brand !== brandName)
        : [...currentBrands, brandName],
    );
  }

  function togglePriceRange(priceRangeId: string) {
    setSelectedPriceRanges((currentRanges) =>
      currentRanges.includes(priceRangeId)
        ? currentRanges.filter((range) => range !== priceRangeId)
        : [...currentRanges, priceRangeId],
    );
  }

  function toggleColor(color: string) {
    setSelectedColors((current) =>
      current.includes(color) ? current.filter((item) => item !== color) : [...current, color],
    );
  }

  function toggleStorage(storage: string) {
    setSelectedStorages((current) =>
      current.includes(storage) ? current.filter((item) => item !== storage) : [...current, storage],
    );
  }

  function toggleSize(size: string) {
    setSelectedSizes((current) =>
      current.includes(size) ? current.filter((item) => item !== size) : [...current, size],
    );
  }

  function clearAllFilters() {
    setSelectedSort("popularity");
    setSelectedBrands([]);
    setSelectedPriceRanges([]);
    setCashbackOnly(false);
    setSelectedColors([]);
    setSelectedStorages([]);
    setSelectedSizes([]);
  }

  const { availableColors, availableStorages, availableSizes } = useMemo(() => {
    const availableColors = Array.from(
      new Set(
        categoryScopedProductsWithVisibility.flatMap((product) => product.variants?.colors ?? []),
      ),
    ).sort();
    const availableStorages = Array.from(
      new Set(
        categoryScopedProductsWithVisibility.flatMap(
          (product) => product.variants?.storages ?? [],
        ),
      ),
    ).sort();
    const availableSizes = Array.from(
      new Set(
        categoryScopedProductsWithVisibility.flatMap((product) => product.variants?.sizes ?? []),
      ),
    ).sort((a, b) => Number(a) - Number(b));

    return { availableColors, availableStorages, availableSizes };
  }, [categoryScopedProductsWithVisibility]);

  const selectedFilterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string }> = [];
    selectedBrands.forEach((brand) => chips.push({ id: `brand:${brand}`, label: brand }));
    selectedPriceRanges.forEach((rangeId) => {
      const range = PRICE_FILTERS.find((candidate) => candidate.id === rangeId);
      chips.push({ id: `price:${rangeId}`, label: range ? range.label : "Price range" });
    });
    if (cashbackOnly) {
      chips.push({ id: "cashbackOnly", label: "Cashback only" });
    }
    selectedColors.forEach((color) => chips.push({ id: `color:${color}`, label: color }));
    selectedStorages.forEach((storage) => chips.push({ id: `storage:${storage}`, label: storage }));
    selectedSizes.forEach((size) => chips.push({ id: `size:${size}`, label: `Size ${size}` }));
    return chips;
  }, [cashbackOnly, selectedBrands, selectedColors, selectedPriceRanges, selectedSizes, selectedStorages]);

  const feedItems = useMemo<FeedItem[]>(() => {
    const usedIds = new Set<string>();
    const sponsoredPool = sponsoredSorted;
    const organicPool = organicSorted;

    const takeDistinct = (
      primary: Array<CatalogProduct & { sponsored: boolean }>,
      fallback: Array<CatalogProduct & { sponsored: boolean }>,
      count: number,
    ) => {
      const picked: Array<{ product: CatalogProduct & { sponsored: boolean }; slotTag: "Sponsored" | "Related" }> = [];
      for (const product of primary) {
        if (picked.length >= count) break;
        if (usedIds.has(product.id)) continue;
        usedIds.add(product.id);
        picked.push({ product, slotTag: "Sponsored" });
      }
      for (const product of fallback) {
        if (picked.length >= count) break;
        if (usedIds.has(product.id)) continue;
        usedIds.add(product.id);
        picked.push({ product, slotTag: "Related" });
      }
      return picked;
    };

    const nextItems: FeedItem[] = [];
    const rowSize = Math.max(2, gridColumns);
    const rowsPerInsertion = 4;

    // Top sponsored block (industry standard): one full row worth of items.
    const topSponsored = takeDistinct(sponsoredPool, organicPool, rowSize);
    topSponsored.forEach((item) =>
      nextItems.push({
        id: `top:${item.product.id}`,
        product: item.product,
        slotTag: item.slotTag,
      }),
    );

    // Organic stream with sponsored injection every 4 organic rows.
    let organicCountSinceInsertion = 0;
    for (const product of organicPool) {
      if (usedIds.has(product.id)) {
        continue;
      }
      usedIds.add(product.id);
      nextItems.push({
        id: `og:${product.id}`,
        product,
        slotTag: "Organic",
      });
      organicCountSinceInsertion += 1;

      const organicPerInsertion = rowsPerInsertion * rowSize;
      if (organicCountSinceInsertion >= organicPerInsertion) {
        organicCountSinceInsertion = 0;
        const injected = takeDistinct(sponsoredPool, organicPool, rowSize);
        injected.forEach((item) =>
          nextItems.push({
            id: `in:${item.product.id}:${product.id}`,
            product: item.product,
            slotTag: item.slotTag,
          }),
        );
      }
    }

    return nextItems;
  }, [gridColumns, organicSorted, sponsoredSorted]);

  const visibleFeed = useMemo(() => feedItems.slice(0, Math.min(visibleFeedCount, feedItems.length)), [feedItems, visibleFeedCount]);
  const hasMoreFeed = visibleFeedCount < feedItems.length;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 900px)");
    const update = () => setGridColumns(media.matches ? 4 : 2);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.body.classList.add("plp-page-active");
    return () => {
      document.body.classList.remove("plp-page-active");
      document.body.classList.remove("plp-header-collapsed");
    };
  }, []);

  useEffect(() => {
    if (isHeaderCollapsed) {
      document.body.classList.add("plp-header-collapsed");
    } else {
      document.body.classList.remove("plp-header-collapsed");
    }
  }, [isHeaderCollapsed]);

  useEffect(() => {
    const onScroll = () => {
      if (scrollTickingRef.current) return;
      scrollTickingRef.current = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY ?? 0;
        const previousY = scrollYRef.current;
        const delta = y - previousY;
        const isScrollingDown = delta > 0;
        scrollYRef.current = y;

        setShowBackToTop(y > 700);

        if (Math.abs(delta) >= 3) {
          if (isScrollingDown) {
            scrollDownAccumRef.current += delta;
            scrollUpAccumRef.current = 0;
          } else {
            scrollUpAccumRef.current += Math.abs(delta);
            scrollDownAccumRef.current = 0;
          }
        }

        const COLLAPSE_MIN_Y = 220;
        const EXPAND_MIN_Y = 120;
        const COLLAPSE_ACCUM_PX = 120;
        const EXPAND_ACCUM_PX = 70;

        setIsHeaderCollapsed((current) => {
          if (!current) {
            if (y > COLLAPSE_MIN_Y && scrollDownAccumRef.current >= COLLAPSE_ACCUM_PX) {
              scrollDownAccumRef.current = 0;
              return true;
            }
            return current;
          }

          if (y < EXPAND_MIN_Y) {
            scrollUpAccumRef.current = 0;
            return false;
          }
          if (scrollUpAccumRef.current >= EXPAND_ACCUM_PX) {
            scrollUpAccumRef.current = 0;
            return false;
          }
          return current;
        });

        scrollTickingRef.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        setVisibleFeedCount((count) => Math.min(count + 24, feedItems.length));
      },
      { root: null, rootMargin: "240px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [feedItems.length]);

  return (
    <div className="plp-page stack">
      {isHeaderCollapsed ? (
        <div className="plp-sticky-actionbar" role="region" aria-label="Listing actions">
          <div className="plp-sticky-inner">
            <div className="plp-sticky-title">
              <strong>{selectedCategory === "All" ? "All products" : selectedCategory}</strong>
              <span>{totalVisibleCount} items</span>
            </div>
            <div className="plp-sticky-actions">
              <button type="button" className="plp-icon-btn" onClick={() => setIsSortSheetOpen(true)} aria-label="Open sort options">
                <SortIcon />
              </button>
              <button type="button" className="plp-icon-btn" onClick={() => setIsFilterDrawerOpen(true)} aria-label="Open filters">
                <FilterIcon />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="card plp-intro">
        <div className="plp-header-row">
          <div className="plp-header-copy">
            <span className="badge plp-badge">Listing</span>
            <h1>{selectedCategory === "All" ? "Browse all products" : selectedCategory}</h1>
            <p>
              {totalVisibleCount} items • Clear pricing, and sponsored visibility that matches this category.
            </p>
          </div>
          <div className="plp-header-cta">
            <button type="button" className="plp-sort-btn" onClick={() => setIsSortSheetOpen(true)}>
              <SortIcon />
              <span>Sort</span>
              <ChevronDownIcon />
            </button>
            <button type="button" className="app-filter-button" aria-label="Open listing filters" onClick={() => setIsFilterDrawerOpen(true)}>
              <FilterIcon />
            </button>
          </div>
        </div>

        <div className="plp-filter-row" role="list" aria-label="Category filters">
          {categoryFilters.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? "plp-filter-chip is-selected" : "plp-filter-chip"}
              role="listitem"
              onClick={() => updateCategorySelection(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {selectedFilterChips.length > 0 ? (
        <section className="card plp-selected-filters" aria-label="Selected filters">
          <div className="plp-selected-row">
            <div className="chip-row">
              {selectedFilterChips.map((chip) => (
                <span key={chip.id} className="chip">
                  {chip.label}
                </span>
              ))}
            </div>
            <button type="button" className="btn btn-secondary plp-clear-btn" onClick={clearAllFilters}>
              Clear
            </button>
          </div>
        </section>
      ) : null}

      {visibleFeed.length > 0 ? (
        <section
          className={gridColumns === 4 ? "plp-grid is-4col" : "plp-grid is-2col"}
          aria-label="Product listing grid"
        >
          {visibleFeed.map((item) => {
            const product = item.product;
            const productRoute = ROUTES.productDetail(product.id);
            const tagClass = item.slotTag === "Sponsored" ? "plp-sponsored-pill" : "plp-sponsored-pill is-related";
            const offerPresentation = resolveBestOfferPresentation(product);
            const colorOptions = product.variants?.colors ?? [];
            const storageOptions = product.variants?.storages ?? [];
            const sizeOptions = product.variants?.sizes ?? [];
            const hasVariants = colorOptions.length + storageOptions.length + sizeOptions.length > 0;

            return (
              <article key={item.id} className="plp-product-card">
                <div className="plp-image-wrap">
                  {item.slotTag !== "Organic" ? <span className={tagClass}>{item.slotTag}</span> : null}
                  <button
                    type="button"
                    className="plp-wishlist-button"
                    aria-label={`Save ${product.name} to wishlist`}
                  >
                    <WishlistIcon />
                  </button>
                  <Link to={productRoute}>
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} ${product.category} product image`}
                      className="plp-product-image"
                      loading="lazy"
                    />
                  </Link>
                </div>

                <div className="plp-product-copy">
                  <span className="plp-category-pill">{product.category}</span>
                  <div className="plp-brand-row">
                    <img
                      src={product.brandLogoUrl}
                      alt={`${product.brand} logo`}
                      className="plp-brand-logo"
                    />
                    <span>{product.brand}</span>
                  </div>
                  <h2>
                    <Link to={productRoute}>{product.name}</Link>
                  </h2>
                  <p className="plp-spec-line">{product.keySpecs.slice(0, 3).join(" • ")}</p>

                  {hasVariants ? (
                    <div className="plp-variant-row" aria-label="Variations">
                      {colorOptions.slice(0, 2).map((color) => (
                        <span key={`${product.id}:color:${color}`} className="plp-variant-chip">
                          {color}
                        </span>
                      ))}
                      {storageOptions.slice(0, 2).map((storage) => (
                        <span key={`${product.id}:storage:${storage}`} className="plp-variant-chip">
                          {storage}
                        </span>
                      ))}
                      {sizeOptions.slice(0, 2).map((size) => (
                        <span key={`${product.id}:size:${size}`} className="plp-variant-chip">
                          Size {size}
                        </span>
                      ))}
                      {Math.max(0, colorOptions.length - 2) +
                        Math.max(0, storageOptions.length - 2) +
                        Math.max(0, sizeOptions.length - 2) >
                      0 ? (
                        <span className="plp-variant-chip is-more">
                          +
                          {Math.max(0, colorOptions.length - 2) +
                            Math.max(0, storageOptions.length - 2) +
                            Math.max(0, sizeOptions.length - 2)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="plp-price-block">
                    <div className="plp-price-headline">
                      <strong>{formatInr(product.priceInr)}</strong>
                      <span>{formatInr(product.mrpInr)}</span>
                    </div>
                    <span className="plp-cashback-badge">{formatInr(product.cashbackInr)} Cashback</span>
                  </div>

                  {offerPresentation ? (
                    <div className="plp-best-offer" aria-label="Best offer">
                      <span className="plp-best-offer-logo" aria-hidden="true">
                        {offerPresentation.logoType === "image" && offerPresentation.logoUrl ? (
                          <img src={offerPresentation.logoUrl} alt={offerPresentation.logoAlt ?? ""} />
                        ) : (
                          <span className="plp-best-offer-icon">
                            <CouponIcon />
                          </span>
                        )}
                      </span>
                      <p className="plp-best-offer-text">{offerPresentation.text}</p>
                    </div>
                  ) : null}

                  <div className="plp-rating-row">
                    <span className="plp-rating-pill">
                      <StarIcon />
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="plp-rank-label">
                      {selectedSort === "popularity" ? "Popular pick" : "Sorted result"}
                    </span>
                  </div>

                  <div className="inline-actions">
                    <Link to={productRoute} className="btn btn-secondary">
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="card">
          <p className="empty-state">
            No products found for the selected filters. Try clearing one or more filters.
          </p>
        </section>
      )}

      <div ref={sentinelRef} />
      {hasMoreFeed ? (
        <section className="card plp-loading-row" aria-label="Loading more products">
          <p>Loading more…</p>
        </section>
      ) : null}

      {showBackToTop ? (
        <button
          type="button"
          className="plp-back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          ↑
        </button>
      ) : null}

      {isFilterDrawerOpen ? (
        <div className="plp-drawer-overlay" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="plp-drawer">
            <div className="plp-drawer-head">
              <strong>Filters</strong>
              <button type="button" className="plp-icon-btn" onClick={() => setIsFilterDrawerOpen(false)} aria-label="Close filters">
                ✕
              </button>
            </div>

            <div className="plp-drawer-body">
              <section className="plp-filter-group">
                <h3>Brand</h3>
                {brandFilters.map(([brandName]) => (
                  <label key={brandName} className="plp-filter-option">
                    <span>{brandName}</span>
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brandName)}
                      onChange={() => toggleBrand(brandName)}
                    />
                  </label>
                ))}
              </section>

              {availableColors.length > 0 ? (
                <section className="plp-filter-group">
                  <h3>Color</h3>
                  {availableColors.map((color) => (
                    <label key={color} className="plp-filter-option">
                      <span>{color}</span>
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        onChange={() => toggleColor(color)}
                      />
                    </label>
                  ))}
                </section>
              ) : null}

              {availableStorages.length > 0 ? (
                <section className="plp-filter-group">
                  <h3>Storage</h3>
                  {availableStorages.map((storage) => (
                    <label key={storage} className="plp-filter-option">
                      <span>{storage}</span>
                      <input
                        type="checkbox"
                        checked={selectedStorages.includes(storage)}
                        onChange={() => toggleStorage(storage)}
                      />
                    </label>
                  ))}
                </section>
              ) : null}

              {availableSizes.length > 0 ? (
                <section className="plp-filter-group">
                  <h3>Size</h3>
                  {availableSizes.map((size) => (
                    <label key={size} className="plp-filter-option">
                      <span>{size}</span>
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                    </label>
                  ))}
                </section>
              ) : null}

              <section className="plp-filter-group">
                <h3>Price range</h3>
                {PRICE_FILTERS.map((priceRange) => (
                  <label key={priceRange.id} className="plp-filter-option">
                    <span>{priceRange.label}</span>
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(priceRange.id)}
                      onChange={() => togglePriceRange(priceRange.id)}
                    />
                  </label>
                ))}
              </section>

              <section className="plp-filter-group">
                <h3>Cashback</h3>
                <label className="plp-filter-option">
                  <span>Cashback available only</span>
                  <input
                    type="checkbox"
                    checked={cashbackOnly}
                    onChange={(event) => setCashbackOnly(event.target.checked)}
                  />
                </label>
              </section>
            </div>

            <div className="plp-drawer-foot">
              <button type="button" className="btn btn-secondary btn-block" onClick={clearAllFilters}>
                Clear all
              </button>
              <button type="button" className="btn btn-primary btn-block" onClick={() => setIsFilterDrawerOpen(false)}>
                Show results ({totalVisibleCount})
              </button>
            </div>
          </div>
          <button
            type="button"
            className="plp-drawer-scrim"
            onClick={() => setIsFilterDrawerOpen(false)}
            aria-label="Close filters"
          />
        </div>
      ) : null}

      {isSortSheetOpen ? (
        <div className="plp-drawer-overlay" role="dialog" aria-modal="true" aria-label="Sort">
          <div className="plp-sheet">
            <div className="plp-drawer-head">
              <strong>Sort by</strong>
              <button type="button" className="plp-icon-btn" onClick={() => setIsSortSheetOpen(false)} aria-label="Close sort">
                ✕
              </button>
            </div>

            <div className="plp-drawer-body">
              <label className="plp-radio-row">
                <span>Popularity</span>
                <input
                  type="radio"
                  name="sort"
                  checked={selectedSort === "popularity"}
                  onChange={() => setSelectedSort("popularity")}
                />
              </label>
              <label className="plp-radio-row">
                <span>Price: Low to High</span>
                <input
                  type="radio"
                  name="sort"
                  checked={selectedSort === "price-low-high"}
                  onChange={() => setSelectedSort("price-low-high")}
                />
              </label>
              <label className="plp-radio-row">
                <span>Price: High to Low</span>
                <input
                  type="radio"
                  name="sort"
                  checked={selectedSort === "price-high-low"}
                  onChange={() => setSelectedSort("price-high-low")}
                />
              </label>
            </div>

            <div className="plp-drawer-foot">
              <button type="button" className="btn btn-primary btn-block" onClick={() => setIsSortSheetOpen(false)}>
                Apply
              </button>
            </div>
          </div>
          <button
            type="button"
            className="plp-drawer-scrim"
            onClick={() => setIsSortSheetOpen(false)}
            aria-label="Close sort"
          />
        </div>
      ) : null}
    </div>
  );
}
