"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Truck, X, DatabaseZap, Terminal, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/loadout/checkout-button";
import { QuoteRequestForm } from "@/components/quotes/quote-request-form";
import { SaveLoadoutAction } from "@/components/loadout/save-loadout-action";

export default function LoadoutPage() {
  const { items, removeItem, getSubtotal, getBuyNowItems, getQuoteItems } = useCartStore();

  const buyNowItems = getBuyNowItems();
  const quoteItems = getQuoteItems();
  const subtotal = getSubtotal() / 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full pb-32">
      
      <div className="flex items-center gap-3 mb-8 text-brand-signal">
        <DatabaseZap className="w-8 h-8" />
        <div className="text-[10px] uppercase tracking-widest text-brand-signal mb-1">
          {">"} SYSTEM STATE: LOADOUT ACTIVE
        </div>
        <h1 className="text-3xl font-bold font-mono tracking-widest text-brand-text uppercase">
          System Loadout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column - Cart Items */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {items.length === 0 ? (
            <div className="border border-dashed border-border bg-brand-panel p-12 text-center flex flex-col items-center justify-center">
              <Terminal className="w-8 h-8 text-brand-text/30 mb-4" />
              <p className="font-mono text-brand-text/50 uppercase tracking-widest mb-2">
                {">"} NO UNITS PRESENT IN CURRENT LOADOUT.
              </p>
              <p className="font-mono text-brand-text/30 text-xs uppercase tracking-widest mb-6 max-w-sm">
                Identify autonomous nodes via direct catalog scan or automated diagnostic.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/units" className="border border-brand-signal/50 text-brand-signal hover:bg-brand-signal/10 rounded-none uppercase font-mono tracking-widest bg-brand-bg px-4 py-2 text-xs font-medium inline-flex items-center justify-center">
                   [ SCAN INVENTORY ]
                </Link>
                <Link href="/recommend" className="bg-brand-signal text-brand-bg hover:bg-brand-signal-soft rounded-none uppercase font-mono tracking-widest px-4 py-2 text-xs font-medium inline-flex items-center justify-center">
                   [ RUN DIAGNOSTIC ]
                </Link>
              </div>
            </div>
          ) : (
            <>
              {buyNowItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-mono uppercase tracking-widest text-brand-text mb-2 border-b border-border pb-2">Ready for Deployment</h2>
                  {buyNowItems.map((item) => (
                    <CartItemCard key={item.unit.id} item={item} onRemove={() => removeItem(item.unit.id)} />
                  ))}
                </div>
              )}

              {quoteItems.length > 0 && (
                <div className="flex flex-col gap-4 mt-4">
                  <h2 className="text-xl font-mono uppercase tracking-widest text-brand-text mb-2 border-b border-border pb-2">Pending Quote / Inquiry</h2>
                  {quoteItems.map((item) => (
                    <CartItemCard key={item.unit.id} item={item} onRemove={() => removeItem(item.unit.id)} isQuote />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-4">
          <Card className="bg-brand-panel border-border rounded-none p-6 sticky top-24">
            <h3 className="font-mono text-brand-signal uppercase tracking-widest font-bold mb-6">Deployment Summary</h3>
            
            <div className="flex flex-col gap-4 font-mono text-sm text-brand-text/80 mb-6">
              <div className="flex justify-between">
                <span>Deployable Units ({buyNowItems.length})</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-text/50">
                <span>Quote Requests ({quoteItems.length})</span>
                <span>PENDING</span>
              </div>
              <div className="flex justify-between">
                <span>Freight Transit</span>
                <span className="text-brand-text/50">TBD</span>
              </div>
              <div className="flex justify-between">
                <span>Network Tax</span>
                <span className="text-brand-text/50">TBD</span>
              </div>
            </div>

            <Separator className="bg-border mb-6" />

            <div className="flex justify-between items-end mb-8">
               <span className="font-mono text-xs text-brand-text/50 uppercase tracking-widest">Total Valuation</span>
               <span className="font-mono text-2xl font-bold text-brand-text">${subtotal.toLocaleString()}</span>
            </div>

            <div className="space-y-4">
               {buyNowItems.length > 0 && (
                 <div className="flex flex-col gap-3">
                   <CheckoutButton />
                   <div className="bg-brand-bg border border-brand-signal/20 p-3">
                     <div className="font-mono text-[10px] uppercase tracking-widest text-brand-signal mb-2">
                       {">"}  SECURE DEPLOYMENT PROTOCOL
                     </div>
                     <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2 font-mono text-[10px] text-brand-text/50 uppercase tracking-widest">
                         <ShieldCheck className="w-3 h-3 text-brand-signal" /> Secured via Stripe infrastructure
                       </div>
                       <div className="flex items-center gap-2 font-mono text-[10px] text-brand-text/50 uppercase tracking-widest">
                         <ShieldCheck className="w-3 h-3 text-brand-signal" /> Encrypted transaction layer
                       </div>
                       <div className="flex items-center gap-2 font-mono text-[10px] text-brand-text/50 uppercase tracking-widest">
                         <ShieldCheck className="w-3 h-3 text-brand-signal" /> No operational data retained locally
                       </div>
                     </div>
                   </div>
                 </div>
               )}
               {quoteItems.length > 0 && (
                 <QuoteRequestForm />
               )}
               
               <div className="pt-4 mt-4 border-t border-border">
                 <SaveLoadoutAction />
               </div>
            </div>
            
            <div className="font-mono text-[10px] text-brand-text/30 uppercase tracking-widest text-center mt-6">
              <div className="flex items-center justify-center gap-2">
                <Truck className="w-3 h-3" /> Encased logistics transport available
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CartItemCard({ item, onRemove, isQuote = false }: { item: any, onRemove: () => void, isQuote?: boolean }) {
  return (
    <Card className="bg-brand-bg border-border rounded-none p-4 sm:p-6 flex flex-col sm:flex-row gap-6 relative group overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,156,0)_50%,rgba(0,255,156,0.02)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
      
      <div className="w-full sm:w-32 aspect-video sm:aspect-square bg-brand-panel border border-border flex items-center justify-center flex-shrink-0">
        <span className="font-mono text-[10px] text-brand-text/30 uppercase tracking-widest">VIS_FEED</span>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
          <div>
            <Badge variant="outline" className="bg-brand-bg border-brand-signal/30 text-brand-signal uppercase font-mono text-[10px] tracking-wider rounded-none mb-2">
              {item.unit.sku}
            </Badge>
            <h3 className="font-bold font-mono tracking-wide text-brand-text text-lg leading-tight mb-1">
              {item.unit.name}
            </h3>
            <p className="text-xs font-mono text-brand-text/50">
              Qty: {item.quantity}
            </p>
          </div>
          
          <div className="text-right">
            <div className="font-mono text-lg text-brand-text">
               {!isQuote && item.unit.priceCents ? `$${(item.unit.priceCents * item.quantity / 100).toLocaleString()}` : "TBD"}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
           <div className={`font-mono text-[10px] uppercase tracking-widest ${isQuote ? 'text-brand-text/50' : 'text-brand-signal/50'} flex items-center gap-2`}>
              {isQuote ? <FileText className="w-3 h-3" /> : <CheckCircleIcon />} 
              {isQuote ? 'REQ ATTACHED' : 'SECURE PROTOCOL ACTIVE'}
           </div>
           <button onClick={onRemove} className="text-brand-text/40 hover:text-red-500 transition-colors uppercase font-mono text-[10px] tracking-widest flex items-center gap-1 z-10 relative">
             <X className="w-3 h-3" /> REMOVE
           </button>
        </div>
      </div>
    </Card>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
