import { requireAdminPage } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { ShieldAlert, Download } from "lucide-react";

export default async function AdminLoadoutsPage() {
  await requireAdminPage();
  const supabase = await createClient();

  // Including user email requires a join across schemas, which isn't allowed out of the box in standard Supabase without a view or RPC.
  // We'll lean on the `user_id` uuid for now, or match it against a joined `profiles` table.
  const { data: loadouts } = await supabase
    .from("saved_loadouts")
    .select("*, profiles(email, role)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
       <div className="flex justify-between items-end border-b border-border pb-4">
         <div>
           <div className="flex items-center gap-3 mb-2 text-brand-text">
             <ShieldAlert className="w-6 h-6 text-brand-signal" />
             <h1 className="text-2xl font-mono uppercase tracking-widest font-bold">Protected Loadouts</h1>
           </div>
           <p className="text-[10px] text-brand-text/50 tracking-widest uppercase">Verified states stored by authenticated operators.</p>
         </div>
       </div>

       <div className="bg-brand-panel border border-border p-4 overflow-x-auto">
          <table className="w-full text-left font-mono">
             <thead>
                <tr className="border-b border-border text-[10px] text-brand-text/40 uppercase tracking-widest">
                   <th className="p-3">Date</th>
                   <th className="p-3">Designation / Name</th>
                   <th className="p-3">Operator ID / Link</th>
                   <th className="p-3">Items Configured</th>
                </tr>
             </thead>
             <tbody className="text-sm">
               {loadouts?.map((l) => (
                 <tr key={l.id} className="border-b border-border/50 hover:bg-brand-bg/50">
                    <td className="p-3 text-[10px] text-brand-text/50">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="p-3 text-brand-signal font-bold">{l.name}</td>
                    <td className="p-3">
                       <span className="text-[10px] text-brand-text/50 truncate block max-w-[150px]">
                         {l.user_id}
                       </span>
                    </td>
                    <td className="p-3">
                       <div className="text-[10px] text-brand-text/70 space-y-1">
                          {l.items_json.map((item: any, i: number) => (
                             <div key={i}><span className="text-brand-signal">{">"}</span> {item.quantity}x {item.unit.sku}</div>
                          ))}
                       </div>
                    </td>
                 </tr>
               ))}
               {(!loadouts || loadouts.length === 0) && (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-[10px] uppercase tracking-widest text-brand-text/30">
                       [ NO LOADOUTS SECURED ]
                    </td>
                 </tr>
               )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
