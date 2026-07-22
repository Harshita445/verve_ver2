import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("framer-motion", () => ({
  motion: { div: "div", span: "span", button: "button", p: "p" },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

import RecordingControls from "@/components/recording/RecordingControls";

describe("RecordingControls", () => {
  const defaultProps = {
    isRecording: false,
    isPaused: false,
    elapsed: 0,
    remaining: 120,
    onPause: vi.fn(),
    onResume: vi.fn(),
    onStop: vi.fn(),
  };

  it("renders status text", () => {
    render(<RecordingControls {...defaultProps} />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("shows timer labels", () => {
    render(<RecordingControls {...defaultProps} />);
    expect(screen.getByText("Remaining")).toBeInTheDocument();
    expect(screen.getByText("Elapsed")).toBeInTheDocument();
  });

  it("renders without crashing in recording state", () => {
    render(<RecordingControls {...defaultProps} isRecording />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("renders without crashing in paused state", () => {
    render(<RecordingControls {...defaultProps} isRecording isPaused />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});
