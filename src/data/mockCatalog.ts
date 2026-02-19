export type CatalogCategory = "Mobiles" | "Laptops" | "Accessories" | "Footwear";

export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  brandLogoUrl: string;
  category: CatalogCategory;
  priceInr: number;
  mrpInr: number;
  cashbackInr: number;
  rating: number;
  keySpecs: string[];
  sponsored: boolean;
  bestOfferLine?: string;
  variants?: {
    colors?: string[];
    storages?: string[];
    sizes?: string[];
  };
  imageUrl: string;
};

export type HomeCategoryTile = {
  name: "Electronics" | "Fashion" | "Beauty" | "Home" | "Grocery";
  icon: "electronics" | "fashion" | "beauty" | "home" | "grocery";
  itemCount: string;
};

export type BrandHighlight = {
  name: string;
  logoUrl: string;
  focus: string;
};

export type BankOffer = {
  bankName: string;
  logoUrl: string;
  offerText: string;
};

export const homeCategoryTiles: HomeCategoryTile[] = [
  {
    name: "Electronics",
    icon: "electronics",
    itemCount: "12,540+ items",
  },
  {
    name: "Fashion",
    icon: "fashion",
    itemCount: "9,840+ items",
  },
  {
    name: "Beauty",
    icon: "beauty",
    itemCount: "4,120+ items",
  },
  {
    name: "Home",
    icon: "home",
    itemCount: "6,430+ items",
  },
  {
    name: "Grocery",
    icon: "grocery",
    itemCount: "3,980+ items",
  },
];

export const topBrandHighlights: BrandHighlight[] = [
  {
    name: "Samsung",
    logoUrl: "/logos/brands/samsung.svg",
    focus: "Best-selling Android phones",
  },
  {
    name: "Apple",
    logoUrl: "/logos/brands/apple.svg",
    focus: "Premium devices and ecosystem",
  },
  {
    name: "OnePlus",
    logoUrl: "/logos/brands/oneplus.svg",
    focus: "Performance-focused smartphones",
  },
  {
    name: "Xiaomi",
    logoUrl: "/logos/brands/xiaomi.svg",
    focus: "Value flagship and accessories",
  },
  {
    name: "Vivo",
    logoUrl: "/logos/brands/vivo.svg",
    focus: "Camera-first mobile lineup",
  },
  {
    name: "Realme",
    logoUrl: "/logos/brands/realme.svg",
    focus: "Best value performance phones",
  },
  {
    name: "Oppo",
    logoUrl: "/logos/brands/oppo.svg",
    focus: "Portrait and design-led devices",
  },
];

