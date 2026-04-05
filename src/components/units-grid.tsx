"use client";

import Link from "next/link";
import { useState } from "react";
import { Unit } from "@/types/unit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddToCompareButton } from "@/components/compare/add-to-compare-button";

export function UnitsGrid({ units }: { units: Unit[] }) {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const unitClasses = Array.from(new Set(units.map(u => u.classSlug)));

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(search.toLowerCase()) || 
                          unit.sku.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === "all" || unit.classSlug === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="w-full">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-brand-panel border border-border p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/50" />
            <Input 
              placeholder="Search units, capabilities, or specs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-brand-bg border-border text-brand-text font-mono text-sm uppercase tracking-widest rounded-none h-11"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none snap-x">
            <button
              onClick={() => setSelectedClass("all")}
              className={`whitespace-nowrap px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-colors snap-start ${
                selectedClass === "all" 
                  ? "bg-brand-signal text-brand-bg border-brand-signal" 
                  : "bg-brand-bg border-border text-brand-text/70 hover:border-brand-signal/50"
              }`}
            >
              [ ALL SECURE NODES ]
            </button>
            {unitClasses.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`whitespace-nowrap px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-colors snap-start ${
                  selectedClass === cls 
                    ? "bg-brand-signal text-brand-bg border-brand-signal" 
                    : "bg-brand-bg border-border text-brand-text/70 hover:border-brand-signal/50"
                }`}
              >
                {cls.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUnits.map((unit) => (
            <Card key={unit.slug} className="group relative bg-brand-panel border-border hover:border-brand-signal/50 transition-colors overflow-hidden rounded-none flex flex-col h-full">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-signal opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-signal opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-signal opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-signal opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="aspect-[4/3] bg-brand-bg border-b border-border relative overflow-hidden flex items-center justify-center p-6">
                <div className="absolute top-2 left-2 flex gap-2 z-10 text-brand-signal">
                   <div className="text-[10px] uppercase font-mono tracking-widest border border-brand-signal/30 bg-brand-signal/10 px-1.5 py-0.5 pointer-events-none">
                     {unit.sku}
                   </div>
                </div>
                {unit.featured && (
                  <div className="absolute top-2 right-2 text-brand-signal opacity-70">
                    <Cpu className="w-4 h-4 animate-pulse" />
                  </div>
                )}
                
                {/* Image Placeholder */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-signal/5 via-brand-bg to-brand-bg z-0" />
                <img src={unit.images[0]} alt={unit.name} className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(var(--brand-signal),0.2)] group-hover:scale-105 transition-transform duration-500 opacity-80" />
              </div>
              
              <div className="p-5 flex flex-col flex-1 relative z-10 bg-brand-panel min-h-[220px]">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="rounded-none border-brand-signal/30 text-[10px] text-brand-signal font-mono uppercase tracking-widest pointer-events-none">
                    {unit.classSlug.replace('-', ' ')}
                  </Badge>
                  {unit.purchaseMode === "waitlist" && (
                    <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest border border-orange-500/30 px-1.5 py-0.5 bg-orange-500/10 pointer-events-none">
                      WAITLIST
                    </span>
                  )}
                  {unit.purchaseMode === "inquiry_only" && (
                    <span className="text-[10px] font-mono text-brand-text/50 uppercase tracking-widest border border-brand-text/30 px-1.5 py-0.5 pointer-events-none">
                      SYS-QUOTE
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold font-mono tracking-wide text-brand-text mb-2 line-clamp-1">{unit.name}</h3>
                <p className="text-xs font-mono text-brand-text/50 line-clamp-2 mb-4 flex-1">
                  {unit.shortDescription}
                </p>
                
                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
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
                  <AddToCompareButton unit={unit} />
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredUnits.length === 0 && (
          <div className="text-center py-24 border border-border bg-brand-panel">
            <Filter className="w-12 h-12 text-brand-text/20 mx-auto mb-4" />
            <h3 className="text-lg font-mono uppercase tracking-widest text-brand-text mb-2">No hardware found</h3>
            <p className="font-mono text-sm uppercase tracking-widest text-brand-text/50">Adjust parameters to discover operational autonomous systems.</p>
          </div>
        )}
    </div>
  );
}
