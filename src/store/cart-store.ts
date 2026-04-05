import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Unit } from "@/types/unit";

export interface CartItem {
  unit: Unit;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (unit: Unit) => void;
  removeItem: (unitId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getBuyNowItems: () => CartItem[];
  getQuoteItems: () => CartItem[];
  clearQuoteItems: () => void;
  replaceCart: (items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (unit: Unit) => {
        set((state) => {
          const existing = state.items.find((item) => item.unit.id === unit.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.unit.id === unit.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { unit, quantity: 1 }] };
        });
      },
      removeItem: (unitId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.unit.id !== unitId),
        }));
      },
      clearCart: () => set({ items: [] }),
      replaceCart: (newItems: CartItem[]) => set({ items: newItems }),
      clearQuoteItems: () => {
        set((state) => ({
          items: state.items.filter((item) => item.unit.purchaseMode === "buy_now"),
        }));
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getSubtotal: () => {
        return get().items
          .filter((item) => item.unit.purchaseMode === "buy_now")
          .reduce(
            (total, item) => total + (item.unit.priceCents || 0) * item.quantity,
            0
          );
      },
      getBuyNowItems: () => {
        return get().items.filter(item => item.unit.purchaseMode === "buy_now");
      },
      getQuoteItems: () => {
        return get().items.filter(item => item.unit.purchaseMode !== "buy_now");
      }
    }),
    {
      name: "robotstore-cart",
    }
  )
);
