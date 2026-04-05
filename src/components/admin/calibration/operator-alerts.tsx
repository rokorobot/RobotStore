/**
 * src/components/admin/calibration/operator-alerts.tsx
 *
 * App-level logic for the 'Miscalibration Flags'.
 * Translates raw metrics into actionable operator triggers.
 */

import React from "react";
import { AlertTriangle, ShieldAlert, Zap, Info } from "lucide-react";

interface CalibrationAlert {
  id: string;
  type: "danger" | "warning" | "info" | "success";
  title: string;
  description: string;
  action?: string;
}

interface OperatorAlertsProps {
  metrics: any;
}

export function OperatorAlerts({ metrics }: OperatorAlertsProps) {
  const alerts: CalibrationAlert[] = [];

  // 1. Confidence Inversion Check
  if (metrics.high_completion_rate < metrics.medium_completion_rate) {
    alerts.push({
      id: "conf-inv",
      type: "danger",
      title: "Confidence Calibration Inversion",
      description: "HIGH confidence completion rate is trailing MEDIUM. Scoring engine is exhibiting false certainty.",
      action: "Review HIGH confidence thresholds in engine.ts"
    });
  }

  // 2. High Override Alert
  if (metrics.override_rate > 0.20) {
    alerts.push({
      id: "high-override",
      type: "warning",
      title: "Elevated Override Pressure",
      description: "Over 20% of users are bypassing Rank 1 recommendations.",
      action: "Audit baseMatch & bonus rules in scoring.ts"
    });
  }

  // 3. Low Refinement Alert
  if (metrics.low_refinement_rate < 0.15) {
    alerts.push({
      id: "low-refine",
      type: "info",
      title: "Weak Refinement Engagement",
      description: "Low-confidence sessions are not engaging with diagnostic coaching.",
      action: "Optimize RefinementSignals in reasons.ts"
    });
  }

  // 4. Fulfillment Friction Alert
  if (metrics.checkout_dropoff > 0.40) {
    alerts.push({
      id: "fulfillment-friction",
      type: "danger",
      title: "Commercial Fulfillment Friction",
      description: "Checkout redirect dropoff exceeds 40%. Expectation mismatch with fulfillment mode.",
      action: "Review CTAMicrocopy and fulfillment labels"
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="p-8 border border-brand-signal/10 bg-brand-panel/10 flex flex-col items-center justify-center space-y-3">
        <Zap className="w-8 h-8 text-brand-signal opacity-20" />
        <p className="text-[10px] uppercase tracking-widest font-mono text-brand-signal font-bold">
          All Calibration Parameters Within Nominal Bounds
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 px-2">
        <TerminalSquare className="w-4 h-4 text-brand-signal" />
        <h2 className="text-[10px] uppercase tracking-widest font-mono text-brand-signal font-bold">
          [ ACTIVE OPERATOR TRIGGERS ]
        </h2>
      </div>
      
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`p-4 border bg-brand-panel flex gap-4 transition-all ${
            alert.type === "danger" ? "border-red-500/20 text-red-500 shadow-[0_0_15px_-5px_rgba(239,68,68,0.2)]" :
            alert.type === "warning" ? "border-amber-400/20 text-amber-400" :
            "border-brand-signal/20 text-brand-signal"
          }`}
        >
          <div className="mt-1">
            {alert.type === "danger" ? <ShieldAlert className="w-5 h-5" /> : 
             alert.type === "warning" ? <AlertTriangle className="w-5 h-5" /> : 
             <Info className="w-5 h-5" />}
          </div>
          
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest">
              {alert.title}
            </h4>
            <p className="text-[11px] font-mono leading-relaxed opacity-80">
              {alert.description}
            </p>
            {alert.action && (
              <div className="pt-2 text-[9px] uppercase tracking-widest font-mono font-bold opacity-60">
                RECOMMENDED ACTION: {alert.action}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Internal icon dependency helper
function TerminalSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 11l2 2-2 2" />
      <path d="M11 13h4" />
    </svg>
  );
}
