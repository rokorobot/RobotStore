"use client";

import { useState } from "react";
import { RecommendationInput, RecommendationResult } from "@/types/recommend";
import { Button } from "@/components/ui/button";
import { RecommendationCard } from "./recommendation-card";
import { Unit } from "@/types/unit";
import { ArrowLeft, ArrowRight, Activity, TerminalSquare, RotateCcw } from "lucide-react";
import { track } from "@/lib/analytics/track";
import { ConfidenceGuidancePanel } from "./confidence-guidance-panel";
import { resolveCTA } from "@/lib/recommend/cta-registry";
import { generatePersuasiveReason } from "@/lib/recommend/reasons";
import { useCompareStore } from "@/store/compare-store";
import { useRouter } from "next/navigation";

type StepIdx = 0 | 1 | 2 | 3 | 4 | 5; // 5 is results

export function RecommendationWizard() {
  const router = useRouter();
  const { addUnit, clearCompare } = useCompareStore();
  const [step, setStep] = useState<StepIdx>(0);
  const [formData, setFormData] = useState<Partial<RecommendationInput>>({});
  const [loading, setLoading] = useState(false);
  const [scanPhase, setScanPhase] = useState(0);
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [metadata, setMetadata] = useState<{ 
    confidenceGap: number; 
    confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
    uncertaintyReason?: string;
    refinementSignals?: import("@/types/recommend").RefinementSignal[];
  } | null>(null);
  const [showAll, setShowAll] = useState(false);

  const SCAN_PHASES = [
    "> SCANNING INPUT PARAMETERS...",
    "> INDEXING DEPLOYMENT PROFILES...",
    "> MATCHING HARDWARE TOPOLOGIES...",
    "> RANKING OPERATIONAL FITNESS...",
    "> DIAGNOSTIC OUTPUT READY.",
  ];

  const handleSelection = (key: keyof RecommendationInput, val: string) => {
     setFormData(prev => ({ ...prev, [key]: val }));
  };

  const submitToEngine = async () => {
    setLoading(true);
    setScanPhase(0);
    setStep(5);
    setShowAll(false);

    track("diagnostic_complete", {
      useCase:           formData.useCase,
      environment:       formData.environment,
      budgetBand:        formData.budgetBand,
      purchasePreference: formData.purchasePreference,
      deploymentScale:   formData.deploymentScale,
    });
    
    // Cycle scan phases mechanically
    let phase = 0;
    const phaseInterval = setInterval(() => {
      phase = Math.min(phase + 1, SCAN_PHASES.length - 1);
      setScanPhase(phase);
    }, 400);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      let fetchedResults: RecommendationResult[] = data.results || [];
      const fetchedMetadata = data.metadata;

      // 🧠 Inject Grounded Reasons
      fetchedResults = fetchedResults.map((r, idx) => ({
        ...r,
        persuasiveReason: generatePersuasiveReason(
          r, 
          formData as RecommendationInput, 
          { runnerUp: fetchedResults[idx === 0 ? 1 : 0] }
        )
      }));

      setResults(fetchedResults);
      setMetadata(fetchedMetadata);

      // 📺 Adaptive UI Exposure Telemetry
      if (fetchedMetadata) {
        track("ui_mode_exposed", { 
          mode: fetchedMetadata.confidenceLevel,
          useCase: formData.useCase,
          confidenceGap: fetchedMetadata.confidenceGap,
          resultCount: fetchedResults.length
        });
        
        const cta = resolveCTA(
          formData.useCase as any, 
          fetchedMetadata.confidenceLevel,
          fetchedResults[0]?.unitObj?.purchaseMode as any
        );
        track("cta_variant_exposed", {
          useCase: formData.useCase,
          confidenceLevel: fetchedMetadata.confidenceLevel,
          primaryAction: cta.primaryAction
        });

        // Track Priority Reason Exposure
        if (fetchedResults[0]?.persuasiveReason) {
          const pr = fetchedResults[0].persuasiveReason;
          track("persuasive_reason_exposed", {
            reasonText: pr.text,
            reasonType: pr.reasonType,
            dominantDimension: pr.dominantDimension
          });
        }
      }

      // 🛑 Friction Tracking
      if (fetchedResults.length === 0) {
        track("engine_no_results", { ...formData });
      } else if (fetchedMetadata?.confidenceLevel === "LOW") {
        track("engine_low_confidence", {
          ...formData,
          confidenceGap: fetchedMetadata.confidenceGap,
          topUnit: fetchedResults[0]?.slug
        });
      }
    } catch(err) {
      console.error(err);
    } finally {
      clearInterval(phaseInterval);
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 4) {
      submitToEngine();
    } else {
      setStep((s) => (s + 1) as StepIdx);
    }
  };

  const prevStep = () => {
    if (step > 0 && step < 5) {
      setStep((s) => (s - 1) as StepIdx);
    }
  };

  return (
    <div className="font-mono">
       
       <div className="mb-8 flex justify-between items-center text-xs text-brand-text/50 uppercase tracking-widest border-b border-border pb-4">
          <div className="flex items-center gap-2">
             <TerminalSquare className="w-4 h-4 text-brand-signal" />
             <span>Diagnostic Routine {step < 5 ? `[0${step+1}/05]` : '[ COMPLETE ]'}</span>
          </div>
          {step > 0 && step < 5 && (
             <button onClick={prevStep} className="hover:text-brand-signal flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" /> [ REVERT STEP ]
             </button>
          )}
          {step === 5 && (
             <button onClick={() => { setStep(0); setFormData({}); setResults([]); setMetadata(null); }} className="hover:text-brand-signal flex items-center gap-2">
                <RotateCcw className="w-3 h-3" /> [ RUN NEW DIAGNOSTIC ]
             </button>
          )}
       </div>

       {step === 0 && (
         <WizardChoice 
            title="Declare Primary Operational Use Case"
            value={formData.useCase}
            onChange={(v) => handleSelection("useCase", v)}
            options={[
              { label: "Domestic Assistance", desc: "In-home chore automation and property maintenance.", value: "home_assistance" },
              { label: "Industrial Logistics", desc: "Heavy payload transit and fulfillment automation.", value: "industrial_logistics" },
              { label: "Perimeter Security", desc: "Autonomous patrols and threat deterrence.", value: "security" },
              { label: "Healthcare / Clinic", desc: "Sterile routing, tracking, and companion applications.", value: "healthcare_lab" },
              { label: "Research & Prototyping", desc: "Experimental nodes and humanoid interfaces.", value: "research_prototype" },
              { label: "Education / Dev Kits", desc: "Programmable chassis for technical training.", value: "education_dev" }
            ]}
         />
       )}

       {step === 1 && (
         <WizardChoice 
            title="Identify Deployment Environment"
            value={formData.environment}
            onChange={(v) => handleSelection("environment", v)}
            options={[
              { label: "Residential Home", desc: "Carpet, tight corners, domestic obstacles.", value: "home" },
              { label: "Corporate Office", desc: "Smooth floors, structured aisles, human traffic.", value: "office" },
              { label: "Warehouse Facility", desc: "Large open concrete floors, heavy machinery.", value: "warehouse" },
              { label: "Lab or Clinic", desc: "Sterile limits, quiet zones, strict routing.", value: "lab_clinic" },
              { label: "Outdoors / Terrain", desc: "Weather exposed, uneven surfaces, tracking.", value: "outdoors" },
              { label: "Mixed Environments", desc: "Adaptable required to transition zones.", value: "mixed" }
            ]}
         />
       )}

       {step === 2 && (
         <WizardChoice 
            title="Define Acquisition Budget Band"
            value={formData.budgetBand}
            onChange={(v) => handleSelection("budgetBand", v)}
            options={[
              { label: "Under $1,000 USD", desc: "Entry-level or companion units.", value: "under_1000" },
              { label: "$1,000 - $5,000 USD", desc: "Standard commercial and pro-sumer class.", value: "1000_5000" },
              { label: "$5,000 - $20,000 USD", desc: "Professional logistics and security.", value: "5000_20000" },
              { label: "$20,000+ Enterprise", desc: "Heavy industrial and humanoid models.", value: "20000_plus" },
              { label: "Flexible / Needs Based", desc: "Budget will expand for exact fit.", value: "flexible" }
            ]}
         />
       )}

       {step === 3 && (
         <WizardChoice 
            title="Specify Procurement Preference"
            value={formData.purchasePreference}
            onChange={(v) => handleSelection("purchasePreference", v)}
            options={[
              { label: "Direct Buy Now", desc: "I want to add to cart and checkout immediately.", value: "buy_now" },
              { label: "Open to Quoting", desc: "Willing to discuss enterprise rates.", value: "quote_ok" },
              { label: "Open to Waitlists", desc: "Flexible timeline, willing to wait.", value: "waitlist_ok" },
              { label: "No Preference", desc: "Show me the best unit regardless of procurement speed.", value: "any" }
            ]}
         />
       )}

       {step === 4 && (
         <WizardChoice 
            title="Target Deployment Scale"
            value={formData.deploymentScale}
            onChange={(v) => handleSelection("deploymentScale", v)}
            options={[
              { label: "Single Unit", desc: "One node for specialized tasking.", value: "single" },
              { label: "Small Fleet (2-5)", desc: "Coordinated local operation.", value: "small_fleet" },
              { label: "Enterprise Swarm (6+)", desc: "Mass deployment and central management.", value: "enterprise" }
            ]}
         />
       )}

       {step < 5 && (
         <div className="flex justify-end mt-8">
            <Button 
               onClick={nextStep} 
               disabled={
                 (step === 0 && !formData.useCase) ||
                 (step === 1 && !formData.environment) ||
                 (step === 2 && !formData.budgetBand) ||
                 (step === 3 && !formData.purchasePreference) ||
                 (step === 4 && !formData.deploymentScale)
               }
               className="bg-brand-signal hover:bg-brand-signal-soft font-mono uppercase tracking-widest text-brand-bg rounded-none"
            >
               {step === 4 ? "[ INITIATE DIAGNOSTIC RUN ]" : "[ PROCEED TO NEXT KEY ]"}
            </Button>
         </div>
       )}

       {step === 5 && (
         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {loading ? (
               <div className="py-24 flex flex-col items-center justify-center space-y-4 border border-border bg-brand-panel">
                  <Activity className="w-10 h-10 text-brand-signal animate-pulse" />
                  <div className="text-sm font-mono uppercase tracking-widest text-brand-signal">
                    {SCAN_PHASES[scanPhase]}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {SCAN_PHASES.map((_, i) => (
                      <div key={i} className={`w-8 h-0.5 transition-colors duration-300 ${
                        i <= scanPhase ? 'bg-brand-signal' : 'bg-border'
                      }`} />
                    ))}
                  </div>
               </div>
            ) : (
               <div className="space-y-6">
                  {/* LOW CONFIDENCE GUIDANCE */}
                  {metadata?.confidenceLevel === "LOW" && (
                    <ConfidenceGuidancePanel 
                      uncertaintyReason={metadata?.uncertaintyReason}
                      refinements={metadata?.refinementSignals}
                      onRefine={(key) => {
                        // Logic to back-step or refine
                        setStep(1); 
                      }}
                    />
                  )}

                  <div className="text-[10px] uppercase tracking-widest text-brand-signal border-b border-border pb-3 flex justify-between items-center">
                    <span>{">"} DIAGNOSTIC OUTPUT — {results.length} NODE{results.length !== 1 ? 'S' : ''} MATCHED</span>
                    <span className="text-brand-text/30">[ CONFIDENCE: {metadata?.confidenceLevel || 'UNKNOWN'} ]</span>
                  </div>

                  <div className={`grid grid-cols-1 ${
                    metadata?.confidenceLevel === "MEDIUM" ? "md:grid-cols-2" : "md:grid-cols-1"
                  } gap-6`}>
                    {results.map((res: any, idx) => {
                      const isSuppressed = metadata?.confidenceLevel === "MEDIUM" && idx >= 2 && !showAll;
                      const isSecondaryInHigh = metadata?.confidenceLevel === "HIGH" && idx >= 1;
                      
                      if (isSuppressed || isSecondaryInHigh) return null;

                      const ctaConfig = resolveCTA(
                        formData.useCase as any, 
                        metadata?.confidenceLevel || "MEDIUM",
                        res.unitObj?.purchaseMode as any
                      );

                      return (
                        <RecommendationCard 
                          key={res.unitId} 
                          result={res} 
                          unit={res.unitObj} 
                          rank={idx + 1} 
                          uiMode={metadata?.confidenceLevel}
                          ctaConfig={ctaConfig}
                        />
                      );
                    })}
                  </div>

                  {/* View All Escape Hatch (MEDIUM Mode) */}
                  {metadata?.confidenceLevel === "MEDIUM" && !showAll && results.length > 2 && (
                    <div className="flex justify-center pt-4">
                      <button 
                        onClick={() => {
                          setShowAll(true);
                          track("results_expanded", { 
                            mode: "MEDIUM",
                            useCase: formData.useCase,
                            confidenceLevel: metadata?.confidenceLevel,
                            resultCount: results.length
                          });
                        }}
                        className="text-[10px] uppercase tracking-[0.2em] text-brand-text/40 hover:text-brand-signal transition-colors font-mono py-4 border-b border-brand-text/10"
                      >
                        [ VIEW ALL RANKED OPTIONS ]
                      </button>
                    </div>
                  )}

                  {/* MEDIUM MODE ESCAPE HATCH */}
                  {metadata?.confidenceLevel === "MEDIUM" && results.length > 2 && !showAll && (
                    <div className="flex justify-center -mt-2">
                      <button 
                        onClick={() => setShowAll(true)}
                        className="text-[10px] uppercase tracking-widest text-brand-text/30 hover:text-brand-signal hover:underline transition-colors font-mono"
                      >
                        [ VIEW ALL RANKED OPTIONS ]
                      </button>
                    </div>
                  )}

                  {/* MEDIUM CONFIDENCE PRIMARY ACTION: COMPARE */}
                  {metadata?.confidenceLevel === "MEDIUM" && (
                    <div className="flex justify-center pt-4">
                       <Button 
                         onClick={() => {
                           clearCompare();
                           results.slice(0, 2).forEach(r => r.unitObj && addUnit(r.unitObj));
                           track("ui_mode_action", { 
                             mode: "MEDIUM", 
                             action: "compare",
                             useCase: formData.useCase,
                             confidenceGap: metadata.confidenceGap
                           });
                           router.push("/compare");
                         }}
                         className="bg-brand-signal text-brand-bg hover:bg-brand-signal-soft rounded-none uppercase text-xs tracking-widest press-feedback font-mono py-6 px-12"
                       >
                         {resolveCTA(formData.useCase as any, "MEDIUM").primaryLabel}
                       </Button>
                    </div>
                  )}

                  {/* HIGH MODE: SECONDARY RESULTS (DE-EMPHASIZED) */}
                  {metadata?.confidenceLevel === "HIGH" && results.length > 1 && (
                    <div className="pt-12 border-t border-border/30">
                       <p className="text-[10px] uppercase tracking-widest text-brand-text/30 mb-6 font-mono">[ ALTERNATIVE CONFIGURATIONS ]</p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                         {results.slice(1, 4).map((res: any, idx) => (
                            <RecommendationCard 
                              key={res.unitId} 
                              result={res} 
                              unit={res.unitObj} 
                              rank={idx + 2} 
                              uiMode="LOW"
                              ctaConfig={resolveCTA(formData.useCase as any, "LOW")}
                            />
                         ))}
                       </div>
                    </div>
                  )}

                  {results.length === 0 && (
                    <div className="py-24 border border-border bg-brand-panel flex flex-col items-center gap-6">
                       <p className="font-mono text-brand-text/50 uppercase tracking-widest text-sm">[ ZERO MATCHING NODES IDENTIFIED ]</p>
                       <Button onClick={() => setStep(0)} variant="outline" className="rounded-none uppercase tracking-widest text-[10px]">
                         [ RESET DIAGNOSTIC PARAMETERS ]
                       </Button>
                    </div>
                  )}

                  {/* LOW CONFIDENCE RELAXATION ACTION */}
                  {metadata?.confidenceLevel === "LOW" && (
                    <div className="flex justify-center pt-8">
                       <Button 
                         onClick={() => setStep(0)}
                         className="bg-amber-500/10 border border-amber-500/50 text-amber-500 hover:bg-amber-500/20 rounded-none uppercase text-xs tracking-widest font-mono py-6 px-12"
                       >
                         [ REFINE DIAGNOSTIC — ADJUST PARAMETERS ]
                       </Button>
                    </div>
                  )}
               </div>
            )}
         </div>
       )}
    </div>
  );
}

function WizardChoice({ title, value, onChange, options }: { title: string, value: any, onChange: (v: string) => void, options: {label: string, desc: string, value: string}[] }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
       <h2 className="text-xl text-brand-signal mb-6 border-b border-border/30 pb-2 inline-block font-bold">
         <span className="text-brand-text animate-pulse mr-2">{">"}</span>{title}
       </h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {options.map(opt => (
           <button 
             key={opt.value}
             onClick={() => onChange(opt.value)}
             className={`flex flex-col text-left p-4 border transition-colors ${value === opt.value ? 'border-brand-signal bg-brand-signal/10' : 'border-border bg-brand-panel hover:bg-brand-bg/50'}`}
           >
              <div className={`font-bold uppercase tracking-widest mb-1 ${value === opt.value ? 'text-brand-signal' : 'text-brand-text'}`}>{opt.label}</div>
              <div className="text-xs text-brand-text/60">{opt.desc}</div>
           </button>
         ))}
       </div>
    </div>
  );
}
