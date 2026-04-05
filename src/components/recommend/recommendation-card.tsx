"use client";

import { CheckCircle } from "lucide-react";
import { RecommendationResult } from "@/types/recommend";
import { Unit } from "@/types/unit";
import { AddToCompareButton } from "@/components/compare/add-to-compare-button";
import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { resolveCTA, CTAResolution } from "@/lib/recommend/cta-registry";
import { track } from "@/lib/analytics/track";

export function RecommendationCard({ 
  result, 
  unit, 
  rank,
  uiMode = "MEDIUM",
  ctaConfig
}: { 
  result: RecommendationResult, 
  unit?: Unit, 
  rank: number,
  uiMode?: "HIGH" | "MEDIUM" | "LOW",
  ctaConfig?: CTAResolution
}) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const isPrimary = rank === 1;

  if (!unit) return null;

  return (
    <div className={`flex flex-col overflow-hidden group transition-all duration-500 ${
      isPrimary && uiMode === "HIGH"
        ? 'border-4 border-brand-signal shadow-[0_0_60px_rgba(0,255,156,0.25)] md:p-1' // Structural dominance
        : isPrimary
        ? 'border border-brand-signal shadow-[0_0_20px_rgba(0,255,156,0.08)]'
        : 'border border-border opacity-80 hover:opacity-100'
    } bg-brand-panel`}>

      {/* PRIMARY MATCH strip — visible on rank 1 only */}
      {isPrimary && (
        <div className="w-full bg-brand-signal text-brand-bg font-mono text-[10px] uppercase tracking-widest px-4 py-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-brand-bg animate-pulse" />
          {uiMode === "HIGH" 
            ? '> PRIMARY MATCH — HIGHEST DIAGNOSTIC CERTAINTY' 
            : '> PRIMARY MATCH — RECOMMENDED CONFIGURATION'}
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full">
        {/* Image */}
        <div className="w-full md:w-64 h-48 md:h-auto relative bg-brand-bg/50 border-b md:border-b-0 md:border-r border-border shrink-0 flex items-center justify-center p-4">
          <img src={unit.images[0]} className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 left-2 bg-brand-bg border border-border px-2 text-[10px] uppercase font-mono tracking-widest text-brand-signal">
            RANK {rank}
          </div>
          <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 border border-brand-signal bg-brand-bg text-brand-signal font-mono text-xs font-bold">
            {result.score}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-6 flex flex-col font-mono">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-brand-signal mb-1">{unit.sku}</div>
              <h3 className="text-lg font-bold text-brand-text leading-tight mb-1">{unit.name}</h3>
              <div className="text-[10px] text-brand-text/50 uppercase tracking-widest">{unit.classSlug.replace('-', ' ')}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-brand-text">
                {unit.priceCents ? `$${(unit.priceCents / 100).toLocaleString()}` : "QUOTE"}
              </div>
              <div className={`text-[10px] uppercase tracking-widest mt-1 font-mono ${
                unit.purchaseMode === 'buy_now' ? 'text-[#00ff9c]' :
                unit.purchaseMode === 'partner_quote' || unit.purchaseMode === 'inquiry_only' ? 'text-amber-400' :
                unit.purchaseMode === 'waitlist' ? 'text-orange-400' : 'text-brand-text/50'
              }`}>{unit.purchaseMode.replace('_', ' ')}</div>
            </div>
          </div>

          <p className="text-xs text-brand-text/70 mb-4 line-clamp-2">
            {unit.shortDescription}
          </p>

          {/* 🧠 Grounded Persuasion Layer */}
          {result.persuasiveReason && (
            <div className="mb-6 p-4 bg-brand-signal/5 border-l-4 border-brand-signal">
              <div className="text-[10px] uppercase tracking-widest text-brand-signal font-bold mb-1">[ PRIORITY DIAGNOSTIC REASON ]</div>
              <p className="text-sm font-bold text-brand-text leading-relaxed italic">
                "{result.persuasiveReason.text}"
              </p>
            </div>
          )}

          {/* Explanation Reasons (Technical) */}
          <div className="bg-brand-bg/50 border border-border p-3 mb-6 space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-brand-text/40 border-b border-border/50 pb-1 mb-2">
              Technical Matching Parameters
            </div>
            {result.reasons.map((reason, i) => (
              <div key={i} className="flex gap-2 text-[11px] text-brand-text/60 items-start">
                <CheckCircle className="w-3 h-3 text-brand-signal/50 shrink-0 mt-0.5" />
                <span className="leading-tight">{reason}</span>
              </div>
            ))}
          </div>

          {/* Actions — hierarchy: conversion > compare > inspect */}
          <div className="mt-auto flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">

            {/* PRIMARY: mode-appropriate conversion */}
            {unit.purchaseMode === 'buy_now' ? (
              added ? (
                <div className="flex-1 flex items-center justify-center gap-2 bg-brand-signal/10 border border-brand-signal text-brand-signal font-mono text-[10px] uppercase tracking-widest px-3 py-2">
                  <span className="w-1.5 h-1.5 bg-brand-signal animate-pulse" />
                  LOADOUT UPDATED —{' '}
                  <Link href="/loadout" className="underline ml-1">PROCEED TO DEPLOYMENT</Link>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    addItem(unit);
                    setAdded(true);
                    track("result_add_to_loadout", {
                      rank,
                      score:        result.score,
                      unitId:       unit.id,
                      unitSlug:     unit.slug,
                      purchaseMode: unit.purchaseMode,
                      classSlug:    unit.classSlug,
                    });
                    track("ui_mode_action", {
                      mode:         uiMode,
                      action:       "deploy",
                      unitSlug:     unit.slug,
                      fulfillmentType: "buy_now"
                    });
                    track("cta_clicked", { 
                      mode: uiMode, 
                      label: ctaConfig?.primaryLabel || "DEPLOY" 
                    });
                    track("checkout_redirected", {
                      unitSlug:     unit.slug,
                      action:       "buy_now"
                    });
                  }}
                  className={`flex-1 ${
                    uiMode === "HIGH" ? "bg-brand-signal py-6 text-sm font-bold border-2 border-brand-text/10" : "bg-brand-signal"
                  } text-brand-bg hover:bg-brand-signal-soft rounded-none uppercase tracking-widest press-feedback font-mono transition-all`}
                >
                  {ctaConfig?.primaryLabel || (uiMode === "HIGH" ? "[ DEPLOY THIS SYSTEM ]" : "[ ADD TO LOADOUT ]")}
                </Button>
              )
            ) : unit.purchaseMode === 'waitlist' ? (
              <Link href={`/units/${unit.slug}`} className="flex-1">
                <Button 
                  className="w-full bg-orange-500/20 border border-orange-500/50 text-orange-400 hover:bg-orange-500/30 rounded-none uppercase text-xs tracking-widest press-feedback font-mono"
                  onClick={() => track("cta_clicked", { mode: uiMode, label: ctaConfig?.primaryLabel || "WAITLIST" })}
                >
                  {ctaConfig?.primaryLabel || "[ LOCK QUEUE POSITION ]"}
                </Button>
              </Link>
            ) : (
              <Link href={`/units/${unit.slug}`} className="flex-1">
                <Button 
                  className="w-full bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 rounded-none uppercase text-xs tracking-widest press-feedback font-mono"
                  onClick={() => track("cta_clicked", { mode: uiMode, label: ctaConfig?.primaryLabel || "QUOTE" })}
                >
                  {ctaConfig?.primaryLabel || "[ INITIATE TRANSMISSION ]"}
                </Button>
              </Link>
            )}

            {/* SECONDARY: compare */}
            <AddToCompareButton unit={unit} />

            {/* TERTIARY: inspect */}
            <Link href={`/units/${unit.slug}`}>
              <Button variant="ghost" className="press-feedback font-mono text-[10px] uppercase tracking-widest text-brand-text/50 hover:text-brand-text px-3">
                [ SPECS ]
              </Button>
            </Link>
          </div>

          {/* Microcopy Layer */}
          {ctaConfig?.microcopy && (
             <div className="mt-4 text-[10px] uppercase tracking-[0.2em] text-brand-text/40 font-mono text-center">
                {">"} {ctaConfig.microcopy}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
