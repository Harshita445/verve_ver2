"use client";

import { useState } from "react";

type Props = {
  disabled?: boolean;
  readOnly?: boolean;
};

export default function ScratchpadNotes({ disabled = false, readOnly = false }: Props) {
  const [notes, setNotes] = useState("");

  return (
    <div className="rounded-card border border-border bg-elevated p-4 shadow-soft">
      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.15em] text-gold">
        Your notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        placeholder="Jot down a few keywords to organize your thoughts..."
        className="h-[140px] w-full resize-none rounded-lg border border-border bg-card p-3 text-sm text-text-primary placeholder-text-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <p className="mt-2 text-[10px] text-text-muted/50">
        Your notes are private and not saved after this session.
      </p>
    </div>
  );
}
