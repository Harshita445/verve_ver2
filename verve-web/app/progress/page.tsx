"use client";

import { motion } from "framer-motion";
import RadarChart from "@/components/dashboard/RadarChart";
import StatCard from "@/components/dashboard/StatCard";

const radarScores = [
  { label: "Structure", value: 78 },
  { label: "Relevance", value: 85 },
  { label: "Evidence", value: 62 },
  { label: "Persuasion", value: 70 },
  { label: "Confidence", value: 74 },
  { label: "Examples", value: 55 },
];

const recentSessions = [
  { date: "Today", mode: "Impromptu", rating: 1245, change: "+12" },
  { date: "Yesterday", mode: "Debate", rating: 1233, change: "+8" },
  { date: "3 days ago", mode: "Interview", rating: 1225, change: "+5" },
  { date: "5 days ago", mode: "Storytelling", rating: 1220, change: "+3" },
];

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-content px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="mb-10"
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">
            Your Progress
          </p>
          <h1 className="font-heading text-4xl font-semibold text-text-primary">
            Communication Growth
          </h1>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard label="Rating" value="1,245" subtitle="Overall" gold delay={0} />
          <StatCard label="Sessions" value="12" subtitle="Total completed" delay={0.05} />
          <StatCard label="Streak" value="4" subtitle="Days in a row" delay={0.1} />
          <StatCard label="Best Mode" value="Debate" subtitle="Highest rated" delay={0.15} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }}
            className="rounded-card border border-border bg-card p-8 shadow-soft"
          >
            <h2 className="font-heading text-2xl font-semibold text-text-primary">
              Skill Breakdown
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Your performance across six communication dimensions.
            </p>
            <div className="mt-6 flex justify-center">
              <RadarChart scores={radarScores} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeInOut" }}
            className="rounded-card border border-border bg-card p-8 shadow-soft"
          >
            <h2 className="font-heading text-2xl font-semibold text-text-primary">
              Recent Sessions
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Your latest practice sessions and rating changes.
            </p>

            <div className="mt-6 space-y-4">
              {recentSessions.map((session, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-border bg-elevated px-5 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{session.mode}</p>
                    <p className="text-xs text-text-muted">{session.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-lg font-semibold text-text-primary">{session.rating}</p>
                    <p className="text-xs font-medium text-success">+{session.change}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
