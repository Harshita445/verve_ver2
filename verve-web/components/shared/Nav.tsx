"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function Nav() {
  const { user, status } = useAuth();
  const isAuthenticated = status === "authenticated";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link
          href="/"
          className="font-heading text-xl font-semibold text-text-primary transition-colors hover:text-gold"
        >
          Verve
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Dashboard
              </Link>
              <span className="text-sm text-text-muted">
                {user?.display_name}
              </span>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center rounded-full bg-gold px-5 text-sm font-semibold text-[#4A131C] transition-all duration-300 hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
