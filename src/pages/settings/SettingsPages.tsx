import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageIntro } from "../../components/ui/PageIntro";
import { ROUTES } from "../../routes/paths";
import { useOrderOperations } from "../../state/OrderOperationsContext";
import { type OrderRecord, useCommerce } from "../../state/CommerceContext";
import { formatInr } from "../../utils/currency";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price",
  "Need faster delivery",
  "Shipping address issue",
  "Other",
];

const RETURN_REASONS = [
  "Damaged item received",
  "Wrong item delivered",
  "Size or fit issue",
  "Quality not as expected",
  "Missing accessories",
  "Other",
];

const faqItems = [
  "How is cashback calculated on Glonni?",
  "When will cashback be credited to wallet?",
  "How do I request a return or replacement?",
];

type ActionMode = "cancel" | "return" | "no-return";
type WalletHistoryFilter = "Pending" | "Confirmed" | "Cancelled";

function formatOrderDate(orderDateIso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(orderDateIso));
}

function getStatusClass(orderStatus: OrderRecord["fulfillmentStatus"]) {
  if (orderStatus === "Ordered") {
    return "order-status-badge order-status-ordered";
  }
  if (orderStatus === "Shipped") {
    return "order-status-badge order-status-shipped";
  }
  if (orderStatus === "Delivered") {
    return "order-status-badge order-status-delivered";
  }
  if (orderStatus === "Cancelled") {
    return "order-status-badge order-status-cancelled";
  }
  return "order-status-badge order-status-return-requested";
}

function getPaymentBadgeClass(order: OrderRecord) {
  return order.paymentMethodId === "cod"
    ? "payment-method-badge payment-method-cod"
    : "payment-method-badge payment-method-online";
}

function getCashbackStatusClass(order: OrderRecord) {
  if (order.cashbackStatus === "Pending") {
    return "cashback-status-badge cashback-status-pending";
  }
  if (order.cashbackStatus === "On Hold") {
    return "cashback-status-badge cashback-status-on-hold";
  }
  if (order.cashbackStatus === "Confirmed") {
    return "cashback-status-badge cashback-status-confirmed";
  }
  return "cashback-status-badge cashback-status-cancelled";
}

function getCashbackStatusHelpText(order: OrderRecord) {
  if (order.cashbackStatus === "Pending") {
    if (order.fulfillmentStatus !== "Delivered") {
      return "Cashback is pending until delivery completion.";
    }
    return "Cashback will be credited after return window.";
  }

  if (order.cashbackStatus === "On Hold") {
    return "Cashback is on hold until return request resolution.";
  }

  if (order.cashbackStatus === "Confirmed") {
    return "Cashback will be credited after return window.";
  }

  return "Cashback is cancelled for this order.";
}

function getReturnWindowState(order: OrderRecord) {
  if (!order.deliveredAtIso) {
    return {
      isOpen: false,
      isExpired: false,
      deadlineLabel: null as string | null,
      daysLeft: 0,
    };
  }

  const deliveredAtMs = new Date(order.deliveredAtIso).getTime();
  const deadlineMs = deliveredAtMs + order.returnWindowDays * DAY_IN_MS;
  const remainingMs = deadlineMs - Date.now();
  const daysLeft = Math.max(0, Math.ceil(remainingMs / DAY_IN_MS));
  const deadlineLabel = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(deadlineMs));

  const isOpen =
    order.fulfillmentStatus === "Delivered" &&
    !order.returnWindowClosed &&
    remainingMs >= 0;

  const isExpired =
    order.fulfillmentStatus === "Delivered" &&
    !order.returnWindowClosed &&
    remainingMs < 0;

  return { isOpen, isExpired, deadlineLabel, daysLeft };
}

function getCancelDisabledTooltip(order: OrderRecord) {
  if (order.fulfillmentStatus === "Ordered") {
    return "";
  }
  if (order.fulfillmentStatus === "Shipped") {
    return "Cannot cancel after shipping.";
  }
  if (order.fulfillmentStatus === "Delivered") {
    return "Cannot cancel after delivery.";
  }
  if (order.fulfillmentStatus === "Cancelled") {
    return "Order is already cancelled.";
  }
  return "Cancellation unavailable when return is requested.";
}

