export const ROUTE_SEGMENTS = {
  category: "category",
  product: "product",
  cart: "cart",
  checkout: "checkout",
  orderSuccess: "order-success",
  settings: "settings",
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

export const ROUTES = {
  home: "/",
  category: `/${ROUTE_SEGMENTS.category}`,
  product: `/${ROUTE_SEGMENTS.product}`,
  cart: `/${ROUTE_SEGMENTS.cart}`,
  checkout: `/${ROUTE_SEGMENTS.checkout}`,
  orderSuccess: `/${ROUTE_SEGMENTS.orderSuccess}`,
  settings: settingsRoot,
  settingsOrders: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.orders}`,
  settingsWallet: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.wallet}`,
  settingsSupport: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.support}`,
  settingsProfile: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.profile}`,
  settingsAddresses: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.addresses}`,
  settingsNotifications: `${settingsRoot}/${SETTINGS_ROUTE_SEGMENTS.notifications}`,
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
