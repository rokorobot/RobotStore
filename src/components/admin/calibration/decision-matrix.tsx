/**
 * src/components/admin/calibration/decision-matrix.tsx
 *
 * Sortable, thematic table for the Calibration Dashboard.
 * Optimized for cross-sectional analysis of confidence, reasons, and overrides.
 */

"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortKey?: keyof T;
  align?: "left" | "center" | "right";
}

interface DecisionMatrixProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

export function DecisionMatrix<T extends Record<string, any>>({ 
  title, 
  data, 
  columns,
  onRowClick 
}: DecisionMatrixProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder === "asc" 
      ? String(valA).localeCompare(String(valB)) 
      : String(valB).localeCompare(String(valA));
  });

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <div className="border border-brand-text/10 bg-brand-panel/20">
      <div className="px-4 py-3 border-b border-brand-text/10 flex justify-between items-center bg-brand-panel/40">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-mono text-brand-signal font-bold">
          {title}
        </h3>
        <span className="text-[9px] font-mono text-brand-text/40 lowercase">
          {data.length} records matched
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-text/5 bg-brand-bg/50">
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className={`px-4 py-3 text-[9px] uppercase tracking-widest font-mono text-brand-text/60 font-medium ${
                    col.sortKey ? "cursor-pointer hover:text-brand-signal transition-colors" : ""
                  } text-${col.align || "left"}`}
                  onClick={() => col.sortKey && handleSort(col.sortKey)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortKey === sortKey && (
                      sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-text/5">
            {sortedData.map((row, i) => (
              <tr 
                key={i} 
                className={`hover:bg-brand-signal/5 transition-colors group ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, j) => (
                  <td 
                    key={j} 
                    className={`px-4 py-3 text-[11px] font-mono whitespace-nowrap text-${col.align || "left"}`}
                  >
                    {typeof col.accessor === "function" ? col.accessor(row) : (
                      <span className={j === 0 ? "text-brand-text font-bold" : "text-brand-text/80"}>
                        {typeof row[col.accessor as string] === "number" && !String(col.header).toLowerCase().includes("count")
                          ? (row[col.accessor as string] * 1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                          : row[col.accessor as string]}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
