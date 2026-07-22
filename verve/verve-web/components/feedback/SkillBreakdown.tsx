"use client";

import { motion } from "framer-motion";
import type { SkillDetail } from "@/lib/api/client";

type Props = {
  skills: SkillDetail[];
};

const scoreColor = (score: number) => {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-gold/70";
  if (score >= 40) return "bg-warning/70";
  return "bg-error/70";
};

export default function SkillBreakdown({ skills }: Props) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold text-text-primary">
        Skill Breakdown
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        How you performed across key communication dimensions.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06, duration: 0.35 }}
            className="rounded-card border border-border bg-card p-5 shadow-soft"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-heading text-lg font-medium text-text-primary">
                {skill.name}
              </span>
              <span className="font-heading text-2xl font-semibold text-gold">
                {skill.score}
              </span>
            </div>

            <div
              className="mb-3 h-1.5 overflow-hidden rounded-full bg-elevated"
              role="progressbar"
              aria-valuenow={skill.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${skill.name} score: ${skill.score} out of 100`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.score}%` }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: "easeInOut" }}
                className={`h-full rounded-full ${scoreColor(skill.score)}`}
              />
            </div>

            <p className="text-sm leading-relaxed text-text-muted">{skill.description}</p>
            <p className="mt-2 text-sm leading-relaxed text-gold/80">
              <span className="text-xs font-medium uppercase tracking-[0.1em] text-gold/60">
                Tip:{" "}
              </span>
              {skill.improvement_tip}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
