"use client";

import Link from "next/link";
import { Terminal, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="max-w-xl w-full border border-border bg-brand-panel p-8 sm:p-12 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-brand-bg border border-border rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-brand-text/50" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-widest text-brand-text uppercase mb-4">
          Deployment Interrupted
        </h1>
        
        <p className="text-brand-text/60 font-mono text-sm leading-relaxed mb-8">
          The secure checkout tunnel was disconnected before completion. Your pre-selected units remain safely cached in your loadout terminal.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
           <Link href="/loadout" className="flex-1 bg-brand-text text-brand-bg hover:bg-brand-text/80 rounded-none uppercase font-mono tracking-widest font-semibold h-11 inline-flex items-center justify-center">
              [ OPEN LOADOUT ]
           </Link>
           <Link href="/units" className="flex-1 border border-brand-text/30 text-brand-text hover:bg-brand-text/10 rounded-none uppercase font-mono tracking-widest bg-brand-bg h-11 inline-flex items-center justify-center">
              [ SCAN UNITS ]
           </Link>
        </div>
      </div>
    </div>
  );
}
