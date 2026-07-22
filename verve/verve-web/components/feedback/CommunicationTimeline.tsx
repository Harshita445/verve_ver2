"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { TimelineEntry } from "@/lib/api/client";

type Props = {
  entries: TimelineEntry[];
};

const typeColors: Record<string, { dot: string; line: string; bg: string; border: string }> = {
  strong: {
    dot: "bg-success",
    line: "bg-success/30",
    bg: "bg-success/5",
    border: "border-success/20",
  },
  weakness: {
    dot: "bg-warning",
    line: "bg-warning/30",
    bg: "bg-warning/5",
    border: "border-warning/20",
  },
  improvement: {
    dot: "bg-gold",
    line: "bg-gold/30",
    bg: "bg-gold/5",
    border: "border-gold/20",
  },
  neutral: {
    dot: "bg-text-muted",
    line: "bg-text-muted/20",
    bg: "bg-transparent",
    border: "border-border",
  },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CommunicationTimeline({ entries }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (entries.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold text-text-primary">
        Session Timeline
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Key moments from your practice session.
      </p>

      <div className="relative mt-8">
        <div className="absolute left-[23px] top-2 h-[calc(100%-16px)] w-px bg-border" />

        <div className="space-y-4">
          {entries.map((entry, i) => {
            const colors = typeColors[entry.type] ?? typeColors.neutral;
            const isActive = activeIndex === i;

            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                onClick={() => setActiveIndex(isActive ? null : i)}
                className="group relative flex w-full items-start gap-4 text-left"
              >
                <div className="relative z-10 flex h-[46px] w-[46px] shrink-0 items-center justify-center">
                  <div
                    className={`h-3.5 w-3.5 rounded-full border-2 border-background transition-transform duration-300 ${
                      colors.dot
                    } ${isActive ? "scale-125" : "group-hover:scale-110"}`}
                  />
                </div>

                <div
                  className={`min-w-0 flex-1 rounded-card border px-4 py-3 shadow-soft transition-all duration-300 ${
                    isActive ? `${colors.bg} ${colors.border}` : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-medium text-text-subtle">
                      {formatTime(entry.timestamp_seconds)}
                    </span>
                    <span className="text-sm font-medium text-text-primary">
                      {entry.label}
                    </span>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{
                      height: isActive ? "auto" : 0,
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      {entry.description}
                    </p>
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
