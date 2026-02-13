import { NavLink, Outlet } from "react-router-dom";
import { VENDOR_NAV_ITEMS } from "../routes/paths";
import { useVendor } from "./VendorContext";

function vendorNavClassName(isActive: boolean) {
  return isActive ? "vendor-nav-link active" : "vendor-nav-link";
}

function getStatusBadgeClass(status: ReturnType<typeof useVendor>["vendorStatus"]) {
  if (status === "Approved") {
    return "vendor-status-badge vendor-status-approved";
  }
  if (status === "Rejected") {
    return "vendor-status-badge vendor-status-rejected";
  }
  return "vendor-status-badge vendor-status-scrutiny";
}

function getRestrictionMessage(status: ReturnType<typeof useVendor>["vendorStatus"]) {
  if (status === "Rejected") {
    return "Vendor account is rejected. Product publishing is disabled until profile review is completed.";
  }

  return "Vendor account is under scrutiny. Product publishing is disabled until approval.";
}

export function VendorLayout() {
  const { vendorName, vendorStatus, canPublishProducts } = useVendor();

  return (
    <div className="vendor-shell">
      <header className="vendor-topbar">
        <div>
          <p className="vendor-kicker">Glonni Vendor Dashboard</p>
          <h1>{vendorName}</h1>
        </div>
        <span className={getStatusBadgeClass(vendorStatus)}>{vendorStatus}</span>
      </header>

      <section className="vendor-body">
        <aside className="vendor-sidebar">
          <nav aria-label="Vendor sections" className="vendor-nav">
            {VENDOR_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => vendorNavClassName(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="vendor-main">
          {!canPublishProducts ? (
            <section className="vendor-restriction-banner">
              <p>{getRestrictionMessage(vendorStatus)}</p>
            </section>
          ) : null}
          <Outlet />
        </main>
      </section>
    </div>
  );
}
