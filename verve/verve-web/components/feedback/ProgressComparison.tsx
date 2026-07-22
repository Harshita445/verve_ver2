"use client";

import { motion } from "framer-motion";
import type { ProgressDelta } from "@/lib/api/client";

type Props = {
  deltas: ProgressDelta[];
};

export default function ProgressComparison({ deltas }: Props) {
  if (deltas.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold text-text-primary">
        Progress vs Previous Session
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        How your scores changed compared to your last session.
      </p>

      <div className="mt-8 space-y-3">
        {deltas.map((delta, i) => (
          <motion.div
            key={delta.skill_name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
            className="flex items-center justify-between rounded-card border border-border bg-card px-5 py-3 shadow-soft"
          >
            <span className="text-sm font-medium text-text-primary">
              {delta.skill_name}
            </span>
            <span
              className={`font-heading text-lg font-semibold ${
                delta.change > 0 ? "text-success" : "text-error"
              }`}
            >
              {delta.change > 0 ? "+" : ""}
              {delta.change}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
