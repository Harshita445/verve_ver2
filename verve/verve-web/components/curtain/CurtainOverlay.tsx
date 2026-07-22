"use client";

import { motion } from "framer-motion";

type Props = {
  isOpen: boolean;
  onOpenComplete?: () => void;
};

export default function CurtainOverlay({ isOpen, onOpenComplete }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      <motion.div
        initial={{ x: "0%" }}
        animate={isOpen ? { x: "-100%" } : { x: "0%" }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        onAnimationComplete={onOpenComplete}
        className="relative h-full w-1/2 overflow-hidden"
      >
        <svg
          viewBox="0 0 600 1000"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="leftFabric" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3A0F18" />
              <stop offset="15%" stopColor="#5A1824" />
              <stop offset="30%" stopColor="#6E1E2A" />
              <stop offset="50%" stopColor="#5A1824" />
              <stop offset="70%" stopColor="#6E1E2A" />
              <stop offset="85%" stopColor="#4A131C" />
              <stop offset="100%" stopColor="#3A0F18" />
            </linearGradient>
            <linearGradient id="foldShadow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="30%" stopColor="rgba(0,0,0,0.15)" />
              <stop offset="50%" stopColor="rgba(0,0,0,0)" />
              <stop offset="70%" stopColor="rgba(0,0,0,0.1)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
            <linearGradient id="goldBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B8962E" />
              <stop offset="25%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#E6C866" />
              <stop offset="75%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8962E" />
            </linearGradient>
            <linearGradient id="drapeTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(110,30,42,0.6)" />
              <stop offset="100%" stopColor="rgba(110,30,42,0)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="600" height="1000" fill="url(#leftFabric)" />

          <rect x="0" y="0" width="600" height="1000" fill="url(#foldShadow)" opacity="0.5" />

          <rect x="0" y="0" width="600" height="14" fill="url(#goldBar)" />
          <rect x="0" y="14" width="600" height="4" fill="rgba(0,0,0,0.3)" />

          <rect x="0" y="0" width="600" height="60" fill="url(#drapeTop)" />

          <g opacity="0.15">
            <rect x="50" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="95" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="140" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="185" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="230" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="275" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="320" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="365" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="410" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="455" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="500" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="545" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
          </g>

          <g opacity="0.12">
            <rect x="72" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
            <rect x="162" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
            <rect x="252" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
            <rect x="342" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
            <rect x="432" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
            <rect x="522" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
          </g>

          <path
            d="M0 14 Q50 22 100 16 Q150 24 200 17 Q250 25 300 18 Q350 26 400 18 Q450 25 500 17 Q550 24 600 16 L600 38 Q550 48 500 40 Q450 50 400 42 Q350 52 300 44 Q250 54 200 46 Q150 52 100 42 Q50 48 0 38 Z"
            fill="rgba(0,0,0,0.2)"
          />
          <path
            d="M0 40 Q60 52 120 44 Q180 56 240 46 Q300 58 360 48 Q420 56 480 46 Q540 52 600 44 L600 56 Q540 64 480 56 Q420 65 360 58 Q300 67 240 56 Q180 65 120 54 Q60 62 0 52 Z"
            fill="rgba(0,0,0,0.1)"
          />

          <line
            x1="599"
            y1="0"
            x2="599"
            y2="1000"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="3"
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ x: "0%" }}
        animate={isOpen ? { x: "100%" } : { x: "0%" }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="relative h-full w-1/2 overflow-hidden"
      >
        <svg
          viewBox="0 0 600 1000"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="rightFabric" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3A0F18" />
              <stop offset="15%" stopColor="#4A131C" />
              <stop offset="30%" stopColor="#6E1E2A" />
              <stop offset="50%" stopColor="#5A1824" />
              <stop offset="70%" stopColor="#6E1E2A" />
              <stop offset="85%" stopColor="#5A1824" />
              <stop offset="100%" stopColor="#3A0F18" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="600" height="1000" fill="url(#rightFabric)" />

          <rect x="0" y="0" width="600" height="1000" fill="url(#foldShadow)" opacity="0.5" />

          <rect x="0" y="0" width="600" height="14" fill="url(#goldBar)" />
          <rect x="0" y="14" width="600" height="4" fill="rgba(0,0,0,0.3)" />

          <rect x="0" y="0" width="600" height="60" fill="url(#drapeTop)" />

          <g opacity="0.15">
            <rect x="55" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="105" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="155" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="205" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="260" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="310" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="365" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="415" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="470" y="18" width="4" height="982" rx="2" fill="#000" />
            <rect x="520" y="18" width="3" height="982" rx="1.5" fill="#000" opacity="0.7" />
            <rect x="570" y="18" width="4" height="982" rx="2" fill="#000" />
          </g>

          <g opacity="0.12">
            <rect x="78" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
            <rect x="180" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
            <rect x="282" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
            <rect x="384" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
            <rect x="486" y="18" width="6" height="982" rx="3" fill="#D4AF37" opacity="0.3" />
          </g>

          <path
            d="M0 14 Q50 22 100 16 Q150 24 200 17 Q250 25 300 18 Q350 26 400 18 Q450 25 500 17 Q550 24 600 16 L600 38 Q550 48 500 40 Q450 50 400 42 Q350 52 300 44 Q250 54 200 46 Q150 52 100 42 Q50 48 0 38 Z"
            fill="rgba(0,0,0,0.2)"
          />
          <path
            d="M0 40 Q60 52 120 44 Q180 56 240 46 Q300 58 360 48 Q420 56 480 46 Q540 52 600 44 L600 56 Q540 64 480 56 Q420 65 360 58 Q300 67 240 56 Q180 65 120 54 Q60 62 0 52 Z"
            fill="rgba(0,0,0,0.1)"
          />
        </svg>
      </motion.div>
    </div>
  );
}
