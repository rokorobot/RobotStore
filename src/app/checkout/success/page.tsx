"use client";

import Link from "next/link";
import { Terminal, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export default function CheckoutSuccessPage() {
  const { items, removeItem } = useCartStore();

  useEffect(() => {
    track("checkout_completed");
    // Clear only buy_now items
    const buyNowItems = items.filter(i => i.unit.purchaseMode === "buy_now");
    buyNowItems.forEach(item => removeItem(item.unit.id));
  }, [items, removeItem]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="max-w-xl w-full border border-brand-signal bg-brand-panel p-8 sm:p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-brand-signal/10 border border-brand-signal flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-brand-signal" />
        </div>
        
        <div className="text-[10px] font-mono uppercase tracking-widest text-brand-signal/60 mb-2">
          {'>'} ACQUISITION STATUS
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-widest text-brand-signal uppercase mb-1">
          DEPLOYMENT CONFIRMED
        </h1>
        <div className="text-[10px] font-mono uppercase tracking-widest text-brand-text/40 mb-6">
          Transaction logged. Shadow record updating.
        </div>
        
        <p className="text-brand-text/60 font-mono text-xs leading-relaxed mb-8 uppercase tracking-wide border border-border bg-brand-bg p-4">
          {'>'} Acquisition protocol completed via Stripe secure layer.<br />
          {'>'} Network token and transit logic are being processed.<br />
          {'>'} Record will reflect in your Operator profile shortly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
           <Link href="/units" className="flex-1 bg-brand-signal text-brand-bg hover:bg-brand-signal-soft rounded-none uppercase font-mono tracking-widest font-semibold h-11 inline-flex items-center justify-center press-feedback text-xs">
              [ EXPAND DEPLOYMENT ]
           </Link>
           <Link href="/account/quotes" className="flex-1 border border-brand-signal/30 text-brand-signal/70 hover:bg-brand-signal/10 hover:text-brand-signal rounded-none uppercase font-mono tracking-widest bg-brand-bg h-11 inline-flex items-center justify-center text-xs">
              [ VIEW ORDER LOG ]
           </Link>
        </div>
      </div>
    </div>
  );
}
