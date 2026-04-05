"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BrandForm({ initialData = {} }: { initialData?: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    slug: initialData.slug || "",
    name: initialData.name || "",
    website_url: initialData.website_url || "",
    logo_url: initialData.logo_url || "",
    short_description: initialData.short_description || ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      router.refresh();
      setFormData({ slug: "", name: "", website_url: "", logo_url: "", short_description: "" });
    } catch(err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-mono">
      {error && <div className="p-2 border border-red-500/50 text-red-500 text-[10px]">[ERROR] {error}</div>}
      <Input required placeholder="slug (ex: system-core)" value={formData.slug} onChange={e => setFormData(p => ({...p, slug: e.target.value}))} className="bg-brand-bg rounded-none text-brand-text" />
      <Input required placeholder="Name (ex: SystemCore)" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="bg-brand-bg rounded-none text-brand-text" />
      <Input placeholder="https://..." value={formData.website_url} onChange={e => setFormData(p => ({...p, website_url: e.target.value}))} className="bg-brand-bg rounded-none text-brand-text" />
      <Input placeholder="Logo URL" value={formData.logo_url} onChange={e => setFormData(p => ({...p, logo_url: e.target.value}))} className="bg-brand-bg rounded-none text-brand-text" />
      <textarea placeholder="Short Summary" value={formData.short_description} onChange={e => setFormData(p => ({...p, short_description: e.target.value}))} className="w-full flex min-h-[60px] bg-brand-bg px-3 py-2 text-sm border border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-signal" />
      
      <Button type="submit" disabled={isLoading} className="w-full bg-brand-signal hover:bg-brand-signal-soft text-brand-bg rounded-none uppercase font-mono tracking-widest">
        {isLoading ? "[ SYNCING ]" : "[ REGISTER BRAND ]"}
      </Button>
    </form>
  );
}
