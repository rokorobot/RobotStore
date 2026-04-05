/**
 * src/app/admin/calibration/page.tsx
 *
 * RobotStore Calibration Dashboard.
 * Standardized tactical interface for tuning the deterministic engine.
 */

import React from "react";
import { 
  getExecutiveHealth, 
  getConfidenceMatrix, 
  getReasonPerformance, 
  getFulfillmentFriction, 
  getOverridePressure, 
  getDailyTrend, 
  getSlugOverride, 
  getLowFunnel 
} from "@/lib/analytics/calibration-queries";
import { CalibrationKPI } from "@/components/admin/calibration/calibration-kpi";
import { CalibrationChart } from "@/components/admin/calibration/calibration-chart";
import { DecisionMatrix } from "@/components/admin/calibration/decision-matrix";
import { OperatorAlerts } from "@/components/admin/calibration/operator-alerts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Activity, LayoutDashboard, Target, MessageSquare, Gauge, RefreshCcw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalibrationPage() {
  // Parallel Data Fetching
  const [
    kpis,
    matrix,
    reasons,
    friction,
    overrides,
    trend,
    slugOverrides,
    funnel
  ] = await Promise.all([
    getExecutiveHealth(30),
    getConfidenceMatrix(),
    getReasonPerformance(),
    getFulfillmentFriction(),
    getOverridePressure(),
    getDailyTrend(30),
    getSlugOverride(),
    getLowFunnel()
  ]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-6 lg:p-10 font-mono">
      {/* Header / Global Filters */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-signal/20 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2 text-brand-signal">
            <Activity className="w-6 h-6 animate-pulse" />
            <h1 className="text-2xl font-bold uppercase tracking-[0.2em] italic">
              Calibration Console v1.0
            </h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-brand-text/40">
            {">"} OPERATIONAL TELEMETRY — DETERMINISTIC ENGINE TUNING — LAST 30 DAYS
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-brand-panel p-2 border border-brand-text/10">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-brand-text/40 mb-1">Lookback</span>
            <select className="bg-transparent text-[10px] uppercase tracking-widest font-bold focus:outline-none">
              <option>30 DAYS</option>
              <option>7 DAYS</option>
              <option>90 DAYS</option>
            </select>
          </div>
          <div className="w-px h-8 bg-brand-text/10" />
          <button className="text-[10px] uppercase tracking-widest font-bold text-brand-signal hover:opacity-80 transition-opacity">
            [ UPDATE VIEW ]
          </button>
        </div>
      </header>

      {/* Row 1 — Executive Health KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-10">
        <CalibrationKPI 
          label="Total Sessions" 
          value={kpis.result_sessions} 
          status="neutral" 
          description="Diagnostic Entries"
        />
        <CalibrationKPI 
          label="CTR" 
          value={`${(kpis.cta_click_rate * 100).toFixed(2)}%`} 
          status={kpis.cta_click_rate > 0.15 ? "good" : "warning"} 
          description="Intent Frequency"
        />
        <CalibrationKPI 
          label="Completion" 
          value={`${(kpis.completion_rate * 100).toFixed(2)}%`} 
          status={kpis.completion_rate > 0.05 ? "good" : "danger"} 
          description="Commercial Yield"
        />
        <CalibrationKPI 
          label="Override Rate" 
          value={`${(kpis.override_rate * 100).toFixed(2)}%`} 
          status={kpis.override_rate < 0.15 ? "good" : "warning"} 
          description="Model Resistance"
        />
        <CalibrationKPI 
          label="HIGH Yield" 
          value={`${(kpis.high_completion_rate * 100).toFixed(2)}%`} 
          status={kpis.high_completion_rate > kpis.completion_rate ? "good" : "danger"} 
          description="Cert. Precision"
        />
        <CalibrationKPI 
          label="MED Compare" 
          value={`${(kpis.medium_compare_rate * 100).toFixed(2)}%`} 
          status={kpis.medium_compare_rate > 0.10 ? "good" : "neutral"} 
          description="Utility Matrix"
        />
        <CalibrationKPI 
          label="LOW Recovery" 
          value={`${(kpis.low_refinement_rate * 100).toFixed(2)}%`} 
          status={kpis.low_refinement_rate > 0.15 ? "good" : "warning"} 
          description="Coaching Health"
        />
        <CalibrationKPI 
          label="Fulfillment" 
          value={`${(kpis.checkout_redirect_rate * 100).toFixed(2)}%`} 
          status="neutral" 
          description="Redirect health"
        />
      </div>

      <Tabs defaultValue="calibration" className="space-y-8">
        <TabsList className="bg-brand-panel border border-brand-text/10 p-1 flex justify-start gap-4 mb-4">
          <TabsTrigger value="calibration" className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-4 py-2 data-[state=active]:bg-brand-signal data-[state=active]:text-brand-bg transition-all">
            <LayoutDashboard className="w-3 h-3" /> Calibration
          </TabsTrigger>
          <TabsTrigger value="reasoning" className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-4 py-2 data-[state=active]:bg-brand-signal data-[state=active]:text-brand-bg transition-all">
            <Target className="w-3 h-3" /> Reasoning
          </TabsTrigger>
          <TabsTrigger value="fulfillment" className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-4 py-2 data-[state=active]:bg-brand-signal data-[state=active]:text-brand-bg transition-all">
            <MessageSquare className="w-3 h-3" /> Fulfillment
          </TabsTrigger>
          <TabsTrigger value="overrides" className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-4 py-2 data-[state=active]:bg-brand-signal data-[state=active]:text-brand-bg transition-all">
            <Gauge className="w-3 h-3" /> Overrides
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-4 py-2 data-[state=active]:bg-brand-signal data-[state=active]:text-brand-bg transition-all">
            <RefreshCcw className="w-3 h-3" /> Recovery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calibration" className="space-y-10 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <DecisionMatrix 
                title="Confidence Calibration Matrix"
                data={matrix?.data || []}
                columns={[
                  { header: "LEVEL", accessor: "confidence_level", sortKey: "confidence_level" },
                  { header: "SESSIONS", accessor: "sessions", sortKey: "sessions", align: "right" },
                  { header: "CTR", accessor: (row) => `${(row.click_rate * 100).toFixed(2)}%`, sortKey: "click_rate", align: "right" },
                  { header: "COMPLETION", accessor: (row) => `${(row.completion_rate * 100).toFixed(2)}%`, sortKey: "completion_rate", align: "right" },
                  { header: "OVERRIDE", accessor: (row) => `${(row.override_rate * 100).toFixed(2)}%`, sortKey: "override_rate", align: "right" }
                ]}
              />
              <OperatorAlerts metrics={kpis} />
            </div>
            
            <div className="space-y-6">
              <div className="bg-brand-panel p-4 border border-brand-text/10">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-mono text-brand-signal font-bold mb-6">
                  Confidence Gap Distribution
                </h3>
                {/* Manual check: histogram bucket labels as xKey */}
                <CalibrationChart 
                   type="histogram"
                   data={[]} // Mock until query is ready: (await supabase.from('v_confidence_gap_distribution').select('*'))
                   xKey="gap_bucket"
                   yKeys={["sessions"]}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reasoning" className="space-y-8">
           <DecisionMatrix 
              title="Reason Effectiveness Matrix"
              data={reasons?.data || []}
              columns={[
                { header: "DIMENSION", accessor: "dominant_dimension", sortKey: "dominant_dimension" },
                { header: "TYPE", accessor: "reason_type", sortKey: "reason_type" },
                { header: "EXPOSURES", accessor: "exposures", sortKey: "exposures", align: "right" },
                { header: "CTR", accessor: (row) => `${(row.click_rate * 100).toFixed(2)}%`, sortKey: "click_rate", align: "right" },
                { header: "COMPLETION", accessor: (row) => `${(row.completion_rate * 100).toFixed(2)}%`, sortKey: "completion_rate", align: "right" }
              ]}
           />
        </TabsContent>
        
        <TabsContent value="fulfillment" className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DecisionMatrix 
                title="Fulfillment Friction Analysis"
                data={friction?.data || []}
                columns={[
                  { header: "FULFILLMENT", accessor: "fulfillment_type", sortKey: "fulfillment_type" },
                  { header: "ACTION", accessor: "primary_action", sortKey: "primary_action" },
                  { header: "CLICK RATE", accessor: (row) => `${(row.click_rate * 100).toFixed(2)}%`, sortKey: "click_rate", align: "right" },
                  { header: "COMPLETION", accessor: (row) => `${(row.completion_rate * 100).toFixed(2)}%`, sortKey: "completion_rate", align: "right" },
                  { header: "DROPOFF", accessor: (row) => `${(row.dropoff_after_click * 100).toFixed(2)}%`, sortKey: "dropoff_after_click", align: "right" }
                ]}
              />
              <div className="bg-brand-panel p-4 border border-brand-text/10">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-mono text-brand-signal font-bold mb-6">
                  Daily Funnel Trend
                </h3>
                <CalibrationChart 
                  type="line"
                  data={trend?.data || []}
                  xKey="day"
                  yKeys={["sessions", "clicks", "completions"]}
                />
              </div>
           </div>
        </TabsContent>

        <TabsContent value="overrides" className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DecisionMatrix 
                title="Override Pressure Summary"
                data={overrides?.data || []}
                columns={[
                  { header: "USE CASE", accessor: "use_case", sortKey: "use_case" },
                  { header: "CONFIDENCE", accessor: "confidence_level", sortKey: "confidence_level" },
                  { header: "DIMENSION", accessor: "dominant_dimension", sortKey: "dominant_dimension" },
                  { header: "OVERRIDE RATE", accessor: (row) => `${(row.override_rate * 100).toFixed(2)}%`, sortKey: "override_rate", align: "right" },
                  { header: "AVG RANK", accessor: "avg_selected_rank", sortKey: "avg_selected_rank", align: "right" }
                ]}
              />
              <DecisionMatrix 
                title="Unit-Level Resistance"
                data={slugOverrides?.data || []}
                columns={[
                  { header: "SELECTED SLUG", accessor: "selected_slug", sortKey: "selected_slug" },
                  { header: "USE CASE", accessor: "use_case", sortKey: "use_case" },
                  { header: "SESSIONS", accessor: "sessions", sortKey: "sessions", align: "right" },
                  { header: "OVERRIDE RATE", accessor: (row) => `${(row.override_rate * 100).toFixed(2)}%`, sortKey: "override_rate", align: "right" }
                ]}
              />
           </div>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-8">
          <div className="bg-brand-panel p-6 border border-brand-text/10">
             <h3 className="text-[10px] uppercase tracking-[0.2em] font-mono text-brand-signal font-bold mb-8">
               Low-Confidence Decision Funnel
             </h3>
             <div className="grid grid-cols-4 gap-8">
                {funnel?.data?.map((stage: any, i: number) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-2xl font-mono text-brand-signal mb-1">
                      {stage.sessions}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-brand-text/40 font-bold">
                      {stage.stage.replace("_", " ")}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
