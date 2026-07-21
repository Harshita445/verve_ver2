"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthProvider";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training", label: "Practice" },
  { href: "/progress", label: "Progress" },
  { href: "/rankings", label: "Rankings" },
];

function useIsActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Nav() {
  const { user, status } = useAuth();
  const pathname = usePathname();
  const isAuthenticated = status === "authenticated";
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && toggleRef.current && !toggleRef.current.contains(e.target as Node)) {
        closeMobile();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    if (mobileOpen) {
      menuRef.current?.focus();
    }
  }, [mobileOpen]);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="font-heading text-xl font-semibold text-text-primary transition-colors hover:text-gold"
          aria-label="Verve home"
        >
          Verve
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => {
                const isActive = useIsActive(link.href, pathname);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive ? "text-gold" : "text-text-secondary hover:text-text-primary"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <span className="text-sm text-text-muted">{user?.display_name}</span>
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
                className="inline-flex h-9 items-center rounded-full bg-gold px-5 text-sm font-semibold text-burgundy-dark transition-all duration-300 hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          ref={toggleRef}
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 text-text-secondary hover:text-text-primary md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </>
            ) : (
              <>
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </>
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />
            <motion.div
              ref={menuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 right-0 z-50 w-72 border-l border-border/50 bg-background p-6 shadow-soft outline-none md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              tabIndex={-1}
            >
              <div className="flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    <div className="mb-4 border-b border-border/50 pb-4">
                      <p className="font-heading text-lg font-semibold text-text-primary">{user?.display_name}</p>
                    </div>
                    {navLinks.map((link) => {
                      const isActive = useIsActive(link.href, pathname);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMobile}
                          className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                            isActive ? "bg-gold/10 text-gold" : "text-text-secondary hover:bg-elevated hover:text-text-primary"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={closeMobile}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-text-secondary hover:bg-elevated hover:text-text-primary"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMobile}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-gold px-6 text-sm font-semibold text-burgundy-dark"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
