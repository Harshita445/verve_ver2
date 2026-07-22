"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { saveReflection } from "@/lib/api/client";

type Props = {
  sessionId: string;
};

export default function ReflectionSection({ sessionId }: Props) {
  const [mostDifficult, setMostDifficult] = useState("");
  const [improvement, setImprovement] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!mostDifficult.trim() && !improvement.trim()) return;
    setSaving(true);
    try {
      await saveReflection(sessionId, {
        most_difficult_part: mostDifficult.trim() || undefined,
        what_to_improve: improvement.trim() || undefined,
      });
      setSaved(true);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold text-text-primary">
        Reflect on Your Session
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Take a moment to think about your performance. Self-awareness is the first
        step to growth.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-8 space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            What part felt most difficult?
          </label>
          <textarea
            value={mostDifficult}
            onChange={(e) => {
              setMostDifficult(e.target.value);
              setSaved(false);
            }}
            rows={3}
            placeholder="e.g. Staying on topic when I got nervous..."
            className="w-full rounded-card border border-border bg-elevated px-4 py-3 text-sm text-text-primary placeholder-text-subtle transition-colors duration-200 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            What would you improve next time?
          </label>
          <textarea
            value={improvement}
            onChange={(e) => {
              setImprovement(e.target.value);
              setSaved(false);
            }}
            rows={3}
            placeholder="e.g. I would pause more and use concrete examples..."
            className="w-full rounded-card border border-border bg-elevated px-4 py-3 text-sm text-text-primary placeholder-text-subtle transition-colors duration-200 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={saving || (!mostDifficult.trim() && !improvement.trim())}
            className="inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-burgundy-dark transition-all duration-300 hover:translate-y-[-1px] hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Reflection"}
          </button>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-success"
            >
              Saved
            </motion.span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
