"use client";

import type { LeaderboardEntry } from "@/lib/api/client";

type Props = {
  entries: LeaderboardEntry[];
};

export default function LeaderboardTable({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-card border border-border bg-card p-12 text-center">
        <p className="text-sm text-text-muted">No rankings available yet.</p>
        <p className="mt-1 text-xs text-text-subtle">
          Complete sessions to appear on the leaderboard.
        </p>
      </div>
    );
  }

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
          key={entry.user_id}
          className={`grid grid-cols-5 gap-4 border-b border-border px-6 py-4 text-sm transition-colors last:border-0 ${
            entry.is_current_user
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
              {entry.avatar_initials}
            </div>
            <div>
              <p className={`font-medium ${entry.is_current_user ? "text-gold" : "text-text-primary"}`}>
                {entry.name}
                {entry.is_current_user && (
                  <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-gold/60">
                    You
                  </span>
                )}
              </p>
              {entry.strongest_skill && (
                <p className="text-xs text-text-muted">{entry.strongest_skill}</p>
              )}
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
