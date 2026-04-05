import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CompareStore } from "@/types/compare";

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      units: [],
      addUnit: (unit) => {
        const { units, canAddMore } = get();
        if (!canAddMore()) return;
        if (units.some((u) => u.id === unit.id)) return;
        
        set({ units: [...units, unit] });
      },
      removeUnit: (unitId) => set((state) => ({
        units: state.units.filter((u) => u.id !== unitId),
      })),
      clearCompare: () => set({ units: [] }),
      isComparing: (unitId) => get().units.some((u) => u.id === unitId),
      canAddMore: () => get().units.length < 4,
    }),
    {
      name: "robotstore-compare",
    }
  )
);
