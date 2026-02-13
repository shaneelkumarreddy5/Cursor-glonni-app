import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  mockAddresses,
  paymentMethodOptions,
  type MockAddress,
  type PaymentMethodId,
  type ProductVendorExtraOffer,
  type ProductVendorOption,
} from "../data/mockCommerce";
import { catalogProducts, type CatalogProduct } from "../data/mockCatalog";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const COD_ORDER_LIMIT_INR = 5000;
const USER_COD_ELIGIBILITY_FLAG = true;

export type OrderFulfillmentStatus =
  | "Ordered"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Return Requested";

export type OrderCashbackStatus =
  | "Pending"
  | "On Hold"
  | "Confirmed"
  | "Cancelled";

export type RefundStatus = "Not Applicable" | "Refund Initiated";

export type ReturnPickupStatus = "Not Scheduled" | "Pickup Pending" | "Picked Up";

export type OrderActionResult = {
  ok: boolean;
  message: string;
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  keySpecs: string[];
  category: CatalogProduct["category"];
  brand: string;
  vendorId: string;
  vendorName: string;
  vendorOfferSummary: string;
  selectedExtraOfferId: string | null;
  selectedExtraOfferTitle: string | null;
  unitPriceInr: number;
  unitMrpInr: number;
  unitCashbackInr: number;
  quantity: number;
};

export type OrderRecord = {
  id: string;
  placedAtIso: string;
  fulfillmentStatus: OrderFulfillmentStatus;
  cashbackStatus: OrderCashbackStatus;
  items: CartItem[];
  itemTotalInr: number;
  deliveryFeeInr: number;
  payableAmountInr: number;
  cashbackPendingInr: number;
  addressId: string;
  addressSnapshot: MockAddress;
  paymentMethodId: PaymentMethodId;
  paymentMethodTitle: string;
  paymentPending: boolean;
  paymentCompletedAtIso: string | null;
  returnWindowDays: number;
  deliveredAtIso: string | null;
  returnWindowClosed: boolean;
  returnPolicySummary: string;
  refundTimelineSummary: string;
  nonReturnableConditions: string[];
  refundStatus: RefundStatus;
  refundMethod: "Original payment method" | "Glonni Wallet" | null;
  cancellationReason: string | null;
  cancellationNotes: string | null;
  cancelledAtIso: string | null;
  returnReason: string | null;
  returnNotes: string | null;
  returnRequestedAtIso: string | null;
  pickupStatus: ReturnPickupStatus;
};

type AddToCartPayload = {
  product: CatalogProduct;
  vendor: ProductVendorOption;
  selectedExtraOffer: ProductVendorExtraOffer | null;
  unitPriceInr: number;
  unitCashbackInr: number;
};

type PlaceOrderOptions = {
  deliveryFeeInr: number;
};

