export type CatalogCategory = "Mobiles" | "Laptops" | "Accessories" | "Footwear";

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  category: CatalogCategory;
  priceInr: number;
  mrpInr: number;
  cashbackInr: number;
  rating: number;
  keySpecs: string[];
  sponsored: boolean;
  bestOfferLine?: string;
  imageUrl: string;
};

export type HomeCategoryTile = {
  name: "Electronics" | "Fashion" | "Beauty" | "Home" | "Grocery";
  iconText: string;
  itemCount: string;
  imageUrl: string;
};

export type BrandHighlight = {
  name: string;
  focus: string;
};

export const homeCategoryTiles: HomeCategoryTile[] = [
  {
    name: "Electronics",
    iconText: "EL",
    itemCount: "12,540+ items",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Fashion",
    iconText: "FA",
    itemCount: "9,840+ items",
    imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Beauty",
    iconText: "BE",
    itemCount: "4,120+ items",
    imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Home",
    iconText: "HO",
    itemCount: "6,430+ items",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Grocery",
    iconText: "GR",
    itemCount: "3,980+ items",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
  },
];

export const topBrandHighlights: BrandHighlight[] = [
  { name: "NovaTech", focus: "Camera-focused 5G mobiles" },
  { name: "Astra", focus: "Lightweight student laptops" },
  { name: "Stride", focus: "Performance-first footwear" },
  { name: "Bolt", focus: "Fast charging accessories" },
  { name: "Verve", focus: "Premium everyday style" },
];

export const bankOfferStripItems: string[] = [
  "10% off with HDFC cards",
  "Axis bank instant cashback up to ₹1,500",
  "ICICI debit card EMI starts from ₹1,999 per month",
  "More offers available on checkout",
];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "sp-1",
    name: "Glonni Spark X7 5G",
    brand: "NovaTech",
    category: "Mobiles",
    priceInr: 27999,
    mrpInr: 31999,
    cashbackInr: 1300,
    rating: 4.6,
    keySpecs: ["8 GB RAM", "128 GB Storage", "5000 mAh Battery"],
    sponsored: true,
    bestOfferLine: "Best offer: Instant ₹2,000 bank discount on select cards.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sp-2",
    name: "PixelEdge Pro 128",
    brand: "PixelEdge",
    category: "Mobiles",
    priceInr: 32999,
    mrpInr: 36999,
    cashbackInr: 1600,
    rating: 4.7,
    keySpecs: ["8 GB RAM", "128 GB Storage", "50 MP OIS Camera"],
    sponsored: true,
    bestOfferLine: "Best offer: Exchange bonus up to ₹4,500.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sp-3",
    name: "AeroBook Slim 14",
    brand: "Astra",
    category: "Laptops",
    priceInr: 58999,
    mrpInr: 64999,
    cashbackInr: 2500,
    rating: 4.5,
    keySpecs: ["16 GB RAM", "512 GB SSD", "14 inch FHD"],
    sponsored: true,
    bestOfferLine: "Best offer: No-cost EMI plus ₹3,000 instant discount.",
    imageUrl: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sp-4",
    name: "SprintFlex Runner Elite",
    brand: "Stride",
    category: "Footwear",
    priceInr: 4299,
    mrpInr: 5499,
    cashbackInr: 260,
    rating: 4.4,
    keySpecs: ["Breathable mesh", "Grip outsole", "Running fit"],
    sponsored: true,
    bestOfferLine: "Best offer: Buy two running essentials and save ₹700.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-1",
    name: "UrbanStep Knit Slip-On",
    brand: "Verve",
    category: "Footwear",
    priceInr: 1899,
    mrpInr: 2499,
    cashbackInr: 120,
    rating: 4.2,
    keySpecs: ["Memory foam", "Lightweight sole", "Daily wear"],
    sponsored: false,
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-2",
    name: "TrailEdge Trekking Shoe",
    brand: "Stride",
    category: "Footwear",
    priceInr: 2499,
    mrpInr: 3299,
    cashbackInr: 150,
    rating: 4.3,
    keySpecs: ["Ankle support", "Water-resistant upper", "Trail grip"],
    sponsored: false,
    bestOfferLine: "Best offer: Flat ₹300 off with coupon STEP300.",
    imageUrl: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-3",
    name: "MotoNova G15 5G",
    brand: "MotoNova",
    category: "Mobiles",
    priceInr: 11999,
    mrpInr: 13999,
    cashbackInr: 500,
    rating: 4.3,
    keySpecs: ["6 GB RAM", "128 GB Storage", "50 MP Camera"],
    sponsored: false,
    bestOfferLine: "Best offer: Extra ₹1,000 off on prepaid orders.",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-4",
    name: "PulseBuds TWS Pro",
    brand: "Bolt",
    category: "Accessories",
    priceInr: 2999,
    mrpInr: 4499,
    cashbackInr: 180,
    rating: 4.2,
    keySpecs: ["ENC Mic", "36 hour battery", "Fast charge"],
    sponsored: false,
    imageUrl: "https://images.unsplash.com/photo-1606220838315-056192d5e927?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-5",
    name: "SnapCharge 65W Adapter",
    brand: "Bolt",
    category: "Accessories",
    priceInr: 1799,
    mrpInr: 2499,
    cashbackInr: 90,
    rating: 4.4,
    keySpecs: ["GaN charging", "USB-C PD", "Travel compact"],
    sponsored: false,
    bestOfferLine: "Best offer: Combo save ₹250 with braided cable.",
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-6",
    name: "ThinkCore Student 15",
    brand: "Astra",
    category: "Laptops",
    priceInr: 45999,
    mrpInr: 52999,
    cashbackInr: 1800,
    rating: 4.5,
    keySpecs: ["16 GB RAM", "512 GB SSD", "Backlit keyboard"],
    sponsored: false,
    bestOfferLine: "Best offer: Cashback boost to ₹2,500 on UPI payment.",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-7",
    name: "SwiftBook Air 13",
    brand: "Astra",
    category: "Laptops",
    priceInr: 52999,
    mrpInr: 59999,
    cashbackInr: 2100,
    rating: 4.6,
    keySpecs: ["16 GB RAM", "512 GB SSD", "13.6 inch display"],
    sponsored: false,
    imageUrl: "https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-8",
    name: "CreatorPro Vision 16",
    brand: "Astra",
    category: "Laptops",
    priceInr: 79999,
    mrpInr: 89999,
    cashbackInr: 3200,
    rating: 4.7,
    keySpecs: ["32 GB RAM", "1 TB SSD", "RTX graphics"],
    sponsored: false,
    bestOfferLine: "Best offer: Bundle savings worth ₹5,000 on accessories.",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
  },
];
