import { NavLink, Outlet } from "react-router-dom";
import {
  AddressIcon,
  NotificationIcon,
  OrdersIcon,
  ProfileIcon,
  SupportIcon,
  WalletIcon,
} from "../components/ui/AppIcons";
import { ROUTES } from "../routes/paths";

function navClassName(isActive: boolean) {
  return isActive ? "settings-link active" : "settings-link";
}

const SETTINGS_NAV_GROUPS = [
  {
    title: "Shopping",
    items: [
      { to: ROUTES.settingsOrders, label: "Orders", Icon: OrdersIcon },
      { to: ROUTES.settingsWallet, label: "Wallet", Icon: WalletIcon },
      { to: ROUTES.settingsSupport, label: "Support", Icon: SupportIcon },
    ],
  },
  {
    title: "Account",
    items: [
      { to: ROUTES.settingsProfile, label: "Profile", Icon: ProfileIcon },
      { to: ROUTES.settingsAddresses, label: "Addresses", Icon: AddressIcon },
      {
        to: ROUTES.settingsNotifications,
        label: "Notifications",
        Icon: NotificationIcon,
      },
    ],
  },
] as const;

export function SettingsLayout() {
  return (
    <section className="settings-layout">
      <aside className="card settings-sidebar">
        <header className="section-header">
          <h2>Settings</h2>
        </header>
        <div className="stack-sm">
          <span className="muted-tag">Rohit Sharma</span>
          <p className="footer-copy">Manage account, orders, support, and communication preferences.</p>
        </div>
        {SETTINGS_NAV_GROUPS.map((group) => (
          <div key={group.title} className="settings-nav-group">
            <p className="settings-group-title">{group.title}</p>
            <nav aria-label={`${group.title} settings sections`} className="settings-nav">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navClassName(isActive)}
                >
                  <span className="settings-link-icon" aria-hidden="true">
                    <item.Icon />
                  </span>
                  <span className="settings-link-copy">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </aside>

      <div className="settings-content">
        <Outlet />
      </div>
    </section>
  );
}
