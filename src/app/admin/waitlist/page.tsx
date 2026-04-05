import { requireAdminPage } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { Activity } from "lucide-react";

export default async function AdminWaitlistPage() {
  await requireAdminPage();
  const supabase = await createClient();

  const { data: waitlist } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("status", "waitlist")
    .order("created_at", { ascending: true }); // Oldest first for queue order

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
       <div className="flex justify-between items-end border-b border-border pb-4">
         <div>
           <div className="flex items-center gap-3 mb-2 text-brand-text">
             <Activity className="w-6 h-6 text-brand-signal" />
             <h1 className="text-2xl font-mono uppercase tracking-widest font-bold">Hardware Waitlists</h1>
           </div>
           <p className="text-[10px] text-brand-text/50 tracking-widest uppercase">Ordered chronologically by submission time.</p>
         </div>
       </div>

       <div className="bg-brand-panel border border-border p-4 overflow-x-auto">
          <table className="w-full text-left font-mono">
             <thead>
                <tr className="border-b border-border text-[10px] text-brand-text/40 uppercase tracking-widest">
                   <th className="p-3">Queue Position</th>
                   <th className="p-3">Date Entered</th>
                   <th className="p-3">Target Node</th>
                   <th className="p-3">Entity Contact</th>
                   <th className="p-3">User Record</th>
                </tr>
             </thead>
             <tbody className="text-sm">
               {waitlist?.map((w, index) => (
                 <tr key={w.id} className="border-b border-border/50 hover:bg-brand-bg/50">
                    <td className="p-3 text-orange-500 font-bold"># {index + 1}</td>
                    <td className="p-3 text-[10px] text-brand-text/50">{new Date(w.created_at).toLocaleString()}</td>
                    <td className="p-3 text-brand-signal font-bold">{w.unit_id}</td>
                    <td className="p-3">
                      <div className="text-[10px] text-brand-text/80">{w.email}</div>
                    </td>
                    <td className="p-3 text-[10px] text-brand-text/30">
                       {w.user_id ? w.user_id.split('-')[0] + "..." : "N/A"}
                    </td>
                 </tr>
               ))}
               {(!waitlist || waitlist.length === 0) && (
                 <tr>
                    <td colSpan={5} className="p-8 text-center text-[10px] uppercase tracking-widest text-brand-text/30">
                       [ QUEUE EMPTY ]
                    </td>
                 </tr>
               )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
