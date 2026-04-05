import { Terminal } from "lucide-react";
import { RecommendationWizard } from "@/components/recommend/recommendation-wizard";

export default function RecommendPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full pb-32">
       <div className="flex flex-col items-center justify-center text-center mb-12 border-b border-border pb-8">
         <Terminal className="w-12 h-12 text-brand-signal mb-4" />
         <div className="text-[10px] font-mono uppercase tracking-widest text-brand-signal/60 mb-2">
           {">"} SYSTEM STATUS: DIAGNOSTIC ENGINE ACTIVE
         </div>
         <h1 className="text-3xl font-mono uppercase tracking-widest font-bold text-brand-text mb-2">Automated Procurement Matrix</h1>
         <p className="font-mono text-sm uppercase tracking-widest text-brand-text/50 max-w-xl mx-auto">
           Provide operational parameters to receive deterministically ranked hardware topologies.
         </p>
       </div>

       <RecommendationWizard />
    </div>
  );
}
