"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClassForm({ initialData = {} }: { initialData?: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    slug: initialData.slug || "",
    name: initialData.name || "",
    description: initialData.description || "",
    hero_text: initialData.hero_text || "",
    sort_order: initialData.sort_order || 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      router.refresh();
      setFormData({ slug: "", name: "", description: "", hero_text: "", sort_order: 0 });
    } catch(err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-mono">
      {error && <div className="p-2 border border-red-500/50 text-red-500 text-[10px]">[ERROR] {error}</div>}
      <Input required placeholder="slug (ex: labor-nodes)" value={formData.slug} onChange={e => setFormData(p => ({...p, slug: e.target.value}))} className="bg-brand-bg rounded-none text-brand-text" />
      <Input required placeholder="Name (ex: Labor Nodes)" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="bg-brand-bg rounded-none text-brand-text" />
      <Input required placeholder="Sort Order (0)" type="number" value={formData.sort_order} onChange={e => setFormData(p => ({...p, sort_order: parseInt(e.target.value)}))} className="bg-brand-bg rounded-none text-brand-text" />
      <textarea required placeholder="Description" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="w-full flex min-h-[60px] bg-brand-bg px-3 py-2 text-sm border border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-signal" />
      
      <Button type="submit" disabled={isLoading} className="w-full bg-brand-signal hover:bg-brand-signal-soft text-brand-bg rounded-none uppercase font-mono tracking-widest">
        {isLoading ? "[ SYNCING ]" : "[ CREATE CLASS ]"}
      </Button>
    </form>
  );
}
