import { Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { SettingsLayout } from "../layouts/SettingsLayout";
import { CartPage } from "../pages/CartPage";
import { CategoryPage } from "../pages/CategoryPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
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
import { ROUTES } from "./paths";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.category.slice(1)} element={<CategoryPage />} />
        <Route path={ROUTES.product.slice(1)} element={<ProductPage />} />
        <Route path={ROUTES.cart.slice(1)} element={<CartPage />} />
        <Route path={ROUTES.checkout.slice(1)} element={<CheckoutPage />} />

        <Route path={ROUTES.settings.slice(1)} element={<SettingsLayout />}>
          <Route index element={<SettingsOverviewPage />} />
          <Route path="orders" element={<OrdersSettingsPage />} />
          <Route path="wallet" element={<WalletSettingsPage />} />
          <Route path="support" element={<SupportSettingsPage />} />
          <Route path="profile" element={<ProfileSettingsPage />} />
          <Route path="addresses" element={<AddressesSettingsPage />} />
          <Route path="notifications" element={<NotificationsSettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
