"use client";

type Props = {
  scores: { label: string; value: number }[];
  size?: number;
};

export default function RadarChart({ scores, size = 280 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const levels = 5;
  const angleStep = (Math.PI * 2) / scores.length;

  function pointAt(index: number, value: number, r: number) {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: cx + r * (value / 100) * Math.cos(angle),
      y: cy + r * (value / 100) * Math.sin(angle),
    };
  }

  function gridPoint(index: number, level: number) {
    const angle = angleStep * index - Math.PI / 2;
    const r = (radius / levels) * level;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const dataPoints = scores.map((s, i) => pointAt(i, s.value, radius));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible" role="img" aria-label={`Radar chart: ${scores.map(s => `${s.label} ${s.value}%`).join(", ")}`}>
      {Array.from({ length: levels }, (_, level) => (
        <polygon
          key={level}
          points={scores
            .map((_, i) => {
              const p = gridPoint(i, level + 1);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="#4A2A2A"
          strokeWidth={1}
          opacity={0.5}
        />
      ))}

      {scores.map((_, i) => {
        const p = gridPoint(i, levels);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#4A2A2A"
            strokeWidth={1}
            opacity={0.3}
          />
        );
      })}

      <polygon
        points={scores
          .map((_, i) => {
            const p = gridPoint(i, levels);
            return `${p.x},${p.y}`;
          })
          .join(" ")}
        fill="none"
        stroke="#4A2A2A"
        strokeWidth={1}
        opacity={0.3}
      />

      <path d={dataPath} fill="rgba(212, 175, 55, 0.1)" stroke="currentColor" strokeWidth={2} className="text-gold" />

      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#D4AF37" />
      ))}

      {scores.map((_, i) => {
        const p = gridPoint(i, levels);
        const labelR = radius * 1.25;
        const angle = angleStep * i - Math.PI / 2;
        const lp = {
          x: cx + labelR * Math.cos(angle),
          y: cy + labelR * Math.sin(angle),
        };
        return (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-text-muted text-[11px]"
            fontFamily="Inter, sans-serif"
          >
            {scores[i].label}
          </text>
        );
      })}
    </svg>
  );
}
