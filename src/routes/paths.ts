export const ROUTES = {
  home: "/",
  category: "/category",
  product: "/product",
  cart: "/cart",
  checkout: "/checkout",
  settings: "/settings",
  settingsOrders: "/settings/orders",
  settingsWallet: "/settings/wallet",
  settingsSupport: "/settings/support",
  settingsProfile: "/settings/profile",
  settingsAddresses: "/settings/addresses",
  settingsNotifications: "/settings/notifications",
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
  { label: "Settings", to: ROUTES.settingsOrders },
];

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  { label: "Orders", to: ROUTES.settingsOrders },
  { label: "Wallet", to: ROUTES.settingsWallet },
  { label: "Support", to: ROUTES.settingsSupport },
  { label: "Profile", to: ROUTES.settingsProfile },
  { label: "Addresses", to: ROUTES.settingsAddresses },
  { label: "Notifications", to: ROUTES.settingsNotifications },
];
