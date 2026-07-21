"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold/60">
          Error
        </p>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-burgundy-dark transition-all duration-300 hover:shadow-glow"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-full border border-border bg-transparent px-6 text-sm font-medium text-text-secondary transition-all duration-300 hover:border-text-muted"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
