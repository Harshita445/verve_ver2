"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { ApiError, useAuth } from "@/lib/auth/AuthProvider";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { login, signup } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? "Incorrect email or password."
            : err.status === 409
              ? "An account with that email already exists."
              : "Something went wrong. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="w-full max-w-md"
    >
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="mb-8 inline-block font-heading text-2xl font-semibold text-gold"
        >
          Verve
        </Link>
        <h1 className="font-heading text-3xl font-semibold text-text-primary">
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h1>
        <p className="mt-2 text-text-muted">
          {mode === "login"
            ? "Sign in to continue your practice."
            : "Start your communication training journey."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-card border border-border bg-card p-8 shadow-soft"
      >
        {mode === "signup" && (
          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">
              Display Name
            </label>
            <input
              className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Email
          </label>
          <input
            className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Password
          </label>
          <input
            className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
            placeholder="Min. 8 characters"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <button
          className="flex h-[52px] w-full items-center justify-center rounded-full bg-gold text-base font-semibold text-[#4A131C] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign In"
              : "Create Account"}
        </button>

        <p className="text-center text-sm text-text-muted">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-gold transition-colors hover:text-gold-hover"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-gold transition-colors hover:text-gold-hover"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </form>
    </motion.div>
  );
}
