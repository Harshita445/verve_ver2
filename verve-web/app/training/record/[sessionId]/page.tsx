"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { getSession, updateSession, uploadAudio } from "@/lib/api/client";
import Waveform from "@/components/recording/Waveform";
import PromptCard from "@/components/recording/PromptCard";
import MicPermission from "@/components/recording/MicPermission";

const FALLBACK_PROMPTS: Record<string, string> = {
  impromptu: "Describe a failure that changed your perspective.",
  debate: "Social media does more harm than good. Defend or oppose this statement.",
  interview: "Tell me about a time you had to lead a team through a difficult situation.",
  storytelling: "Recall a moment when you felt completely out of your depth. What happened?",
};

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function RecordingPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] = useState<{
    mode: string;
    prompt_text: string | null;
    prep_seconds: number;
    speak_seconds: number;
  } | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [phase, setPhase] = useState<"countdown" | "recording" | "completed" | "saving">("countdown");
  const [countdownValue, setCountdownValue] = useState(3);
  const [redirecting, setRedirecting] = useState(false);

  const recorder = useAudioRecorder();
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    getSession(sessionId)
      .then((s) => {
        setSessionData({
          mode: s.mode,
          prompt_text: s.prompt_text,
          prep_seconds: s.prep_seconds,
          speak_seconds: s.speak_seconds,
        });
      })
      .catch(() => {
        setSessionData({
          mode: "impromptu",
          prompt_text: null,
          prep_seconds: 30,
          speak_seconds: 120,
        });
      })
      .finally(() => setLoadingSession(false));
  }, [sessionId]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdownValue <= 0) {
      recorder.startRecording();
      setPhase("recording");
      return;
    }
    const timer = setTimeout(() => setCountdownValue((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdownValue, recorder]);

  useEffect(() => {
    if (recorder.state === "ready") {
      setPhase("countdown");
    }
  }, [recorder.state]);

  const speakMs = (sessionData?.speak_seconds ?? 120) * 1000;

  useEffect(() => {
    if (phase !== "recording" || stopRequestedRef.current) return;
    if (recorder.elapsedMs >= speakMs) {
      stopRequestedRef.current = true;
      recorder.stopRecording();
      setPhase("completed");
    }
  }, [phase, recorder.elapsedMs, speakMs, recorder]);

  const handleStop = useCallback(() => {
    if (stopRequestedRef.current) return;
    stopRequestedRef.current = true;
    recorder.stopRecording();
    setPhase("completed");
  }, [recorder]);

  const handleSaveAndReview = useCallback(async () => {
    setPhase("saving");
    try {
      const blob = recorder.audioBlob;
      if (blob) {
        const file = new File([blob], `recording-${sessionId}.webm`, {
          type: blob.type || "audio/webm",
        });
        await uploadAudio(sessionId, file);
      }
      const elapsedSec = Math.floor(recorder.elapsedMs / 1000);
      await updateSession(sessionId, {
        status: "processing",
        duration_seconds: elapsedSec,
      });
    } catch {
      // best-effort — session is already saved with status
    }
    setRedirecting(true);
    setTimeout(() => router.push(`/training/feedback/${sessionId}`), 800);
  }, [recorder.audioBlob, recorder.elapsedMs, sessionId, router]);

  const formatTimerValue = (ms: number) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return { min: String(min).padStart(2, "0"), sec: String(sec).padStart(2, "0") };
  };

  if (loadingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-text-muted">Loading session...</p>
      </main>
    );
  }

  if (recorder.state === "idle" || recorder.state === "requesting") {
    return (
      <MicPermission
        onAllow={recorder.requestPermission}
        onCancel={() => router.push("/dashboard")}
        loading={recorder.state === "requesting"}
      />
    );
  }

  if (recorder.state === "denied") {
    return (
      <MicPermission
        onAllow={recorder.requestPermission}
        onCancel={() => router.push("/dashboard")}
      />
    );
  }

  const mode = sessionData?.mode ?? "impromptu";
  const prompt = sessionData?.prompt_text ?? FALLBACK_PROMPTS[mode] ?? FALLBACK_PROMPTS.impromptu;
  const prepSeconds = sessionData?.prep_seconds ?? 30;
  const speakSeconds = sessionData?.speak_seconds ?? 120;
  const remainingMs = Math.max(0, speakMs - recorder.elapsedMs);
  const timer = formatTimerValue(remainingMs);
  const elapsedTimer = formatTimerValue(recorder.elapsedMs);

  const isRecording = phase === "recording" && recorder.state === "recording";
  const isPaused = phase === "recording" && recorder.state === "paused";

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_35%,rgba(212,175,55,0.06),transparent_70%)]" />

      <AnimatePresence>
        {phase === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          >
            <p className="mb-8 text-sm font-medium uppercase tracking-[0.25em] text-gold/60">
              Get Ready
            </p>
            <motion.p
              key={countdownValue}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.25 }}
              className="font-heading text-8xl font-semibold text-text-primary"
            >
              {countdownValue > 0 ? countdownValue : "Go"}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <PromptCard
              mode={mode}
              prompt={prompt}
              prepSeconds={prepSeconds}
              speakSeconds={speakSeconds}
            />
          </div>

          <AnimatePresence>
            {(isRecording || isPaused) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="hidden flex-shrink-0 text-right md:block"
              >
                <p className="font-heading text-5xl font-semibold text-text-primary tabular-nums leading-none">
                  {timer.min}<span className="text-gold/40">:</span>{timer.sec}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-text-muted">
                  Remaining
                </p>
                <div className="mt-3 flex items-center justify-end gap-2 text-sm text-text-muted tabular-nums">
                  <span>{elapsedTimer.min}:{elapsedTimer.sec}</span>
                  <span className="text-[10px] opacity-50">elapsed</span>
                  {isPaused && (
                    <span className="ml-1 text-xs font-medium text-warning">Paused</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "recording" || phase === "completed" || phase === "saving" ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-48 w-full max-w-3xl md:h-56 lg:h-64"
          >
            <Waveform
              frequencyData={recorder.frequencyData}
              isActive={isRecording}
            />
          </motion.div>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "recording" && (
              <motion.div
                key="controls"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex items-center gap-5"
              >
                <div className="flex items-center gap-3 rounded-full border border-border bg-card/80 px-5 py-2 backdrop-blur-sm">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isRecording ? "bg-success animate-pulse" : "bg-warning"
                    }`}
                  />
                  <span className="text-xs font-medium uppercase tracking-[0.1em] text-text-muted">
                    {isRecording ? "Live" : "Paused"}
                  </span>
                </div>

                {isRecording ? (
                  <button
                    onClick={recorder.pauseRecording}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-elevated text-text-secondary transition-all duration-200 hover:border-text-muted hover:text-text-primary"
                    aria-label="Pause"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="2" y="2" width="4.5" height="12" rx="1" />
                      <rect x="9.5" y="2" width="4.5" height="12" rx="1" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={recorder.resumeRecording}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-elevated text-text-secondary transition-all duration-200 hover:border-text-muted hover:text-text-primary"
                    aria-label="Resume"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <polygon points="3,1 14,8 3,15" />
                    </svg>
                  </button>
                )}

                <button
                  onClick={handleStop}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-error/30 bg-error/10 text-error transition-all duration-200 hover:border-error hover:bg-error/20"
                  aria-label="Stop"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect width="14" height="14" rx="2" />
                  </svg>
                </button>
              </motion.div>
            )}

            {phase === "completed" && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex flex-col items-center gap-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 9 6 13 16 3" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    Recording Complete
                  </span>
                  <span className="text-sm text-text-muted tabular-nums">
                    &middot; {elapsedTimer.min}:{elapsedTimer.sec}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="inline-flex h-11 items-center rounded-full border border-border bg-transparent px-6 text-sm font-medium text-text-secondary transition-all duration-300 hover:border-text-muted"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSaveAndReview}
                    className="inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-[#4A131C] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow"
                  >
                    Save & Review
                  </button>
                </div>
              </motion.div>
            )}

            {phase === "saving" && (
              <motion.div
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                <span className="text-sm text-text-muted">Saving recording...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {redirecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
            <p className="text-text-muted">Preparing your feedback...</p>
          </div>
        </motion.div>
      )}

      <div className="fixed bottom-0 left-0 right-0 md:hidden">
        <AnimatePresence>
          {(isRecording || isPaused) && (
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              className="border-t border-border bg-card/90 px-6 py-4 backdrop-blur-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${isRecording ? "bg-success animate-pulse" : "bg-warning"}`} />
                  <span className="text-xs font-medium text-text-muted">
                    {isRecording ? "Recording" : "Paused"}
                  </span>
                </div>
                <p className="font-heading text-2xl font-semibold text-text-primary tabular-nums">
                  {timer.min}:{timer.sec}
                </p>
                <p className="text-xs text-text-muted tabular-nums">
                  {elapsedTimer.min}:{elapsedTimer.sec}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
