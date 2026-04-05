import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

export function GenericArrayEditor({ title, items, onChange }: { title: string, items: string[], onChange: (val: string[]) => void }) {
  const [newValue, setNewValue] = useState("");

  const addItem = () => {
    if (newValue.trim()) {
      onChange([...items, newValue.trim()]);
      setNewValue("");
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-border bg-brand-panel p-4 flex flex-col font-mono">
       <div className="text-[10px] uppercase tracking-widest text-brand-text/50 mb-3 border-b border-border pb-2">{title} Array</div>
       
       <div className="space-y-2 mb-4 flex-1">
         {items.map((item, i) => (
           <div key={i} className="flex gap-2 items-start text-xs border border-border/50 bg-brand-bg p-2 group">
             <span className="text-brand-signal mt-0.5">{">"}</span>
             <span className="flex-1 break-words">{item}</span>
             <button type="button" onClick={() => removeItem(i)} className="text-brand-text/30 group-hover:text-red-500">
               <X className="w-3 h-3" />
             </button>
           </div>
         ))}
         {items.length === 0 && (
           <div className="text-xs text-brand-text/30 italic">No nodes present.</div>
         )}
       </div>

       <div className="flex gap-2 mt-auto pt-2">
         <Input 
           value={newValue}
           onChange={(e) => setNewValue(e.target.value)}
           placeholder="Add string..."
           className="bg-brand-bg border-border text-xs h-8"
           onKeyDown={(e) => {
             if (e.key === "Enter") {
               e.preventDefault();
               addItem();
             }
           }}
         />
         <Button type="button" onClick={addItem} variant="outline" size="sm" className="border-brand-text/30 rounded-none uppercase text-[10px] h-8 px-2">
           <Plus className="w-3 h-3" />
         </Button>
       </div>
    </div>
  );
}
