"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { NextChallenge as NextChallengeType } from "@/lib/api/client";

type Props = {
  challenge: NextChallengeType | null;
};

export default function NextChallenge({ challenge }: Props) {
  if (!challenge) return null;

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold text-text-primary">
        Recommended Next Challenge
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Based on your performance, here&apos;s what to try next.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-6 rounded-card border border-gold/20 bg-card p-6 shadow-soft"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-gold/60">
              Recommended Mode
            </p>
            <p className="mt-1 font-heading text-2xl font-semibold capitalize text-text-primary">
              {challenge.mode}
            </p>
            <p className="mt-1 text-sm capitalize text-text-muted">
              {challenge.difficulty}
            </p>
          </div>
          <Link
            href={`/training/setup?mode=${challenge.mode}`}
            className="inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-burgundy-dark transition-all duration-300 hover:translate-y-[-1px] hover:shadow-glow"
          >
            Start Challenge
          </Link>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          {challenge.reason}
        </p>
      </motion.div>
    </div>
  );
}
