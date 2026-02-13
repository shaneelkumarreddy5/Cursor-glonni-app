import {
  createContext,
  useContext,
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
  status: "Placed" | "Packed" | "Delivered";
  cashbackStatus: "Pending";
  items: CartItem[];
  itemTotalInr: number;
  deliveryFeeInr: number;
  payableAmountInr: number;
  cashbackPendingInr: number;
  addressId: string;
  addressSnapshot: MockAddress;
  paymentMethodId: PaymentMethodId;
  paymentMethodTitle: string;
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
  addToCart: (payload: AddToCartPayload) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeCartItem: (itemId: string) => void;
  setSelectedAddressId: (addressId: string) => void;
  setSelectedPaymentMethodId: (methodId: PaymentMethodId) => void;
  placeOrder: (options: PlaceOrderOptions) => OrderRecord | null;
  getOrderById: (orderId: string) => OrderRecord | undefined;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

const CART_ITEM_SEED_PRODUCTS = {
  flagship: catalogProducts[0],
  laptop: catalogProducts[4],
  accessory: catalogProducts[8],
};

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

function createSeedOrders(): OrderRecord[] {
  const flagshipItem: CartItem = {
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

  const laptopItem: CartItem = {
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

  const accessoryItem: CartItem = {
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

  const firstOrderItemTotal = flagshipItem.unitPriceInr + laptopItem.unitPriceInr;
  const firstOrderCashback = flagshipItem.unitCashbackInr + laptopItem.unitCashbackInr;
  const secondOrderItemTotal = accessoryItem.unitPriceInr;
  const secondOrderCashback = accessoryItem.unitCashbackInr;

  return [
    {
      id: "GLN2602129481",
      placedAtIso: "2026-02-12T09:45:00.000Z",
      status: "Packed",
      cashbackStatus: "Pending",
      items: [flagshipItem, laptopItem],
      itemTotalInr: firstOrderItemTotal,
      deliveryFeeInr: 0,
      payableAmountInr: firstOrderItemTotal,
      cashbackPendingInr: firstOrderCashback,
      addressId: mockAddresses[0].id,
      addressSnapshot: mockAddresses[0],
      paymentMethodId: "upi",
      paymentMethodTitle: "UPI",
    },
    {
      id: "GLN2602106403",
      placedAtIso: "2026-02-10T15:20:00.000Z",
      status: "Delivered",
      cashbackStatus: "Pending",
      items: [accessoryItem],
      itemTotalInr: secondOrderItemTotal,
      deliveryFeeInr: 0,
      payableAmountInr: secondOrderItemTotal,
      cashbackPendingInr: secondOrderCashback,
      addressId: mockAddresses[1].id,
      addressSnapshot: mockAddresses[1],
      paymentMethodId: "card",
      paymentMethodTitle: "Credit / Debit Card",
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
          order.cashbackStatus === "Pending"
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
      status: "Placed",
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
    };

    setOrders((existingOrders) => [order, ...existingOrders]);
    setLastPlacedOrderId(order.id);
    setCartItems([]);
    return order;
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
      addToCart,
      updateCartItemQuantity,
      removeCartItem,
      setSelectedAddressId,
      setSelectedPaymentMethodId,
      placeOrder,
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
