"use client";

import * as React from "react";
import { toast } from "sonner";
import type { CartDTO, CartLine, ProductCardDTO } from "@/types";
import { computeTotals, evaluateCoupon, type CartTotals } from "@/utils/pricing";
import { apiPut, apiPost } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";

const STORAGE_KEY = "lanbel_cart";
const COUPON_KEY = "lanbel_cart_coupon";

interface CartContextValue {
  items: CartLine[];
  totals: CartTotals;
  couponCode: string | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: ProductCardDTO, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

function toLine(product: ProductCardDTO, quantity: number): CartLine {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image,
    price: product.price,
    mrp: product.mrp,
    quantity,
    stock: product.stock,
  };
}

const toIncoming = (items: CartLine[]) =>
  items.map((i) => ({ productId: i.productId, quantity: i.quantity }));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  const [items, setItems] = React.useState<CartLine[]>([]);
  const [couponCode, setCouponCode] = React.useState<string | null>(null);
  const [serverDiscount, setServerDiscount] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  const authedRef = React.useRef(isAuthenticated);
  const itemsRef = React.useRef(items);
  const couponRef = React.useRef(couponCode);
  React.useEffect(() => {
    authedRef.current = isAuthenticated;
  }, [isAuthenticated]);
  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  React.useEffect(() => {
    couponRef.current = couponCode;
  }, [couponCode]);

  // Initial guest hydration from localStorage.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartLine[]);
      const coupon = localStorage.getItem(COUPON_KEY);
      if (coupon) setCouponCode(coupon);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const applyServerCart = React.useCallback((cart: CartDTO) => {
    setItems(cart.items);
    setCouponCode(cart.couponCode ?? null);
    setServerDiscount(cart.couponValid ? cart.couponDiscount : 0);
  }, []);

  // Login/logout transitions: merge guest cart, then use the server as source.
  const prevAuthed = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (!hydrated || isLoading) return;

    if (isAuthenticated && prevAuthed.current !== true) {
      void (async () => {
        try {
          const { cart } = await apiPost<{ cart: CartDTO }>("/cart/merge", {
            items: toIncoming(itemsRef.current),
          });
          applyServerCart(cart);
        } catch {
          /* keep local state */
        }
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(COUPON_KEY);
        } catch {
          /* ignore */
        }
      })();
    }

    if (!isAuthenticated && prevAuthed.current === true) {
      setItems([]);
      setCouponCode(null);
      setServerDiscount(0);
    }

    prevAuthed.current = isAuthenticated;
  }, [isAuthenticated, isLoading, hydrated, applyServerCart]);

  const persistGuest = React.useCallback(
    (nextItems: CartLine[], nextCoupon: string | null) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
        if (nextCoupon) localStorage.setItem(COUPON_KEY, nextCoupon);
        else localStorage.removeItem(COUPON_KEY);
      } catch {
        /* ignore */
      }
    },
    [],
  );

  const pushServer = React.useCallback(
    async (nextItems: CartLine[], nextCoupon: string | null) => {
      try {
        const { cart } = await apiPut<{ cart: CartDTO }>("/cart", {
          items: toIncoming(nextItems),
          couponCode: nextCoupon ?? "",
        });
        setServerDiscount(cart.couponValid ? cart.couponDiscount : 0);
        return cart;
      } catch {
        return null;
      }
    },
    [],
  );

  /** Applies a cart change locally then persists to the right backend. */
  const commit = React.useCallback(
    (nextItems: CartLine[], nextCoupon: string | null = couponRef.current) => {
      setItems(nextItems);
      setCouponCode(nextCoupon);
      if (authedRef.current) void pushServer(nextItems, nextCoupon);
      else persistGuest(nextItems, nextCoupon);
    },
    [persistGuest, pushServer],
  );

  const addItem = React.useCallback(
    (product: ProductCardDTO, quantity = 1) => {
      if (product.stock <= 0) {
        toast.error("This product is out of stock");
        return;
      }
      const prev = itemsRef.current;
      const existing = prev.find((i) => i.productId === product.id);
      const next = existing
        ? prev.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
              : i,
          )
        : [...prev, toLine(product, Math.min(quantity, product.stock))];
      commit(next);
      toast.success(`${product.name} added to cart`);
      setIsOpen(true);
    },
    [commit],
  );

  const removeItem = React.useCallback(
    (productId: string) => {
      commit(itemsRef.current.filter((i) => i.productId !== productId));
    },
    [commit],
  );

  const updateQuantity = React.useCallback(
    (productId: string, quantity: number) => {
      const next = itemsRef.current
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stock)) }
            : i,
        )
        .filter((i) => i.quantity > 0);
      commit(next);
    },
    [commit],
  );

  const clearCart = React.useCallback(() => {
    commit([], null);
  }, [commit]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const applyCoupon = React.useCallback(
    async (code: string): Promise<{ ok: boolean; message: string }> => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return { ok: false, message: "Enter a coupon code" };

      if (authedRef.current) {
        const cart = await pushServer(itemsRef.current, trimmed);
        if (cart?.couponValid) {
          setCouponCode(trimmed);
          return { ok: true, message: "Coupon applied" };
        }
        return { ok: false, message: "Invalid or ineligible coupon" };
      }

      const result = evaluateCoupon(trimmed, subtotal);
      if (result.valid) {
        setCouponCode(trimmed);
        persistGuest(itemsRef.current, trimmed);
      }
      return { ok: result.valid, message: result.message };
    },
    [pushServer, persistGuest, subtotal],
  );

  const removeCoupon = React.useCallback(() => {
    setCouponCode(null);
    setServerDiscount(0);
    if (authedRef.current) void pushServer(itemsRef.current, null);
    else persistGuest(itemsRef.current, null);
  }, [pushServer, persistGuest]);

  const couponDiscount = isAuthenticated
    ? serverDiscount
    : couponCode
      ? evaluateCoupon(couponCode, subtotal).discount
      : 0;

  const totals = React.useMemo(
    () => computeTotals(items, couponDiscount),
    [items, couponDiscount],
  );

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      totals,
      couponCode,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
    }),
    [
      items,
      totals,
      couponCode,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
