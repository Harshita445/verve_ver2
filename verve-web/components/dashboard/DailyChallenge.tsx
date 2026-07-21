"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getDailyChallenge, type DailyChallenge } from "@/lib/api/client";

export default function DailyChallengeCard() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyChallenge()
      .then(setChallenge)
      .catch(() => setChallenge(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !challenge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-card border border-gold/20 bg-gradient-to-br from-gold/5 to-transparent p-6 shadow-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-gold/60">Daily Challenge</p>
          <h3 className="mt-1 font-heading text-xl font-semibold text-text-primary capitalize">{challenge.mode}</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">{challenge.prompt_text}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-text-subtle">
            <span className="capitalize">{challenge.difficulty}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{challenge.speak_seconds}s speech</span>
          </div>
        </div>
        <Link
          href={`/training?mode=${challenge.mode}`}
          className="inline-flex h-10 flex-shrink-0 items-center rounded-full bg-gold px-5 text-sm font-semibold text-burgundy-dark transition-all duration-300 hover:shadow-glow"
        >
          Start
        </Link>
      </div>
    </motion.div>
  );
}
