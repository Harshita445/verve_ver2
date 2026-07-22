"use client";

type Props = {
  mode: string;
  prompt: string;
  prepSeconds: number;
  speakSeconds: number;
};

export default function PromptCard({ mode, prompt, prepSeconds, speakSeconds }: Props) {
  return (
    <div className="rounded-card border border-border bg-card/80 p-8 text-center shadow-soft backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-center gap-3">
        <span className="rounded-full border border-gold/20 bg-gold/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.15em] text-gold">
          {mode}
        </span>
        <span className="rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-text-muted">
          Intermediate
        </span>
      </div>

      <p className="font-heading text-2xl font-medium leading-relaxed text-text-primary md:text-3xl">
        &ldquo;{prompt}&rdquo;
      </p>

      <div className="mt-6 flex items-center justify-center gap-6 text-sm text-text-muted">
        <span>Prep: {prepSeconds}s</span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span>Speak: {speakSeconds < 60 ? `${speakSeconds}s` : `${Math.floor(speakSeconds / 60)}m ${speakSeconds % 60}s`}</span>
      </div>
    </div>
  );
}
