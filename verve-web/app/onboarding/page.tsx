"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/auth/AuthProvider";
import { updateProfile, updateOnboarding } from "@/lib/api/client";

const steps = [
  {
    title: "Welcome to Verve",
    subtitle: "Let's set up your practice journey.",
  },
  {
    title: "About You",
    subtitle: "Help us personalize your experience.",
  },
  {
    title: "Your Goals",
    subtitle: "What do you want to improve?",
  },
  {
    title: "You're Ready",
    subtitle: "Start your first practice session.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState("");

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (user?.onboarding_completed) {
    router.push("/dashboard");
    return null;
  }

  async function handleNext() {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    await handleComplete();
  }

  async function handleComplete() {
    setLoading(true);
    try {
      await updateProfile({
        job_title: jobTitle || null,
        company: company || null,
        bio: bio || null,
        communication_goals: goals || null,
      });
      await updateOnboarding({
        onboarding_completed: true,
        onboarding_step: 5,
      });
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  }

  async function handleSkip() {
    setLoading(true);
    try {
      await updateOnboarding({
        onboarding_completed: true,
        onboarding_step: 5,
      });
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="font-heading text-xl font-semibold text-gold">
            Verve
          </span>
        </div>

        <div className="mb-10 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= step ? "bg-gold w-8" : "bg-border w-4"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === 0 && (
              <div className="text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-gold/20 bg-gold/5">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h1 className="font-heading text-3xl font-semibold text-text-primary">
                  {steps[0].title}, {user?.display_name}
                </h1>
                <p className="mt-3 text-text-muted">{steps[0].subtitle}</p>
              </div>
            )}

            {step === 1 && (
              <div className="rounded-card border border-border bg-card p-8 shadow-soft">
                <h2 className="font-heading text-2xl font-semibold text-text-primary">
                  {steps[1].title}
                </h2>
                <p className="mt-1 text-sm text-text-muted">{steps[1].subtitle}</p>

                <div className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">
                      Job Title
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
                      placeholder="e.g. Product Manager"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">
                      Company
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
                      placeholder="e.g. Acme Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-secondary">
                      Bio
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all resize-none"
                      placeholder="Tell us about yourself..."
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-card border border-border bg-card p-8 shadow-soft">
                <h2 className="font-heading text-2xl font-semibold text-text-primary">
                  {steps[2].title}
                </h2>
                <p className="mt-1 text-sm text-text-muted">{steps[2].subtitle}</p>

                <div className="mt-8">
                  <label className="mb-2 block text-sm font-medium text-text-secondary">
                    What communication skills do you want to develop?
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-elevated p-3 text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all resize-none"
                    placeholder="e.g. I want to be more confident in meetings, improve my storytelling, and think on my feet during Q&A..."
                    rows={4}
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-gold/20 bg-gold/5">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h1 className="font-heading text-3xl font-semibold text-text-primary">
                  {steps[3].title}
                </h1>
                <p className="mt-3 text-text-muted">
                  Your profile is set up. Ready to start practicing?
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          {step > 0 && step < 3 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            {step < 3 && (
              <button
                onClick={handleSkip}
                className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="inline-flex h-[52px] items-center rounded-full bg-gold px-7 text-base font-semibold text-[#4A131C] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading
                ? "Please wait..."
                : step < 3
                  ? "Continue"
                  : "Go to Dashboard"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
