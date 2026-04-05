import { notFound } from "next/navigation";
import { getPublicUnitBySlug } from "@/lib/catalog/queries";
import { Cpu, Terminal, ShieldAlert, CheckCircle, DatabaseZap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WaitlistForm } from "@/components/quotes/waitlist-form";
import { AddToCompareButton } from "@/components/compare/add-to-compare-button";

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = await getPublicUnitBySlug(slug);

  if (!unit) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full pb-32">
      
      {/* Breadcrumb / Top Info */}
      <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-brand-signal/50 mb-8">
        <span>STORE</span>
        <span>{">"}</span>
        <span>{unit.classSlug.replace('-', ' ')}</span>
        <span>{">"}</span>
        <span className="text-brand-text">{unit.sku}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column - Visuals & Terminal Output */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="aspect-[4/3] bg-brand-panel border border-border flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,10,5,0.8)_0%,rgba(0,0,0,1)_100%)] pointer-events-none z-10" />
            <Cpu className="w-32 h-32 text-brand-text/10 group-hover:text-brand-signal/20 transition-colors duration-1000 z-0" />
            
            {/* Terminal Overlay */}
            <div className="absolute inset-4 z-20 pointer-events-none flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div className="font-mono text-[10px] text-brand-signal/60 uppercase tracking-widest">
                    SYS.CAM.01 // ONLINE
                  </div>
                  <div className="w-2 h-2 rounded-full bg-brand-signal animate-pulse" />
               </div>
               <div className="font-mono text-[10px] text-brand-signal/60 uppercase tracking-widest text-right">
                  REC // 60FPS // VIS
               </div>
            </div>
          </div>

          <div className="border border-border bg-brand-panel p-4 font-mono text-xs text-brand-text/70 uppercase">
             <div className="flex items-center gap-2 text-brand-signal mb-2">
               <Terminal className="w-4 h-4" />
               <span>SYSTEM TERMINAL_</span>
             </div>
             <p className="tracking-wide leading-relaxed">
               {">"} INITIATING HARDWARE SCAN...<br/>
               {">"} TARGET: {unit.sku}<br/>
               {">"} CLASS TYPE: {unit.classSlug.toUpperCase().replace('-', ' ')}<br/>
               {">"} DESIGNATION: {unit.name.toUpperCase()}<br/>
               {">"} RESULT: UNIT OPERATIONAL. AWAITING DEPLOYMENT PROTOCOLS.
             </p>
          </div>
        </div>

        {/* Right Column - Specs & Actions */}
        <div className="lg:col-span-5 flex flex-col">
          
          <div className="mb-6">
            <Badge variant="outline" className="bg-brand-bg border-brand-signal/30 text-brand-signal uppercase font-mono text-[10px] tracking-wider rounded-none mb-4">
              {unit.brand}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold font-mono uppercase tracking-tight text-brand-text mb-2">
              {unit.name}
            </h1>
            <p className="text-sm font-mono text-brand-signal/80 uppercase tracking-widest">
              {unit.subtitle}
            </p>
          </div>

          <p className="text-brand-text/60 leading-relaxed text-sm mb-8">
            {unit.description}
          </p>

          <Separator className="bg-border mb-8" />

          {/* Pricing & Acquisition */}
          <div className="bg-brand-bg border border-border p-6 mb-8 flex flex-col gap-6">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-brand-text/50 mb-1">
                Acquisition Value
              </div>
              <div className="text-3xl font-bold font-mono text-brand-text">
                {unit.priceCents ? `$${(unit.priceCents / 100).toLocaleString()}` : "SYS-QUOTE"}
                <span className="text-sm text-brand-text/40 ml-2 font-normal">USD</span>
              </div>
            </div>

            {unit.purchaseMode === "buy_now" && (
              <Button size="lg" className="w-full bg-brand-signal text-brand-bg hover:bg-brand-signal-soft rounded-none uppercase font-mono tracking-widest font-semibold">
                [ ADD TO LOADOUT ]
              </Button>
            )}
            
            {unit.purchaseMode === "partner_quote" && (
              <Button size="lg" variant="outline" className="w-full border-brand-signal/50 text-brand-signal hover:bg-brand-signal/10 hover:text-brand-signal rounded-none uppercase font-mono tracking-widest font-semibold bg-brand-bg">
                [ REQUEST SYS-QUOTE ]
              </Button>
            )}

            {unit.purchaseMode === "inquiry_only" && (
               <Button size="lg" variant="outline" className="w-full border-brand-text/50 text-brand-text hover:bg-brand-text/10 hover:text-brand-text rounded-none uppercase font-mono tracking-widest font-semibold bg-brand-bg">
                 [ INITIATE INQUIRY ]
               </Button>
            )}

            {unit.purchaseMode === "waitlist" && (
              <div className="flex flex-col gap-2">
                 <div className="text-[10px] font-mono text-brand-signal/50 uppercase tracking-widest">
                   Production nodes at capacity. Log email to secure queue position.
                 </div>
                 <WaitlistForm unitId={unit.slug} />
              </div>
            )}

            {unit.purchaseMode === "affiliate" && (
               <Button size="lg" variant="outline" className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500 rounded-none uppercase font-mono tracking-widest font-semibold bg-brand-bg">
                 [ EXTERNAL PROTOCOL ]
               </Button>
            )}

            <div className="pt-4 border-t border-border/30">
              <AddToCompareButton unit={unit} />
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-brand-signal">
                <DatabaseZap className="w-4 h-4" />
                <h3 className="font-mono text-xs uppercase tracking-widest font-bold">System Specs</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(unit.specs).map(([key, value]) => (
                  <div key={key} className="border border-border bg-brand-panel p-3">
                    <div className="text-[10px] font-mono text-brand-text/40 uppercase tracking-widest mb-1">{key}</div>
                    <div className="text-xs font-mono text-brand-text uppercase">{value as string}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
               <div className="flex items-center gap-2 mb-4 text-brand-signal">
                 <CheckCircle className="w-4 h-4" />
                 <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Core Capabilities</h3>
               </div>
               <ul className="space-y-2">
                 {unit.capabilities.map((cap, i) => (
                    <li key={i} className="flex gap-3 text-sm text-brand-text/80">
                      <span className="font-mono text-brand-signal">{">"}</span> {cap}
                    </li>
                 ))}
               </ul>
            </div>

            <div>
               <div className="flex items-center gap-2 mb-4 text-brand-signal">
                 <ShieldAlert className="w-4 h-4" />
                 <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Behavioral Profile</h3>
               </div>
               <ul className="space-y-2">
                 {unit.behavioralProfile.map((bp, i) => (
                    <li key={i} className="flex gap-3 text-sm text-brand-text/80">
                      <span className="font-mono text-brand-signal">{">"}</span> {bp}
                    </li>
                 ))}
               </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
