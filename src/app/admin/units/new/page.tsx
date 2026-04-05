import { requireAdminPage } from "@/lib/auth/require-admin";
import { UnitForm } from "@/components/admin-units/unit-form";
import { getAdminClasses, getAdminBrands } from "@/lib/catalog/queries";

export default async function NewUnitPage() {
  await requireAdminPage();
  const classes = await getAdminClasses();
  const brands = await getAdminBrands();

  return (
    <div className="max-w-5xl mx-auto pb-32">
       <div className="mb-8 border-b border-border pb-4">
         <h1 className="text-2xl font-mono uppercase tracking-widest font-bold text-brand-text">Compile New Unit</h1>
         <p className="text-xs font-mono text-brand-text/50 uppercase tracking-widest">
           Inject new hardware configuration into active database.
         </p>
       </div>
       <UnitForm initialData={{}} classOptions={classes} brandOptions={brands} />
    </div>
  );
}
