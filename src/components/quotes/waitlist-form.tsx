"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function WaitlistForm({ unitId }: { unitId: string }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setIsAuthenticated(true);
        setEmail(data.user.email || "");
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, email }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to join waitlist");

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-2 p-4 bg-brand-signal/10 border border-brand-signal font-mono">
         <div className="text-[10px] text-brand-signal/60 uppercase tracking-widest">{">"}  QUEUE STATUS</div>
         <div className="text-brand-signal font-bold uppercase tracking-widest">QUEUE POSITION LOCKED</div>
         <div className="flex flex-col gap-1 text-[10px] uppercase tracking-widest text-brand-signal/70 border-t border-brand-signal/30 pt-3 mt-1">
           <span>Allocation is batch-based and heavily restricted.</span>
           <span>Priority strictly enforced by submission timestamp.</span>
           <span>You will be notified when availability opens.</span>
         </div>
         <div className="border-t border-brand-signal/30 pt-2 mt-1">
           {isAuthenticated ? (
             <a href="/account/quotes" className="text-[10px] uppercase tracking-widest underline text-brand-signal/80 hover:text-brand-signal">
               {'>'} TRACK STATUS IN OPERATOR CONSOLE
             </a>
           ) : (
             <a href="/auth/sign-up" className="text-[10px] uppercase tracking-widest underline text-brand-signal/60 hover:text-brand-signal">
               {'>'} CREATE OPERATOR PROFILE TO MONITOR ALLOCATION
             </a>
           )}
         </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 font-mono">
      <div className="text-[10px] uppercase tracking-widest text-amber-500/80 border border-amber-500/20 bg-amber-500/5 p-2 flex flex-col gap-1">
        <span>Allocation is limited. Priority queue strictly enforced.</span>
        <span>You will be notified when availability opens.</span>
      </div>
      {error && (
        <div className="p-2 border border-red-500/50 text-red-500 text-xs">
          [SYS ERROR] {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
           type="email"
           required
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           disabled={isAuthenticated}
           placeholder="operator@sys.com"
           className="bg-brand-bg flex-1 border-brand-signal/20 text-brand-text rounded-none focus-visible:ring-brand-signal disabled:opacity-50"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-brand-signal hover:bg-brand-signal-soft text-brand-bg rounded-none uppercase tracking-widest sm:w-auto w-full font-mono"
        >
          {isLoading ? <span className="animate-pulse">[ LOCKING POSITION... ]</span> : "[ LOCK QUEUE POSITION ]"}
        </Button>
      </div>
    </form>
  );
}
