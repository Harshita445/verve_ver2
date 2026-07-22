import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: { div: "div", span: "span", button: "button", p: "p", form: "form" },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/auth/AuthProvider", () => ({
  useAuth: () => ({
    login: vi.fn(),
    signup: vi.fn(),
    user: null,
    status: "unauthenticated",
  }),
  ApiError: class extends Error {
    status: number;
    constructor(m: string, s: number) { super(m); this.status = s; }
  },
}));

import AuthForm from "@/components/auth/AuthForm";

describe("AuthForm", () => {
  it("renders login heading", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
  });

  it("renders signup heading", () => {
    render(<AuthForm mode="signup" />);
    expect(screen.getByText("Create Your Account")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min. 8 characters")).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByText("Forgot?")).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });
});
