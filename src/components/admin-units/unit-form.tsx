"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogClassRow, CatalogBrandRow } from "@/types/catalog";
import { UnitImageManager } from "./unit-image-manager";
import { GenericArrayEditor } from "./generic-array-editor";
import { UnitSpecsEditor } from "./unit-specs-editor";

const PURCHASE_MODES = ["buy_now", "partner_quote", "waitlist", "inquiry_only", "affiliate"];

export function UnitForm({ initialData, classOptions, brandOptions, isEdit = false }: {
  initialData: any, 
  classOptions: CatalogClassRow[], 
  brandOptions: CatalogBrandRow[], 
  isEdit?: boolean
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    slug: initialData.slug || "",
    sku: initialData.sku || "",
    name: initialData.name || "",
    subtitle: initialData.subtitle || "",
    class_id: initialData.class_id || (classOptions[0]?.id ?? ""),
    brand_id: initialData.brand_id || null,
    description: initialData.description || "",
    short_description: initialData.short_description || "",
    currency: initialData.currency || "USD",
    price_cents: initialData.price_cents || "",
    purchase_mode: initialData.purchase_mode || "partner_quote",
    status: initialData.status || "available",
    featured: initialData.featured || false,
    stripe_price_id: initialData.stripe_price_id || "",
    images: initialData.images || ["/images/units/placeholder.jpg"],
    specs: initialData.specs || {},
    capabilities: initialData.capabilities || [],
    behavioral_profile: initialData.behavioral_profile || [],
    deployment_fit: initialData.deployment_fit || [],
    is_archived: initialData.is_archived || false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
         ...formData,
         price_cents: formData.price_cents ? parseInt(formData.price_cents, 10) : null,
      };

      const endpoint = isEdit ? `/api/admin/units/${initialData.id}` : "/api/admin/units";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to preserve configuration");

      router.push("/admin/units");
      router.refresh();

    } catch(err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-mono text-brand-text">
       {error && <div className="p-3 border border-red-500/50 bg-red-900/20 text-red-500 text-xs">[ERROR] {error}</div>}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
             <div className="text-brand-signal uppercase tracking-widest text-[10px] mb-2 border-b border-border pb-1">Core Identification</div>
             
             <div className="space-y-1">
               <label className="text-[10px] uppercase tracking-widest text-brand-text/50">Full Designation (Name) *</label>
               <Input required value={formData.name} onChange={e => handleChange("name", e.target.value)} className="bg-brand-panel border-border" />
             </div>
             
             <div className="flex gap-4">
               <div className="space-y-1 flex-1">
                 <label className="text-[10px] uppercase tracking-widest text-brand-text/50">SKU Reference *</label>
                 <Input required value={formData.sku} onChange={e => handleChange("sku", e.target.value)} className="bg-brand-panel border-border" />
               </div>
               <div className="space-y-1 flex-1">
                 <label className="text-[10px] uppercase tracking-widest text-brand-text/50">URL Slug *</label>
                 <Input required value={formData.slug} onChange={e => handleChange("slug", e.target.value)} className="bg-brand-panel border-border" />
               </div>
             </div>

             <div className="space-y-1">
               <label className="text-[10px] uppercase tracking-widest text-brand-text/50">Subtitle</label>
               <Input required value={formData.subtitle} onChange={e => handleChange("subtitle", e.target.value)} className="bg-brand-panel border-border" />
             </div>

             <div className="flex gap-4">
               <div className="space-y-1 flex-1">
                 <label className="text-[10px] uppercase tracking-widest text-brand-text/50">Taxonomy Class *</label>
                 <select required value={formData.class_id} onChange={e => handleChange("class_id", e.target.value)} className="w-full flex h-10 w-full items-center justify-between bg-brand-panel border border-border px-3 py-2 text-sm">
                   {classOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="text-brand-signal uppercase tracking-widest text-[10px] mb-2 border-b border-border pb-1">Acquisition Rules</div>
             
             <div className="space-y-1">
               <label className="text-[10px] uppercase tracking-widest text-brand-text/50">Purchase Mode *</label>
               <select required value={formData.purchase_mode} onChange={e => handleChange("purchase_mode", e.target.value)} className="w-full flex h-10 w-full items-center justify-between bg-brand-panel border border-border px-3 py-2 text-sm uppercase">
                 {PURCHASE_MODES.map(pm => <option key={pm} value={pm}>{pm.replace('_', ' ')}</option>)}
               </select>
             </div>

             {formData.purchase_mode === "buy_now" && (
                <div className="p-4 border border-brand-signal/30 bg-brand-signal/5 flex flex-col gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-brand-signal">Price Cents (ex: 50000 = $500.00)</label>
                     <Input type="number" required value={formData.price_cents} onChange={e => handleChange("price_cents", e.target.value)} className="bg-brand-panel border-border" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-brand-signal">Stripe Price ID</label>
                     <Input required value={formData.stripe_price_id} onChange={e => handleChange("stripe_price_id", e.target.value)} className="bg-brand-panel border-border" placeholder="price_1xxxxxx" />
                   </div>
                </div>
             )}

             <div className="flex gap-4">
                <div className="space-y-1 flex-1">
                  <label className="text-[10px] uppercase tracking-widest text-brand-text/50">Stock Status</label>
                  <Input required value={formData.status} onChange={e => handleChange("status", e.target.value)} className="bg-brand-panel border-border" />
                </div>
                <div className="flex items-center gap-2 flex-1 mt-4">
                   <input type="checkbox" checked={formData.featured} onChange={e => handleChange("featured", e.target.checked)} className="bg-brand-bg border-border" />
                   <label className="text-xs uppercase tracking-widest">Featured Unit</label>
                </div>
                <div className="flex items-center gap-2 flex-1 mt-4">
                   <input type="checkbox" checked={formData.is_archived} onChange={e => handleChange("is_archived", e.target.checked)} className="bg-brand-bg border-border" />
                   <label className="text-xs uppercase tracking-widest text-red-500">Archived</label>
                </div>
             </div>
          </div>
       </div>

       <div className="space-y-4">
         <div className="text-brand-signal uppercase tracking-widest text-[10px] mb-2 border-b border-border pb-1">Media Assets</div>
         <UnitImageManager images={formData.images} onChange={(val: string[]) => handleChange("images", val)} />
       </div>

       <div className="space-y-4">
          <div className="text-brand-signal uppercase tracking-widest text-[10px] mb-2 border-b border-border pb-1">Descriptive Data</div>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-brand-text/50">Short Summary</label>
            <Input required value={formData.short_description} onChange={e => handleChange("short_description", e.target.value)} className="bg-brand-panel border-border" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-brand-text/50">Long Description</label>
            <textarea required value={formData.description} onChange={e => handleChange("description", e.target.value)} className="w-full flex min-h-[120px] bg-brand-panel px-3 py-2 text-sm border-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-signal" />
          </div>
       </div>

       <div className="space-y-4">
          <div className="text-brand-signal uppercase tracking-widest text-[10px] mb-2 border-b border-border pb-1">Technical Spec-Sheet</div>
          <UnitSpecsEditor specs={formData.specs} onChange={(val: Record<string, string>) => handleChange("specs", val)} />
       </div>

       <div className="space-y-4">
          <div className="text-brand-signal uppercase tracking-widest text-[10px] mb-2 border-b border-border pb-1">System Arrays</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <GenericArrayEditor title="Capabilities" items={formData.capabilities} onChange={(val: string[]) => handleChange("capabilities", val)} />
             <GenericArrayEditor title="Behavioral Profile" items={formData.behavioral_profile} onChange={(val: string[]) => handleChange("behavioral_profile", val)} />
             <GenericArrayEditor title="Deployment Fit" items={formData.deployment_fit} onChange={(val: string[]) => handleChange("deployment_fit", val)} />
          </div>
       </div>

       <div className="border-t border-border pt-6 flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-brand-signal hover:bg-brand-signal-soft text-brand-bg rounded-none uppercase font-mono tracking-widest px-8">
            {isLoading ? "[ SYNCING ]" : isEdit ? "[ UPDATE HARDWARE CONFIG ]" : "[ COMPILE TO DB ]"}
          </Button>
       </div>

    </form>
  );
}
