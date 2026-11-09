import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it.each([
    ["SAVED", "Saved"],
    ["APPLIED", "Applied"],
    ["OA", "Online Assessment"],
    ["INTERVIEW", "Interview"],
    ["OFFER", "Offer"],
    ["ACCEPTED", "Accepted"],
    ["REJECTED", "Rejected"],
  ])("labels %s as %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("gives Accepted its own colour", () => {
    render(<StatusBadge status="ACCEPTED" />);
    expect(screen.getByText("Accepted")).toHaveClass("bg-emerald-50");
  });

  it("shows an unknown status as it is, with the default style", () => {
    render(<StatusBadge status="SOMETHING_NEW" />);
    expect(screen.getByText("SOMETHING_NEW")).toHaveClass("bg-neutral-100");
  });

  it("adds a custom class", () => {
    render(<StatusBadge status="OFFER" className="extra" />);
    expect(screen.getByText("Offer")).toHaveClass("extra");
  });
});
