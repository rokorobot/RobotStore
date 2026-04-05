import { requireAdminPage } from "@/lib/auth/require-admin";
import { getAdminUnitById, getAdminClasses, getAdminBrands } from "@/lib/catalog/queries";
import { UnitForm } from "@/components/admin-units/unit-form";
import { notFound } from "next/navigation";

export default async function EditUnitPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  
  const [unit, classes, brands] = await Promise.all([
    getAdminUnitById(id),
    getAdminClasses(),
    getAdminBrands()
  ]);

  if (!unit) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto pb-32">
       <div className="mb-8 border-b border-border pb-4">
         <h1 className="text-2xl font-mono uppercase tracking-widest font-bold text-brand-text">Reconfigure Hardware</h1>
         <p className="text-xs font-mono text-brand-text/50 uppercase tracking-widest">
           Editing asset designation: {unit.sku}
         </p>
       </div>
       <UnitForm initialData={unit} classOptions={classes} brandOptions={brands} isEdit />
    </div>
  );
}
