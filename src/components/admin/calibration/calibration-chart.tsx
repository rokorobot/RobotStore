/**
 * src/components/admin/calibration/calibration-chart.tsx
 *
 * Unified Recharts wrapper for the Calibration Dashboard.
 * Supports Line, Bar, and Histogram visualizations with tactical styling.
 */

"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";

interface CalibrationChartProps {
  type: "line" | "bar" | "histogram";
  data: any[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
}

export function CalibrationChart({ 
  type, 
  data, 
  xKey, 
  yKeys = [], 
  colors = ["#22c55e", "#fbbf24", "#ef4444"] 
}: CalibrationChartProps) {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-panel border border-brand-signal/20 p-3 shadow-xl backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-widest font-mono text-brand-signal font-bold border-b border-brand-signal/10 pb-1 mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4 text-[10px] font-mono mt-1">
              <span className="text-brand-text/60">{entry.name}:</span>
              <span style={{ color: entry.color }} className="font-bold">
                {typeof entry.value === 'number' ? entry.value.toFixed(4) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (type === "line") {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            axisLine={{ stroke: "#ffffff1a" }} 
            tick={{ fill: "#ffffff4d", fontSize: 10, fontFamily: "var(--font-mono)" }} 
          />
          <YAxis 
            axisLine={{ stroke: "#ffffff1a" }} 
            tick={{ fill: "#ffffff4d", fontSize: 10, fontFamily: "var(--font-mono)" }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: 20, fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }} 
          />
          {yKeys.map((key, i) => (
            <Line 
              key={key} 
              type="monotone" 
              dataKey={key} 
              stroke={colors[i % colors.length]} 
              strokeWidth={2}
              dot={{ r: 3, fill: colors[i % colors.length] }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      );
    }

    if (type === "bar" || type === "histogram") {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            axisLine={{ stroke: "#ffffff1a" }} 
            tick={{ fill: "#ffffff4d", fontSize: 10, fontFamily: "var(--font-mono)" }} 
          />
          <YAxis 
            axisLine={{ stroke: "#ffffff1a" }} 
            tick={{ fill: "#ffffff4d", fontSize: 10, fontFamily: "var(--font-mono)" }} 
          />
          <Tooltip content={<CustomTooltip />} />
          {yKeys.map((key, i) => (
            <Bar 
              key={key} 
              dataKey={key} 
              fill={colors[i % colors.length]} 
              radius={[2, 2, 0, 0]}
              barSize={type === "histogram" ? 40 : 20}
            />
          ))}
        </BarChart>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-[300px] bg-brand-panel/30 p-4 border border-brand-text/5">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart() as any}
      </ResponsiveContainer>
    </div>
  );
}