function getReturnDisabledTooltip(order: OrderRecord) {
  const returnWindow = getReturnWindowState(order);

  if (order.fulfillmentStatus === "Return Requested") {
    return "Return already requested.";
  }

  if (order.fulfillmentStatus !== "Delivered") {
    return "Return / Replace is available only after delivery.";
  }

  if (returnWindow.isExpired) {
    return "Return window has ended.";
  }

  if (order.returnWindowClosed) {
    return "Return window is closed.";
  }

  return "";
}

function getMarkShippedTooltip(order: OrderRecord) {
  if (order.fulfillmentStatus === "Ordered") {
    return "";
  }
  return "Only ordered status can move to shipped.";
}

function getMarkDeliveredTooltip(order: OrderRecord) {
  if (order.fulfillmentStatus === "Shipped") {
    return "";
  }
  return "Only shipped status can move to delivered.";
}

function getDeliveryTimelineProgress(order: OrderRecord) {
  if (order.fulfillmentStatus === "Shipped") {
    return 1;
  }
  if (
    order.fulfillmentStatus === "Delivered" ||
    order.fulfillmentStatus === "Return Requested"
  ) {
    return 2;
  }
  return 0;
}

export function SettingsOverviewPage() {
  const { orders, pendingCashbackTotalInr, cartItemsCount } = useCommerce();
  const activeOrders = orders.filter((order) =>
    ["Ordered", "Shipped", "Return Requested"].includes(order.fulfillmentStatus),
  ).length;

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Settings Overview"
        description="Manage your orders, wallet, support, and profile from one place."
      />

      <section className="card settings-kpi-grid">
        <article>
          <h3>Orders in progress</h3>
          <p>{activeOrders} active orders</p>
        </article>
        <article>
          <h3>Pending cashback</h3>
          <p>{formatInr(pendingCashbackTotalInr)}</p>
        </article>
        <article>
          <h3>Total orders</h3>
          <p>{orders.length} orders</p>
        </article>
        <article>
          <h3>Cart items</h3>
          <p>{cartItemsCount} items</p>
        </article>
      </section>
    </div>
  );
}

