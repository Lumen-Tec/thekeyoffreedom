"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ProductRecord } from "@/lib/types";

const STORAGE_KEY = "thekeyoffreedom-cart-v1";

export type CartItem = {
  id: string;
  objectID: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  imageAlt: string;
  stockQuantity: number;
  size: string;
  color: string;
  quantity: number;
};

type AddCartItem = {
  product: ProductRecord;
  size?: string;
  color?: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: AddCartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function getStoredCart() {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setItems(getStoredCart());
      setHasHydrated(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [hasHydrated, items]);

  const addItem = useCallback(({ product, size = "", color = "" }: AddCartItem) => {
    if (!product.in_stock) return;

    const id = [product.objectID, size, color].join("-");
    const stockLimit = product.stock_quantity > 0 ? product.stock_quantity : Number.POSITIVE_INFINITY;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === id);

      if (existingItem) {
        if (existingItem.quantity >= stockLimit) return currentItems;

        return currentItems.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + 1, stockQuantity: product.stock_quantity }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id,
          objectID: product.objectID,
          title: product.title,
          price: product.price,
          currency: product.currency,
          imageUrl: product.image.url,
          imageAlt: product.image.alt,
          stockQuantity: product.stock_quantity,
          size,
          color,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) return item;

        const stockLimit = item.stockQuantity > 0 ? item.stockQuantity : Number.POSITIVE_INFINITY;
        return { ...item, quantity: Math.min(stockLimit, Math.max(1, quantity)) };
      }),
    );
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return { items, itemCount, total, addItem, removeItem, updateQuantity };
  }, [addItem, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }

  return context;
}
