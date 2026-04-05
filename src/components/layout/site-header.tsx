import Link from "next/link";
import { Terminal } from "lucide-react";
import { AuthStatus } from "@/components/auth/auth-status";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-border bg-brand-panel/90 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3 text-brand-signal font-mono font-bold tracking-widest group">
        <Terminal className="h-5 w-5 group-hover:animate-pulse" />
        <Link href="/">ROBOT_STORE</Link>
        <div className="hidden sm:flex items-center gap-1.5 ml-2 border border-brand-signal/20 bg-brand-signal/5 px-2 py-0.5">
          <span className="w-1.5 h-1.5 bg-brand-signal animate-pulse" />
          <span className="text-[9px] uppercase tracking-widest text-brand-signal/60 font-mono">SYS ACTIVE</span>
        </div>
      </div>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6 text-sm font-mono tracking-widest uppercase text-brand-text">
        <Link href="/recommend" className="hidden md:block hover:text-brand-signal transition-colors text-[11px]">[ DIAGNOSTIC ]</Link>
        <Link href="/compare" className="hidden md:block hover:text-brand-signal transition-colors text-[11px]">[ MATRIX ]</Link>
        <Link href="/units" className="hover:text-brand-signal transition-colors text-[11px]">[ SCAN ]</Link>
        <Link href="/loadout" className="hover:text-brand-signal transition-colors text-[11px]">[ LOADOUT ]</Link>
        <AuthStatus />
      </nav>
    </header>
  );
}
