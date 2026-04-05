/**
 * src/components/admin/calibration/calibration-kpi.tsx
 *
 * Tactical KPI card for the Calibration Dashboard.
 * Includes semantic status handling for 'good', 'warning', 'danger'.
 */

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CalibrationKPIProps {
  label: string;
  value: string | number;
  delta?: number; // percentage change or similar
  status: "good" | "warning" | "danger" | "neutral";
  description?: string;
}

export function CalibrationKPI({ 
  label, 
  value, 
  delta, 
  status, 
  description 
}: CalibrationKPIProps) {
  
  const statusColors = {
    good: "text-brand-signal border-brand-signal/20 shadow-[0_0_10px_-5px_rgba(34,197,94,0.3)]",
    warning: "text-amber-400 border-amber-400/20 shadow-[0_0_10px_-5px_rgba(251,191,36,0.3)]",
    danger: "text-red-500 border-red-500/20 shadow-[0_0_10px_-5px_rgba(239,68,68,0.3)]",
    neutral: "text-brand-text/60 border-brand-text/10"
  };

  const statusIcons = {
    good: <TrendingUp className="w-3 h-3" />,
    warning: <Minus className="w-3 h-3" />,
    danger: <TrendingDown className="w-3 h-3" />,
    neutral: null
  };

  return (
    <div className={`p-4 border bg-brand-panel flex flex-col justify-between transition-all duration-300 ${statusColors[status]}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] uppercase tracking-widest font-mono font-bold">
          {label}
        </span>
        {delta !== undefined && (
          <div className="flex items-center gap-1 text-[10px] font-mono">
            {statusIcons[status]}
            {delta > 0 ? `+${delta}%` : `${delta}%`}
          </div>
        )}
      </div>
      
      <div className="text-2xl font-mono tracking-tighter mb-1">
        {value}
      </div>
      
      {description && (
        <div className="text-[9px] uppercase tracking-[0.1em] text-brand-text/40 font-mono italic">
          {description}
        </div>
      )}
    </div>
  );
}
