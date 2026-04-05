import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Terminal, Clock, FileText } from "lucide-react";

export default async function QuotesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: quotes, error } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-screen pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex items-center gap-3 mb-12 border-b border-border pb-6">
        <Terminal className="w-6 h-6 text-brand-signal" />
        <h1 className="text-3xl font-bold font-mono tracking-widest uppercase text-brand-text">Active Bids & RFQs</h1>
      </div>

      {(!quotes || quotes.length === 0) ? (
        <div className="border border-dashed border-border bg-brand-panel p-12 text-center text-brand-text/50 font-mono text-sm uppercase tracking-widest">
          [ NO ACTIVE QUOTE REQUESTS LOGGED ]
        </div>
      ) : (
        <div className="grid gap-6">
          {quotes.map((quote: any) => (
            <div key={quote.id} className="border border-border bg-brand-panel p-6 font-mono flex flex-col md:flex-row justify-between gap-6">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-4 h-4 text-brand-signal" />
                    <span className="font-bold text-brand-text/80">REQ_ID: {quote.id.split('-')[0]}</span>
                    <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest ${quote.status === 'waitlist' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30' : 'bg-brand-signal/10 text-brand-signal border border-brand-signal/30'}`}>
                      {quote.status}
                    </span>
                  </div>
                  <div className="text-brand-text/50 text-xs mb-4">
                     Targets: {quote.unit_id}
                  </div>
                  <div className="text-xs text-brand-text/70 bg-brand-bg p-3 border border-border">
                     {quote.message}
                  </div>
               </div>
               
               <div className="flex items-start md:items-end flex-col gap-1 text-[10px] text-brand-text/40 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                     <Clock className="w-3 h-3" />
                     {new Date(quote.created_at).toLocaleDateString()}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
