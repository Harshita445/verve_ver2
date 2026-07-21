"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { getSession } from "@/lib/api/client";
import RadarChart from "@/components/dashboard/RadarChart";

const radarScores = [
  { label: "Structure", value: 78 },
  { label: "Relevance", value: 85 },
  { label: "Evidence", value: 62 },
  { label: "Persuasion", value: 70 },
  { label: "Confidence", value: 74 },
  { label: "Examples", value: 55 },
];

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("impromptu");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    getSession(sessionId)
      .then((s) => {
        setMode(s.mode);
        setDuration(s.duration_seconds ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-text-muted">Loading feedback...</p>
      </main>
    );
  }

  const durMin = Math.floor(duration / 60);
  const durSec = duration % 60;

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-radial-burgundy">
        <div className="mx-auto max-w-content px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-gold/60">
              Session Complete
            </p>
            <h1 className="font-heading text-5xl font-semibold text-text-primary">
              Communication
              <span className="block text-gold">Rating</span>
            </h1>

            <div className="mt-8 inline-flex items-center gap-6 rounded-2xl border border-border bg-card px-10 py-6">
              <div className="text-left">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-text-muted">
                  Rating
                </p>
                <p className="font-heading text-6xl font-semibold text-gold">1,245</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div className="text-left">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-text-muted">
                  Change
                </p>
                <p className="font-heading text-2xl font-semibold text-success">+12</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-text-muted">
              <span className="capitalize">{mode}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{durMin}:{String(durSec).padStart(2, "0")}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-content px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeInOut" }}
            className="rounded-card border border-border bg-card p-8 shadow-soft"
          >
            <h2 className="font-heading text-2xl font-semibold text-text-primary">
              Skill Breakdown
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              How you performed across key communication dimensions.
            </p>

            <div className="mt-8 space-y-5">
              {radarScores.map((skill, i) => (
                <motion.div
                  key={skill.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">{skill.label}</span>
                    <span className="font-heading text-sm font-semibold text-gold">{skill.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-elevated">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.06, ease: "easeInOut" }}
                      className="h-full rounded-full bg-gold/70"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div className="rounded-card border border-border bg-card p-8 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-primary">
                Strongest Skill
              </h2>
              <p className="mt-4 font-heading text-3xl font-semibold text-success">Relevance</p>
              <p className="mt-2 text-sm text-text-muted">
                Your responses stayed on-topic and directly addressed the prompt.
              </p>
            </div>

            <div className="rounded-card border border-border bg-card p-8 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-primary">
                Needs Improvement
              </h2>
              <p className="mt-4 font-heading text-3xl font-semibold text-warning">Examples</p>
              <p className="mt-2 text-sm text-text-muted">
                Try using specific examples and evidence to support your arguments.
              </p>
            </div>

            <div className="rounded-card border border-border bg-card p-8 shadow-soft">
              <h2 className="font-heading text-2xl font-semibold text-text-primary">
                Next Focus
              </h2>
              <p className="mt-3 text-base leading-relaxed text-text-muted">
                Use one concrete example for every major claim you make. This will
                strengthen your argument and make your message more memorable.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }}
          className="mt-8 rounded-card border border-border bg-card p-8 shadow-soft"
        >
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Transcript
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Your recorded session will appear here once processing is complete.
          </p>
          <div className="mt-6 rounded-lg border border-dashed border-border bg-elevated/50 p-8 text-center">
            <p className="text-sm text-text-muted">
              Transcript is being generated. Check back soon.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex h-[52px] items-center rounded-full border border-border bg-transparent px-7 text-base font-medium text-text-secondary transition-all duration-300 hover:border-text-muted"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/training"
            className="inline-flex h-[52px] items-center rounded-full bg-gold px-7 text-base font-semibold text-[#4A131C] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow"
          >
            Practice Again
          </Link>
        </div>
      </div>
    </main>
  );
}
