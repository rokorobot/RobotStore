import { CheckoutCartItem } from "@/types/checkout";
import { getUnitBySlug } from "@/content/units";
import Stripe from "stripe";

export function assertCheckoutEligible(items: CheckoutCartItem[]) {
  if (!items || items.length === 0) {
    throw new Error("Payload must contain at least 1 item.");
  }
  for (const item of items) {
    if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
      throw new Error(`Invalid quantity for unit ${item.unitId}`);
    }
    const unit = getUnitBySlug(item.unitId);
    if (!unit) {
      throw new Error(`Unit ${item.unitId} not found in catalog.`);
    }
    if (unit.purchaseMode !== "buy_now") {
      throw new Error(`Unit ${unit.sku} is not eligible for direct checkout.`);
    }
    if (!unit.stripePriceId) {
      throw new Error(`Unit ${unit.sku} is missing a stripePriceId.`);
    }
  }
}

export function buildCheckoutLineItems(items: CheckoutCartItem[]): any[] {
  return items.map((item) => {
    const unit = getUnitBySlug(item.unitId)!;
    return {
      price: unit.stripePriceId,
      quantity: item.quantity,
    };
  });
}

export function buildCheckoutMetadata(items: CheckoutCartItem[]): Record<string, string> {
  return {
    source: "robotstore",
    unit_ids: items.map((item) => item.unitId).join(","),
  };
}
