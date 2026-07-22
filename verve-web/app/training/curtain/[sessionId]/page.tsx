"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import CurtainOverlay from "@/components/curtain/CurtainOverlay";
import StageReveal from "@/components/curtain/StageReveal";
import ScratchpadNotes from "@/components/recording/ScratchpadNotes";
import { getSession, updateSession } from "@/lib/api/client";

export default function CurtainPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [phase, setPhase] = useState<
    "prep" | "curtain-opening" | "recording" | "redirect"
  >("prep");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [debateSide, setDebateSide] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState<string | null>(null);
  const [scratchpadEnabled, setScratchpadEnabled] = useState(false);

  useEffect(() => {
    getSession(sessionId).then((s) => {
      setCountdown(s.prep_seconds);
      setDebateSide(s.debate_side);
      setSessionMode(s.mode);
      setScratchpadEnabled(s.scratchpad_enabled);
    }).catch(() => {
      setCountdown(5);
    });
  }, [sessionId]);

  useEffect(() => {
    if (phase !== "prep" || countdown === null) return;
    if (countdown <= 0) {
      setPhase("curtain-opening");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c as number) - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  function handleCurtainOpen() {
    setPhase("recording");
    updateSession(sessionId, { status: "recording" }).catch(() => {});
  }

  useEffect(() => {
    if (phase !== "recording") return;
    const timer = setTimeout(() => setPhase("redirect"), 3000);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "redirect") return;
    router.push(`/training/record/${sessionId}`);
  }, [phase, sessionId, router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        {phase === "prep" && (
          <motion.div
            key="prep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="flex w-full max-w-lg flex-col items-center"
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 text-sm font-medium uppercase tracking-[0.25em] text-gold"
            >
              Prepare
            </motion.p>

            <motion.p
              key={countdown}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="font-heading text-7xl font-semibold text-text-primary"
            >
              {countdown}
            </motion.p>

            <p className="mt-6 text-text-muted">
              Take a moment to organize your thoughts.
            </p>

            {debateSide && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-4 inline-block rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-sm font-medium text-gold"
              >
                You are arguing <span className="uppercase">{debateSide}</span> this position
              </motion.p>
            )}

            {scratchpadEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-8 w-full"
              >
                <ScratchpadNotes />
              </motion.div>
            )}
        )}
      </AnimatePresence>

      <CurtainOverlay
        isOpen={phase === "curtain-opening" || phase === "recording" || phase === "redirect"}
        onOpenComplete={handleCurtainOpen}
      />

      <StageReveal
        visible={phase === "recording" || phase === "redirect"}
      />
    </main>
  );
}
