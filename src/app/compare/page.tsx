"use client";

import { useCompareStore } from "@/store/compare-store";
import { Scale, X, ArrowRight, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ComparePage() {
  const { units, removeUnit, clearCompare } = useCompareStore();

  // Aggregate all unique spec keys across all compared units
  const allSpecKeys = Array.from(new Set(units.flatMap(u => Object.keys(u.specs))));
  
  if (units.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <Scale className="w-16 h-16 text-brand-text/20" />
        <h1 className="text-2xl font-mono uppercase tracking-widest font-bold text-brand-text">Comparison Matrix Empty</h1>
        <p className="font-mono text-sm uppercase tracking-widest text-brand-text/50">Select nodes from the catalog to initiate comparative analysis.</p>
        <Link href="/units">
          <Button variant="outline" className="mt-4 rounded-none border-brand-signal text-brand-signal font-mono uppercase tracking-widest hover:bg-brand-signal/10">
             [ ACCESS CATALOG ]
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full pb-32">
       <div className="flex justify-between items-end border-b border-border pb-6 mb-8">
         <div>
           <div className="text-[10px] uppercase tracking-widest text-brand-signal/60 mb-1">
             {'>'} SYSTEM STATE: COMPARATIVE ANALYSIS ACTIVE
           </div>
           <div className="flex items-center gap-3 mb-1 text-brand-text">
             <Scale className="w-6 h-6 text-brand-signal" />
             <h1 className="text-3xl font-mono uppercase tracking-widest font-bold">Comparative Matrix</h1>
           </div>
           <p className="text-xs font-mono text-brand-text/50 uppercase tracking-widest">
             Cross-analyzing {units.length} / 4 nodes. Identify top candidate, then act.
           </p>
         </div>
         <Button onClick={clearCompare} variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-500 font-mono text-[10px] uppercase tracking-widest rounded-none">
           [ PURGE MATRIX ]
         </Button>
       </div>

       <div className="overflow-x-auto border border-border bg-brand-panel">
         <table className="w-full text-left font-mono">
            {/* Header Row */}
            <thead>
               <tr className="border-b border-border">
                 <th className="p-4 w-48 bg-brand-bg/50 text-[10px] uppercase tracking-widest text-brand-text/50 border-r border-border">Core Node</th>
                 {units.map(u => (
                   <th key={u.id} className="p-4 min-w-[250px] relative group align-top border-r border-border last:border-0 hover:bg-brand-bg/30 transition-colors">
                     <button onClick={() => removeUnit(u.id)} className="absolute top-2 right-2 text-brand-text/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                       <X className="w-4 h-4" />
                     </button>
                     <img src={u.images[0]} alt={u.name} className="w-full h-32 object-cover mb-4 opacity-70 group-hover:opacity-100 transition-opacity border border-border" />
                     <div className="text-[10px] text-brand-signal uppercase tracking-widest mb-1">{u.sku}</div>
                     <div className="text-lg font-bold mb-1 truncate">{u.name}</div>
                     <div className="text-[10px] text-brand-text/50 uppercase tracking-widest mb-4 truncate">{u.subtitle}</div>
                     
                     <div className="text-xl font-bold text-brand-text mb-4">
                       {u.priceCents ? `$${(u.priceCents / 100).toLocaleString()}` : 'QUOTE/BID'}
                     </div>

                     <Link href={`/units/${u.slug}`}>
                        <Button variant="outline" className="w-full text-[10px] uppercase tracking-widest rounded-none border-brand-signal/50 text-brand-signal hover:bg-brand-signal/10">
                          [ INSPECT NODE ]
                        </Button>
                     </Link>
                   </th>
                 ))}
               </tr>
            </thead>
            <tbody className="text-sm">
               
               {/* Taxonomy Row */}
               <tr className="border-b border-border/50">
                  <td className="p-4 text-[10px] uppercase tracking-widest text-brand-text/50 bg-brand-bg/50 border-r border-border sticky left-0 z-10">Taxonomy Class</td>
                  {units.map(u => (
                    <td key={u.id} className="p-4 border-r border-border text-brand-signal text-xs">{u.classSlug.replace('-', ' ')}</td>
                  ))}
               </tr>
               
               {/* Acquisition Row */}
               <tr className="border-b border-border/50">
                  <td className="p-4 text-[10px] uppercase tracking-widest text-brand-text/50 bg-brand-bg/50 border-r border-border sticky left-0 z-10">Acquisition Mode</td>
                  {units.map(u => (
                    <td key={u.id} className="p-4 border-r border-border text-xs uppercase tracking-widest">{u.purchaseMode.replace('_', ' ')}</td>
                  ))}
               </tr>

               {/* Specs Rows */}
               {allSpecKeys.map(specKey => (
                 <tr key={specKey} className="border-b border-border/30 hover:bg-brand-bg/50 transition-colors">
                    <td className="p-4 text-[10px] uppercase tracking-widest text-brand-text/50 bg-brand-bg/50 border-r border-border sticky left-0 z-10">{specKey}</td>
                    {units.map(u => (
                      <td key={u.id} className="p-4 border-r border-border text-xs text-brand-text/80">
                         {(u.specs as any)[specKey] || <span className="text-brand-text/20">—</span>}
                      </td>
                    ))}
                 </tr>
               ))}

               {/* Capabilities Array */}
               <tr className="border-b border-border/30 hover:bg-brand-bg/50 transition-colors">
                  <td className="p-4 text-[10px] uppercase tracking-widest text-brand-text/50 bg-brand-bg/50 border-r border-border align-top sticky left-0 z-10">Core Capabilities</td>
                  {units.map(u => (
                    <td key={u.id} className="p-4 border-r border-border text-[10px] align-top space-y-2">
                       {u.capabilities.map((cap, i) => (
                         <div key={i} className="flex gap-2 text-brand-text/70"><CheckCircle className="w-3 h-3 text-brand-signal shrink-0 mt-0.5" /> <span className="leading-tight">{cap}</span></div>
                       ))}
                       {u.capabilities.length === 0 && <span className="text-brand-text/20">—</span>}
                    </td>
                  ))}
               </tr>

               {/* Deployment Fit Array */}
               <tr className="border-b border-border/30 hover:bg-brand-bg/50 transition-colors">
                  <td className="p-4 text-[10px] uppercase tracking-widest text-brand-text/50 bg-brand-bg/50 border-r border-border align-top sticky left-0 z-10">Deployment Fit</td>
                  {units.map(u => (
                    <td key={u.id} className="p-4 border-r border-border text-[10px] align-top space-y-2">
                       {u.deploymentFit.map((fit, i) => (
                         <div key={i} className="flex gap-2 text-brand-text/70"><Zap className="w-3 h-3 text-brand-signal shrink-0 mt-0.5" /> <span className="leading-tight">{fit}</span></div>
                       ))}
                       {u.deploymentFit.length === 0 && <span className="text-brand-text/20">—</span>}
                    </td>
                  ))}
               </tr>

            </tbody>
         </table>
       </div>

       {/* Post-matrix decision CTA */}
       <div className="mt-8 flex flex-col sm:flex-row gap-4 border border-border bg-brand-panel p-4 items-center justify-between">
         <div className="font-mono text-[10px] uppercase tracking-widest text-brand-text/50">
           {'>'} Decision reached? Move selected node to your deployment loadout.
         </div>
         <Link href="/loadout">
           <Button className="bg-brand-signal text-brand-bg hover:bg-brand-signal-soft rounded-none uppercase font-mono tracking-widest text-xs press-feedback whitespace-nowrap">
             [ PROCEED TO LOADOUT ]
           </Button>
         </Link>
       </div>
    </div>
  );
}
