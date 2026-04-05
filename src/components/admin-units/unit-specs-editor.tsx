import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

export function UnitSpecsEditor({ specs, onChange }: { specs: Record<string, string>, onChange: (s: Record<string, string>) => void }) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addSpec = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange({ ...specs, [newKey.trim()]: newValue.trim() });
      setNewKey("");
      setNewValue("");
    }
  };

  const removeSpec = (k: string) => {
    const next = { ...specs };
    delete next[k];
    onChange(next);
  };

  return (
    <div className="space-y-4 font-mono text-sm max-w-2xl">
      <div className="grid grid-cols-2 gap-2 mb-2">
        {Object.entries(specs).map(([k, v]) => (
          <div key={k} className="border border-border bg-brand-bg p-2 flex justify-between group">
             <div>
               <div className="text-[10px] uppercase text-brand-text/50 tracking-widest">{k}</div>
               <div className="text-xs">{v}</div>
             </div>
             <button type="button" onClick={() => removeSpec(k)} className="text-brand-text/30 group-hover:text-red-500">
               <X className="w-4 h-4" />
             </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input 
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="ex: Autonomy Level"
          className="bg-brand-panel border-border"
        />
        <Input 
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="ex: Level 4"
          className="bg-brand-panel border-border"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSpec();
            }
          }}
        />
        <Button type="button" onClick={addSpec} variant="outline" className="border-brand-text/30 rounded-none uppercase text-xs whitespace-nowrap">
          <Plus className="w-3 h-3 mr-2" /> [ ADD KV MAP ]
        </Button>
      </div>
    </div>
  );
}
