import { Link, useNavigate } from "react-router-dom";
import { CategoryShortcuts, type CategoryShortcut } from "../components/home/CategoryShortcuts";
import { FlashDeals } from "../components/home/FlashDeals";
import { HeroBanner, type HeroDeal } from "../components/home/HeroBanner";
import { RecommendedList } from "../components/home/RecommendedList";
import { SponsoredGrid } from "../components/home/SponsoredGrid";
import { TrustSection } from "../components/home/TrustSection";
import { TrendingNearYou } from "../components/home/TrendingNearYou";
import { type HomeProduct } from "../components/home/types";
import { catalogProducts, type CatalogCategory, type CatalogProduct } from "../data/mockCatalog";
import { getVendorOptionsForProduct } from "../data/mockCommerce";
import { ROUTES } from "../routes/paths";
import { useAdMonetization } from "../state/AdMonetizationContext";
import { useCommerce } from "../state/CommerceContext";
import "../styles/homepage-glonni.css";

const HOME_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80";

type HomeCategoryTile = {
  title: CategoryShortcut["title"];
  category: CatalogCategory;
  imageProductId: string;
};

const HOME_CATEGORY_TILES: HomeCategoryTile[] = [
  { title: "Electronics", category: "Mobiles", imageProductId: "sp-1" },
  { title: "Fashion", category: "Footwear", imageProductId: "og-8" },
  { title: "Home", category: "Laptops", imageProductId: "og-4" },
  { title: "Mobile", category: "Mobiles", imageProductId: "sp-2" },
  { title: "Grocery", category: "Accessories", imageProductId: "og-7" },
];

function getCategoryRoute(category: CatalogCategory) {
  return `${ROUTES.category}?category=${encodeURIComponent(category)}`;
}

const HOME_MOCK_DEALS: HeroDeal[] = [
  {
    id: "deal-mobile-fest",
    kicker: "Mobile Fest",
    title: "Save up to 45% on top smartphones",
    subtitle: "Starting at Rs 8,999 with cashback bundles this week.",
    ctaLabel: "Shop Mobiles",
    ctaTo: getCategoryRoute("Mobiles"),
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "deal-laptop-upgrade",
    kicker: "Laptop Upgrade Days",
    title: "Performance laptops under Rs 59,999",
    subtitle: "Exchange-ready offers on thin-and-light work essentials.",
    ctaLabel: "Shop Laptops",
    ctaTo: getCategoryRoute("Laptops"),
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "deal-audio-essentials",
    kicker: "Audio Essentials",
    title: "Wireless accessories at weekend prices",
    subtitle: "Earbuds, speakers, and power banks with instant deal cuts.",
    ctaLabel: "Shop Accessories",
    ctaTo: getCategoryRoute("Accessories"),
    imageUrl:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "deal-footwear-run",
    kicker: "Footwear Flash",
    title: "Flat 35% off on trending sneakers",
    subtitle: "Daily-wear pairs from best-rated brands at lower prices.",
    ctaLabel: "Shop Footwear",
    ctaTo: getCategoryRoute("Footwear"),
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "deal-gaming-combo",
    kicker: "Gamer Choice",
    title: "Phones plus accessories combo deals",
    subtitle: "Bundle controllers, earbuds, and chargers with select mobiles.",
    ctaLabel: "View Combos",
    ctaTo: getCategoryRoute("Mobiles"),
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "deal-night-saver",
    kicker: "Night Saver",
    title: "Extra cashback unlocked after 9 PM",
    subtitle: "Late-hour checkout bonus across laptops and accessories.",
    ctaLabel: "Grab Night Deals",
    ctaTo: getCategoryRoute("Accessories"),
    imageUrl:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
  },
];

function getProductImage(productId: string) {
  return catalogProducts.find((product) => product.id === productId)?.imageUrl ?? HOME_FALLBACK_IMAGE;
}

function getDiscountPercent(product: CatalogProduct) {
  if (product.mrpInr <= product.priceInr) {
    return 0;
  }
  return Math.round(((product.mrpInr - product.priceInr) / product.mrpInr) * 100);
}

function toHomeProduct(product: CatalogProduct): HomeProduct {
  return {
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    brand: product.brand,
    priceInr: product.priceInr,
    mrpInr: product.mrpInr,
    cashbackInr: product.cashbackInr,
  };
}

export function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCommerce();
  const { getCatalogSponsoredFlag } = useAdMonetization();

  const productsWithVisibility = catalogProducts.map((product) => ({
    ...product,
    sponsored: getCatalogSponsoredFlag(product.id, product.sponsored),
  }));

  const sponsoredProducts = productsWithVisibility.filter((product) => product.sponsored);
  const organicProducts = productsWithVisibility.filter((product) => !product.sponsored);

  const sponsoredGridProducts =
    sponsoredProducts.length >= 4
      ? sponsoredProducts.slice(0, 4)
      : [...sponsoredProducts, ...organicProducts].slice(0, 4);

  const flashDeals = [...productsWithVisibility]
    .sort((first, second) => getDiscountPercent(second) - getDiscountPercent(first))
    .slice(0, 6);

  const trendingProducts = [...productsWithVisibility]
    .sort((first, second) => second.rating - first.rating)
    .slice(0, 4);

  const recommendedProducts = [...organicProducts, ...sponsoredProducts].slice(0, 4);
  const homeProductsById = new Map(
    productsWithVisibility.map((product) => [product.id, product]),
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

  function handleBuyNow(product: CatalogProduct) {
    addDefaultConfigurationToCart(product);
    navigate(ROUTES.checkout);
  }

  function handleAddToCartById(productId: string) {
    const product = homeProductsById.get(productId);
    if (!product) {
      return;
    }
    addDefaultConfigurationToCart(product);
  }

  function handleBuyNowById(productId: string) {
    const product = homeProductsById.get(productId);
    if (!product) {
      return;
    }
    handleBuyNow(product);
  }

  const categoryShortcuts: CategoryShortcut[] = HOME_CATEGORY_TILES.map((tile) => ({
    title: tile.title,
    to: getCategoryRoute(tile.category),
    imageUrl: getProductImage(tile.imageProductId),
  }));

  return (
    <div className="glonni-home">
      <HeroBanner deals={HOME_MOCK_DEALS} />

      <CategoryShortcuts shortcuts={categoryShortcuts} />

      <SponsoredGrid
        products={sponsoredGridProducts.map(toHomeProduct)}
        onAddToCart={handleAddToCartById}
        onBuyNow={handleBuyNowById}
      />

      <FlashDeals
        products={flashDeals.map(toHomeProduct)}
        getDiscountLabel={(productId) => {
          const product = homeProductsById.get(productId);
          if (!product) {
            return "Deal";
          }
          return `${getDiscountPercent(product)}% OFF`;
        }}
      />

      <TrendingNearYou products={trendingProducts.map(toHomeProduct)} />

      <RecommendedList
        products={recommendedProducts.map(toHomeProduct)}
        onAddToCart={handleAddToCartById}
        onBuyNow={handleBuyNowById}
      />

      <TrustSection />

      <section className="home-section-card home-vendor-cta">
        <div>
          <h2>Sell on Glonni</h2>
          <p>Grow with India&apos;s most rewarding shopping destination.</p>
        </div>
        <Link to={ROUTES.vendor} className="btn btn-primary">
          Become a Vendor
        </Link>
      </section>
    </div>
  );
}
