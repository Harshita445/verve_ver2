"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { createSession, SessionMode } from "@/lib/api/client";

const modeLabels: Record<SessionMode, string> = {
  impromptu: "Impromptu",
  debate: "Debate",
  interview: "Interview",
  storytelling: "Storytelling",
};

const prepOptions = [15, 30, 60, 90, 120];
const speakOptions = [60, 90, 120, 180, 300];

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as SessionMode) || "impromptu";

  const [prepSeconds, setPrepSeconds] = useState(30);
  const [speakSeconds, setSpeakSeconds] = useState(120);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const session = await createSession({
        mode,
        prep_seconds: prepSeconds,
        speak_seconds: speakSeconds,
      });
      router.push(`/training/curtain/${session.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full max-w-xl"
      >
        <div className="mb-8 text-center">
          <span className="mb-2 inline-block rounded-full border border-gold/20 bg-gold/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.15em] text-gold">
            {modeLabels[mode]}
          </span>
          <h1 className="font-heading text-3xl font-semibold text-text-primary">
            Session Setup
          </h1>
          <p className="mt-2 text-text-muted">
            Configure your preparation and speaking time.
          </p>
        </div>

        <div className="rounded-card border border-border bg-card p-8 shadow-soft">
          <div className="mb-8">
            <label className="mb-4 block text-lg font-medium text-text-primary">
              Preparation Time
            </label>
            <div className="flex flex-wrap gap-3">
              {prepOptions.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setPrepSeconds(sec)}
                  className={`rounded-lg border px-5 py-3 text-sm font-medium transition-all duration-200 ${
                    prepSeconds === sec
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-elevated text-text-secondary hover:border-text-muted"
                  }`}
                >
                  {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="mb-4 block text-lg font-medium text-text-primary">
              Speaking Time
            </label>
            <div className="flex flex-wrap gap-3">
              {speakOptions.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSpeakSeconds(sec)}
                  className={`rounded-lg border px-5 py-3 text-sm font-medium transition-all duration-200 ${
                    speakSeconds === sec
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-elevated text-text-secondary hover:border-text-muted"
                  }`}
                >
                  {sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60 > 0 ? `${sec % 60}s` : ""}`}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 rounded-lg border border-border bg-elevated p-4">
            <p className="text-sm text-text-muted">
              <span className="font-medium text-text-primary">Summary:</span>{" "}
              {prepSeconds < 60 ? `${prepSeconds}s` : `${prepSeconds / 60}m`} preparation
              &middot;{" "}
              {speakSeconds < 60
                ? `${speakSeconds}s`
                : `${Math.floor(speakSeconds / 60)}m ${speakSeconds % 60}s`}{" "}
              speaking
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="inline-flex h-[52px] items-center rounded-full border border-border bg-transparent px-7 text-base font-medium text-text-secondary transition-all duration-300 hover:border-text-muted"
            >
              Back
            </button>
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex-1 inline-flex h-[52px] items-center justify-center rounded-full bg-gold px-7 text-base font-semibold text-[#4A131C] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating session..." : "Begin Practice"}
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
