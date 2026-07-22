"use client";

type Props = {
  state: "idle" | "requesting" | "denied" | "ready" | "recording" | "paused" | "stopped" | "error";
  elapsedMs: number;
  speakSeconds: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function RecordingControls({
  state,
  elapsedMs,
  speakSeconds,
  onPause,
  onResume,
  onStop,
}: Props) {
  const remainingMs = Math.max(0, speakSeconds * 1000 - elapsedMs);
  const isActive = state === "recording" || state === "paused";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            state === "recording"
              ? "bg-success animate-pulse"
              : state === "paused"
                ? "bg-warning"
                : "bg-text-muted"
          }`}
        />
        <span className="text-sm font-medium uppercase tracking-[0.1em] text-text-muted">
          {state === "recording"
            ? "Recording"
            : state === "paused"
              ? "Paused"
              : state === "stopped"
                ? "Stopped"
                : "Ready"}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-heading text-2xl font-semibold text-text-primary tabular-nums">
            {formatTime(remainingMs)}
          </p>
          <p className="text-xs text-text-muted">Remaining</p>
        </div>

        <div className="h-10 w-px bg-border" />

        <div className="text-right">
          <p className="font-heading text-xl font-medium text-text-muted tabular-nums">
            {formatTime(elapsedMs)}
          </p>
          <p className="text-xs text-text-muted">Elapsed</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isActive && (
          <>
            {state === "recording" ? (
              <button
                onClick={onPause}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-elevated text-text-secondary transition-all duration-200 hover:border-text-muted hover:text-text-primary"
                aria-label="Pause recording"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onResume}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-elevated text-text-secondary transition-all duration-200 hover:border-text-muted hover:text-text-primary"
                aria-label="Resume recording"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <polygon points="4,2 14,8 4,14" />
                </svg>
              </button>
            )}

            <button
              onClick={onStop}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-error/30 bg-error/10 text-error transition-all duration-200 hover:border-error hover:bg-error/20"
              aria-label="Stop recording"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="0" y="0" width="14" height="14" rx="2" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
