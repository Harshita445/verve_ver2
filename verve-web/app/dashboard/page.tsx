"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { useAuth } from "@/lib/auth/AuthProvider";
import { getProgress, type ProgressResponse } from "@/lib/api/client";
import Skeleton from "@/components/shared/Skeleton";
import AchievementBadges from "@/components/dashboard/AchievementBadges";
import DailyChallengeCard from "@/components/dashboard/DailyChallenge";

export default function DashboardPage() {
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const [progress, setProgress] = useState<ProgressResponse | null>(null);

  useEffect(() => {
    if (status === "authenticated" && user && !user.onboarding_completed) {
      router.push("/onboarding");
    }
  }, [status, user, router]);

  useEffect(() => {
    if (status === "authenticated") {
      getProgress()
        .then(setProgress)
        .catch(() => {});
    }
  }, [status]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-content space-y-6">
          <Skeleton height="36px" width="280px" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton height="140px" />
            <Skeleton height="140px" />
            <Skeleton height="140px" />
          </div>
          <Skeleton height="180px" />
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (user && !user.onboarding_completed) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Redirecting to onboarding...</p>
      </main>
    );
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const hasSessions = (progress?.total_sessions ?? 0) > 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-content px-6 py-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-text-primary">
              Welcome back, {user?.display_name}
            </h1>
            <p className="mt-1 text-text-muted">
              Continue your communication practice.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/training"
              className="inline-flex h-[52px] items-center rounded-full bg-gold px-7 text-base font-semibold text-burgundy-dark transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow"
            >
              New Session
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="rounded-card border border-border bg-card p-8 shadow-soft"
          >
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-gold">
              Rating
            </p>
            <p className="mt-2 font-heading text-5xl font-semibold text-text-primary">
              {user?.current_rating ?? "—"}
            </p>
            <p className="mt-1 text-sm text-text-muted">Communication Rating</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeInOut" }}
            className="rounded-card border border-border bg-card p-8 shadow-soft"
          >
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-text-muted">
              Sessions
            </p>
            <p className="mt-2 font-heading text-5xl font-semibold text-text-primary">
              {progress?.total_sessions ?? 0}
            </p>
            <p className="mt-1 text-sm text-text-muted">Total Practice Sessions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeInOut" }}
            className="rounded-card border border-border bg-card p-8 shadow-soft"
          >
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-text-muted">
              Streak
            </p>
            <p className="mt-2 font-heading text-5xl font-semibold text-text-primary">
              {progress?.current_streak ?? 0}
            </p>
            <p className="mt-1 text-sm text-text-muted">Day Streak</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeInOut" }}
          className="mt-8 rounded-card border border-border bg-card p-8 shadow-soft"
        >
          <h2 className="font-heading text-2xl font-semibold text-text-primary">
            Quick Start
          </h2>
          <p className="mt-2 text-text-muted">
            Choose a training mode to begin a practice session.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Impromptu", href: "/training?mode=impromptu" },
              { name: "Debate", href: "/training?mode=debate" },
              { name: "Interview", href: "/training?mode=interview" },
              { name: "Storytelling", href: "/training?mode=storytelling" },
            ].map((mode) => (
              <Link
                key={mode.name}
                href={mode.href}
                className="rounded-card border border-border bg-elevated px-6 py-5 text-center font-heading text-lg font-semibold text-text-primary transition-all duration-300 hover:border-gold hover:shadow-glow"
              >
                {mode.name}
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <DailyChallengeCard />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="rounded-card border border-border bg-card p-6 shadow-soft"
          >
            <AchievementBadges />
          </motion.div>
        </div>

        {!hasSessions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45, ease: "easeInOut" }}
            className="mt-8 rounded-card border border-dashed border-border p-12 text-center"
          >
            <p className="font-heading text-2xl font-semibold text-text-muted">
              No sessions yet
            </p>
            <p className="mt-2 text-text-muted">
              Complete your first practice session to see your feedback and
              progress here.
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
