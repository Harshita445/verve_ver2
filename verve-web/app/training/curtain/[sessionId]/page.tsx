"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import CurtainOverlay from "@/components/curtain/CurtainOverlay";
import StageReveal from "@/components/curtain/StageReveal";

export default function CurtainPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [phase, setPhase] = useState<"prep" | "curtain" | "recording" | "done">("prep");
  const [countdown, setCountdown] = useState(5);
  const [curtainOpen, setCurtainOpen] = useState(false);

  useEffect(() => {
    if (phase !== "prep" || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setPhase("curtain");
          setCurtainOpen(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, countdown]);

  function handleCurtainComplete() {
    setPhase("recording");
    setTimeout(() => {
      setPhase("done");
    }, 2000);
  }

  useEffect(() => {
    if (phase === "done") {
      router.push(`/training/record/${sessionId}`);
    }
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
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-gold">
              Prepare
            </p>
            <p className="font-heading text-6xl font-semibold text-text-primary">
              {countdown}
            </p>
            <p className="mt-4 text-text-muted">
              Take a moment to organize your thoughts.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <CurtainOverlay
        isOpen={curtainOpen}
        onOpenComplete={handleCurtainComplete}
      />

      <StageReveal visible={phase === "recording" || phase === "done"} />

      {phase === "recording" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeInOut" }}
          className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 text-center"
        >
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-text-secondary">
              Recording started
            </span>
          </div>
        </motion.div>
      )}
    </main>
  );
}
