"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LeaderboardTable from "@/components/rankings/LeaderboardTable";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api/client";

export default function RankingsPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((res) => setEntries(res.entries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

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
            Rankings
          </p>
          <h1 className="font-heading text-4xl font-semibold text-text-primary">
            Communication Rankings
          </h1>
          <p className="mt-2 text-text-muted">
            Top communicators ranked by overall performance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeInOut" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
            </div>
          ) : (
            <LeaderboardTable entries={entries} />
          )}
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-text-muted">
          <span>Updated live</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>Based on communication rating</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>1+ session required</span>
        </div>
      </div>
    </main>
  );
}
