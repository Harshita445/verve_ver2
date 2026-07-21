"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { getSessionResult, type SessionResult } from "@/lib/api/client";
import RatingHero from "@/components/feedback/RatingHero";
import PerformanceSummary from "@/components/feedback/PerformanceSummary";
import SkillBreakdown from "@/components/feedback/SkillBreakdown";
import CommunicationTimeline from "@/components/feedback/CommunicationTimeline";
import TranscriptReview from "@/components/feedback/TranscriptReview";
import SessionStats from "@/components/feedback/SessionStats";
import ReflectionSection from "@/components/feedback/ReflectionSection";
import ProgressComparison from "@/components/feedback/ProgressComparison";
import NextChallenge from "@/components/feedback/NextChallenge";

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    getSessionResult(sessionId)
      .then(setResult)
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
          <p className="text-sm text-text-muted">Loading feedback...</p>
        </div>
      </main>
    );
  }

  if (!result || !result.feedback) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-text-muted">Feedback not available yet.</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-burgundy-dark"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const f = result.feedback;
  const durMin = Math.floor((f.statistics?.duration_seconds ?? 0) / 60);
  const durSec = Math.round((f.statistics?.duration_seconds ?? 0) % 60);

  return (
    <main className="min-h-screen bg-background">
      <RatingHero
        rating={f.rating_after}
        change={f.rating_change}
        summary={f.summary ?? "You communicated clearly and structured your ideas well."}
        mode={result.feedback.strongest_skill}
        durationMinutes={durMin}
        durationSeconds={durSec}
      />

      <div className="mx-auto max-w-content space-y-section-mobile px-6 pb-section-mobile md:space-y-section-tablet md:pb-section-tablet lg:space-y-section lg:pb-section">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <PerformanceSummary
            strongestSkill={f.strongest_skill}
            strongestDescription={
              f.skills.find((s) => s.name === f.strongest_skill)?.description ??
              "Your strongest communication skill."
            }
            weakestSkill={f.weakest_skill}
            weakestDescription={
              f.skills.find((s) => s.name === f.weakest_skill)?.improvement_tip ??
              "An area to develop."
            }
            nextFocus={f.next_focus}
          />
        </motion.div>

        <SkillBreakdown skills={f.skills} />

        {f.timeline.length > 0 && (
          <CommunicationTimeline entries={f.timeline} />
        )}

        <div className="grid gap-section-mobile md:grid-cols-2 md:gap-8">
          <div className="space-y-section-mobile md:space-y-section-tablet lg:space-y-section">
            {f.statistics && <SessionStats stats={f.statistics} />}
            <ReflectionSection sessionId={sessionId} />
          </div>
          <div className="space-y-section-mobile md:space-y-section-tablet lg:space-y-section">
            <TranscriptReview
              transcriptText={result.transcript_text}
              annotations={f.transcript_annotations}
            />
            {result.progress_deltas.length > 0 && (
              <ProgressComparison deltas={result.progress_deltas} />
            )}
            {f.next_challenge && <NextChallenge challenge={f.next_challenge} />}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/dashboard"
            className="inline-flex h-[52px] items-center rounded-full border border-border bg-transparent px-7 text-base font-medium text-text-secondary transition-all duration-300 hover:border-text-muted"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/training"
            className="inline-flex h-[52px] items-center rounded-full bg-gold px-7 text-base font-semibold text-burgundy-dark transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow"
          >
            Practice Again
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
