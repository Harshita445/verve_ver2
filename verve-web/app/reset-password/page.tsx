"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch<{ message: string }>("/api/v1/auth/reset-password", {
        method: "POST",
        body: { token, new_password: password },
        skipAuthRetry: true,
      });
      setDone(true);
    } catch {
      setError("Invalid or expired reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-success/20 bg-success/5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <polyline points="2 9 6 13 18 3" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl font-semibold text-text-primary">Password Reset</h1>
          <p className="mt-2 text-text-muted">Your password has been reset. Please sign in.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-[52px] items-center rounded-full bg-gold px-7 text-base font-semibold text-burgundy-dark transition-all duration-300 hover:shadow-glow"
          >
            Sign In
          </Link>
        </motion.div>
      </main>
    );
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
          <h1 className="font-heading text-3xl font-semibold text-text-primary">Set New Password</h1>
          <p className="mt-2 text-text-muted">Choose a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-card border border-border bg-card p-8 shadow-soft">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">New Password</label>
            <input
              className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
              placeholder="Min. 8 characters"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">Confirm Password</label>
            <input
              className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
              placeholder="Repeat your password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>
          )}

          <button
            disabled={loading}
            className="flex h-[52px] w-full items-center justify-center rounded-full bg-gold text-base font-semibold text-burgundy-dark transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
