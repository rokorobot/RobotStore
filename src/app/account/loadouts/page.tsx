import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DatabaseZap } from "lucide-react";
import { SavedLoadoutCard } from "@/components/account/saved-loadout-card";

export default async function LoadoutsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: loadouts, error } = await supabase
    .from("saved_loadouts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-screen pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex items-center gap-3 mb-12 border-b border-border pb-6">
        <DatabaseZap className="w-6 h-6 text-brand-signal" />
        <h1 className="text-3xl font-bold font-mono tracking-widest uppercase text-brand-text">Historic Loadouts</h1>
      </div>

      {(!loadouts || loadouts.length === 0) ? (
        <div className="border border-dashed border-border bg-brand-panel p-12 text-center text-brand-text/50 font-mono text-sm uppercase tracking-widest">
          [ NO PRESERVED LOADOUTS FOUND ]
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadouts.map((loadout: any) => (
            <SavedLoadoutCard key={loadout.id} loadout={loadout} />
          ))}
        </div>
      )}
    </div>
  );
}
