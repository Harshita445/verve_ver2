"use client";

import { useRef, useEffect } from "react";

type Props = {
  frequencyData: Uint8Array | null;
  isActive: boolean;
  barCount?: number;
};

export default function Waveform({ frequencyData, isActive, barCount = 64 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const fallbackRef = useRef<number[]>(Array(barCount).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const centerY = h / 2;

    function draw() {
      ctx.clearRect(0, 0, w, h);

      const data = frequencyData ?? fallbackRef.current;
      const bars = barCount;
      const gap = 2;
      const barW = (w - gap * (bars - 1)) / bars;
      const maxBarHeight = h * 0.85;

      if (!isActive) {
        fallbackRef.current = fallbackRef.current.map((v) => Math.max(0, v - 1));
      } else if (!frequencyData) {
        fallbackRef.current = fallbackRef.current.map(() => Math.random() * 6);
      }

      for (let i = 0; i < bars; i++) {
        const value = frequencyData ? data[i] : fallbackRef.current[i];
        const normalized = value / 255;
        const barHeight = Math.max(1, normalized * maxBarHeight);

        const x = i * (barW + gap);
        const y = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, "rgba(212, 175, 55, 0.7)");
        gradient.addColorStop(0.5, "rgba(212, 175, 55, 0.9)");
        gradient.addColorStop(1, "rgba(212, 175, 55, 0.7)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        const r = barW / 2;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, y + barHeight - r);
        ctx.quadraticCurveTo(x + barW, y + barHeight, x + barW - r, y + barHeight);
        ctx.lineTo(x + r, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();

        if (normalized > 0.1) {
          ctx.fillStyle = "rgba(212, 175, 55, 0.15)";
          ctx.shadowColor = "rgba(212, 175, 55, 0.1)";
          ctx.shadowBlur = normalized * 12;
          ctx.fillRect(x, y, barW, barHeight);
          ctx.shadowBlur = 0;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [frequencyData, isActive, barCount]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ filter: "drop-shadow(0 0 30px rgba(212, 175, 55, 0.08))" }}
    />
  );
}
