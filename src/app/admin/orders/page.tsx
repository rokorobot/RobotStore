import { requireAdminPage } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { ShoppingCart } from "lucide-react";

export default async function AdminOrdersPage() {
  await requireAdminPage();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders_shadow")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
       <div className="flex justify-between items-end border-b border-border pb-4">
         <div>
           <div className="flex items-center gap-3 mb-2 text-brand-text">
             <ShoppingCart className="w-6 h-6 text-brand-signal" />
             <h1 className="text-2xl font-mono uppercase tracking-widest font-bold">Shadow Orders</h1>
           </div>
           <p className="text-[10px] text-brand-text/50 tracking-widest uppercase">Verified acquisition receipts from payment portal.</p>
         </div>
       </div>

       <div className="bg-brand-panel border border-border p-4 overflow-x-auto">
          <table className="w-full text-left font-mono">
             <thead>
                <tr className="border-b border-border text-[10px] text-brand-text/40 uppercase tracking-widest">
                   <th className="p-3">Date</th>
                   <th className="p-3">Operator</th>
                   <th className="p-3">Total Value</th>
                   <th className="p-3">Status</th>
                   <th className="p-3">Stripe Session ID</th>
                </tr>
             </thead>
             <tbody className="text-sm">
               {orders?.map((o) => (
                 <tr key={o.id} className="border-b border-border/50 hover:bg-brand-bg/50">
                    <td className="p-3 text-[10px] text-brand-text/50">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="p-3 text-brand-signal">{o.customer_email || "N/A"}</td>
                    <td className="p-3 font-bold text-brand-text">
                       ${(o.amount_total / 100).toLocaleString()} <span className="text-[10px] text-brand-text/50">{o.currency}</span>
                    </td>
                    <td className="p-3">
                       <span className="border border-brand-signal/30 text-brand-signal bg-brand-signal/10 px-2 py-0.5 text-[10px] uppercase">
                          {o.payment_status}
                       </span>
                    </td>
                    <td className="p-3 text-[10px] text-brand-text/30">
                       {o.stripe_session_id}
                    </td>
                 </tr>
               ))}
               {(!orders || orders.length === 0) && (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-[10px] uppercase tracking-widest text-brand-text/30">
                       [ NO SHADOW ORDERS VERIFIED ]
                    </td>
                 </tr>
               )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
