import { requireAdminPage } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const supabase = await createClient();

  // Fetch basic active aggregations
  const [{ count: unitsCount }, { count: quotesCount }, { count: waitlistCount }, { count: ordersCount }] = await Promise.all([
    supabase.from("units").select("*", { count: 'exact', head: true }),
    supabase.from("quote_requests").select("*", { count: 'exact', head: true }).neq("status", "waitlist"),
    supabase.from("quote_requests").select("*", { count: 'exact', head: true }).eq("status", "waitlist"),
    supabase.from("orders_shadow").select("*", { count: 'exact', head: true })
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
       <div>
         <h1 className="text-2xl font-mono uppercase tracking-widest text-brand-text mb-2">Ops Command Center</h1>
         <p className="text-xs font-mono text-brand-text/50 uppercase tracking-widest">Global system telemetry and asset tracking.</p>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         
         <div className="bg-brand-panel border border-border p-6 flex flex-col font-mono relative overflow-hidden group">
            <div className="text-[10px] uppercase tracking-widest text-brand-text/50 mb-4 z-10 relative">Units Online</div>
            <div className="text-4xl font-bold text-brand-signal z-10 relative">{unitsCount || 0}</div>
         </div>
         
         <div className="bg-brand-panel border border-border p-6 flex flex-col font-mono relative overflow-hidden group">
            <div className="text-[10px] uppercase tracking-widest text-brand-text/50 mb-4 z-10 relative">Pending RFQs</div>
            <div className="text-4xl font-bold text-brand-text z-10 relative">{quotesCount || 0}</div>
         </div>
         
         <div className="bg-brand-panel border border-border p-6 flex flex-col font-mono relative overflow-hidden group">
            <div className="text-[10px] uppercase tracking-widest text-brand-text/50 mb-4 z-10 relative">Waitlist Entries</div>
            <div className="text-4xl font-bold text-orange-500 z-10 relative">{waitlistCount || 0}</div>
         </div>
         
         <div className="bg-brand-panel border border-border p-6 flex flex-col font-mono relative overflow-hidden group">
            <div className="text-[10px] uppercase tracking-widest text-brand-text/50 mb-4 z-10 relative">Cleared Orders</div>
            <div className="text-4xl font-bold text-brand-text z-10 relative">{ordersCount || 0}</div>
         </div>

       </div>
    </div>
  );
}
