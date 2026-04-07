import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CART_STORAGE_KEY = "funoun_cart_items";

export interface CartItem {
  product_id: string;
  store_id?: string | null;
  store_name?: string | null;
  name: string;
  price: number;
  base_price?: number;
  discount_percentage?: number | null;
  image: string;
  quantity: number;
  custom_text?: string;
}

interface AddToCartPayload {
  product_id: string;
  store_id?: string | null;
  store_name?: string | null;
  name: string;
  price: number;
  base_price?: number;
  discount_percentage?: number | null;
  image: string;
  quantity?: number;
  custom_text?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  cartTotal: number;
  addToCart: (item: AddToCartPayload) => void;
  removeFromCart: (productId: string, customText?: string, storeId?: string | null) => void;
  updateQuantity: (
    productId: string,
    customText: string | undefined,
    quantity: number,
    storeId?: string | null,
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeCustomText(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed;
}

function itemKey(productId: string, customText?: string, storeId?: string | null) {
  return `${storeId ?? ""}::${productId}::${normalizeCustomText(customText)}`;
}

function readInitialCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item): item is CartItem =>
          typeof item?.product_id === "string" &&
          typeof item?.name === "string" &&
          typeof item?.price === "number" &&
          typeof item?.image === "string" &&
          typeof item?.quantity === "number",
      )
      .map((item) => ({
        ...item,
        store_id: item.store_id ?? null,
        store_name: item.store_name ?? null,
        base_price: typeof item.base_price === "number" ? item.base_price : undefined,
        discount_percentage:
          typeof item.discount_percentage === "number"
            ? item.discount_percentage
            : null,
        quantity: Math.max(1, Math.floor(item.quantity)),
        custom_text: normalizeCustomText(item.custom_text) || undefined,
      }));
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(readInitialCart);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: AddToCartPayload) => {
    const quantityToAdd = Math.max(1, Math.floor(item.quantity ?? 1));
    const normalizedCustomText = normalizeCustomText(item.custom_text);

    setCartItems((prev) => {
      const key = itemKey(item.product_id, normalizedCustomText, item.store_id);
      const existingIndex = prev.findIndex(
        (existingItem) =>
          itemKey(
            existingItem.product_id,
            existingItem.custom_text,
            existingItem.store_id,
          ) === key,
      );

      if (existingIndex === -1) {
        return [
          ...prev,
          {
            product_id: item.product_id,
            store_id: item.store_id ?? null,
            store_name: item.store_name ?? null,
            name: item.name,
            price: item.price,
            base_price: item.base_price,
            discount_percentage: item.discount_percentage ?? null,
            image: item.image,
            quantity: quantityToAdd,
            custom_text: normalizedCustomText || undefined,
          },
        ];
      }

      return prev.map((existingItem, index) =>
        index === existingIndex
          ? { ...existingItem, quantity: existingItem.quantity + quantityToAdd }
          : existingItem,
      );
    });
  };

  const removeFromCart = (
    productId: string,
    customText?: string,
    storeId?: string | null,
  ) => {
    const key = itemKey(productId, customText, storeId);
    setCartItems((prev) =>
      prev.filter(
        (item) => itemKey(item.product_id, item.custom_text, item.store_id) !== key,
      ),
    );
  };

  const updateQuantity = (
    productId: string,
    customText: string | undefined,
    quantity: number,
    storeId?: string | null,
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, customText, storeId);
      return;
    }

    const key = itemKey(productId, customText, storeId);
    setCartItems((prev) =>
      prev.map((item) =>
        itemKey(item.product_id, item.custom_text, item.store_id) === key
          ? { ...item, quantity: Math.max(1, Math.floor(quantity)) }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}


