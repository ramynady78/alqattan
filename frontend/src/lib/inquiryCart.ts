import { useSyncExternalStore } from "react";
import { InquiryItem } from "@workspace/api-client-react";

type CartItem = InquiryItem;

class CartStore {
  private items: CartItem[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem("alqattan_cart");
      if (stored) {
        this.items = JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }

  private save() {
    try {
      localStorage.setItem("alqattan_cart", JSON.stringify(this.items));
    } catch {
      // ignore
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.items;
  };

  addItem(productId: number, productName: string, quantity: number = 1) {
    const existing = this.items.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items = [...this.items, { productId, productName, quantity }];
    }
    this.save();
  }

  removeItem(productId: number) {
    this.items = this.items.filter((i) => i.productId !== productId);
    this.save();
  }

  updateQty(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const item = this.items.find((i) => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.items = [...this.items];
      this.save();
    }
  }

  clear() {
    this.items = [];
    this.save();
  }
}

export const cartStore = new CartStore();

export function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot);
  return {
    items,
    addItem: (id: number, name: string, qty: number = 1) => cartStore.addItem(id, name, qty),
    removeItem: (id: number) => cartStore.removeItem(id),
    updateQty: (id: number, qty: number) => cartStore.updateQty(id, qty),
    clear: () => cartStore.clear(),
    count: items.reduce((acc, item) => acc + item.quantity, 0)
  };
}
