"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cart-store";

export function QuoteRequestForm() {
  const { getQuoteItems, clearQuoteItems } = useCartStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quoteItems = getQuoteItems();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setIsAuthenticated(true);
        setEmail(data.user.email || "");
        // We could fetch profile data to prefill name/company, but we'll stick to email for MVP
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        items: quoteItems.map(item => ({
          unitId: item.unit.slug,
          quantity: item.quantity
        })),
        name,
        email,
        company,
        message
      };

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to submit quote request");

      setIsSuccess(true);
      clearQuoteItems(); // Clears them from the cart once quoted

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (quoteItems.length === 0 && !isSuccess) {
    return null;
  }

  if (isSuccess) {
    return (
      <div className="p-6 border border-brand-signal bg-brand-signal/5 font-mono">
        <div className="text-[10px] uppercase tracking-widest text-brand-signal mb-1">{">"}  TRANSMISSION STATUS</div>
        <h3 className="text-xl text-brand-signal font-bold uppercase tracking-widest mb-3">REQUEST LOGGED</h3>
        <div className="flex flex-col gap-2">
          <div className="text-[10px] text-brand-text/70 uppercase tracking-widest">
            RFQ has been transmitted to certified deployment partners.
          </div>
          <div className="text-[10px] text-brand-text/50 uppercase tracking-widest">
            Response window: 24–72 hours.
          </div>
          <div className="text-[10px] text-brand-text/50 uppercase tracking-widest">
            No commitment required. Non-binding request.
          </div>
          <div className="border-t border-brand-signal/30 pt-3 mt-1 flex flex-col gap-1">
            {isAuthenticated ? (
              <a href="/account/quotes" className="text-[10px] uppercase tracking-widest text-brand-signal underline hover:text-brand-signal-soft">
                {'>'} TRACK STATUS IN OPERATOR CONSOLE
              </a>
            ) : (
              <a href="/auth/sign-up" className="text-[10px] uppercase tracking-widest text-brand-signal underline hover:text-brand-signal-soft">
                {'>'} CREATE PROFILE TO MONITOR REQUEST
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 border border-border bg-brand-panel space-y-4 font-mono">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-brand-signal mb-1">{">"}  INITIATE TRANSMISSION</div>
        <h3 className="text-brand-text font-bold uppercase tracking-widest border-b border-border pb-2 mb-1">
          Quote Request Log
        </h3>
        <div className="text-[10px] uppercase tracking-widest text-brand-text/40 mt-2 flex flex-col gap-1">
          <span>Response window: 24–72 hours</span>
          <span>Reviewed by certified deployment partners</span>
          <span>Non-binding — no commitment required</span>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-500 text-xs">
          [SYS ERROR]: {error}
        </div>
      )}

      {!isAuthenticated && (
        <div className="text-[10px] text-amber-500/70 uppercase tracking-widest border border-amber-500/20 bg-amber-500/5 p-2">
          {">"}  ANONYMOUS MODE — <a href="/auth/sign-in" className="underline hover:text-amber-400">Sign in</a> to link to Operator profile.
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs text-brand-text/70 uppercase">Operator Name *</label>
        <Input 
          required 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="bg-brand-bg border-brand-signal/20 text-brand-text rounded-none focus-visible:ring-brand-signal" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-brand-text/70 uppercase">Contact Email *</label>
        <Input 
          type="email" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={isAuthenticated}
          className="bg-brand-bg border-brand-signal/20 text-brand-text rounded-none focus-visible:ring-brand-signal disabled:opacity-50" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-brand-text/70 uppercase">Company/Organization</label>
        <Input 
          value={company} 
          onChange={(e) => setCompany(e.target.value)} 
          className="bg-brand-bg border-brand-signal/20 text-brand-text rounded-none focus-visible:ring-brand-signal" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-brand-text/70 uppercase">Deployment Notes</label>
        <textarea 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          className="w-full flex min-h-[80px] bg-brand-bg px-3 py-2 text-sm border-brand-signal/20 text-brand-text rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-signal" 
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full border-brand-signal text-brand-signal hover:bg-brand-signal/10 hover:text-brand-signal rounded-none uppercase font-mono tracking-widest font-semibold bg-brand-bg mt-4 relative group"
      >
        {isLoading ? (
          <span className="animate-pulse">[ TRANSMITTING... ]</span>
        ) : (
          "[ INITIATE TRANSMISSION ]"
        )}
      </Button>
    </form>
  );
}