type CommerceContextValue = {
  cartItems: CartItem[];
  orders: OrderRecord[];
  addresses: typeof mockAddresses;
  paymentMethods: typeof paymentMethodOptions;
  selectedAddressId: string;
  selectedPaymentMethodId: PaymentMethodId;
  lastPlacedOrderId: string | null;
  cartItemsCount: number;
  cartSubtotalInr: number;
  cartCashbackTotalInr: number;
  pendingCashbackTotalInr: number;
  onHoldCashbackTotalInr: number;
  confirmedCashbackTotalInr: number;
  userCodEligibilityFlag: boolean;
  codOrderLimitInr: number;
  addToCart: (payload: AddToCartPayload) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeCartItem: (itemId: string) => void;
  setSelectedAddressId: (addressId: string) => void;
  setSelectedPaymentMethodId: (methodId: PaymentMethodId) => void;
  placeOrder: (options: PlaceOrderOptions) => OrderRecord | null;
  markOrderShipped: (orderId: string) => OrderActionResult;
  markOrderDelivered: (orderId: string) => OrderActionResult;
  cancelOrder: (
    orderId: string,
    reason: string,
    notes?: string,
  ) => OrderActionResult;
  requestReturn: (
    orderId: string,
    reason: string,
    notes?: string,
  ) => OrderActionResult;
  confirmNoReturn: (orderId: string) => OrderActionResult;
  getOrderById: (orderId: string) => OrderRecord | undefined;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

const CART_ITEM_SEED_PRODUCTS = {
  flagship: catalogProducts[0],
  laptop: catalogProducts[4],
  accessory: catalogProducts[8],
};

const DEFAULT_RETURN_WINDOW_DAYS = 7;
const DEFAULT_RETURN_POLICY_SUMMARY =
  "7-day return or replacement for eligible items after delivery.";
const DEFAULT_REFUND_TIMELINE_SUMMARY =
  "Refund initiated within 24 hours after request approval. Final settlement in 5-7 business days.";
const DEFAULT_NON_RETURNABLE_CONDITIONS = [
  "Physical damage due to misuse.",
  "Missing original accessories or packaging.",
  "Serial number / IMEI mismatch.",
];

function createCartItemId(
  productId: string,
  vendorId: string,
  selectedExtraOfferId: string | null,
): string {
  return `${productId}:${vendorId}:${selectedExtraOfferId ?? "no-extra"}`;
}

function createOrderId(date = new Date()): string {
  const compactDate = date
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "");
  const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
  return `GLN${compactDate}${randomSuffix}`;
}

function resolveRefundMethod(
  paymentMethodId: PaymentMethodId,
): "Original payment method" | "Glonni Wallet" {
  return paymentMethodId === "cod" ? "Glonni Wallet" : "Original payment method";
}

function getReturnDeadlineMs(order: OrderRecord): number | null {
  if (!order.deliveredAtIso) {
    return null;
  }

  const deliveredAtMs = new Date(order.deliveredAtIso).getTime();
  return deliveredAtMs + order.returnWindowDays * DAY_IN_MS;
}

function isReturnWindowOpen(order: OrderRecord, now = new Date()): boolean {
  if (
    order.fulfillmentStatus !== "Delivered" ||
    order.returnWindowClosed ||
    !order.deliveredAtIso
  ) {
    return false;
  }

  const deadlineMs = getReturnDeadlineMs(order);
  if (!deadlineMs) {
    return false;
  }

  return now.getTime() <= deadlineMs;
}

function hasReturnWindowExpired(order: OrderRecord, now = new Date()): boolean {
  if (
    order.fulfillmentStatus !== "Delivered" ||
    order.returnWindowClosed ||
    !order.deliveredAtIso
  ) {
    return false;
  }

  const deadlineMs = getReturnDeadlineMs(order);
  if (!deadlineMs) {
    return false;
  }

  return now.getTime() > deadlineMs;
}

function applyOrderPolicyTransitions(order: OrderRecord, now = new Date()): OrderRecord {
  let nextOrder = order;

  if (
    nextOrder.fulfillmentStatus === "Delivered" &&
    nextOrder.paymentMethodId === "cod" &&
    nextOrder.paymentPending
  ) {
    nextOrder = {
      ...nextOrder,
      paymentPending: false,
      paymentCompletedAtIso: now.toISOString(),
    };
  }

  const shouldAutoClose = hasReturnWindowExpired(nextOrder, now);
  if (shouldAutoClose) {
    nextOrder = {
      ...nextOrder,
      returnWindowClosed: true,
      cashbackStatus:
        nextOrder.cashbackStatus === "Pending"
          ? "Confirmed"
          : nextOrder.cashbackStatus,
    };
  } else if (
    nextOrder.fulfillmentStatus === "Delivered" &&
    nextOrder.returnWindowClosed &&
    nextOrder.cashbackStatus === "Pending"
  ) {
    nextOrder = {
      ...nextOrder,
      cashbackStatus: "Confirmed",
    };
  }

  return nextOrder;
}

