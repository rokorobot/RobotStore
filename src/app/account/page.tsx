import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Terminal } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import Link from "next/link";

export default async function AccountPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/sign-in");
  }

  // Fetch optional profile metadata securely here
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return (
    <div className="flex flex-col min-h-screen pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-border pb-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <Terminal className="w-6 h-6 text-brand-signal" />
             <h1 className="text-3xl font-bold font-mono tracking-widest uppercase text-brand-text">Terminal State</h1>
           </div>
          <p className="text-brand-text/50 font-mono text-sm max-w-xl">
            Operator profile and system configuration metrics.
          </p>
          <div className="flex gap-4 mt-4 font-mono text-xs uppercase tracking-widest">
            <Link href="/account/quotes" className="text-brand-signal hover:underline">[ BIDS & RFQs ]</Link>
            <Link href="/account/loadouts" className="text-brand-signal hover:underline">[ PRESERVED LOADOUTS ]</Link>
          </div>
        </div>
        <SignOutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-border bg-brand-panel p-6 font-mono">
          <h2 className="text-brand-signal uppercase tracking-widest text-sm mb-4 border-b border-border pb-2">Active Designation</h2>
          <div className="space-y-4">
            <div>
              <span className="text-brand-text/50 text-xs uppercase block">User ID</span>
              <span className="text-brand-text">{data.user.id}</span>
            </div>
            <div>
              <span className="text-brand-text/50 text-xs uppercase block">Email Link</span>
              <span className="text-brand-text">{data.user.email}</span>
            </div>
            <div>
              <span className="text-brand-text/50 text-xs uppercase block">Role Config</span>
              <span className="text-brand-text">{profile?.role || "standard_operator"}</span>
            </div>
          </div>
        </div>

        <div className="border border-border bg-brand-panel p-6 font-mono">
           <h2 className="text-brand-signal uppercase tracking-widest text-sm mb-4 border-b border-border pb-2">System Telemetry</h2>
           <div className="space-y-2 text-sm text-brand-text/60">
             <p>[ No pending active deployments ]</p>
             <p>[ Quote queue empty ]</p>
           </div>
        </div>
      </div>
    </div>
  );
}