export function OrdersSettingsPage() {
  const {
    orders,
    cancelOrder,
    requestReturn,
    confirmNoReturn,
    markOrderShipped,
    markOrderDelivered,
  } = useCommerce();
  const { getUserOrderResolutionByOrderId } = useOrderOperations();
  const [activeAction, setActiveAction] = useState<{
    orderId: string;
    mode: ActionMode;
  } | null>(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [notes, setNotes] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  function openAction(orderId: string, mode: ActionMode) {
    setActiveAction({ orderId, mode });
    setNotes("");
    setFeedbackMessage(null);

    if (mode === "cancel") {
      setSelectedReason(CANCEL_REASONS[0]);
      return;
    }

    if (mode === "return") {
      setSelectedReason(RETURN_REASONS[0]);
      return;
    }

    setSelectedReason("");
  }

  function closeActionPanel() {
    setActiveAction(null);
    setSelectedReason("");
    setNotes("");
  }

  function submitAction(order: OrderRecord) {
    if (!activeAction || activeAction.orderId !== order.id) {
      return;
    }

    if (activeAction.mode === "cancel") {
      const result = cancelOrder(order.id, selectedReason, notes);
      setFeedbackMessage(result.message);
      if (result.ok) {
        closeActionPanel();
      }
      return;
    }

    if (activeAction.mode === "return") {
      const result = requestReturn(order.id, selectedReason, notes);
      setFeedbackMessage(result.message);
      if (result.ok) {
        closeActionPanel();
      }
      return;
    }

    const result = confirmNoReturn(order.id);
    setFeedbackMessage(result.message);
    if (result.ok) {
      closeActionPanel();
    }
  }

  function runOrderLifecycleAction(order: OrderRecord, action: "ship" | "deliver") {
    const result =
      action === "ship"
        ? markOrderShipped(order.id)
        : markOrderDelivered(order.id);
    setFeedbackMessage(result.message);
  }

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (first, second) =>
          new Date(second.placedAtIso).getTime() -
          new Date(first.placedAtIso).getTime(),
      ),
    [orders],
  );

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Orders"
        description="Track orders and manage cancellation, return, cashback, and support requests."
      />

      {feedbackMessage ? (
        <section className="card order-feedback">
          <p>{feedbackMessage}</p>
        </section>
      ) : null}

      <section className="settings-list">
        {sortedOrders.length > 0 ? (
          sortedOrders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const canCancel = order.fulfillmentStatus === "Ordered";
            const canMarkShipped = order.fulfillmentStatus === "Ordered";
            const canMarkDelivered = order.fulfillmentStatus === "Shipped";
            const returnWindow = getReturnWindowState(order);
            const canReturnOrReplace = returnWindow.isOpen;
            const canNoReturn = returnWindow.isOpen;
            const returnDisabledTooltip = getReturnDisabledTooltip(order);
            const cancelDisabledTooltip = getCancelDisabledTooltip(order);
            const supportLink = `${ROUTES.settingsSupport}?orderId=${encodeURIComponent(order.id)}`;
            const adminResolution = getUserOrderResolutionByOrderId(order.id);

            return (
              <div key={order.id} className="stack-sm">
                <article className="card settings-list-row order-list-row">
                  <div>
                    <div className="order-heading-row">
                      <h3>{order.id}</h3>
                      <span className={getStatusClass(order.fulfillmentStatus)}>
                        {order.fulfillmentStatus}
                      </span>
                      <span className={getPaymentBadgeClass(order)}>
                        {order.paymentMethodId === "cod" ? "COD" : "Online"}
                      </span>
                    </div>
                    <div className="order-timeline" aria-label={`Delivery timeline for ${order.id}`}>
                      {["Ordered", "Shipped", "Delivered"].map((timelineStep, index) => {
                        const progressIndex = getDeliveryTimelineProgress(order);
                        const stepClass =
                          index < progressIndex
                            ? "order-timeline-step is-complete"
                            : index === progressIndex
                              ? "order-timeline-step is-current"
                              : "order-timeline-step";

                        return (
                          <div key={timelineStep} className={stepClass}>
                            <span className="order-timeline-dot" aria-hidden="true" />
                            <span>{timelineStep}</span>
                          </div>
                        );
                      })}
                    </div>
                    {order.fulfillmentStatus === "Cancelled" ? (
                      <p className="order-timeline-note">
                        Delivery timeline stopped because this order was cancelled.
                      </p>
                    ) : null}
                    <p>Date: {formatOrderDate(order.placedAtIso)}</p>
                    <p>Items: {itemCount}</p>
                    <p>
                      Payment: {order.paymentMethodTitle} •{" "}
                      {order.paymentPending ? "Pending collection" : "Completed"}
                    </p>
                    <p>
                      Cashback: {formatInr(order.cashbackPendingInr)}{" "}
                      <span className={getCashbackStatusClass(order)}>
                        {order.cashbackStatus}
                      </span>
                    </p>
                    <p>{getCashbackStatusHelpText(order)}</p>
                    {order.fulfillmentStatus === "Delivered" &&
                    returnWindow.deadlineLabel ? (
                      <p>
                        Return window: {order.returnWindowDays} days (till{" "}
                        {returnWindow.deadlineLabel})
                        {returnWindow.isOpen
                          ? ` • ${returnWindow.daysLeft} day(s) left`
                          : order.returnWindowClosed
                            ? " • Closed"
                            : " • Expired"}
                      </p>
                    ) : null}
                    {order.refundStatus === "Refund Initiated" ? (
                      <p>
                        Refund: {order.refundStatus} via{" "}
                        {order.refundMethod ?? "Original payment method"}
                      </p>
                    ) : null}
                    {order.cancellationReason ? (
                      <p>Cancellation reason: {order.cancellationReason}</p>
                    ) : null}
                    {order.returnReason ? <p>Return reason: {order.returnReason}</p> : null}
                    {order.pickupStatus === "Pickup Pending" ? (
                      <p>Pickup status: Pickup pending</p>
                    ) : null}
                    {adminResolution ? (
                      <div className="order-admin-resolution">
                        <p>
                          <strong>Admin reason:</strong>{" "}
                          {adminResolution.reason ?? "No reason shared."}
                        </p>
                        <p>
                          <strong>Refund status:</strong> {adminResolution.userRefundStatus}
                        </p>
                        <p>
                          <strong>Cashback status:</strong>{" "}
                          {adminResolution.userCashbackStatus}
                        </p>
                        <p>
                          <strong>Updated:</strong>{" "}
                          {formatOrderDate(adminResolution.updatedAtIso)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <div className="order-price-col">
                    <strong>{formatInr(order.payableAmountInr)}</strong>
                    <div className="order-action-row">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={!canMarkShipped}
                        title={!canMarkShipped ? getMarkShippedTooltip(order) : "Mark as shipped"}
                        onClick={() => runOrderLifecycleAction(order, "ship")}
                      >
                        Mark Shipped
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={!canMarkDelivered}
                        title={!canMarkDelivered ? getMarkDeliveredTooltip(order) : "Mark as delivered"}
                        onClick={() => runOrderLifecycleAction(order, "deliver")}
                      >
                        Mark Delivered
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={!canCancel}
                        title={!canCancel ? cancelDisabledTooltip : "Cancel this order"}
                        onClick={() => openAction(order.id, "cancel")}
                      >
                        Cancel Order
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={!canReturnOrReplace}
                        title={
                          !canReturnOrReplace
                            ? returnDisabledTooltip
                            : "Request return or replacement"
                        }
                        onClick={() => openAction(order.id, "return")}
                      >
                        Return / Replace
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={!canNoReturn}
                        title={
                          !canNoReturn
                            ? returnDisabledTooltip || "No Return unavailable"
                            : "Confirm no return and release cashback"
                        }
                        onClick={() => openAction(order.id, "no-return")}
                      >
                        No Return
                      </button>
                      <Link to={supportLink} className="btn btn-secondary">
                        Need Help?
                      </Link>
                    </div>
                  </div>
                </article>

                {activeAction?.orderId === order.id ? (
                  <section className="card order-action-panel">
                    {activeAction.mode === "cancel" ? (
                      <div className="stack-sm">
                        <header className="section-header">
                          <h2>Cancel Order</h2>
                        </header>
                        <p>
                          Cancellation is available only before shipping. Please confirm the
                          reason.
                        </p>
                        <label className="field">
                          Cancellation reason
                          <select
                            value={selectedReason}
                            onChange={(event) => setSelectedReason(event.target.value)}
                            className="order-select"
                          >
                            {CANCEL_REASONS.map((reasonOption) => (
                              <option key={reasonOption} value={reasonOption}>
                                {reasonOption}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          Additional comments (optional)
                          <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            className="order-textarea"
                            rows={3}
                            placeholder="Share any additional details"
                          />
                        </label>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => submitAction(order)}
                          >
                            Confirm cancellation
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeActionPanel}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {activeAction.mode === "return" ? (
                      <div className="stack-sm">
                        <header className="section-header">
                          <h2>Return / Replace</h2>
                        </header>
                        <p>
                          Eligible within {order.returnWindowDays} days from delivery.
                          Refund policy and cashback adjustments will apply.
                        </p>
                        <div className="order-policy">
                          <p>
                            <strong>Return policy:</strong> {order.returnPolicySummary}
                          </p>
                          <p>
                            <strong>Refund timeline:</strong> {order.refundTimelineSummary}
                          </p>
                          <p>
                            <strong>Non-returnable conditions:</strong>
                          </p>
                          <ul className="order-policy-list">
                            {order.nonReturnableConditions.map((condition) => (
                              <li key={condition}>{condition}</li>
                            ))}
                          </ul>
                        </div>
                        <label className="field">
                          Return reason
                          <select
                            value={selectedReason}
                            onChange={(event) => setSelectedReason(event.target.value)}
                            className="order-select"
                          >
                            {RETURN_REASONS.map((reasonOption) => (
                              <option key={reasonOption} value={reasonOption}>
                                {reasonOption}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="field">
                          Additional details (optional)
                          <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            className="order-textarea"
                            rows={3}
                            placeholder="Share issue details for faster pickup"
                          />
                        </label>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => submitAction(order)}
                          >
                            Confirm return request
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeActionPanel}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {activeAction.mode === "no-return" ? (
                      <div className="stack-sm">
                        <header className="section-header">
                          <h2>No Return Confirmation</h2>
                        </header>
                        <p>
                          Confirming this action closes the return window immediately.
                          Cashback will move to confirmed release state as per policy.
                        </p>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => submitAction(order)}
                          >
                            Confirm No Return
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeActionPanel}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </div>
            );
          })
        ) : (
          <article className="card settings-list-row">
            <div>
              <h3>No orders yet</h3>
              <p>Place an order from checkout to see it listed here.</p>
            </div>
            <strong>-</strong>
          </article>
        )}
      </section>
    </div>
  );
}

export function WalletSettingsPage() {
  const {
    orders,
    pendingCashbackTotalInr,
    onHoldCashbackTotalInr,
    confirmedCashbackTotalInr,
  } = useCommerce();
  const [historyFilter, setHistoryFilter] = useState<WalletHistoryFilter>("Pending");

  const cashbackEntries = [...orders].sort(
    (first, second) =>
      new Date(second.placedAtIso).getTime() - new Date(first.placedAtIso).getTime(),
  );
  const pendingCodOrders = cashbackEntries.filter(
    (order) => order.cashbackStatus === "Pending" && order.paymentMethodId === "cod",
  );
  const pendingNonCodOrders = cashbackEntries.filter(
    (order) => order.cashbackStatus === "Pending" && order.paymentMethodId !== "cod",
  );
  const confirmedOrders = cashbackEntries.filter(
    (order) => order.cashbackStatus === "Confirmed",
  );
  const onHoldOrders = cashbackEntries.filter(
    (order) => order.cashbackStatus === "On Hold",
  );

  const filteredHistoryEntries = useMemo(() => {
    if (historyFilter === "Pending") {
      return cashbackEntries.filter(
        (order) =>
          order.cashbackStatus === "Pending" || order.cashbackStatus === "On Hold",
      );
    }
    if (historyFilter === "Confirmed") {
      return cashbackEntries.filter((order) => order.cashbackStatus === "Confirmed");
    }
    return cashbackEntries.filter((order) => order.cashbackStatus === "Cancelled");
  }, [cashbackEntries, historyFilter]);

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Wallet"
        description="Cashback stays linked to order lifecycle: pending, on hold, confirmed, or cancelled."
      />

      <section className="card settings-kpi-grid">
        <article>
          <h3>Available balance</h3>
          <p>{formatInr(0)}</p>
        </article>
        <article>
          <h3>Pending cashback</h3>
          <p>{formatInr(pendingCashbackTotalInr)}</p>
        </article>
        <article>
          <h3>On Hold cashback</h3>
          <p>{formatInr(onHoldCashbackTotalInr)}</p>
        </article>
        <article>
          <h3>Confirmed cashback</h3>
          <p>{formatInr(confirmedCashbackTotalInr)}</p>
        </article>
      </section>

      <section className="card settings-list cashback-list-section">
        <header className="section-header">
          <h2>Cashback history</h2>
        </header>
        <div className="wallet-history-filter-row" role="list" aria-label="Cashback history filter">
          {(["Pending", "Confirmed", "Cancelled"] as WalletHistoryFilter[]).map((filterOption) => (
            <button
              key={filterOption}
              type="button"
              className={
                historyFilter === filterOption
                  ? "plp-filter-chip is-selected"
                  : "plp-filter-chip"
              }
              role="listitem"
              onClick={() => setHistoryFilter(filterOption)}
            >
              {filterOption}
            </button>
          ))}
        </div>
        {filteredHistoryEntries.length > 0 ? (
          filteredHistoryEntries.map((order) => (
            <article key={`${historyFilter}-${order.id}`} className="settings-list-row">
              <div>
                <h3>{order.id}</h3>
                <p>
                  Status: <span className={getCashbackStatusClass(order)}>{order.cashbackStatus}</span>
                </p>
                <p>Updated: {formatOrderDate(order.placedAtIso)}</p>
                <p>{getCashbackStatusHelpText(order)}</p>
              </div>
              <strong
                className={
                  order.cashbackStatus === "Confirmed"
                    ? "settings-credit"
                    : order.cashbackStatus === "Cancelled"
                      ? "settings-debit"
                      : undefined
                }
              >
                {order.cashbackStatus === "Confirmed" ? "+" : ""}
                {formatInr(order.cashbackPendingInr)}
              </strong>
            </article>
          ))
        ) : (
          <p className="wallet-empty-note">No cashback entries for the selected filter.</p>
        )}
      </section>

      <section className="card settings-list cashback-list-section">
        <header className="section-header">
          <h2>Pending cashback - COD orders</h2>
        </header>
        {pendingCodOrders.length > 0 ? (
          pendingCodOrders.map((order) => (
            <article key={order.id} className="settings-list-row">
              <div>
                <h3>{order.id}</h3>
                <p>
                  <span className={getPaymentBadgeClass(order)}>COD</span> •{" "}
                  {order.fulfillmentStatus}
                </p>
                <p>Cashback is pending until delivery completion.</p>
              </div>
              <strong>{formatInr(order.cashbackPendingInr)}</strong>
            </article>
          ))
        ) : (
          <p className="wallet-empty-note">No COD cashback pending right now.</p>
        )}
      </section>

      <section className="card settings-list cashback-list-section">
        <header className="section-header">
          <h2>Pending cashback - Online orders</h2>
        </header>
        {pendingNonCodOrders.length > 0 ? (
          pendingNonCodOrders.map((order) => (
            <article key={order.id} className="settings-list-row">
              <div>
                <h3>{order.id}</h3>
                <p>
                  <span className={getPaymentBadgeClass(order)}>Online</span> •{" "}
                  {order.fulfillmentStatus}
                </p>
                <p>{getCashbackStatusHelpText(order)}</p>
              </div>
              <strong>{formatInr(order.cashbackPendingInr)}</strong>
            </article>
          ))
        ) : (
          <p className="wallet-empty-note">No online cashback pending right now.</p>
        )}
      </section>

      <section className="card settings-list cashback-list-section">
        <header className="section-header">
          <h2>On Hold cashback</h2>
        </header>
        {onHoldOrders.length > 0 ? (
          onHoldOrders.map((order) => (
            <article key={order.id} className="settings-list-row">
              <div>
                <h3>{order.id}</h3>
                <p>Status: {order.fulfillmentStatus}</p>
                <p>Cashback is on hold until return request resolution.</p>
              </div>
              <strong>{formatInr(order.cashbackPendingInr)}</strong>
            </article>
          ))
        ) : (
          <p className="wallet-empty-note">No cashback entries on hold.</p>
        )}
      </section>

      <section className="card settings-list cashback-list-section">
        <header className="section-header">
          <h2>Confirmed cashback (eligible completed orders)</h2>
        </header>
        {confirmedOrders.length > 0 ? (
          confirmedOrders.map((order) => (
            <article key={order.id} className="settings-list-row">
              <div>
                <h3>{order.id}</h3>
                <p>Status: {order.fulfillmentStatus}</p>
                <p>Cashback will be credited after return window.</p>
              </div>
              <strong className="settings-credit">
                +{formatInr(order.cashbackPendingInr)}
              </strong>
            </article>
          ))
        ) : (
          <p className="wallet-empty-note">
            Confirmed cashback entries will appear after delivery and return window completion.
          </p>
        )}
      </section>
    </div>
  );
}

export function SupportSettingsPage() {
  const [searchParams] = useSearchParams();
  const { getOrderById } = useCommerce();
  const requestedOrderId = searchParams.get("orderId");
  const orderContext = requestedOrderId ? getOrderById(requestedOrderId) : undefined;

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Support"
        description="Get help with orders, cashback, and account actions."
      />

      {requestedOrderId ? (
        <section className="card">
          <header className="section-header">
            <h2>Support context</h2>
          </header>
          {orderContext ? (
            <div className="stack-sm">
              <p>
                We have linked your query to <strong>{orderContext.id}</strong>.
              </p>
              <p>
                Status:{" "}
                <span className={getStatusClass(orderContext.fulfillmentStatus)}>
                  {orderContext.fulfillmentStatus}
                </span>
              </p>
              <p>
                Payment: {orderContext.paymentMethodTitle} •{" "}
                {orderContext.paymentPending ? "Pending" : "Completed"}
              </p>
              <p>
                Cashback:{" "}
                <span className={getCashbackStatusClass(orderContext)}>
                  {orderContext.cashbackStatus}
                </span>
              </p>
              <p>{getCashbackStatusHelpText(orderContext)}</p>
              <div className="inline-actions">
                <Link to={ROUTES.settingsOrders} className="btn btn-secondary">
                  Back to Orders
                </Link>
              </div>
            </div>
          ) : (
            <p>We could not find that order ID in your account history.</p>
          )}
        </section>
      ) : null}

      <section className="card">
        <header className="section-header">
          <h2>Frequently asked questions</h2>
        </header>
        <div className="chip-row">
          {faqItems.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="card settings-list">
        <article className="settings-list-row">
          <div>
            <h3>Ticket #SP-4821</h3>
            <p>Issue: Cashback pending for delivered order.</p>
          </div>
          <strong>In progress</strong>
        </article>
        <article className="settings-list-row">
          <div>
            <h3>Priority support hours</h3>
            <p>Daily 8 AM to 11 PM IST</p>
          </div>
          <strong>Available</strong>
        </article>
      </section>
    </div>
  );
}

export function ProfileSettingsPage() {
  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Profile"
        description="Manage profile details and shopping preferences."
      />

      <section className="card settings-profile-grid">
        <article>
          <h3>Personal details</h3>
          <p>Name: Rohit Sharma</p>
          <p>Email: rohit.sharma@example.com</p>
          <p>Phone: +91 98765 43210</p>
        </article>
        <article>
          <h3>Preferences</h3>
          <p>Language: English</p>
          <p>Currency: INR (₹)</p>
          <p>Preferred category: Electronics</p>
        </article>
      </section>
    </div>
  );
}

export function AddressesSettingsPage() {
  const { addresses, selectedAddressId } = useCommerce();

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Addresses"
        description="Manage your saved delivery addresses."
      />
      <section className="card settings-list">
        {addresses.map((address) => (
          <article key={address.id} className="settings-list-row">
            <div>
              <h3>{address.label}</h3>
              <p>
                {address.fullName} · {address.phoneNumber}
              </p>
              <p>
                {address.line1}, {address.line2}, {address.cityStatePincode}
              </p>
            </div>
            <strong>{selectedAddressId === address.id ? "Selected" : "Saved"}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}

export function NotificationsSettingsPage() {
  const { notificationPreferences, setNotificationPreference } = useCommerce();

  return (
    <div className="stack settings-page">
      <PageIntro
        badge="Settings"
        title="Notifications"
        description="Control order and offer communication settings."
      />
      <section className="card settings-list">
        <article className="settings-list-row settings-toggle-row">
          <div>
            <h3>Order updates</h3>
            <p>Get SMS and in-app updates for order status changes.</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={notificationPreferences.orderUpdates}
              onChange={(event) =>
                setNotificationPreference("orderUpdates", event.target.checked)
              }
            />
            <span>{notificationPreferences.orderUpdates ? "Enabled" : "Disabled"}</span>
          </label>
        </article>

        <article className="settings-list-row settings-toggle-row">
          <div>
            <h3>Offers & cashback alerts</h3>
            <p>Receive alerts for new deals and cashback status updates.</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={notificationPreferences.offersCashbackAlerts}
              onChange={(event) =>
                setNotificationPreference(
                  "offersCashbackAlerts",
                  event.target.checked,
                )
              }
            />
            <span>
              {notificationPreferences.offersCashbackAlerts ? "Enabled" : "Disabled"}
            </span>
          </label>
        </article>
      </section>
    </div>
  );
}
