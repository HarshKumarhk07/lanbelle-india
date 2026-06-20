"use client";

import * as React from "react";
import type { ProductCardDTO } from "@/types";

const KEY = "lanbel_recently_viewed";
const EVENT = "lanbel:recently-viewed";
const MAX = 8;

function read(): ProductCardDTO[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProductCardDTO[]) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = React.useState<ProductCardDTO[]>([]);

  React.useEffect(() => {
    setItems(read());
    const handler = () => setItems(read());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const add = React.useCallback((product: ProductCardDTO) => {
    try {
      const next = [product, ...read().filter((p) => p.id !== product.id)].slice(
        0,
        MAX,
      );
      localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(EVENT));
    } catch {
      /* ignore */
    }
  }, []);

  return { items, add };
}
