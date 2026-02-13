export const ROUTE_SEGMENTS = {
  category: "category",
  product: "product",
  cart: "cart",
  checkout: "checkout",
  orderSuccess: "order-success",
  settings: "settings",
  vendor: "vendor",
  admin: "admin",
} as const;

export const SETTINGS_ROUTE_SEGMENTS = {
  orders: "orders",
  wallet: "wallet",
  support: "support",
  profile: "profile",
  addresses: "addresses",
  notifications: "notifications",
} as const;

const settingsRoot = `/${ROUTE_SEGMENTS.settings}` as const;
const vendorRoot = `/${ROUTE_SEGMENTS.vendor}` as const;
const adminRoot = `/${ROUTE_SEGMENTS.admin}` as const;

export const VENDOR_ROUTE_SEGMENTS = {
  login: "login",
  onboarding: "onboarding",
  dashboard: "dashboard",
  analytics: "analytics",
  reports: "reports",
  products: "products",
  orders: "orders",
  returnsRto: "returns-rto",
  wallet: "wallet",
  ads: "ads",
  support: "support",
  settings: "settings",
} as const;

export const ADMIN_ROUTE_SEGMENTS = {
  dashboard: "dashboard",
  vendors: "vendors",
  products: "products",
  orders: "orders",
  returnsRto: "returns-rto",
  ads: "ads",
  support: "support",
  settings: "settings",
} as const;

export const ROUTES = {
  home: "/",
  category: `/${ROUTE_SEGMENTS.category}`,
  product: `/${ROUTE_SEGMENTS.product}`,
  productDetail: (productId: string) => `/${ROUTE_SEGMENTS.product}/${productId}`,
  cart: `/${ROUTE_SEGMENTS.cart}`,
  checkout: `/${ROUTE_SEGMENTS.checkout}`,
  orderSuccess: `/${ROUTE_SEGMENTS.orderSuccess}`,
  orderSuccessDetail: (orderId: string) => `/${ROUTE_SEGMENTS.orderSuccess}/${orderId}`,
  settings: settingsRoot,
  settingsOrders: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.orders}`,
  settingsWallet: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.wallet}`,
  settingsSupport: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.support}`,
  settingsProfile: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.profile}`,
  settingsAddresses: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.addresses}`,
  settingsNotifications: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.notifications}`,
  vendor: vendorRoot,
  vendorLogin: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.login}`,
  vendorOnboarding: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.onboarding}`,
  vendorDashboard: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.dashboard}`,
  vendorAnalytics: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.analytics}`,
  vendorReports: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.reports}`,
  vendorProducts: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.products}`,
  vendorOrders: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.orders}`,
  vendorReturnsRto: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.returnsRto}`,
  vendorWallet: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.wallet}`,
  vendorAds: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.ads}`,
  vendorSupport: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.support}`,
  vendorSettings: `${vendorRoot}/${VENDOR_ROUTE_SEGMENTS.settings}`,
  admin: adminRoot,
  adminDashboard: `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.dashboard}`,
  adminVendors: `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.vendors}`,
  adminVendorDetail: (vendorId: string) =>
    `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.vendors}/${vendorId}`,
  adminProducts: `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.products}`,
  adminProductDetail: (productId: string) =>
    `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.products}/${productId}`,
  adminOrders: `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.orders}`,
  adminOrderDetail: (orderId: string) =>
    `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.orders}/${orderId}`,
  adminReturnsRto: `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.returnsRto}`,
  adminAds: `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.ads}`,
  adminSupport: `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.support}`,
  adminSettings: `${adminRoot}/${ADMIN_ROUTE_SEGMENTS.settings}`,
} as const;

export type NavItem = {
  label: string;
  to: string;
};

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Home", to: ROUTES.home },
  { label: "Category", to: ROUTES.category },
  { label: "Product", to: ROUTES.product },
  { label: "Cart", to: ROUTES.cart },
  { label: "Checkout", to: ROUTES.checkout },
  { label: "Settings", to: ROUTES.settings },
];

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  { label: "Orders", to: ROUTES.settingsOrders },
  { label: "Wallet", to: ROUTES.settingsWallet },
  { label: "Support", to: ROUTES.settingsSupport },
  { label: "Profile", to: ROUTES.settingsProfile },
  { label: "Addresses", to: ROUTES.settingsAddresses },
  { label: "Notifications", to: ROUTES.settingsNotifications },
];

export const VENDOR_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: ROUTES.vendorDashboard },
  { label: "Analytics", to: ROUTES.vendorAnalytics },
  { label: "Reports", to: ROUTES.vendorReports },
  { label: "Products", to: ROUTES.vendorProducts },
  { label: "Orders", to: ROUTES.vendorOrders },
  { label: "Returns & RTO", to: ROUTES.vendorReturnsRto },
  { label: "Wallet", to: ROUTES.vendorWallet },
  { label: "Ads", to: ROUTES.vendorAds },
  { label: "Support", to: ROUTES.vendorSupport },
  { label: "Settings", to: ROUTES.vendorSettings },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: ROUTES.adminDashboard },
  { label: "Vendors", to: ROUTES.adminVendors },
  { label: "Products", to: ROUTES.adminProducts },
  { label: "Orders", to: ROUTES.adminOrders },
  { label: "Returns / RTO", to: ROUTES.adminReturnsRto },
  { label: "Ads", to: ROUTES.adminAds },
  { label: "Support", to: ROUTES.adminSupport },
  { label: "Settings", to: ROUTES.adminSettings },
];
