import { requireAdminPage } from "@/lib/auth/require-admin";
import { getAdminBrands } from "@/lib/catalog/queries";
import { Copy, Plus } from "lucide-react";
import { BrandForm } from "@/components/admin-brands/brand-form";

export default async function AdminBrandsPage() {
  await requireAdminPage();
  const brands = await getAdminBrands();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
       <div className="flex justify-between items-end border-b border-border pb-4">
         <div>
           <div className="flex items-center gap-3 mb-2 text-brand-text">
             <Copy className="w-6 h-6 text-brand-signal" />
             <h1 className="text-2xl font-mono uppercase tracking-widest font-bold">Manufacturer Brands</h1>
           </div>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 bg-brand-panel border border-border p-6 h-fit">
             <h2 className="font-mono uppercase tracking-widest text-brand-signal mb-4 border-b border-border pb-2 text-xs">Register Manufacturer</h2>
             <BrandForm />
          </div>

          <div className="md:col-span-8 bg-brand-panel border border-border p-4">
            <table className="w-full text-left font-mono">
               <thead>
                  <tr className="border-b border-border text-[10px] text-brand-text/40 uppercase tracking-widest">
                     <th className="p-3">Slug (ID)</th>
                     <th className="p-3">Name</th>
                     <th className="p-3">Website</th>
                     <th className="p-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                 {brands.map((b) => (
                   <tr key={b.id} className="border-b border-border/50 hover:bg-brand-bg/50">
                      <td className="p-3 text-brand-signal">{b.slug}</td>
                      <td className="p-3 font-bold">{b.name}</td>
                      <td className="p-3 text-brand-text/50 text-xs">{b.website_url || "N/A"}</td>
                      <td className="p-3 text-right">
                         <span className="text-[10px] text-brand-text/30 uppercase tracking-widest">[ EDIT (COMING) ]</span>
                      </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
       </div>

    </div>
  );
}
