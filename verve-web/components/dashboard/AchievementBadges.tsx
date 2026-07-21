"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAchievements, type AchievementData } from "@/lib/api/client";

const ICONS: Record<string, string> = {
  star: "★",
  trophy: "🏆",
  lightning: "⚡",
  fire: "🔥",
  shield: "🛡️",
  brain: "🧠",
  speech: "💬",
  target: "🎯",
};

export default function AchievementBadges() {
  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAchievements()
      .then(setAchievements)
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  if (achievements.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 font-heading text-lg font-semibold text-text-primary">Achievements</h3>
      <div className="flex flex-wrap gap-3">
        {unlocked.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-lg"
            title={`${a.name}: ${a.description}`}
          >
            <span role="img" aria-label={a.name}>{ICONS[a.icon] ?? "★"}</span>
          </motion.div>
        ))}
        {locked.slice(0, 4).map((a) => (
          <div
            key={a.id}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-elevated text-lg opacity-30 grayscale"
            title={`Locked: ${a.name}`}
          >
            <span role="img" aria-label="Locked achievement">{ICONS[a.icon] ?? "★"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
