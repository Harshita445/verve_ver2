"use client";

import { motion } from "framer-motion";

export default function StageReveal({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-background"
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
          className="relative"
        >
          <svg
            width="320"
            height="400"
            viewBox="0 0 320 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient
                id="stage-spotlight"
                cx="50%"
                cy="0%"
                r="80%"
              >
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="stage-podium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A2A2A" />
                <stop offset="100%" stopColor="#311A1A" />
              </linearGradient>
              <linearGradient id="stage-floor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#311A1A" />
                <stop offset="100%" stopColor="#1C1010" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="320" height="400" fill="url(#stage-spotlight)" />

            <ellipse cx="160" cy="370" rx="150" ry="14" fill="url(#stage-floor)" opacity="0.9" />
            <ellipse cx="160" cy="368" rx="150" ry="14" stroke="#4A2A2A" strokeWidth="1" fill="none" opacity="0.5" />

            <rect x="130" y="220" width="60" height="90" rx="4" fill="url(#stage-podium)" stroke="#4A2A2A" strokeWidth="1" />
            <rect x="125" y="305" width="70" height="10" rx="3" fill="#311A1A" stroke="#4A2A2A" strokeWidth="1" />
            <rect x="135" y="215" width="50" height="8" rx="3" fill="#4A2A2A" />

            <rect x="145" y="245" width="30" height="3" rx="1.5" fill="#4A2A2A" opacity="0.5" />
            <rect x="145" y="260" width="30" height="3" rx="1.5" fill="#4A2A2A" opacity="0.5" />
            <rect x="145" y="275" width="30" height="3" rx="1.5" fill="#4A2A2A" opacity="0.5" />

            <rect x="150" y="306" width="20" height="7" rx="2" fill="#D4AF37" opacity="0.6" />

            <ellipse cx="160" cy="120" rx="24" ry="28" fill="#1C1010" stroke="#4A2A2A" strokeWidth="1.5" opacity="0.9" />

            <path d="M140 180 Q140 150 160 150 Q180 150 180 180" fill="#1C1010" stroke="#4A2A2A" strokeWidth="1.5" opacity="0.9" />
            <path d="M145 170 Q160 200 175 170" fill="none" stroke="#4A2A2A" strokeWidth="1.5" opacity="0.5" />

            <ellipse cx="155" cy="114" rx="3.5" ry="4" fill="#4A2A2A" opacity="0.4" />
            <ellipse cx="165" cy="114" rx="3.5" ry="4" fill="#4A2A2A" opacity="0.4" />
            <path d="M154 128 Q160 133 166 128" fill="none" stroke="#4A2A2A" strokeWidth="1.5" opacity="0.4" />

            <rect x="157" y="148" width="6" height="12" rx="3" fill="#4A2A2A" opacity="0.5" />

            <circle cx="160" cy="95" r="3" fill="#D4AF37" opacity="0.3" />
            <circle cx="160" cy="95" r="6" fill="#D4AF37" opacity="0.1" />
            <circle cx="160" cy="95" r="10" fill="#D4AF37" opacity="0.05" />

            <motion.path
              d="M70 370 Q100 350 130 360 Q160 370 190 358 Q220 346 250 365"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1"
              opacity="0.15"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
            />
            <motion.path
              d="M75 378 Q110 365 145 372 Q180 380 215 368 Q240 358 255 373"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.8"
              opacity="0.1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1.3, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: 0.6, delay: 1.5, ease: "easeInOut" }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm font-medium uppercase tracking-[0.2em] text-gold/60"
        >
          Recording
        </motion.p>
      </div>
    </motion.div>
  );
}