export const bankOffers: BankOffer[] = [
  {
    bankName: "HDFC Bank",
    logoUrl: "/logos/banks/hdfc.svg",
    offerText: "10% Instant Discount up to ₹1,500",
  },
  {
    bankName: "ICICI Bank",
    logoUrl: "/logos/banks/icici.svg",
    offerText: "5% Cashback on Credit Cards up to ₹1,200",
  },
  {
    bankName: "SBI Card",
    logoUrl: "/logos/banks/sbi.svg",
    offerText: "Flat ₹1,000 off on orders above ₹25,000",
  },
  {
    bankName: "Axis Bank",
    logoUrl: "/logos/banks/axis.svg",
    offerText: "No-cost EMI for 6 months on eligible products",
  },
  {
    bankName: "Kotak Bank",
    logoUrl: "/logos/banks/kotak.svg",
    offerText: "Extra ₹750 discount on Debit Card payments",
  },
];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "sp-1",
    name: "Samsung Galaxy S24 5G",
    brand: "Samsung",
    brandLogoUrl: "/logos/brands/samsung.svg",
    category: "Mobiles",
    priceInr: 71999,
    mrpInr: 79999,
    cashbackInr: 1300,
    rating: 4.6,
    keySpecs: ["8 GB RAM", "256 GB Storage", "50 MP Triple Camera"],
    sponsored: true,
    bestOfferLine: "Best offer: Instant ₹4,000 bank discount on select cards.",
    variants: { colors: ["Black", "Blue"], storages: ["256 GB", "512 GB"] },
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sp-2",
    name: "Apple iPhone 15",
    brand: "Apple",
    brandLogoUrl: "/logos/brands/apple.svg",
    category: "Mobiles",
    priceInr: 72999,
    mrpInr: 79900,
    cashbackInr: 1600,
    rating: 4.7,
    keySpecs: ["128 GB Storage", "A16 Bionic", "48 MP Main Camera"],
    sponsored: true,
    bestOfferLine: "Best offer: Exchange bonus up to ₹6,000.",
    variants: { colors: ["Black", "Blue", "Green"], storages: ["128 GB", "256 GB"] },
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sp-3",
    name: "OnePlus 12R",
    brand: "OnePlus",
    brandLogoUrl: "/logos/brands/oneplus.svg",
    category: "Mobiles",
    priceInr: 38999,
    mrpInr: 42999,
    cashbackInr: 1100,
    rating: 4.5,
    keySpecs: ["8 GB RAM", "256 GB Storage", "120 Hz AMOLED"],
    sponsored: true,
    bestOfferLine: "Best offer: Flat ₹2,000 off with select cards.",
    variants: { colors: ["Black", "Blue"], storages: ["128 GB", "256 GB"] },
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sp-4",
    name: "Xiaomi 14 Civi",
    brand: "Xiaomi",
    brandLogoUrl: "/logos/brands/xiaomi.svg",
    category: "Mobiles",
    priceInr: 42999,
    mrpInr: 47999,
    cashbackInr: 1200,
    rating: 4.4,
    keySpecs: ["12 GB RAM", "256 GB Storage", "Leica Camera"],
    sponsored: true,
    bestOfferLine: "Best offer: Extra ₹3,000 exchange value.",
    variants: { colors: ["Black", "White"], storages: ["256 GB"] },
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3f8ec8d146f8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-1",
    name: "Realme Narzo 70 5G",
    brand: "Realme",
    brandLogoUrl: "/logos/brands/realme.svg",
    category: "Mobiles",
    priceInr: 15999,
    mrpInr: 17999,
    cashbackInr: 500,
    rating: 4.2,
    keySpecs: ["8 GB RAM", "128 GB Storage", "45W Fast Charge"],
    sponsored: false,
    variants: { colors: ["Black", "Green"], storages: ["128 GB"] },
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-2",
    name: "Vivo V30 5G",
    brand: "Vivo",
    brandLogoUrl: "/logos/brands/vivo.svg",
    category: "Mobiles",
    priceInr: 30999,
    mrpInr: 33999,
    cashbackInr: 900,
    rating: 4.3,
    keySpecs: ["8 GB RAM", "256 GB Storage", "50 MP OIS Camera"],
    sponsored: false,
    bestOfferLine: "Best offer: Flat ₹2,000 off with coupon VIVO2K.",
    variants: { colors: ["Blue", "Black"], storages: ["128 GB", "256 GB"] },
    imageUrl: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-3",
    name: "OPPO Reno11 5G",
    brand: "Oppo",
    brandLogoUrl: "/logos/brands/oppo.svg",
    category: "Mobiles",
    priceInr: 28999,
    mrpInr: 31999,
    cashbackInr: 850,
    rating: 4.3,
    keySpecs: ["8 GB RAM", "256 GB Storage", "Portrait Camera"],
    sponsored: false,
    bestOfferLine: "Best offer: Extra ₹1,500 off on prepaid orders.",
    variants: { colors: ["Black", "Gold"], storages: ["256 GB"] },
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-4",
    name: "Samsung Galaxy Book4",
    brand: "Samsung",
    brandLogoUrl: "/logos/brands/samsung.svg",
    category: "Laptops",
    priceInr: 62999,
    mrpInr: 70999,
    cashbackInr: 2200,
    rating: 4.4,
    keySpecs: ["16 GB RAM", "512 GB SSD", "Intel Core i5"],
    sponsored: false,
    variants: { colors: ["Silver", "Gray"], storages: ["512 GB", "1 TB"] },
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-5",
    name: "Apple MacBook Air M2",
    brand: "Apple",
    brandLogoUrl: "/logos/brands/apple.svg",
    category: "Laptops",
    priceInr: 94900,
    mrpInr: 99900,
    cashbackInr: 2800,
    rating: 4.4,
    keySpecs: ["8 GB RAM", "256 GB SSD", "M2 Chip"],
    sponsored: false,
    bestOfferLine: "Best offer: Student pricing savings up to ₹5,000.",
    variants: { colors: ["Midnight", "Starlight", "Silver"], storages: ["256 GB", "512 GB"] },
    imageUrl: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-6",
    name: "OnePlus Buds 3",
    brand: "OnePlus",
    brandLogoUrl: "/logos/brands/oneplus.svg",
    category: "Accessories",
    priceInr: 5499,
    mrpInr: 6999,
    cashbackInr: 220,
    rating: 4.5,
    keySpecs: ["ANC", "44 hours playback", "Dual drivers"],
    sponsored: false,
    bestOfferLine: "Best offer: Cashback boost on UPI payments.",
    variants: { colors: ["Black", "White"] },
    imageUrl: "https://images.unsplash.com/photo-1606220838315-056192d5e927?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-7",
    name: "Samsung 25W USB-C Adapter",
    brand: "Samsung",
    brandLogoUrl: "/logos/brands/samsung.svg",
    category: "Accessories",
    priceInr: 1499,
    mrpInr: 1999,
    cashbackInr: 90,
    rating: 4.6,
    keySpecs: ["25W output", "USB-C", "Fast charging"],
    sponsored: false,
    variants: { colors: ["White", "Black"] },
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "og-8",
    name: "Adidas Duramo SL Running Shoes",
    brand: "Adidas",
    brandLogoUrl: "/logos/brands/adidas.svg",
    category: "Footwear",
    priceInr: 3299,
    mrpInr: 4999,
    cashbackInr: 180,
    rating: 4.7,
    keySpecs: ["Mesh upper", "Cushioned sole", "Daily running"],
    sponsored: false,
    bestOfferLine: "Best offer: Buy 2 and save extra ₹500.",
    variants: { colors: ["Black", "White"], sizes: ["7", "8", "9", "10"] },
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80",
  },
];
