"use client";

import { motion } from "framer-motion";

type Props = {
  isOpen: boolean;
  onOpenComplete?: () => void;
};

const curtainVariants = {
  closed: { scaleX: 1 },
  open: {
    scaleX: 0,
    transition: { duration: 1.2, ease: "easeInOut" },
  },
};

const curtainOriginLeft = {
  closed: { scaleX: 1, transformOrigin: "left" },
  open: {
    scaleX: 0,
    transition: { duration: 1.2, ease: "easeInOut" },
  },
};

const curtainOriginRight = {
  closed: { scaleX: 1, transformOrigin: "right" },
  open: {
    scaleX: 0,
    transition: { duration: 1.2, ease: "easeInOut" },
  },
};

export default function CurtainOverlay({ isOpen, onOpenComplete }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={curtainOriginLeft}
        onAnimationComplete={onOpenComplete}
        className="relative h-full w-1/2 overflow-hidden"
      >
        <svg
          viewBox="0 0 500 1000"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curtainLeft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4A131C" />
              <stop offset="30%" stopColor="#6E1E2A" />
              <stop offset="60%" stopColor="#5A1824" />
              <stop offset="85%" stopColor="#6E1E2A" />
              <stop offset="100%" stopColor="#4A131C" />
            </linearGradient>
            <linearGradient id="foldLeft1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
              <stop offset="50%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
            </linearGradient>
            <linearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#E6C866" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="500" height="1000" fill="url(#curtainLeft)" />

          <rect x="0" y="0" width="500" height="12" fill="url(#goldTrim)" />
          <rect x="0" y="12" width="500" height="4" fill="rgba(0,0,0,0.2)" />

          <rect x="40" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.4" />
          <rect x="80" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.3" />
          <rect x="120" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.35" />
          <rect x="160" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.25" />
          <rect x="200" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.3" />
          <rect x="240" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.35" />
          <rect x="280" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.25" />
          <rect x="320" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.3" />
          <rect x="360" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.35" />
          <rect x="400" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.25" />
          <rect x="440" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.3" />

          <path
            d="M0 16 Q60 30 120 20 Q180 35 240 25 Q300 40 360 28 Q420 38 500 20 L500 40 Q420 55 360 42 Q300 58 240 48 Q180 60 120 45 Q60 58 0 40 Z"
            fill="rgba(0,0,0,0.15)"
          />
          <path
            d="M0 50 Q80 65 160 55 Q240 70 320 58 Q400 72 500 55 L500 70 Q400 85 320 72 Q240 85 160 70 Q80 82 0 65 Z"
            fill="rgba(0,0,0,0.1)"
          />

          <rect x="0" y="16" width="500" height="2" fill="rgba(212,175,55,0.3)" />
        </svg>
      </motion.div>

      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={curtainOriginRight}
        className="relative h-full w-1/2 overflow-hidden"
      >
        <svg
          viewBox="0 0 500 1000"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curtainRight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4A131C" />
              <stop offset="30%" stopColor="#6E1E2A" />
              <stop offset="60%" stopColor="#5A1824" />
              <stop offset="85%" stopColor="#6E1E2A" />
              <stop offset="100%" stopColor="#4A131C" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="500" height="1000" fill="url(#curtainRight)" />

          <rect x="0" y="0" width="500" height="12" fill="url(#goldTrim)" />
          <rect x="0" y="12" width="500" height="4" fill="rgba(0,0,0,0.2)" />

          <rect x="60" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.3" />
          <rect x="100" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.35" />
          <rect x="140" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.25" />
          <rect x="180" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.3" />
          <rect x="220" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.35" />
          <rect x="260" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.25" />
          <rect x="300" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.3" />
          <rect x="340" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.35" />
          <rect x="380" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.25" />
          <rect x="420" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.3" />
          <rect x="460" y="0" width="3" height="1000" fill="url(#foldLeft1)" opacity="0.35" />

          <path
            d="M0 16 Q60 30 120 20 Q180 35 240 25 Q300 40 360 28 Q420 38 500 20 L500 40 Q420 55 360 42 Q300 58 240 48 Q180 60 120 45 Q60 58 0 40 Z"
            fill="rgba(0,0,0,0.15)"
          />

          <rect x="0" y="16" width="500" height="2" fill="rgba(212,175,55,0.3)" />
        </svg>
      </motion.div>
    </div>
  );
}
