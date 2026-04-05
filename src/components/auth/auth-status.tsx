import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Terminal } from "lucide-react";

export async function AuthStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return (
      <Link href="/account" className="flex items-center gap-2 text-brand-signal hover:text-brand-signal-soft transition-colors text-xs font-mono tracking-widest">
        <Terminal className="w-4 h-4" />
        <span className="hidden sm:inline">[ SYS_OP_ACTIVE ]</span>
      </Link>
    );
  }

  return (
    <Link href="/auth/sign-in" className="text-brand-text/70 hover:text-brand-signal transition-colors text-xs font-mono tracking-widest uppercase">
      [ INITIATE CONNECTION ]
    </Link>
  );
}