function createSeedOrders(): OrderRecord[] {
  const now = new Date();
  const orderedAtIso = new Date(now.getTime() - 2 * DAY_IN_MS).toISOString();
  const shippedAtIso = new Date(now.getTime() - DAY_IN_MS).toISOString();
  const deliveredAtIso = new Date(now.getTime() - 3 * DAY_IN_MS).toISOString();

  const orderedItem: CartItem = {
    id: createCartItemId(
      CART_ITEM_SEED_PRODUCTS.flagship.id,
      "seed-verified",
      "seed-prepaid",
    ),
    productId: CART_ITEM_SEED_PRODUCTS.flagship.id,
    productName: CART_ITEM_SEED_PRODUCTS.flagship.name,
    productImageUrl: CART_ITEM_SEED_PRODUCTS.flagship.imageUrl,
    keySpecs: CART_ITEM_SEED_PRODUCTS.flagship.keySpecs,
    category: CART_ITEM_SEED_PRODUCTS.flagship.category,
    brand: CART_ITEM_SEED_PRODUCTS.flagship.brand,
    vendorId: "seed-verified",
    vendorName: "Glonni Verified Seller",
    vendorOfferSummary: "Priority dispatch and verified invoice support.",
    selectedExtraOfferId: "seed-prepaid",
    selectedExtraOfferTitle: "Prepaid Advantage",
    unitPriceInr: CART_ITEM_SEED_PRODUCTS.flagship.priceInr - 350,
    unitMrpInr: CART_ITEM_SEED_PRODUCTS.flagship.mrpInr,
    unitCashbackInr: CART_ITEM_SEED_PRODUCTS.flagship.cashbackInr + 200,
    quantity: 1,
  };

  const shippedItem: CartItem = {
    id: createCartItemId(
      CART_ITEM_SEED_PRODUCTS.laptop.id,
      "seed-nova",
      null,
    ),
    productId: CART_ITEM_SEED_PRODUCTS.laptop.id,
    productName: CART_ITEM_SEED_PRODUCTS.laptop.name,
    productImageUrl: CART_ITEM_SEED_PRODUCTS.laptop.imageUrl,
    keySpecs: CART_ITEM_SEED_PRODUCTS.laptop.keySpecs,
    category: CART_ITEM_SEED_PRODUCTS.laptop.category,
    brand: CART_ITEM_SEED_PRODUCTS.laptop.brand,
    vendorId: "seed-nova",
    vendorName: "Nova Retail Hub",
    vendorOfferSummary: "Festive coupon support on select categories.",
    selectedExtraOfferId: null,
    selectedExtraOfferTitle: null,
    unitPriceInr: CART_ITEM_SEED_PRODUCTS.laptop.priceInr + 420,
    unitMrpInr: CART_ITEM_SEED_PRODUCTS.laptop.mrpInr,
    unitCashbackInr: CART_ITEM_SEED_PRODUCTS.laptop.cashbackInr,
    quantity: 1,
  };

  const deliveredItem: CartItem = {
    id: createCartItemId(
      CART_ITEM_SEED_PRODUCTS.accessory.id,
      "seed-city",
      null,
    ),
    productId: CART_ITEM_SEED_PRODUCTS.accessory.id,
    productName: CART_ITEM_SEED_PRODUCTS.accessory.name,
    productImageUrl: CART_ITEM_SEED_PRODUCTS.accessory.imageUrl,
    keySpecs: CART_ITEM_SEED_PRODUCTS.accessory.keySpecs,
    category: CART_ITEM_SEED_PRODUCTS.accessory.category,
    brand: CART_ITEM_SEED_PRODUCTS.accessory.brand,
    vendorId: "seed-city",
    vendorName: "City Electronics Store",
    vendorOfferSummary: "Store setup assistance included with purchase.",
    selectedExtraOfferId: null,
    selectedExtraOfferTitle: null,
    unitPriceInr: CART_ITEM_SEED_PRODUCTS.accessory.priceInr + 760,
    unitMrpInr: CART_ITEM_SEED_PRODUCTS.accessory.mrpInr,
    unitCashbackInr: CART_ITEM_SEED_PRODUCTS.accessory.cashbackInr + 140,
    quantity: 1,
  };

  const orderedPayable = orderedItem.unitPriceInr * orderedItem.quantity;
  const shippedPayable = shippedItem.unitPriceInr * shippedItem.quantity;
  const deliveredPayable = deliveredItem.unitPriceInr * deliveredItem.quantity;

  return [
    {
      id: "GLN2602129481",
      placedAtIso: orderedAtIso,
      fulfillmentStatus: "Ordered",
      cashbackStatus: "Pending",
      items: [orderedItem],
      itemTotalInr: orderedPayable,
      deliveryFeeInr: 0,
      payableAmountInr: orderedPayable,
      cashbackPendingInr: orderedItem.unitCashbackInr,
      addressId: mockAddresses[0].id,
      addressSnapshot: mockAddresses[0],
      paymentMethodId: "upi",
      paymentMethodTitle: "UPI",
      paymentPending: false,
      paymentCompletedAtIso: orderedAtIso,
      returnWindowDays: DEFAULT_RETURN_WINDOW_DAYS,
      deliveredAtIso: null,
      returnWindowClosed: false,
      returnPolicySummary: DEFAULT_RETURN_POLICY_SUMMARY,
      refundTimelineSummary: DEFAULT_REFUND_TIMELINE_SUMMARY,
      nonReturnableConditions: DEFAULT_NON_RETURNABLE_CONDITIONS,
      refundStatus: "Not Applicable",
      refundMethod: null,
      cancellationReason: null,
      cancellationNotes: null,
      cancelledAtIso: null,
      returnReason: null,
      returnNotes: null,
      returnRequestedAtIso: null,
      pickupStatus: "Not Scheduled",
    },
    {
      id: "GLN2602116403",
      placedAtIso: shippedAtIso,
      fulfillmentStatus: "Shipped",
      cashbackStatus: "Pending",
      items: [shippedItem],
      itemTotalInr: shippedPayable,
      deliveryFeeInr: 0,
      payableAmountInr: shippedPayable,
      cashbackPendingInr: shippedItem.unitCashbackInr,
      addressId: mockAddresses[1].id,
      addressSnapshot: mockAddresses[1],
      paymentMethodId: "card",
      paymentMethodTitle: "Credit / Debit Card",
      paymentPending: false,
      paymentCompletedAtIso: shippedAtIso,
      returnWindowDays: DEFAULT_RETURN_WINDOW_DAYS,
      deliveredAtIso: null,
      returnWindowClosed: false,
      returnPolicySummary: DEFAULT_RETURN_POLICY_SUMMARY,
      refundTimelineSummary: DEFAULT_REFUND_TIMELINE_SUMMARY,
      nonReturnableConditions: DEFAULT_NON_RETURNABLE_CONDITIONS,
      refundStatus: "Not Applicable",
      refundMethod: null,
      cancellationReason: null,
      cancellationNotes: null,
      cancelledAtIso: null,
      returnReason: null,
      returnNotes: null,
      returnRequestedAtIso: null,
      pickupStatus: "Not Scheduled",
    },
    {
      id: "GLN2602102217",
      placedAtIso: deliveredAtIso,
      fulfillmentStatus: "Delivered",
      cashbackStatus: "Pending",
      items: [deliveredItem],
      itemTotalInr: deliveredPayable,
      deliveryFeeInr: 0,
      payableAmountInr: deliveredPayable,
      cashbackPendingInr: deliveredItem.unitCashbackInr,
      addressId: mockAddresses[1].id,
      addressSnapshot: mockAddresses[1],
      paymentMethodId: "cod",
      paymentMethodTitle: "Cash on Delivery",
      paymentPending: false,
      paymentCompletedAtIso: deliveredAtIso,
      returnWindowDays: DEFAULT_RETURN_WINDOW_DAYS,
      deliveredAtIso,
      returnWindowClosed: false,
      returnPolicySummary: DEFAULT_RETURN_POLICY_SUMMARY,
      refundTimelineSummary: DEFAULT_REFUND_TIMELINE_SUMMARY,
      nonReturnableConditions: DEFAULT_NON_RETURNABLE_CONDITIONS,
      refundStatus: "Not Applicable",
      refundMethod: null,
      cancellationReason: null,
      cancellationNotes: null,
      cancelledAtIso: null,
      returnReason: null,
      returnNotes: null,
      returnRequestedAtIso: null,
      pickupStatus: "Not Scheduled",
    },
  ];
}

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>(createSeedOrders);
  const [selectedAddressId, setSelectedAddressId] = useState(mockAddresses[0].id);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<PaymentMethodId>("upi");
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const refreshOrders = () => {
      setOrders((currentOrders) => {
        let hasChanges = false;
        const nextOrders = currentOrders.map((order) => {
          const updated = applyOrderPolicyTransitions(order);
          if (updated !== order) {
            hasChanges = true;
          }
          return updated;
        });
        return hasChanges ? nextOrders : currentOrders;
      });
    };

    refreshOrders();
    const intervalHandle = window.setInterval(refreshOrders, 30_000);
    return () => window.clearInterval(intervalHandle);
  }, []);

  const cartItemsCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );
  const cartSubtotalInr = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unitPriceInr * item.quantity, 0),
    [cartItems],
  );
  const cartCashbackTotalInr = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.unitCashbackInr * item.quantity,
        0,
      ),
    [cartItems],
  );
  const pendingCashbackTotalInr = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          order.cashbackStatus === "Pending" ? sum + order.cashbackPendingInr : sum,
        0,
      ),
    [orders],
  );
  const onHoldCashbackTotalInr = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          order.cashbackStatus === "On Hold" ? sum + order.cashbackPendingInr : sum,
        0,
      ),
    [orders],
  );
  const confirmedCashbackTotalInr = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          order.cashbackStatus === "Confirmed"
            ? sum + order.cashbackPendingInr
            : sum,
        0,
      ),
    [orders],
  );

  function addToCart({
    product,
    vendor,
    selectedExtraOffer,
    unitPriceInr,
    unitCashbackInr,
  }: AddToCartPayload) {
    const configurationId = createCartItemId(
      product.id,
      vendor.id,
      selectedExtraOffer?.id ?? null,
    );

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === configurationId);
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === configurationId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      const nextItem: CartItem = {
        id: configurationId,
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        keySpecs: product.keySpecs,
        category: product.category,
        brand: product.brand,
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorOfferSummary: vendor.vendorOffer,
        selectedExtraOfferId: selectedExtraOffer?.id ?? null,
        selectedExtraOfferTitle: selectedExtraOffer?.title ?? null,
        unitPriceInr,
        unitMrpInr: product.mrpInr,
        unitCashbackInr,
        quantity: 1,
      };

      return [...currentItems, nextItem];
    });
  }

  function updateCartItemQuantity(itemId: string, quantity: number) {
    setCartItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.id !== itemId);
      }

      return currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      );
    });
  }

  function removeCartItem(itemId: string) {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
  }

  function placeOrder({ deliveryFeeInr }: PlaceOrderOptions): OrderRecord | null {
    if (cartItems.length === 0) {
      return null;
    }

    const now = new Date();
    const generatedOrderId = createOrderId(now);
    const selectedAddress =
      mockAddresses.find((address) => address.id === selectedAddressId) ??
      mockAddresses[0];
    const selectedPaymentMethod =
      paymentMethodOptions.find((method) => method.id === selectedPaymentMethodId) ??
      paymentMethodOptions[0];

    const itemTotalInr = cartItems.reduce(
      (sum, item) => sum + item.unitPriceInr * item.quantity,
      0,
    );
    const cashbackPendingInr = cartItems.reduce(
      (sum, item) => sum + item.unitCashbackInr * item.quantity,
      0,
    );

    const order: OrderRecord = {
      id: generatedOrderId,
      placedAtIso: now.toISOString(),
      fulfillmentStatus: "Ordered",
      cashbackStatus: "Pending",
      items: cartItems,
      itemTotalInr,
      deliveryFeeInr,
      payableAmountInr: itemTotalInr + deliveryFeeInr,
      cashbackPendingInr,
      addressId: selectedAddress.id,
      addressSnapshot: selectedAddress,
      paymentMethodId: selectedPaymentMethod.id,
      paymentMethodTitle: selectedPaymentMethod.title,
      paymentPending: selectedPaymentMethod.id === "cod",
      paymentCompletedAtIso:
        selectedPaymentMethod.id === "cod" ? null : now.toISOString(),
      returnWindowDays: DEFAULT_RETURN_WINDOW_DAYS,
      deliveredAtIso: null,
      returnWindowClosed: false,
      returnPolicySummary: DEFAULT_RETURN_POLICY_SUMMARY,
      refundTimelineSummary: DEFAULT_REFUND_TIMELINE_SUMMARY,
      nonReturnableConditions: DEFAULT_NON_RETURNABLE_CONDITIONS,
      refundStatus: "Not Applicable",
      refundMethod: null,
      cancellationReason: null,
      cancellationNotes: null,
      cancelledAtIso: null,
      returnReason: null,
      returnNotes: null,
      returnRequestedAtIso: null,
      pickupStatus: "Not Scheduled",
    };

    setOrders((existingOrders) => [order, ...existingOrders]);
    setLastPlacedOrderId(order.id);
    setCartItems([]);
    return order;
  }

  function markOrderShipped(orderId: string): OrderActionResult {
    const targetOrder = orders.find((order) => order.id === orderId);

    if (!targetOrder) {
      return { ok: false, message: "Order not found." };
    }

    if (targetOrder.fulfillmentStatus !== "Ordered") {
      return {
        ok: false,
        message: "Only ordered items can be marked as shipped.",
      };
    }

    const updatedOrder: OrderRecord = {
      ...targetOrder,
      fulfillmentStatus: "Shipped",
    };

    setOrders((existingOrders) =>
      existingOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    return { ok: true, message: "Order moved to shipped status." };
  }

  function markOrderDelivered(orderId: string): OrderActionResult {
    const targetOrder = orders.find((order) => order.id === orderId);

    if (!targetOrder) {
      return { ok: false, message: "Order not found." };
    }

    if (targetOrder.fulfillmentStatus !== "Shipped") {
      return {
        ok: false,
        message: "Only shipped items can be marked as delivered.",
      };
    }

    const now = new Date();
    const updatedOrder = applyOrderPolicyTransitions(
      {
        ...targetOrder,
        fulfillmentStatus: "Delivered",
        deliveredAtIso: now.toISOString(),
        returnWindowClosed: false,
      },
      now,
    );

    setOrders((existingOrders) =>
      existingOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    return {
      ok: true,
      message:
        updatedOrder.paymentMethodId === "cod"
          ? "Order delivered. COD payment marked as completed."
          : "Order delivered successfully.",
    };
  }

  function cancelOrder(
    orderId: string,
    reason: string,
    notes?: string,
  ): OrderActionResult {
    const targetOrder = orders.find((order) => order.id === orderId);

    if (!targetOrder) {
      return { ok: false, message: "Order not found." };
    }

    if (targetOrder.fulfillmentStatus !== "Ordered") {
      return {
        ok: false,
        message: "Cancellation is only available before shipping.",
      };
    }

    const nowIso = new Date().toISOString();
    const updatedOrder: OrderRecord = {
      ...targetOrder,
      fulfillmentStatus: "Cancelled",
      cashbackStatus: "Cancelled",
      returnWindowClosed: true,
      refundStatus: "Refund Initiated",
      refundMethod: resolveRefundMethod(targetOrder.paymentMethodId),
      cancellationReason: reason,
      cancellationNotes: notes?.trim() ? notes.trim() : null,
      cancelledAtIso: nowIso,
      pickupStatus: "Not Scheduled",
    };

    setOrders((existingOrders) =>
      existingOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    return {
      ok: true,
      message: "Order cancelled successfully. No charges applied.",
    };
  }

  function requestReturn(
    orderId: string,
    reason: string,
    notes?: string,
  ): OrderActionResult {
    const targetOrder = orders.find((order) => order.id === orderId);

    if (!targetOrder) {
      return { ok: false, message: "Order not found." };
    }

    if (!isReturnWindowOpen(targetOrder)) {
      return {
        ok: false,
        message: "Return request is not available for this order.",
      };
    }

    const nowIso = new Date().toISOString();
    const updatedOrder: OrderRecord = {
      ...targetOrder,
      fulfillmentStatus: "Return Requested",
      cashbackStatus:
        targetOrder.cashbackStatus === "Cancelled" ? "Cancelled" : "On Hold",
      returnWindowClosed: true,
      refundStatus: "Refund Initiated",
      refundMethod: resolveRefundMethod(targetOrder.paymentMethodId),
      returnReason: reason,
      returnNotes: notes?.trim() ? notes.trim() : null,
      returnRequestedAtIso: nowIso,
      pickupStatus: "Pickup Pending",
    };

    setOrders((existingOrders) =>
      existingOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    return {
      ok: true,
      message:
        "Return request submitted. Pickup pending and refund initiated (mock). Cashback moved to on hold.",
    };
  }

  function confirmNoReturn(orderId: string): OrderActionResult {
    const targetOrder = orders.find((order) => order.id === orderId);

    if (!targetOrder) {
      return { ok: false, message: "Order not found." };
    }

    if (!isReturnWindowOpen(targetOrder)) {
      return {
        ok: false,
        message: "No Return confirmation is no longer available.",
      };
    }

    const updatedOrder: OrderRecord = {
      ...targetOrder,
      returnWindowClosed: true,
      cashbackStatus:
        targetOrder.cashbackStatus === "Cancelled"
          ? "Cancelled"
          : "Confirmed",
    };

    setOrders((existingOrders) =>
      existingOrders.map((order) => (order.id === orderId ? updatedOrder : order)),
    );

    return {
      ok: true,
      message:
        "Return window closed. Cashback will be released as per policy.",
    };
  }

  function getOrderById(orderId: string) {
    return orders.find((order) => order.id === orderId);
  }

  const value = useMemo<CommerceContextValue>(
    () => ({
      cartItems,
      orders,
      addresses: mockAddresses,
      paymentMethods: paymentMethodOptions,
      selectedAddressId,
      selectedPaymentMethodId,
      lastPlacedOrderId,
      cartItemsCount,
      cartSubtotalInr,
      cartCashbackTotalInr,
      pendingCashbackTotalInr,
      onHoldCashbackTotalInr,
      confirmedCashbackTotalInr,
      userCodEligibilityFlag: USER_COD_ELIGIBILITY_FLAG,
      codOrderLimitInr: COD_ORDER_LIMIT_INR,
      addToCart,
      updateCartItemQuantity,
      removeCartItem,
      setSelectedAddressId,
      setSelectedPaymentMethodId,
      placeOrder,
      markOrderShipped,
      markOrderDelivered,
      cancelOrder,
      requestReturn,
      confirmNoReturn,
      getOrderById,
    }),
    [
      cartItems,
      orders,
      selectedAddressId,
      selectedPaymentMethodId,
      lastPlacedOrderId,
      cartItemsCount,
      cartSubtotalInr,
      cartCashbackTotalInr,
      pendingCashbackTotalInr,
      onHoldCashbackTotalInr,
      confirmedCashbackTotalInr,
    ],
  );

  return (
    <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error("useCommerce must be used within CommerceProvider.");
  }
  return context;
}
