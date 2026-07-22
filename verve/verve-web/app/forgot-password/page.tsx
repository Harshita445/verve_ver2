"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch<{ message: string }>("/api/v1/auth/forgot-password", {
        method: "POST",
        body: { email },
        skipAuthRetry: true,
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="mb-8 inline-block font-heading text-2xl font-semibold text-gold">
            Verve
          </Link>
          <h1 className="font-heading text-3xl font-semibold text-text-primary">Reset Password</h1>
          <p className="mt-2 text-text-muted">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="rounded-card border border-border bg-card p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-success/20 bg-success/5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                <polyline points="2 9 6 13 18 3" />
              </svg>
            </div>
            <p className="text-sm text-text-muted">
              If an account exists for that email, a reset link has been sent.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-medium text-gold transition-colors hover:text-gold-light"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-card border border-border bg-card p-8 shadow-soft">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">Email</label>
              <input
                className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>
            )}

            <button
              disabled={loading}
              className="flex h-[52px] w-full items-center justify-center rounded-full bg-gold text-base font-semibold text-burgundy-dark transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-text-muted">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-gold transition-colors hover:text-gold-light">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </main>
  );
}
