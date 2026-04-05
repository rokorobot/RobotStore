"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/account`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess("Terminal protocol registered. Check your comms (email) to verify clearance.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-brand-signal/10 border border-brand-signal/30 text-brand-signal text-sm font-mono text-center">
        {success}
      </div>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4 font-mono">
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
          placeholder="new.operator@sys.com"
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
        {isLoading ? "[ GENERATING... ]" : "[ REGISTER OPERATOR ]"}
      </Button>
    </form>
  );
}
