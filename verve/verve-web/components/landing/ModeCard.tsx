"use client";

import { motion } from "framer-motion";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
};

export default function ModeCard({ icon, title, description, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeInOut" }}
      whileHover={{ y: -4 }}
      className="group relative rounded-card border border-border bg-card p-8 transition-all duration-300 hover:border-gold hover:shadow-glow"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-elevated">
        {icon}
      </div>

      <h3 className="font-heading text-2xl font-semibold text-text-primary transition-colors duration-300 group-hover:text-gold">
        {title}
      </h3>

      <p className="mt-4 leading-relaxed text-text-muted">
        {description}
      </p>
    </motion.div>
  );
}
