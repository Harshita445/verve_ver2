"use client";

import { motion } from "framer-motion";

type Props = {
  onAllow: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function MicPermission({ onAllow, onCancel, loading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex min-h-screen items-center justify-center px-6"
    >
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-gold/20 bg-gold/5">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>

        <h1 className="font-heading text-3xl font-semibold text-text-primary">
          Microphone Access
        </h1>
        <p className="mt-3 text-text-muted">
          Verve needs microphone access to record your practice session. Your
          audio is processed securely and never shared.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={onAllow}
            disabled={loading}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-gold px-7 text-base font-semibold text-[#4A131C] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Requesting..." : "Allow Access"}
          </button>
          <button
            onClick={onCancel}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-full border border-border bg-transparent px-7 text-base font-medium text-text-secondary transition-all duration-300 hover:border-text-muted sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
