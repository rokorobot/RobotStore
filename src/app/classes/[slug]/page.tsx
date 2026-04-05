import { notFound } from "next/navigation";
import { units } from "@/content/units";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const classUnits = units.filter(u => u.classSlug === slug);

  if (classUnits.length === 0) {
    notFound();
  }

  const className = slug.replace('-', ' ').toUpperCase();

  return (
    <div className="flex flex-col min-h-screen pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-24">
      
      <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-brand-signal/50 mb-8">
        <Link href="/classes" className="hover:text-brand-signal">CLASSES</Link>
        <span>{">"}</span>
        <span className="text-brand-text">{className}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-brand-signal">
            <LayoutGrid className="w-6 h-6" />
            <h1 className="text-3xl font-bold font-mono tracking-widest text-brand-text">
              {className}
            </h1>
          </div>
          <p className="text-brand-text/50 font-mono text-sm max-w-xl uppercase tracking-wide">
             Viewing all operational nodes classified under {className} protocols.
          </p>
        </div>
        
        <div className="font-mono text-xs text-brand-signal/50 uppercase tracking-widest border border-border px-3 py-1 bg-brand-panel">
          NODES FOUND : {classUnits.length}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classUnits.map((unit) => (
          <Card key={unit.id} className="bg-brand-panel border-border group hover:border-brand-signal/50 transition-colors rounded-none overflow-hidden relative flex flex-col">
            <div className="aspect-[4/3] bg-brand-bg relative border-b border-border flex items-center justify-center overflow-hidden p-6 group-hover:bg-brand-bg/50 transition-colors">
              <Cpu className="w-16 h-16 text-brand-text/20 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge variant="outline" className="bg-brand-bg border-brand-signal/30 text-brand-signal uppercase font-mono text-[10px] tracking-wider rounded-none">
                  {unit.sku}
                </Badge>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="text-[10px] uppercase tracking-widest text-brand-signal/70 mb-1">{unit.classSlug.replace('-', ' ')}</div>
              <h3 className="font-bold font-mono tracking-wide text-brand-text mb-2 line-clamp-1">{unit.name}</h3>
              <p className="text-xs font-mono text-brand-text/50 line-clamp-2 mb-4 flex-1">
                {unit.shortDescription}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                <div className="font-mono text-sm text-brand-text">
                  {unit.priceCents ? `$${(unit.priceCents / 100).toLocaleString()}` : "REQ QUOTE"}
                </div>
                <Link 
                  href={`/units/${unit.slug}`}
                  className="p-0 h-auto text-brand-signal hover:text-brand-signal-soft font-mono uppercase text-xs tracking-widest hover:underline"
                >
                  [ SPECS ]
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
