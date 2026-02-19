import { useMemo } from "react";
import { Link } from "react-router-dom";
import { HeroTwoUpCarousel, type HeroTwoUpSlide } from "../components/home/HeroTwoUpCarousel";
import { HomeBankOffersRail } from "../components/home/HomeBankOffersRail";
import { HomeBrandRail } from "../components/home/HomeBrandRail";
import { HomeCategoryTiles, type HomeCategoryTile } from "../components/home/HomeCategoryTiles";
import { HomeProductRail } from "../components/home/HomeProductRail";
import { bankOffers, catalogProducts, type CatalogCategory, type CatalogProduct } from "../data/mockCatalog";
import { getVendorOptionsForProduct } from "../data/mockCommerce";
import { ROUTES } from "../routes/paths";
import { useAdMonetization } from "../state/AdMonetizationContext";
import { useCommerce } from "../state/CommerceContext";
import "../styles/homepage-glonni.css";

const HOME_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80";

const HOME_CATEGORY_TILES: Array<{
  title: HomeCategoryTile["title"];
  category: CatalogCategory;
  imageProductId: string;
}> = [
  { title: "Smart Phones", category: "Mobiles", imageProductId: "sp-2" },
  { title: "Laptops", category: "Laptops", imageProductId: "og-4" },
  { title: "Accessories", category: "Accessories", imageProductId: "og-7" },
  { title: "Footwear", category: "Footwear", imageProductId: "og-8" },
];

function getCategoryRoute(category: CatalogCategory) {
  return `${ROUTES.category}?category=${encodeURIComponent(category)}`;
}

function getProductImage(productId: string) {
  return catalogProducts.find((product) => product.id === productId)?.imageUrl ?? HOME_FALLBACK_IMAGE;
}

function toHeroItem(product: CatalogProduct, overrides: Partial<Omit<HeroTwoUpSlide["left"], "id" | "ctaTo" | "imageUrl">> = {}) {
  return {
    id: product.id,
    badge: overrides.badge,
    title: overrides.title ?? product.name,
    subtitle: overrides.subtitle,
    priceLine: overrides.priceLine,
    ctaLabel: overrides.ctaLabel ?? "Shop now",
    ctaTo: ROUTES.productDetail(product.id),
    imageUrl: product.imageUrl,
  };
}

export function HomePage() {
  const { addToCart } = useCommerce();
  const { getCatalogSponsoredFlag } = useAdMonetization();

  const productsWithVisibility = catalogProducts.map((product) => ({
    ...product,
    sponsored: getCatalogSponsoredFlag(product.id, product.sponsored),
  }));

  const sponsoredProducts = productsWithVisibility.filter((product) => product.sponsored);
  const organicProducts = productsWithVisibility.filter((product) => !product.sponsored);

  const homeProductsById = useMemo(
    () => new Map(productsWithVisibility.map((product) => [product.id, product])),
    [productsWithVisibility],
  );

  function addDefaultConfigurationToCart(product: CatalogProduct) {
    const vendorOptions = getVendorOptionsForProduct(product);
    const defaultVendor = vendorOptions[0];
    if (!defaultVendor) {
      return;
    }
    addToCart({
      product,
      vendor: defaultVendor,
      selectedExtraOffer: null,
      unitPriceInr: defaultVendor.priceInr,
      unitCashbackInr: defaultVendor.cashbackInr,
    });
  }

  function handleAddToCartById(productId: string) {
    const product = homeProductsById.get(productId);
    if (!product) {
      return;
    }
    addDefaultConfigurationToCart(product);
  }

  const categoryTiles: HomeCategoryTile[] = HOME_CATEGORY_TILES.map((tile) => ({
    title: tile.title,
    to: getCategoryRoute(tile.category),
    imageUrl: getProductImage(tile.imageProductId),
  }));

  const heroSlides: HeroTwoUpSlide[] = useMemo(() => {
    const base = [...productsWithVisibility].slice(0, 8);
    const slides: HeroTwoUpSlide[] = [];
    for (let index = 0; index < base.length; index += 2) {
      const left = base[index];
      const right = base[index + 1];
      if (!left || !right) {
        break;
      }
      slides.push({
        id: `hero-${left.id}-${right.id}`,
        left: toHeroItem(left, {
          badge: "Big Saving",
          title: left.name,
          priceLine: `From ${left.priceInr.toLocaleString("en-IN")} INR`,
          ctaLabel: "Shop now",
        }),
        right: toHeroItem(right, {
          badge: "Limited offer",
          title: right.name,
          priceLine: `From ${right.priceInr.toLocaleString("en-IN")} INR`,
          ctaLabel: "Shop now",
        }),
      });
    }
    return slides;
  }, [productsWithVisibility]);

  const trendingProducts = useMemo(
    () => [...productsWithVisibility].sort((a, b) => b.rating - a.rating).slice(0, 10),
    [productsWithVisibility],
  );

  const newArrivals = useMemo(
    () => [...productsWithVisibility].slice().reverse().slice(0, 10),
    [productsWithVisibility],
  );

  const basedOnSearchProducts = useMemo(
    () => [...organicProducts, ...sponsoredProducts].slice(0, 10),
    [organicProducts, sponsoredProducts],
  );

  const extraCashbackProducts = useMemo(
    () =>
      [...productsWithVisibility]
        .sort((a, b) => {
          if (b.cashbackInr !== a.cashbackInr) {
            return b.cashbackInr - a.cashbackInr;
          }
          return b.rating - a.rating;
        })
        .slice(0, 10),
    [productsWithVisibility],
  );

  const brandTiles = useMemo(() => {
    const unique = new Map<string, string>();
    productsWithVisibility.forEach((product) => {
      if (!unique.has(product.brand)) {
        unique.set(product.brand, product.brandLogoUrl);
      }
    });
    return Array.from(unique.entries()).map(([name, logoUrl]) => ({ name, logoUrl }));
  }, [productsWithVisibility]);

  return (
    <div className="glonni-home">
      <HeroTwoUpCarousel slides={heroSlides} />

      <HomeCategoryTiles tiles={categoryTiles} />

      <HomeProductRail
        title="Sponsored"
        subtitle="Paid placements from verified sellers (mock)."
        badge="Sponsored"
        products={sponsoredProducts.slice(0, 10)}
        onAddToCart={handleAddToCartById}
      />

      <HomeProductRail
        title="Trending"
        subtitle="Popular picks based on ratings (mock)."
        products={trendingProducts}
        onAddToCart={handleAddToCartById}
      />

      <HomeBrandRail title="Top Brands" brands={brandTiles} />

      <HomeProductRail
        title="Based on your search"
        subtitle="Personalized after search is enabled."
        products={basedOnSearchProducts}
        onAddToCart={handleAddToCartById}
      />

      <HomeProductRail
        title="New arrivals"
        subtitle="Fresh additions to the catalog (mock)."
        products={newArrivals}
        onAddToCart={handleAddToCartById}
      />

      <HomeBankOffersRail title="Bank offers" offers={bankOffers} />

      <HomeProductRail
        title="Extra cashback"
        subtitle="Top cashback picks right now (mock)."
        products={extraCashbackProducts}
        onAddToCart={handleAddToCartById}
      />
    </div>
  );
}
