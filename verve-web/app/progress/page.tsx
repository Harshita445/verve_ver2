"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RadarChart from "@/components/dashboard/RadarChart";
import StatCard from "@/components/dashboard/StatCard";
import { getProgress, type ProgressResponse } from "@/lib/api/client";

export default function ProgressPage() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgress()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => n.toLocaleString();

  const radarScores = data
    ? data.skill_averages.map((s) => ({
        label: s.name,
        value: Math.round(s.average_score),
      }))
    : [];

  const recentSessions = data?.recent_sessions ?? [];

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-4">
              <StatCard
                label="Rating"
                value={data ? fmt(data.current_rating) : "—"}
                subtitle="Current rating"
                gold
                delay={0}
              />
              <StatCard
                label="Sessions"
                value={data ? fmt(data.total_sessions) : "—"}
                subtitle="Total completed"
                delay={0.05}
              />
              <StatCard
                label="Streak"
                value={data ? fmt(data.current_streak) : "—"}
                subtitle="Days in a row"
                delay={0.1}
              />
              <StatCard
                label="Best Mode"
                value={data?.best_mode ?? "—"}
                subtitle={data?.best_mode ? "Highest rated" : "No data yet"}
                delay={0.15}
              />
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
                  Your average performance across six communication dimensions.
                </p>
                <div className="mt-6 flex justify-center">
                  {radarScores.length > 0 ? (
                    <RadarChart scores={radarScores} />
                  ) : (
                    <p className="text-sm text-text-muted py-12">
                      Complete a session to see your skill breakdown.
                    </p>
                  )}
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

                {recentSessions.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {recentSessions.map((session, i) => {
                      const date = new Date(session.created_at);
                      const dateStr = date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      return (
                        <motion.div
                          key={session.session_id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                          className="flex items-center justify-between rounded-lg border border-border bg-elevated px-5 py-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-text-primary capitalize">
                              {session.mode}
                            </p>
                            <p className="text-xs text-text-muted">{dateStr}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-heading text-lg font-semibold text-text-primary">
                              {session.overall_score}
                            </p>
                            <p
                              className={`text-xs font-medium ${
                                session.rating_change >= 0
                                  ? "text-success"
                                  : "text-error"
                              }`}
                            >
                              {session.rating_change >= 0 ? "+" : ""}
                              {session.rating_change}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-text-muted">
                    No sessions completed yet. Start practicing to see your progress.
                  </p>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
