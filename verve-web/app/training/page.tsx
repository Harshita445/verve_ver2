"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const modes = [
  {
    id: "freestyle" as const,
    title: "Freestyle",
    description: "Think clearly under pressure. Receive unexpected prompts and organize your thoughts in real time.",
    benefits: ["Quick thinking", "Structured responses", "Mental agility"],
  },
  {
    id: "debate" as const,
    title: "Debate",
    description: "Build stronger arguments. Respond to opposing viewpoints and develop persuasive reasoning.",
    benefits: ["Argument structure", "Rebuttal skills", "Persuasive logic"],
  },
  {
    id: "interview" as const,
    title: "Interview",
    description: "Practice real interview conversations. Improve structure, confidence, and clarity.",
    benefits: ["Confidence", "Concise answers", "Professional presence"],
  },
  {
    id: "storytelling" as const,
    title: "Storytelling",
    description: "Turn ideas into memorable narratives. Learn how to keep listeners engaged.",
    benefits: ["Narrative flow", "Audience engagement", "Emotional impact"],
  },
];

export default function TrainingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-gold">
            Choose Your Practice
          </p>
          <h1 className="font-heading text-4xl font-semibold text-text-primary">
            Training Modes
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            Select a mode to begin your practice session. Each mode focuses on
            different communication skills.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {modes.map((mode, i) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeInOut" }}
              whileHover={{ y: -6 }}
              onClick={() => router.push(`/training/setup?mode=${mode.id}`)}
              className="group relative flex flex-col items-start rounded-card border border-border bg-card p-8 text-left shadow-soft transition-all duration-300 hover:border-gold hover:shadow-glow"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-elevated transition-colors duration-300 group-hover:border-gold/30">
                <span className="font-heading text-2xl font-semibold text-gold">
                  {mode.title[0]}
                </span>
              </div>

              <h2 className="font-heading text-2xl font-semibold text-text-primary transition-colors duration-300 group-hover:text-gold">
                {mode.title}
              </h2>

              <p className="mt-3 leading-relaxed text-text-muted">
                {mode.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {mode.benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-text-muted"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </main>
  );
}
