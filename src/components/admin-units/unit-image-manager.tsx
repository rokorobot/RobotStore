import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

export function UnitImageManager({ images, onChange }: { images: string[], onChange: (imgs: string[]) => void }) {
  const [newUrl, setNewUrl] = useState("");

  const addImage = () => {
    if (newUrl.trim()) {
      onChange([...images, newUrl.trim()]);
      setNewUrl("");
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="flex flex-wrap gap-4">
         {images.map((img, i) => (
           <div key={i} className="relative group border border-border w-32 h-32 flex items-center justify-center bg-brand-panel p-2">
              <img src={img} alt={`Asset ${i}`} className="w-full h-full object-contain opacity-50 relative z-10" />
              <button 
                 type="button"
                 onClick={() => removeImage(i)}
                 className="absolute top-1 right-1 z-20 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 z-20 text-[8px] uppercase tracking-widest text-brand-text/50 truncate w-full pr-2">
                 str:{i}
              </div>
           </div>
         ))}
      </div>

      <div className="flex gap-2 isolate">
        <Input 
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="/images/units/placeholder.jpg"
          className="bg-brand-panel border-border max-w-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addImage();
            }
          }}
        />
        <Button type="button" onClick={addImage} variant="outline" className="border-brand-text/30 rounded-none uppercase text-xs">
          <Plus className="w-3 h-3 mr-2" /> [ ADD ASSET URL ]
        </Button>
      </div>
    </div>
  );
}
