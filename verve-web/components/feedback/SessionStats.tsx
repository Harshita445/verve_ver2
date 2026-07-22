"use client";

import { motion } from "framer-motion";
import type { SessionStatistics } from "@/lib/api/client";

type Props = {
  stats: SessionStatistics | null;
};

const formatStat = (value: number | null | undefined, unit: string): string => {
  if (value === null || value === undefined) return "—";
  if (unit === "wpm") return `${Math.round(value)} wpm`;
  if (unit === "s") return `${value.toFixed(1)}s`;
  if (unit === "%") return `${(value * 100).toFixed(0)}%`;
  if (unit === "words") return `${Math.round(value)}`;
  return `${value}`;
};

const statDefs: {
  key: keyof SessionStatistics;
  label: string;
  unit: string;
  icon: string;
}[] = [
  { key: "duration_seconds", label: "Duration", unit: "s", icon: "⏱" },
  { key: "words_spoken", label: "Words Spoken", unit: "words", icon: "📝" },
  { key: "speaking_rate_wpm", label: "Speaking Rate", unit: "wpm", icon: "📊" },
  { key: "longest_pause_seconds", label: "Longest Pause", unit: "s", icon: "⏸" },
  { key: "filler_word_count", label: "Fillers", unit: "words", icon: "🔤" },
  { key: "vocabulary_diversity", label: "Vocabulary Diversity", unit: "%", icon: "📖" },
  { key: "sentence_variety", label: "Sentence Variety", unit: "%", icon: "📐" },
  { key: "avg_response_length_words", label: "Avg Response Length", unit: "words", icon: "📏" },
];

export default function SessionStats({ stats }: Props) {
  if (!stats) return null;

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold text-text-primary">
        Session Statistics
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Detailed metrics about your delivery.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statDefs.map((def, i) => {
          const value = stats[def.key];
          return (
            <motion.div
              key={def.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.04, duration: 0.3 }}
              className="rounded-card border border-border bg-card p-4 shadow-soft"
            >
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
                {def.label}
              </p>
              <p className="mt-1.5 font-heading text-xl font-semibold text-gold">
                {formatStat(value, def.unit)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
