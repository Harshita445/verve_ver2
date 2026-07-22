"use client";

import { FormEvent, useState } from "react";

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/v1/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail?.[0]?.msg || "Failed to submit");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (submitted) {
    return (
      <main className="mx-auto max-w-content px-6 py-24 text-center">
        <div className="mx-auto max-w-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <svg className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl font-semibold text-text-primary">Thank You</h1>
          <p className="mt-4 text-text-secondary">
            Your message has been received. We typically respond within 24 hours.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-content px-6 py-24">
      <div className="mx-auto max-w-lg">
        <h1 className="font-heading text-3xl font-semibold text-text-primary">Contact Support</h1>
        <p className="mt-2 text-text-secondary">
          Have a question or issue? Send us a message and we&apos;ll get back to you.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-subtle focus:border-gold focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-1">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-subtle focus:border-gold focus:outline-none"
              placeholder="Brief summary"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-subtle focus:border-gold focus:outline-none resize-y"
              placeholder="Describe your issue in detail..."
            />
          </div>

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-gold py-3 font-semibold text-burgundy-dark transition-colors hover:bg-gold-light"
          >
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
}
