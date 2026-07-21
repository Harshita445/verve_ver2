"use client";

import { motion } from "framer-motion";

type Props = {
  strongestSkill: string;
  strongestDescription: string;
  weakestSkill: string;
  weakestDescription: string;
  nextFocus: string;
};

const cards = [
  {
    key: "strongest",
    label: "Strongest Skill",
    accent: "text-success",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: "weakest",
    label: "Needs Improvement",
    accent: "text-warning",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: "focus",
    label: "Next Focus",
    accent: "text-gold",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function PerformanceSummary({
  strongestSkill,
  strongestDescription,
  weakestSkill,
  weakestDescription,
  nextFocus,
}: Props) {
  const data = {
    strongest: { title: strongestSkill, description: strongestDescription },
    weakest: { title: weakestSkill, description: weakestDescription },
    focus: { title: "Your Focus Area", description: nextFocus },
  };

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {cards.map((card, i) => {
        const item = data[card.key as keyof typeof data];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: "easeInOut" }}
            className="group rounded-card border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:border-gold/20 hover:shadow-glow"
          >
            <div className={`mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] ${card.accent}`}>
              <span className="opacity-70">{card.icon}</span>
              {card.label}
            </div>
            <p className="font-heading text-xl font-semibold text-text-primary md:text-2xl">
              {item.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              {item.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
