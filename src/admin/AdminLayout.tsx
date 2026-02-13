import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ADMIN_NAV_ITEMS, ROUTES } from "../routes/paths";
import { useAdmin } from "./AdminContext";

function adminNavClassName(isActive: boolean) {
  return isActive ? "admin-nav-link active" : "admin-nav-link";
}

export function AdminLayout() {
  const navigate = useNavigate();
  const { adminName, logoutAdmin } = useAdmin();

  function handleLogout() {
    logoutAdmin();
    navigate(ROUTES.admin, { replace: true });
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <h1>Admin Panel</h1>
          <p>{adminName}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="admin-body">
        <aside className="admin-sidebar">
          <nav aria-label="Admin sections" className="admin-nav">
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => adminNavClassName(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
