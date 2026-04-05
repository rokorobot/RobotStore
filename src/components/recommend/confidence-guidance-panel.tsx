"use client";

import { AlertTriangle, Lightbulb } from "lucide-react";
import { RefinementSignal } from "@/types/recommend";
import { track } from "@/lib/analytics/track";

export function ConfidenceGuidancePanel({ 
  uncertaintyReason,
  refinements,
  onRefine
}: { 
  uncertaintyReason?: string;
  refinements?: RefinementSignal[];
  onRefine: (key: string) => void;
}) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start gap-4">
        <div className="bg-amber-500/20 p-2 border border-amber-500/50">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1 font-mono text-left">
          <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm mb-2">
            [ DIAGNOSTIC AMBIGUITY DETECTED ]
          </h3>
          <p className="text-xs text-brand-text/70 leading-relaxed mb-4">
            {uncertaintyReason || "Your current operational parameters produce multiple viable configurations with overlapping scores."}
            {" "}We recommend refining your inputs to resolve the ambiguity.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(refinements || []).map((ref, i) => (
              <button 
                key={i} 
                className="flex flex-col gap-1 p-3 border border-amber-500/20 bg-amber-500/5 group hover:border-amber-500/50 transition-colors text-left"
                onClick={() => {
                  track("refinement_applied", { refinementKey: ref.key });
                  onRefine(ref.key);
                }}
              >
                <div className="flex items-center gap-2 text-[10px] uppercase text-amber-400 font-bold">
                  <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{ref.title}</span>
                </div>
                <div className="text-[10px] text-brand-text/50 uppercase leading-tight">
                  {ref.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
