import { ShieldCheck } from "lucide-react";
import { getPublicUnits } from "@/lib/catalog/queries";
import { UnitsGrid } from "@/components/units-grid";

export default async function UnitsPage() {
  const units = await getPublicUnits();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-border pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 text-brand-text">
             <ShieldCheck className="w-8 h-8 text-brand-signal" />
             <h1 className="text-3xl font-mono uppercase tracking-widest font-bold">Available Systems</h1>
          </div>
          <p className="font-mono text-sm uppercase tracking-widest text-brand-text/50">
            Select an operational chassis to review full specifications.
          </p>
        </div>
      </div>

      <UnitsGrid units={units} />
    </div>
  );
}
