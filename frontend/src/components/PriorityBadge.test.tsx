import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PriorityBadge from "./PriorityBadge";

describe("PriorityBadge", () => {
  it.each([
    ["LOW", "bg-neutral-100"],
    ["MEDIUM", "bg-brand-50"],
    ["HIGH", "bg-accent-50"],
  ])("styles %s", (priority, style) => {
    render(<PriorityBadge priority={priority} />);
    expect(screen.getByText(priority)).toHaveClass(style);
  });

  it("falls back to the low style for an unknown priority", () => {
    render(<PriorityBadge priority="OTHER" />);
    expect(screen.getByText("OTHER")).toHaveClass("bg-neutral-100");
  });
});
