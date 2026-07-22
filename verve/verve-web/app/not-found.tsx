import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold/60">
          404
        </p>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-gold px-6 text-sm font-semibold text-burgundy-dark transition-all duration-300 hover:shadow-glow"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-full border border-border bg-transparent px-6 text-sm font-medium text-text-secondary transition-all duration-300 hover:border-text-muted"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
