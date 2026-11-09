import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

function Broken(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // React and the boundary both log the error being tested.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders its children when nothing is wrong", () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("shows the fallback with a way out when a child crashes", () => {
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Oops! Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh Page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go Home" })).toBeInTheDocument();
  });
});
