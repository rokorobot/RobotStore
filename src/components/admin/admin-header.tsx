import { SignOutButton } from "@/components/auth/sign-out-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="h-16 border-b border-border bg-brand-panel flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
         <Link href="/account" className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-brand-text/50 hover:text-brand-signal transition-colors">
            <ArrowLeft className="w-3 h-3" /> Exit Control Room
         </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-[10px] font-mono tracking-widest uppercase text-brand-signal px-2 py-1 bg-brand-signal/10 border border-brand-signal/30">
           Root Admin Mode
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
