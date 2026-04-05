"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSignOut}
      className="border-brand-text/30 text-brand-text hover:bg-brand-text/10 rounded-none uppercase font-mono tracking-widest text-xs h-8 px-3"
    >
      <LogOut className="w-3 h-3 mr-2" />
      [ DISCONNECT ]
    </Button>
  );
}
