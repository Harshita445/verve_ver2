"use client";

import { motion } from "framer-motion";

type Props = {
  rating: number;
  change: number;
  summary: string;
  mode: string;
  durationMinutes: number;
  durationSeconds: number;
};

export default function RatingHero({
  rating,
  change,
  summary,
  mode,
  durationMinutes,
  durationSeconds,
}: Props) {
  return (
    <div className="bg-radial-burgundy">
      <div className="mx-auto max-w-content px-6 py-section-mobile md:py-section-tablet lg:py-section text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-text-muted">
            Session Complete
          </p>

          <h1 className="font-heading text-4xl font-light text-text-primary md:text-5xl lg:text-6xl">
            Your Communication
          </h1>
          <p className="mt-1 font-heading text-6xl font-semibold text-gold md:text-7xl lg:text-8xl">
            {rating.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-sm font-medium ${
                change >= 0 ? "text-success" : "text-error"
              }`}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d={change >= 0 ? "M8 3v10M4 7l4-4 4 4" : "M8 13V3M4 9l4 4 4-4"} />
              </svg>
              {change >= 0 ? "+" : ""}
              {change}
            </span>
            <span className="text-xs text-text-subtle">from previous session</span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-text-secondary md:text-xl"
          >
            {summary}
          </motion.p>

          <div className="mt-6 flex items-center justify-center gap-5 text-sm text-text-muted">
            <span className="capitalize">{mode}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>
              {durationMinutes}:{String(durationSeconds).padStart(2, "0")}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
