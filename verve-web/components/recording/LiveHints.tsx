"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FILLER_WORDS = /\b(um|uh|like|you know|sort of|kind of|i mean|actually|basically|literally)\b/i;
const TARGET_WPM_MIN = 120;
const TARGET_WPM_MAX = 160;
const SILENCE_THRESHOLD_MS = 4000;
const HINT_DURATION_MS = 4000;
const ANALYSIS_INTERVAL_MS = 2500;
const BUFFER_WINDOW_MS = 15000;

type LiveHint = {
  id: number;
  text: string;
};

type Props = {
  enabled: boolean;
  speakSeconds: number;
  isRecording: boolean;
  elapsedMs: number;
};

export default function LiveHints({ enabled, speakSeconds, isRecording, elapsedMs }: Props) {
  const [hint, setHint] = useState<LiveHint | null>(null);
  const hintIdRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const rollingBufferRef = useRef<
    { text: string; timestamp: number }[]
  >([]);
  const lastWordTimeRef = useRef<number>(Date.now());
  const wrapUpFiredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const dismissHint = useCallback(() => {
    setHint(null);
  }, []);

  const showHint = useCallback(
    (text: string) => {
      const id = ++hintIdRef.current;
      setHint({ id, text });
      setTimeout(() => {
        if (mountedRef.current) {
          setHint((current) => (current?.id === id ? null : current));
        }
      }, HINT_DURATION_MS);
    },
    []
  );

  const analyze = useCallback(() => {
    if (!isRecording) return;

    const now = Date.now();
    const cutoff = now - BUFFER_WINDOW_MS;
    const buffer = rollingBufferRef.current.filter(
      (entry) => entry.timestamp >= cutoff
    );
    rollingBufferRef.current = buffer;

    const recentWords = buffer.map((e) => e.text).join(" ");
    const windowMinutes =
      buffer.length > 0
        ? (buffer[buffer.length - 1].timestamp - buffer[0].timestamp) / 60000
        : 0;

    const wordCount = recentWords.split(/\s+/).filter(Boolean).length;

    // Filler-word check
    const fillerMatches = recentWords.match(FILLER_WORDS);
    const fillerCount = fillerMatches ? fillerMatches.length : 0;
    if (fillerCount >= 3) {
      showHint("Watch the filler words");
      return;
    }

    // Silence check
    const silenceMs = now - lastWordTimeRef.current;
    if (silenceMs > SILENCE_THRESHOLD_MS && buffer.length > 0) {
      showHint("Keep going");
      return;
    }

    // Pace check
    if (windowMinutes > 0.3) {
      const wpm = wordCount / windowMinutes;
      if (wpm < TARGET_WPM_MIN) {
        showHint("Pick up the pace");
        return;
      }
      if (wpm > TARGET_WPM_MAX) {
        showHint("Slow down");
        return;
      }
    }

    // Time checkpoint at 75%
    const seventyFivePctMs = (speakSeconds * 1000) * 0.75;
    if (
      !wrapUpFiredRef.current &&
      elapsedMs >= seventyFivePctMs &&
      elapsedMs > 0
    ) {
      wrapUpFiredRef.current = true;
      showHint("Start wrapping up");
      return;
    }
  }, [isRecording, speakSeconds, elapsedMs, showHint]);

  // Speech recognition setup
  useEffect(() => {
    if (!enabled || !isRecording) return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript + " ";
          }
        }
        if (finalText.trim()) {
          const now = Date.now();
          lastWordTimeRef.current = now;
          rollingBufferRef.current.push({
            text: finalText.trim(),
            timestamp: now,
          });
        }
      };

      recognition.onerror = () => {};

      recognition.start();
      recognitionRef.current = recognition;

      // Periodic analysis
      intervalRef.current = setInterval(analyze, ANALYSIS_INTERVAL_MS);

      return () => {
        try {
          recognition.stop();
        } catch {}
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } catch {
      // Silently skip — SpeechRecognition unavailable
    }
  }, [enabled, isRecording, analyze]);

  // Cleanup on unmount / stop
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {}
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
      <AnimatePresence mode="wait">
        {hint && (
          <motion.div
            key={hint.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-card/90 px-5 py-2 shadow-soft backdrop-blur-sm"
          >
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-gold">
              {hint.text}
            </span>
            <button
              onClick={dismissHint}
              className="ml-1 text-text-muted/50 transition-colors hover:text-text-muted"
              aria-label="Dismiss hint"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
