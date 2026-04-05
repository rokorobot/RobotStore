import { Unit } from "@/types/unit";

export interface CompareState {
  units: Unit[];
}

export interface CompareActions {
  addUnit: (unit: Unit) => void;
  removeUnit: (unitId: string) => void;
  clearCompare: () => void;
  isComparing: (unitId: string) => boolean;
  canAddMore: () => boolean;
}

export type CompareStore = CompareState & CompareActions;
