"use client";

import { motion } from "framer-motion";
import type { TranscriptAnnotation } from "@/lib/api/client";

type Props = {
  transcriptText: string | null;
  annotations: TranscriptAnnotation[];
};

const typeStyles: Record<string, { badge: string; border: string }> = {
  strong: { badge: "bg-success/15 text-success border-success/30", border: "border-success/20" },
  weakness: { badge: "bg-warning/15 text-warning border-warning/30", border: "border-warning/20" },
  neutral: { badge: "bg-text-muted/10 text-text-muted border-border", border: "border-border" },
};

export default function TranscriptReview({ transcriptText, annotations }: Props) {
  if (!transcriptText && annotations.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold text-text-primary">
        Transcript Review
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Key moments with coaching notes.
      </p>

      <div className="mt-8 space-y-5">
        {annotations.length > 0 ? (
          annotations.map((ann, i) => {
            const style = typeStyles[ann.type] ?? typeStyles.neutral;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
                className={`rounded-card border ${style.border} bg-card p-5 shadow-soft`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] ${style.badge}`}
                  >
                    {ann.type === "strong" ? "Strong" : ann.type === "weakness" ? "Note" : "Neutral"}
                  </span>
                </div>
                <p className="font-heading text-base leading-relaxed text-text-primary italic">
                  &ldquo;{ann.text}&rdquo;
                </p>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {ann.annotation}
                </p>
              </motion.div>
            );
          })
        ) : transcriptText ? (
          <div className="rounded-card border border-border bg-card p-6 shadow-soft">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
              {transcriptText}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
