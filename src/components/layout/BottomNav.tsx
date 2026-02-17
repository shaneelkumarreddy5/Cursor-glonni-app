import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  OrdersIcon,
  ProfileIcon,
  SearchIcon,
  WalletIcon,
} from "../ui/AppIcons";
import { ROUTES } from "../../routes/paths";

function navItemClassName(isActive: boolean) {
  return isActive ? "app-bottom-link is-active" : "app-bottom-link";
}

export function BottomNav() {
  return (
    <nav aria-label="Bottom navigation" className="app-bottom-nav">
      <NavLink to={ROUTES.home} className={({ isActive }) => navItemClassName(isActive)}>
        <HomeIcon />
        <span>Home</span>
      </NavLink>
      <NavLink to={ROUTES.category} className={({ isActive }) => navItemClassName(isActive)}>
        <SearchIcon />
        <span>Categories</span>
      </NavLink>
      <NavLink
        to={ROUTES.settingsOrders}
        className={({ isActive }) => navItemClassName(isActive)}
      >
        <OrdersIcon />
        <span>Orders</span>
      </NavLink>
      <NavLink
        to={ROUTES.settingsWallet}
        className={({ isActive }) => navItemClassName(isActive)}
      >
        <WalletIcon />
        <span>Earn</span>
      </NavLink>
      <NavLink
        to={ROUTES.settingsProfile}
        className={({ isActive }) => navItemClassName(isActive)}
      >
        <ProfileIcon />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
