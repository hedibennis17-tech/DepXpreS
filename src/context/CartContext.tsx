"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  qty: number;
  storeId: string;
  storeName: string;
}

interface CartContextType {
  items: CartItem[];
  storeId: string;
  storeName: string;
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
  qty: (id: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    // Si nouveau store → vider le panier
    setStoreId(prev => {
      if (prev && prev !== item.storeId) setItems([]);
      return item.storeId;
    });
    setStoreName(item.storeName);
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const increment = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  }, []);

  const decrement = useCallback((id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      if (item.qty <= 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]); setStoreId(""); setStoreName("");
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const qty = (id: string) => items.find(i => i.id === id)?.qty || 0;

  return (
    <CartContext.Provider value={{ items, storeId, storeName, add, remove, increment, decrement, clear, total, count, qty }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
