"use client";

import { motion } from "framer-motion";

const messages = [
  "> SYSTEM ONLINE",
  "> AUTHENTICATING NODES...",
  "> UNIT RMX-400 DEPLOYED // OSTRAVA NODE",
  "> NEW OPERATOR CONNECTED",
  "> MARKET INTERFACE INITIALIZED"
];

export function SignalFeed() {
  return (
    <div className="h-8 border-b border-border bg-brand-bg flex items-center overflow-hidden relative font-mono text-[10px] sm:text-xs text-brand-signal/70 uppercase tracking-[0.2em] whitespace-nowrap">
      <motion.div
        className="flex gap-16 pr-16"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
      >
        {[...messages, ...messages, ...messages].map((m, i) => (
          <span key={i} className="flex-shrink-0">{m}</span>
        ))}
      </motion.div>
    </div>
  );
}
