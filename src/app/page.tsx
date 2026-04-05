"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, DatabaseZap, Network, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { featuredUnits, unitClasses } from "@/content/units";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export default function Home() {
  useEffect(() => { track("enter_home"); }, []);
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center py-24 sm:py-32 px-4 text-center border-b border-border bg-brand-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,156,0.05)_0%,transparent_70%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl flex flex-col items-center gap-6"
        >
          <div className="inline-flex items-center gap-2 border border-brand-signal/30 bg-brand-signal/5 px-3 py-1 text-xs uppercase tracking-widest text-brand-signal">
            <span className="w-2 h-2 rounded-full bg-brand-signal animate-pulse" />
            Global Access Node
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight uppercase text-brand-text">
            Initializing <span className="text-brand-signal">Market Interface...</span>
          </h1>
          
          <p className="text-brand-text/60 font-mono text-sm sm:text-base max-w-xl mx-auto uppercase tracking-wide leading-relaxed">
            The command interface for the robotic economy. Not a general store. This is a curated deployment center for operational autonomous systems.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link
              href="/recommend"
              onClick={() => track("click_diagnostic")}
              className="bg-brand-signal text-brand-bg hover:bg-brand-signal-soft rounded-none uppercase font-mono tracking-widest font-semibold border border-transparent hover:border-brand-signal h-11 px-8 inline-flex items-center justify-center press-feedback"
            >
              [ INITIATE SYSTEM DIAGNOSTIC ]
            </Link>
            <Link href="/units" className="border border-brand-signal/30 hover:bg-brand-signal/10 hover:border-brand-signal hover:text-brand-signal rounded-none uppercase font-mono tracking-widest text-brand-signal/70 w-full sm:w-auto bg-brand-bg h-11 px-8 inline-flex items-center justify-center press-feedback">
              [ SCAN INVENTORY MANUALLY ]
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Units */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-12">
          <DatabaseZap className="h-6 w-6 text-brand-signal" />
          <h2 className="text-2xl uppercase tracking-widest font-mono text-brand-text font-bold">Priority Deployments</h2>
          <div className="h-px bg-border flex-1 ml-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredUnits.map((unit) => (
            <Card key={unit.id} className="bg-brand-panel border-border group hover:border-brand-signal/50 transition-colors rounded-none overflow-hidden relative flex flex-col">
              <div className="aspect-[4/3] bg-brand-bg relative border-b border-border flex items-center justify-center overflow-hidden p-6 group-hover:bg-brand-bg/50 transition-colors">
                {/* Image Placeholder */}
                <Cpu className="w-16 h-16 text-brand-text/20 group-hover:scale-110 transition-transform duration-500" />
                
                {/* Overlay details */}
                <div className="absolute top-2 left-2">
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
      </section>

      {/* Network stats decoration */}
      <section className="border-t border-border bg-brand-panel py-12 px-4 sm:px-6 font-mono">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border">
          <div className="flex flex-col px-4 text-center">
            <span className="text-brand-signal text-xl font-bold mb-1">99.9%</span>
            <span className="text-xs uppercase tracking-widest text-brand-text/60">Node Uptime</span>
          </div>
          <div className="flex flex-col px-4 text-center">
            <span className="text-brand-signal text-xl font-bold mb-1">12,408</span>
            <span className="text-xs uppercase tracking-widest text-brand-text/60">Active Units</span>
          </div>
          <div className="flex flex-col px-4 text-center">
            <span className="text-brand-signal text-xl font-bold mb-1">&lt;14ms</span>
            <span className="text-xs uppercase tracking-widest text-brand-text/60">Ping to Core</span>
          </div>
          <div className="flex flex-col px-4 text-center">
            <span className="text-brand-signal text-xl font-bold mb-1">SECURE</span>
            <span className="text-xs uppercase tracking-widest text-brand-text/60">Signal Handshake</span>
          </div>
        </div>
      </section>
    </div>
  );
}
