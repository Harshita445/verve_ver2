"use client";

import { motion } from "framer-motion";

type Props = {
  label: string;
  value: string | number;
  subtitle?: string;
  gold?: boolean;
  delay?: number;
};

export default function StatCard({ label, value, subtitle, gold, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeInOut" }}
      className="rounded-card border border-border bg-card p-6 shadow-soft"
    >
      <p className={`text-xs font-medium uppercase tracking-[0.15em] ${gold ? "text-gold" : "text-text-muted"}`}>
        {label}
      </p>
      <p className={`mt-1 font-heading text-3xl font-semibold ${gold ? "text-gold" : "text-text-primary"}`}>
        {value}
      </p>
      {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
    </motion.div>
  );
}
