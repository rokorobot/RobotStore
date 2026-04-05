"use client";

import { useCompareStore } from "@/store/compare-store";
import { Unit } from "@/types/unit";
import { Button } from "@/components/ui/button";
import { Scale, Check, X } from "lucide-react";

export function AddToCompareButton({ unit, variant = "outline" }: { unit: Unit, variant?: "outline" | "ghost" | "default" }) {
  const { addUnit, removeUnit, isComparing, canAddMore } = useCompareStore();

  const isSelected = isComparing(unit.id);
  const disabled = !isSelected && !canAddMore();

  const toggleCompare = () => {
    if (isSelected) {
      removeUnit(unit.id);
    } else {
      addUnit(unit);
    }
  };

  return (
    <Button
      onClick={toggleCompare}
      disabled={disabled}
      variant={variant}
      size="sm"
      className={`press-feedback hover-phosphor font-mono text-[10px] uppercase tracking-widest ${
        isSelected ? 'border-brand-signal text-brand-signal bg-brand-signal/10' : ''
      }`}
    >
      {isSelected ? (
        <><Check className="w-3 h-3 mr-2" /> [ IN MATRIX ]</>
      ) : (
        <><Scale className="w-3 h-3 mr-2" /> {disabled ? '[ MATRIX FULL ]' : '[ ADD TO MATRIX ]'}</>
      )}
    </Button>
  );
}
