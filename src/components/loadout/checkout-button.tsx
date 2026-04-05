"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { CheckoutResponse } from "@/types/checkout";
import { track } from "@/lib/analytics/track";

export function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getBuyNowItems } = useCartStore();
  const buyNowItems = getBuyNowItems();

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        items: buyNowItems.map(item => ({
          unitId: item.unit.slug,
          quantity: item.quantity,
        }))
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: CheckoutResponse = await res.json();

      if (!res.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : "Checkout request failed");
      }

      track("checkout_initiated", { itemCount: buyNowItems.length });
      window.location.href = data.url;

    } catch (err: any) {
      console.error("Checkout CTA Error:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        size="lg" 
        onClick={handleCheckout}
        disabled={buyNowItems.length === 0 || isLoading}
        className="w-full bg-brand-signal hover:bg-brand-signal-soft text-brand-bg rounded-none uppercase font-mono tracking-widest font-semibold"
      >
        {isLoading ? "[ INITIATING LINK... ]" : "[ SECURE DEPLOYMENT ]"}
      </Button>
      {error && (
        <p className="text-red-500 font-mono text-[10px] uppercase text-center">{error}</p>
      )}
    </div>
  );
}
