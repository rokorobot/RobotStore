import { requireAdminPage } from "@/lib/auth/require-admin";
import { getAdminUnits } from "@/lib/catalog/queries";
import Link from "next/link";
import { Plus, Box, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminUnitsPage() {
  await requireAdminPage();
  const units = await getAdminUnits();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
       <div className="flex justify-between items-end border-b border-border pb-4">
         <div>
           <div className="flex items-center gap-3 mb-2 text-brand-text">
             <Box className="w-6 h-6 text-brand-signal" />
             <h1 className="text-2xl font-mono uppercase tracking-widest font-bold">Units Database</h1>
           </div>
           <p className="text-xs font-mono text-brand-text/50 uppercase tracking-widest">
             {units.length} total nodes indexed
           </p>
         </div>
         <Link href="/admin/units/new" className="border border-brand-signal/50 text-brand-signal hover:bg-brand-signal/10 rounded-none uppercase font-mono tracking-widest font-semibold bg-brand-bg px-4 py-2 text-xs flex items-center justify-center gap-2">
           <Plus className="w-3 h-3" /> [ COMPILE NEW UNIT ]
         </Link>
       </div>

       <div className="bg-brand-panel border border-border p-4 overflow-x-auto">
          <table className="w-full text-left font-mono">
             <thead>
                <tr className="border-b border-border text-[10px] text-brand-text/40 uppercase tracking-widest">
                   <th className="p-3">SKU</th>
                   <th className="p-3">Designation</th>
                   <th className="p-3">Acquisition Path</th>
                   <th className="p-3">State</th>
                   <th className="p-3">Updated</th>
                   <th className="p-3 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="text-sm">
               {units.map((unit) => (
                 <tr key={unit.id} className={`border-b border-border/50 hover:bg-brand-bg/50 transition-colors ${unit.is_archived ? 'opacity-50' : ''}`}>
                    <td className="p-3 text-brand-text/70">{unit.sku}</td>
                    <td className="p-3 font-bold">{unit.name}</td>
                    <td className="p-3">
                       <span className="text-[10px] uppercase tracking-widest border border-brand-signal/20 px-2 py-0.5 text-brand-signal">
                          {unit.purchase_mode.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="p-3">
                       <Badge variant="outline" className={`rounded-none text-[10px] uppercase tracking-widest ${unit.is_archived ? 'border-red-500/50 text-red-500' : 'border-brand-text/50 text-brand-text'}`}>
                         {unit.is_archived ? 'Archived' : unit.status}
                       </Badge>
                    </td>
                    <td className="p-3 text-[10px] text-brand-text/40">
                       {new Date(unit.updated_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                       <Link href={`/admin/units/${unit.id}`} className="text-xs text-brand-signal hover:underline">
                         [ EDIT ]
                       </Link>
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}
