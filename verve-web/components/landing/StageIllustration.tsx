"use client";

import { motion } from "framer-motion";

export default function StageIllustration() {
  return (
    <div className="relative flex items-center justify-center" aria-hidden="true">
      <svg
        viewBox="0 0 400 500"
        className="w-full h-auto max-w-[400px] text-gold"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient
            id="spotlight-grad"
            cx="50%"
            cy="0%"
            r="80%"
            fx="50%"
            fy="0%"
          >
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="podium-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4A2A2A" />
            <stop offset="100%" stopColor="#311A1A" />
          </linearGradient>

          <linearGradient id="stage-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#311A1A" />
            <stop offset="100%" stopColor="#1C1010" />
          </linearGradient>
        </defs>

        <motion.g
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <rect x="0" y="0" width="400" height="500" fill="url(#spotlight-grad)" />

          <ellipse cx="200" cy="200" rx="40" ry="8" fill="#D4AF37" fillOpacity="0.06" />

          <ellipse cx="200" cy="250" rx="30" ry="6" fill="#D4AF37" fillOpacity="0.04" />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
        >
          <ellipse cx="200" cy="460" rx="180" ry="16" fill="url(#stage-grad)" opacity="0.9" />
          <ellipse cx="200" cy="458" rx="180" ry="16" stroke="#4A2A2A" strokeWidth="1" fill="none" opacity="0.5" />

          <rect x="200" y="458" width="180" height="3" fill="#4A2A2A" opacity="0.3" rx="1.5" />
          <rect x="20" y="458" width="180" height="3" fill="#4A2A2A" opacity="0.3" rx="1.5" />
        </motion.g>

        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
        >
          <rect x="170" y="280" width="60" height="100" rx="4" fill="url(#podium-grad)" stroke="#4A2A2A" strokeWidth="1" />

          <rect x="165" y="370" width="70" height="12" rx="3" fill="#311A1A" stroke="#4A2A2A" strokeWidth="1" />

          <rect x="175" y="275" width="50" height="10" rx="3" fill="#4A2A2A" />

          <rect x="185" y="310" width="30" height="4" rx="2" fill="#4A2A2A" opacity="0.5" />
          <rect x="185" y="330" width="30" height="4" rx="2" fill="#4A2A2A" opacity="0.5" />
          <rect x="185" y="350" width="30" height="4" rx="2" fill="#4A2A2A" opacity="0.5" />

          <rect x="190" y="372" width="20" height="8" rx="2" fill="#D4AF37" opacity="0.6" />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeInOut" }}
        >
          <ellipse
            cx="200"
            cy="165"
            rx="28"
            ry="32"
            fill="#1C1010"
            stroke="#4A2A2A"
            strokeWidth="1.5"
            opacity="0.9"
          />

          <path
            d="M175 225 Q175 190 200 190 Q225 190 225 225"
            fill="#1C1010"
            stroke="#4A2A2A"
            strokeWidth="1.5"
            opacity="0.9"
          />

          <path
            d="M180 210 Q200 250 220 210"
            fill="none"
            stroke="#4A2A2A"
            strokeWidth="1.5"
            opacity="0.5"
          />

          <ellipse cx="195" cy="158" rx="4" ry="5" fill="#4A2A2A" opacity="0.4" />
          <ellipse cx="205" cy="158" rx="4" ry="5" fill="#4A2A2A" opacity="0.4" />

          <path
            d="M193 172 Q200 178 207 172"
            fill="none"
            stroke="#4A2A2A"
            strokeWidth="1.5"
            opacity="0.4"
          />

          <rect x="197" y="190" width="6" height="15" rx="3" fill="#4A2A2A" opacity="0.5" />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2, ease: "easeInOut" }}
        >
          <ellipse cx="200" cy="140" rx="120" ry="80" fill="url(#spotlight-grad)" opacity="0.15" />

          <path
            d="M200 140 L140 460 M200 140 L260 460"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.08"
          />
        </motion.g>

        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5, ease: "easeInOut" }}
        >
          <circle cx="200" cy="140" r="3" fill="#D4AF37" opacity="0.4" />
          <circle cx="200" cy="140" r="6" fill="#D4AF37" opacity="0.15" />
          <circle cx="200" cy="140" r="10" fill="#D4AF37" opacity="0.06" />
        </motion.g>
      </svg>
    </div>
  );
}
