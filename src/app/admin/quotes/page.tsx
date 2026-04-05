import { requireAdminPage } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";

export default async function AdminQuotesPage() {
  await requireAdminPage();
  const supabase = await createClient();

  // Fetch RFQs excluding waitlist
  const { data: quotes } = await supabase
    .from("quote_requests")
    .select("*")
    .neq("status", "waitlist")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
       <div className="flex justify-between items-end border-b border-border pb-4">
         <div>
           <div className="flex items-center gap-3 mb-2 text-brand-text">
             <Search className="w-6 h-6 text-brand-signal" />
             <h1 className="text-2xl font-mono uppercase tracking-widest font-bold">RFQ & Bids Queue</h1>
           </div>
         </div>
       </div>

       <div className="bg-brand-panel border border-border p-4 overflow-x-auto">
          <table className="w-full text-left font-mono">
             <thead>
                <tr className="border-b border-border text-[10px] text-brand-text/40 uppercase tracking-widest">
                   <th className="p-3">Date</th>
                   <th className="p-3">Unit</th>
                   <th className="p-3">Operator</th>
                   <th className="p-3">Company</th>
                   <th className="p-3">Message</th>
                   <th className="p-3">Auth</th>
                </tr>
             </thead>
             <tbody className="text-sm">
               {quotes?.map((q) => (
                 <tr key={q.id} className="border-b border-border/50 hover:bg-brand-bg/50">
                    <td className="p-3 text-[10px] text-brand-text/50">{new Date(q.created_at).toLocaleString()}</td>
                    <td className="p-3 text-brand-signal">{q.unit_id}</td>
                    <td className="p-3">
                      <div>{q.name}</div>
                      <div className="text-[10px] text-brand-text/50">{q.email}</div>
                    </td>
                    <td className="p-3 text-brand-text/70">{q.company || "N/A"}</td>
                    <td className="p-3 text-[10px] max-w-xs truncate text-brand-text/60">{q.message}</td>
                    <td className="p-3">
                       {q.user_id ? <span className="text-brand-signal border border-brand-signal/30 px-2 py-0.5 text-[10px]">VERIFIED</span> : <span className="text-brand-text/30 border border-brand-text/30 px-2 py-0.5 text-[10px]">ANONYMOUS</span>}
                    </td>
                 </tr>
               ))}
               {(!quotes || quotes.length === 0) && (
                 <tr>
                    <td colSpan={6} className="p-8 text-center text-[10px] uppercase tracking-widest text-brand-text/30">
                       [ NO RFQS LOGGED ]
                    </td>
                 </tr>
               )}
             </tbody>
          </table>
       </div>
    </div>
  );
}
