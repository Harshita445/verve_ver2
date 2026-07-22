"use client";

import { motion } from "framer-motion";

function WaveformBars() {
  return (
    <div className="flex items-end justify-center gap-[3px] h-12">
      {[12, 20, 8, 28, 16, 32, 14, 24, 10, 18, 6, 22, 30, 10, 26].map(
        (height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: [height * 0.4, height, height * 0.3, height * 0.8, height * 0.4],
              opacity: 1,
            }}
            transition={{
              duration: 1.5,
              delay: 0.5 + i * 0.08,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
            className="w-[3px] rounded-full bg-gold/40"
          />
        )
      )}
    </div>
  );
}

export default function StageReveal({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.92,
        }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.4 }}
        className="relative"
      >
        <svg
          width="360"
          height="440"
          viewBox="0 0 360 440"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="mainSpotlight" cx="50%" cy="0%" r="85%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
              <stop offset="40%" stopColor="#D4AF37" stopOpacity="0.1" />
              <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="warmGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="podiumBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A2A2A" />
              <stop offset="40%" stopColor="#3A1A1A" />
              <stop offset="100%" stopColor="#2A1010" />
            </linearGradient>
            <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2A1010" />
              <stop offset="100%" stopColor="#1A0808" />
            </linearGradient>
          </defs>

          <rect
            x="0"
            y="0"
            width="360"
            height="440"
            fill="url(#mainSpotlight)"
          />

          <rect
            x="0"
            y="0"
            width="360"
            height="440"
            fill="url(#warmGlow)"
          />

          <ellipse
            cx="180"
            cy="410"
            rx="160"
            ry="16"
            fill="url(#floorGrad)"
          />
          <ellipse
            cx="180"
            cy="408"
            rx="160"
            ry="16"
            stroke="#4A2A2A"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
          />

          <rect
            x="145"
            y="250"
            width="70"
            height="100"
            rx="6"
            fill="url(#podiumBody)"
            stroke="#4A2A2A"
            strokeWidth="1"
          />
          <rect
            x="140"
            y="345"
            width="80"
            height="12"
            rx="4"
            fill="#2A1010"
            stroke="#4A2A2A"
            strokeWidth="1"
          />
          <rect
            x="150"
            y="245"
            width="60"
            height="10"
            rx="4"
            fill="#4A2A2A"
          />

          <rect
            x="160"
            y="275"
            width="40"
            height="3"
            rx="1.5"
            fill="#4A2A2A"
            opacity="0.4"
          />
          <rect
            x="160"
            y="295"
            width="40"
            height="3"
            rx="1.5"
            fill="#4A2A2A"
            opacity="0.4"
          />
          <rect
            x="160"
            y="315"
            width="40"
            height="3"
            rx="1.5"
            fill="#4A2A2A"
            opacity="0.4"
          />

          <rect
            x="168"
            y="347"
            width="24"
            height="7"
            rx="3"
            fill="#D4AF37"
            opacity="0.5"
          />

          <ellipse
            cx="180"
            cy="155"
            rx="28"
            ry="32"
            fill="#1C1010"
            stroke="#4A2A2A"
            strokeWidth="1.5"
          />

          <path
            d="M156 218 Q156 185 180 185 Q204 185 204 218"
            fill="#1C1010"
            stroke="#4A2A2A"
            strokeWidth="1.5"
          />
          <path
            d="M162 208 Q180 240 198 208"
            fill="none"
            stroke="#4A2A2A"
            strokeWidth="1.5"
            opacity="0.4"
          />

          <ellipse cx="174" cy="150" rx="4" ry="5" fill="#4A2A2A" opacity="0.35" />
          <ellipse cx="186" cy="150" rx="4" ry="5" fill="#4A2A2A" opacity="0.35" />

          <path
            d="M173 166 Q180 172 187 166"
            fill="none"
            stroke="#4A2A2A"
            strokeWidth="1.5"
            opacity="0.35"
          />

          <rect
            x="177"
            y="185"
            width="6"
            height="14"
            rx="3"
            fill="#4A2A2A"
            opacity="0.4"
          />

          <circle cx="180" cy="120" r="4" fill="#D4AF37" opacity="0.35" />
          <circle cx="180" cy="120" r="8" fill="#D4AF37" opacity="0.12" />
          <circle cx="180" cy="120" r="14" fill="#D4AF37" opacity="0.05" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : 15,
        }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeInOut" }}
        className="mt-8"
      >
        <WaveformBars />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: visible ? 1 : 0,
          y: visible ? 0 : 10,
        }}
        transition={{ duration: 0.6, delay: 1.2, ease: "easeInOut" }}
        className="mt-6 flex items-center gap-3"
      >
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="h-2.5 w-2.5 rounded-full bg-success"
          aria-hidden="true"
        />
        <span className="text-sm font-medium uppercase tracking-[0.15em] text-gold/60" aria-label="Recording indicator">
          Recording
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0,
        }}
        transition={{ duration: 0.4, delay: 0.6, ease: "easeInOut" }}
        className="mt-4"
      >
        <svg
          width="24"
          height="36"
          viewBox="0 0 24 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="text-gold"
        >
          <rect
            x="9"
            y="2"
            width="6"
            height="18"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.4"
          />
          <path
            d="M5 14a7 7 0 0 0 14 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
          <line
            x1="12"
            y1="23"
            x2="12"
            y2="32"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
          <line
            x1="8"
            y1="32"
            x2="16"
            y2="32"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
