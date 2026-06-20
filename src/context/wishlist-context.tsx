"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ProductCardDTO } from "@/types";
import { apiPut, apiPost } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";

const STORAGE_KEY = "lanbel_wishlist";

interface WishlistContextValue {
  items: ProductCardDTO[];
  count: number;
  has: (productId: string) => boolean;
  toggle: (product: ProductCardDTO) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [items, setItems] = React.useState<ProductCardDTO[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  const authedRef = React.useRef(isAuthenticated);
  const itemsRef = React.useRef(items);
  React.useEffect(() => {
    authedRef.current = isAuthenticated;
  }, [isAuthenticated]);
  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as ProductCardDTO[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Login/logout transitions.
  const prevAuthed = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (!hydrated || isLoading) return;

    if (isAuthenticated && prevAuthed.current !== true) {
      void (async () => {
        try {
          const { items: merged } = await apiPost<{ items: ProductCardDTO[] }>(
            "/wishlist/merge",
            { productIds: itemsRef.current.map((p) => p.id) },
          );
          setItems(merged);
        } catch {
          /* keep local */
        }
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      })();
    }

    if (!isAuthenticated && prevAuthed.current === true) {
      setItems([]);
    }

    prevAuthed.current = isAuthenticated;
  }, [isAuthenticated, isLoading, hydrated]);

  const commit = React.useCallback((next: ProductCardDTO[]) => {
    setItems(next);
    if (authedRef.current) {
      void apiPut<{ items: ProductCardDTO[] }>("/wishlist", {
        productIds: next.map((p) => p.id),
      })
        .then(({ items: reconciled }) => setItems(reconciled))
        .catch(() => {});
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const has = React.useCallback(
    (productId: string) => items.some((i) => i.id === productId),
    [items],
  );

  const toggle = React.useCallback(
    (product: ProductCardDTO) => {
      const prev = itemsRef.current;
      if (prev.some((i) => i.id === product.id)) {
        commit(prev.filter((i) => i.id !== product.id));
        toast.success("Removed from wishlist");
      } else {
        commit([product, ...prev]);
        toast.success("Added to wishlist");
      }
    },
    [commit],
  );

  const remove = React.useCallback(
    (productId: string) => {
      commit(itemsRef.current.filter((i) => i.id !== productId));
    },
    [commit],
  );

  const clear = React.useCallback(() => commit([]), [commit]);

  const value = React.useMemo<WishlistContextValue>(
    () => ({ items, count: items.length, has, toggle, remove, clear }),
    [items, has, toggle, remove, clear],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
