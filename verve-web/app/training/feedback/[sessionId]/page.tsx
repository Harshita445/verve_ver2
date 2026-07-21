"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  getSessionResult,
  updateSession,
  type SessionResult,
} from "@/lib/api/client";
import RatingHero from "@/components/feedback/RatingHero";
import PerformanceSummary from "@/components/feedback/PerformanceSummary";
import SkillBreakdown from "@/components/feedback/SkillBreakdown";
import CommunicationTimeline from "@/components/feedback/CommunicationTimeline";
import TranscriptReview from "@/components/feedback/TranscriptReview";
import SessionStats from "@/components/feedback/SessionStats";
import ReflectionSection from "@/components/feedback/ReflectionSection";
import ProgressComparison from "@/components/feedback/ProgressComparison";
import NextChallenge from "@/components/feedback/NextChallenge";

const STATUS_MESSAGES: Record<string, string> = {
  uploading: "Uploading your recording...",
  processing: "Processing your recording...",
  transcribing: "Transcribing your speech...",
  analyzing: "Analyzing communication patterns...",
  generating: "Generating feedback...",
};

const STATUS_SUBTITLES: Record<string, string> = {
  uploading: "Transferring audio to secure storage.",
  processing: "Preparing audio for transcription.",
  transcribing: "Converting speech to text using Whisper.",
  analyzing: "Evaluating structure, relevance, evidence, and delivery.",
  generating: "Compiling detailed feedback and skill scores.",
};

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [result, setResult] = useState<SessionResult | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("loading");
  const [retrying, setRetrying] = useState(false);

  const fetchResult = useCallback(() => {
    getSessionResult(sessionId)
      .then((res) => {
        setResult(res);
        setProcessingStatus(res.status);
      })
      .catch(() => {
        setProcessingStatus("failed");
      });
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    fetchResult();
    const interval = setInterval(fetchResult, 3000);
    return () => clearInterval(interval);
  }, [sessionId, fetchResult]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      await updateSession(sessionId, { status: "processing" });
      setProcessingStatus("processing");
    } catch {
      setProcessingStatus("failed");
    }
    setRetrying(false);
  }, [sessionId]);

  // ---- Loading (initial fetch not yet completed) ----
  if (processingStatus === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
          <p className="text-sm text-text-muted">Loading feedback...</p>
        </div>
      </main>
    );
  }

  // ---- Failed state ----
  if (processingStatus === "failed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-error/20 bg-error/10">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="9" />
              <line x1="10" y1="6" x2="10" y2="11" />
              <circle cx="10" cy="14" r="1" fill="#EF4444" />
            </svg>
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-error/70">
            Evaluation Failed
          </p>
          <p className="mt-2 text-text-muted">
            The evaluation pipeline encountered an error processing your recording.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-burgundy-dark transition-all duration-300 hover:shadow-glow disabled:opacity-50"
            >
              {retrying ? "Retrying..." : "Retry Evaluation"}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-full border border-border bg-transparent px-6 text-sm font-medium text-text-secondary transition-all duration-300 hover:border-text-muted"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ---- Processing (pipeline still running) ----
  if (processingStatus !== "completed") {
    const message = STATUS_MESSAGES[processingStatus] || "Processing your recording...";
    const subtitle = STATUS_SUBTITLES[processingStatus] || "";
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
          <p className="text-sm font-medium text-text-primary">{message}</p>
          {subtitle && (
            <p className="mt-2 text-xs text-text-subtle">{subtitle}</p>
          )}
          <Link
            href="/dashboard"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-burgundy-dark"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // ---- Completed ----
  if (!result?.feedback) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
          <p className="text-sm text-text-muted">Loading feedback...</p>
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
