import { Route, Routes } from "react-router-dom";
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
import { ROUTES, ROUTE_SEGMENTS, SETTINGS_ROUTE_SEGMENTS } from "./paths";

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

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
