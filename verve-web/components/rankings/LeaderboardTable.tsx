"use client";

type Entry = {
  rank: number;
  name: string;
  rating: number;
  strength: string;
  streak: number;
  isCurrentUser?: boolean;
};

const entries: Entry[] = [
  { rank: 1, name: "Alex Chen", rating: 1482, strength: "Storytelling", streak: 12 },
  { rank: 2, name: "Samira Patel", rating: 1445, strength: "Debate", streak: 8 },
  { rank: 3, name: "Marcus Webb", rating: 1420, strength: "Impromptu", streak: 6 },
  { rank: 4, name: "Jordan Lee", rating: 1398, strength: "Interview", streak: 5, isCurrentUser: true },
  { rank: 5, name: "Taylor Quinn", rating: 1375, strength: "Debate", streak: 4 },
  { rank: 6, name: "Riley Zhang", rating: 1350, strength: "Storytelling", streak: 3 },
  { rank: 7, name: "Casey Brooks", rating: 1320, strength: "Impromptu", streak: 2 },
  { rank: 8, name: "Morgan Walsh", rating: 1295, strength: "Interview", streak: 1 },
];

export default function LeaderboardTable() {
  return (
    <div className="overflow-hidden rounded-card border border-border">
      <div className="grid grid-cols-5 gap-4 border-b border-border bg-elevated px-6 py-4 text-xs font-medium uppercase tracking-[0.15em] text-text-muted">
        <span>Rank</span>
        <span className="col-span-2">Participant</span>
        <span>Rating</span>
        <span>Streak</span>
      </div>

      {entries.map((entry, i) => (
        <div
          key={entry.rank}
          className={`grid grid-cols-5 gap-4 border-b border-border px-6 py-4 text-sm transition-colors last:border-0 ${
            entry.isCurrentUser
              ? "bg-gold/5"
              : i % 2 === 0
                ? "bg-card"
                : "bg-transparent"
          }`}
        >
          <div className="flex items-center gap-2">
            {entry.rank <= 3 ? (
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  entry.rank === 1
                    ? "bg-gold text-[#4A131C]"
                    : entry.rank === 2
                      ? "bg-text-muted text-background"
                      : "bg-burgundy text-gold"
                }`}
              >
                {entry.rank}
              </span>
            ) : (
              <span className="ml-1 text-text-muted">{entry.rank}</span>
            )}
          </div>

          <div className="col-span-2 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-elevated text-xs font-medium text-text-primary">
              {entry.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className={`font-medium ${entry.isCurrentUser ? "text-gold" : "text-text-primary"}`}>
                {entry.name}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-gold/60">
                    You
                  </span>
                )}
              </p>
              <p className="text-xs text-text-muted">{entry.strength}</p>
            </div>
          </div>

          <div className="flex items-center font-heading text-base font-semibold text-text-primary">
            {entry.rating}
          </div>

          <div className="flex items-center gap-1.5 text-text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span>{entry.streak}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
