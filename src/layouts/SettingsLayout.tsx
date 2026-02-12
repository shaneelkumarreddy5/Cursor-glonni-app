import { NavLink, Outlet } from "react-router-dom";
import { SETTINGS_NAV_ITEMS } from "../routes/paths";

function navClassName(isActive: boolean) {
  return isActive ? "settings-link active" : "settings-link";
}

export function SettingsLayout() {
  return (
    <section className="settings-layout">
      <aside className="card settings-sidebar">
        <header className="section-header">
          <h2>Settings</h2>
        </header>
        <nav aria-label="Settings sections" className="settings-nav">
          {SETTINGS_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => navClassName(isActive)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="settings-content">
        <Outlet />
      </div>
    </section>
  );
}
