"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { getSession, updateSession } from "@/lib/api/client";
import Waveform from "@/components/recording/Waveform";
import RecordingControls from "@/components/recording/RecordingControls";
import PromptCard from "@/components/recording/PromptCard";
import MicPermission from "@/components/recording/MicPermission";

const FALLBACK_PROMPTS: Record<string, string> = {
  impromptu: "Describe a failure that changed your perspective.",
  debate: "Social media does more harm than good. Defend or oppose this statement.",
  interview: "Tell me about a time you had to lead a team through a difficult situation.",
  storytelling: "Recall a moment when you felt completely out of your depth. What happened?",
};

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
  const [redirecting, setRedirecting] = useState(false);

  const recorder = useAudioRecorder();

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
    if (recorder.state === "ready") {
      recorder.startRecording();
    }
  }, [recorder.state, recorder.startRecording]);

  async function handleStop() {
    recorder.stopRecording();
    setRedirecting(true);
    try {
      const elapsedSec = Math.floor(recorder.elapsedMs / 1000);
      await updateSession(sessionId, {
        status: "processing",
        duration_seconds: elapsedSec,
      });
    } catch {
      // Best-effort
    }
    setTimeout(() => {
      router.push(`/training/feedback/${sessionId}`);
    }, 1500);
  }

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
        loading={false}
      />
    );
  }

  const mode = sessionData?.mode ?? "impromptu";
  const prompt = sessionData?.prompt_text ?? FALLBACK_PROMPTS[mode] ?? FALLBACK_PROMPTS.impromptu;
  const prepSeconds = sessionData?.prep_seconds ?? 30;
  const speakSeconds = sessionData?.speak_seconds ?? 120;

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_35%,rgba(212,175,55,0.06),transparent_70%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
        <div className="mb-8">
          <PromptCard
            mode={mode}
            prompt={prompt}
            prepSeconds={prepSeconds}
            speakSeconds={speakSeconds}
          />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
            className="h-48 w-full max-w-3xl md:h-56 lg:h-64"
          >
            <Waveform
              frequencyData={recorder.frequencyData}
              isActive={recorder.state === "recording"}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut", delay: 0.6 }}
          className="mt-8 rounded-card border border-border bg-card/60 p-6 shadow-soft backdrop-blur-sm"
        >
          <RecordingControls
            state={recorder.state === "stopped" ? "stopped" : recorder.state as any}
            elapsedMs={recorder.elapsedMs}
            speakSeconds={speakSeconds}
            onPause={recorder.pauseRecording}
            onResume={recorder.resumeRecording}
            onStop={handleStop}
          />
        </motion.div>
      </div>

      {redirecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
            <p className="text-text-muted">Finalizing recording...</p>
          </div>
        </motion.div>
      )}
    </main>
  );
}
