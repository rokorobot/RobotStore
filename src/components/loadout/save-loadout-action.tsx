"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cart-store";
import { Save } from "lucide-react";

export function SaveLoadoutAction() {
  const { items } = useCartStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) setIsAuthenticated(true);
    };
    checkAuth();
  }, []);

  const handleSave = async () => {
    if (!items.length) return;
    setIsLoading(true);
    setSuccessMsg("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const payload = {
      user_id: user.id,
      name: `Loadout [${new Date().toISOString().split('T')[0]}]`,
      items_json: items.map(i => ({
        unit: i.unit,
        quantity: i.quantity
      }))
    };

    const { error } = await supabase.from('saved_loadouts').insert([payload]);

    setIsLoading(false);
    if (!error) {
      setSuccessMsg("[ LOADOUT STATE PRESERVED ]");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <div className="flex flex-col w-full">
      {successMsg ? (
        <div className="p-3 bg-brand-signal/10 border border-brand-signal text-brand-signal text-[10px] text-center font-mono uppercase tracking-widest">
          {successMsg}
        </div>
      ) : (
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          variant="outline" 
          className="w-full border-brand-text/30 text-brand-text hover:bg-brand-text/10 rounded-none uppercase font-mono tracking-widest text-[10px] bg-brand-bg flex items-center justify-center gap-2"
        >
          <Save className="w-3 h-3" />
          {isLoading ? "[ PRESERVING ]" : "[ PRESERVE CURRENT LOADOUT ]"}
        </Button>
      )}
    </div>
  );
}
