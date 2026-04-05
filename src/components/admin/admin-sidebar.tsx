import Link from "next/link";
import { Terminal, Box, Search, Tags, Copy, ShoppingCart, Activity, ShieldAlert } from "lucide-react";

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r border-border bg-brand-panel h-screen flex flex-col font-mono sticky top-0 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3 text-brand-signal font-bold tracking-widest">
          <Terminal className="h-5 w-5" />
          <span>ROBOT_ADMIN</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8 px-4">
        
        <div className="space-y-2">
          <div className="text-[10px] text-brand-text/40 uppercase tracking-widest px-2 mb-2">Core Catalog</div>
          <Link href="/admin/units" className="flex items-center gap-3 px-2 py-2 text-brand-text hover:bg-brand-bg hover:text-brand-signal transition-colors text-xs uppercase tracking-widest">
            <Box className="w-4 h-4" /> Units Database
          </Link>
          <Link href="/admin/classes" className="flex items-center gap-3 px-2 py-2 text-brand-text hover:bg-brand-bg hover:text-brand-signal transition-colors text-xs uppercase tracking-widest">
            <Tags className="w-4 h-4" /> Taxonomy Classes
          </Link>
          <Link href="/admin/brands" className="flex items-center gap-3 px-2 py-2 text-brand-text hover:bg-brand-bg hover:text-brand-signal transition-colors text-xs uppercase tracking-widest">
            <Copy className="w-4 h-4" /> Manufacturer Brands
          </Link>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-brand-text/40 uppercase tracking-widest px-2 mb-2">Flight Operations</div>
          <Link href="/admin/quotes" className="flex items-center gap-3 px-2 py-2 text-brand-text hover:bg-brand-bg hover:text-brand-signal transition-colors text-xs uppercase tracking-widest">
            <Search className="w-4 h-4" /> RFQ & Bids
          </Link>
          <Link href="/admin/waitlist" className="flex items-center gap-3 px-2 py-2 text-brand-text hover:bg-brand-bg hover:text-brand-signal transition-colors text-xs uppercase tracking-widest">
            <Activity className="w-4 h-4" /> Waitlist Queues
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-2 py-2 text-brand-text hover:bg-brand-bg hover:text-brand-signal transition-colors text-xs uppercase tracking-widest">
            <ShoppingCart className="w-4 h-4" /> Shadow Orders
          </Link>
          <Link href="/admin/loadouts" className="flex items-center gap-3 px-2 py-2 text-brand-text hover:bg-brand-bg hover:text-brand-signal transition-colors text-xs uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" /> Protected Loadouts
          </Link>
        </div>

      </div>
    </aside>
  );
}
