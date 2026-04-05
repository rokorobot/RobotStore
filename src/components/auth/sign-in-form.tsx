"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    
    // We are trusting that we have Supabase set up. 
    // Usually signInWithPassword works cleanly.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/account");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4 font-mono">
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-500 text-xs">
          [ERROR]: {error}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-xs text-brand-text/70 uppercase">Designation (Email)</label>
        <Input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-brand-bg border-brand-signal/20 text-brand-text rounded-none focus-visible:ring-brand-signal"
          placeholder="operator@sys.com"
          required 
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-brand-text/70 uppercase">Passkey</label>
        <Input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-brand-bg border-brand-signal/20 text-brand-text rounded-none focus-visible:ring-brand-signal"
          placeholder="••••••••"
          required 
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-brand-signal hover:bg-brand-signal-soft text-brand-bg rounded-none uppercase tracking-widest mt-4"
      >
        {isLoading ? "[ AUTHENTICATING... ]" : "[ INITIATE SESSION ]"}
      </Button>
    </form>
  );
}
