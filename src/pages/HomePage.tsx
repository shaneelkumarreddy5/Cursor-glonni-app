import { Link, useNavigate } from "react-router-dom";
import { CategoryShortcuts, type CategoryShortcut } from "../components/home/CategoryShortcuts";
import { FlashDeals } from "../components/home/FlashDeals";
import { HeroBanner } from "../components/home/HeroBanner";
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

const HOME_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDC7N4t2J3BHQ9sbbDuinU4yYreLsYs5Y11TgF9RgjU7jLRNvELugFCfXKQrBHWMSEyIFvIYb9pDYD3ieganbZNO5vGJJi33tJt8QPbf_qFsgMMrJwmbMlpLAkBxW78aaAWy2V-Y4RgPJSch5oq-_B17r6SUrtocW4p1doOnFkBwOdjbsagv1Kn__RwpsaLyMloOdZlpIl4xnI4y3c2n4p9Zn8rOT41410604ul8kLUyGd-b6tLPs0xCOtJM2GiHf8JOP09qD_GxCc";

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
      <HeroBanner ctaTo={getCategoryRoute("Mobiles")} imageUrl={HOME_HERO_IMAGE} />

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
