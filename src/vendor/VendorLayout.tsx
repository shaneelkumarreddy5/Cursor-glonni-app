import { NavLink, Outlet } from "react-router-dom";
import { ROUTES, VENDOR_NAV_ITEMS } from "../routes/paths";
import { useVendor } from "./VendorContext";

const SUSPENDED_BLOCKED_ROUTES = new Set([
  ROUTES.vendorProducts,
  ROUTES.vendorOrders,
  ROUTES.vendorReturnsRto,
  ROUTES.vendorAds,
]);

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
  if (status === "Suspended") {
    return "vendor-status-badge vendor-status-suspended";
  }
  return "vendor-status-badge vendor-status-scrutiny";
}

function getStatusBannerClass(status: ReturnType<typeof useVendor>["vendorStatus"]) {
  if (status === "Approved") {
    return "vendor-status-banner vendor-status-banner-approved";
  }
  if (status === "Rejected") {
    return "vendor-status-banner vendor-status-banner-rejected";
  }
  if (status === "Suspended") {
    return "vendor-status-banner vendor-status-banner-suspended";
  }
  return "vendor-status-banner vendor-status-banner-scrutiny";
}

function getRestrictionMessage(
  status: ReturnType<typeof useVendor>["vendorStatus"],
  reason: string | null,
) {
  const reasonSuffix = reason ? ` Admin reason: ${reason}` : "";

  if (status === "Approved") {
    return `Vendor account is approved. Selling actions are enabled.${reasonSuffix}`;
  }

  if (status === "Rejected") {
    return `Vendor account is rejected. Product publishing and selling actions are disabled.${reasonSuffix}`;
  }

  if (status === "Suspended") {
    return `Vendor account is suspended. Login is allowed but all selling actions are blocked.${reasonSuffix}`;
  }

  return `Vendor account is under scrutiny. Product publishing is disabled until approval.${reasonSuffix}`;
}

export function VendorLayout() {
  const {
    vendorName,
    vendorStatus,
    vendorStatusReason,
    canPublishProducts,
    hasCompletedOnboarding,
  } = useVendor();

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
            {VENDOR_NAV_ITEMS.map((item) => {
              const isProductsRoute = item.to === ROUTES.vendorProducts;
              const isSuspendedSellingRoute =
                vendorStatus === "Suspended" &&
                SUSPENDED_BLOCKED_ROUTES.has(item.to);
              const disableProductsLink = isProductsRoute && !canPublishProducts;
              const disableLink = disableProductsLink || isSuspendedSellingRoute;

              if (disableLink) {
                const disabledTitle = isSuspendedSellingRoute
                  ? "Selling actions are blocked while account is suspended."
                  : "Products page will be enabled after approval.";
                return (
                  <span
                    key={item.to}
                    className="vendor-nav-link is-disabled"
                    title={disabledTitle}
                  >
                    {item.label}
                  </span>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => vendorNavClassName(isActive)}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="vendor-main">
          <section className={getStatusBannerClass(vendorStatus)}>
            <p>{getRestrictionMessage(vendorStatus, vendorStatusReason)}</p>
            {!hasCompletedOnboarding && vendorStatus === "Under Scrutiny" ? (
              <NavLink to={ROUTES.vendorOnboarding} className="btn btn-secondary">
                Complete Onboarding
              </NavLink>
            ) : null}
          </section>
          <Outlet />
        </main>
      </section>
    </div>
  );
}
