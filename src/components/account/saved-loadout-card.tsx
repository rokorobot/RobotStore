"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SavedLoadoutCard({ loadout }: { loadout: any }) {
  const { replaceCart } = useCartStore();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const handleRestore = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    
    // Convert DB jsonb array back to Zustand array format
    replaceCart(loadout.items_json);
    router.push("/loadout");
  };

  const cancelRestore = () => setConfirming(false);

  return (
    <div className="border border-border bg-brand-panel p-6 font-mono flex flex-col justify-between gap-4 relative">
       <div>
         <h3 className="text-brand-signal font-bold uppercase tracking-widest mb-1">{loadout.name}</h3>
         <p className="text-[10px] text-brand-text/40 uppercase tracking-widest mb-4">
           {new Date(loadout.created_at).toLocaleString()}
         </p>
         
         <div className="space-y-1 text-xs text-brand-text/70">
           {loadout.items_json.map((item: any, i: number) => (
             <div key={i}>
                <span className="text-brand-signal mr-2">{">"}</span>
                {item.quantity}x {item.unit.sku}
             </div>
           ))}
         </div>
       </div>

       {confirming ? (
         <div className="bg-red-900/10 border border-red-500/30 p-4 mt-4 flex flex-col gap-3">
           <div className="flex items-start gap-2 text-red-500 text-[10px] uppercase tracking-widest">
             <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
             <span>Warning: Restoring this loadout will permanently overwrite your active cart state. Proceed?</span>
           </div>
           <div className="flex gap-2">
             <Button size="sm" onClick={handleRestore} className="bg-red-500 hover:bg-red-600 text-white rounded-none text-[10px] uppercase font-mono tracking-widest h-7 px-3">
               [ CONFIRM OVERWRITE ]
             </Button>
             <Button size="sm" variant="ghost" onClick={cancelRestore} className="text-brand-text/60 hover:text-brand-text rounded-none text-[10px] uppercase font-mono tracking-widest h-7 px-3">
               CANCEL
             </Button>
           </div>
         </div>
       ) : (
         <Button 
           onClick={handleRestore}
           variant="outline" 
           className="w-full sm:w-auto border-brand-signal/50 text-brand-signal hover:bg-brand-signal/10 rounded-none uppercase font-mono tracking-widest text-xs bg-brand-bg flex items-center justify-center gap-2 mt-4 self-start"
         >
           <Download className="w-3 h-3" />
           [ RESTORE TO LOADOUT ]
         </Button>
       )}
    </div>
  );
}
