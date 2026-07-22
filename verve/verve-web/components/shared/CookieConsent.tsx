"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "verve-cookie-consent";

type Consent = "accepted" | "declined" | null;

export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
    setConsent(stored);
  }, []);

  if (consent !== null) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setConsent("declined");
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-md p-4">
      <div className="mx-auto flex max-w-content flex-col items-center gap-4 sm:flex-row">
        <p className="flex-1 text-sm text-text-secondary">
          We use essential cookies for authentication. Analytics cookies help us improve.
          See our{" "}
          <Link href="/privacy" className="text-gold underline underline-offset-2 hover:text-gold-light">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={decline}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-gold hover:text-text-primary"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-burgundy-dark transition-colors hover:bg-gold-light"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
