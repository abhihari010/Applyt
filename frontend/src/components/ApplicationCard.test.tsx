import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationCard from "./ApplicationCard";
import type { Application } from "../api";

const application: Application = {
  id: "1",
  company: "Acme",
  role: "Engineer",
  location: "Remote",
  status: "ACCEPTED",
  dateApplied: "2024-03-15T12:00:00",
  priority: "HIGH",
  archived: false,
  createdAt: "2024-03-15T12:00:00",
  updatedAt: "2024-03-15T12:00:00",
};

describe("ApplicationCard", () => {
  it("shows the application's details", () => {
    render(<ApplicationCard application={application} />);
    for (const text of ["Engineer", "Acme", "Remote", "Mar 15, 2024", "HIGH", "Accepted"]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it("leaves out a missing location and date", () => {
    render(
      <ApplicationCard
        application={{ ...application, location: undefined, dateApplied: undefined }}
      />,
    );
    expect(screen.queryByText("Remote")).not.toBeInTheDocument();
    expect(screen.queryByText("Mar 15, 2024")).not.toBeInTheDocument();
  });

  it("is not a button without a click handler", () => {
    render(<ApplicationCard application={application} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("responds to clicks, Enter and Space", () => {
    const onClick = vi.fn();
    render(<ApplicationCard application={application} onClick={onClick} />);
    const card = screen.getByRole("button");

    fireEvent.click(card);
    fireEvent.keyDown(card, { key: "Enter" });
    fireEvent.keyDown(card, { key: " " });

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("ignores other keys", () => {
    const onClick = vi.fn();
    render(<ApplicationCard application={application} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole("button"), { key: "a" });
    expect(onClick).not.toHaveBeenCalled();
  });
});
