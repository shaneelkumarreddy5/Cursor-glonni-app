import { Route, Routes } from "react-router-dom";
import {
  AdminAdsPage,
  AdminDashboardPage,
  AdminLoginPage,
  AdminOrderDetailPage,
  AdminOrdersPage,
  AdminProductDetailPage,
  AdminProductsPage,
  AdminProtectedLayoutRoute,
  AdminProviderRoute,
  AdminReturnsRtoPage,
  AdminSettingsPage,
  AdminSupportPage,
  AdminVendorDetailPage,
  AdminVendorsPage,
} from "../admin/AdminPages";
import { MainLayout } from "../layouts/MainLayout";
import { SettingsLayout } from "../layouts/SettingsLayout";
import { CartPage } from "../pages/CartPage";
import { CategoryPage } from "../pages/CategoryPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { OrderSuccessPage } from "../pages/OrderSuccessPage";
import { ProductPage } from "../pages/ProductPage";
import {
  AddressesSettingsPage,
  NotificationsSettingsPage,
  OrdersSettingsPage,
  ProfileSettingsPage,
  SettingsOverviewPage,
  SupportSettingsPage,
  WalletSettingsPage,
} from "../pages/settings/SettingsPages";
import {
  VendorAdsPage,
  VendorAnalyticsPage,
  VendorDashboardPage,
  VendorLandingRedirect,
  VendorLoginPage,
  VendorOnboardingPage,
  VendorOrdersPage,
  VendorProductsPage,
  VendorProtectedLayoutRoute,
  VendorProviderRoute,
  VendorReportsPage,
  VendorReturnsRtoPage,
  VendorSettingsPage,
  VendorSupportPage,
  VendorWalletPage,
} from "../vendor/VendorPages";
import {
  ADMIN_ROUTE_SEGMENTS,
  ROUTES,
  ROUTE_SEGMENTS,
  SETTINGS_ROUTE_SEGMENTS,
  VENDOR_ROUTE_SEGMENTS,
} from "./paths";

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTE_SEGMENTS.category} element={<CategoryPage />} />
        <Route path={ROUTE_SEGMENTS.product} element={<ProductPage />} />
        <Route path={`${ROUTE_SEGMENTS.product}/:productId`} element={<ProductPage />} />
        <Route path={ROUTE_SEGMENTS.cart} element={<CartPage />} />
        <Route path={ROUTE_SEGMENTS.checkout} element={<CheckoutPage />} />
        <Route path={ROUTE_SEGMENTS.orderSuccess} element={<OrderSuccessPage />} />
        <Route
          path={`${ROUTE_SEGMENTS.orderSuccess}/:orderId`}
          element={<OrderSuccessPage />}
        />

        <Route path={ROUTE_SEGMENTS.settings} element={<SettingsLayout />}>
          <Route index element={<SettingsOverviewPage />} />
          <Route
            path={SETTINGS_ROUTE_SEGMENTS.orders}
            element={<OrdersSettingsPage />}
          />
          <Route
            path={SETTINGS_ROUTE_SEGMENTS.wallet}
            element={<WalletSettingsPage />}
          />
          <Route
            path={SETTINGS_ROUTE_SEGMENTS.support}
            element={<SupportSettingsPage />}
          />
          <Route
            path={SETTINGS_ROUTE_SEGMENTS.profile}
            element={<ProfileSettingsPage />}
          />
          <Route
            path={SETTINGS_ROUTE_SEGMENTS.addresses}
            element={<AddressesSettingsPage />}
          />
          <Route
            path={SETTINGS_ROUTE_SEGMENTS.notifications}
            element={<NotificationsSettingsPage />}
          />
        </Route>
      </Route>

      <Route path={ROUTE_SEGMENTS.admin} element={<AdminProviderRoute />}>
        <Route index element={<AdminLoginPage />} />

        <Route element={<AdminProtectedLayoutRoute />}>
          <Route path={ADMIN_ROUTE_SEGMENTS.dashboard} element={<AdminDashboardPage />} />
          <Route path={ADMIN_ROUTE_SEGMENTS.vendors} element={<AdminVendorsPage />} />
          <Route
            path={`${ADMIN_ROUTE_SEGMENTS.vendors}/:vendorId`}
            element={<AdminVendorDetailPage />}
          />
          <Route path={ADMIN_ROUTE_SEGMENTS.products} element={<AdminProductsPage />} />
          <Route
            path={`${ADMIN_ROUTE_SEGMENTS.products}/:productId`}
            element={<AdminProductDetailPage />}
          />
          <Route path={ADMIN_ROUTE_SEGMENTS.orders} element={<AdminOrdersPage />} />
          <Route
            path={`${ADMIN_ROUTE_SEGMENTS.orders}/:orderId`}
            element={<AdminOrderDetailPage />}
          />
          <Route path={ADMIN_ROUTE_SEGMENTS.returnsRto} element={<AdminReturnsRtoPage />} />
          <Route path={ADMIN_ROUTE_SEGMENTS.ads} element={<AdminAdsPage />} />
          <Route path={ADMIN_ROUTE_SEGMENTS.support} element={<AdminSupportPage />} />
          <Route path={ADMIN_ROUTE_SEGMENTS.settings} element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route path={ROUTE_SEGMENTS.vendor} element={<VendorProviderRoute />}>
        <Route index element={<VendorLandingRedirect />} />
        <Route path={VENDOR_ROUTE_SEGMENTS.login} element={<VendorLoginPage />} />

        <Route element={<VendorProtectedLayoutRoute />}>
          <Route path={VENDOR_ROUTE_SEGMENTS.onboarding} element={<VendorOnboardingPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.dashboard} element={<VendorDashboardPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.analytics} element={<VendorAnalyticsPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.reports} element={<VendorReportsPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.products} element={<VendorProductsPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.orders} element={<VendorOrdersPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.returnsRto} element={<VendorReturnsRtoPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.wallet} element={<VendorWalletPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.ads} element={<VendorAdsPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.support} element={<VendorSupportPage />} />
          <Route path={VENDOR_ROUTE_SEGMENTS.settings} element={<VendorSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
