"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import CurtainOverlay from "@/components/curtain/CurtainOverlay";
import StageReveal from "@/components/curtain/StageReveal";
import { updateSession } from "@/lib/api/client";

export default function CurtainPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [phase, setPhase] = useState<
    "prep" | "curtain-opening" | "recording" | "redirect"
  >("prep");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (phase !== "prep") return;
    if (countdown <= 0) {
      setPhase("curtain-opening");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
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
            className="text-center"
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
          </motion.div>
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
